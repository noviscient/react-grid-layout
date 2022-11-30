"use strict";
exports.__esModule = true;
exports.clamp = exports.calcWH = exports.calcXY = exports.calcGridItemPosition = exports.calcGridItemWHPx = exports.calcGridColWidth = void 0;
// Helper for generating column width
function calcGridColWidth(positionParams) {
    var margin = positionParams.margin, containerPadding = positionParams.containerPadding, containerWidth = positionParams.containerWidth, cols = positionParams.cols;
    return ((containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols);
}
exports.calcGridColWidth = calcGridColWidth;
// This can either be called:
// calcGridItemWHPx(w, colWidth, margin[0])
// or
// calcGridItemWHPx(h, rowHeight, margin[1])
function calcGridItemWHPx(gridUnits, colOrRowSize, marginPx) {
    // 0 * Infinity === NaN, which causes problems with resize contraints
    if (!Number.isFinite(gridUnits))
        return gridUnits;
    return Math.round(colOrRowSize * gridUnits + Math.max(0, gridUnits - 1) * marginPx);
}
exports.calcGridItemWHPx = calcGridItemWHPx;
/**
 * Return position on the page given an x, y, w, h.
 * left, top, width, height are all in pixels.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number}  x                      X coordinate in grid units.
 * @param  {Number}  y                      Y coordinate in grid units.
 * @param  {Number}  w                      W coordinate in grid units.
 * @param  {Number}  h                      H coordinate in grid units.
 * @return {Position}                       Object containing coords.
 */
function calcGridItemPosition(positionParams, x, y, w, h, state) {
    var margin = positionParams.margin, containerPadding = positionParams.containerPadding, rowHeight = positionParams.rowHeight;
    var colWidth = calcGridColWidth(positionParams);
    var out = { width: 0, height: 0, top: 0, left: 0 };
    // If resizing, use the exact width and height as returned from resizing callbacks.
    if (state && state.resizing) {
        out.width = Math.round(state.resizing.width);
        out.height = Math.round(state.resizing.height);
    }
    // Otherwise, calculate from grid units.
    else {
        out.width = calcGridItemWHPx(w, colWidth, margin[0]);
        out.height = calcGridItemWHPx(h, rowHeight, margin[1]);
    }
    // If dragging, use the exact width and height as returned from dragging callbacks.
    if (state && state.dragging) {
        out.top = Math.round(state.dragging.top);
        out.left = Math.round(state.dragging.left);
    }
    // Otherwise, calculate from grid units.
    else {
        out.top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
        out.left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
    }
    return out;
}
exports.calcGridItemPosition = calcGridItemPosition;
/**
 * Translate x and y coordinates from pixels to grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number} top                     Top position (relative to parent) in pixels.
 * @param  {Number} left                    Left position (relative to parent) in pixels.
 * @param  {Number} w                       W coordinate in grid units.
 * @param  {Number} h                       H coordinate in grid units.
 * @return {Object}                         x and y in grid units.
 */
function calcXY(positionParams, top, left, w, h) {
    var margin = positionParams.margin, cols = positionParams.cols, rowHeight = positionParams.rowHeight, maxRows = positionParams.maxRows;
    var colWidth = calcGridColWidth(positionParams);
    // left = colWidth * x + margin * (x + 1)
    // l = cx + m(x+1)
    // l = cx + mx + m
    // l - m = cx + mx
    // l - m = x(c + m)
    // (l - m) / (c + m) = x
    // x = (left - margin) / (coldWidth + margin)
    var x = Math.round((left - margin[0]) / (colWidth + margin[0]));
    var y = Math.round((top - margin[1]) / (rowHeight + margin[1]));
    // Capping
    x = clamp(x, 0, cols - w);
    y = clamp(y, 0, maxRows - h);
    return { x: x, y: y };
}
exports.calcXY = calcXY;
/**
 * Given a height and width in pixel values, calculate grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calcluations.
 * @param  {Number} height                  Height in pixels.
 * @param  {Number} width                   Width in pixels.
 * @param  {Number} x                       X coordinate in grid units.
 * @param  {Number} y                       Y coordinate in grid units.
 * @return {Object}                         w, h as grid units.
 */
function calcWH(positionParams, width, height, x, y) {
    var margin = positionParams.margin, maxRows = positionParams.maxRows, cols = positionParams.cols, rowHeight = positionParams.rowHeight;
    var colWidth = calcGridColWidth(positionParams);
    // width = colWidth * w - (margin * (w - 1))
    // ...
    // w = (width + margin) / (colWidth + margin)
    var w = Math.round((width + margin[0]) / (colWidth + margin[0]));
    var h = Math.round((height + margin[1]) / (rowHeight + margin[1]));
    // Capping
    w = clamp(w, 0, cols - x);
    h = clamp(h, 0, maxRows - y);
    return { w: w, h: h };
}
exports.calcWH = calcWH;
// Similar to _.clamp
function clamp(num, lowerBound, upperBound) {
    return Math.max(Math.min(num, upperBound), lowerBound);
}
exports.clamp = clamp;
