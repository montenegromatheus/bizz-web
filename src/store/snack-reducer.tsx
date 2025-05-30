import { DefaultRootStateProps } from "@/types/user";
import * as actionTypes from "./actions";

export interface SnackBarActionProps {
  type: string;
  open: true;
  message: string;
  anchorOrigin: string;
  variant: string;
  alertSeverity: string;
  transition: string;
  close: boolean;
  actionButton: string;
}

const initialState: DefaultRootStateProps["snackbar"] = {
  action: false,
  open: false,
  message: "Note archived",
  anchorOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  variant: "alert",
  alertSeverity: "success",
  transition: "Fade",
  close: true,
  actionButton: false,
};

// ==============================|| SNACKBAR REDUCER ||============================== //

const snackbarReducer = (state = initialState, action: SnackBarActionProps) => {
  switch (action.type) {
    case actionTypes.SNACKBAR_OPEN:
      return {
        ...state,
        action: !state.action,
        open: action.open ? action.open : initialState.open,
        message: action.message ? action.message : initialState.message,
        anchorOrigin: action.anchorOrigin
          ? action.anchorOrigin
          : initialState.anchorOrigin,
        variant: action.variant ? action.variant : initialState.variant,
        alertSeverity: action.alertSeverity
          ? action.alertSeverity
          : initialState.alertSeverity,
        transition: action.transition
          ? action.transition
          : initialState.transition,
        close: action.close === false ? action.close : initialState.close,
        actionButton: action.actionButton
          ? action.actionButton
          : initialState.actionButton,
      };
    default:
      return state;
  }
};

export default snackbarReducer;
