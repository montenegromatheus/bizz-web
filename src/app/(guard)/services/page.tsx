import Stack from "@mui/material/Stack";
import * as React from "react";

import ServicesPage from "@/components/dashboard/services/services-page";
import { Metadata } from "next";
import { config } from "@/config";

export const metadata = {
  title: `${config.site.name} | Serviços`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <ServicesPage />
    </Stack>
  );
}
