import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  forwardRef,
} from "react";
import { useMutation, useQuery } from "react-query";
import { wait } from "../lib/wait";
import Swal from "sweetalert2";
import { AuthContext } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logout } from "../components/Sidebars/Logout";
import "../style/master-admin-dashboard.css";
import useMultipleComponent from "../hooks/useMultipleComponent";
import { CircularProgress } from "@mui/material";

const buttons = [
  {
    title: "Users",
    index: 0,
  },
  {
    title: "Server",
    index: 1,
  },
  {
    title: "Database",
    index: 2,
  },
];

const initialState = {
  name: "",
  email: "",
  contact: "",
  username: "",
  department: "UMIS",
  accountType: "ADMIN",
  password: "",
  confirmPassword: "",
  confirmationCode: "",
  confirm_confirmationCode: "",
  profile: [],
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
};

export default function MasterAdminDashboard() {
  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <User />,
    <div>2</div>,
    <div>3</div>,
  ]);
  const { setUser, myAxios, user } = useContext(AuthContext);
  const [openCircularLoader, setOpenCircularLoader] = useState(false);
  const navigate = useNavigate();

  const { refetch } = useQuery({
    queryKey: "logout",
    queryFn: async () =>
      wait(1200).then(async () => await Logout(myAxios, user)),
    enabled: false,
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      setOpenCircularLoader(false);
      if (res.data.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 800,
        }).then(() => {
          setUser(null);
          navigate("/");
        });
      }
    },
  });

  return (
    <main className="main">
      <header className="header">
        <div
          style={{
            width: "fit-content",
            height: "fit-content",
            background: "transparent",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h5>MASTER ADMIN</h5>
        </div>
        <RippleButton
          onClick={() => {
            setOpenCircularLoader(true);
            refetch();
          }}
          style={{
            position: "relative",
            overflow: "hidden",
            transform: "rotate(270deg)",
            cursor: "pointer",
            border: "none",
            padding: "0",
            margin: "0",
            background: "transparent",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22px"
            height="22px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M17.4399 14.62L19.9999 12.06L17.4399 9.5"
              stroke="white"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.76001 12.0601H19.93"
              stroke="white"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.76 20C7.34001 20 3.76001 17 3.76001 12C3.76001 7 7.34001 4 11.76 4"
              stroke="white"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </RippleButton>
      </header>
      <section style={{ display: "flex", margin: "10px 0" }}>
        {buttons.map((item, idx) => {
          return (
            <RippleButton
              key={idx}
              style={{
                border: "none",
                outline: "none",
                backgroundColor: "rgba(51, 51, 51, 0.05)",
                borderWidth: "0",
                color:
                  currentStepIndex === idx
                    ? "white"
                    : "rgba(189, 187, 187, 0.432)",
                cursor: "pointer",
                display: "inline-block",
                fontFamily: `"Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif`,
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "20px",
                listStyle: "none",
                margin: "0",
                padding: "5px 12px",
                textAlign: "center",
                transition: "all 200ms",
                verticalAlign: "baseline",
                whiteSpace: "nowrap",
                userSelect: "none",
                touchAction: "manipulation",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => goTo(idx)}
            >
              {item.title}
            </RippleButton>
          );
        })}
      </section>
      <section className="content">{step}</section>
      {openCircularLoader && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(66, 65, 66, 0.31)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
            display: "flex",
          }}
        >
          <CircularProgress />
        </div>
      )}
    </main>
  );
}

const columns = [
  { datakey: "name", header: "Name", width: "300px" },
  { datakey: "Username", header: "Username", width: "300px" },
  { datakey: "email", header: "Email", width: "300px" },
  { datakey: "company_number", header: "Mobile Number", width: "150px" },
  { datakey: "AccountType", header: "Account Type", width: "100px" },
  { datakey: "Department", header: "Department", width: "100px" },
  { datakey: "_CreatedAt", header: "Created", width: "100px" },
];
function User() {
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInput = useRef<HTMLInputElement>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [userRow, setUserRow] = useState([]);
  useEffect(() => {
    async function urlToFile() {
      const url = "http://localhost:4000/profile.jpg";

      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const file = new File([buffer], "image.jpg", { type: "image/jpeg" });

      const reader: any = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    urlToFile();
  }, []);

  const { mutate: mutateAddUser, isLoading: isLoadingAddUser } = useMutation({
    mutationKey: "add-user",
    mutationFn: async (variable: any) =>
      await myAxios.post("/master-admin/add-user", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      const response = res as any;
      if (response.data.success) {
        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: response.data.message,
        timer: 1500,
      });
    },
  });
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: "get-user",
    queryFn: async () =>
      await myAxios.get("/master-admin/get-user", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      const response = res as any;
      setUserRow(response.data?.users);
    },
  });
  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader: any = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        state.profile.push({
          fileName: file.name,
          fileContent: reader.result,
          fileType: file.type,
          file,
          datakey: "profile",
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDrop = (event: any) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader: any = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (event: any) => {
    event.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => {
    setDragging(false);
  };
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  return (
    <React.Fragment>
      <div className="users">
        <div className="user-actions">
          <RippleButton
            style={{
              position: "relative",

              overflow: "hidden",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "11px",
            }}
            onClick={() => {
              setOpenAddModal(true);
            }}
          >
            ADD USER
          </RippleButton>
        </div>
        <CustomTable
          rows={userRow}
          columns={columns}
          isLoadingRow={isLoadingUser}
          onSelectionChange={(e, row) => {
            console.log(row);
          }}
        />
        {isLoadingAddUser && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(66, 65, 66, 0.31)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "999",
              display: "flex",
            }}
          >
            <CircularProgress />
          </div>
        )}
      </div>
      <Modal isOpen={openAddModal} onCLose={() => setOpenAddModal(false)}>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          USER DETAILS
        </h3>
        <form>
          <div
            style={{
              marginBottom: "50px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "150px",
                width: "150px",
                borderRadius: "50%",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                outline: dragging ? "2px solid #fbbf24" : "none",
                transition: "all 300ms",
                background: "black",
              }}
              onClick={() => {
                fileInput.current?.click();
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "transparent",
                  position: "absolute",
                  top: dragging ? "50%" : "-50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 300ms",
                  pointerEvents: "none",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50px"
                  height="50px"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 10.25C12.4142 10.25 12.75 10.5858 12.75 11V12.25H14C14.4142 12.25 14.75 12.5858 14.75 13C14.75 13.4142 14.4142 13.75 14 13.75H12.75V15C12.75 15.4142 12.4142 15.75 12 15.75C11.5858 15.75 11.25 15.4142 11.25 15V13.75H10C9.58579 13.75 9.25 13.4142 9.25 13C9.25 12.5858 9.58579 12.25 10 12.25H11.25V11C11.25 10.5858 11.5858 10.25 12 10.25Z"
                    fill="#fbbf24"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21ZM16 13C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13C8 10.7909 9.79086 9 12 9C14.2091 9 16 10.7909 16 13ZM18 9.25C17.5858 9.25 17.25 9.58579 17.25 10C17.25 10.4142 17.5858 10.75 18 10.75H19C19.4142 10.75 19.75 10.4142 19.75 10C19.75 9.58579 19.4142 9.25 19 9.25H18Z"
                    fill="#fbbf24"
                  />
                </svg>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "100px",
                  background: "rgba(66, 65, 66, 0.31)",
                  position: "absolute",
                  top: dragging ? "150%" : hover ? "50%" : "150%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 300ms",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "auto",
                    textAlign: "center",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50px"
                    height="50px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7"
                      stroke="#f8fafc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p
                    style={{
                      fontSize: "10px",
                      padding: "0",
                      margin: "0",
                      color: "#f8fafc",
                    }}
                  >
                    Drag/Drop here!
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      padding: "0",
                      margin: "0",
                      color: "#f8fafc",
                    }}
                  >
                    Click to Upload Photo!
                  </p>
                </div>
              </div>
              <img
                style={{
                  height: "100%",
                  width: "100%",
                  background: "black",
                  borderRadius: "50%",
                  pointerEvents: "none",
                }}
                alt=""
                src={selectedImage}
              />
              <input
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                ref={fileInput}
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              columnGap: "100px",
              rowGap: "50px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="name"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                NAME :
              </label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={handleInputChange}
                value={state.name}
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                  textTransform: "uppercase",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="email"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                EMAIL :
              </label>
              <input
                onChange={handleInputChange}
                value={state.email}
                type="text"
                id="email"
                name="email"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="contact"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                CONTACT :
              </label>
              <input
                onChange={handleInputChange}
                value={state.contact}
                type="text"
                id="contact"
                name="contact"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="username"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                USERNAME :
              </label>
              <input
                onChange={handleInputChange}
                value={state.username}
                autoComplete="off"
                type="text"
                id="username"
                name="username"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="department"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                DEPARTMENT
              </label>
              <select
                onChange={handleInputChange}
                value={state.department}
                name="department"
                id="department"
                style={{
                  border: "none",
                  outline: "none",
                  flex: "1",
                  background: "transparent",
                  color: "white",
                  borderBottom: "1px solid white",
                }}
              >
                <option value={"UMIS"} style={{ color: "black" }}>
                  UMIS
                </option>
                <option value={"UCSMI"} style={{ color: "black" }}>
                  UCSMI
                </option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="accountType"
                style={{ fontSize: "11px", width: "100px", color: "#fbbf24" }}
              >
                ACCOUNT TYPE
              </label>
              <select
                onChange={handleInputChange}
                value={state.accountType}
                name="accountType"
                id="accountType"
                style={{
                  border: "none",
                  outline: "none",
                  flex: "1",
                  background: "transparent",
                  color: "white",
                  borderBottom: "1px solid white",
                }}
              >
                <option value={"ADMIN"} style={{ color: "black" }}>
                  ADMIN
                </option>
                <option value={"ACCOUNTING"} style={{ color: "black" }}>
                  ACCOUNTING
                </option>
                <option value={"PRODUCTION"} style={{ color: "black" }}>
                  PRODUCTION
                </option>
                <option value={"CLAIMS"} style={{ color: "black" }}>
                  CLAIMS
                </option>
                <option
                  value={"PRODUCTION_ACCOUNTING"}
                  style={{ color: "black" }}
                >
                  PRODUCTION_ACCOUNTING
                </option>
                {/* <option
                  value={"PRODUCTION_ACCOUNTING_CLAIMS"}
                  style={{ color: "black" }}
                >
                  PRODUCTION_ACCOUNTING_CLAIMS
                </option> */}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              columnGap: "100px",
              rowGap: "50px",
              marginTop: "100px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
                gridColumn: "2/span 1",
              }}
            >
              <label
                htmlFor="password"
                style={{ fontSize: "11px", width: "130px", color: "#fbbf24" }}
              >
                PASSWORD :
              </label>
              <input
                onChange={handleInputChange}
                value={state.password}
                type="password"
                id="password"
                name="password"
                autoComplete="off"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="confirmPassword"
                style={{ fontSize: "11px", width: "170px", color: "#fbbf24" }}
              >
                VERIFY PASSWORD :
              </label>
              <input
                onChange={handleInputChange}
                value={state.confirmPassword}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
                gridColumn: "2/span 1",
              }}
            >
              <label
                htmlFor="confirmationCode"
                style={{ fontSize: "11px", width: "130px", color: "#fbbf24" }}
              >
                Confirmation Code :
              </label>
              <input
                onChange={handleInputChange}
                value={state.confirmationCode}
                type="password"
                id="confirmationCode"
                name="confirmationCode"
                autoComplete="off"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="confirm_confirmationCode"
                style={{ fontSize: "11px", width: "170px", color: "#fbbf24" }}
              >
                VERIFY CONFIRMATION CODE :
              </label>
              <input
                onChange={handleInputChange}
                value={state.confirm_confirmationCode}
                type="password"
                id="confirm_confirmationCode"
                name="confirm_confirmationCode"
                style={{
                  flex: 1,
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  outline: "none",
                  color: "white",
                  borderBottom: "1px solid white",
                  padding: "5px 0",
                }}
              />
            </div>
            <div
              style={{
                flexWrap: "nowrap",
                gridColumn: "2/span 2",
                display: "flex",
              }}
            >
              <RippleButton
                type="submit"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "10px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  width: "100%",
                }}
                onClick={(e: any) => {
                  e.preventDefault();
                  if (selectedImage === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Profile is required!",
                      timer: 1500,
                    });
                  }
                  if (state.username === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Username is required!",
                      timer: 1500,
                    });
                  }
                  if (state.accountType === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Account Type is required!",
                      timer: 1500,
                    });
                  }
                  if (state.department === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Department is required!",
                      timer: 1500,
                    });
                  }
                  if (state.password === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Password is required!",
                      timer: 1500,
                    });
                  }
                  if (state.confirmationCode === "") {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Confirmation code is required!",
                      timer: 1500,
                    });
                  }
                  if (state.password !== state.confirmPassword) {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Verify Password not match!",
                      timer: 1500,
                    });
                  }
                  if (
                    state.confirmationCode !== state.confirm_confirmationCode
                  ) {
                    return Swal.fire({
                      position: "center",
                      icon: "warning",
                      title: "Verify Confirmation Code not match!",
                      timer: 1500,
                    });
                  }

                  mutateAddUser(state);
                }}
              >
                SUBMIT
              </RippleButton>
            </div>
          </div>
        </form>
      </Modal>
    </React.Fragment>
  );
}

