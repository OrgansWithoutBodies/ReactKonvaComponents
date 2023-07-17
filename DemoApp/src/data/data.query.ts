import { Query } from "@datorama/akita";

import { Observable, combineLatest, map, startWith } from "rxjs";
import { AdjacencyMatrix, HexString } from "type-library";
import {
  RawNetwork,
  RenderableNetworkEdge,
  TestNetworkNode,
  TimeSpace,
  TimelineSpace,
} from "type-library/src";
import { rawNetworkToAdjMat } from "../../../src/networkTools";
import {
  Agent,
  AgentID,
  HistoricalEvent,
  InfoPanelDateElement,
  LineSegment,
  NodeID,
  PeriodOrSingleton,
  RenderableEvent,
  SpaceConvertingFunction,
  periodIsSegmentGuard,
} from "../../../src/types";
import { DataState, DataStore, dataStore } from "./data.store";

const formatDates = ({ eventTime }: HistoricalEvent): string => {
  const isSegment = periodIsSegmentGuard(eventTime);
  if (isSegment) {
    return `${eventTime.start} - ${eventTime.end}`;
  }
  return `${eventTime}`;
};

const getRandomColor = (): HexString => {
  // return "#FFFFFF";

  const channelSize = 16;
  const charCode = new Array(6)
    .fill(0)
    .map(() => Math.round(Math.random() * channelSize).toString(16))
    .reduce((prev, curr) => prev + curr);

  return `#${charCode}`;
};

const timeObjAAfterTimeObjB = (
  timeA: PeriodOrSingleton<TimeSpace>,
  timeB: PeriodOrSingleton<TimeSpace>,

  key: keyof LineSegment
): boolean => {
  const aIsSegment = periodIsSegmentGuard(timeA);
  const bIsSegment = periodIsSegmentGuard(timeB);

  if (aIsSegment && bIsSegment) {
    return timeA[key] >= timeB[key];
  }
  if (aIsSegment && !bIsSegment) {
    return timeA[key] >= timeB;
  }
  if (!aIsSegment && bIsSegment) {
    return timeA >= timeB[key];
  }
  if (!aIsSegment && !bIsSegment) {
    return timeA >= timeB;
  }
  return false;
};
export class DataQuery extends Query<DataState> {
  public static sortEvents = (
    events: HistoricalEvent[],
    sortKey: keyof LineSegment
  ) => {
    return [...events].sort((eventA, eventB) => {
      return timeObjAAfterTimeObjB(eventA.eventTime, eventB.eventTime, "start")
        ? 1
        : -1;
    });
  };

  // TODO is timeline len supposed to be number of years?
  public static buildEventPositioner = (
    earliestDate: TimeSpace,
    latestDate: TimeSpace
  ) => {
    const timelinePositionForEvent: SpaceConvertingFunction<
      TimeSpace,
      TimelineSpace
    > = (val) => {
      const timelineLen = latestDate - earliestDate;
      return ((val - earliestDate) / timelineLen) as TimelineSpace;
    };

    const eventPositioner = ({ eventTime }: HistoricalEvent): TimelineSpace => {
      const isSegment = periodIsSegmentGuard(eventTime);
      if (isSegment) {
        // for time period events just position tooltip in the middle
        return ((timelinePositionForEvent(eventTime.end) +
          timelinePositionForEvent(eventTime.start)) /
          2) as TimelineSpace;
      }

      return timelinePositionForEvent(eventTime);
    };
    return eventPositioner;
  };
  private static participantsForEventSet(
    events: HistoricalEvent[],
    agents: Agent[]
  ) {
    return new Set(
      events
        .map((event) =>
          event.participants
            ? event.participants
            : // ? event.participants.map((participant) =>
              //     agents.find(({ id }) => id === participant)
              //   )
              []
        )
        .flat()
    );
  }
  constructor(protected store: DataStore) {
    super(store);
  }

  private unfilteredEvents = this.select("events");
  public selectedNetworkNode = this.select("selectedNetworkNode");
  private agents = this.select("agents");
  private networkNodeProps = this.select("networkNodeProps");

  public participantsAllEvents: Observable<Set<AgentID>> = combineLatest([
    this.unfilteredEvents,
    this.agents,
  ]).pipe(
    map(([events, agents]) => {
      return DataQuery.participantsForEventSet(events, agents);
    })
  );

  public hoveredEvent = this.select("hoveredEvent");
  public selectedEventId = this.select("selectedEvent");

  public selectedEvent = combineLatest([
    this.selectedEventId,
    this.unfilteredEvents,
  ]).pipe(
    map(([selected, unfiltereds]) => {
      return unfiltereds.find(({ id }) => id === selected);
    })
  );

