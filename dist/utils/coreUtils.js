"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var react_1 = __importDefault(require("react"));
var isProduction = process.env.NODE_ENV === "production";
var DEBUG = false;
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
function bottom(layout) {
    var max = 0, bottomY;
    for (var i = 0, len = layout.length; i < len; i++) {
        bottomY = layout[i].y + layout[i].h;
        if (bottomY > max)
            max = bottomY;
    }
    return max;
}
function cloneLayout(layout) {
    var newLayout = Array(layout.length);
    for (var i = 0, len = layout.length; i < len; i++) {
        newLayout[i] = cloneLayoutItem(layout[i]);
    }
    return newLayout;
}
// Modify a layoutItem inside a layout. Returns a new Layout,
// does not mutate. Carries over all other LayoutItems unmodified.
function modifyLayout(layout, layoutItem) {
    var newLayout = Array(layout.length);
    for (var i = 0, len = layout.length; i < len; i++) {
        if (layoutItem.i === layout[i].i) {
            newLayout[i] = layoutItem;
        }
        else {
            newLayout[i] = layout[i];
        }
    }
    return newLayout;
}
// Function to be called to modify a layout item.
// Does defensive clones to ensure the layout is not modified.
function withLayoutItem(layout, itemKey, cb) {
    var item = getLayoutItem(layout, itemKey);
    if (!item)
        return [layout, null];
    item = cb(cloneLayoutItem(item)); // defensive clone then modify
    // FIXME could do this faster if we already knew the index
    layout = modifyLayout(layout, item);
    return [layout, item];
}
// Fast path to cloning, since this is monomorphic
function cloneLayoutItem(layoutItem) {
    return {
        w: layoutItem.w,
        h: layoutItem.h,
        x: layoutItem.x,
        y: layoutItem.y,
        i: layoutItem.i,
        minW: layoutItem.minW,
        maxW: layoutItem.maxW,
        minH: layoutItem.minH,
        maxH: layoutItem.maxH,
        moved: Boolean(layoutItem.moved),
        static: Boolean(layoutItem.static),
        // These can be null/undefined
        isDraggable: layoutItem.isDraggable,
        isResizable: layoutItem.isResizable,
        resizeHandles: layoutItem.resizeHandles,
        isBounded: layoutItem.isBounded
    };
}
/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
function childrenEqual(a, b) {
    return (0, isEqual_1["default"])(
    // expects children to be elements, should fix the typing
    react_1["default"].Children.map(a, function (c) { return c === null || c === void 0 ? void 0 : c.key; }), react_1["default"].Children.map(b, function (c) { return c === null || c === void 0 ? void 0 : c.key; }));
}
// Like the above, but a lot simpler.
function fastPositionEqual(a, b) {
    return (a.left === b.left &&
        a.top === b.top &&
        a.width === b.width &&
        a.height === b.height);
}
/**
 * Given two layoutitems, check if they collide.
 */
function collides(l1, l2) {
    if (l1.i === l2.i)
        return false; // same element
    if (l1.x + l1.w <= l2.x)
        return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w)
        return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y)
        return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h)
        return false; // l1 is below l2
    return true; // boxes overlap
}
/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * Does not modify layout items (clones). Creates a new layout array.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
function compact(layout, compactType, cols) {
    // Statics go in the compareWith array right away so items flow around them.
    var compareWith = getStatics(layout);
    // We go through the items by row and column.
    var sorted = sortLayoutItems(layout, compactType);
    // Holding for new items.
    var out = Array(layout.length);
    for (var i = 0, len = sorted.length; i < len; i++) {
        var l = cloneLayoutItem(sorted[i]);
        // Don't move static elements
        if (!l.static) {
            l = compactItem(compareWith, l, compactType, cols, sorted);
            // Add to comparison array. We only collide with items before this one.
            // Statics are already in this array.
            compareWith.push(l);
        }
        // Add to output array to make sure they still come out in the right order.
        out[layout.indexOf(sorted[i])] = l;
        // Clear moved flag, if it exists.
        l.moved = false;
    }
    return out;
}
var heightWidth = { x: "w", y: "h" };
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
function resolveCompactionCollision(layout, item, moveToCoord, axis) {
    var sizeProp = heightWidth[axis];
    item[axis] += 1;
    var itemIndex = layout
        .map(function (layoutItem) {
        return layoutItem.i;
    })
        .indexOf(item.i);
    // Go through each item we collide with.
    for (var i = itemIndex + 1; i < layout.length; i++) {
        var otherItem = layout[i];
        // Ignore static items
        if (otherItem.static)
            continue;
        // Optimization: we can break early if we know we're past this el
        // We can do this b/c it's a sorted layout
        if (otherItem.y > item.y + item.h)
            break;
        if (collides(item, otherItem)) {
            resolveCompactionCollision(layout, otherItem, moveToCoord + item[sizeProp], axis);
        }
    }
    item[axis] = moveToCoord;
}
/**
 * Compact an item in the layout.
 *
 * Modifies item.
 *
 */
