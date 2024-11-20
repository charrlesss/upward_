import React, { useContext, useState, useRef, useReducer } from "react";
import { Box, TextField, Button, Autocomplete } from "@mui/material";
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
import PageHelmet from "../../../components/Helmet";

const initialState = {
  Line: "",
  SublineName: "",
  search: "",
  mode: "",
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
  { field: "Line", headerName: "Line", flex: 1 },
  { field: "SublineName", headerName: "SubLine Name", flex: 1 },
  { field: "createdAt", headerName: "Created At", flex: 1 },
];
const queryKey = "subline-account";
export default function Subline() {
  const refParent = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    refetch: refetchSublineSearch,
  } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-subline?sublineSearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.subline.subline);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-subline", variables, {
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
      return await myAxios.post("/reference/update-subline", variables, {
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
      return await myAxios.post("/reference/delete-subline", variables, {
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
  function handleOnSave(e: any) {
    if (state.Line === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Line is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.SublineName === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Subline Name is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.SublineName.length >= 250) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Subline Name is too long!",
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

  function resetModule() {
    setNewStateValue(dispatch, initialState);
    table.current?.removeSelection();
    wait(500).then(() => {
      refetchSublineSearch();
    });
  }

  return (
    <>
      <PageHelmet title="Subline" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px"

        }}
      >
        {/* <Box>
    <Typography variant="h5" sx={{ marginBottom: "10px" }}>
      Subline Details
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
                  return refetchSublineSearch();
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
                    isUpdate: false,
                    cb: (userCodeConfirmation) => {
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
              <LoadingButton loading={isLoading} />
            ) : (
              <Autocomplete
                disabled={state.mode === ""}
                value={state.Line}
                onChange={(event: any, value: string | null) => {
                  handleInputChange({ target: { name: "Line", value } });
                }}
                size="small"
                freeSolo
                disableClearable
                options={(data as any).data?.subline?.line.map(
                  (item: any) => item.Line
                )}
                getOptionLabel={(option: any) => option}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label="Line"
                    name="Line"
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    onChange={handleInputChange}
                    sx={{
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                )}
                sx={{
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
                }}
              />
            )}
            <TextField
              required
              type="text"
              variant="outlined"
              size="small"
              label="SublineName"
              name="SublineName"
              value={state.SublineName}
              onChange={handleInputChange}
              disabled={state.mode === ""}
              fullWidth
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "500px",
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
                    isUpdate: false,
                    cb: (userCodeConfirmation) => {
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
