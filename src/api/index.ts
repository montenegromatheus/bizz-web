import * as user from "./user";
import * as customer from "./customer";
import * as company from "./company";
import * as service from "./service";
import * as appointment from "./appointment";
import * as auth from "./auth";
import * as bot from "./bot";
import * as employee from "./employee";

import { axios } from "./axios";
import { axiosWithoutInterceptor } from "./axiosWithoutInterceptor";

export const api = {
  axios,
  axiosWithoutInterceptor,
  ...user,
  ...customer,
  ...company,
  ...service,
  ...appointment,
  ...auth,
  ...bot,
  ...employee,
};