function compactItem(compareWith, l, compactType, cols, fullLayout) {
    var compactV = compactType === "vertical";
    var compactH = compactType === "horizontal";
    if (compactV) {
        // Bottom 'y' possible is the bottom of the layout.
        // This allows you to do nice stuff like specify {y: Infinity}
        // This is here because the layout must be sorted in order to get the correct bottom `y`.
        l.y = Math.min(bottom(compareWith), l.y);
        // Move the element up as far as it can go without colliding.
        while (l.y > 0 && !getFirstCollision(compareWith, l)) {
            l.y--;
        }
    }
    else if (compactH) {
        // Move the element left as far as it can go without colliding.
        while (l.x > 0 && !getFirstCollision(compareWith, l)) {
            l.x--;
        }
    }
    // Move it down, and keep moving it down if it's colliding.
    var collides;
    while ((collides = getFirstCollision(compareWith, l))) {
        if (compactH) {
            resolveCompactionCollision(fullLayout, l, collides.x + collides.w, "x");
        }
        else {
            resolveCompactionCollision(fullLayout, l, collides.y + collides.h, "y");
        }
        // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
        if (compactH && l.x + l.w > cols) {
            l.x = cols - l.w;
            l.y++;
        }
    }
    // Ensure that there are no negative positions
    l.y = Math.max(l.y, 0);
    l.x = Math.max(l.x, 0);
    return l;
}
/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * Modifies layout items.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
function correctBounds(layout, bounds) {
    var collidesWith = getStatics(layout);
    for (var i = 0, len = layout.length; i < len; i++) {
        var l = layout[i];
        // Overflows right
        if (l.x + l.w > bounds.cols)
            l.x = bounds.cols - l.w;
        // Overflows left
        if (l.x < 0) {
            l.x = 0;
            l.w = bounds.cols;
        }
        if (!l.static)
            collidesWith.push(l);
        else {
            // If this is static and collides with other statics, we must move it down.
            // We have to do something nicer than just letting them overlap.
            while (getFirstCollision(collidesWith, l)) {
                l.y++;
            }
        }
    }
    return layout;
}
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {RGLLayoutItem}    Item at ID.
 */
