import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { SidebarHeader, SidebarParent, sidebarOptions } from "./SidebarOptions";
import { AuthContext } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { wait } from "../../lib/wait";
import { useQuery } from "react-query";
import { Logout } from "./Logout";
import LoaderCircular from "../LoaderCircular";
export default function SidebarMobile({
  drawerWidth,
  handleDrawerClose,
  open,
}: {
  open: boolean;
  drawerWidth: number;
  handleDrawerClose: CallableFunction;
  setOpenCircularLoader?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setUser, myAxios, user } = useContext(AuthContext);
  const [sidebarDataOptions, setSidebarDataOptions] = useState(
    sidebarOptions(user?.userAccess as string)
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch, isLoading } = useQuery(
    "logout",
    async () => wait(1200).then(async () => await Logout(myAxios, user)),
    {
      enabled: false,
      onSuccess(res) {
        if (res.data.success) {
          setUser(null);
          navigate("/");
        }
      },
    }
  );

  const handleLogout = async () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
          background: "rgba(210, 236, 248, 0.226)",
        }}
      >
        <div>
          <LoaderCircular open />
        </div>
      </div>
    );
  }

  return (
    <Drawer anchor={"left"} open={open} onClose={() => handleDrawerClose()}>
      <Box
        sx={{ width: drawerWidth }}
        role="presentation"
        onKeyDown={() => handleDrawerClose()}
      >
        <SidebarHeader handleDrawerClose={handleDrawerClose} />
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
              <LogoutIcon />
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
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: "13px" }}
              primary={"Logout"}
            />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
