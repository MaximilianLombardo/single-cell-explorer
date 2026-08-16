import { Classes } from "@blueprintjs/core";
import styled from "@emotion/styled";
import * as globals from "~/globals";
import { HEADER_HEIGHT_PX } from "~/globals";

export const Wrapper = styled.div`
  background-color: ${globals.surface};
  border-bottom: 1px solid ${globals.borderStrong};
  height: ${HEADER_HEIGHT_PX}px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 2;

  /* Increase specificity for targeted elements specified in index.html and index_template.html */
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  span,
  button,
  input,
  label,
  text,
  div {
    font-family: ${globals.fontBody};
  }
`;

export const MainWrapper = styled.div`
  align-items: center;
  display: flex;
  height: inherit; /* Take up full height of parent. */
  justify-content: space-between;
  padding: 0 16px;
`;

export const Left = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;

  a {
    display: flex; /* Ensures the anchor wrapping the logo has correct line height. */
    text-decoration: none;
  }
`;

export const IdentityBox = styled.span`
  align-items: center;
  background: ${globals.fgPrimary};
  display: flex;
  height: 26px;
  padding: 0 9px;

  && span {
    color: #ffffff;
    font-family: ${globals.fontHead};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

export const Right = styled.span`
  align-items: center;
  display: flex;
  gap: 12px;
`;

export const HelpWrapper = styled.span`
  align-items: center;
  display: flex;

  .${Classes.BUTTON}.${Classes.MINIMAL} {
    background: none;
    border: none;
    border-radius: 0;
    color: ${globals.fgPrimary};
    min-height: 26px;
    min-width: 26px;
    padding: 0 4px;

    &:hover {
      background: ${globals.surfaceSecondary};
    }
  }
`;
