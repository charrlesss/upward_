import React, { useContext, useState, useRef, useReducer } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  Menu,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import { AuthContext } from "../../../../components/AuthContext";
import CustomDatePicker from "../../../../components/DatePicker";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CloseIcon from "@mui/icons-material/Close";
import PolicyIcon from "@mui/icons-material/Policy";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import { flushSync } from "react-dom";
import { LoadingButton } from "@mui/lab";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { DisplayFile, checkFile } from "../Claims/Claims";
import ReactDOMServer from "react-dom/server";
import { grey } from "@mui/material/colors";
import { UpwardTable } from "../../../../components/UpwardTable";
import { useUpwardTableModal } from "../../../../hooks/useUpwardTableModal";

const initialState = {
  Sub_Ref_No: "",
  Ref_No: "",
  PNo: "",
  IDNo: "",
  Date: new Date(),
  Name: "",
  Remarks: "",
  PDC_Status: "",
  Deposit_Slip: "",
  DateDeposit: "",
  OR_No: "",
  search: "",
  pdcMode: "",
  checkMode: "",
  sub_account: "",
  Acronym: "",
};
const modalPdcCheckInititalState = {
  CheckIdx: "0",
  BankName: "",
  BankCode: "",
  Branch: "",
  Check_Date: new Date(),
  Check_No: "",
  Check_Amnt: "",
  Check_Remarks: "",
  Check_Count: "",
};
export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
};
export const pdcColumn = [
  { field: "Check_No", headerName: "Check No.", width: 150 },
  { field: "Check_Date", headerName: "Check Date", width: 150 },
  { field: "Check_Amnt", headerName: "Amount", width: 150, type: "number" },
  { field: "BankName", headerName: "Bank", width: 200 },
  { field: "Branch", headerName: "Branch", width: 200 },
  {
    field: "Check_Remarks",
    headerName: "Checked Remarks",
    width: 350,
  },
  { field: "Deposit_Slip", headerName: "Deposit Slip", width: 150 },
  { field: "DateDeposit", headerName: "Date Deposit", width: 150 },
  { field: "OR_No", headerName: "OR Num", width: 150 },
  { field: "BankCode", headerName: "Bank Code", width: 150, hide: true },
];
export const pdcSearchColumn = [
  { field: "Date", headerName: "Date Received", width: 160 },
  { field: "Ref_No", headerName: "Ref No.", width: 160 },
  {
    field: "Name",
    headerName: "Name",
    flex: 1,
  },
];
export const pdcBanksColumn = [
  { field: "Bank_Code", headerName: "Code", width: 130 },
  { field: "Bank", headerName: "Bank Name", flex: 1 },
];
const queryKey = "pdc";
const quertKeyPDCSearch = "pdc-search";

