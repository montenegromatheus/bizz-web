"use client";

import type { Viewport } from "next";
import * as React from "react";
import posthog from "@/lib/posthog.client";

import "@/styles/global.css";

import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";
import { LoadingProvider, useLoading } from "@/hooks/use-loading";
import { ReactNode, useContext, useEffect } from "react";
import RequestLoader from "@/components/core/request-loader";
import { ConfirmProvider } from "material-ui-confirm";
import Snackbar from "@/components/core/snackbar";
import { store } from "@/store";
import { Provider } from "react-redux";
import JWTContext from "@/contexts/jwt-context";

export const viewport = {
  width: "device-width",
  initialScale: 1,
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

const IdentifyPostHogUser = () => {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const userRaw = localStorage.getItem("user");
    if (!userRaw) return;

    try {
      const user = JSON.parse(userRaw);
      if (user?.id) {
        posthog.identify(user.id, {
          nome: user.name,
          email: user.email,
        });
      }
    } catch (err) {
      console.error("Erro ao identificar usuário no PostHog:", err);
    }
  }, []);

  return null;
};

const MyApp = ({ children }: { children: ReactNode }) => {
  const { state } = useLoading();

  React.useEffect(() => {
    posthog.capture("app_loaded");
  }, []);

  return (
    <>
      <IdentifyPostHogUser />
      <RequestLoader isLoading={state.isLoading} />
      {children}
    </>
  );
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <Provider store={store}>
            <LoadingProvider>
              <ConfirmProvider>
                <Snackbar />
                <MyApp>{children}</MyApp>
              </ConfirmProvider>
            </LoadingProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
