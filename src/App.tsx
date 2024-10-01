import { useState } from "react";
import { AuthContext } from "./components/AuthContext";
import Routers from "./components/Routers";
import useAxios from "./hooks/useAxios";
import { useQuery } from "react-query";
import LoaderCircular from "./components/LoaderCircular";

function App() {
  const [user, setUser] = useState(null);
  const { myAxios } = useAxios(setUser);
  const { isLoading  } = useQuery({
    queryKey: "user",
    queryFn: async () => await myAxios.get("/token", { withCredentials: true }),
    onSuccess: (res) => {
      if (res.data.accessToken && res.data.refreshToken) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    },
  });

  if (isLoading) {
    return <LoaderCircular open={true} />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, myAxios }}>
      <Routers />
    </AuthContext.Provider>
  );
}
export default App;




