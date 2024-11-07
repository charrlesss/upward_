import React, { useContext, useState, useRef, useReducer } from "react";
import {
  Box,
  TextField,
  Button,
  LinearProgress,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import { wait } from "../../../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { NumericFormatCustom } from "../../../components/NumberFormat";
import Table from "../../../components/Table";
import { LoadingButton } from "@mui/lab";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import { pink } from "@mui/material/colors";
const initialState = {
  Prefix: "",
  NumSeriesFrom: 0,
  NumSeriesTo: 0,
  Cost: "",
  ctplType: "",
  search: "",
  mode: "",
  ctplId: "",
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

export const ctplColumn = [
  { field: "Prefix", headerName: "Prefix", width: 150 },
  { field: "NumSeriesFrom", headerName: "NumSeriesFrom", flex: 1 },
  { field: "NumSeriesTo", headerName: "NumSeriesTo", flex: 1 },
  { field: "Cost", headerName: "Cost", flex: 1 },
  { field: "CreatedBy", headerName: "Created By", width: 250 },
  { field: "createdAt", headerName: "Created At", width: 150 },
];
const queryKey = "ctpl";
export default function CTPL() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch: refetchCtplSearch,
  } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(`/reference/get-ctpl?ctplSearch=${state.search}`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      setRows((res as any)?.data.ctpl.ctpl);
    },
  });

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      delete variables.mode;
      return await myAxios.post("/reference/add-ctpl", variables, {
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
      delete variables.mode;
      return await myAxios.post("/reference/delete-ctpl", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "Line") {
      dispatch({ type: "UPDATE_FIELD", field: "Type", value: "" });
    }
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave(e: any) {
    e.preventDefault();
    state.Cost = state.Cost === "" ? "0" : parseFloat(state.Cost).toFixed(2);

    if (state.Cost === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Cost is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Cost.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Cost is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    saveCondfirmationAlert({
      isConfirm: () => {
        mutateAdd(state);
      },
    });
  }

  const handleInputSelectionChange = (data: any) => {
    const { name, value } = data;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function resetModule() {
    setNewStateValue(dispatch, initialState);
    table.current?.removeSelection();
    wait(500).then(() => {
      refetchCtplSearch();
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
          CTPL Details
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
                return refetchCtplSearch();
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
              disabled={state.mode === "" || state.mode === "edit"}
              startIcon={<SaveIcon />}
              loading={loadingAdd}
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
              loading={loadingDelete}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      ctplId: state.ctplId,
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
            <Autocomplete
              disabled={state.mode === "" || state.mode === "edit"}
              value={state.Prefix}
              onChange={(event: any, value: string | null) => {
                handleInputSelectionChange({ name: "Prefix", value });
              }}
              size="small"
              freeSolo
              disableClearable
              options={(data as any).data?.ctpl?.prefix.map(
                (option: any) => option.prefixName
              )}
              getOptionLabel={(option: any) => option}
              sx={(theme) => ({
                width: 500,
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                },
                ".MuiInputBase-input": {
                  width: "100% !important",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                ".MuiAutocomplete-input ": {
                  position: "absolute",
                },
                [theme.breakpoints.down("md")]: { width: "100%" },
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Prefix"
                  name="Prefix"
                  InputProps={{
                    ...params.InputProps,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  onChange={handleInputChange}
                />
              )}
            />
          )}
          <TextField
            required
            fullWidth
            type="number"
            variant="outlined"
            size="small"
            label="NumSeriesFrom"
            name="NumSeriesFrom"
            value={state.NumSeriesFrom}
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
            fullWidth
            type="number"
            variant="outlined"
            size="small"
            label="NumSeriesTo"
            name="NumSeriesTo"
            value={state.NumSeriesTo}
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
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            label="Cost"
            name="Cost"
            value={state.Cost}
            onChange={handleInputChange}
            disabled={state.mode === "" || state.mode === "edit"}
            placeholder="0.00"
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              inputComponent: NumericFormatCustom as any,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "Cost",
                value: parseFloat(state.Cost).toFixed(2),
              });
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
            isLoading={loadingAdd || isLoading}
            columns={ctplColumn}
            rows={rows}
            table_id={"ctplId"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.ctplId === selection[0]
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
                      ctplId: rowSelected.ctplId,
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
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
