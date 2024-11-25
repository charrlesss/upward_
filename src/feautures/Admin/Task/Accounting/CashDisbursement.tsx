import { useReducer, useContext, useState, useRef, useEffect, forwardRef, useImperativeHandle, Fragment, useCallback } from "react";
import {
  Button,
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
import { setNewStateValue } from "./PostDateChecks";
import { codeCondfirmationAlert, saveCondfirmationAlert } from "../../../../lib/confirmationAlert";
import { flushSync } from "react-dom";
import { NumericFormat } from "react-number-format";
import PageHelmet from "../../../../components/Helmet";


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
    key: "acctName", label: "Account Name", width: 400, type: 'text',
    readonly: () => true
  },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 170,
    type: 'text',
    readonly: () => true

  },
  {
    key: "ClientName", label: "Name", width: 400, type: 'text'

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
    },
  },
  {
    key: "checkDate", label: "Check Date", width: 120, type: 'date',
    readonly: (rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
      return rowItm[0] !== '1.01.10'
    },
    typeLogic: (rowItm: any) => {
      return rowItm[0] !== '1.01.10' ? "text" : "date"
    }
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
  const inputSearchRef = useRef<HTMLInputElement>(null)
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
      tableRef.current.updateData((newTableData: any) => {
        newTableData[RowIndex][0] = selectedRowData[0].Acct_Code
        newTableData[RowIndex][1] = selectedRowData[0].Acct_Title
        return newTableData
      })


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
      tableRef.current.updateData((newTableData: any) => {
        newTableData[RowIndex][3] = selectedRowData[0].Name
        newTableData[RowIndex][14] = selectedRowData[0].IDNo
        newTableData[RowIndex][17] = selectedRowData[0].sub_account
        newTableData[RowIndex][2] = selectedRowData[0].ShortName
        newTableData[RowIndex][16] = selectedRowData[0].address
        return newTableData
      })
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
      tableRef.current.updateData((newTableData: any) => {
        newTableData[RowIndex][8] = selectedRowData[0].Code
        newTableData[RowIndex][18] = selectedRowData[0].Description
        return newTableData
      })
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
      tableRef.current.updateData((newTableData: any) => {
        newTableData[RowIndex][10] = selectedRowData[0].Name
        return newTableData
      })
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
          itm.checkDate = new Date(itm.checkDate).toISOString().split('T')[0];

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
        // tableRef.current?.setNewRowIndex(0)

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

    } else if (tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][6] === '') {
      alert('Check No is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-6`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })

      return false

    } else if (tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][7] === '') {
      alert('Check Date is required')
      wait(500).then(() => {
        const input = document.querySelector(`.input.row-${RowIndex}.col-7`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      })
      return false

    } else if (tableData[RowIndex][0] !== '' && tableData[RowIndex][0] === '1.01.10' && tableData[RowIndex][10] === '') {
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

    return true
  }
  function resetAll() {
    setCashDMode("")
    setNewStateValue(dispatch, initialState);
    refetchGeneralJournalGenerator();
    setGetTotalDebit(0)
    setGetTotalCredit(0)
    setTotalRow(0)
    wait(100).then(() => {
      tableRef.current?.resetTable()
    })

  }
  function printRow(rowItm: any) {
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify([]));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "cash-disbursement-check");
      localStorage.setItem("state", JSON.stringify({
        checkDate: rowItm[7],
        Payto: rowItm[10],
        credit: rowItm[5],
      }));
      localStorage.setItem(
        "column",
        JSON.stringify([])
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
  function deleteRow() {
    const tableData = tableRef.current.getData()
    const SelectedIndex = tableRef.current?.getSelectedIndex()
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
          tableRef.current?.updateData(tableData)
          tableRef.current?.AddRow()

          return
        }
        const indexToRemove = SelectedIndex;
        if (indexToRemove > -1 && indexToRemove < tableData.length) {
          tableData.splice(indexToRemove, 1);
        }
        tableRef.current?.updateData(tableData)
        wait(100).then(() => {
          const input = document.querySelector(`.tr.row-${indexToRemove - 1} td input`) as HTMLInputElement
          if (input) {
            input.click()
          }
        })

      }
    });
  }
  function valueIsNaN(input: any) {
    const num = parseFloat(input);
    return isNaN(num) ? '0.00' : input
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
  }, [state, addCashDisbursementMutate, cashDMode, getTotalCredit, getTotalDebit])
  
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleOnSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOnSave]);

  if (loadingGetSearchSelectedCashDisbursement || loadingGeneralJournalGenerator || isLoadingPolicyIdClientIdRefId || isLoadingChartAccountSearch || isLoadingPolicyIdPayTo || isLoadingTransactionAccount) {
    return <div>Loading...</div>
  }

  return (
    <>
      <PageHelmet title="Cash Disbursement" />
      <div style={{
        background: "#F1F1F1",
        padding: "5px",
        flex: 1,

      }} >
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
                  setCashDMode("add")
                  tableRef.current.AddRow()
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
              border: "1px solid black",
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
              border: "1px solid black",
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
          disbaleTable={cashDMode === ""}
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
            } else if (colIdx === 5) {

              tableRef.current.updateData((newTableData: any) => {
                newTableData[rowIdx][colIdx] = valueIsNaN(value)
                return newTableData
              })
              const tableData = tableRef.current.getData()
              flushSync(() => {
                setGetTotalCredit(tableData?.reduce((a: any, b: any) => {
                  return a + parseFloat(b[5].replace(/,/g, ''))
                }, 0))
              })

              setTimeout(() => {
                if (tableData[rowIdx][0] !== '1.01.10') {
                  const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 3}`) as HTMLInputElement
                  if (nextInput) {
                    nextInput.focus()
                  }
                } else {
                  const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 1}`) as HTMLInputElement
                  if (nextInput) {
                    nextInput.focus()
                  }
                }
              }, 100)

            } else if (colIdx === 4) {
              tableRef.current.updateData((newTableData: any) => {
                newTableData[rowIdx][colIdx] = valueIsNaN(value)
                return newTableData
              })
              const tableData = tableRef.current.getData()
              flushSync(() => {
                setGetTotalDebit(tableData?.reduce((a: any, b: any) => {
                  return a + parseFloat(b[4].replace(/,/g, ''))
                }, 0))
              })

              setTimeout(() => {
                const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 1}`) as HTMLInputElement
                if (nextInput) {
                  nextInput.focus()
                }
              }, 100)

            } else if (colIdx === 9 && tableData[rowIdx][0] !== '1.01.10') {
              const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 2}`) as HTMLInputElement
              if (nextInput) {
                nextInput.focus()
              }
            } else {

              tableRef.current.updateData((newTableData: any) => {
                newTableData[rowIdx][colIdx] = value
                return newTableData
              })

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
          }}
          RightClickComponent={({ rowItm }: any) => {
            const buttonStyle: any = {
              padding: "5px 10px",
              margin: "0px",
              background: "transparent",
              color: "black",
              fontSize: "14px",
              width: "100%",
              borderRadius: "0px",
              textAlign: "left"
            }
            return (
              <div>
                <button
                  className="button-r"
                  style={buttonStyle}
                  onClick={() => {
                    deleteRow()
                  }}
                >
                  Delete
                </button>
                {rowItm[0] === '1.01.10' && <button
                  className="button-r"
                  style={buttonStyle}
                  onClick={() => {
                    printRow(rowItm)
                  }}>
                  Print
                </button>}
              </div>
            )
          }}
        />
        {ModalPolicyIdClientIdRefId}
        {ModalChartAccountSearch}
        {ModalPolicyIdPayTo}
        {ModalTransactionAccount}
        {ModalSearchCashDisbursement}
      </div>
    </>

  );
};

