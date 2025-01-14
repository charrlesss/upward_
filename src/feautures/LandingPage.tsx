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
          window.localStorage.setItem('__policy__', 'COM')
          if (res.data.user.department === 'UCSMI') {
            window.localStorage.setItem('__policy_type__', 'TEMP')
          }
          if (res.data.user.department === 'UMIS') {
            window.localStorage.setItem('__policy_type__', 'REG')
          }
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
  
}
