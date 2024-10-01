import { AxiosInstance } from "axios";
import { User } from "../AuthContext";

export async function Logout(myAxios:AxiosInstance ,user:User | null){
  return await myAxios.get("logout", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
  
}