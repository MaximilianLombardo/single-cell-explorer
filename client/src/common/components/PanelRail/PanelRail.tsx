import React from "react";
import styled from "@emotion/styled";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as globals from "~/globals";

/*
Collapsed state of a side panel: a 36px instrument rail with an expand
affordance and a vertical label. Clicking anywhere on the rail restores
the panel.
*/

export const RAIL_WIDTH_PX = 36;

const Rail = styled.div`
  align-items: center;
  background: ${globals.surfaceSecondary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding-top: 8px;
  width: ${RAIL_WIDTH_PX}px;

  &:hover {
    background: ${globals.borderSubtle};
  }
`;

const RailButton = styled.span`
  align-items: center;
  background: ${globals.surface};
  border: 1px solid ${globals.borderControl};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const RailLabel = styled.span`
  color: ${globals.fgSecondary};
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  font-weight: ${globals.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
`;

interface Props {
  label: string;
  side: "left" | "right";
  onExpand: () => void;
}

function PanelRail({ label, side, onExpand }: Props): JSX.Element {
  return (
    <Rail
      role="button"
      tabIndex={0}
      data-testid={`${side}-sidebar-rail`}
      title={`Expand ${label} panel`}
      onClick={onExpand}
      onKeyPress={(e) => {
        if (e.key === "Enter") onExpand();
      }}
    >
      <RailButton>
        <Icon
          icon={
            side === "left" ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_LEFT
          }
          size={12}
        />
      </RailButton>
      <RailLabel>{label}</RailLabel>
    </Rail>
  );
}

export default PanelRail;
