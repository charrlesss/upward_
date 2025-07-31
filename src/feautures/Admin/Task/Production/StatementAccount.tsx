import { Button } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { format } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { wait } from "../../../../lib/wait";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";

const columns = [
  { key: "PolicyNo", label: "Policy No", width: 150 },
  { key: "DateIssued", label: "Date Issued", width: 100 },
  { key: "IDNo", label: "ID No.", width: 150 },
  {
    key: "Shortname",
    label: "Name",
    width: 400,
  },
  {
    key: "PolicyType",
    label: "",
    hide: true,
  },
];

export default function StatementAccount() {
  const [mode, setMode] = useState("");
  const { myAxios, user } = useContext(AuthContext);

  const tableRef = useRef<any>(null);
  const searchSoaModal = useRef<any>(null);
  const searchPolicyModal = useRef<any>(null);
  const searchClientModal = useRef<any>(null);

  const inputSearchRef = useRef<HTMLInputElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  const searchPolicyRef = useRef<HTMLInputElement>(null);

  const idnoRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const attachmentRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: mutateReferenceNo, isLoading: isLoadingReferenceNo } =
    useMutation({
      mutationKey: "report",
      mutationFn: (variables: any) => {
        return myAxios.post(
          "/task/production/soa/generate-reference",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess: (response) => {
        if (
          response.data &&
          response.data.reference_no &&
          response.data.reference_no.length > 0
        ) {
          if (refNoRef.current) {
            refNoRef.current.value = response.data.reference_no[0].reference_no;
          }
        }
      },
    });
  const { mutate: mutateSave, isLoading: isLoadingSave } = useMutation({
    mutationKey: "save",
    mutationFn: (variables: any) => {
      return myAxios.post("/task/production/soa/save", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      mutateReferenceNo({});
      resetFields();
      tableRef.current.resetTable();
    },
  });
  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: (variables: any) => {
      return myAxios.post("/task/production/soa/print", variables, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(
        `/${
          process.env.REACT_APP_DEPARTMENT
        }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
        "_blank"
      );
    },
  });
  const {
    mutate: mutateSearchSoaSelected,
    isLoading: isLoadingSeacghSoaSelected,
  } = useMutation({
    mutationKey: "search-soa-selected",
    mutationFn: (variables: any) => {
      return myAxios.post(
        "/task/production/soa/search-soa-selected",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      if (response.data.state.length > 0) {
        if (refNoRef.current) {
          refNoRef.current.value = response.data.state[0].reference_no;
        }
        if (idnoRef.current) {
          idnoRef.current.value = response.data.state[0].idno;
        }
        if (clientNameRef.current) {
          clientNameRef.current.value = response.data.state[0].name;
        }
        if (addressRef.current) {
          addressRef.current.value = response.data.state[0].address;
        }
        if (attachmentRef.current) {
          attachmentRef.current.value = response.data.state[0].attachment;
        }
      }
      if (response.data.data.length > 0) {
        tableRef.current.setData(response.data.data);
      }
    },
  });

  function resetFields() {
    if (searchPolicyRef.current) {
      searchPolicyRef.current.value = "";
    }
    if (idnoRef.current) {
      idnoRef.current.value = "";
    }
    if (clientNameRef.current) {
      clientNameRef.current.value = "";
    }
    if (addressRef.current) {
      addressRef.current.value = "";
    }
    if (attachmentRef.current) {
      attachmentRef.current.value = "";
    }
  }

  return (
    <>
      {(isLoadingReferenceNo ||
        isLoadingPrint ||
        isLoadingSave ||
        isLoadingSeacghSoaSelected) && <Loading />}
      <div
        style={{
          flex: 1,
          padding: "5px",
          rowGap: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            width: "100%",
          }}
        >
          <TextInput
            containerClassName="search-input"
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "50px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  searchSoaModal.current.openModal(e.currentTarget.value);
                }
              },
              style: { width: "500px" },
            }}
            icon={
              <SearchIcon
                sx={{
                  fontSize: "18px",
                }}
              />
            }
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current) {
                searchSoaModal.current.openModal(inputSearchRef.current.value);
              }
            }}
            inputRef={inputSearchRef}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "10px",
            }}
          >
            {mode === "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setMode("add");
                  mutateReferenceNo({});
                }}
                color="primary"
              >
                New
              </Button>
            )}
            {mode !== "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={
                  <LocalPrintshopIcon sx={{ width: 15, height: 15 }} />
                }
                id="entry-header-save-button"
                onClick={() => {
                  const data = Object.values(
                    tableRef.current.getData().reduce((acc: any, item: any) => {
                      if (!acc[item.PolicyType]) {
                        acc[item.PolicyType] = {
                          Type: item.PolicyType,
                          data: [],
                        };
                      }
                      acc[item.PolicyType].data.push(item.PolicyNo);
                      return acc;
                    }, {})
                  );

                  mutatePrint({
                    reference_no: refNoRef.current?.value,
                    idno: idnoRef.current?.value,
                    name: clientNameRef.current?.value,
                    address: addressRef.current?.value,
                    attachment: attachmentRef.current?.value,
                    data,
                  });
                }}
                color="info"
              >
                Print
              </Button>
            )}
            {mode !== "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  if (mode === "update") {
                    codeCondfirmationAlert({
                      isUpdate: true,
                      cb: (userCodeConfirmation) => {
                        mutateSave({
                          reference_no: refNoRef.current?.value,
                          idno: idnoRef.current?.value,
                          name: clientNameRef.current?.value,
                          address: addressRef.current?.value,
                          attachment: attachmentRef.current?.value,
                          tableData: tableRef.current.getData(),
                          userCodeConfirmation,
                          mode: "update",
                        });
                      },
                    });
                  } else {
                    saveCondfirmationAlert({
                      isConfirm: () => {
                        mutateSave({
                          reference_no: refNoRef.current?.value,
                          idno: idnoRef.current?.value,
                          name: clientNameRef.current?.value,
                          address: addressRef.current?.value,
                          attachment: attachmentRef.current?.value,
                          tableData: tableRef.current.getData(),
                          mode: "add",
                        });
                      },
                    });
                  }
                }}
                color="success"
              >
                Save
              </Button>
            )}
            {mode !== "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setMode("");
                }}
                color="error"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        <div
          style={{
            width: "auto",
            display: "flex",
            rowGap: "5px",
            flexDirection: "column",
          }}
        >
          <TextInput
            containerStyle={{ width: "350px" }}
            containerClassName="custom-input"
            label={{
              title: "Reference: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              readOnly: mode === "",
              type: "text",
              style: { width: "calc(100% - 100px)" },
              name: "refNo",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={refNoRef}
          />
          <TextInput
            containerClassName="search-input"
            label={{
              title: "Search Policy : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            containerStyle={{ width: "500px" }}
            input={{
              readOnly: mode === "",

              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  searchPolicyModal.current.openModal(e.currentTarget.value);
                }
              },
              style: { width: "calc(100% - 100px)" },
            }}
            icon={
              <SearchIcon
                sx={{
                  fontSize: "18px",
                }}
              />
            }
            onIconClick={(e) => {
              e.preventDefault();
              if (searchPolicyRef.current) {
                searchPolicyModal.current.openModal(
                  searchPolicyRef.current.value
                );
              }
            }}
            inputRef={searchPolicyRef}
          />
        </div>
        <div
          className="container-max-width"
          style={{
            width: "50%",
            border: "1px solid #e3e7ecff",
            boxSizing: "border-box",
            padding: "15px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            borderRadius: "5px",
            boxShadow: "-3px -8px 20px -12px rgba(112, 107, 107, 0.75) inset",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "10px",
              fontSize: "14px",
              background: "white",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Print Details
          </span>
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Search Client :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              readOnly: mode === "",
              type: "text",
              style: {
                width: "calc(100% - 100px) ",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  searchClientModal.current.openModal(e.currentTarget.value);
                }
              },
            }}
            icon={
              <SearchIcon
                sx={{
                  fontSize: "18px",
                }}
              />
            }
            onIconClick={(e) => {
              e.preventDefault();
              if (idnoRef.current) {
                searchClientModal.current.openModal(idnoRef.current.value);
              }
            }}
            inputRef={idnoRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Acct. Name :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              readOnly: true,
              type: "text",
              style: {
                width: "calc(100% - 100px) ",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={clientNameRef}
          />
          <TextAreaInput
            containerStyle={{ width: "100%" }}
            containerClassName="custom-input"
            label={{
              title: "Address : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
                alignSelf: "flex-start",
              },
            }}
            textarea={{
              readOnly: true,
              rows: 3,
              style: { width: "calc(100% - 100px)" },
              defaultValue: "",
            }}
            _inputRef={addressRef}
          />
          <TextAreaInput
            containerStyle={{ width: "100%" }}
            containerClassName="custom-input"
            label={{
              title: "Attachment :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
                alignSelf: "flex-start",
              },
            }}
            textarea={{
              readOnly: mode === "",
              rows: 3,
              style: { width: "calc(100% - 100px)" },
              defaultValue: `**ATTACHED COPY OF COMPREHENSIVE, BONDS & GPA**`,
              onChange: (e) => {},
            }}
            _inputRef={attachmentRef}
          />
        </div>
        <div
          style={{
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
          }}
        >
          <DataGridViewReactUpgraded
            ref={tableRef}
            adjustVisibleRowCount={355}
            columns={columns}
            DisplayData={({ row, col }: any) => {
              return (
                <>
                  {col.key === "datefrom" || col.key === "dateto"
                    ? format(new Date(row[col.key]), "MM/dd/yyyy")
                    : row[col.key]}
                </>
              );
            }}
            handleSelectionChange={(rowItm: any) => {}}
          />
        </div>
      </div>
      <UpwardTableModalSearch
        ref={searchSoaModal}
        disableUnselection={true}
        link={"/task/production/soa/search-soa"}
        column={[
          { key: "reference_no", label: "Reference No.", width: 100 },
          { key: "name", label: "Name", width: 320 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              setMode("update");
              mutateSearchSoaSelected({
                reference_no: rowItm.reference_no,
              });
            });
            searchSoaModal.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={searchPolicyModal}
        disableUnselection={true}
        size="large"
        link={"/task/production/soa/search-by-policy"}
        column={[
          { key: "PolicyNo", label: "Policy No", width: 150 },
          { key: "DateIssued", label: "Date Issued", width: 100 },
          { key: "IDNo", label: "ID No.", width: 150 },
          {
            key: "Shortname",
            label: "Name",
            width: 400,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              const tableData = tableRef.current.getData();

              if (
                tableData.some((itm: any) => itm.PolicyNo === rowItm.PolicyNo)
              ) {
                alert(`This Policy - (${rowItm.PolicyNo}) already selected!`);
                searchPolicyModal.current.resetSelectedRow();

                return;
              }

              tableRef.current.setData([...tableData, rowItm]);
            });
            // searchPolicyModal.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={searchClientModal}
        link={"/task/production/soa/search-by-client"}
        column={[
          { key: "address", label: "Address", width: 100 },
          { key: "IDNo", label: "ID No.", width: 150 },
          {
            key: "Shortname",
            label: "Name",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (clientNameRef.current) {
                clientNameRef.current.value = rowItm.Shortname;
              }
              if (idnoRef.current) {
                idnoRef.current.value = rowItm.IDNo;
              }
              if (addressRef.current) {
                addressRef.current.value = rowItm.address;
              }
            });
            searchClientModal.current.closeModal();
          }
        }}
      />
    </>
  );
}

// const { mutate: mutatateReport, isLoading: isLoadingReport } = useMutation({
//   mutationKey: "report",
//   mutationFn: (variables: any) => {
//     return myAxios.post(
//       active === "Policy"
//         ? "/task/production/soa/generate-soa-policy"
//         : "/task/production/soa/generate-soa-careof",
//       variables,
//       {
//         responseType: "arraybuffer",
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }
//     );
//   },
//   onSuccess: (response) => {
//     const pdfBlob = new Blob([response.data], { type: "application/pdf" });
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     if (isMobile) {
//       // MOBILE: download directly
//       const link = document.createElement("a");
//       link.href = pdfUrl;
//       link.download = "report.pdf";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       return;
//     } else {
//       window.open(
//         `/${
//           process.env.REACT_APP_DEPARTMENT
//         }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
//         "_blank"
//       );
//     }
//   },
// });
