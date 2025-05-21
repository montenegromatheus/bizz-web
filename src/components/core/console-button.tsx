import { Button } from "@mui/material";

const ConsoleButton = ({ variable }: { variable: any }) => {
  return <Button onClick={() => console.log(variable)}>Console</Button>;
};

export default ConsoleButton;
