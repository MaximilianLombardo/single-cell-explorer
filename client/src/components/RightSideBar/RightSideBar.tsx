import React from "react";

import GeneExpression from "./components/GeneExpression/GeneExpression";
import InfoPanel from "./components/GeneExpression/components/InfoPanel/InfoPanel";
import AgentPanel from "../Agent/AgentPanel";
import { PanelFooter, PanelFooterStatus, RightSidebarWrapper } from "./style";

function RightSidebar() {
  return (
    <RightSidebarWrapper>
      <GeneExpression />
      <InfoPanel />
      <AgentPanel />
      <PanelFooter>
        <span>var / symbols</span>
        <PanelFooterStatus>ready</PanelFooterStatus>
      </PanelFooter>
    </RightSidebarWrapper>
  );
}

export default RightSidebar;
