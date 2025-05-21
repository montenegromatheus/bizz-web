import FullCalendar from "@fullcalendar/react";
import { Grid, IconButton, styled } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { ptBR } from "date-fns/locale";
import { Dispatch, RefObject, SetStateAction } from "react";

export interface DayData {
  hasScheduled: boolean;
  hasDone: boolean;
  hasCanceled: boolean;
  hasDayOff: boolean;
}
const CustomCalendarHeaderRoot = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 16px",
  alignItems: "center",
});

export default function MonthView({
  monthData,
  date,
  setDate,
  calendarRef,
  handleMonthNext,
  handleMonthPrev,
}: {
  monthData: DayData[];
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  calendarRef: RefObject<FullCalendar>;
  handleMonthNext: () => void;
  handleMonthPrev: () => void;
}) {
  const getDayInfo = (day: number) => monthData[day - 1] || {};
  function CustomDay(
    props: PickersDayProps<Date> & { monthData?: { [key: string]: any } },
  ) {
    const { day, outsideCurrentMonth, monthData = {}, ...other } = props;

    const dayInfo = getDayInfo(day.getDate());

    return (
      <>
        <Grid container justifyContent={"center"}>
          <Grid item>
            <PickersDay
              {...other}
              day={day}
              outsideCurrentMonth={outsideCurrentMonth}
            />
          </Grid>
          <Grid item>
            {!outsideCurrentMonth && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "4px",
                  marginTop: "2px",
                }}
              >
                {dayInfo.hasScheduled && (
                  <span
                    style={{
                      backgroundColor: "purple",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                    }}
                  ></span>
                )}
                {dayInfo.hasDone && (
                  <span
                    style={{
                      backgroundColor: "green",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                    }}
                  ></span>
                )}
                {dayInfo.hasCanceled && (
                  <span
                    style={{
                      backgroundColor: "red",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                    }}
                  ></span>
                )}
                {dayInfo.hasDayOff && (
                  <span
                    style={{
                      backgroundColor: "gray",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                    }}
                  ></span>
                )}
              </div>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <DatePicker
          sx={{ width: 200 }}
          localeText={{ toolbarTitle: "Selecione a data" }}
          value={date}
          closeOnSelect
          onChange={(newValue) => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
              const calendarApi = calendarEl.getApi();

              calendarApi.gotoDate(newValue as Date);
              setDate(calendarApi.getDate());
            }
          }}
          slots={{
            day: CustomDay,
            previousIconButton: () => (
              <IconButton
                onClick={handleMonthPrev}
                title="Próximo mês"
                sx={{ p: 0, m: 0 }}
              >
                <CaretLeft size={16} weight="bold" />
              </IconButton>
            ),
            nextIconButton: () => (
              <IconButton
                onClick={handleMonthNext}
                sx={{ p: 0, m: 0 }}
                title="Próximo mês"
              >
                <CaretRight size={16} weight="bold" />
              </IconButton>
            ),
            actionBar: () => null,
          }}
          format="MMMM/yyyy"
          views={["year", "month", "day"]}
        />
      </LocalizationProvider>
    </>
  );
}
