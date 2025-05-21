"use client";
import { api } from "@/api";
import { axiosWithoutInterceptor } from "@/api/axiosWithoutInterceptor";
import { FormProvider } from "@/components/core/form-provider";
import { FormTextField } from "@/components/core/form-text-field";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import { Company } from "@/schema";
import {
  Button,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

const possibleMinutes: { value: number; label: string }[] = [
  { value: 10, label: "10min" },
  { value: 15, label: "15min" },
  { value: 20, label: "20min" },
  { value: 30, label: "30min" },
  { value: 60, label: "1h" },
  { value: 120, label: "2h" },
  { value: 180, label: "3h" },
  { value: 240, label: "4h" },
];

const CompanySettings = () => {
  const { showSnackbar } = useSnackbar();
  const { loadingDispatch } = useLoading();
  const { companyId } = useAuth();
  const methods = useForm<Company>({
    defaultValues: {
      id: "",
      appointmentDays: undefined,
      appointmentInterval: undefined,
      email: "",
      phone: "",
      name: "",
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const watchedAppointmentInterval = watch("appointmentInterval");

  const getCompany = useCallback(async () => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const companyData = await api.company.findOne(companyId!);
      reset(companyData);
    } catch (error) {
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  }, [companyId]);

  useEffect(() => {
    getCompany();
  }, [getCompany]);

  const onSubmit = handleSubmit(async (data: Company) => {
    const payload: Partial<Company> = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      appointmentInterval: data.appointmentInterval,
      appointmentDays: Number(data.appointmentDays),
    };
    loadingDispatch({ type: "START_LOADING" });
    try {
      await axiosWithoutInterceptor.patch(`company/${companyId!}`, payload);
      showSnackbar("Configurações salvas com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao salvar configurações", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  });

  return (
    <>
      <Stack sx={{ mb: 2 }}>
        <Typography variant="h5">Configurações da Empresa</Typography>
      </Stack>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2} divider={<Divider flexItem />} sx={{ mb: 2 }}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            spacing={1}
          >
            <Typography fontSize={16}>Nome da empresa</Typography>
            <FormTextField
              name="name"
              fullWidth
              size="small"
              placeholder="Digite o nome da empresa"
            />
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            spacing={1}
          >
            <Typography fontSize={16}>Número para contato</Typography>
            <FormTextField
              name="phone"
              fullWidth
              size="small"
              placeholder="Digite o nome da empresa"
            />
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            spacing={1}
          >
            <Typography fontSize={16}>Email</Typography>
            <FormTextField
              name="email"
              fullWidth
              size="small"
              placeholder="Digite o nome da empresa"
            />
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack>
              <Typography fontSize={16}>Intervalo do calendário</Typography>
              <Typography variant="caption" fontSize={10}>
                Defina a frequência dos horários de atendimento que serão
                exibidos no calendário. Por exemplo, intervalos de 15, 30, 60
                minutos ou 2, 3 horas.
              </Typography>
            </Stack>

            <Controller
              control={methods.control}
              name="appointmentInterval"
              rules={{ required: "Campo obrigatório" }}
              render={({ field, fieldState }) => (
                <Select
                  size="small"
                  sx={{ width: 250 }}
                  {...field}
                  value={watchedAppointmentInterval || ""}
                  error={!!fieldState.error}
                >
                  {possibleMinutes.map((minute) => (
                    <MenuItem key={minute.value} value={minute.value}>
                      {minute.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack>
              <Typography fontSize={16}>Visibilidade do calendário</Typography>
              <Typography variant="caption" fontSize={10}>
                Defina até quantos dias no futuro seus clientes poderão
                visualizar e agendar horários disponíveis no calendário.
              </Typography>
            </Stack>
            <FormTextField
              name="appointmentDays"
              fullWidth
              sx={{ width: 150 }}
              size="small"
              type="number"
            />
          </Stack>
        </Stack>
        <Grid container justifyContent={"flex-end"}>
          <Button variant="contained" type="submit">
            Salvar
          </Button>
        </Grid>
      </FormProvider>
    </>
  );
};
export default CompanySettings;
