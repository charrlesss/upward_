import React, { useContext } from "react";
import "../style/page-not-found.css";
import { useQuery } from "react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

const NotFoundPage = ({ isLazy = false }: any) => {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const { isLoading, data } = useQuery({
    queryKey: "not-found",
    queryFn: async () =>
      await axios.get(`${process.env.REACT_APP_API_URL}/token`, {
        withCredentials: true,
      }),
  });

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: isLazy ? "100%" : "100vh",
        width: isLazy ? "100%" : "100vw",
        flex: 1,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <img
          alt="Upward Insurance"
          src={process.env.REACT_APP_IMAGE_URL + "logo.png"}
          style={{ width: "160px", height: "160px" }}
        />
        <h2 style={{ fontSize: "3em" }}>This page isn't available</h2>
        <p style={{ fontSize: "20px" }}>
          The link you followed may be broken, or the page may have been
          removed.
        </p>
        <button
          onClick={() => {
            if (typeof data?.data === "string") {
              return (window.location.href = `/${process.env.REACT_APP_DEPARTMENT}/login`);
            }
            if (user?.is_master_admin) {
              return navigate("/master-admin-dashboard");
            }

            if (process.env.REACT_APP_DEPARTMENT === "UCSMI") {
              return navigate(
                `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/accounting/post-date-checks`
              );
            } else {
              return navigate(`/${process.env.REACT_APP_DEPARTMENT}/dashboard`);
            }
          }}
        >
          {isLoading ? "Loading" : "Click this button to continue"}
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
