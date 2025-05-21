import { useDispatch } from "react-redux";
import { SNACKBAR_OPEN } from "@/store/actions";

const useSnackbar = () => {
  const dispatch = useDispatch();

  const showSnackbar = (message: string, alertSeverity: string) => {
    dispatch({
      type: SNACKBAR_OPEN,
      open: true,
      message,
      alertSeverity,
      close: true,
    });
  };

  return { showSnackbar };
};

export default useSnackbar;