const DataGridTableReact = forwardRef(({
  rows,
  columns,
  onInputKeyDown,
  height,
  RightClickComponent,
  disbaleTable = false
}: any, ref) => {
  const miror = useRef<any>([])
  const parentElementRef = useRef<any>(null)
  const [data, setData] = useState<any>([])
  const [column, setColumn] = useState<any>([])
  const [selectedRow, setSelectedRow] = useState<any>(0)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)

  function AddRow() {
    setData((d: any) => {
      const newD = column.map((itm: any) => '')
      return [...d, newD]
    })
  }

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

  useEffect(() => {
    miror.current = data
  }, [data])

  useImperativeHandle(ref, () => ({
    AddRow,
    updateData: setData,
    getData: () => {
      const newData = [...data]
      return newData
    },
    getSelectedIndex: () => {
      return selectedRow
    },
    setNewRowIndex: (rowIndex: number) => {
      setSelectedRow(rowIndex)
    },
    resetTable: () => {
      setData([])
      setSelectedRow(0)
    }
  }))

  function onKeySelectionChange(rowIdx: any, colIdx: any, e: any) {
    if (e.code === 'ArrowDown') {
      setSelectedRow((d: any) => {
        if (rowIdx >= data.length - 1) {
          return d
        }

        wait(150).then(() => {
          const input = document.querySelector(`.input.row-${rowIdx + 1}.col-${colIdx}`) as HTMLInputElement
          if (input) {
            input.focus()
          }
        })


        return rowIdx + 1
      })
    }
    if (e.code === 'ArrowUp') {
      setSelectedRow((d: any) => {
        if (rowIdx <= 0) {
          return d
        }

        wait(150).then(() => {
          const input = document.querySelector(`.input.row-${rowIdx - 1}.col-${colIdx}`) as HTMLInputElement
          if (input) {
            input.focus()
          }
        })

        return rowIdx - 1
      })

    }
  }
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
      <tr style={{ border: "1px solid red" }}>
        <th className="header"
          style={{
            width: '30px',
            border: "1px solid black",
            position: "sticky",
            top: -1,
            zIndex: 2,
            background: "#f0f0f0",

          }}
        >
        </th>
        {
          column.map((colItm: any, colIdx: any) => {
            return (
              <th
                className={`header col-${colIdx} ${colItm.key}`} key={colIdx}
                style={{
                  width: colItm.width,
                  border: "1px solid black",
                  position: "sticky",
                  top: -1,
                  zIndex: 2,
                  background: "#f0f0f0",
                  fontSize: "12px",
                  textAlign: "left",
                  padding: "0px 5px",
                  boxShadow: '0px -1px 0px black'

                }}
              >
                <div
                  className="resize-handle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startResize(colIdx, e);
                  }}
                />
                {colItm.label}
              </th>
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
  }: any, ref: any) => {
    const fontColor = "black"

    if (selectedRow === rowIdx) {
      if (colItm.type === 'select') {
        return <SelectInput
          containerStyle={{
            width: "100%"
          }}
          label={{
            title: "",
            style: {
              width: "0px",
              display: "none"
            },
          }}
          select={{
            readOnly: colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx),
            className: `input row-${rowIdx} col-${colIdx} ${colItm.key}`,
            defaultValue: rowItm[colIdx],
            style: {
              width: "100% !important",
              flex: 1,
              height: "100% !important",
              background: selectedRow === rowIdx ? "transparent" : "#cbd5e1",
              padding: 0,
              margin: 0,
              border: "none",
              cursor: "pointer",
              color: fontColor
            },
            onKeyDown: (e) => {
              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                onInputKeyDown(rowIdx, colIdx, e.currentTarget.value)
              }
              onKeySelectionChange(rowIdx, colIdx, e)
            },
            onBlur: (e) => {
              e.currentTarget.value = miror.current[rowIdx][colIdx]
            }
          }}
          datasource={colItm.options}
          values={"key"}
          display={"key"}
        />
      } else if (colItm.type === 'number') {
        return <NumericFormat
          readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
          className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
          getInputRef={ref}
          decimalScale={2}
          fixedDecimalScale={true}
          style={{
            width: '100%',
            height: "100%",
            background: selectedRow === rowIdx ? "transparent" : "#cbd5e1",
            margin: 0,
            border: "none",
            cursor: "pointer",
            color: fontColor

          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
              onInputKeyDown(rowIdx, colIdx, e.currentTarget.value)
            }
            onKeySelectionChange(rowIdx, colIdx, e)

          }}
          onBlur={(e) => {
            e.currentTarget.value = miror.current[rowIdx][colIdx]
          }}
          defaultValue={rowItm[colIdx]}
          allowNegative={false}
          thousandSeparator
          valueIsNumericString
        />
      } else if (colItm.type === 'date') {
        return <input
          type={colItm.typeLogic && colItm.typeLogic(rowItm)}
          readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
          className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
          style={{
            width: '100%',
            height: "100%",
            background: selectedRow === rowIdx ? "transparent" : "#cbd5e1",
            margin: 0,
            border: "none",
            cursor: "pointer",
            color: fontColor
          }}
          defaultValue={rowItm[colIdx]}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
              onInputKeyDown(rowIdx, colIdx, e.currentTarget.value)
            }
            onKeySelectionChange(rowIdx, colIdx, e)

          }}
          onBlur={(e) => {
            e.currentTarget.value = miror.current[rowIdx][colIdx]
          }}
        />
      } else {
        return <input
          readOnly={colItm.readonly && colItm?.readonly(rowItm, colItm, rowIdx, colIdx)}
          className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
          style={{
            width: '100%',
            height: "100%",
            background: selectedRow === rowIdx ? "transparent" : "#cbd5e1",
            margin: 0,
            border: "none",
            cursor: "pointer",
            color: fontColor

          }}
          onBlur={(e) => {
            e.currentTarget.value = miror.current[rowIdx][colIdx]
          }}
          defaultValue={rowItm[colIdx]}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
              onInputKeyDown(rowIdx, colIdx, e.currentTarget.value)
            }
            onKeySelectionChange(rowIdx, colIdx, e)


          }}
        />
      }
    } else {
      return <input
        readOnly={selectedRow !== rowIdx}
        className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
        style={{
          width: '100%',
          height: "100%",
          border: "none",
          cursor: "pointer",
          color: fontColor,
          fontSize: "12px"
        }}
        defaultValue={rowItm[colIdx]}
        onDoubleClick={(e) => {
          setSelectedRow(rowIdx)
          wait(100).then(() => {
            const input = document.querySelector(`.input.row-${rowIdx}.col-${colIdx}`) as HTMLInputElement
            if (input) {
              input.focus()
            }
          })
        }}
        onKeyDown={(e) => {
          onKeySelectionChange(rowIdx, colIdx, e)
        }}
      />
    }

  })
  const ColumnData = forwardRef(({
    rowItm,
    rowIdx,
    parentRef
  }: any, ref: any) => {
    const menuCheckBoxRef = useRef<HTMLDivElement>(null)
    const [menuCheckBox, setMenuCheckBox] = useState(false)

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (menuCheckBoxRef.current && !menuCheckBoxRef.current.contains(event.target)) {
          setMenuCheckBox(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const tdstyle: any = {
      position: "relative",
      borderBottom: "1px solid #808080",
      borderLeft: "1px solid #808080",
      borderTop: "none",
      borderRight: "1px solid #808080",
      cursor: "pointer",
      background: selectedRow === rowIdx ? "#f1f5f9" : "",
      height: "18px important",
    }

    return (
      <>
        <td style={tdstyle} className="" >
          <div style={{
            height: "15px",
            width: "100%",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <input
              style={{
                cursor: "pointer",

              }}
              readOnly={true}
              type="checkbox"
              checked={selectedRow === rowIdx}
              onClick={() => {
                setSelectedRow(rowIdx)
                wait(150).then(() => {
                  const input = document.querySelector(`.input.row-${rowIdx}.col-0`) as HTMLInputElement
                  if (input) {
                    input.focus()
                  }
                })
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                if (rowIdx === selectedRow) {
                  setMenuCheckBox(true)
                  setTimeout(() => {
                    if (menuCheckBoxRef.current) {
                      menuCheckBoxRef.current.scrollIntoView({
                        behavior: "smooth"
                      });
                    }
                  }, 100)

                }
              }}
            />
          </div>

          {menuCheckBox && <div
            ref={menuCheckBoxRef}
            style={{
              position: "absolute",
              top: "110%",
              left: "0px",
              background: "#e2e8f0",
              width: "80px",
              height: "auto",
              padding: "7px 0",
              boxShadow: "-3px -1px 13px -8px rgba(0,0,0,0.75)",
              border: "1px solid #cbd5e1",
              zIndex: "99999"
            }}>
            <RightClickComponent rowItm={rowItm} colItm={null} rowIdx={rowIdx} colIdx={null} />
          </div>}
        </td>
        {
          column.map((colItm: any, colIdx: any) => {
            return (
              <td
                key={colIdx}
                className={`td row-${rowIdx} col-${colIdx} ${colItm.key}`}
                style={{
                  width: colItm.width,
                  ...tdstyle
                }}
              >
                <div
                  style={{
                    height: "15px",
                    width: "100%",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>

                  <CellInput
                    rowIdx={rowIdx}
                    colIdx={colIdx}
                    colItm={colItm}
                    rowItm={rowItm}
                    parentRef={parentRef}
                  />
                </div>
              </td>
            )
          })
        }

      </>
    )
  })
  const DrawDataColumn = forwardRef(({ parentRef }: any, ref) => {
    return (
      <tbody>
        {
          data?.map((rowItm: any, rowIdx: any) => {
            return (
              <tr key={rowIdx} className={`tr row-${rowIdx}`}>
                <ColumnData parentRef={parentRef} rowItm={rowItm} rowIdx={rowIdx} />
              </tr>
            )
          })
        }
      </tbody>
    )
  })

  return (
    <Fragment>
      <div ref={parentElementRef}
        style={{
          height,
          overflow: "auto",
          position: "relative",
          width: "100%",
          pointerEvents: disbaleTable ? "none" : "auto",
          border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
          boxShadow: `inset -2px -2px 0 #ffffff, 
                    inset 2px 2px 0 #808080`,
          background: "white"
        }}>
        <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", position: "relative" }}>
            <thead >
              {
                <DrawHeaderColumn />
              }
            </thead>
            {<DrawDataColumn />}
          </table>
        </div>
      </div>
      <div style={{ width: "calc(100vw - 40px)", display: "flex", height: "40px" }}>
        <div style={{ width: "50%", display: "flex", alignItems: "center" }}><span style={{ fontSize: "14px" }}>Records : {data.length}</span></div>
      </div>
    </Fragment>
  )
})


