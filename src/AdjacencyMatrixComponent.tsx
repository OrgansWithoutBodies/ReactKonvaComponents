import * as React from "react";
import { Circle, Group, Layer, Rect } from "react-konva";
import type {
  AdjacencyMatrix,
  ColorNumberArraySolid,
  ColumnID,
} from "type-library";
import { ArrV2, ObjV2 } from "type-library/dist/vectors";
import { ColorNumberArrayToHexString } from "./TreeMapPlanePartition";
// RawNetwork as GenericRawNetwork,
// yellow x<-1
// blue -1>x>0
// red - 0>x>1
// green x>1

// order yellow blue red green

const unk = [255, 255, 255];

const posBelow1 = [255, 0, 0];
const negAboveNeg1 = [0, 0, 255];

const negBelowNeg1 = [0, 255, 0];
const posAbove1 = [255, 127, 0];

const positive = [255, 0, 255];
const negative = [0, 255, 255];

const magLessOne = [255, 255, 0];
type AnyNum = number;
// TODO usable?
// const magGreatOne = [255, 255, 255];
// const anyNum: AnyNum[] = [
//   yellow,
//   blue,
//   red,
//   green,
// ];
// const negative: AnyNum[] = [
//   blue,
//   yellow,
// ];
// const positive: AnyNum[] = [
//   red,
//   green,
// ];
// const magLessOne: AnyNum[] = [
//   red,
//   blue,
// ];
// // TODO usable?
// const magGreatOne: AnyNum[] = [
//   yellow,
//   green,
// ];
export const MultiplyMatrix: AdjacencyMatrix<AnyNum | AnyNum[]> = [
  //  Y       B           R           G
  // Y
  [posAbove1, positive, negative, negBelowNeg1],
  // B
  [positive, posBelow1, negAboveNeg1, negative],
  // R
  [negative, negAboveNeg1, posBelow1, positive],
  // G
  [negBelowNeg1, negative, positive, posAbove1],
];
// Y/R=Y*G
export const DivideMatrix: AdjacencyMatrix<AnyNum | AnyNum[]> = [
  //  Y       B           R           G
  // Y
  [positive, posAbove1, negBelowNeg1, negative],
  // B
  [posBelow1, positive, negative, negAboveNeg1],
  // R
  [negAboveNeg1, negative, positive, posBelow1],
  // G
  [negative, negBelowNeg1, posAbove1, positive],
];
// Binary Operation - first row, second column
export const AddMatrix: AdjacencyMatrix<AnyNum | AnyNum[]> = [
  //  Y       B           R           G
  // Y
  [negBelowNeg1, negBelowNeg1, negative, unk],
  // B
  [negBelowNeg1, negative, magLessOne, positive],
  // R
  [negative, magLessOne, positive, posAbove1],
  // G
  [unk, positive, posAbove1, posAbove1],
];

export const SubtractMatrix: AdjacencyMatrix<AnyNum | AnyNum[]> = [
  //  Y       B           R           G
  // Y
  [unk, negative, negBelowNeg1, negBelowNeg1],
  // B
  [positive, magLessOne, negative, negBelowNeg1],
  // R
  [posAbove1, positive, magLessOne, negative],
  // G
  [posAbove1, posAbove1, positive, unk],
];

type ColorMapper<TNum> = (
  value: TNum,
  ii: number,
  jj: number
) => ColorNumberArraySolid;
[];

export function Grid<TData>({
  data,
  CellComponent,
  SliceComponent = ({ children }) => <>{children}</>,
}: {
  data: TData[][];
  CellComponent: ({
    ii,
    jj,
    cell,
  }: {
    ii: number;
    jj: number;
    cell: TData;
  }) => JSX.Element;
  SliceComponent?: ({
    ii,
    slice,
  }: React.PropsWithChildren & {
    ii: number;
    slice: TData[];
  }) => JSX.Element;
}): JSX.Element {
  return (
    <>
      {data.map((slice, ii) => {
        return (
          <SliceComponent ii={ii} slice={slice}>
            {slice.map((cell, jj) => {
              // console.log("TEST123", [ii, jj], selected.includes([ii, jj]));
              return <CellComponent ii={ii} jj={jj} cell={cell} />;
            })}
          </SliceComponent>
        );
      })}
    </>
  );
}

