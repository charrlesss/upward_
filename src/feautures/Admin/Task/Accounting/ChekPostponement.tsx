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
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import Table from "../../../../components/Table";
import useMultipleComponent from "../../../../hooks/useMultipleComponent";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CustomDatePicker from "../../../../components/DatePicker";
import { differenceInDays } from "date-fns";
import { setNewStateValue } from "./PostDateChecks";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import { addDays } from "date-fns";

const requestInitialState = {
  RPCD: "",
  PNNo: "",
  branch: "",
  client: "",
  check_no: "",
  check_date: "",
  bank: "",
  amount: "",
  new_check_date: new Date(),
  check_reason: "",
  requestMode: "",
  rowMode: "",
  rowId: "",
  holdingFee: "",
  penaltyCharge: "",
  surplus: "",
  deductedTo: "",
  total: "",
  paidVia: "",
  paidInfo: "",
  paidDate: new Date(),
};
const approvedInitialState = {
  RPCD: "",
  PNNo: "",
  branch: "",
  client: "",
  check_no: "",
  check_date: "",
  bank: "",
  amount: "",
  new_check_date: new Date(),
  check_reason: "",
  requestMode: "",
  rowMode: "",
  rowId: "",
  holdingFee: "",
  penaltyCharge: "",
  surplus: "",
  deductedTo: "",
  total: "",
  paidVia: "",
  paidInfo: "",
  paidDate: new Date(),
  Requested_By: "",
  Requested_Date: "",
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
export default function ChekPostponement() {
  const { user } = useContext(AuthContext);

  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <ChekPostponementRequest />,
    <ChekPostponementApproved />,
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
        height: "auto",
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
          Chek Postponement Request
        </button>
        {user?.userAccess === "ADMIN" && (
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
            Chek Postponement Approved
          </button>
        )}
      </div>
      <br />
      {step}
    </div>
  );
}
const checkSelectedColumns = [
  { field: "Check_No", headerName: "Check No", width: 170 },
  { field: "Bank", headerName: "Bank", width: 170 },
  { field: "Check_Amnt", headerName: "Amount", width: 170, type: "number" },
  { field: "Check_Date", headerName: "Old Deposit Date", width: 170 },
  { field: "New_Check_Date", headerName: "New Deposit Date", width: 170 },
  { field: "DateDiff", headerName: "Date Difference", width: 170 },
  { field: "Reason", headerName: "Reason", width: 170 },
  { field: "temp_id", headerName: " ", hide: true },
  { field: "Status", headerName: "Status", width: 170 },
];

function calculateDifference(startDate: any, endDate: any) {
  const differenceInDaysValue = differenceInDays(
    new Date(endDate),
    new Date(startDate)
  );
  return Math.abs(differenceInDaysValue);
}

