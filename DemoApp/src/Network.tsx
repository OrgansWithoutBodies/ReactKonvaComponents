import { useEffect, useState } from "react";
import { NodeID } from "type-library";
import { ObjV2 } from "type-library/dist/vectors";
import { KonvaSpace } from "type-library/src";
import {
  NetworkComponent,
  NetworkNodeTemplate,
  NodesComponentProps,
} from "../../src/Network";
import { dataService } from "./data/data.service";
import { useData } from "./useAkita";

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
  const NodeTemplate: NodesComponentProps["NodeTemplate"] = ({ node }) => (
    <NetworkNodeTemplate
      onNodeMove={(updatingNode, event) =>
        dataService.moveNode(updatingNode, {
          x: event.target.x() as KonvaSpace,
          y: event.target.y() as KonvaSpace,
        })
      }
      highlightedNode={highlightedNode}
      onMouseOver={(id) => {
        dataService.setHoveredNetworkNode(id);
      }}
      onSelectNode={(id) => {
        dataService.setSelectedNode(id);
      }}
      onMouseLeave={() => {
        setHighlightedNode(null);
      }}
      node={node}
    />
  );

  // const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<NodeID | null>(null);
  const flatAdjMat = adjMat ? adjMat.flat() : [];

  useEffect(() => {
    if (adjMat) {
      dataService.setNodesFromAdjMat(adjMat);
    }
  }, [JSON.stringify(flatAdjMat)]);
  // console.log("TEST123", nodes, adjMat);
  return (
    <NetworkComponent
      stageSize={stageSize}
      nodes={nodes}
      edges={edges}
      NodeTemplate={NodeTemplate}
      // TODO edgetemplate
    />
  );
}
