import styled from "@emotion/styled";
import * as globals from "~/globals";

/* Boxed panel identity, e.g. the black GENES chip in the panel header. */
export const HeaderBox = styled.span`
  align-items: center;
  background: ${globals.fgPrimary};
  color: #ffffff;
  display: inline-flex;
  font-family: ${globals.fontHead};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 5px 8px;
  text-transform: uppercase;
`;

export const HeaderRow = styled.span`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 8px;
`;

/* Technical eyebrow under the panel identity, e.g. FEATURE INDEX / 32,738 */
export const FeatureIndexEyebrow = styled.div`
  color: ${globals.fgMuted};
  font-family: ${globals.fontMonoCaps};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 6px 0 10px;
  text-transform: uppercase;
`;

/* Section band between 1px rules, e.g. GENE SETS ... [CREATE NEW] */
export const SectionBand = styled.div`
  align-items: center;
  border-bottom: 1px solid ${globals.borderStrong};
  border-top: 1px solid ${globals.borderStrong};
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
`;

export const SectionBandLabel = styled.span`
  align-items: center;
  color: ${globals.fgPrimary};
  cursor: pointer;
  display: inline-flex;
  font-family: ${globals.fontMonoCaps};
  font-size: 10px;
  font-weight: 700;
  gap: 4px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
