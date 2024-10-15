import React, { useContext, useRef, useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Button,
} from "@mui/material";
import { AuthContext } from "../../../../../components/AuthContext";
import { useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import { reducer, fixedAssetstColumn } from "../../../data/entry";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { setNewStateValue } from "../../../Task/Accounting/PostDateChecks";
import { wait } from "@testing-library/user-event/dist/utils";
import Table from "../../../../../components/Table";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { pink } from "@mui/material/colors";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../lib/confirmationAlert";
import { UpwardTable } from "../../../../../components/UpwardTable";

const initialState = {
  description: "",
  remarks: "",
  fullname: "",
  search: "",
  mode: "",
  entry_fixed_assets_id: "",
  sub_account: "c02534ee-6d7e-40dd-a22b-bc9024fa12ca",
};

export default function FixedAssets() {
  const refParent = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const table = useRef<any>(null);
  const queryKey = "entry_fixed_assets_id";

  const {
    data: subAccountData,
    isLoading: subAccountLoading,
    refetch: refetchSubAcct,
  } = useQuery({
    queryKey: "sub-accounts",
    queryFn: async () =>
      await myAxios.get(`/reference/sub-account`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess: (res) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "sub_account",
        value: res.data?.defaultValue[0]?.Sub_Acct,
      });
    },
  });
  const { isLoading: loadingFixedAssetId, refetch: refetchFixedAssetId } =
    useQuery({
      queryKey: "fixed-generate-id",
      queryFn: async () =>
        await myAxios.post(
          "/reference/id-entry-generate-id",
          { sign: "FA", type: "entry fixed assets" },
          {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
          }
        ),
      refetchOnWindowFocus: false,
      onSuccess: (res) => {
        handleInputChange({
          target: { value: res.data.generateID, name: "entry_fixed_assets_id" },
        });
      },
    });
  const { isLoading, refetch: refetchFixedAssetSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/search-entry?entrySearch=${state.search}&entry=Fixed Assets`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.entry);
    },
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post("/reference/id-entry-fixed-assets", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });

  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/reference/entry-update?entry=Fixed Assets`,
        variables,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/reference/entry-delete?entry=Fixed Assets`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const uppercase = ["fullname", "description", "remarks"];
    if (uppercase.includes(name)) {
      return dispatch({
        type: "UPDATE_FIELD",
        field: name,
        value: value.toUpperCase(),
      });
    }
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
    if (state.fullname === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Fullname is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.description === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Description is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (state.fullname.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Fullname is too Long!",
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
    table.current?.resetTableSelected();
    wait(250).then(() => {
      refetchFixedAssetSearch();
      refetchFixedAssetId();
      refetchSubAcct();
    });
  }
  const width = window.innerWidth - 40;
  const height = window.innerHeight - 100;
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
            value={state.search}
            name="search"
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return refetchFixedAssetSearch();
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const datagridview = document.querySelector(
                  `.grid-container`
                ) as HTMLDivElement;
                datagridview.focus();
              }

            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              className: "manok"
            }}
            sx={{
              width: "500px",
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
                  refetchFixedAssetId();
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
                      id: state.entry_fixed_assets_id,
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
          const enterList = [
            "description",
            "remarks",
            "fullname",
            "entry_fixed_assets_id",
          ];
          if (
            (e.code === "Enter" || e.code === "NumpadEnter") &&
            enterList.includes((e.target as any).name)
          ) {
            e.preventDefault();
            handleOnSave(e);
          }
        }}
        onSubmit={handleOnSave}
        id="Form-Fixed Assets"
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
            marginBottom: "10px",
          })}
        >
          {loadingFixedAssetId ? (
            <LoadingButton loading={loadingFixedAssetId} />
          ) : (
            <FormControl
              variant="outlined"
              size="small"
              disabled={state.mode === ""}
              sx={{
                width: "150px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <InputLabel htmlFor="fixed_assets-auto-generate-id-field">
                Fixed Assets ID
              </InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                disabled={state.mode === ""}
                fullWidth
                label="Fixed Assets ID"
                name="entry_fixed_assets_id"
                value={state.entry_fixed_assets_id}
                onChange={handleInputChange}
                readOnly={true}
                id="fixed_assets-auto-generate-id-field"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disabled={state.mode === ""}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        refetchFixedAssetId();
                      }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
          <TextField
            label="Full Name"
            name="fullname"
            minRows={10}
            fullWidth
            style={{ marginBottom: "10px" }}
            size="small"
            required
            value={state.fullname}
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
            label="Description"
            name="description"
            minRows={10}
            fullWidth
            style={{ marginBottom: "10px" }}
            size="small"
            required
            value={state.description}
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
            label="Remarks"
            name="remarks"
            minRows={10}
            fullWidth
            style={{ marginBottom: "10px" }}
            size="small"
            value={state.remarks}
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
          {subAccountLoading ? (
            <LoadingButton loading={subAccountLoading} />
          ) : (
            <FormControl
              fullWidth
              required
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
              <InputLabel id="Sub Account">Sub Account</InputLabel>
              <Select
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                disabled={state.mode === ""}
                value={state.sub_account}
                onChange={(e) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "sub_account",
                    value: e.target.value,
                  });
                }}
                labelId="Sub Account"
                label="Sub Account"
                name="sub_account"
              >
                {subAccountData?.data.subAccount.map(
                  (item: {
                    Sub_Acct: string;
                    NewShortName: string;
                    Acronym: string;
                  }) => {
                    return (
                      <MenuItem key={item.Sub_Acct} value={item.Sub_Acct}>
                        {item.NewShortName}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
          )}
        </Box>
      </form>
      <UpwardTable
        ref={table}
        isLoading={isLoading || loadingDelete || loadingEdit || loadingAdd}
        rows={rows}
        column={fixedAssetstColumn}
        width={width}
        height={height}
        dataReadOnly={true}
        onSelectionChange={(rowSelected) => {
          if (rowSelected.length > 0) {
            handleInputChange({ target: { value: "edit", name: "mode" } });

            setNewStateValue(dispatch, rowSelected[0]);

          } else {
            setNewStateValue(dispatch, initialState);
            handleInputChange({ target: { value: "", name: "mode" } });
            return;
          }
        }}
        onKeyDown={(row, key) => {
          if (key === "Delete" || key === "Backspace") {
            const rowSelected = row[0];
            wait(100).then(() => {
              codeCondfirmationAlert({
                isUpdate: false,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    id: rowSelected.entry_fixed_assets_id,
                    userCodeConfirmation,
                  });
                },
              });
            });
            return;
          }
        }}
        inputsearchselector=".manok"
      />
      {/* <div
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
            columns={fixedAssetstColumn}
            rows={rows}
            table_id={"entry_fixed_assets_id"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.entry_fixed_assets_id === selection[0]
              )[0];
              if (rowSelected === undefined || rowSelected.length <= 0) {
                setNewStateValue(dispatch, initialState);
                handleInputChange({ target: { value: "", name: "mode" } });
                return;
              }
              handleInputChange({ target: { value: "edit", name: "mode" } });

              setNewStateValue(dispatch, rowSelected);

              if (code === "Delete" || code === "Backspace") {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      id: rowSelected.entry_fixed_assets_id,
                      userCodeConfirmation,
                    });
                  },
                });
                return;
              }
            }}
          />
        </Box>
      </div> */}
    </div>
  );
}