function getLayoutItem(layout, id) {
    for (var i = 0, len = layout.length; i < len; i++) {
        if (layout[i].i === id)
            return layout[i];
    }
    return undefined;
}
/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
function getFirstCollision(layout, layoutItem) {
    for (var i = 0, len = layout.length; i < len; i++) {
        if (collides(layout[i], layoutItem))
            return layout[i];
    }
    return undefined;
}
function getAllCollisions(layout, layoutItem) {
    return layout.filter(function (l) { return collides(l, layoutItem); });
}
/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
function getStatics(layout) {
    return layout.filter(function (l) { return l.static; });
}
/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * Modifies layout items.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {RGLLayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */
function moveElement(layout, l, x, y, isUserAction, preventCollision, compactType, cols, allowOverlap) {
    // If this is static and not explicitly enabled as draggable,
    // no move is possible, so we can short-circuit this immediately.
    if (l.static && l.isDraggable !== true)
        return layout;
    // Short-circuit if nothing to do.
    if (l.y === y && l.x === x)
        return layout;
    log("Moving element ".concat(l.i, " to [").concat(String(x), ",").concat(String(y), "] from [").concat(l.x, ",").concat(l.y, "]"));
    var oldX = l.x;
    var oldY = l.y;
    // This is quite a bit faster than extending the object
    if (typeof x === "number")
        l.x = x;
    if (typeof y === "number")
        l.y = y;
    l.moved = true;
    // If this collides with anything, move it.
    // When doing this comparison, we have to sort the items we compare with
    // to ensure, in the case of multiple collisions, that we're getting the
    // nearest collision.
    var sorted = sortLayoutItems(layout, compactType);
    var movingUp = compactType === "vertical" && typeof y === "number"
        ? oldY >= y
        : compactType === "horizontal" && typeof x === "number"
            ? oldX >= x
            : false;
    // $FlowIgnore acceptable modification of read-only array as it was recently cloned
    if (movingUp)
        sorted = sorted.reverse();
    var collisions = getAllCollisions(sorted, l);
    var hasCollisions = collisions.length > 0;
    // We may have collisions. We can short-circuit if we've turned off collisions or
    // allowed overlap.
    if (hasCollisions && allowOverlap) {
        // Easy, we don't need to resolve collisions. But we *did* change the layout,
        // so clone it on the way out.
        return cloneLayout(layout);
    }
    else if (hasCollisions && preventCollision) {
        // If we are preventing collision but not allowing overlap, we need to
        // revert the position of this element so it goes to where it came from, rather
        // than the user's desired location.
        log("Collision prevented on ".concat(l.i, ", reverting."));
        l.x = oldX;
        l.y = oldY;
        l.moved = false;
        return layout; // did not change so don't clone
    }
    // Move each item that collides away from this element.
    for (var i = 0, len = collisions.length; i < len; i++) {
        var collision = collisions[i];
        log("Resolving collision between ".concat(l.i, " at [").concat(l.x, ",").concat(l.y, "] and ").concat(collision.i, " at [").concat(collision.x, ",").concat(collision.y, "]"));
        // Short circuit so we can't infinite loop
        if (collision.moved)
            continue;
        // Don't move static items - we have to move *this* element away
        if (collision.static) {
            layout = moveElementAwayFromCollision(layout, collision, l, Boolean(isUserAction), compactType, cols);
        }
        else {
            layout = moveElementAwayFromCollision(layout, l, collision, Boolean(isUserAction), compactType, cols);
        }
    }
    return layout;
}
/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {RGLLayoutItem} collidesWith Layout item we're colliding with.
 * @param  {RGLLayoutItem} itemToMove   Layout item we're moving.
 */
function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction, compactType, cols) {
    var compactH = compactType === "horizontal";
    // Compact vertically if not set to horizontal
    var compactV = compactType !== "horizontal";
    var preventCollision = collidesWith.static; // we're already colliding (not for static items)
    // If there is enough space above the collision to put this element, move it there.
    // We only do this on the main collision as this can get funky in cascades and cause
    // unwanted swapping behavior.
    if (isUserAction) {
        // Reset isUserAction flag because we're not in the main collision anymore.
        isUserAction = false;
        // Make a mock item so we don't modify the item here, only modify in moveElement.
        var fakeItem = {
            x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
            y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
            w: itemToMove.w,
            h: itemToMove.h,
            i: "-1"
        };
        // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal
        if (!getFirstCollision(layout, fakeItem)) {
            log("Doing reverse collision on ".concat(itemToMove.i, " up to [").concat(fakeItem.x, ",").concat(fakeItem.y, "]."));
            return moveElement(layout, itemToMove, compactH ? fakeItem.x : undefined, compactV ? fakeItem.y : undefined, isUserAction, preventCollision, compactType, cols, undefined);
        }
    }
    return moveElement(layout, itemToMove, compactH ? itemToMove.x + 1 : undefined, compactV ? itemToMove.y + 1 : undefined, isUserAction, preventCollision, compactType, cols, undefined);
}
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
function perc(num) {
    return num * 100 + "%";
}
function setTransform(_a) {
    var top = _a.top, left = _a.left, width = _a.width, height = _a.height;
    // Replace unitless items with px
    var translate = "translate(".concat(left, "px,").concat(top, "px)");
    return {
        transform: translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: "".concat(width, "px"),
        height: "".concat(height, "px"),
        position: "absolute"
    };
}
function setTopLeft(_a) {
    var top = _a.top, left = _a.left, width = _a.width, height = _a.height;
    return {
        top: "".concat(top, "px"),
        left: "".concat(left, "px"),
        width: "".concat(width, "px"),
        height: "".concat(height, "px"),
        position: "absolute"
    };
}
/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
function sortLayoutItems(layout, compactType) {
    if (compactType === "horizontal")
        return sortLayoutItemsByColRow(layout);
    if (compactType === "vertical")
        return sortLayoutItemsByRowCol(layout);
    else
        return layout;
}
/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */
function sortLayoutItemsByRowCol(layout) {
    // Slice to clone array as sort modifies
    return layout.slice(0).sort(function (a, b) {
        if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
            return 1;
        }
        else if (a.y === b.y && a.x === b.x) {
            // Without this, we can get different sort results in IE vs. Chrome/FF
            return 0;
        }
        return -1;
    });
}
/**
 * Sort layout items by column ascending then row ascending.
 *
 * Does not modify Layout.
 */
