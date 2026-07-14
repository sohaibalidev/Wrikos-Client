import { useAuth as useAuthContext } from "@/context";

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
