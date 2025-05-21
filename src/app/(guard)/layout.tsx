"use client";

import type { Viewport } from "next";
import * as React from "react";

import "@/styles/global.css";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { MainNav } from "@/components/dashboard/layout/main-nav";

import { LocalizationProvider } from "@/components/core/localization-provider";

import { JWTProvider } from "@/contexts/jwt-context";
import "@/styles/global.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactElement;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <LocalizationProvider>
      <JWTProvider>
        <>
          <GlobalStyles
            styles={{
              body: {
                "--MainNav-height": "56px",
                "--MainNav-zIndex": 1000,
                "--MobileNav-width": "220px",
                "--MobileNav-zIndex": 1100,
              },
            }}
          />
          <Box
            sx={{
              bgcolor: "var(--mui-palette-background-default)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              minHeight: "100%",
            }}
          >
            <MainNav />
            <Container maxWidth="xl" sx={{ py: "24px" }}>
              {children}
            </Container>
          </Box>
        </>
      </JWTProvider>
    </LocalizationProvider>
  );
}
