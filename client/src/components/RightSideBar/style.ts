import styled from "@emotion/styled";
import * as globals from "../../globals";

export const RightSidebarWrapper = styled.div`
  background: ${globals.surfaceSecondary};
  border-left: 1px solid ${globals.borderStrong};
  height: inherit;
  overflow: hidden;
  position: relative;
  width: inherit;
`;

/* Content keeps its full width while the grid column animates, so the panel
   clips instead of reflowing; opacity crossfades against the rail. */
export const RightSidebarContent = styled.div<{ visible: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  width: ${globals.rightSidebarWidth}px;
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
  right: 6px;
  top: 12px;
  width: 20px;
  z-index: 1;

  &:hover {
    background: ${globals.borderSubtle};
    color: ${globals.fgPrimary};
  }
`;

export const PanelFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${globals.borderStrong};
  color: ${globals.fgMuted};
  display: flex;
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  font-weight: 700;
  justify-content: space-between;
  letter-spacing: 0.05em;
  margin-top: auto;
  padding: 8px ${globals.rightSidebarSectionPadding}px;
  text-transform: uppercase;
`;

export const PanelFooterStatus = styled.span`
  color: ${globals.fgPrimary};
  font-family: ${globals.fontMonoData};
`;
