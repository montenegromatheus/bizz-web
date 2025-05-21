"use client";

import { api } from "@/api";
import RequiredField from "@/components/core/required-field";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Service } from "@/schema";
import {
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { XCircle } from "@phosphor-icons/react";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";

interface IEditServiceFormData {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export default function EditServiceForm({
  loadData,
  selectedService,
  setSelectedService,
}: {
  loadData: () => Promise<void>;
  selectedService: Service;
  setSelectedService: Dispatch<SetStateAction<Service | null>>;
}) {
  const { loadingDispatch } = useLoading();
  const { showSnackbar } = useSnackbar();

  const { control, handleSubmit, reset } = useForm<IEditServiceFormData>({
    defaultValues: {
      ...selectedService,
      price: selectedService.price * 100,
    },
  });

  const generateDurationOptions = () => {
    const options = [];
    for (let i = 0; i <= 60; i += 5) {
      if (i === 0 || i === 60) {
        continue;
      }
      options.push({ label: `${i}min`, value: i });
    }
    for (let i = 60; i < 120; i += 5) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const label = minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
      options.push({ label, value: i });
    }
    for (let i = 120; i <= 300; i += 15) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const label = minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
      options.push({ label, value: i });
    }

    for (let i = 360; i <= 1440; i += 60) {
      const hours = i / 60;
      options.push({ label: `${hours}h`, value: i });
    }
    return options;
  };

  const durationOptions = generateDurationOptions();

  const onSubmit = async (data: IEditServiceFormData) => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const payload = {
        name: data.name,
        price: Number(data.price) / 100,
        duration: data.duration,
        description: data.description,
      };
      await api.service.update(selectedService.id, payload);
      showSnackbar("Serviço editado com sucesso", "success");
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      loadData();
      setSelectedService(null);
    }
  };

  function formatPrice(value: string): string {
    const numericValue = value.replace(/[^\d]/g, "");

    if (numericValue === "") {
      return "R$ 0,00";
    }

    const intValue = parseInt(numericValue, 10).toString();
    const cents = intValue.slice(-2);
    const reais = intValue.slice(0, -2) || "0";

    return `R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${cents}`;
  }

  const handleClose = () => {
    setSelectedService(null);
    reset();
  };
  return (
    <>
      <Dialog open={Boolean(selectedService)} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Grid
              container
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">Editando serviço</Typography>
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

              <RequiredField name="Preço">
                <Controller
                  control={control}
                  name="price"
                  rules={{
                    required: "Campo obrigatório",
                    validate: (value) => {
                      const numericValue = String(value).replace(/[^\d]/g, ""); // Remove tudo que não é número
                      if (
                        !isNaN(Number(numericValue)) &&
                        numericValue.length > 0
                      ) {
                        return true;
                      }
                      return "Valor inválido";
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <TextField
                        {...field}
                        autoFocus
                        id="price"
                        name="price"
                        fullWidth
                        value={formatPrice(String(field.value))}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^\d]/g, ""))
                        }
                        error={!!error}
                      />
                      {error && (
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </RequiredField>

              <RequiredField name="Duração">
                <Controller
                  control={control}
                  name="duration"
                  rules={{
                    required: "Campo obrigatório",
                    validate: (value) => {
                      if (!isNaN(value)) {
                        return true;
                      }
                      return "Valor inválido";
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <FormControl fullWidth>
                        <Select
                          {...field}
                          id="duration"
                          labelId="duration-label"
                          defaultValue={0}
                        >
                          {durationOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </FormControl>
                    </>
                  )}
                />
              </RequiredField>
              <Typography variant="body2">Descrição</Typography>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <>
                    <TextField
                      {...field}
                      autoFocus
                      id="name"
                      name="name"
                      fullWidth
                      multiline
                      rows={2}
                    />
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
