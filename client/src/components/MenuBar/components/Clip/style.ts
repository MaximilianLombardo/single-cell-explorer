import styled from "@emotion/styled";
import { Button } from "@blueprintjs/core";
import { spacesXxs, spacesXxxs } from "util/theme";

/*
The 5px and 10px values below are off the SDS spacing scale (2/4/6/8/12/16),
so they are kept as literals to preserve the current rendering. They are
candidates for normalisation during the redesign.
*/

export const ClipPopoverContent = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 10px;
`;

export const ClipRangeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 5px;
`;

export const ClipRangeSeparator = styled.span`
  margin-right: 5px;
  margin-left: 5px;
`;

export const PercentageIconWrapper = styled.div`
  padding: ${spacesXxs}px ${spacesXxxs}px;
`;

/**
 * The `&&&` bumps specificity above Blueprint's disabled/loading rules, the
 * strongest of which is `.bp5-button:not([class*="bp5-intent-"]).bp5-disabled`
 * (0,3,0) and sets `cursor: not-allowed`. These components replace inline
 * `style={{ cursor: "pointer" }}`, which applied in every button state, so the
 * escalation is required to keep the rendering identical — notably for
 * ClipCommitButton, which is disabled whenever the pending range is unchanged.
 */
export const ClipTriggerButton = styled(Button)`
  &&& {
    cursor: pointer;
  }
`;

export const ClipCommitButton = styled(Button)`
  margin-right: 5px;
  margin-left: 5px;
  &&& {
    cursor: pointer;
  }
`;
