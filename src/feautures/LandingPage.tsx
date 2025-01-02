import { useState, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { useMutation } from "react-query";
import { wait } from "../lib/wait";
import axios, { AxiosInstance } from "axios";
import Swal from "sweetalert2";
import "../style/landingpage.css"
import "../style/laoding.css"

async function Login(
  myAxios: AxiosInstance,
  username: string,
  password: string
) {
  return await myAxios.post(
    "/login",
    {
      username,
      password,
    },
    { withCredentials: true }
  );
}



export default function LandingPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    success: false,
    message: "",
  });
  const { setUser, myAxios } = useContext(AuthContext);
  const { mutate, isLoading } = useMutation({
    mutationKey: "login",
    mutationFn: async (variables: { username: string; password: string }) =>
      wait(1200).then(
        async () => await Login(myAxios, variables.username, variables.password)
      ),
    onSuccess: (res) => {
      if (res.data.username) {
        return setErrors({
          username: true,
          password: false,
          success: false,
          message: res.data.message,
        });
      }
      if (res.data.password) {
        return setErrors({
          username: false,
          password: true,
          success: false,
          message: res.data.message,
        });
      }
      setErrors({
        username: false,
        password: false,
        success: true,
        message: res.data.message,
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: res.data.message,
        showConfirmButton: false,
        timer: 800,
      }).then(() => {
        setUser(res.data.user);
        if (res.data.user.is_master_admin) {
          navigate("/master-admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      });
    },
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    mutate({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    });
  }



  return (
    <div className="main-landing-page">
      <form className="content" onSubmit={onSubmit}>
        <img
          alt="Upward Insurance"
          src={process.env.REACT_APP_IMAGE_URL + "logo.png"}
          style={{ width: "120px", height: "auto", background: "white" }}
        />
        <h3 style={{ fontWeight: "400", marginBottom: "30px" }}>LOGIN TO UPWARD INSURANCE</h3>
        <div className="content-field">
          <div>
            <label htmlFor="username"> USERNAME</label>
            <input
              name="username"
              id="username"
              className={errors.username ? "error" : ""}
              onFocus={() =>
                setErrors({
                  username: false,
                  password: false,
                  success: false,
                  message: "",
                })}
            />
            {errors.username && <p className="warning-text">{errors.username && errors.message}</p>}
          </div>
        </div>
        <div className="content-field" style={{ marginTop: "15px" }}>
          <div>
            <label htmlFor="password"> PASSWORD</label>
            <input
              name="password"
              id="password"
              type={showPassword ? "text" : "password"}
              className={errors.password ? "error" : ""}
              onFocus={() =>
                setErrors({
                  username: false,
                  password: false,
                  success: false,
                  message: "",
                })}
            />
            {errors.password && <p className="warning-text">{errors.message}</p>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", columnGap: "10px", marginTop: "10px" }}>
          <input name="showpass" id="showpass" type="checkbox" style={{ padding: "0", margin: 0 }} onChange={(e) => {
            console.log(e.currentTarget.checked)
            setShowPassword(e.currentTarget?.checked)
          }} />
          <label htmlFor="showpass" style={{ fontSize: "10px", cursor: "pointer", padding: "0", margin: 0 }}>SHOW PASSWORD</label>
        </div>
        <button>SUBMIT</button>
      </form>
      {isLoading && <div className="loading-component"><div className="loader"></div></div>}
    </div>
  )
  // return (
  //   <Box
  //     sx={{
  //       display: "flex",
  //       justifyContent: "center",
  //       alignItems: "center",
  //       height: "100vh",
  //       width: "100%",
  //     }}
  //   >
  //     <Box
  //       sx={(theme) => ({
  //         boxSizing: "border-box",
  //         width: "400px",
  //         height: "350px",
  //         padding: "30px",
  //         borderRadius: "3px",
  //         [theme.breakpoints.down("sm")]: {
  //           width: "100%",
  //           padding: "50px 15px",
  //           height: "auto",
  //         },
  //       })}
  //     >
  //       <Box
  //         sx={{
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           marginBottom: "30px",
  //           flexDirection: "column",
  //         }}
  //       >
  //         <img
  //           alt="Upward Insurance"
  //           src={process.env.REACT_APP_IMAGE_URL + "logo.png"}
  //           style={{ width: "120px", height: "120px" }}
  //         />
  //         <h3
  //           style={{
  //             fontFamily: "sans-serif",
  //             color: "black",
  //             fontWeight: "500",
  //             letterSpacing: "1.5px",
  //           }}
  //         >
  //           LOGIN YOUR ACCOUNT
  //         </h3>
  //       </Box>
  //       {errors.success && (
  //         <Alert severity="success" sx={{ marginBottom: "20px" }}>
  //           {errors.message}
  //         </Alert>
  //       )}
  //       <form onSubmit={onSubmit}>
  //         <div style={{ marginBottom: "15px" }}>
  //           <TextField
  //             label="username"
  //             fullWidth
  //             size="small"
  //             name="username"
  //             type="text"
  //             error={errors.username}
  //             required
  //             helperText={errors.username && errors.message}
  //             onFocus={() =>
  //               setErrors({
  //                 username: false,
  //                 password: false,
  //                 success: false,
  //                 message: "",
  //               })
  //             }
  //           />
  //         </div>
  //         <div style={{ marginBottom: "15px" }}>
  //           <FormControl
  //             fullWidth
  //             variant="outlined"
  //             size="small"
  //             error={errors.password}
  //             required={true}
  //             onFocus={() =>
  //               setErrors({
  //                 username: false,
  //                 password: false,
  //                 success: false,
  //                 message: "",
  //               })
  //             }
  //           >
  //             <InputLabel htmlFor="outlined-adornment-password">
  //               password
  //             </InputLabel>
  //             <OutlinedInput
  //               name="password"
  //               id="outlined-adornment-password"
  //               type={showPassword ? "text" : "password"}
  //               endAdornment={
  //                 <InputAdornment position="end">
  //                   <IconButton
  //                     aria-label="toggle password visibility"
  //                     onClick={handleClickShowPassword}
  //                     onMouseDown={handleMouseDownPassword}
  //                     edge="end"
  //                   >
  //                     {showPassword ? <VisibilityOff /> : <Visibility />}
  //                   </IconButton>
  //                 </InputAdornment>
  //               }
  //               label="password"
  //             />
  //             {errors.password && (
  //               <FormHelperText>{errors.message}</FormHelperText>
  //             )}
  //           </FormControl>
  //         </div>
  //         <Box sx={{ position: "relative", width: "100%" }}>
  //           <Button
  //             variant="contained"
  //             sx={{ width: "100%" }}
  //             disabled={isLoading}
  //             type="submit"
  //           >
  //             Login
  //           </Button>
  //           {isLoading && (
  //             <CircularProgress
  //               size={24}
  //               sx={{
  //                 color: green[500],
  //                 position: "absolute",
  //                 top: "50%",
  //                 left: "50%",
  //                 marginTop: "-12px",
  //                 marginLeft: "-12px",
  //               }}
  //             />
  //           )}
  //         </Box>
  //       </form>
  //     </Box>
  //   </Box>
  // );
}
