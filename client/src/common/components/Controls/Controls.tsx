/* Core dependencies */
import React from "react";

interface Props {
  children: React.ReactNode;
  bottom?: number;
}

/**
 * Controls component for positioning graph controls.
 * @returns Markup displaying children positioned within the graph grid template area.
 */
function Controls(props: Props): JSX.Element {
  const { children, bottom } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        position: "absolute",
        zIndex: 3,
        /* top rail spans the full canvas width; bottom controls stay inset */
        ...(bottom !== undefined
          ? { bottom, left: 8, right: 8 }
          : { top: 0, left: 0, right: 0 }),
      }}
    >
      {children}
    </div>
  );
}

export default Controls;
