import { Metadata } from "next";
import { config } from "@/config";
import TypebotUI from "@/components/dashboard/layout/typebotWidget";

export const metadata: Metadata = {
  title: `${config.site.name} | Suporte`,
};

export default function Page(): JSX.Element {
  return (
    <>
      <div>
        <h1>Suporte</h1>
        <p>
          Bem-vindo à página de suporte. Aqui você pode realizar bloqueios de
          horários, encaixes de clientes e mais.
        </p>
        <TypebotUI />
      </div>
    </>
  );
}
