import PropTypes from "prop-types";
import { ReactElement } from 'react';
import { RGLDroppingPosition, RGLGridDragEvent, RGLGridItemCallback, RGLGridResizeEvent } from './RGLExtraTypes';
import { RGLResizeHandle, RGLResizeHandleAxis } from './RGLPropTypes';
declare const RGLGridItemPropTypes: {
    children: PropTypes.Requireable<PropTypes.ReactElementLike>;
    cols: PropTypes.Validator<number>;
    containerWidth: PropTypes.Validator<number>;
    rowHeight: PropTypes.Validator<number>;
    margin: PropTypes.Validator<any[]>;
    maxRows: PropTypes.Validator<number>;
    containerPadding: PropTypes.Validator<any[]>;
    x: PropTypes.Validator<number>;
    y: PropTypes.Validator<number>;
    w: PropTypes.Validator<number>;
    h: PropTypes.Validator<number>;
    minW: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
    maxW: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
    minH: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
    maxH: (props: RGLGridItemProps, propName: keyof RGLGridItemProps) => Error | undefined;
    i: PropTypes.Validator<string>;
    resizeHandles: PropTypes.Requireable<(RGLResizeHandleAxis | null | undefined)[]>;
    resizeHandle: PropTypes.Requireable<string | number | boolean | PropTypes.ReactElementLike | PropTypes.ReactNodeArray | ((...args: any[]) => any)>;
    onDragStop: PropTypes.Requireable<(...args: any[]) => any>;
    onDragStart: PropTypes.Requireable<(...args: any[]) => any>;
    onDrag: PropTypes.Requireable<(...args: any[]) => any>;
    onResizeStop: PropTypes.Requireable<(...args: any[]) => any>;
    onResizeStart: PropTypes.Requireable<(...args: any[]) => any>;
    onResize: PropTypes.Requireable<(...args: any[]) => any>;
    isDraggable: PropTypes.Validator<boolean>;
    isResizable: PropTypes.Validator<boolean>;
    isBounded: PropTypes.Validator<boolean>;
    static: PropTypes.Requireable<boolean>;
    useCSSTransforms: PropTypes.Validator<boolean>;
    transformScale: PropTypes.Requireable<number>;
    className: PropTypes.Requireable<string>;
    handle: PropTypes.Requireable<string>;
    cancel: PropTypes.Requireable<string>;
    droppingPosition: PropTypes.Requireable<PropTypes.InferProps<{
        e: PropTypes.Validator<object>;
        left: PropTypes.Validator<number>;
        top: PropTypes.Validator<number>;
    }>>;
};
export default RGLGridItemPropTypes;
export declare type RGLGridItemProps = {
    children: ReactElement<any>;
    cols: number;
    containerWidth: number;
    margin: [number, number];
    containerPadding: [number, number];
    rowHeight: number;
    maxRows: number;
    isDraggable: boolean;
    isResizable: boolean;
    isBounded: boolean;
    static?: boolean;
    useCSSTransforms?: boolean;
    usePercentages?: boolean;
    transformScale: number;
    droppingPosition?: RGLDroppingPosition;
    className: string;
    style?: Object;
    cancel: string;
    handle: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW: number;
    maxW: number;
    minH: number;
    maxH: number;
    i: string;
    resizeHandles?: RGLResizeHandleAxis[];
    resizeHandle?: RGLResizeHandle;
    onDrag?: RGLGridItemCallback<RGLGridDragEvent>;
    onDragStart?: RGLGridItemCallback<RGLGridDragEvent>;
    onDragStop?: RGLGridItemCallback<RGLGridDragEvent>;
    onResize?: RGLGridItemCallback<RGLGridResizeEvent>;
    onResizeStart?: RGLGridItemCallback<RGLGridResizeEvent>;
    onResizeStop?: RGLGridItemCallback<RGLGridResizeEvent>;
};
export declare type RGLGridItemState = {
    resizing?: {
        width: number;
        height: number;
    } | null;
    dragging?: {
        top: number;
        left: number;
    } | null;
    className?: string;
};
