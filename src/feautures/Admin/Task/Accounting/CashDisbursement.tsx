import { useReducer, useContext, useState, useRef, useEffect, useMemo } from "react";
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
import { flushSync } from "react-dom";
import SaveIcon from "@mui/icons-material/Save";
import { UpwardTable } from "../../../../components/UpwardTable";
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";
import { format } from "date-fns";
import "../../../../style/datagridview.css"

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

const columns = [
  {
    key: "code", label: "Code", width: 150, type: 'text'
  },
  {
    key: "acctName", label: "Account Name", width: 300, type: 'text'
  },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 170,
    type: 'text'

  },
  {
    key: "ClientName", label: "Name", width: 300, type: 'text'

  },
  {
    key: "debit", label: "Debit", width: 80, type: 'number'

  },
  {
    key: "credit", label: "Credit", width: 100, type: 'number'
  },
  {
    key: "checkNo", label: "Check No", width: 80, type: 'text'
  },
  {
    key: "checkDate", label: "Check Date", width: 100, type: 'date'
  },
  {
    key: "TC_Code", label: "TC", width: 100, type: 'text'
  },
  {
    key: "remarks",
    label: "Remarks",
    width: 300,
    type: 'text'
  },
  {
    key: "Payto", label: "Payto", width: 300, type: 'text'
  },
  {
    key: "vatType", label: "Vat Type", width: 100, type: 'select', options: ['NON-VAT', 'VAT', '']
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
  }
];


