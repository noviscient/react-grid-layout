import * as React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveLayout, OnLayoutChangeCallback, BreakpointWidthsMap, DefaultBreakpoints } from '../utils/responsiveUtils';
import ReactGridLayout from './RGLGrid';
import { RGLLayoutItemList } from '../props/RGLExtraTypes';
import { RGLGridProps } from '../props/RGLPropTypes';
type State<B extends string = DefaultBreakpoints> = {
    layout: RGLLayoutItemList;
    breakpoint: B;
    cols: number;
    layouts?: ResponsiveLayout<B>;
};
type Props<B extends string = DefaultBreakpoints> = Omit<RGLGridProps, 'cols'> & {
    breakpoint?: B;
    breakpoints: BreakpointWidthsMap<B>;
    cols: BreakpointWidthsMap<B>;
    layouts: ResponsiveLayout<B>;
    width: number;
    margin: {
        [key in B]?: null | [number, number];
    } | null | [number, number];
    containerPadding: {
        [key in B]?: null | [number, number];
    } | null | [number, number];
    onBreakpointChange: (breakpoint: B, cols: number) => void;
    onLayoutChange: OnLayoutChangeCallback;
    onWidthChange: (containerWidth: number, margin: [number, number], cols: number, containerPadding: null | [number, number]) => void;
};
type ResponsiveColsSpec<B extends string = DefaultBreakpoints> = {
    cols: {
        [k in B]?: number | null;
    };
};
type ResponsiveContainerPaddingSpec<B extends string = DefaultBreakpoints> = {
    containerPadding: {
        [k in B]?: [number, number] | null;
    };
};
type DefaultProps<B extends string = DefaultBreakpoints> = Pick<Props, 'allowOverlap' | 'breakpoints' | 'layouts' | 'margin' | 'onBreakpointChange' | 'onLayoutChange' | 'onWidthChange'> & ResponsiveColsSpec<B> & ResponsiveContainerPaddingSpec<B>;
export declare class RGLResponsiveGrid<B extends string = DefaultBreakpoints> extends React.Component<Props<B>, State<B>> {
    static propTypes: {
        breakpoint: PropTypes.Requireable<string>;
        breakpoints: PropTypes.Requireable<object>;
        allowOverlap: PropTypes.Requireable<boolean>;
        cols: PropTypes.Requireable<object>;
        margin: PropTypes.Requireable<object>;
        containerPadding: PropTypes.Requireable<object>;
        layouts<B_1 extends string>(props: Props<B_1>, propName: keyof Props): void;
        width: PropTypes.Validator<number>;
        onBreakpointChange: PropTypes.Requireable<(...args: any[]) => any>;
        onLayoutChange: PropTypes.Requireable<(...args: any[]) => any>;
        onWidthChange: PropTypes.Requireable<(...args: any[]) => any>;
    };
    static defaultProps: DefaultProps<DefaultBreakpoints>;
    state: State<B>;
    generateInitialState(): State<B>;
    static getDerivedStateFromProps<B extends string = DefaultBreakpoints>(nextProps: Props<B>, prevState: State<B>): Partial<State> | null;
    componentDidUpdate(prevProps: Props<B>): void;
    onLayoutChange: (layout: RGLLayoutItemList) => void;
    /**
     * When the width changes work through breakpoints and reset state with the new width & breakpoint.
     * Width changes are necessary to figure out the widget widths.
     */
    onWidthChange(prevProps: Props<B>): void;
    render(): React.ReactElement<typeof ReactGridLayout>;
}
export default RGLResponsiveGrid;
