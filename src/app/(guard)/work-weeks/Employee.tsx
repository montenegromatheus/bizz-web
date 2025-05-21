"use client";

import { axiosWithoutInterceptor } from "@/api/axiosWithoutInterceptor";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Employee, WorkWeek } from "@/schema";
import { Button, Divider, Grid } from "@mui/material";
import { Stack } from "@mui/system";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DayOfWeek, { getWeekdayInPortuguese } from "./DayOfWeek";

const week: (
  | "first"
  | "second"
  | "third"
  | "forth"
  | "fifth"
  | "sixth"
  | "seventh"
)[] = ["first", "second", "third", "forth", "fifth", "sixth", "seventh"];

export interface FormData {
  first: Partial<WorkWeek>[];
  second: Partial<WorkWeek>[];
  third: Partial<WorkWeek>[];
  forth: Partial<WorkWeek>[];
  fifth: Partial<WorkWeek>[];
  sixth: Partial<WorkWeek>[];
  seventh: Partial<WorkWeek>[];
}

const isEndTimeAfterStartTime = (workWeeks: Partial<WorkWeek>[]) => {
  for (const { startTime, endTime } of workWeeks) {
    if (startTime && endTime && startTime >= endTime) {
      return true;
    }
  }

  return false;
};

const isTimeOverlapped = (workWeeks: Partial<WorkWeek>[]) => {
  const sortedWeeks = [...workWeeks].sort((a, b) =>
    (a.startTime || "").localeCompare(b.startTime || ""),
  );

  for (let i = 0; i < sortedWeeks.length - 1; i++) {
    const current = sortedWeeks[i];
    const next = sortedWeeks[i + 1];

    if (current.endTime && next.startTime && current.endTime > next.startTime) {
      return true;
    }
  }

  return false;
};

const EmployeeCard = ({
  employee,
  setSelectedEmployee,
}: {
  employee: Employee;
  setSelectedEmployee: Dispatch<SetStateAction<Employee | undefined>>;
}) => {
  const { showSnackbar } = useSnackbar();
  const { loadingDispatch } = useLoading();

  const methods = useForm<FormData>({
    defaultValues: {
      first: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "MONDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      second: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "TUESDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      third: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "WEDNESDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      forth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "THURSDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      fifth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "FRIDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      sixth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "SATURDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      seventh: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "SUNDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
    },
  });

  useEffect(() => {
    methods.reset(() => ({
      first: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "MONDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      second: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "TUESDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      third: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "WEDNESDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      forth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "THURSDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      fifth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "FRIDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      sixth: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "SATURDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
      seventh: employee.workWeeks
        .filter((workWeek) => workWeek.dayOfWeek === "SUNDAY")
        .map((workWeek) => ({
          ...workWeek,
          startTime: workWeek.startTime.slice(-13, -8),
          endTime: workWeek.endTime.slice(-13, -8),
        })),
    }));
  }, [employee.id]);

  const onSubmit = async (data: FormData) => {
    loadingDispatch({ type: "START_LOADING" });
    for (const [key, workWeeks] of Object.entries(data)) {
      if (isTimeOverlapped(workWeeks)) {
        showSnackbar(
          `Os horários de ${getWeekdayInPortuguese(key)} têm sobreposição.`,
          "error",
        );
        return;
      }
      if (isEndTimeAfterStartTime(workWeeks)) {
        showSnackbar(
          `Os horários de ${getWeekdayInPortuguese(key)} precisam ter horário final posterior ao horário inicial.`,
          "error",
        );
        return;
      }
    }

    const payload: { workWeeks?: Partial<WorkWeek>[] } = {
      workWeeks: Object.values(data).flatMap((workWeeks: Partial<WorkWeek>[]) =>
        workWeeks.map((workWeek) => ({
          dayOfWeek: workWeek.dayOfWeek,
          startTime: workWeek.startTime,
          endTime: workWeek.endTime,
        })),
      ),
    };

    try {
      const response = await axiosWithoutInterceptor.put(
        `employee/${employee.id}/work-week`,
        {
          ...payload,
        },
      );
      setSelectedEmployee(response.data);
      showSnackbar("Horários salvos com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao salvar os horários", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack key={employee.id}>
          {week.map((day, dayIndex) => (
            <>
              <DayOfWeek key={day} day={day} />
            </>
          ))}
          <Grid container justifyContent={"flex-end"}>
            <Button type="submit" variant="contained" sx={{ height: 40 }}>
              Salvar
            </Button>
          </Grid>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default EmployeeCard;
