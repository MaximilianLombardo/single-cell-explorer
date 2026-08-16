import { Classes } from "@blueprintjs/core";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Tag } from "@czi-sds/components";
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
    letter-spacing: 0.05em;
  }
`;

export const Wordmark = styled.span`
  && {
    color: ${globals.fgPrimary};
    font-family: ${globals.fontHead};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
  }
`;

export const Right = styled.span`
  align-items: center;
  display: flex;
  gap: 12px;
`;

/* compact segmented navigation — one bordered instrument group */
export const SegmentedNav = styled.span`
  border: 1px solid ${globals.borderStrong};
  display: flex;
  height: 30px;
`;

const segment = css`
  .${Classes.BUTTON}.${Classes.MINIMAL} {
    background: ${globals.surface};
    border-radius: 0;
    border-right: 1px solid ${globals.borderStrong};
    color: ${globals.fgPrimary};
    height: 28px;
    min-height: 28px;
    padding: 0 12px;

    > span {
      font-family: ${globals.fontMonoCaps};
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    &:hover {
      background: ${globals.surfaceSecondary};
      color: ${globals.fgPrimary};
    }

    &.${Classes.ACTIVE} {
      background: ${globals.accent};
      color: #ffffff;
      box-shadow: none !important;
    }

    &:focus {
      outline: none;
    }
  }
`;

export const LinkWrapper = styled.span`
  ${segment}
  align-items: center;
  display: flex;

  &:last-of-type .${Classes.BUTTON}.${Classes.MINIMAL} {
    border-right: none;
  }
`;

export const DatasetLabel = styled.span`
  && {
    color: ${globals.fgMuted};
    font-family: ${globals.fontMonoCaps};
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

export const DatasetName = styled.span`
  && {
    color: ${globals.fgPrimary};
    font-family: ${globals.fontMonoData};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

export const CellCountBox = styled.span`
  align-items: center;
  border: 1px solid ${globals.borderStrong};
  display: flex;
  height: 26px;
  padding: 0 8px;

  && span {
    color: ${globals.fgPrimary};
    font-family: ${globals.fontMonoData};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    white-space: nowrap;
  }
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

export const BetaChip = styled(Tag)`
  background: ${globals.accent};
  border-radius: 0;
  color: white;
  margin-left: 4px;
  height: 14px !important;
  margin-bottom: 0;
  padding: 2px 4px;

  .MuiChip-label {
    font-family: ${globals.fontMonoCaps};
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 8px;
  }
`;
