import { Button, Classes } from "@blueprintjs/core";
import styled from "@emotion/styled";
import * as globals from "~/globals";

export const ImageToggleWrapper = styled.span`
  margin-left: 8px;
  display: flex;
`;

export const ImageDropdownButton = styled(Button)`
  /* (thuang): Make the caret button narrower */
  min-width: 10px;
`;

/* Labeled instrument selector: a keyed cell ("EMBEDDING") fused to the
   value control inside a single 1px outline. */
export const SelectorGroup = styled.span`
  background: ${globals.surface};
  border: 1px solid ${globals.borderControl};
  display: inline-flex;
  height: 26px;

  .${Classes.BUTTON} {
    border: none;
    min-height: 24px;
    font-family: ${globals.fontMonoData};
    font-size: 11px;
    font-weight: 500;
  }
`;

export const SelectorKey = styled.span`
  align-items: center;
  background: ${globals.surfaceSecondary};
  border-right: 1px solid ${globals.borderInner};
  color: ${globals.fgMuted};
  display: inline-flex;
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  letter-spacing: 0.05em;
  padding: 0 7px;
  text-transform: uppercase;
  white-space: nowrap;
`;

/* "N of M cells" — instrument readout floated at the canvas top-left,
   below the control rail. */
export const CountReadout = styled.span`
  align-items: center;
  display: flex;
  gap: 6px;
  left: 8px;
  position: absolute;
  top: 56px;
  white-space: nowrap;

  &::before {
    background: ${globals.accent};
    content: "";
    display: inline-block;
    height: 1px;
    width: 12px;
  }

  color: ${globals.fgPrimary};
  font-family: ${globals.fontMonoData};
  font-size: 12px;
  font-weight: 600;
`;

export const CountReadoutUnit = styled.span`
  color: ${globals.fgMuted};
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;
