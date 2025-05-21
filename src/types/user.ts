import { SnackbarOrigin } from "@mui/material";

export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;

  [key: string]: unknown;
}

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

export interface DefaultRootStateProps {
  snackbar: SnackbarStateProps;
}

export interface SnackbarStateProps {
  action: boolean;
  open: boolean;
  message: string;
  anchorOrigin: SnackbarOrigin;
  variant: string;
  alertSeverity: "error" | "warning" | "success";
  transition: string;
  close: boolean;
  actionButton: boolean;
}
