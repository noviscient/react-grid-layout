// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import rglCoreUtils from '../utils/coreUtils';

const {
	cloneLayout,
	synchronizeLayoutWithChildren,
	validateLayout,
	noop,
} = rglCoreUtils
import {
	getBreakpointFromWidth,
	getColsFromBreakpoint,
	findOrGenerateResponsiveLayout,
	ResponsiveLayout,
	OnLayoutChangeCallback,
	BreakpointWidthsMap,
	DefaultBreakpoints
} from '../utils/responsiveUtils';
import ReactGridLayout from './RGLGrid';
import { RGLCompactType, RGLLayoutItemList } from '../props/RGLExtraTypes'
import { RGLGridProps } from '../props/RGLPropTypes'

const type = (obj: any) => Object.prototype.toString.call(obj);
const fallbackCompactType: RGLCompactType = 'vertical'

/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */
function getIndentationValue(
	param: { [key: string]: [number, number] | null } | [number, number] | null,
	breakpoint: string
): [number, number] | null {
	// $FlowIgnore TODO fix this typedef
	if (param == null) return null;
	// $FlowIgnore TODO fix this typedef
	return Array.isArray(param) ? (param as [number, number]) : param[breakpoint];
}

type State<B extends string = DefaultBreakpoints> = {
	layout: RGLLayoutItemList,
	breakpoint: B,
	cols: number,
	layouts?: ResponsiveLayout<B>
};

type Props<B extends string = DefaultBreakpoints> = Omit<RGLGridProps, 'cols'> & {
	// Responsive config
	breakpoint?: B,
	breakpoints: BreakpointWidthsMap<B>,
	cols: BreakpointWidthsMap<B>,
	layouts: ResponsiveLayout<B>,
	width: number,
	margin: { [key in B]?: null | [number, number] } | null | [number, number],
	/* prettier-ignore */
	containerPadding: { [key in B]?: null | [number, number] } | null | [number, number],

	// Callbacks
	onBreakpointChange: (breakpoint: B, cols: number) => void,
	onLayoutChange: OnLayoutChangeCallback,
	onWidthChange: (
		containerWidth: number,
		margin: [number, number],
		cols: number,
		containerPadding: null | [number, number]
	) => void
};

type ResponsiveColsSpec<B extends string = DefaultBreakpoints> = { cols: { [k in B]?: number | null } }
type ResponsiveContainerPaddingSpec<B extends string = DefaultBreakpoints> = { containerPadding: { [k in B]?: [number, number] | null } }
type DefaultProps<B extends string = DefaultBreakpoints> = Pick<Props, 'allowOverlap' | 'breakpoints' | 'layouts' | 'margin' | 'onBreakpointChange' | 'onLayoutChange' | 'onWidthChange'> & ResponsiveColsSpec<B> & ResponsiveContainerPaddingSpec<B>

export class RGLResponsiveGrid<B extends string = DefaultBreakpoints> extends React.Component<
	// Omit<Props, 'cols'> & ResponsiveColsSpec,
	Props<B>,
	State<B>
