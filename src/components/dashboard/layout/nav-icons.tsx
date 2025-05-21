import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { ChartPie as ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { CalendarCheck as CalendarCheckIcon } from "@phosphor-icons/react/dist/ssr/CalendarCheck";
import { Chat as ChatIcon } from "@phosphor-icons/react/dist/ssr/Chat";
import { PlugsConnected as PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";
import {
  BuildingOffice as BuildingOfficeIcon,
  Clock as ClockIcon,
  HairDryer as HairDryerIcon,
  Robot as RobotIcon,
} from "@phosphor-icons/react";

import { List } from "@phosphor-icons/react";

export const navIcons = {
  "chart-pie": ChartPieIcon,
  "gear-six": GearSixIcon,
  "plugs-connected": PlugsConnectedIcon,
  "x-square": XSquare,
  "calendar-check": CalendarCheckIcon,
  chat: ChatIcon,
  user: UserIcon,
  users: UsersIcon,
  clock: ClockIcon,
  robot: RobotIcon,
  company: BuildingOfficeIcon,
  services: List,
} as Record<string, Icon>;
