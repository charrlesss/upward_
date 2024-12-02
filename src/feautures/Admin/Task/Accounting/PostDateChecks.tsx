import React, { useContext, useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  MenuItem,
  Menu,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery } from "react-query";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import { AuthContext } from "../../../../components/AuthContext";
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
import { useUpwardTableModal } from "../../../../hooks/useUpwardTableModal";
import { TextAreaInput, TextInput } from "../../../../components/UpwardFields";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";
import PageHelmet from "../../../../components/Helmet";
import { wait } from "@testing-library/user-event/dist/utils";
import SearchIcon from '@mui/icons-material/Search';



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
  { key: "Check_No", label: "Check No.", width: 150 },
  { key: "Check_Date", label: "Check Date", width: 150 },
  { key: "Check_Amnt", label: "Amount", width: 150, type: "number" },
  { key: "BankName", label: "Bank", width: 200 },
  { key: "Branch", label: "Branch", width: 200 },
  {
    key: "Check_Remarks",
    label: "Checked Remarks",
    width: 350,
  },
  { key: "Deposit_Slip", label: "Deposit Slip", width: 150 },
  { key: "DateDeposit", label: "Date Deposit", width: 150 },
  { key: "OR_No", label: "OR Num", width: 150 },
  { key: "BankCode", label: "Bank Code", width: 150, hide: true },
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
  const [openPdcInputModal, setOpenPdcInputModal] = useState(false);
  const [showModal, setShowModal] = useState(false);



  const searchInputRef = useRef<HTMLInputElement>(null);

  const [hasSelectedRow, setHasSelectedRow] = useState(null)
  const [pdcMode, setPdcMode] = useState('')

  const { myAxios, user } = useContext(AuthContext);
  const searchRef = useRef<HTMLInputElement>(null);

  // pdc form save button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savePDCButtonRef = useRef<HTMLButtonElement>(null);


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


  const subRefNoRef = useRef('');
  const PNoRef = useRef('');
  const subAccountRef = useRef('');

  const refNoRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const remakrsRef = useRef<HTMLTextAreaElement>(null);
  const pnRef = useRef<HTMLInputElement>(null);
  const branchRef = useRef<HTMLInputElement>(null);
  const clientnameRef = useRef<HTMLTextAreaElement>(null);


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
        wait(100).then(() => {
          subRefNoRef.current = response.data.RefNo[0].pdcID
          if (refNoRef.current) {
            refNoRef.current.value = response.data.RefNo[0].pdcID
          }
        })

      },
    });

  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      if (pdcMode === "update") {
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
        resetPDC()
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

        tableRef.current.setDataFormated(response.data.getSearchPDCCheck)

        if (refNoRef.current) {
          refNoRef.current.value = response.data.getSearchPDCCheck[0].Ref_No
        }
        if (clientnameRef.current) {
          clientnameRef.current.value = response.data.getSearchPDCCheck[0].Name
        }
        if (dateRef.current) {
          dateRef.current.value = response.data.getSearchPDCCheck[0].Date
        }
        if (pnRef.current) {
          pnRef.current.value = response.data.getSearchPDCCheck[0].PNo
        }
        if (branchRef.current) {
          branchRef.current.value = response.data.getSearchPDCCheck[0].Acronym
        }
        if (remakrsRef.current) {
          remakrsRef.current.value = response.data.getSearchPDCCheck[0].Remarks
        }
        PNoRef.current = response.data.getSearchPDCCheck[0].IDNo
        subAccountRef.current = response.data.getSearchPDCCheck[0].sub_account



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

        wait(100).then(() => {
          PNoRef.current = selectedRow[0].IDNo
          subAccountRef.current = selectedRow[0].sub_account
          if (pnRef.current) {
            pnRef.current.value = selectedRow[0].client_id
          }
          if (clientnameRef.current) {
            clientnameRef.current.value = selectedRow[0].Name
          }
          if (branchRef.current) {
            branchRef.current.value = selectedRow[0].Acronym
          }
          if (remakrsRef.current) {
            remakrsRef.current.value = selectedRow[0].Remarks || ""
          }
        })

        closeModalSearchPdcIDs();

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
        setPdcMode('update')
        closeUpwardPDCModal();
        if (searchRef.current) {
          searchRef.current?.focus();
        }
      }
    },
    responseDataKey: "searchPDC",
  });

  const handleOnSave = useCallback(async (e: any) => {
    const pdcTableData = tableRef.current.getDataFormatted()

    if (pnRef.current && pnRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide loan information!",
        timer: 1500,
      }).then(() => {
        setTimeout(() => {
          pnRef.current?.click();
        }, 350);
      });
    }
    if (pdcTableData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide entry!",
        timer: 1500,
      }).then(() => {
        setOpenPdcInputModal(true);
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
      Ref_No: refNoRef.current?.value,
      PNo: pnRef.current?.value,
      IDNo: PNoRef.current,
      Date: dateRef.current?.value,
      Name: clientnameRef.current?.value,
      Remarks: remakrsRef.current?.value,
      Branch: branchRef.current?.value,
      checks: JSON.stringify(pdcTableData),
    };
    if (pdcMode === "update") {
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
  }, [mutate, selectedFiles, pdcMode])

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
    const pdcTableData = tableRef.current.getDataFormatted()

    flushSync(() => {
      const state = {
        Ref_No: refNoRef.current?.value,
        PNo: pnRef.current?.value,
        IDNo: PNoRef.current,
        Date: dateRef.current?.value,
        Name: clientnameRef.current?.value,
        Remarks: remakrsRef.current?.value,
        Branch: branchRef.current?.value,
      };

      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(pdcTableData));
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
            {clientnameRef.current?.value}
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
            {PNoRef.current}
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
            {refNoRef.current?.value}
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

  function resetPDC() {
    setPdcMode('')
    tableRef.current.setSelectedRow(null)
    tableRef.current.setData([])
    refetchNewRefNumber()

    if (dateRef.current) {
      dateRef.current.value = format(new Date(), "yyyy-MM-dd")
    }
    if (remakrsRef.current) {
      remakrsRef.current.value = ''
    }
    if (pnRef.current) {
      pnRef.current.value = ''
    }
    if (branchRef.current) {
      branchRef.current.value = ''
    }
    if (clientnameRef.current) {
      clientnameRef.current.value = ''
    }



  }
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


      const tableRows = tableRef.current.getDataFormatted()
      const selectedIndex = tableRef.current.getSelectedRow()

      const filteredChecks = tableRows.filter((itm: any) => {
        return _checknoRef.current && _checknoRef.current.value === itm.Check_No
      })


      if (filteredChecks.length > 0 && selectedIndex === null) {
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



      if (
        _checknoRef.current &&
        _bankRef.current &&
        _branchRef.current &&
        _remarksRef.current &&
        _chekdateRef.current &&
        _amountRef.current &&
        _checkcountRef.current
      ) {



        if (selectedIndex) {
          const selectedRow = tableRef.current.getData()
          selectedRow[selectedIndex][0] = _checknoRef.current.value
          selectedRow[selectedIndex][1] = _chekdateRef.current.value
          selectedRow[selectedIndex][2] = _amountRef.current.value
          selectedRow[selectedIndex][3] = _bankRef.current.value
          selectedRow[selectedIndex][4] = _branchRef.current.value
          selectedRow[selectedIndex][5] = _remarksRef.current.value
          selectedRow[selectedIndex][6] = _slipCodeRef.current
          selectedRow[selectedIndex][7] = _slipDateRef.current
          selectedRow[selectedIndex][8] = _checkOR.current
          selectedRow[selectedIndex][9] = _bankCode.current
          tableRef.current.setData(selectedRow)
          tableRef.current.setSelectedRow(null)
          setHasSelectedRow(null)
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
          tableRef.current.setDataFormated(newData)

        }
      }



      setOpenPdcInputModal(false);
    }

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

  const isDisableField = pdcMode === "";




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
          backgroundColor: "#F1F1F1",

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
              <TextInput
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
                      openUpwardPDCModal(e.currentTarget.value);
                    }
                  },
                  style: { width: "500px" },
                }}

                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault()
                  if (searchInputRef.current)
                    openUpwardPDCModal(searchInputRef.current.value);

                }}
                inputRef={searchInputRef}
              />
            )}
            {pdcMode === "" && (
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

                  setPdcMode('add')
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
              disabled={pdcMode === ""}
              loading={loadingAddNew}
              startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
            >
              Save
            </LoadingButton>
            {(pdcMode === "add" || pdcMode === "update") && (
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
                      resetPDC()
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
              disabled={pdcMode === ""}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              onClick={() => {
                flushSync(() => {
                  setOpenPdcInputModal(true);
                });

                wait(100).then(() => {
                  const tableRows = tableRef.current.getDataFormatted()
                  const getLastCheck_No: any = tableRows[tableRows.length - 1];
                  if (_checknoRef.current) {
                    _checknoRef.current.value = incrementCheckNo(
                      getLastCheck_No?.Check_No
                    );
                  }

                  tableRef.current.setSelectedRow(null)
                  setHasSelectedRow(null)
                  _checknoRef.current?.focus();
                })
              }}
              ref={addRefButton}
            >
              Add Check
            </Button>
            <div>
              <Button
                disabled={pdcMode !== "update"}
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
                    gap: "15px",
                  }}
                >
                  {newRefNumberLoading ? (
                    <LoadingButton loading={newRefNumberLoading} />
                  ) : (

                    <TextInput
                      label={{
                        title: "Reference No.",
                        style: {
                          fontSize: "12px",
                          fontWeight: "bold",
                          width: "100px",
                        },
                      }}
                      input={{
                        disabled: isDisableField,
                        type: "text",
                        style: { width: "300px" },
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === "NumpadEnter") {
                            e.preventDefault();
                            dateRef.current?.focus()
                          }
                        }
                      }}
                      inputRef={refNoRef}
                      icon={<RestartAltIcon sx={{ fontSize: "18px", color: isDisableField ? "gray" : "black" }} />}

                      disableIcon={isDisableField}
                    />

                  )}

                  <TextInput
                    label={{
                      title: "Date : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "50px",
                      },
                    }}
                    input={{
                      disabled: isDisableField,
                      type: "date",
                      defaultValue: format(new Date(), "yyyy-MM-dd"),
                      style: { width: "190px" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                          remakrsRef.current?.focus()
                        }
                      }
                    }}
                    inputRef={dateRef}
                  />


                </div>

                <TextAreaInput
                  label={{
                    title: "Remarks : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  textarea={{
                    rows: 2,
                    disabled: isDisableField,
                    style: { flex: 1 },
                    onKeyDown: (e) => {
                      e.stopPropagation()
                      if ((e.code === "NumpadEnter" && !e.shiftKey) || (e.code === 'Enter' && !e.shiftKey)) {
                        pnRef.current?.focus()
                      }
                    },

                  }}
                  _inputRef={remakrsRef}
                />


              </fieldset>
              <fieldset
                style={
                  {
                    flex: 1,
                    display: "flex",
                    gap: "10px",
                    padding: " 15px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    flexDirection: "column",
                  } as any
                }
              >
                <div
                  style={{ width: "100%", flex: 1, display: "flex", gap: "15px" }}
                >
                  {isLoadingModalSearchPdcIDs ? (
                    <LoadingButton loading={isLoadingModalSearchPdcIDs} />
                  ) : (
                    <TextInput
                      label={{
                        title: "PN/Client ID : ",
                        style: {
                          fontSize: "12px",
                          fontWeight: "bold",
                          width: "100px",
                        },
                      }}
                      input={{
                        disabled: isDisableField,
                        type: "text",
                        style: { width: "250px", height: "22px" },
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === "NumpadEnter") {
                            e.preventDefault();
                            if (pnRef.current) {
                              openModalSearchPdcIDs(pnRef.current.value)
                            }
                          }
                        }
                      }}
                      inputRef={pnRef}
                      icon={<PersonSearchIcon sx={{ fontSize: "18px", color: isDisableField ? "gray" : "black" }} />}
                      onIconClick={(e) => {
                        e.preventDefault()
                        if (pnRef.current) {
                          openModalSearchPdcIDs(pnRef.current.value)
                        }
                      }}
                      disableIcon={isDisableField}
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
                      disabled: isDisableField,
                      type: "text",
                      style: { width: "auto", height: "22px" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                          clientnameRef.current?.focus()
                        }
                      }
                    }}
                    inputRef={branchRef}
                  />

                </div>

                <div
                  style={{ width: "100%", display: "flex", columnGap: "10px" }}
                >
                  <TextAreaInput
                    label={{
                      title: "Clients Name : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "100px",
                      },
                    }}
                    textarea={{
                      rows: 2,
                      disabled: isDisableField,
                      style: { width: "325px" },
                      onKeyDown: (e) => {
                        e.stopPropagation()
                        if ((e.code === "NumpadEnter" && !e.shiftKey) || (e.code === 'Enter' && !e.shiftKey)) {
                          savePDCButtonRef.current?.click();
                        }
                      },

                    }}
                    _inputRef={clientnameRef}
                  />
                  <Button
                    sx={{
                      height: "27px",
                      fontSize: "11px",
                    }}
                    disabled={pdcMode === ""}
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
        <PostDatedCheckTableSelected
          disbaleTable={isDisableField}
          ref={tableRef}
          rows={[]}
          columns={pdcColumn}
          getSelectedItem={(rowSelected: any, _: any, RowIndex: any) => {
            if (rowSelected) {
              if (
                (rowSelected[6] && rowSelected[6] !== "") ||
                (rowSelected[7] && rowSelected[7] !== "") ||
                (rowSelected[8] && rowSelected[8] !== "")
              ) {
                setHasSelectedRow(null)
                tableRef.current.setSelectedRow(null)
                return Swal.fire({
                  position: "center",
                  icon: "warning",
                  title: `Unable to delete. Check No ${rowSelected[0]} is already ${rowSelected[8]} issued of OR!`,
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
              flushSync(() => {
                setOpenPdcInputModal(true);
              })
              wait(100).then(() => {
                if (
                  _checknoRef.current &&
                  _bankRef.current &&
                  _branchRef.current &&
                  _remarksRef.current &&
                  _chekdateRef.current &&
                  _amountRef.current
                ) {
                  _checknoRef.current.value = rowSelected[0]
                  _chekdateRef.current.value = rowSelected[1]
                  _amountRef.current.value = formatNumber(parseFloat(rowSelected[2].replace(/,/g, '')))
                  _bankRef.current.value = rowSelected[3]
                  _branchRef.current.value = rowSelected[4]
                  _remarksRef.current.value = rowSelected[5]
                  _slipCodeRef.current = rowSelected[6] || ""
                  _slipDateRef.current = rowSelected[7] || ""
                  _checkOR.current = rowSelected[8] || ""
                  _bankCode.current = rowSelected[9]

                  console.log(rowSelected[0])
                  _bankRef.current.focus()
                }
              })

              setHasSelectedRow(RowIndex)
            } else {
              setHasSelectedRow(null)
            }
          }}
          onKeyDown={(rowSelected: any, RowIndex: any, e: any) => {
            if (e.code === "Delete" || e.code === "Backspace") {

              if (
                (rowSelected[6] && rowSelected[6] !== "") ||
                (rowSelected[7] && rowSelected[7] !== "") ||
                (rowSelected[8] && rowSelected[8] !== "")
              ) {
                setHasSelectedRow(null)
                tableRef.current.setSelectedRow(null)

                return Swal.fire({
                  position: "center",
                  icon: "warning",
                  title: `Unable to delete. Check No ${rowSelected[0]} is already ${rowSelected[8]} issued of OR!`,
                  showConfirmButton: false,
                  timer: 1500,
                });
              }


              Swal.fire({
                title: "Are you sure?",
                text: `You won't to delete this Check No. ${rowSelected[0]}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  setTimeout(() => {
                    const newData = tableRef.current.getData()
                    newData.splice(RowIndex, 1);
                    tableRef.current.setData(newData)

                    setHasSelectedRow(null)
                    tableRef.current.setSelectedRow(null)
                  }, 100)
                }
              });
            }
          }}
        />

        <Modal
          open={openPdcInputModal}
          onClose={() => {
            setOpenPdcInputModal(false);
            tableRef.current.setSelectedRow(null)
            setHasSelectedRow(null)

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
                    disabled: hasSelectedRow !== null,
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
                {hasSelectedRow === null && (
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
                  autoFocus={hasSelectedRow !== null}
                  onClick={() => {
                    handleCheckDetailsSave()
                  }}
                  sx={{
                    height: "30px",
                    fontSize: "11px",
                  }}
                >
                  {hasSelectedRow !== null ? "Update" : "Save"}
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  sx={{
                    height: "30px",
                    fontSize: "11px",
                  }}
                  onClick={() => {
                    setOpenPdcInputModal(false);
                    tableRef.current.setSelectedRow(null)
                    setHasSelectedRow(null)
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
                    tableRef.current.setSelectedRow(null)
                    setHasSelectedRow(null)
                    setOpenPdcInputModal(false);
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


const PostDatedCheckTableSelected = forwardRef(({
  columns,
  rows,
  height = "400px",
  getSelectedItem,
  onKeyDown,
  disbaleTable = false,
  isTableSelectable = true
}: any, ref) => {
  const parentElementRef = useRef<any>(null)
  const [data, setData] = useState([])
  const [column, setColumn] = useState([])
  const [selectedRow, setSelectedRow] = useState<any>(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState<any>(null)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)

  useEffect(() => {
    if (columns.length > 0) {
      setColumn(columns.filter((itm: any) => !itm.hide))
    }
  }, [columns])

  useEffect(() => {
    if (rows.length > 0) {
      setData(rows.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    }
  }, [rows, columns])

  useImperativeHandle(ref, () => ({
    selectedRow: () => selectedRow,
    getData: () => {
      const newData = [...data];
      return newData
    },
    setData: (newData: any) => {
      setData(newData)
    },
    getColumns: () => {
      return columns
    },
    resetTable: () => {
      setData([])
      setSelectedRow(0)
    },
    getSelectedRow: () => {
      return selectedRowIndex
    },
    setSelectedRow: (value: any) => {
      return setSelectedRowIndex(value)
    },
    setDataFormated: (newData: any) => {
      setData(newData.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    },
    getDataFormatted: () => {
      const newData = [...data];
      const newDataFormatted = newData.map((itm: any) => {
        let newItm = {
          Check_No: itm[0],
          Check_Date: itm[1],
          Check_Amnt: itm[2],
          BankName: itm[3],
          Branch: itm[4],
          Check_Remarks: itm[5],
          Deposit_Slip: itm[6],
          DateDeposit: itm[7],
          OR_No: itm[8],
          BankCode: itm[9]

        }
        return newItm
      })

      return newDataFormatted
    }
  }))

  return (
    <div
      ref={parentElementRef}
      style={{
        width: "100%",
        height,
        overflow: "auto",
        position: "relative",
        pointerEvents: disbaleTable ? "none" : "auto",
        border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
        boxShadow: `inset -2px -2px 0 #ffffff, 
                      inset 2px 2px 0 #808080`

      }}
    >
      <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", position: "relative", background: "white" }}>
          <thead >
            <tr>
              <th style={{
                width: '30px',
                border: "1px solid black",
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "#f0f0f0",

              }}
              ></th>
              {
                column.map((colItm: any, idx: number) => {
                  return (
                    <th
                      key={idx}
                      style={{
                        width: colItm.width,
                        border: "1px solid black",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        textAlign: "left",
                        padding: "0px 5px",

                      }}
                    >{colItm.label}</th>
                  )
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              data?.map((rowItm: any, rowIdx: number) => {
                const selectedRowBg = selectedRow === rowIdx && selectedRowIndex === rowIdx ? "#dedfe0" : selectedRow === rowIdx ? "#b6e4fc" : selectedRowIndex === rowIdx ? "#cbcfd4" : ""
                return (
                  <tr key={rowIdx}>
                    <td style={{
                      position: "relative",
                      borderBottom: "1px solid black",
                      borderLeft: "1px solid black",
                      borderTop: "none",
                      borderRight: "1px solid black",
                      cursor: "pointer",
                      background: selectedRowBg,
                      padding: 0,
                      margin: 0,
                      boxShadow: `inset -2px -2px 0 #ffffff, 
                       inset 1px 1px 0 #a8a29e`,
                    }}>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <input
                          style={{
                            cursor: "pointer",
                            margin: "0px !important",
                            position: "absolute",
                          }}
                          readOnly={true}
                          checked={selectedRowIndex === rowIdx}
                          type="checkbox"
                          onClick={() => {
                            if (!isTableSelectable) {
                              return
                            }
                            setSelectedRowIndex(rowIdx)

                            if (getSelectedItem) {
                              getSelectedItem(rowItm, null, rowIdx, null)
                            }
                            setSelectedRow(null)

                          }}
                        />
                      </div>
                    </td>

                    {
                      column.map((colItm: any, colIdx: number) => {
                        return (
                          <td
                            className={`td row-${rowIdx} col-${colIdx}`}
                            tabIndex={0}
                            onDoubleClick={() => {
                              if (!isTableSelectable) {
                                return
                              }
                              if (selectedRowIndex === rowIdx) {
                                setSelectedRowIndex(null)

                                if (getSelectedItem) {
                                  getSelectedItem(null, null, rowIdx, null)
                                }
                              } else {

                                setSelectedRowIndex(rowIdx)
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, null, rowIdx, null)
                                }
                              }
                              setSelectedRow(null)
                            }}
                            onClick={() => {
                              setSelectedRow(rowIdx)
                            }}

                            onMouseEnter={(e) => {
                              e.preventDefault()
                              setSelectedRow(rowIdx)
                            }}
                            onMouseLeave={(e) => {
                              e.preventDefault()
                              setSelectedRow(null)
                            }}
                            onKeyDown={(e) => {
                              if (onKeyDown) {
                                onKeyDown(rowItm, rowIdx, e)
                              }
                              if (e.key === "ArrowUp") {
                                setSelectedRow((prev: any) => {
                                  const index = Math.max(prev - 1, 0)
                                  const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                  if (td) {
                                    td.focus()
                                  }
                                  return index
                                });
                              } else if (e.key === "ArrowDown") {
                                setSelectedRow((prev: any) => {
                                  const index = Math.min(prev + 1, data.length - 1)
                                  const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                  if (td) {
                                    td.focus()
                                  }
                                  return index
                                });
                              }
                              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                                e.preventDefault()

                                if (!isTableSelectable) {
                                  return
                                }

                                setSelectedRowIndex(rowIdx)
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, null, rowIdx, null)
                                }
                                setSelectedRow(null)
                              }
                            }}
                            key={colIdx}
                            style={{
                              border: "1px solid black",
                              background: selectedRowBg,
                              fontSize: "12px",
                              padding: "0px 5px",
                              cursor: "pointer",
                              height: "20px",
                              boxShadow: `inset -2px -2px 0 #ffffff, 
                              inset 1px 1px 0 #a8a29e`,
                              userSelect: "none",
                            }}
                          >{
                              <input
                                readOnly={true}
                                value={rowItm[colIdx]}
                                style={{
                                  width: colItm.width,
                                  pointerEvents: "none",
                                  border: "none",
                                  background: "transparent",
                                  userSelect: "none",
                                  textAlign: colItm.type === 'number' ? "right" : "left"

                                }} />
                            }</td>
                        )
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
})

export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
export function incrementCheckNo(Check_No: string) {
  if (Check_No) {
    let incrementedNumber = (parseInt(Check_No) + 1).toString();
    while (incrementedNumber.length < Check_No.length) {
      incrementedNumber = "0" + incrementedNumber;
    }
    return incrementedNumber;
  }

  return "001";
}
