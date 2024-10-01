import React, { useContext, useRef, useReducer, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  OutlinedInput,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import Table from "../../../../components/Table";
import useMultipleComponent from "../../../../hooks/useMultipleComponent";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UpwardTable from "../../../../components/UpwardTable";
const reasonList = [
  "",
  "Fully Paid",
  "Check Replacement",
  "Account Closed",
  "Hold",
  "Not Renewed By Camfin",
];
const requestInitialState = {
  RCPNo: "",
  PNNo: "",
  client: "",
  reason: "",
  requestMode: "",
};
const ApprovedInitialState = {
  RCPNo: "",
  PNNo: "",
  client: "",
  reason: "",
  approvedMode: "",
  authCode: "",
};
const reducer = (state: any, action: any) => {
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
const pulloutRequestColumns = [
  { field: "Check_Date", headerName: "Date", width: 170 },
  { field: "Bank", headerName: "Bank", width: 400 },
  { field: "Check_No", headerName: "Check No.", width: 170 },
  { field: "Check_Amnt", headerName: "Check", width: 170, type: "number" },
  { field: "Status", headerName: "Status", width: 170 },
  { field: "RCPNO", headerName: "RCPNO", width: 170 },
  { field: "temp_id", headerName: "temp_id", width: 100, hide: true },
];
const pulloutApprovedColumns = [
  { field: "Check_Date", headerName: "Date", width: 150 },
  { field: "Bank", headerName: "Bank", width: 150 },
  { field: "Check_No", headerName: "Check No.", width: 150 },
  { field: "Check_Amnt", headerName: "Check", width: 150, type: "number" },
  { field: "RCPNO", headerName: "PDC_ID", width: 150, hide: true },
  { field: "reason", headerName: "reason", width: 150, hide: true },
  { field: "Status", headerName: "Status", width: 650 },
];
export default function CheckPullout() {
  const { user } = useContext(AuthContext);
  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <CheckPulloutRequest />,
    <CheckPulloutResponse />,
  ]);
  const style: any = (idx: number) => ({
    border: "none",
    outline: "none",
    backgroundColor: "rgba(51, 51, 51, 0.05)",
    borderWidth: "0",
    color: currentStepIndex === idx ? "#7e22ce" : "#333333",
    cursor: "pointer",
    display: "inline-block",
    fontFamily: `"Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif`,
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    listStyle: "none",
    margin: "0",
    padding: "10px 12px",
    textAlign: "center",
    transition: "all 200ms",
    verticalAlign: "baseline",
    whiteSpace: "nowrap",
    userSelect: "none",
    touchAction: "manipulation",
    position: "relative",
    overflow: "hidden",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 80px)",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex" }}>
        <button style={{ ...style(0) }} onClick={() => goTo(0)}>
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(206, 214, 211, 0.18)",
              transition: "all 200ms",
              transform: slideAnimation(currentStepIndex, 0),
            }}
          ></span>
          Pullout Request
        </button>
        <button style={{ ...style(1) }} onClick={() => goTo(1)}>
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(206, 214, 211, 0.18)",
              transition: "all 200ms",
              transform: slideAnimation(currentStepIndex, 1),
            }}
          ></span>
          Pullout Approved
        </button>
        {/* {user?.userAccess === "ADMIN" && (
          <button style={{ ...style(1) }} onClick={() => goTo(1)}>
            <span
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(206, 214, 211, 0.18)",
                transition: "all 200ms",
                transform: slideAnimation(currentStepIndex, 1),
              }}
            ></span>
            Pullout Approved
          </button>
        )} */}
      </div>
      <br />
      {step}
    </div>
  );
}
function CheckPulloutRequest() {
  const [rcpn, setRCPN] = useState<Array<any>>([]);
  const [pnno, setPnno] = useState<Array<any>>([]);
  const refParent = useRef<HTMLDivElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [pulloutRequest, setPulloutRequest] = useState<any>([]);
  const [state, dispatch] = useReducer(reducer, requestInitialState);
  const table = useRef<any>(null);

  const { isLoading: loadingLoadPNNo } = useQuery({
    queryKey: "load-pn_no",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/pullout/reqeust/load-pnno`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      setPnno(response.data.data);
    },
    refetchOnWindowFocus: false,
  });

  const { isLoading: loadingLoadChecks, mutate: mutateLoadChecks } =
    useMutation({
      mutationKey: "load-checks",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/pullout/reqeust/load-checks`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (data) => {
        const response = data as any;
        setPulloutRequest(response.data.data);

        // const res = response.data.data
        //   .filter((itm: any) => itm.Status === "PENDING")
        //   .map((itm: any) => itm.temp_id) as any;

        // table.current.setSelectedRows(res);
      },
    });

  const { isLoading: loadingLoadRCPN, mutate: mutateLoadRCPN } = useMutation({
    mutationKey: "load-rcpn",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/pullout/reqeust/load-rcpn`,
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (data) => {
      const response = data as any;
      setRCPN(response?.data.data);
    },
  });

  const {
    isLoading: loadingPulloutRequestId,
    refetch: refetchPulloutRequestId,
  } = useQuery({
    queryKey: "pullout-request-id",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/pullout/reqeust/get-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      if (state.requestMode === "edit") return;
      dispatch({
        type: "UPDATE_FIELD",
        field: "RCPNo",
        value: response.data.id[0].pullout_request,
      });
    },
  });

  const { mutate: mutateSave, isLoading: isLoadingSave } = useMutation({
    mutationKey: "save-request",
    mutationFn: async (variable: any) =>
      await myAxios.post("/task/accounting/pullout/request/save", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      if (res.data.success) {
        defaultState();
        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: res.data.message,
        timer: 1500,
      });
    },
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const handleOnSave = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to save it",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedList = table.current.getSelectedRows();
        if (selectedList.length <= 0) {
          return Swal.fire({
            position: "center",
            icon: "warning",
            title: "Please select from list",
            timer: 3000,
          });
        }

        let selected = table.current.getSelectedRows();
        if (state.requestMode === "edit") {
          selected = table.current.getSelectedRows().map((itm: any) => {
            itm.Status = "--";
            return itm;
          });
        }
        mutateSave({
          ...state,
          selected: JSON.stringify(selected),
        });
      }
    });
  };

  function defaultState() {
    table.current?.resetTableSelected();
    setPulloutRequest([]);
    Object.entries(requestInitialState).forEach(([field, value]) => {
      dispatch({ type: "UPDATE_FIELD", field, value });
    });
    refetchPulloutRequestId();
  }
  const width = window.innerWidth - 100;
  const height = window.innerHeight - 145;
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
      <div
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={
            {
              display: "flex",
              flexDirection: state.requestMode === "edit" ? "column" : "row",
              columnGap: "5px",
              padding: "0px 40px",
            } as any
          }
        >
          <div style={{ display: "flex", flexGrow: 1, columnGap: "10px" }}>
            {state.requestMode !== "edit" && (
              <React.Fragment>
                {loadingPulloutRequestId ? (
                  <LoadingButton loading={loadingPulloutRequestId} />
                ) : (
                  <FormControl
                    variant="outlined"
                    size="small"
                    disabled={state.requestMode !== "add"}
                    sx={{
                      width: "200px",
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  >
                    <InputLabel htmlFor="pullout-req-id">RCP NO.</InputLabel>
                    <OutlinedInput
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                      disabled={state.requestMode !== "add"}
                      fullWidth
                      label="RCP NO."
                      name="RCPNo"
                      value={state.RCPNo}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          e.preventDefault();
                          return handleOnSave();
                        }
                      }}
                      readOnly={user?.department !== "UCSMI"}
                      id="pullout-req-id"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            disabled={state.requestMode !== "add"}
                            color="secondary"
                            edge="end"
                            onClick={() => {
                              refetchPulloutRequestId();
                            }}
                          >
                            <RestartAltIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                )}
              </React.Fragment>
            )}
            {state.requestMode === "edit" && (
              <Autocomplete
                loading={loadingLoadRCPN}
                freeSolo
                options={rcpn}
                value={state.RCPNo}
                onChange={(e, v: any) => {
                  if (v) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "RCPNo",
                      value: v.RCPNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PNNo",
                      value: v.PNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "client",
                      value: v.Name,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "reason",
                      value: v.Reason,
                    });
                    mutateLoadChecks({
                      PNNo: v.PNo,
                    });
                  }
                }}
                onInput={(e: any) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "RCPNo",
                    value: e.target.value,
                  });
                }}
                onBlur={(e) => {
                  const options = rcpn;
                  const find = options.find((itm) => itm.RCPNo === state.RCPNo);
                  if (find !== undefined) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "RCPNo",
                      value: find.RCPNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PNNo",
                      value: find.PNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "client",
                      value: find.Name,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "reason",
                      value: find.Reason,
                    });
                    mutateLoadChecks({
                      PNNo: find.PNo,
                    });
                  }
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.RCPNo}>
                      {option.RCPNo}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    label="PN No."
                  />
                )}
                sx={{
                  width: "200px",
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
              />
            )}
            <div style={{ display: "flex", gap: "10px" } as any}>
              <Autocomplete
                loading={loadingLoadPNNo}
                disabled={state.requestMode !== "add"}
                freeSolo
                options={pnno.map((itm: any) => itm.PNo)}
                value={state.PNNo}
                onChange={(e, v: any) => {
                  if (v) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PNNo",
                      value: v,
                    });
                    const options = pnno;
                    const find = options.find((itm) => itm.PNo === state.PNNo);
                  }
                }}
                onInput={(e: any) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "PNNo",
                    value: e.target.value,
                  });
                }}
                onBlur={(e) => {
                  const options = pnno;
                  const find = options.find((itm) => itm.PNo === state.PNNo);
                  if (find !== undefined) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PNNo",
                      value: find.PNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "client",
                      value: find.Name,
                    });
                    mutateLoadChecks({
                      PNNo: find.PNo,
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    label="PN No."
                    disabled={state.requestMode !== "add"}
                  />
                )}
                sx={{
                  width: "300px",
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
              />
              <Autocomplete
                loading={loadingLoadPNNo}
                disabled={state.requestMode !== "add"}
                freeSolo
                options={pnno}
                value={state.client}
                onChange={(e, v: any) => {
                  if (v) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "client",
                      value: v.Name,
                    });
                  }
                }}
                onInput={(e: any) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "client",
                    value: e.target.value,
                  });
                }}
                onBlur={(e) => {
                  const options = pnno;
                  const find = options.find((itm) => itm.Name === state.client);
                  if (find !== undefined) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PNNo",
                      value: find.PNo,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "client",
                      value: find.Name,
                    });
                    mutateLoadChecks({
                      PNNo: find.PNo,
                    });
                  }
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.PNo}>
                      {option.Name}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    fullWidth
                    label="Name"
                    disabled={state.requestMode !== "add"}
                  />
                )}
                sx={{
                  width: "300px",
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
              />
            </div>
            <FormControl
              size="small"
              variant="outlined"
              disabled={
                state.requestMode !== "add" && state.requestMode !== "edit"
              }
              sx={{
                width: "250px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <InputLabel id="reason">Reason</InputLabel>
              <Select
                labelId="reason"
                value={state.reason}
                name="reason"
                onChange={(e) => {
                  handleInputChange(e);
                  mutateLoadChecks({
                    PNNo: state.PNNo,
                  });
                }}
                autoWidth
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                {reasonList.map((item, idx) => {
                  return (
                    <MenuItem key={idx} value={item}>
                      {item}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            columnGap: "10px",
            paddingBottom: "5px",
          }}
        >
          {state.requestMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                handleInputChange({
                  target: { value: "add", name: "requestMode" },
                });
              }}
              color="primary"
            >
              New
            </Button>
          )}
          {state.requestMode === "" && (
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              onClick={() => {
                handleInputChange({
                  target: { value: "edit", name: "requestMode" },
                });
                handleInputChange({
                  target: { value: "", name: "RCPNo" },
                });

                mutateLoadRCPN({});
              }}
              color="secondary"
              variant="contained"
            >
              Edit
            </LoadingButton>
          )}
          {state.requestMode !== "" && (
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              disabled={state.requestMode === ""}
              onClick={handleOnSave}
              color="success"
              variant="contained"
              loading={isLoadingSave}
            >
              Save
            </LoadingButton>
          )}

          {state.requestMode !== "" && (
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
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
                    defaultState();
                  }
                });
              }}
            >
              Cancel
            </LoadingButton>
          )}
        </div>
      </div>

      <div
        ref={refParent}
        style={{
          marginTop: "10px",
          width: "100%",
          position: "relative",
          flex: 1,
        }}
      >
        <UpwardTable
          ref={table}
          rows={pulloutRequest}
          column={pulloutRequestColumns}
          width={width}
          height={height}
          dataReadOnly={true}
          unSelectable={(row) => {
            if (state.requestMode === "edit") {
              return ["APPROVED", "DISAPPROVED"].includes(row.Status);
            }
            if (state.requestMode === "add") {
              return ["PENDING", "APPROVED", "DISAPPROVED"].includes(
                row.Status
              );
            }
            return false;
          }}
          isMultipleSelect={true}
        />
        {/* <Box
          style={{
            height: `${refParent.current?.getBoundingClientRect().height}px`,
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={loadingLoadChecks}
            columns={pulloutRequestColumns}
            rows={pulloutRequest}
            table_id={"temp_id"}
            isSingleSelection={false}
            isRowFreeze={false}
            isRowSelectable={(params) => {
              if (state.requestMode === "edit") {
                return !["APPROVED", "DISAPPROVED"].includes(params.row.Status);
              }
              if (state.requestMode === "add") {
                return !["PENDING", "APPROVED", "DISAPPROVED"].includes(
                  params.row.Status
                );
              }
              return true;
            }}
            getCellClassName={(params) => {
              if (params.field === "Status" && params.value === "APPROVED") {
                return "approved";
              } else if (
                params.field === "Status" &&
                params.value === "PENDING"
              ) {
                return "pending";
              } else if (
                params.field === "Status" &&
                params.value === "DISAPPROVED"
              ) {
                return "disapproved";
              } else {
                return "";
              }
            }}
          />
        </Box> */}
      </div>
    </div>
  );
}
function CheckPulloutResponse() {
  const [rcpn, setRCPN] = useState<Array<any>>([]);
  const refParent = useRef<HTMLDivElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [pulloutApproved, setPulloutApproved] = useState<any>([]);
  const [state, dispatch] = useReducer(reducer, ApprovedInitialState);
  const table = useRef<any>(null);

  const { isLoading: loadingLoadChecks, mutate: mutateLoadChecks } =
    useMutation({
      mutationKey: "load-checks",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/pullout/reqeust/load-checks`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (data) => {
        const response = data as any;
        setPulloutApproved(response.data.data);

        // const res = response.data.data
        //   .filter((itm: any) => itm.Status === "PENDING")
        //   .map((itm: any) => itm.temp_id) as any;

        // table.current.setSelectedRows(res);
      },
    });

  const { isLoading: loadingLoadRCPN } = useQuery({
    queryKey: "load-rcpn",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/pullout/reqeust/load-rcpn`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      setRCPN(response?.data.data);
    },
  });

  const { mutate: mutateApproved, isLoading: isLoadingApproved } = useMutation({
    mutationKey: "approved",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/pullout/approved/approved",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      if (res.data.success) {
        defaultState();
        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: res.data.message,
        timer: 1500,
      });
    },
  });

  function defaultState() {
    table.current?.resetTableSelected();
    setPulloutApproved([]);
    Object.entries(ApprovedInitialState).forEach(([field, value]) => {
      dispatch({ type: "UPDATE_FIELD", field, value });
    });
  }
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleApproved = () => {
    Swal.fire({
      title: `Are you sure?`,
      html: `<p>You want to <span style="color:green">Approved</span> <strong>${state.RCPNo}</strong></p><p>Enter Code.</p>`,
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: "green",
      showLoaderOnConfirm: true,
      preConfirm: async (code) => {
        try {
          const selected = JSON.stringify(table.current.getSelectedRows());

          mutateApproved({
            ...state,
            code,
            selected,
            approvedMode: "approved",
          });
          dispatch({
            type: "UPDATE_FIELD",
            field: "approvedMode",
            value: "approved",
          });
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isDismissed || result.dismiss || result.isDenied) {
      }
    });
  };
  const handleDisApproved = () => {
    Swal.fire({
      title: `Are you sure!`,
      html: `<p>You want to <span style="color:red">Disaprroved</span> <strong>${state.RCPNo}</strong></p><p>Enter Code.</p>`,
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: "red",
      showLoaderOnConfirm: true,
      preConfirm: async (code) => {
        try {
          const selected = JSON.stringify(table.current.getSelectedRows());

          mutateApproved({
            ...state,
            code,
            selected,
            approvedMode: "disapproved",
          });
          dispatch({
            type: "UPDATE_FIELD",
            field: "approvedMode",
            value: "disapproved",
          });
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isDismissed || result.dismiss || result.isDenied) {
      }
    });
  };
  const width = window.innerWidth - 100;
  const height = window.innerHeight - 145;
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
      <div
        style={
          {
            height: "auto",
            display: "flex",
            columnGap: "20px",
            marginBottom: "10px",
          } as any
        }
      >
        <div style={{ display: "flex", flexGrow: 1, columnGap: "10px" }}>
          <Autocomplete
            loading={loadingLoadRCPN}
            freeSolo
            options={rcpn}
            value={state.RCPNo}
            onChange={(e, v: any) => {
              if (v) {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "RCPNo",
                  value: v.RCPNo,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "PNNo",
                  value: v.PNo,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "client",
                  value: v.Name,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "reason",
                  value: v.Reason,
                });
                mutateLoadChecks({
                  PNNo: v.PNo,
                });
              }
            }}
            onInput={(e: any) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "RCPNo",
                value: e.target.value,
              });
            }}
            onBlur={(e) => {
              const options = rcpn;
              const find = options.find((itm) => itm.RCPNo === state.RCPNo);
              if (find !== undefined) {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "RCPNo",
                  value: find.RCPNo,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "PNNo",
                  value: find.PNo,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "client",
                  value: find.Name,
                });
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "reason",
                  value: find.Reason,
                });
                mutateLoadChecks({
                  PNNo: find.PNo,
                });
              }
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.RCPNo}>
                  {option.RCPNo}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  style: { height: "27px", fontSize: "14px" },
                }}
                label="PN No."
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
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="PN No."
            name="PNNo"
            value={state.PNNo}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              width: "200px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Name"
            name="client"
            value={state.client}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            label="Reason"
            value={state.reason}
            name="reason"
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
            }}
          />
          <LoadingButton
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            disabled={state.RCPNo.length <= 0}
            loading={state.approvedMode === "approved" && isLoadingApproved}
            onClick={handleApproved}
            color="success"
            variant="contained"
          >
            Approved Request
          </LoadingButton>
          <LoadingButton
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            disabled={state.RCPNo.length <= 0}
            loading={state.approvedMode === "disapproved" && isLoadingApproved}
            onClick={handleDisApproved}
            color="error"
            variant="contained"
          >
            Disapproved Request
          </LoadingButton>
        </div>
      </div>
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
          <UpwardTable
            ref={table}
            rows={pulloutApproved}
            column={pulloutApprovedColumns}
            width={width}
            height={height}
            dataReadOnly={true}
            unSelectable={(row) => {
              return !["PENDING", "APPROVED", "DISAPPROVED"].includes(
                row.Status
              );
            }}
            isMultipleSelect={true}
          />
          {/* <Table
            ref={table}
            isLoading={isLoadingApproved || loadingLoadChecks}
            columns={pulloutApprovedColumns}
            rows={pulloutApproved}
            table_id={"temp_id"}
            isSingleSelection={false}
            isRowFreeze={false}
            isRowSelectable={(params) => {
              return !["PENDING", "APPROVED", "DISAPPROVED"].includes(
                params.row.Status
              );
            }}
            getCellClassName={(params) => {
              if (params.field === "Status" && params.value === "APPROVED") {
                return "approved";
              } else if (
                params.field === "Status" &&
                params.value === "PENDING"
              ) {
                return "pending";
              } else if (
                params.field === "Status" &&
                params.value === "DISAPPROVED"
              ) {
                return "disapproved";
              } else {
                return "";
              }
            }}
          /> */}
        </Box>
      </div>
    </div>
  );
}
function slideAnimation(activeButton: number, idx: number) {
  if (activeButton === idx) {
    return "translateX(100%)";
  } else {
    return "translateX(0%)";
  }
}