function Modal({ children, isOpen, onCLose }: any) {
  return (
    <div className={`modal ${isOpen ? "open" : "close"}` }>
      <div className="modal-content">
        <div className="modal-close">
          <RippleButton
            onClick={onCLose}
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              border: "none",
              padding: "0",
              margin: "0",
              background: "transparent",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30px"
              height="30px"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
              <path
                d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </RippleButton>
        </div>
        {children}
      </div>
    </div>
  );
}

function RippleButton({ children, ...rest }: any) {
  const createRipple = (event: any) => {
    const button = event.currentTarget;

    // Remove any existing ripple effect
    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    button.appendChild(ripple);
    if (rest?.onClick) rest.onClick(event);
  };

  return (
    <button {...rest} className="ripple-button" onClick={createRipple}>
      {children}
    </button>
  );
}

const TD = forwardRef(
  (
    {
      itm,
      columns,
      isActive,
      handleRowClick,
      onDoubleClickSelected,
      selectedRowIndexOnKey,
      handleMouseEnter,
      handleMouseLeave,
      handleResizeStart,
    }: any,
    ref: React.ForwardedRef<HTMLTableRowElement>
  ) => {
    return (
      <tr
        ref={ref}
        onMouseEnter={() => handleMouseEnter(itm)}
        onMouseLeave={() => handleMouseLeave(itm)}
        onDoubleClick={(e) => {
          handleRowClick(itm.UserId);
          onDoubleClickSelected(e, itm);
        }}
        className={`${isActive ? "selected" : "not-selected"}`}
        style={{
          background: selectedRowIndexOnKey ? "#374151" : "",
        }}
      >
        {columns.map((colItm: any, idx: number) => {
          return (
            <td key={idx}>
              <input
                readOnly
                defaultValue={itm[colItm.datakey]}
                style={{ width: "100%" }}
              />
              <ColumnResizer onResizeStart={handleResizeStart} />
            </td>
          );
        })}
      </tr>
    );
  }
);

