import type { ReactElement, ReactNode, SyntheticEvent } from "react";
import React from "react";
import { DraggableEvent } from "react-draggable";
import { PositionParams } from '../utils/calculateUtils';
import type { Position, ReactDraggableCallbackData } from '../RGLExtraTypes';
import { RGLGridItemProps, RGLGridItemState } from '../RGLGridItemPropTypes';
import type { ReactRef } from '../RGLPropTypes';
declare type State = RGLGridItemState;
declare type Props = RGLGridItemProps;
declare type DefaultProps = {
    className: string;
    cancel: string;
    handle: string;
    minH: number;
    minW: number;
    maxH: number;
    maxW: number;
    transformScale: number;
};
/**
 * An individual item within a ReactGridLayout.
 */
export default class GridItem extends React.Component<RGLGridItemProps, State> {
    static propTypes: {
        children: import("prop-types").Requireable<import("prop-types").ReactElementLike>;
        cols: import("prop-types").Validator<number>;
        containerWidth: import("prop-types").Validator<number>;
        rowHeight: import("prop-types").Validator<number>;
        margin: import("prop-types").Validator<any[]>;
        maxRows: import("prop-types").Validator<number>;
        containerPadding: import("prop-types").Validator<any[]>;
        x: import("prop-types").Validator<number>;
        y: import("prop-types").Validator<number>;
        w: import("prop-types").Validator<number>;
        h: import("prop-types").Validator<number>;
        minW: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
        maxW: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
        minH: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
        maxH: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
        i: import("prop-types").Validator<string>;
        resizeHandles: import("prop-types").Requireable<(import("../RGLPropTypes").ResizeHandleAxis | null | undefined)[]>;
        resizeHandle: import("prop-types").Requireable<string | number | boolean | import("prop-types").ReactElementLike | import("prop-types").ReactNodeArray | ((...args: any[]) => any)>;
        onDragStop: import("prop-types").Requireable<(...args: any[]) => any>;
        onDragStart: import("prop-types").Requireable<(...args: any[]) => any>;
        onDrag: import("prop-types").Requireable<(...args: any[]) => any>;
        onResizeStop: import("prop-types").Requireable<(...args: any[]) => any>;
        onResizeStart: import("prop-types").Requireable<(...args: any[]) => any>;
        onResize: import("prop-types").Requireable<(...args: any[]) => any>;
        isDraggable: import("prop-types").Validator<boolean>;
        isResizable: import("prop-types").Validator<boolean>;
        isBounded: import("prop-types").Validator<boolean>;
        static: import("prop-types").Requireable<boolean>;
        useCSSTransforms: import("prop-types").Validator<boolean>;
        transformScale: import("prop-types").Requireable<number>;
        className: import("prop-types").Requireable<string>;
        handle: import("prop-types").Requireable<string>;
        cancel: import("prop-types").Requireable<string>;
        droppingPosition: import("prop-types").Requireable<import("prop-types").InferProps<{
            e: import("prop-types").Validator<object>;
            left: import("prop-types").Validator<number>;
            top: import("prop-types").Validator<number>;
        }>>;
    };
    static defaultProps: DefaultProps;
    state: State;
    elementRef: ReactRef<HTMLDivElement>;
    shouldComponentUpdate(nextProps: RGLGridItemProps, nextState: State): boolean;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    moveDroppingItem(prevProps: Partial<Props>): void;
    getPositionParams(props?: Props): PositionParams;
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
    createStyle(pos: Position): {
        [key: string]: string | undefined;
    };
    /**
     * Mix a Draggable instance into a child.
     * @param  {Element} child    Child element.
     * @return {Element}          Child wrapped in Draggable.
     */
    mixinDraggable(child: ReactElement<any>, isDraggable: boolean): ReactElement<any>;
    /**
     * Mix a Resizable instance into a child.
     * @param  {Element} child    Child element.
     * @param  {Object} position  Position object (pixel values)
     * @return {Element}          Child wrapped in Resizable.
     */
    mixinResizable(child: ReactElement<any>, position: Position, isResizable: boolean): ReactElement<any>;
    onDragStart: (e: DraggableEvent | SyntheticEvent, { node }: {
        node: HTMLElement;
    }) => void;
    /**
     * onDrag event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node, delta and position information
     */
    onDrag: (e: SyntheticEvent | DraggableEvent, { node, deltaX, deltaY }: ReactDraggableCallbackData) => void;
    /**
     * onDragStop event handler
     */
    onDragStop: (e: SyntheticEvent | DraggableEvent, { node }: ReactDraggableCallbackData) => void;
    /**
     * onResizeStop event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node and size information
     */
    onResizeStop: (e: SyntheticEvent, callbackData: {
        node: HTMLElement;
        size: Pick<Position, 'width' | 'height'>;
    }) => void;
    /**
     * onResizeStart event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node and size information
     */
    onResizeStart: (e: SyntheticEvent, callbackData: {
        node: HTMLElement;
        size: Pick<Position, 'width' | 'height'>;
    }) => void;
    /**
     * onResize event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node and size information
     */
    onResize: (e: SyntheticEvent, callbackData: {
        node: HTMLElement;
        size: Pick<Position, 'width' | 'height'>;
    }) => void;
    /**
     * Wrapper around drag events to provide more useful data.
     * All drag events call the function with the given handler name,
     * with the signature (index, x, y).
     *
     * @param  {String} handlerName Handler name to wrap.
     * @return {Function}           Handler function.
     */
    onResizeHandler(e: React.SyntheticEvent, { node, size }: {
        node: HTMLElement;
        size: Pick<Position, 'width' | 'height'>;
    }, handlerName: 'onResizeStart' | 'onResizeStop' | 'onResize'): void;
    render(): ReactNode;
}
export {};
