import { useContext, useState, useRef, useEffect, useCallback } from "react";
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
import { brown, deepOrange, grey } from "@mui/material/colors";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
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
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import { Loading } from "../../../../components/Loading";
import SearchIcon from "@mui/icons-material/Search";
import "../../../../style/monbileview/accounting/generaljournal.css";

const selectedCollectionColumns = [
  { key: "code", label: "Code", width: 80, freeze: true },
  { key: "acctName", label: "Account Name", width: 200, freeze: true },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 90,
  },
  { key: "IDNo", label: "I.D.", width: 150 },
  { key: "ClientName", label: "Name", width: 300, freeze: true },
  { key: "debit", label: "Debit", width: 100, type: "number" },
  { key: "credit", label: "Credit", width: 100, type: "number" },
  // hide
  { key: "TC_Code", label: "TC", width: 60 },
  {
    key: "remarks",
    label: "Remarks",
    flex: 1,
    width: 300,
  },
  { key: "vatType", label: "Vat Type", width: 100 },
  { key: "invoice", label: "Invoice", width: 200 },
  { key: "TempID", label: "TempId", hide: true },
  {
    key: "BranchCode",
    label: "BranchCode",
    width: 300,
    hide: true,
  },
];

export default function GeneralJournal() {
  const [mode, setMode] = useState<"update" | "add" | "">("");
  const [monitoring, setMonitoring] = useState({
    totalRow: "0",
    totalDebit: "0.00",
    totalCredit: "0.00",
    balance: "0.00",
  });
  const [jobTransactionDate, setJobTransactionDate] = useState<any>(new Date());
  const [jobType, setJobType] = useState<any>("4");
  const [jobAutoExp, setJobAutoExp] = useState<any>(false);

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
  const [openJobs, setOpenJobs] = useState(false);

  const table = useRef<any>(null);

  const clientModalRef = useRef<any>(null);
  const chartOfAccountModalRef = useRef<any>(null);
  const transactionOfAccountModalRef = useRef<any>(null);
  const searchGeneralJournalModalRef = useRef<any>(null);

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
              const generalJournal = table.current.getData();

              mutatePrint({
                JVNo: refRefNo.current?.value,
                JVDate: refDate.current?.value,
                JVExp: refExplanation.current?.value,
                generalJournal,
                reportTitle:
                  process.env.REACT_APP_DEPARTMENT === "UMIS"
                    ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                    : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
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
      table.current.setData(selected);
      monitor();
    },
  });
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

      window.open(
        `/${
          process.env.REACT_APP_DEPARTMENT
        }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
        "_blank"
      );
    },
  });
  const {
    mutate: mutateDoRPTTransactionNILHNASTRA,
    isLoading: isLoadingDoRPTTransactionNILHNASTRA,
  } = useMutation({
    mutationKey: "rpt-transacation-astra",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/general-journal/rpt-transacation-astra",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      table.current.setData(response.data.data);
      setMode("update");
      setOpenJobs(false);
      setMonitoring({
        totalRow: response.data.data.length,
        totalDebit: formatNumber(response.data.totalAmount),
        totalCredit: formatNumber(response.data.totalAmount),
        balance: "0.00",
      });
    },
  });
  const {
    mutate: mutateDoRPTTransactionNILHN,
    isLoading: isLoadingDoRPTTransactionNILHN,
  } = useMutation({
    mutationKey: "rpt-transacation-NILHN",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/general-journal/rpt-transacation-NILHN",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      table.current.setData(response.data.data);
      setMode("update");
      setOpenJobs(false);
      setMonitoring({
        totalRow: response.data.data.length,
        totalDebit: formatNumber(response.data.totalAmount),
        totalCredit: formatNumber(response.data.totalAmount),
        balance: "0.00",
      });
    },
  });

  function handleVoid() {
    codeCondfirmationAlert({
      isUpdate: false,
      text: `Are you sure you want to void ${refRefNo.current?.value}`,
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
          chartOfAccountModalRef.current.openModal(refCode.current?.value);
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
          return clientModalRef.current.openModal(refName.current?.value);
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
          transactionOfAccountModalRef.current.openModal(refTC.current?.value);
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
          const newInput = {
            code: refCode.current.value,
            acctName: refAccountName.current.value,
            subAcctName: refSubAccount.current.value,
            IDNo: refIDNo.current,
            ClientName: refName.current.value,
            debit: refDebit.current.value,
            credit: refCredit.current.value,
            TC_Code: refTC.current.value,
            remarks: refRemarks.current.value,
            vatType: refVat.current.value,
            invoice: refInvoice.current.value,
            TempID: "",
            BranchCode: refSubAcct.current,
          };

          let taxtInput: any = [];
          let taxableamt = 0;

          if (newInput.vatType === "VAT" && newInput.code !== "1.06.02") {
            const debit = parseFloat(newInput.debit.replace(/,/g, ""));
            const credit = parseFloat(newInput.credit.replace(/,/g, ""));
            if (debit > 0) {
              taxableamt = debit / 1.12;
              newInput.debit = formatNumber(taxableamt);
            } else {
              taxableamt = credit / 1.12;
              newInput.credit = formatNumber(taxableamt);
            }

            let inputtax = taxableamt * 0.12;
            let taxtDebit = "";
            let taxtCredit = "";
            if (debit > 0) {
              taxtDebit = formatNumber(inputtax);
              taxtCredit = newInput.credit;
            } else {
              taxtCredit = formatNumber(inputtax);
              taxtDebit = newInput.debit;
            }

            taxtInput = {
              code: "1.06.02",
              acctName: "Input Tax",
              subAcctName: refSubAccount.current.value,
              IDNo: refIDNo.current,
              ClientName: refName.current.value,
              debit: taxtDebit,
              credit: taxtCredit,
              TC_Code: refTC.current.value,
              remarks: refRemarks.current.value,
              vatType: refVat.current.value,
              invoice: refInvoice.current.value,
              TempID: "",
              BranchCode: refSubAcct.current,
            };
          }
          if (isUpdate) {
            newData[getSelectedRow] = newInput;
            table.current.resetTable();
          } else {
            newData[newData.length] = newInput;
          }
          table.current.setData(newData);
          setTimeout(() => {
            if (newInput.vatType === "VAT" && newInput.code !== "1.06.02") {
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

        wait(50).then(() => {
          table.current.scrollToBottom();
        });
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
        (a: any, b: any) => a + parseFloat(b.credit.replace(/,/g, "")),
        0
      );
      const totalDebit = getData.reduce(
        (a: any, b: any) => a + parseFloat(b.debit.replace(/,/g, "")),
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
  function formatNumber(Amount: number) {
    return Amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
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
    if (modeUpdate) {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addGeneralJournalMutate({
            hasSelected: true,
            refNo: refRefNo.current?.value,
            dateEntry: refDate.current?.value,
            explanation: refExplanation.current?.value,
            generalJournal: generalJournalData,
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
            generalJournal: generalJournalData,
          });
        },
      });
    }
  }, [monitoring, addGeneralJournalMutate, modeUpdate]);

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

  return (
    <>
      <PageHelmet title="General Journal" />
      {(loadingGetSearchSelectedGeneralJournal ||
        loadingGeneralJournalMutate ||
        loadingVoidGeneralJournalMutate ||
        isLoadingPrint ||
        loadingGeneralJournalGenerator ||
        isLoadingDoRPTTransactionNILHNASTRA ||
        isLoadingDoRPTTransactionNILHN) && <Loading />}
      <div
        className="main"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "auto",
          flex: 1,
          padding: "10px",
          background: "#F1F1F1",
          rowGap: "10px",
          position: "relative",
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
                    searchGeneralJournalModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
                style: { width: "500px" },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (inputSearchRef.current)
                  searchGeneralJournalModalRef.current.openModal(
                    inputSearchRef.current.value
                  );
              }}
              inputRef={inputSearchRef}
            />

            <div
              className="general-journal-desktop-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              {modeDefault && (
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
                  }}
                  color="primary"
                >
                  New
                </Button>
              )}
              <LoadingButton
                sx={{
                  height: "22px",
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
                    height: "22px",
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
                  height: "22px",
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
                  height: "22px",
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
                  const generalJournal = table.current.getData();

                  mutatePrint({
                    JVNo: refRefNo.current?.value,
                    JVDate: refDate.current?.value,
                    JVExp: refExplanation.current?.value,
                    generalJournal,
                    reportTitle:
                      process.env.REACT_APP_DEPARTMENT === "UMIS"
                        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
                  });
                }}
                sx={{
                  height: "22px",
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
          </div>
        </div>
        <div
          className="layer-one"
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
          <TextInput
            containerClassName="custom-input"
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
          <TextInput
            containerClassName="custom-input"
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
            containerClassName="custom-input"
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
          className="layer-two"
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
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <TextInput
              containerClassName="custom-input "
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
                      chartOfAccountModalRef.current.openModal(
                        refCode.current.value
                      );
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
                  chartOfAccountModalRef.current.openModal(
                    refCode.current.value
                  );
                }
              }}
              disableIcon={modeDefault}
            />
            <TextInput
              containerClassName="custom-input "
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
              containerClassName="custom-input "
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
              containerClassName="custom-input "
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
                      clientModalRef.current.openModal(e.currentTarget.value);
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
                  clientModalRef.current.openModal(refName.current.value);
                }
              }}
              disableIcon={modeDefault}
            />
          </div>
          <div
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <TextFormatedInput
              containerClassName="custom-input "
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
              containerClassName="custom-input "
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
              containerClassName="custom-input "
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
                      transactionOfAccountModalRef.current.openModal(
                        e.currentTarget.value
                      );
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
                  transactionOfAccountModalRef.current.openModal(
                    refTC.current.value
                  );
                }
              }}
              disableIcon={modeDefault}
            />
            <TextInput
              containerClassName="custom-input "
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
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <SelectInput
              containerClassName="custom-input "
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
              containerClassName="custom-input "
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
        <div
          style={{
            marginTop: "10px",
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
          }}
        >
          <DataGridViewReactUpgraded
            ref={table}
            adjustVisibleRowCount={310}
            columns={selectedCollectionColumns}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                refIDNo.current = rowItm.IDNo;
                refSubAcct.current = rowItm.BranchCode;

                if (refCode.current) {
                  refCode.current.value = rowItm.code;
                }
                if (refAccountName.current) {
                  refAccountName.current.value = rowItm.acctName;
                }
                if (refSubAccount.current) {
                  refSubAccount.current.value = rowItm.subAcctName;
                }
                if (refName.current) {
                  refName.current.value = rowItm.ClientName;
                }
                if (refDebit.current) {
                  refDebit.current.value = rowItm.debit;
                }
                if (refCredit.current) {
                  refCredit.current.value = rowItm.credit;
                }
                if (refTC.current) {
                  refTC.current.value = rowItm.TC_Code;
                }
                if (refRemarks.current) {
                  refRemarks.current.value = rowItm.remarks;
                }
                if (refVat.current) {
                  refVat.current.value = rowItm.vatType;
                }
                if (refInvoice.current) {
                  refInvoice.current.value = rowItm.invoice;
                }
              } else {
                resetRow();
              }
            }}
            FooterComponent={() => {
              return (
                <div
                  className="footer-table"
                  style={{
                    fontSize: "13px",
                    width: "100%",
                    display: "flex",
                    columnGap: "50px",
                    height: "auto",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0px 10px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      columnGap: "10px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: "12px" }}>Total Debit:</div>
                    <div
                      style={{
                        background: "white",
                        padding: "0px 10px",
                        textAlign: "right",
                        width: "100px",
                        fontWeight: "bold",
                      }}
                    >
                      {monitoring.totalDebit}
                    </div>
                  </div>
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      columnGap: "10px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: "12px" }}>Total Credit:</div>
                    <div
                      style={{
                        background: "white",
                        padding: "0px 10px",
                        textAlign: "right",
                        width: "100px",
                        fontWeight: "bold",
                      }}
                    >
                      {monitoring.totalCredit}
                    </div>
                  </div>
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      columnGap: "10px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: "12px" }}>Balance:</div>{" "}
                    <div
                      style={{
                        color:
                          parseInt(monitoring.balance.replace(/,/g, "")) !== 0
                            ? "red"
                            : "black",
                        background: "white",
                        padding: "0px 10px",
                        textAlign: "right",
                        width: "100px",
                        fontWeight: "bold",
                      }}
                    >
                      {monitoring.balance}
                    </div>
                  </div>
                </div>
              );
            }}
            onDelete={(data: any) => {
              const totalCredit = data.reduce(
                (a: any, b: any) => a + parseFloat(b.credit.replace(/,/g, "")),
                0
              );
              const totalDebit = data.reduce(
                (a: any, b: any) => a + parseFloat(b.debit.replace(/,/g, "")),
                0
              );
              setMonitoring({
                totalRow: `${data.length}`,
                totalCredit: formatNumber(totalCredit),
                totalDebit: formatNumber(totalDebit),
                balance: formatNumber(totalCredit - totalDebit),
              });
            }}
          />
        </div>
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
                    value={jobTransactionDate}
                    onChange={(value) => {
                      setJobTransactionDate(value);
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
                      checked={jobAutoExp}
                      onChange={(e) => {
                        setJobAutoExp(!jobAutoExp);
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
                  value={jobType}
                  name="jobType"
                  onChange={(e) => {
                    setJobType(e.target.value);
                  }}
                  autoWidth
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                >
                  <MenuItem value={""}> </MenuItem>
                  <MenuItem value={"0"}>Reversal of Accrued Interest </MenuItem>
                  <MenuItem value={"1"}>
                    Income Recognition & Accrual of Interest
                  </MenuItem>
                  <MenuItem value={"2"}>Penalty Charges</MenuItem>
                  <MenuItem value={"3"}>Penalty Income</MenuItem>
                  <MenuItem value={"4"}>PR Transaction (ANCAR)</MenuItem>
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
                  <MenuItem value={"12"}>ASTRA</MenuItem>
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
                  let JobDate = new Date(jobTransactionDate);
                  let dtFrom = format(JobDate, "yyyy-MM-01-");
                  let dtTo = format(lastDayOfMonth(JobDate), "yyyy-MM-dd");
                  if (jobType === "4") {
                    mutateDoRPTTransactionNILHN({ dtFrom, dtTo });
                  }
                  if (jobType === "12") {
                    mutateDoRPTTransactionNILHNASTRA({
                      dtFrom,
                      dtTo,
                    });
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
        <div
          className="general-journal-mobile-buttons"
          style={{
            display: "none",
            alignItems: "center",
            columnGap: "10px",
          }}
        >
          {modeDefault && (
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
              }}
              color="primary"
            >
              New
            </Button>
          )}
          <LoadingButton
            sx={{
              height: "22px",
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
                height: "22px",
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
              height: "22px",
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
              height: "22px",
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
                reportTitle:
                  process.env.REACT_APP_DEPARTMENT === "UMIS"
                    ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                    : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
              });
            }}
            sx={{
              height: "22px",
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
      </div>
      {/* client modal */}
      <UpwardTableModalSearch
        ref={clientModalRef}
        link={"/task/accounting/search-pdc-policy-ids"}
        column={[
          { key: "Type", label: "Type", width: 100 },
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
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refName.current) {
                refName.current.value = rowItm.Name ?? "";
              }
              if (refSubAccount.current) {
                refSubAccount.current.value = rowItm.ShortName ?? "";
              }
              refIDNo.current = rowItm.IDNo;
              refSubAcct.current = rowItm.sub_account;

              refDebit.current?.focus();
            });
            clientModalRef.current.closeModal();
          }
        }}
      />
      {/* chart of account modal */}
      <UpwardTableModalSearch
        ref={chartOfAccountModalRef}
        link={"/task/accounting/general-journal/get-chart-account"}
        column={[
          { key: "Acct_Code", label: "Account Code", width: 130 },
          { key: "Acct_Title", label: "Account Title.", width: 250 },
          {
            key: "Short",
            label: "Short",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refCode.current) {
                refCode.current.value = rowItm.Acct_Code;
              }
              if (refAccountName.current) {
                refAccountName.current.value = rowItm.Acct_Title;
              }
              refName.current?.focus();
            });
            chartOfAccountModalRef.current.closeModal();
          }
        }}
      />
      {/* transaction of account modal */}
      <UpwardTableModalSearch
        ref={transactionOfAccountModalRef}
        link={"/task/accounting/general-journal/get-transaction-account"}
        column={[
          { key: "Code", label: "Code", width: 130 },
          {
            key: "Description",
            label: "Description",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refTC.current) {
                refTC.current.value = rowItm.Code;
              }
              refTCDesc.current = rowItm.Description;
              refRemarks.current?.focus();
            });
            transactionOfAccountModalRef.current.closeModal();
          }
        }}
      />
      {/* General Journal Search */}
      <UpwardTableModalSearch
        ref={searchGeneralJournalModalRef}
        link={"/task/accounting/general-journal/search-general-journal"}
        column={[
          { key: "Date_Entry", label: "Date", width: 100, type: "text" },
          { key: "Source_No", label: "Ref No.", width: 100, type: "text" },
          {
            key: "Explanation",
            label: "Explanation",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              getSearchSelectedGeneralJournal({
                Source_No: rowItm.Source_No,
              });
              setMode("update");
              table.current.resetTable();
              resetRow();
            });
            searchGeneralJournalModalRef.current.closeModal();
          }
        }}
      />
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
