import React, { useContext, useState, useRef, useReducer, useEffect, useCallback } from "react";
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
import { TextAreaInput, TextInput } from "../../../../components/UpwardFields";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";
import PageHelmet from "../../../../components/Helmet";

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
  const searchRef = useRef<HTMLInputElement>(null);

  // pdc form save button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savePDCButtonRef = useRef<HTMLButtonElement>(null);
  const openIdsButtonRef = useRef<HTMLButtonElement>(null);


  //check modal refs

  const checkModalSaveButton = useRef<HTMLButtonElement>(null);
  const checkModalSaveButtonActionRef = useRef<any>(null);
  // search modal auto focus on load


  // modal 
  const _checknoRef = useRef<HTMLInputElement>(null);
  const _bankRef = useRef<HTMLInputElement>(null);
  const _branchRef = useRef<HTMLInputElement>(null);
  const _remarksRef = useRef<HTMLTextAreaElement>(null);
  const _chekdateRef = useRef<HTMLInputElement>(null);
  const _amountRef = useRef<HTMLInputElement>(null);
  const _checkcountRef = useRef<HTMLInputElement>(null);
  const _bankCode = useRef('');
  const _slipCodeRef = useRef('');
  const _slipDateRef = useRef('');
  const _checkOR = useRef('');


  const addRefButton = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const dateRef = useRef<HTMLButtonElement>(null);
  const remakrsRef = useRef<HTMLButtonElement>(null);
  const pnRef = useRef<HTMLButtonElement>(null);
  const branchRef = useRef<HTMLButtonElement>(null);
  const clientnameRef = useRef<HTMLButtonElement>(null);


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
        setTimeout(() => {
          _bankCode.current = selectedRow[0].Bank_Code
          if (_bankRef.current) {
            _bankRef.current.value = selectedRow[0].Bank
          }
        }, 100)

        closeModalSearchBanks();
        setOpenPdcInputModal(true);
        setTimeout(() => {
          _branchRef.current?.focus()
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
  // async function handleOnSave(e: any) {

  // }

  const handleOnSave = useCallback(async (e: any) => {
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
  }, [state, mutate, pdcDataRows, selectedFiles])
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
      setTimeout(() => {
        if (
          _checknoRef.current &&
          _bankRef.current &&
          _branchRef.current &&
          _remarksRef.current &&
          _chekdateRef.current &&
          _amountRef.current &&
          _checkcountRef.current
        ) {
          _checknoRef.current.value = rowSelected.Check_No
          _bankRef.current.value = rowSelected.BankName
          _branchRef.current.value = rowSelected.Branch
          _remarksRef.current.value = rowSelected.Check_Remarks
          _chekdateRef.current.value = rowSelected.Check_Date
          _amountRef.current.value = formatNumber(parseFloat(rowSelected.Check_Amnt.replace(/,/g, '')))
          _checkcountRef.current.value = '0'
          _bankCode.current = rowSelected.BankCode
          _slipCodeRef.current = rowSelected.Deposit_Slip
          _slipDateRef.current = rowSelected.DateDeposit
          _checkOR.current = rowSelected.Ref_No
        }
      }, 100)



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
  function formatNumber(num: number) {
    return (num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  function handleCheckDetailsSave() {
    function incrementStringNumbers(
      str: string,
      increment: number
    ) {
      let num = parseInt(str);
      num = num + increment;
      return num.toString().padStart(str.length, "0");
    }
    function incrementDate(dateString: any, i: number) {
      const currentDate = new Date(
        dateString
      );
      currentDate.setMonth(currentDate.getMonth() + i);

      return format(currentDate, 'yyyy-MM-dd')
    }
    function isValidDate(dateString: string): boolean {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    }

    if (
      _checknoRef.current &&
      _bankRef.current &&
      _branchRef.current &&
      _remarksRef.current &&
      _chekdateRef.current &&
      _amountRef.current &&
      _checkcountRef.current
    ) {
      const filteredChecks = pdcDataRows.filter((itm: any) => {
        return _checknoRef.current && _checknoRef.current.value === itm.Check_No
      })
      if (filteredChecks.length > 0) {
        alert('check no. is already exist!')
        _checknoRef.current.focus()
        return
      }
      if (_checknoRef.current.value === '') {
        alert('check no. is required!')
        _checknoRef.current.focus()
        return
      } else if (_bankRef.current.value === '') {
        alert('bank is required!')
        _bankRef.current.focus()
        return
      } else if (_branchRef.current.value === '') {
        alert('branch is required!')
        _branchRef.current.focus()
        return
      } else if (!isValidDate(_chekdateRef.current.value)) {
        alert('invalid date!')
        _chekdateRef.current.focus()
        return
      } else if (parseFloat(_amountRef.current.value.replace(/,/g, '')) <= 0) {
        alert('amount must be greater than 0!')
        _amountRef.current.focus()
        return
      }


      setPdcDataRows((d: any) => {
        if (
          _checknoRef.current &&
          _bankRef.current &&
          _branchRef.current &&
          _remarksRef.current &&
          _chekdateRef.current &&
          _amountRef.current &&
          _checkcountRef.current
        ) {
          const selectedIndex = tableRef.current.getSelectedIndex()

          if (selectedIndex !== null && selectedIndex !== undefined) {
            const newData = d.map((itm: any, idx: number) => {
              if (
                _checknoRef.current &&
                _bankRef.current &&
                _branchRef.current &&
                _remarksRef.current &&
                _chekdateRef.current &&
                _amountRef.current &&
                _checkcountRef.current &&
                idx === selectedIndex
              ) {
                itm = {
                  Check_No: _checknoRef.current.value,
                  Check_Date: _chekdateRef.current.value,
                  Check_Amnt: _amountRef.current.value,
                  BankName: _bankRef.current.value,
                  BankCode: _bankCode.current,
                  Branch: _branchRef.current.value,
                  Check_Remarks: _remarksRef.current.value,
                  Deposit_Slip: _slipCodeRef.current,
                  DateDeposit: _slipDateRef.current,
                  OR_No: _checkOR.current,
                }
              }

              return itm
            })
            return newData
          } else {
            const newData: any = []
            for (
              let i = 0;
              i < parseInt(_checkcountRef.current.value);
              i++
            ) {
              const data: any = {
                Check_No: incrementStringNumbers(
                  _checknoRef.current.value,
                  i
                ),
                Check_Date: incrementDate(_chekdateRef.current.value, i),
                Check_Amnt: _amountRef.current.value,
                BankName: _bankRef.current.value,
                BankCode: _bankCode.current,
                Branch: _branchRef.current.value,
                Check_Remarks: _remarksRef.current.value,
                Deposit_Slip: _slipCodeRef.current,
                DateDeposit: _slipDateRef.current,
                OR_No: _checkOR.current,
              };
              newData.push(data)
            }
            return [...d, ...newData]
          }

        }
        return d
      })

      setOpenPdcInputModal(false);
      focusOnTable()
    }

  }
  function focusOnTable() {
    setTimeout(() => {
      tableRef.current?.resetTableSelected();
      const datagridview = tableRef.current.getParentElement().querySelector(
        `.grid-container .row-0.col-0 input`
      ) as HTMLDivElement;
      setTimeout(() => {
        if (datagridview)
          datagridview.focus();
      }, 100)
    }, 100)
  }

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleOnSave(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOnSave]);


  const isDisableField = state.pdcMode === "";
  const width = window.innerWidth - 50;
  const height = window.innerHeight - 145;


  return (
    <>
      <PageHelmet title="PDC" />
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

        {ModalSearchBanks}
        {UpwardPDCModal}
        {ModalSearchPdcIDs}
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

                _checknoRef.current?.focus();
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
                            dateRef.current?.focus()
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
                    inputRef={dateRef}
                    value={new Date(state.Date)}
                    onKeyDown={(e: any) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        // savePDCButtonRef.current?.click();
                        remakrsRef.current?.focus()
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
                      pnRef.current?.focus()
                    }
                  }}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputRef: remakrsRef
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
                        inputRef={pnRef}
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
                        clientnameRef.current?.focus();
                      }
                    }}
                    InputProps={{
                      style: { height: "27px", fontSize: "14px" },
                      readOnly: true,
                      inputRef: branchRef
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
                      inputRef: clientnameRef
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
                  setTimeout(() => {
                    const selectedIndex = tableRef.current.getSelectedRowsOnClick()
                    setPdcDataRows((dt) => {
                      return dt.filter(
                        (item: any, idx: number) => idx !== selectedIndex
                      );
                    });
                    tableRef.current?.resetTableSelected();
                  }, 100)
                }
              });
            }
          }}
          inputsearchselector=".manok"
        />

        <Modal
          open={openPdcInputModal}
          onClose={() => {
            tableRef.current?.resetTableSelected();
            setOpenPdcInputModal(false);
            focusOnTable()
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
                <TextInput
                  label={{
                    title: "Check No : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "190px" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        _bankRef.current?.focus()
                      }
                    },
                  }}
                  inputRef={_checknoRef}
                />
                {isLoadingModalSearchbanks ? (
                  <LoadingButton loading={isLoadingModalSearchbanks} />
                ) : (
                  <TextInput
                    label={{
                      title: "Bank : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "70px",
                      },
                    }}
                    input={{
                      type: "text",
                      style: { width: "190px" },
                      value: state.refNo,
                      name: "refNo",
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                          return openModalSearchBanks(
                            e.currentTarget.value
                          );
                        }
                      }
                    }}
                    icon={<AccountBalanceIcon sx={{ fontSize: "18px" }} />}
                    onIconClick={(e) => {
                      e.preventDefault()
                      if (_bankRef.current) {
                        openModalSearchBanks(
                          _bankRef.current?.value
                        );
                      }
                    }}
                    inputRef={_bankRef}
                  />
                )}

                <TextInput
                  label={{
                    title: "Branch : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "190px" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        _remarksRef.current?.focus()
                      }
                    },
                  }}
                  inputRef={_branchRef}
                />
                <TextAreaInput
                  label={{
                    title: "Remarks : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  textarea={{
                    rows: 4,
                    disabled: isDisableField,
                    style: { flex: 1 },
                    onKeyDown: (e) => {
                      if (e.key === "Enter" && e.shiftKey) {
                        return
                      }
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        _chekdateRef.current?.focus()
                      }
                    },
                  }}
                  _inputRef={_remarksRef}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                }}
              >

                <TextInput
                  label={{
                    title: "Check Dated : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  input={{
                    disabled: isDisableField,
                    type: "date",
                    style: { width: "190px" },
                    defaultValue: new Date().toISOString().split("T")[0],
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        _amountRef.current?.focus()
                      }
                    },
                  }}
                  inputRef={_chekdateRef}
                />

                <div style={{
                  display: "flex"
                }}>
                  <label style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  }}>Amount :</label>
                  <NumericFormat
                    style={{
                      flex: 1
                    }}
                    value={_amountRef.current?.value ?? ""}
                    getInputRef={_amountRef}
                    allowNegative={false}
                    thousandSeparator
                    valueIsNumericString
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        let currentValue = _amountRef.current?.value as string;
                        let numericValue = parseFloat(currentValue.replace(/,/g, ''));
                        if (_amountRef.current) {
                          if (isNaN(numericValue)) {
                            _amountRef.current.value = "0.00";
                          } else {
                            if (!currentValue.includes(".")) {
                              _amountRef.current.value = `${formatNumber(numericValue)}`;
                            } else {
                              _amountRef.current.value = formatNumber(numericValue);
                            }
                          }
                        }
                        _checkcountRef.current?.focus()
                      }
                    }}
                  />
                </div>
                {state.checkMode !== "update" && (
                  <TextInput
                    label={{
                      title: "Check Count : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "90px",
                      },
                    }}
                    input={{
                      disabled: isDisableField,
                      type: "number",
                      style: { width: "190px" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                          const timeout = setTimeout(() => {
                            checkModalSaveButton.current?.click();
                            clearTimeout(timeout);
                          }, 100);
                        }
                      },
                    }}
                    inputRef={_checkcountRef}
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
                    handleCheckDetailsSave()
                  }}
                  sx={{
                    height: "30px",
                    fontSize: "11px",
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
                        if (result.isConfirmed) {
                          setPdcDataRows((dt) => {
                            dt = dt.filter(
                              (items: any) =>
                                items.CheckIdx !== stateModalPdcCheck.CheckIdx
                            );
                            return dt;
                          });
                        }
                        focusOnTable()
                      });
                    }}
                    sx={{
                      height: "30px",
                      fontSize: "11px",
                    }}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  color="success"
                  variant="contained"
                  sx={{
                    height: "30px",
                    fontSize: "11px",
                  }}
                  onClick={() => {
                    focusOnTable()
                    setOpenPdcInputModal(false);
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
                    setOpenPdcInputModal(false);
                    focusOnTable()
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
        {(loadingAddNew ||
          isLoadingSelectedSearch) && <div className="loading-component"><div className="loader"></div></div>}

      </div>
    </>
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
