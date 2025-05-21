import { neonPurple, stormGrey } from "@/styles/theme/colors";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { styled } from "@mui/system";
import { Dispatch, SetStateAction } from "react";

export default function TextArea({
  text,
  setText,
}: {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}) {
  return (
    <TextareaAutosize
      sx={{ width: "100%" }}
      value={text}
      onChange={(e) => setText(e.target.value)}
      aria-label="empty textarea"
      placeholder="Cole aqui as orientações"
      minRows={3}
    />
  );
}

const TextareaAutosize = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? stormGrey[300] : stormGrey[900]};
  background: ${theme.palette.mode === "dark" ? stormGrey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? stormGrey[700] : stormGrey[200]};
  box-shadow: 0 2px 2px ${theme.palette.mode === "dark" ? stormGrey[900] : stormGrey[50]};

  &:hover {
    border-color: ${neonPurple[400]};
  }

  &:focus {
    border-color: ${neonPurple[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === "dark" ? neonPurple[600] : neonPurple[200]};
  }

  /* firefox */
  &:focus-visible {
    outline: 0;
  }
`,
);
