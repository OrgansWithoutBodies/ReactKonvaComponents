import * as React from "react";
import { useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import type {
  AdjacencyMatrix,
  ColorNumberArraySolid,
  ColumnID,
} from "type-library";
import { ArrV2, ObjV2 } from "./types";
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
type AnyNum = any;
// TODO usable?
const magGreatOne = [255, 255, 255];
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

const ColorNumberArrayToHexString = ([R, G, B]: ColorNumberArraySolid) => {
  // console.log("TEST123", R, G, B);
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
    2,
    "0"
  )}${B.toString(16).padStart(2, "0")}`;
};
type ColorMapper<TNum> = (
  value: TNum,
  ii: number,
  jj: number
) => ColorNumberArraySolid;
[];

export function Grid<TData>({
  data,
  CellComponent,
  SliceComponent=({children})=><>{children}</>,
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
  SliceComponent: ({
    ii,
    slice,
  }: React.PropsWithChildren & {
    ii: number;
    slice: TData[];
  }) => JSX.Element;
}) {
  {
    data.map((slice, ii) => {
      return (
        <SliceComponent ii={ii} slice={slice}>
          {slice.map((cell, jj) => {
            // console.log("TEST123", [ii, jj], selected.includes([ii, jj]));
            return <CellComponent ii={ii} jj={jj} cell={cell} />;
          })}
        </SliceComponent>
      );
    });
  }
}
// TODO might be worthwhile specifying some stuff here in terms of index?
export function AdjacencyMatrixComponent<TValue = number>({
  colorMapper,
  layerPosition,
  adjMatData,
  selecteds,
  onMouseEnterCell,
}: {
  adjMatData: AdjacencyMatrix<{ value: TValue }>;
  colorMapper: ColorMapper<TValue>;
  layerPosition: ObjV2;
  selecteds?: ArrV2[];
  onMouseEnterCell?: (ii: ColumnID, jj: ColumnID) => void;
}): JSX.Element {
  // TODO different sizing strategies?
  // TODO index to position
  // TODO scale cellsize based on number of cells - fixed % of canvas?
  const cellSize = 30;

  return (
    <Layer x={layerPosition.x} y={layerPosition.y}>
      {adjMatData.map((slice, ii) => {
        return (
          <Group y={ii * cellSize}>
            {slice.map((cell, jj) => {
              // console.log("TEST123", [ii, jj], selected.includes([ii, jj]));
              return (
                <Rect
                  onMouseEnter={() =>
                    onMouseEnterCell &&
                    onMouseEnterCell(ii as ColumnID, jj as ColumnID)
                  }
                  stroke={"#000000"}
                  width={1 * cellSize}
                  height={1 * cellSize}
                  x={jj * cellSize}
                  fill={
                    selecteds && selecteds.includes([ii, jj])
                      ? "#FF0000"
                      : ColorNumberArrayToHexString(
                          colorMapper(cell.value, ii, jj)
                        )
                  }
                  strokeWidth={3}
                  // fill={[255,0,0]}
                />
              );
            })}
          </Group>
        );
      })}
    </Layer>
  );
}

export function AdjacencyMatrix() {
  const n = 4;
  const adjMatData: AdjacencyMatrix<{ value: number }> = new Array(n)
    .fill(0)
    .map((val) => new Array(n).fill({ value: 1 }));
  const [selected, setSelected] = useState<ArrV2<ColumnID> | null>(null);
  const subColorMapper: ColorMapper<number> = (_, ii, jj) => {
    return SubtractMatrix[ii][jj];
  };
  const addColorMapper: ColorMapper<number> = (_, ii, jj) => {
    return AddMatrix[ii][jj];
  };
  const multColorMapper: ColorMapper<number> = (_, ii, jj) => {
    return MultiplyMatrix[ii][jj];
  };
  const divColorMapper: ColorMapper<number> = (_, ii, jj) => {
    return DivideMatrix[ii][jj];
  };
  const stageSize = { x: 500, y: 500 };

  return (
    <Stage
      width={stageSize.x}
      height={stageSize.y}
      style={{ backgroundColor: "white" }}
      x={0}
      y={0}
    >
      <AdjacencyMatrixComponent
        colorMapper={addColorMapper}
        adjMatData={adjMatData}
        layerPosition={{ x: 0, y: 0 }}
      />
      <AdjacencyMatrixComponent
        colorMapper={subColorMapper}
        adjMatData={adjMatData}
        layerPosition={{ x: 130, y: 0 }}
      />
      <AdjacencyMatrixComponent
        colorMapper={multColorMapper}
        adjMatData={adjMatData}
        layerPosition={{ x: 0, y: 130 }}
      />
      <AdjacencyMatrixComponent
        colorMapper={divColorMapper}
        adjMatData={adjMatData}
        layerPosition={{ x: 130, y: 130 }}
      />
    </Stage>
  );
}
