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


const initialState = {
  sub_refNo: "",
  refNo: "",
  dateEntry: new Date(),
  explanation: "",

  code: "",
  acctName: "",
  subAcct: "",
  subAcctName: "",
  IDNo: "",
  ClientName: "",
  credit: "",
  debit: "",
  TC_Code: "",
  TC_Desc: "",
  remarks: "",
  vatType: "NON-VAT",
  invoice: "",
  BranchCode: "HO",
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
  { field: "code", headerName: "Code", minWidth: 150 },
  { field: "acctName", headerName: "Account Name", minWidth: 300 },
  {
    field: "subAcctName",
    headerName: "Sub Account",
    flex: 1,
    minWidth: 170,
  },
  { field: "ClientName", headerName: "Name", flex: 1, minWidth: 300 },
  { field: "debit", headerName: "Debit", minWidth: 80 },
  { field: "credit", headerName: "Credit", minWidth: 100 },
  // hide
  { field: "TC_Code", headerName: "TC", minWidth: 100 },
  {
    field: "remarks",
    headerName: "Remarks",
    flex: 1,
    minWidth: 300,
  },
  { field: "vatType", headerName: "Vat Type", minWidth: 100 },
  { field: "invoice", headerName: "Invoice", flex: 1, minWidth: 200 },
  { field: "TempID", headerName: "TempId", hide: true },
  { field: "IDNo", headerName: "I.D.", flex: 1, minWidth: 300, hide: true },
  {
    field: "BranchCode",
    headerName: "BranchCode",
    flex: 1,
    minWidth: 300,
    hide: true,
  },
];

