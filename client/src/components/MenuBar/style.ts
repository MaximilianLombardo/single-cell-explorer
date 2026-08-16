import styled from "@emotion/styled";
import { AnchorButton } from "@blueprintjs/core";
import { getFeatureFlag } from "util/featureFlags/featureFlags";
import { FEATURES } from "util/featureFlags/features";
import * as globals from "~/globals";

export const MAX_VERTICAL_THRESHOLD_WIDTH_PX = 500;
const isTest = getFeatureFlag(FEATURES.TEST);

const FIRST_VERTICAL_THRESHOLD_WIDTH_PX = isTest ? 705 : 685;

/* Canvas control rail: a solid 44px instrument strip across the top of the
   visualization region. Groups inside keep their responsive stacking. */
export const MenuBarWrapper = styled.div`
  background: ${globals.surface};
  border-bottom: 1px solid ${globals.borderSubtle};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 8px 8px 8px;
  width: 100%;
  position: relative;
  container: menu-bar / inline-size;
`;

export const ResponsiveMenuGroupOne = styled.div`
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: right;
  @container menu-bar (max-width: ${MAX_VERTICAL_THRESHOLD_WIDTH_PX}px) {
    flex-direction: column-reverse;
    position: absolute;
    top: 37px;
  }
`;

export const ResponsiveMenuGroupTwo = styled.div`
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: right;
  @container menu-bar (max-width: ${FIRST_VERTICAL_THRESHOLD_WIDTH_PX}px) {
    flex-direction: column-reverse;
    position: absolute;
    top: 40px;
  }
  @container menu-bar (max-width: ${MAX_VERTICAL_THRESHOLD_WIDTH_PX}px) {
    top: 172px;
  }
`;

export const EmbeddingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
  margin-top: 9px;
`;

export const ControlsWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: right;
  align-items: flex-start;
  position: relative;
  @container menu-bar (max-width: ${MAX_VERTICAL_THRESHOLD_WIDTH_PX}px) {
    flex-direction: column-reverse;
    align-items: flex-end;
    position: absolute;
    right: 0px;
  }
`;

/**
 * Menu bar action button.
 *
 * The `&&&` bumps specificity above Blueprint's disabled/loading rules, the
 * strongest of which is `.bp5-button:not([class*="bp5-intent-"]).bp5-disabled`
 * (0,3,0) and sets `cursor: not-allowed`. This replaces an inline
 * `style={{ cursor: "pointer" }}`, which applied in every button state, so the
 * escalation is required to keep the rendering identical.
 */
export const MenuBarAnchorButton = styled(AnchorButton)`
  &&& {
    cursor: pointer;
  }
`;
