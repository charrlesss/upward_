import { useReducer, useContext, useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, RefObject, createRef, Fragment } from "react";
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
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";
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
    key: "ClientName", label: "Name", width: 400, type: 'text'

  },
  {
    key: "debit", label: "Debit", width: 120, type: 'number'

  },
  {
    key: "credit", label: "Credit", width: 120, type: 'number'
  },
  {
    key: "checkNo", label: "Check No", width: 120, type: 'text'
  },
  {
    key: "checkDate", label: "Check Date", width: 120, type: 'date'
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
    key: "Payto", label: "Payto", width: 400, type: 'text'
  },
  {
    key: "vatType", label: "Vat Type", width: 100, type: 'select', options: [{ key: 'NON-VAT' }, { key: 'VAT' }]
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

  const [showDialog, setShowDialog] = useState(false)
  const [cashDMode, setCashDMode] = useState('')
  const [data, setData] = useState<any>([]);
  const [rowEdited, setRowEdited] = useState<any>(null)
  const [isEdited, setIsEdited] = useState(null)


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
          itm.checkDate = format(new Date(itm.checkDate), "yyyy-MM-dd")

        } else {
          itm.checkDate = ''
        }
        return { [idx]: itm }
      })
      setData(SearchData);

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
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();

        const defaultValue = columns.reduce((a: any, b: any) => {
          a[b.key] = ''
          return a
        }, {})
        const NewRowIndex = "0"
        setData([{ [NewRowIndex]: defaultValue }]);

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
        setNewStateValue(dispatch, initialState);
        refetchGeneralJournalGenerator();
        const defaultValue = columns.reduce((a: any, b: any) => {
          a[b.key] = ''
          return a
        }, {})
        const NewRowIndex = "0"
        setData([{ [NewRowIndex]: defaultValue }]);


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
      console.log(response)
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
    const dataValues = data.map((itm: any) => Object.values(itm)[0])
    const cashDisbursement = dataValues.filter((itm: any) => itm.code !== '')
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
  function AddRow() {
    const defaultValue = columns.reduce((a: any, b: any) => {
      a[b.key] = ''
      return a
    }, {})
    const keys = Object.keys(data)
    const NewRowIndex: any = String(isNaN(parseInt(keys[keys.length - 1]) + 1) ? 0 : parseInt(keys[keys.length - 1]) + 1)
    const dd: any = [...data, {
      [NewRowIndex]: defaultValue
    }]
    setData(dd)
    wait(250).then(() => {
      setRowEdited(dd)
      setIsEdited(NewRowIndex)
      setTimeout(() => {
        const input = document.querySelector(`.row-${NewRowIndex}.col-0`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 100)
    })
  }
  function handleRowSave(RowIndex: any) {
    if (rowEdited[RowIndex].code === '') {
      alert('Account Code is required')
      const input = document.querySelector(`.row-${RowIndex}.col-0`) as HTMLInputElement
      if (input) {
        input.focus()
      }
      return false

    } else if (rowEdited[RowIndex].ClientName === '') {
      alert('Name is required')
      const input = document.querySelector(`.row-${RowIndex}.col-3`) as HTMLInputElement
      if (input) {
        input.focus()
      }
      return false

    } else if (rowEdited[RowIndex].credit === rowEdited[RowIndex].debit) {
      alert('Credit and Debit cannot be the same. They must have a difference.')
      const input = document.querySelector(`.row-${RowIndex}.col-4`) as HTMLInputElement
      if (input) {
        input.focus()
      }
      return false

    } else if (rowEdited[RowIndex].TC_Code === '') {
      alert('TC is required')
      const input = document.querySelector(`.row-${RowIndex}.col-8`) as HTMLInputElement
      if (input) {
        input.focus()
      }
      return false
    }

    if (rowEdited[RowIndex].vatType === "VAT" && rowEdited[RowIndex].code !== "1.06.02") {
      const credit = parseFloat(rowEdited[RowIndex].credit.replace(/,/g, ''))
      const debit = parseFloat(rowEdited[RowIndex].debit.replace(/,/g, ''))
      let taxableamt = 0
      const newRowValue = columns.reduce((a: any, b: any) => {
        a[b.key] = ''
        return a
      }, {})

      if (debit !== 0) {
        taxableamt = debit / 1.12
        setData((d: any) => {
          d = d.map((itm: any) => {
            if (Object.keys(itm).includes(RowIndex)) {
              itm = {
                [RowIndex]: {
                  ...itm[RowIndex],
                  debit: taxableamt.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }
              }
            }
            return itm
          })
          return d
        })
        setRowEdited((d: any) => ({
          [RowIndex]: {
            ...d[RowIndex],
            debit: taxableamt.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
        }))

      } else {
        taxableamt = credit / 1.12
        setData((d: any) => {
          d = d.map((itm: any) => {
            if (Object.keys(itm).includes(RowIndex)) {
              itm = {
                [RowIndex]: {
                  ...itm[RowIndex],
                  credit: taxableamt.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }
              }
            }
            return itm
          })
          return d
        })
        setRowEdited((d: any) => ({
          [RowIndex]: {
            ...d[RowIndex],
            credit: taxableamt.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
        }))
      }

      let inputtax = taxableamt * 0.12

      newRowValue.code = "1.06.02"
      newRowValue.acctName = "Input Tax"
      newRowValue.subAcctName = rowEdited[RowIndex].subAcctName
      newRowValue.ClientName = rowEdited[RowIndex].ClientName

      if (parseFloat(newRowValue.debit.replace(/,/g, '')) !== 0) {
        newRowValue.debit = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        newRowValue.credit = rowEdited[RowIndex].credit
      } else {
        newRowValue.credit = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        newRowValue.debit = rowEdited[RowIndex].debit
      }

      newRowValue.checkNo = rowEdited[RowIndex].checkNo
      newRowValue.checkDate = rowEdited[RowIndex].checkDate
      newRowValue.TC_Code = rowEdited[RowIndex].TC_Code
      newRowValue.remarks = rowEdited[RowIndex].remarks
      newRowValue.Payto = rowEdited[RowIndex].Payto
      newRowValue.vatType = rowEdited[RowIndex].vatType
      newRowValue.invoice = rowEdited[RowIndex].invoice
      newRowValue.TempID = rowEdited[RowIndex].TempID
      newRowValue.IDNo = rowEdited[RowIndex].IDNo
      newRowValue.BranchCode = rowEdited[RowIndex].BranchCode
      newRowValue.addres = rowEdited[RowIndex].addres
      newRowValue.subAcct = rowEdited[RowIndex].subAcct

      setData((d: any) => {
        return insertRowAtIndex(d, parseInt(RowIndex), newRowValue)
      })

    }

    return true

  }
  function insertRowAtIndex(data: any, index: any, newRow: any) {
    // Step 1: Insert the new row at the specified index
    const updatedData = [
      ...data.slice(0, index + 1),
      { [index + 1]: newRow },
      ...data.slice(index + 1)
    ];

    // Step 2: Update keys of subsequent rows
    return updatedData.map((item, i) => {
      const value = Object.values(item)[0]; // Get the value

      // Adjust the key to reflect the new order
      return { [i]: value };
    });
  }
  function handleClickPrint() {
    mutateOnPrint({ Source_No: state.refNo })
  }

  useEffect(() => {
    if (data.length > 0) {
      const _data = data?.map((itm: any) => {
        return Object.values(itm)[0]
      })

      const debit = _data.reduce((a: number, item: any) => {
        let deb = 0
        if (!isNaN(parseFloat(item.debit.replace(/,/g, "")))) {
          deb = parseFloat(item.debit.replace(/,/g, ""))
        }
        return a + deb;
      }, 0);
      const credit = _data.reduce((a: number, item: any) => {
        let cred = 0
        if (!isNaN(parseFloat(item.credit.replace(/,/g, "")))) {
          cred = parseFloat(item.credit.replace(/,/g, ""))
        }
        return a + cred;
      }, 0);


      dispatch({
        type: "UPDATE_FIELD",
        field: "totalDebit",
        value: debit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "totalCredit",
        value: credit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "totalBalance",
        value: (debit - credit).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      });
    } else {
      dispatch({
        type: "UPDATE_FIELD",
        field: "totalDebit",
        value: '0.00'
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "totalCredit",
        value: '0.00'
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "totalBalance",
        value: '0.00'
      });
    }

  }, [data]);

  const isDisableField = cashDMode === "";

  if (loadingGetSearchSelectedCashDisbursement || loadingGeneralJournalGenerator || isLoadingPolicyIdClientIdRefId || isLoadingChartAccountSearch || isLoadingPolicyIdPayTo || isLoadingTransactionAccount) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {
        showDialog &&
        <MyDialog
          title="Add New Row?"
          onConfirmed={() => {
            AddRow()
            setShowDialog(false)
          }}
          onDeclined={() => {
            setShowDialog(false)
          }}
          onClose={() => {
            setShowDialog(false)
          }}
        />
      }

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
                    setCashDMode("")
                    setNewStateValue(dispatch, initialState);
                    refetchGeneralJournalGenerator();
                    const defaultValue = columns.reduce((a: any, b: any) => {
                      a[b.key] = ''
                      return a
                    }, {})
                    const NewRowIndex = "0"
                    setData([{ [NewRowIndex]: defaultValue }]);
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
              <span style={{ fontSize: "12px" }}>Total Rows:</span> <strong>{data.length}</strong>
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", flexDirection: "column", flex: 1 }}>
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
        </fieldset>
      </div>
      <DataGridTableReact
        ref={tableRef}
        rows={[]}
        columns={columns.filter((itm) => !itm.hide)}
        onInputKeyDown={(rowIdx: number, colIdx: number, value: any) => {
          if (colIdx === 0) {
            openChartAccountSearch(value)
          } else if (colIdx === 3) {
            openPolicyIdClientIdRefId(value)
          } else if (colIdx === 8) {
            openTransactionAccount(value)
          } else if (colIdx === 10) {
            openPolicyIdPayTo(value)
          } else {
            const nextInput = document.querySelector(`.input.row-${rowIdx}.col-${colIdx + 1}`) as HTMLInputElement
            if (nextInput) {
              nextInput.focus()
            } else {
              const RowIndex = tableRef.current.getSelectedIndex()
              tableRef.current.AddRow()
              tableRef.current.setNewRowIndex(RowIndex + 1)
              wait(250).then(()=>{
                const nextInput = document.querySelector(`.input.row-${RowIndex +1 }.col-0`) as HTMLInputElement
                if (nextInput) {
                  nextInput.focus()
                }
              })
            }
          }
        }}
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
  onInputKeyDown
}: any, ref) => {
  const dataCellRef = useRef<any>(null)
  const mode = 'add'
  const [pages,setPages] = useState<Array<any>>([])
  const [pageNumber,setPageNumber] = useState(0)
  const [data, setData] = useState(rows)
  const [column, setColumn] = useState(columns)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)
  const [selectedRow, setSelectedRow] = useState<any>(0)


  const addRow = useRef(() => {
    const defaultValue = column.map((itm: any) => '')
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
    setNewRowIndex: (rowIndex:number) => {
      setSelectedRow(rowIndex)
    }
  }));



  useEffect(() => {
    if (mode === 'add') {
      addRow.current()
    }
  }, [mode])

  useEffect(()=>{
    const _pages = formatArrayIntoChunks(data, 100)
    setPages(_pages)
  },[data])


  const DrawHeaderColumn = () => {
    return (
      <tr>
        {
          column.map((colItm: any, colIdx: any) => {
            return (
              <th
                className={`header col-${colIdx} ${colItm.key}`} key={colIdx}
                style={{ width: colItm.width, border: "1px solid black", position: "sticky", top: 0, zIndex: 1, background: "white" }}
              >{colItm.label}</th>
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
    if (selectedRow === rowIdx) {
      if(colItm.type === 'select'){
        return (
          <SelectInput
            label={{
              title: "",
              style: {
                width: "0px",
              },
            }}
            select={{
              className:`input row-${rowIdx} col-${colIdx} ${colItm.key}`,
              style: { width: "100%", height: "22px" },
              value:input,
              onChange:(e)=>{
                setInput(e.target.value)
              },
              onKeyDown:(e)=>{
                if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                  setData((itm: any) => {
                    itm[rowIdx][colIdx] = input
                    return itm
                  })
                  if (parentRef.current) {
                    parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                  }
    
                }
              }
            }}
            datasource={colItm.options}
            values={"key"}
            display={"key"}
          />
        )
      }else if(colItm.type === 'number'){
        return (
          <NumericFormat
          className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
          value={input}
          getInputRef={ref}
          decimalScale={2}
          fixedDecimalScale={true} 
          onValueChange={(values) => {
            setInput(values.value)
          }}
          style={{
            width: '100%',
            height: "100%",
          }}
          onKeyDown={(e)=>{
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {

              setData((itm: any) => {
                itm[rowIdx][colIdx] = input
                return itm
              })
              if (parentRef.current) {
                parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
              }
            }
          }}
          onBlur={(e)=>{
            const valueInput = e.target.value
            if(valueInput !== '' && valueInput !== null && valueInput !== undefined){
              if(isNaN(parseFloat(valueInput.replace(/,/g,'')))){
                setInput('0.00')
              }
            }else{
              setInput('0.00')
            }
          }}
          allowNegative={false}
          thousandSeparator
          valueIsNumericString
        />
        )
      }else if(colItm.type === 'date'){
        return (
          <input
            className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
            style={{
              width: '100%',
              height: "100%",
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
                if (parentRef.current) {
                  parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                }
  
              }
            }}
          />
        )
      }else{
        return (
          <input
            className={`input row-${rowIdx} col-${colIdx} ${colItm.key}`}
            style={{
              width: '100%',
              height: "100%",
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
                if (parentRef.current) {
                  parentRef.current.onInputKeyDown(rowIdx, colIdx, input)
                }
  
              }
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
    <div style={{ width: "calc(100vw - 40px)", height: "280px", overflow: "auto", position: "relative" }}>
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
    <div style={{width:"calc(100vw - 40px)",display:"flex",height:"40px"}}>
      <div style={{width:"50%",display:"flex",alignItems:"center"}}><span style={{fontSize:"14px"}}>Records : {data.length}</span></div>
      <div style={{width:"50%" ,display:"flex",justifyContent:"flex-end",alignItems:"center"}}>
          <Pagination 
            count={pages.length}
            onChange={(e, value) => {
              setPageNumber(value - 1)
            }}/>
      </div>  
    </div>
  </Fragment>
  )
})

const MyDialog = ({ onConfirmed, onDeclined, onClose, title }: any) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    wait(200).then(() => {
      confirmButtonRef.current?.focus()
    })
  }, [])

  return (
    <>
      <div style={{
        position: "absolute",
        top: "55%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: "300px",
        height: "auto",
        border: "1px solid #94a3b8",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "-1px 0px 10px -1px rgba(0,0,0,0.75)",
        zIndex: "299",
        background: "white"

      }}>
        <button
          style={{
            background: "white",
            padding: '5px',
            margin: "0",
            position: "absolute",
            top: "5px",
            right: "5px"
          }}
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill="none">
            <g id="Menu / Close_LG">
              <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001"
                stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </button>
        <h2 style={{ fontSize: "14px", textTransform: "uppercase", fontWeight: "bold" }}>{title}</h2>
        <div>
          <button
            ref={confirmButtonRef}
            style={{ padding: "5px 15px", background: "white", border: "none", color: "black" }}
            onKeyDown={(e) => {
              if (e.code === 'ArrowRight') {
                cancelButtonRef.current?.focus()
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              onConfirmed()
            }}
          >Ok</button>
          <button
            ref={cancelButtonRef}
            style={{ padding: "5px 15px", background: "white", border: "none", color: "black" }}
            onKeyDown={(e) => {
              if (e.code === 'ArrowLeft') {
                confirmButtonRef.current?.focus()
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              onDeclined()
            }}
          >Cancel</button>
        </div>
      </div>
      <div
        onClick={(e) => {
          e.preventDefault()
          onClose()
        }}
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, background: "trnsparent", zIndex: "1" }}></div>
    </>
  )
}
function formatArrayIntoChunks(arr: Array<any>, chunkSize = 100) {
  let result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

