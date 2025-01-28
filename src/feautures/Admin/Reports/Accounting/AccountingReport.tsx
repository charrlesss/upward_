import { Button } from "@mui/material";
import {
  SelectInput,
  TextAreaInput,
} from "../../../../components/UpwardFields";
import { useState } from "react";

export default function AccountingReport() {
  const [title, setTitle] = useState("");

  function generateReport() {}
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: "100vh",
        backgroundColor: "#F1F1F1",
      }}
    >
      <div
        style={{
          border: "1px solid #94a3b8",
          width: "500px",
          height: "450px",
          display: "flex",
          flexDirection: "column",
          rowGap: "10px",
          padding: "20px",
          boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.75)",
        }}
      >
      
        <Button
          onClick={generateReport}
          color="success"
          variant="contained"
          sx={{ height: "22px", fontSize: "12px" }}
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
}
