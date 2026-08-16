import React from "react";
import {
  Menu,
  MenuDivider,
  MenuItem,
  Position,
  Popover,
  Tooltip,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { IconNames as CXGIconNames } from "components/icon";
import Icon from "components/icon/icon";
import { track } from "analytics";
import { EVENTS } from "analytics/events";
import * as globals from "~/globals";
import { MenuBarAnchorButton } from "../../style";
import { ROUTES } from "./routes";

const CENSUS_DOCS_LINK = "https://cellxgene-census.readthedocs.io/en/latest";

/*
Help & documentation menu, relocated from the removed top nav bar into the
canvas control rail. Preserves the CZ CELLxGENE / Census navigation links.
*/
function HelpMenu() {
  const tosURL = useSelector(
    (state: RootState) => state.config?.parameters?.about_legal_tos
  );
  const privacyURL = useSelector(
    (state: RootState) => state.config?.parameters?.about_legal_privacy
  );

  return (
    <Popover
      hasBackdrop
      content={
        <Menu>
          <MenuItem
            href={ROUTES.DOCS}
            target="_blank"
            text="Documentation"
            rel="noopener"
            onClick={() => track(EVENTS.DOCUMENTATION_CLICK_NAV)}
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
            onClick={() => track(EVENTS.COLLECTIONS_CLICK_NAV)}
          />
          <MenuItem
            href={ROUTES.DATASETS}
            text="Datasets"
            onClick={() => track(EVENTS.DATASETS_CLICK_NAV)}
          />
          <MenuItem
            href={ROUTES.WHERE_IS_MY_GENE}
            text="Gene Expression"
            onClick={() => track(EVENTS.WMG_CLICK_NAV)}
          />
          <MenuItem
            href={ROUTES.DE}
            text="Differential Expression"
            onClick={() => track(EVENTS.DE_CLICK_NAV)}
          />
          <MenuItem
            href={ROUTES.CELL_GUIDE}
            text="Cell Guide"
            onClick={() => track(EVENTS.CELL_GUIDE_CLICK_NAV)}
          />
          <MenuDivider title="Census" />
          <MenuItem
            href={CENSUS_DOCS_LINK}
            rel="noopener"
            target="_self"
            text="API"
            onClick={() => track(EVENTS.CENSUS_DOCUMENTATION_CLICK_NAV)}
          />
          <MenuItem
            href={ROUTES.CENSUS_MODELS}
            rel="noopener"
            target="_self"
            text="Models"
            onClick={() => track(EVENTS.CENSUS_DIRECTORY_CLICK_NAV)}
          />
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
      modifiers={{
        preventOverflow: { enabled: false },
        hide: { enabled: false },
      }}
    >
      <Tooltip
        content="Help & documentation"
        position="bottom"
        hoverOpenDelay={globals.tooltipHoverOpenDelay}
      >
        <MenuBarAnchorButton
          type="button"
          data-testid="menu"
          icon={IconNames.HELP}
          onClick={() => track(EVENTS.EXPLORER_MENU_BUTTON_CLICKED)}
        />
      </Tooltip>
    </Popover>
  );
}

export default HelpMenu;
