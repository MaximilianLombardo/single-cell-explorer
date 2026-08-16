import React from "react";
import { useSelector } from "react-redux";

import { RootState } from "reducers";
import Categorical from "./components/Categorical/Categorical";
import Continuous from "./components/Continuous/Continuous";
import {
  LeftSidebarContainer,
  LeftSidebarWrapper,
  PanelEyebrow,
  PanelHeader,
  PanelHeading,
  PanelScope,
  PanelScopeDivider,
  PanelScopeMuted,
} from "./style";

function LeftSideBar() {
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
