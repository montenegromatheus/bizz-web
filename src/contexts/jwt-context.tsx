"use client";

import React, { createContext, useEffect, useReducer } from "react";

// third-party

// reducer - state management

// project imports

export type JWTContextType = {
  isInitialized?: boolean;
  isLoggedIn: boolean;
  user?: User | null | undefined;
  companyId?: string | null;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
};

export interface initialLoginContextProps {
  isInitialized: boolean;
  isLoggedIn: boolean;
  user?: any | null | undefined;
  companyId?: string | null;
}

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

// types
import { api } from "@/api";
import { User } from "@/schema";
import accountReducer from "@/store/account-reducer";
import { LOGIN, LOGOUT } from "@/store/actions";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/core/loader";

// constant
const initialState: initialLoginContextProps = {
  isInitialized: false,
  isLoggedIn: false,
  user:
    typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("user")!)
      : null,
  companyId:
    typeof window !== "undefined"
      ? window.localStorage.getItem("companyId")
      : null,
};

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem("serviceToken", serviceToken);
    api.axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
    api.axiosWithoutInterceptor.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem("serviceToken");
    delete api.axios.defaults.headers.common.Authorization;
    delete api.axiosWithoutInterceptor.defaults.headers.common.Authorization;
  }
};

const setUserLogged = (user?: any | null) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

const setCompanyLogged = (companyId?: string | null) => {
  if (companyId) {
    localStorage.setItem("companyId", companyId);
  } else {
    localStorage.removeItem("companyId");
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem("serviceToken");
        if (serviceToken && verifyToken(serviceToken)) {
          if (pathname === "/login") {
            router.push("/calendar");
          }
          setSession(serviceToken);
          const response = await api.users.me();
          const { user, companyId } = response;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user,
              companyId,
            },
          });
        } else {
          router.push("/login");
          logout();
        }
      } catch (err) {
        console.error(err);
        logout();
        router.push("/login");
      }
    };

    init();
  }, [router]);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });

    const serviceToken = response.access_token;
    const { companyId }: KeyedObject = jwtDecode(serviceToken);
    const user = response.user;
    setSession(serviceToken);
    setCompanyLogged(companyId);
    setUserLogged(user);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user,
        companyId,
      },
    });
  };

  const logout = () => {
    setSession(null);
    setUserLogged(null);
    setCompanyLogged(null);
    dispatch({ type: LOGOUT });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, login, logout }}>
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
