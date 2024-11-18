import React, { useContext, useState, useRef, useReducer } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  LinearProgress,
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
import { NumericFormatCustom } from "../../../components/NumberFormat";
import { LoadingButton } from "@mui/lab";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import PageHelmet from "../../../components/Helmet";

const initialState = {
  Line: "Vehicle",
  Account: "",
  Type: "",
  Rate: "",
  mode: "",
  search: "",
  ID: "",
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

export const sublineColumn = [
  { field: "ID", headerName: "ID", width: 100, hide: true },
  { field: "Account", headerName: "Account", flex: 1 },
  { field: "Type", headerName: "Type", flex: 1 },
  { field: "Rate", headerName: "Rate", flex: 1 },
  { field: "createdAt", headerName: "Created At", width: 150 },
];
const queryKey = "subline-account";
export default function Rates() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);

  const queryClient = useQueryClient();
  const table = useRef<any>(null);

  const {
    data,
    isLoading,
    refetch: refetchRatesSearch,
  } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(`/reference/get-rates?ratesSearch=${state.search}`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      setRows((res as any)?.data?.rate?.rate);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-rates", variables, {
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
      return await myAxios.post("/reference/update-rates", variables, {
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
      return await myAxios.post("/reference/delete-rates", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

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
      refetchRatesSearch();
    });
  }
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "Line") {
      dispatch({ type: "UPDATE_FIELD", field: "Type", value: "" });
    }
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function handleOnSave(e: any) {
    e.preventDefault();

    if (state.Line === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Line is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Account is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Type === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Type is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Rate === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Rate is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Line.length >= 250) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Line is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account.length >= 250) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Account is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Type.length >= 250) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Type is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Rate.length >= 250) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Rate is too long!",
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

  const typeSelection = (data as any)?.data?.rate?.type[state.Line];
  return (
    <>
      <PageHelmet title="Rates" />

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
      Rates Details
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
                  return refetchRatesSearch();
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

              <Button
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
                startIcon={<DeleteIcon />}
                onClick={() => {
                  codeCondfirmationAlert({
                    isUpdate: true,
                    cb: (userCodeConfirmation) => {
                      handleInputChange({
                        target: { value: "delete", name: "mode" },
                      });
                      mutateDelete({
                        ID: state.ID,
                        userCodeConfirmation,
                      });
                    },
                  });
                }}
              >
                Delete
              </Button>
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
              display: "flex",
              columnGap: "15px",
              flexDirection: "row",
              [theme.breakpoints.down("md")]: {
                flexDirection: "column",
                rowGap: "10px",
              },
            })}
          >
            {isLoading ? (
              <LinearProgress />
            ) : (
              <React.Fragment>
                <FormControl
                  size="small"
                  fullWidth
                  disabled={state.mode === "" || state.mode === "edit"}
                  required
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
                  <InputLabel id="Line">Line</InputLabel>
                  <Select
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    labelId="Line"
                    value={state.Line}
                    label="Line"
                    name="Line"
                    onChange={handleInputChange}
                  >
                    {(data as any).data?.rate?.line.map(
                      (items: any, idx: number) => {
                        return (
                          <MenuItem key={idx} value={items.Line}>
                            {items.Line}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  disabled={state.mode === "" || state.mode === "edit"}
                  required
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
                  <InputLabel id="Account">Account</InputLabel>
                  <Select
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    labelId="Account"
                    value={state.Account}
                    label="Account"
                    name="Account"
                    onChange={handleInputChange}
                  >
                    {(data as any).data?.rate?.policy.map(
                      (items: any, idx: number) => {
                        return (
                          <MenuItem key={idx} value={items.Account}>
                            {items.Account}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
                {typeSelection ? (
                  <FormControl
                    size="small"
                    fullWidth
                    disabled={state.mode === ""}
                    required
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
                    <InputLabel id="Type">Type</InputLabel>
                    <Select
                      labelId="Type"
                      value={state.Type}
                      label="Type"
                      name="Type"
                      onChange={handleInputChange}
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                    >
                      {typeSelection.map((items: any, idx: number) => {
                        return (
                          <MenuItem key={idx} value={items.SublineName}>
                            {items.SublineName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    type="text"
                    variant="outlined"
                    size="small"
                    label="Type"
                    name="Type"
                    value={state.Type}
                    onChange={handleInputChange}
                    disabled={state.mode === ""}
                    required
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
                )}
              </React.Fragment>
            )}
            <TextField
              required
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              label="Rate"
              name="Rate"
              value={state.Rate}
              onChange={handleInputChange}
              disabled={state.mode === ""}
              placeholder="0.0000"
              onBlur={(e) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "Rate",
                  value: parseFloat(state.Rate).toFixed(4),
                });
              }}
              InputProps={{
                inputComponent: NumericFormatCustom as any,
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
              height: `${refParent.current?.getBoundingClientRect().height}px`,
              width: "100%",
              overflowX: "scroll",
              position: "absolute",
            }}
          >
            <Table
              ref={table}
              isLoading={isLoading || loadingAdd || loadingEdit || loadingDelete}
              columns={sublineColumn}
              rows={rows}
              table_id={"ID"}
              isSingleSelection={true}
              isRowFreeze={false}
              dataSelection={(selection, data, code) => {
                const rowSelected = data.filter(
                  (item: any) => item.ID === selection[0]
                )[0];
                if (rowSelected === undefined || rowSelected.length <= 0) {
                  setNewStateValue(dispatch, initialState);
                  handleInputChange({ target: { value: "", name: "mode" } });
                  return;
                }

                handleInputChange({ target: { value: "edit", name: "mode" } });
                if (code === "Delete" || code === "Backspace") {
                  codeCondfirmationAlert({
                    isUpdate: true,
                    cb: (userCodeConfirmation) => {
                      handleInputChange({
                        target: { value: "delete", name: "mode" },
                      });
                      mutateDelete({
                        ID: rowSelected.ID,
                        userCodeConfirmation,
                      });
                    },
                  });

                  return;
                }
                setNewStateValue(dispatch, rowSelected);
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
