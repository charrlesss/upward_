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
import "../style/laoding.css";
import Header from "./Header";

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
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <CssBaseline />
      <Header />
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
    </Box>
  );
}

export function RenderPage({ withHeader = true }: any) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <CssBaseline />
      {withHeader && <Header />}
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
    </Box>
  );
}
