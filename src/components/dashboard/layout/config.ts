import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
  {
    key: "calendar",
    title: "Agenda",
    href: paths.calendar,
    icon: "calendar-check",
  },
  { key: "customers", title: "Clientes", href: paths.customers, icon: "users" },
  {
    key: "services",
    title: "Serviços",
    href: paths.services,
    icon: "services",
  },
  // {
  //   key: "suporte",
  //   title: "Suporte",
  //   href: paths.suport,
  //   icon: "chat",
  // },
  {
    key: "settings",
    title: "Configurações",
    // href: paths.settings,
    icon: "gear-six",
    items: [
      {
        key: "workWeeks",
        title: "Horários",
        href: paths.settings.workWeeks,
        icon: "clock",
      },
      {
        key: "robot",
        title: "Chatbot",
        href: paths.settings.chatbot,
        icon: "robot",
      },
      {
        key: "robot",
        title: "Empresa",
        href: paths.settings.company,
        icon: "company",
      },
    ],
  },
] satisfies NavItemConfig[];
