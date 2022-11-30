import PropTypes from "prop-types"
import { ReactElement } from 'react'
import { RGLDroppingPosition, RGLGridDragEvent, RGLGridItemCallback, RGLGridResizeEvent } from './RGLExtraTypes'
import { RGLResizeHandle, rglResizeHandleAxesType, RGLResizeHandleAxis, rglResizeHandleType } from './RGLPropTypes'

const RGLGridItemPropTypes = {
	// Children must be only a single element
	children: PropTypes.element,

	// General grid attributes
	cols: PropTypes.number.isRequired,
	containerWidth: PropTypes.number.isRequired,
	rowHeight: PropTypes.number.isRequired,
	margin: PropTypes.array.isRequired,
	maxRows: PropTypes.number.isRequired,
	containerPadding: PropTypes.array.isRequired,

	// These are all in grid units
	x: PropTypes.number.isRequired,
	y: PropTypes.number.isRequired,
	w: PropTypes.number.isRequired,
	h: PropTypes.number.isRequired,

	// All optional
	minW: function (props: RGLGridItemProps, propName: keyof RGLGridItemProps) {
		const value = props[propName]
		if (typeof value !== "number") return new Error("minWidth not Number")
		if (value > props.w || value > props.maxW)
			return new Error("minWidth larger than item width/maxWidth")
	},

	maxW: function (props: RGLGridItemProps, propName: keyof RGLGridItemProps) {
		const value = props[propName]
		if (typeof value !== "number") return new Error("maxWidth not Number")
		if (value < props.w || value < props.minW)
			return new Error("maxWidth smaller than item width/minWidth")
	},

	minH: function (props: RGLGridItemProps, propName: keyof RGLGridItemProps) {
		const value = props[propName]
		if (typeof value !== "number") return new Error("minHeight not Number")
		if (value > props.h || value > props.maxH)
			return new Error("minHeight larger than item height/maxHeight")
	},

	maxH: function (props: RGLGridItemProps, propName: keyof RGLGridItemProps) {
		const value = props[propName]
		if (typeof value !== "number") return new Error("maxHeight not Number")
		if (value < props.h || value < props.minH)
			return new Error("maxHeight smaller than item height/minHeight")
	},

	// ID is nice to have for callbacks
	i: PropTypes.string.isRequired,

	// Resize handle options
	resizeHandles: rglResizeHandleAxesType,
	resizeHandle: rglResizeHandleType,

	// Functions
	onDragStop: PropTypes.func,
	onDragStart: PropTypes.func,
	onDrag: PropTypes.func,
	onResizeStop: PropTypes.func,
	onResizeStart: PropTypes.func,
	onResize: PropTypes.func,

	// Flags
	isDraggable: PropTypes.bool.isRequired,
	isResizable: PropTypes.bool.isRequired,
	isBounded: PropTypes.bool.isRequired,
	static: PropTypes.bool,

	// Use CSS transforms instead of top/left
	useCSSTransforms: PropTypes.bool.isRequired,
	transformScale: PropTypes.number,

	// Others
	className: PropTypes.string,
	// Selector for draggable handle
	handle: PropTypes.string,
	// Selector for draggable cancel (see react-draggable)
	cancel: PropTypes.string,
	// Current position of a dropping element
	droppingPosition: PropTypes.shape({
		e: PropTypes.object.isRequired,
		left: PropTypes.number.isRequired,
		top: PropTypes.number.isRequired
	})
}

export default RGLGridItemPropTypes

export type RGLGridItemProps = {
	children: ReactElement<any>,
	cols: number,
	containerWidth: number,
	margin: [number, number],
	containerPadding: [number, number],
	rowHeight: number,
	maxRows: number,
	isDraggable: boolean,
	isResizable: boolean,
	isBounded: boolean,
	static?: boolean,
	useCSSTransforms?: boolean,
	usePercentages?: boolean,
	transformScale: number,
	droppingPosition?: RGLDroppingPosition,

	className: string,
	style?: Object,
	// Draggability
	cancel: string,
	handle: string,

	x: number,
	y: number,
	w: number,
	h: number,

	minW: number,
	maxW: number,
	minH: number,
	maxH: number,
	i: string,

	resizeHandles?: RGLResizeHandleAxis[],
	resizeHandle?: RGLResizeHandle,

	onDrag?: RGLGridItemCallback<RGLGridDragEvent>,
	onDragStart?: RGLGridItemCallback<RGLGridDragEvent>,
	onDragStop?: RGLGridItemCallback<RGLGridDragEvent>,
	onResize?: RGLGridItemCallback<RGLGridResizeEvent>,
	onResizeStart?: RGLGridItemCallback<RGLGridResizeEvent>,
	onResizeStop?: RGLGridItemCallback<RGLGridResizeEvent>
}

export type RGLGridItemState = {
	resizing?: { width: number, height: number } | null,
	dragging?: { top: number, left: number } | null,
	className?: string
}