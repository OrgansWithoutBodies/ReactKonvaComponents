import {
  AdjacencyMatrix,
  HexString,
  KonvaSpace,
  TimeSpace,
} from "type-library";
import { ObjV2 } from "type-library/dist/vectors";
import { forceDirectedGraph } from "../../../src/layoutNetwork";
import { EventID, NodeID } from "../../../src/types";
import { DataStore, NodePropsLookup, dataStore } from "./data.store";
type CellID = [number, number];

export const getRandomColor = (): HexString => {
  // return "#FFFFFF";

  const channelSize = 16;
  const charCode = new Array(6)
    .fill(0)
    .map(() => Math.round(Math.random() * channelSize).toString(16))
    .reduce((prev, curr) => prev + curr);

  return `#${charCode}`;
};
export class DataService {
  public setInitialDateFilter(initialDateFilter: TimeSpace | null) {
    this.dataStore.update((state) => {
      return {
        ...state,
        initialDateFilter,
      };
    });
  }
  public setFinalDateFilter(finalDateFilter: TimeSpace | null) {
    this.dataStore.update((state) => {
      return {
        ...state,
        finalDateFilter,
      };
    });
  }

  public moveNode(id: NodeID, newPosition: ObjV2<KonvaSpace>) {
    // console.log("TEST123-service", id, newPosition);
    this.dataStore.update((state) => {
      const mutableNodeLookup: NodePropsLookup = {
        ...state.networkNodeProps,
        [id]: {
          ...(state.networkNodeProps[id] || { color: "#FFFFFF" }),
          position: newPosition,
        },
      };
      return { ...state, networkNodeProps: mutableNodeLookup };
    });
  }

  public recolorNode(id: NodeID, newColor: HexString) {
    this.dataStore.update((state) => {
      const mutableNodeLookup: NodePropsLookup = {
        ...state.networkNodeProps,
        [id]: {
          ...state.networkNodeProps[id],
          color: newColor,
        },
      };

      return { ...state, networkNodes: mutableNodeLookup };
    });
  }

  public setNodesFromAdjMat(adjMat: AdjacencyMatrix<0 | 1 | -1>) {
    const placements = forceDirectedGraph({ G: adjMat, H: 300, W: 300 });

    placements.forEach((placement, ii) => {
      this.moveNode(ii as NodeID, {
        x: Math.max(placement.x, 0) as KonvaSpace,
        y: Math.max(placement.y, 0) as KonvaSpace,
      });
      this.recolorNode(ii as NodeID, getRandomColor());
    });
  }
  // {
  //   pos: hitEvent.renderedProps.position,
  //   dates: formatDates(hitEvent),
  //   desc: hitEvent.eventInfo,
  //   title: hitEvent.eventName,
  // }
  public setHoveredEvent(eventId: EventID) {
    this.dataStore.update((state) => {
      return { ...state, hoveredEvent: eventId };
    });
  }
  public setSelectedEvent(eventId: EventID) {
    this.dataStore.update((state) => {
      return { ...state, selectedEvent: eventId };
    });
  }
  public setSelectedNode(nodeID: NodeID) {
    this.dataStore.update((state) => {
      return { ...state, selectedNetworkNode: nodeID };
    });
  }
  public setHoveredAdjMatCell(cellID: CellID) {
    this.dataStore.update((state) => {
      return { ...state, hoveredAdjMatCell: cellID };
    });
  }
  public setHoveredNetworkNode(nodeID: NodeID) {
    this.dataStore.update((state) => {
      return { ...state, hoveredNetworkNode: nodeID };
    });
  }
  constructor(private dataStore: DataStore) {}
}

export const dataService = new DataService(dataStore);
