import { useContext } from "react";
import { AuthContext } from "../components/AuthContext"

export default function useExecuteQueryFromClient() {
    const { myAxios, user } = useContext(AuthContext);


    async function executeQueryToClient(query: string) {
        return await myAxios.post('/execute-query', { query }, {
            headers: {
                Authorization: `Bearer ${user?.accessToken}`
            }
        })
    }

    return {
        executeQueryToClient
    }
}

