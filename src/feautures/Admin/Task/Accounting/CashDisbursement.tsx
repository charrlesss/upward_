import {
  useReducer,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import { wait } from "../../../../lib/wait";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { deepOrange, grey } from "@mui/material/colors";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { format } from "date-fns";
import { setNewStateValue } from "./PostDateChecks";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import { flushSync } from "react-dom";
import PageHelmet from "../../../../components/Helmet";
import {
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import SaveIcon from "@mui/icons-material/Save";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Loading } from "../../../../components/Loading";

const initialState = {
  sub_refNo: "",
  refNo: "",
  dateEntry: format(new Date(), "yyyy-MM-dd"),
  explanation: "",
  particulars: "",

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
const columns = [
  {
    key: "code",
    label: "Code",
    width: 150,
    type: "text",
  },
  {
    key: "acctName",
    label: "Account Name",
    width: 400,
    type: "text",
    readonly: () => true,
  },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 170,
    type: "text",
    readonly: () => true,
  },
  {
    key: "ClientName",
    label: "Name",
    width: 400,
    type: "text",
  },
  {
    key: "debit",
    label: "Debit",
    width: 120,
    type: "number",
  },
  {
    key: "credit",
    label: "Credit",
    width: 120,
    type: "number",
  },
  {
    key: "checkNo",
    label: "Check No",
    width: 120,
    type: "text",
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== "1.01.10";
    },
  },
  {
    key: "checkDate",
    label: "Check Date",
    width: 120,
    type: "date",
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== "1.01.10";
    },
    typeLogic: (rowItm: any) => {
      return rowItm[0] !== "1.01.10" ? "text" : "date";
    },
  },
  {
    key: "TC_Code",
    label: "TC",
    width: 120,
    type: "text",
  },
  {
    key: "remarks",
    label: "Remarks",
    width: 400,
    type: "text",
  },
  {
    key: "Payto",
    label: "Payto",
    width: 400,
    type: "text",
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== "1.01.10";
    },
  },
  {
    key: "vatType",
    label: "Vat Type",
    width: 100,
    type: "select",
    options: [{ key: "NON-VAT" }, { key: "VAT" }],
    setDefaultValue: () => {
      return "NON-VAT";
    },
  },
  {
    key: "invoice",
    label: "Invoice",
    width: 200,
    type: "text",
  },
  { key: "IDNo", label: "I.D.", width: 300, hide: true },
  {
    key: "BranchCode",
    headerName: "BranchCode",
    width: 300,
    hide: true,
  },
  {
    key: "addres",
    headerName: "addres",
    hide: true,
  },
  {
    key: "subAcct",
    headerName: "subAcct",
    hide: true,
  },
  {
    key: "TC_Desc",
    headerName: "TC_Desc",
    hide: true,
  },
];
export default function CashDisbursement() {
  const tableRef = useRef<any>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);
  const particularRef = useRef<HTMLTextAreaElement>(null);
  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const [cashDMode, setCashDMode] = useState("");
  const [getTotalDebit, setGetTotalDebit] = useState(0);
  const [getTotalCredit, setGetTotalCredit] = useState(0);
  const [totalRow, setTotalRow] = useState(0);
  const isDisableField = cashDMode === "";

  const refCode = useRef<HTMLInputElement>(null);
  const refAccountName = useRef<HTMLInputElement>(null);
  const refSubAccount = useRef<HTMLInputElement>(null);
  const _refSubAccount = useRef("");
  const refName = useRef<HTMLInputElement>(null);
  const _refName = useRef("");

  const refDebit = useRef<HTMLInputElement>(null);
  const refCredit = useRef<HTMLInputElement>(null);
  const refCheckNo = useRef<HTMLInputElement>(null);
  const refCheckDate = useRef<HTMLInputElement>(null);

  const refTC = useRef<HTMLInputElement>(null);
  const _refTC = useRef("");
  const refRemarks = useRef<HTMLInputElement>(null);
  const refPayTo = useRef<HTMLInputElement>(null);
  const _refPayTo = useRef("");

  const refVat = useRef<HTMLSelectElement>(null);
  const refInvoice = useRef<HTMLInputElement>(null);

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
      const SearchData = selected.map((itm: any, idx: number) => {
        itm.credit = parseFloat(itm.credit.replace(/,/g, "")).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
        itm.debit = parseFloat(itm.debit.replace(/,/g, "")).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );

        if (itm.code === "1.01.10") {
          itm.checkDate = new Date(itm.checkDate).toISOString().split("T")[0];
        } else {
          itm.checkDate = "";
        }

        return [
          itm.code,
          itm.acctName,
          itm.subAcctName,
          itm.ClientName,
          itm.debit,
          itm.credit,
          itm.checkNo,
          itm.checkDate,
          itm.TC_Code,
          itm.remarks,
          itm.Payto,
          itm.vatType,
          itm.invoice,
          itm.IDNo,
          itm.Branch_Code,
          itm.refNo,
          itm.address,
          itm.subAcct,
        ];
      });

      wait(250).then(() => {
        tableRef.current?.setData(SearchData);

        setTotals(SearchData);
        wait(250).then(() => {
          refCode.current?.focus();
        });
      });
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
      setCashDMode("update");
      closeSearchCashDisbursement();
    },
    onCloseFunction: (value: any) => {
      //   dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: chartAccountSearchInput,
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
        resetAll();
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
        resetAll();
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
  const { mutate: mutateOnPrint, isLoading: isLoadingOnPrint } = useMutation({
    mutationKey: "get-selected-search-general-journal",
    mutationFn: async (variable: any) =>
      await myAxios.post("/task/accounting/cash-disbursement/print", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      const response = res as any;
      flushSync(() => {
        localStorage.removeItem("printString");
        localStorage.setItem(
          "dataString",
          JSON.stringify(response.data.print.PrintTable)
        );
        localStorage.setItem("paper-width", "8.5in");
        localStorage.setItem("paper-height", "11in");
        localStorage.setItem("module", "cash-disbursement");
        localStorage.setItem(
          "state",
          JSON.stringify(response.data.print.PrintPayeeDetails)
        );
        localStorage.setItem(
          "column",
          JSON.stringify([
            { datakey: "Account", header: "ACCOUNT", width: "200px" },
            { datakey: "Identity", header: "IDENTITY", width: "277px" },
            { datakey: "Debit", header: "DEBIT", width: "100px" },
            { datakey: "Credit", header: "CREDIT", width: "100px" },
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
    },
  });
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
  function handleClickPrint() {
    mutateOnPrint({ Source_No: state.refNo });
  }
  function setTotals(tableData: any) {
    const credit =
      tableData?.reduce((a: number, item: any) => {
        let deb = 0;
        if (!isNaN(parseFloat(item[5].replace(/,/g, "")))) {
          deb = parseFloat(item[5].replace(/,/g, ""));
        }
        return a + deb;
      }, 0) || 0;

    const debit =
      tableData?.reduce((a: number, item: any) => {
        let deb = 0;
        if (!isNaN(parseFloat(item[4].replace(/,/g, "")))) {
          deb = parseFloat(item[4].replace(/,/g, ""));
        }
        return a + deb;
      }, 0) || 0;

    setTotalRow(tableData.length);
    setGetTotalDebit(debit);
    setGetTotalCredit(credit);
  }

  function resetAll() {
    setCashDMode("");
    setNewStateValue(dispatch, initialState);
    refetchGeneralJournalGenerator();
    setGetTotalDebit(0);
    setGetTotalCredit(0);
    setTotalRow(0);
    wait(100).then(() => {
      resetRowField();
      tableRef.current?.resetTable();
    });
  }
  function printRow(rowItm: any) {
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify([]));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "cash-disbursement-check");
      localStorage.setItem(
        "state",
        JSON.stringify({
          checkDate: rowItm[7],
          Payto: rowItm[10],
          credit: rowItm[5],
        })
      );
      localStorage.setItem("column", JSON.stringify([]));
      localStorage.setItem(
        "title",
        user?.department === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES\n"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n"
      );
    });
    window.open("/dashboard/print", "_blank");
  }
  function deleteRow() {
    const tableData = tableRef.current.getData();
    const SelectedIndex = tableRef.current?.getSelectedIndex();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want Delete This Row",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (tableData.length === 1) {
          tableData.splice(0, 1);
          tableRef.current?.updateData(tableData);
          tableRef.current?.AddRow();

          return;
        }
        const indexToRemove = SelectedIndex;
        if (indexToRemove > -1 && indexToRemove < tableData.length) {
          tableData.splice(indexToRemove, 1);
        }
        tableRef.current?.updateData(tableData);
        wait(100).then(() => {
          const input = document.querySelector(
            `.tr.row-${indexToRemove - 1} td input`
          ) as HTMLInputElement;
          if (input) {
            input.click();
          }
        });
      }
    });
  }

  const handleOnSave = useCallback(() => {
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
          expRef.current?.focus();
        });
      });
    }
    if (getTotalDebit <= 0 && getTotalCredit <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must not be zero(0), please double check the entries",
        timer: 1500,
      });
    }
    if (getTotalDebit !== getTotalCredit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must be balance, please double check the entries",
        timer: 1500,
      });
    }
    const tableData = tableRef.current.getData();
    const cashDisbursement = tableData
      .filter((itm: any) => itm[0] !== "")
      .map((itm: any, idx: any) => {
        return {
          code: itm[0],
          acctName: itm[1],
          subAcctName: itm[2],
          ClientName: itm[3],
          debit: itm[4],
          credit: itm[5],
          checkNo: itm[6],
          checkDate: itm[7],
          TC_Code: itm[8],
          remarks: itm[9],
          Payto: itm[10],
          vatType: itm[11],
          invoice: itm[12],
          TempID: idx,
          IDNo: itm[14],
          BranchCode: itm[15],
          addres: itm[16],
          subAcct: itm[17],
          TC_Desc: itm[18],
        };
      });
    if (cashDMode === "update") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addCashDisbursementMutate({
            hasSelected: cashDMode === "update",
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
            hasSelected: cashDMode === "update",
            refNo: state.refNo,
            dateEntry: state.dateEntry,
            explanation: state.explanation,
            particulars: state.particulars,
            cashDisbursement,
          });
        },
      });
    }
  }, [
    state,
    addCashDisbursementMutate,
    cashDMode,
    getTotalCredit,
    getTotalDebit,
  ]);

  function resetRowField() {
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
    if (refCheckNo.current) {
      refCheckNo.current.value = "";
    }
    if (refCheckDate.current) {
      refCheckDate.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (refTC.current) {
      refTC.current.value = "";
    }
    if (refRemarks.current) {
      refRemarks.current.value = "";
    }
    if (refPayTo.current) {
      refPayTo.current.value = "";
    }
    if (refVat.current) {
      refVat.current.value = "Non-VAT";
    }
    if (refInvoice.current) {
      refInvoice.current.value = "";
    }

    _refSubAccount.current = "";
    _refName.current = "";
    _refTC.current = "";
    _refPayTo.current = "";

    if (refCheckNo.current) refCheckNo.current.disabled = true;
    if (refCheckDate.current) refCheckDate.current.disabled = true;
    if (refPayTo.current) refPayTo.current.disabled = true;
    tableRef.current.setSelectedRow(null);
    tableRef.current.resetCheckBox();
  }

  function SumbitRow() {
    if (!refCode.current) {
      return alert("Account Code is required");
    }

    if (refCode.current.value === "") {
      alert("Account Code is required");
      refCode.current.focus();
      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refCheckNo.current?.value === ""
    ) {
      alert("Check No is required");
      refCheckNo.current.focus();

      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refCheckDate.current?.value === ""
    ) {
      alert("Check Date is required");
      refCheckDate.current.focus();
      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refPayTo.current?.value === ""
    ) {
      alert("Pay To is required");
      refPayTo.current.focus();
      return false;
    } else if (refName.current?.value === "") {
      alert("Name is required");
      refName.current.focus();
      return false;
    } else if (refDebit.current?.value === refCredit.current?.value) {
      alert(
        "Credit and Debit cannot be the same. They must have a difference."
      );
      refCredit.current?.focus();
      return false;
    } else if (refTC.current?.value === "") {
      alert("TC is required");
      refTC.current.focus();

      return false;
    }

    const getSelectedItem = tableRef.current.getSelectedRow();
    if (getSelectedItem !== null) {
      const data = tableRef.current.getData();
      data.splice(getSelectedItem, 1);
      tableRef.current.setData(data);
    }

    wait(100).then(() => {
      if (!refCode.current) {
        return alert("Account Code is required");
      }

      const newData = [
        refCode.current?.value, // code:
        refAccountName.current?.value, // acctName:"",
        refSubAccount.current?.value, // subAcctName:"",
        refName.current?.value, // ClientName:"",
        refDebit.current?.value, // debit:"",
        refCredit.current?.value, // credit:"",
        refCheckNo.current?.value, // checkNo:"",
        refCheckDate.current?.value, // checkDate:"",
        refTC.current?.value, // TC_Code:"",
        refRemarks.current?.value, // remarks:"",
        refPayTo.current?.value, // Payto:"",
        refVat.current?.value, // vatType:"",
        refInvoice.current?.value, // invoice:"",
        _refName.current, // IDNo:"",
        "HO", // BranchCode:"",
        _refPayTo.current, // addres:"",
        _refSubAccount.current, // subAcct:"",
        _refTC.current, // TC_Desc:"",
      ];

      if (
        refVat.current &&
        refVat.current.value === "VAT" &&
        refCode.current.value !== "1.06.02"
      ) {
        if (!refCredit.current || !refDebit.current) {
          return;
        }

        const credit = parseFloat(refCredit.current.value.replace(/,/g, ""));
        const debit = parseFloat(refDebit.current.value.replace(/,/g, ""));
        let taxableamt = 0;

        if (debit !== 0) {
          taxableamt = debit / 1.12;
          newData[4] = taxableamt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          taxableamt = credit / 1.12;
          newData[5] = taxableamt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }

        let inputtax = taxableamt * 0.12;
        const _newData = [
          "1.06.02",
          "Input Tax",
          refSubAccount.current?.value,
          refName.current?.value,
          "",
          "",
          refCheckNo.current?.value,
          refCheckDate.current?.value,
          refTC.current?.value,
          refRemarks.current?.value,
          refPayTo.current?.value,
          refVat.current?.value,
          refInvoice.current?.value,
          _refName.current,
          "HO",
          _refPayTo.current,
          _refSubAccount.current,
          _refTC.current,
        ];

        if (parseFloat(refDebit.current.value.replace(/,/g, "")) !== 0) {
          _newData[4] = inputtax.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          _newData[5] = newData[5];
        } else {
          _newData[5] = inputtax.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          _newData[4] = newData[4];
        }
        const totalData = [...tableRef.current.getData(), newData, _newData];
        tableRef.current.setData(totalData);
        const SearchData = totalData.map((itm: any) => {
          itm[4] = parseFloat(itm[4].replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          itm[5] = parseFloat(itm[5].replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );

          return itm;
        });
        setTotals(SearchData);
        resetRowField();
        wait(100).then(() => {
          refCode.current?.focus();
        });
        return;
      } else {
        const totalData = [...tableRef.current.getData(), newData];
        tableRef.current.setData(totalData);
        const SearchData = totalData.map((itm: any) => {
          itm[4] = parseFloat(itm[4].replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          itm[5] = parseFloat(itm[5].replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          return itm;
        });
        setTotals(SearchData);
        resetRowField();
        wait(100).then(() => {
          refCode.current?.focus();
        });
        return;
      }
    });
  }
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

          if (refCode.current && refCode.current.value === "1.01.10") {
            if (refCheckNo.current) refCheckNo.current.disabled = false;
            if (refCheckDate.current) refCheckDate.current.disabled = false;
            if (refPayTo.current) refPayTo.current.disabled = false;
          } else {
            if (refCheckNo.current) refCheckNo.current.disabled = true;
            if (refCheckDate.current) refCheckDate.current.disabled = true;
            if (refPayTo.current) refPayTo.current.disabled = true;
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
        key: "Acronym",
        label: "Acronym",
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
          if (refSubAccount.current) {
            refSubAccount.current.value = rowItm[7];
          }
          if (refName.current) {
            refName.current.value = rowItm[2];
          }

          _refSubAccount.current = rowItm[6];
          _refName.current = rowItm[1];

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
          _refTC.current = rowItm[1];
          refRemarks.current?.focus();
        });
        TransactionAccountCloseModal();
      }
    },
  });
  // pay to Search
  const {
    UpwardTableModalSearch: PayToUpwardTableModalSearch,
    openModal: payToOpenModal,
    closeModal: payToCloseModal,
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
      {
        key: "address",
        label: "address",
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (refPayTo.current) {
            refPayTo.current.value = rowItm[2];
          }
          _refPayTo.current = rowItm[7];

          refVat.current?.focus();
        });
        payToCloseModal();
      }
    },
  });

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
      {(loadingGetSearchSelectedCashDisbursement ||
        loadingGeneralJournalGenerator) && <Loading />}
      <PageHelmet title="Cash Disbursement" />

      <div
        style={{
          background: "#F1F1F1",
          padding: "5px",
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
                      openSearchCashDisbursement(e.currentTarget.value);
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
                inputRef={inputSearchRef}
              />
            )}

            {cashDMode === "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setCashDMode("add");
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
              disabled={cashDMode === ""}
              onClick={handleOnSave}
              color="success"
              variant="contained"
            >
              Save
            </LoadingButton>
            {cashDMode !== "" && (
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
                      resetAll();
                    }
                  });
                }}
                disabled={cashDMode === ""}
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
              disabled={cashDMode !== "update"}
              variant="contained"
              startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
            >
              Void
            </LoadingButton>
            <LoadingButton
              loading={isLoadingOnPrint}
              disabled={cashDMode !== "update"}
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
            </LoadingButton>
          </div>
        </div>
        <div style={{ display: "flex", marginBottom: "10px" }}>
          <fieldset
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              position: "relative",
              flex: 1,
              height: "auto",
              display: "flex",
              marginTop: "10px",
              gap: "10px",
              padding: "15px",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                width: "300px",
                display: "flex",
                rowGap: "5px",
                flexDirection: "column",
              }}
            >
              {loadingGeneralJournalGenerator ? (
                <LoadingButton loading={loadingGeneralJournalGenerator} />
              ) : (
                <TextInput
                  label={{
                    title: "Reference:   CV- ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    disabled: isDisableField,
                    type: "text",
                    style: { width: "190px" },
                    readOnly: true,
                    value: state.refNo,
                    name: "refNo",
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        dateRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={refNoRef}
                />
              )}
              <TextInput
                label={{
                  title: "Date : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "date",
                  name: "dateEntry",
                  value: state.dateEntry,
                  style: { width: "190px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      expRef.current?.focus();
                    }
                  },
                  onChange: (e) => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "dateEntry",
                      value: e.target.value,
                    });
                  },
                }}
                inputRef={dateRef}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                rowGap: "5px",
                flexDirection: "column",
              }}
            >
              <TextInput
                label={{
                  title: "Explanation : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "text",
                  style: { flex: 1 },
                  name: "explanation",
                  value: state.explanation,
                  onChange: (e) => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "explanation",
                      value: e.target.value,
                    });
                  },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      particularRef.current?.focus();
                    }
                  },
                }}
                inputRef={expRef}
              />
              <TextAreaInput
                label={{
                  title: "Particulars : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                textarea={{
                  rows: 4,
                  disabled: isDisableField,
                  style: { flex: 1 },
                  name: "particulars",
                  value: state.particulars,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      //  refDate.current?.focus()
                    }
                  },
                  onChange: (e) => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "particulars",
                      value: e.target.value,
                    });
                  },
                }}
                _inputRef={particularRef}
              />
            </div>
          </fieldset>
          <fieldset
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              position: "relative",
              width: "400px",
              height: "auto",
              display: "flex",
              marginTop: "10px",
              gap: "10px",
              padding: "15px",
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                textAlign: "center",
                width: "100px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  padding: 0,
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: "12px" }}>Total Rows:</span>{" "}
                <strong>{totalRow}</strong>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div
                style={{
                  margin: 0,
                  padding: 0,
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    width: "80px",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  Total Debit:
                </p>
                <strong>
                  {getTotalDebit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <div
                style={{
                  margin: 0,
                  padding: 0,
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    width: "80px",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  Total Credit:
                </p>
                <strong>
                  {getTotalCredit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <div
                style={{
                  margin: 0,
                  padding: 0,
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    width: "80px",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  Balance:
                </p>
                <strong
                  style={{
                    color: getTotalDebit - getTotalCredit > 0 ? "red" : "black",
                  }}
                >
                  {(getTotalDebit - getTotalCredit).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            </div>
          </fieldset>
        </div>
        <fieldset
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            position: "relative",
            width: "100%",
            height: "auto",
            margin: "10px 0px",
            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "40px",
            }}
          >
            <TextInput
              label={{
                title: "Code : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
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
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refCode.current) {
                  chartAccountOpenModal(refCode.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
            <TextInput
              label={{
                title: "Account Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: isDisableField,
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
                  width: "85px",
                },
              }}
              input={{
                disabled: isDisableField,
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
                  width: "80px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "290px" },
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
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refName.current) {
                  clientOpenModal(refName.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <TextFormatedInput
              label={{
                title: "Debit : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
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
                  width: "95px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (refCode.current) {
                      if (refCode.current?.value === "1.01.10") {
                        refCheckNo.current?.focus();
                      } else {
                        refTC.current?.focus();
                      }
                    } else {
                      refTC.current?.focus();
                    }
                  }
                },
              }}
              inputRef={refCredit}
            />
            <TextInput
              label={{
                title: "Check No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "85px",
                },
              }}
              input={{
                disabled: true,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refCheckDate.current?.focus();
                  }
                },
              }}
              inputRef={refCheckNo}
            />
            <TextInput
              label={{
                title: "Check Date : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                disabled: true,
                type: "date",
                style: { width: "190px" },
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refTC.current?.focus();
                  }
                },
              }}
              inputRef={refCheckDate}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <TextInput
              label={{
                title: "TC : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
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
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refTC.current) {
                  TransactionAccountOpenModal(refTC.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
            <TextInput
              label={{
                title: "Remarks : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "505px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (
                      refCode.current &&
                      refCode.current.value === "1.01.10"
                    ) {
                      refPayTo.current?.focus();
                    } else {
                      refVat.current?.focus();
                    }
                  }
                },
              }}
              inputRef={refRemarks}
            />
            <TextInput
              label={{
                title: "Pay To: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                disabled: true,
                type: "text",
                style: { width: "290px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    payToOpenModal(e.currentTarget.value);
                  }
                },
              }}
              inputRef={refPayTo}
              icon={
                <AccountCircleIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refPayTo.current) {
                  payToOpenModal(refPayTo.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <SelectInput
              label={{
                title: "Vat Type : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              selectRef={refVat}
              select={{
                disabled: isDisableField,
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
                  width: "95px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    SumbitRow();
                  }
                },
              }}
              inputRef={refInvoice}
            />

            <Button
              disabled={isDisableField}
              sx={{
                height: "22px",
                fontSize: "11px",
                width: "165px",
              }}
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: "12px" }} />}
              onClick={() => {
                SumbitRow();
              }}
              color="success"
            >
              Save Row
            </Button>
          </div>
        </fieldset>
        <DataGridViewReact
          ref={tableRef}
          columns={columns}
          height="280px"
          getSelectedItem={(rowItm: any) => {
            if (rowItm) {
              if (rowItm[0] === "1.01.10") {
                if (refCheckNo.current) {
                  refCheckNo.current.value = rowItm[6];
                }
                if (refCheckDate.current) {
                  refCheckDate.current.value = format(
                    new Date(rowItm[7]),
                    "yyyy-MM-dd"
                  );
                }
                if (refPayTo.current) {
                  refPayTo.current.value = rowItm[10];
                }

                if (refCheckNo.current) refCheckNo.current.disabled = false;
                if (refCheckDate.current) refCheckDate.current.disabled = false;
                if (refPayTo.current) refPayTo.current.disabled = false;
              }

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
                refTC.current.value = rowItm[8];
              }
              if (refRemarks.current) {
                refRemarks.current.value = rowItm[9];
              }

              if (refVat.current) {
                refVat.current.value = rowItm[11];
              }
              if (refInvoice.current) {
                refInvoice.current.value = rowItm[12];
              }

              _refSubAccount.current = rowItm[16];
              _refName.current = rowItm[13];
              _refTC.current = rowItm[17] ?? "";
              _refPayTo.current = rowItm[15];
            } else {
              resetRowField();
            }
          }}
          onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
            if (e.code === "Delete" || e.code === "Backspace") {
              const isConfim = window.confirm(
                `Are you sure you want to delete?`
              );
              if (isConfim) {
                const debitTableData = tableRef.current.getData();
                debitTableData.splice(rowIdx, 1);
                const SearchData = debitTableData.map((itm: any, idx: number) => {
                  itm.credit = parseFloat(itm[5].replace(/,/g, "")).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  );
                  itm.debit = parseFloat(itm[4].replace(/,/g, "")).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  );
          
                  return itm
                });
                tableRef.current.setData(debitTableData);
                setTotals(SearchData);
                return;
              }
            }
          }}
          ActionComponent={({selectedRowIndex,closeModal}:any) => {
            return (
              <div
                style={{
                  flex: 1,
                  background: "#F1F1F1",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems:"center",
                  justifyContent:"center"
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{
                    height: "20px",
                    width: "120px",
                    marginBottom: "5px",
                    fontSize:"10px"
                  }}
                  onClick={()=>{
                    alert(selectedRowIndex)
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    height: "20px",
                    width: "120px",
                    marginBottom: "5px",
                    fontSize:"10px"
                  }}
                  onClick={()=>{
                    const debitTableData = tableRef.current.getData();
                    debitTableData.splice(selectedRowIndex, 1);
                    const SearchData = debitTableData.map((itm: any, idx: number) => {
                      itm.credit = parseFloat(itm[5].replace(/,/g, "")).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      );
                      itm.debit = parseFloat(itm[4].replace(/,/g, "")).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      );
              
                      return itm
                    });
                    tableRef.current.setData(debitTableData);
                    setTotals(SearchData);
                    closeModal()
                  }}
                >
                  Delete
                </Button>
              </div>
            );
          }}
        />
        {ModalSearchCashDisbursement}
      </div>
      <ChartAccountUpwardTableModalSearch />
      <PayToUpwardTableModalSearch />
      <ClientUpwardTableModalSearch />
      <TransactionAccountUpwardTableModalSearch />
    </>
  );
}
