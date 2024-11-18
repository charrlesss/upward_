import React, { useContext, useRef, useState } from "react";
import {
  FormControl,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Autocomplete,
} from "@mui/material";
import { AuthContext } from "../../../../../components/AuthContext";
import { useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Swal from "sweetalert2";
import { reducer, clientColumn } from "../../../data/entry";
import { PhoneNumberFormat } from "../../../../../components/MaskFormat";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { wait } from "../../../../../lib/wait";
import { setNewStateValue } from "../../../Task/Accounting/PostDateChecks";
import { pink } from "@mui/material/colors";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../lib/confirmationAlert";
import { UpwardTable } from "../../../../../components/UpwardTable";
import PageHelmet from "../../../../../components/Helmet";

const initialState = {
  firstname: "",
  lastname: "",
  middlename: "",
  company: "",
  option: "individual",
  address: "",
  email: "",
  mobile: "",
  telephone: "",
  sub_account: "",
  search: "",
  mode: "",
  entry_client_id: "",
  sale_officer: "",
  client_mortgagee: "",
  client_branch: "",
  chassis: "",
  engine: "",
};

const clientMortgagee = [
  "CASH MANAGEMENT FINANCE INC.",
  "CREDIT MASTERS & LENDING INVESTORS CORP.",
  "CAMFIN LENDING, INC.",
];
export default function Client() {
  const form = useRef<HTMLFormElement>(null);
  const table = useRef<any>(null);
  const [rows, setRows] = useState([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const queryKey = "entry_client_id";
  const queryClient = useQueryClient();

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
  const { isLoading: loadingClientId, refetch: refetchClientId } = useQuery({
    queryKey: "client-generate-id",
    queryFn: async () =>
      await myAxios.post(
        "/reference/id-entry-generate-id",
        { sign: "C", type: "entry client" },
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      handleInputChange({
        target: { value: res.data.generateID, name: "entry_client_id" },
      });
    },
  });
  const { isLoading, refetch: refetchClientSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/search-entry?entrySearch=${state.search}&entry=Client`,
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
      await myAxios.post("/reference/id-entry-client", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-update?entry=Client`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-delete?entry=Client`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const uppercase = [
      "sale_officer",
      "company",
      "lastname",
      "middlename",
      "firstname",
    ];
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
    if (state.option === "individual") {
      if (state.firstname === "") {
        return Swal.fire({
          position: "center",
          icon: "error",
          title: "Firstname is required!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      if (state.lastname === "") {
        return Swal.fire({
          position: "center",
          icon: "error",
          title: "Lastname is required!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      if (state.company === "") {
        return Swal.fire({
          position: "center",
          icon: "error",
          title: "Company is required!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
    if (state.sub_account === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Sub Account is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.firstname.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Firstname too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.lastname.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Lastname too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.middlename.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Middlename too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.company.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Company too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.address.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Address too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.email.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Email too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.mobile.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Mobile too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.telephone.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Telephone too long!",
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
      refetchClientSearch();
      refetchClientId();
      refetchSubAcct();
    });
  }
  const width = window.innerWidth - 40;
  const height = window.innerHeight - 190;
  return (
    <>
      <PageHelmet title="ID Entry - Client" />
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
              value={state.search}
              name="search"
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return refetchClientSearch();
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
                    refetchClientId();
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
                        id: state.entry_client_id,
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
          ref={form}
          onSubmit={handleOnSave}
          onKeyDown={(e) => {
            const enterList = [
              "firstname",
              "lastname",
              "middlename",
              "company",
              "address",
              "email",
              "mobile",
              "telephone",
              "entry_client_id",
              "sale_officer",
            ];
            if (
              (e.code === "Enter" || e.code === "NumpadEnter") &&
              enterList.includes((e.target as any).name)
            ) {
              e.preventDefault();
              handleOnSave(e);
            }
          }}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: "10px",
              flexDirection: "row",
              [theme.breakpoints.down("md")]: {
                flexDirection: "column",
                rowGap: "10px",
              },
              marginBottom: "10px",
            })}
          >
            <div style={{ width: "100%" }}>
              <Box
                sx={(theme) => ({
                  display: "flex",
                  gap: "10px",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  [theme.breakpoints.down("md")]: {
                    flexDirection: "column",
                    rowGap: "10px",
                  },
                })}
              >
                {loadingClientId ? (
                  <LoadingButton loading={loadingClientId} />
                ) : (
                  <FormControl
                    variant="outlined"
                    size="small"
                    disabled={state.mode === ""}
                    sx={{
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  >
                    <InputLabel htmlFor="client-auto-generate-id-field">
                      Client ID
                    </InputLabel>
                    <OutlinedInput
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                      disabled={state.mode === ""}
                      fullWidth
                      label="Client ID"
                      name="entry_client_id"
                      value={state.entry_client_id}
                      onChange={handleInputChange}
                      readOnly={true}
                      id="client-auto-generate-id-field"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            disabled={state.mode === ""}
                            aria-label="search-client"
                            color="secondary"
                            edge="end"
                            onClick={() => {
                              refetchClientId();
                            }}
                          >
                            <RestartAltIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                )}
                <FormControl
                  fullWidth
                  required
                  size="small"
                  sx={(theme) => ({
                    width: "130px",
                    ".MuiFormLabel-root": {
                      fontSize: "14px",
                      background: "white",
                      zIndex: 99,
                      padding: "0 3px",
                    },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },

                    [theme.breakpoints.down("md")]: {
                      width: "auto",
                    },
                    marginBottom: "10px",
                  })}

                // sx={{
                //   width: "130px",
                //   ".MuiFormLabel-root": {
                //     fontSize: "14px",
                //     background: "white",
                //     zIndex: 99,
                //     padding: "0 3px",
                //   },
                //   ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                // }}
                >
                  <InputLabel id="option_id">Option</InputLabel>
                  <Select
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    disabled={state.mode === ""}
                    value={state.option}
                    onChange={handleInputChange}
                    labelId="option_id"
                    label="Option"
                    name="option"
                  >
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="individual">Individual</MenuItem>
                  </Select>
                </FormControl>
                <Box
                  sx={(theme) => ({
                    display: "flex",
                    gap: "10px",
                    flexDirection: "row",
                    marginBottom: "10px",
                    [theme.breakpoints.down("md")]: {
                      flexDirection: "column",
                      rowGap: "10px",
                    },
                  })}
                >
                  {state.option.includes("individual") ? (
                    <Individual
                      disabled={state.mode === ""}
                      onChange={handleInputChange}
                      state={state}
                    />
                  ) : (
                    <Company
                      disabled={state.mode === ""}
                      onChange={handleInputChange}
                      state={state}
                    />
                  )}
                </Box>
                {subAccountLoading ? (
                  <LoadingButton loading={subAccountLoading} />
                ) : (
                  <FormControl
                    fullWidth
                    required
                    size="small"
                    sx={(theme) => ({
                      width: "200px",
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      [theme.breakpoints.down("md")]: {
                        width: "auto",
                      },
                    })}
                  >
                    <InputLabel id="Sub Account">Sub Account</InputLabel>
                    <Select
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                      disabled={state.mode === ""}
                      value={state.sub_account}
                      onChange={handleInputChange}
                      labelId="Sub Account"
                      label="Sub Account"
                      name="sub_account"
                    >
                      {[...subAccountData?.data.subAccount].map(
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
                <TextField
                  disabled={state.mode === ""}
                  value={state.email}
                  type="email"
                  name="email"
                  label="Email"
                  size="small"
                  onChange={handleInputChange}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    minWidth: "300px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
                <TextField
                  disabled={state.mode === ""}
                  value={state.mobile}
                  name="mobile"
                  label="Mobile Number"
                  size="small"
                  placeholder="(+63) 000-000-0000"
                  onChange={handleInputChange}
                  InputProps={{
                    inputComponent: PhoneNumberFormat as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    minWidth: "150px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
                <TextField
                  disabled={state.mode === ""}
                  value={state.sale_officer}
                  name="sale_officer"
                  label="Sale Officer"
                  size="small"
                  onChange={handleInputChange}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    minWidth: "250px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
                {user?.department !== "UMIS" && (
                  <>
                    <Autocomplete
                      freeSolo
                      options={clientMortgagee}
                      value={state.client_mortgagee}
                      onChange={(e: any, v: any) => {
                        if (v) {
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "client_mortgagee",
                            value: v,
                          });
                        }
                      }}
                      onInput={(e: any) => {
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "client_mortgagee",
                          value: e.target.value,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: "27px", fontSize: "14px" },
                          }}
                          label="Mortgagee"
                        />
                      )}
                      sx={{
                        flex: 1,
                        ".MuiFormLabel-root": {
                          fontSize: "14px",
                        },
                        ".MuiInputBase-input": {
                          width: "100% !important",
                        },
                        ".MuiFormLabel-root[data-shrink=false]": {
                          top: "-5px",
                        },
                        ".MuiAutocomplete-input ": {
                          position: "absolute",
                        },
                      }}
                      size="small"
                      disabled={state.mode === ""}
                    />
                    <TextField
                      disabled={state.mode === ""}
                      value={state.client_branch}
                      name="client_branch"
                      label="Branch"
                      size="small"
                      onChange={handleInputChange}
                      InputProps={{
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      sx={{
                        minWidth: "250px",
                        height: "27px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                    />
                    <TextField
                      disabled={state.mode === ""}
                      value={state.chassis}
                      name="chassis"
                      label="Chassis No."
                      size="small"
                      onChange={handleInputChange}
                      InputProps={{
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      sx={{
                        minWidth: "250px",
                        height: "27px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                    />
                    <TextField
                      disabled={state.mode === ""}
                      value={state.engine}
                      name="engine"
                      label="Engine No."
                      size="small"
                      onChange={handleInputChange}
                      InputProps={{
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      sx={{
                        minWidth: "250px",
                        height: "27px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                      }}
                    />
                  </>
                )}
              </Box>
              <TextField
                disabled={state.mode === ""}
                value={state.address}
                label="Address"
                size="small"
                style={{ marginBottom: "10px" }}
                name="address"
                required
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  marginTop: "10px",
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </div>
          </Box>
        </form>
        <UpwardTable
          ref={table}
          isLoading={isLoading || loadingDelete || loadingEdit || loadingAdd}
          rows={rows}
          column={user?.department === " UMIS"
            ? clientColumn
            : clientColumn.concat([
              {
                field: "chassis",
                headerName: "Chassis No.",
                width: 200,
              },
              {
                field: "engine",
                headerName: "Engine",
                width: 200,
              },
              {
                field: "client_mortgagee",
                headerName: "Mortgagee",
                width: 300,
              },
              {
                field: "client_branch",
                headerName: "Branch",
                width: 300,
              },
            ])}
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
                      id: rowSelected.entry_client_id,
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
        columns={
          user?.department === " UMIS"
            ? clientColumn
            : clientColumn.concat([
                {
                  field: "chassis",
                  headerName: "Chassis No.",
                  width: 200,
                },
                {
                  field: "engine",
                  headerName: "Engine",
                  width: 200,
                },
                {
                  field: "client_mortgagee",
                  headerName: "Mortgagee",
                  width: 300,
                },
                {
                  field: "client_branch",
                  headerName: "Branch",
                  width: 300,
                },
              ])
        }
        rows={rows}
        table_id={"entry_client_id"}
        isSingleSelection={true}
        isRowFreeze={false}
        dataSelection={(selection, data, code) => {
          const rowSelected = data.filter(
            (item: any) => item.entry_client_id === selection[0]
          )[0];
          if (rowSelected === undefined || rowSelected.length <= 0) {
            setNewStateValue(dispatch, initialState);
            handleInputChange({ target: { value: "", name: "mode" } });
            return;
          }

          handleInputChange({ target: { value: "edit", name: "mode" } });

          setNewStateValue(dispatch, rowSelected);

          if (code === "Delete" || code === "Backspace") {
            wait(350).then(() => {
              codeCondfirmationAlert({
                isUpdate: false,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    id: rowSelected.entry_client_id,
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
  </div> */}
      </div>
    </>
  );
}
function Individual({
  onChange,
  state,
  disabled,
}: {
  onChange: any;
  state: any;
  disabled: boolean;
}) {
  return (
    <>
      <TextField
        type="text"
        value={state.firstname}
        onChange={onChange}
        name="firstname"
        label="First Name"
        size="small"
        fullWidth
        required
        disabled={disabled}
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
      />
      <TextField
        type="text"
        value={state.middlename}
        onChange={onChange}
        name="middlename"
        label="Middle Name"
        size="small"
        fullWidth
        disabled={disabled}
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
      />
      <TextField
        type="text"
        value={state.lastname}
        onChange={onChange}
        name="lastname"
        label="Last Name"
        size="small"
        fullWidth
        required
        disabled={disabled}
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
      />
    </>
  );
}
function Company({
  onChange,
  state,
  disabled,
}: {
  onChange: any;
  state: any;
  disabled: boolean;
}) {
  return (
    <TextField
      type="Company"
      name="company"
      label="company"
      size="small"
      fullWidth
      required
      value={state.company}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        style: { height: "27px", fontSize: "14px" },
      }}
      sx={{
        height: "27px",
        ".MuiFormLabel-root": { fontSize: "14px" },
        ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
      }}
    />
  );
}
