/* Core dependencies */
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React, { FC, ReactNodeArray, useState } from "react";

/* Styles */
import * as globals from "../../globals";

interface Props {
  children: ReactNodeArray;
  isOpen?: boolean;
}

/*
 Expands and collapses content, executed by onClick or onKeyPress of the collapse target.
 Rendered as an instrument section header: mono caps between 1px rules.
 */
const Collapse: FC<Props> = ({ children, isOpen = true }): JSX.Element => {
  const [label, content] = children;
  const [isExpanded, setIsExpanded] = useState(isOpen);
  return (
    <>
      <span
        onClick={() => setIsExpanded((expanded) => !expanded)}
        onKeyPress={() => setIsExpanded((expanded) => !expanded)}
        role="menuitem"
        style={{
          alignItems: "center",
          borderBottom: `1px solid ${globals.borderStrong}`,
          borderTop: `1px solid ${globals.borderStrong}`,
          color: globals.fgPrimary,
          cursor: "pointer",
          display: "flex",
          flexBasis: "100%",
          justifyContent: "space-between",
          lineHeight: "16px",
          margin: "10px 0 8px 0",
          padding: "4px 0",
          width: "100%",
        }}
        tabIndex={0}
      >
        <span
          style={{
            fontFamily: globals.fontMonoCaps,
            fontSize: 10,
            fontWeight: globals.bold,
            letterSpacing: "0.06em",
            marginRight: 4,
            padding: "2px 0",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {isExpanded ? (
          <Icon icon={IconNames.CHEVRON_DOWN} size={12} />
        ) : (
          <Icon icon={IconNames.CHEVRON_RIGHT} size={12} />
        )}
      </span>
      {isExpanded ? content : null}
    </>
  );
};

export default Collapse;
