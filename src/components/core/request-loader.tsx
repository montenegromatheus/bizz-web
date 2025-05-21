import { SetStateAction } from "react";

// material-ui
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";

// styles
const LoaderWrapper = styled("div")({
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1301,
  width: "100%",
});

// ==============================|| LOADER ||============================== //

export interface LoaderProps extends LinearProgressProps {}

const RequestLoader = (props: { isLoading: SetStateAction<boolean> }) => {
  const { isLoading } = props;
  return (
    <>
      {isLoading ? (
        <LoaderWrapper>
          <LinearProgress color="primary" />
        </LoaderWrapper>
      ) : (
        <></>
      )}
    </>
  );
};

export default RequestLoader;
