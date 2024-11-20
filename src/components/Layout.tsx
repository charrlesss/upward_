import { Suspense, useState, useEffect, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SidebarDesktop from "./Sidebars/SidebarDesktop";
import SidebarMobile from "./Sidebars/SiderbarMobile";
import {
  findObjectByLink,
  findObjectPolicyByLink,
} from "../lib/findObjectbyLink";
import { sidebarOptions } from "./Sidebars/SidebarOptions";
import LoaderLinear from "./LoaderLinear";
import useUrlParams from "../hooks/useUrlParams";
import { AuthContext } from "./AuthContext";
import { Badge } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import "../style/laoding.css"
import Header from "./Header";
const drawerWidth = 280;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  //  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => {
  return {
    display: "flex",
    padding: theme.spacing(0, 1),
    minHeight: "40px",
    border: "2px solid black",
    justifyContent: "flex-end",
    height: "40px",
    maxHeight: "40px",
  };
});

export const addToSidebarOptions = [
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/fire",
  },
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/marine",
  },
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/bonds",
  },
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/mspr",
  },
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/pa",
  },
  {
    text: "Policy",
    link: "/dashboard/task/production/policy/cgl",
  },
];



export default function Layout() {
  const { user } = useContext(AuthContext);

  const { searchParams, setSearchParams } = useUrlParams();
  const [openCircularLoader, setOpenCircularLoader] = useState(false);

  const closeLoading = () => {
    setOpenCircularLoader(false)
  }
  const showLoading = () => {
    setOpenCircularLoader(true)
  }
  const open = searchParams.get("drawer") === "true";
  const [matchQuery, setMatchQuery] = useState(
    window.matchMedia("(max-width: 900px)").matches
  );

  const location = useLocation();
  const { text } =
    findObjectByLink(
      sidebarOptions(user?.userAccess as string),
      location.pathname
    ) ??
    (location.pathname !== "/dashboard"
      ? { text: findObjectPolicyByLink(location.pathname) }
      : { text: "Dashboard" });

  function handleSidebar() {
    setSearchParams(
      (prev) => {
        prev.set("drawer", (searchParams.get("drawer") === "false").toString());
        return prev;
      },
      { replace: true }
    );
  }

  const handleDrawerOpen = () => {
    handleSidebar();
  };

  const handleDrawerClose = () => {
    handleSidebar();
  };

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setMatchQuery(e.matches);
    window.matchMedia("(max-width: 900px)").addEventListener("change", handler);
  }, []);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    }}>
      <CssBaseline />
      {/* {matchQuery ? (
        <SidebarMobile
          open={open}
          drawerWidth={drawerWidth}
          handleDrawerClose={handleDrawerClose}
          showLoading={showLoading}
          closeLoading={closeLoading}
        />
      ) : (
        <SidebarDesktop
          open={open}
          drawerWidth={drawerWidth}
          handleDrawerClose={handleDrawerClose}
          showLoading={showLoading}
          closeLoading={closeLoading}
        />
      )}
      <AppBar
        sx={{ height: "40px" }}
        position="fixed"
        open={open}
        className="upward-main-drawer"
      >
        <Toolbar sx={{ minHeight: "40px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            size="small"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon sx={{ height: "20px", width: "20px" }} />
          </IconButton>
          <Box
            sx={{ display: "flex", flex: 1, justifyContent: "space-between" }}
          >
            <p style={{ fontSize: "14px" }}>{text}</p>
            <p style={{ fontSize: "13px" }}>
              {user?.department === "UMIS"
                ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."}
            </p>

            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                  paddingRight: "30px",
                },
              }}
            >
              <Clock />
            </Box>
          </Box>
        </Toolbar>
      </AppBar> */}
      <Header />
      <Main open={open}>
        <Box
          id="page-content"
          sx={(theme) => ({
            width: "100%",
            height: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            [theme.breakpoints.down("md")]: {
              paddingLeft: "300px",
            },
          })}
        >
          <Suspense fallback={<LoaderLinear open={true} />}>
            <Outlet />
          </Suspense>
        </Box>
      </Main>

      {openCircularLoader && <div className="loading-component"><div className="loader"></div></div>}


    </Box>
  );
}

export function RenderPage() {
  return (
    <Suspense fallback={<LoaderLinear open={true} />}>
      <Outlet />
    </Suspense>
  );
}