function sortLayoutItemsByColRow(layout) {
    return layout.slice(0).sort(function (a, b) {
        if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
            return 1;
        }
        return -1;
    });
}
/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * Does not modify initialLayout.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */
function synchronizeLayoutWithChildren(initialLayout, children, cols, compactType, allowOverlap) {
    initialLayout = initialLayout || [];
    // Generate one layout item per child.
    var layout = [];
    react_1["default"].Children.forEach(children, function (child) {
        // Child may not exist
        if ((child === null || child === void 0 ? void 0 : child.key) == null)
            return;
        // Don't overwrite if it already exists.
        var exists = getLayoutItem(initialLayout, String(child.key));
        if (exists) {
            layout.push(cloneLayoutItem(exists));
        }
        else {
            if (!isProduction && child.props._grid) {
                console.warn("`_grid` properties on children have been deprecated as of React 15.2. " +
                    "Please use `data-grid` or add your properties directly to the `layout`.");
            }
            var g = child.props["data-grid"] || child.props._grid;
            // Hey, this item has a data-grid property, use it.
            if (g) {
                if (!isProduction) {
                    validateLayout([g], "ReactGridLayout.children");
                }
                // FIXME clone not really necessary here
                layout.push(cloneLayoutItem(__assign(__assign({}, g), { i: child.key })));
            }
            else {
                // Nothing provided: ensure this is added to the bottom
                // FIXME clone not really necessary here
                layout.push(cloneLayoutItem({
                    w: 1,
                    h: 1,
                    x: 0,
                    y: bottom(layout),
                    i: String(child.key)
                }));
            }
        }
    });
    // Correct the layout.
    var correctedLayout = correctBounds(layout, { cols: cols });
    return allowOverlap
        ? correctedLayout
        : compact(correctedLayout, compactType !== null && compactType !== void 0 ? compactType : 'vertical', cols);
}
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
function validateLayout(layout, contextName) {
    if (contextName === void 0) { contextName = "Layout"; }
    var subProps = ["x", "y", "w", "h"];
    if (!Array.isArray(layout))
        throw new Error(contextName + " must be an array!");
    for (var i = 0, len = layout.length; i < len; i++) {
        var item = layout[i];
        for (var j = 0; j < subProps.length; j++) {
            if (typeof item[subProps[j]] !== "number") {
                throw new Error("ReactGridLayout: " +
                    contextName +
                    "[" +
                    i +
                    "]." +
                    subProps[j] +
                    " must be a number!");
            }
        }
    }
}
// Legacy support for verticalCompact: false
function compactType(props) {
    var _a = props || {}, verticalCompact = _a.verticalCompact, compactType = _a.compactType;
    return verticalCompact === false ? null : compactType;
}
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!DEBUG)
        return;
    // eslint-disable-next-line no-console
    console.log.apply(console, args);
}
var noop = function () { };
var rglCoreUtils = {
    noop: noop,
    log: log,
    compactType: compactType,
    validateLayout: validateLayout,
    synchronizeLayoutWithChildren: synchronizeLayoutWithChildren,
    sortLayoutItemsByRowCol: sortLayoutItemsByRowCol,
    sortLayoutItemsByColRow: sortLayoutItemsByColRow,
    sortLayoutItems: sortLayoutItems,
    setTopLeft: setTopLeft,
    setTransform: setTransform,
    perc: perc,
    moveElement: moveElement,
    moveElementAwayFromCollision: moveElementAwayFromCollision,
    getStatics: getStatics,
    bottom: bottom,
    cloneLayout: cloneLayout,
    modifyLayout: modifyLayout,
    withLayoutItem: withLayoutItem,
    cloneLayoutItem: cloneLayoutItem,
    childrenEqual: childrenEqual,
    fastPositionEqual: fastPositionEqual,
    collides: collides,
    compact: compact,
    heightWidth: heightWidth,
    resolveCompactionCollision: resolveCompactionCollision,
    compactItem: compactItem,
    correctBounds: correctBounds,
    getLayoutItem: getLayoutItem,
    getFirstCollision: getFirstCollision,
    getAllCollisions: getAllCollisions
};
exports["default"] = rglCoreUtils;
