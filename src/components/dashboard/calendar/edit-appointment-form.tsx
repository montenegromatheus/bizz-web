"use client";

import { api } from "@/api";
import { CreateAppointmentDto } from "@/api/appointment/appointment.dto";
import RequiredField from "@/components/core/required-field";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Appointment, Customer, DiscountType, Service } from "@/schema";
import {
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Check, DotsThreeOutlineVertical, X } from "@phosphor-icons/react";
import { addMinutes, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { debounce } from "lodash";
import { useConfirm } from "material-ui-confirm";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface IEditAppointmentFormData {
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

function convertDateFormat(inputDate: string): string {
  const [day, month, year] = inputDate.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

interface IExtendedAppointment extends Appointment {
  duration: number;
  customer: Customer;
}

export default function EditAppointmentForm({
  loadData,
  date,
  open,
  setOpen,
  appointment,
  setIsFinishing,
  setAppointment,
}: {
  loadData: (startDate: Date) => Promise<void>;
  date: Date;
  open: boolean;
  setIsFinishing: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  appointment: IExtendedAppointment;
  setAppointment: Dispatch<SetStateAction<IExtendedAppointment | null>>;
}) {
  const { companyId } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [dates, setDates] = useState<DateAvailability[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { loadingDispatch } = useLoading();

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { isValid },
    reset,
  } = useForm<IEditAppointmentFormData>({
    defaultValues: {
      serviceIds:
        appointment.services?.length! > 0
          ? appointment.services?.map((item) => item.serviceId)
          : [],
      scheduledDate: null,
      scheduledHour: null,
    },
  });

  async function getServices(query?: string) {
    loadingDispatch({ type: "START_LOADING" });
    const data = await api.company.companyServices(companyId!, { query });
    setServices(data);
    loadingDispatch({ type: "STOP_LOADING" });
  }

  useEffect(() => {
    getServices();
    setSelectedServices(appointment.services!.map((s) => s.service!));
    setSelectedServices(appointment.services!.map((s) => s.service!));
  }, []);

  const handleClose = () => {
    setOpen(false);
    setAppointment(null);
  };

  const selectedDate = watch("scheduledDate");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { showSnackbar } = useSnackbar();

  const onSubmit = async (data: IEditAppointmentFormData) => {
    loadingDispatch({ type: "START_LOADING" });
    const payload: CreateAppointmentDto = {
      customerId: appointment.customerId,
      companyId: companyId!,
      serviceIds: data.serviceIds,
      scheduledDate: convertDateFormat(data.scheduledDate!),
      scheduledHour: data.scheduledHour!,
    };
    try {
      await api.appointment
        .update(appointment.id, payload)
        .then(() => {
          showSnackbar("Agendamento editado com sucesso", "success");
        })
        .catch(() => {
          showSnackbar("Erro ao editar agendamento", "error");
        });
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      loadData(date);
      reset();
      handleClose();
      setAvailabilityChecked(false);
    }
  };

  const getAvailabilities = async () => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const serviceIds = getValues("serviceIds");
      const data = await api.appointment.availability({
        editingAppointmentId: appointment.id,
        companyId: companyId!,
        serviceIds,
      });
      setDates(data);
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  const confirm = useConfirm();

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCancel = async () => {
    try {
      await api.appointment.cancel(appointment.id);
      loadData(date);
      handleMenuClose();
      handleClose();
      showSnackbar("Agendamento cancelado", "success");
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelClick = () => {
    confirm({
      title: "Tem certeza?",
      description: "Essa ação é irreversível.",
      cancellationText: "Cancelar",
    })
      .then(() => {
        handleCancel();
      })
      .catch(() => {});
  };

  const handleCancelDone = () => {
    setOpen(false);
    setIsFinishing(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuOpen = Boolean(anchorEl);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={handleCancelClick}>
              <X size={20} />
              Cancelar
            </MenuItem>
            <MenuItem onClick={handleCancelDone}>
              <Check size={20} />
              Finalizar
            </MenuItem>
          </Menu>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Detalhes</Typography>
              {appointment.status === "SCHEDULED" && (
                <IconButton title="Ações" onClick={handleClick}>
                  <DotsThreeOutlineVertical />
                </IconButton>
              )}
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <List
                dense
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                }}
              >
                <ListItem sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Data
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        {format(
                          addMinutes(appointment.scheduledDate, 180),
                          "dd/MM/yyyy - HH:mm",
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Cliente
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        {appointment.customer.name} -{" "}
                        <a
                          href={`https://wa.me/${appointment.customer.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline" }}
                        >
                          {appointment.customer.phone}
                        </a>
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        justifyContent={"space-between"}
                        alignItems={"top"}
                      >
                        <Stack>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Serviços
                          </Typography>

                          <Stack sx={{ mb: 1 }}>
                            {appointment.services?.map((s) => (
                              <Typography variant="caption" key={s.serviceId}>
                                {s.service!.name}: R$ {s.paidAmount}
                              </Typography>
                            ))}
                          </Stack>
                          {appointment.status === "DONE" &&
                            appointment.discountType && (
                              <>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Subtotal: R${" "}
                                  {appointment.services
                                    ?.map((_item) => _item.paidAmount)
                                    .reduce((a, b) => Number(a) + Number(b))}
                                </Typography>
                                <Typography variant="caption">
                                  Desconto:{" "}
                                  {appointment.discountType ===
                                  DiscountType.Valor
                                    ? `R$ ${appointment.discountValue}`
                                    : `${appointment.discountValue}%`}
                                </Typography>
                              </>
                            )}
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            Total: R$ {appointment.totalPaid}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              </List>

              {isEditing && (
                <>
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
                                setSelectedServices(value);
                              }}
                              value={selectedServices}
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
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
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
                                    (date) =>
                                      date.availableDate === selectedDate,
                                  )
                                  ?.availableHours.map((hour) => (
                                    <MenuItem key={hour} value={hour}>
                                      {hour}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </Box>
                        )}
                      />
                    </RequiredField>
                  )}
                </>
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
              {isEditing && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!(isValid && Boolean(selectedDate))}
                >
                  Salvar
                </Button>
              )}
              {!isEditing && appointment.status === "SCHEDULED" && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Editar
                </Button>
              )}
            </Stack>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
