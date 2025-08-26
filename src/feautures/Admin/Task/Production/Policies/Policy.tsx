import {  Chip,  } from "@mui/material";
import { blue } from "@mui/material/colors";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../../../../style/monbileview/production/production.css";
import { useQuery } from "react-query";
import { createContext, useContext } from "react";
import { AuthContext } from "../../../../../components/AuthContext";
import { Loading } from "../../../../../components/Loading";
import Swal from "sweetalert2";

export const PolicyContext = createContext<{
  careOfData: Array<any>;
  subAccountData: Array<any>;
}>({
  careOfData: [],
  subAccountData: [],
});

export default function Policy() {
  const { myAxios, user } = useContext(AuthContext);

  const { isLoading: isLoadingSubAccount, data: subAccountData } = useQuery({
    queryKey: "sub-account",
    queryFn: () => {
      return myAxios.get("/task/production/sub-account", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    refetchOnWindowFocus: false,
  });
  const { isLoading: isLoadingcareOf, data: careOfData } = useQuery({
    queryKey: "care-of",
    queryFn: () => {
      return myAxios.get("/task/production/care-of", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {(isLoadingcareOf || isLoadingSubAccount) && <Loading />}
      <div
        className="main"
        style={{
          flex: 1,
          padding: "5px",
          msFlexDirection: "column",
          background: "#F1F1F1",
          position: "relative",
        }}
      >
        <ChipsButton />
        <PolicyContext.Provider
          value={{
            careOfData: careOfData?.data.data,
            subAccountData: subAccountData?.data.data,
          }}
        >
          <Outlet />
        </PolicyContext.Provider>
      </div>
    </>
  );
}

const chipStyle = {
  "& .MuiChip-label": {
    pointerEvents: "none",
  },
};

const chips = [
  {
    label: "Vehicle Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/`,
  },
  {
    label: "Fire Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/fire`,
  },
  {
    label: "Marine Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/marine`,
  },
  {
    label: "Bonds Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/bonds`,
  },
  {
    label: "MSPR Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/mspr`,
  },
  {
    label: "PA Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/pa`,
  },
  {
    label: "CGL Policy",
    link: `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/cgl`,
  },
];

function ChipsButton() {
  const location = useLocation();
  const navigate = useNavigate();
  function handleClick(e: any, link: string) {
    navigate(link );
  }

  return (
    <div
      className="button-chips-container"
      style={{
        display: "flex",
        columnGap: "5px",
        height: "35px",
        alignItems: "center",
        position: "relative",
      }}
    >
      {chips.map((item, idx) => {
        const selected = item.link === location.pathname;

        return (
          <Chip
            key={idx}
            sx={{
              ...chipStyle,
              backgroundColor: selected ? blue[500] : "",
              pointerEvents: selected ? "none" : "",
              color: selected ? "white" : "",
            }}
            variant="outlined"
            onClick={(e) => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: `Yes, Change  to ${item.label}!`,
                cancelButtonText: "Cancel",
              }).then((result) => {
                if (result.isConfirmed) {
                  handleClick(e, item.link);
                }
              });
            }}
            label={item.label}
          />
        );
      })}
    </div>
  );
}
