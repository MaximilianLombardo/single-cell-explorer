import React, { Children, ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { RAIL_WIDTH_PX } from "common/components/PanelRail/PanelRail";
import * as globals from "../../globals";

interface Props {
  children: ReactNode;
  addTopPadding: boolean;
  renderGraph?: (viewport: HTMLDivElement) => React.ReactNode;
}

/*
  Layout - this react component contains all the layout style and logic for the application once it has loaded.

  The layout is based on CSS grid: the left and right sidebars have fixed widths, the graph in the middle takes the
  remaining space.

  Note, the renderGraph child is a function rather than a fully-instantiated element because the middle pane of the
  app is dynamically-sized. It must have access to the containing viewport in order to know how large the graph
  should be.
*/

function Layout({ children, addTopPadding, renderGraph = undefined }: Props) {
  const [viewportRef, setViewportRef] = useState<HTMLDivElement | null>(null);
  const { leftCollapsed, rightCollapsed } = useSelector(
    (state: RootState) => state.sidebarPanels
  );
  const [leftSidebar, rightSidebar, ...restChildren] =
    Children.toArray(children);
  let graphComponent = null;
  if (viewportRef && renderGraph) {
    graphComponent = renderGraph(viewportRef);
  }
  const leftWidth = leftCollapsed ? RAIL_WIDTH_PX : globals.leftSidebarWidth;
  const rightWidth = rightCollapsed ? RAIL_WIDTH_PX : globals.rightSidebarWidth;
  return (
    <div
      style={{
        display: "grid",
        paddingTop: addTopPadding ? globals.HEADER_HEIGHT_PX : 0,
        gridTemplateColumns: `
        [left-sidebar-start] ${leftWidth + 1}px
        [left-sidebar-end graph-start] auto
        [graph-end right-sidebar-start] ${rightWidth + 1}px [right-sidebar-end]
      `,
        gridTemplateRows: "[top] auto [bottom]",
        gridTemplateAreas: "left-sidebar | graph | right-sidebar",
        columnGap: "0px",
        justifyItems: "stretch",
        alignItems: "stretch",
        height: "100%",
        width: "100%",
        position: "relative",
        top: 0,
        left: 0,
        minWidth: "1100px",
        background: globals.surface,
      }}
    >
      <div
        style={{
          gridArea: "top / left-sidebar-start / bottom / left-sidebar-end",
          position: "relative",
          height: "inherit",
          overflowY: "auto",
        }}
      >
        {leftSidebar}
      </div>
      <div
        // side panel needs to take priority in z-index
        style={{
          zIndex: 1,
          gridArea: "top / graph-start / bottom / graph-end",
          position: "relative",
          height: "inherit",
        }}
        ref={(ref) => {
          setViewportRef(ref);
        }}
      >
        {graphComponent}
        {restChildren}
      </div>
      <div
        style={{
          gridArea: "top / right-sidebar-start / bottom / right-sidebar-end",
          position: "relative",
          height: "inherit",
          overflowY: "auto",
        }}
      >
        {/* The below conditional is required because the right sidebar initializes as function for some reason...*/}
        {!(rightSidebar instanceof Function) && rightSidebar}
      </div>
    </div>
  );
}

export default Layout;
