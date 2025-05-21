import * as React from "react";
import type { Viewport } from "next";

import "@/styles/global.css";

import { JWTProvider } from "@/contexts/jwt-context";

export const viewport = {
  width: "device-width",
  initialScale: 1,
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactElement;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return <JWTProvider>{children}</JWTProvider>;
}
