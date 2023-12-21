import clsx from "clsx"
import type { ReactElement, ReactNode, SyntheticEvent } from "react"
import React from "react"
import { DraggableCore, DraggableEvent } from "react-draggable"
import { Resizable } from 'react-resizable'
import type { RGLPartialPosition, RGLPosition, RGLReactDraggableCallbackData } from '../props/RGLExtraTypes'
import RGLGridItemPropTypes, { RGLGridItemProps, RGLGridItemState } from '../props/RGLGridItemPropTypes'
import type { RGLReactRef } from '../props/RGLPropTypes'
import {
	rglCalcGridColWidth, rglCalcGridItemPosition,
	rglCalcGridItemWHPx, rglCalcWH, rglCalcXY, rglClamp, RGLPositionParams
} from '../utils/calculateUtils'
import rglCoreUtils from '../utils/coreUtils'

const { fastPositionEqual, perc, setTopLeft, setTransform } = rglCoreUtils

type State = RGLGridItemState
type Props = RGLGridItemProps

type DefaultProps = {
	className: string,
	cancel: string,
	handle: string,
	minH: number,
	minW: number,
	maxH: number,
	maxW: number,
	transformScale: number,
}

/**
 * An individual item within a ReactGridLayout.
 */
export class RGLGridItem extends React.Component<RGLGridItemProps, State> {
	static propTypes = RGLGridItemPropTypes;

	static defaultProps: DefaultProps = {
		className: "",
		cancel: "",
		handle: "",
		minH: 1,
		minW: 1,
		maxH: Infinity,
		maxW: Infinity,
		transformScale: 1,
	};

	state: State = {
		resizing: null,
		dragging: null,
		className: ""
	};

	elementRef: RGLReactRef<HTMLDivElement> = React.createRef();

	shouldComponentUpdate (nextProps: RGLGridItemProps, nextState: State): boolean {
		// We can't deeply compare children. If the developer memoizes them, we can
		// use this optimization.
		if (this.props.children !== nextProps.children) return true
		if (this.props.droppingPosition !== nextProps.droppingPosition) return true
		// TODO memoize these calculations so they don't take so long?
		const oldPosition = rglCalcGridItemPosition(
			this.getPositionParams(this.props),
			this.props.x,
			this.props.y,
			this.props.w,
			this.props.h,
			this.state
		)
		const newPosition = rglCalcGridItemPosition(
			this.getPositionParams(nextProps),
			nextProps.x,
			nextProps.y,
			nextProps.w,
			nextProps.h,
			nextState
		)
		return (
			!fastPositionEqual(oldPosition, newPosition) ||
			this.props.useCSSTransforms !== nextProps.useCSSTransforms
		)
	}

	componentDidMount () {
		this.moveDroppingItem({})
	}

	componentDidUpdate (prevProps: Props) {
		this.moveDroppingItem(prevProps)
	}

	// When a droppingPosition is present, this means we should fire a move event, as if we had moved
	// this element by `x, y` pixels.
	moveDroppingItem (prevProps: Partial<Props>) {
		const { droppingPosition } = this.props
		if (!droppingPosition) return
		const node = this.elementRef.current
		// Can't find DOM node (are we unmounted?)
		if (!node) return

		const prevDroppingPosition = prevProps.droppingPosition || {
			left: 0,
			top: 0
		}
		const { dragging } = this.state

		const shouldDrag =
			(dragging && droppingPosition.left !== prevDroppingPosition.left) ||
			droppingPosition.top !== prevDroppingPosition.top

		if (!dragging) {
			this.onDragStart(droppingPosition.e, {
				node,
				// deltaX: droppingPosition.left,
				// deltaY: droppingPosition.top,
			})
		} else if (shouldDrag) {
			const deltaX = droppingPosition.left - dragging.left
			const deltaY = droppingPosition.top - dragging.top

			this.onDrag(droppingPosition.e, {
				node,
				deltaX,
				deltaY
			})
		}
	}

	getPositionParams (props: Props = this.props): RGLPositionParams {
		return {
			cols: props.cols,
			containerPadding: props.containerPadding,
			containerWidth: props.containerWidth,
			margin: props.margin,
			maxRows: props.maxRows,
			rowHeight: props.rowHeight
		}
	}

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
	createStyle (pos: RGLPosition): { [key: string]: string | undefined } {
		const { usePercentages, containerWidth, useCSSTransforms } = this.props

		let style
		// CSS Transforms support (default)
		if (useCSSTransforms) {
			style = setTransform(pos)
		} else {
			// top,left (slow)
			style = setTopLeft(pos)

			// This is used for server rendering.
			if (usePercentages) {
				style.left = perc(pos.left / containerWidth)
				style.width = perc(pos.width / containerWidth)
			}
		}

		return style
	}

