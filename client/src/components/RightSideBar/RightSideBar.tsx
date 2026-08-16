import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { RootState } from "reducers";
import PanelRail from "common/components/PanelRail/PanelRail";
import * as globals from "~/globals";
import GeneExpression from "./components/GeneExpression/GeneExpression";
import InfoPanel from "./components/GeneExpression/components/InfoPanel/InfoPanel";
import AgentPanel from "../Agent/AgentPanel";
import {
  CollapseToggle,
  PanelFooter,
  PanelFooterStatus,
  RailSlot,
  RightSidebarContent,
  RightSidebarWrapper,
} from "./style";

function RightSidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(
    (state: RootState) => state.sidebarPanels.rightCollapsed
  );

  const toggle = () => {
    dispatch({ type: "sidebar: toggle right" });
    /* re-measure the graph once the panel animation settles */
    setTimeout(
      () => window.dispatchEvent(new Event("resize")),
      globals.sidebarTransitionMs + 30
    );
  };

  return (
    <RightSidebarWrapper>
      <RailSlot visible={collapsed}>
        <PanelRail label="Genes" side="right" onExpand={toggle} />
      </RailSlot>
      <RightSidebarContent visible={!collapsed}>
        <CollapseToggle
          type="button"
          data-testid="right-sidebar-collapse"
          title="Collapse panel"
          onClick={toggle}
        >
          <Icon icon={IconNames.DOUBLE_CHEVRON_RIGHT} size={12} />
        </CollapseToggle>
        <GeneExpression />
        <InfoPanel />
        <AgentPanel />
        <PanelFooter>
          <span>var / symbols</span>
          <PanelFooterStatus>ready</PanelFooterStatus>
        </PanelFooter>
      </RightSidebarContent>
    </RightSidebarWrapper>
  );
}

export default RightSidebar;
