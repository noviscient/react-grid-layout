import RGLPropTypes, { RGLGridProps } from './RGLPropTypes'
import isDeepEqual from 'lodash/isEqual'

const propKeys = Object.keys(RGLPropTypes) as (keyof typeof RGLPropTypes)[]
propKeys.splice(propKeys.indexOf('children'), 1)

export const fastRGLPropsEqual = (a: RGLGridProps, b: RGLGridProps) => {
	return a.allowOverlap === b.allowOverlap &&
		a.autoSize === b.autoSize &&
		// a.children
		a.className === b.className &&
		a.cols === b.cols &&
		a.compactType === b.compactType &&
		a.containerPadding?.[0] === b.containerPadding?.[0] &&
		a.containerPadding?.[1] === b.containerPadding?.[1] &&
		a.draggableCancel === b.draggableCancel &&
		a.draggableHandle === b.draggableHandle &&
		isDeepEqual(a.droppingItem, b.droppingItem) &&
		a.innerRef === b.innerRef &&
		a.isBounded === b.isBounded &&
		a.isDraggable === b.isDraggable &&
		a.isDroppable === b.isDroppable &&
		a.isResizable === b.isResizable &&
		isDeepEqual(a.layout, b.layout) &&
		a.margin?.[0] === b.margin?.[0] &&
		a.maxRows === b.maxRows &&
		a.onDrag === b.onDrag &&
		a.onDragStart === b.onDragStart &&
		a.onDragStop === b.onDragStop &&
		a.onDrop === b.onDrop &&
		a.onDropDragOver === b.onDropDragOver &&
		a.onLayoutChange === b.onLayoutChange &&
		a.onResize === b.onResize &&
		a.onResizeStart === b.onResizeStart &&
		a.onResizeStop === b.onResizeStop &&
		a.preventCollision === b.preventCollision &&
		a.resizeHandle === b.resizeHandle &&
		isDeepEqual(a.resizeHandles, b.resizeHandles) &&
		a.rowHeight === b.rowHeight &&
		isDeepEqual(a.style, b.style) &&
		a.transformScale === b.transformScale &&
		a.useCSSTransforms === b.useCSSTransforms &&
		a.verticalCompact === b.verticalCompact &&
		a.width === b.width
}
