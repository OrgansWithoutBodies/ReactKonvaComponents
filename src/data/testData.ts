const nodesLookup: NodeLookup = {
  [0 as NodeID]: {
    id: 0 as NodeID,
  },
  [1 as NodeID]: {
    id: 1 as NodeID,
  },
  [2 as NodeID]: {
    id: 2 as NodeID,
  },
  [3 as NodeID]: {
    id: 3 as NodeID,
  },
  [4 as NodeID]: {
    id: 4 as NodeID,
  },
  [5 as NodeID]: {
    id: 5 as NodeID,
  },
};

const edges: NetworkEdge[] = [
  {
    target: 0 as NodeID,
    origin: 1 as NodeID,
  },
  {
    target: 0 as NodeID,
    origin: 2 as NodeID,
  },
  {
    target: 0 as NodeID,
    origin: 3 as NodeID,
  },
  {
    target: 0 as NodeID,
    origin: 4 as NodeID,
  },
  {
    target: 0 as NodeID,
    origin: 5 as NodeID,
  },
  {
    target: 1 as NodeID,
    origin: 5 as NodeID,
  },
];
