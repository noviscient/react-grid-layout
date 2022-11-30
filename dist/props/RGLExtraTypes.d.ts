import React, { SyntheticEvent } from 'react';
import { DraggableEvent } from 'react-draggable';
export declare type RGLDragOverEvent = MouseEvent & {
    nativeEvent: {
        layerX: number;
        layerY: number;
    } & MouseEvent;
};
export declare type RGLEventCallback = (layout: RGLLayoutItemList, oldItem?: RGLLayoutItem | null, newItem?: RGLLayoutItem | null, placeholder?: RGLLayoutItem | null, event?: SyntheticEvent | DraggableEvent, element?: HTMLElement) => void;
export declare type RGLLayoutItemList = RGLLayoutItem[];
export declare type RGLLayoutItem = {
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
export declare type RGLCompactType = "horizontal" | "vertical" | undefined;
export declare type RGLPosition = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare type RGLPartialPosition = {
    left: number;
    top: number;
};
export declare type RGLDroppingPosition = {
    left: number;
    top: number;
    e: SyntheticEvent | RGLDragOverEvent;
};
export declare type RGLSize = {
    width: number;
    height: number;
};
export declare type RGLGridDragEvent = {
    e: React.SyntheticEvent | DraggableEvent;
    node: HTMLElement;
    newPosition: RGLPartialPosition;
};
export declare type RGLGridResizeEvent = {
    e: React.SyntheticEvent;
    node: HTMLElement;
    size: RGLSize;
};
export declare type RGLGridItemCallback<Data extends RGLGridDragEvent | RGLGridResizeEvent> = (i: string, w: number, h: number, data: Data) => void;
export declare type RGLReactDraggableCallbackData = {
    node: HTMLElement;
    x?: number;
    y?: number;
    deltaX: number;
    deltaY: number;
    lastX?: number;
    lastY?: number;
};
