import { useReducer, useContext, useState, useRef } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputAdornment,
  IconButton,
  InputLabel,
  OutlinedInput,
  Autocomplete,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import CustomDatePicker from "../../../../components/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery, QueryClient } from "react-query";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { wait } from "../../../../lib/wait";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import Table from "../../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PageHelmet from "../../../../components/Helmet";

const initialState = {
  sub_refNo: "",
  refNo: "",
  datePetty: new Date(),
  payee: "",
  explanation: "",
  transactionPurpose: "",
  transactionCode: "",
  transactionTitle: "",
  transactionShort: "",
  clientName: "",
  clientID: "",
  amount: "",
  invoice: "",
  option: "non-vat",
  search: "",
  pettyCashMode: "",
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
  { field: "purpose", headerName: "Purpose", flex: 1, minWidth: 400 },
  { field: "amount", headerName: "Amount", minWidth: 170 },
  {
    field: "usage",
    headerName: "Usage",
    flex: 1,
    minWidth: 300,
  },
  { field: "accountID", headerName: "Account ID", flex: 1, minWidth: 300 },
  { field: "sub_account", headerName: "Sub Account", minWidth: 80 },
  { field: "clientID", headerName: "ID No", minWidth: 100 },
  // hide
  { field: "clientName", headerName: "Name", flex: 1, minWidth: 300 },
  { field: "accountCode", headerName: "Accoount Code", minWidth: 200 },
  {
    field: "accountShort",
    headerName: "Account Short",
    flex: 1,
    minWidth: 200,
  },
  { field: "vatType", headerName: "Vat Type", flex: 1, minWidth: 100 },
  { field: "invoice", headerName: "Invoice", flex: 1, minWidth: 100 },
  { field: "TempID", headerName: "TempId", hide: true },
];

export const chartColumn = [
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Acct_Title", headerName: "Title", flex: 1 },
  { field: "Short", headerName: "Short Name", flex: 1 },
];

