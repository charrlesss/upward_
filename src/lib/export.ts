import { User } from "../components/AuthContext";
import { AxiosInstance } from "axios";

export function exportFunction(url: string, filename: string ,myAxios:AxiosInstance,user:User | null) {
    myAxios
      .get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }