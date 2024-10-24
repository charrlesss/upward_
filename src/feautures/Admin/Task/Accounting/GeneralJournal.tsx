import { useReducer, useContext, useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputAdornment,
  IconButton,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Modal,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import CustomDatePicker from "../../../../components/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import { wait } from "../../../../lib/wait";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { brown, deepOrange, grey } from "@mui/material/colors";
import Table from "../../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import {
  generateRandomClass,
  keyBoardSelectionTable,
} from "../../../../components/ModalWithTable";
import { flushSync } from "react-dom";
import SaveIcon from "@mui/icons-material/Save";
import { UpwardTable } from "../../../../components/UpwardTable";
import { SelectInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { format } from "date-fns";

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
  { field: "code", headerName: "Code", width: 150 },
  { field: "acctName", headerName: "Account Name", width: 300 },
  {
    field: "subAcctName",
    headerName: "Sub Account",
    width: 170,
  },
  { field: "ClientName", headerName: "Name", width: 300 },
  { field: "debit", headerName: "Debit", width: 120, type: "number" },
  { field: "credit", headerName: "Credit", width: 120, type: "number" },
  // hide
  { field: "TC_Code", headerName: "TC", width: 120 },
  {
    field: "remarks",
    headerName: "Remarks",
    flex: 1,
    width: 300,
  },
  { field: "vatType", headerName: "Vat Type", width: 120 },
  { field: "invoice", headerName: "Invoice", width: 200 },
  { field: "TempID", headerName: "TempId", hide: true },
  { field: "IDNo", headerName: "I.D.", width: 300, hide: true },
  {
    field: "BranchCode",
    headerName: "BranchCode",
    width: 300,
    hide: true,
  },
];

