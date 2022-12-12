import PropTypes from "prop-types";
import React from "react";
import type { ReactNode } from "react";
import type { RGLEventCallback, RGLCompactType, RGLLayoutItemList, RGLLayoutItem } from "./RGLExtraTypes";
export type RGLReactRef<T extends HTMLElement> = {
    current: T | null;
};
export type RGLResizeHandleAxis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";
export type RGLResizeHandle = ReactNode | ((resizeHandleAxis: RGLResizeHandleAxis, ref: RGLReactRef<HTMLElement>) => ReactNode);
export declare const rglResizeHandleAxesType: PropTypes.Requireable<(RGLResizeHandleAxis | null | undefined)[]>;
export declare const rglResizeHandleType: PropTypes.Requireable<NonNullable<PropTypes.ReactNodeLike | ((...args: any[]) => any)>>;
export type RGLGridProps = {
    className: string;
    style: React.CSSProperties;
    width: number;
    autoSize: boolean;
    cols: number;
    draggableCancel: string;
    draggableHandle: string;
    verticalCompact: boolean;
    compactType: RGLCompactType;
    layout: RGLLayoutItemList;
    margin: [number, number];
    containerPadding?: [number, number];
    rowHeight: number;
    maxRows: number;
    isBounded: boolean;
    isDraggable: boolean;
    isResizable: boolean;
    isDroppable: boolean;
    preventCollision: boolean;
    useCSSTransforms: boolean;
    transformScale: number;
    droppingItem: Pick<RGLLayoutItem, 'i' | 'w' | 'h'> & Partial<Omit<RGLLayoutItem, 'i' | 'w' | 'h'>>;
    resizeHandles: RGLResizeHandleAxis[];
    resizeHandle?: RGLResizeHandle;
    allowOverlap: boolean;
    onLayoutChange: (layout: RGLLayoutItemList) => void;
    onDrag: RGLEventCallback;
    onDragStart: RGLEventCallback;
    onDragStop: RGLEventCallback;
    onResize: RGLEventCallback;
    onResizeStart: RGLEventCallback;
    onResizeStop: RGLEventCallback;
    onDropDragOver?: (e: React.DragEvent) => (Partial<RGLLayoutItem> | false);
    onDrop: (layout: RGLLayoutItemList, item: RGLLayoutItem | undefined, e: React.DragEvent) => void;
    children: React.ReactChild[];
    innerRef?: React.RefObject<HTMLDivElement>;
};
export type RGLDefaultProps = Omit<RGLGridProps, 'children' | 'width'>;
declare const RGLPropTypes: {
    className: PropTypes.Requireable<string>;
    style: PropTypes.Requireable<object>;
    width: PropTypes.Requireable<number>;
    autoSize: PropTypes.Requireable<boolean>;
    cols: PropTypes.Requireable<number>;
    draggableCancel: PropTypes.Requireable<string>;
    draggableHandle: PropTypes.Requireable<string>;
    verticalCompact: (props: RGLGridProps) => void;
    compactType: PropTypes.Requireable<"horizontal" | "vertical">;
    layout: (props: RGLGridProps) => void;
    margin: PropTypes.Requireable<(number | null | undefined)[]>;
    containerPadding: PropTypes.Requireable<(number | null | undefined)[]>;
    rowHeight: PropTypes.Requireable<number>;
    maxRows: PropTypes.Requireable<number>;
    isBounded: PropTypes.Requireable<boolean>;
    isDraggable: PropTypes.Requireable<boolean>;
    isResizable: PropTypes.Requireable<boolean>;
    allowOverlap: PropTypes.Requireable<boolean>;
    preventCollision: PropTypes.Requireable<boolean>;
    useCSSTransforms: PropTypes.Requireable<boolean>;
    transformScale: PropTypes.Requireable<number>;
    isDroppable: PropTypes.Requireable<boolean>;
    resizeHandles: PropTypes.Requireable<(RGLResizeHandleAxis | null | undefined)[]>;
    resizeHandle: PropTypes.Requireable<NonNullable<PropTypes.ReactNodeLike | ((...args: any[]) => any)>>;
    onLayoutChange: PropTypes.Requireable<(...args: any[]) => any>;
    onDragStart: PropTypes.Requireable<(...args: any[]) => any>;
    onDrag: PropTypes.Requireable<(...args: any[]) => any>;
    onDragStop: PropTypes.Requireable<(...args: any[]) => any>;
    onResizeStart: PropTypes.Requireable<(...args: any[]) => any>;
    onResize: PropTypes.Requireable<(...args: any[]) => any>;
    onResizeStop: PropTypes.Requireable<(...args: any[]) => any>;
    onDrop: PropTypes.Requireable<(...args: any[]) => any>;
    droppingItem: PropTypes.Requireable<PropTypes.InferProps<{
        i: PropTypes.Validator<string>;
        w: PropTypes.Validator<number>;
        h: PropTypes.Validator<number>;
    }>>;
    children: (props: any, propName: any) => void;
    innerRef: PropTypes.Requireable<any>;
};
export default RGLPropTypes;
