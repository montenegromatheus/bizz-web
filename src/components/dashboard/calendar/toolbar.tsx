"use client";

import { useEffect, useState } from "react";

// material-ui
import {
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  GridProps,
  useMediaQuery,
  Theme,
} from "@mui/material";

// third-party
import { endOfWeek, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
// assets
import {
  CaretLeft,
  CaretRight,
  ListNumbers,
  Rows,
} from "@phosphor-icons/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";

// constant
const viewOptions = [
  //   {
  //     label: "Month",
  //     value: "dayGridMonth",
  //     icon: IconLayoutGrid,
  //   },
  //   {
  //     label: "Week",
  //     value: "timeGridWeek",
  //     icon: IconTemplate,
  //   },
  {
    label: "Day",
    value: "timeGridDay",
    icon: Rows,
  },
  {
    label: "Agenda",
    value: "listWeek",
    icon: ListNumbers,
  },
];

// ==============================|| CALENDAR TOOLBAR ||============================== //

interface ToolbarProps {
  date: number | Date;
  view: string;
  onClickNext: () => void;
  onClickPrev: () => void;
  onClickToday: () => void;
  onChangeView: (s: string) => void;
  sx?: GridProps["sx"];
}

const Toolbar = ({
  date,
  view,
  onClickNext,
  onClickPrev,
  onClickToday,
  onChangeView,
  sx,
  ...others
}: ToolbarProps) => {
  const matchSm = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [newViewOption, setNewViewOption] = useState(viewOptions);

  useEffect(() => {
    let newOption = viewOptions;
    if (matchSm) {
      newOption = viewOptions.filter(
        (options) =>
          options.value !== "dayGridMonth" && options.value !== "timeGridWeek",
      );
    }
    setNewViewOption(newOption);
  }, [matchSm]);

  function formatWeekRange(date: Date): string {
    // Obtém o primeiro e o último dia da semana com base na data fornecida
    const firstDayOfWeek = startOfWeek(date, { weekStartsOn: 0 }); // Início da semana no domingo
    const lastDayOfWeek = endOfWeek(date, { weekStartsOn: 0 }); // Fim da semana no sábado

    // Formata os dias e o mês
    const firstDay = format(firstDayOfWeek, "d", { locale: ptBR });
    const lastDay = format(lastDayOfWeek, "d", { locale: ptBR });
    const month = format(lastDayOfWeek, "MMMM", { locale: ptBR });

    // Retorna a string formatada
    return `${firstDay} a ${lastDay} de ${month}`;
  }

  return (
    <Stack
      direction={"row"}
      alignItems="center"
      justifyContent="space-between"
      {...others}
      // xs={12}
      sx={{ pb: 3 }}
    >
      <Grid item xs={2}>
        <Button variant="outlined" onClick={onClickToday}>
          Hoje
        </Button>
        {/* <Button
          variant="outlined"
          onClick={onCreateAppointment}
          endIcon={<Plus />}
        >
          Novo agendamento
        </Button> */}
      </Grid>
      <Grid item xs={5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onClickPrev} size="medium" aria-label="prev">
            <CaretLeft />
          </IconButton>
          <Typography variant="body1" color="textPrimary">
            {view === "listWeek"
              ? formatWeekRange(new Date(date))
              : format(date, "dd MMMM", { locale: ptBR })}
          </Typography>
          <IconButton onClick={onClickNext} size="medium" aria-label="next">
            <CaretRight />
          </IconButton>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          {newViewOption.map((viewOption) => {
            const Icon = viewOption.icon;
            return (
              <Tooltip title={viewOption.label} key={viewOption.value}>
                <Button
                  disableElevation
                  variant={viewOption.value === view ? "contained" : "outlined"}
                  onClick={() => onChangeView(viewOption.value)}
                >
                  <Icon size={20} />
                </Button>
              </Tooltip>
            );
          })}
        </ButtonGroup>
      </Grid>
    </Stack>
  );
};

export default Toolbar;
