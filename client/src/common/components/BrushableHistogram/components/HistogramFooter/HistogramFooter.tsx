import React from "react";

const HistogramFooter = React.memo(
  ({
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type '{ c... Remove this comment to see the full error message
    displayName,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'hideRanges' does not exist on type '{ ch... Remove this comment to see the full error message
    hideRanges,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'rangeMin' does not exist on type '{ chil... Remove this comment to see the full error message
    rangeMin,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'rangeMax' does not exist on type '{ chil... Remove this comment to see the full error message
    rangeMax,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'rangeColorMin' does not exist on type '{... Remove this comment to see the full error message
    rangeColorMin,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'rangeColorMax' does not exist on type '{... Remove this comment to see the full error message
    rangeColorMax,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isObs' does not exist on type '{ childre... Remove this comment to see the full error message
    isObs,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isGeneSetSummary' does not exist on type... Remove this comment to see the full error message
    isGeneSetSummary,
  }) => (
    /*
    Footer of each histogram.  Will render range and title.

    Required props:
      * displayName - the displayName, aka "n_genes", "FOXP2", etc.
      * hideRanges - true/false, enables/disable rendering of ranges
      * range - length two array, [min, max], containing the range values to display
      * rangeColor - length two array, [mincolor, maxcolor], each a CSS color
    */
    <div>
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 9,
          justifyContent: hideRanges ? "center" : "space-between",
          letterSpacing: "0.02em",
          paddingTop: 2,
        }}
      >
        <span
          style={{
            color: rangeColorMin,
            display: hideRanges ? "none" : "block",
            whiteSpace: "nowrap",
          }}
        >
          min {rangeMin.toPrecision(4)}
        </span>
        <span
          data-testid="brushable-histogram-field-name"
          style={{
            color: "#666666",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isObs && displayName}
          {isGeneSetSummary && "gene set mean expression"}
        </span>
        <div style={{ display: hideRanges ? "block" : "none" }}>
          : {rangeMin}
        </div>
        <span
          style={{
            color: rangeColorMax,
            display: hideRanges ? "none" : "block",
            whiteSpace: "nowrap",
          }}
        >
          max {rangeMax.toPrecision(4)}
        </span>
      </div>
    </div>
  )
);

export default HistogramFooter;
