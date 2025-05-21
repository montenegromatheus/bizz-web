"use client";

import {
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Plus, Trash } from "@phosphor-icons/react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FormData } from "./Employee";

const minutes: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, "0");
    const minute = m.toString().padStart(2, "0");
    minutes.push(`${hour}:${minute}`);
  }
}

export const getWeekdayInPortuguese = (day: string) => {
  const weekdays: { [key: string]: string } = {
    first: "Segunda-feira",
    second: "Terça-feira",
    third: "Quarta-feira",
    forth: "Quinta-feira",
    fifth: "Sexta-feira",
    sixth: "Sábado",
    seventh: "Domingo",
  };

  return weekdays[day];
};

enum Week {
  first = "MONDAY",
  second = "TUESDAY",
  third = "WEDNESDAY",
  forth = "THURSDAY",
  fifth = "FRIDAY",
  sixth = "SATURDAY",
  seventh = "SUNDAY",
}

const DayOfWeek = ({
  day,
}: {
  day: "first" | "second" | "third" | "forth" | "fifth" | "sixth" | "seventh";
}) => {
  const { control, watch, setValue } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: day,
  });

  const hasTime = watch(day).length > 0;

  const toggleHasTime = (checked: boolean) => {
    if (!checked) {
      setValue(day, []);
    } else {
      append({
        dayOfWeek: Week[day],
        startTime: "",
        endTime: "",
      });
    }
  };

  return (
    <Stack direction={"row"} key={day} alignItems={"center"} sx={{ mb: 2 }}>
      <Checkbox
        checked={hasTime}
        onChange={(e) => toggleHasTime(e.target.checked)}
      />
      <Typography sx={{ width: 100 }} variant="subtitle2">
        {getWeekdayInPortuguese(day)}
      </Typography>
      {hasTime ? (
        <Stack>
          {fields.map((field, index) => (
            <Stack
              key={field.id}
              direction={"row"}
              alignItems={"center"}
              sx={{ mb: 1 }}
            >
              <Controller
                control={control}
                name={`${day}.${index}.startTime`}
                rules={{ required: "Campo obrigatório" }}
                render={({ field, fieldState }) => (
                  <Select
                    sx={{ height: 30, width: 100 }}
                    {...field}
                    error={!!fieldState.error}
                  >
                    {minutes.map((minute) => (
                      <MenuItem key={minute} value={minute}>
                        {minute}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <Box sx={{ mx: 1 }}>-</Box>
              <Controller
                control={control}
                name={`${day}.${index}.endTime`}
                rules={{ required: "Campo obrigatório" }}
                render={({ field, fieldState }) => (
                  <Select
                    sx={{ height: 30, width: 100 }}
                    {...field}
                    error={!!fieldState.error}
                  >
                    {minutes.map((minute) => (
                      <MenuItem key={minute} value={minute}>
                        {minute}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {index === 0 ? (
                <IconButton
                  size="small"
                  onClick={() =>
                    append({ startTime: "", endTime: "", dayOfWeek: Week[day] })
                  }
                >
                  <Plus />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash />
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
      ) : (
        <Stack width={"50%"} justifyContent={"center"} alignItems={"center"}>
          <Typography
            variant="caption"
            color={"GrayText"}
            sx={{ fontWeight: "bold" }}
          >
            Fechado
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default DayOfWeek;
