import React, { useContext, useState } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { SidebarHeader, SidebarParent, sidebarOptions } from "./SidebarOptions";
import { AuthContext } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Logout } from "./Logout";
import { wait } from "../../lib/wait";
import Swal from "sweetalert2";
import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import axios from "axios";

export default function SidebarDesktop({
  drawerWidth,
  handleDrawerClose,
  open,
  showLoading,
  closeLoading,
}: {
  open: boolean;
  drawerWidth: number;
  handleDrawerClose: CallableFunction;
  showLoading: CallableFunction
  closeLoading: CallableFunction
}) {
  const location = useLocation();
  const { setUser, myAxios, user } = useContext(AuthContext);
  const [sidebarDataOptions, setSidebarDataOptions] = useState(
    sidebarOptions(user?.userAccess as string)
  );
  const navigate = useNavigate();

  const { refetch } = useQuery({
    queryKey: "logout",
    queryFn: async () =>
      wait(1200).then(async () => await Logout(myAxios, user)),
    enabled: false,
    onSuccess: (res) => {
      if (res.data.success) {
        closeLoading()



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

  const handleLogout = () => {

    Swal.fire({
      title: "Are you sure?",
      text: "You want to logout!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout it!"
    }).then((result) => {
      if (result.isConfirmed) {
        
        axios.get('http://localhost:7624/close-report', {
          withCredentials: true
        }).then((res) => {
          if (!res.data.success) {
            alert(res.data.message)
          }
        })
          .catch(console.log)

       setTimeout(()=>{
        showLoading()
        refetch();
       },500)
      }
    });


  };

  const openReport = () => {
    axios.get('http://localhost:7624/open-report', {
      withCredentials: true
    }).then((res) => {
      if (!res.data.success) {
        alert(res.data.message)
      }
    })
      .catch(console.log)

  }

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <SidebarHeader handleDrawerClose={handleDrawerClose} />
      <Divider />
      <List sx={{ marginTop: 0, paddingTop: 0 }}>
        <ListItemButton
          selected={location.pathname === "/dashboard/"}
          onClick={() => {
            setSidebarDataOptions((d: Array<any>) => {
              return d.map((item: any, idx: number) => {
                item = { ...item, showDropdown: false };
                return item;
              });
            });
            navigate(`/dashboard/?drawer=false`);
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: "13px" }}
            primary={"Dashboard"}
          />
        </ListItemButton>
        <Divider />
        <SidebarParent
          sidebarDataOptions={sidebarDataOptions}
          setSidebarDataOptions={setSidebarDataOptions}
        />
        <ListItemButton sx={{ pl: 2 }} onClick={openReport}>
          <ListItemIcon>
            <AlignVerticalBottomIcon />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: "13px" }}
            primary={"Open Report"}
          />
        </ListItemButton>
        <Divider />
        <ListItemButton sx={{ pl: 2 }} onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: "13px" }}
            primary={"Logout"}
          />
        </ListItemButton>

      </List>
    </Drawer>
  );
}
