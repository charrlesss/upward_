import { useReducer, useContext, useState, useRef, useEffect, forwardRef, useImperativeHandle, Fragment } from "react";
import {
  TextField,
  Button,
  Pagination,
} from "@mui/material";
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
import { SelectInput, TextAreaInput, TextInput } from "../../../../components/UpwardFields";
import { format } from "date-fns";
import "../../../../style/datagridview.css"
import { setNewStateValue } from "./PostDateChecks";
import { codeCondfirmationAlert, saveCondfirmationAlert } from "../../../../lib/confirmationAlert";
import { flushSync } from "react-dom";
import { NumericFormat } from "react-number-format";


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
    key: "code", label: "Code", width: 150, type: 'text'
  },
  {
    key: "acctName", label: "Account Name", width: 400, type: 'text'
  },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 170,
    type: 'text'

  },
  {
    key: "ClientName", label: "Name", width: 400, type: 'text', readonly: () => true

  },
  {
    key: "debit", label: "Debit", width: 120, type: 'number'

  },
  {
    key: "credit", label: "Credit", width: 120, type: 'number'
  },
  {
    key: "checkNo", label: "Check No", width: 120, type: 'text',
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== '1.01.10'
    }
  },
  {
    key: "checkDate", label: "Check Date", width: 120, type: 'date',
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== '1.01.10'
    },
  },
  {
    key: "TC_Code", label: "TC", width: 120, type: 'text'
  },
  {
    key: "remarks",
    label: "Remarks",
    width: 400,
    type: 'text'
  },
  {
    key: "Payto", label: "Payto", width: 400, type: 'text',
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== '1.01.10'
    }
  },
  {
    key: "vatType",
    label: "Vat Type",
    width: 100,
    type: 'select',
    options: [{ key: 'NON-VAT' }, { key: 'VAT' }],
    setDefaultValue: () => {
      return 'NON-VAT'
    }
  },
  {
    key: "invoice", label: "Invoice", width: 200, type: 'text'
  },
  { key: "TempID", label: "TempId", hide: true },
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
  }
];


