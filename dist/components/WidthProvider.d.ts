import * as React from "react";
import PropTypes from "prop-types";
import type { RGLGridProps } from "../RGLPropTypes";
declare type WPDefaultProps = {
    measureBeforeMount: boolean;
};
declare type WPState = {
    width: number;
};
declare type ComposedProps<Config> = Config & {
    measureBeforeMount?: boolean;
    className?: string;
    style?: Object;
    width?: number;
};
export default function WidthProvideRGL<Config>(ComposedComponent: React.ComponentType<ComposedProps<RGLGridProps>>): {
    new (props: ComposedProps<RGLGridProps> | Readonly<ComposedProps<RGLGridProps>>): {
        state: WPState;
        elementRef: React.RefObject<HTMLDivElement>;
        mounted: boolean;
        componentDidMount(): void;
        componentWillUnmount(): void;
        onWindowResize: () => void;
        render(): JSX.Element;
        context: any;
        setState<K extends "width">(state: WPState | ((prevState: Readonly<WPState>, props: Readonly<ComposedProps<RGLGridProps>>) => WPState | Pick<WPState, K> | null) | Pick<WPState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<ComposedProps<RGLGridProps>> & Readonly<{
            children?: React.ReactNode;
        }>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        shouldComponentUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): boolean;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<ComposedProps<RGLGridProps>>, prevState: Readonly<WPState>): any;
        componentDidUpdate?(prevProps: Readonly<ComposedProps<RGLGridProps>>, prevState: Readonly<WPState>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): void;
    };
    new (props: ComposedProps<RGLGridProps>, context: any): {
        state: WPState;
        elementRef: React.RefObject<HTMLDivElement>;
        mounted: boolean;
        componentDidMount(): void;
        componentWillUnmount(): void;
        onWindowResize: () => void;
        render(): JSX.Element;
        context: any;
        setState<K extends "width">(state: WPState | ((prevState: Readonly<WPState>, props: Readonly<ComposedProps<RGLGridProps>>) => WPState | Pick<WPState, K> | null) | Pick<WPState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<ComposedProps<RGLGridProps>> & Readonly<{
            children?: React.ReactNode;
        }>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        shouldComponentUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): boolean;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<ComposedProps<RGLGridProps>>, prevState: Readonly<WPState>): any;
        componentDidUpdate?(prevProps: Readonly<ComposedProps<RGLGridProps>>, prevState: Readonly<WPState>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<ComposedProps<RGLGridProps>>, nextState: Readonly<WPState>, nextContext: any): void;
    };
    defaultProps: WPDefaultProps;
    propTypes: {
        measureBeforeMount: PropTypes.Requireable<boolean>;
    };
    contextType?: React.Context<any> | undefined;
};
export {};