export default function GeneralJournal() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<"update" | "add" | "">("")

  const refRefNo = useRef<HTMLInputElement>(null)
  const _refSubRefNo = useRef<HTMLInputElement>(null)
  const refDate = useRef<HTMLInputElement>(null)
  const refExplanation = useRef<HTMLInputElement>(null)

  const refCode = useRef<HTMLInputElement>(null)
  const refAccountName = useRef<HTMLInputElement>(null)
  const refSubAccount = useRef<HTMLInputElement>(null)
  const refName = useRef<HTMLInputElement>(null)

  const refDebit = useRef<HTMLInputElement>(null)
  const refCredit = useRef<HTMLInputElement>(null)
  const refTC = useRef<HTMLInputElement>(null)
  const refRemarks = useRef<HTMLInputElement>(null)
  const refVat = useRef<HTMLSelectElement>(null)
  const refInvoice = useRef<HTMLInputElement>(null)

  //client details 
  const refIDNo = useRef<string>('')
  const refSubAcct = useRef<string>('')

  //TC details
  const refTCDesc = useRef<string>('')

  const mainId = generateRandomClass();
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [openJobs, setOpenJobs] = useState(false);
  const [generalJournal, setGeneralJournal] = useState<GridRowSelectionModel>(
    []
  );

  const queryClient = useQueryClient();
  const explanationInputRef = useRef<HTMLInputElement>(null);

  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const IdsSearchInput = useRef<HTMLInputElement>(null);
  const table = useRef<any>(null);
  const refParent = useRef<HTMLDivElement>(null);

  const modeAdd = mode === 'add'
  const modeUpdate = mode === 'update'
  const modeDefault = mode === ''


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
          refRefNo.current.value = response.data.generateGeneralJournalID[0].general_journal_id
        }
        if (_refSubRefNo.current) {
          _refSubRefNo.current.value = response.data.generateGeneralJournalID[0].general_journal_id
        }
        if (refDate.current) {
          refDate.current.value = format(new Date(), "yyyy-MM-dd")
        }
        if (refVat.current) {
          refVat.current.value = 'Non-VAT'
        }
      })
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
        queryClient.invalidateQueries("search-general-journal");

        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        setGeneralJournal([]);
        setMode('')

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
  const { mutate: mutateJob, isLoading: isLoadingJob } = useMutation({
    mutationKey: "jobs",
    mutationFn: async (variable: any) =>
      await myAxios.post("/task/accounting/general-journal/jobs", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      const response = res as any;
      setGeneralJournal([]);
      setGeneralJournal(response.data.jobs);
      setOpenJobs(false);
      setMode('')

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
        queryClient.invalidateQueries("search-general-journal");
        refetchGeneralJournalGenerator();
        setGeneralJournal([]);
        setMode('')

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
        refRefNo.current.value = refNo
      }
      if (refDate.current) {
        refDate.current.value = format(new Date(dateEntry), "yyyy-MM-dd")
      }
      if (refExplanation.current) {
        refExplanation.current.value = explanation
      }
      setGeneralJournal(selected);
    },
  });

  const {
    ModalComponent: ModalSearchGeneralJounal,
    openModal: openSearchGeneralJounal,
    isLoading: isLoadingSearchGeneralJounal,
    closeModal: closeSearchGeneralJounal,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/general-journal/search-general-journal",
      queryUrlName: "searchGeneralJournal",
    },
    columns: [
      { field: "Date_Entry", headerName: "Date", width: 130 },
      { field: "Source_No", headerName: "Ref No.", width: 250 },
      {
        field: "Explanation",
        headerName: "Explanation",
        flex: 1,
      },
    ],
    queryKey: "search-general-journal",
    uniqueId: "Source_No",
    responseDataKey: "searchGeneralJournal",
    onSelected: (selectedRowData, data) => {
      getSearchSelectedGeneralJournal({
        Source_No: selectedRowData[0].Source_No,
      });
      setMode("update")
      setGeneralJournal([]);
      table.current.resetTableSelected()
      closeSearchGeneralJounal();
      resetRow()
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: chartAccountSearchInput,
  });

  // fields
  const {
    ModalComponent: ModalChartAccountSearch,
    openModal: openChartAccountSearch,
    isLoading: isLoadingChartAccountSearch,
    closeModal: closeChartAccountSearch,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/general-journal/get-chart-account",
      queryUrlName: "chartAccountSearch",
    },
    columns: [
      { field: "Acct_Code", headerName: "Account Code", width: 130 },
      { field: "Acct_Title", headerName: "Account Title.", width: 250 },
      {
        field: "Short",
        headerName: "Short",
        flex: 1,
      },
    ],
    queryKey: "get-chart-account",
    uniqueId: "Acct_Code",
    responseDataKey: "getChartOfAccount",
    onSelected: (selectedRowData, data) => {
      if (refCode.current) {
        refCode.current.value = selectedRowData[0].Acct_Code
      }
      if (refAccountName.current) {
        refAccountName.current.value = selectedRowData[0].Acct_Title
      }

      closeChartAccountSearch();
      setTimeout(() => {
        refName.current?.focus();
      }, 250);
    },
    searchRef: chartAccountSearchInput,
  });
  const {
    ModalComponent: ModalPolicyIdClientIdRefId,
    openModal: openPolicyIdClientIdRefId,
    isLoading: isLoadingPolicyIdClientIdRefId,
    closeModal: closePolicyIdClientIdRefId,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-pdc-policy-id",
      queryUrlName: "searchPdcPolicyIds",
    },
    columns: [
      { field: "Type", headerName: "Type", width: 130 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      {
        field: "Name",
        headerName: "Name",
        flex: 1,
      },
      {
        field: "ID",
        headerName: "ID",
        hide: true,
      },
    ],
    queryKey: "get-policyId-ClientId-RefId",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData) => {
      if (refName.current) {
        refName.current.value = selectedRowData[0].Name ?? ""
      }
      if (refSubAccount.current) {
        refSubAccount.current.value = selectedRowData[0].ShortName ?? ""
      }
      refIDNo.current = selectedRowData[0].IDNo
      refSubAcct.current = selectedRowData[0].sub_account

      closePolicyIdClientIdRefId();
      setTimeout(() => {
        refDebit.current?.focus();
      }, 200);
    },
    searchRef: IdsSearchInput,
  });
  const {
    ModalComponent: ModalTransactionAccount,
    openModal: openTransactionAccount,
    isLoading: isLoadingTransactionAccount,
    closeModal: closeTransactionAccount,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/general-journal/get-transaction-account",
      queryUrlName: "transactionCodeSearch",
    },
    columns: [
      { field: "Code", headerName: "Code", width: 130 },
      {
        field: "Description",
        headerName: "Description",
        flex: 1,
      },
    ],
    queryKey: "get-transaction-account",
    uniqueId: "Code",
    responseDataKey: "getTransactionAccount",
    onSelected: (selectedRowData) => {
      if (refTC.current) {
        refTC.current.value = selectedRowData[0].Code
      }
      refTCDesc.current = selectedRowData[0].Description
      closeTransactionAccount();
      setTimeout(() => {
        refRemarks.current?.focus();
      }, 200);
    },
    searchRef: IdsSearchInput,
  });


  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function handleOnSave() {
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
          explanationInputRef.current?.focus();
        });
      });
    }
    if (
      (state.totalDebit === "" && state.totalCredit === "") ||
      (state.totalDebit === "0.00" && state.totalCredit === "0.00")
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must not be zero(0), please double check the entries",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => { });
      });
    }
    if (state.totalDebit !== state.totalCredit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must be balance, please double check the entries",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => { });
      });
    }
    if (modeUpdate) {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addGeneralJournalMutate({
            hasSelected: true,
            refNo: refRefNo.current?.value,
            dateEntry: refDate.current?.value,
            explanation: refExplanation.current?.value,
            generalJournal,
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
            generalJournal,
          });
        },
      });
    }
  }
  function handleVoid() {
    codeCondfirmationAlert({
      isUpdate: false,
      text: `Are you sure you want to void ${state.refNo}`,
      cb: (userCodeConfirmation) => {
        mutateVoidGeneralJournal({
          refNo: state.refNo,
          dateEntry: state.dateEntry,
          userCodeConfirmation,
        });
      },
    });
  }
  function resetRow() {
    if (refCode.current) {
      refCode.current.value = ""
    }
    if (refAccountName.current) {
      refAccountName.current.value = ""
    }
    if (refName.current) {
      refName.current.value = ""
    }
    if (refSubAccount.current) {
      refSubAccount.current.value = ""
    }
    if (refTC.current) {
      refTC.current.value = ""
    }
    if (refDebit.current) {
      refDebit.current.value = ""
    }
    if (refCredit.current) {
      refCredit.current.value = ""
    }
    if (refRemarks.current) {
      refRemarks.current.value = ""
    }
    if (refVat.current) {
      refVat.current.value = ""
    }
    if (refInvoice.current) {
      refInvoice.current.value = ""
    }

    refTCDesc.current = ""
    refIDNo.current = ""
    refSubAcct.current = ""
  }
  function handleRowSave() {
    if (refCode.current && refCode.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is required!",
        timer: 1500,
      }).then(() => {
        return openChartAccountSearch(state.code);
      });
    }

    if (refName.current && refName.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "ID is required!",
        timer: 1500,
      }).then(() => {
        return openPolicyIdClientIdRefId(refName.current?.value);
      });
    }

    if (refDebit.current && isNaN(parseFloat(refDebit.current?.value.replace(/,/g, "")))) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Debit is required!",
        timer: 1500,
      });
    }
    if (refCredit.current && isNaN(parseFloat(refCredit.current?.value.replace(/,/g, "")))) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit is required!",
        timer: 1500,
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
      });
    }
    if (refTC.current && refTC.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is required!",
        timer: 1500,
      }).then(() => {
        return openTransactionAccount(state.TC_Code);
      });
    }
    if (refCode.current && refCode.current?.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is too long!",
        timer: 1500,
      });
    }
    if (refName.current && refName.current?.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Client name is too long!",
        timer: 1500,
      });
    }
    if (refTC.current && refTC.current.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is too long!",
        timer: 1500,
      });
    }
    if (refInvoice.current && refInvoice.current.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invoice is too long!",
        timer: 1500,
      });
    }
    function generateID(array: Array<any>) {
      const lastItem = array.length ? array[array.length - 1].TempID : "000";
      const numericPart = (parseInt(lastItem.toString().match(/\d+/)[0]) + 1)
        .toString()
        .padStart(3, "0");
      return numericPart;
    }
    const isUpdate = selectedIndex !== null && selectedIndex >= 0
    function addEntryVat(Entry1: any, Entry2: any, debitNum: number, creditNum: number) {


      let storage = []

      let taxableamt = 0;
      let inputTax = 0
      if (creditNum !== 0) {
        taxableamt = creditNum / 1.12
        Entry1.credit = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else {
        taxableamt = debitNum / 1.12
        Entry1.debit = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
      storage.push(Entry1)
      inputTax = taxableamt * 0.12
      Entry2.code = "1.06.02"
      Entry2.acctName = "Input Tax"
      if (parseFloat(Entry1.credit.replace(/,/g, '')) !== 0) {
        Entry2.credit = inputTax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else {
        Entry2.debit = inputTax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
      storage.push(Entry2)

      return storage



    }

    Swal.fire({
      title: isUpdate
        ? `Are you sure you want to update row?`
        : `Are you sure you want to add new row?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isUpdate
        ? "Yes, update it!"
        : "Yes Add it",
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

          const Entry1: any = {
            code: refCode.current.value,
            acctName: refAccountName.current.value,
            subAcctName: refSubAccount.current.value,
            ClientName: refName.current.value,
            debit: refDebit.current.value,
            credit: refCredit.current.value,
            TC_Code: refTC.current.value,
            remarks: refRemarks.current.value,
            vatType: refVat.current.value,
            invoice: refInvoice.current.value,
            TempID: generateID(generalJournal),
            IDNo: refIDNo.current,
            BranchCode: refSubAcct.current,
          }

          if (isUpdate) {
            if (refVat.current?.value === "VAT" && refCode.current?.value !== "1.06.02") {
              setGeneralJournal((d: any) => {
                d = d.filter(
                  (_: any, index: number) => index !== selectedIndex
                );
                return d
              });
            } else {
              setGeneralJournal((d: any) => {
                d = d.map(
                  (item: any, index: number) => {
                    if (index === selectedIndex) {
                      item = Entry1
                    }
                    return item
                  }
                );
                return d
              });

            }
          } else {
            if (refVat.current?.value !== "VAT" && refCode.current?.value !== "1.06.02") {
              setGeneralJournal((_generalJournal: any) => [..._generalJournal, Entry1])
            }
          }

          const debitNum = parseFloat(refDebit.current.value.replace(/,/g, ''))
          const creditNum = parseFloat(refCredit.current.value.replace(/,/g, ''))
          const Entry2: any = {
            code: refCode.current.value,
            acctName: refAccountName.current.value,
            subAcctName: refSubAccount.current.value,
            ClientName: refName.current.value,
            debit: refDebit.current.value,
            credit: refCredit.current.value,
            TC_Code: refTC.current.value,
            remarks: refRemarks.current.value,
            vatType: refVat.current.value,
            invoice: refInvoice.current.value,
            TempID: generateID(generalJournal),
            IDNo: refIDNo.current,
            BranchCode: refSubAcct.current
          }

          if (refVat.current?.value === "VAT" && refCode.current?.value !== "1.06.02") {
            const storage = addEntryVat(Entry1, Entry2, debitNum, creditNum)
            setGeneralJournal((_generalJournal: any) => [..._generalJournal, ...storage])
          }
          resetRow()
          table.current.resetTableSelected()
        }

      }
    });
  }
  function handleJobs() {
    setOpenJobs((d) => !d);
  }
  function handleClickPrint() {
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(generalJournal));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "general-journal");
      localStorage.setItem("state", JSON.stringify(state));
      localStorage.setItem(
        "column",
        JSON.stringify([
          { datakey: "code", header: "ACCT #", width: "100px" },
          { datakey: "acctName", header: "ACCOUNT TITLE", width: "200px" },
          { datakey: "IDNo", header: "ID NO.", width: "150px" },
          { datakey: "ClientName", header: "IDENTITY", width: "200px" },
          { datakey: "debit", header: "DEBIT", width: "100px" },
          { datakey: "credit", header: "CREDIT", width: "100px" },
        ])
      );
      localStorage.setItem(
        "title",
        user?.department === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES\n"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n"
      );
    });
    window.open("/dashboard/print", "_blank");
  }

  function onCancel() {
    setMode("")
    refetchGeneralJournalGenerator();
    setGeneralJournal([]);

  }
  const width = window.innerWidth - 60;
  const height = window.innerHeight - 200;

  useEffect(() => {
    const debit = generalJournal.reduce((a: number, item: any) => {
      return a + parseFloat(item.debit.replace(/,/g, ""));
    }, 0);
    const credit = generalJournal.reduce((a: number, item: any) => {
      return a + parseFloat(item.credit.replace(/,/g, ""));
    }, 0);
    dispatch({
      type: "UPDATE_FIELD",
      field: "totalDebit",
      value: debit.toFixed(2),
    });
    dispatch({
      type: "UPDATE_FIELD",
      field: "totalCredit",
      value: credit.toFixed(2),
    });
    dispatch({
      type: "UPDATE_FIELD",
      field: "totalBalance",
      value: (debit - credit).toFixed(2),
    });
  }, [generalJournal]);


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        flex: 1,
        padding: "10px"
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
          {isLoadingSearchGeneralJounal ? (
            <LoadingButton loading={isLoadingSearchGeneralJounal} />
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
                  return openSearchGeneralJounal(
                    (e.target as HTMLInputElement).value
                  );
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const datagridview = document.querySelector(
                    ".grid-container"
                  ) as HTMLDivElement;
                  datagridview.focus();
                }
              }}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                className: "manok"
              }}
              sx={{
                width: "300px",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          )}
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
                setMode('add')
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
                    onCancel()
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
            loading={isLoadingJob}
            variant="contained"
            startIcon={<CardTravelIcon sx={{ width: 20, height: 20 }} />}
          >
            Jobs
          </LoadingButton>
          <Button
            disabled={modeDefault}
            id="basic-button"
            aria-haspopup="true"
            onClick={handleClickPrint}
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
            <span style={{ fontSize: "12px" }}>Total Rows:</span> <strong>{generalJournal.length}</strong>
          </p>
          <p style={{ margin: 0, padding: 0, color: "black" }}>
            <span style={{ fontSize: "12px" }}>Total Debit:</span> <strong>{state.totalDebit}</strong>
          </p>
          <p style={{ margin: 0, padding: 0, color: "black" }}>
            <span style={{ fontSize: "12px" }}>Total Credit:</span> <strong>{state.totalCredit}</strong>
          </p>
          <p style={{ margin: 0, padding: 0, color: "black" }}>
            <span style={{ fontSize: "12px" }}>Balance:</span>{" "}
            <strong
              style={{
                color:
                  parseFloat(state.totalBalance.replace(/,/g, "")) > 0
                    ? "red"
                    : "black",
              }}
            >
              {state.totalBalance}
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
              readOnly: true
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
            disabled: modeDefault,
            type: "date",
            style: { width: "190px" },
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
          {isLoadingChartAccountSearch ? (
            <LoadingButton loading={isLoadingChartAccountSearch} />
          ) : (
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
                      openChartAccountSearch(refCode.current.value)
                    }
                  }
                }
              }}
              inputRef={refCode}
              icon={<SupervisorAccountIcon sx={{ fontSize: "18px", color: modeDefault ? "gray" : "black" }} />}
              onIconClick={(e) => {
                e.preventDefault()
                if (refCode.current) {
                  openChartAccountSearch(refCode.current.value)
                }
              }}
              disableIcon={modeDefault}
            />
          )}

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
              readOnly: true
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
              readOnly: true
            }}
            inputRef={refSubAccount}
          />

          {isLoadingPolicyIdClientIdRefId ? (
            <LoadingButton loading={isLoadingPolicyIdClientIdRefId} />
          ) : (
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
                      openPolicyIdClientIdRefId(refName.current.value)
                    }
                  }
                }
              }}
              inputRef={refName}
              icon={<AccountCircleIcon sx={{ fontSize: "18px", color: modeDefault ? "gray" : "black" }} />}
              onIconClick={(e) => {
                e.preventDefault()
                if (refName.current) {
                  openPolicyIdClientIdRefId(refName.current.value)
                }
              }}
              disableIcon={modeDefault}
            />
          )}
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
            }}
            inputRef={refCredit}
          />
          {isLoadingTransactionAccount ? (
            <LoadingButton loading={isLoadingTransactionAccount} />
          ) : (
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
                      openTransactionAccount(refTC.current.value)
                    }
                  }
                }
              }}
              inputRef={refTC}
              icon={<AccountBalanceWalletIcon sx={{ fontSize: "18px", color: modeDefault ? "gray" : "black" }} />}
              onIconClick={(e) => {
                e.preventDefault()
                if (refTC.current) {
                  openTransactionAccount(refTC.current.value)
                }
              }}
              disableIcon={modeDefault}
            />
          )}
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
            }}
            inputRef={refRemarks}
          />
        </div>
        <div style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
        }}>

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
            }}
            datasource={[
              { key: "VAT" },
              { key: "Non-VAT" },
            ]}
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
            startIcon={<SaveIcon sx={{ fontSize: "12px", }} />}
            onClick={() => {
              handleRowSave()
            }}
            color="primary"
          >
            Save Row
          </Button>
        </div>
      </fieldset>
      <div
        ref={refParent}
        className={mainId}
        style={{
          marginTop: "10px",
          width: "100%",
          position: "relative",
          flex: 1,
        }}
      >
        <UpwardTable
          isLoading={loadingGeneralJournalMutate ||
            loadingGetSearchSelectedGeneralJournal ||
            isLoadingJob}
          ref={table}
          rows={generalJournal}
          column={selectedCollectionColumns}
          width={width}
          height={height}
          dataReadOnly={true}
          onSelectionChange={(selected, rowIndex) => {
            const rowSelected = selected[0]
            if (selected.length > 0) {
              refIDNo.current = rowSelected.IDNo
              refSubAcct.current = rowSelected.BranchCode

              if (refName.current) {
                refName.current.value = rowSelected.ClientName
              }
              if (refTC.current) {
                refTC.current.value = rowSelected.TC_Code
              }
              if (refAccountName.current) {
                refAccountName.current.value = rowSelected.acctName
              }
              if (refCode.current) {
                refCode.current.value = rowSelected.code
              }
              if (refCredit.current) {
                refCredit.current.value = rowSelected.credit
              }
              if (refDebit.current) {
                refDebit.current.value = rowSelected.debit
              }
              if (refInvoice.current) {
                refInvoice.current.value = rowSelected.invoice
              }
              if (refRemarks.current) {
                refRemarks.current.value = rowSelected.remarks
              }
              if (refSubAccount.current) {
                refSubAccount.current.value = rowSelected.subAcctName
              }
              if (refVat.current) {
                refVat.current.value = rowSelected.vatType
              }

              setSelectedIndex(rowIndex)
            } else {
              setSelectedIndex(null)
              resetRow()
            }
          }}
          onKeyDown={(row, key, rowIndex) => {
            if (key === "Delete" || key === "Backspace") {
              Swal.fire({
                title: `Are you sure you want to delete?`,
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  return setGeneralJournal((d: any) => {
                    return d.filter(
                      (items: any, index: number) => index !== rowIndex
                    );
                  });
                }
              });
              return;
            }
          }}
          inputsearchselector=".manok"
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
              <InputLabel id="label-selection-job-type">Type of Job</InputLabel>
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
              loading={isLoadingJob}
              color="success"
              variant="contained"
              onClick={() => mutateJob(state)}
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
      {ModalChartAccountSearch}
      {ModalPolicyIdClientIdRefId}
      {ModalTransactionAccount}
      {ModalSearchGeneralJounal}
    </div>
  );
}

function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
