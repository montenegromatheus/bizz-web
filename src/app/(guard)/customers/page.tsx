import Stack from "@mui/material/Stack";
import * as React from "react";

import CustomersPage from "@/components/dashboard/customer";
import { config } from "@/config";
import { Metadata } from "next";

export const metadata = {
  title: `${config.site.name} | Clientes`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <CustomersPage />
    </Stack>
  );
}
