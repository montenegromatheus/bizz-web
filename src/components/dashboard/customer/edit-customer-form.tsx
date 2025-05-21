"use client";

import { api } from "@/api";
import RequiredField from "@/components/core/required-field";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Customer } from "@/schema";
import {
  FormHelperText,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { XCircle } from "@phosphor-icons/react";
import { isDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import parsePhoneNumberFromString from "libphonenumber-js";
import { MuiTelInput } from "mui-tel-input";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";

interface IEditCustomerFormData {
  id: string;
  name: string;
  phone: string;
  birthDate: Date | null;
}

export default function EditCustomerForm({
  loadData,
  selectedCustomer,
  setSelectedCustomer,
}: {
  loadData: () => Promise<void>;
  selectedCustomer: Customer;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
}) {
  const { control, handleSubmit, reset } = useForm<IEditCustomerFormData>({
    defaultValues: {
      ...selectedCustomer,
      phone: `+${selectedCustomer.phone}`,
      birthDate: selectedCustomer.birthDate
        ? new Date(selectedCustomer.birthDate)
        : null,
    },
  });
  const { loadingDispatch } = useLoading();
  const { showSnackbar } = useSnackbar();

  const onSubmit = async (data: IEditCustomerFormData) => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate,
      };
      await api.customer.update(selectedCustomer?.id!, payload);
      showSnackbar("Cliente editado com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao editar cliente", "error");
    } finally {
      loadData();
      loadingDispatch({ type: "STOP_LOADING" });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCustomer(null);
    reset();
  };
  return (
    <>
      <Dialog open={Boolean(selectedCustomer)} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Editando cliente</Typography>
              <IconButton onClick={handleClose}>
                <XCircle size={24} />
              </IconButton>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <RequiredField name="Nome">
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <TextField
                        {...field}
                        autoFocus
                        id="name"
                        name="name"
                        fullWidth
                      />
                      {error && (
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </RequiredField>

              <RequiredField name="Contato">
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: "Campo obrigatório",
                    validate: (value) => {
                      if (!value) {
                        return "Campo obrigatório";
                      }

                      const phoneNumber = parsePhoneNumberFromString(value);

                      if (!phoneNumber || !phoneNumber.isValid()) {
                        return "Contato inválido para o país";
                      }

                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <MuiTelInput {...field} />

                      {error && (
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </RequiredField>

              <Typography variant="body2" sx={{ mb: -2 }}>
                Aniversário
              </Typography>
              <Controller
                control={control}
                name="birthDate"
                rules={{
                  validate: (value) => {
                    if (value === null) {
                      return true;
                    }
                    if (value && isDate(new Date(value))) {
                      return true;
                    }
                    return "Data inválida";
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ptBR}
                    >
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          value={field.value}
                          inputRef={field.ref}
                          onChange={(date, context) => {
                            field.onChange(date);
                          }}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                    {error && (
                      <FormHelperText error>{error.message}</FormHelperText>
                    )}
                  </>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="outlined">
              Editar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