export default function GeneralJournal() {
  const mainId = generateRandomClass();
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [save, setSave] = useState(false);
  const [openJobs, setOpenJobs] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [searchSelected, setSearchSelected] = useState(false);
  const [editTransaction, setEditTransaction] = useState({
    edit: false,
    updateId: "",
  });
  const [generalJournal, setGeneralJournal] = useState<GridRowSelectionModel>(
    []
  );
  const queryClient = useQueryClient();
  const datePickerRef = useRef<HTMLElement>(null);
  const reloadIDButtonRef = useRef<HTMLButtonElement>(null);
  const explanationInputRef = useRef<HTMLInputElement>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const debitInputRef = useRef<HTMLInputElement>(null);
  const tcInputRef = useRef<HTMLInputElement>(null);

  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const IdsSearchInput = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const table = useRef<any>(null);

  const invoiceRef = useRef<HTMLInputElement>(null);
  const refParent = useRef<HTMLDivElement>(null);

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
      if (hasSelected) {
        dispatch({
          type: "UPDATE_FIELD",
          field: "refNo",
          value: state.sub_refNo ?? "",
        });
        return;
      }
      dispatch({
        type: "UPDATE_FIELD",
        field: "refNo",
        value:
          response.data.generateGeneralJournalID[0].general_journal_id ?? "",
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "sub_refNo",
        value:
          response.data.generateGeneralJournalID[0].general_journal_id ?? "",
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
        queryClient.invalidateQueries("search-general-journal");
        setSave(false);
        setHasSelected(false);
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        setGeneralJournal([]);
        setEditTransaction({
          edit: false,
          updateId: "",
        });
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
      setSave(true);
      setOpenJobs(false);
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
        setSave(false);
        setHasSelected(false);
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        setGeneralJournal([]);
        setEditTransaction({
          edit: false,
          updateId: "",
        });
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

      dispatch({
        type: "UPDATE_FIELD",
        field: "sub_refNo",
        value: refNo,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "refNo",
        value: refNo,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "dateEntry",
        value: dateEntry,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "explanation",
        value: explanation,
      });
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
      setSearchSelected(true);
      setSave(true);
      setHasSelected(true);
      setGeneralJournal([]);
      setEditTransaction({
        edit: false,
        updateId: "",
      });

      closeSearchGeneralJounal();
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: chartAccountSearchInput,
  });
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
      dispatch({
        type: "UPDATE_FIELD",
        field: "code",
        value: selectedRowData[0].Acct_Code,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "acctName",
        value: selectedRowData[0].Acct_Title,
      });
      closeChartAccountSearch();
      setTimeout(() => {
        idInputRef.current?.focus();
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
      console.log(selectedRowData);
      dispatch({
        type: "UPDATE_FIELD",
        field: "ClientName",
        value: selectedRowData[0].Name ?? "",
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "IDNo",
        value: selectedRowData[0].IDNo ?? "",
      });

      dispatch({
        type: "UPDATE_FIELD",
        field: "subAcct",
        value: selectedRowData[0].sub_account,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "subAcctName",
        value: selectedRowData[0].ShortName ?? "",
      });

      closePolicyIdClientIdRefId();
      setTimeout(() => {
        debitInputRef.current?.focus();
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
      dispatch({
        type: "UPDATE_FIELD",
        field: "TC_Code",
        value: selectedRowData[0].Code,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "TC_Desc",
        value: selectedRowData[0].Description,
      });
      closeTransactionAccount();
      setTimeout(() => {
        tcInputRef.current?.focus();
      }, 200);
    },
    searchRef: IdsSearchInput,
  });
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
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave() {
    if (state.refNo === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide reference number!",
        timer: 1500,
      });
    }
    if (state.explanation === "") {
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
    if (hasSelected) {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addGeneralJournalMutate({
            hasSelected,
            refNo: state.refNo,
            dateEntry: state.dateEntry,
            explanation: state.explanation,
            generalJournal,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addGeneralJournalMutate({
            hasSelected,
            refNo: state.refNo,
            dateEntry: state.dateEntry,
            explanation: state.explanation,
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
  function handleRowSave() {
    if (state.code === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is required!",
        timer: 1500,
      }).then(() => {
        return openChartAccountSearch(state.code);
      });
    }

    if (state.ClientName === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "ID is required!",
        timer: 1500,
      }).then(() => {
        return openPolicyIdClientIdRefId(state.ClientName);
      });
    }

    if (isNaN(parseFloat(state.debit.replace(/,/g, "")))) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Debit is required!",
        timer: 1500,
      });
    }
    if (isNaN(parseFloat(state.credit.replace(/,/g, "")))) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit is required!",
        timer: 1500,
      });
    }
    if (
      parseFloat(state.credit.replace(/,/g, "")) === 0 &&
      parseFloat(state.debit.replace(/,/g, "")) === 0
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit and Debit must be different!",
        timer: 1500,
      });
    }

    if (state.TC_Code === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is required!",
        timer: 1500,
      }).then(() => {
        return openTransactionAccount(state.TC_Code);
      });
    }

    if (state.code.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is too long!",
        timer: 1500,
      });
    }
    if (state.ClientName.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Client name is too long!",
        timer: 1500,
      });
    }
    if (state.TC_Code.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is too long!",
        timer: 1500,
      });
    }
    if (state.invoice.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invoice is too long!",
        timer: 1500,
      });
    }

    if (state.TC_Code.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "TC is too long!",
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
    Swal.fire({
      title: editTransaction.edit
        ? `Are you sure you want to update row?`
        : `Are you sure you want to add new row?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: editTransaction.edit
        ? "Yes, update it!"
        : "Yes Add it",
    }).then((result) => {
      if (result.isConfirmed) {
        setGeneralJournal((d: any) => {
          if (state.debit === "") {
            state.debit = "0.00";
          }
          if (state.credit === "") {
            state.credit = "0.00";
          }

          if (state.vatType === "VAT" && state.code !== "1.06.02") {
            let taxableamt;

            if (parseFloat(state.debit.replace(/,/g, "")) !== 0) {
              taxableamt = parseFloat(state.debit.replace(/,/g, "")) / 1.12;
              state.debit = taxableamt.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            } else {
              taxableamt = parseFloat(state.credit.replace(/,/g, "")) / 1.12;
              state.credit = taxableamt.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }

            const credit = parseFloat(
              state.credit.toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const debit = parseFloat(
              state.debit.toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            state.credit = credit;
            state.debit = debit;

            if (editTransaction.edit) {
              d = d.map((item: any) => {
                if (editTransaction.updateId === item.TempID) {
                  item = {
                    ...item,
                    ...state,
                  };
                }
                return item;
              });
            } else {
              d = [
                ...d,
                {
                  ...state,
                  TempID: generateID(d),
                },
              ];
            }

            let inputtax = taxableamt * 0.12;

            if (parseFloat(state.debit.toString().replace(/,/g, "")) !== 0) {
              state.debit = inputtax.toFixed(2);
            } else {
              state.credit = inputtax.toFixed(2);
            }
            d = [
              ...d,
              {
                ...state,
                code: "1.06.02",

                acctName: "Input Tax",
                TempID: generateID(d),
              },
            ];
          } else {

            const credit = parseFloat(
              state.credit.toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const debit = parseFloat(
              state.debit.toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            state.credit = credit;
            state.debit = debit;

            if (editTransaction.edit) {
              const newD = d.map((item: any) => {
                if (editTransaction.updateId === item.TempID) {
                  item = {
                    ...item,
                    ...state,
                  };
                }
                return item;
              });
              return newD;
            }
            d = [
              ...d,
              {
                ...state,
                TempID: generateID(d),
              },
            ];
          }
          return d;
        });

        const resetValue = {
          code: "",
          acctName: "",
          subAcct: "",
          subAcctName: "",
          IDNo: "",
          ClientName: "",
          credit: "",
          debit: "",
          TC_Code: "",
          TC_Desc: "",
          remarks: "",
          vatType: "NON-VAT",
          invoice: "",
        };
        setNewStateValue(dispatch, { ...state, ...resetValue });
        setEditTransaction({ edit: false, updateId: "" });
        wait(300).then(() => {
          codeInputRef.current?.focus();
        });
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
          { datakey: "subAcctName", header: "SUB ACCOUNT", width: "120px" },
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
              }}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "300px",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          )}
          {!save && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                setSave(true);
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
            disabled={!save}
            onClick={handleOnSave}
            color="success"
            variant="contained"
          >
            Save
          </LoadingButton>
          {save && (
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
                    setSave(false);
                    setHasSelected(false);
                    setNewStateValue(dispatch, initialState);
                    refetchGeneralJournalGenerator();
                    setGeneralJournal([]);
                    setSearchSelected(false);
                    setEditTransaction({
                      edit: false,
                      updateId: "",
                    });
                  }
                });
              }}
              disabled={!save || loadingGeneralJournalMutate}
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
            disabled={!searchSelected}
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
            disabled={!searchSelected}
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
          <p>
            <span>Total Rows:</span> <strong>{generalJournal.length}</strong>
          </p>
          <p>
            <span>Total Debit:</span> <strong>{state.totalDebit}</strong>
          </p>
          <p>
            <span>Total Credit:</span> <strong>{state.totalCredit}</strong>
          </p>
          <p>
            <span>Balance:</span>{" "}
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
      <fieldset
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          position: "relative",
          width: "100%",
          height: "auto",
          display: "flex",
          marginTop: "10px",
          gap: "10px",
          padding: "15px",
        }}
      >
        {loadingGeneralJournalGenerator ? (
          <LoadingButton loading={loadingGeneralJournalGenerator} />
        ) : (
          <FormControl
            variant="outlined"
            size="small"
            disabled={!save || hasSelected}
            sx={{
              width: "170px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel htmlFor="return-check-id-field">Ref. No.</InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              disabled={!save || hasSelected}
              fullWidth
              label="Ref. No."
              name="refNo"
              value={state.refNo}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return handleOnSave();
                }
              }}
              readOnly={user?.department !== "UCSMI"}
              id="return-check-id-field"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    ref={reloadIDButtonRef}
                    disabled={!save || hasSelected}
                    aria-label="search-client"
                    color="secondary"
                    edge="end"
                    onClick={() => {
                      refetchGeneralJournalGenerator();
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
        <CustomDatePicker
          fullWidth={false}
          disabled={!save}
          label="Date"
          onChange={(value: any) => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "dateEntry",
              value: value,
            });
          }}
          value={new Date(state.dateEntry)}
          onKeyDown={(e: any) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              const timeout = setTimeout(() => {
                datePickerRef.current?.querySelector("button")?.click();
                clearTimeout(timeout);
              }, 150);
            }
          }}
          datePickerRef={datePickerRef}
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
          disabled={!save}
          label="Explanation"
          size="small"
          name="explanation"
          value={state.explanation}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
              return handleOnSave();
            }
          }}
          inputRef={explanationInputRef}
          InputProps={{
            style: { height: "27px", fontSize: "14px" },
          }}
          sx={{
            flex: 1,
            height: "27px",
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          }}
        />
      </fieldset>
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
            <FormControl
              variant="outlined"
              size="small"
              disabled={!save}
              sx={{
                width: "150px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <InputLabel htmlFor="chart-account-id">Code</InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                readOnly={true}
                inputRef={codeInputRef}
                disabled={!save}
                fullWidth
                label="Code"
                name="code"
                value={state.code}
                onChange={handleInputChange}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openChartAccountSearch(state.code);
                  }
                  keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
                }}
                id="chart-account-id"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={!save}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openChartAccountSearch(state.code);
                      }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}

          <TextField
            disabled={!save}
            label="Account Name"
            size="small"
            name="acctName"
            value={state.acctName}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            InputProps={{
              readOnly: true,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              flex: 1,
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />

          <TextField
            disabled={!save}
            label="Sub Account"
            size="small"
            name="subAcctName"
            value={state.subAcctName}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            InputProps={{
              readOnly: true,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              flex: 1,
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          {isLoadingPolicyIdClientIdRefId ? (
            <LoadingButton loading={isLoadingPolicyIdClientIdRefId} />
          ) : (
            <FormControl
              variant="outlined"
              size="small"
              disabled={!save}
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
              <InputLabel htmlFor="policy-client-ref-id">I.D</InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                readOnly={true}
                inputRef={idInputRef}
                disabled={!save}
                fullWidth
                label="I.D"
                name="ClientName"
                value={state.ClientName}
                onChange={handleInputChange}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openPolicyIdClientIdRefId(state.ClientName);
                  }
                  keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
                }}
                id="policy-client-ref-id"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={!save}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openPolicyIdClientIdRefId(state.ClientName);
                      }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <TextField
            disabled={!save}
            label="Debit"
            size="small"
            name="debit"
            value={state.debit}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                handleInputChange({
                  target: { name: "credit", value: "0.00" },
                });

                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "debit",
                value: parseFloat(
                  (state.debit === "" ? "0" : state.debit).replace(/,/g, "")
                ).toFixed(2),
              });
            }}
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              inputRef: debitInputRef,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "160px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            disabled={!save}
            label="Credit"
            size="small"
            name="credit"
            value={state.credit}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "160px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={(e) => {
              e.preventDefault();
              dispatch({
                type: "UPDATE_FIELD",
                field: "credit",
                value: parseFloat(
                  (state.credit === "" ? "0" : state.credit).replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          {isLoadingTransactionAccount ? (
            <LoadingButton loading={isLoadingTransactionAccount} />
          ) : (
            <FormControl
              variant="outlined"
              size="small"
              disabled={!save}
              sx={{
                width: "130px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <InputLabel htmlFor="tc">TC</InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                readOnly={true}
                fullWidth
                label="TC"
                name="TC_Code"
                value={state.TC_Code}
                onChange={handleInputChange}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openTransactionAccount(state.TC_Code);
                  }
                  keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
                }}
                id="tc"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={!save}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openTransactionAccount(state.TC_Code);
                      }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
          <TextField
            disabled={!save}
            label="Remarks"
            size="small"
            name="remarks"
            value={state.remarks}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              inputRef: tcInputRef,
            }}
            sx={{
              flex: 1,
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: "120px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel id="label-selection-reason">Vat Type</InputLabel>
            <Select
              labelId="label-selection-reason"
              value={state.vatType}
              name="vatType"
              onChange={handleInputChange}
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              disabled={!save}
            >
              <MenuItem value=""></MenuItem>
              <MenuItem value="VAT">VAT</MenuItem>
              <MenuItem value={"NON-VAT"}>NON-VAT</MenuItem>
            </Select>
          </FormControl>
          <TextField
            disabled={!save}
            label="OR/Invoice No."
            size="small"
            name="invoice"
            value={state.invoice}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
              keyBoardSelectionTable(e, mainId, e.target as HTMLElement);
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              inputRef: invoiceRef,
            }}
            sx={{
              width: "200px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />

          <Button
            disabled={!save}
            sx={{
              height: "27px",
              fontSize: "11px",
            }}
            variant="contained"
            startIcon={<SaveIcon sx={{ fontSize: "18px" }} />}
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
        <Box
          style={{
            height: `${refParent.current?.getBoundingClientRect().height}px`,
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={
              loadingGeneralJournalMutate ||
              loadingGetSearchSelectedGeneralJournal ||
              isLoadingJob
            }
            columns={selectedCollectionColumns}
            rows={generalJournal}
            table_id={"TempID"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.TempID === selection[0]
              )[0];
              if (rowSelected === undefined || rowSelected.length <= 0) {
                const resetValue = {
                  code: "",
                  acctName: "",
                  subAcct: "",
                  subAcctName: "",
                  IDNo: "",
                  ClientName: "",
                  credit: "",
                  debit: "",
                  TC_Code: "",
                  TC_Desc: "",
                  remarks: "",
                  vatType: "NON-VAT",
                  invoice: "",
                };
                setNewStateValue(dispatch, { ...state, ...resetValue });
                setEditTransaction({ edit: false, updateId: "" });
                return;
              }
              if (code === "Delete" || code === "Backspace") {
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
                    return setGeneralJournal((d) => {
                      return d.filter(
                        (items: any) => items.TempID !== selection[0]
                      );
                    });
                  }
                });
                return;
              }

              setNewStateValue(dispatch, {
                ...rowSelected,
                sub_refNo: state.sub_refNo,
                refNo: state.refNo,
                dateEntry: state.dateEntry,
                explanation: state.explanation,
                totalDebit: state.totalDebit,
                totalCredit: state.totalCredit,
                totalBalance: state.totalBalance,
              });
              setEditTransaction({
                edit: true,
                updateId: rowSelected.TempID,
              });
            }}
          />
        </Box>
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
