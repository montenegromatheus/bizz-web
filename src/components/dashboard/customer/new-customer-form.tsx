"use client";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Dispatch, SetStateAction, useState } from "react";
import {
  FormHelperText,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Plus, X, XCircle } from "@phosphor-icons/react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import PhoneNumber from "@/components/core/phone-number";
import RequiredField from "@/components/core/required-field";
import { Controller, useForm } from "react-hook-form";
import { MuiTelInput } from "mui-tel-input";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ptBR } from "date-fns/locale";
import { isDate } from "date-fns";
import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import parsePhoneNumberFromString from "libphonenumber-js";

interface INewCustomerFormData {
  name: string;
  phone: string;
  birthDate: Date | null;
}

export default function NewCustomerForm({
  loadData,
  open,
  setOpen,
}: {
  loadData: () => Promise<void>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { companyId } = useAuth();
  const { loadingDispatch } = useLoading();
  const { showSnackbar } = useSnackbar();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const { control, handleSubmit, reset } = useForm<INewCustomerFormData>({
    defaultValues: { name: "", phone: "+55", birthDate: null },
  });

  const onSubmit = async (data: INewCustomerFormData) => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      await api.axiosWithoutInterceptor.post(
        `/company/${companyId!}/customer/create`,
        {
          name: data.name,
          phone: data.phone,
          birthDate: data.birthDate!,
        },
      );
      showSnackbar("Cliente criado com sucesso", "success");
      reset();
    } catch (error) {
      showSnackbar("Erro ao criar cliente", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      loadData();
      handleClose();
    }
  };
  return (
    <>
      <Button
        onClick={handleClickOpen}
        startIcon={<Plus />}
        variant="contained"
      >
        Novo cliente
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Novo cliente</Typography>
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
                  rules={{
                    required: "Campo obrigatório",
                    minLength: {
                      value: 5,
                      message: "Nome precisa ter no mínimo 5 caracteres",
                    },
                  }}
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
            <Button type="submit" variant="contained">
              Cadastrar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
