import React, { useContext, useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { AuthContext } from "../../../../../components/AuthContext";
import { useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { setNewStateValue } from "../../../Task/Accounting/PostDateChecks";
import Swal from "sweetalert2";
import { reducer, supplierColumn } from "../../../data/entry";
import {
  PhoneNumberFormat,
  TelephoneFormat,
} from "../../../../../components/MaskFormat";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
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
import PageHelmet from "../../../../../components/Helmet";

const initialState = {
  firstname: "",
  lastname: "",
  middlename: "",
  company: "",
  tin_no: "",
  address: "",
  email: "",
  mobile: "",
  telephone: "",
  sub_account: "c02534ee-6d7e-40dd-a22b-bc9024fa12ca",
  VAT_Type: "vat",
  option: "individual",
  entry_supplier_id: "",
  search: "",
  mode: "",
};

export default function Supplier() {
  const refParent = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rows, setRows] = useState([]);
  const { myAxios, user } = useContext(AuthContext);
  const queryKey = "entry_supplier_id";
  const queryClient = useQueryClient();
  const table = useRef<any>(null);

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
  const { isLoading: loadingSupplierId, refetch: refetchSupplierId } = useQuery(
    {
      queryKey: "supplier-generate-id",
      queryFn: async () =>
        await myAxios.post(
          "/reference/id-entry-generate-id",
          { sign: "S", type: "entry supplier" },
          {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
          }
        ),
      refetchOnWindowFocus: false,
      onSuccess: (res) => {
        handleInputChange({
          target: { value: res.data.generateID, name: "entry_supplier_id" },
        });
      },
    }
  );
  const { isLoading, refetch: refetchSupplierSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/search-entry?entrySearch=${state.search}&entry=Supplier`,
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
      await myAxios.post("/reference/id-entry-supplier", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-update?entry=Supplier`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-delete?entry=Supplier`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const uppercase = ["company", "lastname", "middlename", "firstname"];
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
        icon: "warning",
        title: "Firstname is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.lastname.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Lastname is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.middlename.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Middlename is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.company.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Company is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.tin_no.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Tin no. is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.address.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Address is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.email.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Email is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.mobile.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Mobile is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (state.telephone.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Telephone is too long!",
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
      refetchSupplierSearch();
      refetchSupplierId();
      refetchSubAcct();
    });
  }
  const width = window.innerWidth - 40;
  const height = window.innerHeight - 140;
  return (
    <>
      <PageHelmet title="ID Entry - Supplier" />
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
                  return refetchSupplierSearch();
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
                    refetchSupplierId();
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
                        id: state.entry_supplier_id,
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
              "firstname",
              "lastname",
              "middlename",
              "company",
              "tin_no",
              "address",
              "email",
              "mobile",
              "telephone",
              "VAT_Type",
              "entry_supplier_id",
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
          style={{ width: "100%" }}
          id="Form-Supplier"
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              columnGap: "15px",
              flexDirection: "row",
              width: "100%",
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
                  columnGap: "15px",
                  flexDirection: "row",
                  [theme.breakpoints.down("md")]: {
                    flexDirection: "column",
                    rowGap: "10px",
                  },
                })}
              >
                {loadingSupplierId ? (
                  <LoadingButton loading={loadingSupplierId} />
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
                      name="entry_supplier_id"
                      value={state.entry_supplier_id}
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
                              refetchSupplierId();
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
                <FormControl
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
                  <InputLabel id="vat-type">VAT Type</InputLabel>
                  <Select
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    disabled={state.mode === ""}
                    name="VAT_Type"
                    value={state.VAT_Type}
                    onChange={handleInputChange}
                    labelId="vat-type"
                    label="VAT Type"
                  >
                    <MenuItem value="vat">Vat</MenuItem>
                    <MenuItem value="non-vat">Non Vat</MenuItem>
                  </Select>
                </FormControl>
                {state.option.includes("individual") ? (
                  <Individual
                    state={state}
                    handleInputChange={handleInputChange}
                    disabled={state.mode === ""}
                  />
                ) : (
                  <Company
                    state={state}
                    handleInputChange={handleInputChange}
                    disabled={state.mode === ""}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                <TextField
                  type="email"
                  name="email"
                  label="Email"
                  size="small"
                  value={state.email}
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
                  name="mobile"
                  label="Mobile Number"
                  size="small"
                  value={state.mobile}
                  onChange={handleInputChange}
                  disabled={state.mode === ""}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputComponent: PhoneNumberFormat as any,
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  placeholder="(+63) 000-000-0000"
                />
                <TextField
                  name="telephone"
                  label="Telephone Number"
                  size="small"
                  value={state.telephone}
                  onChange={handleInputChange}
                  disabled={state.mode === ""}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputComponent: TelephoneFormat as any,
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  placeholder="0000-0000"
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
              <TextField
                type="address"
                name="address"
                label="Address"
                size="small"
                value={state.address}
                onChange={handleInputChange}
                disabled={state.mode === ""}
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
          column={supplierColumn}
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
                      id: rowSelected.entry_supplier_id,
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
            columns={supplierColumn}
            rows={rows}
            table_id={"entry_supplier_id"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.entry_supplier_id === selection[0]
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
                        id: rowSelected.entry_supplier_id,
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

function Individual({ state, handleInputChange, disabled }: any) {
  return (
    <>
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="text"
        name="tin_no"
        label="TIN NO"
        size="small"
        value={state.tin_no}
        onChange={handleInputChange}
        disabled={disabled}
      />
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="text"
        name="firstname"
        label="First Name"
        size="small"
        value={state.firstname}
        onChange={handleInputChange}
        disabled={disabled}
        required
      />
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="text"
        name="middlename"
        label="Middle Name"
        size="small"
        value={state.middlename}
        onChange={handleInputChange}
        disabled={disabled}
      />
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="text"
        name="lastname"
        label="Last Name"
        size="small"
        value={state.lastname}
        onChange={handleInputChange}
        disabled={disabled}
        required
      />
    </>
  );
}

function Company({ state, handleInputChange, disabled }: any) {
  return (
    <>
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="text"
        name="tin_no"
        label="TIN NO"
        size="small"
        value={state.tin_no}
        onChange={handleInputChange}
        disabled={disabled}
      />
      <TextField
        InputProps={{
          style: { height: "27px", fontSize: "14px" },
        }}
        sx={{
          flex: 1,
          height: "27px",
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
        type="Company"
        name="company"
        label="company"
        size="small"
        value={state.company}
        onChange={handleInputChange}
        disabled={disabled}
        required
      />
    </>
  );
}
