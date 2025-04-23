import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import "../style/laoding.css";
import Header from "./Header";
import { Loading } from "./Loading";

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
        boxSizing: "border-box",
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
        })}
      >
        <Suspense fallback={<Loading />}>
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
        boxSizing: "border-box",
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
        })}
      >
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