  public participantsSelectedEvent = combineLatest([
    this.selectedEvent,
    this.agents,
  ]).pipe(
    map(([selectedEvent, agents]) => {
      return selectedEvent
        ? DataQuery.participantsForEventSet([selectedEvent], agents)
        : null;
    })
  );

  // when two participants show up within the same event, they have an arrow pointing between them
  public eventParticipantsAsNetwork: Observable<RawNetwork> = combineLatest([
    this.unfilteredEvents,
    this.participantsAllEvents,
    this.networkNodeProps,
  ]).pipe(
    map(([unfilteredEvents, participantsAllEvents, networkNodeProps]) => {
      const eventParticipants = unfilteredEvents
        .filter((event) => event.participants !== undefined)
        .map((event) => event.participants) as AgentID[][];
      const edges = new Set<[AgentID, AgentID]>();
      // TODO terrible performance, add tests & improve thru tdd
      const addEdgesBetweenAll = (edgeList: AgentID[]) => {
        edgeList.forEach((agent) => {
          edgeList
            .filter((val) => val !== agent)
            .forEach((otherAgent) => {
              if (!edges.has([otherAgent as number, agent as number])) {
                edges.add([agent as number, otherAgent as number]);
                // console.log("TEST123", edges);
              }
            });
        });
      };
      eventParticipants.forEach((participants) => {
        addEdgesBetweenAll(participants);
      });

      return {
        edges: [...edges].distinct().map(([origin, target]) => {
          return { origin, target };
        }),
        nodes: [...participantsAllEvents].map((participant) => {
          return {
            id: participant as any as NodeID,
            renderedProps:
              networkNodeProps[participant as any as NodeID] || undefined,
          };
        }),
      };
    })
  );

  public eventAdjMat: Observable<AdjacencyMatrix> =
    this.eventParticipantsAsNetwork.pipe(
      map((network) => rawNetworkToAdjMat(network)),
      startWith([])
    );

  public renderableEventNetworkNodes: Observable<TestNetworkNode[]> =
    this.eventParticipantsAsNetwork.pipe(
      map(({ nodes }) => {
        //z
        // const placements = forceDirectedGraph({ G: adjMat, H: 100 });
        const filtered = nodes.filter(
          ({ renderedProps }) => renderedProps !== undefined
        );
        return filtered as TestNetworkNode[];
      })
    );

  public renderableEventEdges: Observable<RenderableNetworkEdge[]> =
    combineLatest([
      this.renderableEventNetworkNodes,
      this.eventParticipantsAsNetwork,
    ]).pipe(
      map(([nodes, { edges }]) => {
        return edges.map((edge) => {
          return {
            ...edge,
            renderedProps: {
              originPosition: nodes[edge.origin].renderedProps.position,
              targetPosition: nodes[edge.target].renderedProps.position,
            },
          };
        });
      })
    );

  public initialDateFilter = this.select("initialDateFilter");
  public finalDateFilter = this.select("finalDateFilter");

  public events = combineLatest([
    this.unfilteredEvents,
    this.initialDateFilter,
    this.finalDateFilter,
  ]).pipe(
    map(([events, initialDateFilter, finalDateFilter]) => {
      if (!(initialDateFilter !== null || finalDateFilter !== null)) {
        return events;
      }

      const eventsAboveInitial = !initialDateFilter
        ? events
        : events.filter((event) => {
            return timeObjAAfterTimeObjB(
              event.eventTime,
              initialDateFilter,
              "start"
            );
          });

      const eventsBelowFinal = !finalDateFilter
        ? eventsAboveInitial
        : eventsAboveInitial.filter((event) => {
            return timeObjAAfterTimeObjB(
              finalDateFilter,
              event.eventTime,
              "end"
            );
          });

      return eventsBelowFinal;
    })
  );

  public numberEventsAfterFilter = this.events.pipe(
    map((events) => events.length)
  );

  public eventsSortedByStartDate = this.events.pipe(
    map((events) => {
      return DataQuery.sortEvents(events, "start");
    })
  );

  public eventsSortedByEndDate = this.events.pipe(
    map((events) => {
      return DataQuery.sortEvents(events, "end");
    })
  );

  public unfilteredEventsSortedByStartDate = this.unfilteredEvents.pipe(
    map((events) => {
      return DataQuery.sortEvents(events, "start");
    })
  );

  public unfilteredEventsSortedByEndDate = this.unfilteredEvents.pipe(
    map((events) => {
      return DataQuery.sortEvents(events, "end");
    })
  );

