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
import Autocomplete from "@mui/material/Autocomplete";
import { LoadingButton } from "@mui/lab";
import Table from "../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";

const initialState = {
  Mortgagee: "",
  Policy: "",
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

export const poliyAccountColumn = [
  { field: "Policy", headerName: "Policy", flex: 1 },
  { field: "Mortgagee", headerName: "Mortgagee", flex: 1 },
  { field: "createdAt", headerName: "Created At", flex: 1 },
];
const queryKey = "mortgagee-account";
export default function Mortgagee() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const queryClient = useQueryClient();
  const table = useRef<any>(null);

  const {
    data,
    isLoading,
    refetch: refetchMortgageSearch,
  } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-mortgagee?mortgageeSearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      console.log(res);
      setRows((res as any)?.data.mortgagee.mortgagee);
    },
  });

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-mortgagee", variables, {
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
      return await myAxios.post("/reference/update-mortgagee", variables, {
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
      return await myAxios.post("/reference/delete-mortgagee", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

  function resetModule() {
    setNewStateValue(dispatch, initialState);
    table.current?.removeSelection();
    wait(500).then(() => {
      refetchMortgageSearch();
    });
  }

  const handleInputSelectionChange = (data: any) => {
    const { name, value } = data;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

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

  function handleOnSave(e: any) {
    if (state.Policy === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Policy is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Mortgagee === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Policy is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Policy.length >= 90) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Policy is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.Mortgagee.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Mortgagee is too long!",
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
          Mortgagee Details
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
                return refetchMortgageSearch();
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
                  handleInputChange({
                    target: { value: "add", name: "mode" },
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
              startIcon={<DeleteIcon />}
              loading={loadingDelete}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Mortgagee: state.Mortgagee,
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
          {!isLoading && (
            <React.Fragment>
              <Autocomplete
                disabled={state.mode === ""}
                value={state.Policy}
                onChange={(event: any, value: string | null) => {
                  handleInputSelectionChange({ name: "Policy", value });
                }}
                size="small"
                freeSolo
                disableClearable
                options={(data as any).data.mortgagee.policy.map(
                  (option: any) => option.Policy
                )}
                getOptionLabel={(option: any) => option}
                sx={(theme) => ({
                  width: 300,
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
                    label="Policy"
                    name="Policy"
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    onChange={handleInputChange}
                  />
                )}
              />
              <Autocomplete
                disabled={state.mode === "" || state.mode === "edit"}
                value={state.Mortgagee}
                onChange={(event: any, value: string | null) => {
                  handleInputSelectionChange({ name: "Mortgagee", value });
                }}
                size="small"
                freeSolo
                disableClearable
                options={(data as any).data.mortgagee.mortgagee.map(
                  (option: any) => option.Mortgagee
                )}
                getOptionLabel={(option: any) => option}
                sx={(theme) => ({
                  width: 700,
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
                    label="Mortgagee"
                    name="Mortgagee"
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    onChange={handleInputChange}
                  />
                )}
              />
            </React.Fragment>
          )}
        </Box>
      </form>
      <div
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
            columns={poliyAccountColumn}
            rows={rows}
            table_id={"Mortgagee"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.Mortgagee === selection[0]
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
                      Mortgagee: rowSelected.Mortgagee,
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
