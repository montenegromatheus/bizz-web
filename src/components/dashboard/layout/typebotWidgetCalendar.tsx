"use client";

import { Bubble } from "@typebot.io/nextjs";
import { useEffect, useState } from "react";
import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import posthog from "@/lib/posthog.client";

export default function ClientWidget() {
  const { companyId } = useAuth();
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    if (!companyId) return;

    // Busca a company correta para o usuário logado
    api.company
      .findOne(companyId)
      .then((company) => {
        if (company.phone) {
          setPhone(company.phone);

          const flag = posthog.getFeatureFlag("usar_typebot_widget");
          if (flag) {
            posthog.capture("typebot_widget_ativado", {
              companyId,
              phone: company.phone,
              featureFlag: flag,
            });
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar telefone da company:", err);
      });
  }, [companyId]);

  // Enquanto não tiver o phone, não renderiza
  if (!phone) return null;

  return (
    <Bubble
      typebot="suporte"
      apiHost="https://atendimento.bizzbot.com.br"
      // previewMessage={{
      //   message: "Para bloqueios e encaixes, clique aqui!",
      //   autoShowDelay: 5000,
      // }}
      theme={{ button: { backgroundColor: "#600a80" }, placement: "left" }}
      prefilledVariables={{ phone: phone }}
    />
  );
}
