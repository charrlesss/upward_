import { myAxios } from '../lib/axios'


export default function useAxios(setUser:React.Dispatch<React.SetStateAction<null>>) {
   
    myAxios.interceptors.request.use(function(req){
        return req;
      }, function (error) {
        console.log('req Err',error)
        return Promise.reject(error);
      })
    
      myAxios.interceptors.response.use(function (response) {
        return response;
      },async function (error) {
        if(error.response.status === 403){
            try {
                const token = await myAxios.get("/token", { withCredentials: true });
                const refreshResponse = await myAxios.post('/refresh-token',{REFRESH_TOKEN:token.data.refreshToken},{ withCredentials: true });
                console.log(refreshResponse)
                error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
                setUser(refreshResponse.data)
                return myAxios.request(error.config);
              } catch (refreshError) {
                return Promise.reject(error);
              }
        }else{
            return Promise.reject(error);
        }
      });

  return {
    myAxios
  }
}
