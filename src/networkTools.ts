import { AdjacencyMatrix, Matrix } from "type-library";
import { RawNetwork } from "./types";

export const createLoL = (dim: number): Matrix<0> =>
  [...Array.from({ length: dim }).keys()].map(
    () => [...Array.from({ length: dim }).keys()].fill(0) as 0[]
  );
// const adjMatToRawNetwork = (adjMat: AdjacencyMatrix): RawNetwork => {
//   const numNodes = adjMat.length;
//   const nodes = new Array(numNodes).keys();
//   const edges = [];
//   return { nodes, edges };
// };

export const rawNetworkToAdjMat = (
  network: RawNetwork
): AdjacencyMatrix<1 | 0> => {
  const numNodes = network.nodes.length;

  const adjMat: AdjacencyMatrix<1 | 0> = createLoL(numNodes);

  network.nodes.forEach(({ id }, ii) => {
    const edgesStartingFromThisNode = network.edges
      .map((edge, ii) => {
        return { ...edge, index: ii };
      })
      .filter((edge) => {
        return edge.origin === id;
      });
    const slice = adjMat[ii];
    edgesStartingFromThisNode.forEach((edge) => {
      slice[edge.index] = 1;
    });
  });

  return adjMat;
};
