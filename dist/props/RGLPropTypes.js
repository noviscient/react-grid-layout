"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.rglResizeHandleType = exports.rglResizeHandleAxesType = void 0;
// @flow
var prop_types_1 = __importDefault(require("prop-types"));
var react_1 = __importDefault(require("react"));
var coreUtils_1 = __importDefault(require("../utils/coreUtils"));
// Defines which resize handles should be rendered (default: 'se')
// Allows for any combination of:
// 's' - South handle (bottom-center)
// 'w' - West handle (left-center)
// 'e' - East handle (right-center)
// 'n' - North handle (top-center)
// 'sw' - Southwest handle (bottom-left)
// 'nw' - Northwest handle (top-left)
// 'se' - Southeast handle (bottom-right)
// 'ne' - Northeast handle (top-right)
exports.rglResizeHandleAxesType = prop_types_1["default"].arrayOf(prop_types_1["default"].oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"]));
// Custom component for resize handles
exports.rglResizeHandleType = prop_types_1["default"].oneOfType([prop_types_1["default"].node, prop_types_1["default"].func]);
var RGLPropTypes = {
    //
    // Basic props
    //
    className: prop_types_1["default"].string,
    style: prop_types_1["default"].object,
    // This can be set explicitly. If it is not set, it will automatically
    // be set to the container width. Note that resizes will *not* cause this to adjust.
    // If you need that behavior, use WidthProvider.
    width: prop_types_1["default"].number,
    // If true, the container height swells and contracts to fit contents
    autoSize: prop_types_1["default"].bool,
    // # of cols.
    cols: prop_types_1["default"].number,
    // A selector that will not be draggable.
    draggableCancel: prop_types_1["default"].string,
    // A selector for the draggable handler
    draggableHandle: prop_types_1["default"].string,
    // Deprecated
    verticalCompact: function (props) {
        if (props.verticalCompact === false &&
            process.env.NODE_ENV !== "production") {
            console.warn(
            // eslint-disable-line no-console
            "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " +
                'Use `compactType`: "horizontal" | "vertical" | null.');
        }
    },
    // Choose vertical or hotizontal compaction
    compactType: prop_types_1["default"].oneOf([
        "vertical",
        "horizontal"
    ]),
    // layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number, i: String}
    layout: function (props) {
        var layout = props.layout;
        // I hope you're setting the data-grid property on the grid items
        if (layout === undefined)
            return;
        coreUtils_1["default"].validateLayout(layout, "layout");
    },
    //
    // Grid Dimensions
    //
    // Margin between items [x, y] in px
    margin: prop_types_1["default"].arrayOf(prop_types_1["default"].number),
    // Padding inside the container [x, y] in px
    containerPadding: prop_types_1["default"].arrayOf(prop_types_1["default"].number),
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: prop_types_1["default"].number,
    // Default Infinity, but you can specify a max here if you like.
    // Note that this isn't fully fleshed out and won't error if you specify a layout that
    // extends beyond the row capacity. It will, however, not allow users to drag/resize
    // an item past the barrier. They can push items beyond the barrier, though.
    // Intentionally not documented for this reason.
    maxRows: prop_types_1["default"].number,
    //
    // Flags
    //
    isBounded: prop_types_1["default"].bool,
    isDraggable: prop_types_1["default"].bool,
    isResizable: prop_types_1["default"].bool,
    // If true, grid can be placed one over the other.
    allowOverlap: prop_types_1["default"].bool,
    // If true, grid items won't change position when being dragged over.
    preventCollision: prop_types_1["default"].bool,
    // Use CSS transforms instead of top/left
    useCSSTransforms: prop_types_1["default"].bool,
    // parent layout transform scale
    transformScale: prop_types_1["default"].number,
    // If true, an external element can trigger onDrop callback with a specific grid position as a parameter
    isDroppable: prop_types_1["default"].bool,
    // Resize handle options
    resizeHandles: exports.rglResizeHandleAxesType,
    resizeHandle: exports.rglResizeHandleType,
    //
    // Callbacks
    //
    // Callback so you can save the layout. Calls after each drag & resize stops.
    onLayoutChange: prop_types_1["default"].func,
    // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
    // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
    onDragStart: prop_types_1["default"].func,
    // Calls on each drag movement.
    onDrag: prop_types_1["default"].func,
    // Calls when drag is complete.
    onDragStop: prop_types_1["default"].func,
    //Calls when resize starts.
    onResizeStart: prop_types_1["default"].func,
    // Calls when resize movement happens.
    onResize: prop_types_1["default"].func,
    // Calls when resize is complete.
    onResizeStop: prop_types_1["default"].func,
    // Calls when some element is dropped.
    onDrop: prop_types_1["default"].func,
    //
    // Other validations
    //
    droppingItem: prop_types_1["default"].shape({
        i: prop_types_1["default"].string.isRequired,
        w: prop_types_1["default"].number.isRequired,
        h: prop_types_1["default"].number.isRequired
    }),
    // Children must not have duplicate keys.
    children: function (props, propName) {
        var children = props[propName];
        // Check children keys for duplicates. Throw if found.
        var keys = {};
        react_1["default"].Children.forEach(children, function (child) {
            if ((child === null || child === void 0 ? void 0 : child.key) == null)
                return;
            if (keys[child.key]) {
                throw new Error('Duplicate child key "' +
                    child.key +
                    '" found! This will cause problems in ReactGridLayout.');
            }
            keys[child.key] = true;
        });
    },
    // Optional ref for getting a reference for the wrapping div.
    innerRef: prop_types_1["default"].any,
    scrollContainerRef: prop_types_1["default"].any
};
exports["default"] = RGLPropTypes;
