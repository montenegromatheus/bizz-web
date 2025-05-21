import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

type State = {
  isLoading: boolean;
};

type Action = { type: "START_LOADING" } | { type: "STOP_LOADING" };

const initialState: State = {
  isLoading: false,
};

const LoadingContext = createContext<{
  state: State;
  loadingDispatch: Dispatch<Action>;
}>({
  state: initialState,
  loadingDispatch: () => null,
});

const loadingReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_LOADING":
      return { isLoading: true };
    case "STOP_LOADING":
      return { isLoading: false };
    default:
      return state;
  }
};

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, loadingDispatch] = useReducer(loadingReducer, initialState);
  return (
    <LoadingContext.Provider value={{ state, loadingDispatch }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
