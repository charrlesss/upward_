import { useContext, useState, useRef, useReducer, createContext, forwardRef, useEffect, useImperativeHandle } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  FormControl,
  Select,
  MenuItem,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal, { SweetAlertResult } from "sweetalert2";
import { green } from "@mui/material/colors";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import useUrlParams from "../../../../hooks/useUrlParams";
import { AuthContext } from "../../../../components/AuthContext";
import { wait } from "../../../../lib/wait";
import CustomDatePicker from "../../../../components/DatePicker";
import PolicyIcon from "@mui/icons-material/Policy";
import LoadingButton from "@mui/lab/LoadingButton";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import { incrementCheckNo } from "./PostDateChecks";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import useMutationModalTable from "../../../../hooks/useMutationModalTable";
import { flushSync } from "react-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import { UpwardTable } from "../../../../components/UpwardTable";
import PageHelmet from "../../../../components/Helmet";
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";
import ForwardIcon from '@mui/icons-material/Forward';
import { Autocomplete } from "./PettyCash";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { format } from 'date-fns'
import SearchIcon from '@mui/icons-material/Search';
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const CollectionContext = createContext<{
  debit: Array<any>;
  credit: Array<any>;
}>({ debit: [], credit: [] });

const initialState = {
  ORNo: "",
  PNo: "",
  IDNo: "",
  Date: new Date(),
  Name: "",
  Remarks: "",
  //====
  creditUpdateMode: false,
  creditCheckIdx: "",
  creditCheckID: "",
  //===
  PDC_Status: "",
  Deposit_Slip: "",
  DateDeposit: "",
  OR_No: "",
  searchCheckedList: "",
  bank_transaction: "",
  isFao: false,
  search: "",
  mode: "",
};
const initialStateDeposit = {
  cashID: "",
  cashMode: "add",
  payamentType: "CSH",
  amount: "",
  transaction_desc: [],
  debitHasSelected: false,
};
const initialStateCredit = {
  creditMode: "add",
  creditId: "",
  transaction: "",
  amount: "",
  FAO_Name: "",
  FAO_ID: "",
  remarks: "",
  option: "Non-Vat",
  invoice: "",
  Code: "",
  Title: "",
  TC: "",
};
const modalInitialState = {
  CheckIdx: "",
  BankName: "",
  BankCode: "",
  Branch: "",
  Check_Date: new Date(),
  Check_No: "",
  Check_Amnt: "",
  Check_Remarks: "",
  CheckMode: "add",
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

const addCollectionQueryKey = "add-collection";
const queryMutationKeyCollectionDataSearch = "collection-data-search";

export const debitColumn = [
  { key: "Payment", label: "Payment", flex: 1, width: 170 },
  {
    key: "Amount",
    label: "Amount",
    flex: 1,
    width: 170,
    type: "number",
  },
  { key: "Check_No", label: "Check No", width: 170 },
  { key: "Check_Date", label: "Check Date", width: 170 },
  { key: "Bank_Branch", label: "Bank/Branch", width: 300 },
  { key: "Acct_Code", label: "DR Code", width: 170 },
  { key: "Acct_Title", label: "DR Title", width: 300 },
  { key: "Deposit_Slip", label: "Deposit Slip", width: 170 },
  { key: "Cntr", label: "Cntr", width: 170 },
  { key: "Remarks", label: "Remarks", width: 300 },
  { key: "TC", label: "TC", width: 170 },
  { key: "Bank", label: "Bank", hide: true },
  { key: "BankName", label: "BankName", hide: true },
];
export const creditColumn = [
  { key: "transaction", label: "Transaction", width: 200 },
  { key: "amount", label: "Amount", width: 150, type: "number" },
  { key: "Name", label: "Name", width: 350 },
  { key: "Remarks", label: "Remarks", width: 350 },
  { key: "VATType", label: "VAT Type", width: 150 },
  { key: "invoiceNo", label: "Invoice No", width: 250 },
  { key: "Code", label: "Code", width: 150 },
  { key: "Title", label: "Title", width: 350 },
  { key: "TC", label: "TC", width: 200 },
  { key: "Account_No", label: "Accoount No.", width: 180 },
];

const queryKeyPaymentType = "payment-type-code";
const queryKeyNewORNumber = "new-or-number";


export default function Collection() {
  const debitTable = useRef<any>(null)
  const creditTable = useRef<any>(null)
  const modalCheckRef = useRef<any>(null)

  const [paymentType, setPaymentType] = useState('CSH')
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [collectionMode, setCollectionMode] = useState('')


  // SEARCH COLLECTION
  const searchRef = useRef<HTMLInputElement>(null)

  // first layer fields
  const ornoSubRef = useRef('')
  const ornoRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const pnClientRef = useRef<HTMLInputElement>(null)
  const clientNameRef = useRef<HTMLInputElement>(null)
  const IDNo = useRef('')

  // second layer fields
  const paymentTypeRef = useRef<HTMLSelectElement>(null)
  const amountDebitRef = useRef<HTMLInputElement>(null)
  const buttonCshSave = useRef<HTMLButtonElement>(null)
  const buttonCheckSave = useRef<HTMLButtonElement>(null)

  // third layer fields
  const transactionRef = useRef<HTMLSelectElement>(null)
  const amountCreditRef = useRef<HTMLInputElement>(null)
  const faoRef = useRef<HTMLInputElement>(null)
  const remarksRef = useRef<HTMLTextAreaElement>(null)
  const vatTypeRef = useRef<HTMLSelectElement>(null)
  const invoiceRef = useRef<HTMLInputElement>(null)
  const foaIDNoRef = useRef('')
  const accCodeRef = useRef('')
  const accTitleRef = useRef('')
  const accTCRef = useRef('')


  const searchModalInputRef = useRef<HTMLInputElement>(null)
  const { myAxios, user } = useContext(AuthContext);
  const { executeQueryToClient } = useExecuteQueryFromClient()

  const disableFields = collectionMode === ''

  const {
    isLoading: paymentTypeLoading,
    data: transactionDesc
  } = useQuery({
    queryKey: queryKeyPaymentType,
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-transaction-code-title`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
  });

  //CLIENT MODAL 
  const {
    ModalComponent: ModalClientIDs,
    openModal: openCliendIDsModal,
    isLoading: isLoadingClientIdsModal,
    closeModal: closeCliendIDsModal,
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
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "collection-polidy-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      wait(100).then(() => {
        IDNo.current = selectedRowData[0].client_id
        if (pnClientRef.current) {
          pnClientRef.current.value = selectedRowData[0].IDNo
        }
        if (clientNameRef.current) {
          clientNameRef.current.value = selectedRowData[0].Name ?? ""
        }
        paymentTypeRef.current?.focus()
      })
      closeCliendIDsModal();
    },
    searchRef: searchModalInputRef,
  });

  //CLIENT MODAL CREDIT
  const {
    ModalComponent: ModalCreditClientIDs,
    openModal: openCreditCliendIDsModal,
    isLoading: isLoadingCreditClientIdsModal,
    closeModal: closeCreditCliendIDsModal,
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
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "collection-polidy-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      wait(100).then(() => {
        foaIDNoRef.current = selectedRowData[0].IDNo
        if (faoRef.current) {
          faoRef.current.value = selectedRowData[0].Name ?? ""
        }
        remarksRef.current?.focus()
      })
      closeCreditCliendIDsModal();
    },
    searchRef: searchModalInputRef,
  });

  const {
    isLoading: loadingCollectionDataSearch,
    mutate: mutateCollectionDataSearch,
  } = useMutation({
    mutationKey: queryMutationKeyCollectionDataSearch,
    mutationFn: async (variables: any) =>
      await myAxios.get(
        `/task/accounting/get-collection-data-search?ORNo=${variables.ORNo}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const dataCollection = response.data.collection;

      if (
        ornoRef.current &&
        dateRef.current &&
        pnClientRef.current &&
        clientNameRef.current
      ) {
        ornoRef.current.value = dataCollection[0].ORNo
        dateRef.current.value = dataCollection[0].Date_OR
        pnClientRef.current.value = dataCollection[0].ID_No
        clientNameRef.current.value = dataCollection[0].Short
      }

      const debit: Array<any> = [];
      const credit: Array<any> = [];



      for (let i = 0; i <= dataCollection.length - 1; i++) {
        if (
          dataCollection[i].Payment === 'Check'
        ) {
          debit.push({
            Payment: dataCollection[i].Payment,
            Amount: dataCollection[i].Debit,
            Check_No: dataCollection[i].Check_No,
            Check_Date: format(new Date(dataCollection[i].Check_Date), 'yyyy-MM-dd'),
            Bank_Branch: dataCollection[i].Bank,
            Acct_Code: dataCollection[i].DRCode,
            Acct_Title: dataCollection[i].DRTitle,
            Deposit_Slip: dataCollection[i].SlipCode,
            Cntr: "",
            Remarks: dataCollection[i].DRRemarks,
            TC: "CHK",
            Bank: dataCollection[i].Bank_Code,
            BankName: dataCollection[i].BankName,
          });

        }

        if (dataCollection[i].Payment === 'Cash') {
          debit.push({
            Payment: dataCollection[i].Payment,
            Amount: dataCollection[i].Debit,
            Check_No: "",
            Check_Date: "",
            Bank_Branch: "",
            Acct_Code: dataCollection[i].DRCode,
            Acct_Title: dataCollection[i].DRTitle,
            Deposit_Slip: dataCollection[i].SlipCode,
            Cntr: "",
            Remarks: "",
            TC: "CSH",
            Bank: "",
            BankName: "",
          });
        }

        if (
          dataCollection[i].Purpose !== "" &&
          dataCollection[i].Credit !== "0" &&
          dataCollection[i].CRCode !== "" &&
          dataCollection[i].CRTitle !== "" &&
          dataCollection[i].CRLoanID !== "" &&
          dataCollection[i].CRLoanName !== "" &&
          dataCollection[i].CRVatType !== "" &&
          dataCollection[i].CRInvoiceNo !== ""
        ) {
          credit.push({
            temp_id: `${i}`,
            transaction: dataCollection[i].Purpose,
            amount: dataCollection[i].Credit,
            Remarks: dataCollection[i].CRRemarks,
            Code: dataCollection[i].CRCode,
            Title: dataCollection[i].CRTitle,
            TC: dataCollection[i].CRTitle,
            Account_No: dataCollection[i].CRLoanID,
            Name: dataCollection[i].CRLoanName,
            VATType: dataCollection[i].CRVATType,
            invoiceNo: dataCollection[i].CRInvoiceNo,
          });
        }
      }

      debitTable.current.setDataFormated(debit)
      creditTable.current.setDataFormated(credit)
      setTotalDebit(debit.reduce((sum: any, subArray: any) => sum + parseFloat(subArray.Amount.replace(/,/g, '')), 0)
      )
      setTotalCredit(credit.reduce((sum: any, subArray: any) => sum + parseFloat(subArray.amount.replace(/,/g, '')), 0)
      )
      setCollectionMode('update')
      closeModalSearchCollection();
    },
  });

  const {
    ModalComponent: ModalSearchCollection,
    openModal: openModalSearchCollection,
    closeModal: closeModalSearchCollection,
    isLoading: isLoadingModalSearchCollection,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-collection",
      queryUrlName: "searchCollectionInput",
    },
    columns: [
      { field: "Date", headerName: "OR Date", width: 170 },
      { field: "ORNo", headerName: "OR No.", width: 200 },
      { field: "Name", headerName: "Name", flex: 1 },
    ],
    queryKey: "collection-search",
    uniqueId: "ORNo",
    responseDataKey: "collection",
    onSelected: (selectedRowData, data) => {
      resetCredit(false)
      resetDebit(false)
      mutateCollectionDataSearch({ ORNo: selectedRowData[0].ORNo });
    },
    searchRef: searchModalInputRef,
  });

  const { isLoading: NewORNoLoading, refetch: refetchNewOR } = useQuery({
    queryKey: queryKeyNewORNumber,
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-new-or-number`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      const response = res as any;
      wait(100).then(() => {
        ornoSubRef.current = response.data?.ORNo[0].collectionID
        if (ornoRef.current) {
          ornoRef.current.value = response.data?.ORNo[0].collectionID
        }
      })
    },
  });

  const {
    mutate,
    isLoading: loadingAddNew,
  } = useMutation({
    mutationKey: addCollectionQueryKey,
    mutationFn: async (variables: any) => {
      if (collectionMode === 'update') {
        delete variables.mode;
        return await myAxios.post(
          "/task/accounting/update-collection",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      delete variables.mode;
      return await myAxios.post("/task/accounting/add-collection", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        resetCollection()
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

  const { mutate: mutataPrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "on-print",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/task/accounting/on-print", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        printOR(res.data);
      }
    },
  });
  function resetCollection() {
    wait(100).then(() => {
      refetchNewOR();
      resetFields()
      resetCredit(false)
      resetDebit(false)
      debitTable.current?.setData([])
      creditTable.current?.setData([])
      pnClientRef.current?.focus()
      setTotalCredit(0)
      setTotalDebit(0)
    })
  }
  async function saveCashDebit(value: string, paymentType: string) {
    const amount = parseFloat(value.replace(/,/g, ''))
    if (isNaN(amount) || amount <= 0) {
      amountDebitRef.current?.focus()
      return alert('Please provide amount!')
    }
    const getSelectedRow = debitTable.current.getSelectedRow()
    const debitTableData = debitTable.current.getData()


    if (getSelectedRow !== null) {
      debitTableData[getSelectedRow][1] = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      debitTable.current.setData(debitTableData)
      debitTable.current.setSelectedRow(null)
      setTotalDebit(
        debitTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray[1].replace(/,/g, '')), 0)
      )
    } else {
      const dd = await executeQueryToClient(`select * from Transaction_Code LEFT JOIN Chart_Account ON Transaction_Code.Acct_Code = Chart_Account.Acct_Code WHERE Code = 'CSH'`)

      const data = {
        Payment: "Cash",
        Amount: amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Check_No: "",
        Check_Date: "",
        Bank_Branch: "",
        Acct_Code: dd.data?.data[0].Acct_Code,
        Acct_Title: dd.data?.data[0].Acct_Title,
        Deposit_Slip: "",
        Cntr: "",
        Remarks: "",
        TC: paymentType,
        Bank: "",
        BankName: "",
      };
      const newDataFormatted = debitTableData.map((itm: any) => {
        let newItm = {
          Payment: itm[0],
          Amount: itm[1],
          Check_No: itm[2],
          Check_Date: itm[3],
          Bank_Branch: itm[4],
          Acct_Code: itm[5],
          Acct_Title: itm[6],
          Deposit_Slip: itm[7],
          Cntr: itm[8],
          Remarks: itm[9],
          TC: itm[10],
          Bank: itm[11],
          BankName: itm[12],
        }
        return newItm
      })
      const newDataTable = [...newDataFormatted, data]
      debitTable.current.setDataFormated(newDataTable)
      setTotalDebit(
        newDataTable.reduce((sum: any, subArray: any) => sum + parseFloat(subArray.Amount.replace(/,/g, '')), 0)
      )
    }



    if (amountDebitRef.current) {
      amountDebitRef.current.value = ''
      amountDebitRef.current?.focus()
    }

  }
  function saveCheckDebit() {
    wait(100).then(async () => {
      const refs = modalCheckRef.current.getRefs()
      const amount = parseFloat(refs.amountRef.current?.value.replace(/,/g, ''))
      const checkno = refs.checknoRef.current?.value
      const checkdate = refs.checkdateRef.current?.value
      const branch = refs.branchRef.current?.value
      const remarks = refs.remarksRef.current?.value
      const bank = refs.bankRef.current?.value
      const bankRefName = refs.bankRefName.current
      const getSelectedRow = debitTable.current.getSelectedRow()



      if (debitTable.current.checkNoIsExist(checkno) && getSelectedRow === null) {
        return alert(`check no is already exist`)
      }


      if (getSelectedRow !== null) {
        const debitTableData = debitTable.current.getData()
        debitTableData[getSelectedRow][1] = amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        debitTableData[getSelectedRow][2] = checkno
        debitTableData[getSelectedRow][3] = checkdate
        debitTableData[getSelectedRow][4] = branch
        debitTableData[getSelectedRow][9] = remarks
        debitTableData[getSelectedRow][11] = bank
        debitTableData[getSelectedRow][12] = bankRefName
        debitTable.current.setData(debitTableData)
        debitTable.current.setSelectedRow(null)
        setTotalDebit(
          debitTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray[1].replace(/,/g, '')), 0)
        )
      } else {

        const dd = await executeQueryToClient(`select * from Transaction_Code LEFT JOIN Chart_Account ON Transaction_Code.Acct_Code = Chart_Account.Acct_Code WHERE Code = 'CHK'`)
        const data = {
          Payment: "Check",
          Amount: amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          Check_No: checkno,
          Check_Date: checkdate,
          Bank_Branch: branch,
          Acct_Code: dd.data?.data[0].Acct_Code,
          Acct_Title: dd.data?.data[0].Acct_Title,
          Deposit_Slip: "",
          Cntr: "",
          Remarks: remarks,
          TC: paymentType,
          Bank: bank,
          BankName: bankRefName,
        };


        const debitTableData = debitTable.current.getData()
        const newDataFormatted = debitTableData.map((itm: any) => {
          let newItm = {
            Payment: itm[0],
            Amount: itm[1],
            Check_No: itm[2],
            Check_Date: itm[3],
            Bank_Branch: itm[4],
            Acct_Code: itm[5],
            Acct_Title: itm[6],
            Deposit_Slip: itm[7],
            Cntr: itm[8],
            Remarks: itm[9],
            TC: itm[10],
            Bank: itm[11],
            BankName: itm[12],
          }
          return newItm
        })
        const newDataTable = [...newDataFormatted, data]
        debitTable.current.setDataFormated(newDataTable)
        setTotalDebit(
          newDataTable.reduce((sum: any, subArray: any) => sum + parseFloat(subArray.Amount.replace(/,/g, '')), 0)
        )

      }
      modalCheckRef.current.closeDelay()
    })
  }
  async function saveCredit() {
    if (transactionRef.current && transactionRef.current.value === '' || transactionRef.current && transactionRef.current.value === null || transactionRef.current && transactionRef.current.value === undefined) {
      transactionRef.current.focus()
      return alert(`Please select a transaction!`)
    }
    if (transactionRef.current) {
      const dd = await executeQueryToClient(`SELECT * FROM transaction_code where Description = "${transactionRef.current.value}"`)
      if (dd.data.data?.length <= 0) {
        return alert('Transaction not yet defined!')
      }
    }
    if (amountCreditRef.current) {
      if (isNaN(parseFloat(amountCreditRef.current.value.replace(/,/g, ''))) || parseFloat(amountCreditRef.current.value.replace(/,/g, '')) <= 0) {
        amountCreditRef.current.focus()
        return alert('Please provide amount!')
      }
    }
    if (invoiceRef.current && invoiceRef.current.value === '') {
      invoiceRef.current.focus()
      return alert('Please provide invoice!')
    }
    if (foaIDNoRef.current === '') {
      faoRef.current?.focus()
      return alert('Please provide usage!')
    }

    const getSelectedRow = creditTable.current.getSelectedRow()

    if (getSelectedRow !== null) {
      const creditTableData = creditTable.current.getData()
      creditTableData[getSelectedRow][0] = transactionRef.current?.value
      creditTableData[getSelectedRow][1] = amountCreditRef.current?.value
      creditTableData[getSelectedRow][2] = faoRef.current?.value
      creditTableData[getSelectedRow][3] = remarksRef.current?.value
      creditTableData[getSelectedRow][4] = vatTypeRef.current?.value
      creditTableData[getSelectedRow][5] = invoiceRef.current?.value
      creditTableData[getSelectedRow][6] = accCodeRef.current
      creditTableData[getSelectedRow][7] = accTitleRef.current
      creditTableData[getSelectedRow][8] = accTCRef.current
      creditTableData[getSelectedRow][9] = foaIDNoRef.current

      creditTable.current.setData(creditTableData)
      creditTable.current.setSelectedRow(null)
      setTotalCredit(
        creditTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray[1].replace(/,/g, '')), 0)
      )
    } else {
      const data = {
        transaction: transactionRef.current?.value,
        amount: amountCreditRef.current?.value,
        Name: faoRef.current?.value,
        Remarks: remarksRef.current?.value,
        VATType: vatTypeRef.current?.value,
        invoiceNo: invoiceRef.current?.value,
        Code: accCodeRef.current,
        Title: accTitleRef.current,
        TC: accTCRef.current,
        Account_No: foaIDNoRef.current,
      }

      const creditTableData = creditTable.current.getData()
      const newDataFormatted = creditTableData.map((itm: any) => {
        let newItm = {
          transaction: itm[0],
          amount: itm[1],
          Name: itm[2],
          Remarks: itm[3],
          VATType: itm[4],
          invoiceNo: itm[5],
          Code: itm[6],
          Title: itm[7],
          TC: itm[8],
          Account_No: itm[9],
        }
        return newItm
      })
      const newCreditTableData = [...newDataFormatted, data]
      creditTable.current.setDataFormated(newCreditTableData)
      setTotalCredit(
        newCreditTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray.amount.replace(/,/g, '')), 0)
      )
    }

    if (vatTypeRef.current && vatTypeRef.current.value === 'VAT') {

      const dd = await executeQueryToClient(`select chart_account.Acct_Code,chart_account.Acct_Title from transaction_code LEFT JOIN chart_account ON transaction_code.Acct_Code = chart_account.Acct_Code WHERE Description = 'Output Tax'`)
      const TC = await executeQueryToClient(`select Code from transaction_code WHERE Description = 'Output Tax' `)


      let taxableamt = 0
      let inputtax = 0

      if (amountCreditRef.current) {
        taxableamt = parseFloat(amountCreditRef.current.value.replace(/,/g, '')) / 1.12
        inputtax = taxableamt * 0.12
      }


      const debitTableData = creditTable.current.getData()


      if (getSelectedRow !== null) {
        const newData: any = []
        newData[0] = "Output Tax"
        newData[1] = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        newData[2] = faoRef.current?.value
        newData[3] = remarksRef.current?.value
        newData[4] = "VAT"
        newData[5] = invoiceRef.current?.value
        newData[6] = dd.data?.data[0].Acct_Code
        newData[7] = dd.data?.data[0].Acct_Title
        newData[8] = TC.data?.data[0].Code
        newData[9] = foaIDNoRef.current

        debitTableData[getSelectedRow][1] = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        debitTableData.splice(getSelectedRow + 1, 0, newData);
        creditTable.current.setData(debitTableData)

      } else {
        const newData: any = []
        newData[0] = "Output Tax"
        newData[1] = inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        newData[2] = faoRef.current?.value
        newData[3] = remarksRef.current?.value
        newData[4] = "VAT"
        newData[5] = invoiceRef.current?.value
        newData[6] = dd.data?.data[0].Acct_Code
        newData[7] = dd.data?.data[0].Acct_Title
        newData[8] = TC.data?.data[0].Code
        newData[9] = foaIDNoRef.current

        debitTableData[debitTableData.length] = newData
        debitTableData[debitTableData.length - 2][1] = taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        creditTable.current.setData(debitTableData)
      }




    }
    resetCredit()
  }
  function resetFields() {
    wait(100).then(() => {
      if (dateRef.current) {
        dateRef.current.value = format(new Date(), "yyyy-MM-dd")
      }
      if (pnClientRef.current) {
        pnClientRef.current.value = ''
      }
      if (clientNameRef.current) {
        clientNameRef.current.value = ''
      }
      IDNo.current = ''
    })
  }
  function resetDebit(setFocus = true) {
    modalCheckRef.current?.closeDelay()
    setPaymentType('CSH')
    if (paymentTypeRef.current) {
      paymentTypeRef.current.value = 'CSH'
    }
    wait(100).then(() => {
      if (amountDebitRef.current) {
        amountDebitRef.current.value = ''
        if (setFocus)
          amountDebitRef.current?.focus()
      }
    })

  }
  function resetCredit(setFocus = true) {
    wait(100).then(() => {
      if (transactionRef.current) {
        transactionRef.current.value = ''
      }
      if (amountCreditRef.current) {
        amountCreditRef.current.value = '0.00'
      }
      if (faoRef.current) {
        faoRef.current.value = ''
      }
      if (remarksRef.current) {
        remarksRef.current.value = ''
      }
      if (vatTypeRef.current) {
        vatTypeRef.current.value = 'Non-VAT'
      }
      if (invoiceRef.current) {
        invoiceRef.current.value = ''
      }
      accCodeRef.current = ''
      accTitleRef.current = ''
      accTCRef.current = ''
      foaIDNoRef.current = ''
      if (setFocus)
        transactionRef.current?.focus()
    })
  }
  function handleOnAdd() {
    setCollectionMode('add')
    resetCollection()
  }
  function handleOnSave() {

    const debitTableData = debitTable.current.getData()
    const creditTableData = creditTable.current.getData()


    if (ornoRef.current && ornoRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide OR number",
        timer: 1500,
      });
    } else if (pnClientRef.current && pnClientRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide PN/Client ID",
        timer: 1500,
      }).then(() => {
        wait(350).then(() => {
          openCliendIDsModal();
        });
      });
    } else if (debitTableData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide debit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          paymentTypeRef.current?.focus();
        });
      });
    } else if (creditTableData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide credit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          transactionRef.current?.focus();
        });
      });
    } else if (
      debitTableData.reduce(
        (sum: any, obj: any) =>
          sum + parseFloat(obj[1].toString().replace(/,/g, "")),
        0
      ) !==
      creditTableData.reduce(
        (sum: any, obj: any) =>
          sum + parseFloat(obj[1].toString().replace(/,/g, "")),
        0
      )
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Transaction is not balanced. Check if the amount you entered are correct!",
        timer: 1500,
      });
    }



    const creditTableDataFormatted = creditTableData.map((itm: any) => {
      let newItm = {
        transaction: itm[0],
        amount: itm[1],
        Name: itm[2],
        Remarks: itm[3],
        VATType: itm[4],
        invoiceNo: itm[5],
        Code: itm[6],
        Title: itm[7],
        TC: itm[8],
        Account_No: itm[9],
      }
      return newItm
    })

    const debitTableDataFormatted = debitTableData.map((itm: any) => {
      let newItm = {
        Payment: itm[0],
        Amount: itm[1],
        Check_No: itm[2],
        Check_Date: itm[3],
        Bank_Branch: itm[4],
        Acct_Code: itm[5],
        Acct_Title: itm[6],
        Deposit_Slip: itm[7],
        Cntr: itm[8],
        Remarks: itm[9],
        TC: itm[10],
        Bank: itm[11],
        BankName: itm[12],
      }
      return newItm
    })

    const state = {
      ORNo: ornoRef.current?.value,
      Date: dateRef.current?.value,
      PNo: pnClientRef.current?.value,
      Name: clientNameRef.current?.value,
      debit: JSON.stringify(debitTableDataFormatted),
      credit: JSON.stringify(creditTableDataFormatted)
    }

    if (collectionMode === 'update') {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutate({ ...state, userCodeConfirmation, mode: "" });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutate({ ...state, mode: "" });
        },
      });
    }


  }
  function handleOnPrint() {
    if (ornoRef.current)
      mutataPrint({ ORNo: ornoRef.current.value });

  }
  function handleOnClose() {
    setCollectionMode('')
    resetCollection()
  }
  function printOR(res: any) {
    const data = res.data.concat(res.data1);
    console.log(res)
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(data));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "collection");
      if (user?.department === "UMIS") {
        localStorage.setItem("title", user?.department === 'UMIS' ? "UPWARD MANAGEMENT INSURANCE SERVICES" : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.");
      } else {
        localStorage.setItem(
          "title",
          "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
        );
      }
    });
    window.open("/dashboard/print", "_blank");
  }


  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#F1F1F1",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "20%",
          display: "flex",
          flexDirection: "column",
          padding: "5px"
        }}
      >
        <div style={{
          height: "30px",
          display: "flex",
          columnGap: "10px"
        }}>
          {
            isLoadingModalSearchCollection ?
              <LoadingButton loading={isLoadingModalSearchCollection} />
              :
              <TextInput
                containerStyle={{ width: "550px" }}
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
                      openModalSearchCollection(e.currentTarget.value);
                    }
                  },
                  style: { width: "500px", height: "22px" },
                }}

                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault()
                  if (searchRef.current)
                    openModalSearchCollection(searchRef.current.value);

                }}
                inputRef={searchRef}
              />}
          {ModalSearchCollection}
          <IconButton
            aria-label="add" size="small" color="info"
            onClick={handleOnAdd}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            disabled={disableFields}
            aria-label="save" size="small" color="success"
            onClick={handleOnSave}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            disabled={collectionMode !== 'update'}
            aria-label="print" size="small" color="secondary"
            onClick={handleOnPrint}
          >
            <LocalPrintshopIcon />
          </IconButton>
          <IconButton
            disabled={disableFields}
            aria-label="print" size="small" color="error"
            onClick={handleOnClose}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #64748b",
            display: "flex",
            alignItems: "center",
            columnGap: "50px",
            padding: "5px",
            width: "100%"
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            width: "50%"
          }}>
            {
              NewORNoLoading ?
                <LoadingButton loading={NewORNoLoading} />
                :
                <TextInput
                  containerStyle={{
                    width: "320px"
                  }}
                  label={{
                    title: "OR No. : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  input={{
                    disabled: disableFields,
                    readOnly: true,
                    type: "text",
                    style: { width: "250px" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        refetchNewOR()
                      }
                    },
                  }}
                  inputRef={ornoRef}
                  icon={<RestartAltIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={(e) => {
                    e.preventDefault()
                    if (faoRef.current) {
                      refetchNewOR()
                    }
                  }}
                />}
            <TextInput
              label={{
                title: "Date : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: disableFields,
                type: "date",
                style: { width: "250px" },
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    pnClientRef.current?.focus()
                  }
                },
              }}

              inputRef={dateRef}
            />
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            width: "50%"
          }}>
            {isLoadingClientIdsModal ? (
              <LoadingButton loading={isLoadingClientIdsModal} />
            ) : (
              <TextInput
                containerStyle={{
                  width: "60%"
                }}
                label={{
                  title: "PN/Client ID : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      openCliendIDsModal(e.currentTarget.value)
                    }
                  }
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault()
                  if (faoRef.current) {
                    openCliendIDsModal(faoRef.current.value)
                  }
                }}
                inputRef={pnClientRef}
              />
            )}
            {ModalClientIDs}
            <TextInput
              label={{
                title: "Client Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: disableFields,
                type: "text",
                style: { width: "80%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                },
              }}
              inputRef={clientNameRef}
            />
          </div>
        </div>
      </div>
      <div style={{ height: "5px" }}></div>
      <ContentContainer
        title={'Particulars (Debit)'}
        firstContent={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
              width: "100%"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "15px",
                marginTop: "5px",
                flex: 1,
              }}>
              <SelectInput
                containerStyle={{ width: "100%" }}
                label={{
                  title: "Payment Type : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                selectRef={paymentTypeRef}
                select={{
                  disabled: disableFields,
                  style: { flex: 1, height: "22px" },
                  value: paymentType,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      e.preventDefault()
                      amountDebitRef.current?.focus()
                    }
                  },
                  onChange: (e) => {
                    if (e.target.value === 'CHK' && amountDebitRef.current) {
                      amountDebitRef.current.value = '0.00'
                      wait(100).then(() => {
                        buttonCheckSave.current?.focus()
                      })
                    }
                    setPaymentType(e.target.value)
                  }
                }}
                datasource={[
                  { key: "Cash", value: "CSH" },
                  { key: "Check", value: "CHK" },
                ]}
                values={"value"}
                display={"key"}
              />
              <button
                ref={buttonCheckSave}
                disabled={paymentType === 'CSH'}
                className={`custom-btn ripple-button ${paymentType === 'CSH' ? "disabled" : "not-disabled"}`}
                style={{
                  padding: "0 5px",
                  borderRadius: "0px",
                  color: "white",
                  height: "22px",
                  background: paymentType === 'CSH' ? "#8fc993" : "#1b5e20"

                }}
                onClick={(e) => {
                  modalCheckRef.current?.showModal()
                  wait(100).then(() => {
                    modalCheckRef.current?.checknoRef.current?.focus()
                  })
                }}
              >
                <AddIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "15px"
              }}>
              <TextFormatedInput
                containerStyle={{
                  flex: 1
                }}
                label={{
                  title: "Amount : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: paymentType === 'CHK' || disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      buttonCshSave.current?.click()
                    }
                  }
                }}
                inputRef={amountDebitRef}
              />
              <button
                ref={buttonCshSave}
                disabled={paymentType === 'CHK'}
                className={`custom-btn ripple-button ${paymentType === 'CHK' ? "disabled" : "not-disabled"}`}
                style={{
                  padding: "0 5px",
                  borderRadius: "0px",
                  color: "white",
                  height: "22px",
                  background: paymentType === 'CHK' ? "#8fc993" : "#1b5e20"

                }}
                onClick={(e) => {
                  if (amountDebitRef.current && paymentTypeRef.current) {
                    saveCashDebit(amountDebitRef.current.value, paymentTypeRef.current.value)
                  }
                }}
              >
                <ForwardIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            <Button
              disabled={paymentType === 'CSH'}
              startIcon={<AddIcon />}
              sx={{
                height: "30px",
                fontSize: "11px",
                marginTop: "20px"
              }}
              color="success"
              variant="contained"
            >
              Add Check from PDC Entry
            </Button>
          </div>
        }
        secondContent={
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column"
            }}>
            <CollectionTableSelected
              ref={debitTable}
              columns={debitColumn}
              rows={[]}
              containerStyle={{
                height: 'auto',
                flex: 1,
              }}
              getSelectedItem={(rowItm: any) => {
                if (rowItm) {

                  if (rowItm[0] === 'Cash') {
                    wait(100).then(() => {
                      if (amountDebitRef.current)
                        amountDebitRef.current.value = rowItm[1]
                    })
                  } else {
                    if (rowItm[7] && rowItm[7] !== '') {
                      debitTable.current.setSelectedRow(null)
                      buttonCheckSave.current?.focus()
                      return alert(` Unable to edit. Check No [${rowItm[2]}] already deposited!`)
                    }
                    if (rowItm[8] && rowItm[8] !== '') {
                      debitTable.current.setSelectedRow(null)
                      buttonCheckSave.current?.focus()
                      return alert(` Unable to edit. Check No [${rowItm[2]}] is a PDC reference!`)
                    }
                    const strBank = rowItm[4].split('/')
                    const BankName = executeQueryToClient(`select * from bank where Bank_Code = '${strBank[0]}'`)


                    modalCheckRef.current?.showModal()

                    wait(100).then(() => {
                      if (modalCheckRef.current) {
                        if (modalCheckRef.current.checknoRef.current) {
                          modalCheckRef.current.checknoRef.current.value = rowItm[2]
                        }
                        if (modalCheckRef.current.bankRef.current) {
                          modalCheckRef.current.bankRef.current.value = strBank[0]
                        }
                        if (modalCheckRef.current.branchRef.current) {
                          modalCheckRef.current.branchRef.current.value = rowItm[4]
                        }
                        if (modalCheckRef.current.remarksRef.current) {
                          modalCheckRef.current.remarksRef.current.value = rowItm[9]
                        }
                        if (modalCheckRef.current.checkdateRef.current) {
                          modalCheckRef.current.checkdateRef.current.value = rowItm[3]
                        }
                        if (modalCheckRef.current.amountRef.current) {
                          modalCheckRef.current.amountRef.current.value = rowItm[1]
                        }
                        if (modalCheckRef.current.bankRefName.current) {
                          modalCheckRef.current.bankRefName.current = BankName
                        }

                      }
                    })
                  }

                } else {
                  wait(100).then(() => {
                    if (amountDebitRef.current)
                      amountDebitRef.current.value = '0.00'
                  })
                }
              }}
              onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
                if (e.code === 'Delete' || e.code === 'Backspace') {
                  const isConfim = window.confirm(`Are you sure you want to delete?`)
                  if (isConfim) {
                    const debitTableData = debitTable.current.getData()
                    debitTableData.splice(rowIdx, 1);
                    debitTable.current.setData(debitTableData)
                    setTotalDebit(
                      debitTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray[1].replace(/,/g, '')), 0)
                    )
                    return
                  }
                }
              }}
            />
            <div
              style={{
                fontSize: "13px",
                textAlign: "right",
                border: "1px solid #d1cdcd",
                background: "#dcdcdc",
                fontWeight: "bold"
              }}>{totalDebit.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div>
          </div>
        }
        contentStyle={`
          .custom-btn.not-disabled:hover{
            background:#154f19 !important;
          }
          `}
      />
      <div style={{ height: "5px" }}></div>
      <ContentContainer
        title={'Particulars Breakdown (Credit)'}
        firstContent={
          <div
            style={{
              display: "flex",
              rowGap: "5px",
              flexDirection: "column"
            }}
          >
            <label
              htmlFor="auto-solo-collection"
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px"
              }}

            >Transaction :</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "15px",
                flex: 1,
              }}>

              {paymentTypeLoading ?
                <LoadingButton loading={paymentTypeLoading} />
                : <div style={{ flex: 1 }}>
                  <Autocomplete
                    label={
                      {
                        title: " ",
                        style: {
                          width: "0px",
                          display: "none"
                        },
                      }
                    }
                    input={{
                      id: "auto-solo-collection",
                      style: {
                        width: "100%",
                        flex: 1
                      }
                    }}
                    width={"100%"}
                    DisplayMember={'label'}
                    DataSource={transactionDesc?.data.transactionDesc}
                    disableInput={disableFields}
                    inputRef={transactionRef}
                    onChange={(selected: any, e: any) => {
                      accCodeRef.current = selected.Acct_Code
                      accTitleRef.current = selected.Acct_Title
                      accTCRef.current = selected.Code
                    }}
                    onKeydown={(e: any) => {
                      if (e.key === "Enter" || e.key === 'NumpadEnter') {
                        e.preventDefault()
                        amountCreditRef.current?.focus()
                      }
                    }}
                  />
                </div>}
              <button
                className="custom-btn ripple-button"
                style={{
                  background: "#1b5e20",
                  padding: "0 5px",
                  borderRadius: "0px",
                  color: "white",
                  height: "22px"
                }}
                onClick={() => {
                  wait(100).then(() => {
                    if (transactionRef.current) {
                      transactionRef.current.value = ''
                    }
                    if (amountCreditRef.current) {
                      amountCreditRef.current.value = '0.00'
                    }
                    if (faoRef.current) {
                      faoRef.current.value = ''
                    }
                    if (remarksRef.current) {
                      remarksRef.current.value = ''
                    }
                    if (vatTypeRef.current) {
                      vatTypeRef.current.value = 'Non-VAT'
                    }
                    if (invoiceRef.current) {
                      invoiceRef.current.value = ''
                    }
                    accCodeRef.current = ''
                    accTitleRef.current = ''
                    accTCRef.current = ''
                    foaIDNoRef.current = ''
                    transactionRef.current?.focus()
                    creditTable.current.setSelectedRow(null)

                  })
                }}
              >
                <AddIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "15px",
                width: "100%",
                flex: 1
              }}>
              <TextFormatedInput
                containerStyle={{
                  flex: 1
                }}
                label={{
                  title: "Amount : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1, width: "100%" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      faoRef.current?.focus()
                    }
                  }
                }}
                inputRef={amountCreditRef}
              />

              <button
                className="custom-btn ripple-button"
                style={{
                  background: "#1b5e20",
                  padding: "0 5px",
                  borderRadius: "0px",
                  color: "white",
                  height: "22px"
                }}
                onClick={() => {
                  saveCredit()
                }}
              >
                <ForwardIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            {isLoadingCreditClientIdsModal ? (
              <LoadingButton loading={isLoadingCreditClientIdsModal} />
            ) : (
              <TextInput
                containerStyle={{
                  width: "100%"
                }}
                label={{
                  title: "Usage : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      openCreditCliendIDsModal(e.currentTarget.value)
                    }
                  }
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault()
                  if (faoRef.current) {
                    openCreditCliendIDsModal(faoRef.current.value)
                  }
                }}
                inputRef={faoRef}
              />
            )}
            {ModalCreditClientIDs}
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
                disabled: disableFields,
                rows: 3,
                style: { flex: 1 },
                onKeyDown: (e) => {
                  e.stopPropagation()
                  if ((e.code === "NumpadEnter" && !e.shiftKey) || (e.code === 'Enter' && !e.shiftKey)) {
                    vatTypeRef.current?.focus()
                  }
                },
              }}
              _inputRef={remarksRef}
            />
            <SelectInput
              label={{
                title: "Vat Type : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              selectRef={vatTypeRef}
              select={{
                disabled: disableFields,
                style: { flex: 1, height: "22px" },
                defaultValue: "Non-VAT",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    e.preventDefault()
                    invoiceRef.current?.focus()
                  }
                }
              }}
              datasource={[
                { key: "VAT", value: "VAT" },
                { key: "Non-VAT", value: "Non-VAT" },
              ]}
              values={"value"}
              display={"key"}
            />
            <TextInput
              label={{
                title: "Invoice : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: disableFields,
                type: "text",
                style: { flex: 1 },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    saveCredit()
                  }
                },
              }}
              inputRef={invoiceRef}
            />
          </div>
        }
        secondContent={
          <div style={{
            position: "relative",
            height: "100%",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}>
            <CollectionTableSelected
              ref={creditTable}
              columns={creditColumn}
              rows={[]}
              containerStyle={{
                height: 'auto',
                flex: 1,
              }}
              getSelectedItem={(rowItm: any) => {
                if (rowItm) {
                  wait(100).then(() => {
                    if (transactionRef.current) {
                      transactionRef.current.value = rowItm[0]
                    }
                    if (amountCreditRef.current) {
                      amountCreditRef.current.value = rowItm[1]
                    }
                    if (faoRef.current) {
                      faoRef.current.value = rowItm[2]
                    }
                    if (remarksRef.current) {
                      remarksRef.current.value = rowItm[3]
                    }
                    if (vatTypeRef.current) {
                      vatTypeRef.current.value = rowItm[4]
                    }
                    if (invoiceRef.current) {
                      invoiceRef.current.value = rowItm[5]
                    }
                    accCodeRef.current = rowItm[6]
                    accTitleRef.current = rowItm[7]
                    accTCRef.current = rowItm[8]
                    foaIDNoRef.current = rowItm[9]
                  })
                } else {
                  wait(100).then(() => {
                    if (transactionRef.current) {
                      transactionRef.current.value = ''
                    }
                    if (amountCreditRef.current) {
                      amountCreditRef.current.value = '0.00'
                    }
                    if (faoRef.current) {
                      faoRef.current.value = ''
                    }
                    if (remarksRef.current) {
                      remarksRef.current.value = ''
                    }
                    if (vatTypeRef.current) {
                      vatTypeRef.current.value = 'Non-VAT'
                    }
                    if (invoiceRef.current) {
                      invoiceRef.current.value = ''
                    }
                    accCodeRef.current = ''
                    accTitleRef.current = ''
                    accTCRef.current = ''
                    foaIDNoRef.current = ''

                  })
                }

              }}
              onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
                if (e.code === 'Delete' || e.code === 'Backspace') {
                  const isConfim = window.confirm(`Are you sure you want to delete?`)
                  if (isConfim) {
                    const creditTableData = creditTable.current.getData()
                    creditTableData.splice(rowIdx, 1);
                    creditTable.current.setData(creditTableData)
                    setTotalCredit(
                      creditTableData.reduce((sum: any, subArray: any) => sum + parseFloat(subArray[1].replace(/,/g, '')), 0)
                    )
                    return
                  }
                }
              }}
            />
            <div
              style={{
                fontSize: "13px",
                textAlign: "right",
                border: "1px solid #d1cdcd",
                background: "#dcdcdc",
                fontWeight: "bold"
              }}>{totalCredit.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div>
          </div>
        }
        contentStyle={`
          .custom-btn.not-disabled:hover{
            background:#154f19 !important;
          }
            .custom-btn:focus{
              outline:3px solid #2563eb;
            }
        `}
      />
      <ModalCheck
        ref={modalCheckRef}
        handleOnSave={() => {
          saveCheckDebit()
        }}
        handleOnClose={() => {
          debitTable.current.setSelectedRow(null)
          buttonCheckSave.current?.focus()
        }}
      />
      <UpwardTableModalSearch
        column={[
          { key: "Check_No", label: "Check No", width: 100 },
          { key: "Check_Date", label: "Check Date", width: 100 },
          {
            key: "Amount",
            label: "Amount",
            width: 90,
            type: "number",
          },
          {
            key: "Bank_Branch",
            label: "Bank Branch",
            width: 200,
          },
          {
            key: "Remarks",
            label: "Remarks",
            width: 200,
            hide: true,
          },
        ]}
        query={(search: string) => {
          if (pnClientRef.current) {
            return `
                SELECT 
                   Check_No AS Check_No, 
                   date_FORMAT(Check_Date,'%b. %d, %Y') AS Check_Date,
                   FORMAT(Check_Amnt, 2) AS Amount, 
                  CONCAT(Bank, '/', Branch) AS Bank_Branch
                FROM PDC 
                WHERE (
                  Check_No LIKE '%${search}%' 
                  OR Bank  LIKE '%${search}%' 
                  OR Branch LIKE '%${search}%') 
                  AND (PNo = '${pnClientRef.current.value}' ) 
               --   AND (ORNum IS NULL OR ORNum = '')
                ORDER BY Check_Date
            `
          }
          return ``
        }}
      />
      {(loadingAddNew || isLoadingPrint || loadingCollectionDataSearch) && <UpwardLoader />}
    </div>
  )
}
const UpwardTableModalSearch = ({
  column,
  query
}: any) => {
  const { executeQueryToClient } = useExecuteQueryFromClient()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<any>(null)




  return (
    <div
      style={{
        background: "#F1F1F1",
        width: "450px",
        height: "500px",
        position: "absolute",
        zIndex: 111111,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        boxShadow: '3px 6px 32px -7px rgba(0,0,0,0.75)',
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
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
          alignItems: "center"

        }}
      >
        <span style={{ fontSize: "13px", fontWeight: "bold" }}>Search</span>
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
            right: 0
          }}
          onClick={() => {
            // closeDelay()
          }}
        >
          <CloseIcon sx={{ fontSize: "22px" }} />
        </button>
      </div>
      <div style={{
        padding: "5px"
      }}>
        <TextInput
          containerStyle={{
            width: "100%"
          }}
          label={{
            title: "Search : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "70px",
              display: "none"
            },
          }}
          input={{
            type: "text",
            style: { width: "100%" },
            onKeyDown: async (e) => {
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                const searchQuery = query(e.currentTarget.value)
                const dd = await executeQueryToClient(searchQuery)

                tableRef.current?.setDataFormated(dd.data.data)
              }
            },
          }}
          inputRef={searchInputRef}
          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault()
            const searchQuery = query(searchInputRef.current?.value)
          }}
        />
      </div>
      <div style={{
        flex: 1,
      }}>
        <CollectionTableSelected
          columns={column}
          height={"100%"}
          ref={tableRef}
        />
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
  )
}
const UpwardLoader = () => {

  return (

    <>
      <div style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: "red",
        zIndex: "88",
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}
      ></div>
      <div style={{
        position: "absolute",
        zIndex: "1",
        background: "white",
        width: "auto",
        height: "auto",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        boxShadow: '3px 6px 32px -7px rgba(0,0,0,0.75)',
        display: "flex",
        columnGap: "20px",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 15px",
      }}>
        <CircularProgress color="primary" />
        <span>Loading...</span>
      </div>
    </>
  )
}

const ContentContainer = ({
  firstContent,
  secondContent,
  title,
  contentStyle
}: any) => {

  return (
    <div
      style={{
        width: "100%",
        height: "38%",
        display: "flex",
        padding: "5px"
      }}
    >
      <style>{contentStyle}</style>
      <div style={{
        flex: 1,
        display: "flex",
        width: "100%",
        border: "1px solid #64748b",
        position: "relative",
      }}>
        <span
          style={{
            position: "absolute",
            top: "-15px",
            left: "20px",
            background: "#F1F1F1",
            padding: "0 5px",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >{title}</span>
        <div
          style={{
            width: "30%",
            height: "100%",
            padding: "10px 5px",
            boxSizing: "border-box"
          }}
        >
          {firstContent}
        </div>
        <div
          style={{
            width: "70%",
            height: "100%",
            padding: "10px 5px",
            boxSizing: "border-box"
          }}
        >
          {secondContent}
        </div>
      </div>
    </div>
  )
}
const ModalCheck = forwardRef(({
  handleOnSave,
  handleOnClose
}: any, ref) => {
  const [showModal, setShowModal] = useState(false)
  const [handleDelayClose, setHandleDelayClose] = useState(false)
  const [blick, setBlick] = useState(false)

  const checknoRef = useRef<HTMLInputElement>(null)
  const bankRef = useRef<HTMLInputElement>(null)
  const branchRef = useRef<HTMLInputElement>(null)
  const remarksRef = useRef<HTMLTextAreaElement>(null)
  const checkdateRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const bankRefName = useRef('')
  const searchModalInputRef = useRef<HTMLInputElement>(null)

  const closeDelay = () => {
    setHandleDelayClose(true)
    setTimeout(() => {
      setShowModal(false)
      setHandleDelayClose(false)
      handleOnClose()
    }, 100)
  }

  useImperativeHandle(ref, () => ({

    showModal: () => {
      setShowModal(true)
    },
    clsoeModal: () => {
      setShowModal(false)
    },
    getRefs: () => {
      const refs = {
        checknoRef,
        bankRef,
        branchRef,
        remarksRef,
        checkdateRef,
        amountRef,
        bankRefName
      }
      return refs
    },
    checknoRef,
    bankRef,
    branchRef,
    remarksRef,
    checkdateRef,
    amountRef,
    bankRefName,
    searchModalInputRef,
    closeDelay

  }))

  const {
    ModalComponent: ModalSearchBanks,
    openModal: openModalSearchBanks,
    closeModal: closeModalSearchBanks,
    isLoading: isLoadingModalSearchbanks,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-pdc-banks",
      queryUrlName: "searchPdcBanks",
    },
    columns: [
      { field: "Bank_Code", headerName: "Code", width: 130 },
      { field: "Bank", headerName: "Bank Name", flex: 1 },
    ],
    queryKey: "collection-banks",
    uniqueId: "Bank_Code",
    responseDataKey: "pdcBanks",
    onSelected: (selectedRowData, data) => {
      wait(100).then(() => {
        bankRefName.current = selectedRowData[0].Bank_Code
        if (bankRef.current) {
          bankRef.current.value = selectedRowData[0].Bank
        }
        branchRef.current?.focus()
      })
      closeModalSearchBanks();
    },

    searchRef: searchModalInputRef,
  });


  useEffect(() => {
    window.addEventListener('keydown', (e: any) => {
      if (e.key === "Escape") {
        closeDelay()
      }
    })
  }, [])


  return (
    showModal ?
      <>
        <div style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "transparent",
          zIndex: "88"
        }}
          onClick={() => {
            setBlick(true)
            setTimeout(() => {
              setBlick(false)
            }, 250)
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
            boxShadow: '3px 6px 32px -7px rgba(0,0,0,0.75)'
          }}>
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center"

            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Check Details</span>
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
                right: 0
              }}
              onClick={() => {
                closeDelay()
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
            <div style={{
              width: "55%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
              padding: "10px"

            }}>
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
                  type: "text",
                  style: { width: "160px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      bankRef.current?.focus()
                    }
                  },
                }}
                inputRef={checknoRef}
              />
              {isLoadingModalSearchbanks ? (
                <LoadingButton loading={isLoadingModalSearchbanks} />
              ) : (
                <TextInput
                  containerStyle={{
                    width: "370px"
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
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        openModalSearchBanks(e.currentTarget.value)
                      }
                    }
                  }}
                  icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={(e) => {
                    e.preventDefault()
                    if (bankRef.current) {
                      openModalSearchBanks(bankRef.current.value)
                    }
                  }}
                  inputRef={bankRef}
                />
              )}
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
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      remarksRef.current?.focus()
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
                    e.stopPropagation()
                    if ((e.code === "NumpadEnter" && !e.shiftKey) || (e.code === 'Enter' && !e.shiftKey)) {
                      checkdateRef.current?.focus()
                    }
                  },
                }}
                _inputRef={remarksRef}
              />

            </div>
            <div style={{
              width: "45%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
              position: "relative",
              padding: "10px",
              alignItems: "flex-end"
            }}>
              <TextInput
                label={{
                  title: "Date : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  type: "date",
                  style: { width: "200px" },
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      amountRef.current?.focus()
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
                    width: "70px",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "200px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      if (handleOnSave) {
                        handleOnSave()
                      }
                    }
                  }
                }}
                inputRef={amountRef}
              />
              <div style={{
                display: "flex",
                columnGap: "10px",
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end"
              }}>
                <Button
                  variant="contained"
                  color="success"
                  style={{
                    height: "22px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    if (handleOnSave) {
                      handleOnSave()
                    }

                  }}
                >
                  OK
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  style={{
                    height: "22px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    closeDelay()
                  }}
                >
                  Cancel
                </Button>

              </div>
            </div>
          </div>
          {ModalSearchBanks}
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
      : null
  )
})
const CollectionTableSelected = forwardRef(({
  columns,
  rows = [],
  height = "400px",
  getSelectedItem,
  onKeyDown,
  disbaleTable = false,
  isTableSelectable = true,
  containerStyle
}: any, ref) => {
  const parentElementRef = useRef<any>(null)
  const [data, setData] = useState([])
  const [column, setColumn] = useState([])
  const [selectedRow, setSelectedRow] = useState<any>(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState<any>(null)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)

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

  useImperativeHandle(ref, () => ({
    checkNoIsExist: (checkNo: string) => {
      return data.some((subArray: any) => subArray[2] === checkNo);
    },
    selectedRow: () => selectedRow,
    getData: () => {
      const newData = [...data];
      return newData
    },
    setData: (newData: any) => {
      setData(newData)
    },
    getColumns: () => {
      return columns
    },
    resetTable: () => {
      setData([])
      setSelectedRow(0)
    },
    getSelectedRow: () => {
      return selectedRowIndex
    },
    setSelectedRow: (value: any) => {
      return setSelectedRowIndex(value)
    },
    setDataFormated: (newData: any) => {
      setData(newData.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    },
    getDataFormatted: () => {
      const newData = [...data];
      const newDataFormatted = newData.map((itm: any) => {
        let newItm = {
          Check_No: itm[0],
          Check_Date: itm[1],
          Check_Amnt: itm[2],
          BankName: itm[3],
          Branch: itm[4],
          Check_Remarks: itm[5],
          Deposit_Slip: itm[6],
          DateDeposit: itm[7],
          OR_No: itm[8],
          BankCode: itm[9]

        }
        return newItm
      })

      return newDataFormatted
    }
  }))

  return (
    <div
      ref={parentElementRef}
      style={{
        width: "100%",
        height,
        overflow: "auto",
        position: "relative",
        pointerEvents: disbaleTable ? "none" : "auto",
        border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
        boxShadow: `inset -2px -2px 0 #ffffff, 
                      inset 2px 2px 0 #808080`,
        ...containerStyle,
        background: "#dcdcdc"
      }}
    >
      <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
        <table
          id="upward-cutom-table"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            position: "relative",
            background: "#dcdcdc"
          }}>
          <thead >
            <tr>
              <th style={{
                width: '30px',
                border: "none",
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "#f0f0f0",

              }}
              >

              </th>
              {
                column.map((colItm: any, idx: number) => {
                  return (
                    <th
                      key={idx}
                      style={{
                        width: colItm.width,
                        borderRight: "1px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        textAlign: "left",
                        padding: "0px 5px",

                      }}
                    >{colItm.label}</th>
                  )
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              data?.map((rowItm: any, rowIdx: number) => {

                return (
                  <tr key={rowIdx} className={`${(selectedRow === rowIdx ) || (selectedRowIndex === rowIdx)? "selected" : ""}`}>
                    <td
                      style={{
                        position: "relative",
                        border: "none",
                        cursor: "pointer",
                        background: selectedRow === rowIdx ? "#0076d" : "",
                        padding: 0,
                        margin: 0,

                      }}>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <input
                          style={{
                            cursor: "pointer",
                            margin: "0px !important",
                            position: "absolute",
                          }}
                          readOnly={true}
                          checked={selectedRowIndex === rowIdx}
                          type="checkbox"
                          onClick={() => {
                            if (!isTableSelectable) {
                              return
                            }
                            setSelectedRowIndex(rowIdx)

                            if (getSelectedItem) {
                              getSelectedItem(rowItm, null, rowIdx, null)
                            }
                            setSelectedRow(null)

                          }}
                        />

                      </div>

                    </td>

                    {
                      column.map((colItm: any, colIdx: number) => {
                        return (
                          <td
                            className={`td row-${rowIdx} col-${colIdx} `}
                            tabIndex={0}
                            onDoubleClick={() => {
                              if (!isTableSelectable) {
                                return
                              }
                              if (selectedRowIndex === rowIdx) {
                                setSelectedRowIndex(null)

                                if (getSelectedItem) {
                                  getSelectedItem(null, null, rowIdx, null)
                                }
                              } else {

                                setSelectedRowIndex(rowIdx)
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, null, rowIdx, null)
                                }
                              }
                              setSelectedRow(null)
                            }}
                            onClick={() => {
                              setSelectedRow(rowIdx)
                            }}
                            onKeyDown={(e) => {
                              if (onKeyDown) {
                                onKeyDown(rowItm, rowIdx, e)
                              }
                              if (e.key === "ArrowUp") {
                                setSelectedRow((prev: any) => {
                                  const index = Math.max(prev - 1, 0)
                                  const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                  if (td) {
                                    td.focus()
                                  }
                                  return index
                                });
                              } else if (e.key === "ArrowDown") {
                                setSelectedRow((prev: any) => {
                                  const index = Math.min(prev + 1, data.length - 1)
                                  const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                  if (td) {
                                    td.focus()
                                  }
                                  return index
                                });
                              }
                              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                                e.preventDefault()

                                if (!isTableSelectable) {
                                  return
                                }

                                setSelectedRowIndex(rowIdx)
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, null, rowIdx, null)
                                }
                                setSelectedRow(null)
                              }
                            }}
                            key={colIdx}

                            style={{
                              border: "none",
                              fontSize: "12px",
                              padding: "0px 5px",
                              cursor: "pointer",
                              height: "20px",
                              userSelect: "none",

                            }}
                          >{
                              <input
                                readOnly={true}
                                value={rowItm[colIdx]}
                                style={{
                                  width: colItm.width,
                                  pointerEvents: "none",
                                  border: "none",
                                  background: "transparent",
                                  userSelect: "none",
                                  height: "100%",
                                  textAlign: colItm.type === 'number' ? "right" : "left"

                                }} />
                            }</td>
                        )
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <style>

          {`
           #upward-cutom-table tr td{
             border-right:1px solid #f1f5f9 !important;
           }
        
            #upward-cutom-table tr:nth-child(odd) td {
                background-color: #ffffff !important;
            }
            #upward-cutom-table tr:nth-child(even) td {
                background-color: #f5f5f5 !important;
            }
            #upward-cutom-table tr.selected td {
                background-color: #0076d7 !important;
                color: #ffffff !important;
                border-right:1px solid white !important;
            }
            
             #upward-cutom-table tr.selected td input {
                color: #ffffff !important;
            }

            `}
        </style>
      </div>
    </div>
  )
})






function Collectionss() {
  const [credit, setCredit] = useState<GridRowSelectionModel>([]);
  const [debit, setDebit] = useState<GridRowSelectionModel>([]);
  const [openPdcInputModal, setOpenPdcInputModal] = useState(false);

  const { searchParams, setSearchParams } = useUrlParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [debitState, debitDispatch] = useReducer(reducer, initialStateDeposit);
  const [creditState, creditDispatch] = useReducer(reducer, initialStateCredit);
  const [modalState, modalDispatch] = useReducer(reducer, modalInitialState);

  const { myAxios, user } = useContext(AuthContext);
  const [save, setSave] = useState(searchParams.get("selected") !== "");
  const [addNew, setAddNew] = useState(searchParams.get("selected") !== "");
  const [hasSelected, setHasSelected] = useState(false);

  // button submit buttons
  const cashButtonSave = useRef<HTMLButtonElement>(null);
  const checkModalSaveButton = useRef<HTMLButtonElement>(null);
  const checkModalSaveActionButtonRef = useRef<any>(null);

  const creditSaveButton = useRef<HTMLButtonElement>(null);
  const saveCollectionButtonRef = useRef<HTMLButtonElement>(null);

  //search modal auto focus on load
  const pdcSearchInput = useRef<HTMLInputElement>(null);
  const collectionSearchInput = useRef<HTMLInputElement>(null);
  const bankSearchInput = useRef<HTMLInputElement>(null);
  const checkListSearchInput = useRef<HTMLInputElement>(null);

  //Check Modal Input ref
  const checkNoRef = useRef<HTMLInputElement>(null);
  const checkBankRef = useRef<HTMLInputElement>(null);
  const checkBranchRef = useRef<HTMLInputElement>(null);
  const checkRemakrsRef = useRef<HTMLInputElement>(null);
  const checkAmountRef = useRef<HTMLInputElement>(null);
  const checkDateRef = useRef<HTMLInputElement>(null);

  //debit amount ref
  const paymentTypeRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  //credit input ref
  let creditTransactionRef = useRef<HTMLInputElement>(null);
  const creditAmountRef = useRef<HTMLInputElement>(null);
  const creditFaoRef = useRef<HTMLInputElement>(null);
  const creditInvoiceRef = useRef<HTMLInputElement>(null);

  //pn/client ref
  const pnClientORRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  // client IDs search table modal


  const dateRef = useRef<HTMLInputElement>(null);
  const pdcAddbtnRef = useRef<HTMLButtonElement>(null);



  const tableDebit = useRef<any>(null);
  const tableCredit = useRef<any>(null);
  const creditRemarksRef = useRef<any>(null);
  const vatRef = useRef<any>(null);

  const {
    ModalComponent: ModalClientIDs,
    openModal: openCliendIDsModal,
    isLoading: isLoadingClientIdsModal,
    closeModal: closeCliendIDsModal,
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
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "collection-polidy-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "PNo",
        value: selectedRowData[0].IDNo,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "IDNo",
        value: selectedRowData[0].client_id,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "Name",
        value: selectedRowData[0].Name ?? "",
      });
      closeCliendIDsModal();
      wait(50).then(() => {
        paymentTypeRef.current?.focus()
      })
    },
    searchRef: pdcSearchInput,
  });

  //CREDIT CLIENT

  const {
    ModalComponent: ModalCreditClientIDs,
    openModal: openCreditCliendIDsModal,
    isLoading: isLoadingCreditClientIdsModal,
    closeModal: closeCreditCliendIDsModal,
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
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "collection-polidy-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      creditDispatch({
        type: "UPDATE_FIELD",
        field: "FAO_ID",
        value: selectedRowData[0].IDNo,
      });
      creditDispatch({
        type: "UPDATE_FIELD",
        field: "FAO_Name",
        value: selectedRowData[0].Name ?? "",
      });
      closeCreditCliendIDsModal();
      wait(50).then(() => {
        creditRemarksRef.current?.focus()
      })
    },
    searchRef: pdcSearchInput,
  });

  // collection search table modal
  const {
    ModalComponent: ModalSearchCollection,
    openModal: openModalSearchCollection,
    closeModal: closeModalSearchCollection,
    isLoading: isLoadingModalSearchCollection,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-collection",
      queryUrlName: "searchCollectionInput",
    },
    columns: [
      { field: "Date", headerName: "OR Date", width: 170 },
      { field: "ORNo", headerName: "OR No.", width: 200 },
      { field: "Name", headerName: "Name", flex: 1 },
    ],
    queryKey: "collection-search",
    uniqueId: "ORNo",
    responseDataKey: "collection",
    onSelected: (selectedRowData, data) => {
      mutateCollectionDataSearch({ ORNo: selectedRowData[0].ORNo });
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: collectionSearchInput,
  });
  // bank search table modal
  const {
    ModalComponent: ModalSearchBanks,
    openModal: openModalSearchBanks,
    closeModal: closeModalSearchBanks,
    isLoading: isLoadingModalSearchbanks,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-pdc-banks",
      queryUrlName: "searchPdcBanks",
    },
    columns: [
      { field: "Bank_Code", headerName: "Code", width: 130 },
      { field: "Bank", headerName: "Bank Name", flex: 1 },
    ],
    queryKey: "collection-banks",
    uniqueId: "Bank_Code",
    responseDataKey: "pdcBanks",
    onSelected: (selectedRowData, data) => {
      modalDispatch({
        type: "UPDATE_FIELD",
        field: "BankName",
        value: selectedRowData[0].Bank,
      });

      modalDispatch({
        type: "UPDATE_FIELD",
        field: "BankCode",
        value: selectedRowData[0].Bank_Code,
      });
      closeModalSearchBanks();

      setTimeout(() => {
        if (checkBranchRef.current) {
          checkBranchRef.current.focus()
        }
      }, 100)
    },

    searchRef: bankSearchInput,
  });
  //Get checked list
  const {
    ModalComponent: ModalSearchCheckList,
    openModal: openModalSearchCheckList,
    closeModal: closeModalSearchCheckList,
    isLoading: isLoadingModalSearchCheckList,
    mutate: mutateClientCheckedList,
  } = useMutationModalTable({
    link: {
      queryWithVariable: (variables: any) => {
        return `/task/accounting/get-client-checked-by-id?PNo=${variables.PNo}&searchCheckedList=${variables.searchCheckedList}`;
      },
      queryExtraBySearch: `/task/accounting/get-client-checked-by-id?PNo=${state.PNo}&searchCheckedList`,
    },
    columns: [
      { field: "temp_id", headerName: "temp_id", width: 0, hide: true },
      { field: "Check_No", headerName: "Check No", width: 130 },
      { field: "Check_Date", headerName: "Check Date", flex: 1 },
      {
        field: "Amount",
        headerName: "Amount",
        width: 200,
        type: "number",
      },
      {
        field: "Bank_Branch",
        headerName: "Bank Branch",
        width: 200,
      },
      {
        field: "Remarks",
        headerName: "Remarks",
        width: 200,
        hide: true,
      },
    ],
    queryKey: "collection-client-check",
    uniqueId: "temp_id",
    responseDataKey: "clientCheckedList",
    onSelected: (selectedRowData, data) => {
      if (
        debit
          .filter((items: any) => items.Check_No !== "")
          .map((items: any) => items.Check_No)
          .includes(selectedRowData[0].Check_No)
      ) {
        return;
      }

      myAxios
        .post(
          `/task/accounting/get-drcode-drtitle-from-collection`,
          { code: debitState.payamentType },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        )
        .then((res) => {
          const { Acct_Code, Acct_Title } = res?.data?.data[0];
          setDebit((d: any) => {
            let lastID = 0;
            if (d.length <= 0) {
              lastID = 0;
            } else {
              lastID = parseInt(d[d.length - 1].temp_id) + 1;
            }

            d = [
              ...d,
              {
                Payment: "Check",
                Amount: selectedRowData[0].Amount,
                Check_No: selectedRowData[0].Check_No,
                Check_Date: selectedRowData[0].Check_Date,
                Bank_Branch: selectedRowData[0].Bank_Branch,
                Acct_Code,
                Acct_Title,
                Deposit_Slip: "",
                Cntr: "",
                Remarks: selectedRowData[0].Remarks,
                TC: debitState.payamentType,
                temp_id: lastID.toString(),
                Bank: selectedRowData[0].Bank,
                BankName: selectedRowData[0].BankName,
                Check_Remarks: selectedRowData[0].Check_Remarks,
                Branch: selectedRowData[0].Branch,
              },
            ];
            return d;
          });
          closeModalSearchCheckList();
        });
    },
    onSuccess: (data) => {
      openModalSearchCheckList();
    },
    searchRef: checkListSearchInput,
    isRowSelectable: (params) => {
      if (
        debit
          .filter((items: any) => items.Check_No !== "")
          .map((items: any) => items.Check_No)
          .includes(params.row.Check_No)
      ) {
        return false;
      }
      return true;
    },
  });

  // get chart_account and transaction_code
  const { isLoading: paymentTypeLoading } = useQuery({
    queryKey: queryKeyPaymentType,
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-transaction-code-title`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      const response = res as any;

      debitDispatch({
        type: "UPDATE_FIELD",
        field: "transaction_desc",
        value: response.data.transactionDesc,
      });
    },
  });

  //get drcode and drtitle
  const { isLoading: NewORNoLoading, refetch: refetchNewOR } = useQuery({
    queryKey: queryKeyNewORNumber,
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-new-or-number`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      const response = res as any;
      dispatch({
        type: "UPDATE_FIELD",
        field: "ORNo",
        value: response.data?.ORNo[0].collectionID,
      });

      dispatch({
        type: "UPDATE_FIELD",
        field: "OR_No",
        value: response.data?.ORNo[0].collectionID,
      });
    },
  });
  // get data after collection search selected
  const {
    isLoading: loadingCollectionDataSearch,
    mutate: mutateCollectionDataSearch,
  } = useMutation({
    mutationKey: queryMutationKeyCollectionDataSearch,
    mutationFn: async (variables: any) =>
      await myAxios.get(
        `/task/accounting/get-collection-data-search?ORNo=${variables.ORNo}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const dataCollection = response.data.collection;

      const ORNo = dataCollection[0].ORNo;
      const OR_Date = dataCollection[0].Date_OR;
      const ClientID = dataCollection[0].ID_No;
      const ClientName = dataCollection[0].Short;
      const selectedSearchState = {
        ORNo: ORNo,
        PNo: ClientID,
        IDNo: ClientID,
        Date: OR_Date,
        Name: ClientName,
      };
      const debit: Array<any> = [];
      const credit: Array<any> = [];


      function isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
      }

      for (let i = 0; i <= dataCollection.length - 1; i++) {
        if (
          dataCollection[i].Payment !== "" &&
          dataCollection[i].Debit !== "0"
        ) {
          debit.push({
            Payment: dataCollection[i].Payment,
            Amount: dataCollection[i].Debit,
            Check_No: dataCollection[i].Check_No,
            Check_Date: isValidDate(dataCollection[i].Check_Date)
              ? new Date(dataCollection[i].Check_Date).toLocaleDateString()
              : "",
            Bank_Branch: dataCollection[i].Bank,
            Acct_Code: dataCollection[i].DRCode,
            Acct_Title: dataCollection[i].DRTitle,
            Deposit_Slip: dataCollection[i].SlipCode,
            Cntr: "",
            Remarks: dataCollection[i].DRRemarks,
            TC: dataCollection[i].Check_No ? "CHK" : "CSH",
            temp_id: `${i}`,
            Bank: dataCollection[i].Bank_Code,
            BankName: dataCollection[i].BankName,
            Branch: dataCollection[i].Branch,
            Check_Remarks: dataCollection[i].DRRemarks,
          });
        }

        if (
          dataCollection[i].Purpose !== "" &&
          dataCollection[i].Credit !== "0" &&
          dataCollection[i].CRCode !== "" &&
          dataCollection[i].CRTitle !== "" &&
          dataCollection[i].CRLoanID !== "" &&
          dataCollection[i].CRLoanName !== "" &&
          dataCollection[i].CRVatType !== "" &&
          dataCollection[i].CRInvoiceNo !== ""
        ) {
          credit.push({
            temp_id: `${i}`,
            transaction: dataCollection[i].Purpose,
            amount: dataCollection[i].Credit,
            Remarks: dataCollection[i].CRRemarks,
            Code: dataCollection[i].CRCode,
            Title: dataCollection[i].CRTitle,
            TC: dataCollection[i].CRTitle,
            Account_No: dataCollection[i].CRLoanID,
            Name: dataCollection[i].CRLoanName,
            VATType: dataCollection[i].CRVATType,
            invoiceNo: dataCollection[i].CRInvoiceNo,
          });
        }
      }
      setNewStateValue(dispatch, selectedSearchState);
      setDebit(debit);
      setCredit(credit);
      setAddNew(true);
      setSave(true);
      setHasSelected(true);
      closeModalSearchCollection();
    },
  });
  //add update
  const {
    mutate,
    isLoading: loadingAddNew,
    variables,
  } = useMutation({
    mutationKey: addCollectionQueryKey,
    mutationFn: async (variables: any) => {
      if (hasSelected) {
        delete variables.mode;
        return await myAxios.post(
          "/task/accounting/update-collection",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      delete variables.mode;
      return await myAxios.post("/task/accounting/add-collection", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        setSave(false);
        setAddNew(false);
        setNewStateValue(dispatch, initialState);
        queryClient.invalidateQueries("collection-search");
        setHasSelected(false);
        setDebit([]);
        setCredit([]);
        refetchNewOR();
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
  // print
  const { mutate: mutataPrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "on-print",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/task/accounting/on-print", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        printOR(res.data);
      }
    },
  });
  // dispatch state
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  // dispatch debit state
  const handleDebitInputChange = (e: any) => {
    const { name, value } = e.target;
    debitDispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  // dispatch credit state
  const handleCreditInputChange = (e: any) => {
    const { name, value } = e.target;
    creditDispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  // click button save
  function handleOnSave(e: any) {
    e.preventDefault();
    if (state.ORNo === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide OR number",
        timer: 1500,
      });
    } else if (state.PNo === "") {
      dispatch({
        type: "UPDATE_FIELD",
        field: "isFao",
        value: false,
      });
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide PN/Client ID",
        timer: 1500,
      }).then(() => {
        wait(350).then(() => {
          openCliendIDsModal();
        });
      });
    } else if (debit.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide debit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          paymentTypeRef.current?.focus();
        });
      });
    } else if (credit.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide credit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          creditTransactionRef.current?.focus();
        });
      });
    } else if (
      debit.reduce(
        (sum: any, obj: any) =>
          sum + parseFloat(obj.Amount.toString().replace(/,/g, "")),
        0
      ) !==
      credit.reduce(
        (sum: any, obj: any) =>
          sum + parseFloat(obj.amount.toString().replace(/,/g, "")),
        0
      )
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Transaction is not balanced. Check if the amount you entered are correct!",
        timer: 1500,
      });
    }

    if (state.PNo.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "PN/Client ID is too long!",
        timer: 1500,
      });
    }

    const newState = {
      ORNo: state.ORNo,
      PNo: state.PNo,
      IDNo: state.IDNo,
      Date: state.Date,
      Name: state.Name,
      debit: JSON.stringify(debit),
      credit: JSON.stringify(credit),
      payamentType: debitState.payamentType,
    };
    if (hasSelected) {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutate({ ...newState, userCodeConfirmation, mode: "" });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutate({ ...newState, mode: "" });
        },
      });
    }
  }
  // debit select Row
  function DebitSelectedChange(rowSelected: any) {
    if (rowSelected.Payment === "Cash") {
      modalDispatch({
        type: "UPDATE_FIELD",
        field: "CheckMode",
        value: "",
      });
      modalDispatch({
        type: "UPDATE_FIELD",
        field: "CheckIdx",
        value: "",
      });

      debitDispatch({
        type: "UPDATE_FIELD",
        field: "amount",
        value: rowSelected.Amount,
      });
      debitDispatch({
        type: "UPDATE_FIELD",
        field: "cashID",
        value: rowSelected.temp_id,
      });
      debitDispatch({
        type: "UPDATE_FIELD",
        field: "cashMode",
        value: "edit",
      });
      return;
    }
    setAddNew(true);
    setSave(true);
    modalDispatch({
      type: "UPDATE_FIELD",
      field: "CheckMode",
      value: "edit",
    });
    modalDispatch({
      type: "UPDATE_FIELD",
      field: "CheckIdx",
      value: rowSelected.temp_id,
    });

    if (rowSelected.Deposit_Slip !== "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: `Unable to edit. Check No ${rowSelected.Check_No} is a PDC deposited!`,
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (rowSelected.Cntr !== "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: `Unable to edit. Check No ${rowSelected.Check_No} is a PDC reference!`,
        showConfirmButton: false,
        timer: 1500,
      });
    }
    const newState = {
      CheckIdx: rowSelected.temp_id,
      BankName: rowSelected.BankName,
      BankCode: rowSelected.Bank,
      Branch: rowSelected.Branch,
      Check_Date: new Date(rowSelected.Check_Date),
      Check_No: rowSelected.Check_No,
      Check_Amnt: rowSelected.Amount,
      Check_Remarks: rowSelected.Remarks,
      CheckMode: "edit",
    };

    // if (code === "Delete" || code === "Backspace") {
    //   return DebitDeleteRow(rowSelected);
    // }

    setNewStateValue(modalDispatch, newState);
    flushSync(() => {
      setOpenPdcInputModal(true);
    });
    checkModalSaveActionButtonRef.current?.focusVisible();
  }
  // debit selected row delete
  function DebitDeleteRow(rowSelected: any) {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't to delete this Check No. ${rowSelected.Check_No}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        return Swal.fire({
          text: `Check No. ${rowSelected.Check_No} has delete successfully.`,
          icon: "success",
          showCancelButton: true,
          timer: 1500,
        }).then(() => {
          setDebit((d) => {
            d = d.filter((item: any) => {
              return item.temp_id !== rowSelected.temp_id;
            });
            return d;
          });
        });
      }

      debitDispatch({
        type: "UPDATE_FIELD",
        field: "amount",
        value: "0.00",
      });
      tableDebit.current?.resetTableSelected();
    });
  }

  function handleModalInputChange(e: any) {
    const { name, value } = e.target;
    modalDispatch({ type: "UPDATE_FIELD", field: name, value });
  }

  function CustomSwalAlertWarning(
    label: string,
    cb: (value: SweetAlertResult<any>) => any
  ) {
    Swal.fire({
      text: label,
      icon: "warning",
      showCancelButton: false,
      timer: 1500,
    }).then(cb);
  }

  function printOR(res: any) {
    const data = res.data.concat(res.data1);
    flushSync(() => {
      localStorage.removeItem("printString");
      localStorage.setItem("dataString", JSON.stringify(data));
      localStorage.setItem("paper-width", "8.5in");
      localStorage.setItem("paper-height", "11in");
      localStorage.setItem("module", "collection");
      if (user?.department === "UMIS") {
        localStorage.setItem("title", user?.department === 'UMIS' ? "UPWARD MANAGEMENT INSURANCE SERVICES" : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.");
      } else {
        localStorage.setItem(
          "title",
          "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
        );
      }
    });
    window.open("/dashboard/print", "_blank");
  }

  const width = window.innerWidth - 70;
  const height = window.innerHeight - 500;

  return (
    <>
      <PageHelmet title="Collection" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "5px"
        }}
      >
        <CollectionContext.Provider value={{ credit, debit }}>
          <div style={{ height: "auto" }}>
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
                  columnGap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    columnGap: "5px",
                  }}
                >
                  {isLoadingModalSearchCollection ? (
                    <LoadingButton loading={isLoadingModalSearchCollection} />
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
                          return openModalSearchCollection(
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
                        setAddNew(true);
                        setSave(true);
                        setSearchParams((prev) => {
                          prev.set("selected", "");
                          return prev;
                        });
                        setDebit([]);
                        setCredit([]);
                        setHasSelected(false);
                      }}
                    >
                      New
                    </Button>
                  )}
                  <Box sx={{ position: "relative" }}>
                    <Button
                      sx={{
                        height: "30px",
                        fontSize: "11px",
                      }}
                      ref={saveCollectionButtonRef}
                      id="save-entry-header"
                      color="success"
                      variant="contained"
                      type="submit"
                      onClick={handleOnSave}
                      disabled={
                        (loadingAddNew && variables.mode === undefined) || !save
                      }
                      startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
                    >
                      Save
                    </Button>
                    {loadingAddNew && variables.mode === undefined && (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: green[500],
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    )}
                  </Box>
                  {save && (
                    <Button
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
                            setAddNew(false);
                            setNewStateValue(dispatch, initialState);
                            refetchNewOR();
                            setDebit([]);
                            setCredit([]);
                            setHasSelected(false);
                          }
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <LoadingButton
                    loading={isLoadingPrint}
                    color="secondary"
                    variant="contained"
                    sx={{
                      height: "30px",
                      fontSize: "11px",
                    }}
                    disabled={!hasSelected}
                    onClick={() => {
                      mutataPrint({ ORNo: state.ORNo });
                    }}
                  >
                    Print
                  </LoadingButton>
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
            >
              <Box
                sx={(theme) => ({
                  [theme.breakpoints.down("md")]: {
                    flexDirection: "column",
                    rowGap: "10px",
                  },
                })}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "15px 0 ",
                  }}
                >
                  {NewORNoLoading ? (
                    <LoadingButton loading={NewORNoLoading} />
                  ) : (
                    <FormControl
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
                      variant="outlined"
                      size="small"
                      disabled={!addNew || hasSelected}
                      required
                    >
                      <InputLabel htmlFor="collection-id-field">
                        OR No.
                      </InputLabel>
                      <OutlinedInput
                        sx={{
                          height: "27px",
                          fontSize: "14px",
                        }}
                        readOnly={user?.department !== "UCSMI"}

                        // inputRef={checkBankRef}
                        disabled={!addNew || hasSelected}
                        label="OR No."
                        name="ORNo"
                        value={state.ORNo}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            dateRef.current?.focus();
                          }
                        }}
                        id="collection-id-field"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!addNew || hasSelected}
                              aria-label="search-client"
                              color="secondary"
                              edge="end"
                              onClick={() => {
                                refetchNewOR();
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
                    inputRef={dateRef}
                    fullWidth={false}
                    disabled={!addNew}
                    label="OR Date"
                    onChange={(value: any) => {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "Date",
                        value: value,
                      });
                    }}
                    value={new Date(state.Date)}
                    onKeyDown={(e: any) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        //saveCollectionButtonRef.current?.click();
                        pnClientORRef.current?.focus()
                      }
                    }}

                  />
                  {paymentTypeLoading || isLoadingClientIdsModal ? (
                    <LoadingButton
                      loading={paymentTypeLoading || isLoadingClientIdsModal}
                    />
                  ) : (
                    <FormControl
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
                      variant="outlined"
                      size="small"
                      disabled={!addNew}
                    >
                      <InputLabel htmlFor="client-id">PN/Client ID</InputLabel>
                      <OutlinedInput
                        sx={{
                          height: "27px",
                          fontSize: "14px",
                        }}
                        inputRef={pnClientORRef}
                        name="PNo"
                        value={state.PNo}
                        onChange={handleInputChange}
                        id="client-id"
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            dispatch({
                              type: "UPDATE_FIELD",
                              field: "isFao",
                              value: false,
                            });
                            return openCliendIDsModal(state.PNo);
                          }
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!addNew}
                              onClick={() => {
                                openCliendIDsModal(state.PNo);
                                dispatch({
                                  type: "UPDATE_FIELD",
                                  field: "isFao",
                                  value: false,
                                });
                              }}
                              edge="end"
                              color="secondary"
                            >
                              <PersonSearchIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                        label="PN/Client ID"
                      />
                    </FormControl>
                  )}
                  <TextField
                    required
                    variant="outlined"
                    size="small"
                    label="Clients Name"
                    name="Name"
                    value={state.Name}
                    onChange={handleInputChange}
                    disabled={!addNew}
                    InputProps={{
                      readOnly: true,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        return openCliendIDsModal(state.PNo);
                      }
                    }}
                    sx={{
                      flex: 1,
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                </div>
              </Box>
            </form>
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "auto",
              flex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "auto",
              }}
            >
              <fieldset
                style={{
                  boxSizing: "border-box",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  position: "relative",
                  height: "420px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <legend>Particulars (Debit)</legend>
                <div style={{ display: "flex", marginBottom: "10px" }}>
                  <FormControl
                    sx={{
                      width: "150px",
                      marginRight: "10px",
                      minWidth: 150,
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                    }}
                  >
                    <InputLabel id="payment-check">Payment Type</InputLabel>
                    <Select
                      inputRef={paymentTypeRef}
                      disabled={!addNew}
                      labelId="payment-check"
                      value={debitState.payamentType}
                      onChange={handleDebitInputChange}
                      autoWidth
                      label="Payment Type"
                      size="small"
                      name="payamentType"
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                    >
                      <MenuItem
                        value={"CHK"}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            if (debitState.payamentType === "CHK") {
                              wait(150).then(() => {
                                pdcAddbtnRef.current?.focus()
                              })
                            } else {
                              wait(150).then(() => {
                                amountRef.current?.focus()
                              })
                            }
                          }
                        }}
                      >Check</MenuItem>
                      <MenuItem value={"CSH"} onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          if (debitState.payamentType === "CHK") {
                            wait(150).then(() => {
                              pdcAddbtnRef.current?.focus()
                            })
                          } else {
                            wait(150).then(() => {
                              amountRef.current?.focus()
                            })
                          }
                        }
                      }}>Cash</MenuItem>
                    </Select>
                  </FormControl>
                  {debitState.payamentType === "CHK" ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Button
                        disabled={!addNew}
                        startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                        variant="outlined"
                        sx={{
                          height: "30px",
                          fontSize: "11px",
                        }}
                        onClick={() => {
                          const getLastCheck_No: any = debit[debit.length - 1];
                          const newData = {
                            CheckIdx: "",
                            BankName: "",
                            BankCode: "",
                            Branch: "",
                            Check_Date: new Date(),
                            Check_No: incrementCheckNo(getLastCheck_No?.Check_No),
                            Check_Amnt: "",
                            Check_Remarks: "",
                            CheckMode: "add",
                          };
                          setNewStateValue(modalDispatch, newData);
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkNoRef.current?.focus();
                        }}
                        ref={pdcAddbtnRef}
                      >
                        Add PDC Check
                      </Button>
                      <LoadingButton
                        sx={{
                          height: "30px",
                          fontSize: "11px",
                        }}
                        loading={
                          paymentTypeLoading || isLoadingModalSearchCheckList
                        }
                        disabled={!addNew}
                        onClick={() => {
                          mutateClientCheckedList({
                            PNo: state.PNo,
                            searchCheckedList: state.searchCheckedList,
                          });
                        }}
                        startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                        variant="outlined"
                        color="success"
                      >
                        Add Check From PDC Entry
                      </LoadingButton>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        inputRef={amountRef}
                        disabled={!addNew || debitState.cashMode === ""}
                        name="amount"
                        label="Amount"
                        size="small"
                        value={debitState.amount}
                        onChange={handleDebitInputChange}
                        placeholder="0.00"
                        InputProps={{
                          inputComponent: NumericFormatCustom as any,
                          style: { height: "27px", fontSize: "14px" },
                        }}
                        sx={{
                          width: "160px",
                          ".MuiFormLabel-root": { fontSize: "14px" },
                          ".MuiFormLabel-root[data-shrink=false]": {
                            top: "-5px",
                          },
                        }}
                        onBlur={() => {
                          debitDispatch({
                            type: "UPDATE_FIELD",
                            field: "amount",
                            value: parseFloat(
                              debitState.amount.replace(/,/g, "")
                            ).toFixed(2),
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            cashButtonSave.current?.click();
                          }
                        }}
                      />
                      {debitState.cashMode === "" ? (
                        <Button
                          sx={{
                            height: "30px",
                            fontSize: "11px",
                          }}
                          variant="outlined"
                          onClick={() => {
                            debitDispatch({
                              type: "UPDATE_FIELD",
                              field: "cashID",
                              value: "",
                            });
                            debitDispatch({
                              type: "UPDATE_FIELD",
                              field: "cashMode",
                              value: "add",
                            });
                          }}
                        >
                          Add Cash
                        </Button>
                      ) : (
                        <LoadingButton
                          sx={{
                            height: "30px",
                            fontSize: "11px",
                          }}
                          ref={cashButtonSave}
                          loading={paymentTypeLoading}
                          variant="outlined"
                          color="success"
                          disabled={!addNew}
                          onClick={() => {
                            if (
                              parseFloat(debitState.amount.replace(/,/g, "")) <=
                              0 ||
                              isNaN(
                                parseFloat(debitState.amount.replace(/,/g, ""))
                              )
                            ) {
                              amountRef.current?.focus();
                              return Swal.fire({
                                position: "center",
                                icon: "warning",
                                title: "Please provide amount!",
                                showConfirmButton: false,
                                timer: 1500,
                              });
                            }
                            let temp_id = "";
                            debitState.amount = parseFloat(
                              debitState.amount.replace(/,/g, "")
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });

                            myAxios
                              .post(
                                `/task/accounting/get-drcode-drtitle-from-collection`,
                                { code: debitState.payamentType },
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${user?.accessToken}`,
                                  },
                                }
                              )
                              .then((res) => {
                                const { Acct_Code, Acct_Title } =
                                  res?.data.data[0];
                                setDebit((d: any) => {
                                  temp_id = generateID(
                                    d.length > 0
                                      ? (d[d.length - 1] as any).temp_id
                                      : "0"
                                  );

                                  if (debitState.cashMode === "edit") {
                                    d = d.filter(
                                      (itms: any) =>
                                        itms.temp_id !== debitState.cashID
                                    );
                                    temp_id = debitState.cashID;
                                  }

                                  const data = {
                                    Payment: "Cash",
                                    Amount: debitState.amount,
                                    Check_No: "",
                                    Check_Date: "",
                                    Bank_Branch: "",
                                    Acct_Code,
                                    Acct_Title,
                                    Deposit_Slip: "",
                                    Cntr: "",
                                    Remarks: "",
                                    TC: debitState.payamentType,
                                    Bank: "",
                                    BankName: "",
                                    Check_Remarks: "",
                                    Branch: "",
                                    temp_id,
                                  };

                                  d = [...d, data];
                                  d.sort((a: any, b: any) => {
                                    const idA = parseInt(a.temp_id, 10);
                                    const idB = parseInt(b.temp_id, 10);
                                    if (idA < idB) {
                                      return -1;
                                    }
                                    if (idA > idB) {
                                      return 1;
                                    }
                                    return 0;
                                  });
                                  return d;
                                });
                                debitDispatch({
                                  type: "UPDATE_FIELD",
                                  field: "amount",
                                  value: parseFloat(
                                    "0".replace(/,/g, "")
                                  ).toFixed(2),
                                });
                                debitDispatch({
                                  type: "UPDATE_FIELD",
                                  field: "cashID",
                                  value: "",
                                });
                                debitDispatch({
                                  type: "UPDATE_FIELD",
                                  field: "cashMode",
                                  value: "add",
                                });
                                tableDebit.current?.resetTableSelected();
                              });
                          }}
                        >
                          Save Debit
                        </LoadingButton>
                      )}
                    </div>
                  )}
                </div>
                <UpwardTable
                  isLoading={loadingAddNew || loadingCollectionDataSearch}
                  ref={tableDebit}
                  rows={debit}
                  column={debitColumn}
                  width={width}
                  height={height}
                  dataReadOnly={true}
                  onSelectionChange={(selectedRow) => {
                    const rowSelected = selectedRow[0];
                    if (selectedRow.length > 0) {
                      DebitSelectedChange(rowSelected);
                    } else {
                      modalDispatch({
                        type: "UPDATE_FIELD",
                        field: "CheckIdx",
                        value: "",
                      });
                      modalDispatch({
                        type: "UPDATE_FIELD",
                        field: "CheckMode",
                        value: "",
                      });
                      debitDispatch({
                        type: "UPDATE_FIELD",
                        field: "cashID",
                        value: "",
                      });
                      debitDispatch({
                        type: "UPDATE_FIELD",
                        field: "cashMode",
                        value: "",
                      });
                      debitDispatch({
                        type: "UPDATE_FIELD",
                        field: "amount",
                        value: "0.00",
                      });
                    }
                  }}
                  onKeyDown={(row, key) => {
                    if (key === "Delete" || key === "Backspace") {
                      const rowSelected = row[0];
                      Swal.fire({
                        title: "Are you sure?",
                        text: `You won't to delete this?`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, delete it!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          return setDebit((d) => {
                            d = d.filter((item: any) => {
                              return item.temp_id !== rowSelected.temp_id;
                            });
                            return d;
                          });
                        }
                      });
                    }
                  }}
                  inputsearchselector=".manok"
                />
                <div style={{ width: "100%", marginTop: "20px" }}>
                  <DebitFooterComponent />
                </div>

              </fieldset>
              <br />
              <fieldset
                style={{
                  boxSizing: "border-box",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  position: "relative",
                  height: "460px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <legend>Payment Breakdown (Credit)</legend>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexDirection: "column",
                    marginBottom: "10px"
                  }}
                >
                  {/* <div style={{ display: "flex", gap: "10px" }}>
                    {paymentTypeLoading ? (
                      <LoadingButton loading={paymentTypeLoading} />
                    ) : (
                      <Autocomplete
                        freeSolo
                        options={debitState.transaction_desc}
                        value={creditState.transaction}
                        onChange={(e, v: any) => {
                          if (v) {
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "Code",
                              value: v.Acct_Code,
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "Title",
                              value: v.Acct_Title,
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "TC",
                              value: v.Code,
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "transaction",
                              value: v.label,
                            });
                          } else {
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "Code",
                              value: "",
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "Title",
                              value: "",
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "TC",
                              value: "",
                            });
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field: "transaction",
                              value: "",
                            });
                          }
                        }}
                        onInput={(e: any) => {
                          creditDispatch({
                            type: "UPDATE_FIELD",
                            field: "transaction",
                            value: e.target.value,
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // inputRef={(input) => {
                            //   creditTransactionRef = input;
                            // }}
                            InputProps={{
                              ...params.InputProps,
                              inputRef: creditTransactionRef,
                              style: { height: "27px", fontSize: "14px" },
                            }}
                            label="Transaction"
                          />
                        )}
                        sx={{
                          flex: 1,
                          ".MuiFormLabel-root": {
                            fontSize: "14px",
                          },
                          ".MuiInputBase-input": {
                            width: "100% !important",
                          },
                          ".MuiFormLabel-root[data-shrink=false]": {
                            top: "-5px",
                          },
                          ".MuiAutocomplete-input ": {
                            position: "absolute",
                          },
                        }}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            wait(150).then(() => {
                              creditAmountRef.current?.focus()
                            })
                          }
                        }}
                        size="small"
                        disabled={!addNew}
                      />
                    )}
                    <TextField
                      disabled={!addNew}
                      name="amount"
                      label="Amount"
                      size="small"
                      value={creditState.amount}
                      onChange={handleCreditInputChange}
                      placeholder="0.00"
                      InputProps={{
                        inputComponent: NumericFormatCustom as any,
                        inputRef: creditAmountRef,
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      onBlur={() => {
                        creditDispatch({
                          type: "UPDATE_FIELD",
                          field: "amount",
                          value: parseFloat(
                            creditState.amount.replace(/,/g, "")
                          ).toFixed(2),
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          creditFaoRef.current?.focus()
                        }
                      }}
                      sx={{
                        width: "160px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                    />
                    {isLoadingCreditClientIdsModal ?
                      <LoadingButton loading={isLoadingCreditClientIdsModal} />
                      :
                      <FormControl
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
                        variant="outlined"
                        size="small"
                        disabled={!addNew}
                      >
                        <InputLabel htmlFor="fao">FAO</InputLabel>
                        <OutlinedInput
                          sx={{
                            height: "27px",
                            fontSize: "14px",
                          }}
                          inputRef={creditFaoRef}
                          name="FAO_Name"
                          value={creditState.FAO_Name}
                          onChange={handleCreditInputChange}
                          id="fao"
                          onKeyDown={(e) => {
                            if (e.code === "Enter" || e.code === "NumpadEnter") {
                              dispatch({
                                type: "UPDATE_FIELD",
                                field: "isFao",
                                value: true,
                              });
                              return openCreditCliendIDsModal(creditState.FAO_Name);
                            }
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                disabled={!addNew}
                                onClick={() => {
                                  dispatch({
                                    type: "UPDATE_FIELD",
                                    field: "isFao",
                                    value: true,
                                  });
                                  openCreditCliendIDsModal(creditState.FAO_Name);
                                }}
                                edge="end"
                                color="secondary"
                              >
                                <PersonSearchIcon />
                              </IconButton>
                            </InputAdornment>
                          }
                          label="FAO"
                        />
                      </FormControl>}
                    <TextField
                      disabled={!addNew}
                      name="remarks"
                      label="Remarks"
                      size="small"
                      value={creditState.remarks ?? ""}
                      onChange={handleCreditInputChange}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          vatRef.current.focus()
                        }
                      }}
                      InputProps={{
                        style: { height: "27px", fontSize: "14px" },
                        inputRef: creditRemarksRef
                      }}
                      sx={{
                        width: "160px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                    />
                  </div> */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        columnGap: "10px",
                      }}
                    >
                      <FormControl
                        sx={{
                          width: "150px",
                          marginRight: "10px",
                          minWidth: 150,
                          ".MuiFormLabel-root": {
                            fontSize: "14px",
                            background: "white",
                            zIndex: 99,
                            padding: "0 3px",
                          },
                          ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                        }}
                      >
                        <InputLabel id="payment-check">VAT Type</InputLabel>
                        <Select
                          inputRef={vatRef}
                          disabled={!addNew}
                          labelId="payment-check"
                          value={creditState.option}
                          onChange={handleCreditInputChange}
                          autoWidth
                          label="VAT Type"
                          size="small"
                          name="option"
                          sx={{
                            height: "27px",
                            fontSize: "14px",
                          }}
                        >
                          <MenuItem
                            value={"Vat"}
                            onKeyDown={(e) => {
                              if (e.code === "Enter" || e.code === "NumpadEnter") {
                                wait(150).then(() => {
                                  creditInvoiceRef.current?.focus()
                                })
                              }
                            }}
                          >VAT</MenuItem>
                          <MenuItem value={"Non-Vat"} onKeyDown={(e) => {
                            if (e.code === "Enter" || e.code === "NumpadEnter") {
                              wait(150).then(() => {
                                creditInvoiceRef.current?.focus()
                              })
                            }
                          }}>Non-VAT</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        disabled={!addNew || creditState.creditMode === ""}
                        name="invoice"
                        label="Invoice"
                        size="small"
                        value={creditState.invoice}
                        onChange={handleCreditInputChange}
                        InputProps={{
                          inputRef: creditInvoiceRef,
                          style: { height: "27px", fontSize: "14px" },
                        }}
                        sx={{
                          width: "300px",
                          ".MuiFormLabel-root": { fontSize: "14px" },
                          ".MuiFormLabel-root[data-shrink=false]": {
                            top: "-5px",
                          },
                        }}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            const timeout = setTimeout(() => {
                              creditSaveButton.current?.click();
                              clearTimeout(timeout);
                            }, 100);
                          }
                        }}
                      />
                      {creditState.creditMode === "" ? (
                        <Button
                          sx={{
                            height: "30px",
                            fontSize: "11px",
                          }}
                          variant="outlined"
                          onClick={() => {
                            Object.entries(initialStateCredit).forEach(
                              ([field, value]) => {
                                creditDispatch({
                                  type: "UPDATE_FIELD",
                                  field,
                                  value,
                                });
                              }
                            );
                          }}
                        >
                          NEW
                        </Button>
                      ) : (
                        <Button
                          disabled={!addNew || creditState.creditMode === ""}

                          ref={creditSaveButton}
                          sx={{
                            height: "30px",
                            fontSize: "11px",
                          }}
                          color="success"
                          variant="outlined"
                          onClick={() => {
                            if (
                              creditState.transaction === "" ||
                              creditState.transaction === null ||
                              creditState.transaction === undefined
                            ) {
                              return CustomSwalAlertWarning(
                                "Please select a transaction!",
                                () => {
                                  wait(300).then(() => {
                                    creditTransactionRef.current?.focus();
                                  });
                                }
                              );
                            }

                            if (
                              debitState.transaction_desc.filter(
                                (item: any) =>
                                  item.label === creditState.transaction
                              ).length <= 0
                            ) {
                              return CustomSwalAlertWarning(
                                "Transaction not yet defined!",
                                () => {
                                  wait(300).then(() => {
                                    creditTransactionRef.current?.focus();
                                  });
                                }
                              );
                            }
                            if (
                              parseFloat(creditState.amount.replace(/,/g, "")) <=
                              0 ||
                              isNaN(
                                parseFloat(creditState.amount.replace(/,/g, ""))
                              )
                            ) {
                              return CustomSwalAlertWarning(
                                "Please provide amount!",
                                () => {
                                  wait(300).then(() => {
                                    creditAmountRef.current?.focus();
                                  });
                                }
                              );
                            }
                            if (creditState.FAO_ID === "") {
                              return CustomSwalAlertWarning(
                                "Please provide FAO!",
                                () => {
                                  wait(300).then(() => {
                                    creditFaoRef.current?.focus();
                                  });
                                }
                              );
                            }
                            if (creditState.invoice === "") {
                              return CustomSwalAlertWarning(
                                "Please provide invoice!",
                                () => {
                                  wait(300).then(() => {
                                    creditInvoiceRef.current?.focus();
                                  });
                                }
                              );
                            }

                            if (creditState.invoice.length >= 200) {
                              return CustomSwalAlertWarning(
                                "Invoice is too long!",
                                () => { }
                              );
                            }
                            if (creditState.FAO_ID.length >= 200) {
                              return CustomSwalAlertWarning(
                                "ID is too long!",
                                () => { }
                              );
                            }
                            if (creditState.remarks.length >= 200) {
                              return CustomSwalAlertWarning(
                                "Remarks is too long!",
                                () => { }
                              );
                            }
                            if (creditState.amount.length >= 200) {
                              return CustomSwalAlertWarning(
                                "Amount is too long!",
                                () => { }
                              );
                            }

                            function onSaveTransaction() {
                              creditState.amount = parseFloat(
                                creditState.amount
                              ).toLocaleString("en-US", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              });
                              const temp_id =
                                parseInt(
                                  credit.length <= 0
                                    ? "0"
                                    : (credit[credit.length - 1] as any).temp_id
                                ) + 1;

                              const creditData = {
                                transaction: creditState.transaction,
                                amount: creditState.amount,
                                Remarks: creditState.remarks,
                                Code: creditState.Code,
                                Title: creditState.Title,
                                TC: creditState.TC,
                                Account_No: creditState.FAO_ID,
                                Name: creditState.FAO_Name,
                                VATType: creditState.option,
                                invoiceNo: creditState.invoice,
                              };
                              setCredit((d: any) => {
                                if (creditState.creditMode === "add") {
                                  d = [...d, { temp_id, ...creditData }];
                                  return d;
                                } else {
                                  const data = d.map((obj: any) => {
                                    if (obj.temp_id === creditState.creditId) {
                                      obj = { ...obj, ...creditData };
                                    }
                                    return obj;
                                  });
                                  return data;
                                }
                              });
                              if (creditState.option === "Vat") {
                                const taxableAmt =
                                  parseFloat(
                                    creditState.amount.replace(/,/g, "")
                                  ) / 1.12;
                                const inputTax = taxableAmt * 0.12;
                                const newD = debitState.transaction_desc.filter(
                                  (item: any) => item.label === "Output Tax"
                                )[0];
                                const creditDataVat = {
                                  temp_id: temp_id + 1,
                                  transaction: "Output Tax",
                                  amount: inputTax.toFixed(2),
                                  Remarks: creditState.remarks,
                                  Code: newD.Acct_Code,
                                  Title: newD.Acct_Title,
                                  TC: newD.Code,
                                  Account_No: creditState.FAO_ID,
                                  Name: creditState.FAO_Name,
                                  VATType: creditState.option,
                                  invoiceNo: creditState.invoice,
                                };
                                setCredit((d: any) => {
                                  d = [...d, creditDataVat];
                                  return d;
                                });
                              }
                              Swal.fire({
                                text:
                                  creditState.creditMode === "edit"
                                    ? "Update Successfully"
                                    : "Create Successfully",
                                icon: "success",
                                showCancelButton: false,
                                timer: 1500,
                              }).then(() => {
                                setNewStateValue(
                                  creditDispatch,
                                  initialStateCredit
                                );
                                tableCredit.current.resetTableSelected();
                              });
                            }
                            if (creditState.creditMode === "edit") {
                              return Swal.fire({
                                title: "Are you sure?",
                                text: `You won't to update this?`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Yes, update it!",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  return onSaveTransaction();
                                }
                              });
                            } else {
                              onSaveTransaction();
                            }
                          }}
                        >
                          Save Credit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <UpwardTable
                  isLoading={loadingAddNew || loadingCollectionDataSearch}
                  ref={tableCredit}
                  rows={credit}
                  column={creditColumn}
                  width={width}
                  height={height}
                  dataReadOnly={true}
                  onSelectionChange={(selectedRow) => {
                    const rowSelected = selectedRow[0];
                    if (selectedRow.length > 0) {
                      const updateData = {
                        creditMode: "edit",
                        creditId: rowSelected.temp_id,
                        transaction: rowSelected.transaction,
                        amount: rowSelected.amount,
                        remarks: rowSelected.Remarks,
                        Code: rowSelected.Code,
                        Title: rowSelected.Title,
                        TC: rowSelected.TC,
                        FAO_ID: rowSelected.Account_No,
                        FAO_Name: rowSelected.Name,
                        option: rowSelected.VATType,
                        invoice: rowSelected.invoiceNo,
                      };
                      setNewStateValue(creditDispatch, updateData);
                    } else {
                      Object.entries(initialStateCredit).forEach(
                        ([field, value]) => {
                          creditDispatch({
                            type: "UPDATE_FIELD",
                            field,
                            value,
                          });
                        }
                      );
                    }
                  }}

                  onKeyDown={(row, key) => {
                    if (key === "Delete" || key === "Backspace") {
                      const rowSelected = row[0];
                      Swal.fire({
                        title: "Are you sure?",
                        text: `You won't to delete this?`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, delete it!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          return setCredit((d) => {
                            d = d.filter((item: any) => {
                              return item.temp_id !== rowSelected.temp_id;
                            });
                            return d;
                          });
                        }
                      });
                    }
                  }}
                  inputsearchselector=".manok"
                />
                <div style={{ width: "100%", marginTop: "10px" }}>
                  <CreditFooterComponent />
                </div>
                {/* <div
                style={{
                  marginTop: "10px",
                  width: "100%",
                  position: "relative",
                }}
              >
                <Box
                  style={{
                    height: "410px",
                    width: "100%",
                    overflowX: "scroll",
                    position: "absolute",
                  }}
                >
                  <Table
                    ref={tableCredit}
                    isLoading={loadingAddNew || loadingCollectionDataSearch}
                    columns={creditColumn}
                    rows={credit}
                    table_id={"temp_id"}
                    isSingleSelection={true}
                    isRowFreeze={false}
                    dataSelection={(selection, data, code) => {
                      const rowSelected = data.filter(
                        (item: any) => item.temp_id === selection[0]
                      )[0];
                      if (
                        rowSelected === undefined ||
                        rowSelected.length <= 0
                      ) {
                        Object.entries(initialStateCredit).forEach(
                          ([field, value]) => {
                            creditDispatch({
                              type: "UPDATE_FIELD",
                              field,
                              value,
                            });
                          }
                        );
                        return;
                      }
                      const updateData = {
                        creditMode: "edit",
                        creditId: rowSelected.temp_id,
                        transaction: rowSelected.transaction,
                        amount: rowSelected.amount,
                        remarks: rowSelected.Remarks,
                        Code: rowSelected.Code,
                        Title: rowSelected.Title,
                        TC: rowSelected.TC,
                        FAO_ID: rowSelected.Account_No,
                        FAO_Name: rowSelected.Name,
                        option: rowSelected.VATType,
                        invoice: rowSelected.invoiceNo,
                      };
                      setNewStateValue(creditDispatch, updateData);

                      if (code === "Delete" || code === "Backspace") {
                        Swal.fire({
                          title: "Are you sure?",
                          text: `You won't to delete this?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Yes, delete it!",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            return setCredit((d) => {
                              d = d.filter((item: any) => {
                                return item.temp_id !== rowSelected.temp_id;
                              });
                              return d;
                            });
                          }
                        });
                      }
                    }}
                    footerChildren={() => {
                      return <CreditFooterComponent />;
                    }}
                    footerPaginationPosition={"left-right"}
                    showFooterSelectedCount={false}
                  />
                </Box>
              </div> */}
              </fieldset>
            </div>
          </div>
          {ModalClientIDs}
          {ModalSearchCollection}
          {ModalSearchBanks}
          {ModalSearchCheckList}
          {ModalCreditClientIDs}
          <Modal
            open={openPdcInputModal}
            onClose={() => {
              setOpenPdcInputModal(false);
              tableDebit.current?.resetTableSelected();
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 700,
                bgcolor: "background.paper",
                p: 4,
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Check Detail
              </Typography>
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <TextField
                    required
                    variant="outlined"
                    size="small"
                    label="Check No."
                    name="Check_No"
                    value={modalState.Check_No}
                    onChange={handleModalInputChange}
                    disabled={!addNew || modalState.CheckIdx !== ""}
                    onKeyDown={(e: any) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        if (checkBankRef.current) {
                          checkBankRef.current.focus()
                        }
                      }
                    }}
                    InputProps={{
                      style: { height: "27px", fontSize: "14px" },
                      inputRef: checkNoRef,
                    }}
                    sx={{
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                  {isLoadingModalSearchbanks ? (
                    <LoadingButton loading={isLoadingModalSearchbanks} />
                  ) : (
                    <FormControl
                      sx={{
                        width: "100%",
                        ".MuiFormLabel-root": {
                          fontSize: "14px",
                          background: "white",
                          zIndex: 99,
                          padding: "0 3px",
                        },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={!addNew}
                    >
                      <InputLabel htmlFor="label-input-id">Bank</InputLabel>
                      <OutlinedInput
                        sx={{
                          height: "27px",
                          fontSize: "14px",
                        }}
                        inputRef={checkBankRef}
                        disabled={!addNew}
                        fullWidth
                        label="Bank"
                        name="BankName"
                        value={modalState.BankName}
                        onChange={handleModalInputChange}
                        onKeyDown={(e) => {
                          if (e.code === "Enter" || e.code === "NumpadEnter") {
                            return openModalSearchBanks(modalState.BankName);
                          }
                        }}
                        id="label-input-id"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!addNew}
                              aria-label="search-client"
                              color="secondary"
                              edge="end"
                              onClick={() =>
                                openModalSearchBanks(modalState.BankName)
                              }
                            >
                              <PolicyIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  )}
                  <TextField
                    required
                    variant="outlined"
                    size="small"
                    label="Branch"
                    name="Branch"
                    value={modalState.Branch}
                    onChange={handleModalInputChange}
                    disabled={!addNew}
                    onKeyDown={(e: any) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        if (checkRemakrsRef.current) {
                          checkRemakrsRef.current.focus()
                        }
                      }
                    }}
                    InputProps={{
                      style: { height: "27px", fontSize: "14px" },
                      inputRef: checkBranchRef,
                    }}
                    sx={{
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                  <TextField
                    required
                    variant="outlined"
                    size="small"
                    label="Remarks"
                    name="Check_Remarks"
                    value={modalState.Check_Remarks}
                    onChange={handleModalInputChange}
                    disabled={!addNew}
                    rows={4}
                    multiline
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && e.shiftKey) {
                        return
                      }

                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        e.preventDefault();
                        if (checkDateRef.current) {
                          checkDateRef.current.focus()
                        }
                      }
                    }}
                    InputProps={{
                      style: { height: "auto", fontSize: "14px" },
                      inputRef: checkRemakrsRef,

                    }}
                    sx={{
                      flex: 1,
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexDirection: "column",
                  }}
                >
                  <CustomDatePicker
                    disabled={!addNew}
                    label="Check Dated"
                    onChange={(value: any) => {
                      modalDispatch({
                        type: "UPDATE_FIELD",
                        field: "Check_Date",
                        value: value,
                      });
                    }}
                    onKeyDown={(e: any) => {

                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        e.preventDefault();
                        if (checkAmountRef.current) {
                          checkAmountRef.current.focus()
                        }
                      }
                    }}
                    value={new Date(modalState.Check_Date)}
                    inputRef={checkDateRef}
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
                    required
                    variant="outlined"
                    size="small"
                    label="Amount"
                    name="Check_Amnt"
                    value={modalState.Check_Amnt}
                    onChange={handleModalInputChange}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        const timeout = setTimeout(() => {
                          checkModalSaveButton.current?.click();
                          clearTimeout(timeout);
                        }, 100);
                      }
                    }}
                    disabled={!addNew}
                    placeholder="0.00"
                    InputProps={{
                      style: { height: "27px", fontSize: "14px" },
                      inputComponent: NumericFormatCustom as any,
                      inputRef: checkAmountRef,
                    }}
                    sx={{
                      flex: 1,
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                    onBlur={() => {
                      modalDispatch({
                        type: "UPDATE_FIELD",
                        field: "Check_Amnt",
                        value: parseFloat(
                          modalState.Check_Amnt.replace(/,/g, "")
                        ).toFixed(2),
                      });
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  gap: "20px",
                }}
              >
                <Button
                  ref={checkModalSaveButton}
                  action={checkModalSaveActionButtonRef}
                  color="success"
                  variant="contained"
                  autoFocus={modalState.CheckIdx !== ""}
                  onClick={() => {
                    if (modalState.Check_No === "") {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Please provide check!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkNoRef.current?.focus();
                        }
                      );
                    }
                    if (
                      parseFloat(modalState.Check_Amnt.replace(/,/g, "")) <= 0 ||
                      isNaN(parseFloat(modalState.Check_Amnt.replace(/,/g, "")))
                    ) {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Please provide check amount!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkAmountRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.BankName === "") {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Please provide bank!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBankRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.Branch === "") {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Please provide branch!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBranchRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.BankName.length >= 200) {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Bank Name is too long!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBankRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.Branch.length >= 200) {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Branch is too long!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBranchRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.Check_No.length >= 200) {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Check No is too long!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBranchRef.current?.focus();
                        }
                      );
                    }
                    if (modalState.Check_Amnt.length >= 200) {
                      setOpenPdcInputModal(false);
                      return CustomSwalAlertWarning(
                        "Check Ammount is too long!",
                        (d) => {
                          flushSync(() => {
                            setOpenPdcInputModal(true);
                          });
                          checkBranchRef.current?.focus();
                        }
                      );
                    }

                    modalState.Check_Amnt = parseFloat(
                      modalState.Check_Amnt.replace(/,/g, "")
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });

                    function addPDCCheck() {
                      let temp_id = "";
                      myAxios
                        .post(
                          `/task/accounting/get-drcode-drtitle-from-collection`,
                          { code: debitState.payamentType },
                          {
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${user?.accessToken}`,
                            },
                          }
                        )
                        .then((res) => {
                          const { Acct_Code, Acct_Title } = res?.data.data[0];
                          setDebit((d: any) => {
                            temp_id = generateID(
                              d.length > 0
                                ? (d[d.length - 1] as any).temp_id
                                : "0"
                            );

                            if (modalState.CheckMode === "edit") {
                              d = d.filter(
                                (itms: any) =>
                                  itms.temp_id !== modalState.CheckIdx.toString()
                              );
                              temp_id = modalState.CheckIdx.toString();
                            }

                            const data = {
                              Payment: "Check",
                              Amount: modalState.Check_Amnt,
                              Check_No: modalState.Check_No,
                              Check_Date: new Date(
                                modalState.Check_Date
                              ).toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              }),
                              Bank_Branch: `${modalState.BankName} / ${modalState.Branch}`,
                              Acct_Code,
                              Acct_Title,
                              Deposit_Slip: "",
                              Cntr: "",
                              Remarks: modalState.Check_Remarks,
                              TC: debitState.payamentType,
                              temp_id: temp_id,
                              Bank: modalState.BankCode,
                              BankName: modalState.BankName,
                              Check_Remarks: modalState.Check_Remarks,
                              Branch: modalState.Branch,
                            };
                            d = [...d, data];
                            d.sort((a: any, b: any) => {
                              const idA = parseInt(a.temp_id, 10);
                              const idB = parseInt(b.temp_id, 10);
                              if (idA < idB) {
                                return -1;
                              }
                              if (idA > idB) {
                                return 1;
                              }
                              return 0;
                            });

                            return d;
                          });
                        });
                    }
                    if (modalState.CheckMode === "edit") {
                      flushSync(() => {
                        setOpenPdcInputModal(false);
                      });
                      return Swal.fire({
                        title:
                          "Are you sure? You want to Update this " +
                          modalState.Check_No +
                          " Check No.",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, update it!",
                        focusConfirm: true,
                      }).then((result) => {
                        if (result.isConfirmed) {
                          addPDCCheck();
                          Swal.fire({
                            text: "Update Successfully",
                            icon: "success",
                            showCancelButton: false,
                            timer: 1500,
                            didClose() {
                              flushSync(() => {
                                setOpenPdcInputModal(true);
                              });
                              checkModalSaveActionButtonRef.current?.focusVisible();
                              tableDebit.current?.resetTableSelected();
                            },
                          });
                        }
                      });
                    } else {
                      if (
                        debit.filter(
                          (item: any) => item.Check_No === modalState.Check_No
                        ).length > 0
                      ) {
                        flushSync(() => {
                          setOpenPdcInputModal(false);
                        });
                        return Swal.fire({
                          text: `${modalState.Check_No} is already Exist!`,
                          icon: "warning",
                          showCancelButton: false,
                          timer: 1500,
                        }).then(() => {
                          setOpenPdcInputModal(false);
                        });
                      }

                      addPDCCheck();
                      modalDispatch({
                        type: "UPDATE_FIELD",
                        field: "Check_No",
                        value: incrementCheckNo(modalState.Check_No),
                      });
                      flushSync(() => {
                        setOpenPdcInputModal(false);
                      });
                      Swal.fire({
                        text: "Create New Check Successfully",
                        icon: "success",
                        showCancelButton: false,
                        timer: 1500,
                        didClose() {
                          flushSync(() => {
                            setOpenPdcInputModal(false);
                          });
                          checkModalSaveActionButtonRef.current?.focusVisible();
                          tableDebit.current?.resetTableSelected();
                        },
                      });
                      return;
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  color="warning"
                  variant="contained"
                  onClick={() => {
                    setOpenPdcInputModal(false);
                    tableDebit.current?.resetTableSelected();
                  }}
                >
                  Cancel
                </Button>
                {modalState.CheckIdx !== "" && (
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      flushSync(() => {
                        setOpenPdcInputModal(false);
                      });
                      DebitDeleteRow({
                        Check_No: modalState.Check_No,
                        temp_id: modalState.CheckIdx,
                      });
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Box>
          </Modal>
        </CollectionContext.Provider>
        {(loadingAddNew || isLoadingModalSearchCollection) && <div className="loading-component"><div className="loader"></div></div>}
      </div>
    </>
  );
}

export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
function DebitFooterComponent() {
  const { debit } = useContext(CollectionContext);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <strong style={{ fontSize: "14px" }}>
        Total:{" "}
        {debit
          .reduce(
            (sum, obj) => sum + parseFloat(obj.Amount.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </strong>
    </Box>
  );
}
function CreditFooterComponent() {
  const { credit } = useContext(CollectionContext);
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <strong style={{ fontSize: "14px" }}>
        Total:{" "}
        {credit
          .reduce(
            (sum, obj) => sum + parseFloat(obj.amount.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </strong>
    </Box>
  );
}
function generateID(prevID: string) {
  const nextID = parseInt(prevID, 10) + 1;
  return String(nextID).padStart(3, "0");
}
