import { AnyAction } from "redux";

/*
Collapse state for the two side panels. Deliberately outside undo history —
folding a panel is not an analysis action.
*/

export interface SidebarPanelsState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

const initialState: SidebarPanelsState = {
  leftCollapsed: false,
  rightCollapsed: false,
};

const SidebarPanels = (
  state: SidebarPanelsState = initialState,
  action: AnyAction
): SidebarPanelsState => {
  switch (action.type) {
    case "sidebar: toggle left":
      return { ...state, leftCollapsed: !state.leftCollapsed };
    case "sidebar: toggle right":
      return { ...state, rightCollapsed: !state.rightCollapsed };
    default:
      return state;
  }
};

export default SidebarPanels;
