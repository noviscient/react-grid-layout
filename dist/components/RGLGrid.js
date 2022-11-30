"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RGLGrid = void 0;
var clsx_1 = __importDefault(require("clsx"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var React = __importStar(require("react"));
var rglFastPropsEqual_1 = require("../props/rglFastPropsEqual");
var coreUtils_1 = __importDefault(require("../utils/coreUtils"));
var calculateUtils_1 = require("../utils/calculateUtils");
var RGLPropTypes_1 = __importDefault(require("../props/RGLPropTypes"));
var RGLGridItem_1 = __importDefault(require("./RGLGridItem"));
var bottom = coreUtils_1["default"].bottom, childrenEqual = coreUtils_1["default"].childrenEqual, cloneLayoutItem = coreUtils_1["default"].cloneLayoutItem, compact = coreUtils_1["default"].compact, compactType = coreUtils_1["default"].compactType, getAllCollisions = coreUtils_1["default"].getAllCollisions, getLayoutItem = coreUtils_1["default"].getLayoutItem, moveElement = coreUtils_1["default"].moveElement, noop = coreUtils_1["default"].noop, synchronizeLayoutWithChildren = coreUtils_1["default"].synchronizeLayoutWithChildren, withLayoutItem = coreUtils_1["default"].withLayoutItem;
// End Types
var fallbackCompactType = 'vertical';
var layoutClassName = 'react-grid-layout';
var isFirefox = false;
// Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator
try {
    isFirefox = /firefox/i.test(navigator.userAgent);
}
catch (e) {
    /* Ignore */
}
/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */
var RGLGrid = /** @class */ (function (_super) {
    __extends(RGLGrid, _super);
    function RGLGrid() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            activeDrag: undefined,
            layout: synchronizeLayoutWithChildren(_this.props.layout, _this.props.children, _this.props.cols, 
            // Legacy support for verticalCompact: false
            compactType(_this.props), _this.props.allowOverlap),
            mounted: false,
            oldDragItem: null,
            oldLayout: null,
            oldResizeItem: null,
            droppingDOMNode: undefined,
            children: [],
            rect: (_this.props.innerRef && _this.props.innerRef.current) ? _this.props.innerRef.current.getBoundingClientRect() : null
        };
        _this.dragEnterCounter = 0;
        /**
         * When dragging starts
         * @param {String} i Id of the child
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */
        _this.onDragStart = function (i, x, y, _a) {
            var e = _a.e, node = _a.node;
            var layout = _this.state.layout;
            var l = getLayoutItem(layout, i);
            if (!l)
                return;
            _this.setState({
                oldDragItem: cloneLayoutItem(l),
                oldLayout: layout
            });
            return _this.props.onDragStart(layout, l, l, null, e, node);
        };
        /**
         * Each drag movement create a new dragelement and move the element to the dragged location
         * @param {String} i Id of the child
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */
        _this.onDrag = function (i, x, y, _a) {
            var _b, _c;
            var e = _a.e, node = _a.node;
            var oldDragItem = _this.state.oldDragItem;
            var layout = _this.state.layout;
            var _d = _this.props, cols = _d.cols, allowOverlap = _d.allowOverlap, preventCollision = _d.preventCollision;
            var l = getLayoutItem(layout, i);
            if (!l)
                return;
            // Create placeholder (display only)
            var placeholder = {
                w: l.w,
                h: l.h,
                x: l.x,
                y: l.y,
                placeholder: true,
                i: i
            };
            // Move the element to the dragged location.
            var isUserAction = true;
            layout = moveElement(layout, l, x, y, isUserAction, preventCollision, (_b = compactType(_this.props)) !== null && _b !== void 0 ? _b : fallbackCompactType, cols, allowOverlap);
            _this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);
            _this.setState({
                layout: allowOverlap
                    ? layout
                    : compact(layout, (_c = compactType(_this.props)) !== null && _c !== void 0 ? _c : fallbackCompactType, cols),
                activeDrag: placeholder
            });
        };
        /**
         * When dragging stops, figure out which position the element is closest to and update its x and y.
         * @param  {String} i Index of the child.
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */
        _this.onDragStop = function (i, x, y, _a) {
            var _b, _c;
            var e = _a.e, node = _a.node;
            if (!_this.state.activeDrag)
                return;
            var oldDragItem = _this.state.oldDragItem;
            var layout = _this.state.layout;
            var _d = _this.props, cols = _d.cols, preventCollision = _d.preventCollision, allowOverlap = _d.allowOverlap;
            var l = getLayoutItem(layout, i);
            if (!l)
                return;
            // Move the element here
            var isUserAction = true;
            layout = moveElement(layout, l, x, y, isUserAction, preventCollision, (_b = compactType(_this.props)) !== null && _b !== void 0 ? _b : fallbackCompactType, cols, allowOverlap);
            _this.props.onDragStop(layout, oldDragItem !== null && oldDragItem !== void 0 ? oldDragItem : undefined, l, null, e, node);
            // Set state
            var newLayout = allowOverlap
                ? layout
                : compact(layout, (_c = compactType(_this.props)) !== null && _c !== void 0 ? _c : fallbackCompactType, cols);
            var oldLayout = _this.state.oldLayout;
            _this.setState({
                activeDrag: undefined,
                layout: newLayout,
                oldDragItem: null,
                oldLayout: null
            });
            _this.onLayoutMaybeChanged(newLayout, oldLayout !== null && oldLayout !== void 0 ? oldLayout : null);
        };
        _this.onResizeStart = function (i, w, h, _a) {
            var e = _a.e, node = _a.node;
            var layout = _this.state.layout;
            var l = getLayoutItem(layout, i);
            if (!l)
                return;
            _this.setState({
                oldResizeItem: cloneLayoutItem(l),
                oldLayout: _this.state.layout
            });
            _this.props.onResizeStart(layout, l, l, null, e, node);
        };
        _this.onResize = function (i, w, h, _a) {
            var _b;
            var e = _a.e, node = _a.node;
            var _c = _this.state, layout = _c.layout, oldResizeItem = _c.oldResizeItem;
            var _d = _this.props, cols = _d.cols, preventCollision = _d.preventCollision, allowOverlap = _d.allowOverlap;
            var _e = withLayoutItem(layout, i, function (l) {
                // Something like quad tree should be used
                // to find collisions faster
                var hasCollisions;
                if (preventCollision && !allowOverlap) {
                    var collisions = getAllCollisions(layout, __assign(__assign({}, l), { w: w, h: h })).filter(function (layoutItem) { return layoutItem.i !== l.i; });
                    hasCollisions = collisions.length > 0;
                    // If we're colliding, we need adjust the placeholder.
                    if (hasCollisions) {
                        // adjust w && h to maximum allowed space
                        var leastX_1 = Infinity, leastY_1 = Infinity;
                        collisions.forEach(function (layoutItem) {
                            if (layoutItem.x > l.x)
                                leastX_1 = Math.min(leastX_1, layoutItem.x);
                            if (layoutItem.y > l.y)
                                leastY_1 = Math.min(leastY_1, layoutItem.y);
                        });
                        if (Number.isFinite(leastX_1))
                            l.w = leastX_1 - l.x;
                        if (Number.isFinite(leastY_1))
                            l.h = leastY_1 - l.y;
                    }
                }
                if (!hasCollisions) {
                    // Set new width and height.
                    l.w = w;
                    l.h = h;
                }
                return l;
            }), newLayout = _e[0], l = _e[1];
            // Shouldn't ever happen, but typechecking makes it necessary
            if (!l)
                return;
            // Create placeholder element (display only)
            var placeholder = {
                w: l.w,
                h: l.h,
                x: l.x,
                y: l.y,
                static: true,
                i: i
            };
            _this.props.onResize(newLayout, oldResizeItem !== null && oldResizeItem !== void 0 ? oldResizeItem : undefined, l, placeholder, e, node);
            // Re-compact the newLayout and set the drag placeholder.
            _this.setState({
                layout: allowOverlap
                    ? newLayout
                    : compact(newLayout, (_b = compactType(_this.props)) !== null && _b !== void 0 ? _b : fallbackCompactType, cols),
                activeDrag: placeholder
            });
        };
        _this.onResizeStop = function (i, w, h, _a) {
            var _b;
            var e = _a.e, node = _a.node;
            var _c = _this.state, layout = _c.layout, oldResizeItem = _c.oldResizeItem;
            var _d = _this.props, cols = _d.cols, allowOverlap = _d.allowOverlap;
            var l = getLayoutItem(layout, i);
            _this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);
            // Set state
            var newLayout = allowOverlap
                ? layout
                : compact(layout, (_b = compactType(_this.props)) !== null && _b !== void 0 ? _b : fallbackCompactType, cols);
            var oldLayout = _this.state.oldLayout;
            _this.setState({
                activeDrag: null,
                layout: newLayout,
                oldResizeItem: null,
                oldLayout: null
            });
            _this.onLayoutMaybeChanged(newLayout, oldLayout !== null && oldLayout !== void 0 ? oldLayout : null);
        };
        // Called while dragging an element. Part of browser native drag/drop API.
        // Native event target might be the layout itself, or an element within the layout.
        _this.onDragOver = function (e) {
            var _a, _b, _c, _d;
            e.preventDefault(); // Prevent any browser native action
            e.stopPropagation();
            // we should ignore events from layout's children in Firefox
            // to avoid unpredictable jumping of a dropping placeholder
            // FIXME remove this hack
            if (isFirefox &&
                // $FlowIgnore can't figure this out
                !((_a = e.nativeEvent.target) === null || _a === void 0 ? void 0 : _a.classList.contains(layoutClassName))) {
                return false;
            }
            var _e = _this.props, droppingItem = _e.droppingItem, onDropDragOver = _e.onDropDragOver, margin = _e.margin, cols = _e.cols, rowHeight = _e.rowHeight, maxRows = _e.maxRows, width = _e.width, containerPadding = _e.containerPadding, transformScale = _e.transformScale;
            // Allow user to customize the dropping item or short-circuit the drop based on the results
            // of the `onDragOver(e: Event)` callback.
            var onDragOverResult = onDropDragOver === null || onDropDragOver === void 0 ? void 0 : onDropDragOver(e);
            if (onDragOverResult === false) {
                if (_this.state.droppingDOMNode) {
                    _this.removeDroppingPlaceholder();
                }
                return false;
            }
            var finalDroppingItem = __assign(__assign({}, droppingItem), onDragOverResult);
            var layout = _this.state.layout;
            // This is relative to the DOM element that this event fired for.
            var _f = e.nativeEvent, 
            // layerX, // don't use this
            // layerY, // don't use this
            pageX = _f.pageX, pageY = _f.pageY, clientX = _f.clientX, clientY = _f.clientY;
            var applicableMaxWidth = typeof finalDroppingItem.maxW === 'number' ? finalDroppingItem.maxW : Infinity;
            var applicableMinWidth = typeof finalDroppingItem.minW === 'number' ? finalDroppingItem.minW : 0;
            var w = Math.min(applicableMaxWidth, Math.max(applicableMinWidth, finalDroppingItem.w)) * (((_b = _this.props.width) !== null && _b !== void 0 ? _b : 0) / ((_c = _this.props.cols) !== null && _c !== void 0 ? _c : 1)) / 2;
            var h = Math.min(finalDroppingItem.maxH || Infinity, Math.max(finalDroppingItem.minH || 0, finalDroppingItem.h)) * ((_d = _this.props.rowHeight) !== null && _d !== void 0 ? _d : 0) / 2;
            if (!_this.state.rect)
                return;
            var actualLayerX = pageX - _this.state.rect.x;
            var actualLayerY = pageY - _this.state.rect.y;
            var droppingPosition = {
                left: actualLayerX / transformScale,
                top: actualLayerY / transformScale,
                e: e
            };
            // const droppingPosition = {
            //   left: (layerX - w) / transformScale,
            //   top: (layerY - h) / transformScale,
            //   e
            // }
            console.log('dp', droppingPosition); // where is dp?
            if (!_this.state.droppingDOMNode) {
                var positionParams = {
                    cols: cols,
                    margin: margin,
                    maxRows: maxRows,
                    rowHeight: rowHeight,
                    containerWidth: width,
                    containerPadding: containerPadding || margin
                };
                var calculatedPosition = (0, calculateUtils_1.rglCalcXY)(positionParams, 
                // layerY,
                // layerX,
                actualLayerY, actualLayerX, finalDroppingItem.w, finalDroppingItem.h);
                _this.setState({
                    droppingDOMNode: React.createElement("div", { key: finalDroppingItem.i }),
                    droppingPosition: droppingPosition,
                    layout: __spreadArray(__spreadArray([], layout, true), [
                        __assign(__assign({}, finalDroppingItem), { x: calculatedPosition.x, y: calculatedPosition.y, static: false, isDraggable: true })
                    ], false)
                });
            }
            else if (_this.state.droppingPosition) {
                var _g = _this.state.droppingPosition, left = _g.left, top_1 = _g.top;
                var shouldUpdatePosition = 
                // left != layerX ||
                // top != layerY
                left !== actualLayerX ||
                    top_1 !== actualLayerY;
                if (shouldUpdatePosition) {
                    _this.setState({ droppingPosition: droppingPosition });
                }
            }
        };
        _this.removeDroppingPlaceholder = function () {
            var _a;
            var _b = _this.props, droppingItem = _b.droppingItem, cols = _b.cols;
            var layout = _this.state.layout;
            var newLayout = compact(layout.filter(function (l) { return l.i !== droppingItem.i; }), (_a = compactType(_this.props)) !== null && _a !== void 0 ? _a : fallbackCompactType, cols);
            _this.setState({
                layout: newLayout,
                droppingDOMNode: null,
                activeDrag: null,
                droppingPosition: undefined
            });
        };
        _this.onDragLeave = function (e) {
            e.preventDefault(); // Prevent any browser native action
            e.stopPropagation();
            _this.dragEnterCounter--;
            // onDragLeave can be triggered on each layout's child.
            // But we know that count of dragEnter and dragLeave events
            // will be balanced after leaving the layout's container
            // so we can increase and decrease count of dragEnter and
            // when it'll be equal to 0 we'll remove the placeholder
            if (_this.dragEnterCounter === 0) {
                _this.removeDroppingPlaceholder();
            }
        };
        _this.onDragEnter = function (e) {
            e.preventDefault(); // Prevent any browser native action
            e.stopPropagation();
            _this.dragEnterCounter++;
        };
        _this.onDrop = function (e) {
            e.preventDefault(); // Prevent any browser native action
            e.stopPropagation();
            var droppingItem = _this.props.droppingItem;
            var layout = _this.state.layout;
            var item = layout.find(function (l) { return l.i === droppingItem.i; });
            // reset dragEnter counter on drop
            _this.dragEnterCounter = 0;
            _this.removeDroppingPlaceholder();
            _this.props.onDrop(layout, item, e);
        };
        return _this;
    }
    RGLGrid.prototype.componentDidMount = function () {
        var _a, _b, _c;
        this.setState({ mounted: true, rect: (_c = (_b = (_a = this.props.innerRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect()) !== null && _c !== void 0 ? _c : null });
        // Possibly call back with layout on mount. This should be done after correcting the layout width
        // to ensure we don't rerender with the wrong width.
        this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
    };
    RGLGrid.getDerivedStateFromProps = function (nextProps, prevState) {
        var newLayoutBase;
        if (prevState.activeDrag) {
            return null;
        }
        // Legacy support for compactType
        // Allow parent to set layout directly.
        if (!(0, isEqual_1["default"])(nextProps.layout, prevState.propsLayout) ||
            nextProps.compactType !== prevState.compactType) {
            newLayoutBase = nextProps.layout;
        }
        else if (!childrenEqual(nextProps.children, prevState.children)) {
            // If children change, also regenerate the layout. Use our state
            // as the base in case because it may be more up to date than
            // what is in props.
            newLayoutBase = prevState.layout;
        }
        // We need to regenerate the layout.
        if (newLayoutBase) {
            var newLayout = synchronizeLayoutWithChildren(newLayoutBase, nextProps.children, nextProps.cols, compactType(nextProps), nextProps.allowOverlap);
            return {
                layout: newLayout,
                // We need to save these props to state for using
                // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
                compactType: nextProps.compactType,
                children: nextProps.children,
                propsLayout: nextProps.layout
            };
        }
        return null;
    };
    RGLGrid.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return (
        // NOTE: this is almost always unequal. Therefore the only way to get better performance
        // from SCU is if the user intentionally memoizes children. If they do, and they can
        // handle changes properly, performance will increase.
        this.props.children !== nextProps.children ||
            !(0, rglFastPropsEqual_1.rglFastGridPropsEqual)(this.props, nextProps) ||
            this.state.activeDrag !== nextState.activeDrag ||
            this.state.mounted !== nextState.mounted ||
            this.state.droppingPosition !== nextState.droppingPosition);
    };
    RGLGrid.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (!this.state.activeDrag) {
            var newLayout = this.state.layout;
            var oldLayout = prevState.layout;
            this.onLayoutMaybeChanged(newLayout, oldLayout);
        }
    };
    /**
     * Calculates a pixel value for the container.
     * @return {String} Container height in pixels.
     */
    RGLGrid.prototype.containerHeight = function () {
        if (!this.props.autoSize)
            return;
        var nbRow = bottom(this.state.layout);
        var containerPaddingY = this.props.containerPadding
            ? this.props.containerPadding[1]
            : this.props.margin[1];
        return (nbRow * this.props.rowHeight +
            (nbRow - 1) * this.props.margin[1] +
            containerPaddingY * 2 +
            'px');
    };
    RGLGrid.prototype.onLayoutMaybeChanged = function (newLayout, oldLayout) {
        if (!oldLayout)
            oldLayout = this.state.layout;
        if (!(0, isEqual_1["default"])(oldLayout, newLayout)) {
            this.props.onLayoutChange(newLayout);
        }
    };
    /**
     * Create a placeholder object.
     * @return {Element} Placeholder div.
     */
    RGLGrid.prototype.placeholder = function () {
        var activeDrag = this.state.activeDrag;
        if (!activeDrag)
            return null;
        var _a = this.props, width = _a.width, cols = _a.cols, margin = _a.margin, containerPadding = _a.containerPadding, rowHeight = _a.rowHeight, maxRows = _a.maxRows, useCSSTransforms = _a.useCSSTransforms, transformScale = _a.transformScale;
        // {...this.state.activeDrag} is pretty slow, actually
        return (React.createElement(RGLGridItem_1["default"], { w: activeDrag.w, h: activeDrag.h, x: activeDrag.x, y: activeDrag.y, i: activeDrag.i, className: 'react-grid-placeholder', containerWidth: width, cols: cols, margin: margin, containerPadding: containerPadding || margin, maxRows: maxRows, rowHeight: rowHeight, isDraggable: false, isResizable: false, isBounded: false, useCSSTransforms: useCSSTransforms, transformScale: transformScale },
            React.createElement("div", null)));
    };
    /**
     * Given a grid item, set its style attributes & surround in a <Draggable>.
     * @param  {Element} child React element.
     * @return {Element}       Element wrapped in draggable and properly placed.
     */
    RGLGrid.prototype.processGridItem = function (child, isDroppingItem) {
        if (!child || typeof child !== 'object' || !('key' in child) || !child.key)
            return null;
        var l = getLayoutItem(this.state.layout, String(child.key));
        if (!l)
            return null;
        var _a = this.props, width = _a.width, cols = _a.cols, margin = _a.margin, containerPadding = _a.containerPadding, rowHeight = _a.rowHeight, maxRows = _a.maxRows, isDraggable = _a.isDraggable, isResizable = _a.isResizable, isBounded = _a.isBounded, useCSSTransforms = _a.useCSSTransforms, transformScale = _a.transformScale, draggableCancel = _a.draggableCancel, draggableHandle = _a.draggableHandle, resizeHandles = _a.resizeHandles, resizeHandle = _a.resizeHandle;
        var _b = this.state, mounted = _b.mounted, droppingPosition = _b.droppingPosition;
        // Determine user manipulations possible.
        // If an item is static, it can't be manipulated by default.
        // Any properties defined directly on the grid item will take precedence.
        var draggable = typeof l.isDraggable === 'boolean'
            ? l.isDraggable
            : !l.static && isDraggable;
        var resizable = typeof l.isResizable === 'boolean'
            ? l.isResizable
            : !l.static && isResizable;
        var resizeHandlesOptions = l.resizeHandles || resizeHandles;
        // isBounded set on child if set on parent, and child is not explicitly false
        var bounded = draggable && isBounded && l.isBounded !== false;
        return (React.createElement(RGLGridItem_1["default"], { containerWidth: width, cols: cols, margin: margin, containerPadding: containerPadding || margin, maxRows: maxRows, rowHeight: rowHeight, cancel: draggableCancel, handle: draggableHandle, onDragStop: this.onDragStop, onDragStart: this.onDragStart, onDrag: this.onDrag, onResizeStart: this.onResizeStart, onResize: this.onResize, onResizeStop: this.onResizeStop, isDraggable: draggable, isResizable: resizable, isBounded: bounded, useCSSTransforms: useCSSTransforms && mounted, usePercentages: !mounted, transformScale: transformScale, w: l.w, h: l.h, x: l.x, y: l.y, i: l.i, minH: l.minH, minW: l.minW, maxH: l.maxH, maxW: l.maxW, static: l.static, droppingPosition: isDroppingItem ? (droppingPosition !== null && droppingPosition !== void 0 ? droppingPosition : undefined) : undefined, resizeHandles: resizeHandlesOptions, resizeHandle: resizeHandle }, child));
    };
    RGLGrid.prototype.render = function () {
        var _this = this;
        var _a = this.props, className = _a.className, style = _a.style, isDroppable = _a.isDroppable, innerRef = _a.innerRef;
        var mergedClassName = (0, clsx_1["default"])(layoutClassName, className);
        var mergedStyle = __assign({ height: this.containerHeight() }, style);
        return (React.createElement("div", { ref: innerRef, className: mergedClassName, style: mergedStyle, onDrop: isDroppable ? this.onDrop : noop, onDragLeave: isDroppable ? this.onDragLeave : noop, onDragEnter: isDroppable ? this.onDragEnter : noop, onDragOver: isDroppable ? this.onDragOver : noop },
            React.Children.map(this.props.children, function (child) {
                return _this.processGridItem(child);
            }),
            isDroppable &&
                this.state.droppingDOMNode &&
                this.processGridItem(this.state.droppingDOMNode, true),
            this.placeholder()));
    };
    // TODO publish internal ReactClass displayName transform
    RGLGrid.displayName = 'RGLGrid';
    // Refactored to another module to make way for preval
    RGLGrid.propTypes = RGLPropTypes_1["default"];
    RGLGrid.defaultProps = {
        innerRef: React.createRef(),
        autoSize: true,
        cols: 12,
        className: '',
        style: {},
        draggableHandle: '',
        draggableCancel: '',
        containerPadding: undefined,
        rowHeight: 150,
        maxRows: Infinity,
        layout: [],
        margin: [10, 10],
        isBounded: false,
        isDraggable: true,
        isResizable: true,
        allowOverlap: false,
        isDroppable: false,
        useCSSTransforms: true,
        transformScale: 1,
        verticalCompact: true,
        compactType: 'vertical',
        preventCollision: false,
        droppingItem: {
            i: '__dropping-elem__',
            h: 1,
            w: 1
        },
        resizeHandles: ['se'],
        onLayoutChange: noop,
        onDragStart: noop,
        onDrag: noop,
        onDragStop: noop,
        onResizeStart: noop,
        onResize: noop,
        onResizeStop: noop,
        onDrop: noop,
        onDropDragOver: function () { return false; }
    };
    return RGLGrid;
}(React.Component));
exports.RGLGrid = RGLGrid;
exports["default"] = RGLGrid;
