import { useCallback, useReducer } from "react";
import isEqual from "lodash.isequal";

type Action<T> =
  | { type: "SET"; payload: { data: T; ignore: boolean } }
  | { type: "REDO" }
  | { type: "UNDO" };

type State<T> = {
  prev: T[];
  curr: T;
  next: T[];
};

const reducer = <T,>(state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case "SET":
      if (isEqual(state.curr, action.payload)) return state;
      if (action.payload.ignore) return { ...state, curr: action.payload.data };

      return {
        prev: [...state.prev, state.curr],
        curr: action.payload.data,
        next: [],
      };
    case "REDO":
      if (state.next.length === 0) return state;

      return {
        prev: [...state.prev, state.curr],
        curr: state.next[0],
        next: state.next.slice(1),
      };
    case "UNDO":
      if (state.prev.length === 0) return state;

      return {
        prev: state.prev.slice(0, state.prev.length - 1),
        curr: state.prev[state.prev.length - 1],
        next: [state.curr, ...state.next],
      };
  }
};

export const useUndoRedo = <T,>(initial: T) => {
  const [state, dispatch] = useReducer(reducer<T>, {
    prev: [],
    curr: initial,
    next: [],
  });

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const set = useCallback(
    (cb: (oldState: T) => T, ignore = false) => {
      dispatch({ type: "SET", payload: { data: cb(state.curr), ignore } });
    },
    [state]
  );

  return {
    allowUndo: state.prev.length > 0,
    allowRedo: state.next.length > 0,
    state: state.curr,
    setState: set,
    undo,
    redo,
  };
};
