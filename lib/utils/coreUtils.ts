import isEqual from 'lodash/isEqual'
import React, { ReactChildren, ReactElement } from 'react'
import { RGLCompactType, RGLLayoutItemList, RGLLayoutItem, RGLPosition } from '../props/RGLExtraTypes'

const isProduction = process.env.NODE_ENV === "production"
const DEBUG = false

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
function bottom (layout: RGLLayoutItemList): number {
	let max = 0,
		bottomY
	for (let i = 0, len = layout.length; i < len; i++) {
		bottomY = layout[i].y + layout[i].h
		if (bottomY > max) max = bottomY
	}
	return max
}

function cloneLayout (layout: RGLLayoutItemList): RGLLayoutItemList {
	const newLayout = Array(layout.length)
	for (let i = 0, len = layout.length; i < len; i++) {
		newLayout[i] = cloneLayoutItem(layout[i])
	}
	return newLayout
}

// Modify a layoutItem inside a layout. Returns a new Layout,
// does not mutate. Carries over all other LayoutItems unmodified.
function modifyLayout (layout: RGLLayoutItemList, layoutItem: RGLLayoutItem): RGLLayoutItemList {
	const newLayout = Array(layout.length)
	for (let i = 0, len = layout.length; i < len; i++) {
		if (layoutItem.i === layout[i].i) {
			newLayout[i] = layoutItem
		} else {
			newLayout[i] = layout[i]
		}
	}
	return newLayout
}

// Function to be called to modify a layout item.
// Does defensive clones to ensure the layout is not modified.
function withLayoutItem (
	layout: RGLLayoutItemList,
	itemKey: string,
	cb: (li: RGLLayoutItem) => RGLLayoutItem
): [RGLLayoutItemList, RGLLayoutItem | null] {
	let item = getLayoutItem(layout, itemKey)
	if (!item) return [layout, null]
	item = cb(cloneLayoutItem(item)) // defensive clone then modify
	// FIXME could do this faster if we already knew the index
	layout = modifyLayout(layout, item)
	return [layout, item]
}

// Fast path to cloning, since this is monomorphic
function cloneLayoutItem (layoutItem: RGLLayoutItem): RGLLayoutItem {
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
	}
}

/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
function childrenEqual (a: React.ReactChild[], b: React.ReactChild[]): boolean {
	return isEqual(
		// expects children to be elements, should fix the typing
		React.Children.map(a, c => (c as ReactElement)?.key),
		React.Children.map(b, c => (c as ReactElement)?.key)
	)
}

// Like the above, but a lot simpler.
function fastPositionEqual (a: RGLPosition, b: RGLPosition): boolean {
	return (
		a.left === b.left &&
		a.top === b.top &&
		a.width === b.width &&
		a.height === b.height
	)
}

/**
 * Given two layoutitems, check if they collide.
 */