export default function CashDisbursement() {
  const tableRef = useRef<any>(null)
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const refNoRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const expRef = useRef<HTMLInputElement>(null)
  const particularRef = useRef<HTMLTextAreaElement>(null)
  const IdsSearchInput = useRef<HTMLInputElement>(null)
  const chartAccountSearchInput = useRef<HTMLInputElement>(null)
  const [cashDMode, setCashDMode] = useState('')
  const [getTotalDebit, setGetTotalDebit] = useState(0)
  const [getTotalCredit, setGetTotalCredit] = useState(0)
  const [totalRow, setTotalRow] = useState(0)

  const isDisableField = cashDMode === "";


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
        type: "UPDATE_FIELD", field: "refNo", value: response.data.generatedId[0].id
      })
      dispatch({
        type: "UPDATE_FIELD", field: "sub_refNo", value: response.data.generatedId[0].id
      })
    },
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
      const RowIndex = tableRef.current.getSelectedIndex()
      const tableData = tableRef.current.getData()
      const newTableData = tableData
      newTableData[RowIndex][0] = selectedRowData[0].Acct_Code
      newTableData[RowIndex][1] = selectedRowData[0].Acct_Title
      tableRef.current.updateData(newTableData)
      wait(250).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-3`) as HTMLInputElement
        input?.focus()
      })
      closeChartAccountSearch();
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
      const RowIndex = tableRef.current.getSelectedIndex()
      const tableData = tableRef.current.getData()
      const newTableData = tableData
      newTableData[RowIndex][3] = selectedRowData[0].Name
      newTableData[RowIndex][14] = selectedRowData[0].IDNo
      newTableData[RowIndex][17] = selectedRowData[0].sub_account
      newTableData[RowIndex][2] = selectedRowData[0].ShortName
      newTableData[RowIndex][16] = selectedRowData[0].address
      tableRef.current.updateData(newTableData)
      wait(250).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-4`) as HTMLInputElement
        input?.focus()
      })

      closePolicyIdClientIdRefId();
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
      const RowIndex = tableRef.current.getSelectedIndex()
      const tableData = tableRef.current.getData()
      const newTableData = tableData
      newTableData[RowIndex][8] = selectedRowData[0].Code
      newTableData[RowIndex][18] = selectedRowData[0].Description

      tableRef.current.updateData(newTableData)
      wait(250).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-9`) as HTMLInputElement
        input?.focus()
      })

      closeTransactionAccount();
    },
    searchRef: IdsSearchInput,
  });
  const {
    ModalComponent: ModalPolicyIdPayTo,
    openModal: openPolicyIdPayTo,
    isLoading: isLoadingPolicyIdPayTo,
    closeModal: closePolicyIdPayTo,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-payto-clients-name",
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
      const RowIndex = tableRef.current.getSelectedIndex()
      const tableData = tableRef.current.getData()
      const newTableData = tableData
      newTableData[RowIndex][10] = selectedRowData[0].Name
      tableRef.current.updateData(newTableData)
      wait(250).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-11`) as HTMLInputElement
        input?.focus()
      })

      closePolicyIdPayTo();
    },
    searchRef: IdsSearchInput,
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
        itm.credit = parseFloat(itm.credit.replace(/,/g, '')).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        itm.debit = parseFloat(itm.debit.replace(/,/g, '')).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

        if (itm.code === '1.01.10') {
          itm.checkDate = new Date().toISOString().split('T')[0];

        } else {
          itm.checkDate = ''
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
          itm.TempID,
          itm.IDNo,
          itm.Branch_Code,
          itm.refNo,
          itm.address,
          itm.subAcct,
        ]
      })

      wait(250).then(() => {
        tableRef.current?.updateData(SearchData)
        tableRef.current?.setNewRowIndex(0)

        setTotals(SearchData)
        wait(250).then(() => {
          const input = document.querySelector(`.input.row-${0}.col-0`) as HTMLInputElement
          if (input) {
            input.focus()
          }
        })
      })
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
      setCashDMode('update')
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
        resetAll()
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
        resetAll()
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
    mutate: mutateOnPrint,
    isLoading: isLoadingOnPrint,
  } = useMutation({
    mutationKey: "get-selected-search-general-journal",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/print",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      flushSync(() => {
        localStorage.removeItem("printString");
        localStorage.setItem("dataString", JSON.stringify(response.data.print.PrintTable));
        localStorage.setItem("paper-width", "8.5in");
        localStorage.setItem("paper-height", "11in");
        localStorage.setItem("module", "cash-disbursement");
        localStorage.setItem("state", JSON.stringify(response.data.print.PrintPayeeDetails));
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
          expRef.current?.focus();
        });
      });
    }
    if (
      getTotalDebit <= 0 && getTotalCredit <= 0
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must not be zero(0), please double check the entries",
        timer: 1500,
      })
    }
    if (getTotalDebit !== getTotalCredit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must be balance, please double check the entries",
        timer: 1500,
      })
    }
    const tableData = tableRef.current.getData()
    const cashDisbursement = tableData.filter((itm: any) => itm[0] !== '').map((itm: any, idx: any) => {

      return ({
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
      })
    })
    if (cashDMode === "update") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addCashDisbursementMutate({
            hasSelected: cashDMode === 'update',
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
            hasSelected: cashDMode === 'update',
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
  function handleClickPrint() {
    mutateOnPrint({ Source_No: state.refNo })
  }
  function setTotals(tableData: any) {
    const credit = tableData?.reduce((a: number, item: any) => {
      let deb = 0
      if (!isNaN(parseFloat(item[5].replace(/,/g, "")))) {
        deb = parseFloat(item[5].replace(/,/g, ""))
      }
      return a + deb;
    }, 0) || 0


    const debit = tableData?.reduce((a: number, item: any) => {
      let deb = 0
      if (!isNaN(parseFloat(item[4].replace(/,/g, "")))) {
        deb = parseFloat(item[4].replace(/,/g, ""))
      }
      return a + deb;
    }, 0) || 0

    setTotalRow(tableData.length)
    setGetTotalDebit(debit)
    setGetTotalCredit(credit)
  }
  function SumbitRow() {
    const RowIndex = tableRef.current.getSelectedIndex()
    const tableData = tableRef.current.getData()

 
    if (tableData[RowIndex][0] === '') {
      alert('Account Code is required')

      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-0`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })

      return false

    }else if(tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][6] === ''){
      alert('Check No is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-6`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })

      return false

    }else if(tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][7] === ''){
      alert('Check Date is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-7`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })
      return false

    }else if(tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][10] === ''){
      alert('Pay To is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-10`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })
      return false

    } else if (tableData[RowIndex][3] === '') {
      alert('Name is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-3`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })

      return false

    } else if (tableData[RowIndex][4] === tableData[RowIndex][5]) {
      alert('Credit and Debit cannot be the same. They must have a difference.')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-4`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })
      return false

    } else if (tableData[RowIndex][8] === '') {
      alert('TC is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-8`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })

      return false
    }



    if (tableData[RowIndex][11] === "VAT" && tableData[RowIndex][0] !== "1.06.02") {
      const credit = parseFloat(tableData[RowIndex][5].replace(/,/g, ''))
      const debit = parseFloat(tableData[RowIndex][4].replace(/,/g, ''))
      let taxableamt = 0

      if (debit !== 0) {
        taxableamt = debit / 1.12
        tableData[RowIndex][4] = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

      } else {
        taxableamt = credit / 1.12
        tableData[RowIndex][5] = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

      }
      const defaultValue = columns.filter((itm: any) => !itm.hide).map((itm: any) => {
        if (itm.setDefaultValue) {
          return itm.setDefaultValue()
        }
        return ''
      })

      let inputtax = taxableamt * 0.12
      tableData.push(defaultValue)
      tableData[RowIndex + 1][0] = "1.06.02"
      tableData[RowIndex + 1][1] = "Input Tax"
      tableData[RowIndex + 1][2] = tableData[RowIndex][2]
      tableData[RowIndex + 1][3] = tableData[RowIndex][3]

      if (parseFloat(tableData[RowIndex][4].replace(/,/g, '')) !== 0) {
        tableData[RowIndex + 1][4] = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        tableData[RowIndex + 1][5] = tableData[RowIndex][5]
      } else {
        tableData[RowIndex + 1][5] = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        tableData[RowIndex + 1][4] = tableData[RowIndex][4]
      }

      tableData[RowIndex + 1][6] = tableData[RowIndex][6]
      tableData[RowIndex + 1][7] = tableData[RowIndex][7]
      tableData[RowIndex + 1][8] = tableData[RowIndex][8]
      tableData[RowIndex + 1][9] = tableData[RowIndex][9]
      tableData[RowIndex + 1][10] = tableData[RowIndex][10]
      tableData[RowIndex + 1][11] = tableData[RowIndex][11]
      tableData[RowIndex + 1][12] = tableData[RowIndex][12]
      tableData[RowIndex + 1][13] = tableData[RowIndex][13]
      tableData[RowIndex + 1][14] = tableData[RowIndex][14]
      tableData[RowIndex + 1][15] = tableData[RowIndex][15]
      tableData[RowIndex + 1][16] = tableData[RowIndex][16]
      tableData[RowIndex + 1][17] = tableData[RowIndex][17]
      tableData[RowIndex + 1][18] = tableData[RowIndex][18]
      tableRef.current.updateData(tableData)

    }

    setTotals(tableData)



    return true
  }

  function resetAll() {
    setCashDMode("")
    setNewStateValue(dispatch, initialState);
    refetchGeneralJournalGenerator();
    setGetTotalDebit(0)
    setGetTotalCredit(0)
    setTotalRow(0)
    wait(250).then(() => {
      tableRef.current?.updateData([])
      tableRef.current?.AddRow()
      tableRef.current?.setNewRowIndex(0)
      wait(250).then(() => {
        const input = document.querySelector(`.input.row-${0}.col-0`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })
    })

  }



  if (loadingGetSearchSelectedCashDisbursement || loadingGeneralJournalGenerator || isLoadingPolicyIdClientIdRefId || isLoadingChartAccountSearch || isLoadingPolicyIdPayTo || isLoadingTransactionAccount) {
    return <div>Loading...</div>
  }

  return (
    <div>
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
                setCashDMode("add")
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

                    resetAll()
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
            flexDirection: "column"
          }}
        >
          {loadingGeneralJournalGenerator ? (
            <LoadingButton loading={loadingGeneralJournalGenerator} />
          ) : (
            <TextInput
              label={{
                title: "Reference CV- : ",
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
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    dateRef.current?.focus()
                  }
                }
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  expRef.current?.focus()
                }
              },
              onChange: (e) => {
                dispatch({
                  type: "UPDATE_FIELD", field: "dateEntry", value: e.target.value
                })
              },
            }}
            inputRef={dateRef}
          />
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
                  type: "UPDATE_FIELD", field: "explanation", value: e.target.value
                })
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  particularRef.current?.focus()
                }
              }
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  //  refDate.current?.focus()
                }
              },
              onChange: (e) => {
                dispatch({
                  type: "UPDATE_FIELD", field: "particulars", value: e.target.value
                })
              },
            }}
            _inputRef={particularRef}
          />
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
          <div style={{ alignItems: "center", display: "flex", textAlign: "center", width: "100px" }}>
            <p style={{ margin: 0, padding: 0, color: "black", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px" }}>Total Rows:</span> <strong>{totalRow}</strong>
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", flexDirection: "column", flex: 1 }}>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Total Debit:</span> <strong>{
                getTotalDebit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }</strong>
            </p>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Total Credit:</span> <strong>{
                getTotalCredit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }</strong>
            </p>
            <p style={{ margin: 0, padding: 0, color: "black" }}>
              <span style={{ fontSize: "12px" }}>Balance:</span>{" "}
              <strong
                style={{
                  color:
                    (getTotalDebit - getTotalCredit) > 0
                      ? "red"
                      : "black",
                }}
              >
                {(getTotalDebit - getTotalCredit).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>
          </div>
        </fieldset>
      </div>
      <DataGridTableReact
        height={"300px"}
        ref={tableRef}
        rows={[]}
        columns={columns.filter((itm) => !itm.hide)}
        onInputKeyDown={(rowIdx: number, colIdx: number, value: any) => {
          const tableData = tableRef.current.getData()
          if (colIdx === 0) {
            openChartAccountSearch(value)
          } else if (colIdx === 3) {
            openPolicyIdClientIdRefId(value)
          } else if (colIdx === 8) {
            openTransactionAccount(value)
          } else if (colIdx === 10 && tableData[rowIdx][0] === '1.01.10') {
            openPolicyIdPayTo(value)
          } else if (colIdx === 5 && tableData[rowIdx][0] !== '1.01.10') {
            const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 3}`) as HTMLInputElement
            if (nextInput) {
              nextInput.focus()
            }
          } else if (colIdx === 9 && tableData[rowIdx][0] !== '1.01.10') {
            const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 2}`) as HTMLInputElement
            if (nextInput) {
              nextInput.focus()
            }
          } else {
            const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 1}`) as HTMLInputElement
            if (nextInput) {
              nextInput.focus()
            } else {
              if (SumbitRow()) {
                const confirm = window.confirm('Add New Row?')
                if (confirm) {
                  tableRef.current.AddRow()
                  let RowIndex = tableRef.current.getSelectedIndex()
                  if (tableData[RowIndex][11].toLowerCase() === 'vat') {
                    tableRef.current.setNewRowIndex(RowIndex + 2)
                    wait(250).then(() => {
                      const nextInput = document.querySelector(`.input.row-${RowIndex + 2}.col-0`) as HTMLInputElement
                      if (nextInput) {
                        nextInput.focus()
                      }
                    })
                  } else {
                    tableRef.current.setNewRowIndex(RowIndex + 1)
                    wait(250).then(() => {
                      const nextInput = document.querySelector(`.input.row-${RowIndex + 1}.col-0`) as HTMLInputElement
                      if (nextInput) {
                        nextInput.focus()
                      }
                    })
                  }
                }
              }

            }
          }
        }
        }
      />

      {ModalPolicyIdClientIdRefId}
      {ModalChartAccountSearch}
      {ModalPolicyIdPayTo}
      {ModalTransactionAccount}
      {ModalSearchCashDisbursement}
    </div>
  );
};


const DataGridTableReact = forwardRef(({
  rows,
  columns,
  onInputKeyDown,
  height
}: any, ref) => {
  const dataCellRef = useRef<any>(null)
  const mode = 'add'
  const [pages, setPages] = useState<Array<any>>([])
  const [pageNumber, setPageNumber] = useState(0)
  const [data, setData] = useState(rows)
  const [column, setColumn] = useState(columns)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)
  const [selectedRow, setSelectedRow] = useState<any>(0)


  const addRow = useRef(() => {
    const defaultValue = column.map((itm: any) => {
      if (itm.setDefaultValue) {
        return itm.setDefaultValue()
      }
      return ''
    })
    setData((datas: any) => [...datas, defaultValue])
  })

  useImperativeHandle(ref, () => ({
    getSelectedIndex: () => {
      return selectedRow
    },
    onInputKeyDown: (rowIdx: number, colIdx: number, e: any) => {
      onInputKeyDown(rowIdx, colIdx, e)
    },
    updateData: (data: any) => {
      setData(data)
    },
    getData: () => {
      return data
    },
    AddRow: () => {
      addRow.current()
    },
    setNewRowIndex: (rowIndex: number) => {
      setSelectedRow(rowIndex)
    },
  }));

  useEffect(() => {
    if (mode === 'add') {
      addRow.current()
    }
  }, [mode])

  useEffect(() => {
    const _pages = formatArrayIntoChunks(data, 100)
    setPages(_pages)
  }, [data])


  const startResize = (index: any, e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = columns[index].width;

    const doDrag = (moveEvent: any) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const updatedColumns = [...columns];
      updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
      setColumn(updatedColumns);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const DrawHeaderColumn = () => {
    return (
      <tr>
        {
          column.map((colItm: any, colIdx: any) => {
            return (
              <th
                className={`header col-${colIdx} ${colItm.key}`} key={colIdx}
                style={{ width: colItm.width, border: "1px solid black", position: "sticky", top: 0, zIndex: 1, background: "white" }}
              >
                <div
                  className="resize-handle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startResize(colIdx, e);
                  }}
                />
                {colItm.label}</th>
            )
          })
        }
      </tr>
    )
  }

  const CellInput = forwardRef(({
    rowIdx,
    colIdx,
    colItm,
    rowItm,
    parentRef
  }: any, ref: any) => {
    const [input, setInput] = useState(rowItm[colIdx])
    const prevValueRef = useRef(rowItm[colIdx]); // Use ref to store the previous value



    if (selectedRow === rowIdx) {
      if (colItm.type === 'select') {
        return (
          <SelectInput
            label={{
              title: "",
              style: {
                width: "0px",
              },
            }}
            select={{
              readOnly: colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx),
              className: `input row-${rowIdx} col-${colIdx} ${colItm.key}`,
              style: {
                width: "100%",
                height: "22px",
                background: selectedRow === rowIdx ? "transparent" : "white"
              },
              value: input,
              onChange: (e) => {
                setInput(e.target.value)
              },
              onKeyDown: (e) => {
                if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                  setData((itm: any) => {
                    itm[rowIdx][colIdx] = input
                    return itm
                  })
                  prevValueRef.current = input
                  if (parentRef.current) {
                    parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                  }

                }
              },
              onBlur: () => {
                setInput(prevValueRef.current)
              }
            }}
            datasource={colItm.options}
            values={"key"}
            display={"key"}
          />
        )
      } else if (colItm.type === 'number') {
        return (
          <NumericFormat
            readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
            className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
            value={input}
            getInputRef={ref}
            decimalScale={2}
            fixedDecimalScale={true}
            onValueChange={(values) => {
              setInput(values.formattedValue)
            }}
            style={{
              width: '100%',
              height: "100%",
              background: selectedRow === rowIdx ? "transparent" : "white"
            }}
            onKeyDown={(e) => {
              if (e.code === 'Enter' || e.code === 'NumpadEnter') {

                const valueInput = e.currentTarget.value
                if (valueInput !== '' && valueInput !== null && valueInput !== undefined) {
                  if (isNaN(parseFloat(valueInput.replace(/,/g, '')))) {
                    setInput('0.00')
                    setData((itm: any) => {
                      itm[rowIdx][colIdx] = '0.00'
                      return itm
                    })
                    prevValueRef.current = '0.00'
                  } else {
                    setData((itm: any) => {
                      itm[rowIdx][colIdx] = input
                      return itm
                    })
                    prevValueRef.current = input
                  }
                } else {
                  setInput('0.00')
                  setData((itm: any) => {
                    itm[rowIdx][colIdx] = '0.00'
                    return itm
                  })
                  prevValueRef.current = '0.00'

                }

                if (parentRef.current) {
                  parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                }
              }
            }}
            onBlur={(e) => {
              setInput(prevValueRef.current)
            }}
            allowNegative={false}
            thousandSeparator
            valueIsNumericString
          />
        )
      } else if (colItm.type === 'date') {
        return (
          <input
            readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
            className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
            style={{
              width: '100%',
              height: "100%",
              background: selectedRow === rowIdx ? "transparent" : "white"
            }}
            type="date"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                setData((itm: any) => {
                  itm[rowIdx][colIdx] = input
                  return itm
                })
                prevValueRef.current = input
                if (parentRef.current) {
                  parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                }

              }
            }}
            onBlur={()=>{
              setInput(prevValueRef.current)
            }}
          />
        )
      } else {
        return (
          <input
            readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
            className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
            style={{
              width: '100%',
              height: "100%",
              background: selectedRow === rowIdx ? "transparent" : "white"
            }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                setData((itm: any) => {
                  itm[rowIdx][colIdx] = input
                  return itm
                })
                prevValueRef.current = input
                if (parentRef.current) {
                  parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                }

              }
            }}
            onBlur={() => {
              setInput(prevValueRef.current)
            }}
          />
        )
      }
    } else {
      return (
        <input
          readOnly={selectedRow !== rowIdx}
          className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
          style={{
            width: '100%',
            height: "100%",
          }}
          value={rowItm[colIdx]}
          onDoubleClick={(e) => {
            setSelectedRow(rowIdx)
          }}
        />
      )
    }
  })
  const DrawDataColumn = forwardRef(({ parentRef }: any, ref) => {
    return (
      <tbody>
        {
          pages[pageNumber]?.map((rowItm: any, rowIdx: any) => {

            return (
              <tr key={rowIdx} className={`tr row-${rowIdx}`}>
                {
                  column.map((colItm: any, colIdx: any) => {
                    return (
                      <td

                        key={colIdx}
                        className={`td row-${rowIdx} col-${colIdx} ${colItm.key}`}
                        style={{
                          width: colItm.width,
                          padding: "0",
                          margin: "0",
                          background: selectedRow === rowIdx ? "#f0f9ff" : ""
                        }}
                      >
                        <CellInput
                          rowIdx={rowIdx}
                          colIdx={colIdx}
                          colItm={colItm}
                          rowItm={rowItm}
                          parentRef={parentRef}
                        />
                      </td>
                    )
                  })
                }
              </tr>
            )
          })
        }
      </tbody>
    )
  })

  return (
    <Fragment>
      <div style={{ width: "calc(100vw - 40px)", height, overflow: "auto", position: "relative" }}>
        <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", position: "relative" }}>
            <thead >
              {
                <DrawHeaderColumn />
              }
            </thead>
            {<DrawDataColumn ref={dataCellRef} parentRef={ref} />}
          </table>
        </div>
      </div>
      <div style={{ width: "calc(100vw - 40px)", display: "flex", height: "40px" }}>
        <div style={{ width: "50%", display: "flex", alignItems: "center" }}><span style={{ fontSize: "14px" }}>Records : {data.length}</span></div>
        <div style={{ width: "50%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Pagination
            count={pages.length}
            onChange={(e, value) => {
              setPageNumber(value - 1)
            }} />
        </div>
      </div>
    </Fragment>
  )
})


function formatArrayIntoChunks(arr: Array<any>, chunkSize = 100) {
  let result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