function ChekPostponementRequest() {
  const { myAxios, user } = useContext(AuthContext);
  const [stateRequest, dispatchRequest] = useReducer(
    reducer,
    requestInitialState
  );
  const [pnnoClients, setPNNoClients] = useState<Array<any>>([]);
  const [checkList, setCheckList] = useState<Array<any>>([]);
  const [checkSelected, setCheckSelected] = useState([]);
  const [rcpnList, setRCPNList] = useState([]);
  const table = useRef<any>(null);
  const datePickerRef1 = useRef<HTMLElement>(null);
  const datePickerRef2 = useRef<HTMLElement>(null);

  const { isLoading: loadingSearchPNNoClients } = useQuery({
    queryKey: "pullout-request-search-pnno-client_name",
    queryFn: async () =>
      await myAxios.get(
        `/task/accounting/check-postponement/reqeust/search-pnno-client`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      setPNNoClients(response.data.pnnoClients);
    },
  });
  const {
    isLoading: loadingChekPostponementRequest,
    refetch: refetchChekPostponementRequest,
  } = useQuery({
    queryKey: "pullout-request-id",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/check-postponement/reqeust/get-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      dispatchRequest({
        type: "UPDATE_FIELD",
        field: "RPCD",
        value: response.data.id[0].pullout_request,
      });
    },
  });

  const { mutate: mutateGetChecksList, isLoading: isLoadingGetChecksList } =
    useMutation({
      mutationKey: "get-check-list",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          "/task/accounting/check-postponement/selected-pn-no-checklist",
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        setCheckList(res.data.selectedChecks);
      },
    });

  const {
    mutate: mutateGetRCPNSelectedDatails,
    isLoading: isLoadingGetRCPNSelectedDatails,
  } = useMutation({
    mutationKey: "get-rcpn-selected-datails",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/check-postponement/request/get-rcpn-selected-datails",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      const data = res.data.rcpnDetails;
      const itm = data[0];

      setNewStateValue(dispatchRequest, itm);
      const checkList = res.data.rcpnDetails.map((itm: any) => {
        const DateDiff = calculateDifference(itm.Check_Date, itm.NewCheckDate);

        return {
          temp_id: itm.temp_id,
          Bank: itm.Bank,
          Check_Amnt: itm.Check_Amnt,
          Check_Date: itm.Check_Date,
          Check_No: itm.Check_No,
          New_Check_Date: itm.NewCheckDate,
          Reason: itm.reason,
          DateDiff,
          Status: itm.Status,
        };
      });

      const newObj = {
        RPCD: itm.RPCDNo,
        PNNo: itm.PNNo,
        branch: itm.ClientBranch,
        client: itm.Name,
        check_no: "",
        check_date: "",
        bank: "",
        amount: "",
        new_check_date: new Date(),
        check_reason: "",
        requestMode: "edit",
        rowMode: "",
        rowId: "",
        holdingFee: itm.HoldingFees,
        penaltyCharge: itm.PenaltyCharge,
        surplus: itm.Surplus,
        deductedTo: itm.Deducted_to,
        total: (
          parseFloat(itm.HoldingFees) +
          parseFloat(itm.PenaltyCharge) +
          parseFloat(itm.Surplus)
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        paidVia: itm.PaidVia,
        paidInfo: itm.PaidInfo,
        paidDate: new Date(itm.PaidDate),
      };
      setNewStateValue(dispatchRequest, newObj);
      setCheckSelected(checkList);
      mutateGetChecksList({
        PNNo: itm.PNo,
      });
    },
  });

  const { mutate: mutateGetRCPNList, isLoading: isLoadingGetRCPNList } =
    useMutation({
      mutationKey: "get-rcpn-list",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          "/task/accounting/check-postponement/request/get-rcpn-list",
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        setRCPNList(res.data.rcpn);
      },
    });

  function handleCheckAdd() {
    if (stateRequest.check_no === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide check no!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.check_date === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide check date!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.bank === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide bank!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.amount === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide amount!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.check_reason === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide reason!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    const DateDiff = calculateDifference(
      stateRequest.check_date,
      stateRequest.new_check_date
    );

    if (DateDiff > 15 || DateDiff < 0) {
      return Swal.fire({
        timer: 2500,
        title: "Invalid Date",
        icon: "warning",
        position: "center",
      });
    }

    setCheckSelected((d: any) => {
      let temp_id =
        d.length > 0 ? incrementTempId(d[d.length - 1].temp_id) : "000";
      if (stateRequest.rowMode === "update") {
        d = d.filter((items: any) => items.temp_id !== stateRequest.rowId);
        temp_id = stateRequest.rowId;
      }
      const data = {
        Check_No: stateRequest.check_no,
        Bank: stateRequest.bank,
        Check_Amnt: stateRequest.amount,
        Check_Date: stateRequest.check_date,
        New_Check_Date: new Date(
          stateRequest.new_check_date
        ).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        DateDiff,
        Reason: stateRequest.check_reason,
        temp_id,
      };
      d = [...d, data];
      return d;
    });
    setNewStateValue(dispatchRequest, {
      ...stateRequest,
      ...{
        check_no: "",
        check_date: "",
        bank: "",
        amount: "",
        new_check_date: new Date(),
        check_reason: "",
        rowMode: "",
        rowId: "",
      },
    });

    function incrementTempId(str: string) {
      let num = parseInt(str, 10);
      num++;
      return num.toString().padStart(str.length, "0");
    }
  }

  const { mutate: mutateSave, isLoading: isLoadingSave } = useMutation({
    mutationKey: "check-postponement-save",
    mutationFn: async (variable: any) =>
      await myAxios.post("/task/accounting/check-postponement/save", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      if (res.data.success) {
        setNewStateValue(dispatchRequest, requestInitialState);
        refetchChekPostponementRequest();
        setCheckSelected([]);
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
    dispatchRequest({ type: "UPDATE_FIELD", field: name, value });
  };

  function handleOnSave() {
    if (stateRequest.PNNo === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide policy no!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.branch === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide branch!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (stateRequest.client === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide client name!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (stateRequest.paidVia === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide how do be paid!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    if (stateRequest.paidInfo === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Please provide name of bank and branch!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (checkSelected.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Check Table is Empty!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (isNaN(parseFloat(stateRequest.holdingFee))) {
      stateRequest.holdingFee = "0.00";
    }
    if (isNaN(parseFloat(stateRequest.penaltyCharge))) {
      stateRequest.penaltyCharge = "0.00";
    }
    if (isNaN(parseFloat(stateRequest.surplus))) {
      stateRequest.surplus = "0.00";
    }
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
        if (checkSelected.length <= 0) {
          return Swal.fire({
            position: "center",
            icon: "warning",
            title: "Check list is empty",
            timer: 3000,
          });
        }
        mutateSave({
          ...stateRequest,
          checkSelected: JSON.stringify(checkSelected),
        });
      }
    });
  }

  function FeeAndChargersTotal(value: any, list: Array<string>) {
    let total = 0;
    list.forEach((item) => {
      let itemState = stateRequest[item];
      if (isNaN(parseFloat(itemState.replace(/,/g, "")))) {
        itemState = "0";
      }
      total = total + parseFloat(itemState.replace(/,/g, ""));
    });
    if (isNaN(parseFloat(value.replace(/,/g, "")))) {
      value = "0";
    }
    dispatchRequest({
      type: "UPDATE_FIELD",
      field: "total",
      value: (total + parseFloat(value.replace(/,/g, ""))).toFixed(2),
    });
  }
  function FooterTotal() {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "2px solid #e2e8f0",
        }}
      >
        <strong>
          Total:{" "}
          {checkSelected
            .reduce(
              (sum: any, obj: any) =>
                sum + parseFloat(obj.Check_Amnt.replace(/,/g, "")),
              0
            )
            .toLocaleString("en-US", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </strong>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", gap: "5px" ,marginBottom:"10px" }}>
        {stateRequest.requestMode === "" && (
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            size="small"
            color="primary"
            onClick={() => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "requestMode",
                value: "add",
              });
            }}
          >
            New
          </Button>
        )}
        {stateRequest.requestMode === "" && (
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => {
              mutateGetRCPNList({});
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "requestMode",
                value: "edit",
              });
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "RPCD",
                value: "",
              });
            }}
          >
            Edit
          </Button>
        )}
        {stateRequest.requestMode !== "" && (
          <LoadingButton
            disabled={stateRequest.requestMode === ""}
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            size="small"
            color="success"
            onClick={handleOnSave}
            loading={isLoadingSave}
          >
            Save
          </LoadingButton>
        )}
        {stateRequest.requestMode !== "" && (
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            size="small"
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
                  setNewStateValue(dispatchRequest, requestInitialState);
                  refetchChekPostponementRequest();
                  setCheckSelected([]);
                }
              });
            }}
          >
            Cancel
          </Button>
        )}
      </div>
      <fieldset
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "20px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend style={{ fontSize: "14px" }}>Account Information</legend>
        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {stateRequest.requestMode !== "edit" && (
            <React.Fragment>
              {loadingChekPostponementRequest ? (
                <LoadingButton loading={loadingChekPostponementRequest} />
              ) : (
                <FormControl
                  variant="outlined"
                  size="small"
                  disabled={stateRequest.requestMode === ""}
                  sx={{
                    width: "170px",
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
                    disabled={stateRequest.requestMode === ""}
                    fullWidth
                    label="RPCD No."
                    name="RPCD"
                    value={stateRequest.RPCD}
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
                          disabled={stateRequest.requestMode === ""}
                          color="secondary"
                          edge="end"
                          onClick={() => {
                            refetchChekPostponementRequest();
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

          {stateRequest.requestMode === "edit" && (
            <Autocomplete
              loading={isLoadingGetRCPNList}
              freeSolo
              options={rcpnList.map((itm: any) => itm.RPCDNo)}
              value={stateRequest.RPCD}
              onChange={(e, v: any) => {
                if (v) {
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "RPCD",
                    value: v,
                  });
                  mutateGetRCPNSelectedDatails({ RPCDNo: v });
                }
              }}
              onInput={(e: any) => {
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "RPCD",
                  value: e.target.value,
                });
              }}
              onBlur={(e) => {
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "RPCD",
                  value: stateRequest.RPCD,
                });
                mutateGetRCPNSelectedDatails({ RPCDNo: stateRequest.RPCD });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  label="RPCD No."
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
          )}

          <Autocomplete
            loading={loadingSearchPNNoClients}
            disabled={stateRequest.requestMode !== "add"}
            freeSolo
            options={pnnoClients.map((itm: any) => itm.PNo)}
            value={stateRequest.PNNo}
            onChange={(e, v: any) => {
              if (v) {
                const options = pnnoClients;
                const find = options.find((itm) => itm.PNo === v);
                if (find !== undefined) {
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "PNNo",
                    value: find.PNo,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "client",
                    value: find.Name,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "branch",
                    value: find.branch_name,
                  });

                  mutateGetChecksList({
                    PNNo: find.PNo,
                  });
                  setNewStateValue(dispatchRequest, {
                    check_date: "",
                    new_check_date: new Date(),
                    bank: "",
                    amount: "",
                    check_no: "",
                  });
                }
              }
            }}
            onInput={(e: any) => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "PNNo",
                value: e.target.value,
              });
            }}
            onBlur={(e) => {
              const options = pnnoClients;
              const find = options.find((itm) => itm.PNo === stateRequest.PNNo);
              if (find !== undefined) {
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "PNNo",
                  value: find.PNo,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "client",
                  value: find.Name,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "branch",
                  value: find.branch_name,
                });
                mutateGetChecksList({
                  PNNo: find.PNo,
                });
                setNewStateValue(dispatchRequest, {
                  check_date: "",
                  new_check_date: new Date(),
                  bank: "",
                  amount: "",
                  check_no: "",
                });
              }
            }}
            renderOption={(props, option, attr) => {
              return (
                <li {...props} key={attr.index}>
                  {option}
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
                disabled={stateRequest.requestMode !== "add"}
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
            disabled={stateRequest.requestMode !== "add"}
            variant="outlined"
            size="small"
            label="Branch"
            name="branch"
            value={stateRequest.branch}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              width: "250px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
          />
          <Autocomplete
            loading={loadingSearchPNNoClients}
            disabled={stateRequest.requestMode !== "add"}
            freeSolo
            options={pnnoClients.map((itm: any) => itm.Name)}
            value={stateRequest.client}
            onChange={(e, v: any) => {
              if (v) {
                const options = pnnoClients;
                const find = options.find((itm) => itm.Name === v);
                if (find !== undefined) {
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "PNNo",
                    value: find.PNo,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "client",
                    value: find.Name,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "branch",
                    value: find.branch_name,
                  });
                  mutateGetChecksList({
                    PNNo: find.PNo,
                  });

                  setNewStateValue(dispatchRequest, {
                    check_date: "",
                    new_check_date: new Date(),
                    bank: "",
                    amount: "",
                    check_no: "",
                  });
                }
              }
            }}
            onInput={(e: any) => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "client",
                value: e.target.value,
              });
            }}
            onBlur={(e) => {
              const options = pnnoClients;
              const find = options.find(
                (itm) => itm.Name === stateRequest.client
              );
              if (find !== undefined) {
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "PNNo",
                  value: find.PNo,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "client",
                  value: find.Name,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "branch",
                  value: find.branch_name,
                });

                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "check_no",
                  value: find.Check_No,
                });

                mutateGetChecksList({
                  PNNo: find.PNo,
                });
                setNewStateValue(dispatchRequest, {
                  check_date: "",
                  new_check_date: new Date(),
                  bank: "",
                  amount: "",
                  check_no: "",
                });
              }
            }}
            renderOption={(props, option, attr) => {
              return (
                <li {...props} key={attr.index}>
                  {option}
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
                label="Account Name"
                disabled={stateRequest.requestMode !== "add"}
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
        </Box>
      </fieldset>
      <fieldset
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "20px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend style={{ fontSize: "14px" }}>Check Details</legend>
        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Autocomplete
            loading={isLoadingGetChecksList}
            freeSolo
            options={checkList.map((itm: any) => itm.Check_No)}
            value={stateRequest.check_no}
            onChange={(e, v: any) => {
              if (v) {
                const options = checkList;
                const find = options.find((itm) => itm.Check_No === v);
                if (find !== undefined) {
                  const newDate = addDays(new Date(find.Check_Date), 7);

                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "check_no",
                    value: find.Check_No,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "check_date",
                    value: find.Check_Date,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "bank",
                    value: find.Bank,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "amount",
                    value: find.Check_Amnt,
                  });
                  dispatchRequest({
                    type: "UPDATE_FIELD",
                    field: "new_check_date",
                    value: newDate,
                  });
                }
              }
            }}
            onInput={(e: any) => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "check_no",
                value: e.target.value,
              });
            }}
            onBlur={(e) => {
              const options = checkList;
              const find = options.find(
                (itm) => itm.Check_No === stateRequest.check_no
              );
              if (find !== undefined) {
                const newDate = addDays(new Date(find.Check_Date), 7);

                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "check_no",
                  value: find.Check_No,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "check_date",
                  value: find.Check_Date,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "bank",
                  value: find.Bank,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "amount",
                  value: find.Check_Amnt,
                });
                dispatchRequest({
                  type: "UPDATE_FIELD",
                  field: "new_check_date",
                  value: newDate,
                });
              }
            }}
            renderOption={(props, option, attr) => {
              return (
                <li {...props} key={attr.index}>
                  {option}
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
                label="Check No."
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
            variant="outlined"
            size="small"
            label="Date"
            name="check_date"
            disabled={stateRequest.requestMode === ""}
            value={stateRequest.check_date}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              width: "250px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleCheckAdd();
              }
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Bank"
            name="bank"
            disabled={stateRequest.requestMode === ""}
            value={stateRequest.bank}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              minWidth: "300px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleCheckAdd();
              }
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Amount"
            name="amount"
            disabled={stateRequest.requestMode === ""}
            value={stateRequest.amount}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleCheckAdd();
              }
            }}
            sx={{
              flex: 1,
              minWidth: "300px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <CustomDatePicker
            disabled={stateRequest.requestMode === ""}
            fullWidth={false}
            label="New Date"
            onChange={(value: any) => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "new_check_date",
                value: value,
              });
            }}
            value={new Date(stateRequest.new_check_date)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                const timeout = setTimeout(() => {
                  datePickerRef1.current?.querySelector("button")?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={datePickerRef1}
            textField={{
              InputLabelProps: {
                style: {
                  fontSize: "14px",
                },
              },
              InputProps: {
                style: { height: "27px", fontSize: "14px" },
              },
            }}
          />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
            }}
          >
            <TextField
              disabled={stateRequest.requestMode === ""}
              fullWidth
              variant="outlined"
              size="small"
              label="Reason"
              name="check_reason"
              value={stateRequest.check_reason}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                flex: 1,
                minWidth: "300px",
                height: "25px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return handleCheckAdd();
                }
              }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => handleCheckAdd()}
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              disabled={stateRequest.requestMode === ""}
            >
              {stateRequest.rowMode === "update" ? "Update Check" : "Add Check"}
            </Button>
          </div>
        </Box>
      </fieldset>
      <div
        style={{
          marginTop: "10px",
          width: "100%",
          position: "relative",
          height: "420px",
        }}
      >
        <Box
          style={{
            height: "400px",
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={isLoadingGetRCPNSelectedDatails}
            columns={checkSelectedColumns}
            rows={checkSelected}
            table_id={"temp_id"}
            isSingleSelection={true}
            isRowFreeze={false}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.temp_id === selection[0]
              )[0];
              if (rowSelected === undefined) {
                setNewStateValue(dispatchRequest, {
                  ...stateRequest,
                  ...{
                    check_no: "",
                    check_date: "",
                    bank: "",
                    amount: "",
                    new_check_date: new Date(),
                    check_reason: "",
                    rowMode: "",
                    rowId: "",
                  },
                });
                return;
              }

              if (code === "Delete" || code === "Backspace") {
                Swal.fire({
                  title: `Are you sure you want to delete?`,
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, delete it!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    return setCheckSelected((d) => {
                      return d.filter(
                        (items: any) => items.temp_id !== selection[0]
                      );
                    });
                  }
                });
                setNewStateValue(dispatchRequest, {
                  ...stateRequest,
                  ...{
                    check_no: "",
                    check_date: "",
                    bank: "",
                    amount: "",
                    new_check_date: new Date(),
                    check_reason: "",
                    rowMode: "",
                    rowId: "",
                  },
                });
                return;
              }
              setNewStateValue(dispatchRequest, {
                ...stateRequest,
                ...{
                  check_no: rowSelected.Check_No,
                  check_date: rowSelected.Check_Date,
                  bank: rowSelected.Bank,
                  amount: rowSelected.Check_Amnt,
                  new_check_date: rowSelected.New_Check_Date,
                  check_reason: rowSelected.Reason,
                  rowMode: "update",
                  rowId: rowSelected.temp_id,
                },
              });
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
            footerChildren={() => <FooterTotal />}
            footerPaginationPosition="left-right"
            showFooterSelectedCount={false}
          />
        </Box>
      </div>
      <fieldset
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "20px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend style={{ fontSize: "14px" }}>Fees and Charges</legend>
        <Box
          sx={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(4,1fr)",
          }}
        >
          <TextField
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="Holding Fee"
            name="holdingFee"
            placeholder="0.00"
            value={stateRequest.holdingFee}
            onChange={(e) => {
              handleInputChange(e);
              FeeAndChargersTotal(e.target.value, ["penaltyCharge", "surplus"]);
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
            onBlur={() => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "holdingFee",
                value: parseFloat(
                  stateRequest.holdingFee.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="Penalty Charge"
            name="penaltyCharge"
            value={stateRequest.penaltyCharge}
            onChange={(e) => {
              handleInputChange(e);
              FeeAndChargersTotal(e.target.value, ["holdingFee", "surplus"]);
            }}
            placeholder="0.00"
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
            onBlur={() => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "penaltyCharge",
                value: parseFloat(
                  stateRequest.penaltyCharge.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="Surplus"
            name="surplus"
            placeholder="0.00"
            value={stateRequest.surplus}
            onChange={(e) => {
              handleInputChange(e);
              FeeAndChargersTotal(e.target.value, [
                "holdingFee",
                "penaltyCharge",
              ]);
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
            onBlur={() => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "surplus",
                value: parseFloat(
                  stateRequest.surplus.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="Deducted to:"
            name="deductedTo"
            value={stateRequest.deductedTo}
            onChange={handleInputChange}
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
          <FormControl
            disabled={stateRequest.requestMode === ""}
            size="small"
            variant="outlined"
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
            <InputLabel id="label-selection-reason">How to be paid</InputLabel>
            <Select
              labelId="label-selection-reason"
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              name="paidVia"
              value={stateRequest.paidVia}
              onChange={handleInputChange}
              readOnly={stateRequest.requestMode === ""}
            >
              <MenuItem value=""></MenuItem>
              <MenuItem value="Over The Counter">Over The Counter</MenuItem>
              <MenuItem value={"direct deposit"}>Direct Deposit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="Name of Bank & Branch"
            name="paidInfo"
            value={stateRequest.paidInfo}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: stateRequest.requestMode === "edit",
            }}
            sx={{
              flex: 1,
              gridColumn: "2 / span 2",

              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <CustomDatePicker
            disabled={stateRequest.requestMode === ""}
            fullWidth={false}
            label="Date & Time of Deposit"
            onChange={(value: any) => {
              dispatchRequest({
                type: "UPDATE_FIELD",
                field: "paidDate",
                value: value,
              });
            }}
            value={new Date(stateRequest.paidDate)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                const timeout = setTimeout(() => {
                  datePickerRef2.current?.querySelector("button")?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={datePickerRef2}
            textField={{
              InputLabelProps: {
                style: {
                  fontSize: "14px",
                },
              },
              InputProps: {
                style: { height: "27px", fontSize: "14px" },
              },
            }}
          />
          <TextField
            disabled={stateRequest.requestMode === ""}
            variant="outlined"
            size="small"
            label="total"
            name="total"
            value={stateRequest.total}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              inputComponent: NumericFormatCustom as any,
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return handleOnSave();
              }
            }}
          />
        </Box>
      </fieldset>
    </Box>
  );
}
function ChekPostponementApproved() {
  const { myAxios, user } = useContext(AuthContext);
  const [stateApproved, dispatchApproved] = useReducer(
    reducer,
    approvedInitialState
  );
  const [rcpnList, setRCPNList] = useState([]);
  const [checkSelected, setCheckSelected] = useState([]);
  const datePickerRef = useRef<HTMLElement>(null);
  const table = useRef<any>(null);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatchApproved({ type: "UPDATE_FIELD", field: name, value });
  };

  const { isLoading: isLoadingGetRCPNList, refetch } = useQuery({
    queryKey: "get-rcpn-list",
    queryFn: async () =>
      await myAxios.get(
        "/task/accounting/check-postponement/request/get-rcpn-list",
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      setRCPNList(res.data.rcpn);
    },
    refetchOnWindowFocus: false,
  });

  const {
    mutate: mutateGetRCPNSelectedDatails,
    isLoading: isLoadingGetRCPNSelectedDatails,
  } = useMutation({
    mutationKey: "get-rcpn-selected-datails",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/check-postponement/request/get-rcpn-selected-datails",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      const data = res.data.rcpnDetails;
      const itm = data[0];

      const checkList = res.data.rcpnDetails.map((itm: any) => {
        const DateDiff = calculateDifference(itm.Check_Date, itm.NewCheckDate);

        return {
          temp_id: itm.temp_id,
          Bank: itm.Bank,
          Check_Amnt: itm.Check_Amnt,
          Check_Date: itm.Check_Date,
          Check_No: itm.Check_No,
          New_Check_Date: itm.NewCheckDate,
          Reason: itm.reason,
          DateDiff,
          Status: itm.Status,
        };
      });
      console.log(itm);
      const newObj = {
        RPCD: itm.RPCDNo,
        PNNo: itm.PNNo,
        branch: itm.ClientBranch,
        client: itm.Name,
        check_no: "",
        check_date: "",
        bank: "",
        amount: "",
        new_check_date: new Date(),
        check_reason: "",
        requestMode: "edit",
        rowMode: "",
        rowId: "",
        holdingFee: itm.HoldingFees,
        penaltyCharge: itm.PenaltyCharge,
        surplus: itm.Surplus,
        deductedTo: itm.Deducted_to,
        total: (
          parseFloat(itm.HoldingFees) +
          parseFloat(itm.PenaltyCharge) +
          parseFloat(itm.Surplus)
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        paidVia: itm.PaidVia,
        paidInfo: itm.PaidInfo,
        paidDate: new Date(itm.PaidDate),
        Requested_By: itm.Requested_By,
        Requested_Date: itm.Requested_Date,
      };
      setNewStateValue(dispatchApproved, newObj);
      setCheckSelected(checkList);
    },
  });

  //=======================
  const { mutate: mutateApprovedRequest, isLoading: isLoadingApprovedRequest } =
    useMutation({
      mutationKey: "approved-request",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          "/task/accounting/check-postponement/approved-request",
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        if (res.data.success) {
          setNewStateValue(dispatchApproved, approvedInitialState);
          setCheckSelected([]);
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
  const {
    mutate: mutateDisApprovedRequest,
    isLoading: isLoadingDisApprovedRequest,
  } = useMutation({
    mutationKey: "approved-request",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/check-postponement/approved-request",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      if (res.data.success) {
        setNewStateValue(dispatchApproved, approvedInitialState);
        setCheckSelected([]);
        refetch();
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

  function FooterTotal() {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "2px solid #e2e8f0",
        }}
      >
        <strong>
          Total:{" "}
          {checkSelected
            .reduce(
              (sum: any, obj: any) =>
                sum + parseFloat(obj.Check_Amnt.replace(/,/g, "")),
              0
            )
            .toLocaleString("en-US", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </strong>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "5px" }}>
        <LoadingButton
          disabled={checkSelected.length <= 0}
          loading={isLoadingApprovedRequest}
          sx={{
            height: "30px",
            fontSize: "11px",
          }}
          variant="contained"
          size="small"
          color="success"
          onClick={() => {
            Swal.fire({
              title: `Are you sure you want to approved ${stateApproved.RPCD}?`,
              html: `<p>You want to <span style="color:green">Approved</span> <strong>${stateApproved.RPCD}</strong></p><p>Enter Code.</p>`,
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
                  const selected = JSON.stringify(
                    table.current.getSelectedRows()
                  );
                  console.log(selected);
                  mutateApprovedRequest({
                    ...stateApproved,
                    checkSelected: JSON.stringify(checkSelected),
                    code,
                    isApproved: true,
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
                setNewStateValue(dispatchApproved, approvedInitialState);
                setCheckSelected([]);
              }
            });
          }}
        >
          Approved Request
        </LoadingButton>
        <LoadingButton
          disabled={checkSelected.length <= 0}
          loading={isLoadingDisApprovedRequest}
          sx={{
            height: "30px",
            fontSize: "11px",
          }}
          variant="contained"
          size="small"
          color="error"
          onClick={() => {
            Swal.fire({
              title: `Are you sure you want to disapproved ${stateApproved.RPCD}?`,
              html: `<p>You want to <span style="color:red">DisAprroved</span> <strong>${stateApproved.RPCD}</strong></p><p>Enter Code.</p>`,
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
                  mutateDisApprovedRequest({
                    ...stateApproved,
                    checkSelected: JSON.stringify(checkSelected),
                    code,
                    isApproved: false,
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
                setNewStateValue(dispatchApproved, approvedInitialState);
                setCheckSelected([]);
              }
            });
          }}
        >
          Disapproved Request
        </LoadingButton>
      </div>
      <fieldset
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "20px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend style={{ fontSize: "14px" }}>Account Information</legend>
        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Autocomplete
            loading={isLoadingGetRCPNList}
            freeSolo
            options={rcpnList.map((itm: any) => itm.RPCDNo)}
            value={stateApproved.RPCD}
            onChange={(e, v: any) => {
              if (v) {
                dispatchApproved({
                  type: "UPDATE_FIELD",
                  field: "RPCD",
                  value: v,
                });
                mutateGetRCPNSelectedDatails({ RPCDNo: v });
              }
            }}
            onInput={(e: any) => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "RPCD",
                value: e.target.value,
              });
            }}
            onBlur={(e) => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "RPCD",
                value: stateApproved.RPCD,
              });
              mutateGetRCPNSelectedDatails({ RPCDNo: stateApproved.RPCD });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  style: { height: "27px", fontSize: "14px" },
                }}
                label="RPCD No."
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
            variant="outlined"
            size="small"
            label="Branch"
            name="PNNo"
            value={stateApproved.PNNo}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              width: "250px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Branch"
            name="branch"
            value={stateApproved.branch}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              width: "250px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Account Name"
            name="client"
            value={stateApproved.client}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              minWidth: "300px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        </Box>
      </fieldset>
      <div
        style={{
          marginTop: "10px",
          width: "100%",
          position: "relative",
          height: "420px",
        }}
      >
        <Box
          style={{
            height: "400px",
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={table}
            isLoading={isLoadingGetRCPNSelectedDatails}
            columns={checkSelectedColumns}
            rows={checkSelected}
            table_id={"temp_id"}
            isSingleSelection={true}
            isRowFreeze={false}
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
            footerChildren={() => <FooterTotal />}
            footerPaginationPosition="left-right"
            showFooterSelectedCount={false}
          />
        </Box>
      </div>
      <fieldset
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "20px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend style={{ fontSize: "14px" }}>Fees and Charges</legend>
        <Box
          sx={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(4,1fr)",
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            label="Holding Fee"
            name="holdingFee"
            placeholder="0.00"
            value={stateApproved.holdingFee}
            onChange={handleInputChange}
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "holdingFee",
                value: parseFloat(
                  stateApproved.holdingFee.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Penalty Charge"
            name="penaltyCharge"
            value={stateApproved.penaltyCharge}
            onChange={handleInputChange}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "penaltyCharge",
                value: parseFloat(
                  stateApproved.penaltyCharge.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Surplus"
            name="surplus"
            placeholder="0.00"
            value={stateApproved.surplus}
            onChange={handleInputChange}
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "surplus",
                value: parseFloat(
                  stateApproved.surplus.replace(/,/g, "")
                ).toFixed(2),
              });
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Deducted to:"
            name="deductedTo"
            value={stateApproved.deductedTo}
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
          <FormControl
            size="small"
            variant="outlined"
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
            <InputLabel id="label-selection-reason">How to be paid</InputLabel>
            <Select
              labelId="label-selection-reason"
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              name="paidVia"
              value={stateApproved.paidVia}
              onChange={handleInputChange}
              readOnly={true}
            >
              <MenuItem value=""></MenuItem>
              <MenuItem value="Over The Counter">Over The Counter</MenuItem>
              <MenuItem value={"direct deposit"}>Direct Deposit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            size="small"
            label="Name of Bank & Branch"
            name="paidInfo"
            value={stateApproved.paidInfo}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              readOnly: true,
            }}
            sx={{
              flex: 1,
              gridColumn: "2 / span 2",

              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <CustomDatePicker
            readOnly={true}
            fullWidth={false}
            label="Date & Time of Deposit"
            onChange={(value: any) => {
              dispatchApproved({
                type: "UPDATE_FIELD",
                field: "paidDate",
                value: value,
              });
            }}
            value={new Date(stateApproved.paidDate)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                const timeout = setTimeout(() => {
                  datePickerRef.current?.querySelector("button")?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={datePickerRef}
            textField={{
              InputLabelProps: {
                style: {
                  fontSize: "14px",
                },
              },
              InputProps: {
                style: { height: "27px", fontSize: "14px" },
              },
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            label="total"
            name="total"
            value={stateApproved.total}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
              inputComponent: NumericFormatCustom as any,
              readOnly: true,
            }}
            sx={{
              flex: 1,
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        </Box>
      </fieldset>
    </Box>
  );
}
function slideAnimation(activeButton: number, idx: number) {
  if (activeButton === idx) {
    return "translateX(100%)";
  } else {
    return "translateX(0%)";
  }
}
