import React from 'react';
import { RGLCompactType, RGLLayoutItemList, RGLLayoutItem, RGLPosition } from '../props/RGLExtraTypes';
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
declare function bottom(layout: RGLLayoutItemList): number;
declare function cloneLayout(layout: RGLLayoutItemList): RGLLayoutItemList;
declare function modifyLayout(layout: RGLLayoutItemList, layoutItem: RGLLayoutItem): RGLLayoutItemList;
declare function withLayoutItem(layout: RGLLayoutItemList, itemKey: string, cb: (li: RGLLayoutItem) => RGLLayoutItem): [RGLLayoutItemList, RGLLayoutItem | null];
declare function cloneLayoutItem(layoutItem: RGLLayoutItem): RGLLayoutItem;
/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
declare function childrenEqual(a: React.ReactElement[], b: React.ReactElement[]): boolean;
declare function fastPositionEqual(a: RGLPosition, b: RGLPosition): boolean;
/**
 * Given two layoutitems, check if they collide.
 */
declare function collides(l1: RGLLayoutItem, l2: RGLLayoutItem): boolean;
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
declare function compact(layout: RGLLayoutItemList, compactType: RGLCompactType, cols: number): RGLLayoutItemList;
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
declare function resolveCompactionCollision(layout: RGLLayoutItemList, item: RGLLayoutItem, moveToCoord: number, axis: "x" | "y"): void;
/**
 * Compact an item in the layout.
 *
 * Modifies item.
 *
 */
declare function compactItem(compareWith: RGLLayoutItemList, l: RGLLayoutItem, compactType: RGLCompactType, cols: number, fullLayout: RGLLayoutItemList): RGLLayoutItem;
/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * Modifies layout items.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
declare function correctBounds(layout: RGLLayoutItemList, bounds: {
    cols: number;
}): RGLLayoutItemList;
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {RGLLayoutItem}    Item at ID.
 */
declare function getLayoutItem(layout: RGLLayoutItemList, id: string): RGLLayoutItem | undefined;
/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
declare function getFirstCollision(layout: RGLLayoutItemList, layoutItem: RGLLayoutItem): RGLLayoutItem | undefined;
declare function getAllCollisions(layout: RGLLayoutItemList, layoutItem: RGLLayoutItem): Array<RGLLayoutItem>;
/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
declare function getStatics(layout: RGLLayoutItemList): Array<RGLLayoutItem>;
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
declare function moveElement(layout: RGLLayoutItemList, l: RGLLayoutItem, x: undefined | number, y: undefined | number, isUserAction: undefined | boolean, preventCollision: undefined | boolean, compactType: RGLCompactType, cols: number, allowOverlap: undefined | boolean): RGLLayoutItemList;
/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {RGLLayoutItem} collidesWith Layout item we're colliding with.
 * @param  {RGLLayoutItem} itemToMove   Layout item we're moving.
 */
declare function moveElementAwayFromCollision(layout: RGLLayoutItemList, collidesWith: RGLLayoutItem, itemToMove: RGLLayoutItem, isUserAction: boolean | undefined, compactType: RGLCompactType, cols: number): RGLLayoutItemList;
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
declare function perc(num: number): string;
declare function setTransform({ top, left, width, height }: RGLPosition): {
    transform: string;
    WebkitTransform: string;
    MozTransform: string;
    msTransform: string;
    OTransform: string;
    width: string;
    height: string;
    position: string;
};
declare function setTopLeft({ top, left, width, height }: RGLPosition): {
    top: string;
    left: string;
    width: string;
    height: string;
    position: string;
};
/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
declare function sortLayoutItems(layout: RGLLayoutItemList, compactType: RGLCompactType): RGLLayoutItemList;
/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */
declare function sortLayoutItemsByRowCol(layout: RGLLayoutItemList): RGLLayoutItemList;
/**
 * Sort layout items by column ascending then row ascending.
 *
 * Does not modify Layout.
 */
declare function sortLayoutItemsByColRow(layout: RGLLayoutItemList): RGLLayoutItemList;
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
declare function synchronizeLayoutWithChildren(initialLayout: RGLLayoutItemList, children: React.ReactElement[], cols: number, compactType: RGLCompactType | null, allowOverlap: boolean | undefined): RGLLayoutItemList;
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
declare function validateLayout(layout: RGLLayoutItemList, contextName?: string): void;
declare function compactType(props?: {
    verticalCompact: boolean;
    compactType: RGLCompactType | null;
}): RGLCompactType | null;
declare function log(...args: any[]): void;
declare const rglCoreUtils: {
    noop: () => void;
    log: typeof log;
    compactType: typeof compactType;
    validateLayout: typeof validateLayout;
    synchronizeLayoutWithChildren: typeof synchronizeLayoutWithChildren;
    sortLayoutItemsByRowCol: typeof sortLayoutItemsByRowCol;
    sortLayoutItemsByColRow: typeof sortLayoutItemsByColRow;
    sortLayoutItems: typeof sortLayoutItems;
    setTopLeft: typeof setTopLeft;
    setTransform: typeof setTransform;
    perc: typeof perc;
    moveElement: typeof moveElement;
    moveElementAwayFromCollision: typeof moveElementAwayFromCollision;
    getStatics: typeof getStatics;
    bottom: typeof bottom;
    cloneLayout: typeof cloneLayout;
    modifyLayout: typeof modifyLayout;
    withLayoutItem: typeof withLayoutItem;
    cloneLayoutItem: typeof cloneLayoutItem;
    childrenEqual: typeof childrenEqual;
    fastPositionEqual: typeof fastPositionEqual;
    collides: typeof collides;
    compact: typeof compact;
    heightWidth: {
        readonly x: "w";
        readonly y: "h";
    };
    resolveCompactionCollision: typeof resolveCompactionCollision;
    compactItem: typeof compactItem;
    correctBounds: typeof correctBounds;
    getLayoutItem: typeof getLayoutItem;
    getFirstCollision: typeof getFirstCollision;
    getAllCollisions: typeof getAllCollisions;
};
export default rglCoreUtils;