const ColumnResizer = ({ onResizeStart }: any) => {
  const resizerRef = useRef(null);

  const handleMouseDown = (e: any) => {
    onResizeStart(e, resizerRef.current);
  };

  return (
    <div
      className="column-resizer"
      ref={resizerRef}
      onMouseDown={handleMouseDown}
    ></div>
  );
};

function CustomTable({
  rows,
  columns,
  onSelectionChange = () => {},
  isLoadingRow,
}: {
  rows: Array<any>;
  columns: Array<{ header: string; datakey: string; width: string }>;
  onSelectionChange?: (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: any
  ) => void;
  isLoadingRow?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRowId, setActiveRowId] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = rows.slice(startIndex, startIndex + itemsPerPage);
  const rowRefs = useRef<any>([]);
  const [columnWidths, setColumnWidths] = useState(
    columns.map((itm) => parseInt(itm.width.replace("px", "")))
  );
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "ArrowDown") {
        if (!tableContainerRef.current?.contains(document.activeElement)) {
          return;
        }
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          const maxIndex = Math.min(rows.length, itemsPerPage) - 1;
          const nextIndex =
            prevIndex === null ? 0 : Math.min(prevIndex + 1, maxIndex);
          if (rowRefs.current[nextIndex]) {
            rowRefs.current[nextIndex].scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }

          return nextIndex;
        });
      } else if (event.key === "ArrowUp") {
        if (!tableContainerRef.current?.contains(document.activeElement)) {
          return;
        }
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          const nextIndex = prevIndex === null ? 0 : Math.max(prevIndex - 1, 0);
          if (rowRefs.current[nextIndex]) {
            rowRefs.current[nextIndex].scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
          return nextIndex;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rows.length, itemsPerPage]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Enter") {
        if (!tableContainerRef.current?.contains(document.activeElement)) {
          return;
        }
        event.preventDefault();
        if (selectedRowIndex !== null) {
          const selectedItem = currentItems[selectedRowIndex];
          setActiveRowId((id) =>
            id === selectedItem.UserId ? null : selectedItem.UserId
          );
          onSelectionChange(event, selectedItem);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRowIndex, currentItems, onSelectionChange]);

  const handleResizeStart = (e: any, resizer: any) => {
    const startX = e.clientX;
    const startWidth = resizer.parentElement.offsetWidth;
    const columnIndex = Array.from(
      resizer.parentElement.parentElement.children
    ).indexOf(resizer.parentElement);

    const handleMouseMove = (e: any) => {
      const newWidth = startWidth + (e.clientX - startX);
      setColumnWidths((prevWidths: any) => {
        const newWidths = [...prevWidths];
        newWidths[columnIndex] = newWidth;
        return newWidths;
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowIndex(0); // Reset selected row index when changing pages
  };

  const handleRowClick = (id: any) => {
    setActiveRowId(activeRowId === id ? null : id);
  };

  const handleMouseEnter = (item: any) => {
    const hoveredIndex = rows.findIndex((i) => i.id === item.UserId);
    setSelectedRowIndex(hoveredIndex);
  };

  const handleMouseLeave = () => {
    setSelectedRowIndex(-1);
  };
  return (
    <div className="table-container" ref={tableContainerRef}>
      <div
        style={{
          position: "relative",
          overflow: "auto",
          height: `${
            (tableContainerRef.current?.getBoundingClientRect()
              .height as number) - 50
          }px`,
          width: `${
            tableContainerRef.current?.getBoundingClientRect().width
          }px`,
        }}
      >
        <table id="tableId" className="resizable">
          <thead>
            <tr>
              {columns.map((itm: any, idx: number) => {
                return (
                  <th
                    key={idx}
                    style={{
                      textAlign: "left",
                      color: "#fbbf24",
                      minWidth: columnWidths[idx],
                    }}
                  >
                    {itm.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          {isLoadingRow ? (
            <tbody
              style={{
                height: `${
                  (tableContainerRef.current?.getBoundingClientRect()
                    .height as number) - 100
                }px`,
              }}
            >
              <tr className="td-loader">
                <td
                  colSpan={columns.length}
                  style={{
                    textAlign: "center",
                  }}
                >
                  Loading...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentItems?.map((itm: any, idx: number) => {
                return (
                  <TD
                    key={idx}
                    itm={itm}
                    columns={columns}
                    handleRowClick={handleRowClick}
                    isActive={itm.UserId === activeRowId}
                    onDoubleClickSelected={onSelectionChange}
                    selectedRowIndexOnKey={selectedRowIndex === idx}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    ref={(el) => (rowRefs.current[idx] = el)}
                    handleResizeStart={handleResizeStart}
                  />
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      <div
        style={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          background: "#334155",
          padding: "0 10px",
          columnGap: "20px",
        }}
      >
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
        <Pagination
          totalItems={rows.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: any) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxVisibleButtons = 6;

  let startPage = 0,
    endPage = 0;

  if (totalPages <= maxVisibleButtons) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const maxPagesBeforeCurrentPage = Math.floor(maxVisibleButtons / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxVisibleButtons / 2) - 1;

    if (currentPage <= maxPagesBeforeCurrentPage) {
      startPage = 1;
      endPage = maxVisibleButtons;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      startPage = totalPages - maxVisibleButtons + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  const paginationButtons = Array.from(
    Array(endPage - startPage + 1),
    (_, i) => startPage + i
  );

  return (
    <div
      style={{
        display: "flex",
        columnGap: "5px",
        alignItems: "center",
      }}
    >
      <button
        style={{
          padding: "10px",
          textAlign: "center",
          fontSize: "11px",
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={{
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              borderRadius: "50%",
              background: currentPage === startPage ? "#1e293b" : "",
              minWidth: "30px",
              minHeight: "30px",
            }}
          >
            1
          </button>
          {startPage > 2 && <span>...</span>}
        </>
      )}
      {paginationButtons.map((page) => (
        <button
          style={{
            padding: "10px",
            textAlign: "center",
            fontSize: "11px",
            borderRadius: "50%",
            background: page === currentPage ? "#1e293b" : "",
            minWidth: "30px",
            minHeight: "30px",
          }}
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? "active" : ""}
        >
          {page}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span>...</span>}
          <button
            style={{
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              borderRadius: "50%",
              background: currentPage === totalPages ? "#1e293b" : "",
              minWidth: "30px",
              minHeight: "30px",
            }}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        style={{
          padding: "10px",
          textAlign: "center",
          fontSize: "11px",
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};
