type GeoJsonTypes =
  | "Point"
  | "Polygon"
  | "FeatureCollection"
  | "Feature"
  | "MultiPolygon"
  | "LineString"
  | "MultiLineString"
  | "MultiPoint"
  | "GeometryCollection";
// NA: {
//   properties: {
//     country: "Asia &amp; Pacific",
//     tld: "asia",
//     iso2: "AP",
//   },
//   geometry: {
//     coordinates: [0, 0],
//     type: "Point",
//   },
//   id: "AP",
// },
export type BilateralRelation<TCountryLiterals extends number> = [
  TCountryLiterals,
  TCountryLiterals,
  -1 | 1 | 0
];

// TODO 'Conflict Zone'/Disputed territory
export type LatLon = [lat: number, lon: number];
export type LonLat = [lon: number, lat: number];
export type GeoJsonGeometryGeneric<
  TType extends GeoJsonTypes = GeoJsonTypes,
  TCoord = any
> = {
  type: TType;
  geometry: { type: TType; coordinates: TCoord };
};
export type GeoJsonGeometryPolygon = GeoJsonGeometryGeneric<
  "Polygon",
  LatLon[][]
>;
export type GeoJsonGeometryPoint = GeoJsonGeometryGeneric<
  "Point",
  LatLon | Readonly<[number, number]>
>;

interface CountryInfoEntry {
  name: string;
  region: string;
  "sub-region": string;
  "intermediate-region": string;
}
export type ICountryInfo = Readonly<CountryInfoEntry[]>;

export type Country<TCountryInfo extends ICountryInfo> =
  TCountryInfo[number]["name"];
export type Regions<TCountryInfo extends ICountryInfo> =
  TCountryInfo[number]["region"];
export type SubRegions<TCountryInfo extends ICountryInfo> =
  TCountryInfo[number]["sub-region"];
export type IntermediateRegions<TCountryInfo extends ICountryInfo> =
  TCountryInfo[number]["intermediate-region"];

// type RegionString = BrandedString<'Region'>
export type RegionColorMap<TCountryInfo extends ICountryInfo> = Record<
  Regions<TCountryInfo>,
  string
>;
export type CountryInfoKey<TCountryInfo extends ICountryInfo> =
  keyof TCountryInfo[number];

export type CountryRegionLookup<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
> = {
  [key in TCountryLiterals]: Regions<TCountryInfo>;
};
export type CountryNameLookup<
  TCountryLiterals extends number,
  TCountryInfo extends ICountryInfo
> = {
  [key in TCountryLiterals]: Regions<TCountryInfo>;
};
type DateString = string;
type YearNumeral = number;
type MonthNumeral = number;
type DayNumeral = number;
export type CountryHeartMap<TCountryLiterals extends number> = Record<
  TCountryLiterals,
  GeoJsonGeometryPoint
>;
interface CShape {
  type: "Feature";
  geometry: { type: "MultiPolygon"; coordinates: [number, number][][][] };
  properties: {
    cntry_name: string;
    area: number;
    capname: string;
    caplong: number;
    caplat: number;
    gwcode: number;
    gwsdate: DateString;
    gwsyear: YearNumeral;
    gwsmonth: MonthNumeral;
    gwsday: DayNumeral;
    gwedate: DateString;
    gweyear: YearNumeral;
    gwemonth: MonthNumeral;
    gweday: DayNumeral;
    cap_geom: `SRID=${number};POINT (${number} ${number})`;
  };
}
type CShapeList = CShape[];
// type CapitalProps = (typeof Capitals)[CapitalCityCountryCodes]["properties"];

// export type CapitalCityName = keyof CapitalProps extends "city"
//   ? CapitalProps["city"]
//   : "";
export type CShapesType<TShapes extends CShapeList> = TShapes[number];
