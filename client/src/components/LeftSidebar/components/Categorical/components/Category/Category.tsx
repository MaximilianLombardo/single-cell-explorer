import { SKELETON } from "@blueprintjs/core/lib/esnext/common/classes";
import React, { useRef, useEffect, useCallback, useState } from "react";
import { connect, shallowEqual } from "react-redux";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Button, Classes, Position, Tooltip } from "@blueprintjs/core";
import Async, { AsyncProps } from "react-async";
import memoize from "memoize-one";
import Truncate from "common/components/Truncate/Truncate";
import { createCategorySummaryFromDfCol } from "util/stateManager/controlsHelpers";
import {
  createColorTable,
  createColorQuery,
  ColorTable,
} from "util/stateManager/colorHelpers";
import actions from "actions";
import { Dataframe } from "util/dataframe";
import { track } from "analytics";
import { EVENTS } from "analytics/events";
import { RootState, AppDispatch } from "reducers";
import BrushableHistogram from "common/components/BrushableHistogram/BrushableHistogram";
import { PredictionDeclaration } from "reducers/predictions";
import * as globals from "~/globals";
import { CategoryCrossfilterContext } from "../../categoryContext";
import CategoryValue from "./components/CategoryValue/CategoryValue";
import {
  thunkTrackColorByCategoryExpand,
  thunkTrackColorByCategoryHighlightHistogram,
} from "./analytics";
import AddLabelDialog from "../AddLabelDialog";
import AnnoMenuCategory from "./components/AnnoMenuCategory/AnnoMenuCategory";
import AnnoDialogEditCategoryName from "./components/AnnoDialogEditCategoryName/AnnoDialogEditCategoryName";

const LABEL_WIDTH = globals.leftSidebarWidth - 100;

type CategoryAsyncProps = {
  categoryData: Dataframe;
  categorySummary: ReturnType<typeof createCategorySummaryFromDfCol>;
  colorData: Dataframe | null;
  colorTable: ColorTable;
  isColorAccessor: boolean;
  handleCategoryToggleAllClick: () => void;
  /* per-label mean of the declared confidence column, when this category is a prediction */
  labelConfidence: Map<string, number> | null;
} & StateProps["colors"];

interface PureCategoryProps {
  metadataField: string;
  isExpanded: boolean;
  onExpansionChange: (metadataField: string) => void;
  categoryType: string;
}

interface StateProps {
  colors: RootState["colors"];
  categoricalSelection: RootState["categoricalSelection"][string];
  annoMatrix: RootState["annoMatrix"];
  schema: RootState["annoMatrix"]["schema"];
  crossfilter: RootState["obsCrossfilter"];
  genesets: RootState["genesets"]["genesets"];
  isCellGuideCxg: boolean;
  annotations: RootState["annotations"];
  prediction: PredictionDeclaration | null;
}

interface DispatchProps {
  dispatch: AppDispatch;
}

type CategoryProps = PureCategoryProps & StateProps & DispatchProps;

