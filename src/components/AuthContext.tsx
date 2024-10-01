import {  AxiosInstance } from "axios";
import React, { createContext } from "react";
import { myAxios } from "../lib/axios";
export type User = {
  accessToken: string;
  refreshToken: string;
  userAccess: string;
  department: string;
  is_master_admin: boolean;
}
export interface AuthContextType {
  user:User | null,
  setUser:React.Dispatch<React.SetStateAction<null>>,
  myAxios:AxiosInstance
}
export const AuthContext = createContext<AuthContextType>({user:null, setUser:() => {},myAxios:myAxios});
