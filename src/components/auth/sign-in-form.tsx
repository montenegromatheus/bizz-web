"use client";

import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/navigation";

import {
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { useForm } from "react-hook-form";

import useAuth from "@/hooks/use-auth";
import { useBoolean } from "@/hooks/use-boolean";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Image from "next/image";
import { FormProvider } from "../core/form-provider";
import { FormTextField } from "../core/form-text-field";

const imageStyle = {
  borderRadius: "50%",
  border: "1px solid #fff",
};

export function SignInForm() {
  const router = useRouter();
  const methods = useForm();
  const { login } = useAuth();
  const password = useBoolean();
  const theme = useTheme();

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);

      // if (scriptedRef.current) {
      //     redirectLogin();
      // }
      router.push("/calendar");
    } catch (err: any) {
      // if (scriptedRef.current) {
      //     setServerError(err.message);
      // }
      alert("usuário/senha incorreto(s)");
    }
  });

  return (
    <FormProvider onSubmit={onSubmit} methods={methods}>
      <Stack spacing={2} alignItems={"center"}>
        <Image
          src="/assets/bizz-logo.jpeg"
          width={200}
          height={200}
          alt="Picture of the author"
          style={imageStyle}
        />
        <Typography align="center" variant="h4">
          Acesse sua conta
        </Typography>
        <FormTextField
          name="email"
          label="E-mail"
          type="email"
          rules={{ required: "Campo obrigatório" }}
          autoCapitalize="none"
        />

        <FormTextField
          name="password"
          label="Senha"
          rules={{ required: "Campo obrigatório" }}
          type={password.value ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  {password.value ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          // color={theme.palette.primary.main}
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Acessar
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
