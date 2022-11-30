import React, { SyntheticEvent } from 'react';
import { DraggableEvent } from 'react-draggable';
export declare type DragOverEvent = MouseEvent & {
    nativeEvent: {
        layerX: number;
        layerY: number;
    } & MouseEvent;
};
export declare type EventCallback = (layout: Layout, oldItem?: LayoutItem | null, newItem?: LayoutItem | null, placeholder?: LayoutItem | null, event?: SyntheticEvent | DraggableEvent, element?: HTMLElement) => void;
export declare type Layout = LayoutItem[];
export declare type LayoutItem = {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
    isBounded?: boolean;
};
export declare type CompactType = "horizontal" | "vertical" | undefined;
export declare type Position = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare type PartialPosition = {
    left: number;
    top: number;
};
export declare type DroppingPosition = {
    left: number;
    top: number;
    e: SyntheticEvent | DragOverEvent;
};
export declare type Size = {
    width: number;
    height: number;
};
export declare type GridDragEvent = {
    e: React.SyntheticEvent | DraggableEvent;
    node: HTMLElement;
    newPosition: PartialPosition;
};
export declare type GridResizeEvent = {
    e: React.SyntheticEvent;
    node: HTMLElement;
    size: Size;
};
export declare type GridItemCallback<Data extends GridDragEvent | GridResizeEvent> = (i: string, w: number, h: number, data: Data) => void;
export declare type ReactDraggableCallbackData = {
    node: HTMLElement;
    x?: number;
    y?: number;
    deltaX: number;
    deltaY: number;
    lastX?: number;
    lastY?: number;
};