const EditableTable = () => {
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const refNoRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const expRef = useRef<HTMLInputElement>(null)
  const particularRef = useRef<HTMLTextAreaElement>(null)

  const IdsSearchInput = useRef<HTMLInputElement>(null)
  const chartAccountSearchInput = useRef<HTMLInputElement>(null)
  const [showDialog ,setShowDialog] = useState(false)
  const [mode ,setMode] = useState('add')
  const [cashDMode ,setCashDMode] = useState('')
  const [data, setData] = useState([]);
  const column = columns.filter((itm)=>!itm.hide)
  const defaultValue = columns.reduce((a:any,b)=>{
    a[b.key] = ''
    return a
  },{})


  const [rowEdited,setRowEdited] = useState<any>(null)
  const [isEdited,setIsEdited] = useState(null)
  const keys = Object.keys(data)

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
        type: "UPDATE_FIELD", field: "refNo", value:response.data.generatedId[0].id
      })
      dispatch({
        type: "UPDATE_FIELD", field: "sub_refNo", value:response.data.generatedId[0].id
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
        const RowIndex = Object.keys(rowEdited)[0]
        setData((d:any)=> {
          d = d.map((itm:any)=>{
            if(Object.keys(itm).includes(RowIndex)){
              itm = {[RowIndex]:{
                ...itm[RowIndex],
                code: selectedRowData[0].Acct_Code,
                acctName: selectedRowData[0].Acct_Title,
              }}
            }
            return itm
          })
          return d
        })
        setRowEdited((d:any)=>({
          [RowIndex]:{
            ...d[RowIndex],
            code: selectedRowData[0].Acct_Code,
            acctName: selectedRowData[0].Acct_Title,
          }
        }))
        wait(250).then(()=>{
            const input = document.querySelector(`.row-${RowIndex}.col-3`) as HTMLInputElement
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
      const RowIndex = Object.keys(rowEdited)[0]
      setData((d:any)=> {
        d = d.map((itm:any)=>{
          if(Object.keys(itm).includes(RowIndex)){
            itm = {[RowIndex]:{
              ...itm[RowIndex],
              ClientName: selectedRowData[0].Name,
              IDNo: selectedRowData[0].IDNo,
              subAcct: selectedRowData[0].sub_account,
              subAcctName: selectedRowData[0].ShortName,
              address: selectedRowData[0].address,
            }}
          }
          return itm
        })
        return d
      })
      setRowEdited((d:any)=>({
        [RowIndex]:{
          ...d[RowIndex],
          ClientName: selectedRowData[0].Name,
          IDNo: selectedRowData[0].IDNo,
          subAcct: selectedRowData[0].sub_account,
          subAcctName: selectedRowData[0].ShortName,
          address: selectedRowData[0].address,
        }
      }))
      wait(250).then(()=>{
          const input = document.querySelector(`.row-${RowIndex}.col-4`) as HTMLInputElement
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
      const RowIndex = Object.keys(rowEdited)[0]
      setData((d:any)=> {
        d = d.map((itm:any)=>{
          if(Object.keys(itm).includes(RowIndex)){
            itm = {[RowIndex]:{
              ...itm[RowIndex],
              TC_Code: selectedRowData[0].Code,
              TC_Desc: selectedRowData[0].Description,
            }}
          }
          return itm
        })
        return d
      })
      setRowEdited((d:any)=>({
        [RowIndex]:{
          ...d[RowIndex],
          TC_Code: selectedRowData[0].Code,
          TC_Desc: selectedRowData[0].Description,
        }
      }))
      wait(250).then(()=>{
          const input = document.querySelector(`.row-${RowIndex}.col-9`) as HTMLInputElement
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
      const RowIndex = Object.keys(rowEdited)[0]
      setData((d:any)=> {
        d = d.map((itm:any)=>{
          if(Object.keys(itm).includes(RowIndex)){
            itm = {[RowIndex]:{
              ...itm[RowIndex],
              Payto: selectedRowData[0].Name,
            }}
          }
          return itm
        })
        return d
      })
      setRowEdited((d:any)=>({
        [RowIndex]:{
          ...d[RowIndex],
          Payto: selectedRowData[0].Name,
        }
      }))
      wait(250).then(()=>{
          const input = document.querySelector(`.row-${RowIndex}.col-11`) as HTMLInputElement
          input?.focus()
      })
      closePolicyIdPayTo();
    },
    searchRef: IdsSearchInput,
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
      // getSearchSelectedCashDisbursement({
      //   Source_No: selectedRowData[0].Source_No,
      // });
      // handleInputChange({
      //   target: { value: "edit", name: "cashMode" },
      // });
      // setCashDisbursement([]);
      // setEditTransaction({
      //   edit: false,
      //   updateId: "",
      // });

      closeSearchCashDisbursement();
    },
    onCloseFunction: (value: any) => {
    //   dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: chartAccountSearchInput,
  });

  const handleInputchange = (RowIndex:any,col:any,e:any) =>{
    setRowEdited((d:any)=>({
      [RowIndex]:{
        ...d[RowIndex],
        [col.key]:e.target.value
      }
    }))
  }
  const onBlur = (row:any)=>{
    setRowEdited(row)
  }

  async function GoToNextRow(RowIndex:any){
    const newRowIndex:any = parseInt(RowIndex)  +1
    const nextRow:any  = Object.entries(data).filter((dd:any)=>{
      return dd[0] === newRowIndex.toString()
    })
 
      if(nextRow.length > 0){
            setRowEdited(nextRow[0][1])
            setIsEdited(newRowIndex.toString())

            setTimeout(()=>{
            const input = document.querySelector(`.row-${newRowIndex}.col-0`) as HTMLInputElement
            if(input){
                input.focus()
              }
          },100)
      }
  }

  async function SaveRow(RowIndex:any){
    const keys = Object.keys(data)
    const LastRowIndex = keys[keys.length -1]
    if(mode === 'add' && RowIndex ===  LastRowIndex){
      setShowDialog(true)
    }
  }

  function AddRow(){

    const keys = Object.keys(data)
    const NewRowIndex:any = String(isNaN(parseInt(keys[keys.length - 1]) + 1) ? 0 : parseInt(keys[keys.length - 1]) + 1)
    const dd:any = [...data,{
      [NewRowIndex]:defaultValue
    }]
    setData(dd)
    wait(250).then(()=>{
      setRowEdited(dd)
      setIsEdited(NewRowIndex)
      setTimeout(()=>{
        const input = document.querySelector(`.row-${NewRowIndex}.col-0`) as HTMLInputElement
        if(input){
            input.focus()
          }
      },100)
    })
  }

  const onColumnEnter = async (row:any,col:any,RowIndex:any,colIdx:any,e:any)=>{
    if(e.code === 'Enter' || e.code === 'NumpadEnter'){
      e.preventDefault()
            if(col.key === 'debit' || col.key === 'credit'){
              if(isNaN(parseInt(e.target.value))){
                e.target.value = "0.00"
              }
            }
            setData((d:any)=> {
                d = d.map((itm:any)=>{
                  if(Object.keys(itm).includes(RowIndex)){
                    itm = {[RowIndex]:{
                      ...itm[RowIndex],
                      [col.key]:e.target.value
                    }}
                  }
                  return itm
                })
                return d
              })
            if(col.key === 'code'){
              openChartAccountSearch(e.target.value)
            }
            else if(col.key === 'ClientName'){
              openPolicyIdClientIdRefId(e.target.value)
            }else if(col.key === 'Payto'){
              if(rowEdited[RowIndex].code === '1.01.10'){
                openPolicyIdPayTo(e.target.value)
              }
            }else if(col.key === 'TC_Code'){
              openTransactionAccount(e.target.value)
            }else if(rowEdited[RowIndex].code !== '1.01.10' && col.key === 'credit'){
              const input = document.querySelector(`.row-${RowIndex}.col-${colIdx + 3}`) as HTMLInputElement
              if(input){
                setTimeout(()=>{
                  input.focus()    
                },100)
              }
            }else if(rowEdited[RowIndex].code !== '1.01.10' && col.key === 'remarks'){
              const input = document.querySelector(`.row-${RowIndex}.col-${colIdx + 2}`) as HTMLInputElement
              if(input){
                setTimeout(()=>{
                  input.focus()    
                },100)
              }
            }else{
               const input = document.querySelector(`.row-${RowIndex}.col-${colIdx + 1}`) as HTMLInputElement
                if(input){
                  setTimeout(()=>{
                    input.focus()    
                  },100)

                }else{ 
                  const keys = Object.keys(data)
                  const LastRowIndex = keys[keys.length -1]
                  if(RowIndex === LastRowIndex){
                    if(col.key === 'invoice'){
                        await SaveRow(RowIndex)
                    }
                  }else{
                    if(col.key === 'invoice'){
                      await SaveRow(RowIndex)
                      await GoToNextRow(RowIndex)
                    }
                  }
              
                }
            }
           
      return
    }
  }
  const doubleClick = (RowIndex:any,row:any,col:any,e:any)=>{
    setRowEdited(row)
    setIsEdited(RowIndex)
  }

  useEffect(()=>{
    if(mode === 'add'){
      const keys = Object.keys(data)
      const NewRowIndex = String(isNaN(parseInt(keys[keys.length - 1]) + 1) ? 0 : parseInt(keys[keys.length - 1]) + 1)
      const dd:any = [...data,{
        [NewRowIndex]:defaultValue
      }]
      setData(dd)
    }
  },[mode])


  const isDisableField = cashDMode === "";

  if(loadingGeneralJournalGenerator || isLoadingPolicyIdClientIdRefId || isLoadingChartAccountSearch || isLoadingPolicyIdPayTo || isLoadingTransactionAccount){
    return <div>Loading...</div>
  }


  return (
    <div>
    {
      showDialog && 
      <MyDialog 
        onConfirmed={()=>{
          AddRow()
          setShowDialog(false)
        }} 
        onDeclined={()=>{
          setShowDialog(false)
        }} 
        onClose={()=>{
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
            loading={false}
            disabled={cashDMode === ""}
            // onClick={handleOnSave}
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
                    // refetchGeneralJournalGenerator();
                    // handleInputChange({
                    //   target: { value: "", name: "cashMode" },
                    // });
                    // setNewStateValue(dispatch, initialState);
                    // setCashDisbursement([]);
                    // // setSearchSelected(false);
                    // setEditTransaction({
                    //   edit: false,
                    //   updateId: "",
                    // });
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
            // onClick={handleVoid}
            loading={false}
            disabled={cashDMode !== "edit"}
            variant="contained"
            startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
          >
            Void
          </LoadingButton>
          <LoadingButton
            loading={false}
            disabled={cashDMode !== "edit"}
            id="basic-button"
            aria-haspopup="true"
            // onClick={handleClickPrint}
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
                value:state.refNo,
                name:"refNo",
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
              name:"dateEntry",
              value:state.dateEntry,
              style: { width: "190px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  expRef.current?.focus()
                }
              },
              onChange:(e)=>{
                dispatch({
                  type: "UPDATE_FIELD", field: "dateEntry", value:e.target.value
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
              name:"explanation",
              value:state.explanation,
              onChange:(e)=>{
                dispatch({
                  type: "UPDATE_FIELD", field: "explanation", value:e.target.value
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
              name:"particulars",
              value:state.particulars,
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  //  refDate.current?.focus()
                }
              },
              onChange:(e)=>{
                dispatch({
                  type: "UPDATE_FIELD", field: "particulars", value:e.target.value
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
      <div style={{width:"calc(100vw - 40px)",height:"300px", overflow:"auto",position:"relative"}}>
        <table style={{position:"absolute"}}>
          <thead>
            <tr>
            {
                column.map((itm,idx)=>{
                  return <th  key={idx} style={{width:itm.width ,border:"1px solid black"}}>{itm.label}</th>
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              data?.map((row:any,rowIdx)=>{
                const RowIndex = keys[rowIdx]
                return <tr  key={rowIdx}>
                  {
                    column.map((col,colIdx)=>{
                      if(isEdited  === RowIndex) {
                        if(col.type === 'number'){
                          return (
                            <td  
                            key={colIdx} 
                            id={`${col.key}_RowIndex`}
                            style={{
                              width:col.width,
                              border:"1px solid black"
                            }}>
                              <TextFormatedInput
                                label={{
                                  title: "",
                                  style: {
                                    width: "0px",
                                  },
                                }}
                                input={{
                                  className:`row-${RowIndex} col-${colIdx}`,
                                  type: "text",
                                  style: { width: col.width },
                                  onKeyDown:(e)=>{
                                    if(e.code === "NumpadEnter" || e.code === 'Enter'){
                                      onColumnEnter(row,col,RowIndex,colIdx,e)
                                    }
                                  },
                                  onChange:(e)=>{
                                    handleInputchange(RowIndex,col,e)
                                  },
                                  onBlur:(e)=>{
                                    onBlur(row)
                                  }
                                }}
                              />
                            </td>
                          )
                        }else if(col.type === 'select'){
                          return (
                            <td  
                            key={colIdx} 
                            id={`${col.key}_RowIndex`}
                            style={{
                              width:col.width,
                              border:"1px solid black"
                            }}>
                              <SelectInput
                                label={{
                                  title: "",
                                  style: {
                                    width: "0px",
                                  },
                                }}
                                select={{
                                  value:rowEdited[RowIndex][col.key] || "",
                                  className:`row-${RowIndex} col-${colIdx}`,
                                  style: { width:col.width, height: "22px" },
                                  onKeyDown:(e)=>{
                                    onColumnEnter(row,col,RowIndex,colIdx,e)
                                  },
                                  onBlur:(e)=>{
                                    onBlur(row)
                                  },
                                  onChange:(e)=>{
                                    handleInputchange(RowIndex,col,e)
                                  }
                                }}
                                datasource={[
                                  { key: "VAT" },
                                  { key: "Non-VAT" },
                                ]}
                                values={"key"}
                                display={"key"}
                              />
                            </td>
                          )
                        }else{
                          return (
                            <td  
                            key={colIdx} 
                            id={`${col.key}_RowIndex`}
                            style={{
                              width:col.width,
                              border:"1px solid black"
                            }}>
                               <TextInput
                                  label={{
                                    title: "",
                                    style: {
                                      width: "0px",
                                    },
                                  }}
                                  input={{
                                    readOnly:
                                      col.key === 'acctName' ||
                                      col.key === 'subAcctName' ||
                                      (col.key === 'checkNo' && rowEdited[RowIndex].code !== '1.01.10') ||
                                      (col.key === 'checkDate' && rowEdited[RowIndex].code !== '1.01.10') ||
                                      (col.key === 'Payto' && rowEdited[RowIndex].code !== '1.01.10') ,
                                    className:`row-${RowIndex} col-${colIdx}`,
                                    type:col.key === 'checkDate' && rowEdited[RowIndex].code === '1.01.10' ? "date" :"text",
                                    style: { width: col.width },
                                    onKeyDown: (e) => {
                                      onColumnEnter(row,col,RowIndex,colIdx,e)
                                    },
                                    onChange:(e)=>{
                                      handleInputchange(RowIndex,col,e)
                                    },
                                    onBlur:(e)=>{
                                      onBlur(row)
                                    },
                                    value:rowEdited[RowIndex][col.key] || ""
                                  }}
                                />
                            </td>
                          )
                        }
                      
                      }else{
                        return (
                          <td  
                          key={colIdx} 
                          id={`${col.key}_RowIndex`}
                          style={{
                            width:col.width,
                            border:"1px solid black"
                          }}>
                            <TextInput
                              label={{
                                title: "",
                                style: {
                                  width: "0px",
                                },
                              }}
                              input={{
                                readOnly:true,
                                onDoubleClick:(e)=>{
                                  doubleClick(RowIndex,row,col,e)
                                },
                                defaultValue:row[RowIndex][col.key],
                                style: { width: col.width },
                              }}
                            />
                              
                          </td>
                        
                  
                      )
                      }
                      
                    })
                  }
                </tr>
              })
            }
          </tbody>
        </table> 
      </div>
  
      {ModalPolicyIdClientIdRefId}
      {ModalChartAccountSearch}
      {ModalPolicyIdPayTo}
      {ModalTransactionAccount}
      {ModalSearchCashDisbursement}
    </div>
  );
};

const MyDialog = ({onConfirmed,onDeclined,onClose}:any)=>{
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    wait(200).then(()=>{
      confirmButtonRef.current?.focus()
    })
  },[])

  return (
    <>
      <div style={{
    position:"absolute",
    top:"55%",
    left:"50%",
    transform:"translate(-50%,-50%)",
    width:"300px",
    height:"auto",
    border:"1px solid #94a3b8",
    padding:"10px",
    borderRadius:"5px",
    boxShadow:"-1px 0px 10px -1px rgba(0,0,0,0.75)",
    zIndex:"2",
    background:"white"
    
  }}>
    <button 
      style={{
        background:"white",
        padding:'5px',
        margin:"0",
        position:"absolute",
        top:"5px",
        right:"5px"
      }}
      onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}
      >
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill="none">
          <g id="Menu / Close_LG">
          <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" 
          stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
    </button>
    <h2 style={{fontSize:"14px" ,textTransform:"uppercase", fontWeight:"bold"}}>Add New Row?</h2>
    <div>
      <button 
      ref={confirmButtonRef} 
      style={{padding:"5px 15px" ,background:"white",border:"none",color:"black"}}
      onKeyDown={(e)=>{
        if(e.code === 'ArrowRight'){
          cancelButtonRef.current?.focus()
        }
      }}
      onClick={(e)=>{
        e.preventDefault()
        onConfirmed()
      }}
      >Ok</button>
      <button 
      ref={cancelButtonRef} 
      style={{padding:"5px 15px" ,background:"white",border:"none",color:"black"}}
      onKeyDown={(e)=>{
        if(e.code === 'ArrowLeft'){
          confirmButtonRef.current?.focus()
        }
      }}
      onClick={(e)=>{
        e.preventDefault()
        onDeclined()
      }}
      >Cancel</button>
    </div>
  </div>
  <div 
    onClick={(e)=>{
      e.preventDefault()
      onClose()
    }} 
    style={{position:"absolute",top:0,left:0,bottom:0,right:0,background:"trnsparent",zIndex:"1"}}></div>
    </>
  )
}


export default  function CashDisbursement(){

  return (
    <div>
       <EditableTable />
    </div>
  )
}


// export default function CashDisbursement() {
//   const defaultValue = {
//     code: "",
//     acctName: "",
//     subAcctName: "",
//     ClientName: "",
//     debit: "",
//     credit: "",
//     checkNo: "",
//     checkDate: "",
//     TC_Code: "",
//     remarks: "",
//     Payto: "",
//     vatType: "",
//     invoice: "",
//     TempID: "",
//     IDNo: "",
//     BranchCode: "",
//     addres: "",
//   }
//   const [modalVisible, setModalVisible] = useState(false);
//   const [position, setPosition] = useState({ x: 0, y: 0 });

//   const [rigthClickSelected, setRigthClickSelected] = useState<any>(null);


//   const { myAxios, user } = useContext(AuthContext);
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const [openJobs, setOpenJobs] = useState(false);
//   const [isPayToEnter, setIsPayToEnter] = useState(false);
//   const [hasSelected, setHasSelected] = useState(false);
//   const [editTransaction, setEditTransaction] = useState({
//     edit: false,
//     updateId: "",
//   });

//   const [cashDisbursement, setCashDisbursement] = useState<any>([]);
//   const [newRowData, setNewRowData] = useState(defaultValue);
//   const [updateRowData, setUpdateRowData] = useState(defaultValue);
//   const [editCell, setEditCell] = useState({ TempID: null });



//   const queryClient = useQueryClient();
//   const explanationInputRef = useRef<HTMLInputElement>(null);


//   const idInputRef = useRef<HTMLInputElement>(null);
//   const vatRef = useRef<HTMLInputElement>(null);
//   const debitInputRef = useRef<HTMLInputElement>(null);
//   const tcInputRef = useRef<HTMLInputElement>(null);

//   const chartAccountSearchInput = useRef<HTMLInputElement>(null);
//   const IdsSearchInput = useRef<HTMLInputElement>(null);
//   const codeInputRef = useRef<HTMLInputElement>(null);


//   // new Ref
//   const _refNoRef = useRef<any>(null)
//   const refNoRef = useRef<HTMLInputElement>(null)
//   const dateRef = useRef<HTMLInputElement>(null)
//   const expRef = useRef<HTMLInputElement>(null)
//   const particularRef = useRef<HTMLTextAreaElement>(null)




//   const {
//     mutate: mutateOnPrint,
//     isLoading: isLoadingOnPrint,
//   } = useMutation({
//     mutationKey: "get-selected-search-general-journal",
//     mutationFn: async (variable: any) =>
//       await myAxios.post(
//         "/task/accounting/cash-disbursement/print",
//         variable,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       ),
//     onSuccess: (res) => {
//       const response = res as any;
//       console.log(response)
//       flushSync(() => {
//         localStorage.removeItem("printString");
//         localStorage.setItem("dataString", JSON.stringify(response.data.print.PrintTable));
//         localStorage.setItem("paper-width", "8.5in");
//         localStorage.setItem("paper-height", "11in");
//         localStorage.setItem("module", "cash-disbursement");
//         localStorage.setItem("state", JSON.stringify(response.data.print.PrintPayeeDetails));
//         localStorage.setItem(
//           "column",
//           JSON.stringify([
//             { datakey: "Account", header: "ACCOUNT", width: "200px" },
//             { datakey: "Identity", header: "IDENTITY", width: "277px" },
//             { datakey: "Debit", header: "DEBIT", width: "100px" },
//             { datakey: "Credit", header: "CREDIT", width: "100px" },
//           ])
//         );
//         localStorage.setItem(
//           "title",
//           user?.department === "UMIS"
//             ? "UPWARD MANAGEMENT INSURANCE SERVICES\n"
//             : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n"
//         );
//       });
//       window.open("/dashboard/print", "_blank");



//     },
//   });


//   const {
//     isLoading: loadingGeneralJournalGenerator,
//     refetch: refetchGeneralJournalGenerator,
//   } = useQuery({
//     queryKey: "general-journal-id-generator",
//     queryFn: async () =>
//       await myAxios.get(`/task/accounting/cash-disbursement/generate-id`, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//     refetchOnWindowFocus: false,
//     onSuccess: (data) => {
//       const response = data as any;
//       wait(100).then(() => {
//         if (refNoRef.current) {
//           refNoRef.current.value = response.data.generatedId[0].id
//           _refNoRef.current = response.data.generatedId[0].id
//         }
//         if (dateRef.current) {
//           dateRef.current.value = format(new Date(), "yyyy-MM-dd")
//         }
//       })

//       // dispatch({
//       //   type: "UPDATE_FIELD",
//       //   field: "refNo",
//       //   value: response.data.generatedId[0].id,
//       // });
//       // dispatch({
//       //   type: "UPDATE_FIELD",
//       //   field: "sub_refNo",
//       //   value: response.data.generatedId[0].id,
//       // });
//     },
//   });

//   const {
//     mutate: addCashDisbursementMutate,
//     isLoading: loadingCashDisbursementMutate,
//   } = useMutation({
//     mutationKey: "add-cash-disbursement",
//     mutationFn: async (variable: any) =>
//       await myAxios.post(
//         "/task/accounting/cash-disbursement/add-cash-disbursement",
//         variable,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       ),
//     onSuccess: (res) => {
//       const response = res as any;
//       if (response.data.success) {
//         queryClient.invalidateQueries("search-general-journal");
//         setHasSelected(false);
//         setNewStateValue(dispatch, initialState);
//         refetchGeneralJournalGenerator();
//         setCashDisbursement([]);
//         setEditTransaction({
//           edit: false,
//           updateId: "",
//         });

//         return Swal.fire({
//           position: "center",
//           icon: "success",
//           title: response.data.message,
//           timer: 1500,
//         });
//       }
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: response.data.message,
//         timer: 1500,
//       });
//     },
//   });

//   const { mutate: mutateJob, isLoading: isLoadingJob } = useMutation({
//     mutationKey: "jobs",
//     mutationFn: async (variable: any) =>
//       await myAxios.post("/task/accounting/general-journal/jobs", variable, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//     onSuccess: (res) => {
//       const response = res as any;
//       setCashDisbursement([]);
//       setCashDisbursement(response.data.jobs);
//       setOpenJobs(false);
//     },
//   });

//   const {
//     mutate: mutateVoidCashDisbursement,
//     isLoading: loadingVoidCashDisbursement,
//   } = useMutation({
//     mutationKey: "void-cash-disbursement",
//     mutationFn: async (variable: any) =>
//       await myAxios.post(
//         "/task/accounting/cash-disbursement/void-cash-disbursement",
//         variable,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       ),
//     onSuccess: (res) => {
//       const response = res as any;
//       if (response.data.success) {
//         queryClient.invalidateQueries("search-general-journal");
//         setHasSelected(false);
//         setNewStateValue(dispatch, initialState);
//         refetchGeneralJournalGenerator();
//         setCashDisbursement([]);
//         setEditTransaction({
//           edit: false,
//           updateId: "",
//         });
//         return Swal.fire({
//           position: "center",
//           icon: "success",
//           title: response.data.message,
//           timer: 1500,
//         });
//       }
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: response.data.message,
//         timer: 1500,
//       });
//     },
//   });

//   const {
//     mutate: getSearchSelectedCashDisbursement,
//     isLoading: loadingGetSearchSelectedCashDisbursement,
//   } = useMutation({
//     mutationKey: "get-selected-search-general-journal",
//     mutationFn: async (variable: any) =>
//       await myAxios.post(
//         "/task/accounting/cash-disbursement/get-selected-search-cash-disbursement",
//         variable,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       ),
//     onSuccess: (res) => {
//       const response = res as any;
//       const selected = response.data.selectedCashDisbursement;
//       const { explanation, dateEntry, refNo, particulars } = selected[0];
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "sub_refNo",
//         value: refNo,
//       });
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "refNo",
//         value: refNo,
//       });
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "dateEntry",
//         value: dateEntry,
//       });
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "explanation",
//         value: explanation,
//       });
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "particulars",
//         value: particulars,
//       });
//       setCashDisbursement(selected);



//       setHasSelected(true);
//     },
//   });

//   const {
//     ModalComponent: ModalSearchCashDisbursement,
//     openModal: openSearchCashDisbursement,
//     isLoading: isLoadingSearchCashDisbursement,
//     closeModal: closeSearchCashDisbursement,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/accounting/cash-disbursement/search-cash-disbursement",
//       queryUrlName: "searchCashDisbursement",
//     },
//     columns: [
//       { field: "Date_Entry", headerName: "Date", width: 130 },
//       { field: "Source_No", headerName: "Ref No.", width: 250 },
//       {
//         field: "Explanation",
//         headerName: "Explanation",
//         flex: 1,
//       },
//     ],
//     queryKey: "search-cash-disbursement",
//     uniqueId: "Source_No",
//     responseDataKey: "search",
//     onSelected: (selectedRowData, data) => {
//       getSearchSelectedCashDisbursement({
//         Source_No: selectedRowData[0].Source_No,
//       });
//       handleInputChange({
//         target: { value: "edit", name: "cashMode" },
//       });
//       setCashDisbursement([]);
//       setEditTransaction({
//         edit: false,
//         updateId: "",
//       });

//       closeSearchCashDisbursement();
//     },
//     onCloseFunction: (value: any) => {
//       dispatch({ type: "UPDATE_FIELD", field: "search", value });
//     },
//     searchRef: chartAccountSearchInput,
//   });

//   const {
//     ModalComponent: ModalChartAccountSearch,
//     openModal: openChartAccountSearch,
//     isLoading: isLoadingChartAccountSearch,
//     closeModal: closeChartAccountSearch,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/accounting/general-journal/get-chart-account",
//       queryUrlName: "chartAccountSearch",
//     },
//     columns: [
//       { field: "Acct_Code", headerName: "Account Code", width: 130 },
//       { field: "Acct_Title", headerName: "Account Title.", width: 250 },
//       {
//         field: "Short",
//         headerName: "Short",
//         flex: 1,
//       },
//     ],
//     queryKey: "get-chart-account",
//     uniqueId: "Acct_Code",
//     responseDataKey: "getChartOfAccount",
//     onSelected: (selectedRowData, data) => {
//       if (editCell.TempID !== null) {
//         setCashDisbursement((d: any) => {
//           const newD = d.map((itm: any) => {
//             if (itm.TempID === editCell.TempID) {
//               itm = {
//                 ...itm,
//                 code: selectedRowData[0].Acct_Code,
//                 acctName: selectedRowData[0].Acct_Title
//               }
//             }
//             return itm
//           })
//           return newD
//         })
//       } else {
//         setNewRowData((d) => ({
//           ...d,
//           code: selectedRowData[0].Acct_Code,
//           acctName: selectedRowData[0].Acct_Title
//         }))
//       }

//       closeChartAccountSearch();
//       setTimeout(() => {
//         const nextInput = document.querySelector(`#ClientName`) as HTMLInputElement;
//         if (nextInput) {
//           nextInput.focus(); // Move focus to the next input
//         }
//       }, 150);
//     },
//     searchRef: chartAccountSearchInput,
//   });

//   const {
//     ModalComponent: ModalPolicyIdClientIdRefId,
//     openModal: openPolicyIdClientIdRefId,
//     isLoading: isLoadingPolicyIdClientIdRefId,
//     closeModal: closePolicyIdClientIdRefId,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/accounting/search-pdc-policy-id",
//       queryUrlName: "searchPdcPolicyIds",
//     },
//     columns: [
//       { field: "Type", headerName: "Type", width: 130 },
//       { field: "IDNo", headerName: "ID No.", width: 200 },
//       {
//         field: "Name",
//         headerName: "Name",
//         flex: 1,
//       },
//       {
//         field: "ID",
//         headerName: "ID",
//         hide: true,
//       },
//     ],
//     queryKey: "get-policyId-ClientId-RefId",
//     uniqueId: "IDNo",
//     responseDataKey: "clientsId",
//     onSelected: (selectedRowData) => {
//       if (editCell.TempID !== null) {
//         setCashDisbursement((d: any) => {
//           const newD = d.map((itm: any) => {
//             if (itm.TempID === editCell.TempID) {
//               itm = {
//                 ...itm,
//                 ClientName: selectedRowData[0].Name,
//                 IDNo: selectedRowData[0].IDNo,
//                 subAcct: selectedRowData[0].sub_account,
//                 subAcctName: selectedRowData[0].ShortName,
//                 address: selectedRowData[0].address,
//               }
//             }
//             return itm
//           })


//           return newD
//         })
//       } else {
//         setNewRowData((d) => ({
//           ...d,
//           ClientName: selectedRowData[0].Name,
//           IDNo: selectedRowData[0].IDNo,
//           subAcct: selectedRowData[0].sub_account,
//           subAcctName: selectedRowData[0].ShortName,
//           address: selectedRowData[0].address,
//         }))
//       }


//       closePolicyIdClientIdRefId();
//       setTimeout(() => {
//         const nextInput = document.querySelector(`#debit`) as HTMLInputElement;
//         if (nextInput) {
//           nextInput.focus(); // Move focus to the next input
//         }
//       }, 200);
//     },
//     searchRef: IdsSearchInput,
//   });

//   const {
//     ModalComponent: ModalPolicyIdPayTo,
//     openModal: openPolicyIdPayTo,
//     isLoading: isLoadingPolicyIdPayTo,
//     closeModal: closePolicyIdPayTo,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/accounting/search-pdc-policy-id",
//       queryUrlName: "searchPdcPolicyIds",
//     },
//     columns: [
//       { field: "Type", headerName: "Type", width: 130 },
//       { field: "IDNo", headerName: "ID No.", width: 200 },
//       {
//         field: "Name",
//         headerName: "Name",
//         flex: 1,
//       },
//       {
//         field: "ID",
//         headerName: "ID",
//         hide: true,
//       },
//     ],
//     queryKey: "get-policyId-ClientId-RefId",
//     uniqueId: "IDNo",
//     responseDataKey: "clientsId",
//     onSelected: (selectedRowData) => {
//       if (editCell.TempID !== null) {
//         setCashDisbursement((d: any) => {
//           const newD = d.map((itm: any) => {
//             if (itm.TempID === editCell.TempID) {
//               itm = {
//                 ...itm,
//                 Payto: selectedRowData[0].Name,
//               }
//             }
//             return itm
//           })
//           return newD
//         })
//       } else {
//         setNewRowData((d) => ({
//           ...d,
//           Payto: selectedRowData[0].Name,
//         }))
//       }

//       closePolicyIdPayTo();
//       setTimeout(() => {
//         const nextInput = document.querySelector(`#vatType`) as HTMLInputElement;
//         if (nextInput) {
//           nextInput.focus(); // Move focus to the next input
//         }
//       }, 200);

//     },
//     searchRef: IdsSearchInput,
//   });


//   const {
//     ModalComponent: ModalTransactionAccount,
//     openModal: openTransactionAccount,
//     isLoading: isLoadingTransactionAccount,
//     closeModal: closeTransactionAccount,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/accounting/general-journal/get-transaction-account",
//       queryUrlName: "transactionCodeSearch",
//     },
//     columns: [
//       { field: "Code", headerName: "Code", width: 130 },
//       {
//         field: "Description",
//         headerName: "Description",
//         flex: 1,
//       },
//     ],
//     queryKey: "get-transaction-account",
//     uniqueId: "Code",
//     responseDataKey: "getTransactionAccount",
//     onSelected: (selectedRowData) => {

//       if (editCell.TempID !== null) {
//         setCashDisbursement((d: any) => {
//           const newD = d.map((itm: any) => {
//             if (itm.TempID === editCell.TempID) {
//               itm = {
//                 ...itm,
//                 TC_Code: selectedRowData[0].Code,
//                 TC_Desc: selectedRowData[0].Description,
//               }
//             }
//             return itm
//           })
//           return newD
//         })
//       } else {
//         setNewRowData((d) => ({
//           ...d,
//           TC_Code: selectedRowData[0].Code,
//           TC_Desc: selectedRowData[0].Description,
//         }))
//       }




//       closeTransactionAccount();
//       setTimeout(() => {
//         const nextInput = document.querySelector(`#remarks`) as HTMLInputElement;
//         if (nextInput) {
//           nextInput.focus(); // Move focus to the next input
//         }
//       }, 250);
//     },
//     searchRef: IdsSearchInput,
//   });

//   useEffect(() => {
//     const debit = cashDisbursement.reduce((a: number, item: any) => {
//       return a + parseFloat(item.debit.replace(/,/g, ""));
//     }, 0);
//     const credit = cashDisbursement.reduce((a: number, item: any) => {
//       return a + parseFloat(item.credit.replace(/,/g, ""));
//     }, 0);
//     dispatch({
//       type: "UPDATE_FIELD",
//       field: "totalDebit",
//       value: debit.toFixed(2),
//     });
//     dispatch({
//       type: "UPDATE_FIELD",
//       field: "totalCredit",
//       value: credit.toFixed(2),
//     });
//     dispatch({
//       type: "UPDATE_FIELD",
//       field: "totalBalance",
//       value: (debit - credit).toFixed(2),
//     });
//   }, [cashDisbursement]);

//   const handleInputChange = (e: any) => {
//     const { name, value } = e.target;
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };

//   function handleOnSave() {
//     if (state.refNo === "") {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Please provide reference number!",
//         timer: 1500,
//       });
//     }
//     if (state.explanation === "") {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Please provide explanation!",
//         timer: 1500,
//       }).then(() => {
//         wait(300).then(() => {
//           explanationInputRef.current?.focus();
//         });
//       });
//     }
//     if (
//       (state.totalDebit === "" && state.totalCredit === "") ||
//       (state.totalDebit === "0.00" && state.totalCredit === "0.00")
//     ) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title:
//           "Total Debit and Credit amount must not be zero(0), please double check the entries",
//         timer: 1500,
//       }).then(() => {
//         wait(300).then(() => { });
//       });
//     }
//     if (state.totalDebit !== state.totalCredit) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title:
//           "Total Debit and Credit amount must be balance, please double check the entries",
//         timer: 1500,
//       }).then(() => {
//         wait(300).then(() => { });
//       });
//     }
//     if (state.cashMode === "edit") {
//       codeCondfirmationAlert({
//         isUpdate: true,
//         cb: (userCodeConfirmation) => {
//           addCashDisbursementMutate({
//             hasSelected,
//             refNo: state.refNo,
//             dateEntry: state.dateEntry,
//             explanation: state.explanation,
//             particulars: state.particulars,
//             cashDisbursement,
//             userCodeConfirmation,
//           });
//         },
//       });
//     } else {
//       saveCondfirmationAlert({
//         isConfirm: () => {
//           addCashDisbursementMutate({
//             hasSelected,
//             refNo: state.refNo,
//             dateEntry: state.dateEntry,
//             explanation: state.explanation,
//             particulars: state.particulars,
//             cashDisbursement,
//           });
//         },
//       });
//     }
//   }

//   function handleVoid() {
//     codeCondfirmationAlert({
//       isUpdate: false,
//       text: `Are you sure you want to void ${state.refNo}`,
//       cb: (userCodeConfirmation) => {
//         mutateVoidCashDisbursement({
//           refNo: state.refNo,
//           dateEntry: state.dateEntry,
//           userCodeConfirmation,
//         });
//       },
//     });
//   }

//   function handleRowSave() {
//     if (isNaN(parseFloat(state.credit))) {
//       state.credit = "0.00";
//     }
//     if (isNaN(parseFloat(state.debit))) {
//       state.debit = "0.00";
//     }
//     if (state.code === "" || state.acctName === "") {
//       return openChartAccountSearch(state.code);
//     }

//     if (state.subAcctName === "" || state.ClientName === "") {
//       return openPolicyIdClientIdRefId(state.ClientName);
//     }
//     if (state.credit === state.debit) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "The values for credit and debit must be different",
//         timer: 1500,
//       });
//     }
//     if (state.code === "1.01.10" && state.checkNo === "") {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Check No. is Required!",
//         timer: 1500,
//       });
//     }

//     if (state.TC_Code === "") {
//       return openTransactionAccount(state.TC_Code);
//     }

//     if (state.Payto === "" && state.code === "1.01.10") {
//       setIsPayToEnter(true);
//       return openPolicyIdClientIdRefId(state.Payto);
//     }

//     if (state.code.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Code is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.ClientName.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Client Name is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.debit.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Debit is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.credit.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Credit is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.checkNo.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Check No is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.TC_Code.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "TC is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.Payto.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Pay to is too long!",
//         timer: 1500,
//       });
//     }
//     if (state.invoice.length >= 200) {
//       return Swal.fire({
//         position: "center",
//         icon: "warning",
//         title: "Invoice is too long!",
//         timer: 1500,
//       });
//     }

//     function generateID(array: Array<any>) {
//       const lastItem = array.length ? array[array.length - 1].TempID : "000";
//       const numericPart = (parseInt(lastItem.toString().match(/\d+/)[0]) + 1)
//         .toString()
//         .padStart(3, "0");
//       return numericPart;
//     }

//     Swal.fire({
//       title: editTransaction.edit
//         ? `Are you sure you want to update row?`
//         : `Are you sure you want to add new row?`,
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: editTransaction.edit
//         ? "Yes, update it!"
//         : "Yes Add it",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setCashDisbursement((d: any) => {
//           if (state.code === "1.01.10") {
//             state.checkDate = formatDate(state.checkDate);
//           } else {
//             state.checkDate = "";
//           }

//           if (state.vatType === "VAT" && state.code !== "1.06.02") {
//             let taxableamt;

//             if (parseFloat(state.debit.replace(/,/g, "")) !== 0) {
//               taxableamt = parseFloat(state.debit.replace(/,/g, "")) / 1.12;
//               state.debit = taxableamt.toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               });
//             } else {
//               taxableamt = parseFloat(state.credit.replace(/,/g, "")) / 1.12;
//               state.credit = taxableamt.toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               });
//             }

//             if (editTransaction.edit) {
//               d = d.map((item: any) => {
//                 if (editTransaction.updateId === item.TempID) {
//                   item = {
//                     ...item,
//                     ...state,
//                   };
//                 }
//                 return item;
//               });
//             } else {
//               d = [
//                 ...d,
//                 {
//                   ...state,
//                   TempID: generateID(d),
//                 },
//               ];
//             }

//             let inputtax = taxableamt * 0.12;

//             if (parseFloat(state.debit.replace(/,/g, "")) !== 0) {
//               state.debit = inputtax.toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               });
//             } else {
//               state.credit = inputtax.toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               });
//             }
//             d = [
//               ...d,
//               {
//                 ...state,
//                 code: "1.06.02",
//                 acctName: "Input Tax",
//                 TempID: generateID(d),
//               },
//             ];
//           } else {
//             const credit = parseFloat(
//               state.credit.replace(/,/g, "")
//             ).toLocaleString("en-US", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             });
//             const debit = parseFloat(
//               state.debit.replace(/,/g, "")
//             ).toLocaleString("en-US", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             });

//             state.credit = credit;
//             state.debit = debit;

//             if (editTransaction.edit) {
//               const newD = d.map((item: any) => {
//                 if (editTransaction.updateId === item.TempID) {
//                   item = {
//                     ...item,
//                     ...state,
//                   };
//                 }
//                 return item;
//               });
//               return newD;
//             }
//             d = [
//               ...d,
//               {
//                 ...state,
//                 TempID: generateID(d),
//               },
//             ];
//           }

//           return d;
//         });

//         const resetValue = {
//           code: "",
//           acctName: "",
//           subAcct: "",
//           subAcctName: "",
//           IDNo: "",
//           ClientName: "",
//           credit: "",
//           debit: "",
//           TC_Code: "",
//           TC_Desc: "",
//           remarks: "",
//           vatType: "NON-VAT",
//           invoice: "",
//           address: "",
//           checkNo: "",
//           checkDate: new Date(),
//         };
//         setNewStateValue(dispatch, { ...state, ...resetValue });
//         setEditTransaction({ edit: false, updateId: "" });
//         wait(300).then(() => {
//           codeInputRef.current?.focus();
//         });
//       }
//     });
//   }

//   function handleClickPrint() {
//     mutateOnPrint({ Source_No: state.refNo })
//   }
//   function handleClickPrintCheck() {
//     setRigthClickSelected(null)
//     if (rigthClickSelected) {
//       localStorage.removeItem("printString");
//       localStorage.setItem("paper-width", "8.27in");
//       localStorage.setItem("paper-height", "11.69in");
//       localStorage.setItem("module", "cash-disbursement-check");
//       localStorage.setItem("state", JSON.stringify(rigthClickSelected));
//       localStorage.setItem("dataString", JSON.stringify([]));
//       localStorage.setItem("column", JSON.stringify([]));
//       localStorage.setItem("title", "");
//     }
//     window.open("/dashboard/print", "_blank");
//   }
//   // mutateOnPrint({ Source_No: state.refNo })
//   const isDisableField = state.cashMode === "";
//   const width = window.innerWidth - 50;
//   const height = window.innerHeight - 205;

//   const closeModal = () => {
//     setModalVisible(false);
//   };

//   if (isLoadingTransactionAccount || isLoadingPolicyIdPayTo || isLoadingPolicyIdClientIdRefId || isLoadingChartAccountSearch) {
//     return <div>loading...</div>
//   }

//   const handleSave = (newData: any) => {
//     // Logic to save new data (e.g., update state, call an API, etc.)
//     console.log('Saving new data:', newData);
//   };


//   return (
//     <div
//       onClick={() => {
//         closeModal()
//         if (rigthClickSelected) {
//           setRigthClickSelected(null)
//         }
//       }}
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         width: "100%",
//         height: "100%",
//         flex: 1,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           columnGap: "5px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             columnGap: "5px",
//           }}
//         >
//           {isLoadingSearchCashDisbursement ? (
//             <LoadingButton loading={isLoadingSearchCashDisbursement} />
//           ) : (
//             <TextField
//               label="Search"
//               size="small"
//               name="search"
//               value={state.search}
//               onChange={handleInputChange}
//               onKeyDown={(e) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   e.preventDefault();
//                   return openSearchCashDisbursement(
//                     (e.target as HTMLInputElement).value
//                   );
//                 }
//               }}
//               InputProps={{
//                 style: { height: "27px", fontSize: "14px" },
//               }}
//               sx={{
//                 width: "300px",
//                 height: "27px",
//                 ".MuiFormLabel-root": { fontSize: "14px" },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             />
//           )}

//           {state.cashMode === "" && (
//             <Button
//               sx={{
//                 height: "30px",
//                 fontSize: "11px",
//               }}
//               variant="contained"
//               startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
//               id="entry-header-save-button"
//               onClick={() => {
//                 handleInputChange({
//                   target: { value: "add", name: "cashMode" },
//                 });
//               }}
//               color="primary"
//             >
//               New
//             </Button>
//           )}
//           <LoadingButton
//             sx={{
//               height: "30px",
//               fontSize: "11px",
//             }}
//             loading={loadingCashDisbursementMutate}
//             disabled={state.cashMode === ""}
//             onClick={handleOnSave}
//             color="success"
//             variant="contained"
//           >
//             Save
//           </LoadingButton>
//           {state.cashMode !== "" && (
//             <LoadingButton
//               sx={{
//                 height: "30px",
//                 fontSize: "11px",
//               }}
//               variant="contained"
//               startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
//               color="error"
//               onClick={() => {
//                 Swal.fire({
//                   title: "Are you sure?",
//                   text: "You won't be able to revert this!",
//                   icon: "warning",
//                   showCancelButton: true,
//                   confirmButtonColor: "#3085d6",
//                   cancelButtonColor: "#d33",
//                   confirmButtonText: "Yes, cancel it!",
//                 }).then((result) => {
//                   if (result.isConfirmed) {
//                     refetchGeneralJournalGenerator();
//                     handleInputChange({
//                       target: { value: "", name: "cashMode" },
//                     });
//                     setNewStateValue(dispatch, initialState);
//                     setCashDisbursement([]);
//                     // setSearchSelected(false);
//                     setEditTransaction({
//                       edit: false,
//                       updateId: "",
//                     });
//                   }
//                 });
//               }}
//               disabled={state.cashMode === ""}
//             >
//               Cancel
//             </LoadingButton>
//           )}
//           <LoadingButton
//             sx={{
//               height: "30px",
//               fontSize: "11px",
//               background: deepOrange[500],
//               ":hover": {
//                 background: deepOrange[600],
//               },
//             }}
//             onClick={handleVoid}
//             loading={loadingVoidCashDisbursement}
//             disabled={state.cashMode !== "edit"}
//             variant="contained"
//             startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
//           >
//             Void
//           </LoadingButton>
//           <LoadingButton
//             loading={isLoadingOnPrint}
//             disabled={state.cashMode !== "edit"}
//             id="basic-button"
//             aria-haspopup="true"
//             onClick={handleClickPrint}
//             sx={{
//               height: "30px",
//               fontSize: "11px",
//               color: "white",
//               backgroundColor: grey[600],
//               "&:hover": {
//                 backgroundColor: grey[700],
//               },
//             }}
//           >
//             Print
//           </LoadingButton>
//         </div>
//       </div>
//       <div style={{ display: "flex", marginBottom: "10px" }}>
//         <fieldset
//           style={{
//             border: "1px solid #cbd5e1",
//             borderRadius: "5px",
//             position: "relative",
//             flex: 1,
//             height: "auto",
//             display: "flex",
//             marginTop: "10px",
//             gap: "10px",
//             padding: "15px",
//             flexDirection: "column"
//           }}
//         >
//           {loadingGeneralJournalGenerator ? (
//             <LoadingButton loading={loadingGeneralJournalGenerator} />
//           ) : (
//             <TextInput
//               label={{
//                 title: "Reference CV- : ",
//                 style: {
//                   fontSize: "12px",
//                   fontWeight: "bold",
//                   width: "100px",
//                 },
//               }}
//               input={{
//                 disabled: isDisableField,
//                 type: "text",
//                 style: { width: "190px" },
//                 readOnly: true,
//                 onKeyDown: (e) => {
//                   if (e.code === "NumpadEnter" || e.code === 'Enter') {
//                     dateRef.current?.focus()
//                   }
//                 }
//               }}
//               inputRef={refNoRef}
//             />
//           )}
//           <TextInput
//             label={{
//               title: "Date : ",
//               style: {
//                 fontSize: "12px",
//                 fontWeight: "bold",
//                 width: "100px",
//               },
//             }}
//             input={{
//               disabled: isDisableField,
//               type: "date",
//               style: { width: "190px" },
//               onKeyDown: (e) => {
//                 if (e.code === "NumpadEnter" || e.code === 'Enter') {
//                   expRef.current?.focus()
//                 }
//               }
//             }}
//             inputRef={dateRef}
//           />
//           <TextInput
//             label={{
//               title: "Explanation : ",
//               style: {
//                 fontSize: "12px",
//                 fontWeight: "bold",
//                 width: "100px",
//               },
//             }}
//             input={{
//               disabled: isDisableField,
//               type: "text",
//               style: { flex: 1 },
//               onKeyDown: (e) => {
//                 if (e.code === "NumpadEnter" || e.code === 'Enter') {
//                   particularRef.current?.focus()
//                 }
//               }
//             }}
//             inputRef={expRef}
//           />
//           <TextAreaInput
//             label={{
//               title: "Particulars : ",
//               style: {
//                 fontSize: "12px",
//                 fontWeight: "bold",
//                 width: "100px",
//               },
//             }}
//             textarea={{
//               rows: 4,
//               disabled: isDisableField,
//               style: { flex: 1 },
//               onKeyDown: (e) => {
//                 if (e.code === "NumpadEnter" || e.code === 'Enter') {
//                   //  refDate.current?.focus()
//                 }
//               },
//             }}
//             _inputRef={particularRef}
//           />
//         </fieldset>
//         <fieldset
//           style={{
//             border: "1px solid #cbd5e1",
//             borderRadius: "5px",
//             position: "relative",
//             width: "400px",
//             height: "auto",
//             display: "flex",
//             marginTop: "10px",
//             gap: "10px",
//             padding: "15px",
//           }}
//         >
//           <div style={{ alignItems: "center", display: "flex", textAlign: "center", width: "100px" }}>
//             <p style={{ margin: 0, padding: 0, color: "black", display: "flex", flexDirection: "column" }}>
//               <span style={{ fontSize: "12px" }}>Total Rows:</span> <strong>{cashDisbursement.length}</strong>
//             </p>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-around", flexDirection: "column", flex: 1 }}>
//             <p style={{ margin: 0, padding: 0, color: "black" }}>
//               <span style={{ fontSize: "12px" }}>Total Debit:</span> <strong>{state.totalDebit}</strong>
//             </p>
//             <p style={{ margin: 0, padding: 0, color: "black" }}>
//               <span style={{ fontSize: "12px" }}>Total Credit:</span> <strong>{state.totalCredit}</strong>
//             </p>
//             <p style={{ margin: 0, padding: 0, color: "black" }}>
//               <span style={{ fontSize: "12px" }}>Balance:</span>{" "}
//               <strong
//                 style={{
//                   color:
//                     parseFloat(state.totalBalance.replace(/,/g, "")) > 0
//                       ? "red"
//                       : "black",
//                 }}
//               >
//                 {state.totalBalance}
//               </strong>
//             </p>
//           </div>
//         </fieldset>
//       </div>
//       {/* <fieldset
//         style={{
//           border: "1px solid #cbd5e1",
//           borderRadius: "5px",
//           position: "relative",
//           width: "100%",
//           height: "auto",
//           marginTop: "10px",

//           padding: "15px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "10px",
//           }}
//         >
//           {isLoadingChartAccountSearch ? (
//             <LoadingButton loading={isLoadingChartAccountSearch} />
//           ) : (
//             <FormControl
//               variant="outlined"
//               size="small"
//               disabled={isDisableField}
//               sx={{
//                 width: "130px",
//                 ".MuiFormLabel-root": {
//                   fontSize: "14px",
//                   background: "white",
//                   zIndex: 99,
//                   padding: "0 3px",
//                 },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             >
//               <InputLabel htmlFor="chart-account-id">Code</InputLabel>
//               <OutlinedInput
//                 sx={{
//                   height: "27px",
//                   fontSize: "14px",
//                 }}
//                 readOnly
//                 disabled={isDisableField}
//                 fullWidth
//                 label="Code"
//                 name="code"
//                 inputRef={codeInputRef}
//                 value={state.code}
//                 onChange={handleInputChange}
//                 onKeyDown={(e) => {
//                   if (e.code === "Enter" || e.code === "NumpadEnter") {
//                     e.preventDefault();
//                     return openChartAccountSearch(state.code);
//                   }
//                 }}
//                 id="chart-account-id"
//                 endAdornment={
//                   <InputAdornment position="end">
//                     <IconButton
//                       ref={reloadIDButtonRef}
//                       disabled={isDisableField}
//                       aria-label="search-client"
//                       color="secondary"
//                       edge="end"
//                       onClick={() => {
//                         openChartAccountSearch(state.code);
//                       }}
//                     >
//                       <RestartAltIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 }
//               />
//             </FormControl>
//           )}
//           <TextField
//             disabled={isDisableField}
//             label="Account Name"
//             size="small"
//             name="acctName"
//             value={state.acctName}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (
//                 e.code === "Enter" ||
//                 (e.code === "NumpadEnter" && state.acctName !== "")
//               ) {
//                 e.preventDefault();
//                 subAccountRef.current?.focus()
//               }

//             }}
//             InputProps={{
//               style: { height: "27px", fontSize: "14px" },
//               inputRef: accountNameRef
//             }}
//             sx={{
//               flex: 1,
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           <TextField
//             disabled={isDisableField}
//             label="Sub Account"
//             size="small"
//             name="subAcctName"
//             value={state.subAcctName}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (
//                 e.code === "Enter" ||
//                 (e.code === "NumpadEnter" && state.subAcctName !== "")
//               ) {
//                 e.preventDefault();
//                 idInputRef.current?.focus()
//               }

//             }}
//             InputProps={{
//               style: { height: "27px", fontSize: "14px" },
//               inputRef: subAccountRef
//             }}
//             sx={{
//               width: "150px",
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           {isLoadingPolicyIdClientIdRefId ? (
//             <LoadingButton loading={isLoadingPolicyIdClientIdRefId} />
//           ) : (
//             <FormControl
//               variant="outlined"
//               size="small"
//               disabled={isDisableField}
//               sx={{
//                 width: "300px",
//                 ".MuiFormLabel-root": {
//                   fontSize: "14px",
//                   background: "white",
//                   zIndex: 99,
//                   padding: "0 3px",
//                 },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             >
//               <InputLabel htmlFor="policy-client-ref-id">I.D</InputLabel>
//               <OutlinedInput
//                 readOnly
//                 sx={{
//                   height: "27px",
//                   fontSize: "14px",
//                 }}
//                 inputRef={idInputRef}
//                 disabled={isDisableField}
//                 fullWidth
//                 label="I.D"
//                 name="ClientName"
//                 value={state.ClientName}
//                 onChange={handleInputChange}
//                 onKeyDown={(e) => {
//                   if (e.code === "Enter" || e.code === "NumpadEnter") {
//                     e.preventDefault();
//                     setIsPayToEnter(false);
//                     return openPolicyIdClientIdRefId(state.ClientName);
//                   }
//                 }}
//                 id="policy-client-ref-id"
//                 endAdornment={
//                   <InputAdornment position="end">
//                     <IconButton
//                       ref={reloadIDButtonRef}
//                       disabled={isDisableField}
//                       aria-label="search-client"
//                       color="secondary"
//                       edge="end"
//                       onClick={() => {
//                         openPolicyIdClientIdRefId(state.ClientName);
//                       }}
//                     >
//                       <RestartAltIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 }
//               />
//             </FormControl>
//           )}
//           <TextField
//             disabled={isDisableField}
//             label="Debit"
//             size="small"
//             name="debit"
//             value={state.debit}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (e.code === "Enter" || e.code === "NumpadEnter") {
//                 e.preventDefault();
//                 creditRef.current?.focus()
//               }
//             }}
//             onBlur={(e) => {
//               e.preventDefault();
//               let num = "0";
//               if (!isNaN(parseFloat(state.debit))) {
//                 num = state.debit;
//               }
//               dispatch({
//                 type: "UPDATE_FIELD",
//                 field: "debit",
//                 value: parseFloat(num.toString().replace(/,/g, "")).toFixed(2),
//               });
//             }}
//             InputProps={{
//               inputComponent: NumericFormatCustom as any,
//               inputRef: debitInputRef,
//               style: { height: "27px", fontSize: "14px" },
//             }}
//             sx={{
//               width: "160px",
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           <TextField
//             disabled={isDisableField}
//             label="Credit"
//             size="small"
//             name="credit"
//             value={state.credit}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (e.code === "Enter" || e.code === "NumpadEnter") {
//                 e.preventDefault();
//                 if (state.code === "1.01.10") {
//                   checkNoRef.current?.focus()
//                 } else {
//                   tcDateRef.current?.focus()
//                 }
//               }
//             }}
//             onFocus={(e) => {
//               e.preventDefault();
//               if (state.code === "1.01.10") {
//                 dispatch({
//                   type: "UPDATE_FIELD",
//                   field: "credit",
//                   value: state.totalBalance,
//                 });
//               }
//             }}
//             onBlur={(e) => {
//               e.preventDefault();
//               let num = "0";
//               if (!isNaN(parseFloat(state.credit))) {
//                 num = state.credit;
//               }
//               dispatch({
//                 type: "UPDATE_FIELD",
//                 field: "credit",
//                 value: parseFloat(num.toString().replace(/,/g, "")).toFixed(2),
//               });
//             }}
//             InputProps={{
//               inputComponent: NumericFormatCustom as any,
//               style: { height: "27px", fontSize: "14px" },
//               inputRef: creditRef
//             }}
//             sx={{
//               width: "160px",
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           <TextField
//             disabled={isDisableField || state.code !== "1.01.10"}
//             label="Check No"
//             size="small"
//             name="checkNo"
//             value={state.checkNo}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (e.code === "Enter" || e.code === "NumpadEnter") {
//                 e.preventDefault();
//                 checkDateRef.current?.focus()
//               }
//             }}
//             InputProps={{
//               inputRef: checkNoRef,
//               style: { height: "27px", fontSize: "14px" },
//             }}
//             sx={{
//               width: "160px",
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//         </div>
//         <div
//           style={{
//             display: "flex",
//             gap: "10px",
//             marginTop: "10px",
//           }}
//         >
//           {state.code === "1.01.10" ? (
//             <CustomDatePicker
//               fullWidth={false}
//               disabled={isDisableField || state.code !== "1.01.10"}
//               label="Check Date"
//               onChange={(value: any) => {
//                 dispatch({
//                   type: "UPDATE_FIELD",
//                   field: "checkDate",
//                   value: value,
//                 });
//               }}
//               value={state.checkDate}
//               onKeyDown={(e: any) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   // const timeout = setTimeout(() => {
//                   //   checkDatePickerRef.current
//                   //     ?.querySelector("button")
//                   //     ?.click();
//                   //   clearTimeout(timeout);
//                   // }, 150);
//                   tcDateRef.current?.focus()
//                 }
//               }}
//               datePickerRef={checkDatePickerRef}
//               inputRef={checkDateRef}
//               textField={{
//                 InputLabelProps: {
//                   style: {
//                     fontSize: "14px",
//                   },
//                 },
//                 InputProps: {
//                   style: { height: "27px", fontSize: "14px", width: "150px" },
//                 },
//               }}
//             />
//           ) : (
//             <TextField
//               disabled={isDisableField || state.code !== "1.01.10"}
//               label="Check Date"
//               size="small"
//               name="checkDate"
//               InputProps={{
//                 style: { height: "27px", fontSize: "14px" },
//               }}
//               sx={{
//                 width: "160px",
//                 ".MuiFormLabel-root": { fontSize: "14px" },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             />
//           )}
//           {isLoadingTransactionAccount ? (
//             <LoadingButton loading={isLoadingTransactionAccount} />
//           ) : (
//             <FormControl
//               variant="outlined"
//               size="small"
//               disabled={isDisableField}
//               sx={{
//                 width: "130px",
//                 ".MuiFormLabel-root": {
//                   fontSize: "14px",
//                   background: "white",
//                   zIndex: 99,
//                   padding: "0 3px",
//                 },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             >
//               <InputLabel htmlFor="tc">TC</InputLabel>
//               <OutlinedInput
//                 inputRef={tcDateRef}
//                 sx={{
//                   height: "27px",
//                   fontSize: "14px",
//                 }}
//                 readOnly
//                 fullWidth
//                 label="TC"
//                 name="TC_Code"
//                 value={state.TC_Code}
//                 onChange={handleInputChange}
//                 onKeyDown={(e) => {
//                   if (e.code === "Enter" || e.code === "NumpadEnter") {
//                     e.preventDefault();
//                     return openTransactionAccount(state.TC_Code);
//                   }
//                 }}
//                 id="tc"
//                 endAdornment={
//                   <InputAdornment position="end">
//                     <IconButton
//                       ref={reloadIDButtonRef}
//                       disabled={isDisableField}
//                       aria-label="search-client"
//                       color="secondary"
//                       edge="end"
//                       onClick={() => {
//                         openTransactionAccount(state.TC_Code);
//                       }}
//                     >
//                       <RestartAltIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 }
//               />
//             </FormControl>
//           )}
//           <TextField
//             disabled={isDisableField}
//             label="Remarks"
//             size="small"
//             name="remarks"
//             value={state.remarks}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (e.code === "Enter" || e.code === "NumpadEnter") {
//                 e.preventDefault();
//                 if (state.code === "1.01.10") {
//                   idInputRefPayTo.current?.focus()
//                 } else {
//                   vatRef.current?.focus()
//                 }
//               }
//             }}
//             InputProps={{
//               style: { height: "27px", fontSize: "14px" },
//               inputRef: tcInputRef,
//             }}
//             sx={{
//               flex: 1,
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           {state.code !== "1.01.10" && (
//             <TextField
//               disabled={isDisableField}
//               label="Payto"
//               size="small"
//               name="Payto"
//               value={state.Payto}
//               onChange={handleInputChange}
//               onKeyDown={(e) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   e.preventDefault();
//                   return handleRowSave();
//                 }
//               }}
//               InputProps={{
//                 readOnly: true,
//                 inputRef: paytoRef,
//                 style: { height: "27px", fontSize: "14px" },
//               }}
//               sx={{
//                 width: "160px",
//                 ".MuiFormLabel-root": { fontSize: "14px" },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             />
//           )}

//           {state.code === "1.01.10" && (
//             <>
//               {isLoadingPolicyIdClientIdRefId ? (
//                 <LoadingButton loading={isLoadingPolicyIdClientIdRefId} />
//               ) : (
//                 <FormControl
//                   variant="outlined"
//                   size="small"
//                   disabled={isDisableField}
//                   sx={{
//                     width: "300px",
//                     ".MuiFormLabel-root": {
//                       fontSize: "14px",
//                       background: "white",
//                       zIndex: 99,
//                       padding: "0 3px",
//                     },
//                     ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                   }}
//                 >
//                   <InputLabel htmlFor="policy-client-Payto">Payto</InputLabel>
//                   <OutlinedInput
//                     readOnly
//                     sx={{
//                       height: "27px",
//                       fontSize: "14px",
//                     }}
//                     inputRef={idInputRefPayTo}
//                     disabled={isDisableField}
//                     fullWidth
//                     label="Payto"
//                     name="Payto"
//                     value={state.Payto}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => {
//                       if (e.code === "Enter" || e.code === "NumpadEnter") {
//                         e.preventDefault();
//                         setIsPayToEnter(true);
//                         return openPolicyIdClientIdRefId(state.Payto);
//                       }
//                     }}
//                     id="policy-client-Payto"
//                     endAdornment={
//                       <InputAdornment position="end">
//                         <IconButton
//                           ref={reloadIDButtonRef}
//                           disabled={isDisableField}
//                           color="secondary"
//                           edge="end"
//                           onClick={() => {
//                             openPolicyIdClientIdRefId(state.Payto);
//                           }}
//                         >
//                           <RestartAltIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     }
//                   />
//                 </FormControl>
//               )}
//             </>
//           )}
//           <FormControl
//             size="small"
//             variant="outlined"
//             sx={{
//               width: "120px",
//               ".MuiFormLabel-root": {
//                 fontSize: "14px",
//                 background: "white",
//                 zIndex: 99,
//                 padding: "0 3px",
//               },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           >
//             <InputLabel id="label-selection-reason">Vat Type</InputLabel>
//             <Select
//               labelId="label-selection-reason"
//               value={state.vatType}
//               name="vatType"
//               onChange={handleInputChange}
//               autoWidth
//               sx={{
//                 height: "27px",
//                 fontSize: "14px",
//               }}
//               inputRef={vatRef}
//               disabled={isDisableField}

//             >
//               <MenuItem value="VAT" onKeyDown={(e) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   e.preventDefault();
//                   wait(300).then(() => {
//                     invoiceRef.current?.focus()
//                   })

//                 }
//               }}>VAT</MenuItem>
//               <MenuItem value={"NON-VAT"} onKeyDown={(e) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   e.preventDefault();
//                   wait(300).then(() => {
//                     invoiceRef.current?.focus()
//                   })
//                 }
//               }}>NON-VAT</MenuItem>
//             </Select>
//           </FormControl>
//           <TextField
//             disabled={isDisableField}
//             label="OR/Invoice No."
//             size="small"
//             name="invoice"
//             value={state.invoice}
//             onChange={handleInputChange}
//             onKeyDown={(e) => {
//               if (e.code === "Enter" || e.code === "NumpadEnter") {
//                 e.preventDefault();
//                 handleRowSave()
//               }
//             }}
//             InputProps={{
//               style: { height: "27px", fontSize: "14px" },
//               inputRef: invoiceRef
//             }}
//             sx={{
//               width: "200px",
//               ".MuiFormLabel-root": { fontSize: "14px" },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             }}
//           />
//           <Button
//             disabled={isDisableField}
//             sx={{
//               height: "27px",
//               fontSize: "11px",
//             }}
//             variant="contained"
//             startIcon={<SaveIcon sx={{ fontSize: "18px" }} />}
//             onClick={() => {
//               handleRowSave()
//             }}
//             color="primary"
//           >
//             Save Row
//           </Button>
//         </div>
//       </fieldset> */}
//       {/* <div
//         ref={refParent}
//         style={{
//           marginTop: "10px",
//           width: "100%",
//           position: "relative",
//           flex: 1,
//         }}
//       >
//         <Box
//           style={{
//             height: `${refParent.current?.getBoundingClientRect().height}px`,
//             width: "100%",
//             overflowX: "scroll",
//             position: "absolute",
//           }}
//         >
//           <Table
//             ref={table}
//             isLoading={
//               loadingCashDisbursementMutate ||
//               loadingGetSearchSelectedCashDisbursement ||
//               isLoadingJob
//             }
//             columns={selectedCollectionColumns}
//             rows={formatDebitCredit(cashDisbursement)}
//             table_id={"TempID"}
//             isSingleSelection={true}
//             isRowFreeze={false}
//             dataSelection={(selection, data, code) => {
//               const rowSelected = data.filter(
//                 (item: any) => item.TempID === selection[0]
//               )[0];
//               if (rowSelected === undefined || rowSelected.length <= 0) {
//                 const resetValue = {
//                   code: "",
//                   acctName: "",
//                   subAcct: "",
//                   subAcctName: "",
//                   IDNo: "",
//                   ClientName: "",
//                   credit: "",
//                   debit: "",
//                   TC_Code: "",
//                   TC_Desc: "",
//                   remarks: "",
//                   vatType: "NON-VAT",
//                   invoice: "",
//                   checkNo: "",
//                   checkDate: new Date(),
//                 };
//                 setNewStateValue(dispatch, { ...state, ...resetValue });
//                 setEditTransaction({ edit: false, updateId: "" });
//                 return;
//               }

//               if (code === "Delete" || code === "Backspace") {
//                 Swal.fire({
//                   title: `Are you sure you want to delete?`,
//                   text: "You won't be able to revert this!",
//                   icon: "warning",
//                   showCancelButton: true,
//                   confirmButtonColor: "#3085d6",
//                   cancelButtonColor: "#d33",
//                   confirmButtonText: "Yes, delete it!",
//                 }).then((result) => {
//                   if (result.isConfirmed) {
//                     return setCashDisbursement((d) => {
//                       return d.filter(
//                         (items: any) => items.TempID !== selection[0]
//                       );
//                     });
//                   }
//                 });
//                 return;
//               }
//               setNewStateValue(dispatch, {
//                 ...rowSelected,
//                 checkDate: new Date(rowSelected.checkDate),
//                 sub_refNo: state.sub_refNo,
//                 refNo: state.refNo,
//                 dateEntry: state.dateEntry,
//                 explanation: state.explanation,
//                 particulars: state.particulars,
//                 totalDebit: state.totalDebit,
//                 totalCredit: state.totalCredit,
//                 totalBalance: state.totalBalance,
//               });
//               setEditTransaction({
//                 edit: true,
//                 updateId: rowSelected.TempID,
//               });
//             }}
//           />
//         </Box>
//       </div> */}

//       {/* <UpwardTable
       
//         isLoading={loadingCashDisbursementMutate ||
//           loadingGetSearchSelectedCashDisbursement ||
//           isLoadingJob ||
//           isLoadingChartAccountSearch}
//         ref={table}
//         rows={formatDebitCredit(cashDisbursement)}
//         column={selectedCollectionColumns}
//         width={width}
//         height={height}
//         dataReadOnly={false}
//         onSelectionChange={(selected) => {
//           const rowSelected = selected[0]
//           if (selected.length > 0) {
//             setNewStateValue(dispatch, {
//               ...rowSelected,
//               checkDate: new Date(rowSelected.checkDate),
//               sub_refNo: state.sub_refNo,
//               refNo: state.refNo,
//               dateEntry: state.dateEntry,
//               explanation: state.explanation,
//               particulars: state.particulars,
//               totalDebit: state.totalDebit,
//               totalCredit: state.totalCredit,
//               totalBalance: state.totalBalance,
//             });
//             setEditTransaction({
//               edit: true,
//               updateId: rowSelected.TempID,
//             });
//           } else {
//             const resetValue = {
//               code: "",
//               acctName: "",
//               subAcct: "",
//               subAcctName: "",
//               IDNo: "",
//               ClientName: "",
//               credit: "",
//               debit: "",
//               TC_Code: "",
//               TC_Desc: "",
//               remarks: "",
//               vatType: "NON-VAT",
//               invoice: "",
//               checkNo: "",
//               checkDate: new Date(),
//             };
//             setNewStateValue(dispatch, { ...state, ...resetValue });
//             setEditTransaction({ edit: false, updateId: "" });
//             return;
//           }
//         }}
//         onKeyDown={(row, key) => {

//           if (key === "Delete" || key === "Backspace") {
//             const rowSelected = row[0];

//             Swal.fire({
//               title: `Are you sure you want to delete?`,
//               text: "You won't be able to revert this!",
//               icon: "warning",
//               showCancelButton: true,
//               confirmButtonColor: "#3085d6",
//               cancelButtonColor: "#d33",
//               confirmButtonText: "Yes, delete it!",
//             }).then((result) => {
//               if (result.isConfirmed) {
//                 return setCashDisbursement((d: any) => {
//                   return d.filter(
//                     (items: any) => items.TempID !== rowSelected.TempID
//                   );
//                 });
//               }
//             });
//             return;
//           }

//           // if (key === "Delete" || key === "Backspace") {
//           //   const rowSelected = row[0];
//           //   if (
//           //     (rowSelected.Deposit_Slip && rowSelected.Deposit_Slip !== "") ||
//           //     (rowSelected.DateDeposit && rowSelected.DateDeposit !== "") ||
//           //     (rowSelected.OR_No && rowSelected.OR_No !== "")
//           //   ) {
//           //     return Swal.fire({
//           //       position: "center",
//           //       icon: "warning",
//           //       title: `Unable to delete. Check No ${rowSelected.Check_No} is already ${rowSelected.OR_No} issued of OR!`,
//           //       showConfirmButton: false,
//           //       timer: 1500,
//           //     });
//           //   }
//           //   const timeout = setTimeout(() => {
//           //     Swal.fire({
//           //       title: "Are you sure?",
//           //       text: `You won't to delete this Check No. ${rowSelected.Check_No}`,
//           //       icon: "warning",
//           //       showCancelButton: true,
//           //       confirmButtonColor: "#3085d6",
//           //       cancelButtonColor: "#d33",
//           //       confirmButtonText: "Yes, delete it!",
//           //     }).then((result) => {
//           //       if (result.isConfirmed) {
//           //         return setPdcDataRows((dt) => {
//           //           return dt.filter(
//           //             (item: any) => item.CheckIdx !== rowSelected.CheckIdx
//           //           );
//           //         });
//           //       }
//           //       table.current?.removeSelection();
//           //     });
//           //     clearTimeout(timeout);
//           //   }, 250);
//           // }
//         }}
//         onRightClick={(rowSelected, event) => {
//           console.log(rowSelected)
//           event.stopPropagation()
//           setPosition({ x: event.pageX, y: event.pageY });
//           setModalVisible(true);
//           setRigthClickSelected(rowSelected)
//         }}
//         inputsearchselector=".manok"
//       /> */}
//       {/* <TableWithDynamicColumns
//         cashDisbursement={cashDisbursement}
//         setCashDisbursement={setCashDisbursement}
//         columns={columns.filter((d) => !d.hide)}
//         newRowData={newRowData}
//         setNewRowData={setNewRowData}
//         editCell={editCell}
//         setEditCell={setEditCell}
//         updateRowData={updateRowData}
//         setUpdateRowData={setUpdateRowData}
//         onRowKeyEvent={(e: any, key: string, addRow: CallableFunction) => {
//           if (key === 'code') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               openChartAccountSearch(e.target.value)
//             }
//           }
//           else if (key === 'ClientName') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               openPolicyIdClientIdRefId(e.target.value)
//             }
//           }
//           else if (key === 'TC_Code') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               openTransactionAccount(e.target.value)
//             }
//           }
//           else if (key === 'Payto') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               openPolicyIdPayTo(e.target.value)
//             }
//           }
//           else if (key === 'acctName') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#subAcctName`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }
//           else if (key === 'subAcctName') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#ClientName`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }
//           else if (key === 'debit') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#credit`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }
//           else if (key === 'credit') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               if (newRowData.code !== "1.01.10") {
//                 const nextInput = document.querySelector(`#TC_Code`) as HTMLInputElement;
//                 if (nextInput) {
//                   nextInput.focus(); // Move focus to the next input
//                 }
//               } else {
//                 const nextInput = document.querySelector(`#checkNo`) as HTMLInputElement;
//                 if (nextInput) {
//                   nextInput.focus(); // Move focus to the next input
//                 }
//               }

//             }
//           }
//           else if (key === 'checkNo') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#checkDate`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }
//           else if (key === 'checkDate') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#TC_Code`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }

//           else if (key === 'remarks') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {

//               if (newRowData.code !== "1.01.10") {
//                 const nextInput = document.querySelector(`#vatType`) as HTMLInputElement;
//                 if (nextInput) {
//                   nextInput.focus(); // Move focus to the next input
//                 }
//               } else {
//                 const nextInput = document.querySelector(`#Payto`) as HTMLInputElement;
//                 if (nextInput) {
//                   nextInput.focus(); // Move focus to the next input
//                 }
//               }

//             }
//           }
//           else if (key === 'vatType') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               const nextInput = document.querySelector(`#invoice`) as HTMLInputElement;
//               if (nextInput) {
//                 nextInput.focus(); // Move focus to the next input
//               }
//             }
//           }
//           else if (key === 'invoice') {
//             if (e.code === 'NumpadEnter' || e.code === 'Enter') {
//               addRow()
//             }
//           }
//         }}
//         defaultValue={defaultValue}
//         readOnlyLogic={(column: any) => {
//           return column.key === 'acctName' || column.key === 'subAcctName'
//         }}
//         disableLogic={(column: any) => {
//           return (column.key === 'checkNo' && newRowData.code !== "1.01.10") ||
//             (column.key === 'checkDate' && newRowData.code !== "1.01.10") ||
//             (column.key === 'Payto' && newRowData.code !== "1.01.10")
//         }}
//       /> */}

//       <DataGridView
//         rows={cashDisbursement}
//         column={columns}
//         onSave={handleSave}
//         defaultValue={defaultValue}
//       />
//       <Modal open={openJobs} onClose={() => setOpenJobs(false)}>
//         <Box
//           sx={{
//             position: "absolute" as "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 470,
//             bgcolor: "background.paper",
//             p: 4,
//           }}
//         >
//           <IconButton
//             style={{
//               position: "absolute",
//               top: "10px",
//               right: "10px",
//             }}
//             aria-label="search-client"
//             onClick={() => setOpenJobs(false)}
//           >
//             <CloseIcon />
//           </IconButton>
//           <Typography
//             id="modal-modal-title"
//             variant="h6"
//             component="h2"
//             sx={{ marginBottom: "20px" }}
//           >
//             Jobs
//           </Typography>
//           <div
//             style={{
//               width: "400px",
//             }}
//           >
//             <div
//               style={{
//                 width: "100%",
//                 display: "flex",
//                 marginBottom: "10px",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <LocalizationProvider dateAdapter={AdapterDateFns}>
//                 <DatePicker
//                   sx={{
//                     width: "200px",
//                     ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                   }}
//                   slotProps={{
//                     textField: {
//                       size: "small",
//                       name: "",
//                       InputLabelProps: {
//                         style: {
//                           fontSize: "14px",
//                         },
//                       },
//                       InputProps: {
//                         style: { height: "27px", fontSize: "14px" },
//                       },
//                     },
//                   }}
//                   label={"Transaction Date: "}
//                   views={["month", "year"]}
//                   value={state.jobTransactionDate}
//                   onChange={(value) => {
//                     dispatch({
//                       type: "UPDATE_FIELD",
//                       field: "jobTransactionDate",
//                       value: value,
//                     });
//                   }}
//                 />
//               </LocalizationProvider>
//               <FormControlLabel
//                 sx={{
//                   height: "30px",
//                   "& .MuiTypography-root": {
//                     fontSize: "14px",
//                   },
//                 }}
//                 control={
//                   <Checkbox
//                     size="small"
//                     checked={state.jobAutoExp}
//                     onChange={(e) => {
//                       dispatch({
//                         type: "UPDATE_FIELD",
//                         field: "jobAutoExp",
//                         value: !state.jobAutoExp,
//                       });
//                     }}
//                   />
//                 }
//                 label="Auto Explanation"
//               />
//             </div>
//             <FormControl
//               fullWidth
//               size="small"
//               variant="outlined"
//               sx={{
//                 ".MuiFormLabel-root": {
//                   fontSize: "14px",
//                   background: "white",
//                   zIndex: 99,
//                   padding: "0 3px",
//                 },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             >
//               <InputLabel id="label-selection-job-type">Type of Job</InputLabel>
//               <Select
//                 labelId="label-selection-job-type"
//                 value={state.jobType}
//                 name="jobType"
//                 onChange={handleInputChange}
//                 autoWidth
//                 sx={{
//                   height: "27px",
//                   fontSize: "14px",
//                 }}
//               >
//                 <MenuItem value={""}> </MenuItem>
//                 <MenuItem value={"0"}>Reversal of Accrued Interest </MenuItem>
//                 <MenuItem value={"1"}>
//                   {" "}
//                   Income Recognition & Accrual of Interest
//                 </MenuItem>
//                 <MenuItem value={"2"}>Penalty Charges</MenuItem>
//                 <MenuItem value={"3"}>Penalty Income</MenuItem>
//                 <MenuItem value={"4"}>RPT Transaction (NIL-HN)</MenuItem>
//                 <MenuItem value={"5"}>RPT Transaction (AMIFIN)</MenuItem>
//                 <MenuItem value={"6"}>RPT Income</MenuItem>
//                 <MenuItem value={"7"}>Monthly Accrual Expenses</MenuItem>
//                 <MenuItem value={"8"}>Monthly Accrual Income</MenuItem>
//                 <MenuItem value={"9"}>
//                   Production (Milestone Guarantee)
//                 </MenuItem>
//                 <MenuItem value={"10"}>
//                   Production (Liberty Insurance Co.)
//                 </MenuItem>
//                 <MenuItem value={"11"}>Production (Federal Phoenix)</MenuItem>
//               </Select>
//             </FormControl>
//           </div>

//           <div
//             style={{
//               display: "flex",
//               columnGap: "30px",
//               alignItems: "flex-end",
//               marginTop: "20px",
//             }}
//           >
//             <LoadingButton
//               loading={isLoadingJob}
//               color="success"
//               variant="contained"
//               onClick={() => mutateJob(state)}
//             >
//               Create Job
//             </LoadingButton>
//             <Button
//               // ref={checkModalSaveButton}
//               color="error"
//               variant="contained"
//               onClick={() => setOpenJobs(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </Box>
//       </Modal>
//       {ModalChartAccountSearch}
//       {ModalPolicyIdClientIdRefId}
//       {ModalTransactionAccount}
//       {ModalSearchCashDisbursement}
//       {ModalPolicyIdPayTo}
//       {modalVisible && (
//         <div
//           style={{
//             position: 'absolute',
//             top: position.y,
//             left: position.x,
//             backgroundColor: 'white',
//             padding: '10px',
//             border: '1px solid black',
//             borderRadius: '4px',
//             boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//             zIndex: 1000,
//             display: "flex",
//             flexDirection: "column",
//             rowGap: "5px"
//           }}
//         >
//           <Button
//             sx={{
//               height: "22px",
//               fontSize: "11px",
//             }}
//             variant="contained"
//             onClick={() => {

//               if (rigthClickSelected) {
//                 Swal.fire({
//                   title: `Are you sure you want to delete?`,
//                   text: "You won't be able to revert this!",
//                   icon: "warning",
//                   showCancelButton: true,
//                   confirmButtonColor: "#3085d6",
//                   cancelButtonColor: "#d33",
//                   confirmButtonText: "Yes, delete it!",
//                 }).then((result) => {
//                   if (result.isConfirmed) {
//                     setCashDisbursement((d: any) => {
//                       return d.filter(
//                         (items: any) => items.TempID !== rigthClickSelected.TempID
//                       );
//                     });
//                     setRigthClickSelected(null)
//                   }
//                 });
//               }
//             }} >Delete Row</Button>
//           {(rigthClickSelected && rigthClickSelected.code === '1.01.10') &&
//             <Button variant="contained"
//               sx={{
//                 height: "22px",
//                 fontSize: "11px",
//               }}
//               onClick={handleClickPrintCheck}>Print</Button>}
//         </div>
//       )}
//     </div>
//   );
// }

// const DataGridView = ({
//   rows,
//   column,
//   onSave,
//   defaultValue
// }: any) => {
//   const [pageNumber, setPageNumber] = useState(0)
//   const [columns, setColumns] = useState(column.filter((itm: any) => !itm.hide));
//   const [hoveredColumn, setHoveredColumn] = useState(null);

//   const divRef = useRef<HTMLDivElement>(null);

//   const pages = useMemo(() => {
//     let transformed: any = []

//     if (rows.length > 0) {
//       transformed = rows.map((item: any, index: number) => ({
//         RowIndex: index,
//         RowValue: { ...item },
//       }));
//     }

//     const lasttransformed = formatArrayIntoChunks(transformed, 100)
//     return lasttransformed;
//   }, [rows])

//   // State to track which row is in edit mode
//   const [editRowIndex, setEditRowIndex] = useState(null);
//   // State to track temporary input values for the editable row
//   const [editValues, setEditValues] = useState<any>({})


//   // Handle input change
//   const handleInputChange = (key: any, value: any) => {
//     setEditValues((prevValues: any) => ({ ...prevValues, [key]: value }));
//   };
//   // Handle enabling edit mode for a row
//   const handleEditRow = (rowIndex: any) => {
//     setEditRowIndex(rowIndex);
//     setEditValues(pages[pageNumber][rowIndex].RowValue); // Pre-fill the edit values
//   };
//   // Revert value on blur
//   const handleBlur = (rowIndex: any) => {
//     setEditValues((prevEditValues: any) => ({
//       ...prevEditValues,
//       [rowIndex]: { ...pages[pageNumber][rowIndex].RowValue },
//     }));
//   };
//   const handleSaveRow = (rowIndex: any) => {
//     const rowData = { ...editValues };
//     if (rowData) {
//       pages[pageNumber][rowIndex].RowValue = rowData; // Update the existing row with new values
//       console.log('Updated data:', pages[pageNumber][rowIndex]);
//       onSave(rowData); // Call the provided onSave function
//       setEditRowIndex(null); // Exit edit mode
//     }
//   };

//   const startResize = (index: any, e: any) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const startX = e.clientX;
//     const startWidth = columns[index].width;

//     const doDrag = (moveEvent: any) => {
//       const newWidth = startWidth + (moveEvent.clientX - startX);
//       const updatedColumns = [...columns];
//       updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
//       setColumns(updatedColumns);
//     };

//     const stopDrag = () => {
//       document.removeEventListener("mousemove", doDrag);
//       document.removeEventListener("mouseup", stopDrag);
//     };

//     document.addEventListener("mousemove", doDrag);
//     document.addEventListener("mouseup", stopDrag);
//   };
//   const handleMouseEnter = (index: any) => {
//     setHoveredColumn(index); // Set the hovered column index
//   };
//   const handleMouseLeave = () => {
//     setHoveredColumn(null); // Reset hovered column index
//   };
//   function formatArrayIntoChunks(arr: Array<any>, chunkSize = 100) {
//     let result = [];

//     for (let i = 0; i < arr.length; i += chunkSize) {
//       // Use slice to create chunks of 'chunkSize'
//       result.push(arr.slice(i, i + chunkSize));
//     }
//     return result;
//   }


//   console.log(pages[pageNumber])

//   return (
//     <div className="table-frame-color">
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           width: `calc(100vw - 40px)`,
//           height: `300px`,
//           minHeight: "270px"
//         }}
//         className="table-frame"
//       >
//         <div className="table-panel">
//           <div ref={divRef} className={`grid-container`} tabIndex={-1}>
//             <div
//               className="grid-row grid-header"
//               style={{
//                 position: "sticky",
//                 zIndex: "10",
//                 top: "-1px",
//                 background: "white",
//               }}
//             >
//               {columns.map((col: any, index: number) => (
//                 <div
//                   key={index}
//                   className={`grid-cell header-cell ${hoveredColumn === index ? `highlight-column` : ""
//                     }`} // Add the class if hovered
//                   style={{ width: col.width, height: "20px", }}
//                 >
//                   <input
//                     style={{ fontWeight: "bold" }}
//                     defaultValue={col.label}
//                     readOnly
//                     onChange={(e) => { }}
//                   />
//                   <div
//                     className="resize-handle"
//                     onMouseDown={(e) => startResize(index, e)}
//                     onMouseEnter={(e) => {
//                       e.preventDefault();
//                       handleMouseEnter(index);
//                     }} // On hover
//                     onMouseLeave={(e) => {
//                       e.preventDefault();
//                       handleMouseLeave();
//                     }} // On mouse leave
//                   />
//                 </div>
//               ))}
//             </div>
//             {
//               pages[pageNumber]?.map((row: any, rowIndex: number) => {
//                 return (
//                   <div key={rowIndex} className={`grid-row row-${rowIndex}`}>
//                     {
//                       columns.map((column: any, idx: number) => {
//                         return (
//                           <div
//                             key={column.key}
//                             className="grid-cell"
//                             style={{ width: column.width, padding: '8px' }}>
//                             {editRowIndex === row.RowIndex ? (
//                               // Editable fields when in edit mode
//                               <input
//                                 type={column.type === 'number' ? 'number' : 'text'}
//                                 value={editValues[column.key] || ''} // Display current value or empty
//                                 onChange={(e) => handleInputChange(column.key, e.target.value)} // Handle input changes
//                               />
//                             ) : (
//                               // Read-only display when not in edit mode
//                               <span>{row.RowValue[column.key]}</span>
//                             )}
//                           </div>

//                           // <div
//                           //   key={idx}
//                           //   className="grid-cell"
//                           //   style={{
//                           //     width: itm.width,
//                           //     fontSize: "12px",
//                           //     padding: "0 5px"
//                           //   }}
//                           // >
//                           //   <input
//                           //     key={idx}
//                           //     type="text"
//                           //     value={editValues[row.RowIndex]?.[column.key] || ''} // Display the current value
//                           //     // value={row.RowValue[itm.key]}
//                           //     onChange={(e) => {
//                           //       handleInputChange(row.RowIndex, itm.key, e.target.value)
//                           //     }}
//                           //     onKeyPress={(e) => handleKeyPress(e, row.RowIndex)}
//                           //     onBlur={() => handleBlur(row.RowIndex)}
//                           //   />
//                           // </div>
//                         )
//                       })
//                     }
//                     {row.RowIndex !== pages[pageNumber].length - 1 && (
//                       <button onClick={() => handleEditRow(row.RowIndex)}>Edit</button>
//                     )}
//                     {/* Save button when in edit mode */}
//                     {editRowIndex === row.RowIndex && (
//                       <button onClick={() => handleSaveRow(row.RowIndex)}>Save</button>
//                     )}
//                   </div>)
//               })
//             }
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


// const TableWithDynamicColumns = ({
//   cashDisbursement,
//   setCashDisbursement,
//   columns,
//   defaultValue,
//   onRowKeyEvent,
//   newRowData,
//   setNewRowData,
//   readOnlyLogic,
//   disableLogic,
//   editCell,
//   setEditCell
// }: any) => {

//   // Function to handle input changes in the regular rows
//   const handleInputChange = (e: any, rowId: any, columnKey: any) => {
//     const { value } = e.target;
//     setCashDisbursement((prevData: any) =>
//       prevData.map((row: any) =>
//         row.TempID === rowId ? { ...row, [columnKey]: value } : row
//       )
//     );
//   };

//   // Function to handle input changes in the extra row
//   const handleNewRowChange = (e: any) => {
//     const { name, value } = e.target;
//     setNewRowData((prevData: any) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const addRow = () => {
//     let TempID = ''
//     if (cashDisbursement.length > 0) {
//       TempID = String(parseInt(cashDisbursement[cashDisbursement.length - 1].TempID) + 1).padStart(3, '0')
//     } else {
//       TempID = '1'.padStart(3, '0')
//     }
//     const newRow = {
//       ...newRowData,
//       TempID

//     };
//     setCashDisbursement((prevData: any) => [...prevData, newRow]);

//     // Reset the new row data
//     setNewRowData(defaultValue);
//     setEditCell({ TempID: null });

//   };

//   const handleDoubleClick = (TempID: any) => {
//     setEditCell({ TempID });
//   };

//   console.log(cashDisbursement)

//   return (
//     <div>
//       <button onClick={addRow}>Add Row</button>
//       <table border={1} >
//         <thead>
//           <tr>
//             {columns.map((column: any) => (
//               <th style={{
//                 width: `${column.width}`
//               }} key={column.key}>{column.label}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {cashDisbursement.map((row: any) => (
//             <tr key={row.TempID}>
//               {columns.map((column: any) => (
//                 <td key={column.key} style={{ height: "20px" }} >
//                   {column.type === 'text' && (
//                     <input
//                       // disabled={disableLogic(column)}
//                       // readOnly={readOnlyLogic(column)}
//                       id={editCell.TempID === row.TempID ? column.key : ""}
//                       type="text"
//                       name={column.key}
//                       value={row[column.key]}
//                       onChange={(e) => handleInputChange(e, row.TempID, column.key)}
//                       onKeyDown={(e) => {
//                         onRowKeyEvent(e, column.key, addRow)
//                       }}
//                       onDoubleClick={() => {
//                         handleDoubleClick(row.TempID)
//                       }}
//                       style={{
//                         width: `${column.width}`,
//                         height: "auto"
//                       }}
//                     />
//                   )}
//                   {column.type === 'number' && (
//                     <TextFormatedInput

//                       onChange={(e) => {
//                         handleInputChange(e, row.TempID, column.key)
//                       }}
//                       label={{
//                         title: "",
//                       }}
//                       input={{
//                         // disabled: disableLogic(column),
//                         // readOnly: readOnlyLogic(column),
//                         id: editCell.TempID === row.TempID ? column.key : "",
//                         name: column.key,
//                         value: row[column.key],
//                         type: "text",
//                         style: {
//                           width: `${column.width}`,
//                           height: "auto"
//                         },
//                         onKeyDown: (e: any) => {
//                           onRowKeyEvent(e, column.key, addRow)
//                         },
//                         onDoubleClick: () => {
//                           handleDoubleClick(row.TempID)
//                         }
//                       }}
//                     />
//                   )}
//                   {column.type === 'select' && (
//                     <select
//                       onChange={e => handleInputChange(e, row.TempID, column.key)}
//                       style={{
//                         width: `${column.width}`
//                       }}

//                       // disabled={disableLogic(column)}
//                       id={editCell.TempID === row.TempID ? column.key : ""}
//                       name={column.key}
//                       value={row[column.key]}
//                       onKeyDown={(e) => {
//                         onRowKeyEvent(e, column.key, addRow)
//                       }}
//                       onDoubleClick={() => {
//                         handleDoubleClick(row.TempID)
//                       }}
//                     >
//                       {column.options.map((option: any) => (
//                         <option key={option} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </td>
//               ))}
//             </tr>
//           ))}
//           <tr>
//             {columns.map((column: any) => (
//               <td key={column.key} style={{ height: "auto" }}>
//                 {column.type === 'text' && (
//                   <input
//                     onDoubleClick={() => {
//                       handleDoubleClick('000-99123')
//                     }}
//                     disabled={disableLogic(column)}
//                     readOnly={readOnlyLogic(column)}
//                     id={editCell.TempID ? "" : column.key}
//                     type="text"
//                     name={column.key}
//                     value={newRowData[column.key]}
//                     onChange={handleNewRowChange}
//                     onKeyDown={(e) => {
//                       onRowKeyEvent(e, column.key, addRow)
//                     }}

//                   />
//                 )}
//                 {column.type === 'number' && (
//                   <TextFormatedInput
//                     onChange={(e) => {
//                       handleNewRowChange(e)
//                     }}
//                     label={{
//                       title: "",
//                     }}
//                     input={{
//                       disabled: disableLogic(column),
//                       readOnly: readOnlyLogic(column),
//                       id: editCell.TempID ? "" : column.key,
//                       name: column.key,
//                       value: newRowData[column.key],
//                       type: "text",
//                       style: { flex: 1 },
//                       onKeyDown: (e: any) => {
//                         onRowKeyEvent(e, column.key, addRow)
//                       },
//                       onDoubleClick: () => {
//                         handleDoubleClick('000-99123')
//                       }
//                     }}

//                   />
//                 )}
//                 {column.type === 'select' && (
//                   <select
//                     disabled={disableLogic(column)}
//                     id={editCell.TempID ? "" : column.key}
//                     name={column.key}
//                     value={newRowData[column.key]}
//                     onChange={handleNewRowChange}
//                     onKeyDown={(e) => {
//                       onRowKeyEvent(e, column.key, addRow)
//                     }}
//                     onDoubleClick={() => {
//                       handleDoubleClick('000-99123')
//                     }}

//                   >
//                     {column.options.map((option: any) => (
//                       <option key={option} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </td>
//             ))}
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// };

// function setNewStateValue(dispatch: any, obj: any) {
//   Object.entries(obj).forEach(([field, value]) => {
//     dispatch({ type: "UPDATE_FIELD", field, value });
//   });
// }
