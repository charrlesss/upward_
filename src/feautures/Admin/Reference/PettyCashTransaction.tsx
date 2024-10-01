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
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { pink } from "@mui/material/colors";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import { wait } from "../../../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import useQueryModalTable from "../../../hooks/useQueryModalTable";
import { LoadingButton } from "@mui/lab";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";

const initialState = {
  Purpose: "",
  Short: "",
  Acct_Code: "",
  mode: "",
  search: "",
  Inactive: false,
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

export const pettyCashtransactionColumn = [
  { field: "Petty_Log", headerName: "ID#", hide: true },
  { field: "Purpose", headerName: "Description", flex: 1 },
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Short", headerName: "Account Name", flex: 1 },
  { field: "Inactive", headerName: "Inactive", flex: 1 },
];

export const chartColumn = [
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Acct_Title", headerName: "Title", flex: 1 },
  { field: "Short", headerName: "Short Name", flex: 1 },
];

const queryKey = "petty-cash-transaction";

export default function PettyCashTransaction() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);
  const chartAccountSearchRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { isLoading, refetch: refetchTransactionSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-petty-cash-transaction?pettyCashtTransactionSearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.pettyCashTransaction);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/add-petty-cash-transaction",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/update-petty-cash-transaction",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/delete-petty-cash-transaction",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess,
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
        field: "Short",
        value: selectedRowData[0].Acct_Title,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "Acct_Code",
        value: selectedRowData[0].Acct_Code,
      });
      closeChartAccount();
    },

    searchRef: chartAccountSearchRef,
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave(e: any) {
    if (state.Purpose === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Purpose is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Short === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Short is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Purpose.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "success",
        title: "Purpose is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    e.preventDefault();
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

  function onSuccess(res: any) {
    if (res.data.success) {
      queryClient.invalidateQueries(queryKey);
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

  function resetModule() {
    setNewStateValue(dispatch, initialState);
    table.current?.removeSelection();
    wait(500).then(() => {
      refetchTransactionSearch();
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
      {/* <Box>
        <Typography variant="h5" sx={{ marginBottom: "10px" }}>
          Petty Cash Details
        </Typography>
      </Box> */}
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
              width: "500px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return refetchTransactionSearch();
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
                variant="contained"
                startIcon={<AddIcon />}
                id="entry-header-save-button"
                onClick={() => {
                  handleInputChange({ target: { value: "add", name: "mode" } });
                }}
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
              >
                New
              </Button>
            )}

            <LoadingButton
              id="save-entry-header"
              color="primary"
              variant="contained"
              type="submit"
              onClick={handleOnSave}
              disabled={state.mode === ""}
              startIcon={<SaveIcon />}
              loading={loadingAdd || loadingEdit}
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
            >
              Save
            </LoadingButton>
            {state.mode !== "" && (
              <Button
                variant="contained"
                startIcon={<CloseIcon />}
                color="error"
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
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
              sx={{
                height: "30px",
                fontSize: "11px",
                backgroundColor: pink[500],
                "&:hover": {
                  backgroundColor: pink[600],
                },
              }}
              loading={loadingDelete}
              disabled={state.mode !== "edit"}
              startIcon={<DeleteIcon />}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Petty_Log: state.Petty_Log,
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
        onSubmit={handleOnSave}
        onKeyDown={(e) => {
          if (["Short"].includes((e.target as any).name)) {
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
            display: "flex",
            columnGap: "15px",
            flexDirection: "row",
            alignItems: "center",
            [theme.breakpoints.down("md")]: {
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
                label="Purpose"
                name="Purpose"
                value={state.Purpose}
                onChange={handleInputChange}
                disabled={state.mode === ""}
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

              {isLoadingChartAccount ? (
                <LoadingButton loading={isLoadingChartAccount} />
              ) : (
                <FormControl
                  variant="outlined"
                  size="small"
                  disabled={state.mode === ""}
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
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    disabled={state.mode === ""}
                    fullWidth
                    label="Account"
                    name="Short"
                    value={state.Short}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        e.preventDefault();
                        return openChartAccount(state.Short);
                      }
                    }}
                    id="chart-account-id"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          disabled={state.mode === ""}
                          aria-label="search-client"
                          color="secondary"
                          edge="end"
                          onClick={() => {
                            openChartAccount(state.Short);
                          }}
                        >
                          <ManageAccountsIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}

              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                control={
                  <Checkbox
                    disabled={state.mode === ""}
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
            height: `${refParent.current?.getBoundingClientRect().height}px`,
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={isLoading || loadingAdd || loadingEdit || loadingDelete}
            columns={pettyCashtransactionColumn}
            rows={rows}
            table_id={"Petty_Log"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.Petty_Log === selection[0]
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
                      Petty_Log: rowSelected.Petty_Log,
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
              setNewStateValue(dispatch, newState);
            }}
          />
        </Box>
      </div>
      {ModalChartAccount}
    </div>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
