"use client";
import { api } from "@/api";
import { axiosWithoutInterceptor } from "@/api/axiosWithoutInterceptor";
import { UpdateBotParametersDto } from "@/api/bot/bot.dto";
import TextArea from "@/components/core/text-area";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import useSnackbar from "@/hooks/use-snackbar";
import {
  Button,
  Divider,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const possibleMinutes: { value: number; label: string }[] = [];

for (let h = 0; h <= 48 * 60; h += 30) {
  if (h === 0) {
    continue;
  }
  const hours = Math.floor(h / 60);
  const minutes = h % 60;

  const label =
    minutes === 0
      ? `${hours}h`
      : hours === 0
        ? `${minutes}min`
        : `${hours}h${minutes}min`;

  possibleMinutes.push({ value: h, label });
}

const Chatbot = () => {
  const { showSnackbar } = useSnackbar();
  const { loadingDispatch } = useLoading();
  const [reminderDay, setReminderDay] = useState("same_day");
  const [isAppointmentEnabled, setIsAppointmentEnabled] = useState(true);
  const [isReappointmentEnabled, setIsReappointmentEnabled] = useState(true);
  const [isCancellationEnabled, setIsCancellationEnabled] = useState(true);
  const [isLinkBlocked, setIsLinkBlocked] = useState(true);
  const [timeRestriction, setTimeRestriction] = useState("60");
  const [orientation, setOrientation] = useState("");
  const [botLink, setBotLink] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const { companyId, user } = useAuth();

  const getBotParameters = useCallback(async () => {
    try {
      const botParameters = await api.bot.findOne(companyId!);
      setReminderDay(
        botParameters.lembrete_anterior ? "day_before" : "same_day",
      );
      setIsAppointmentEnabled(botParameters.permite_agendar);
      setIsReappointmentEnabled(botParameters.permite_remarcar);
      setIsCancellationEnabled(botParameters.permite_cancelar);
      setIsLinkBlocked(!botParameters.habilitar_fluxo);
      setTimeRestriction(`${botParameters.restricao}`);
      setOrientation(botParameters.orientacoes);
      setBotLink(botParameters.bot_link);
      setServiceAddress(botParameters.endereco_atendimento);
    } catch (error) {}
  }, [companyId]);

  let touchTimer: NodeJS.Timeout | null = null;

  const handleTouchStart = () => {
    touchTimer = setTimeout(() => {
      const linkUrl = `https://atendimento.bizzbot.com.br/chat?link=${botLink}`;
      navigator.clipboard.writeText(linkUrl).then(() => {});
    }, 800);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  };

  useEffect(() => {
    getBotParameters();
  }, [getBotParameters]);

  const onSubmit = async () => {
    loadingDispatch({ type: "START_LOADING" });
    const payload: UpdateBotParametersDto = {
      lembrete_anterior: reminderDay === "day_before",
      lembrete_nodia: reminderDay === "same_day",
      habilitar_fluxo: !isLinkBlocked,
      permite_agendar: isAppointmentEnabled,
      permite_cancelar: isCancellationEnabled,
      permite_remarcar: isReappointmentEnabled,
      restricao: Number(timeRestriction),
      orientacoes: orientation,
      endereco_atendimento: serviceAddress,
    };
    try {
      await axiosWithoutInterceptor.put(`bot/${companyId!}`, payload);
      showSnackbar("Configurações salvas com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao salvar configurações", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  return (
    <>
      <Stack sx={{ mb: 2 }}>
        <Typography variant="h5">Configurações da Bizz</Typography>
        <Typography variant="caption">
          Configure orientações, endereço de atendimento e mais...
        </Typography>
        <Link
          fontSize={10}
          href={`https://atendimento.bizzbot.com.br/chat?link=${botLink}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {`https://atendimento.bizzbot.com.br/chat?link=${botLink}`}
        </Link>
      </Stack>
      <Stack>
        <Typography sx={{ mb: 1 }}>Profissional: {user?.name}</Typography>
        <Stack spacing={2} divider={<Divider flexItem />} sx={{ mb: 2 }}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack>
              <Typography fontSize={14}>
                Tempo mínimo para agendar/remarcar/cancelar
              </Typography>
              <Typography variant="caption" fontSize={10}>
                Determine o tempo para que suas clientes não
                agendem/remarquem/cancelem em cima da hora
              </Typography>
            </Stack>
            <Select
              size="small"
              sx={{ width: 250 }}
              value={timeRestriction}
              onChange={(e: SelectChangeEvent) => {
                setTimeRestriction(e.target.value);
              }}
            >
              {possibleMinutes.map((minute) => (
                <MenuItem key={minute.value} value={minute.value}>
                  {minute.label}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography fontSize={14}>Lembrete de agendamento</Typography>
            <Select
              size="small"
              sx={{ width: 180 }}
              value={reminderDay}
              onChange={(e: SelectChangeEvent) => {
                setReminderDay(e.target.value);
              }}
            >
              <MenuItem value={"same_day"}>No mesmo dia</MenuItem>
              <MenuItem value={"day_before"}>No dia anterior</MenuItem>
            </Select>
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography fontSize={14}>Habilitar agendamento</Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <InputLabel>{isAppointmentEnabled ? "Sim" : "Não"}</InputLabel>
              <Switch
                checked={isAppointmentEnabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIsAppointmentEnabled(event.target.checked);
                }}
              />
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography fontSize={14}>Habilitar remarcação</Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <InputLabel>{isReappointmentEnabled ? "Sim" : "Não"}</InputLabel>
              <Switch
                checked={isReappointmentEnabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIsReappointmentEnabled(event.target.checked);
                }}
              />
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography fontSize={14}>Habilitar cancelamento</Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <InputLabel>{isCancellationEnabled ? "Sim" : "Não"}</InputLabel>
              <Switch
                checked={isCancellationEnabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIsCancellationEnabled(event.target.checked);
                }}
              />
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack width={"65%"}>
              <Typography fontSize={14}>
                Bloquear o link de agendamento
              </Typography>
              <Typography variant="caption" fontSize={10}>
                Você pode bloquear todo o link de agendamento, caso não queira
                que seja exibido nenhuma opção de agendar, cancelar ou remarcar.
              </Typography>
            </Stack>
            <Stack direction={"row"} alignItems={"center"}>
              <InputLabel>{isLinkBlocked ? "Sim" : "Não"}</InputLabel>
              <Switch
                checked={isLinkBlocked}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIsLinkBlocked(event.target.checked);
                }}
              />
            </Stack>
          </Stack>
          <Stack>
            <Typography fontSize={14}>Endereço de atendimento</Typography>
            <TextField
              size="small"
              placeholder="Digite o endereço de atendimento"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
            />
          </Stack>
          <Stack>
            <Typography fontSize={14}>Orientações</Typography>
            <Typography variant="caption" fontSize={10} sx={{ mb: 1 }}>
              Mensagem inicial do link de agendamento na qual você pode
              escrever, por exemplo, o que é ou não permitido para o studio.
            </Typography>
            <TextArea setText={setOrientation} text={orientation} />
          </Stack>
        </Stack>
        <Grid container justifyContent={"flex-end"}>
          <Button variant="contained" onClick={onSubmit}>
            Salvar
          </Button>
        </Grid>
      </Stack>
    </>
  );
};
export default Chatbot;
