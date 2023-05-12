import { useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import type { AdjacencyMatrix, ColorNumberArraySolid } from "type-library";
import { dataService } from "./data/data.service";

const ColorNumberArrayToHexString = ([R, G, B]: ColorNumberArraySolid) => {
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
    2,
    "0"
  )}${B.toString(16).padStart(2, "0")}`;
};
type ColorMapper<TNum extends number> = (value: TNum) => ColorNumberArraySolid;
export function AdjacencyMatrixComponent(): JSX.Element {
  const n = 8;
  const test: AdjacencyMatrix<{ value: number }> = new Array(n)
    .fill(0)
    .map((val) => new Array(n).fill({ value: 1 }));
  // const test: AdjacencyMatrix<{ value: number }> = [
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  //   [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  // ];
  const colorMapper: ColorMapper<number> = () =>
    [
      255, 255, 255,
      // Math.round(Math.random() * 255),
      // Math.round(Math.random() * 255),
      // Math.round(Math.random() * 255),
    ] as ColorNumberArraySolid;
  const stageSize = { x: 500, y: 500 };
  const cellSize = 30;
  // const selected = [[1, 1]];
  const [selected, setSelected] = useState();
  // TODO index to position

  // TODO scale cellsize based on number of cells - fixed % of canvas?
  return (
    <Stage
      width={stageSize.x}
      height={stageSize.y}
      style={{ backgroundColor: "white" }}
      x={0}
      y={0}
    >
      <Layer>
        {test.map((slice, ii) => {
          return (
            <Group y={ii * cellSize}>
              {slice.map((cell, jj) => {
                // console.log("TEST123", [ii, jj], selected.includes([ii, jj]));
                return (
                  <Rect
                    onMouseEnter={() => {
                      setSelected([ii, jj]);
                      dataService.setHoveredAdjMatCell([ii, jj]);
                    }}
                    stroke={"#000000"}
                    width={1 * cellSize}
                    height={1 * cellSize}
                    x={jj * cellSize}
                    fill={
                      selected && selected[0] === ii && selected[1] === jj
                        ? "#FF0000"
                        : ColorNumberArrayToHexString(colorMapper(cell.value))
                    }
                    strokeWidth={3}
                    // fill={"red"}
                  />
                );
              })}
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );
}
