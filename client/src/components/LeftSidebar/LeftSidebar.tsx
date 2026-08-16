import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { RootState } from "reducers";
import PanelRail from "common/components/PanelRail/PanelRail";
import Categorical from "./components/Categorical/Categorical";
import Continuous from "./components/Continuous/Continuous";
import {
  CollapseToggle,
  DatasetLabel,
  DatasetName,
  DatasetRow,
  LeftSidebarContainer,
  LeftSidebarWrapper,
  PanelEyebrow,
  PanelHeader,
  PanelHeading,
  PanelScope,
  PanelScopeDivider,
  PanelScopeMuted,
} from "./style";

/* Fall back to the dataset segment of the URL when portal metadata is absent
   (self-hosted deployments have no data portal to supply a display name). */
function datasetNameFromPath(): string {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const cxg = segments.find((s) => s.toLowerCase().endsWith(".cxg"));
  return cxg ?? segments[segments.length - 1] ?? "";
}

function LeftSideBar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(
    (state: RootState) => state.sidebarPanels.leftCollapsed
  );
  const datasetName = useSelector(
    (state: RootState) =>
      state.datasetMetadata?.datasetMetadata?.dataset_name ??
      datasetNameFromPath()
  );
  const nObs = useSelector(
    (state: RootState) => state.annoMatrix?.schema?.dataframe?.nObs
  );
  const nCategorical = useSelector(
    (state: RootState) =>
      state.annoMatrix?.schema?.annotations?.obs?.columns?.filter(
        (col) => "categories" in col
      ).length
  );

  const toggle = () => {
    dispatch({ type: "sidebar: toggle left" });
    /* nudge the graph to re-measure its viewport */
    setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  };

  if (collapsed) {
    return (
      <LeftSidebarWrapper>
        <PanelRail label="Metadata" side="left" onExpand={toggle} />
      </LeftSidebarWrapper>
    );
  }

  return (
    <LeftSidebarWrapper>
      <LeftSidebarContainer>
        <PanelHeader>
          <CollapseToggle
            type="button"
            data-testid="left-sidebar-collapse"
            title="Collapse panel"
            onClick={toggle}
          >
            <Icon icon={IconNames.DOUBLE_CHEVRON_LEFT} size={12} />
          </CollapseToggle>
          <DatasetRow>
            <DatasetLabel>Dataset</DatasetLabel>
            <DatasetName title={datasetName}>{datasetName}</DatasetName>
          </DatasetRow>
          <PanelEyebrow>Metadata</PanelEyebrow>
          <PanelHeading>Annotations</PanelHeading>
          {nObs ? (
            <PanelScope>
              <span>{nObs.toLocaleString()} cells</span>
              {nCategorical ? (
                <>
                  <PanelScopeDivider />
                  <PanelScopeMuted>
                    {nCategorical} {nCategorical === 1 ? "field" : "fields"}
                  </PanelScopeMuted>
                </>
              ) : null}
            </PanelScope>
          ) : null}
        </PanelHeader>
        <Categorical />
        <Continuous />
      </LeftSidebarContainer>
    </LeftSidebarWrapper>
  );
}

export default LeftSideBar;
