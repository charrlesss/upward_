import React, { useContext, useState, useRef, useReducer } from "react";
import { Box, TextField, Button } from "@mui/material";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { LoadingButton } from "@mui/lab";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import PageHelmet from "../../../components/Helmet";

const initialState = {
  Bank_Code: "",
  Bank: "",
  Inactive: false,
  search: "",
  mode: "",
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
export const bankColumn = [
  { field: "Bank_Code", headerName: "Bank Code", flex: 1 },
  { field: "Bank", headerName: "Bank", flex: 1 },
  { field: "Inactive", headerName: "Active", flex: 1 },
];
const queryKey = "bank";
export default function Bank() {
  const refParent = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);
  const queryClient = useQueryClient();
  const { isLoading, refetch: refetchBankSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(`/reference/get-banks?bankSearch=${state.search}`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      setRows((res as any)?.data.bank);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-bank", variables, {
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
      return await myAxios.post("/reference/update-bank", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/delete-bank", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave(e: any) {
    e.preventDefault();
    if (state.Bank_Code === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Bank Code is Required",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Bank === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Bank is Required",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Bank_Code.length >= 10) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invalid bank code is too long",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Bank.length >= 50) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invalid bank is too long",
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
      refetchBankSearch();
    });
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

  return (
    <>
      <PageHelmet title="Bank" />
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
          Bank Details
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
              value={state.search}
              name="search"
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return refetchBankSearch();
                }
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
                  variant="contained"
                  startIcon={<AddIcon />}
                  id="entry-header-save-button"
                  sx={{
                    height: "30px",
                    fontSize: "11px",
                  }}
                  onClick={() => {
                    handleInputChange({ target: { value: "add", name: "mode" } });
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
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                onClick={handleOnSave}
                startIcon={<SaveIcon />}
                disabled={state.mode === ""}
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
                loading={loadingDelete}
                startIcon={<DeleteIcon />}
                disabled={state.mode !== "edit"}
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
          onSubmit={handleOnSave}
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
              width: "100%",
              display: "flex",
              columnGap: "15px",
              flexDirection: "row",
              [theme.breakpoints.down("md")]: {
                flexDirection: "column",
                rowGap: "10px",
              },
            })}
          >
            <TextField
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "100%",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              required
              variant="outlined"
              size="small"
              label="Bank Code"
              name="Bank_Code"
              value={state.Bank_Code}
              onChange={handleInputChange}
              disabled={state.mode === "edit" || state.mode === ""}
            />
            <TextField
              required
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "100%",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              variant="outlined"
              size="small"
              label="Bank Name"
              name="Bank"
              value={state.Bank}
              onChange={handleInputChange}
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
              label="Mark As Inactive"
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
              height: `${refParent.current?.getBoundingClientRect().height}px`,
              width: "100%",
              overflowX: "scroll",
              position: "absolute",
            }}
          >
            <Table
              ref={table}
              isLoading={isLoading || loadingDelete || loadingEdit || loadingAdd}
              columns={bankColumn}
              rows={rows}
              table_id={"Bank_Code"}
              isSingleSelection={true}
              isRowFreeze={false}
              dataSelection={(selection, data, code) => {
                const rowSelected = data.filter(
                  (item: any) => item.Bank_Code === selection[0]
                )[0];
                if (rowSelected === undefined || rowSelected.length <= 0) {
                  setNewStateValue(dispatch, initialState);
                  handleInputChange({ target: { value: "", name: "mode" } });
                  return;
                }
                const newState = {
                  Bank_Code: rowSelected.Bank_Code,
                  Bank: rowSelected.Bank,
                  Inactive: rowSelected.Inactive === "NO",
                  mode: "edit",
                };
                setNewStateValue(dispatch, newState);
                if (code === "Delete" || code === "Backspace") {
                  wait(350).then(() => {
                    codeCondfirmationAlert({
                      isUpdate: false,
                      cb: (userCodeConfirmation) => {
                        mutateDelete({
                          Bank_Code: rowSelected.Bank_Code,
                          userCodeConfirmation,
                        });
                      },
                    });
                  });
                  return;
                }
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
