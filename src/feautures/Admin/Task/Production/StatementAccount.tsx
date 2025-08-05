import { Button } from "@mui/material";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
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
import Swal from "sweetalert2";
import { formatNumber } from "../Accounting/ReturnCheck";

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
  const confirmationModal = useRef<any>(null);
  const searchSoaByPolicyModal = useRef<any>(null);
  const searchEndorsement = useRef<any>(null);

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
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, cancel it!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setMode("");
                      resetFields();
                      tableRef.current.resetTable();
                      mutateReferenceNo({});
                    }
                  });
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
        autoselection={false}
        ref={searchPolicyModal}
        disableUnselection={true}
        size="large"
        link={"/task/production/soa/search-by-policy"}
        column={[
          { key: "used", label: "", width: 26 },
          { key: "PolicyNo", label: "Policy No", width: 150 },
          { key: "DateIssued", label: "Date Issued", width: 90 },
          { key: "IDNo", label: "ID No.", width: 120 },
          {
            key: "Shortname",
            label: "Name",
            width: 300,
          },
          {
            key: "totalDue",
            label: "Total Due",
            width: 100,
          },
          {
            key: "payment",
            label: "Payment",
            width: 100,
          },
          {
            key: "balance",
            label: "Balance",
            width: 100,
          },
          {
            key: "PolicyType",
            label: "",
            hide: true,
          },
        ]}
        DisplayData={({ row, col }: any) => {
          return (
            <>
              {col.key === "used"
                ? row[col.key] === "Yes" && <span>🟢</span>
                : row[col.key]}
            </>
          );
        }}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              const tableData = tableRef.current.getData();

              if (rowItm.used === "Yes" && rowItm.PolicyType !== "PA") {
                confirmationModal.current.showModal(rowItm, true, false);
              } else if (rowItm.PolicyType === "PA" && rowItm.used !== "Yes") {
                confirmationModal.current.showModal(rowItm, false, true);
              } else if (rowItm.used === "Yes" && rowItm.PolicyType === "PA") {
                confirmationModal.current.showModal(rowItm, true, true);
              } else {
                if (
                  tableData.some((itm: any) => itm.PolicyNo === rowItm.PolicyNo)
                ) {
                  alert(`This Policy - (${rowItm.PolicyNo}) already selected!`);
                  searchPolicyModal.current.resetSelectedRow();
                  return;
                }
                if (
                  ["G13", "G31", "G02", "G16", "G40", "G41", "G42"].includes(
                    rowItm.PolicyType
                  )
                ) {
                  rowItm.PolicyType = "Bonds";
                }

                console.log(rowItm)
                tableRef.current.setData([...tableData, rowItm]);
                searchPolicyModal.current.resetSelectedRow();
              }
            });
          }
        }}
      />
      <UpwardTableModalSearch
        ref={searchClientModal}
        link={"/task/production/soa/search-by-client"}
        column={[
          {
            key: "Shortname",
            label: "Name",
            width: 300,
          },
          { key: "IDNo", label: "ID No.", width: 150 },
          { key: "address", label: "Address", width: 300 },
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
      <UpwardTableModalSearch
        autoselection={false}
        showSearchInput={false}
        ref={searchSoaByPolicyModal}
        link={"/task/production/soa/search-soa-by-policy"}
        column={[
          {
            key: "reference_no",
            label: "Reference No",
            width: 150,
          },
          { key: "policy_no", label: "Policy No", width: 150 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, view it!",
                didOpen: () => {
                  const container: any =
                    document.querySelector(".swal2-container");
                  if (container) {
                    container.style.zIndex = "9999999";
                  }
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  setMode("update");
                  mutateSearchSoaSelected({
                    reference_no: rowItm.reference_no,
                  });
                }
              });
            });
            searchSoaByPolicyModal.current.closeModal();
            searchPolicyModal.current.closeModal();
          }
        }}
        onCloseModal={() => {
          searchPolicyModal.current.resetSelectedRow();
        }}
      />
      <UpwardTableModalSearch
        ref={searchEndorsement}
        autoselection={false}
        showSearchInput={false}
        disableUnselection={true}
        size="large"
        link={"/task/production/soa/search-endorsement"}
        column={[
          {
            key: "endorsement_no",
            label: "Endorsement No.",
            width: 150,
            type: "text",
          },
          {
            key: "policyNo",
            label: "Policy No.",
            width: 150,
            type: "text",
          },
          {
            key: "name",
            label: "Name",
            width: 200,
            type: "text",
          },
          {
            key: "address",
            label: "Address",
            width: 300,
            type: "text",
          },
          {
            key: "dateissued",
            label: "Date Issued",
            width: 100,
            type: "text",
          },
          {
            key: "datefrom",
            label: "Date From",
            width: 100,
            type: "text",
          },
          {
            key: "dateto",
            label: "Date To",
            width: 100,
            type: "text",
          },
          {
            key: "suminsured",
            label: "Sum Insured",
            width: 100,
            type: "text",
          },
          {
            key: "deleted",
            label: "Deleted",
            width: 300,
            type: "text",
          },
          {
            key: "replacement",
            label: "Replacement",
            width: 300,
            type: "text",
          },
          {
            key: "additional",
            label: "Additional",
            width: 300,
            type: "text",
          },
          {
            key: "totalpremium",
            label: "Total Premium",
            width: 100,
            type: "text",
          },
          {
            key: "vat",
            label: "Vat",
            width: 100,
            type: "text",
          },
          {
            key: "docstamp",
            label: "Doc Stamp",
            width: 100,
            type: "text",
          },
          {
            key: "lgovtaxpercent",
            label: "Local Gov Tax Percentage",
            width: 180,
            type: "text",
          },
          {
            key: "lgovtax",
            label: "Local Gov Tax ",
            width: 100,
            type: "text",
          },
          {
            key: "totaldue",
            label: "Total Due ",
            width: 100,
            type: "text",
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              const tableData = tableRef.current.getData();
              if (
                tableData.some(
                  (itm: any) => itm.PolicyNo === rowItm.endorsement_no
                )
              ) {
                alert(
                  `This Policy - (${rowItm.endorsement_no}) already selected!`
                );
                searchEndorsement.current.resetSelectedRow();

                return;
              }
              const newRowItem = {
                PolicyNo: rowItm.endorsement_no,
                DateIssued: format(new Date(rowItm.dateissued), "MM/dd/yyyy"),
                IDNo: rowItm.policyNo,
                Shortname: rowItm.name,
                PolicyType: "ED",
              };
              tableRef.current.setData([...tableData, newRowItem]);
              searchEndorsement.current.resetSelectedRow();
            });

            // searchEndorsement.current.closeModal();
          }
        }}
        DisplayData={({ row, col }: any) => {
          return (
            <>
              {col.key === "datefrom" ||
              col.key === "dateto" ||
              col.key === "dateissued"
                ? format(new Date(row[col.key]), "MM/dd/yyyy")
                : col.key === "suminsured" ||
                  col.key === "totalpremium" ||
                  col.key === "vat" ||
                  col.key === "docstamp" ||
                  col.key === "lgovtax" ||
                  col.key === "totaldue"
                ? formatNumber(
                    parseFloat(row[col.key].toString().replace(/,/g, "")) || 0
                  )
                : row[col.key]}
            </>
          );
        }}
        onCloseModal={() => {
          searchPolicyModal.current.resetSelectedRow();
        }}
      />
      <ConfirmationModalForReference
        ref={confirmationModal}
        onClose={() => {
          searchPolicyModal.current.resetSelectedRow();
        }}
        isViewEndorsement={(rowItm: any) => {
          confirmationModal.current.closeModal();
          searchEndorsement.current.openModal(rowItm.PolicyNo);
        }}
        isViewList={(rowItm: any) => {
          confirmationModal.current.closeModal();
          searchSoaByPolicyModal.current.openModal(rowItm.PolicyNo);
        }}
        isAddOnly={(rowItm: any) => {
          const tableData = tableRef.current.getData();

          if (tableData.some((itm: any) => itm.PolicyNo === rowItm.PolicyNo)) {
            alert(`This Policy - (${rowItm.PolicyNo}) already selected!`);
            searchPolicyModal.current.resetSelectedRow();
            return;
          }

          tableRef.current.setData([...tableData, rowItm]);
          searchPolicyModal.current.resetSelectedRow();
          confirmationModal.current.closeModal();
        }}
      />
    </>
  );
}
const ConfirmationModalForReference = forwardRef(
  ({ isViewList, isAddOnly, isViewEndorsement, onClose }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const [showModal, setShowModal] = useState(false);
    const [showRef, setShowRef] = useState(false);
    const [showEndorsement, setShowEndorsement] = useState(false);
    const [blick, setBlick] = useState(false);
    const [row, setRow] = useState<any>(null);
    useEffect(() => {
      window.addEventListener("keydown", (e: any) => {
        if (e.key === "Escape") {
        }
      });
    }, []);

    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    useImperativeHandle(ref, () => ({
      showModal: (_state: any, showRef: boolean, showEndorsement: boolean) => {
        setRow(_state);
        setShowModal(true);
        setShowRef(showRef);
        setShowEndorsement(showEndorsement);
      },
      closeModal: () => {
        setShowModal(false);
      },
    }));

    return showModal ? (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: 999999,
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        <div
          className="modal-add-check"
          ref={modalRef}
          style={{
            height: blick ? "172px" : "170px",
            width: blick ? "252px" : "250px",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999999,
            opacity: 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
            background: "#F1F1F1",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              {row?.PolicyNo}
            </span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                onClose();
                setShowModal(false);
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            className="main-content"
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {showEndorsement && row?.PolicyType === "PA" && (
              <Button
                onClick={() => isViewEndorsement(row)}
                sx={{ width: "100%" }}
                variant="contained"
                color="success"
              >
                View Endorsement
              </Button>
            )}
            {showRef && (
              <Button
                onClick={() => isViewList(row)}
                sx={{ width: "100%" }}
                variant="contained"
                color="primary"
              >
                View Reference
              </Button>
            )}
            <Button
              onClick={() => isAddOnly(row)}
              sx={{ width: "100%" }}
              variant="contained"
              color="secondary"
            >
              Add this row
            </Button>
          </div>
        </div>
      </>
    ) : null;
  }
);
