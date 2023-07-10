import { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import {
  Arrow,
  Circle,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from "react-konva";
import {
  TimelineContext,
  TimelineVariables,
  useTimelineContext,
} from "./TimelineContext";
import { orderedNumbers } from "./orderedNumbers";
import {
  EventID,
  ObjV2,
  RenderableEvent,
  TimeSpace,
  TimelineSpace,
} from "./types";

export function TimelineBackground({
  lastDate,
  firstDate,
}: {
  lastDate: TimeSpace;
  firstDate: TimeSpace;
}): JSX.Element {
  // TODO put the dates these markers correspond to? toggleable?
  const {
    numDivisions,
    smallDivsPerBigDiv,
    divisionSpace,
    divisionLen,
    smallDivHeight,
    convertToKonvaCoord,
  } = useTimelineContext();

  const endpointSize = 30;
  const bigLines = orderedNumbers(numDivisions);
  const smallLines = orderedNumbers(numDivisions * smallDivsPerBigDiv);

  return (
    <Group>
      {bigLines.map((_, ii) => {
        return (
          <Line
            x={0}
            y={0}
            stroke={"black"}
            points={[ii * divisionSpace, 0, ii * divisionSpace, divisionLen]}
          />
        );
      })}
      {smallLines.map((_, jj) => {
        return (
          <Line
            x={0}
            y={0}
            stroke={"black"}
            points={[
              ((jj + 1) * divisionSpace) / smallDivsPerBigDiv,
              divisionLen / 2 - smallDivHeight / 2,

              ((jj + 1) * divisionSpace) / smallDivsPerBigDiv,
              divisionLen / 2 + smallDivHeight / 2,
            ]}
          />
        );
      })}
      <Arrow
        x={0}
        y={0}
        stroke={"black"}
        points={[
          0,
          divisionLen / 2,
          convertToKonvaCoord(1 as TimelineSpace),
          divisionLen / 2,
        ]}
      />
      <Group y={divisionLen}>
        <Text
          fontSize={20}
          padding={10}
          fontFamily="Calibri"
          fontVariant="bold"
          textFill="white"
          fill="black"
          text={firstDate.toString()}
          x={0 - endpointSize}
        />
        <Text
          fontSize={20}
          padding={10}
          fontFamily="Calibri"
          textFill="white"
          fill="black"
          fontVariant="bold"
          text={lastDate.toString()}
          x={convertToKonvaCoord(1 as TimelineSpace) - endpointSize}
        />
      </Group>
    </Group>
  );
}

export function TimelineEvents({
  events,
  selectedEventId,
  onMouseOver,
  onMouseLeave,
  onSelectEvent,
}: // onMouseMove,
{
  events: RenderableEvent[];
  selectedEventId: EventID | null;
  onMouseOver: (id: EventID, event: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (id: EventID, event: KonvaEventObject<MouseEvent>) => void;
  onSelectEvent: (id: EventID, event: KonvaEventObject<MouseEvent>) => void;
  // onMouseMove: (id: EventID, event: KonvaEventObject<MouseEvent>) => void;
}): JSX.Element {
  const { convertToKonvaCoord, divisionLen } = useTimelineContext();
  return (
    <Group>
      {events.map((event) => {
        return (
          <Circle
            onMouseOver={(mouseEvent) => onMouseOver(event.id, mouseEvent)}
            onMouseLeave={(mouseEvent) => onMouseLeave(event.id, mouseEvent)}
            onMouseUp={(mouseEvent) => onSelectEvent(event.id, mouseEvent)}
            // onMouseMove={(mouseEvent) => onMouseMove(event.id, mouseEvent)}
            x={convertToKonvaCoord(event.renderedProps.position)}
            y={divisionLen / 2}
            radius={10}
            fill={
              selectedEventId === event.id
                ? "yellow"
                : event.renderedProps.color
            }
            stroke="black"
            strokeWidth={2}
          />
        );
      })}
    </Group>
  );
}
type Tooltip = {
  title: string;
  desc: string;
  pos: TimelineSpace;
  dates: string;
};

export function TimelineTooltip({
  tooltip: tooltip,
}: {
  tooltip: Tooltip | null;
}): JSX.Element {
  const titlePosY = 0;
  const tooltipHeight = 100;
  const diamondSize = 10;
  const diamondRadius = Math.sqrt(2 * diamondSize ** 2);

  const { convertToKonvaCoord } = useTimelineContext();
  return (
    <>
      {tooltip !== null && (
        <Group x={convertToKonvaCoord(tooltip.pos)} y={100 / 2}>
          <Rect
            width={10}
            height={10}
            y={(-1 * diamondRadius) / 2}
            rotation={45}
            cornerRadius={2}
            fill="gray"
          />
          <Group x={-1 * diamondRadius}>
            <Rect
              width={100}
              height={tooltipHeight}
              cornerRadius={5}
              fill="gray"
            />
            <Text
              text={tooltip.title}
              y={titlePosY}
              fontSize={20}
              fontVariant="bold"
              padding={10}
              fontFamily="Calibri"
              textFill="white"
              fill="black"
              alpha={0.75}
            />
            <Text
              text={tooltip.desc}
              y={titlePosY + 20}
              fontSize={10}
              padding={10}
              fontFamily="Calibri"
              textFill="white"
              fill="black"
              alpha={0.75}
            />
            <Text
              text={tooltip.dates}
              y={titlePosY + 40}
              fontSize={10}
              padding={10}
              fontFamily="Calibri"
              textFill="white"
              fill="black"
              alpha={0.75}
            />
          </Group>
        </Group>
      )}
    </>
  );
}

// function timelineContextProvider = Contextprop
export function Timeline({
  stageSize,
  events,
  latestEventEnd,
  earliestEventStart,
  onSelectEvent,
  onHoveredEvent,
  selectedEventId,
}: {
  stageSize: ObjV2;
  onHoveredEvent: (id: string) => void;
  onSelectEvent: (id: string) => void;
  events: any;
  latestEventEnd: any;
  earliestEventStart: any;
  selectedEventId: any;
}): JSX.Element {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  // const [
  //   {
  //     renderReadyEvents: events,
  //     finalDateFilterWithFallback: latestEventEnd,
  //     initialDateFilterWithFallback: earliestEventStart,
  //     selectedEventId,
  //   },
  // ] = useData([
  //   "renderReadyEvents",
  //   "finalDateFilterWithFallback",

  //   "initialDateFilterWithFallback",
  //   "selectedEventId",
  // ]);

  return (
    <TimelineContext.Provider value={TimelineVariables}>
      <Stage
        width={stageSize.x}
        height={stageSize.y}
        style={{ backgroundColor: "white" }}
      >
        <Layer x={TimelineVariables.timelineLeftPadding}>
          {latestEventEnd && earliestEventStart && (
            <TimelineBackground
              lastDate={latestEventEnd}
              firstDate={earliestEventStart}
            />
          )}
          {events && (
            <TimelineEvents
              events={events}
              selectedEventId={selectedEventId}
              onMouseOver={function (
                id: EventID,
                event: KonvaEventObject<MouseEvent>
              ): void {
                const hitEvent = events.find(
                  ({ id: sourceId }) => sourceId === id
                );
                if (hitEvent) {
                  onHoveredEvent(hitEvent.id);
                }
              }}
              onSelectEvent={function (
                id: EventID,
                event: KonvaEventObject<MouseEvent>
              ): void {
                const hitEvent = events.find(
                  ({ id: sourceId }) => sourceId === id
                );
                if (hitEvent) {
                  onSelectEvent(hitEvent.id);
                }
              }}
              onMouseLeave={function (): void {
                setTooltip(null);
              }}
              // onMouseMove={function (
              //   id: EventID,
              //   event: KonvaEventObject<MouseEvent>
              // ): void {
              //   throw new Error("Function not implemented.");
              // }}
            />
          )}
          <TimelineTooltip tooltip={tooltip} />
        </Layer>
      </Stage>
    </TimelineContext.Provider>
  );
}

// export function FilterEvents(): JSX.Element {
//   const [
//     {
//       initialDateFilter,
//       finalDateFilter,
//       unfilteredEarliestEventStart: earliestEventStart,
//       unfilteredLatestEventEnd: latestEventEnd,
//       numberEventsAfterFilter,
//     },
//   ] = useData([
//     "initialDateFilter",
//     "finalDateFilter",
//     "unfilteredEarliestEventStart",
//     "unfilteredLatestEventEnd",
//     "numberEventsAfterFilter",
//   ]);
//   return (
//     <>
//       {latestEventEnd && earliestEventStart && (
//         <>
//           <div>
//             <div>Start Filter</div>
//             <input
//               type="number"
//               min={earliestEventStart}
//               max={latestEventEnd}
//               value={
//                 initialDateFilter !== null
//                   ? initialDateFilter
//                   : earliestEventStart
//               }
//               onChange={(event) => {
//                 const inputValue = Number.parseInt(
//                   event.target.value
//                 ) as TimeSpace;
//                 if (
//                   inputValue >= earliestEventStart &&
//                   inputValue <= latestEventEnd
//                 ) {
//                   dataService.setInitialDateFilter(inputValue);
//                 }
//               }}
//             />
//           </div>
//           <div>
//             <div>End Filter</div>
//             <input
//               type="number"
//               min={earliestEventStart}
//               max={latestEventEnd}
//               value={
//                 finalDateFilter !== null ? finalDateFilter : latestEventEnd
//               }
//               onChange={(event) => {
//                 const inputValue = Number.parseInt(
//                   event.target.value
//                 ) as TimeSpace;
//                 if (
//                   inputValue >= earliestEventStart &&
//                   inputValue <= latestEventEnd
//                 ) {
//                   dataService.setFinalDateFilter(inputValue);
//                 }
//               }}
//             />
//           </div>
//         </>
//       )}{" "}
//     </>
//   );
// }

// TODO use timeline as "scrubber" to filter time (potentially two handles)

// TODO control panel/add new data panel
// TODO actions for chosen in info panel?
// TODO 'toolbelt' for changing the way we interact w components
// todo standard name for components
