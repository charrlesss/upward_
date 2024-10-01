import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

interface LoaderLinearParams {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoaderLinear({
  open,
  setOpen,
}: LoaderLinearParams) {
  
  const handleClose = () => {
    if (setOpen) setOpen(false);
  };

  return (
    <div style={{"position": "relative"}}>
      <Backdrop
        sx={{ color: "#fff", position: 'fixed' , zIndex: (theme) => theme.zIndex.drawer -1 }}
        open={open ? open : false}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
