import { dispatchNetworkErrorMessageToUser } from "./util/actionHelpers";
import ENV_DEFAULT from "../../environment.default.json";
import { DataPortalProps, S3URI } from "./common/types/entities";

/* visium embedding word, spatial image underlay */
export const spatialEmbeddingKeyword = "spatial";

/* overflow category values are created  using this string */
export const overflowCategoryLabel = ": all other labels";

/* default "unassigned" value for user-created categorical metadata */
export const unassignedCategoryLabel = "unassigned";

/** Maximum number of cells a dataset can have in order to be included for display. */
export const DATASET_MAX_CELL_COUNT = 2_000_000;

/* Explicit ontology term ids. */
export const ONTOLOGY_TERM_ID_KEYS = [
  "assay_ontology_term_id",
  "cell_type_ontology_term_id",
  "development_stage_ontology_term_id",
  "disease_ontology_term_id",
  "organism_ontology_term_id",
  "self_reported_ethnicity_ontology_term_id",
  "sex_ontology_term_id",
  "tissue_ontology_term_id",
];

/* Unified navigation bar header height. */
export const HEADER_HEIGHT_PX = 52;

/* Added to Portal links from breadcrumbs if there is work in progress */
export const QUERY_PARAM_EXPLAIN_NEW_TAB = "explainNewTab";

/**
 * Matches a path starting with "/" followed by any single character (as the dataroot), followed by a slash, then captures
 * any sequence of characters (representing optional subdirectories) followed by another sequence of characters (the target directory)
 * and ending with "api". This setup ensures it starts capturing at the single-character dataroot and includes any optional subpaths.
 */
const REGEX_PATHNAME = /(?<=\/)[^/]{1}\/(?:[^/]+\/)*[^/]+\/(?=api)/;

/**
 * This regex is used to update the API prefix when the dataset selector is used.
 * It matches the previous two segments (demarcated by `/`) leading up to `/api`.
 * In deployed environments, these segments will be `s3_uri` and the S3 URI of the dataset.
 * We require a separate REGEX because the dataset selector is applied to an API prefix that
 * has already been updated with the S3 URI of the dataset.
 */
const REGEX_PATHNAME_FOR_DATASET_SELECTOR = /(?<=\/)\w+\/[^/]+\/(?=api)/;

/* Config links types */
export type ConfigLink = "about-dataset" | "collections-home-page";

/* rough shape of config object */
export interface Config {
  corpora_props: DataPortalProps;
  features: Record<string, unknown>;
  displayNames: Record<string, unknown>;
  library_versions: LibraryVersions;
  parameters: {
    about_legal_privacy?: string;
    about_legal_tos?: string;
    "disable-diffexp"?: boolean;
    "diffexp-may-be-slow"?: boolean;
    default_embedding?: string;
    "max-category-items"?: number;
    [key: string]: unknown;
  };
  portalUrl: string;
  links: Record<ConfigLink, unknown>;
  limits: {
    column_request_max?: number;
    diffexp_cellcount_max?: number;
  };
}

/* shape of config library_versions */
export interface LibraryVersions {
  anndata: string;
  cellxgene: string;
}

/*
these are default values for configuration the CLI may supply.
See the REST API and CLI specs for more info.
*/
export const configDefaults: Config = {
  features: {},
  displayNames: {},
  parameters: {
    "disable-diffexp": false,
    "diffexp-may-be-slow": false,
  },
  // @ts-expect-error -- Revisit typings here with respect to CLI defaults
  links: {},
};

/*
Most configuration is stored in the reducer.  A handful of values
are global and stored here.  They are typically set by the config
action handler, which pull the information from the backend/CLI.

All should be set here to their default value.
*/
export const globalConfig = {
  /* if a categorical metadata field has more options than this, truncate */
  maxCategoricalOptionsToDisplay: 200,
};

/* is mac os? */
export const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

/* ---------------------------------------------------------------------------
Blueprint Instrument design tokens.
Sharp, technical, instrument-like: white/cool-gray surfaces, 1px rules,
square corners, restrained cyan accent, mono type for data readouts.
--------------------------------------------------------------------------- */

/* surfaces */
export const surface = "#FFFFFF";
export const surfaceSecondary = "#F7F8FA";

/* ink */
export const fgPrimary = "#1A1A1A";
export const fgSecondary = "#666666";
export const fgMuted = "#888888";

/* rules & borders */
export const borderStrong = "#1A1A1A"; /* panel/structural rules */
export const borderSubtle = "#EEF0F2"; /* hairline separators */
export const borderControl = "#C9CFD5"; /* control outlines */
export const borderInner = "#E4E8EC"; /* dividers inside control groups */

/* accent */
export const accent = "#4A9FD8";

/* Color-vision-deficiency-safe categorical palette (Okabe-Ito derived).
   Used as the default cell-category scale; dataset-supplied colors win. */
export const categoricalPalette = [
  "#009E73",
  "#CC79A7",
  "#E69F00",
  "#56B4E9",
  "#D1B900",
  "#7CE3CB",
  "#9A7FD8",
  "#D55E00",
];

