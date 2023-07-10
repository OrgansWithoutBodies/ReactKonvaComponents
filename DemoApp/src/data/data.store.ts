import { Store } from "@datorama/akita";
import type {
  Agent,
  ArrV2,
  EventID,
  HexStr,
  HistoricalEvent,
  KonvaSpace,
  NodeID,
  ObjV2,
  TimeSpace,
} from "../../src/types";

type NodeRenderProps = { position: ObjV2<KonvaSpace>; color: HexStr };
export type NodePropsLookup = Record<NodeID, NodeRenderProps>;

export interface DataState {
  hoveredEvent: EventID | null;
  selectedEvent: EventID | null;
  hoveredAdjMatCell: ArrV2 | null;
  hoveredNetworkNode: NodeID | null;
  selectedNetworkNode: NodeID | null;
  events: HistoricalEvent[];
  agents: Agent[];
  initialDateFilter: TimeSpace | null;
  finalDateFilter: TimeSpace | null;
  networkNodeProps: NodePropsLookup;
}

// TODO persist
export function createInitialState(): DataState {
  return {
    hoveredAdjMatCell: null,
    hoveredEvent: null,
    hoveredNetworkNode: null,
    selectedNetworkNode: null,
    networkNodeProps: {},
    agents: [
      { id: 0, name: "Lithuania" },
      { id: 1, name: "Poland" },
      { id: 2, name: "Prussia" },
      { id: 3, name: "Russia" },
      { id: 4, name: "USSR" },
      { id: 5, name: "USA" },
      { id: 6, name: "Sweden" },
      { id: 7, name: "Teutons" },
      { id: 8, name: "Vatican" },
      { id: 9, name: "Austria" },
      { id: 10, name: "Nazi Germany" },
      { id: 11, name: "Germany" },
    ],
    events: [
      {
        id: 1 as EventID,
        eventTime: 1569 as TimeSpace,
        eventName: "Union of Lublin",
        eventInfo: "https://en.wikipedia.org/wiki/Union_of_Lublin",
        participants: [1, 0],
      },
      {
        id: 2 as EventID,
        eventTime: { start: 1648 as TimeSpace, end: 1657 as TimeSpace },
        eventName: "Khmelnytsky Uprising",
        eventInfo: "https://en.wikipedia.org/wiki/Khmelnytsky_Uprising",
      },
      {
        id: 3123 as EventID,
        eventTime: 1772 as TimeSpace,
        eventName: "First Partition of Poland",
        eventInfo: "https://en.wikipedia.org/wiki/First_Partition_of_Poland",
        participants: [1, 0, 2, 3, 9],
      },
      {
        id: 3124 as EventID,
        eventTime: 1793 as TimeSpace,
        eventName: "Second Partition of Poland",
        eventInfo: "https://en.wikipedia.org/wiki/Second_Partition_of_Poland",
        participants: [1, 0, 2, 3, 9],
      },
      {
        id: 3125 as EventID,
        eventTime: 1795 as TimeSpace,
        eventName: "Third Partition of Poland",
        eventInfo: "https://en.wikipedia.org/wiki/Third_Partition_of_Poland",
        participants: [1, 0, 2, 3, 9],
      },
      {
        id: 4 as EventID,
        eventTime: 1253 as TimeSpace,
        eventName: "Coronation of Mindaugas",
        eventInfo: "https://en.wikipedia.org/wiki/Mindaugas",
      },
      {
        id: 1231 as EventID,
        eventTime: { start: 1409 as TimeSpace, end: 1411 as TimeSpace },
        eventName: "Polish–Lithuanian–Teutonic War",
        eventInfo:
          "https://en.wikipedia.org/wiki/Polish%E2%80%93Lithuanian%E2%80%93Teutonic_War",
        participants: [0, 7],
      },
      {
        id: 1238 as EventID,
        eventTime: { start: 1654 as TimeSpace, end: 1667 as TimeSpace },
        eventName: "Russo-Polish War/First Northern War",
        eventInfo:
          "https://en.wikipedia.org/wiki/Russo-Polish_War_(1654%E2%80%931667)",
      },
      {
        id: 1237 as EventID,
        eventTime: { start: 1830 as TimeSpace, end: 1831 as TimeSpace },
        eventName: "November Insurrection",
        eventInfo: "https://en.wikipedia.org/wiki/November_Uprising",
      },
      {
        id: 1239 as EventID,
        eventTime: { start: 1700 as TimeSpace, end: 1721 as TimeSpace },
        eventName: "Great Northern War",
        eventInfo: "https://en.wikipedia.org/wiki/Great_Northern_War",
      },
      {
        id: 5 as EventID,
        eventTime: 1918 as TimeSpace,
        eventName: "Establishment of First Republic",
        eventInfo: "https://en.wikipedia.org/wiki/First_Seimas_of_Lithuania",
      },
      {
        id: 6 as EventID,
        eventTime: { start: 1940 as TimeSpace, end: 1941 as TimeSpace },
        eventName: "First Period of LTSR",
        eventInfo:
          "https://en.wikipedia.org/wiki/Lithuanian_Soviet_Socialist_Republic",
        participants: [0, 4],
      },
      {
        id: 7 as EventID,
        eventTime: { start: 1944 as TimeSpace, end: 1990 as TimeSpace },
        eventName: "Second Period of LTSR",
        eventInfo:
          "https://en.wikipedia.org/wiki/Lithuanian_Soviet_Socialist_Republic",
        participants: [0, 4],
      },
    ],
    initialDateFilter: null,
    finalDateFilter: null,
    selectedEvent: null,
  };
}

// @StoreConfig({ name: "data" })
export class DataStore extends Store<DataState> {
  constructor() {
    super(createInitialState());
  }
}

export const dataStore = new DataStore();
