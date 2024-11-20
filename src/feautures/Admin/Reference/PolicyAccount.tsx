import React, { useContext, useState, useRef, useReducer } from "react";
import { Box, TextField, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
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
  AccountCode: "",
  Account: "",
  Description: "",
  search: "",
  mode: "",
  COM: false,
  TPL: false,
  MAR: false,
  FIRE: false,
  G02: false,
  G13: false,
  G16: false,
  MSPR: false,
  PA: false,
  CGL: false,
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

export const poliyAccountColumn = [
  { field: "Account", headerName: "Account", width: 350 },
  { field: "AccountCode", headerName: "Account Code", width: 200 },
  { field: "Description", headerName: "Description", flex: 1 },
  { field: "createdAt", headerName: "Created At", width: 250 },
];
const queryKey = "policy-account";

export default function PolicyAccount() {
  const refParent = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const table = useRef<any>(null);
  const queryClient = useQueryClient();
  const { isLoading, refetch: refetchPolicyAccountSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-policy-account?policySearch=${state.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.policy);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-policy-account", variables, {
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
      return await myAxios.post("/reference/update-policy-account", variables, {
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
      return await myAxios.post("/reference/delete-policy-account", variables, {
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
  const handleCheckboxChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_FIELD",
      field: name,
      value: !JSON.parse(value),
    });
  };
  function handleOnSave(e: any) {
    if (state.Account === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.AccountCode === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Code is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.Account.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.AccountCode >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Account Code is too long",
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
      refetchPolicyAccountSearch();
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
    <>
      <PageHelmet title="Policy Account" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          padding: "5px"

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
                  return refetchPolicyAccountSearch();
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
                        Account: state.Account,
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
            <TextField
              size="small"
              label="Account"
              name="Account"
              required
              value={state.Account}
              onChange={handleInputChange}
              disabled={state.mode === "" || state.mode === "edit"}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                minWidth: "200px",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            <TextField
              size="small"
              label="Account Code"
              name="AccountCode"
              required
              value={state.AccountCode}
              onChange={handleInputChange}
              disabled={state.mode === ""}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                minWidth: "200px",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Description"
              name="Description"
              required
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
          </Box>
          <fieldset style={{ border: "1px solid #cbd5e1" }}>
            <legend style={{ color: "#6b7280" }}>Policy Type</legend>
            <FormGroup
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="COM"
                    checked={state.COM}
                    value={state.COM}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Comprehensive"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="MAR"
                    value={state.MAR}
                    checked={state.MAR}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Marine"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="G02"
                    value={state.G02}
                    checked={state.G02}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Bond G(02)"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="G13"
                    value={state.G13}
                    checked={state.G13}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Bond G(13)"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="G16"
                    value={state.G16}
                    checked={state.G16}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Bond G(16)"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="PA"
                    value={state.PA}
                    checked={state.PA}
                    onChange={handleCheckboxChange}
                  />
                }
                label="PA"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="TPL"
                    value={state.TPL}
                    checked={state.TPL}
                    onChange={handleCheckboxChange}
                  />
                }
                label="TPL"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="FIRE"
                    value={state.FIRE}
                    checked={state.FIRE}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Fire"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="MSPR"
                    value={state.MSPR}
                    checked={state.MSPR}
                    onChange={handleCheckboxChange}
                  />
                }
                label="MSPR"
              />
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "14px",
                  },
                }}
                disabled={state.mode === ""}
                control={
                  <Checkbox
                    size="small"
                    name="CGL"
                    value={state.CGL}
                    checked={state.CGL}
                    onChange={handleCheckboxChange}
                  />
                }
                label="CGL"
              />
            </FormGroup>
          </fieldset>
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
              height: `400px`,
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
              table_id={"Account"}
              isSingleSelection={true}
              isRowFreeze={false}
              dataSelection={(selection, data, code) => {
                const rowSelected = data.filter(
                  (item: any) => item.Account === selection[0]
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
                        Account: state.Account,
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
