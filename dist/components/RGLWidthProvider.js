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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RGLWidthProvider = void 0;
var clsx_1 = __importDefault(require("clsx"));
var prop_types_1 = __importDefault(require("prop-types"));
var React = __importStar(require("react"));
var layoutClassName = "react-grid-layout";
/*
 * A simple HOC that provides facility for listening to container resizes.
 *
 * The Flow type is pretty janky here. I can't just spread `WPProps` into this returned object - I wish I could - but it triggers
 * a flow bug of some sort that causes it to stop typechecking.
 */
function RGLWidthProvider(ComposedComponent) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(WidthProvider, _super);
            function WidthProvider() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    width: 1280
                };
                _this.elementRef = React.createRef();
                _this.mounted = false;
                _this.onWindowResize = function () {
                    if (!_this.mounted)
                        return;
                    var node = _this.elementRef.current; // Flow casts this to Text | Element
                    // fix: grid position error when node or parentNode display is none by window resize
                    // #924 #1084
                    if (node instanceof HTMLElement && node.offsetWidth) {
                        _this.setState({ width: node.offsetWidth });
                    }
                };
                return _this;
            }
            WidthProvider.prototype.componentDidMount = function () {
                this.mounted = true;
                window.addEventListener("resize", this.onWindowResize);
                // Call to properly set the breakpoint and resize the elements.
                // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
                // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
                this.onWindowResize();
            };
            WidthProvider.prototype.componentWillUnmount = function () {
                this.mounted = false;
                window.removeEventListener("resize", this.onWindowResize);
            };
            WidthProvider.prototype.render = function () {
                this.props;
                var _a = this.props, measureBeforeMount = _a.measureBeforeMount, rest = __rest(_a, ["measureBeforeMount"]);
                if (measureBeforeMount && !this.mounted) {
                    return (React.createElement("div", { className: (0, clsx_1["default"])(this.props.className, layoutClassName), style: this.props.style, 
                        // $FlowIgnore ref types
                        ref: this.elementRef }));
                }
                return (React.createElement(ComposedComponent, __assign({ innerRef: this.elementRef }, rest, this.state)));
            };
            return WidthProvider;
        }(React.Component)),
        _a.defaultProps = {
            measureBeforeMount: false
        },
        _a.propTypes = {
            // If true, will not render children until mounted. Useful for getting the exact width before
            // rendering, to prevent any unsightly resizing.
            measureBeforeMount: prop_types_1["default"].bool
        },
        _a;
}
exports.RGLWidthProvider = RGLWidthProvider;
exports["default"] = RGLWidthProvider;
