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
import { deepOrange, grey } from "@mui/material/colors";
import formatDate from "../../../../lib/formatDate";
import Table from "../../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import ReactDOMServer from "react-dom/server";
import { flushSync } from "react-dom";
import SaveIcon from "@mui/icons-material/Save";

const initialState = {
  sub_refNo: "",
  refNo: "",
  dateEntry: new Date(),
  explanation: "",
  particulars: "",

  code: "",
  acctName: "",
  subAcct: "",
  subAcctName: "",
  IDNo: "",
  ClientName: "",
  address: "",
  credit: "",
  debit: "",
  checkNo: "",
  checkDate: new Date(),
  TC_Code: "",
  TC_Desc: "",
  remarks: "",
  Payto: "",
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
  cashMode: "",
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
  { field: "checkNo", headerName: "Check No", minWidth: 80 },
  { field: "checkDate", headerName: "Check Date", minWidth: 100 },
  // hide
  { field: "TC_Code", headerName: "TC", minWidth: 100 },
  {
    field: "remarks",
    headerName: "Remarks",
    flex: 1,
    minWidth: 300,
  },
  { field: "Payto", headerName: "Payto", minWidth: 300 },
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
  {
    field: "addres",
    headerName: "addres",
    hide: true,
  },
];

function formatDebitCredit(arr: Array<any>) {
  return arr.map((itm) => {
    itm.debit = parseFloat(
      itm.debit.toString().replace(/,/g, "")
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    itm.credit = parseFloat(
      itm.credit.toString().replace(/,/g, "")
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return itm;
  });
}
export default function CashDisbursement() {
  const refParent = useRef<HTMLDivElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [openJobs, setOpenJobs] = useState(false);
  const [isPayToEnter, setIsPayToEnter] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [editTransaction, setEditTransaction] = useState({
    edit: false,
    updateId: "",
  });
  const [cashDisbursement, setCashDisbursement] =
    useState<GridRowSelectionModel>([]);
  const queryClient = useQueryClient();
  const datePickerRef = useRef<HTMLElement>(null);
  const checkDatePickerRef = useRef<HTMLElement>(null);
  const reloadIDButtonRef = useRef<HTMLButtonElement>(null);
  const explanationInputRef = useRef<HTMLInputElement>(null);
  const particularsInputRef = useRef<HTMLInputElement>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const idInputRefPayTo = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const debitInputRef = useRef<HTMLInputElement>(null);
  const tcInputRef = useRef<HTMLInputElement>(null);

  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const IdsSearchInput = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const table = useRef<any>(null);

  const {
    isLoading: loadingGeneralJournalGenerator,
    refetch: refetchGeneralJournalGenerator,
  } = useQuery({
    queryKey: "general-journal-id-generator",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/cash-disbursement/generate-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      dispatch({
        type: "UPDATE_FIELD",
        field: "refNo",
        value: response.data.generatedId[0].id,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "sub_refNo",
        value: response.data.generatedId[0].id,
      });
    },
  });

  const {
    mutate: addCashDisbursementMutate,
    isLoading: loadingCashDisbursementMutate,
  } = useMutation({
    mutationKey: "add-cash-disbursement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/add-cash-disbursement",
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
        setHasSelected(false);
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        setCashDisbursement([]);
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
      setCashDisbursement([]);
      setCashDisbursement(response.data.jobs);
      setOpenJobs(false);
    },
  });

  const {
    mutate: mutateVoidCashDisbursement,
    isLoading: loadingVoidCashDisbursement,
  } = useMutation({
    mutationKey: "void-cash-disbursement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/void-cash-disbursement",
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
        setHasSelected(false);
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        setCashDisbursement([]);
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
    mutate: getSearchSelectedCashDisbursement,
    isLoading: loadingGetSearchSelectedCashDisbursement,
  } = useMutation({
    mutationKey: "get-selected-search-general-journal",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/get-selected-search-cash-disbursement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const selected = response.data.selectedCashDisbursement;
      const { explanation, dateEntry, refNo, particulars } = selected[0];
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
      dispatch({
        type: "UPDATE_FIELD",
        field: "particulars",
        value: particulars,
      });
      setCashDisbursement(selected);
      setHasSelected(true);
    },
  });

  const {
    ModalComponent: ModalSearchCashDisbursement,
    openModal: openSearchCashDisbursement,
    isLoading: isLoadingSearchCashDisbursement,
    closeModal: closeSearchCashDisbursement,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/cash-disbursement/search-cash-disbursement",
      queryUrlName: "searchCashDisbursement",
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
    queryKey: "search-cash-disbursement",
    uniqueId: "Source_No",
    responseDataKey: "search",
    onSelected: (selectedRowData, data) => {
      getSearchSelectedCashDisbursement({
        Source_No: selectedRowData[0].Source_No,
      });
      handleInputChange({
        target: { value: "edit", name: "cashMode" },
      });
      setCashDisbursement([]);
      setEditTransaction({
        edit: false,
        updateId: "",
      });

      closeSearchCashDisbursement();
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
      if (isPayToEnter) {
        dispatch({
          type: "UPDATE_FIELD",
          field: "Payto",
          value: selectedRowData[0].Name,
        });

        closePolicyIdClientIdRefId();
        setTimeout(() => {
          vatRef.current?.focus();
        }, 200);
      } else {
        dispatch({
          type: "UPDATE_FIELD",
          field: "ClientName",
          value: selectedRowData[0].Name,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "IDNo",
          value: selectedRowData[0].IDNo,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "subAcct",
          value: selectedRowData[0].sub_account,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "subAcctName",
          value: selectedRowData[0].ShortName,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "address",
          value: selectedRowData[0].address,
        });
        closePolicyIdClientIdRefId();
        setTimeout(() => {
          debitInputRef.current?.focus();
        }, 200);
      }
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
      }, 250);
    },
    searchRef: IdsSearchInput,
  });

  useEffect(() => {
    const debit = cashDisbursement.reduce((a: number, item: any) => {
      return a + parseFloat(item.debit.replace(/,/g, ""));
    }, 0);
    const credit = cashDisbursement.reduce((a: number, item: any) => {
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
  }, [cashDisbursement]);

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
    if (state.cashMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addCashDisbursementMutate({
            hasSelected,
            refNo: state.refNo,
            dateEntry: state.dateEntry,
            explanation: state.explanation,
            particulars: state.particulars,
            cashDisbursement,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addCashDisbursementMutate({
            hasSelected,
            refNo: state.refNo,
            dateEntry: state.dateEntry,
            explanation: state.explanation,
            particulars: state.particulars,
            cashDisbursement,
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
        mutateVoidCashDisbursement({
          refNo: state.refNo,
          dateEntry: state.dateEntry,
          userCodeConfirmation,
        });
      },
    });
  }

  function handleRowSave() {
    if (isNaN(parseFloat(state.credit))) {
      state.credit = "0.00";
    }
    if (isNaN(parseFloat(state.debit))) {
      state.debit = "0.00";
    }
    if (state.code === "" || state.acctName === "") {
      return openChartAccountSearch(state.code);
    }

    if (state.subAcctName === "" || state.ClientName === "") {
      return openPolicyIdClientIdRefId(state.ClientName);
    }
    if (state.credit === state.debit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "The values for credit and debit must be different",
        timer: 1500,
      });
    }
    if (state.code === "1.01.10" && state.checkNo === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Check No. is Required!",
        timer: 1500,
      });
    }

    if (state.TC_Code === "") {
      return openTransactionAccount(state.TC_Code);
    }

    if (state.Payto === "" && state.code === "1.01.10") {
      setIsPayToEnter(true);
      return openPolicyIdClientIdRefId(state.Payto);
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
        title: "Client Name is too long!",
        timer: 1500,
      });
    }
    if (state.debit.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Debit is too long!",
        timer: 1500,
      });
    }
    if (state.credit.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Credit is too long!",
        timer: 1500,
      });
    }
    if (state.checkNo.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Check No is too long!",
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
    if (state.Payto.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Pay to is too long!",
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
        setCashDisbursement((d: any) => {
          if (state.code === "1.01.10") {
            state.checkDate = formatDate(state.checkDate);
          } else {
            state.checkDate = "";
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

            if (parseFloat(state.debit.replace(/,/g, "")) !== 0) {
              state.debit = inputtax.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            } else {
              state.credit = inputtax.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
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
              state.credit.replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const debit = parseFloat(
              state.debit.replace(/,/g, "")
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
          address: "",
          checkNo: "",
          checkDate: new Date(),
        };
        setNewStateValue(dispatch, { ...state, ...resetValue });
        setEditTransaction({ edit: false, updateId: "" });
        wait(300).then(() => {
          codeInputRef.current?.focus();
        });
      }
    });
  }

  function handleClickPrint() {
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(cashDisbursement));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "cash-disbursement");
      localStorage.setItem("state", JSON.stringify(state));
      localStorage.setItem(
        "column",
        JSON.stringify([
          { datakey: "acctName", header: "ACCOUNT", width: "200px" },
          { datakey: "subAcctName", header: "SUB-ACCOUNT", width: "100px" },
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
  const isDisableField = state.cashMode === "";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        flex: 1,
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
          {isLoadingSearchCashDisbursement ? (
            <LoadingButton loading={isLoadingSearchCashDisbursement} />
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
                  return openSearchCashDisbursement(
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

          {state.cashMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                handleInputChange({
                  target: { value: "add", name: "cashMode" },
                });
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
            loading={loadingCashDisbursementMutate}
            disabled={state.cashMode === ""}
            onClick={handleOnSave}
            color="success"
            variant="contained"
          >
            Save
          </LoadingButton>
          {state.cashMode !== "" && (
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
                    refetchGeneralJournalGenerator();
                    handleInputChange({
                      target: { value: "", name: "cashMode" },
                    });
                    setNewStateValue(dispatch, initialState);
                    setCashDisbursement([]);
                    // setSearchSelected(false);
                    setEditTransaction({
                      edit: false,
                      updateId: "",
                    });
                  }
                });
              }}
              disabled={state.cashMode === ""}
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
            loading={loadingVoidCashDisbursement}
            disabled={state.cashMode !== "edit"}
            variant="contained"
            startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
          >
            Void
          </LoadingButton>
          <Button
            disabled={state.cashMode !== "edit"}
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
            <span>Total Rows:</span> <strong>{cashDisbursement.length}</strong>
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
            disabled={isDisableField}
            sx={{
              width: "140px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel htmlFor="return-check-id-field">
              Reference CV-
            </InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              disabled={isDisableField}
              fullWidth
              label="Reference CV-"
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
                    disabled={isDisableField}
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
          disabled={isDisableField}
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
              style: { height: "27px", fontSize: "14px", width: "150px" },
            },
          }}
        />
        <TextField
          disabled={isDisableField}
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
        <TextField
          disabled={isDisableField}
          label="Particulars"
          size="small"
          name="particulars"
          value={state.particulars}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
              return handleOnSave();
            }
          }}
          inputRef={particularsInputRef}
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
              disabled={isDisableField}
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
              <InputLabel htmlFor="chart-account-id">Code</InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                readOnly
                disabled={isDisableField}
                fullWidth
                label="Code"
                name="code"
                inputRef={codeInputRef}
                value={state.code}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openChartAccountSearch(state.code);
                  }
                }}
                id="chart-account-id"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={isDisableField}
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
            disabled={isDisableField}
            label="Account Name"
            size="small"
            name="acctName"
            value={state.acctName}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (
                e.code === "Enter" ||
                (e.code === "NumpadEnter" && state.acctName !== "")
              ) {
                e.preventDefault();
                return handleRowSave();
              }
              if (
                e.code === "Enter" ||
                (e.code === "NumpadEnter" && state.acctName === "")
              ) {
                e.preventDefault();
                return openChartAccountSearch(state.code);
              }
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              flex: 1,
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            disabled={isDisableField}
            label="Sub Account"
            size="small"
            name="subAcctName"
            value={state.subAcctName}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (
                e.code === "Enter" ||
                (e.code === "NumpadEnter" && state.subAcctName !== "")
              ) {
                e.preventDefault();
                return handleRowSave();
              }
              if (
                e.code === "Enter" ||
                (e.code === "NumpadEnter" && state.subAcctName === "")
              ) {
                e.preventDefault();
                return openPolicyIdClientIdRefId(state.ClientName);
              }
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "150px",
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
              disabled={isDisableField}
              sx={{
                width: "300px",
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
                readOnly
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                inputRef={idInputRef}
                disabled={isDisableField}
                fullWidth
                label="I.D"
                name="ClientName"
                value={state.ClientName}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    setIsPayToEnter(false);
                    return openPolicyIdClientIdRefId(state.ClientName);
                  }
                }}
                id="policy-client-ref-id"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={isDisableField}
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
          <TextField
            disabled={isDisableField}
            label="Debit"
            size="small"
            name="debit"
            value={state.debit}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
            }}
            onBlur={(e) => {
              e.preventDefault();
              let num = "0";
              if (!isNaN(parseFloat(state.debit))) {
                num = state.debit;
              }
              dispatch({
                type: "UPDATE_FIELD",
                field: "debit",
                value: parseFloat(num.toString().replace(/,/g, "")).toFixed(2),
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
            disabled={isDisableField}
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
            }}
            onFocus={(e) => {
              e.preventDefault();
              if (state.code === "1.01.10") {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "credit",
                  value: state.totalBalance,
                });
              }
            }}
            onBlur={(e) => {
              e.preventDefault();
              let num = "0";
              if (!isNaN(parseFloat(state.credit))) {
                num = state.credit;
              }
              dispatch({
                type: "UPDATE_FIELD",
                field: "credit",
                value: parseFloat(num.toString().replace(/,/g, "")).toFixed(2),
              });
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
          />
          <TextField
            disabled={isDisableField || state.code !== "1.01.10"}
            label="Check No"
            size="small"
            name="checkNo"
            value={state.checkNo}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleRowSave();
              }
            }}
            InputProps={{
              // inputRef: debitInputRef,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "160px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {state.code === "1.01.10" ? (
            <CustomDatePicker
              fullWidth={false}
              disabled={isDisableField || state.code !== "1.01.10"}
              label="Check Date"
              onChange={(value: any) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "checkDate",
                  value: value,
                });
              }}
              value={state.checkDate}
              onKeyDown={(e: any) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  const timeout = setTimeout(() => {
                    checkDatePickerRef.current
                      ?.querySelector("button")
                      ?.click();
                    clearTimeout(timeout);
                  }, 150);
                }
              }}
              datePickerRef={checkDatePickerRef}
              textField={{
                InputLabelProps: {
                  style: {
                    fontSize: "14px",
                  },
                },
                InputProps: {
                  style: { height: "27px", fontSize: "14px", width: "150px" },
                },
              }}
            />
          ) : (
            <TextField
              disabled={isDisableField || state.code !== "1.01.10"}
              label="Check Date"
              size="small"
              name="checkDate"
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "160px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          )}
          {isLoadingTransactionAccount ? (
            <LoadingButton loading={isLoadingTransactionAccount} />
          ) : (
            <FormControl
              variant="outlined"
              size="small"
              disabled={isDisableField}
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
                readOnly
                fullWidth
                label="TC"
                name="TC_Code"
                value={state.TC_Code}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openTransactionAccount(state.TC_Code);
                  }
                }}
                id="tc"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={isDisableField}
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
            disabled={isDisableField}
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
          {state.code !== "1.01.10" && (
            <TextField
              disabled={isDisableField}
              label="Payto"
              size="small"
              name="Payto"
              value={state.Payto}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return handleRowSave();
                }
              }}
              InputProps={{
                readOnly: true,
                // inputRef: debitInputRef,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "160px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          )}

          {state.code === "1.01.10" && (
            <>
              {isLoadingPolicyIdClientIdRefId ? (
                <LoadingButton loading={isLoadingPolicyIdClientIdRefId} />
              ) : (
                <FormControl
                  variant="outlined"
                  size="small"
                  disabled={isDisableField}
                  sx={{
                    width: "300px",
                    ".MuiFormLabel-root": {
                      fontSize: "14px",
                      background: "white",
                      zIndex: 99,
                      padding: "0 3px",
                    },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                >
                  <InputLabel htmlFor="policy-client-Payto">Payto</InputLabel>
                  <OutlinedInput
                    readOnly
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    inputRef={idInputRefPayTo}
                    disabled={isDisableField}
                    fullWidth
                    label="Payto"
                    name="Payto"
                    value={state.Payto}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        e.preventDefault();
                        setIsPayToEnter(true);
                        return openPolicyIdClientIdRefId(state.Payto);
                      }
                    }}
                    id="policy-client-Payto"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          ref={reloadIDButtonRef}
                          disabled={isDisableField}
                          color="secondary"
                          edge="end"
                          onClick={() => {
                            openPolicyIdClientIdRefId(state.Payto);
                          }}
                        >
                          <RestartAltIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
            </>
          )}
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
              inputRef={vatRef}
              disabled={isDisableField}
            >
              <MenuItem value="VAT">VAT</MenuItem>
              <MenuItem value={"NON-VAT"}>NON-VAT</MenuItem>
            </Select>
          </FormControl>
          <TextField
            disabled={isDisableField}
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
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "200px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <Button
            disabled={isDisableField}
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
              loadingCashDisbursementMutate ||
              loadingGetSearchSelectedCashDisbursement ||
              isLoadingJob
            }
            columns={selectedCollectionColumns}
            rows={formatDebitCredit(cashDisbursement)}
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
                  checkNo: "",
                  checkDate: new Date(),
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
                    return setCashDisbursement((d) => {
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
                checkDate: new Date(rowSelected.checkDate),
                sub_refNo: state.sub_refNo,
                refNo: state.refNo,
                dateEntry: state.dateEntry,
                explanation: state.explanation,
                particulars: state.particulars,
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
      {ModalSearchCashDisbursement}
    </div>
  );
}

function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
