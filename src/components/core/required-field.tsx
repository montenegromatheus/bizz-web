import { Stack, Typography } from "@mui/material";
import React from "react";

export default function RequiredField({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return (
    <Stack>
      <Stack direction={"row"}>
        <Typography variant="body2">{name}</Typography>
        <Typography color={"#F14437"}>*</Typography>
      </Stack>
      {children}
    </Stack>
  );
}
