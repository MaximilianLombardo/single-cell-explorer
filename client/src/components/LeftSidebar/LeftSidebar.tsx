import React from "react";
import { useSelector } from "react-redux";

import { RootState } from "reducers";
import Categorical from "./components/Categorical/Categorical";
import Continuous from "./components/Continuous/Continuous";
import {
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

  return (
    <LeftSidebarWrapper>
      <LeftSidebarContainer>
        <PanelHeader>
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
