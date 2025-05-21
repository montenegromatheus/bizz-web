"use client";

import { api } from "@/api";
import {
  CreateAppointmentDto,
  FinishAppointmentDto,
} from "@/api/appointment/appointment.dto";
import RequiredField from "@/components/core/required-field";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Appointment, Customer, DiscountType, Service } from "@/schema";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { addMinutes, format } from "date-fns";
import { debounce } from "lodash";
import { useConfirm } from "material-ui-confirm";
import { useParams } from "next/navigation";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat, NumericFormatProps } from "react-number-format";

interface IEditAppointmentFormData {
  serviceIds: string[];
  scheduledDate: string | null;
  scheduledHour: string | null;
}

interface IExtendedAppointment extends Appointment {
  duration: number;
  customer: Customer;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatCustom = forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator="."
        decimalSeparator=","
        valueIsNumericString
        prefix="R$ "
      />
    );
  },
);

const PercentageFormatCustom = forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator="."
        decimalSeparator=","
        valueIsNumericString
      />
    );
  },
);

export default function FinishAppointmentForm({
  loadData,
  date,
  open,
  setOpen,
  appointment,
  setAppointment,
}: {
  loadData: (startDate: Date) => Promise<void>;
  date: Date;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  appointment: IExtendedAppointment;
  setAppointment: Dispatch<SetStateAction<IExtendedAppointment | null>>;
}) {
  const { companyId } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const { loadingDispatch } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [paymentType, setPaymentType] = useState<string>("Pix");
  const [discountType, setDiscountType] = useState<string>("R$");
  const [discountValue, setDiscountValue] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);

  const [totalValue, setTotalValue] = useState(
    `${selectedServices
      .map((service) => service.price)
      .reduce((a: number, b: number) => Number(a) + Number(b), 0)}`,
  );

  const { control, handleSubmit, setValue, reset } =
    useForm<IEditAppointmentFormData>({
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
  }, [appointment.services]);

  useEffect(() => {
    const valueWithoutDiscount = selectedServices
      .map((service) => service.price)
      .reduce((a: number, b: number) => Number(a) + Number(b), 0);
    if (discountType === "R$") {
      setTotalValue(`${valueWithoutDiscount - Number(discountValue)}`);
    } else if (discountType === "%") {
      setTotalValue(
        `${valueWithoutDiscount * (1 - Number(discountValue) / 100)}`,
      );
    } else {
      setTotalValue(`${valueWithoutDiscount}`);
    }
  }, [discountType, discountValue, selectedServices]);

  useEffect(() => {
    const valueWithoutDiscount = selectedServices
      .map((service) => service.price)
      .reduce((a: number, b: number) => Number(a) + Number(b), 0);
    if (discountType === "R$") {
      setTotalValue(`${valueWithoutDiscount - Number(discountValue)}`);
    } else if (discountType === "%") {
      setTotalValue(
        `${valueWithoutDiscount * (1 - Number(discountValue) / 100)}`,
      );
    } else {
      setTotalValue(`${valueWithoutDiscount}`);
    }
  }, [discountType, discountValue, selectedServices]);

  const handleClose = () => {
    setOpen(false);
    setAppointment(null);
  };

  const isPayloadValid = () => {
    if (hasDiscount) {
      if (
        isTotalHigherThanDiscount() &&
        !["", "--"].includes(discountType) &&
        !discountIsZero
      ) {
        onSubmit();
      } else if (!isTotalHigherThanDiscount()) {
        showSnackbar("Desconto inválido", "error");
      } else if (["", "--"].includes(discountType)) {
        showSnackbar("Selecione o tipo de desconto", "error");
      } else if (discountIsZero) {
        showSnackbar("Desconto não pode ser zero", "error");
      }
    } else {
      onSubmit();
    }
  };

  const onSubmit = async () => {
    loadingDispatch({ type: "START_LOADING" });
    const payload: FinishAppointmentDto = {
      serviceIds: selectedServices.map((service) => service.id),
      paymentType,
      discountType:
        !isNaN(Number(discountValue)) && !discountIsZero
          ? discountType === "R$"
            ? "Valor"
            : "Porcentagem"
          : null,
      discountValue:
        !isNaN(Number(discountValue)) && !discountIsZero
          ? Number(discountValue)
          : null,
      totalPaid: Number(totalValue),
    };

    api.axiosWithoutInterceptor
      .put(`/appointment/${appointment.id}/done`, payload)
      .then((response) => {
        showSnackbar("Agendamento finalizado com sucesso", "success");
      })
      .catch(() => {
        showSnackbar("Erro ao finalizar agendamento", "error");
      })
      .finally(() => {
        loadingDispatch({ type: "STOP_LOADING" });
        loadData(date);
        reset();
        handleClose();
        setAvailabilityChecked(false);
      });
  };

  const handlePaymentTypeChange = (e: SelectChangeEvent) => {
    setPaymentType(e.target.value);
  };

  const handleDiscountTypeChange = (e: SelectChangeEvent) => {
    setDiscountType(e.target.value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTotalValue(event.target.value);
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountValue(event.target.value);
  };

  const isTotalHigherThanDiscount = () => {
    if (discountType === "R$") {
      return Number(totalValue) - Number(discountValue) > 0;
    }
    if (discountType === "%") {
      return Number(discountValue) <= 100;
    }
    return true;
  };

  const discountIsZero = Number(discountValue) === 0;

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <form onSubmit={handleSubmit(isPayloadValid)}>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Estamos finalizando</Typography>
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
                        alignItems={"center"}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Serviços
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Total: R${" "}
                          {appointment.services
                            ?.map((_item) => _item.service?.price)
                            .reduce((a, b) => Number(a) + Number(b))}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack>
                        {appointment.services?.map((s) => (
                          <Typography variant="caption" key={s.serviceId}>
                            {s.service!.name}: R$ {s.service!.price}
                          </Typography>
                        ))}
                      </Stack>
                    }
                  />
                </ListItem>
              </List>

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
                              `${option.name} - R$ ${option.price}`
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
                  <Typography variant="caption">
                    Você pode incluir ou remover os serviços desse agendamento
                  </Typography>
                </Stack>

                <Stack>
                  <Typography variant="body2">Forma de pagamento</Typography>
                  <FormControl fullWidth>
                    <Select
                      labelId="payment-type"
                      id="payment-type"
                      value={paymentType}
                      onChange={handlePaymentTypeChange}
                    >
                      <MenuItem value={"Pix"}>Pix</MenuItem>
                      <MenuItem value={"Dinheiro"}>Dinheiro</MenuItem>
                      <MenuItem value={"Débito"}>Débito</MenuItem>
                      <MenuItem value={"Crédito"}>Crédito</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hasDiscount}
                        onChange={(e) => {
                          setHasDiscount(e.target.checked);
                          if (e.target.checked === false) {
                            setDiscountValue("");
                          }
                        }}
                        name="setHasDiscount"
                        color="primary"
                      />
                    }
                    label="Adicionar desconto"
                  />
                  {hasDiscount && (
                    <>
                      <Typography variant="body2">Desconto</Typography>
                      <Stack direction={"row"}>
                        <Stack sx={{ width: "30%", mr: 1 }}>
                          <FormControl fullWidth sx={{ width: "100%" }}>
                            <Select
                              labelId="discount-type"
                              id="discount-type"
                              value={discountType}
                              onChange={handleDiscountTypeChange}
                            >
                              <MenuItem value={"R$"}>R$</MenuItem>
                              <MenuItem value={"%"}>%</MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                        <Stack>
                          <TextField
                            value={discountValue}
                            onChange={handleDiscountChange}
                            placeholder="0"
                            name="numberformat"
                            id="formatted-numberformat-input"
                            InputProps={{
                              inputComponent: PercentageFormatCustom as any,
                            }}
                          />
                        </Stack>
                      </Stack>
                    </>
                  )}
                </Stack>
                <Stack>
                  <Typography variant="body2">Total</Typography>{" "}
                  <TextField
                    value={totalValue}
                    defaultValue={totalValue}
                    onChange={handleChange}
                    name="numberformat"
                    id="formatted-numberformat-input"
                    InputProps={{
                      inputComponent: NumericFormatCustom as any,
                    }}
                  />
                </Stack>
              </>
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
              <Button type="submit" variant="contained">
                Finalizar
              </Button>
            </Stack>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
