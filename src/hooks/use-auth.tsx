import JWTContext from "@/contexts/jwt-context";
import { useContext } from "react";

// auth provide

// ==============================|| AUTH HOOKS ||============================== //

const useAuth = () => {
  const context = useContext(JWTContext);

  if (!context) throw new Error("context must be use inside provider");

  return context;
};

export default useAuth;
