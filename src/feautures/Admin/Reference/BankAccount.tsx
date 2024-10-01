import React, { useContext, useState, useRef, useReducer } from "react";

import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { pink } from "@mui/material/colors";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import { wait } from "../../../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { LoadingButton } from "@mui/lab";
import useQueryModalTable from "../../../hooks/useQueryModalTable";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";

const initialState = {
  Account_No: "",
  Account_Name: "",
  Account_Type: "",
  Desc: "",
  Option: 0,
  Account_ID: "",
  Inactive: false,
  IDNo: "",
  Account_ID_Name: "",
  Identity: "",
  BankName: "",
  Auto: "",
  mode: "",
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
export const bankAccountColumn = [
  { field: "Auto", headerName: "Auto", hide: true },
  { field: "Account_No", headerName: "Account No#", width: 300 },
  { field: "Account_Name", headerName: "Account Name", flex: 1 },
  { field: "Account_Type", headerName: "Account Type", flex: 1 },
  { field: "Desc", headerName: "Bank Name", flex: 1 },
  { field: "Account_ID", headerName: "Account ID", flex: 1 },
  { field: "Inactive", headerName: "Inactive", flex: 1 },
  { field: "IDNo", headerName: "ID No", flex: 1 },
  { field: "Identity", headerName: "Identity", flex: 1 },
];
export const chartColumn = [
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Acct_Title", headerName: "Title", flex: 1 },
  { field: "Short", headerName: "Short Name", flex: 1 },
];
export const bannkColumn = [
  { field: "Bank_Code", headerName: "Code", flex: 1 },
  { field: "Bank", headerName: "Bank Name", flex: 1 },
];
export const clientColumn = [
  { field: "entry_client_id", headerName: "ID", width: 130 },
  { field: "fullname", headerName: "First Name", flex: 1 },
  {
    field: "entry_type",
    headerName: "ID Type",
    width: 150,
  },
];

export default function BankAccount() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const clientSearchInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const table = useRef<any>(null);
  const { isLoading, refetch: refetchBankAccountSearch } = useQuery({
    queryKey: "bank-account-trans",
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-bank-account?bankAccountSearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.bankAccount);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "bank-account-actions",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "bank-account-actions",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/update-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "bank-account-actions",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/delete-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const {
    ModalComponent: ModalBank,
    openModal: openBank,
    isLoading: isLoadingBank,
    closeModal: closeBank,
  } = useQueryModalTable({
    link: {
      url: "/reference/get-banks",
      queryUrlName: "bankSearch",
    },
    columns: bannkColumn,
    queryKey: "get-banks",
    uniqueId: "Bank_Code",
    responseDataKey: "bank",
    onSelected: (selectedRowData) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "BankName",
        value: selectedRowData[0].Bank,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "Desc",
        value: selectedRowData[0].Bank_Code,
      });
      closeBank();
    },
    searchRef: clientSearchInput,
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
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "Account_ID_Name",
        value: selectedRowData[0].Acct_Title,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "Account_ID",
        value: selectedRowData[0].Acct_Code,
      });
      closeChartAccount();
    },
    searchRef: clientSearchInput,
  });
  const {
    ModalComponent: ModalSearchClient,
    openModal: openSearchClient,
    isLoading: isLoadingSearchClient,
    closeModal: closeSearchClient,
  } = useQueryModalTable({
    link: {
      url: "/reference/search-client",
      queryUrlName: "searchClientInput",
    },
    columns: [
      { field: "IDNo", headerName: "ID No.", width: 150 },
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
    queryKey: "search-client",
    uniqueId: "ID",
    responseDataKey: "client",
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "IDNo",
        value: selectedRowData[0].IDNo,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "Identity",
        value: selectedRowData[0].Name,
      });
      closeSearchClient();
    },
    searchRef: clientSearchInput,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function handleOnSave(e: any) {
    e.preventDefault();
    if (state.Account_No === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account No is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_Name === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Name is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_Type === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Type is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_ID === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account ID is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.BankName === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Bank is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Identity === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Identity is Required Field",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_No.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account No is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_Name >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Name is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_Type >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Type is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account_ID >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account ID is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.BankName >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "invalid Bank is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Identity >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "invalid identity is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.mode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateEdit({ ...state, userCodeConfirmation });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAdd(state);
        },
      });
    }
  }
  function resetModule() {
    setNewStateValue(dispatch, initialState);
    table.current?.removeSelection();
    wait(500).then(() => {
      refetchBankAccountSearch();
    });
  }
  function onSuccess(res: any) {
    if (res.data.success) {
      queryClient.invalidateQueries("bank-account-trans");
      resetModule();
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
  }

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
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          columnGap: "20px",
          [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "flex-start",
            marginBottom: "15px",
          },
        })}
      >
        <div
          style={{
            marginTop: "10px",
            marginBottom: "12px",
            width: "100%",
          }}
        >
          <TextField
            label="Search"
            fullWidth
            size="small"
            type="text"
            name="search"
            value={state.search}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return refetchBankAccountSearch();
              }
            }}
          />
        </div>
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
            {state.mode === "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon />}
                id="entry-header-save-button"
                onClick={() => {
                  handleInputChange({ target: { value: "add", name: "mode" } });
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
              startIcon={<SaveIcon />}
              loading={loadingAdd || loadingEdit}
              disabled={state.mode === ""}
            >
              Save
            </LoadingButton>
            {state.mode !== "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<CloseIcon />}
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
                      resetModule();
                    }
                  });
                }}
              >
                Cancel
              </Button>
            )}

            <LoadingButton
              id="save-entry-header"
              variant="contained"
              loading={loadingDelete}
              sx={{
                height: "30px",
                fontSize: "11px",
                backgroundColor: pink[500],
                "&:hover": {
                  backgroundColor: pink[600],
                },
              }}
              startIcon={<DeleteIcon />}
              disabled={state.mode !== "edit"}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Auto: state.Auto,
                      userCodeConfirmation,
                    });
                  },
                });
              }}
            >
              Delete
            </LoadingButton>
          </div>
        </div>
      </Box>
      <form
        onKeyDown={(e) => {
          if (
            ["Account_ID_Name", "BankName", "IDNo"].includes(
              (e.target as any).name
            )
          ) {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
            }
            return;
          }
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault();
            handleOnSave(e);
            return;
          }
        }}
      >
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            columnGap: "15px",
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
              rowGap: "10px",
            },
          })}
        >
          {!isLoading && (
            <React.Fragment>
              <TextField
                required
                variant="outlined"
                size="small"
                label="Account No"
                name="Account_No"
                value={state.Account_No}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                disabled={state.mode === "" || state.mode === "edit"}
              />
              <TextField
                required
                variant="outlined"
                size="small"
                label="Account Name"
                name="Account_Name"
                value={state.Account_Name}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                disabled={state.mode === ""}
              />
              <TextField
                required
                variant="outlined"
                size="small"
                label="Account Type"
                name="Account_Type"
                value={state.Account_Type}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                disabled={state.mode === ""}
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                  minWidth: "200px",
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="Inactive"
                    checked={state.Inactive}
                    onChange={(e) => {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "Inactive",
                        value: e.target.checked,
                      });
                    }}
                  />
                }
                label="Mark as Inactive"
              />
            </React.Fragment>
          )}
        </Box>
        <br />
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            columnGap: "15px",
            gap: "20px",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            position: "relative",
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
              rowGap: "10px",
            },
          })}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              background: "white",
              padding: "0 5px",
            }}
          >
            Deposit Slip
          </span>
          {isLoadingBank ? (
            <LoadingButton loading={isLoadingBank} />
          ) : (
            <FormControl
              disabled={state.mode === ""}
              variant="outlined"
              size="small"
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
              <InputLabel htmlFor="Bank">Bank</InputLabel>
              <OutlinedInput
                disabled={state.mode === ""}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                fullWidth
                label="Bank"
                name="BankName"
                value={state.BankName}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openBank(state.BankName);
                  }
                }}
                id="Bank"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disabled={state.mode === ""}
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openBank(state.BankName);
                      }}
                    >
                      <AccountBalanceIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
          {isLoadingChartAccount ? (
            <LoadingButton loading={isLoadingChartAccount} />
          ) : (
            <FormControl
              disabled={state.mode === ""}
              variant="outlined"
              size="small"
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
              <InputLabel htmlFor="account">Account</InputLabel>
              <OutlinedInput
                disabled={state.mode === ""}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                fullWidth
                label="Account"
                name="Account_ID_Name"
                value={state.Account_ID_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openChartAccount(state.Account_ID_Name);
                  }
                }}
                id="account"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disabled={state.mode === ""}
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openChartAccount(state.Account_ID_Name);
                      }}
                    >
                      <SwitchAccountIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
          {isLoadingSearchClient ? (
            <LoadingButton loading={isLoadingSearchClient} />
          ) : (
            <FormControl
              disabled={state.mode === ""}
              variant="outlined"
              size="small"
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
              <InputLabel htmlFor="ID-No">ID No</InputLabel>
              <OutlinedInput
                disabled={state.mode === ""}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                fullWidth
                label="ID No"
                name="IDNo"
                value={state.IDNo}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    return openSearchClient(state.IDNo);
                  }
                }}
                id="ID-No"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disabled={state.mode === ""}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        openSearchClient(state.IDNo);
                      }}
                    >
                      <PersonSearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
          <TextField
            disabled={state.mode === ""}
            required
            variant="outlined"
            size="small"
            label="Identity"
            name="Identity"
            value={state.Identity}
            onChange={handleInputChange}
            InputProps={{
              readOnly: true,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        </Box>
      </form>
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
            height: `${
              refParent.current?.getBoundingClientRect().height as number
            }px`,
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={isLoading || loadingAdd || loadingEdit || loadingDelete}
            columns={bankAccountColumn}
            rows={rows}
            table_id={"Auto"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.Auto === selection[0]
              )[0];
              if (rowSelected === undefined || rowSelected.length <= 0) {
                setNewStateValue(dispatch, initialState);
                handleInputChange({ target: { value: "", name: "mode" } });
                return;
              }
              handleInputChange({ target: { value: "edit", name: "mode" } });

              if (code === "Delete" || code === "Backspace") {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Auto: rowSelected.Auto,
                      userCodeConfirmation,
                    });
                  },
                });

                return;
              }

              const newState = {
                ...rowSelected,
                Inactive: rowSelected.Inactive !== "NO",
              };
              console.log(newState);
              setNewStateValue(dispatch, newState);
            }}
          />
        </Box>
      </div>
      {ModalSearchClient}
      {ModalChartAccount}
      {ModalBank}
    </div>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