export default function PostDateChecks() {
  const tableRef = useRef<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([]);
  const [pdcDataRows, setPdcDataRows] = useState<GridRowSelectionModel>([]);
  const [openPdcInputModal, setOpenPdcInputModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [stateModalPdcCheck, dispatchModalPdcCheck] = useReducer(
    reducer,
    modalPdcCheckInititalState
  );

  const { myAxios, user } = useContext(AuthContext);
  const dataGridFunctions = useRef<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // pdc form save button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savePDCButtonRef = useRef<HTMLButtonElement>(null);
  const openIdsButtonRef = useRef<HTMLButtonElement>(null);
  //check modal refs
  const checkNoRef = useRef<HTMLInputElement>(null);
  const checkBankRef = useRef<HTMLInputElement>(null);
  const checkBranchRef = useRef<HTMLInputElement>(null);
  const checkAmountRef = useRef<HTMLInputElement>(null);
  const checkDateRef = useRef<HTMLInputElement>(null);
  const checkModalSaveButton = useRef<HTMLButtonElement>(null);
  const checkModalSaveButtonActionRef = useRef<any>(null);
  // search modal auto focus on load
  const addRefButton = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const table = useRef<any>(null);

  const { isLoading: newRefNumberLoading, refetch: refetchNewRefNumber } =
    useQuery({
      queryKey: "new-ref-number",
      queryFn: async () => {
        return await myAxios.get("/task/accounting/pdc-new-ref-number", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      refetchOnWindowFocus: false,
      onSuccess: (res) => {
        const response = res as any;
        dispatch({
          type: "UPDATE_FIELD",
          field: "Ref_No",
          value: response.data.RefNo[0].pdcID,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Sub_Ref_No",
          value: response.data.RefNo[0].pdcID,
        });
      },
    });
  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      if (state.pdcMode === "update") {
        delete variables.mode;
        return await myAxios.post("/task/accounting/update-pdc", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      }
      delete variables.mode;
      return await myAxios.post("/task/accounting/add-pdc", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        refetchNewRefNumber();
        queryClient.invalidateQueries(quertKeyPDCSearch);
        setNewStateValue(dispatch, initialState);
        setPdcDataRows([]);
        dispatch({
          type: "UPDATE_FIELD",
          field: "pdcMode",
          value: "",
        });

        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }

      Swal.fire({
        position: "center",
        icon: "error",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });
  //selecte search

  const { mutate: mutateSelectedSearch, isLoading: isLoadingSelectedSearch } =
    useMutation({
      mutationKey: queryKey,
      mutationFn: async (variables: any) =>
        await myAxios.post("/task/accounting/get-search-pdc-check", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess: async (res) => {
        if (!res?.data.success) {
          return alert(`Error : ${res?.data.message}`);
        }
        const response = res as any;
        const Ref_No = response.data.getSearchPDCCheck[0].Ref_No;
        if (response.data.upload[0]) {
          const uploadFiles = JSON.parse(response.data.upload[0]?.upload);
          const newObjContainerBasic = await formatDataToDocument(
            uploadFiles,
            `${process.env.REACT_APP_IMAGE_URL}pdc/${Ref_No}`
          );
          const fileSelected = await Promise.all(newObjContainerBasic);
          setSelectedFiles(fileSelected);
        }
        async function formatDataToDocument(
          dataDocument: Array<any>,
          url: string
        ) {
          const newObjContainer: Array<any> = [];
          for (let index = 0; index < dataDocument.length; index++) {
            const basicItem = dataDocument[index];
            const mainURL = `${url}/${basicItem.uniqueFilename}`;
            const response = await fetch(mainURL);
            const blob = await response.blob();
            const file = new File([blob], basicItem.fileName, {
              type: basicItem.fileType,
            });
            const reader = new FileReader();
            newObjContainer.push(
              new Promise((resolve, reject) => {
                reader.onload = function (event) {
                  resolve(file);
                };
                reader.onerror = function (event) {
                  reject(new Error("Error reading file: " + file.name));
                };
                reader.readAsDataURL(file);
              })
            );
          }
          return newObjContainer;
        }

        setPdcDataRows(
          response.data.getSearchPDCCheck.map((item: any, idx: number) => {
            return { ...item, CheckIdx: `${idx}` };
          })
        );
        dispatch({
          type: "UPDATE_FIELD",
          field: "Ref_No",
          value: response.data.getSearchPDCCheck[0].Ref_No,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Name",
          value: response.data.getSearchPDCCheck[0].Name,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Date",
          value: response.data.getSearchPDCCheck[0].Date,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "PNo",
          value: response.data.getSearchPDCCheck[0].PNo,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "IDNo",
          value: response.data.getSearchPDCCheck[0].IDNo,
        });

        dispatch({
          type: "UPDATE_FIELD",
          field: "Acronym",
          value: response.data.getSearchPDCCheck[0].Acronym,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "sub_account",
          value: response.data.getSearchPDCCheck[0].sub_account,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Remarks",
          value: response.data.getSearchPDCCheck[0].Remarks,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "pdcMode",
          value: "update",
        });
      },
    });
  // policy ids search table modal
  const {
    Modal: ModalSearchPdcIDs,
    closeModal: closeModalSearchPdcIDs,
    openModal: openModalSearchPdcIDs,
    isLoading: isLoadingModalSearchPdcIDs,
  } = useUpwardTableModal({
    myAxios,
    user,
    link: {
      url: "/task/accounting/search-pdc-policy-id",
      queryUrlName: "searchPdcPolicyIds",
    },
    column: [
      { field: "Type", headerName: "Type", width: 130 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      { field: "chassis", headerName: "Chassis No.", width: 200, hide: true },
      {
        field: "Name",
        headerName: "Name",
        width: 350,
      },
      {
        field: "ID",
        headerName: "ID",
        width: 300,
        hide: true,
      },
      {
        field: "client_id",
        headerName: "client_id",
        width: 200,
        hide: true,
      },
    ],
    onSelectionChange: (selectedRow: any) => {
      if (selectedRow.length > 0) {
        dispatch({
          type: "UPDATE_FIELD",
          field: "PNo",
          value: selectedRow[0].IDNo,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "IDNo",
          value: selectedRow[0].client_id,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Name",
          value: selectedRow[0].Name ?? "",
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Remarks",
          value: selectedRow[0].remarks ?? "",
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "sub_account",
          value: selectedRow[0].sub_account,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Acronym",
          value: selectedRow[0].Acronym,
        });

        closeModalSearchPdcIDs();
        if (pdcDataRows.length <= 0) {
          setTimeout(() => {
            addRefButton.current?.click();
          }, 100);
        }
      }
    },

    responseDataKey: "clientsId",
  });
  // bank search table modal
  const {
    Modal: ModalSearchBanks,
    closeModal: closeModalSearchBanks,
    openModal: openModalSearchBanks,
    isLoading: isLoadingModalSearchbanks,
  } = useUpwardTableModal({
    myAxios,
    user,
    link: {
      url: "/task/accounting/search-pdc-banks",
      queryUrlName: "searchPdcBanks",
    },
    column: [
      { field: "Bank_Code", headerName: "Code", width: 100 },
      { field: "Bank", headerName: "Bank Name", width: 350 },
    ],
    onSelectionChange: (selectedRow: any) => {
      if (selectedRow.length > 0) {
        dispatchModalPdcCheck({
          type: "UPDATE_FIELD",
          field: "BankName",
          value: selectedRow[0].Bank,
        });

        dispatchModalPdcCheck({
          type: "UPDATE_FIELD",
          field: "BankCode",
          value: selectedRow[0].Bank_Code,
        });
        closeModalSearchBanks();
        setOpenPdcInputModal(true);
        setTimeout(() => {
          checkBranchRef.current?.focus();
        }, 100);
      }
    },
    onModalClose: () => {
      setTimeout(() => {
        setOpenPdcInputModal(true);
      }, 100);
    },
    responseDataKey: "pdcBanks",
  });
  // pdc search table modal
  const {
    Modal: UpwardPDCModal,
    closeModal: closeUpwardPDCModal,
    openModal: openUpwardPDCModal,
    isLoading: isLoadingModalSearchPDC,
  } = useUpwardTableModal({
    myAxios,
    user,
    column: [
      { field: "Date", headerName: "Date Received", width: 90 },
      { field: "Ref_No", headerName: "Ref No.", width: 80 },
      {
        field: "Name",
        headerName: "Name",
        width: 320,
      },
    ],
    link: {
      url: "/task/accounting/search-pdc",
      queryUrlName: "searchPDCInput",
    },
    onSelectionChange: (selectedRow: any) => {
      if (selectedRow.length > 0) {
        mutateSelectedSearch({ ref_no: selectedRow[0].Ref_No });
        closeUpwardPDCModal();
        if (searchRef.current) {
          searchRef.current?.focus();
        }
      }
    },
    responseDataKey: "searchPDC",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleModalInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatchModalPdcCheck({ type: "UPDATE_FIELD", field: name, value });
  };
  async function handleOnSave(e: any) {
    if (state.PNo === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide loan information!",
        timer: 1500,
      }).then(() => {
        setTimeout(() => {
          openIdsButtonRef.current?.click();
        }, 350);
      });
    }
    if (pdcDataRows.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide entry!",
        timer: 1500,
      }).then(() => {
        setOpenPdcInputModal(true);
      });
    }
    if (state.PNo.length >= 45) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Pno is too long!",
        timer: 1500,
      });
    }
    if (state.Remarks.length >= 220) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Remarks is too long!",
        timer: 1500,
      });
    }
    const filePromises: Array<any> = [];
    function fileTransfer(filePromises: Array<any>) {
      const files = selectedFiles;
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          filePromises.push(
            new Promise((resolve, reject) => {
              reader.onload = function (event) {
                resolve({
                  datakey: "pdc_file",
                  fileName: file.name,
                  fileContent: event.target?.result,
                  fileType: file.type,
                  file,
                });
              };
              reader.onerror = function (event) {
                reject(new Error("Error reading file: " + file.name));
              };
              reader.readAsDataURL(file);
            })
          );
        }
      }
    }
    fileTransfer(filePromises);
    const fileToSave = await Promise.all(filePromises);
    const stateSubmited = {
      Ref_No: state.Ref_No,
      PNo: state.PNo,
      IDNo: state.IDNo,
      Date: state.Date,
      Name: state.Name,
      Remarks: state.Remarks,
      BankCode: state.BankCode,
      checks: JSON.stringify(pdcDataRows),
    };
    if (state.pdcMode === "update") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutate({ ...stateSubmited, userCodeConfirmation, fileToSave });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutate({ ...stateSubmited, fileToSave });
        },
      });
    }
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;
    const files = Array.from(fileList);
    const newFiles = [...selectedFiles, ...files];
    setIsDragging(false);
    if (checkFile(newFiles)) {
      fileInputRef.current?.click();
      return alert("file is not valid Extention!");
    } else {
      setSelectedFiles(newFiles);
    }
  };
  const clickPDCReceipt = () => {
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(pdcDataRows));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "pdc");
      localStorage.setItem("state", JSON.stringify(state));
      localStorage.setItem(
        "column",
        JSON.stringify([
          { datakey: "Check_No", header: "CHECK NO", width: "80px" },
          { datakey: "Check_Date", header: "DATE", width: "130px" },
          { datakey: "BankName", header: "BANK", width: "240px" },
          { datakey: "Check_Amnt", header: "AMOUNT", width: "70px" },
          { datakey: "SEQ", header: "SEQ", width: "30px" },
        ])
      );

      localStorage.setItem(
        "title",
        user?.department === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES\n Post Date Checks Receipt"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n Post Date Checks Receipt"
      );
    });
    window.open("/dashboard/print", "_blank");
  };
  const clickPDCLabeling = () => {
    let printString = () => {
      return (
        <div>
          <p
            style={{
              color: "#d1d5db",
              fontSize: "11px",
              textAlign: "center",
              padding: 0,
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            UCSMI
          </p>
          <p
            style={{
              color: "#d1d5db",
              fontSize: "11px",
              textAlign: "center",
              padding: 0,
              margin: 0,
            }}
          >
            {state.Name}
          </p>
          <p
            style={{
              color: "#d1d5db",
              fontSize: "11px",
              textAlign: "center",
              padding: 0,
              margin: 0,
            }}
          >
            {state.IDNo}
          </p>
          <p
            style={{
              color: "#d1d5db",
              fontSize: "11px",
              textAlign: "center",
              padding: 0,
              margin: "20px",
            }}
          >
            {state.Ref_No}
          </p>
        </div>
      );
    };

    flushSync(() => {
      const elementString = ReactDOMServer.renderToString(printString());
      localStorage.setItem("printString", elementString);
      localStorage.removeItem("dataString");
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
    });
    window.open("/dashboard/print", "_blank");
  };
  const onSelectionChange = (selectedRow: any) => {
    if (selectedRow.length > 0) {
      const rowSelected = selectedRow[0];

      dispatch({
        type: "UPDATE_FIELD",
        field: "checkMode",
        value: "update",
      });
      setNewStateValue(dispatchModalPdcCheck, rowSelected);
      flushSync(() => {
        setOpenPdcInputModal(true);
      });
      checkModalSaveButtonActionRef.current?.focusVisible();
    } else {
      dispatch({
        type: "UPDATE_FIELD",
        field: "checkMode",
        value: "",
      });
    }
  };
  const isDisableField = state.pdcMode === "";
  const width = window.innerWidth - 50;
  const height = window.innerHeight - 145;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        background: "red",
        padding: "10px",
        backgroundColor: "#F8F8FF",
      }}
    >
      {UpwardPDCModal}
      {ModalSearchPdcIDs}
      {ModalSearchBanks}
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          columnGap: "20px",
          [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "flex-start",
            flex: 1,
            marginBottom: "15px",
          },
        })}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            marginBottom: "15px",
          }}
        >
          {isLoadingModalSearchPDC ? (
            <LoadingButton loading={isLoadingModalSearchPDC} />
          ) : (
            <TextField
              label="Search"
              size="small"
              name="search"
              value={state.search}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  openUpwardPDCModal((e.target as HTMLInputElement).value);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const datagridview = document.querySelector(
                    `.grid-container`
                  ) as HTMLDivElement;
                  datagridview.focus();
                }
              }}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                inputRef: searchRef,
                className: "manok",
              }}
              sx={{
                width: "400px",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          )}
          {state.pdcMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              color="primary"
              onClick={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "pdcMode",
                  value: "add",
                });
              }}
            >
              New
            </Button>
          )}
          <LoadingButton
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            ref={savePDCButtonRef}
            id="save-entry-header"
            color="success"
            variant="contained"
            type="submit"
            onClick={handleOnSave}
            disabled={state.pdcMode === ""}
            loading={loadingAddNew}
            startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
          >
            Save
          </LoadingButton>
          {(state.pdcMode === "add" || state.pdcMode === "update") && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
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
                    initialState.Sub_Ref_No = state.Sub_Ref_No;
                    initialState.Ref_No = state.Sub_Ref_No;
                    setNewStateValue(dispatch, initialState);
                    setPdcDataRows([]);
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "pdcMode",
                      value: "",
                    });
                  }
                });
              }}
              color="error"
            >
              Cancel
            </Button>
          )}
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            disabled={state.pdcMode === ""}
            variant="contained"
            startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
            onClick={() => {
              const getLastCheck_No: any = pdcDataRows[pdcDataRows.length - 1];
              modalPdcCheckInititalState.Check_No = incrementCheckNo(
                getLastCheck_No?.Check_No
              );
              setNewStateValue(
                dispatchModalPdcCheck,
                modalPdcCheckInititalState
              );
              dispatch({
                type: "UPDATE_FIELD",
                field: "checkMode",
                value: "",
              });
              flushSync(() => {
                setOpenPdcInputModal(true);
              });

              if (state.checkMode !== "update") {
                checkNoRef.current?.focus();
              }
            }}
            ref={addRefButton}
          >
            Add Check
          </Button>
          <div>
            <Button
              disabled={state.pdcMode !== "update"}
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              sx={{
                height: "30px",
                fontSize: "11px",
                color: "white",
                backgroundColor: grey[600],
                "&:hover": {
                  backgroundColor: grey[700],
                },
              }}
            >
              Print
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={clickPDCReceipt}>PDC Receipt</MenuItem>
              <MenuItem onClick={clickPDCLabeling}>PDC Labeling</MenuItem>
            </Menu>
          </div>
        </div>
      </Box>
      <form
        onKeyDown={(e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault();
            return;
          }
        }}
        style={{
          marginBottom: "20px",
        }}
      >
        <Box
          sx={(theme) => ({
            display: "flex",
            columnGap: "15px",
            flexDirection: "row",
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
              rowGap: "10px",
            },
          })}
        >
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              width: "100%",
            }}
          >
            <fieldset
              style={
                {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "15px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                } as any
              }
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                {newRefNumberLoading ? (
                  <LoadingButton loading={newRefNumberLoading} />
                ) : (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={isDisableField}
                    sx={{
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  >
                    <InputLabel htmlFor="pdc-id-field">
                      Reference No.
                    </InputLabel>
                    <OutlinedInput
                      readOnly={user?.department !== "UCSMI"}
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                        fieldset: { borderColor: "black" },
                      }}
                      disabled={isDisableField}
                      label="Reference No."
                      name="Ref_No"
                      value={state.Ref_No}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          return savePDCButtonRef.current?.click();
                        }
                      }}
                      id="pdc-id-field"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            disabled={isDisableField}
                            aria-label="search-client"
                            color="secondary"
                            edge="end"
                          >
                            <RestartAltIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                )}
                <CustomDatePicker
                  fullWidth={true}
                  disabled={isDisableField}
                  label="Date Received"
                  onChange={(value: any) => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "Date",
                      value: value,
                    });
                  }}
                  value={new Date(state.Date)}
                  onKeyDown={(e: any) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      savePDCButtonRef.current?.click();
                    }
                  }}
                  textField={{
                    InputLabelProps: {
                      style: {
                        fontSize: "14px",
                      },
                    },
                    InputProps: {
                      style: { height: "27px", fontSize: "14px" },
                    },
                  }}
                />
              </div>
              <TextField
                InputLabelProps={{
                  sx: {
                    color: "black",
                  },
                }}
                variant="outlined"
                size="small"
                label="Remarks"
                name="Remarks"
                value={state.Remarks}
                onChange={handleInputChange}
                disabled={isDisableField}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    savePDCButtonRef.current?.click();
                  }
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  fieldset: { borderColor: "black" },
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </fieldset>
            <fieldset
              style={
                {
                  flex: 1,
                  display: "flex",
                  gap: "10px",
                  padding: "15px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  flexDirection: "column",
                } as any
              }
            >
              <div
                style={{ width: "100%", flex: 1, display: "flex", gap: "10px" }}
              >
                {isLoadingModalSearchPdcIDs ? (
                  <LoadingButton loading={isLoadingModalSearchPdcIDs} />
                ) : (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={isDisableField}
                    sx={{
                      flex: 1,
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  >
                    <InputLabel htmlFor="label-input-id">
                      PN/Client ID
                    </InputLabel>
                    <OutlinedInput
                      sx={{
                        fieldset: { borderColor: "black" },

                        height: "27px",
                        fontSize: "14px",
                      }}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          openIdsButtonRef.current?.click();
                        }
                      }}
                      name="PNo"
                      value={state.PNo}
                      onChange={handleInputChange}
                      id="label-input-id"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            ref={openIdsButtonRef}
                            disabled={isDisableField}
                            aria-label="search-client"
                            color="secondary"
                            edge="end"
                            onClick={() => openModalSearchPdcIDs(state.PNo)}
                          >
                            <PersonSearchIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                      label="PN/Client ID"
                    />
                  </FormControl>
                )}
                <TextField
                  InputLabelProps={{
                    sx: {
                      color: "black",
                    },
                  }}
                  variant="outlined"
                  size="small"
                  label="Branch"
                  name="Acronym"
                  value={state.Acronym}
                  onChange={handleInputChange}
                  disabled={isDisableField}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      savePDCButtonRef.current?.click();
                    }
                  }}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    readOnly: true,
                  }}
                  sx={{
                    fieldset: { borderColor: "black" },
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
              </div>
              <div
                style={{ width: "100%", display: "flex", columnGap: "10px" }}
              >
                <TextField
                  InputLabelProps={{
                    sx: {
                      color: "black",
                    },
                  }}
                  variant="outlined"
                  size="small"
                  label="Clients Name"
                  name="Name"
                  value={state.Name}
                  onChange={handleInputChange}
                  disabled={isDisableField}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      savePDCButtonRef.current?.click();
                    }
                  }}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    readOnly: true,
                  }}
                  sx={{
                    fieldset: { borderColor: "black" },
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
                <Button
                  sx={{
                    height: "27px",
                    fontSize: "11px",
                  }}
                  disabled={state.pdcMode === ""}
                  variant="contained"
                  startIcon={<DownloadIcon sx={{ width: 15, height: 15 }} />}
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  Upload Check
                </Button>
              </div>
            </fieldset>
          </Box>
        </Box>
      </form>
      <UpwardTable
        isLoading={isLoadingSelectedSearch}
        ref={tableRef}
        rows={pdcDataRows}
        column={pdcColumn}
        width={width}
        height={height}
        dataReadOnly={true}
        onSelectionChange={onSelectionChange}
        onKeyDown={(row, key) => {
          if (key === "Delete" || key === "Backspace") {
            const rowSelected = row[0];
            if (
              (rowSelected.Deposit_Slip && rowSelected.Deposit_Slip !== "") ||
              (rowSelected.DateDeposit && rowSelected.DateDeposit !== "") ||
              (rowSelected.OR_No && rowSelected.OR_No !== "")
            ) {
              return Swal.fire({
                position: "center",
                icon: "warning",
                title: `Unable to delete. Check No ${rowSelected.Check_No} is already ${rowSelected.OR_No} issued of OR!`,
                showConfirmButton: false,
                timer: 1500,
              });
            }
            const timeout = setTimeout(() => {
              Swal.fire({
                title: "Are you sure?",
                text: `You won't to delete this Check No. ${rowSelected.Check_No}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  return setPdcDataRows((dt) => {
                    return dt.filter(
                      (item: any) => item.CheckIdx !== rowSelected.CheckIdx
                    );
                  });
                }
                table.current?.removeSelection();
              });
              clearTimeout(timeout);
            }, 250);
          }
        }}
        inputsearchselector=".manok"
      />

      <Modal
        open={openPdcInputModal}
        onClose={() => {
          table.current?.removeSelection();
          setOpenPdcInputModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
            bgcolor: "background.paper",
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Check Detail
          </Typography>
          <br />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                label="Check No."
                name="Check_No"
                value={stateModalPdcCheck.Check_No}
                onChange={handleModalInputChange}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      checkModalSaveButton.current?.click();
                      clearTimeout(timeout);
                    }, 100);
                  }
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputRef: checkNoRef,
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              {isLoadingModalSearchbanks ? (
                <LoadingButton loading={isLoadingModalSearchbanks} />
              ) : (
                <FormControl
                  sx={{
                    width: "100%",
                    ".MuiFormLabel-root": {
                      fontSize: "14px",
                      background: "white",
                      zIndex: 99,
                      padding: "0 3px",
                    },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                >
                  <InputLabel htmlFor="label-input-id">Bank</InputLabel>
                  <OutlinedInput
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    inputRef={checkBankRef}
                    fullWidth
                    label="Bank"
                    name="BankName"
                    value={stateModalPdcCheck.BankName}
                    onChange={handleModalInputChange}
                    id="label-input-id"
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        setOpenPdcInputModal(false);

                        return openModalSearchBanks(
                          stateModalPdcCheck.BankName
                        );
                      }
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="search-client"
                          color="secondary"
                          edge="end"
                          onClick={() => {
                            setOpenPdcInputModal(false);

                            openModalSearchBanks(stateModalPdcCheck.BankName);
                          }}
                        >
                          <PolicyIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
              <TextField
                variant="outlined"
                size="small"
                label="Branch"
                name="Branch"
                value={stateModalPdcCheck.Branch}
                onChange={handleModalInputChange}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      checkModalSaveButton.current?.click();
                      clearTimeout(timeout);
                    }, 100);
                  }
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputRef: checkBranchRef,
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                variant="outlined"
                size="small"
                label="Remarks"
                name="Check_Remarks"
                value={stateModalPdcCheck.Check_Remarks}
                onChange={handleModalInputChange}
                rows={4}
                multiline
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      checkModalSaveButton.current?.click();
                      clearTimeout(timeout);
                    }, 100);
                  }
                }}
                InputProps={{
                  style: { height: "auto", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "auto",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "column",
              }}
            >
              <CustomDatePicker
                label="Check Dated"
                onChange={(value: any) => {
                  dispatchModalPdcCheck({
                    type: "UPDATE_FIELD",
                    field: "Check_Date",
                    value: value,
                  });
                }}
                value={new Date(stateModalPdcCheck.Check_Date)}
                inputRef={checkDateRef}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      checkModalSaveButton.current?.click();
                      clearTimeout(timeout);
                    }, 100);
                  }
                }}
                textField={{
                  InputLabelProps: {
                    style: {
                      fontSize: "14px",
                    },
                  },
                  InputProps: {
                    style: { height: "27px", fontSize: "14px" },
                  },
                }}
              />
              <TextField
                variant="outlined"
                size="small"
                label="Amount"
                name="Check_Amnt"
                value={stateModalPdcCheck.Check_Amnt}
                onChange={handleModalInputChange}
                placeholder="0.00"
                onBlur={() => {
                  dispatchModalPdcCheck({
                    type: "UPDATE_FIELD",
                    field: "Check_Amnt",
                    value: parseFloat(
                      stateModalPdcCheck.Check_Amnt.replace(/,/g, "")
                    ).toFixed(2),
                  });
                }}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      checkModalSaveButton.current?.click();
                      clearTimeout(timeout);
                    }, 100);
                  }
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                  inputRef: checkAmountRef,
                }}
                sx={{
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              {state.checkMode !== "update" && (
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  label="Check Count"
                  name="Check_Count"
                  value={stateModalPdcCheck.Check_Count}
                  onChange={handleModalInputChange}
                  placeholder="0"
                  onKeyDown={(e: any) => {
                    const validCode = ["Enter", "NumpadEnter"];
                    if (validCode.includes(e.code)) {
                      const timeout = setTimeout(() => {
                        checkModalSaveButton.current?.click();
                        clearTimeout(timeout);
                      }, 100);
                    }
                  }}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputProps: {
                      min: 1,
                      type: "text",
                      pattern: "[0-9]*",
                    },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginTop: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                ref={checkModalSaveButton}
                action={checkModalSaveButtonActionRef}
                color="primary"
                variant="contained"
                autoFocus={state.checkMode !== ""}
                onClick={() => {
                  if (state.checkMode === "update") {
                    flushSync(() => {
                      setOpenPdcInputModal(false);
                    });
                    return Swal.fire({
                      title: "Are you sure?",
                      text: `Update Check ${stateModalPdcCheck.Check_No}`,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Yes, update it!",
                    }).then((result) => {
                      if (!result.isConfirmed) {
                        table.current?.removeSelection();
                        setOpenPdcInputModal(false);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "checkMode",
                          value: "",
                        });
                        return;
                      }
                      modalCheckAddUpdate();
                    });
                  }
                  modalCheckAddUpdate();

                  function modalCheckAddUpdate() {
                    if (
                      state.checkMode !== "update" &&
                      pdcDataRows
                        .map((item: any) => item.Check_No)
                        .includes(stateModalPdcCheck.Check_No)
                    ) {
                      setOpenPdcInputModal(false);
                      return Swal.fire({
                        text: "Check is already exist!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                        checkNoRef.current?.focus();
                      });
                    }

                    if (stateModalPdcCheck.Check_No === "") {
                      setOpenPdcInputModal(false);
                      return Swal.fire({
                        text: "Please provide check!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                        checkNoRef.current?.focus();
                      });
                    }
                    if (
                      parseInt(stateModalPdcCheck.Check_Amnt) <= 0 ||
                      isNaN(parseInt(stateModalPdcCheck.Check_Amnt))
                    ) {
                      setOpenPdcInputModal(false);
                      return Swal.fire({
                        text: "Please provide check amount!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                        checkAmountRef.current?.focus();
                      });
                    }
                    if (stateModalPdcCheck.BankName === "") {
                      setOpenPdcInputModal(false);
                      return Swal.fire({
                        text: "Please provide bank!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                        checkBankRef.current?.focus();
                      });
                    }
                    if (stateModalPdcCheck.Branch === "") {
                      setOpenPdcInputModal(false);
                      return Swal.fire({
                        text: "Please provide branch!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                        checkBranchRef.current?.focus();
                      });
                    }
                    if (stateModalPdcCheck.Check_No.length >= 40) {
                      return Swal.fire({
                        text: "Check No is too long!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                      });
                    }
                    if (stateModalPdcCheck.Check_Amnt.length >= 200) {
                      return Swal.fire({
                        text: "Check Amount is too long!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                      });
                    }
                    if (stateModalPdcCheck.Branch.length >= 45) {
                      return Swal.fire({
                        text: "Branch is too long!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                      });
                    }

                    if (stateModalPdcCheck.Check_Remarks.length >= 220) {
                      return Swal.fire({
                        text: "Remarks is too long!",
                        icon: "warning",
                        showCancelButton: false,
                        timer: 1500,
                      }).then(() => {
                        flushSync(() => {
                          setOpenPdcInputModal(true);
                        });
                      });
                    }

                    stateModalPdcCheck.Check_Amnt = parseFloat(
                      stateModalPdcCheck.Check_Amnt.toString().replace(/,/g, "")
                    ).toLocaleString("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });

                    stateModalPdcCheck.Check_Date = new Date(
                      stateModalPdcCheck.Check_Date
                    ).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    });
                    const checkContainer: any = [];
                    if (
                      !isNaN(parseInt(stateModalPdcCheck.Check_Count)) &&
                      parseInt(stateModalPdcCheck.Check_Count) > 0 &&
                      state.checkMode !== "update"
                    ) {
                      for (
                        let i = 0;
                        i < parseInt(stateModalPdcCheck.Check_Count);
                        i++
                      ) {
                        let CheckIdx = (
                          pdcDataRows.length > 0
                            ? parseInt(
                              (pdcDataRows[pdcDataRows.length - 1] as any)
                                .CheckIdx
                            ) +
                            (i + 1)
                            : i
                        ).toString();

                        const currentDate = new Date(
                          stateModalPdcCheck.Check_Date
                        );
                        currentDate.setMonth(currentDate.getMonth() + i);
                        const data: any = {
                          CheckIdx,
                          Check_No: incrementStringNumbers(
                            stateModalPdcCheck.Check_No,
                            i
                          ),
                          Check_Date: currentDate.toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          }),
                          Check_Amnt: stateModalPdcCheck.Check_Amnt,
                          BankName: stateModalPdcCheck.BankName,
                          BankCode: stateModalPdcCheck.BankCode,
                          Branch: stateModalPdcCheck.Branch,
                          Check_Remarks: stateModalPdcCheck.Check_Remarks,
                          Deposit_Slip: stateModalPdcCheck.Deposit_Slip,
                          DateDeposit: stateModalPdcCheck.DateDeposit,
                          OR_No: stateModalPdcCheck.OR_No,
                        };

                        if (
                          state.checkMode !== "update" &&
                          pdcDataRows
                            .map((item: any) => item.Check_No)
                            .includes(data.Check_No)
                        ) {
                          setOpenPdcInputModal(false);
                          return Swal.fire({
                            text: "Check is already exist!",
                            icon: "warning",
                            showCancelButton: false,
                            timer: 1500,
                          }).then(() => {
                            flushSync(() => {
                              setOpenPdcInputModal(true);
                            });
                            checkNoRef.current?.focus();
                          });
                        }

                        checkContainer.push(data);
                      }
                      setPdcDataRows((d: any) => {
                        d = [...d, ...checkContainer];
                        return d;
                      });
                      flushSync(() => {
                        setOpenPdcInputModal(false);
                      });
                      Swal.fire({
                        text: "Create New Check Successfully",
                        icon: "success",
                        showCancelButton: false,
                        timer: 1500,
                      });

                      return;
                    }

                    function incrementStringNumbers(
                      str: string,
                      increment: number
                    ) {
                      let num = parseInt(str);
                      num = num + increment;
                      return num.toString().padStart(str.length, "0");
                    }

                    setPdcDataRows((dt: any) => {
                      let CheckIdx = "";
                      if (dt.length <= 0) {
                        CheckIdx = "0";
                      } else if (state.checkMode === "update") {
                        CheckIdx = stateModalPdcCheck.CheckIdx;
                      } else {
                        CheckIdx = (
                          parseInt(dt[dt.length - 1].CheckIdx) + 1
                        ).toString();
                      }
                      dispatchModalPdcCheck({
                        type: "UPDATE_FIELD",
                        field: "CheckIdx",
                        value: CheckIdx,
                      });

                      const data: any = {
                        Check_No: stateModalPdcCheck.Check_No,
                        Check_Date: stateModalPdcCheck.Check_Date,
                        Check_Amnt: stateModalPdcCheck.Check_Amnt,
                        BankName: stateModalPdcCheck.BankName,
                        BankCode: stateModalPdcCheck.BankCode,
                        Branch: stateModalPdcCheck.Branch,
                        Check_Remarks: stateModalPdcCheck.Check_Remarks,
                        Deposit_Slip: stateModalPdcCheck.Deposit_Slip,
                        DateDeposit: stateModalPdcCheck.DateDeposit,
                        OR_No: stateModalPdcCheck.OR_No,
                      };
                      if (state.checkMode === "update") {
                        dt = dt.map((items: any) => {
                          if (items.CheckIdx === CheckIdx) {
                            items = { ...items, ...data };
                          }
                          return items;
                        });
                      } else {
                        dt = [...dt, { CheckIdx, ...data }];
                      }
                      return dt;
                    });

                    setOpenPdcInputModal(false);

                    Swal.fire({
                      text:
                        state.checkMode === "update"
                          ? "Check Update Successfully"
                          : "Create New Check Successfully",
                      icon: "success",
                      showCancelButton: false,
                      timer: 1500,
                    }).then(() => {
                      if (state.checkMode !== "update") {
                        var currentDate = new Date(
                          stateModalPdcCheck.Check_Date
                        );
                        currentDate.setMonth(currentDate.getMonth() + 1);

                        dispatchModalPdcCheck({
                          type: "UPDATE_FIELD",
                          field: "Check_Date",
                          value: currentDate,
                        });
                      }
                      dispatchModalPdcCheck({
                        type: "UPDATE_FIELD",
                        field: "Check_Amnt",
                        value: parseFloat(
                          stateModalPdcCheck.Check_Amnt.replace(/,/g, "")
                        ),
                      });
                      dispatchModalPdcCheck({
                        type: "UPDATE_FIELD",
                        field: "Check_No",
                        value:
                          state.checkMode === "update"
                            ? stateModalPdcCheck.Check_No
                            : incrementCheckNo(stateModalPdcCheck.Check_No),
                      });
                      dispatchModalPdcCheck({
                        type: "UPDATE_FIELD",
                        field: "checkMode",
                        value: "",
                      });
                      flushSync(() => {
                        setOpenPdcInputModal(true);
                      });
                      checkModalSaveButtonActionRef.current.focusVisible();
                    });
                  }
                }}
              >
                {state.checkMode === "update" ? "Update" : "Save"}
              </Button>
              {state.checkMode === "update" && (
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => {
                    flushSync(() => {
                      setOpenPdcInputModal(false);
                    });
                    Swal.fire({
                      title: "Are you sure?",
                      text: `Delete Check ${stateModalPdcCheck.Check_No} `,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Yes, delete it!",
                    }).then((result) => {
                      if (!result.isConfirmed) {
                        table.current?.removeSelection();
                        setOpenPdcInputModal(false);
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "checkMode",
                          value: "",
                        });
                        return;
                      }

                      setPdcDataRows((dt) => {
                        dt = dt.filter(
                          (items: any) =>
                            items.CheckIdx !== stateModalPdcCheck.CheckIdx
                        );
                        return dt;
                      });
                      dataGridFunctions.current?.removeSelection();
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "checkMode",
                        value: "",
                      });
                    });
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  table.current?.removeSelection();
                  setOpenPdcInputModal(false);
                  setNewStateValue(
                    dispatchModalPdcCheck,
                    modalPdcCheckInititalState
                  );
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "checkMode",
                    value: "",
                  });
                }}
              >
                Cancel
              </Button>
              <IconButton
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                }}
                aria-label="search-client"
                onClick={() => {
                  table.current?.removeSelection();
                  setOpenPdcInputModal(false);
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "checkMode",
                    value: "",
                  });
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </Box>
      </Modal>
      <div
        style={{
          display: showModal ? "flex" : "none",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(158, 155, 157, 0.31)",
          zIndex: "999",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            height: "90%",
          }}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              overflow: "auto",
              background: "white",
              padding: "20px",
              margin: "auto",
              zIndex: "9929",
              boxShadow: " -1px 1px 13px 6px rgba(0,0,0,0.54)",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: "5px",
                  top: "5px",
                }}
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <CloseIcon />
              </IconButton>
              <div
                style={{
                  width: "100%",
                  height: "500px",
                  border: isDragging ? "5px dashed green" : "5px dashed grey",
                  overflow: "auto",
                  padding: "10px",
                }}
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  id="upload-container"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                  onDragEnter={handleDragEnter}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedFiles.map((itm, idx) => {
                    return (
                      <DisplayFile
                        key={idx}
                        itm={itm}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        fileInput={fileInputRef}
                      />
                    );
                  })}
                </div>
                {selectedFiles.length <= 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      textAlign: "center",
                    }}
                  >
                    <DriveFolderUploadIcon
                      sx={{ fontSize: "20em", color: "#64748b" }}
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: "none", background: "white" }}
                  id="input-file"
                  onChange={(e) => {
                    const fileList = e.target.files as FileList;
                    const files = Array.from(fileList);
                    const newFiles = [...selectedFiles, ...files];
                    if (checkFile(newFiles)) {
                      return alert("file is not valid Extention!");
                    }
                    setSelectedFiles(newFiles);
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                }}
              >
                <Button
                  fullWidth
                  onClick={() => {
                    const inputFile = document.getElementById("input-file");
                    inputFile?.click();
                  }}
                >
                  CLick it to upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loadingAddNew ||
        isLoadingSelectedSearch && <div className="loading-component"><div className="loader"></div></div>}

    </div>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
export function incrementCheckNo(Check_No: string) {
  if (Check_No === undefined || Check_No === null || Check_No === "") {
    return "001";
  }

  let incrementedNumber = (parseInt(Check_No) + 1).toString();
  while (incrementedNumber.length < Check_No.length) {
    incrementedNumber = "0" + incrementedNumber;
  }
  return incrementedNumber;
}
