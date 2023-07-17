import { KonvaEventObject } from "konva/lib/Node";
import { Arrow, Circle, Group, Layer, Stage } from "react-konva";
import type { ObjV2, RenderableNetworkEdge, TimelineSpace } from "type-library";
// TODO ?
import type { RenderableNetworkNode } from "type-library/src";
import { TimelineVariables } from "./TimelineContext";
import type { NodeID } from "./types";

export type NodesComponentProps = {
  nodes: RenderableNetworkNode[];
  onNodeMove: (node: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  highlightedNode: NodeID | null;
  edges: RenderableNetworkEdge[];
  onMouseOver: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  onSelectNode: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (id: NodeID, event: KonvaEventObject<MouseEvent>) => void;
  NodeTemplate: (args: {
    node: NodesComponentProps["nodes"][number];
  }) => JSX.Element;
};
export function NetworkNodeTemplate({
  node,

  onMouseOver,
  onMouseLeave,
  onSelectNode,
  highlightedNode,
  onNodeMove,
}: Pick<
  NodesComponentProps,
  | "onMouseLeave"
  | "onSelectNode"
  | "onMouseOver"
  | "onNodeMove"
  | "highlightedNode"
> & {
  node: NodesComponentProps["nodes"][number];
}): JSX.Element {
  return (
    <Circle
      {...node.renderedProps.position}
      draggable
      onDragMove={(nodeObj) => onNodeMove(node.id, nodeObj)}
      onMouseOver={(mouseEvent) => onMouseOver(node.id, mouseEvent)}
      onMouseLeave={(mouseEvent) => onMouseLeave(node.id, mouseEvent)}
      onMouseUp={(mouseEvent) => onSelectNode(node.id, mouseEvent)}
      radius={10}
      fill={highlightedNode === node.id ? "yellow" : node.renderedProps.color}
      stroke="black"
      strokeWidth={2}
    />
  );
}
export function NetworkNodes({
  nodes,
  edges,
  NodeTemplate,
}: // onMouseMove,
Pick<NodesComponentProps, "nodes" | "edges" | "NodeTemplate">): JSX.Element {
  // TODO useeffect hook here for node changing position
  return (
    <Group>
      {/* TODO maybe pass a ref to the right circles to the edge obj? */}
      {nodes.map((node, ii) => {
        return <NodeTemplate key={`node-${ii}`} node={node} />;
      })}
      {edges.map((edge) => {
        return (
          <Arrow
            key={`edge-${edge}`}
            points={[
              edge.renderedProps.position.origin.x,
              edge.renderedProps.position.origin.y,
              edge.renderedProps.position.target.x,
              edge.renderedProps.position.target.y,
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

// export function TimelineTooltip({
//   tooltip: tooltip,
// }: {
//   tooltip: Tooltip | null;
// }): JSX.Element {
//   const titlePosY = 0;
//   const tooltipHeight = 100;
//   const diamondSize = 10;
//   const diamondRadius = Math.sqrt(2 * diamondSize ** 2);

//   const { convertToKonvaCoord } = useTimelineContext();
//   return (
//     <>
//       {tooltip !== null && (
//         <Group x={convertToKonvaCoord(tooltip.pos)} y={100 / 2}>
//           <Rect
//             width={10}
//             height={10}
//             y={(-1 * diamondRadius) / 2}
//             rotation={45}
//             cornerRadius={2}
//             fill="gray"
//           />
//           <Group x={-1 * diamondRadius}>
//             <Rect
//               width={100}
//               height={tooltipHeight}
//               cornerRadius={5}
//               fill="gray"
//             />
//             <Text
//               text={tooltip.title}
//               y={titlePosY}
//               fontSize={20}
//               fontVariant="bold"
//               padding={10}
//               fontFamily="Calibri"
//               textFill="white"
//               fill="black"
//               alpha={0.75}
//             />
//             <Text
//               text={tooltip.desc}
//               y={titlePosY + 20}
//               fontSize={10}
//               padding={10}
//               fontFamily="Calibri"
//               textFill="white"
//               fill="black"
//               alpha={0.75}
//             />
//             <Text
//               text={tooltip.dates}
//               y={titlePosY + 40}
//               fontSize={10}
//               padding={10}
//               fontFamily="Calibri"
//               textFill="white"
//               fill="black"
//               alpha={0.75}
//             />
//           </Group>
//         </Group>
//       )}
//     </>
//   );
// }

export function NetworkComponent<
  TNode extends RenderableNetworkNode = RenderableNetworkNode,
  TEdge extends RenderableNetworkEdge = RenderableNetworkEdge
>({
  nodes,
  stageSize,
  edges,
  NodeTemplate,
}: {
  nodes: TNode[];
  stageSize: ObjV2;
  edges: TEdge[];
  NodeTemplate: NodesComponentProps["NodeTemplate"];
}): JSX.Element {
  console.log("TEST123-network", edges);
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
                NodeTemplate={NodeTemplate}
                nodes={nodes}
                edges={edges}
              />
            )}
            {/* <TimelineTooltip tooltip={tooltip} /> */}
          </Layer>
        </Stage>
      )}
    </>
  );
}

export function Network<
  TNode extends RenderableNetworkNode = RenderableNetworkNode,
  TEdge extends RenderableNetworkEdge = RenderableNetworkEdge
>({
  nodes,
  stageSize,
  edges,
  NodeTemplate,
}: {
  nodes: TNode[];
  stageSize: ObjV2;
  edges: TEdge[];
  NodeTemplate: NodesComponentProps["NodeTemplate"];
}): JSX.Element {
  return (
    <NetworkComponent
      nodes={nodes}
      stageSize={stageSize}
      edges={edges}
      NodeTemplate={NodeTemplate}
    />
  );
}
