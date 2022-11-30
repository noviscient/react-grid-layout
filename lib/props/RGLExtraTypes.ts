import React, { SyntheticEvent } from 'react'
import { DraggableEvent } from 'react-draggable'

export type RGLDragOverEvent = MouseEvent & {
	nativeEvent: {
		layerX: number,
		layerY: number,
	} & MouseEvent
}

export type RGLEventCallback = (
	layout: RGLLayoutItemList,
	oldItem?: RGLLayoutItem | null,
	newItem?: RGLLayoutItem | null,
	placeholder?: RGLLayoutItem | null,
	event?: SyntheticEvent | DraggableEvent,
   element?: HTMLElement
) => void

export type RGLLayoutItemList = RGLLayoutItem[]
export type RGLLayoutItem = {
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

export type RGLCompactType = "horizontal" | "vertical" | undefined

export type RGLPosition = {
	left: number,
	top: number,
	width: number,
	height: number
}
export type RGLPartialPosition = { left: number, top: number }
export type RGLDroppingPosition = { left: number, top: number, e: SyntheticEvent | RGLDragOverEvent }
export type RGLSize = { width: number, height: number }
export type RGLGridDragEvent = {
	e: React.SyntheticEvent | DraggableEvent,
	node: HTMLElement,
	newPosition: RGLPartialPosition
}
export type RGLGridResizeEvent = {
	e: React.SyntheticEvent,
	node: HTMLElement,
	size: RGLSize
}
export type RGLGridItemCallback<Data extends RGLGridDragEvent | RGLGridResizeEvent> = (
	i: string,
	w: number,
	h: number,
	data: Data
) => void
export type RGLReactDraggableCallbackData = {
	node: HTMLElement,
	x?: number,
	y?: number,
	deltaX: number,
	deltaY: number,
	lastX?: number,
	lastY?: number
}