export default function PettyCash() {
  const refParent = useRef<HTMLDivElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [editTransaction, setEditTransaction] = useState({
    edit: false,
    updateId: "",
  });
  const [pettyCash, setPettyCash] = useState<GridRowSelectionModel>([]);
  const datePickerRef = useRef<HTMLElement>(null);
  const reloadIDButtonRef = useRef<HTMLButtonElement>(null);
  const payeeInputRef = useRef<HTMLInputElement>(null);
  const explanationInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  let creditTransactionRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const pdcSearchInput = useRef<HTMLInputElement>(null);
  const queryClient = new QueryClient();
  const isDisableField = state.pettyCashMode === "";
  const table = useRef<any>(null);
  const chartAccountSearchRef = useRef<HTMLInputElement>(null);


  const dateRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const usageRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);

  const {
    isLoading: loadingPettyCashIdGenerator,
    refetch: refetchettyCashIdGenerator,
  } = useQuery({
    queryKey: "petty-cash-id-generator",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-petty-cash-id`, {
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
        value: response.data.pettyCashId[0].petty_cash_id,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "sub_refNo",
        value: response.data.pettyCashId[0].petty_cash_id,
      });
    },
  });
  const {
    isLoading: loadingAddUpdatePettyCash,
    mutate: mutateAddUpdatePettyCash,
  } = useMutation({
    mutationKey: "add-update-petty-cash",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/task/accounting/add-petty-cash`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      if (response.data.success) {
        initialState.pettyCashMode = "";
        setNewStateValue(dispatch, initialState);
        refetchettyCashIdGenerator();
        setPettyCash([]);
        queryClient.invalidateQueries("petty-cash-search");
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
    isLoading: isLoadingLoadSelectedPettyCash,
    mutate: mutateLoadSelectedPettyCash,
  } = useMutation({
    mutationKey: "load-selected-petty-cash",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/task/accounting/load-selected-petty-cash`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (data) => {
      const response = data as any;
      const loadPettyCash = response.data.loadSelectedPettyCash;

      setNewStateValue(dispatch, {
        ...state,
        ...{
          sub_refNo: loadPettyCash[0].PC_No,
          refNo: loadPettyCash[0].PC_No,
          datePetty: loadPettyCash[0].PC_Date,
          payee: loadPettyCash[0].Payee,
          explanation: loadPettyCash[0].Explanation,
          pettyCashMode: "edit",
        },
      });
      setPettyCash(loadPettyCash);
    },
  });

  const {
    ModalComponent: ModalChartAccount,
    openModal: openChartAccount,
    isLoading: isLoadingChartAccount,
    closeModal: closeChartAccount,
  } = useQueryModalTable({
    link: {
      url: "/reference/get-chart-accounts",
      queryUrlName: "chartAccountSearch",
    },
    columns: chartColumn,
    queryKey: "get-chart-accounts",
    uniqueId: "Acct_Code",
    responseDataKey: "chartAccount",
    onSelected: (selectedRowData) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "transactionCode",
        value: selectedRowData[0].Acct_Code,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "transactionTitle",
        value: selectedRowData[0].Acct_Title,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "transactionShort",
        value: selectedRowData[0].Short,
      });
      closeChartAccount();
      wait(200).then(() => {
        usageRef.current?.focus()
      })
    },

    searchRef: chartAccountSearchRef,
  });

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
        field: "clientName",
        value: selectedRowData[0].Name,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "clientID",
        value: selectedRowData[0].IDNo,
      });
      closeCliendIDsModal();
      wait(200).then(() => {
        vatRef.current?.focus()
      })
    },
    searchRef: pdcSearchInput,
  });
  const {
    ModalComponent: ModalSearchPettyCash,
    openModal: openModalSearchPettyCash,
    isLoading: isLoadingModalSearchPettyCash,
    closeModal: closeModalSearchPettyCash,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-petty-cash",
      queryUrlName: "searchPettyCash",
    },
    columns: [
      { field: "PC_Date", headerName: "Type", width: 130 },
      { field: "PC_No", headerName: "ID No.", width: 200 },
      {
        field: "Payee",
        headerName: "Name",
        flex: 1,
      },
      {
        field: "Explanation",
        headerName: "ID",
        flex: 1,
      },
      {
        field: "Explanation",
        headerName: "ID",
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "petty-cash-search",
    uniqueId: "PC_No",
    responseDataKey: "searchPettyCash",
    onSelected: (selectedRowData) => {
      mutateLoadSelectedPettyCash({ PC_No: selectedRowData[0].PC_No });
      dispatch({
        type: "UPDATE_FIELD",
        field: "pettyCashMode",
        value: "edit",
      });
      closeModalSearchPettyCash();
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: pdcSearchInput,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function handleOnSave() {
    if (state.payee.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Payee is too long!",
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
    if (state.amount.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Amount is too long!",
        timer: 1500,
      });
    }
    if (state.clientID.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Usage is too long!",
        timer: 1500,
      });
    }
    if (state.payee === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide payee!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          payeeInputRef.current?.focus();
        });
      });
    }
    if (state.explanation === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide explanation!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          explanationInputRef.current?.focus();
        });
      });
    }
    if (pettyCash.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide transaction entry!",
        timer: 1500,
      });
    }
    if (state.pettyCashMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateAddUpdatePettyCash({
            refNo: state.refNo,
            datePetty: state.datePetty,
            payee: state.payee,
            explanation: state.explanation,
            hasSelected: state.pettyCashMode === "edit",
            pettyCash,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAddUpdatePettyCash({
            refNo: state.refNo,
            datePetty: state.datePetty,
            payee: state.payee,
            explanation: state.explanation,
            hasSelected: state.pettyCashMode === "edit",
            pettyCash,
          });
        },
      });
    }
  }
  function handleAddTransaction() {
    if (state.transactionCode === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide transaction",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          creditTransactionRef.current?.focus();
        });
      });
    }
    if (state.clientID === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide usage",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          openCliendIDsModal();
        });
      });
    }
    if (state.amount === "" || parseFloat(state.amount.replace(/,/g, "")) < 1) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide proper amount",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          amountRef.current?.focus();
        });
      });
    }
    setPettyCash((d) => {
      let FirstTempId = "";
      if (editTransaction.edit) {
        FirstTempId = editTransaction.updateId;
      } else {
        FirstTempId = generateID(
          d.length > 0 ? (d[d.length - 1] as any).TempID : "000"
        );
      }

      const addPettyCashTransaction: Array<any> = [];
      d = d.filter((item: any) => item.TempID !== FirstTempId);

      addPettyCashTransaction.push({
        purpose: state.transactionPurpose,
        amount: parseFloat(state.amount).toLocaleString("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        usage: `${state.clientName} > ${state.clientID} > HO`,
        accountID: `${state.transactionShort} > ${state.transactionCode}`,
        sub_account: "HO",
        clientID: state.clientID,
        clientName: state.clientName,
        accountCode: state.transactionCode,
        accountShort: state.transactionShort,
        vatType: state.option.toUpperCase(),
        invoice: state.invoice,
        TempID: FirstTempId,
      });

      if (state.transactionPurpose !== "Input Tax" && state.option === "vat") {
        const SecondTempId = generateID((d[d.length - 1] as any).TempID);
        const taxableAmount = parseFloat(state.amount.replace(/,/g, "")) / 1.12;
        const inputTax = taxableAmount * 0.12;
        addPettyCashTransaction.push({
          purpose: state.transactionPurpose,
          amount: parseFloat(inputTax.toFixed(2)).toLocaleString("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          usage: `${state.clientName} > ${state.clientID} > HO`,
          accountID: `${state.transactionShort} > ${state.transactionCode}`,
          sub_account: "HO",
          clientID: state.clientID,
          clientName: state.clientName,
          accountCode: "1.06.02",
          accountShort: "Input Tax",
          vatType: state.option.toUpperCase(),
          invoice: state.invoice,
          TempID: SecondTempId,
        });
      }

      function generateID(lastItem: any) {
        const numericPart = (parseInt(lastItem.match(/\d+/)[0]) + 1)
          .toString()
          .padStart(3, "0");
        return numericPart;
      }

      d = [...d, ...addPettyCashTransaction];
      return d;
    });
    initialState.datePetty = state.datePetty;
    initialState.payee = state.payee;
    initialState.explanation = state.explanation;
    initialState.pettyCashMode = state.pettyCashMode;
    initialState.sub_refNo = state.sub_refNo;
    initialState.refNo = state.refNo;
    setNewStateValue(dispatch, initialState);
    setEditTransaction({ edit: false, updateId: "" });
  }

  return (
    <>
      <PageHelmet title="Petty Cash" />

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
          {isLoadingModalSearchPettyCash ? (
            <LoadingButton loading={isLoadingModalSearchPettyCash} />
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
                  return openModalSearchPettyCash(
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
          {state.pettyCashMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "pettyCashMode",
                  value: "add",
                });
              }}
            >
              New
            </Button>
          )}
          <LoadingButton
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            id="save-entry-header"
            color="primary"
            variant="contained"
            type="submit"
            onClick={handleOnSave}
            disabled={state.pettyCashMode === ""}
            startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
            loading={loadingAddUpdatePettyCash}
          >
            {state.pettyCashMode === "edit" ? "Update" : "Save"}
          </LoadingButton>
          {state.pettyCashMode !== "" && (
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
                    initialState.pettyCashMode = "";
                    setNewStateValue(dispatch, initialState);
                    refetchettyCashIdGenerator();
                    setPettyCash([]);
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
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
          {loadingPettyCashIdGenerator ? (
            <LoadingButton loading={loadingPettyCashIdGenerator} />
          ) : (
            <FormControl
              sx={{
                width: "160px",
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
              disabled={isDisableField}
            >
              <InputLabel htmlFor="return-check-id-field">Ref. No.</InputLabel>
              <OutlinedInput

                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                disabled={isDisableField}
                label="Ref. No."
                name="refNo"
                value={state.refNo}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    // return handleOnSave();
                    dateRef.current?.focus()
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
                        refetchettyCashIdGenerator();
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
                field: "datePetty",
                value: value,
              });
            }}
            value={new Date(state.datePetty)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                // const timeout = setTimeout(() => {
                //   datePickerRef.current?.querySelector("button")?.click();
                //   clearTimeout(timeout);
                // }, 150);
                payeeInputRef.current?.focus()
              }
            }}
            inputRef={dateRef}
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
            datePickerRef={datePickerRef}
          />
          <TextField
            disabled={isDisableField}
            label="Payee"
            size="small"
            name="payee"
            value={state.payee}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                explanationInputRef.current?.focus()
              }
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px", width: "280px" },
            }}
            sx={{
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            inputRef={payeeInputRef}
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
                // return handleOnSave();
                accountRef.current?.focus()
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
            inputRef={explanationInputRef}
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


            {isLoadingChartAccount ? (
              <LoadingButton loading={isLoadingChartAccount} />
            ) : (
              <FormControl
                variant="outlined"
                size="small"
                disabled={isDisableField}
                sx={{
                  width: "350px",
                  ".MuiFormLabel-root": {
                    fontSize: "14px",
                    background: "white",
                    zIndex: 99,
                    padding: "0 3px",
                  },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              >
                <InputLabel htmlFor="chart-account-id">Account</InputLabel>
                <OutlinedInput
                  inputRef={accountRef}
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                  disabled={isDisableField}
                  fullWidth
                  label="Account"
                  name="transactionTitle"
                  value={state.transactionTitle}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      e.preventDefault();
                      return openChartAccount(state.transactionTitle);
                    }
                  }}
                  id="chart-account-id"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        disabled={isDisableField}
                        aria-label="search-client"
                        color="secondary"
                        edge="end"
                        onClick={() => {
                          openChartAccount(state.transactionTitle);
                        }}
                      >
                        <ManageAccountsIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            )}

            {isLoadingClientIdsModal ? (
              <LoadingButton loading={isLoadingClientIdsModal} />
            ) : (
              <FormControl
                sx={{
                  minWidth: "400px",
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
                disabled={isDisableField}
              >
                <InputLabel htmlFor="client-list">Usage</InputLabel>
                <OutlinedInput
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                  inputRef={usageRef}
                  disabled={isDisableField}
                  label="Usage"
                  name="clientName"
                  value={state.clientName}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      e.preventDefault();
                      return openCliendIDsModal(state.clientName);
                    }
                  }}
                  id="client-list"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        ref={reloadIDButtonRef}
                        disabled={isDisableField}
                        color="secondary"
                        edge="end"
                        onClick={() => {
                          openCliendIDsModal(state.clientName);
                        }}
                      >
                        <PersonSearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            )}
            <Select
              labelId="label-selection-reason"
              value={state.option}
              name="option"
              onChange={handleInputChange}
              disabled={isDisableField}
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
                width: "200px",
              }}
              inputRef={vatRef}
            >
              <MenuItem onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  wait(200).then(() => {
                    amountRef.current?.focus()
                  })
                }
              }} value="vat">VAT</MenuItem>
              <MenuItem onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  wait(200).then(() => {
                    amountRef.current?.focus()
                  })
                }
              }} value={"non-vat"}>NON-VAT</MenuItem>
            </Select>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <TextField
              sx={{
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              disabled={isDisableField}
              name="amount"
              label="Amount"
              size="small"
              value={state.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                inputRef: amountRef,
                style: { height: "27px", fontSize: "14px", width: "200px" },
              }}
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "amount",
                  value: parseFloat(state.amount.replace(/,/g, "")).toFixed(2),
                });
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  invoiceRef.current?.focus()
                }
              }}
            />
            <TextField
              sx={{
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              InputProps={{
                inputRef: invoiceRef,
                style: { height: "27px", fontSize: "14px", width: "300px" },
              }}
              disabled={isDisableField}
              label="Invoice"
              size="small"
              name="invoice"
              value={state.invoice}
              onChange={handleInputChange}
              onKeyDown={(e: any) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return handleAddTransaction();
                }
              }}
              inputRef={invoiceInputRef}
            />
            <Button
              disabled={isDisableField}
              color="success"
              variant="contained"
              style={{ gridArea: "button", height: "27px", fontSize: "14px" }}
              startIcon={<AddIcon />}
              onClick={() => {
                handleAddTransaction();
              }}
            >
              {editTransaction.edit ? "Update Transaction" : "add Transaction"}
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
                loadingAddUpdatePettyCash || isLoadingLoadSelectedPettyCash
              }
              columns={selectedCollectionColumns}
              rows={pettyCash}
              table_id={"TempID"}
              isSingleSelection={true}
              isRowFreeze={false}
              dataSelection={(selection, data, code) => {
                const rowSelected = data.filter(
                  (item: any) => item.TempID === selection[0]
                )[0];
                if (rowSelected === undefined || rowSelected.length <= 0) {
                  setEditTransaction({
                    edit: false,
                    updateId: "",
                  });
                  setNewStateValue(dispatch, {
                    ...state,
                    ...{
                      transactionPurpose: "",
                      transactionCode: "",
                      transactionTitle: "",
                      transactionShort: "",
                      clientName: "",
                      clientID: "",
                      amount: "",
                      invoice: "",
                      option: "non-vat",
                    },
                  });
                  return;
                }

                if (code === "Delete" || code === "Backspace") {
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
                      return setPettyCash((dt) => {
                        return dt.filter(
                          (item: any) => item.TempID !== selection[0]
                        );
                      });
                    }
                    table.current?.removeSelection();
                  });
                  return;
                }
                setNewStateValue(dispatch, {
                  ...state,
                  ...{
                    transactionPurpose: rowSelected.purpose,
                    transactionCode: rowSelected.accountCode,
                    transactionTitle: rowSelected.purpose,
                    transactionShort: rowSelected.DRShort,
                    clientName: rowSelected.clientName,
                    clientID: rowSelected.clientID,
                    amount: rowSelected.amount,
                    invoice: rowSelected.invoice,
                    option: rowSelected.vatType.toLowerCase(),
                  },
                });
                setEditTransaction({
                  edit: true,
                  updateId: rowSelected.TempID,
                });
              }}
            />
          </Box>
        </div>
        {ModalClientIDs}
        {ModalSearchPettyCash}
        {ModalChartAccount}
      </div>
    </>

  );
}

function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
