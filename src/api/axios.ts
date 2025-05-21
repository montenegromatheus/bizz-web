import client, { AxiosInstance } from "axios";

type RegisterInterceptTokenManagerProps = {
  signOut: () => void;
};

interface APIInstanceProps extends AxiosInstance {
  registerInterceptTokenManager: (
    data: RegisterInterceptTokenManagerProps,
  ) => () => void;
}

const axios = client.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_API,
  headers: {
    Accept: "application/json, */*",
    "Content-Type": "application/json",
    "If-Match": "*",
  },
}) as APIInstanceProps;

axios.interceptors.response.use(
  (response) => response.data,
  (reason) => {},
);

export { axios };
