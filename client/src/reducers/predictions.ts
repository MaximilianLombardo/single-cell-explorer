import { AnyAction } from "redux";

/*
Prediction declarations, read from the dataset's uns["predictions"] key.

The annotation pipeline writes ordinary obs columns (a categorical annotation
and, optionally, a numeric per-cell confidence) plus a small manifest in uns
naming them. The declaration decorates the annotation in the UI — it does not
create a separate metadata namespace.
*/

export interface PredictionDeclaration {
  /** obs column holding the categorical annotation */
  column: string;
  /** optional obs column holding per-cell numeric confidence */
  confidence?: string;
  /** optional display strings */
  method?: string;
  run?: string;
}

export interface PredictionsState {
  declarations: PredictionDeclaration[];
  /** declaration lookup by annotation column name */
  byColumn: { [column: string]: PredictionDeclaration };
  /** every declared confidence column, for exclusion from the QC section */
  confidenceColumns: string[];
}

const initialState: PredictionsState = {
  declarations: [],
  byColumn: {},
  confidenceColumns: [],
};

const Predictions = (
  state: PredictionsState = initialState,
  action: AnyAction
): PredictionsState => {
  switch (action.type) {
    case "predictions: load success": {
      const declarations: PredictionDeclaration[] = (
        action.declarations ?? []
      ).filter((d: PredictionDeclaration) => d && typeof d.column === "string");
      const byColumn: PredictionsState["byColumn"] = {};
      const confidenceColumns: string[] = [];
      for (const d of declarations) {
        byColumn[d.column] = d;
        if (d.confidence) confidenceColumns.push(d.confidence);
      }
      return { declarations, byColumn, confidenceColumns };
    }
    default:
      return state;
  }
};

export default Predictions;
