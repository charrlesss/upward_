import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

interface LoaderCircularParams {
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoaderCircular({ open, setOpen }: LoaderCircularParams) {
  const handleClose = () => {
    if (setOpen) setOpen(false);
  };
  return (
   <>
   {
   open && <Backdrop
     sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
     open={open}
     onClick={handleClose}
   >
     <CircularProgress color="inherit" />
   </Backdrop> 
   }
   </>
  );
}
