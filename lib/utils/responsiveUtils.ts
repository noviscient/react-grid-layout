// @flow

import { CompactType, Layout } from '../RGLExtraTypes'
import { cloneLayout, compact, correctBounds } from "./coreUtils"

export type Breakpoint = string
export type DefaultBreakpoints = "lg" | "md" | "sm" | "xs" | "xxs"

// + indicates read-only
export type ResponsiveLayout<T extends Breakpoint> = {
	[breakpoint in T]?: Layout
};
export type BreakpointWidthsMap<T extends Breakpoint> = {
  	[breakpoint in T]: number | null | undefined
};

export type OnLayoutChangeCallback = (
	layout: Layout,
	breakpoints: { [key: Breakpoint]: Layout }
) => void

/**
 * Given a width, find the highest breakpoint that matches is valid for it (width > breakpoint).
 *
 * @param  {Object} breakpoints Breakpoints object (e.g. {lg: 1200, md: 960, ...})
 * @param  {Number} width Screen width.
 * @return {String}       Highest breakpoint that is less than width.
 */
export function getBreakpointFromWidth <B extends string>(
	breakpoints: BreakpointWidthsMap<B>,
	width: number
): B {
	const sorted = sortBreakpoints(breakpoints)
	let matching = sorted[0]
	for (let i = 1, len = sorted.length; i < len; i++) {
		const breakpointName = sorted[i]
		if (width > (breakpoints[breakpointName] ?? Infinity)) matching = breakpointName
	}
	return matching
}

/**
 * Given a breakpoint, get the # of cols set for it.
 * @param  {String} breakpoint Breakpoint name.
 * @param  {Object} cols       Map of breakpoints to cols.
 * @return {Number}            Number of cols.
 */
export function getColsFromBreakpoint <B extends string>(
	breakpoint: B,
	cols: BreakpointWidthsMap<B>
): number {
	if (!cols[breakpoint]) {
		throw new Error(
			"ResponsiveReactGridLayout: `cols` entry for breakpoint " +
			breakpoint +
			" is missing!"
		)
	}
	return cols[breakpoint]!
}

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
export function findOrGenerateResponsiveLayout <B extends string>(
	layouts: ResponsiveLayout<B>,
	breakpoints: BreakpointWidthsMap<B>,
	breakpoint: B,
	lastBreakpoint: B,
	cols: number,
	compactType: CompactType
): Layout {
	// If it already exists, just return it.
	if (layouts[breakpoint]) return cloneLayout(layouts[breakpoint]!)
	// Find or generate the next layout
	let layout = layouts[lastBreakpoint]
	const breakpointsSorted = sortBreakpoints(breakpoints)
	const breakpointsAbove = breakpointsSorted.slice(
		breakpointsSorted.indexOf(breakpoint)
	)
	for (let i = 0, len = breakpointsAbove.length; i < len; i++) {
		const b = breakpointsAbove[i]
		if (layouts[b]) {
			layout = layouts[b]
			break
		}
	}
	layout = cloneLayout(layout || []) // clone layout so we don't modify existing items
	return compact(correctBounds(layout, { cols: cols }), compactType, cols)
}

/**
 * Given breakpoints, return an array of breakpoints sorted by width. This is usually
 * e.g. ['xxs', 'xs', 'sm', ...]
 *
 * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
 * @return {Array}              Sorted breakpoints.
 */
export function sortBreakpoints<Bkpt extends string = DefaultBreakpoints> (
	breakpointMap: BreakpointWidthsMap<Bkpt>
): Array<Bkpt> {
	const keys: Array<Bkpt> = Object.keys(breakpointMap) as Bkpt[]
	return keys.sort(function (a, b) {
		return (breakpointMap[a] ?? 0) - (breakpointMap[b] ?? 0)
	})
}
