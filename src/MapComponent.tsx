import { type } from "rambdax";
import { useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { HexString } from "type-library";
import { ArrV2, ObjV2 } from "type-library/dist/vectors";
import {
  BilateralRelation,
  CountryHeartMap,
  CountryNameLookup,
  CountryRegionLookup,
  GeoJsonGeometryGeneric,
  ICountryInfo,
  LonLat,
} from "./mapTypes";
type;

// TODO filter by strength
function positionLine<TCountryLiterals extends number>(
  partnerA: TCountryLiterals,
  partnerB: TCountryLiterals,
  countryHeartMap: CountryHeartMap<TCountryLiterals>
): LonLat[][] {
  const simpleLine = [
    capitalCityPositionByCode(partnerA, countryHeartMap),
    capitalCityPositionByCode(partnerB, countryHeartMap),
  ];
  const xIndex = 1;
  if (Math.abs(simpleLine[0][xIndex] - simpleLine[1][xIndex]) > 160) {
    const rightmostIndex =
      simpleLine[0][xIndex] > simpleLine[1][xIndex] ? 0 : 1;
    const rightmostPoint = simpleLine[rightmostIndex];
    const leftmostPoint = simpleLine[1 - rightmostIndex];

    const run = simpleLine[0][xIndex] - simpleLine[1][xIndex];
    const rise = simpleLine[0][1 - xIndex] - simpleLine[1][1 - xIndex];
    const slope = rise / run;

    const rightmostDistFromAntimeridian = 180 - rightmostPoint[xIndex];
    const deltaRise = rightmostDistFromAntimeridian * slope;
    const rightSideAntimeridianIntersection = [
      rightmostPoint[1 - xIndex] - deltaRise,
      180,
    ] as LonLat;
    const leftSideAntimeridianIntersection = [
      rightmostPoint[1 - xIndex] - deltaRise,
      -180,
    ] as LonLat;
    // console.log(rightmostPoint[1] + deltaRise, rightmostPoint, rise, run);
    return [
      [rightmostPoint, rightSideAntimeridianIntersection],
      [leftSideAntimeridianIntersection, leftmostPoint],
    ];
  }
  return [simpleLine];
}

function AntimeridianSafePolyLine<TCountryLiterals extends number>({
  connection: [partnerA, partnerB, strength],
  countryHeartMap,
}: {
  connection: BilateralRelation<TCountryLiterals>;
  countryHeartMap: CountryHeartMap<TCountryLiterals>;
}): JSX.Element {
  const color = strength === 1 ? "green" : strength === 0 ? "black" : "red";
  return (
    <>
      {positionLine(partnerA, partnerB, countryHeartMap).map((line, ii) => {
        return (
          <Polyline
            key={`${partnerA}-${partnerB}-${ii}`}
            positions={line}
            weight={1}
            color={color}
          ></Polyline>
        );
      })}
    </>
  );
}
function capitalCityPositionByCode<TCountryLiterals extends number>(
  code: TCountryLiterals,
  countryHeartMap: CountryHeartMap<TCountryLiterals>
): LonLat {
  const coords = [
    // spread to avoid mutation
    ...countryHeartMap[code]["geometry"]["coordinates"],
  ].reverse() as LonLat;

  return coords;
}
export type HighlightSpecification<TCountryLiterals extends number> = {
  highlightedCountries: TCountryLiterals[];
  highlightColor: HexString;
};

export type HighlightPartition<TCountryLiterals extends number> =
  HighlightSpecification<TCountryLiterals>[];

export type TWorldMapEntity<TCountryLiterals extends number> = {
  geometry: GeoJsonGeometryGeneric;
  key: TCountryLiterals;
};

type MapContentsType<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
> = {
  countries: TWorldMapEntity<TCountryLiterals>[];
  countryToRegion: CountryRegionLookup<TCountryLiterals, TCountryInfo>;
  countryToName: CountryNameLookup<TCountryLiterals, TCountryInfo>;
  countryLines?: BilateralRelation<TCountryLiterals>[];
  countryHeartMap?: CountryHeartMap<TCountryLiterals>;
  highlights?: HighlightPartition<TCountryLiterals>;
};

export function MapContents<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
>({
  countryLines: bilateralRelations,
  countries,
  countryHeartMap,
  countryToName,
  highlights,
}: MapContentsType<TCountryLiterals, TCountryInfo>): JSX.Element {
  const [visibleRelations, setVisibleRelations] = useState<
    BilateralRelation<TCountryLiterals>[] | undefined
  >(bilateralRelations);
  useMapEvents({
    popupopen: ({ popup }) => {
      // TODO no any
      const visibleId = (
        popup.options as { children: { props: { id: number } } }
      ).children.props.id;
      if (!bilateralRelations) {
        return;
      }
      setVisibleRelations(
        bilateralRelations.filter(
          ([a, b]) => a === visibleId || b === visibleId
        )
      );
    },
    popupclose: () => {
      setVisibleRelations(bilateralRelations);
    },
  });

  function getHighlightColor(key: TCountryLiterals): `#${string}` | "white" {
    // TODO reimplement defacto regionColorMap
    return (
      highlights?.find((highlightedSpec) =>
        highlightedSpec.highlightedCountries.includes(key)
      )?.highlightColor || "white"
    );
  }
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {countries.map(({ key, geometry }) => (
        // TODO weird tiling? Vectormap
        <GeoJSON
          key={`geo-${key}`}
          // TODO 'fill strategy'?
          style={{
            fillColor: getHighlightColor(key),
            fillOpacity: 0.9,
            weight: 1,
            color: "gray",
          }}
          data={geometry}
        >
          <Popup>
            <div id={`${key}`}>{countryToName[key]}</div>
          </Popup>
        </GeoJSON>
      ))}
      {visibleRelations &&
        countryHeartMap &&
        visibleRelations.map((connection) => {
          return (
            <AntimeridianSafePolyLine
              countryHeartMap={countryHeartMap}
              connection={connection}
            ></AntimeridianSafePolyLine>
          );
        })}
    </>
  );
}
export type WorldMapType<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
> = {
  container: {
    sizePx: ObjV2;
    center: ArrV2;
  };
  contents: MapContentsType<TCountryLiterals, TCountryInfo>;
};

export function WorldMap<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
>({
  contents,
  container: {
    center,
    sizePx: { x: width, y: height },
  },
}: WorldMapType<TCountryLiterals, TCountryInfo>): JSX.Element {
  return (
    <>
      <MapContainer
        // style={{ width: "1024px", height: "780px" }}
        style={{ height: `${height}px`, width: `${width}px` }}
        center={center}
        zoom={2}
        scrollWheelZoom={true}
        zoomControl={false}
        // maxBoundsViscosity={1}
      >
        <MapContents {...contents} />
      </MapContainer>
    </>
  );
}
export const makeGoogleNewsFeedUrl = (countryNameUrlSafe: string) =>
  `https://news.google.com/search?q=${countryNameUrlSafe}`;
