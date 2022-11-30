"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.fastRGLPropsEqual = void 0;
var RGLPropTypes_1 = __importDefault(require("./RGLPropTypes"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var propKeys = Object.keys(RGLPropTypes_1["default"]);
propKeys.splice(propKeys.indexOf('children'), 1);
var fastRGLPropsEqual = function (a, b) {
    var _a, _b, _c, _d, _e, _f;
    return a.allowOverlap === b.allowOverlap &&
        a.autoSize === b.autoSize &&
        // a.children
        a.className === b.className &&
        a.cols === b.cols &&
        a.compactType === b.compactType &&
        ((_a = a.containerPadding) === null || _a === void 0 ? void 0 : _a[0]) === ((_b = b.containerPadding) === null || _b === void 0 ? void 0 : _b[0]) &&
        ((_c = a.containerPadding) === null || _c === void 0 ? void 0 : _c[1]) === ((_d = b.containerPadding) === null || _d === void 0 ? void 0 : _d[1]) &&
        a.draggableCancel === b.draggableCancel &&
        a.draggableHandle === b.draggableHandle &&
        (0, isEqual_1["default"])(a.droppingItem, b.droppingItem) &&
        a.innerRef === b.innerRef &&
        a.isBounded === b.isBounded &&
        a.isDraggable === b.isDraggable &&
        a.isDroppable === b.isDroppable &&
        a.isResizable === b.isResizable &&
        (0, isEqual_1["default"])(a.layout, b.layout) &&
        ((_e = a.margin) === null || _e === void 0 ? void 0 : _e[0]) === ((_f = b.margin) === null || _f === void 0 ? void 0 : _f[0]) &&
        a.maxRows === b.maxRows &&
        a.onDrag === b.onDrag &&
        a.onDragStart === b.onDragStart &&
        a.onDragStop === b.onDragStop &&
        a.onDrop === b.onDrop &&
        a.onDropDragOver === b.onDropDragOver &&
        a.onLayoutChange === b.onLayoutChange &&
        a.onResize === b.onResize &&
        a.onResizeStart === b.onResizeStart &&
        a.onResizeStop === b.onResizeStop &&
        a.preventCollision === b.preventCollision &&
        a.resizeHandle === b.resizeHandle &&
        (0, isEqual_1["default"])(a.resizeHandles, b.resizeHandles) &&
        a.rowHeight === b.rowHeight &&
        (0, isEqual_1["default"])(a.style, b.style) &&
        a.transformScale === b.transformScale &&
        a.useCSSTransforms === b.useCSSTransforms &&
        a.verticalCompact === b.verticalCompact &&
        a.width === b.width;
};
exports.fastRGLPropsEqual = fastRGLPropsEqual;
