import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useState } from "react";
import { Arrow, Circle, Group, Layer, Rect, Stage, Text } from "react-konva";
import { TimelineVariables, useTimelineContext } from "./TimelineContext";
import { dataService } from "./data/data.service";
import {
  KonvaSpace,
  NodeID,
  ObjV2,
  RenderableNetworkEdge,
  RenderableNetworkNode,
  TimelineSpace,
} from "./types";
import { useData } from "./useAkita";

type NodesComponentProps = {
  nodes: RenderableNetworkNode[];
  updateEdgePositions: (
    node: NodeID,
    event: KonvaEventObject<MouseEvent>
  ) => void;
  highlightedNode: NodeID | null;
  edges: RenderableNetworkEdge[];
  onMouseOver: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  onSelectNode: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
};
export function NetworkNodes({
  nodes,
  edges,
  onMouseOver,
  onMouseLeave,
  onSelectNode,
  highlightedNode,
  updateEdgePositions,
}: // onMouseMove,
NodesComponentProps): JSX.Element {
  return (
    <Group>
      {/* TODO maybe pass a ref to the right circles to the edge obj? */}
      {nodes.map((node) => {
        return (
          <Circle
            draggable
            onDragMove={(event) => updateEdgePositions(node.id, event)}
            {...node.renderedProps.position}
            onMouseOver={(mouseEvent) => onMouseOver(node.id, mouseEvent)}
            onMouseLeave={(mouseEvent) => onMouseLeave(node.id, mouseEvent)}
            onMouseUp={(mouseEvent) => onSelectNode(node.id, mouseEvent)}
            // onMouseMove={(mouseEvent) => onMouseMove(event.id, mouseEvent)}

            radius={10}
            fill={
              highlightedNode === node.id ? "yellow" : node.renderedProps.color
            }
            stroke="black"
            strokeWidth={2}
          />
        );
      })}
      {edges.map((edge) => {
        return (
          <Arrow
            points={[
              edge.renderedProps.originPosition.x,
              edge.renderedProps.originPosition.y,
              edge.renderedProps.targetPosition.x,
              edge.renderedProps.targetPosition.y,
            ]}
            stroke="black"
            strokeWidth={2}
          />
        );
      })}
    </Group>
  );
}

// TODO
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
export function Network({ stageSize }: { stageSize: ObjV2 }): JSX.Element {
  const [
    {
      eventAdjMat: adjMat,
      renderableEventNetworkNodes: nodes,
      renderableEventEdges: edges,
      selectedNetworkNode,
    },
  ] = useData([
    "renderableEventEdges",
    "eventAdjMat",
    "renderableEventNetworkNodes",
    "selectedNetworkNode",
  ]);

  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<NodeID | null>(null);
  const flatAdjMat = adjMat ? adjMat.flat() : [];

  useEffect(() => {
    if (adjMat) {
      dataService.setNodesFromAdjMat(adjMat);
    }
  }, [JSON.stringify(flatAdjMat)]);
  // console.log("TEST123", nodes, adjMat);
  return (
    <>
      {nodes && nodes.length > 0 && (
        <Stage
          width={stageSize.x}
          height={stageSize.y}
          style={{ backgroundColor: "white" }}
        >
          <Layer x={TimelineVariables.timelineLeftPadding}>
            {nodes && edges && (
              <NetworkNodes
                nodes={nodes}
                // TODO generalize highlighting to allow for multiple different color meanings? or is this more the job of when data is passed in
                highlightedNode={selectedNetworkNode}
                edges={edges}
                onMouseOver={(id) => {
                  dataService.setHoveredNetworkNode(id);
                }}
                onSelectNode={(id) => {
                  dataService.setSelectedNode(id);
                }}
                onMouseLeave={() => {
                  setHighlightedNode(null);
                }}
                updateEdgePositions={(node, event) => {
                  dataService.moveNode(node, {
                    x: event.target.x() as KonvaSpace,
                    y: event.target.y() as KonvaSpace,
                  });
                }}
              />
            )}
            <TimelineTooltip tooltip={tooltip} />
          </Layer>
        </Stage>
      )}
    </>
  );
}
