"use strict";
// @flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.sortBreakpoints = exports.findOrGenerateResponsiveLayout = exports.getColsFromBreakpoint = exports.getBreakpointFromWidth = void 0;
var coreUtils_1 = __importDefault(require("./coreUtils"));
var cloneLayout = coreUtils_1["default"].cloneLayout, compact = coreUtils_1["default"].compact, correctBounds = coreUtils_1["default"].correctBounds;
/**
 * Given a width, find the highest breakpoint that matches is valid for it (width > breakpoint).
 *
 * @param  {Object} breakpoints Breakpoints object (e.g. {lg: 1200, md: 960, ...})
 * @param  {Number} width Screen width.
 * @return {String}       Highest breakpoint that is less than width.
 */
function getBreakpointFromWidth(breakpoints, width) {
    var _a;
    var sorted = sortBreakpoints(breakpoints);
    var matching = sorted[0];
    for (var i = 1, len = sorted.length; i < len; i++) {
        var breakpointName = sorted[i];
        if (width > ((_a = breakpoints[breakpointName]) !== null && _a !== void 0 ? _a : Infinity))
            matching = breakpointName;
    }
    return matching;
}
exports.getBreakpointFromWidth = getBreakpointFromWidth;
/**
 * Given a breakpoint, get the # of cols set for it.
 * @param  {String} breakpoint Breakpoint name.
 * @param  {Object} cols       Map of breakpoints to cols.
 * @return {Number}            Number of cols.
 */
function getColsFromBreakpoint(breakpoint, cols) {
    if (!cols[breakpoint]) {
        throw new Error("ResponsiveReactGridLayout: `cols` entry for breakpoint " +
            breakpoint +
            " is missing!");
    }
    return cols[breakpoint];
}
exports.getColsFromBreakpoint = getColsFromBreakpoint;
/**
 * Given existing layouts and a new breakpoint, find or generate a new layout.
 *
 * This finds the layout above the new one and generates from it, if it exists.
 *
 * @param  {Object} layouts     Existing layouts.
 * @param  {Array} breakpoints All breakpoints.
 * @param  {String} breakpoint New breakpoint.
 * @param  {String} breakpoint Last breakpoint (for fallback).
 * @param  {Number} cols       Column count at new breakpoint.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}             New layout.
 */
function findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, lastBreakpoint, cols, compactType) {
    // If it already exists, just return it.
    if (layouts[breakpoint])
        return cloneLayout(layouts[breakpoint]);
    // Find or generate the next layout
    var layout = layouts[lastBreakpoint];
    var breakpointsSorted = sortBreakpoints(breakpoints);
    var breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint));
    for (var i = 0, len = breakpointsAbove.length; i < len; i++) {
        var b = breakpointsAbove[i];
        if (layouts[b]) {
            layout = layouts[b];
            break;
        }
    }
    layout = cloneLayout(layout || []); // clone layout so we don't modify existing items
    return compact(correctBounds(layout, { cols: cols }), compactType, cols);
}
exports.findOrGenerateResponsiveLayout = findOrGenerateResponsiveLayout;
/**
 * Given breakpoints, return an array of breakpoints sorted by width. This is usually
 * e.g. ['xxs', 'xs', 'sm', ...]
 *
 * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
 * @return {Array}              Sorted breakpoints.
 */
function sortBreakpoints(breakpointMap) {
    var keys = Object.keys(breakpointMap);
    return keys.sort(function (a, b) {
        var _a, _b;
        return ((_a = breakpointMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = breakpointMap[b]) !== null && _b !== void 0 ? _b : 0);
    });
}
exports.sortBreakpoints = sortBreakpoints;