> {
	// This should only include propTypes needed in this code; RGL itself
	// will do validation of the rest props passed to it.
	static propTypes = {
		//
		// Basic props
		//

		// Optional, but if you are managing width yourself you may want to set the breakpoint
		// yourself as well.
		breakpoint: PropTypes.string,

		// {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
		breakpoints: PropTypes.object,

		allowOverlap: PropTypes.bool,

		// # of cols. This is a breakpoint -> cols map
		cols: PropTypes.object,

		// # of margin. This is a breakpoint -> margin map
		// e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
		// Margin between items [x, y] in px
		// e.g. [10, 10]
		margin: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

		// # of containerPadding. This is a breakpoint -> containerPadding map
		// e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
		// Padding inside the container [x, y] in px
		// e.g. [10, 10]
		containerPadding: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

		// layouts is an object mapping breakpoints to layouts.
		// e.g. {lg: Layout, md: Layout, ...}
		layouts<B extends string>(props: Props<B>, propName: keyof Props) {
			if (type(props[propName]) !== '[object Object]') {
				throw new Error(
					'Layout property must be an object. Received: ' +
						type(props[propName])
				);
			}
			Object.keys(props[propName] as object).forEach(key => {
				if (!(key in props.breakpoints)) {
					throw new Error(
						'Each key in layouts must align with a key in breakpoints.'
					);
				}
				validateLayout(props.layouts[key as B]!, 'layouts.' + key);
			});
		},

		// The width of this component.
		// Required in this propTypes stanza because generateInitialState() will fail without it.
		width: PropTypes.number.isRequired,

		//
		// Callbacks
		//

		// Calls back with breakpoint and new # cols
		onBreakpointChange: PropTypes.func,

		// Callback so you can save the layout.
		// Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
		onLayoutChange: PropTypes.func,

		// Calls back with (containerWidth, margin, cols, containerPadding)
		onWidthChange: PropTypes.func
	};

	static defaultProps: DefaultProps<DefaultBreakpoints> = {
		breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
		cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
		containerPadding: { lg: null, md: null, sm: null, xs: null, xxs: null },
		layouts: {} as ResponsiveLayout<string>,
		margin: [10, 10],
		allowOverlap: false,
		onBreakpointChange: noop,
		onLayoutChange: noop,
		onWidthChange: noop
	};

	state: State<B> = this.generateInitialState();

	generateInitialState(): State<B> {
		const { width, breakpoints, layouts, cols } = this.props;
		const breakpoint = getBreakpointFromWidth<B>(breakpoints, width);
		const colNo = getColsFromBreakpoint<B>(breakpoint, cols);
		// verticalCompact compatibility, now deprecated
		const compactType =
			this.props.verticalCompact === false ? null : this.props.compactType;
		// Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
		// for this layout.
		const initialLayout = findOrGenerateResponsiveLayout<B>(
			layouts,
			breakpoints,
			breakpoint,
			breakpoint,
			colNo,
			compactType ?? fallbackCompactType
		);

		return {
			layout: initialLayout,
			breakpoint: breakpoint,
			cols: colNo
		};
	}

	static getDerivedStateFromProps<B extends string = DefaultBreakpoints>(
		nextProps: Props<B>,
		prevState: State<B>
	): Partial<State> | null {
		if (!isEqual(nextProps.layouts, prevState.layouts)) {
			// Allow parent to set layouts directly.
			const { breakpoint, cols } = prevState;

			// Since we're setting an entirely new layout object, we must generate a new responsive layout
			// if one does not exist.
			const newLayout = findOrGenerateResponsiveLayout(
				nextProps.layouts,
				nextProps.breakpoints,
				breakpoint,
				breakpoint,
				cols,
				nextProps.compactType
			);
			return { layout: newLayout, layouts: nextProps.layouts };
		}

		return null;
	}

	componentDidUpdate(prevProps: Props<B>) {
		// Allow parent to set width or breakpoint directly.
		if (
			this.props.width != prevProps.width ||
			this.props.breakpoint !== prevProps.breakpoint ||
			!isEqual(this.props.breakpoints, prevProps.breakpoints) ||
			!isEqual(this.props.cols, prevProps.cols)
		) {
			this.onWidthChange(prevProps);
		}
	}

	// wrap layouts so we do not need to pass layouts to child
	onLayoutChange = (layout: RGLLayoutItemList) => {
		this.props.onLayoutChange(layout, {
			...this.props.layouts,
			[this.state.breakpoint]: layout
		});
	};

	/**
	 * When the width changes work through breakpoints and reset state with the new width & breakpoint.
	 * Width changes are necessary to figure out the widget widths.
	 */
	onWidthChange(prevProps: Props<B>) {
		const { breakpoints, cols, layouts, compactType } = this.props;
		const newBreakpoint =
			this.props.breakpoint ||
			getBreakpointFromWidth(this.props.breakpoints, this.props.width);

		const lastBreakpoint = this.state.breakpoint;
		const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
		const newLayouts = { ...layouts };

		// Breakpoint change
		if (
			lastBreakpoint !== newBreakpoint ||
			prevProps.breakpoints !== breakpoints ||
			prevProps.cols !== cols
		) {
			// Preserve the current layout if the current breakpoint is not present in the next layouts.
			if (!(lastBreakpoint in newLayouts))
				newLayouts[lastBreakpoint] = cloneLayout(this.state.layout);

			// Find or generate a new layout.
			let layout = findOrGenerateResponsiveLayout(
				newLayouts,
				breakpoints,
				newBreakpoint,
				lastBreakpoint,
				newCols,
				compactType
			);

			// This adds missing items.
			layout = synchronizeLayoutWithChildren(
				layout,
				this.props.children,
				newCols,
				compactType,
				this.props.allowOverlap
			);

			// Store the new layout.
			newLayouts[newBreakpoint] = layout;

			// callbacks
			this.props.onLayoutChange(layout); // edited
			this.props.onBreakpointChange(newBreakpoint, newCols);

			this.setState({
				breakpoint: newBreakpoint,
				layout: layout,
				cols: newCols
			});
		}

		const margin = getIndentationValue(this.props.margin, newBreakpoint);
		const containerPadding = getIndentationValue(
			this.props.containerPadding,
			newBreakpoint
		);

		//call onWidthChange on every change of width, not only on breakpoint changes
		this.props.onWidthChange(
			this.props.width,
			margin!,
			newCols,
			containerPadding
		);
	}

	render(): React.ReactElement<typeof ReactGridLayout> {
		/* eslint-disable no-unused-vars */
		const {
			breakpoint,
			breakpoints,
			cols,
			layouts,
			margin,
			containerPadding,
			onBreakpointChange,
			onLayoutChange,
			onWidthChange,
			...other
		} = this.props;
		/* eslint-enable no-unused-vars */

		return (
			<ReactGridLayout
				{...other}
				// $FlowIgnore should allow nullable here due to DefaultProps
				margin={getIndentationValue(margin, this.state.breakpoint)!}
				containerPadding={getIndentationValue(
					containerPadding,
					this.state.breakpoint
				)!}
				onLayoutChange={this.onLayoutChange}
				layout={this.state.layout}
				cols={this.state.cols}
			/>
		);
	}
}
export default RGLResponsiveGrid