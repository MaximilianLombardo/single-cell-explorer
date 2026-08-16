import styled from "@emotion/styled";
import * as globals from "../../globals";

export const LeftSidebarWrapper = styled.div`
  background: ${globals.surfaceSecondary};
  border-right: 1px solid ${globals.borderStrong};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

/* Content keeps its full width while the grid column animates, so the panel
   clips instead of reflowing; opacity crossfades against the rail. */
export const LeftSidebarContainer = styled.div<{ visible: boolean }>`
  height: 100%;
  width: ${globals.leftSidebarWidth}px;
  overflow-y: auto;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? "auto" : "none")};
  transition: opacity ${globals.sidebarTransitionMs}ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const RailSlot = styled.div<{ visible: boolean }>`
  inset: 0;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? "auto" : "none")};
  position: absolute;
  transition: opacity ${globals.sidebarTransitionMs}ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const PanelHeader = styled.div`
  border-bottom: 1px solid ${globals.borderSubtle};
  padding: 12px ${globals.leftSidebarSectionPadding}px 10px;
  position: relative;
`;

export const CollapseToggle = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${globals.fgMuted};
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 8px;
  top: 10px;
  width: 20px;

  &:hover {
    background: ${globals.borderSubtle};
    color: ${globals.fgPrimary};
  }
`;

export const DatasetRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  /* keep the name clear of the collapse toggle */
  margin-right: 24px;
`;

export const DatasetLabel = styled.span`
  color: ${globals.fgMuted};
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  font-weight: ${globals.bolder};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const DatasetName = styled.span`
  color: ${globals.fgPrimary};
  font-family: ${globals.fontMonoData};
  font-size: 11px;
  font-weight: ${globals.bolder};
  letter-spacing: 0.02em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const PanelEyebrow = styled.div`
  color: ${globals.fgSecondary};
  font-family: ${globals.fontMonoCaps};
  font-size: 10px;
  font-weight: ${globals.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const PanelHeading = styled.h1`
  color: ${globals.fgPrimary};
  font-family: ${globals.fontHead};
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.01em;
  margin: 6px 0 4px;
`;

export const PanelScope = styled.div`
  align-items: center;
  color: ${globals.fgPrimary};
  display: flex;
  font-family: ${globals.fontMonoData};
  font-size: 10px;
  font-weight: ${globals.bold};
  gap: 7px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const PanelScopeDivider = styled.span`
  background: ${globals.accent};
  display: inline-block;
  height: 8px;
  width: 1px;
`;

export const PanelScopeMuted = styled.span`
  color: ${globals.fgSecondary};
  font-weight: 500;
`;
