import React, { SyntheticEvent } from 'react'
import { DraggableEvent } from 'react-draggable'

export type DragOverEvent = MouseEvent & {
	nativeEvent: {
		layerX: number,
		layerY: number,
	} & MouseEvent
}

export type EventCallback = (
	layout: Layout,
	oldItem?: LayoutItem | null,
	newItem?: LayoutItem | null,
	placeholder?: LayoutItem | null,
	event?: SyntheticEvent | DraggableEvent,
   element?: HTMLElement
) => void

export type Layout = LayoutItem[]
export type LayoutItem = {
	w: number,
	h: number,
	x: number,
	y: number,
	i: string,
	minW?: number,
	minH?: number,
	maxW?: number,
	maxH?: number,
	moved?: boolean,
	static?: boolean,
	isDraggable?: boolean,
	isResizable?: boolean,
	resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">,
	isBounded?: boolean
}

export type CompactType = "horizontal" | "vertical" | undefined

export type Position = {
	left: number,
	top: number,
	width: number,
	height: number
}
export type PartialPosition = { left: number, top: number }
export type DroppingPosition = { left: number, top: number, e: SyntheticEvent | DragOverEvent }
export type Size = { width: number, height: number }
export type GridDragEvent = {
	e: React.SyntheticEvent | DraggableEvent,
	node: HTMLElement,
	newPosition: PartialPosition
}
export type GridResizeEvent = {
	e: React.SyntheticEvent,
	node: HTMLElement,
	size: Size
}
export type GridItemCallback<Data extends GridDragEvent | GridResizeEvent> = (
	i: string,
	w: number,
	h: number,
	data: Data
) => void
export type ReactDraggableCallbackData = {
	node: HTMLElement,
	x?: number,
	y?: number,
	deltaX: number,
	deltaY: number,
	lastX?: number,
	lastY?: number
}