	/**
	 * Mix a Draggable instance into a child.
	 * @param  {Element} child    Child element.
	 * @return {Element}          Child wrapped in Draggable.
	 */
	mixinDraggable (
		child: ReactElement<any>,
		isDraggable: boolean
	): ReactElement<any> {
		return (
			<DraggableCore
				disabled={ !isDraggable }
				onStart={(e, d) => this.onDragStart(e, d)}
				onDrag={(e, d) => this.onDrag(e, d)}
				onStop={(e, d) => this.onDragStop(e, d)}
				handle={ this.props.handle }
				cancel={
					".react-resizable-handle" +
					(this.props.cancel ? "," + this.props.cancel : "")
				}
				scale={ this.props.transformScale }
				nodeRef={ this.elementRef }
			>
				{ child }
			</DraggableCore>
		)
	}

	/**
	 * Mix a Resizable instance into a child.
	 * @param  {Element} child    Child element.
	 * @param  {Object} position  Position object (pixel values)
	 * @return {Element}          Child wrapped in Resizable.
	 */
	mixinResizable (
		child: ReactElement<any>,
		position: RGLPosition,
		isResizable: boolean
	): ReactElement<any> {
		const {
			cols,
			x,
			minW,
			minH,
			maxW,
			maxH,
			transformScale,
			resizeHandles,
			resizeHandle
		} = this.props
		const positionParams = this.getPositionParams()

		// This is the max possible width - doesn't go to infinity because of the width of the window
		const maxWidth = rglCalcGridItemPosition(
			positionParams,
			0,
			0,
			cols - x,
			0
		).width

		// Calculate min/max constraints using our min & maxes
		const mins = rglCalcGridItemPosition(positionParams, 0, 0, minW, minH)
		const maxes = rglCalcGridItemPosition(positionParams, 0, 0, maxW, maxH)
		const minConstraints: [number, number] = [mins.width, mins.height]
		const maxConstraints: [number, number] = [
			Math.min(maxes.width, maxWidth),
			Math.min(maxes.height, Infinity)
		]
		return (
			<Resizable
				// These are opts for the resize handle itself
				draggableOpts={{
					disabled: !isResizable
				}}
				className={isResizable ? undefined : "react-resizable-hide" }
				width={position.width}
				height={position.height}
				minConstraints={minConstraints}
				maxConstraints={maxConstraints}
				onResizeStop={this.onResizeStop}
				onResizeStart={this.onResizeStart}
				onResize={this.onResize}
				transformScale={transformScale}
				resizeHandles={resizeHandles}
				handle={resizeHandle}
			>
				{ child }
			</Resizable>
		)
	}

	onDragStart = (e: DraggableEvent | SyntheticEvent, { node }: { node: HTMLElement }): void => {
		const { onDragStart, transformScale } = this.props
		if (!onDragStart) return

		const newPosition: RGLPartialPosition = { top: 0, left: 0 }

		// TODO: this wont work on nested parents
		const { offsetParent } = node
		if (!offsetParent) return
		const parentRect = offsetParent.getBoundingClientRect()
		const clientRect = node.getBoundingClientRect()
		const cLeft = clientRect.left / transformScale
		const pLeft = parentRect.left / transformScale
		const cTop = clientRect.top / transformScale
		const pTop = parentRect.top / transformScale
		newPosition.left = cLeft - pLeft + offsetParent.scrollLeft
		newPosition.top = cTop - pTop + offsetParent.scrollTop + (this.props.customScrollContainerRef?.current?.scrollTop ?? 0)
		this.setState({ dragging: newPosition })

		// Call callback with this data
		const { x, y } = rglCalcXY(
			this.getPositionParams(),
			newPosition.top,
			newPosition.left,
			this.props.w,
			this.props.h
		)

		return onDragStart.call(this, this.props.i, x, y, {
			e,
			node,
			newPosition
		})
	};

	/**
	 * onDrag event handler
	 * @param  {Event}  e             event data
	 * @param  {Object} callbackData  an object with node, delta and position information
	 */
	onDrag = (
		e: SyntheticEvent | DraggableEvent,
		{ node, deltaX, deltaY }: RGLReactDraggableCallbackData
	) => {
		const { onDrag } = this.props
		if (!onDrag) return

		if (!this.state.dragging) {
			throw new Error("onDrag called before onDragStart.")
		}
		let top = this.state.dragging.top + deltaY
		let left = this.state.dragging.left + deltaX

		const { isBounded, i, w, h, containerWidth } = this.props
		const positionParams = this.getPositionParams()

		// Boundary calculations; keeps items within the grid
		if (isBounded) {
			const { offsetParent } = node

			if (offsetParent) {
				const { margin, rowHeight } = this.props
				const bottomBoundary =
					offsetParent.clientHeight - rglCalcGridItemWHPx(h, rowHeight, margin[1])
				top = rglClamp(top, 0, bottomBoundary)

				const colWidth = rglCalcGridColWidth(positionParams)
				const rightBoundary =
					containerWidth - rglCalcGridItemWHPx(w, colWidth, margin[0])
				left = rglClamp(left, 0, rightBoundary)
			}
		}

		const newPosition: RGLPartialPosition = { top, left }
		this.setState({ dragging: newPosition })

		// Call callback with this data
		const { x, y } = rglCalcXY(positionParams, top, left, w, h)
		return onDrag.call(this, i, x, y, {
			e,
			node,
			newPosition
		})
	};

