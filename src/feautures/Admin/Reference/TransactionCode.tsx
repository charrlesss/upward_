import React, { useContext, useState, useRef, useReducer } from "react";
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
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
import { LoadingButton } from "@mui/lab";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";

const initialState = {
  Code: "",
  Description: "",
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

export const transactionCodeColumn = [
  { field: "Code", headerName: "Code", flex: 1 },
  { field: "Description", headerName: "Description", flex: 1 },
  { field: "Acct_Code", headerName: "Account Code", flex: 1 },
  { field: "Inactive", headerName: "Inactive", flex: 1 },
];
const queryKey = "transaction-code";
export default function TransactionCode() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);

  const queryClient = useQueryClient();

  const { isLoading, refetch: refetchTransactionCodeSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-transaction-code?transactionCodeSearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.transactionCode);
    },
  });

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-transaction-code", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/update-transaction-code",
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
        "/reference/delete-transaction-code",
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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave(e: any) {
    // Code: "",
    // Description: "",
    // Acct_Code: "",
    if (state.Code === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Description === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Description is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Acct_Code === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Code is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Code.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Code is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Description.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Description is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Acct_Code.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Code is too long!",
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
      refetchTransactionCodeSearch();
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
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return refetchTransactionCodeSearch();
              }
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
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
              disabled={state.mode === ""}
              startIcon={<SaveIcon />}
              loading={loadingAdd || loadingEdit}
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
              sx={{
                height: "30px",
                fontSize: "11px",
                backgroundColor: pink[500],
                "&:hover": {
                  backgroundColor: pink[600],
                },
              }}
              disabled={state.mode !== "edit"}
              loading={loadingDelete}
              startIcon={<DeleteIcon />}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Bank_Code: state.Bank_Code,
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
                label="Transaction Code"
                name="Code"
                value={state.Code}
                onChange={handleInputChange}
                disabled={state.mode === "" || state.mode === "edit"}
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
                required
                variant="outlined"
                size="small"
                label="Description"
                name="Description"
                value={state.Description}
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
              <TextField
                required
                variant="outlined"
                size="small"
                label="Account"
                name="Acct_Code"
                value={state.Acct_Code}
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

              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
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
            columns={transactionCodeColumn}
            rows={rows}
            table_id={"Code"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.Code === selection[0]
              )[0];
              if (rowSelected === undefined || rowSelected.length <= 0) {
                setNewStateValue(dispatch, initialState);
                handleInputChange({ target: { value: "", name: "mode" } });
                return;
              }

              handleInputChange({ target: { value: "edit", name: "mode" } });
              if (code === "Delete" || code === "Backspace") {
                wait(400).then(() => {
                  codeCondfirmationAlert({
                    isUpdate: false,
                    cb: (userCodeConfirmation) => {
                      mutateDelete({
                        Code: rowSelected.Code,
                        userCodeConfirmation,
                      });
                    },
                  });
                });
                return;
              }
              setNewStateValue(dispatch, rowSelected);
            }}
          />
        </Box>
      </div>
    </div>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
