import Grid from "@mui/material/Unstable_Grid2";

import Calendar from "@/components/dashboard/calendar/calendar";
import { Metadata } from "next";
import { config } from "@/config";
import TypebotUI from "@/components/dashboard/layout/typebotWidgetCalendar";

export const metadata = {
  title: `${config.site.name} | Agenda`,
} satisfies Metadata;

export default function Page(): JSX.Element {
  return (
    <>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Calendar />
        </Grid>
      </Grid>
      <TypebotUI />
    </>
  );
}