	/**
	 * onDragStop event handler
	 */
	onDragStop = (e: SyntheticEvent | DraggableEvent, { node }: RGLReactDraggableCallbackData) => {
		const { onDragStop } = this.props
		if (!onDragStop) return

		if (!this.state.dragging) {
			throw new Error("onDragEnd called before onDragStart.")
		}
		const { w, h, i } = this.props
		const { left, top } = this.state.dragging
		const newPosition: RGLPartialPosition = { top, left }
		this.setState({ dragging: null })

		const { x, y } = rglCalcXY(this.getPositionParams(), top, left, w, h)

		return onDragStop.call(this, i, x, y, {
			e,
			node,
			newPosition
		})
	};

	/**
	 * onResizeStop event handler
	 * @param  {Event}  e             event data
	 * @param  {Object} callbackData  an object with node and size information
	 */
	onResizeStop = (
		e: SyntheticEvent,
		callbackData: { node: HTMLElement, size: Pick<RGLPosition, 'width' | 'height'> }
	) => {
		this.onResizeHandler(e, callbackData, "onResizeStop")
	};

	/**
	 * onResizeStart event handler
	 * @param  {Event}  e             event data
	 * @param  {Object} callbackData  an object with node and size information
	 */
	onResizeStart = (
		e: SyntheticEvent,
		callbackData: { node: HTMLElement, size: Pick<RGLPosition, 'width' | 'height'> }
	) => {
		this.onResizeHandler(e, callbackData, "onResizeStart")
	};

	/**
	 * onResize event handler
	 * @param  {Event}  e             event data
	 * @param  {Object} callbackData  an object with node and size information
	 */
	onResize = (
		e: SyntheticEvent,
		callbackData: {
			node: HTMLElement
			size: Pick<RGLPosition, 'width' | 'height'>
		}
	) => {
		this.onResizeHandler(e, callbackData, "onResize")
	};

	/**
	 * Wrapper around drag events to provide more useful data.
	 * All drag events call the function with the given handler name,
	 * with the signature (index, x, y).
	 *
	 * @param  {String} handlerName Handler name to wrap.
	 * @return {Function}           Handler function.
	 */
	onResizeHandler (
		e: React.SyntheticEvent,
		{ node, size }: { node: HTMLElement, size: Pick<RGLPosition, 'width' | 'height'> },
		handlerName: 'onResizeStart' | 'onResizeStop' | 'onResize'
	): void {
		const handler = this.props[handlerName]
		if (!handler) return
		const { cols, x, y, i, maxH, minH } = this.props
		let { minW, maxW } = this.props

		// Get new XY
		let { w, h } = rglCalcWH(
			this.getPositionParams(),
			size.width,
			size.height,
			x,
			y
		)

		// minW should be at least 1 (TODO propTypes validation?)
		minW = Math.max(minW, 1)

		// maxW should be at most (cols - x)
		maxW = Math.min(maxW, cols - x)

		// Min/max capping
		w = rglClamp(w, minW, maxW)
		h = rglClamp(h, minH, maxH)

		this.setState({ resizing: handlerName === "onResizeStop" ? null : size })

		handler.call(this, i, w, h, { e, node, size })
	}

	render (): ReactNode {
		const {
			x,
			y,
			w,
			h,
			isDraggable,
			isResizable,
			droppingPosition,
			useCSSTransforms
		} = this.props

		const pos = rglCalcGridItemPosition(
			this.getPositionParams(),
			x,
			y,
			w,
			h,
			this.state
		)
		const child = React.Children.only(this.props.children)

		// Create the child element. We clone the existing element but modify its className and style.
		let newChild = React.cloneElement(child, {
			ref: this.elementRef,
			className: clsx(
				"react-grid-item",
				child.props.className,
				this.props.className,
				{
					static: this.props.static,
					resizing: Boolean(this.state.resizing),
					"react-draggable": isDraggable,
					"react-draggable-dragging": Boolean(this.state.dragging),
					dropping: Boolean(droppingPosition),
					cssTransforms: useCSSTransforms
				}
			),
			// We can set the width and height on the child, but unfortunately we can't set the position.
			style: {
				...this.props.style,
				...child.props.style,
				...this.createStyle(pos)
			}
		})

		// Resizable support. This is usually on but the user can toggle it off.
		newChild = this.mixinResizable(newChild, pos, isResizable)

		// Draggable support. This is always on, except for with placeholders.
		newChild = this.mixinDraggable(newChild, isDraggable)

		return newChild
	}
}
export default RGLGridItem