export function AdjacencyMatrixCellComponent<TValue = number>({
  onMouseEnterCell,
  ii,
  jj,
  cellSize,
  cell,
  selecteds,
  colorMapper,
}: {
  cellSize: number;
  ii: number;
  jj: number;
  cell: { value: TValue };
  onMouseEnterCell?: (ii: ColumnID, jj: ColumnID) => void;
  colorMapper: ColorMapper<TValue>;
  selecteds?: ArrV2[];
}) {
  return (
    <Rect
      onMouseEnter={() =>
        onMouseEnterCell && onMouseEnterCell(ii as ColumnID, jj as ColumnID)
      }
      stroke={"#000000"}
      width={1 * cellSize}
      height={1 * cellSize}
      x={jj * cellSize}
      fill={
        selecteds && selecteds.includes([ii, jj])
          ? "#FF0000"
          : ColorNumberArrayToHexString(colorMapper(cell.value, ii, jj))
      }
      strokeWidth={3}
      // fill={[255,0,0]}
    />
  );
}
// TODO might be worthwhile specifying some stuff here in terms of index?
export function AdjacencyMatrixComponent<TValue = number>({
  colorMapper,
  layerPosition,
  adjMatData,
  selecteds,
}: // onMouseEnterCell,
{
  adjMatData: AdjacencyMatrix<{ value: TValue }>;
  colorMapper: ColorMapper<TValue>;
  layerPosition: ObjV2;
  selecteds?: ArrV2[];
  // onMouseEnterCell?: (ii: ColumnID, jj: ColumnID) => void;
}): JSX.Element {
  // TODO different sizing strategies?
  // TODO index to position
  // TODO scale cellsize based on number of cells - fixed % of canvas?
  const cellSize = 30;

  return (
    <Group x={layerPosition.x} y={layerPosition.y}>
      <Grid
        data={adjMatData}
        CellComponent={({ ii, jj, cell }) => (
          <AdjacencyMatrixCellComponent
            cellSize={cellSize}
            ii={ii}
            jj={jj}
            cell={cell}
            colorMapper={colorMapper}
            selecteds={selecteds}
          />
        )}
        SliceComponent={({ ii, children }) => (
          <Group y={ii * cellSize}>{children}</Group>
        )}
      />
    </Group>
  );
}
export function EncapsulatedAdjacencyMatrixComponent(
  args: Parameters<typeof AdjacencyMatrixComponent>[0]
): JSX.Element {
  const n = args["adjMatData"].length;

  const matrixSize = n * 30;
  const diameter = Math.sqrt(matrixSize ** 2 + matrixSize ** 2);
  return (
    <Layer {...args["layerPosition"]}>
      <Circle
        x={matrixSize / 2}
        y={matrixSize / 2}
        radius={diameter / 2}
        stroke={"black"}
        strokeWidth={3}
      />
      <AdjacencyMatrixComponent {...args} layerPosition={{ x: 0, y: 0 }} />
    </Layer>
  );
}
// export function AdjacencyMatrixGridComponent({
//   matrices,
//   colorMappers,
// }: {
//   matrices: AdjacencyMatrix<AdjacencyMatrix<any>>;
//   colorMappers: AdjacencyMatrix<ColorMapper<number>>;
// }) {
//   const stageSize = { x: 500, y: 500 };
//   // const paddingAroundMatrices = 10;
//   // n assumed all equal
//   const n = matrices[0][0].length;

//   const matrixSize = n * 30;
//   const diameter = Math.sqrt(matrixSize ** 2 + matrixSize ** 2);

//   const paddingBetweenMatrices = 10;
//   return (
//     <Stage
//       width={stageSize.x}
//       height={stageSize.y}
//       style={{ backgroundColor: "white" }}
//       x={0}
//       y={0}
//     >
//       <Grid
//         data={matrices}
//         CellComponent={function ({ ii, jj, cell }) {
//           return (
//             <EncapsulatedAdjacencyMatrixComponent
//               adjMatData={cell}
//               colorMapper={colorMappers[ii][jj]}
//               layerPosition={{
//                 x: ii * (diameter + paddingBetweenMatrices),
//                 y: jj * (diameter + paddingBetweenMatrices),
//               }}
//             />
//           );
//         }}
//       />
//     </Stage>
//   );
// }
// TODO figure out diffference between groups & layers
// maybe use one for 'windowing'?

// export function AdjacencyMatrixGrid() {
//   const n = 4;
//   // only used for shape
//   const dummyData: AdjacencyMatrix<{ value: number }> = new Array(n)
//     .fill(0)
//     .map(() => new Array(n).fill({ value: 1 }));
//   // const [selected, setSelected] = useState<ArrV2<ColumnID> | null>(null);
//   const subColorMapper: ColorMapper<number> = (_, ii, jj) => {
//     return SubtractMatrix[ii][jj];
//   };
//   const addColorMapper: ColorMapper<number> = (_, ii, jj) => {
//     return AddMatrix[ii][jj];
//   };
//   const multColorMapper: ColorMapper<number> = (_, ii, jj) => {
//     return MultiplyMatrix[ii][jj];
//   };
//   const divColorMapper: ColorMapper<number> = (_, ii, jj) => {
//     return DivideMatrix[ii][jj];
//   };
//   // const stageSize = { x: 500, y: 500 };

//   // TODO rubiks cube
//   // TODO rubiks cube move network/3d + textures
//   // TODO arrows between adjmats? abstract network more, add "nodeHandles" for where arrows go
//   // TODO think abt what 'fusion between multiply & subtract' would mean matrix wise (ie do operation that goes from + -> - & apply that operation to * or /)
//   return (
//     <AdjacencyMatrixGridComponent
//       matrices={[
//         [dummyData, dummyData],
//         [dummyData, dummyData],
//         [dummyData, dummyData],
//       ]}
//       colorMappers={[
//         [addColorMapper, subColorMapper],
//         [multColorMapper, divColorMapper],
//         [multColorMapper, divColorMapper],
//       ]}
//     />
//   );
// }

// type NetworkNode = {
//   id: NodeID;
// };

// type NetworkEdge = {
//   origin: NodeID;
//   target: NodeID;
// };
// type GenericRawNetwork<TNode extends NetworkNode, TEdge extends NetworkEdge> = {
//   edges: TEdge[];
//   nodes: TNode[];
// };

// export function AdjacencyMatrixNetworkComponent({
//   nodes,
//   edges,
//   stageSize,
// }: { stageSize: ObjV2<ScreenSpace> } & GenericRawNetwork<
//   NetworkNode & {
//     adjMat: AdjacencyMatrix<number>;
//     colorMapper: ColorMapper<number>;
//   },
//   NetworkEdge
// >) {
//   return (
//     <>
//       <NetworkComponent
//         stageSize={stageSize}
//         nodes={nodes}
//         edges={edges}
//         NodeTemplate={({ node }) => (
//           <EncapsulatedAdjacencyMatrixComponent
//             adjMatData={node.adjMat}
//             colorMapper={node.colorMapper}
//             layerPosition={{ x: 0, y: 0 }}
//           />
//         )}
//       />
//     </>
//   );
// }
