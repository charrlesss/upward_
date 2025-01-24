import {
  useReducer,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import { wait } from "../../../../lib/wait";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { blue, brown, deepOrange, grey } from "@mui/material/colors";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";

import { flushSync } from "react-dom";
import SaveIcon from "@mui/icons-material/Save";
import {
  SelectInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { format, lastDayOfMonth } from "date-fns";
import PageHelmet from "../../../../components/Helmet";
import {
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { Loading } from "../../../../components/Loading";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import SearchIcon from "@mui/icons-material/Search";

const initialState = {
  totalDebit: "",
  totalCredit: "",
  totalBalance: "",

  jobAutoExp: false,
  jobTransactionDate: new Date(),
  jobType: "",
  search: "",
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

const selectedCollectionColumns = [
  { key: "code", label: "Code", width: 150 },
  { key: "acctName", label: "Account Name", width: 300 },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 170,
  },
  { key: "ClientName", label: "Name", width: 300 },
  { key: "debit", label: "Debit", width: 120, type: "number" },
  { key: "credit", label: "Credit", width: 120, type: "number" },
  // hide
  { key: "TC_Code", label: "TC", width: 120 },
  {
    key: "remarks",
    label: "Remarks",
    flex: 1,
    width: 300,
  },
  { key: "vatType", label: "Vat Type", width: 120 },
  { key: "invoice", label: "Invoice", width: 200 },
  { key: "TempID", label: "TempId", hide: true },
  { key: "IDNo", label: "I.D.", width: 300, hide: true },
  {
    key: "BranchCode",
    label: "BranchCode",
    width: 300,
    hide: true,
  },
];

export default function GeneralJournal() {
  const { executeQueryToClient } = useExecuteQueryFromClient();
  const [mode, setMode] = useState<"update" | "add" | "">("");
  const [monitoring, setMonitoring] = useState({
    totalRow: "0",
    totalDebit: "0.00",
    totalCredit: "0.00",
    balance: "0.00",
  });

  const [loadingJob, setLoadingJob] = useState(false);
  const inputSearchRef = useRef<HTMLInputElement>(null);

  const refRefNo = useRef<HTMLInputElement>(null);
  const _refSubRefNo = useRef<HTMLInputElement>(null);
  const refDate = useRef<HTMLInputElement>(null);
  const refExplanation = useRef<HTMLInputElement>(null);

  const refCode = useRef<HTMLInputElement>(null);
  const refAccountName = useRef<HTMLInputElement>(null);
  const refSubAccount = useRef<HTMLInputElement>(null);
  const refName = useRef<HTMLInputElement>(null);

  const refDebit = useRef<HTMLInputElement>(null);
  const refCredit = useRef<HTMLInputElement>(null);
  const refTC = useRef<HTMLInputElement>(null);
  const refRemarks = useRef<HTMLInputElement>(null);

  const refVat = useRef<HTMLSelectElement>(null);
  const refInvoice = useRef<HTMLInputElement>(null);

  //client details
  const refIDNo = useRef<string>("");
  const refSubAcct = useRef<string>("");

  //TC details
  const refTCDesc = useRef<string>("");

  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [openJobs, setOpenJobs] = useState(false);

  const table = useRef<any>(null);

  const modeAdd = mode === "add";
  const modeUpdate = mode === "update";
  const modeDefault = mode === "";

  const {
    isLoading: loadingGeneralJournalGenerator,
    refetch: refetchGeneralJournalGenerator,
  } = useQuery({
    queryKey: "general-journal-id-generator",
    queryFn: async () =>
      await myAxios.get(
        `/task/accounting/general-journal/get-general-journal-id`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      if (modeUpdate) {
        dispatch({
          type: "UPDATE_FIELD",
          field: "refNo",
          value: state.sub_refNo ?? "",
        });
        return;
      }
      wait(100).then(() => {
        if (refRefNo.current) {
          refRefNo.current.value =
            response.data.generateGeneralJournalID[0].general_journal_id;
        }
        if (_refSubRefNo.current) {
          _refSubRefNo.current.value =
            response.data.generateGeneralJournalID[0].general_journal_id;
        }

        if (refVat.current) {
          refVat.current.value = "Non-VAT";
        }
      });
    },
  });
  const {
    mutate: addGeneralJournalMutate,
    isLoading: loadingGeneralJournalMutate,
  } = useMutation({
    mutationKey: "add-journal-voucher",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/general-journal/add-general-journal",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      if (response.data.success) {
        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        }).then(() => {
          Swal.fire({
            text: "Do you want to print it?",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, print it!",
          }).then((result) => {
            if (result.isConfirmed) {
              const data = table.current.getData();
              const generalJournal: any = data.map((itm: any) => {
                return {
                  code: itm[0],
                  acctName: itm[1],
                  subAcctName: itm[2],
                  ClientName: itm[3],
                  debit: itm[4],
                  credit: itm[5],
                  TC_Code: itm[6],
                  remarks: itm[7],
                  vatType: itm[8],
                  invoice: itm[9],
                  TempID: itm[10],
                  IDNo: itm[11],
                  BranchCode: itm[12],
                };
              });

              mutatePrint({
                JVNo: refRefNo.current?.value,
                JVDate: refDate.current?.value,
                JVExp: refExplanation.current?.value,
                generalJournal,
              });
            }
            wait(100).then(() => {
              resetFieldRef();
              resetRowFieldRef();
              resetTable();
              resetMonitoring();
              setMode("");
            });
          });
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  const {
    mutate: mutateVoidGeneralJournal,
    isLoading: loadingVoidGeneralJournalMutate,
  } = useMutation({
    mutationKey: "void-journal-voucher",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/general-journal/void-general-journal",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      if (response.data.success) {
        resetFieldRef();
        resetRowFieldRef();
        resetTable();
        resetMonitoring();
        setMode("");

        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: response.data.message,
        timer: 1500,
      });
    },
  });
  const {
    mutate: getSearchSelectedGeneralJournal,
    isLoading: loadingGetSearchSelectedGeneralJournal,
  } = useMutation({
    mutationKey: "get-selected-search-general-journal",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/general-journal/get-selected-search-general-journal",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const selected = response.data.getSelectedSearchGeneralJournal;
      const { explanation, dateEntry, refNo } = selected[0];

      if (refRefNo.current) {
        refRefNo.current.value = refNo;
      }
      if (refDate.current) {
        refDate.current.value = format(new Date(dateEntry), "yyyy-MM-dd");
      }
      if (refExplanation.current) {
        refExplanation.current.value = explanation;
      }

      table.current.setDataFormated(selected);
      monitor();
    },
  });
  //Collection Search
  const {
    UpwardTableModalSearch: SearchCollectionUpwardTableModalSearch,
    openModal: searchCollectionCreditOpenModal,
    closeModal: searchCollectionCreditCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/accounting/general-journal/search-general-journal",
    column: [
      { key: "Date_Entry", headerName: "Date", width: 130 },
      { key: "Source_No", headerName: "Ref No.", width: 150 },
      {
        key: "Explanation",
        headerName: "Explanation",
        width: 300,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          getSearchSelectedGeneralJournal({
            Source_No: rowItm[1],
          });
          setMode("update");
          table.current.resetTable();
          resetRow();
        });
        searchCollectionCreditCloseModal();
      }
    },
  });
  // chart of account Search
  const {
    UpwardTableModalSearch: ChartAccountUpwardTableModalSearch,
    openModal: chartAccountOpenModal,
    closeModal: chartAccountCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/accounting/general-journal/get-chart-account",
    column: [
      { key: "Acct_Code", label: "Account Code", width: 130 },
      { key: "Acct_Title", label: "Account Title.", width: 250 },
      {
        key: "Short",
        label: "Short",
        width: 300,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (refCode.current) {
            refCode.current.value = rowItm[0];
          }
          if (refAccountName.current) {
            refAccountName.current.value = rowItm[1];
          }

          refName.current?.focus();
        });
        chartAccountCloseModal();
      }
    },
  });
  // Client Search
  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/accounting/search-pdc-policy-id",
    column: [
      { key: "Type", label: "Type", width: 130 },
      { key: "IDNo", label: "ID No.", width: 150 },
      {
        key: "Name",
        label: "Name",
        width: 300,
      },
      {
        key: "ID",
        label: "ID",
        hide: true,
      },
      {
        key: "client_id",
        label: "client_id",
        hide: true,
      },
      {
        key: "sub_account",
        label: "sub_account",
        hide: true,
      },
      {
        key: "ShortName",
        label: "ShortName",
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (refName.current) {
            refName.current.value = rowItm[2] ?? "";
          }
          if (refSubAccount.current) {
            refSubAccount.current.value = rowItm[6] ?? "";
          }
          refIDNo.current = rowItm[1];
          refSubAcct.current = rowItm[5];

          refDebit.current?.focus();
        });
        clientCloseModal();
      }
    },
  });
  //  Transaction Accoun Search
  const {
    UpwardTableModalSearch: TransactionAccountUpwardTableModalSearch,
    openModal: TransactionAccountOpenModal,
    closeModal: TransactionAccountCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/general-journal/get-transaction-account",
    column: [
      { key: "Code", label: "Code", width: 130 },
      {
        key: "Description",
        label: "Description",
        width: 300,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (refTC.current) {
            refTC.current.value = rowItm[0];
          }
          refTCDesc.current = rowItm[1];
          refRemarks.current?.focus();
        });
        TransactionAccountCloseModal();
      }
    },
  });

  // print
  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/accounting/general-journal/print",
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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleOnSave = useCallback(() => {
    if (refRefNo.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide reference number!",
        timer: 1500,
      });
    }
    if (refExplanation.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide explanation!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refExplanation.current?.focus();
        });
      });
    }
    if (
      parseFloat(monitoring.totalDebit.replace(/,/g, "")) <= 0 ||
      parseFloat(monitoring.totalCredit.replace(/,/g, "")) <= 0
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must not be zero(0), please double check the entries",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {});
      });
    }
    if (monitoring.totalDebit !== monitoring.totalCredit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must be balance, please double check the entries",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {});
      });
    }

    const generalJournalData: any = table.current.getData();
    const generalJournalDataFormatted = generalJournalData.map((itm: any) => {
      return {
        code: itm[0],
        acctName: itm[1],
        subAcctName: itm[2],
        ClientName: itm[3],
        debit: itm[4],
        credit: itm[5],
        TC_Code: itm[6],
        remarks: itm[7],
        vatType: itm[8],
        invoice: itm[9],
        TempID: itm[10],
        IDNo: itm[11],
        BranchCode: itm[12],
      };
    });
    if (modeUpdate) {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addGeneralJournalMutate({
            hasSelected: true,
            refNo: refRefNo.current?.value,
            dateEntry: refDate.current?.value,
            explanation: refExplanation.current?.value,
            generalJournal: generalJournalDataFormatted,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addGeneralJournalMutate({
            hasSelected: false,
            refNo: refRefNo.current?.value,
            dateEntry: refDate.current?.value,
            explanation: refExplanation.current?.value,
            generalJournal: generalJournalDataFormatted,
          });
        },
      });
    }
  }, [monitoring, addGeneralJournalMutate, modeUpdate]);
  function handleVoid() {
    codeCondfirmationAlert({
      isUpdate: false,
      text: `Are you sure you want to void ${state.refNo}`,
      cb: (userCodeConfirmation) => {
        mutateVoidGeneralJournal({
          refNo: refRefNo.current?.value,
          dateEntry: refDate.current?.value,
          userCodeConfirmation,
        });
      },
    });
  }
  function resetRow() {
    if (refCode.current) {
      refCode.current.value = "";
    }
    if (refAccountName.current) {
      refAccountName.current.value = "";
    }
    if (refName.current) {
      refName.current.value = "";
    }
    if (refSubAccount.current) {
      refSubAccount.current.value = "";
    }
    if (refTC.current) {
      refTC.current.value = "";
    }
    if (refDebit.current) {
      refDebit.current.value = "";
    }
    if (refCredit.current) {
      refCredit.current.value = "";
    }
    if (refRemarks.current) {
      refRemarks.current.value = "";
    }
    if (refVat.current) {
      refVat.current.value = "Non-VAT";
    }
    if (refInvoice.current) {
      refInvoice.current.value = "";
    }

    refTCDesc.current = "";
    refIDNo.current = "";
    refSubAcct.current = "";
  }
  function handleRowSave() {
    if (refCode.current && refCode.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is required!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          return chartAccountOpenModal(state.code);
        });
      });
    }

    if (refName.current && refName.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "ID is required!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          return clientOpenModal(refName.current?.value);
        });
      });
    }

    if (
      refDebit.current &&
      isNaN(parseFloat(refDebit.current?.value.replace(/,/g, "")))
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Debit is required!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refDebit.current?.focus();
        });
      });
    }
    if (
      refCredit.current &&
      isNaN(parseFloat(refCredit.current?.value.replace(/,/g, "")))
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit is required!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refCredit.current?.focus();
        });
      });
    }
    if (
      refDebit.current &&
      refCredit.current &&
      parseFloat(refCredit.current?.value.replace(/,/g, "")) === 0 &&
      parseFloat(refDebit.current?.value.replace(/,/g, "")) === 0
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit and Debit must be different!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refCredit.current?.focus();
        });
      });
    }
    if (refTC.current && refTC.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is required!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          TransactionAccountOpenModal(state.TC_Code);
        });
      });
    }
    if (refCode.current && refCode.current?.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is too long!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refCode.current?.focus();
        });
      });
    }
    if (refName.current && refName.current?.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Client name is too long!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refName.current?.focus();
        });
      });
    }
    if (refTC.current && refTC.current.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is too long!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refTC.current?.focus();
        });
      });
    }
    if (refInvoice.current && refInvoice.current.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invoice is too long!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          refInvoice.current?.focus();
        });
      });
    }
    const getSelectedRow = table.current.getSelectedRow();
    const isUpdate = getSelectedRow !== null;

    Swal.fire({
      title: isUpdate
        ? `Are you sure you want to update row?`
        : `Are you sure you want to add new row?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isUpdate ? "Yes, update it!" : "Yes Add it",
    }).then((result) => {
      if (result.isConfirmed) {
        if (
          refCode.current &&
          refAccountName.current &&
          refSubAccount.current &&
          refName.current &&
          refDebit.current &&
          refCredit.current &&
          refTC.current &&
          refRemarks.current &&
          refVat.current &&
          refInvoice.current
        ) {
          const newData: any = table.current.getData();
          const newInput = [
            refCode.current.value,
            refAccountName.current.value,
            refSubAccount.current.value,
            refName.current.value,
            refDebit.current.value,
            refCredit.current.value,
            refTC.current.value,
            refRemarks.current.value,
            refVat.current.value,
            refInvoice.current.value,
            refIDNo.current,
            refIDNo.current,
            refSubAcct.current,
          ];

          let taxtInput: any = [];
          let taxableamt = 0;

          if (newInput[8] === "VAT" && newInput[0] !== "1.06.02") {
            const debit = parseFloat(newInput[4].replace(/,/g, ""));
            const credit = parseFloat(newInput[5].replace(/,/g, ""));
            if (debit > 0) {
              taxableamt = debit / 1.12;
              newInput[4] = formatNumber(taxableamt);
            } else {
              taxableamt = credit / 1.12;
              newInput[5] = formatNumber(taxableamt);
            }

            let inputtax = taxableamt * 0.12;
            let taxtDebit = "";
            let taxtCredit = "";
            if (debit > 0) {
              taxtDebit = formatNumber(inputtax);
              taxtCredit = newInput[5];
            } else {
              taxtCredit = formatNumber(inputtax);
              taxtDebit = newInput[4];
            }

            taxtInput = [
              "1.06.02",
              "Input Tax",
              refSubAccount.current.value,
              refName.current.value,
              taxtDebit,
              taxtCredit,
              refTC.current.value,
              refRemarks.current.value,
              refVat.current.value,
              refInvoice.current.value,
              refIDNo.current,
              refIDNo.current,
              refSubAcct.current,
            ];
          }
          if (isUpdate) {
            newData[getSelectedRow] = newInput;
            table.current.setSelectedRow(null);
            table.current.resetCheckBox(null);
          } else {
            newData[newData.length] = newInput;
          }
          table.current.setData(newData);
          setTimeout(() => {
            if (newInput[8] === "VAT" && newInput[0] !== "1.06.02") {
              const getNewData = table.current.getData();
              if (isUpdate) {
                getNewData.splice(getSelectedRow + 1, 0, taxtInput);
              } else {
                getNewData[getNewData.length] = taxtInput;
              }
              table.current.setData(getNewData);
            }
            resetRow();
          }, 100);

          setTimeout(() => {
            if (refCode.current) {
              refCode.current.focus();
            }
          }, 350);
          monitor();
        }
      }
    });
  }
  function handleJobs() {
    setOpenJobs((d) => !d);
  }
 
  function onCancel() {
    resetFieldRef();
    resetRowFieldRef();
    resetTable();
    resetMonitoring();
    setMode("");
  }
  function monitor() {
    setTimeout(() => {
      const getData = table.current.getData();
      const totalCredit = getData.reduce(
        (a: any, b: any) => a + parseFloat(b[4].replace(/,/g, "")),
        0
      );
      const totalDebit = getData.reduce(
        (a: any, b: any) => a + parseFloat(b[5].replace(/,/g, "")),
        0
      );
      setMonitoring({
        totalRow: `${getData.length}`,
        totalCredit: formatNumber(totalCredit),
        totalDebit: formatNumber(totalDebit),
        balance: formatNumber(totalCredit - totalDebit),
      });
    }, 200);
  }
  function resetFieldRef() {
    refetchGeneralJournalGenerator();
    if (refDate.current) {
      refDate.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (refExplanation.current) {
      refExplanation.current.value = "";
    }
  }
  function resetRowFieldRef() {
    if (refCode.current) {
      refCode.current.value = "";
    }
    if (refAccountName.current) {
      refAccountName.current.value = "";
    }
    if (refSubAccount.current) {
      refSubAccount.current.value = "";
    }
    if (refName.current) {
      refName.current.value = "";
    }

    if (refDebit.current) {
      refDebit.current.value = "";
    }
    if (refCredit.current) {
      refCredit.current.value = "";
    }
    if (refTC.current) {
      refTC.current.value = "";
    }
    if (refRemarks.current) {
      refRemarks.current.value = "";
    }
    if (refVat.current) {
      refVat.current.value = "Non-VAT";
    }
    if (refInvoice.current) {
      refInvoice.current.value = "";
    }
  }
  function resetTable() {
    table.current.resetTable();
  }
  function resetMonitoring() {
    setMonitoring({
      totalRow: "0",
      totalDebit: "0.00",
      totalCredit: "0.00",
      balance: "0.00",
    });
  }
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleOnSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOnSave]);
  function formatNumber(Amount: number) {
    return Amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  async function DoRPTTransactionNILHN() {
    setLoadingJob(true);
    setOpenJobs(false);
    setTimeout(async () => {
      let JobDate = new Date(state.jobTransactionDate);
      let dtFrom = format(JobDate, "yyyy-MM-01-");
      let dtTo = format(lastDayOfMonth(JobDate), "yyyy-MM-dd");
      let iRow = 0;

      const qry = `
    select 
      a.PolicyNo,
      a.IDNo,
      (TotalDue - ifnull(b.TotalPaid,0)) as 'Amount',
      c.Mortgagee 
    from Policy a 
      left join (
        select 
          IDNo,
          sum(Debit) as 'TotalPaid' 
        from collection 
        group by IDNo
      ) b on b.IDNo = a.PolicyNo 
      inner join VPolicy c on c.PolicyNo = a.PolicyNo 
      where
      (TotalDue - ifnull(b.TotalPaid,0)) <> 0 and 
      a.PolicyType = 'TPL' and 
      c.Mortgagee = 'N I L - HN' and 
      (
        a.DateIssued >= '${dtFrom}' and 
        a.DateIssued <= '${dtTo}'
      ) 
      order by a.DateIssued
      `;
      let dgvJournal: any = [];
      const { data } = await executeQueryToClient(qry);
      const dataArray = data.data;
      if (dataArray.length > 0) {
        let totalAmount = 0;
        let i = 0;
        for (const itm of dataArray) {
          let tmpID = "";
          if (i === 0) {
            iRow = 0;
          } else {
            iRow = iRow + 1;
          }

          tmpID = itm.IDNo;
          const { data: tmpNameRes } = await executeQueryToClient(
            `SELECT Shortname ,Sub_ShortName, Sub_Acct FROM (${ID_Entry}) id_entry WHERE IDNo = '${tmpID}'`
          );
          dgvJournal[iRow] = [
            "1.03.01", // 0
            "Premium Receivables", // 1
            tmpNameRes.data[0]?.Sub_ShortName, // 2
            tmpNameRes.data[0]?.Shortname, // 3
            "0.00", // 4
            formatNumber(itm.Amount), //5
            "RPT", // 6
            "", // 7
            "Non-VAT", //8
            "",
            itm.PolicyNo,
            itm.PolicyNo,
            tmpNameRes.data[0]?.Sub_Acct, // 8
          ];

          totalAmount =
            totalAmount + parseFloat(itm.Amount.toString().replace(/,/g, ""));
          i += 1;
        }

        const { data: tmpNameRes } = await executeQueryToClient(
          `SELECT Shortname ,Sub_ShortName, Sub_Acct FROM (${ID_Entry}) id_entry WHERE IDNo = 'O-1024-00011'`
        );

        dgvJournal[iRow + 1] = [
          "1.03.01",
          "Premium Receivables",
          tmpNameRes.data[0]?.Sub_ShortName, // 2
          tmpNameRes.data[0]?.Shortname, // 3
          formatNumber(totalAmount), //4
          "0.00", // 5,
          "RPT", // 7
          "", // 9
          "Non-VAT", //8
          "",
          "1.05.02", // 9
          "1.05.02", // 10
          tmpNameRes.data[0]?.Sub_Acct, // 12
        ];
        table.current.setData(dgvJournal);
        setMode("update");
        setOpenJobs(false);
      }
      setLoadingJob(false);
    }, 300);
  }

  return (
    <>
      <PageHelmet title="General Journal" />
      <TransactionAccountUpwardTableModalSearch />
      <ClientUpwardTableModalSearch />
      <ChartAccountUpwardTableModalSearch />
      <SearchCollectionUpwardTableModalSearch />
      {(loadingGetSearchSelectedGeneralJournal ||
        loadingJob ||
        loadingGeneralJournalMutate ||
        loadingVoidGeneralJournalMutate ||
        isLoadingPrint) && <Loading />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "10px",
          background: "#F1F1F1",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
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
                    searchCollectionCreditOpenModal(e.currentTarget.value);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const datagridview = document.querySelector(
                      ".grid-container"
                    ) as HTMLDivElement;
                    datagridview.focus();
                  }
                },
                style: { width: "500px" },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (inputSearchRef.current)
                  searchCollectionCreditOpenModal(inputSearchRef.current.value);
              }}
              inputRef={inputSearchRef}
            />
            {modeDefault && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setMode("add");
                }}
                color="primary"
              >
                New
              </Button>
            )}
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              loading={loadingGeneralJournalMutate}
              disabled={modeDefault}
              onClick={handleOnSave}
              color="success"
              variant="contained"
            >
              Save
            </LoadingButton>
            {(modeAdd || modeUpdate) && (
              <LoadingButton
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
                color="error"
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
                      onCancel();
                    }
                  });
                }}
                disabled={modeDefault}
              >
                Cancel
              </LoadingButton>
            )}
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
                background: deepOrange[500],
                ":hover": {
                  background: deepOrange[600],
                },
              }}
              onClick={handleVoid}
              loading={loadingVoidGeneralJournalMutate}
              disabled={modeDefault}
              variant="contained"
              startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
            >
              Void
            </LoadingButton>
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
                background: brown[500],
                ":hover": {
                  background: brown[600],
                },
              }}
              onClick={handleJobs}
              variant="contained"
              startIcon={<CardTravelIcon sx={{ width: 20, height: 20 }} />}
            >
              Jobs
            </LoadingButton>
     
            <Button
              disabled={modeDefault}
              id="basic-button"
              aria-haspopup="true"
              onClick={() => {
                const data = table.current.getData();
                const generalJournal: any = data.map((itm: any) => {
                  return {
                    code: itm[0],
                    acctName: itm[1],
                    subAcctName: itm[2],
                    ClientName: itm[3],
                    debit: itm[4],
                    credit: itm[5],
                    TC_Code: itm[6],
                    remarks: itm[7],
                    vatType: itm[8],
                    invoice: itm[9],
                    TempID: itm[10],
                    IDNo: itm[11],
                    BranchCode: itm[12],
                  };
                });

                mutatePrint({
                  JVNo: refRefNo.current?.value,
                  JVDate: refDate.current?.value,
                  JVExp: refExplanation.current?.value,
                  generalJournal,
                });
              }}
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
          </div>
          <div
            style={{
              fontSize: "13px",
              border: "1px solid #d4d4d8",
              width: "100%",
              display: "flex",
              columnGap: "50px",
              height: "30px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Total Rows:</span>{" "}
              <strong>{monitoring.totalRow}</strong>
            </p>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Total Debit:</span>{" "}
              <strong>{monitoring.totalDebit}</strong>
            </p>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Total Credit:</span>{" "}
              <strong>{monitoring.totalCredit}</strong>
            </p>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Balance:</span>{" "}
              <strong
                style={{
                  color:
                    parseInt(monitoring.balance.replace(/,/g, "")) !== 0
                      ? "red"
                      : "black",
                }}
              >
                {monitoring.balance}
              </strong>
            </p>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "auto",
            display: "flex",
            marginTop: "10px",
            gap: "10px",
            padding: "5px",
          }}
        >
          {loadingGeneralJournalGenerator ? (
            <LoadingButton loading={loadingGeneralJournalGenerator} />
          ) : (
            <TextInput
              label={{
                title: "Ref. No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: modeDefault || modeUpdate,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refDate.current?.focus();
                  }
                },
              }}
              inputRef={refRefNo}
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
              defaultValue: format(new Date(), "yyyy-MM-dd"),
              disabled: modeDefault,
              type: "date",
              style: { width: "190px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  refExplanation.current?.focus();
                }
              },
            }}
            inputRef={refDate}
          />
          <TextInput
            label={{
              title: "Explanation : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "90px",
              },
            }}
            input={{
              disabled: modeDefault,
              type: "text",
              style: { width: "600px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  refCode.current?.focus();
                }
              },
            }}
            inputRef={refExplanation}
          />
        </div>
        <fieldset
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            position: "relative",
            width: "100%",
            height: "auto",
            marginTop: "10px",

            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <TextInput
              label={{
                title: "Code : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refCode.current) {
                      chartAccountOpenModal(refCode.current.value);
                    }
                  }
                },
              }}
              inputRef={refCode}
              icon={
                <SupervisorAccountIcon
                  sx={{
                    fontSize: "18px",
                    color: modeDefault ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refCode.current) {
                  chartAccountOpenModal(refCode.current.value);
                }
              }}
              disableIcon={modeDefault}
            />
            <TextInput
              label={{
                title: "Account Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                readOnly: true,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refSubAccount.current?.focus();
                  }
                },
              }}
              inputRef={refAccountName}
            />

            <TextInput
              label={{
                title: "Sub Account : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                readOnly: true,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refName.current?.focus();
                  }
                },
              }}
              inputRef={refSubAccount}
            />

            <TextInput
              label={{
                title: "I.D : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refName.current) {
                      clientOpenModal(e.currentTarget.value);
                    }
                  }
                },
              }}
              inputRef={refName}
              icon={
                <AccountCircleIcon
                  sx={{
                    fontSize: "18px",
                    color: modeDefault ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refName.current) {
                  clientOpenModal(refName.current.value);
                }
              }}
              disableIcon={modeDefault}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <TextFormatedInput
              label={{
                title: "Debit : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refCredit.current?.focus();
                  }
                },
              }}
              inputRef={refDebit}
            />
            <TextFormatedInput
              label={{
                title: "Credit : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refTC.current?.focus();
                  }
                },
              }}
              inputRef={refCredit}
            />
            <TextInput
              label={{
                title: "TC : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refTC.current) {
                      TransactionAccountOpenModal(e.currentTarget.value);
                    }
                  }
                },
              }}
              inputRef={refTC}
              icon={
                <AccountBalanceWalletIcon
                  sx={{
                    fontSize: "18px",
                    color: modeDefault ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refTC.current) {
                  TransactionAccountOpenModal(refTC.current.value);
                }
              }}
              disableIcon={modeDefault}
            />
            <TextInput
              label={{
                title: "Remarks : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refVat.current?.focus();
                  }
                },
              }}
              inputRef={refRemarks}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <SelectInput
              label={{
                title: "Vat Type : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              selectRef={refVat}
              select={{
                disabled: modeDefault,
                style: { width: "190px", height: "22px" },
                defaultValue: "Non-VAT",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    refInvoice.current?.focus();
                  }
                },
              }}
              datasource={[{ key: "VAT" }, { key: "Non-VAT" }]}
              values={"key"}
              display={"key"}
            />
            <TextInput
              label={{
                title: "OR/Invoice No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: modeDefault,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    handleRowSave();
                  }
                },
              }}
              inputRef={refInvoice}
            />

            <Button
              disabled={modeDefault}
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: "12px" }} />}
              onClick={() => {
                handleRowSave();
              }}
              color="success"
            >
              Save Row
            </Button>
          </div>
        </fieldset>
        <DataGridViewReact
          ref={table}
          columns={selectedCollectionColumns}
          height="380px"
          getSelectedItem={(rowItm: any) => {
            if (rowItm) {
              refIDNo.current = rowItm[11];
              refSubAcct.current = rowItm[12];

              if (refCode.current) {
                refCode.current.value = rowItm[0];
              }
              if (refAccountName.current) {
                refAccountName.current.value = rowItm[1];
              }
              if (refSubAccount.current) {
                refSubAccount.current.value = rowItm[2];
              }
              if (refName.current) {
                refName.current.value = rowItm[3];
              }
              if (refDebit.current) {
                refDebit.current.value = rowItm[4];
              }
              if (refCredit.current) {
                refCredit.current.value = rowItm[5];
              }
              if (refTC.current) {
                refTC.current.value = rowItm[6];
              }
              if (refRemarks.current) {
                refRemarks.current.value = rowItm[7];
              }
              if (refVat.current) {
                refVat.current.value = rowItm[8];
              }
              if (refInvoice.current) {
                refInvoice.current.value = rowItm[9];
              }
            } else {
              resetRow();
            }
          }}
          onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
            if (e.code === "Delete" || e.code === "Backspace") {
              const isConfim = window.confirm(
                `Are you sure you want to delete?`
              );
              if (isConfim) {
                const debitTableData = table.current.getData();
                debitTableData.splice(rowIdx, 1);
                table.current.setData(debitTableData);

                setTimeout(() => {
                  monitor();
                }, 200);

                return;
              }
            }
          }}
        />
        <Modal open={openJobs} onClose={() => setOpenJobs(false)}>
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 470,
              bgcolor: "background.paper",
              p: 4,
            }}
          >
            <IconButton
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
              }}
              aria-label="search-client"
              onClick={() => setOpenJobs(false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ marginBottom: "20px" }}
            >
              Jobs
            </Typography>
            <div
              style={{
                width: "400px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  marginBottom: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    sx={{
                      width: "200px",
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        name: "",
                        InputLabelProps: {
                          style: {
                            fontSize: "14px",
                          },
                        },
                        InputProps: {
                          style: { height: "27px", fontSize: "14px" },
                        },
                      },
                    }}
                    label={"Transaction Date: "}
                    views={["month", "year"]}
                    value={state.jobTransactionDate}
                    onChange={(value) => {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "jobTransactionDate",
                        value: value,
                      });
                    }}
                  />
                </LocalizationProvider>
                <FormControlLabel
                  sx={{
                    height: "30px",
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                    },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={state.jobAutoExp}
                      onChange={(e) => {
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "jobAutoExp",
                          value: !state.jobAutoExp,
                        });
                      }}
                    />
                  }
                  label="Auto Explanation"
                />
              </div>
              <FormControl
                fullWidth
                size="small"
                variant="outlined"
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
                <InputLabel id="label-selection-job-type">
                  Type of Job
                </InputLabel>
                <Select
                  labelId="label-selection-job-type"
                  value={state.jobType}
                  name="jobType"
                  onChange={handleInputChange}
                  autoWidth
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                >
                  <MenuItem value={""}> </MenuItem>
                  <MenuItem value={"0"}>Reversal of Accrued Interest </MenuItem>
                  <MenuItem value={"1"}>
                    {" "}
                    Income Recognition & Accrual of Interest
                  </MenuItem>
                  <MenuItem value={"2"}>Penalty Charges</MenuItem>
                  <MenuItem value={"3"}>Penalty Income</MenuItem>
                  <MenuItem value={"4"}>RPT Transaction (NIL-HN)</MenuItem>
                  <MenuItem value={"5"}>RPT Transaction (AMIFIN)</MenuItem>
                  <MenuItem value={"6"}>RPT Income</MenuItem>
                  <MenuItem value={"7"}>Monthly Accrual Expenses</MenuItem>
                  <MenuItem value={"8"}>Monthly Accrual Income</MenuItem>
                  <MenuItem value={"9"}>
                    Production (Milestone Guarantee)
                  </MenuItem>
                  <MenuItem value={"10"}>
                    Production (Liberty Insurance Co.)
                  </MenuItem>
                  <MenuItem value={"11"}>Production (Federal Phoenix)</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div
              style={{
                display: "flex",
                columnGap: "30px",
                alignItems: "flex-end",
                marginTop: "20px",
              }}
            >
              <LoadingButton
                color="success"
                variant="contained"
                onClick={() => {
                  if (state.jobType === "4") {
                    DoRPTTransactionNILHN();
                  }
                }}
              >
                Create Job
              </LoadingButton>
              <Button
                // ref={checkModalSaveButton}
                color="error"
                variant="contained"
                onClick={() => setOpenJobs(false)}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Modal>
      </div>
    </>
  );
}

const ID_Entry = `
SELECT 
       id_entry.IDNo,
       id_entry.ShortName as Shortname,
       IDType,
       b.Acronym as Sub_Acct,
       b.ShortName as Sub_ShortName
   FROM
       (SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_client_id AS IDNo,
               aa.sub_account,
               'Client' as IDType
       FROM
           entry_client aa UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_agent_id AS IDNo,
               aa.sub_account,
               'Agent' as IDType
       FROM
           entry_agent aa UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_employee_id AS IDNo,
               aa.sub_account,
               'Employee' as IDType
       FROM
           entry_employee aa UNION ALL SELECT 
           aa.fullname AS ShortName,
               aa.entry_fixed_assets_id AS IDNo,
               sub_account,
                'Fixed Assets' as IDType
       FROM
           entry_fixed_assets aa UNION ALL SELECT 
           aa.description AS ShortName,
               aa.entry_others_id AS IDNo,
               aa.sub_account,
               'Others' as IDType
       FROM
           entry_others aa UNION ALL SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_supplier_id AS IDNo,
               aa.sub_account,
                'Supplier' as IDType
       FROM
           entry_supplier aa) id_entry
      left join sub_account b ON id_entry.sub_account = b.Sub_Acct
 `;
