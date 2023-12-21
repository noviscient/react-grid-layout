import type { ReactElement } from 'react';
import * as React from 'react';
import { RGLCompactType, RGLDroppingPosition, RGLGridDragEvent, RGLGridResizeEvent, RGLLayoutItem, RGLLayoutItemList } from '../props/RGLExtraTypes';
import type { RGLDefaultProps, RGLGridProps as Props } from '../props/RGLPropTypes';
type State = {
    activeDrag?: RGLLayoutItem | null;
    layout: RGLLayoutItemList;
    mounted: boolean;
    oldDragItem?: RGLLayoutItem | null;
    oldLayout?: RGLLayoutItemList | null;
    oldResizeItem?: RGLLayoutItem | null;
    droppingDOMNode?: ReactElement<any> | null;
    droppingPosition?: RGLDroppingPosition | null;
    children: React.ReactChild[];
    compactType?: RGLCompactType;
    propsLayout?: RGLLayoutItemList;
    rect?: DOMRect | null;
};
/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */
export declare class RGLGrid extends React.Component<Props, State> {
    static displayName: string;
    static propTypes: {
        className: import("prop-types").Requireable<string>;
        style: import("prop-types").Requireable<object>;
        width: import("prop-types").Requireable<number>;
        autoSize: import("prop-types").Requireable<boolean>;
        cols: import("prop-types").Requireable<number>;
        draggableCancel: import("prop-types").Requireable<string>;
        draggableHandle: import("prop-types").Requireable<string>;
        verticalCompact: (props: Props) => void;
        compactType: import("prop-types").Requireable<"horizontal" | "vertical">;
        layout: (props: Props) => void;
        margin: import("prop-types").Requireable<(number | null | undefined)[]>;
        containerPadding: import("prop-types").Requireable<(number | null | undefined)[]>;
        rowHeight: import("prop-types").Requireable<number>;
        maxRows: import("prop-types").Requireable<number>;
        isBounded: import("prop-types").Requireable<boolean>;
        isDraggable: import("prop-types").Requireable<boolean>;
        isResizable: import("prop-types").Requireable<boolean>;
        allowOverlap: import("prop-types").Requireable<boolean>;
        preventCollision: import("prop-types").Requireable<boolean>;
        useCSSTransforms: import("prop-types").Requireable<boolean>;
        transformScale: import("prop-types").Requireable<number>;
        isDroppable: import("prop-types").Requireable<boolean>;
        resizeHandles: import("prop-types").Requireable<(import("../props/RGLPropTypes").RGLResizeHandleAxis | null | undefined)[]>;
        resizeHandle: import("prop-types").Requireable<NonNullable<import("prop-types").ReactNodeLike | ((...args: any[]) => any)>>;
        onLayoutChange: import("prop-types").Requireable<(...args: any[]) => any>;
        onDragStart: import("prop-types").Requireable<(...args: any[]) => any>;
        onDrag: import("prop-types").Requireable<(...args: any[]) => any>;
        onDragStop: import("prop-types").Requireable<(...args: any[]) => any>;
        onResizeStart: import("prop-types").Requireable<(...args: any[]) => any>;
        onResize: import("prop-types").Requireable<(...args: any[]) => any>;
        onResizeStop: import("prop-types").Requireable<(...args: any[]) => any>;
        onDrop: import("prop-types").Requireable<(...args: any[]) => any>;
        droppingItem: import("prop-types").Requireable<import("prop-types").InferProps<{
            i: import("prop-types").Validator<string>;
            w: import("prop-types").Validator<number>;
            h: import("prop-types").Validator<number>;
        }>>;
        children: (props: any, propName: any) => void;
        innerRef: import("prop-types").Requireable<any>;
        scrollContainerRef: import("prop-types").Requireable<any>;
    };
    static defaultProps: RGLDefaultProps;
    state: State;
    dragEnterCounter: number;
    componentDidMount(): void;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): Pick<State, 'layout' | 'compactType' | 'children' | 'propsLayout'> | null;
    shouldComponentUpdate(nextProps: Props, nextState: State): boolean;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    /**
     * Calculates a pixel value for the container.
     * @return {String} Container height in pixels.
     */
    containerHeight(): string | undefined;
    /**
     * When dragging starts
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    onDragStart: (i: string, x: number, y: number, { e, node }: RGLGridDragEvent) => void;
    /**
     * Each drag movement create a new dragelement and move the element to the dragged location
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    onDrag: (i: string, x: number, y: number, { e, node }: RGLGridDragEvent) => void;
    /**
     * When dragging stops, figure out which position the element is closest to and update its x and y.
     * @param  {String} i Index of the child.
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    onDragStop: (i: string, x: number, y: number, { e, node }: RGLGridDragEvent) => void;
    onLayoutMaybeChanged(newLayout: RGLLayoutItemList, oldLayout: null | RGLLayoutItemList): void;
    onResizeStart: (i: string, w: number, h: number, { e, node }: RGLGridResizeEvent) => void;
    onResize: (i: string, w: number, h: number, { e, node }: RGLGridResizeEvent) => void;
    onResizeStop: (i: string, w: number, h: number, { e, node }: RGLGridResizeEvent) => void;
    /**
     * Create a placeholder object.
     * @return {Element} Placeholder div.
     */
    placeholder(): null | ReactElement<any>;
    /**
     * Given a grid item, set its style attributes & surround in a <Draggable>.
     * @param  {Element} child React element.
     * @return {Element}       Element wrapped in draggable and properly placed.
     */
    processGridItem(child: React.ReactChild, isDroppingItem?: boolean): null | ReactElement<any>;
    onDragOver: React.EventHandler<React.DragEvent>;
    removeDroppingPlaceholder: () => void;
    onDragLeave: React.DragEventHandler;
    onDragEnter: React.EventHandler<React.DragEvent>;
    onDrop: React.EventHandler<React.DragEvent>;
    render(): React.ReactElement<'div'>;
}
export default RGLGrid;
