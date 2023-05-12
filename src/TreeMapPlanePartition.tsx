import {
  PartitionTree,
  PivotBySizePartitioner,
  TreePartitioner,
} from "geometry-helpers";
import { Layer, Stage } from "react-konva";
import type { ColorNumberArraySolid } from "type-library";

const ColorNumberArrayToHexString = ([R, G, B]: ColorNumberArraySolid) => {
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
    2,
    "0"
  )}${B.toString(16).padStart(2, "0")}`;
};
function TreeMapPlanePartitionNode({
  partition,
}: {
  partition: PartitionTree;
}): JSX.Element {
  return <>{partition.}</>;
}
type ColorMapper<TNum extends number> = (value: TNum) => ColorNumberArraySolid;
export function TreeMapPlanePartition(): JSX.Element {
  const partitioner = new PivotBySizePartitioner();
  // const test: TreeMapPartioner = [
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  // ];

  const treePartitioner = new TreePartitioner();
  const partition = treePartitioner.treePartition;
  const stageSize = { x: 1000, y: 500 };

  return (
    <Stage
      width={stageSize.x}
      height={stageSize.y}
      style={{ backgroundColor: "white" }}
    >
      <Layer>
        <TreeMapPlanePartitionNode partition={partition} />
      </Layer>
    </Stage>
  );
}
