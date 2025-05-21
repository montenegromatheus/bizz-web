"use client";

import { useEffect, useRef, useState } from "react";

// material-ui
import {
  Theme,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";

// third-party
import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import { Appointment, Customer } from "@/schema";
import {
  DateSelectArg,
  EventClickArg,
  EventSourceFunc,
  EventContentArg,
} from "@fullcalendar/core";
import ptbrLocale from "@fullcalendar/core/locales/pt-br";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { addDays, addMinutes, startOfWeek } from "date-fns";
import EditAppointmentForm from "./edit-appointment-form";
import NewAppointmentForm from "./new-appointment-form";
import StyledCalendar from "./styled-calendar";
import Toolbar from "./toolbar";
import MonthView, { DayData } from "./monthView";
import FinishAppointmentForm from "./FinishAppointmentForm";

export type DateRange = { start: number | Date; end: number | Date };

interface IExtendedAppointment extends Appointment {
  duration: number;
  customer: Customer;
}

function getFirstDayOfWeek(date: Date): Date {
  const firstDayOfWeek = startOfWeek(date, { weekStartsOn: 0 });
  return firstDayOfWeek;
}

const Calendar = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const matchSm = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [date, setDate] = useState(
    new Date(getFirstDayOfWeek(new Date()).setHours(0, 0, 0, 0)),
  );
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [appointments, setAppointments] = useState<IExtendedAppointment[]>([]);
  const theme = useTheme();
  const { companyId } = useAuth();
  const [isFinishing, setIsFinishing] = useState(false);

  const { loadingDispatch } = useLoading();

  const [view, setView] = useState("listWeek");
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<IExtendedAppointment | null>(null);

  const handleDateToday = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      if (view === "listWeek") {
        setDate(getFirstDayOfWeek(calendarApi.getDate()));
      } else {
        const date = calendarApi.getDate();
        const now = new Date();
        date.setHours(now.getHours(), 0, 0, 0); // Define a data para o início do dia
        setDate(date);
      }
    }
  };

  const handleViewChange = (newView: string) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      setView(newView);
      if (newView === "listWeek") {
        setDate(getFirstDayOfWeek(calendarApi.getDate()));
      } else if (newView === "timeGridDay") {
        // Muda para a visualização diária e posiciona para hoje
        calendarApi.today(); // garante que o calendário vá para hoje
        const today = calendarApi.getDate();
        const now = new Date();
        today.setHours(now.getHours(), 0, 0, 0); // Define a data para o início do dia
        setDate(today);
      }
    }
  };

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  const handleMonthNext = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.incrementDate({ months: 1 });
      setDate(calendarApi.getDate());
    }
  };

  const handleMonthPrev = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.incrementDate({ months: -1 });
      setDate(calendarApi.getDate());
    }
  };

  const handleRangeSelect = (arg: DateSelectArg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }
  };

  const handleEventSelect = (arg: EventClickArg) => {
    if (arg.event.id) {
      const selectEvent = appointments.find(
        (_event: any) => _event.id === arg.event.id,
      );
      setSelectedEvent(selectEvent!);
      setIsEventOpen(true);
    } else {
      setSelectedEvent(null);
    }
  };

  function getColorByStatus(status: string): string {
    switch (status) {
      case "SCHEDULED":
        return theme.palette.primary.light;
      case "CANCELED":
        return theme.palette.error.dark;
      case "DONE":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  }

  function renderEventContent(eventInfo: EventContentArg) {
    return (
      <div style={{ padding: "2px" }}>
        <div style={{ fontWeight: "bold" }}>
          {eventInfo.event.extendedProps.customerName}
        </div>
        <div style={{ fontSize: "0.9em" }}>
          {eventInfo.event.extendedProps.services}
        </div>
      </div>
    );
  }

  const [hideCanceled, setHideCanceled] = useState<boolean>(true);
  function getEvents(): Partial<EventSourceFunc> {
    const filteredAppointments = hideCanceled
      ? appointments.filter((appointment) => appointment.status !== "CANCELED")
      : appointments;

    return {
      events: filteredAppointments.map((appointment) => {
        const start = addMinutes(appointment.scheduledDate, 180);
        const end = addMinutes(
          appointment.scheduledDate,
          appointment.duration + 180,
        );
        const services = appointment.services
          ? appointment.services.map((s) => s.service?.name).join(", ")
          : "";

        return {
          id: appointment.id,
          allDay: false,
          color: getColorByStatus(appointment.status),
          start,
          end,
          title: "",
          extendedProps: {
            customerName: appointment.customer.name,
            services,
            status: appointment.status,
          },
        };
      }),
    };
  }

  async function loadData(startDate: Date = date) {
    const start = view === "listWeek" ? getFirstDayOfWeek(date) : startDate;
    const end =
      view === "listWeek"
        ? addDays(getFirstDayOfWeek(date), 7)
        : addDays(date, 1);
    loadingDispatch({ type: "START_LOADING" });
    try {
      const data = await api.appointment.search({
        companyId: companyId!,
        startDate: start,
        endDate: end,
      });
      const month = await api.company.monthReport(companyId!, {
        date: start,
      });
      setMonthData(month);
      setAppointments(data);
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  }
  useEffect(() => {
    loadData(date);
  }, [date, view]);

  const events = getEvents();

  return (
    <>
      <NewAppointmentForm loadData={loadData} date={date} />
      <Grid container justifyContent="center" sx={{ mb: 2 }}>
        <MonthView
          handleMonthNext={handleMonthNext}
          handleMonthPrev={handleMonthPrev}
          monthData={monthData}
          date={date}
          setDate={setDate}
          calendarRef={calendarRef}
        />
      </Grid>
      <StyledCalendar>
        <Toolbar
          date={date}
          view={view}
          onClickNext={handleDateNext}
          onClickPrev={handleDatePrev}
          onClickToday={handleDateToday}
          onChangeView={handleViewChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hideCanceled}
              onChange={(e) => setHideCanceled(e.target.checked)}
              name="hideCanceled"
              color="primary"
            />
          }
          label="Ocultar agendamentos cancelados"
        />
        <FullCalendar
          locale={ptbrLocale}
          weekends
          editable
          droppable
          selectable
          events={events}
          eventContent={renderEventContent}
          ref={calendarRef}
          rerenderDelay={10}
          initialDate={date}
          initialView={view}
          dayMaxEventRows={3}
          eventDisplay="block"
          headerToolbar={false}
          allDayMaintainDuration
          eventResizableFromStart
          noEventsContent={"Sem agendamentos nessa semana"}
          select={handleRangeSelect}
          eventClick={handleEventSelect}
          height={matchSm ? "auto" : 720}
          plugins={[listPlugin, timeGridPlugin]}
        />
      </StyledCalendar>
      {selectedEvent && (
        <EditAppointmentForm
          loadData={loadData}
          date={date}
          open={isEventOpen}
          setIsFinishing={setIsFinishing}
          setOpen={setIsEventOpen}
          appointment={selectedEvent}
          setAppointment={setSelectedEvent}
        />
      )}
      {isFinishing && selectedEvent && (
        <FinishAppointmentForm
          loadData={loadData}
          date={date}
          open={isFinishing}
          setOpen={setIsFinishing}
          appointment={selectedEvent}
          setAppointment={setSelectedEvent}
        />
      )}
    </>
  );
};

export default Calendar;
