import { Button } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { format } from "date-fns";
import { isMobile } from "react-device-detect";

export default function StatementAccount() {
  const { myAxios, user } = useContext(AuthContext);
  const [active, setActive] = useState("CareOf");
  const careOfRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);
  const policyTypeRef = useRef("");
  const refNoRef = useRef<HTMLInputElement>(null);
  const attachmentRef = useRef<HTMLTextAreaElement>(null);

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
        policyTypeRef.current = rowItm[5];
        policyCloseModal();
      }
    },
  });

  const { mutate: mutatateReport, isLoading: isLoadingReport } = useMutation({
    mutationKey: "report",
    mutationFn: (variables: any) => {
      return myAxios.post(
        active === "Policy"
          ? "/task/production/soa/generate-soa-policy"
          : "/task/production/soa/generate-soa-careof",
        variables,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      if (isMobile) {
        // MOBILE: download directly
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } else {
        window.open(
          `/${
            process.env.REACT_APP_DEPARTMENT
          }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
          "_blank"
        );
      }
    },
  });

  return (
    <>
      {isLoadingReport && <Loading />}
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
              height: "auto",
              display: "flex",
              alignItems: "center",
              padding: "10px",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <TextInput
              containerStyle={{ width: "100%" }}
              label={{
                title: "Ref No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                className: "search-input-up-on-key-down",
                type: "text",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    policyOpenModal(e.currentTarget.value);
                  }
                },
                defaultValue: `${format(new Date(), "yyyy")}-000001`,
                style: { width: "calc(100% - 70px)", height: "22px" },
              }}
              inputRef={refNoRef}
            />
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
            <TextAreaInput
              containerClassName="custom-input"
              label={{
                title: "Attachment : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              textarea={{
                rows: 4,
                defaultValue: "**ATTACHED COPY OF COMPREHENSIVE BONDS 7 GPA**",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    //  refDate.current?.focus()
                  }
                },
              }}
              containerStyle={{
                width: "100%",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
              _inputRef={attachmentRef}
            />
          </div>
          <Button
            sx={{ flex: 1, borderRadius: "0px" }}
            variant="contained"
            color="success"
            onClick={() => {
              mutatateReport({
                type: active,
                careOf: careOfRef.current?.value,
                policy: policyNoRef.current?.value,
                refNo: refNoRef.current?.value,
                attachment: attachmentRef.current?.value,
                policyType: policyTypeRef.current,
              });
            }}
          >
            SUBMIT
          </Button>
        </div>
        <PolicyUpwardTableModalSearch />
      </div>
    </>
  );
}
