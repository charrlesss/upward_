import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Box, Button, IconButton, MenuItem, Menu } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery } from "react-query";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import { AuthContext } from "../../../../components/AuthContext";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { DisplayFile, checkFile } from "../Claims/Claims";
import { grey } from "@mui/material/colors";
import {
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { format } from "date-fns";
import PageHelmet from "../../../../components/Helmet";
import { wait } from "@testing-library/user-event/dist/utils";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { Loading } from "../../../../components/Loading";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

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

export default function PostDateChecks() {
  const modalCheckRef = useRef<any>(null);
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
  const [showModal, setShowModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [hasSelectedRow, setHasSelectedRow] = useState(null);
  const [pdcMode, setPdcMode] = useState("");

  const { myAxios, user } = useContext(AuthContext);

  // pdc form save button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savePDCButtonRef = useRef<HTMLButtonElement>(null);

  const addRefButton = useRef<HTMLButtonElement>(null);

  const subRefNoRef = useRef("");
  const PNoRef = useRef("");
  const subAccountRef = useRef("");

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
          subRefNoRef.current = response.data.RefNo[0].pdcID;
          if (refNoRef.current) {
            refNoRef.current.value = response.data.RefNo[0].pdcID;
          }
        });
      },
    });

  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: "update-pdc",
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
        resetPDC();
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
      mutationKey: "get-search-pdc-check",
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
        const data = response.data.getSearchPDCCheck.map((itm: any) => {
          itm.Check_Amnt = formatNumber(
            parseFloat(itm.Check_Amnt.toString().replace(/,/g, ""))
          );
          return itm;
        });
        tableRef.current.setDataFormated(data);

        if (refNoRef.current) {
          refNoRef.current.value = response.data.getSearchPDCCheck[0].Ref_No;
        }
        if (clientnameRef.current) {
          clientnameRef.current.value = response.data.getSearchPDCCheck[0].Name;
        }
        if (dateRef.current) {
          dateRef.current.value = response.data.getSearchPDCCheck[0].Date;
        }
        if (pnRef.current) {
          pnRef.current.value = response.data.getSearchPDCCheck[0].PNo;
        }
        if (branchRef.current) {
          branchRef.current.value = response.data.getSearchPDCCheck[0].Acronym;
        }
        if (remakrsRef.current) {
          remakrsRef.current.value = response.data.getSearchPDCCheck[0].Remarks;
        }
        PNoRef.current = response.data.getSearchPDCCheck[0].IDNo;
        subAccountRef.current = response.data.getSearchPDCCheck[0].sub_account;
      },
    });

  // policy ids search table modal
  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/accounting/search-pdc-policy-id",
    column: [
      { key: "Type", label: "Type", width: 100 },
      { key: "IDNo", label: "ID No.", width: 120 },
      {
        key: "Name",
        label: "Name",
        width: 350,
      },
      { key: "chassis", label: "Chassis No.", width: 200 },
      {
        key: "remarks",
        label: "remarks",
        width: 0,
        hide: true,
      },
      {
        key: "client_id",
        label: "client_id",
        width: 0,
        hide: true,
      },
      {
        key: "Acronym",
        label: "Acronym",
        width: 0,
        hide: true,
      },
      {
        key: "sub_account",
        label: "sub_account",
        width: 0,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          PNoRef.current = rowItm[5];
          subAccountRef.current = rowItm[7];
          if (pnRef.current) {
            pnRef.current.value = rowItm[1];
          }
          if (clientnameRef.current) {
            clientnameRef.current.value = rowItm[2];
          }
          if (branchRef.current) {
            branchRef.current.value = rowItm[6];
          }
          if (rowItm[4] && rowItm[4] !== "") {
            if (remakrsRef.current) {
              remakrsRef.current.value = rowItm[4];
            }
          }
        });
        clientCloseModal();
      }
    },
  });

  // pdc search table modal
  const {
    UpwardTableModalSearch: PDCUpwardTableModalSearch,
    openModal: pdcOpenModal,
    closeModal: pdcCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/search-pdc",
    column: [
      { key: "Date", label: "Date Received", width: 90 },
      { key: "Ref_No", label: "Ref No.", width: 70 },
      {
        key: "Name",
        label: "Name",
        width: 320,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          console.log(rowItm[2]);
          mutateSelectedSearch({ ref_no: rowItm[1] });
          setPdcMode("update");
        });
        pdcCloseModal();
      }
    },
  });

  const handleOnSave = useCallback(
    async (e: any) => {
      const pdcTableData = tableRef.current.getDataFormatted();

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
    },
    [mutate, selectedFiles, pdcMode]
  );

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

  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/task/accounting/print", variables, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      // window.open(pdfUrl);
      var newTab = window.open();
      if (newTab) {
        newTab.document.write("<!DOCTYPE html>");
        newTab.document.write(
          "<html><head><title>New Tab with iframe</title></head>"
        );
        newTab.document.write(
          '<body style="width:100vw;height:100vh;padding:0;margin:0;box-sizing:border-box;">'
        );
        newTab.document.write(
          `<iframe style="border:none;outline:none;padding:0;margin:0" src="${pdfUrl}" width="99%" height="99%"></iframe>`
        );

        newTab.document.write("</body></html>");
        // Optional: Close the document stream after writing
        newTab.document.close();
      }
    },
  });

  const clickPDCReceipt = () => {
    const pdcTableData = tableRef.current.getDataFormatted();
    const state = {
      Ref_No: refNoRef.current?.value,
      PNo: pnRef.current?.value,
      IDNo: PNoRef.current,
      Date: dateRef.current?.value,
      Name: clientnameRef.current?.value,
      Remarks: remakrsRef.current?.value,
      Branch: branchRef.current?.value,
    };
    mutatePrint({
      printOption: "receipt",
      pdcTableData,
      state,
      reportTitle:
        process.env.REACT_APP_DEPARTMENT === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
    });
  };
  const clickPDCLabeling = () => {
    const state = {
      name: clientnameRef.current?.value,
      pno: PNoRef.current,
      ref: refNoRef.current?.value,
    };
    mutatePrint({
      printOption: "labeling",
      pdcTableData: [],
      state,
      reportTitle:
        process.env.REACT_APP_DEPARTMENT === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
    });
    // let printString = () => {
    //   return (
    //     <div>
    //       <p
    //         style={{
    //           color: "#d1d5db",
    //           fontSize: "11px",
    //           textAlign: "center",
    //           padding: 0,
    //           marginTop: "8px",
    //           marginBottom: 0,
    //         }}
    //       >
    //         UCSMI
    //       </p>
    //       <p
    //         style={{
    //           color: "#d1d5db",
    //           fontSize: "11px",
    //           textAlign: "center",
    //           padding: 0,
    //           margin: 0,
    //         }}
    //       >
    //         {clientnameRef.current?.value}
    //       </p>
    //       <p
    //         style={{
    //           color: "#d1d5db",
    //           fontSize: "11px",
    //           textAlign: "center",
    //           padding: 0,
    //           margin: 0,
    //         }}
    //       >
    //         {PNoRef.current}
    //       </p>
    //       <p
    //         style={{
    //           color: "#d1d5db",
    //           fontSize: "11px",
    //           textAlign: "center",
    //           padding: 0,
    //           margin: "20px",
    //         }}
    //       >
    //         {refNoRef.current?.value}
    //       </p>
    //     </div>
    //   );
    // };

    // flushSync(() => {
    //   const elementString = ReactDOMServer.renderToString(printString());
    //   localStorage.setItem("printString", elementString);
    //   localStorage.removeItem("dataString");
    //   localStorage.setItem("paper-width", "8.5in");
    //   localStorage.setItem("paper-height", "11in");
    // });
    // window.open("/dashboard/print", "_blank");
  };

  function resetPDC() {
    setPdcMode("");
    tableRef.current.setSelectedRow(null);
    tableRef.current.resetCheckBox();
    tableRef.current.setData([]);
    refetchNewRefNumber();

    if (dateRef.current) {
      dateRef.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (remakrsRef.current) {
      remakrsRef.current.value = "";
    }
    if (pnRef.current) {
      pnRef.current.value = "";
    }
    if (branchRef.current) {
      branchRef.current.value = "";
    }
    if (clientnameRef.current) {
      clientnameRef.current.value = "";
    }
  }
  function formatNumber(num: number) {
    return (num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function handleCheckDetailsSave() {
    function incrementStringNumbers(str: string, increment: number) {
      let num = parseInt(str);
      num = num + increment;
      return num.toString().padStart(str.length, "0");
    }
    function incrementDate(dateString: any, i: number) {
      const currentDate = new Date(dateString);
      currentDate.setMonth(currentDate.getMonth() + i);

      return format(currentDate, "yyyy-MM-dd");
    }
    function isValidDate(dateString: string): boolean {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    }

    if (
      modalCheckRef.current.getRefs().checknoRef.current &&
      modalCheckRef.current.getRefs().bankRef.current &&
      modalCheckRef.current.getRefs().branchRef.current &&
      modalCheckRef.current.getRefs().remarksRef.current &&
      modalCheckRef.current.getRefs().checkdateRef.current &&
      modalCheckRef.current.getRefs().amountRef.current
    ) {
      const tableRows = tableRef.current.getDataFormatted();
      const selectedIndex = tableRef.current.getSelectedRow();

      const filteredChecks = tableRows.filter((itm: any) => {
        return (
          modalCheckRef.current.getRefs().checknoRef.current &&
          modalCheckRef.current.getRefs().checknoRef.current.value ===
            itm.Check_No
        );
      });

      if (filteredChecks.length > 0 && selectedIndex === null) {
        alert("check no. is already exist!");
        modalCheckRef.current.getRefs().checknoRef.current.focus();
        return;
      }
      if (modalCheckRef.current.getRefs().checknoRef.current.value === "") {
        alert("check no. is required!");
        modalCheckRef.current.getRefs().checknoRef.current.focus();
        return;
      } else if (modalCheckRef.current.getRefs().bankRef.current.value === "") {
        alert("bank is required!");
        modalCheckRef.current.getRefs().bankRef.current.focus();
        return;
      } else if (
        modalCheckRef.current.getRefs().branchRef.current.value === ""
      ) {
        alert("branch is required!");
        modalCheckRef.current.getRefs().bankRef.current.focus();
        return;
      } else if (
        !isValidDate(modalCheckRef.current.getRefs().checkdateRef.current.value)
      ) {
        alert("invalid date!");
        modalCheckRef.current.getRefs().checkdateRef.current.focus();
        return;
      } else if (
        isNaN(
          parseFloat(
            modalCheckRef.current
              .getRefs()
              .amountRef.current?.value.toString()
              .replace(/,/g, "")
          )
        )
      ) {
        alert("amount must be greater than 0!");
        modalCheckRef.current.getRefs().amountRef.current.focus();
        return;
      }

      if (
        modalCheckRef.current.getRefs().checknoRef.current &&
        modalCheckRef.current.getRefs().bankRef.current &&
        modalCheckRef.current.getRefs().branchRef.current &&
        modalCheckRef.current.getRefs().remarksRef.current &&
        modalCheckRef.current.getRefs().checkdateRef.current &&
        modalCheckRef.current.getRefs().amountRef.current
      ) {
        if (selectedIndex !== null) {
          const selectedRow = tableRef.current.getData();

          selectedRow[selectedIndex][0] =
            modalCheckRef.current.getRefs().checknoRef.current.value;
          selectedRow[selectedIndex][1] =
            modalCheckRef.current.getRefs().checkdateRef.current.value;
          selectedRow[selectedIndex][2] = formatNumber(
            parseNumber(
              modalCheckRef.current
                .getRefs()
                .amountRef.current?.value.toString()
                .replace(/,/g, "")
            )
          );
          selectedRow[selectedIndex][3] =
            modalCheckRef.current.getRefs().bankRef.current.value;
          selectedRow[selectedIndex][4] =
            modalCheckRef.current.getRefs().branchRef.current.value;
          selectedRow[selectedIndex][5] =
            modalCheckRef.current.getRefs().remarksRef.current.value;
          selectedRow[selectedIndex][6] =
            modalCheckRef.current.getRefs()._slipCodeRef.current;
          selectedRow[selectedIndex][7] =
            modalCheckRef.current.getRefs()._slipDateRef.current;
          selectedRow[selectedIndex][8] =
            modalCheckRef.current.getRefs()._checkOR.current;
          selectedRow[selectedIndex][9] =
            modalCheckRef.current.getRefs().bankCode.current;

          tableRef.current.setData(selectedRow);
          tableRef.current.setSelectedRow(null);
          tableRef.current.resetCheckBox();
          setHasSelectedRow(null);
          return;
        } else {
          const checkCount =
            parseInt(
              modalCheckRef.current.getRefs()._checkcountRef.current.value
            ) <= 0
              ? 1
              : parseInt(
                  modalCheckRef.current.getRefs()._checkcountRef.current.value
                );
          const newData: any = [];
          for (let i = 0; i < checkCount; i++) {
            newData.push([
              incrementStringNumbers(
                modalCheckRef.current.getRefs().checknoRef.current.value,
                i
              ),
              incrementDate(
                modalCheckRef.current.getRefs().checkdateRef.current.value,
                i
              ),
              formatNumber(
                parseNumber(
                  modalCheckRef.current
                    .getRefs()
                    .amountRef.current?.value.toString()
                    .replace(/,/g, "")
                )
              ),
              modalCheckRef.current.getRefs().bankRef.current.value,
              modalCheckRef.current.getRefs().branchRef.current.value,
              modalCheckRef.current.getRefs().remarksRef.current.value,
              modalCheckRef.current.getRefs()._slipCodeRef.current,
              modalCheckRef.current.getRefs()._slipDateRef.current,
              modalCheckRef.current.getRefs()._checkOR.current,
              modalCheckRef.current.getRefs().bankCode.current,
            ]);
          }

          tableRef.current.setData([...tableRef.current.getData(), ...newData]);
        }
      }
    }
  }
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleOnSave(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOnSave]);

  const isDisableField = pdcMode === "";

  return (
    <>
      <ModalCheck
        ref={modalCheckRef}
        handleOnSave={() => {
          handleCheckDetailsSave();
          modalCheckRef.current.clsoeModal();
        }}
        handleOnClose={() => {
          tableRef.current.setSelectedRow(null);
          tableRef.current.resetCheckBox();

          // buttonCheckSave.current?.focus();
        }}
        hasSelectedRow={hasSelectedRow}
      />
      <ClientUpwardTableModalSearch />
      <PDCUpwardTableModalSearch />
      <PageHelmet title="PDC" />
      {(loadingAddNew || isLoadingSelectedSearch || isLoadingPrint) && (
        <Loading />
      )}
      <div
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "10px",
          backgroundColor: "#F1F1F1",
          flexDirection: "column",
          display:"flex"
        }}
      >
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
                    pdcOpenModal(e.currentTarget.value);
                  }
                },
                style: { width: "500px" },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (searchInputRef.current)
                  pdcOpenModal(searchInputRef.current.value);
              }}
              inputRef={searchInputRef}
            />
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
                  setPdcMode("add");
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
                      resetPDC();
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
                wait(100).then(() => {
                  const tableRows = tableRef.current.getDataFormatted();
                  const getLastCheck_No: any = tableRows[tableRows.length - 1];
                  if (modalCheckRef.current.getRefs().checknoRef.current) {
                    modalCheckRef.current.getRefs().checknoRef.current.value =
                      incrementCheckNo(getLastCheck_No?.Check_No);
                  }
                  tableRef.current.setSelectedRow(null);
                  tableRef.current.resetCheckBox();

                  setHasSelectedRow(null);
                  modalCheckRef.current.getRefs().checknoRef.current?.focus();
                });
                modalCheckRef.current?.showModal();
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
                        readOnly: true,
                        disabled: isDisableField,
                        type: "text",
                        style: { width: "300px" },
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === "NumpadEnter") {
                            e.preventDefault();
                            dateRef.current?.focus();
                          }
                        },
                      }}
                      inputRef={refNoRef}
                      icon={
                        <RestartAltIcon
                          sx={{
                            fontSize: "18px",
                            color: isDisableField ? "gray" : "black",
                          }}
                        />
                      }
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
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                          remakrsRef.current?.focus();
                        }
                      },
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
                      e.stopPropagation();
                      if (
                        (e.code === "NumpadEnter" && !e.shiftKey) ||
                        (e.code === "Enter" && !e.shiftKey)
                      ) {
                        pnRef.current?.focus();
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
                  style={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    gap: "15px",
                  }}
                >
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
                            clientOpenModal(pnRef.current.value);
                          }
                        }
                      },
                    }}
                    inputRef={pnRef}
                    icon={
                      <PersonSearchIcon
                        sx={{
                          fontSize: "18px",
                          color: isDisableField ? "gray" : "black",
                        }}
                      />
                    }
                    onIconClick={(e) => {
                      e.preventDefault();
                      if (pnRef.current) {
                        clientOpenModal(pnRef.current.value);
                      }
                    }}
                    disableIcon={isDisableField}
                  />

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
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                          clientnameRef.current?.focus();
                        }
                      },
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
                        e.stopPropagation();
                        if (
                          (e.code === "NumpadEnter" && !e.shiftKey) ||
                          (e.code === "Enter" && !e.shiftKey)
                        ) {
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
         <DataGridViewReact
        containerStyle={{
          flex:1,
          height:"auto"
        }}
          disbaleTable={isDisableField}
          ref={tableRef}
          rows={[]}
          columns={pdcColumn}
          showSequence={true}
          getSelectedItem={(rowSelected: any, _: any, RowIndex: any) => {
            if (rowSelected) {
              if (
                (rowSelected[6] && rowSelected[6] !== "") ||
                (rowSelected[7] && rowSelected[7] !== "") ||
                (rowSelected[8] && rowSelected[8] !== "")
              ) {
                setHasSelectedRow(null);
                tableRef.current.setSelectedRow(null);
                tableRef.current.resetCheckBox();

                return Swal.fire({
                  position: "center",
                  icon: "warning",
                  title: `Unable to delete. Check No ${rowSelected[0]} is already ${rowSelected[8]} issued of OR!`,
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
              setHasSelectedRow(RowIndex);
              modalCheckRef.current?.showModal();
              wait(100).then(() => {
                if (
                  modalCheckRef.current.getRefs().checknoRef.current &&
                  modalCheckRef.current.getRefs().bankRef.current &&
                  modalCheckRef.current.getRefs().branchRef.current &&
                  modalCheckRef.current.getRefs().remarksRef.current &&
                  modalCheckRef.current.getRefs().checkdateRef.current &&
                  modalCheckRef.current.getRefs().amountRef.current
                ) {
                  modalCheckRef.current.getRefs().checknoRef.current.value =
                    rowSelected[0];
                  modalCheckRef.current.getRefs().checkdateRef.current.value =
                    rowSelected[1];
                  modalCheckRef.current.getRefs().amountRef.current.value =
                    formatNumber(parseFloat(rowSelected[2].replace(/,/g, "")));
                  modalCheckRef.current.getRefs().bankRef.current.value =
                    rowSelected[3];
                  modalCheckRef.current.getRefs().branchRef.current.value =
                    rowSelected[4];
                  modalCheckRef.current.getRefs().remarksRef.current.value =
                    rowSelected[5];
                  modalCheckRef.current.getRefs()._slipCodeRef.current =
                    rowSelected[6] || "";
                  modalCheckRef.current.getRefs()._slipDateRef.current =
                    rowSelected[7] || "";
                  modalCheckRef.current.getRefs()._checkOR.current =
                    rowSelected[8] || "";
                  modalCheckRef.current.getRefs().bankCode.current =
                    rowSelected[9];

                  modalCheckRef.current.getRefs().bankRef.current.focus();
                }
              });
            } else {
              setHasSelectedRow(null);
            }
          }}
          onKeyDown={(rowSelected: any, RowIndex: any, e: any) => {
            if (e.code === "Delete" || e.code === "Backspace") {
              if (
                (rowSelected[6] && rowSelected[6] !== "") ||
                (rowSelected[7] && rowSelected[7] !== "") ||
                (rowSelected[8] && rowSelected[8] !== "")
              ) {
                setHasSelectedRow(null);
                tableRef.current.setSelectedRow(null);
                tableRef.current.resetCheckBox();

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
                    const newData = tableRef.current.getData();
                    newData.splice(RowIndex, 1);
                    tableRef.current.setData(newData);

                    setHasSelectedRow(null);
                    tableRef.current.setSelectedRow(null);
                    tableRef.current.resetCheckBox();
                  }, 100);
                }
              });
            }
          }}
        /> 
       
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
      </div>
    </>
  );
}