function collides (l1: RGLLayoutItem, l2: RGLLayoutItem): boolean {
	if (l1.i === l2.i) return false // same element
	if (l1.x + l1.w <= l2.x) return false // l1 is left of l2
	if (l1.x >= l2.x + l2.w) return false // l1 is right of l2
	if (l1.y + l1.h <= l2.y) return false // l1 is above l2
	if (l1.y >= l2.y + l2.h) return false // l1 is below l2
	return true // boxes overlap
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
function compact (
	layout: RGLLayoutItemList,
	compactType: RGLCompactType,
	cols: number
): RGLLayoutItemList {
	// Statics go in the compareWith array right away so items flow around them.
	const compareWith = getStatics(layout)
	// We go through the items by row and column.
	const sorted = sortLayoutItems(layout, compactType)
	// Holding for new items.
	const out = Array(layout.length)

	for (let i = 0, len = sorted.length; i < len; i++) {
		let l = cloneLayoutItem(sorted[i])

		// Don't move static elements
		if (!l.static) {
			l = compactItem(compareWith, l, compactType, cols, sorted)

			// Add to comparison array. We only collide with items before this one.
			// Statics are already in this array.
			compareWith.push(l)
		}

		// Add to output array to make sure they still come out in the right order.
		out[layout.indexOf(sorted[i])] = l

		// Clear moved flag, if it exists.
		l.moved = false
	}

	return out
}

const heightWidth = { x: "w", y: "h" } as const
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
function resolveCompactionCollision (
	layout: RGLLayoutItemList,
	item: RGLLayoutItem,
	moveToCoord: number,
	axis: "x" | "y"
) {
	const sizeProp = heightWidth[axis]
	item[axis] += 1
	const itemIndex = layout
		.map(layoutItem => {
			return layoutItem.i
		})
		.indexOf(item.i)

	// Go through each item we collide with.
	for (let i = itemIndex + 1; i < layout.length; i++) {
		const otherItem = layout[i]
		// Ignore static items
		if (otherItem.static) continue

		// Optimization: we can break early if we know we're past this el
		// We can do this b/c it's a sorted layout
		if (otherItem.y > item.y + item.h) break

		if (collides(item, otherItem)) {
			resolveCompactionCollision(
				layout,
				otherItem,
				moveToCoord + item[sizeProp],
				axis
			)
		}
	}

	item[axis] = moveToCoord
}

/**
 * Compact an item in the layout.
 *
 * Modifies item.
 *
 */
function compactItem (
	compareWith: RGLLayoutItemList,
	l: RGLLayoutItem,
	compactType: RGLCompactType,
	cols: number,
	fullLayout: RGLLayoutItemList
): RGLLayoutItem {
	const compactV = compactType === "vertical"
	const compactH = compactType === "horizontal"
	if (compactV) {
		// Bottom 'y' possible is the bottom of the layout.
		// This allows you to do nice stuff like specify {y: Infinity}
		// This is here because the layout must be sorted in order to get the correct bottom `y`.
		l.y = Math.min(bottom(compareWith), l.y)
		// Move the element up as far as it can go without colliding.
		while (l.y > 0 && !getFirstCollision(compareWith, l)) {
			l.y--
		}
	} else if (compactH) {
		// Move the element left as far as it can go without colliding.
		while (l.x > 0 && !getFirstCollision(compareWith, l)) {
			l.x--
		}
	}

	// Move it down, and keep moving it down if it's colliding.
	let collides
	while ((collides = getFirstCollision(compareWith, l))) {
		if (compactH) {
			resolveCompactionCollision(fullLayout, l, collides.x + collides.w, "x")
		} else {
			resolveCompactionCollision(fullLayout, l, collides.y + collides.h, "y")
		}
		// Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
		if (compactH && l.x + l.w > cols) {
			l.x = cols - l.w
			l.y++
		}
	}

	// Ensure that there are no negative positions
	l.y = Math.max(l.y, 0)
	l.x = Math.max(l.x, 0)

	return l
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * Modifies layout items.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
function correctBounds (
	layout: RGLLayoutItemList,
	bounds: { cols: number }
): RGLLayoutItemList {
	const collidesWith = getStatics(layout)
	for (let i = 0, len = layout.length; i < len; i++) {
		const l = layout[i]
		// Overflows right
		if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w
		// Overflows left
		if (l.x < 0) {
			l.x = 0
			l.w = bounds.cols
		}
		if (!l.static) collidesWith.push(l)
		else {
			// If this is static and collides with other statics, we must move it down.
			// We have to do something nicer than just letting them overlap.
			while (getFirstCollision(collidesWith, l)) {
				l.y++
			}
		}
	}
	return layout
}

/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {RGLLayoutItem}    Item at ID.
 */
function getLayoutItem (layout: RGLLayoutItemList, id: string): RGLLayoutItem | undefined {
	for (let i = 0, len = layout.length; i < len; i++) {
		if (layout[i].i === id) return layout[i]
	}
	return undefined
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
function getFirstCollision (
	layout: RGLLayoutItemList,
	layoutItem: RGLLayoutItem
): RGLLayoutItem | undefined {
	for (let i = 0, len = layout.length; i < len; i++) {
		if (collides(layout[i], layoutItem)) return layout[i]
	}
	return undefined
}

function getAllCollisions (
	layout: RGLLayoutItemList,
	layoutItem: RGLLayoutItem
): Array<RGLLayoutItem> {
	return layout.filter(l => collides(l, layoutItem))
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
function getStatics (layout: RGLLayoutItemList): Array<RGLLayoutItem> {
	return layout.filter(l => l.static)
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
function moveElement (
	layout: RGLLayoutItemList,
	l: RGLLayoutItem,
	x: undefined | number,
	y: undefined | number,
	isUserAction: undefined | boolean,
	preventCollision: undefined | boolean,
	compactType: RGLCompactType,
	cols: number,
	allowOverlap: undefined | boolean
): RGLLayoutItemList {
	// If this is static and not explicitly enabled as draggable,
	// no move is possible, so we can short-circuit this immediately.
	if (l.static && l.isDraggable !== true) return layout

	// Short-circuit if nothing to do.
	if (l.y === y && l.x === x) return layout

	log(
		`Moving element ${ l.i } to [${ String(x) },${ String(y) }] from [${ l.x },${ l.y }]`
	)
	const oldX = l.x
	const oldY = l.y

	// This is quite a bit faster than extending the object
	if (typeof x === "number") l.x = x
	if (typeof y === "number") l.y = y
	l.moved = true

	// If this collides with anything, move it.
	// When doing this comparison, we have to sort the items we compare with
	// to ensure, in the case of multiple collisions, that we're getting the
	// nearest collision.
	let sorted = sortLayoutItems(layout, compactType)
	const movingUp =
		compactType === "vertical" && typeof y === "number"
			? oldY >= y
			: compactType === "horizontal" && typeof x === "number"
				? oldX >= x
				: false
	// $FlowIgnore acceptable modification of read-only array as it was recently cloned
	if (movingUp) sorted = sorted.reverse()
	const collisions = getAllCollisions(sorted, l)
	const hasCollisions = collisions.length > 0

	// We may have collisions. We can short-circuit if we've turned off collisions or
	// allowed overlap.
	if (hasCollisions && allowOverlap) {
		// Easy, we don't need to resolve collisions. But we *did* change the layout,
		// so clone it on the way out.
		return cloneLayout(layout)
	} else if (hasCollisions && preventCollision) {
		// If we are preventing collision but not allowing overlap, we need to
		// revert the position of this element so it goes to where it came from, rather
		// than the user's desired location.
		log(`Collision prevented on ${ l.i }, reverting.`)
		l.x = oldX
		l.y = oldY
		l.moved = false
		return layout // did not change so don't clone
	}

	// Move each item that collides away from this element.
	for (let i = 0, len = collisions.length; i < len; i++) {
		const collision = collisions[i]
		log(
			`Resolving collision between ${ l.i } at [${ l.x },${ l.y }] and ${ collision.i } at [${ collision.x },${ collision.y }]`
		)

		// Short circuit so we can't infinite loop
		if (collision.moved) continue

		// Don't move static items - we have to move *this* element away
		if (collision.static) {
			layout = moveElementAwayFromCollision(
				layout,
				collision,
				l,
				Boolean(isUserAction),
				compactType,
				cols
			)
		} else {
			layout = moveElementAwayFromCollision(
				layout,
				l,
				collision,
				Boolean(isUserAction),
				compactType,
				cols
			)
		}
	}

	return layout
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {RGLLayoutItem} collidesWith Layout item we're colliding with.
 * @param  {RGLLayoutItem} itemToMove   Layout item we're moving.
 */
function moveElementAwayFromCollision (
	layout: RGLLayoutItemList,
	collidesWith: RGLLayoutItem,
	itemToMove: RGLLayoutItem,
	isUserAction: boolean | undefined,
	compactType: RGLCompactType,
	cols: number
): RGLLayoutItemList {
	const compactH = compactType === "horizontal"
	// Compact vertically if not set to horizontal
	const compactV = compactType !== "horizontal"
	const preventCollision = collidesWith.static // we're already colliding (not for static items)

	// If there is enough space above the collision to put this element, move it there.
	// We only do this on the main collision as this can get funky in cascades and cause
	// unwanted swapping behavior.
	if (isUserAction) {
		// Reset isUserAction flag because we're not in the main collision anymore.
		isUserAction = false

		// Make a mock item so we don't modify the item here, only modify in moveElement.
		const fakeItem: RGLLayoutItem = {
			x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
			y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
			w: itemToMove.w,
			h: itemToMove.h,
			i: "-1"
		}

		// No collision? If so, we can go up there; otherwise, we'll end up moving down as normal
		if (!getFirstCollision(layout, fakeItem)) {
			log(
				`Doing reverse collision on ${ itemToMove.i } up to [${ fakeItem.x },${ fakeItem.y }].`
			)
			return moveElement(
				layout,
				itemToMove,
				compactH ? fakeItem.x : undefined,
				compactV ? fakeItem.y : undefined,
				isUserAction,
				preventCollision,
				compactType,
				cols,
				undefined
			)
		}
	}

	return moveElement(
		layout,
		itemToMove,
		compactH ? itemToMove.x + 1 : undefined,
		compactV ? itemToMove.y + 1 : undefined,
		isUserAction,
		preventCollision,
		compactType,
		cols,
		undefined
	)
}

/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
function perc (num: number): string {
	return num * 100 + "%"
}

function setTransform ({ top, left, width, height }: RGLPosition) {
	// Replace unitless items with px
	const translate = `translate(${ left }px,${ top }px)`
	return {
		transform: translate,
		WebkitTransform: translate,
		MozTransform: translate,
		msTransform: translate,
		OTransform: translate,
		width: `${ width }px`,
		height: `${ height }px`,
		position: "absolute"
	}
}

function setTopLeft ({ top, left, width, height }: RGLPosition) {
	return {
		top: `${ top }px`,
		left: `${ left }px`,
		width: `${ width }px`,
		height: `${ height }px`,
		position: "absolute"
	}
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
function sortLayoutItems (
	layout: RGLLayoutItemList,
	compactType: RGLCompactType
): RGLLayoutItemList {
	if (compactType === "horizontal") return sortLayoutItemsByColRow(layout)
	if (compactType === "vertical") return sortLayoutItemsByRowCol(layout)
	else return layout
}

/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */
function sortLayoutItemsByRowCol (layout: RGLLayoutItemList): RGLLayoutItemList {
	// Slice to clone array as sort modifies
	return layout.slice(0).sort(function (a, b) {
		if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
			return 1
		} else if (a.y === b.y && a.x === b.x) {
			// Without this, we can get different sort results in IE vs. Chrome/FF
			return 0
		}
		return -1
	})
}

/**
 * Sort layout items by column ascending then row ascending.
 *
 * Does not modify Layout.
 */
function sortLayoutItemsByColRow (layout: RGLLayoutItemList): RGLLayoutItemList {
	return layout.slice(0).sort(function (a, b) {
		if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
			return 1
		}
		return -1
	})
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
function synchronizeLayoutWithChildren (
	initialLayout: RGLLayoutItemList,
	children: React.ReactNode[],
	cols: number,
	compactType: RGLCompactType | null,
	allowOverlap: boolean | undefined
): RGLLayoutItemList {
	initialLayout = initialLayout || []

	// Generate one layout item per child.
	const layout: RGLLayoutItem[] = []
	React.Children.forEach(children as ReactElement[], (child: React.ReactElement<any>) => {
		// Child may not exist
		if (child?.key == null) return

		// Don't overwrite if it already exists.
		const exists = getLayoutItem(initialLayout, String(child.key))
		if (exists) {
			layout.push(cloneLayoutItem(exists))
		} else {
			if (!isProduction && child.props._grid) {
				console.warn(
					"`_grid` properties on children have been deprecated as of React 15.2. " +
					"Please use `data-grid` or add your properties directly to the `layout`."
				)
			}
			const g = child.props["data-grid"] || child.props._grid

			// Hey, this item has a data-grid property, use it.
			if (g) {
				if (!isProduction) {
					validateLayout([g], "ReactGridLayout.children")
				}
				// FIXME clone not really necessary here
				layout.push(cloneLayoutItem({ ...g, i: child.key }))
			} else {
				// Nothing provided: ensure this is added to the bottom
				// FIXME clone not really necessary here
				layout.push(
					cloneLayoutItem({
						w: 1,
						h: 1,
						x: 0,
						y: bottom(layout),
						i: String(child.key)
					})
				)
			}
		}
	})

	// Correct the layout.
	const correctedLayout = correctBounds(layout, { cols: cols })
	return allowOverlap
		? correctedLayout
		: compact(correctedLayout, compactType ?? 'vertical', cols)
}

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
function validateLayout (
	layout: RGLLayoutItemList,
	contextName: string = "Layout"
): void {
	const subProps = ["x", "y", "w", "h"] as const
	if (!Array.isArray(layout))
		throw new Error(contextName + " must be an array!")
	for (let i = 0, len = layout.length; i < len; i++) {
		const item = layout[i]
		for (let j = 0; j < subProps.length; j++) {
			if (typeof item[subProps[j]] !== "number") {
				throw new Error(
					"ReactGridLayout: " +
					contextName +
					"[" +
					i +
					"]." +
					subProps[j] +
					" must be a number!"
				)
			}
		}
	}
}

// Legacy support for verticalCompact: false
function compactType (
	props?: { verticalCompact: boolean, compactType: RGLCompactType | null }
): RGLCompactType | null {
	const { verticalCompact, compactType } = props || {}
	return verticalCompact === false ? null : compactType
}

function log (...args: any[]) {
	if (!DEBUG) return
	// eslint-disable-next-line no-console
	console.log(...args)
}

const noop = () => { }

const rglCoreUtils = {
	noop,
	log,
	compactType,
	validateLayout,
	synchronizeLayoutWithChildren,
	sortLayoutItemsByRowCol,
	sortLayoutItemsByColRow,
	sortLayoutItems,
	setTopLeft,
	setTransform,
	perc,
	moveElement,
	moveElementAwayFromCollision,
	getStatics,
	bottom,
	cloneLayout,
	modifyLayout,
	withLayoutItem,
	cloneLayoutItem,
	childrenEqual,
	fastPositionEqual,
	collides,
	compact,
	heightWidth,
	resolveCompactionCollision,
	compactItem,
	correctBounds,
	getLayoutItem,
	getFirstCollision,
	getAllCollisions
}
export default rglCoreUtils