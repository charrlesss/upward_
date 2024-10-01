import { Box, Chip, Divider } from "@mui/material";
import { blue } from "@mui/material/colors";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useUrlParams from "../../../../../hooks/useUrlParams";

export default function Policy() {
  return (
    <div>
      <ChipsButton />
      <Divider sx={{ mt: 2 }} />
      <div style={{ padding: 10 }}>
        <Outlet />
      </div>
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
    link: "/dashboard/task/production/policy/",
  },
  {
    label: "Fire Policy",
    link: "/dashboard/task/production/policy/fire",
  },
  {
    label: "Marine Policy",
    link: "/dashboard/task/production/policy/marine",
  },
  {
    label: "Bonds Policy",
    link: "/dashboard/task/production/policy/bonds",
  },
  {
    label: "MSPR Policy",
    link: "/dashboard/task/production/policy/mspr",
  },
  {
    label: "PA Policy",
    link: "/dashboard/task/production/policy/pa",
  },
  {
    label: "CGL Policy",
    link: "/dashboard/task/production/policy/cgl",
  },
];

function ChipsButton() {
  const { searchParams } = useUrlParams();
  const location = useLocation();
  const navigate = useNavigate();
  function handleClick(e: any, link: string) {
    navigate(
      link +
        `?drawer=${searchParams.get("drawer")}`
    );
  }

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        columnGap: "5px",
        [theme.breakpoints.down("md")]: {
          flexWrap: "wrap",
          width: "100%",
          gap: "5px",
          marginBottom: "10px",
        },
      })}
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
    </Box>
  );
}
