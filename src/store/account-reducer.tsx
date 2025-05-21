// import { initialLoginContextProps } from "@/shared/types/auth";
import { LOGIN, LOGOUT } from "./actions";

// ==============================|| ACCOUNT REDUCER ||============================== //

interface initialLoginContextProps {
  isInitialized?: boolean;
  isLoggedIn: boolean;
  user?: any | null | undefined;
  companyId?: string | null;
}

const initialState: initialLoginContextProps = {
  isLoggedIn: false,
  companyId: null,
  user: null,
};

export interface AccountReducerActionProps {
  type: string;
  payload?: initialLoginContextProps;
}

const accountReducer = (
  state = initialState,
  action: AccountReducerActionProps,
) => {
  switch (action.type) {
    case LOGIN: {
      const { user, companyId } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        companyId,
        user,
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
        companyId: null,
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default accountReducer;
