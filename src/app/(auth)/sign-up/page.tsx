import * as React from "react";
import type { Metadata } from "next";

import { config } from "@/config";
import { Layout } from "@/components/auth/layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: `${config.site.name} | Fazer cadastro`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <SignUpForm />
    </Layout>
  );
}
