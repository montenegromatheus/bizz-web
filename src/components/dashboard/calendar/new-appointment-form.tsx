"use client";

import { api } from "@/api";
import { CreateAppointmentDto } from "@/api/appointment/appointment.dto";
import RequiredField from "@/components/core/required-field";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Customer, Service } from "@/schema";
import { debounce } from "lodash"; // Importa debounce do lodash
import {
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Plus } from "@phosphor-icons/react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import posthog from "@/lib/posthog.client";

interface INewAppointmentFormData {
  customerId: string;
  serviceIds: string[];
  scheduledDate: string | null;
  scheduledHour: string | null;
}

interface DateAvailability {
  availableDate: string;
  availableHours: string[];
}

function getWeekDay(dateString: string): string {
  const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
  return format(parsedDate, "EEEE", { locale: ptBR });
}

export default function NewAppointmentForm({
  loadData,
  date,
}: {
  loadData: (startDate: Date) => Promise<void>;
  date: Date;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { companyId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [dates, setDates] = useState<DateAvailability[]>([]);
  const { loadingDispatch } = useLoading();
  const { showSnackbar } = useSnackbar();

  async function getCustomers(query?: string) {
    loadingDispatch({ type: "START_LOADING" });
    const data = await api.company.companyCustomers(companyId!, { query });
    setCustomers(data);
    loadingDispatch({ type: "STOP_LOADING" });
  }

  async function getServices(query?: string) {
    loadingDispatch({ type: "START_LOADING" });
    const data = await api.company.companyServices(companyId!, { query });
    setServices(data);
    loadingDispatch({ type: "STOP_LOADING" });
  }

  useEffect(() => {
    getCustomers();
    getServices();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { isValid },
    reset,
  } = useForm<INewAppointmentFormData>({
    defaultValues: {
      customerId: "",
      serviceIds: [],
      scheduledDate: null,
      scheduledHour: null,
    },
  });

  const selectedDate = watch("scheduledDate");

  function convertDateFormat(inputDate: string): string {
    const [day, month, year] = inputDate.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const onSubmit = async (data: INewAppointmentFormData) => {
    loadingDispatch({ type: "START_LOADING" });
    const payload: CreateAppointmentDto = {
      customerId: data.customerId,
      companyId: companyId!,
      serviceIds: data.serviceIds,
      scheduledDate: convertDateFormat(data.scheduledDate!),
      scheduledHour: data.scheduledHour!,
    };
    try {
      await api.appointment.create(payload);
      // Evento PostHog
      posthog.capture("clique_agendar", {
        cliente_id: data.customerId,
        servicos: data.serviceIds,
        data: data.scheduledDate,
        horario: data.scheduledHour,
      });

      showSnackbar("Agendamento criado com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao criar agendamento", "error");
    } finally {
      loadData(date);
      reset();
      setOpen(false);
      setAvailabilityChecked(false);
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  const getAvailabilities = async () => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const serviceIds = getValues("serviceIds");
      const data = await api.appointment.availability({
        companyId: companyId!,
        serviceIds,
      });
      setDates(data);
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  const handleAvailability = () => {
    setDates([]);
    setAvailabilityChecked(true);
    getAvailabilities();
  };

  const handleEditServices = () => {
    setAvailabilityChecked(false);
    setValue("scheduledDate", null);
    setValue("scheduledHour", null);
  };

  return (
    <>
      <IconButton
        title="Novo agendamento"
        onClick={handleClickOpen}
        sx={{
          backgroundColor: theme.palette.primary.main,
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 1000,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            opacity: 1,
          },
        }}
      >
        <Plus color="white" />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Novo agendamento</Typography>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <RequiredField name="Cliente">
                <Controller
                  control={control}
                  name="customerId"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Autocomplete
                        noOptionsText="Nenhum cliente encontrado"
                        disablePortal
                        onInputChange={debounce(
                          (event: any, inputValue: any) => {
                            return getCustomers(`name*:${inputValue}`);
                          },
                          200,
                        )}
                        onChange={(e, value) => {
                          field.onChange(value?.id ?? "");
                        }}
                        getOptionLabel={(option) =>
                          `${option.label} - ${option.phone}`
                        }
                        options={customers?.map((item) => ({
                          label: item.name,
                          id: item.id,
                          phone: item.phone,
                        }))}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </>
                  )}
                />
              </RequiredField>

              <Stack alignItems={"left"} justifyContent={"flex-start"}>
                <RequiredField name="Serviços">
                  <Controller
                    control={control}
                    name="serviceIds"
                    rules={{ required: "Campo obrigatório" }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <Autocomplete
                          noOptionsText="Nenhum serviço encontrado"
                          disabled={availabilityChecked}
                          multiple
                          disablePortal
                          onInputChange={debounce(
                            (event: any, inputValue: any) => {
                              return getServices(`name*:${inputValue}`);
                            },
                            200,
                          )}
                          options={services}
                          getOptionLabel={(option) =>
                            `${option.name} - ${option.duration} minutos`
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          onChange={(e, value) => {
                            field.onChange(value.map((item) => item.id));
                            setValue(
                              "serviceIds",
                              value.map((item) => item.id),
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione o(s) serviço(s)"
                              error={!!error}
                              helperText={error ? error.message : null}
                            />
                          )}
                          sx={{ width: 300 }}
                        />
                      </>
                    )}
                  />
                </RequiredField>
                {availabilityChecked && (
                  <Grid item textAlign={"left"}>
                    <Button
                      variant="text"
                      onClick={handleEditServices}
                      sx={{ textDecoration: "underline" }}
                    >
                      Editar serviços
                    </Button>
                  </Grid>
                )}
              </Stack>

              {!availabilityChecked && (
                <Grid justifyContent={"flex-start"}>
                  <Button
                    onClick={handleAvailability}
                    disabled={availabilityChecked}
                    variant="outlined"
                  >
                    Verificar disponibilidade
                  </Button>
                </Grid>
              )}

              {availabilityChecked && dates.length > 0 && (
                <RequiredField name="Data">
                  <Controller
                    control={control}
                    name="scheduledDate"
                    rules={{ required: "Campo obrigatório" }}
                    render={({ field, fieldState: { error } }) => (
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            {...field}
                            placeholder="Selecione a data"
                          >
                            {dates.map((date) => (
                              <MenuItem
                                key={date.availableDate}
                                value={date.availableDate}
                              >
                                {date.availableDate}
                                {" - "}
                                {getWeekDay(date.availableDate)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </Box>
                    )}
                  />
                </RequiredField>
              )}

              {availabilityChecked && selectedDate && (
                <RequiredField name="Horário">
                  <Controller
                    control={control}
                    name="scheduledHour"
                    rules={{ required: "Campo obrigatório" }}
                    render={({ field, fieldState: { error } }) => (
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            {...field}
                            placeholder="Selecione um horário"
                          >
                            {dates
                              .find(
                                (date) => date.availableDate === selectedDate,
                              )
                              ?.availableHours.map((hour) => (
                                <MenuItem key={hour} value={hour}>
                                  {hour}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </Box>
                    )}
                  />
                </RequiredField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Stack
              justifyContent={"space-between"}
              direction={"row"}
              width={"100%"}
              sx={{ px: 2, mb: 2 }}
            >
              <Button variant="outlined" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!(isValid && Boolean(selectedDate))}
              >
                Agendar
              </Button>
            </Stack>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