  public earliestEventStart = this.eventsSortedByStartDate.pipe(
    map((events) => {
      if (events.length === 0) {
        return null;
      }
      const [{ eventTime }] = events;
      const isSegment = periodIsSegmentGuard(eventTime);
      return isSegment ? eventTime.start : eventTime;
    })
  );

  public latestEventEnd = this.eventsSortedByEndDate.pipe(
    map((events) => {
      if (events.length === 0) {
        return null;
      }
      const { eventTime } = events[events.length - 1];
      const isSegment = periodIsSegmentGuard(eventTime);
      return isSegment ? eventTime.end : eventTime;
    })
  );

  public initialDateFilterWithFallback = combineLatest([
    this.initialDateFilter,
    this.earliestEventStart,
  ]).pipe(map(([date, fallback]) => (date ? date : fallback)));

  public finalDateFilterWithFallback = combineLatest([
    this.finalDateFilter,
    this.latestEventEnd,
  ]).pipe(map(([date, fallback]) => (date ? date : fallback)));

  public unfilteredEarliestEventStart =
    this.unfilteredEventsSortedByStartDate.pipe(
      map(([{ eventTime }]) => {
        const isSegment = periodIsSegmentGuard(eventTime);
        return isSegment ? eventTime.start : eventTime;
      })
    );

  public unfilteredLatestEventEnd = this.unfilteredEventsSortedByEndDate.pipe(
    map((events) => {
      if (events.length === 0) {
        return null;
      }
      const { eventTime } = events[events.length - 1];
      const isSegment = periodIsSegmentGuard(eventTime);
      return isSegment ? eventTime.end : eventTime;
    })
  );

  // derived observables
  public renderReadyEvents: Observable<RenderableEvent[]> = combineLatest([
    this.events,
    this.initialDateFilterWithFallback,
    this.finalDateFilterWithFallback,
  ]).pipe(
    map(([events, earliest, latest]) => {
      if (events.length === 0 || !earliest || !latest) {
        return [];
      }
      const positioner = DataQuery.buildEventPositioner(earliest, latest);
      return events.map((event) => {
        return {
          ...event,
          renderedProps: {
            color: "red",
            position: positioner(event),
          },
        };
      });
    })
  );

  // {
  //   pos: hitEvent.renderedProps.position,
  //   dates: formatDates(hitEvent),
  //   desc: hitEvent.eventInfo,
  //   title: hitEvent.eventName,
  // }
  public selectedEventInfo = combineLatest([
    this.events,
    this.selectedEventId,
  ]).pipe(
    map(([events, selectedEvent]) => {
      const event = events.find(({ id }) => id === selectedEvent);
      if (!event) {
        return null;
      }
      return {
        dates: formatDates(event),
        desc: event.eventInfo,
        title: event.eventName,
      };
    })
  );

  public hoveredAdjMatCell = this.select("hoveredAdjMatCell");

  public hoveredNetworkNode = this.select("hoveredNetworkNode");

  public adjMatCellEventInfo: Observable<InfoPanelDateElement | null> =
    this.hoveredAdjMatCell.pipe(
      map((val) => {
        if (!val) {
          return null;
        }
        return { title: "Adjacency Matrix", desc: `${val[0]}, ${val[1]}` };
      })
    );
  public selectedNetworkNodeEventInfo: Observable<InfoPanelDateElement | null> =
    combineLatest([this.selectedNetworkNode, this.agents]).pipe(
      map(([val, agents]) => {
        if (val === null) {
          return null;
        }
        return { title: "Network", desc: `${agents[val].name}` };
      })
    );
  public infoPanelElements: Observable<InfoPanelDateElement[]> = combineLatest([
    this.selectedEventInfo,
    this.adjMatCellEventInfo,
    this.selectedNetworkNodeEventInfo,
  ]).pipe(
    map(
      ([
        selectedEventInfo,
        adjMatCellEventInfo,
        hoveredNetworkNodeEventInfo,
      ]) => {
        const eventElements = selectedEventInfo ? [selectedEventInfo] : [];
        const hoveredNetworkNodeElements = hoveredNetworkNodeEventInfo
          ? [hoveredNetworkNodeEventInfo]
          : [];
        const adjMatElements = adjMatCellEventInfo ? [adjMatCellEventInfo] : [];
        const networkElements = [];

        return [
          ...eventElements,
          ...hoveredNetworkNodeElements,
          ...adjMatElements,
        ];
      }
    )
  );
}
export const dataQuery = new DataQuery(dataStore);
