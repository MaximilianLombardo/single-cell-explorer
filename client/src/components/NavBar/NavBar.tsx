import React from "react";
import {
  AnchorButton,
  Menu,
  MenuDivider,
  MenuItem,
  Position,
  Popover,
} from "@blueprintjs/core";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { IconNames as CXGIconNames } from "../icon";
import { track } from "../../analytics";
import { EVENTS } from "../../analytics/events";
import { ROUTES } from "./routes";
import Icon from "../icon/icon";
import {
  BetaChip,
  CellCountBox,
  DatasetLabel,
  DatasetName,
  HelpWrapper,
  IdentityBox,
  Left,
  LinkWrapper,
  MainWrapper,
  Right,
  SegmentedNav,
  Wordmark,
  Wrapper,
} from "./style";

function handleMenuClick() {
  track(EVENTS.EXPLORER_MENU_BUTTON_CLICKED);
}

const CENSUS_DOCS_LINK = "https://cellxgene-census.readthedocs.io/en/latest";

/* Fall back to the dataset segment of the URL when portal metadata is absent
   (self-hosted deployments have no data portal to supply a display name). */
function datasetNameFromPath(): string {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const cxg = segments.find((s) => s.toLowerCase().endsWith(".cxg"));
  return cxg ?? segments[segments.length - 1] ?? "";
}

interface HeaderProps {
  tosURL?: string;
  privacyURL?: string;
}

function Header(props: HeaderProps) {
  const { tosURL, privacyURL } = props;

  const datasetName = useSelector(
    (state: RootState) =>
      state.datasetMetadata?.datasetMetadata?.dataset_name ??
      datasetNameFromPath()
  );
  const cellCount = useSelector(
    (state: RootState) => state.annoMatrix?.schema?.dataframe?.nObs
  );

  return (
    <Wrapper data-testid="header">
      <MainWrapper>
        <Left>
          <a href={ROUTES.HOMEPAGE}>
            <IdentityBox>
              <span>CELL&times;GENE</span>
            </IdentityBox>
          </a>
          <Wordmark>EXPLORER</Wordmark>
        </Left>
        <SegmentedNav>
          <LinkWrapper>
            <AnchorButton active minimal text="Explore" />
          </LinkWrapper>
          <LinkWrapper>
            <AnchorButton
              active={false}
              href={ROUTES.WHERE_IS_MY_GENE}
              minimal
              text="Gene Expression"
              onClick={handleWMGClick}
            />
          </LinkWrapper>
          <LinkWrapper>
            <AnchorButton
              active={false}
              href={ROUTES.DE}
              minimal
              text="Differential Expression"
              onClick={handleDEClick}
            />
            <BetaChip label="New" size="small" />
          </LinkWrapper>
        </SegmentedNav>
        <Right>
          <DatasetLabel>Dataset</DatasetLabel>
          <DatasetName title={datasetName}>{datasetName}</DatasetName>
          {cellCount ? (
            <CellCountBox>
              <span>{cellCount.toLocaleString()} cells</span>
            </CellCountBox>
          ) : null}
          <HelpWrapper>
            <Popover
              hasBackdrop
              content={
                <Menu>
                  <MenuItem
                    href={ROUTES.DOCS}
                    target="_blank"
                    text="Documentation"
                    rel="noopener"
                    onClick={handleDocumentationClick}
                  />
                  <MenuItem
                    href="https://join-cellxgene-users.herokuapp.com/"
                    icon={<Icon icon={CXGIconNames.SLACK} />}
                    target="_blank"
                    text="Chat"
                    rel="noopener"
                  />
                  {(tosURL || privacyURL) && (
                    <MenuItem
                      icon={<Icon icon={CXGIconNames.ABOUT} />}
                      popoverProps={{ openOnTargetFocus: false }}
                      text="About cellxgene"
                    >
                      {tosURL && (
                        <MenuItem
                          href={tosURL}
                          rel="noopener"
                          target="_blank"
                          text="Terms of Service"
                        />
                      )}
                      {privacyURL && (
                        <MenuItem
                          href={privacyURL}
                          rel="noopener"
                          target="_blank"
                          text="Privacy Policy"
                        />
                      )}
                    </MenuItem>
                  )}
                  <MenuDivider title="CZ CELLxGENE" />
                  <MenuItem
                    href={ROUTES.COLLECTIONS}
                    text="Collections"
                    onClick={handleCollectionsClick}
                  />
                  <MenuItem
                    href={ROUTES.DATASETS}
                    text="Datasets"
                    onClick={handleDatasetsClick}
                  />
                  <MenuItem
                    href={ROUTES.CELL_GUIDE}
                    text="Cell Guide"
                    onClick={handleCellGuideClick}
                  />
                  <MenuDivider title="Census" />
                  <MenuItem
                    href={CENSUS_DOCS_LINK}
                    rel="noopener"
                    target="_self"
                    text="API"
                    onClick={handleCensusClick}
                  />
                  <MenuItem
                    href={ROUTES.CENSUS_MODELS}
                    rel="noopener"
                    target="_self"
                    text="Models"
                    onClick={handleCensusSpotlightClick}
                  />
                </Menu>
              }
              position={Position.BOTTOM_LEFT}
              modifiers={{
                preventOverflow: { enabled: false },
                hide: { enabled: false },
              }}
            >
              <AnchorButton
                active={false}
                data-testid="menu"
                minimal
                icon="help"
                onClick={handleMenuClick}
              />
            </Popover>
          </HelpWrapper>
        </Right>
      </MainWrapper>
    </Wrapper>
  );

  function handleWMGClick(): void {
    track(EVENTS.WMG_CLICK_NAV);
  }
  function handleCellGuideClick(): void {
    track(EVENTS.CELL_GUIDE_CLICK_NAV);
  }
  function handleDatasetsClick(): void {
    track(EVENTS.DATASETS_CLICK_NAV);
  }
  function handleCollectionsClick(): void {
    track(EVENTS.COLLECTIONS_CLICK_NAV);
  }
  function handleCensusClick(): void {
    track(EVENTS.CENSUS_DOCUMENTATION_CLICK_NAV);
  }
  function handleCensusSpotlightClick(): void {
    track(EVENTS.CENSUS_DIRECTORY_CLICK_NAV);
  }
  function handleDocumentationClick(): void {
    track(EVENTS.DOCUMENTATION_CLICK_NAV);
  }
  function handleDEClick(): void {
    track(EVENTS.DE_CLICK_NAV);
  }
}

export default Header;
