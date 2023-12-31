import { Query } from "@datorama/akita";
import { pick } from "rambdax";
import { Observable, ObservedValueOf } from "rxjs";

import { useEffect, useState } from "react";
import { dataQuery } from "./data/data.query";
import { dataService } from "./data/data.service";

type StateShapeDefault = {};
type SubscribedQueryKeys<TQuery extends Query<StateShapeDefault>> =
  (keyof TQuery)[];
type LiteralQueryState<
  TQuery extends Query<StateShapeDefault>,
  Keys extends SubscribedQueryKeys<TQuery>
> = { readonly [key in Keys[number]]: ObservedValueOf<TQuery[key]> };

export function useAkita<
  TState extends object,
  TQuery extends Query<TState>,
  TService
>(
  query: TQuery,
  service: TService,
  queryTerms: SubscribedQueryKeys<TQuery>
): [LiteralQueryState<TQuery, typeof queryTerms>, TService[keyof TService][]] {
  console.log(service);
  const [retrievedQueryTerms, setRetrievedQueryTerms] = useState<
    LiteralQueryState<TQuery, typeof queryTerms>
  >(
    () =>
      pick(queryTerms, query.getValue()) as unknown as LiteralQueryState<
        TQuery,
        typeof queryTerms
      >
  );
  useEffect(() => {
    const subscriptions = queryTerms.map((term) => {
      // TODO no any
      const retrievedQueryObservable = query[term] as Observable<any>;

      return retrievedQueryObservable.subscribe({
        next(observedValue) {
          setRetrievedQueryTerms((s) => ({ ...s, [term]: observedValue }));
        },
      });
    });
    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, []);

  return [retrievedQueryTerms, []];
}
// TODO token registration
export const useData = (queryTerms: SubscribedQueryKeys<typeof dataQuery>) =>
  useAkita(dataQuery, dataService, queryTerms);

// TODO bring out into own library