const ModalCheck = forwardRef(
  ({ handleOnSave, handleOnClose, hasSelectedRow }: any, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const checknoRef = useRef<HTMLInputElement>(null);
    const bankRef = useRef<HTMLInputElement>(null);
    const branchRef = useRef<HTMLInputElement>(null);
    const remarksRef = useRef<HTMLTextAreaElement>(null);
    const checkdateRef = useRef<HTMLInputElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);
    const bankCode = useRef("");
    const _checkcountRef = useRef<HTMLInputElement>(null);
    const searchModalInputRef = useRef<HTMLInputElement>(null);

    const _slipCodeRef = useRef("");
    const _slipDateRef = useRef("");
    const _checkOR = useRef("");

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };
    const closeDelayRef = useRef<any>(closeDelay);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        const refs = {
          checknoRef,
          bankRef,
          branchRef,
          remarksRef,
          checkdateRef,
          amountRef,
          bankCode,
          _checkcountRef,
          _slipCodeRef,
          _slipDateRef,
          _checkOR,
        };
        return refs;
      },
      checknoRef,
      bankRef,
      branchRef,
      remarksRef,
      checkdateRef,
      amountRef,
      bankCode,
      searchModalInputRef,
      closeDelay,
    }));

    const {
      UpwardTableModalSearch: BankUpwardTableModalSearch,
      openModal: BankOpenModal,
      closeModal: BankCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/accounting/search-pdc-banks",
      column: [
        { key: "Bank_Code", label: "Code", width: 100 },
        { key: "Bank", label: "Bank Name", width: 350 },
      ],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          wait(100).then(() => {
            bankCode.current = rowItm[0];
            if (bankRef.current) {
              bankRef.current.value = rowItm[1];
            }
            branchRef.current?.focus();
          });
          BankCloseModal();
        }
      },
    });

    useEffect(() => {
      window.addEventListener("keydown", (e: any) => {
        if (e.key === "Escape") {
          closeDelayRef.current();
        }
      });
    }, []);

    return showModal ? (
      <>
        <BankUpwardTableModalSearch />
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        <div
          style={{
            height: blick ? "202px" : "200px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
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
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Check Details
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
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "55%",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                padding: "10px",
              }}
            >
              <TextInput
                label={{
                  title: "Check No. : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: hasSelectedRow !== null,
                  type: "text",
                  style: { width: "160px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      bankRef.current?.focus();
                    }
                  },
                }}
                inputRef={checknoRef}
              />

              <TextInput
                containerStyle={{
                  width: "370px",
                }}
                label={{
                  title: "Bank : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: false,
                  type: "text",
                  style: { width: "300px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      BankOpenModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (bankRef.current) {
                    BankOpenModal(bankRef.current.value);
                  }
                }}
                inputRef={bankRef}
              />

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
                  style: { width: "300px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      remarksRef.current?.focus();
                    }
                  },
                }}
                inputRef={branchRef}
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
                  style: { width: "300px" },
                  onKeyDown: (e) => {
                    e.stopPropagation();
                    if (
                      (e.code === "NumpadEnter" && !e.shiftKey) ||
                      (e.code === "Enter" && !e.shiftKey)
                    ) {
                      checkdateRef.current?.focus();
                    }
                  },
                }}
                _inputRef={remarksRef}
              />
            </div>
            <div
              style={{
                width: "45%",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                position: "relative",
                padding: "10px",
                alignItems: "flex-end",
              }}
            >
              <TextInput
                label={{
                  title: "Date : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                input={{
                  type: "date",
                  style: { width: "200px" },
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      amountRef.current?.focus();
                    }
                  },
                }}
                inputRef={checkdateRef}
              />
              <TextFormatedInput
                label={{
                  title: "Amount : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                input={{
                  placeholder: "0.00",
                  defaultValue: "",
                  type: "text",
                  style: { width: "200px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      if (handleOnSave) {
                        _checkcountRef.current?.focus();
                      }
                    }
                  },
                }}
                inputRef={amountRef}
              />
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
                    min: 1,
                    defaultValue: "1",
                    type: "number",
                    style: { width: "200px", textAlign: "right" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        handleOnSave();
                      }
                    },
                  }}
                  inputRef={_checkcountRef}
                />
              )}
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  style={{
                    height: "22px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    if (handleOnSave) {
                      handleOnSave();
                    }
                  }}
                >
                  OK
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  style={{
                    height: "22px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    closeDelay();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);

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

function parseNumber(value: any) {
  return isNaN(value) || value === "" ? 0 : Number(value);
}
