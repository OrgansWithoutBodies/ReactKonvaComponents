import { ArrV3, HexString, TimeSpace, TimelineSpace } from "type-library/src";

export type RangeBrandTag<TMin extends number, TMax extends number> = {
  __min: TMin;
  __max: TMax;
};
export type NumberInRange<TMin extends number, TMax extends number> = number &
  RangeBrandTag<TMin, TMax>;
type Channel = "R" | "G" | "B" | "A";

export type HexChannelNumber<TChannel extends Channel = Channel> =
  NumberInRange<0, 255> & { __channel: TChannel };

export type HexTripleNumber = ArrV3<HexChannelNumber>;
// TODO types from openapi
type BrandedType<T, Brand extends string = string> = T & {
  __brand: Brand;
};

export type LineSegment<TNum extends number = number> = {
  start: TNum;
  end: TNum;
};
export type TimePeriod = LineSegment<TimeSpace>;
export type PeriodOrSingleton<TNum extends number> = LineSegment<TNum> | TNum;

export type BrandedNumber<Brand extends string> = BrandedType<number, Brand>;
export type BrandedString<Brand extends string> = BrandedType<string, Brand>;
export type EventID = BrandedNumber<"Event">;
export type NodeID = BrandedNumber<"Node">;
export type AgentID = BrandedNumber<"Agent">;
export type HistoricalEvent<
  TTime extends PeriodOrSingleton<TimeSpace> = PeriodOrSingleton<TimeSpace>,
  TKey extends number = EventID
> = {
  id: TKey;

  eventName: string;
  eventInfo: string;
  // either has a start & end or just a start
  eventTime: TTime;

  participants?: AgentID[];
};
export type Agent = {
  id: AgentID;
  name: string;
};
export type ConversionTag<TFrom extends number, TTo extends number> = {
  __from: TFrom;
  __to: TTo;
};
export type SpaceConvertingFunction<
  TFrom extends number,
  TTo extends number
> = (vFrom: TFrom) => TTo;

export type RenderableEvent = HistoricalEvent & {
  renderedProps: {
    position: TimelineSpace;
    color: HexString;
  };
};
export const periodIsSegmentGuard = (
  event: PeriodOrSingleton<TimeSpace>
): event is TimePeriod => {
  return isNaN(event as number);
};

export type NetworkNode = {
  id: NodeID;

  // renderedProps?: { position: ObjV2<KonvaSpace>; color: HexString };
};
export type InfoPanelDateElement = {
  title: string;
  dates?: string;
  desc: string;
};
