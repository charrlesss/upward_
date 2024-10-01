import axios from "axios";
export const myAxios = axios.create({baseURL:process.env.REACT_APP_API_URL,withCredentials:true })


// myAxios.interceptors.request.use(function(req){
//     return req;
//   }, function (error) {
//     console.log('req Err',error)
//     return Promise.reject(error);
//   })

//   myAxios.interceptors.response.use(function (response) {
//     return response;
//   },async function (error) {
//     if(error.response.status === 403){
//         try {
//             const token = await myAxios.get("/token", { withCredentials: true });
//             console.log("tokens",token)
//             const refreshResponse = await myAxios.post('refresh-token',{REFRESH_TOKEN:token.data.refreshToken},{ withCredentials: true });
//             error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
//             return myAxios.request(error.config);

//           } catch (refreshError) {
//             return Promise.reject(error);
//           }
//     }
//     return Promise.reject(error);
//   });

//   export default myAxios