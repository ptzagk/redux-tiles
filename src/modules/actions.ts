import { Dispatch } from 'redux';
import { createType } from '../helpers';
import { DEFAULT_REDUCER } from './selectors';
import { IAsyncActionTypes, IPromiseObject, ISyncActionTypes } from './types';

interface IProcessedMiddleware {
  dispatch: Dispatch<{}>;
  getState(): {};
  [key: string]: any;
}

export type FnResult = (params: any, additionalParams?: any) => any;

function proccessMiddleware(args: any[]): IProcessedMiddleware {
  if (args.length === 3) {
    // let's assume it is redux-thunk with extra argument
    return { dispatch: args[0], getState: args[1], ...args[2] };
  } else if (args.length === 2) {
    // likely it is redux-thunk
    return { dispatch: args[0], getState: args[1] };
  } else if (args.length === 1 && typeof args[0] === 'object') {
    // our own middleware
    return args[0];
  }

  // no idea what it is
  throw new Error('Redux-Tiles expects own middleware, or redux-thunk');
}

function shouldBeFetched({ getState, selectors, params }: any): boolean {
  const { isPending, data, error } = selectors.get(getState(), params);

  // == intentionally to check on empty objects
  return error == null && data == null && isPending !== true;
}

function handleMiddleware(fn: Function): FnResult {
  return (fnParams: any, additionalParams: any): Function => (...args: any[]): any =>
    fn(proccessMiddleware(args), fnParams, additionalParams);
}

export function asyncAction({
  START, SUCCESS, FAILURE, fn, type, caching, nesting, selectors
}: IAsyncActionTypes): FnResult {
  return handleMiddleware((
    { dispatch, getState, promisesStorage = {}, ...middlewares }:
    { dispatch: Dispatch<{}>, promisesStorage: IPromiseObject, getState(): {} },
    params: any,
    { forceAsync }: { forceAsync?: boolean } = {}
  ) => {
    const path: string[]|null = nesting ? nesting(params) : null;

    const getIdentificator: string = createType({ type, path });
    const activePromise: Promise<any>|undefined = promisesStorage[getIdentificator];

    if (activePromise) {
      return activePromise;
    }

    if (caching && !forceAsync) {
      const isFetchingNeeded: boolean = shouldBeFetched({ getState, selectors, params });

      if (!isFetchingNeeded) {
        return Promise.resolve();
      }
    }

    dispatch({
      type: START,
      payload: { path }
    });

    const promise: Promise<any> = fn({ params, dispatch, getState, ...middlewares });
    promisesStorage[getIdentificator] = promise;

    return promise
      .then((data: any) => {
        dispatch({
          type: SUCCESS,
          payload: { path, data }
        });
        promisesStorage[getIdentificator] = undefined;
      })
      .catch((error: any) => {
        dispatch({
          error,
          type: FAILURE,
          payload: { path }
        });
        promisesStorage[getIdentificator] = undefined;
      });
  });
}

export function createResetAction({ type }: { type: string }): Function {
  return handleMiddleware(({ dispatch }: { dispatch: Dispatch<any> }) => dispatch({ type }));
}

export function syncAction({ TYPE, fn, nesting }: ISyncActionTypes): FnResult {
  return handleMiddleware(({ dispatch, getState, ...middlewares }: any, params: any) => {
    const path: string[]|null = nesting ? nesting(params) : null;

    return dispatch({
      type: TYPE,
      payload: {
        path,
        data: fn({ params, dispatch, getState, ...middlewares })
      }
    });
  });
}
