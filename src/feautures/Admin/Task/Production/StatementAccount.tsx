import { Button } from "@mui/material";
import React, { useRef, useState } from "react";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";

export default function StatementAccount() {
  const [active, setActive] = useState("CareOf");
  const careOfRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);

  const {
    UpwardTableModalSearch: PolicyUpwardTableModalSearch,
    openModal: policyOpenModal,
    closeModal: policyCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/production/soa/search-by-policy",
    column: [
      { key: "PolicyNo", label: "Policy No.", width: 100 },
      { key: "Shortname", label: "Name", width: 200 },
      { key: "IDNo", label: "ID No", width: 100 },
      {
        key: "DateIssued",
        label: "Date Issued",
        width: 90,
      },
      {
        key: "PolicyType",
        label: "Policy Type",
        width: 90,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (policyNoRef.current) {
          policyNoRef.current.value = rowItm[0];
        }
        policyCloseModal();
      }
    },
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "350px",
          height: "auto",
          border: "1px solid rgba(126, 123, 123, 0.75)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0px 0px 7px -1px rgba(0,0,0,0.75)",
        }}
      >
        <div style={{ display: "flex", height: "40px" }}>
          <Button
            sx={{ flex: 1, borderRadius: "0px" }}
            variant="contained"
            color={active === "Policy" ? "secondary" : "info"}
            onClick={() => {
              setActive("Policy");
            }}
          >
            Policy
          </Button>
          <Button
            sx={{ flex: 1, borderRadius: "0px" }}
            variant="contained"
            color={active !== "Policy" ? "secondary" : "info"}
            onClick={() => {
              setActive("CareOf");
            }}
          >
            Care of
          </Button>
        </div>
        <div
          style={{
            height: "50px",
            display: "flex",
            alignItems: "center",
            padding: "0px 10px",
          }}
        >
          {active === "CareOf" && (
            <SelectInput
              label={{
                title: "Care Of :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              selectRef={careOfRef}
              select={{
                style: { width: "calc(100% - 70px)", height: "22px" },
                defaultValue: "HO",
              }}
              containerStyle={{
                width: "100%",
              }}
              datasource={[
                { key: "ANCAR MOTORS INC." },
                { key: "ASTRA MULTIMARKET CORPORATION" },
                { key: "COMPLETE ALLIANCE, INC" },
                { key: "CAMFIN LENDING, INC." },
                { key: "CASH MANAGEMENT FINANCE INC." },
                { key: "CREDIT MASTERS & LENDING INVESTORS CORP." },
                { key: "PRIME AMA LENDING CORP." },
                { key: "NONE" },
              ]}
              values={"key"}
              display={"key"}
            />
          )}
          {active === "Policy" && (
            <TextInput
              containerStyle={{ width: "100%" }}
              label={{
                title: "Policy: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                className: "search-input-up-on-key-down",
                type: "search",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    policyOpenModal(e.currentTarget.value);
                  }
                },
                style: { width: "calc(100% - 70px)", height: "22px" },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (policyNoRef.current) {
                  policyOpenModal(policyNoRef.current.value);
                }
              }}
              inputRef={policyNoRef}
            />
          )}
        </div>
        <Button
          sx={{ flex: 1, borderRadius: "0px" }}
          variant="contained"
          color="success"
          onClick={() => {}}
        >
          SUBMIT
        </Button>
      </div>
      <PolicyUpwardTableModalSearch />
    </div>
  );
}
