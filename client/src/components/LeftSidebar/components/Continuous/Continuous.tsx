/* rc slider https://www.npmjs.com/package/rc-slider */

import React from "react";
import { connect } from "react-redux";
import BrushableHistogram from "common/components/BrushableHistogram/BrushableHistogram";
import Collapse from "util/collapse";
import { RootState } from "reducers";
import AnnoMatrix from "annoMatrix/annoMatrix";
import { AnnotationColumnSchema } from "common/types/schema";
import { CONTINUOUS_SECTION_TEST_ID } from "./constants";

interface StateProps {
  schema?: AnnoMatrix["schema"];
  confidenceColumns: RootState["predictions"]["confidenceColumns"];
}

function mapStateToProps(state: RootState): StateProps {
  return {
    schema: state.annoMatrix?.schema,
    confidenceColumns: state.predictions.confidenceColumns,
  };
}
class Continuous extends React.PureComponent<StateProps> {
  render() {
    /* initial value for iterator to simulate index, ranges is an object */
    const { schema, confidenceColumns } = this.props;
    if (!schema) return null;
    const obsIndex = schema.annotations.obs.index;
    const allContinuousNames = schema.annotations.obs.columns
      .filter(
        (col: AnnotationColumnSchema) =>
          col.type === "int32" || col.type === "float32"
      )
      .filter((col: AnnotationColumnSchema) => col.name !== obsIndex)
      .filter((col: AnnotationColumnSchema) => !col.writable) // skip user annotations - they will be treated as categorical
      .filter(
        /* declared confidence columns render inside their annotation block */
        (col: AnnotationColumnSchema) => !confidenceColumns.includes(col.name)
      )
      .map((col: AnnotationColumnSchema) => col.name);
    return allContinuousNames.length ? (
      <div
        data-testid={CONTINUOUS_SECTION_TEST_ID}
        style={{ padding: "0 10px" }}
      >
        {/* QC metrics are secondary to annotations: closed by default */}
        <Collapse isOpen={false}>
          <span>QC</span>
          {allContinuousNames.map((key, index) => (
            <BrushableHistogram
              key={key}
              field={key}
              isObs
              zebra={index % 2 === 0}
              onGeneExpressionComplete={() => {}}
              mini={false}
            />
          ))}
        </Collapse>
      </div>
    ) : null;
  }
}

export default connect(mapStateToProps)(Continuous);
