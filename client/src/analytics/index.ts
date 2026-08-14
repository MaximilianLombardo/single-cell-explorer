import { EVENTS } from "./events";
import { type GetState } from "../reducers";

declare global {
  interface Window {
    plausible: {
      q: unknown[];
      (event: EVENTS, options?: { props: { [key: string]: unknown } }): void;
    };
  }
}

/*
Analytics are disabled on this fork -- this is deliberately a no-op.

Upstream sent every event to CZI's Plausible instance. The script tag that loaded
plausible.js has been removed from index_template.html, so `window.plausible` was
undefined here and every call threw a TypeError that the old try/catch swallowed into
console.error. Nothing was reported, but every interaction logged an error.

The ~29 call sites are left in place on purpose: they mark the points someone
already decided are worth instrumenting, which is useful if we ever add our own
analytics. To do that, implement this function and add the corresponding
script-src/connect-src entries to the CSP in server/ecs/app.py.
*/
// underscore-prefixed so noUnusedParameters accepts them; the signature is kept
// intact so the ~29 call sites need no change.
export function track(_event: EVENTS, _props?: Record<string, unknown>): void {
  // intentionally empty
}

export function trackColorByCategoryExpand(
  isColorByCategory: boolean,
  isAnyCategoryExpanded: boolean
): void {
  if (!isColorByCategory || !isAnyCategoryExpanded) return;

  track(EVENTS.EXPLORER_COLORBY_CATEGORY_EXPAND);
}

export function trackColorByCategoryHighlightHistogram(
  isColorByCategory: boolean,
  isAnyHistogramHighlighted: boolean
): void {
  if (!isColorByCategory || !isAnyHistogramHighlighted) return;

  track(EVENTS.EXPLORER_COLORBY_CATEGORY_HIGHLIGHT_HISTOGRAM);
}

export function trackColorByHistogramExpandCategory(
  isColorByHistogram: boolean,
  isAnyCategoryExpanded: boolean
): void {
  if (!isColorByHistogram || !isAnyCategoryExpanded) return;

  track(EVENTS.EXPLORER_COLORBY_HISTOGRAM_EXPAND_CATEGORY);
}

export function thunkTrackColorByHistogramExpandCategoryFromColorByHistogram() {
  return async (_: unknown, getState: GetState) => {
    const {
      colors: { colorMode },
      controls: { expandedCategories },
    } = getState();

    trackColorByHistogramExpandCategory(
      isColorByHistogramColorMode(colorMode),
      expandedCategories.length > 0
    );
  };
}

export function trackColorByHistogramHighlightHistogram(
  isColorByHistogram: boolean,
  isAnyHistogramHighlighted: boolean
): void {
  if (!isColorByHistogram || !isAnyHistogramHighlighted) return;

  track(EVENTS.EXPLORER_COLORBY_HISTOGRAM_HIGHLIGHT_HISTOGRAM);
}

export function thunkTrackColorByHistogramHighlightHistogramFromColorByHistogram() {
  return async (_: unknown, getState: GetState) => {
    const {
      colors: { colorMode },
      continuousSelection,
    } = getState();

    trackColorByHistogramHighlightHistogram(
      isColorByHistogramColorMode(colorMode),
      Object.keys(continuousSelection).length > 0
    );
  };
}

/**
 * (thuang): Amanda wants to treat both continuous metadata and gene expression
 * as color by histogram color mode in analytics events.
 */
export function isColorByHistogramColorMode(colorMode: string | null): boolean {
  return (
    colorMode === "color by continuous metadata" ||
    colorMode === "color by expression"
  );
}