/* instrument type stacks */
export const fontHead = `"Geist", "Inter", "Helvetica Neue", sans-serif`;
export const fontBody = `"Inter", "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
export const fontMonoCaps = `"IBM Plex Mono", "Menlo", "Consolas", monospace`;
export const fontMonoData = `"Geist Mono", "IBM Plex Mono", "Menlo", monospace`;

/* legacy color aliases — kept so existing imports keep working */
export const blue = accent;
export const linkBlue = accent;
export const lightestGrey = surfaceSecondary;
export const lighterGrey = surfaceSecondary;
export const lightGrey = borderControl;
export const mediumGrey = fgMuted;
export const darkGrey = fgSecondary;
export const darkerGrey = "#333333";

export const brightBlue = accent;
export const brightGreen = "#A2D729";
export const darkGreen = "#448C4D";

export const nonFiniteCellColor = lightGrey;
export const logoColor = fgPrimary; /* logo pink: "#E9429A" */

/* typography constants */

export const tiniestFontSize = 11;
export const largestFontSize = 22;
export const uppercaseLetterSpacing = "0.06em";
export const bold = 600;
export const bolder = 700;
export const accentFont = fontHead;
export const maxParagraphWidth = 600;

/* layout styles constants */

export const cellxgeneTitleLeftPadding = 14;
export const cellxgeneTitleTopPadding = 7;

export const datasetTitleMaxCharacterCount = 25;

export const maxControlsWidth = 800;

export const graphMargin = { top: 20, right: 10, bottom: 30, left: 40 };
export const graphWidth = 700;
export const graphHeight = 700;
export const scatterplotMarginLeft = 11;

/* 52px nav / 260px metadata panel / fluid canvas / 260px genes panel */
export const rightSidebarWidth = 260;
export const leftSidebarWidth = 260;
/* panel collapse/expand animation duration */
export const sidebarTransitionMs = 220;
export const leftSidebarSectionHeading = {
  fontSize: 11,
  textTransform: "uppercase",
  fontWeight: 600,
  letterSpacing: ".06em",
  fontFamily: fontMonoCaps,
};
export const leftSidebarSectionPadding = 10;
export const rightSidebarSectionPadding = 10;
export const categoryLabelDisplayStringLongLength = 20;
export const categoryLabelDisplayStringShortLength = 10;
export const categoryDisplayStringMaxLength = 24;

export const maxUserDefinedGenes = 25;
export const maxGenes = 100;

export const diffexpPopNamePrefix1 = "Pop1 high";
export const diffexpPopNamePrefix2 = "Pop2 high";

export const bottomToolbarGutter = 48;

/* Maximum number of menu items displayable in menu before scroll is enabled */
export const maxMenuItemCount = 9;

/* various timing-related behaviors */
export const tooltipHoverOpenDelay = 1000; /* ms delay before a tooltip displays */
export const tooltipHoverOpenDelayQuick = 500;

/* number of bins to use for lossy integer compression */
export const numBinsEmb = 5000;
export const numBinsObsX = 500;

const CXG_SERVER_PORT =
  process.env.CXG_SERVER_PORT || ENV_DEFAULT.CXG_SERVER_PORT;

let _API;

declare global {
  interface Window {
    CELLXGENE: {
      API: {
        prefix: string;
        version: string;
      };
    };
  }
}

if (typeof window !== "undefined" && window?.CELLXGENE?.API) {
  _API = window.CELLXGENE.API;
} else if (CXG_SERVER_PORT === undefined) {
  const errorMessage = "Please set the CXG_SERVER_PORT environment variable.";
  dispatchNetworkErrorMessageToUser(errorMessage);
  _API = {};
  throw new Error(errorMessage);
}

export const API = _API;

/**
 * Update the base API URL for the current dataset using the current origin and pathname.
 */
export function updateApiPrefix(): void {
  if (typeof window === "undefined" || !API) {
    throw new Error("Unable to set API route.");
  }
  const { location } = window;
  // Remove leading slash as regex uses leading slash in lookbehind and is therefore not replaced.
  const pathname = location.pathname.substring(1);
  // For the API prefix in the format protocol/host/pathSegement/e/uuid.cxg, replace /e/uuid.cxg with the corresponding
  // path segments taken from the pathname.
  API.prefix = API.prefix.replace(
    REGEX_PATHNAME_FOR_DATASET_SELECTOR,
    pathname
  );
}

/**
 * Update the base API URL for the current dataset using the S3 URI of the current dataset.
 * @param s3Uri S3 URI of the current dataset.
 * @returns The old API prefix.
 */
export function updateAPIWithS3(s3URI: S3URI): string {
  if (!API) {
    throw new Error("Unable to set API route.");
  }
  const oldAPI = API.prefix;
  // must be double quoted so slashes are not decoded early by flask WSGI.
  const URISafeS3URI = encodeURIComponent(s3URI);
  const flaskSafeS3URI = `s3_uri/${encodeURIComponent(URISafeS3URI)}/`;
  API.prefix = API.prefix.replace(REGEX_PATHNAME, flaskSafeS3URI);
  return oldAPI;
}