const mapStateToProps = (
  state: RootState,
  ownProps: PureCategoryProps
): StateProps => {
  const schema =
    state.obsCrossfilter?.annoMatrix?.schema ?? state.annoMatrix?.schema;
  const { metadataField } = ownProps;
  const categoricalSelection =
    state.categoricalSelection?.[metadataField] ?? new Map();
  return {
    colors: state.colors,
    categoricalSelection,
    annoMatrix: state.obsCrossfilter?.annoMatrix ?? state.annoMatrix,
    schema,
    crossfilter: state.obsCrossfilter,
    genesets: state.genesets.genesets,
    isCellGuideCxg: state.controls.isCellGuideCxg,
    annotations: state.annotations,
    prediction: state.predictions.byColumn[metadataField] ?? null,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch): DispatchProps => ({
  dispatch,
});

class Category extends React.PureComponent<CategoryProps> {
  static getSelectionState(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
    categoricalSelection: any,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
    categorySummary: any
  ): string {
    // total number of categories in this dimension
    const totalCatCount = categorySummary.numCategoryValues;
    // number of selected options in this category
    const selectedCatCount = categorySummary.categoryValues.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
      (res: any, label: any) =>
        categoricalSelection.get(label) ?? true ? res + 1 : res,
      0
    );
    return selectedCatCount === totalCatCount
      ? "all"
      : selectedCatCount === 0
      ? "none"
      : "some";
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  static watchAsync(props: any, prevProps: any) {
    return !shallowEqual(props.watchProps, prevProps.watchProps);
  }

  createCategorySummaryFromDfCol = memoize(createCategorySummaryFromDfCol);

  handleAddLabel = (metadataField: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: "annotation: activate add new label mode",
      data: metadataField,
    });
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  getSelectionState(categorySummary: any) {
    const { categoricalSelection } = this.props;
    return Category.getSelectionState(categoricalSelection, categorySummary);
  }

  handleColorChange = (currentIsColorAccessor: boolean) => {
    const { dispatch, metadataField, categoryType } = this.props;

    /**
     * (thuang): If we're going from `currentIsColorAccessor` being `false` to `true`,
     * we should track the event!
     */
    if (!currentIsColorAccessor) {
      track(EVENTS.EXPLORER_COLORBY_CATEGORIES_BUTTON_CLICKED, {
        type: categoryType,
        category: metadataField,
      });
    }

    /**
     * (thuang): If `currentIsColorAccessor` is currently `true`, we're turning off
     * color by category, thus passing `!currentIsColorAccessor` as arg `isColorByCategory`
     */
    dispatch(thunkTrackColorByCategoryExpand(!currentIsColorAccessor));
    dispatch(
      thunkTrackColorByCategoryHighlightHistogram(!currentIsColorAccessor)
    );

    dispatch({
      type: "color by categorical metadata",
      colorAccessor: metadataField,
    });
  };

  handleCategoryClick = () => {
    const { annotations, metadataField, onExpansionChange } = this.props;
    const editingCategory =
      annotations.isEditingCategoryName &&
      annotations.categoryBeingEdited === metadataField;
    if (!editingCategory) {
      onExpansionChange(metadataField);
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  handleCategoryKeyPress = (e: any) => {
    if (e.key === "Enter") {
      this.handleCategoryClick();
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  handleToggleAllClick = (categorySummary: any) => {
    track(EVENTS.EXPLORER_CATEGORY_SELECT_BUTTON_CLICKED);

    const isChecked = this.getSelectionState(categorySummary);
    if (isChecked === "all") {
      this.toggleNone(categorySummary);
    } else {
      this.toggleAll(categorySummary);
    }
  };

  fetchAsyncProps = async (
    props: AsyncProps<CategoryAsyncProps>
  ): Promise<CategoryAsyncProps> => {
    const { annoMatrix, metadataField, colors } = props.watchProps;

    const [categoryData, categorySummary, colorData] = await this.fetchData(
      annoMatrix,
      metadataField,
      colors
    );

    const labelConfidence = await this.fetchLabelConfidence(
      annoMatrix,
      categoryData
    );

    return {
      categoryData,
      categorySummary,
      colorData,
      labelConfidence,
      ...this.updateColorTable(colorData),
      handleCategoryToggleAllClick: () =>
        this.handleToggleAllClick(categorySummary),
    };
  };

  /*
  When this category is a declared prediction with a confidence column,
  compute the mean confidence per label for the roster bars.
  */
  fetchLabelConfidence = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- annoMatrix is untyped in this file
    annoMatrix: any,
    categoryData: Dataframe
  ): Promise<Map<string, number> | null> => {
    const { prediction } = this.props;
    if (!prediction?.confidence) return null;
    const { schema } = annoMatrix;
    if (!schema.annotations.obsByName[prediction.confidence]) return null;

    const confData: Dataframe = await annoMatrix.fetch(
      "obs",
      prediction.confidence
    );
    const confArr = confData.icol(0).asArray() as number[];
    const catCol = categoryData.icol(0);

    const sums = new Map<string, { sum: number; count: number }>();
    for (let i = 0, len = confArr.length; i < len; i += 1) {
      const label = String(catCol.getLabelValue(i));
      const v = confArr[i];
      if (Number.isFinite(v)) {
        const acc = sums.get(label);
        if (acc) {
          acc.sum += v;
          acc.count += 1;
        } else {
          sums.set(label, { sum: v, count: 1 });
        }
      }
    }
    const means = new Map<string, number>();
    sums.forEach((acc, label) => {
      if (acc.count > 0) means.set(label, acc.sum / acc.count);
    });
    return means;
  };

  async fetchData(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
    annoMatrix: any,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
    metadataField: any,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
    colors: any
  ): Promise<
    [
      Dataframe,
      ReturnType<typeof createCategorySummaryFromDfCol>,
      Dataframe | null,
      string | null
    ]
  > {
    /*
    fetch our data and the color-by data if appropriate, and then build a summary
    of our category and a color table for the color-by annotation.
    */
    const { schema } = annoMatrix;
    const { colorAccessor, colorMode } = colors;
    const { genesets } = this.props;
    let colorDataPromise: Promise<Dataframe | null> = Promise.resolve(null);
    if (colorAccessor) {
      const query = createColorQuery(
        colorMode,
        colorAccessor,
        schema,
        genesets
      );
      if (query)
        colorDataPromise = annoMatrix.fetch(...query, globals.numBinsObsX);
    }
    const [categoryData, colorData]: [Dataframe, Dataframe | null] =
      await Promise.all([
        annoMatrix.fetch("obs", metadataField),
        colorDataPromise,
      ]);

    // our data
    const column = categoryData.icol(0);
    const colSchema = schema.annotations.obsByName[metadataField];
    const categorySummary = this.createCategorySummaryFromDfCol(
      column,
      colSchema
    );
    return [categoryData, categorySummary, colorData, colorMode];
  }

  updateColorTable(colorData: Dataframe | null): {
    isColorAccessor: boolean;
    colorTable: ColorTable;
  } & StateProps["colors"] {
    // color table, which may be null
    const { schema, colors, metadataField } = this.props;
    const { colorAccessor, userColors, colorMode } = colors;
    return {
      isColorAccessor:
        colorAccessor === metadataField &&
        colorMode === "color by categorical metadata",
      colorAccessor,
      colorMode,
      colorTable: createColorTable({
        colorMode,
        colorByAccessor: colorAccessor,
        colorByData: colorData,
        schema,
        userColors,
        isSpatial: false,
      }),
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  toggleNone(categorySummary: any) {
    const { dispatch, metadataField } = this.props;
    dispatch(
      actions.selectCategoricalAllMetadataAction(
        "categorical metadata filter none of these",
        metadataField,
        categorySummary.allCategoryValues,
        false
      )
    ).catch(() => {
      /* ignore errors */
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- - FIXME: disabled temporarily on migrate to TS.
  toggleAll(categorySummary: any) {
    const { dispatch, metadataField } = this.props;
    dispatch(
      actions.selectCategoricalAllMetadataAction(
        "categorical metadata filter all of these",
        metadataField,
        categorySummary.allCategoryValues,
        true
      )
    ).catch(() => {
      /* ignore errors */
    });
  }

  render(): JSX.Element {
    const {
      metadataField,
      isExpanded,
      categoricalSelection,
      crossfilter,
      colors,
      annoMatrix,
      isCellGuideCxg,
      prediction,
    } = this.props;

    const checkboxID = `category-select-${metadataField}`;

    return (
      <CategoryCrossfilterContext.Provider value={crossfilter}>
        <Async
          watchFn={Category.watchAsync}
          promiseFn={this.fetchAsyncProps}
          watchProps={{
            metadataField,
            annoMatrix,
            categoricalSelection,
            colors,
            prediction,
          }}
        >
          <Async.Pending initial>
            <StillLoading />
          </Async.Pending>
          <Async.Rejected>
            {(error) => (
              <ErrorLoading metadataField={metadataField} error={error} />
            )}
          </Async.Rejected>
          <Async.Fulfilled persist>
            {(asyncProps: CategoryAsyncProps) => {
              const {
                /**
                 * (thuang): `colorAccessor` needs to be accessed from `asyncProps` instead
                 * of `this.props.colors` to prevent the bug below
                 * https://github.com/chanzuckerberg/single-cell-explorer/issues/1022
                 */
                colorAccessor,
                colorTable,
                colorData,
                categoryData,
                categorySummary,
                isColorAccessor,
                handleCategoryToggleAllClick,
                colorMode,
                labelConfidence,
              } = asyncProps;
              const selectionState = this.getSelectionState(categorySummary);
              const { schema } = this.props;
              const isUserAnnotation =
                schema?.annotations.obsByName[metadataField]?.writable ?? false;
              return (
                <CategoryRender
                  metadataField={metadataField}
                  checkboxID={checkboxID}
                  isExpanded={isExpanded}
                  isColorAccessor={isColorAccessor}
                  selectionState={selectionState}
                  categoryData={categoryData}
                  categorySummary={categorySummary}
                  colorAccessor={colorAccessor}
                  colorData={colorData}
                  colorTable={colorTable}
                  onColorChangeClick={this.handleColorChange}
                  onCategoryToggleAllClick={handleCategoryToggleAllClick}
                  onCategoryMenuClick={this.handleCategoryClick}
                  onCategoryMenuKeyPress={this.handleCategoryKeyPress}
                  colorMode={colorMode || ""}
                  isCellGuideCxg={isCellGuideCxg}
                  isUserAnnotation={isUserAnnotation}
                  prediction={prediction}
                  labelConfidence={labelConfidence}
                />
              );
            }}
          </Async.Fulfilled>
        </Async>
      </CategoryCrossfilterContext.Provider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Category);

/**
 * We are still loading this category, so render a "busy" signal.
 */
export const StillLoading = (): JSX.Element => (
  <div style={{ paddingBottom: 2.7 }}>
    <div className={SKELETON} style={{ height: 30 }} />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
const ErrorLoading = ({ metadataField, error }: any) => {
  console.error(error); // log error to console as it is unexpected.
  return (
    <div style={{ marginBottom: 10, marginTop: 4 }}>
      <span
        style={{
          cursor: "pointer",
          display: "inline-block",
          width: LABEL_WIDTH,
          fontStyle: "italic",
        }}
      >
        {`Failure loading ${metadataField}`}
      </span>
    </div>
  );
};

interface CategoryHeaderProps {
  metadataField: string;
  checkboxID: string;
  isColorAccessor: boolean;
  isExpanded: boolean;
  selectionState: string;
  onColorChangeClick: (isColorAccessor: boolean) => void;
  onCategoryMenuClick: () => void;
  onCategoryMenuKeyPress: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
  onCategoryToggleAllClick: () => void;
  isUserAnnotation: boolean;
  isPrediction: boolean;
}

const CategoryHeader = React.memo(
  ({
    metadataField,
    checkboxID,
    isColorAccessor,
    isExpanded,
    selectionState,
    onColorChangeClick,
    onCategoryMenuClick,
    onCategoryMenuKeyPress,
    onCategoryToggleAllClick,
    isUserAnnotation,
    isPrediction,
  }: CategoryHeaderProps) => {
    /*
    Render category name and controls (eg, color-by button).
    */
    const checkboxRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = selectionState === "some";
      }
    }, [selectionState]);

    const handleColorChangeClick = useCallback(() => {
      onColorChangeClick(isColorAccessor);
    }, [onColorChangeClick, isColorAccessor]);

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- TODO: Need to separate expand and checkbox label */}
          <label
            className={`${Classes.CONTROL} ${Classes.CHECKBOX} ignore-capture`}
            htmlFor={checkboxID}
          >
            <input
              id={checkboxID}
              data-testid={`${metadataField}:category-select`}
              onChange={onCategoryToggleAllClick}
              ref={checkboxRef}
              checked={selectionState === "all"}
              type="checkbox"
            />
            <span className={Classes.CONTROL_INDICATOR} />
          </label>
          <span
            role="menuitem"
            tabIndex={0}
            data-testid={`${metadataField}:category-expand`}
            onKeyPress={onCategoryMenuKeyPress}
            style={{
              cursor: "pointer",
            }}
            onClick={onCategoryMenuClick}
          >
            <Truncate>
              <span
                style={{
                  fontFamily: globals.fontBody,
                  fontSize: 11,
                  fontWeight: 650,
                  maxWidth: LABEL_WIDTH,
                }}
                data-testid={`${metadataField}:category-label`}
                tabIndex={-1}
              >
                {metadataField}
              </span>
            </Truncate>
            {isPrediction && !isExpanded ? (
              /* folded declared columns stay identifiable */
              <span
                title="declared prediction"
                style={{
                  alignItems: "center",
                  background: globals.accent,
                  color: "#ffffff",
                  display: "inline-flex",
                  fontFamily: globals.fontMonoCaps,
                  fontSize: 8,
                  fontWeight: globals.bold,
                  height: 12,
                  justifyContent: "center",
                  marginLeft: 5,
                  width: 12,
                }}
              >
                P
              </span>
            ) : null}
            {isExpanded ? (
              <FaChevronDown
                data-testid="category-expand-is-expanded"
                style={{ fontSize: 10, marginLeft: 5 }}
              />
            ) : (
              <FaChevronRight
                data-testid="category-expand-is-not-expanded"
                style={{ fontSize: 10, marginLeft: 5 }}
              />
            )}
          </span>
        </div>

        <div className="ignore-capture">
          {isUserAnnotation ? (
            <AnnoMenuCategory
              metadataField={metadataField}
              createText="Add a new label to this category"
              editText="Edit this category's name"
              deleteText="Delete this category, all associated labels, and remove all cell assignments"
            />
          ) : null}
          <Tooltip
            content="Use as color scale"
            position={Position.LEFT}
            usePortal
            hoverOpenDelay={globals.tooltipHoverOpenDelay}
            modifiers={{
              preventOverflow: { enabled: false },
              hide: { enabled: false },
            }}
          >
            <Button
              data-testid={`colorby-${metadataField}`}
              onClick={handleColorChangeClick}
              active={isColorAccessor}
              intent={isColorAccessor ? "primary" : "none"}
              icon="tint"
            />
          </Tooltip>
        </div>
      </>
    );
  }
);

interface CategoryRenderProps {
  metadataField: string;
  checkboxID: string;
  isColorAccessor: boolean;
  isExpanded: boolean;
  selectionState: string;
  categoryData: Dataframe;
  categorySummary: ReturnType<typeof createCategorySummaryFromDfCol>;
  colorAccessor: string | null;
  colorData: Dataframe | null;
  colorTable: ColorTable;
  onColorChangeClick: (isColorAccessor: boolean) => void;
  onCategoryMenuClick: () => void;
  onCategoryMenuKeyPress: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
  onCategoryToggleAllClick: () => void;
  colorMode: string;
  isCellGuideCxg: boolean;
  isUserAnnotation: boolean;
  prediction: PredictionDeclaration | null;
  labelConfidence: Map<string, number> | null;
}

const CategoryRender = React.memo(
  ({
    metadataField,
    checkboxID,
    isColorAccessor,
    isExpanded,
    selectionState,
    categoryData,
    categorySummary,
    colorAccessor,
    colorData,
    colorTable,
    onColorChangeClick,
    onCategoryMenuClick,
    onCategoryMenuKeyPress,
    onCategoryToggleAllClick,
    colorMode,
    isCellGuideCxg,
    isUserAnnotation,
    prediction,
    labelConfidence,
  }: CategoryRenderProps) => {
    /*
    Render the core of the category, including checkboxes, controls, etc.
    */
    const { numCategoryValues } = categorySummary;
    const isSingularValue = numCategoryValues === 1;

    if (isSingularValue && !isCellGuideCxg && !isUserAnnotation) {
      /*
      Entire category has a single value, special case.
      But always show user annotations even with single value so users can add labels.
      */
      return null;
    }

    /*
    Otherwise, our normal multi-layout layout
    */
    return (
      <div
        style={{
          maxWidth: globals.maxControlsWidth,
        }}
        data-testid={`category-${metadataField}`}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <CategoryHeader
            metadataField={metadataField}
            checkboxID={checkboxID}
            isExpanded={isExpanded}
            isColorAccessor={isColorAccessor}
            selectionState={selectionState}
            onColorChangeClick={onColorChangeClick}
            onCategoryToggleAllClick={onCategoryToggleAllClick}
            onCategoryMenuClick={onCategoryMenuClick}
            onCategoryMenuKeyPress={onCategoryMenuKeyPress}
            isUserAnnotation={isUserAnnotation}
            isPrediction={!!prediction}
          />
        </div>
        {isUserAnnotation ? (
          <>
            <AnnoDialogEditCategoryName metadataField={metadataField} />
            <AddLabelDialog metadataField={metadataField} />
          </>
        ) : null}
        {prediction && isExpanded ? (
          <div
            style={{
              color: globals.fgMuted,
              fontFamily: globals.fontMonoCaps,
              fontSize: 8.5,
              letterSpacing: "0.04em",
              margin: "2px 0 3px 26px",
              textTransform: "uppercase",
            }}
          >
            {[prediction.method, prediction.run && `run ${prediction.run}`]
              .filter(Boolean)
              .join(" \u00b7 ")}
          </div>
        ) : null}
        <div style={{ marginLeft: 26 }}>
          {
            /* values*/
            isExpanded ? (
              <CategoryValueList
                metadataField={metadataField}
                categoryData={categoryData}
                categorySummary={categorySummary}
                colorAccessor={colorAccessor || ""}
                colorData={colorData}
                colorTable={colorTable}
                colorMode={colorMode}
                labelConfidence={labelConfidence}
              />
            ) : null
          }
        </div>
        {isExpanded && prediction?.confidence ? (
          /* the prediction's evidence lives with the prediction, not in QC */
          <div style={{ marginTop: 2 }}>
            <BrushableHistogram
              field={prediction.confidence}
              isObs
              mini={false}
              width={
                globals.leftSidebarWidth -
                4 * globals.leftSidebarSectionPadding -
                64
              }
              onGeneExpressionComplete={() => {}}
            />
          </div>
        ) : null}
      </div>
    );
  }
);

interface CategoryValueListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
  metadataField: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
  categoryData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
  categorySummary: any;
  colorAccessor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
  colorData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
  colorTable: any;
  colorMode: string;
  labelConfidence: Map<string, number> | null;
}
const CategoryValueList = React.memo(
  ({
    metadataField,
    categoryData,
    categorySummary,
    colorAccessor,
    colorData,
    colorTable,
    colorMode,
    labelConfidence,
  }: CategoryValueListProps) => {
    // Keep all tuples, including those with 0 counts
    const initialTuples = [...categorySummary.categoryValueIndices];

    const [sortedTuples, setSortedTuples] = useState(initialTuples);

    useEffect(() => {
      // Keep all tuples, including those with 0 counts
      const tuples = [...categorySummary.categoryValueIndices];

      // sort categorical labels in descending order by average values of whatever
      // continuous metadata is currently being colored by
      if (
        colorMode === "color by continuous metadata" ||
        colorMode === "color by expression" ||
        colorMode === "color by geneset mean expression"
      ) {
        const categoryColumn = categoryData.col(metadataField);
        const categoryDataArray = categoryColumn.asArray();
        const colorDataArray = colorData.icol(0).asArray();
        const categoryColorMap = new Map();

        categoryDataArray.forEach((_: unknown, index: number) => {
          const labelString = categoryColumn.getLabelValue(index);

          if (!categoryColorMap.has(labelString)) {
            categoryColorMap.set(labelString, { sum: 0, count: 0 });
          }
          const colorValue = colorDataArray[index];
          // Add safety check for non-finite values
          if (Number.isFinite(colorValue)) {
            const categoryColor = categoryColorMap.get(labelString);
            categoryColor.sum += colorValue;
            categoryColor.count += 1;
          }
        });

        const categoryAverageColor = new Map();
        categoryColorMap.forEach((value, key) => {
          // Only calculate average if count > 0
          if (value.count > 0) {
            categoryAverageColor.set(key, value.sum / value.count);
          }
        });
        tuples.sort((a, b) => {
          const countA = categorySummary.categoryValueCounts[a[1]];
          const countB = categorySummary.categoryValueCounts[b[1]];

          // Sort labels with 0 counts to the bottom
          if (countA === 0 && countB > 0) return 1;
          if (countA > 0 && countB === 0) return -1;

          // Both have counts > 0 or both are 0, sort by color average
          const colorA = categoryAverageColor.get(a[0]) ?? 0;
          const colorB = categoryAverageColor.get(b[0]) ?? 0;
          return colorB - colorA;
        });
      } else {
        // Default sort: labels with counts > 0 first, then labels with 0 counts
        tuples.sort((a, b) => {
          const countA = categorySummary.categoryValueCounts[a[1]];
          const countB = categorySummary.categoryValueCounts[b[1]];

          // Sort labels with 0 counts to the bottom
          if (countA === 0 && countB > 0) return 1;
          if (countA > 0 && countB === 0) return -1;

          // Both have same zero/non-zero status, maintain original order
          return 0;
        });
      }

      setSortedTuples(tuples);
    }, [
      categorySummary.categoryValueIndices,
      categorySummary.categoryValueCounts,
      metadataField,
      categoryData?.cols?.[0]?.__id,
      colorData?.cols?.[0]?.__id,
      colorMode,
      colorAccessor,
    ]);

    return (
      <>
        {sortedTuples.map(([value, index]) => (
          <CategoryValue
            key={value}
            metadataField={metadataField}
            categoryIndex={index}
            categoryData={categoryData}
            categorySummary={categorySummary}
            colorAccessor={colorAccessor}
            colorData={colorData}
            colorTable={colorTable}
            colorMode={colorMode}
            labelConfidence={labelConfidence}
          />
        ))}
      </>
    );
  }
);
