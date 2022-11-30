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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RGLGridItem = void 0;
var clsx_1 = __importDefault(require("clsx"));
var react_1 = __importDefault(require("react"));
var react_draggable_1 = require("react-draggable");
var react_resizable_1 = require("react-resizable");
var RGLGridItemPropTypes_1 = __importDefault(require("../props/RGLGridItemPropTypes"));
var calculateUtils_1 = require("../utils/calculateUtils");
var coreUtils_1 = __importDefault(require("../utils/coreUtils"));
var fastPositionEqual = coreUtils_1["default"].fastPositionEqual, perc = coreUtils_1["default"].perc, setTopLeft = coreUtils_1["default"].setTopLeft, setTransform = coreUtils_1["default"].setTransform;
/**
 * An individual item within a ReactGridLayout.
 */
var RGLGridItem = /** @class */ (function (_super) {
    __extends(RGLGridItem, _super);
    function RGLGridItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            resizing: null,
            dragging: null,
            className: ""
        };
        _this.elementRef = react_1["default"].createRef();
        _this.onDragStart = function (e, _a) {
            var node = _a.node;
            var _b = _this.props, onDragStart = _b.onDragStart, transformScale = _b.transformScale;
            if (!onDragStart)
                return;
            var newPosition = { top: 0, left: 0 };
            // TODO: this wont work on nested parents
            var offsetParent = node.offsetParent;
            if (!offsetParent)
                return;
            var parentRect = offsetParent.getBoundingClientRect();
            var clientRect = node.getBoundingClientRect();
            var cLeft = clientRect.left / transformScale;
            var pLeft = parentRect.left / transformScale;
            var cTop = clientRect.top / transformScale;
            var pTop = parentRect.top / transformScale;
            newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
            newPosition.top = cTop - pTop + offsetParent.scrollTop;
            _this.setState({ dragging: newPosition });
            // Call callback with this data
            var _c = (0, calculateUtils_1.rglCalcXY)(_this.getPositionParams(), newPosition.top, newPosition.left, _this.props.w, _this.props.h), x = _c.x, y = _c.y;
            return onDragStart.call(_this, _this.props.i, x, y, {
                e: e,
                node: node,
                newPosition: newPosition
            });
        };
        /**
         * onDrag event handler
         * @param  {Event}  e             event data
         * @param  {Object} callbackData  an object with node, delta and position information
         */
        _this.onDrag = function (e, _a) {
            var node = _a.node, deltaX = _a.deltaX, deltaY = _a.deltaY;
            var onDrag = _this.props.onDrag;
            if (!onDrag)
                return;
            if (!_this.state.dragging) {
                throw new Error("onDrag called before onDragStart.");
            }
            var top = _this.state.dragging.top + deltaY;
            var left = _this.state.dragging.left + deltaX;
            var _b = _this.props, isBounded = _b.isBounded, i = _b.i, w = _b.w, h = _b.h, containerWidth = _b.containerWidth;
            var positionParams = _this.getPositionParams();
            // Boundary calculations; keeps items within the grid
            if (isBounded) {
                var offsetParent = node.offsetParent;
                if (offsetParent) {
                    var _c = _this.props, margin = _c.margin, rowHeight = _c.rowHeight;
                    var bottomBoundary = offsetParent.clientHeight - (0, calculateUtils_1.rglCalcGridItemWHPx)(h, rowHeight, margin[1]);
                    top = (0, calculateUtils_1.rglClamp)(top, 0, bottomBoundary);
                    var colWidth = (0, calculateUtils_1.rglCalcGridColWidth)(positionParams);
                    var rightBoundary = containerWidth - (0, calculateUtils_1.rglCalcGridItemWHPx)(w, colWidth, margin[0]);
                    left = (0, calculateUtils_1.rglClamp)(left, 0, rightBoundary);
                }
            }
            var newPosition = { top: top, left: left };
            _this.setState({ dragging: newPosition });
            // Call callback with this data
            var _d = (0, calculateUtils_1.rglCalcXY)(positionParams, top, left, w, h), x = _d.x, y = _d.y;
            return onDrag.call(_this, i, x, y, {
                e: e,
                node: node,
                newPosition: newPosition
            });
        };
        /**
         * onDragStop event handler
         */
        _this.onDragStop = function (e, _a) {
            var node = _a.node;
            var onDragStop = _this.props.onDragStop;
            if (!onDragStop)
                return;
            if (!_this.state.dragging) {
                throw new Error("onDragEnd called before onDragStart.");
            }
            var _b = _this.props, w = _b.w, h = _b.h, i = _b.i;
            var _c = _this.state.dragging, left = _c.left, top = _c.top;
            var newPosition = { top: top, left: left };
            _this.setState({ dragging: null });
            var _d = (0, calculateUtils_1.rglCalcXY)(_this.getPositionParams(), top, left, w, h), x = _d.x, y = _d.y;
            return onDragStop.call(_this, i, x, y, {
                e: e,
                node: node,
                newPosition: newPosition
            });
        };
        /**
         * onResizeStop event handler
         * @param  {Event}  e             event data
         * @param  {Object} callbackData  an object with node and size information
         */
        _this.onResizeStop = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, "onResizeStop");
        };
        /**
         * onResizeStart event handler
         * @param  {Event}  e             event data
         * @param  {Object} callbackData  an object with node and size information
         */
        _this.onResizeStart = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, "onResizeStart");
        };
        /**
         * onResize event handler
         * @param  {Event}  e             event data
         * @param  {Object} callbackData  an object with node and size information
         */
        _this.onResize = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, "onResize");
        };
        return _this;
    }
    RGLGridItem.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        // We can't deeply compare children. If the developer memoizes them, we can
        // use this optimization.
        if (this.props.children !== nextProps.children)
            return true;
        if (this.props.droppingPosition !== nextProps.droppingPosition)
            return true;
        // TODO memoize these calculations so they don't take so long?
        var oldPosition = (0, calculateUtils_1.rglCalcGridItemPosition)(this.getPositionParams(this.props), this.props.x, this.props.y, this.props.w, this.props.h, this.state);
        var newPosition = (0, calculateUtils_1.rglCalcGridItemPosition)(this.getPositionParams(nextProps), nextProps.x, nextProps.y, nextProps.w, nextProps.h, nextState);
        return (!fastPositionEqual(oldPosition, newPosition) ||
            this.props.useCSSTransforms !== nextProps.useCSSTransforms);
    };
    RGLGridItem.prototype.componentDidMount = function () {
        this.moveDroppingItem({});
    };
    RGLGridItem.prototype.componentDidUpdate = function (prevProps) {
        this.moveDroppingItem(prevProps);
    };
    // When a droppingPosition is present, this means we should fire a move event, as if we had moved
    // this element by `x, y` pixels.
    RGLGridItem.prototype.moveDroppingItem = function (prevProps) {
        var droppingPosition = this.props.droppingPosition;
        if (!droppingPosition)
            return;
        var node = this.elementRef.current;
        // Can't find DOM node (are we unmounted?)
        if (!node)
            return;
        var prevDroppingPosition = prevProps.droppingPosition || {
            left: 0,
            top: 0
        };
        var dragging = this.state.dragging;
        var shouldDrag = (dragging && droppingPosition.left !== prevDroppingPosition.left) ||
            droppingPosition.top !== prevDroppingPosition.top;
        if (!dragging) {
            this.onDragStart(droppingPosition.e, {
                node: node
            });
        }
        else if (shouldDrag) {
            var deltaX = droppingPosition.left - dragging.left;
            var deltaY = droppingPosition.top - dragging.top;
            this.onDrag(droppingPosition.e, {
                node: node,
                deltaX: deltaX,
                deltaY: deltaY
            });
        }
    };
    RGLGridItem.prototype.getPositionParams = function (props) {
        if (props === void 0) { props = this.props; }
        return {
            cols: props.cols,
            containerPadding: props.containerPadding,
            containerWidth: props.containerWidth,
            margin: props.margin,
            maxRows: props.maxRows,
            rowHeight: props.rowHeight
        };
    };
    /**
     * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
     * well when server rendering, and the only way to do that properly is to use percentage width/left because
     * we don't know exactly what the browser viewport is.
     * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
     * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
     *
     * @param  {Object} pos Position object with width, height, left, top.
     * @return {Object}     Style object.
     */
    RGLGridItem.prototype.createStyle = function (pos) {
        var _a = this.props, usePercentages = _a.usePercentages, containerWidth = _a.containerWidth, useCSSTransforms = _a.useCSSTransforms;
        var style;
        // CSS Transforms support (default)
        if (useCSSTransforms) {
            style = setTransform(pos);
        }
        else {
            // top,left (slow)
            style = setTopLeft(pos);
            // This is used for server rendering.
            if (usePercentages) {
                style.left = perc(pos.left / containerWidth);
                style.width = perc(pos.width / containerWidth);
            }
        }
        return style;
    };
    /**
     * Mix a Draggable instance into a child.
     * @param  {Element} child    Child element.
     * @return {Element}          Child wrapped in Draggable.
     */
    RGLGridItem.prototype.mixinDraggable = function (child, isDraggable) {
        var _this = this;
        return (react_1["default"].createElement(react_draggable_1.DraggableCore, { disabled: !isDraggable, onStart: function (e, d) { return _this.onDragStart(e, d); }, onDrag: function (e, d) { return _this.onDrag(e, d); }, onStop: function (e, d) { return _this.onDragStop(e, d); }, handle: this.props.handle, cancel: ".react-resizable-handle" +
                (this.props.cancel ? "," + this.props.cancel : ""), scale: this.props.transformScale, nodeRef: this.elementRef }, child));
    };
    /**
     * Mix a Resizable instance into a child.
     * @param  {Element} child    Child element.
     * @param  {Object} position  Position object (pixel values)
     * @return {Element}          Child wrapped in Resizable.
     */
    RGLGridItem.prototype.mixinResizable = function (child, position, isResizable) {
        var _a = this.props, cols = _a.cols, x = _a.x, minW = _a.minW, minH = _a.minH, maxW = _a.maxW, maxH = _a.maxH, transformScale = _a.transformScale, resizeHandles = _a.resizeHandles, resizeHandle = _a.resizeHandle;
        var positionParams = this.getPositionParams();
        // This is the max possible width - doesn't go to infinity because of the width of the window
        var maxWidth = (0, calculateUtils_1.rglCalcGridItemPosition)(positionParams, 0, 0, cols - x, 0).width;
        // Calculate min/max constraints using our min & maxes
        var mins = (0, calculateUtils_1.rglCalcGridItemPosition)(positionParams, 0, 0, minW, minH);
        var maxes = (0, calculateUtils_1.rglCalcGridItemPosition)(positionParams, 0, 0, maxW, maxH);
        var minConstraints = [mins.width, mins.height];
        var maxConstraints = [
            Math.min(maxes.width, maxWidth),
            Math.min(maxes.height, Infinity)
        ];
        return (react_1["default"].createElement(react_resizable_1.Resizable
        // These are opts for the resize handle itself
        , { 
            // These are opts for the resize handle itself
            draggableOpts: {
                disabled: !isResizable
            }, className: isResizable ? undefined : "react-resizable-hide", width: position.width, height: position.height, minConstraints: minConstraints, maxConstraints: maxConstraints, onResizeStop: this.onResizeStop, onResizeStart: this.onResizeStart, onResize: this.onResize, transformScale: transformScale, resizeHandles: resizeHandles, handle: resizeHandle }, child));
    };
    /**
     * Wrapper around drag events to provide more useful data.
     * All drag events call the function with the given handler name,
     * with the signature (index, x, y).
     *
     * @param  {String} handlerName Handler name to wrap.
     * @return {Function}           Handler function.
     */
    RGLGridItem.prototype.onResizeHandler = function (e, _a, handlerName) {
        var node = _a.node, size = _a.size;
        var handler = this.props[handlerName];
        if (!handler)
            return;
        var _b = this.props, cols = _b.cols, x = _b.x, y = _b.y, i = _b.i, maxH = _b.maxH, minH = _b.minH;
        var _c = this.props, minW = _c.minW, maxW = _c.maxW;
        // Get new XY
        var _d = (0, calculateUtils_1.rglCalcWH)(this.getPositionParams(), size.width, size.height, x, y), w = _d.w, h = _d.h;
        // minW should be at least 1 (TODO propTypes validation?)
        minW = Math.max(minW, 1);
        // maxW should be at most (cols - x)
        maxW = Math.min(maxW, cols - x);
        // Min/max capping
        w = (0, calculateUtils_1.rglClamp)(w, minW, maxW);
        h = (0, calculateUtils_1.rglClamp)(h, minH, maxH);
        this.setState({ resizing: handlerName === "onResizeStop" ? null : size });
        handler.call(this, i, w, h, { e: e, node: node, size: size });
    };
    RGLGridItem.prototype.render = function () {
        var _a = this.props, x = _a.x, y = _a.y, w = _a.w, h = _a.h, isDraggable = _a.isDraggable, isResizable = _a.isResizable, droppingPosition = _a.droppingPosition, useCSSTransforms = _a.useCSSTransforms;
        var pos = (0, calculateUtils_1.rglCalcGridItemPosition)(this.getPositionParams(), x, y, w, h, this.state);
        var child = react_1["default"].Children.only(this.props.children);
        // Create the child element. We clone the existing element but modify its className and style.
        var newChild = react_1["default"].cloneElement(child, {
            ref: this.elementRef,
            className: (0, clsx_1["default"])("react-grid-item", child.props.className, this.props.className, {
                static: this.props.static,
                resizing: Boolean(this.state.resizing),
                "react-draggable": isDraggable,
                "react-draggable-dragging": Boolean(this.state.dragging),
                dropping: Boolean(droppingPosition),
                cssTransforms: useCSSTransforms
            }),
            // We can set the width and height on the child, but unfortunately we can't set the position.
            style: __assign(__assign(__assign({}, this.props.style), child.props.style), this.createStyle(pos))
        });
        // Resizable support. This is usually on but the user can toggle it off.
        newChild = this.mixinResizable(newChild, pos, isResizable);
        // Draggable support. This is always on, except for with placeholders.
        newChild = this.mixinDraggable(newChild, isDraggable);
        return newChild;
    };
    RGLGridItem.propTypes = RGLGridItemPropTypes_1["default"];
    RGLGridItem.defaultProps = {
        className: "",
        cancel: "",
        handle: "",
        minH: 1,
        minW: 1,
        maxH: Infinity,
        maxW: Infinity,
        transformScale: 1
    };
    return RGLGridItem;
}(react_1["default"].Component));
exports.RGLGridItem = RGLGridItem;
exports["default"] = RGLGridItem;
