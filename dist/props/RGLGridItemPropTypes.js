"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var prop_types_1 = __importDefault(require("prop-types"));
var RGLPropTypes_1 = require("./RGLPropTypes");
var RGLGridItemPropTypes = {
    // Children must be only a single element
    children: prop_types_1["default"].element,
    // General grid attributes
    cols: prop_types_1["default"].number.isRequired,
    containerWidth: prop_types_1["default"].number.isRequired,
    rowHeight: prop_types_1["default"].number.isRequired,
    margin: prop_types_1["default"].array.isRequired,
    maxRows: prop_types_1["default"].number.isRequired,
    containerPadding: prop_types_1["default"].array.isRequired,
    // These are all in grid units
    x: prop_types_1["default"].number.isRequired,
    y: prop_types_1["default"].number.isRequired,
    w: prop_types_1["default"].number.isRequired,
    h: prop_types_1["default"].number.isRequired,
    // All optional
    minW: function (props, propName) {
        var value = props[propName];
        if (typeof value !== "number")
            return new Error("minWidth not Number");
        if (value > props.w || value > props.maxW)
            return new Error("minWidth larger than item width/maxWidth");
    },
    maxW: function (props, propName) {
        var value = props[propName];
        if (typeof value !== "number")
            return new Error("maxWidth not Number");
        if (value < props.w || value < props.minW)
            return new Error("maxWidth smaller than item width/minWidth");
    },
    minH: function (props, propName) {
        var value = props[propName];
        if (typeof value !== "number")
            return new Error("minHeight not Number");
        if (value > props.h || value > props.maxH)
            return new Error("minHeight larger than item height/maxHeight");
    },
    maxH: function (props, propName) {
        var value = props[propName];
        if (typeof value !== "number")
            return new Error("maxHeight not Number");
        if (value < props.h || value < props.minH)
            return new Error("maxHeight smaller than item height/minHeight");
    },
    // ID is nice to have for callbacks
    i: prop_types_1["default"].string.isRequired,
    // Resize handle options
    resizeHandles: RGLPropTypes_1.rglResizeHandleAxesType,
    resizeHandle: RGLPropTypes_1.rglResizeHandleType,
    // Functions
    onDragStop: prop_types_1["default"].func,
    onDragStart: prop_types_1["default"].func,
    onDrag: prop_types_1["default"].func,
    onResizeStop: prop_types_1["default"].func,
    onResizeStart: prop_types_1["default"].func,
    onResize: prop_types_1["default"].func,
    // Flags
    isDraggable: prop_types_1["default"].bool.isRequired,
    isResizable: prop_types_1["default"].bool.isRequired,
    isBounded: prop_types_1["default"].bool.isRequired,
    static: prop_types_1["default"].bool,
    // Use CSS transforms instead of top/left
    useCSSTransforms: prop_types_1["default"].bool.isRequired,
    transformScale: prop_types_1["default"].number,
    // Others
    className: prop_types_1["default"].string,
    // Selector for draggable handle
    handle: prop_types_1["default"].string,
    // Selector for draggable cancel (see react-draggable)
    cancel: prop_types_1["default"].string,
    // Current position of a dropping element
    droppingPosition: prop_types_1["default"].shape({
        e: prop_types_1["default"].object.isRequired,
        left: prop_types_1["default"].number.isRequired,
        top: prop_types_1["default"].number.isRequired
    })
};
exports["default"] = RGLGridItemPropTypes;
