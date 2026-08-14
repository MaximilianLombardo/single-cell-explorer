import React from "react";
import {
  ButtonGroup,
  Icon,
  Intent,
  NumericInput,
  Position,
  Popover,
  Tooltip,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { tooltipHoverOpenDelay } from "~/globals";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module './menubar.css' or its correspo... Remove this comment to see the full error message
import styles from "../../menubar.css";
import { ClipProps } from "./types";
import {
  ClipCommitButton,
  ClipPopoverContent,
  ClipRangeRow,
  ClipRangeSeparator,
  ClipTriggerButton,
  PercentageIconWrapper,
} from "./style";

function Clip(props: ClipProps) {
  const {
    pendingClipPercentiles,
    clipPercentileMin,
    clipPercentileMax,
    handleClipOpening,
    handleClipClosing,
    handleClipCommit,
    isClipDisabled,
    handleClipOnKeyPress,
    handleClipPercentileMaxValueChange,
    handleClipPercentileMinValueChange,
  } = props;

  const clipMin =
    pendingClipPercentiles?.clipPercentileMin ?? clipPercentileMin;
  const clipMax =
    pendingClipPercentiles?.clipPercentileMax ?? clipPercentileMax;
  const intent =
    clipPercentileMin > 0 || clipPercentileMax < 100
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
        (Intent as any).INTENT_WARNING
      : Intent.NONE;

  return (
    <ButtonGroup className={`${styles.menubarButton}`}>
      <Popover
        renderTarget={({
          ref: tooltipRef,
          isOpen: _tooltipIsOpen,
          ...tooltipProps
        }) => (
          <Tooltip
            content="Clip all continuous values to a percentile range"
            position="bottom"
            hoverOpenDelay={tooltipHoverOpenDelay}
          >
            <ClipTriggerButton
              type="button"
              data-testid="visualization-settings"
              intent={intent}
              icon={IconNames.TIMELINE_BAR_CHART}
              ref={tooltipRef}
              {...tooltipProps}
            />
          </Tooltip>
        )}
        position={Position.BOTTOM_RIGHT}
        onOpening={handleClipOpening}
        onClosing={handleClipClosing}
        content={
          <ClipPopoverContent>
            <div>Clip all continuous values to percentile range</div>
            <ClipRangeRow>
              <NumericInput
                // Blueprint routes `className` to the outer ControlGroup but
                // `style` to the inner <input>, so this width cannot move to
                // style.ts without changing which element it sizes.
                style={{ width: 50 }}
                data-testid="clip-min-input"
                onValueChange={handleClipPercentileMinValueChange}
                onKeyUp={(event: React.KeyboardEvent) =>
                  handleClipOnKeyPress(event as unknown as KeyboardEvent)
                }
                value={clipMin}
                min={0}
                max={100}
                fill={false}
                minorStepSize={null}
                rightElement={
                  <PercentageIconWrapper>
                    <Icon icon="percentage" intent="primary" size={14} />
                  </PercentageIconWrapper>
                }
              />
              <ClipRangeSeparator> - </ClipRangeSeparator>
              <NumericInput
                // See note on the min input above.
                style={{ width: 50 }}
                data-testid="clip-max-input"
                onValueChange={handleClipPercentileMaxValueChange}
                onKeyUp={(event: React.KeyboardEvent) =>
                  handleClipOnKeyPress(event as unknown as KeyboardEvent)
                }
                value={clipMax}
                min={0}
                max={100}
                fill={false}
                minorStepSize={null}
                rightElement={
                  <PercentageIconWrapper>
                    <Icon icon="percentage" intent="primary" size={14} />
                  </PercentageIconWrapper>
                }
              />
              <ClipCommitButton
                type="button"
                data-testid="clip-commit"
                intent="primary"
                disabled={isClipDisabled()}
                onClick={handleClipCommit}
              >
                Clip
              </ClipCommitButton>
            </ClipRangeRow>
          </ClipPopoverContent>
        }
      />
    </ButtonGroup>
  );
}

export default React.memo(Clip);
