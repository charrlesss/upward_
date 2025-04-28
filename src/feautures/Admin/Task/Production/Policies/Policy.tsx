import { Box, Chip, Divider } from "@mui/material";
import { blue } from "@mui/material/colors";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useUrlParams from "../../../../../hooks/useUrlParams";
import "../../../../../style/monbileview/production/production.css";

export default function Policy() {
  return (
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
      <Outlet />
    </div>
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
  const { searchParams } = useUrlParams();
  const location = useLocation();
  const navigate = useNavigate();
  function handleClick(e: any, link: string) {
    navigate(link + `?drawer=${searchParams.get("drawer")}`);
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
            onClick={(e) => handleClick(e, item.link)}
            label={item.label}
          />
        );
      })}
    </div>
  );
}
