import { useContext, useRef, useReducer, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Modal,
  Box,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { brown } from "@mui/material/colors";
import { AuthContext } from "../../../../components/AuthContext";
import SearchIcon from "@mui/icons-material/Search";
import { useMutation, useQuery } from "react-query";
import Table from "../../../../components/Table";
import { setNewStateValue } from "./PostDateChecks";
import { AnyPtrRecord } from "dns";
import CustomDatePicker from "../../../../components/DatePicker";
import { format } from "date-fns";
import { flushSync } from "react-dom";
import UpwardTable from "../../../../components/UpwardTable";

const warehouseColumns = [
  { field: "PNo", headerName: "PN No.", width: 130 },
  { field: "IDNo", headerName: "I.D. No", width: 130 },
  {
    field: "dateRecieved",
    headerName: "Date Received",
    width: 120,
  },
  { field: "Name", headerName: "Name", width: 350 },
  { field: "Check_Date", headerName: "Check Date", width: 120 },
  { field: "Check_No", headerName: "Check No.", width: 120 },
  { field: "Check_Amnt", headerName: "Check", width: 130, type: "number" },
  { field: "Bank", headerName: "Bank", width: 100 },
  { field: "PDC_Status", headerName: "PDC Status", width: 100 },
  { field: "PDC_ID", headerName: "PDC_ID", width: 100, hide: true },
];
const initialState = {
  pdcStatus: "",
  searchType: "",
  searchBy: "IDNo",
  remarks: "",
  search: "",
  warehouseMode: "",
  modalRCPNoSearch: "",
  pdcStatusDisable: false,
  pdcStatusDisableOnSearch: false,
};
const reportInitialState = {
  pdcStatus: 0,
  pdcRemarks: "",
  pnno: "",
  sort: 0,
  dateFrom: new Date(),
  dateTo: new Date(),
  specificDate: false,
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

export default function WarehouseChecks() {
  const refParent = useRef<HTMLDivElement>(null);
  const [showModalPullout, setShowModalPullout] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { myAxios, user } = useContext(AuthContext);
  const [warehouseRows, setWarehouseRows] = useState<any>([]);
  const [pullout, setPullout] = useState<any>([]);
  const [pulloutRCPN, setPulloutRCPN] = useState<Array<any>>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const table = useRef<any>(null);
  const tablePullout = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pulloutSearchInputRef = useRef<HTMLInputElement>(null);

  const { isLoading: loadingPulloutRequestId, mutate: mutateLoadRCPN } =
    useMutation({
      mutationKey: "pullout-rcpn-approved",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/pullout/approved/load-rcpn-approved`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (data) => {
        const response = data as any;
        setPulloutRCPN(response.data.rcpn);
      },
    });

  const {
    isLoading: loadingPulloutApprovedList,
    mutate: mutatePulloutApprovedList,
  } = useMutation({
    mutationKey: "pullout-approved-list",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/pullout/approved/load-rcpn-approved-list`,
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (data) => {
      const response = data as any;
      setPullout(response.data.rcpnList);
    },
  });

  const { isLoading: isLoadingCheckSearch, mutate: mutaterCheckSearch } =
    useMutation({
      mutationKey: "check-serach",
      mutationFn: async (variables: any) =>
        myAxios.post(
          "/task/accounting/warehouse/search-pdc-checks-client-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(response) {
        setWarehouseRows(response.data.data);
        setTimeout(() => {
          inputRef?.current?.focus();
        }, 100);
      },
    });

  const { isLoading: isLoadingApprovedPulloutWarehouse } = useQuery({
    queryKey: "search-approved-pullout",
    queryFn: async () =>
      await myAxios.get(
        `/task/accounting/warehouse/search-approved-pullout-warehouse?searchApprovedPullout=`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    refetchOnWindowFocus: false,
  });
  const {
    mutate: mutateSelectecCheckInPullout,
    isLoading: isLoadingSelectecCheckInPullout,
  } = useMutation({
    mutationKey: "selected-check",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/warehouse/search-checklist-approved-pullout-warehouse-selected",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setWarehouseRows([]);
      setWarehouseRows(res?.data.data);
    },
  });
  // const { mutate, isLoading } = useMutation({
  //   mutationKey: "selected-check",
  //   mutationFn: async (variable: any) =>
  //     await myAxios.post(
  //       "/task/accounting/warehouse/get-search-selected-pdc-checks-client-policy",
  //       variable,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${user?.accessToken}`,
  //         },
  //       }
  //     ),
  //   onSuccess: (res) => {
  //     setWarehouseRows([]);
  //     setWarehouseRows(res?.data.data);
  //     // closePolicyIdClientIdRefId();
  //   },
  // });

  const { mutate: saveMutate, isLoading: saveLoading } = useMutation({
    mutationKey: "save-warehouse",
    mutationFn: async (variable: any) =>
      await myAxios.post("/task/accounting/warehouse/save", variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (response: any) => {
      if (response.data.success) {
        // const selected = table.current.getSelectedRows();
        // setWarehouseRows((w: any) => {
        //   return w.filter(
        //     (item: any) =>
        //       !selected.map((items: any) => items.PDC_ID).includes(item.PDC_ID)
        //   );
        // });
        setNewStateValue(dispatch, initialState);
        setWarehouseRows([]);
        setPullout([]);
        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "error",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const handleOnSave = () => {
    const messages = [
      "stored in warehouse?",
      "endorse for deposit?",
      "pulled out?",
    ];
    Swal.fire({
      title: "Are you sure?",
      text:
        "Do you want the check(s) to be " + messages[parseInt(state.pdcStatus)],
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (state.pdcStatus === "2" && state.remarks === "") {
          return Swal.fire({
            position: "center",
            icon: "warning",
            title: "Please provide remarks!",
            timer: 3000,
          });
        }
        if (warehouseRows.length <= 0) {
          return Swal.fire({
            position: "center",
            icon: "warning",
            title: "No current record",
            timer: 3000,
          });
        }

        const selectedList = table.current.getSelectedRows();
        if (selectedList.length <= 0 && !state.pdcStatusDisable) {
          return Swal.fire({
            position: "center",
            icon: "warning",
            title: "Please select from list",
            timer: 3000,
          });
        }
        if (state.pdcStatusDisable) {
          saveMutate({
            ...state,
            selected: JSON.stringify(warehouseRows),
          });
        } else {
          saveMutate({
            ...state,
            selected: JSON.stringify(selectedList),
          });
        }
      }
    });
  };
  const width = window.innerWidth - 100;
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
      <div
        style={
          {
            height: "80px",
            display: "flex",
            columnGap: "50px",
            padding: "10px 40px",
          } as any
        }
      >
        <div
          style={
            {
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: "10px  ",
            } as any
          }
        >
          <div style={{ display: "flex", columnGap: "10px" }}>
            <FormControl
              disabled={
                state.warehouseMode !== "add" ||
                state.pdcStatusDisableOnSearch ||
                state.pdcStatusDisable
              }
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
              <InputLabel id="label-selection-reason">PDC Status</InputLabel>
              <Select
                labelId="label-selection-reason"
                value={state.pdcStatus}
                name="pdcStatus"
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value === "2") {
                    return dispatch({
                      type: "UPDATE_FIELD",
                      field: "remarks",
                      value: "Fully Paid",
                    });
                  } else {
                    return dispatch({
                      type: "UPDATE_FIELD",
                      field: "remarks",
                      value: "",
                    });
                  }
                }}
                autoWidth
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="0">Stored in Warehouse</MenuItem>
                <MenuItem value="1">Endorse for Deposit</MenuItem>
                <MenuItem value="2">Pull Out</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              variant="outlined"
              disabled={
                state.pdcStatus !== "2" || state.warehouseMode !== "add"
              }
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
              <InputLabel id="remarks">Remarks</InputLabel>
              <Select
                labelId="remarks"
                value={state.remarks}
                name="remarks"
                onChange={handleInputChange}
                autoWidth
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="Fully Paid">Fully Paid</MenuItem>
                <MenuItem value="Cash Replacement">Cash Replacement</MenuItem>
                <MenuItem value={"Check Replacement"}>
                  Check Replacement{" "}
                </MenuItem>
                <MenuItem value={"Account Closed"}>Account Closed </MenuItem>
                <MenuItem value={"Hold"}>Hold </MenuItem>
                <MenuItem value={"Not Renewed by"}>Not Renewed by </MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{ display: "flex", columnGap: "10px" }}>
            <FormControl
              size="small"
              variant="outlined"
              disabled={state.warehouseMode !== "add"}
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
              <InputLabel id="search-type">Search Type</InputLabel>
              <Select
                labelId="search-type"
                value={state.searchType}
                name="searchType"
                onChange={handleInputChange}
                autoWidth
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value={"0"}>Policy </MenuItem>
                <MenuItem value={"1"}>ID No.</MenuItem>
                <MenuItem value="2">Account Name</MenuItem>
                <MenuItem value="3">Bank</MenuItem>
              </Select>
            </FormControl>
            {isLoadingCheckSearch ? (
              <LoadingButton loading={isLoadingCheckSearch} />
            ) : (
              <FormControl
                variant="outlined"
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
                disabled={state.warehouseMode !== "add"}
              >
                <InputLabel htmlFor="Search">Search</InputLabel>
                <OutlinedInput
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                  inputRef={inputRef}
                  className="search-input-up-on-key-down"
                  fullWidth
                  label="Search"
                  name="search"
                  value={state.search}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      e.preventDefault();
                      if (state.pdcStatus === "") {
                        return Swal.fire({
                          position: "center",
                          icon: "warning",
                          title: "Please provide status!",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }
                      if (state.searchType === "") {
                        return Swal.fire({
                          position: "center",
                          icon: "warning",
                          title: "Please select search type!",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }
                      if (state.search === "") {
                        return Swal.fire({
                          position: "center",
                          icon: "warning",
                          title: "Type field you want to search!",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }
                      mutaterCheckSearch(state);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const datagridview = document.querySelector(
                        ".grid-container"
                      ) as HTMLDivElement;
                      datagridview.focus();
                    }
                  }}
                  id="policy-client-ref-id"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        disabled={state.warehouseMode !== "add"}
                        aria-label="search-client"
                        color="secondary"
                        edge="end"
                        onClick={() => {
                          if (state.pdcStatus === "") {
                            return Swal.fire({
                              position: "center",
                              icon: "warning",
                              title: "Please provide status!",
                              showConfirmButton: false,
                              timer: 1500,
                            });
                          }

                          if (state.searchType === "") {
                            return Swal.fire({
                              position: "center",
                              icon: "warning",
                              title: "Please select search type!",
                              showConfirmButton: false,
                              timer: 1500,
                            });
                          }

                          if (state.search === "") {
                            return Swal.fire({
                              position: "center",
                              icon: "warning",
                              title: "Type field you want to search!",
                              showConfirmButton: false,
                              timer: 1500,
                            });
                          }

                          mutaterCheckSearch(state);
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1 } as any}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              columnGap: "10px",
              paddingBottom: "5px",
            }}
          >
            {state.warehouseMode === "" && (
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
                    target: { value: "add", name: "warehouseMode" },
                  });
                }}
                color="primary"
              >
                New
              </Button>
            )}
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              disabled={state.warehouseMode === ""}
              onClick={handleOnSave}
              color="success"
              variant="contained"
            >
              Save
            </LoadingButton>
            {state.warehouseMode !== "" && (
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
                      setNewStateValue(dispatch, initialState);
                      table.current?.resetTableSelected();
                      setWarehouseRows([]);
                    }
                  });
                }}
              >
                Cancel
              </LoadingButton>
            )}
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              disabled={
                state.warehouseMode === "" || state.warehouseMode === "add"
              }
              // onClick={handleOnSave}
              color="success"
              variant="contained"
            >
              Delete
            </LoadingButton>
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              color="info"
              onClick={() => setShowReportModal((d) => !d)}
            >
              REPORT
            </Button>
            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
                background: brown[500],
                ":hover": {
                  background: brown[600],
                },
              }}
              variant="contained"
              onClick={() => {
                setShowModalPullout(true);
                mutatePulloutApprovedList({ RCPN: "" });
                mutateLoadRCPN({});
                setTimeout(() => {
                  pulloutSearchInputRef.current?.focus();
                }, 250);
              }}
              disabled={state.warehouseMode === ""}
            >
              Check for pull-out
            </LoadingButton>
          </div>
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
          rows={warehouseRows}
          column={warehouseColumns}
          width={width}
          height={height}
          dataReadOnly={true}
          onSelectionChange={() => {}}
          isMultipleSelect={!state.pdcStatusDisable}
          isRowSelectable={!state.pdcStatusDisable}
        />
      </div>
      <Modal
        open={showModalPullout}
        onClose={() => {
          setShowModalPullout(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Pull Out Viewer
          </Typography>
          <br />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              width: "800px",
              height: "500px",
              flexDirection: "column",
            }}
          >
            {isLoadingApprovedPulloutWarehouse ? (
              <LoadingButton loading={isLoadingApprovedPulloutWarehouse} />
            ) : (
              <Autocomplete
                loading={loadingPulloutRequestId}
                freeSolo
                options={pulloutRCPN.map((itm: any) => itm.RCPNo)}
                value={state.modalRCPNoSearch}
                onChange={(e, v: any) => {
                  if (v) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "modalRCPNoSearch",
                      value: v,
                    });

                    mutatePulloutApprovedList({ RCPN: v });
                  }
                }}
                onInput={(e: any) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "modalRCPNoSearch",
                    value: e.target.value,
                  });
                }}
                onBlur={(e) => {
                  const options = pulloutRCPN;
                  const find = options.find(
                    (itm) => itm.RCPNo === state.modalRCPNoSearch
                  );
                  if (find !== undefined) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "modalRCPNoSearch",
                      value: find.RCPNo,
                    });
                    mutatePulloutApprovedList({ RCPN: find.RCPNo });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    mutatePulloutApprovedList({ RCPN: state.modalRCPNoSearch });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={pulloutSearchInputRef}
                    InputProps={{
                      ...params.InputProps,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    label="PN No."
                  />
                )}
                sx={{
                  width: "100%",
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
            <div
              style={{
                marginTop: "10px",
                width: "100%",
                position: "relative",
              }}
            >
              <UpwardTable
                ref={tablePullout}
                rows={pullout}
                column={[
                  { field: "RCPNo", headerName: "RCP No.", width: 150 },
                  { field: "PNNo", headerName: "PN No.", width: 150 },
                  {
                    field: "Name",
                    headerName: "Name",
                    flex: 1,
                    width: 300,
                  },
                  {
                    field: "NoOfChecks",
                    headerName: "No. of Checks",
                    width: 100,
                  },
                  {
                    field: "Reason",
                    headerName: "Reason",
                    flex: 1,
                    width: 300,
                  },
                ]}
                width={800}
                height={550}
                dataReadOnly={true}
                onSelectionChange={(selectedRow: any) => {
                  if (selectedRow.length > 0) {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "pdcStatus",
                      value: "2",
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "pdcStatusDisable",
                      value: true,
                    });
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "remarks",
                      value: selectedRow[0].Reason,
                    });
                    mutateSelectecCheckInPullout({
                      RCPNo: selectedRow[0].RCPNo,
                    });
                    setShowModalPullout(false);
                  }
                }}
              />
            </div>
            <IconButton
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
              }}
              aria-label="search-client"
              onClick={() => {
                setShowModalPullout(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </Box>
      </Modal>
      <ReportModal
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        myAxios={myAxios}
        user={user}
      />
    </div>
  );
}

const ReportModal = ({
  setShowReportModal,
  showReportModal,
  myAxios,
  user,
}: any) => {
  const datePickerRef1 = useRef<any>();
  const datePickerRef2 = useRef<any>();
  const [state, dispatch] = useReducer(reducer, reportInitialState);
  // /warehouse/report
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const { isLoading, mutate } = useMutation({
    mutationKey: "report",
    mutationFn: async (variable: any) =>
      await myAxios.post(`/task/accounting/warehouse/report`, variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      const status = ["ALL", "Stored", "Endorsed", "Pulled Out"];
      const title = `
      ${
        user?.department === "UMIS"
          ? "UPWARD INSURANCE MANAGEMENT SERVICES \n"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n"
      }
      Post Dated Checks Warehousing Report\n
      ${status[state.pdcStatus]} ${
        state.pdcRemarks === "ALL" ? "" : `(${state.pdcRemarks})`
      } - (${
        state.specificDate
          ? format(state.dateFrom, "MM/dd/yyyy")
          : `${format(state.dateFrom, "MM/dd/yyyy")} To ${format(
              state.dateTo,
              "MM/dd/yyyy"
            )}`
      })
      `;

      console.log(title);
      flushSync(() => {
        localStorage.removeItem("printString");
        localStorage.setItem("dataString", JSON.stringify(response.data.data));
        localStorage.setItem("paper-width", "8.5in");
        localStorage.setItem("paper-height", "11in");
        localStorage.setItem("module", "warehouse");
        localStorage.setItem("state", JSON.stringify(state));
        localStorage.setItem(
          "column",
          JSON.stringify([
            { datakey: "nRef_no", header: "Reference No.", width: "50px" },
            { datakey: "nNAME", header: "Name", width: "250px" },
            { datakey: "Check_No", header: "Check No.", width: "70px" },
            { datakey: "Check_Date", header: "Check Date", width: "70px" },
            { datakey: "Check_Amnt", header: "Check Amount", width: "70px" },
            { datakey: "check_remarks", header: "Reason", width: "100px" },
          ])
        );
        localStorage.setItem("title", title);
      });
      window.open("/dashboard/print", "_blank");
    },
  });

  const handlePrintClick = async () => {
    const statusOptions = [
      "Check_Date",
      "Date_Stored",
      "Date_Endorsed",
      "Date_Pulled_Out",
    ];
    const pdcStatuses = [
      "(PDC_Status='Stored' OR PDC_Status='Endorsed' OR PDC_Status='Pulled Out')",
      "(PDC_Status='Stored')",
      "(PDC_Status='Endorsed')",
      "(PDC_Status='Pulled Out')",
    ];

    const dWHR = statusOptions[state.pdcStatus];
    let WHR = `WHERE ${pdcStatuses[state.pdcStatus]}`;

    if (state.pdcRemarks) {
      WHR += ` AND ifnull(PDC_Remarks,'') = '${state.pdcRemarks}'`;
    }
    if (state.pnno) {
      WHR += ` AND PNo = '${state.pnno}'`;
    }

    if (!state.specificDate) {
      WHR += ``;
    } else {
      WHR += ` AND (${dWHR} >= '${
        state.dateFrom.toISOString().split("T")[0]
      }' AND ${dWHR} <= '${state.dateTo.toISOString().split("T")[0]}')`;
    }

    const sortDirection = state.sort === 0 ? "ASC" : "DESC";
    const query = `SELECT 
                        *,
                      CASE WHEN @prev_source_no = a.ref_no THEN '' ELSE a.ref_no END AS nRef_no,
                      CASE WHEN @prev_source_no = a.ref_no THEN '' ELSE concat(a.PNo ,'    ',a.NAME) END AS nNAME,
                      @prev_source_no := a.ref_no AS prev_source_no
                    FROM 
                    (SELECT ref_no, check_remarks,Date_Pulled_Out,PNo, IDNo, UPPER(Name) AS NAME, Bank, date_format(Check_Date,'%m/%d/%Y') as Check_Date, Check_No,FORMAT(Check_Amnt, 2)   as Check_Amnt 
                        FROM PDC ${WHR} ORDER BY Name ${sortDirection}) AS a`;
    mutate({ query });
  };

  return (
    <Modal
      open={showReportModal}
      onClose={() => {
        setShowReportModal(false);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          width: "350px",
          height: "auto",
        }}
      >
        <Typography
          id="modal-modal-title"
          variant="body2"
          component="h3"
          sx={{
            marginBottom: "10px",
            p: 1,
            textAlign: "center",
            background: "#dbeafe",
          }}
        >
          Post Dated Checks Warehousing Report
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            width: "100%",
            padding: "10px",
            height: "100%",
          }}
        >
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: "100%",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel id="label-selection-reason">PDC Status</InputLabel>
            <Select
              labelId="label-selection-reason"
              value={state.pdcStatus}
              name="pdcStatus"
              onChange={handleInputChange}
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={0}>ALL</MenuItem>
              <MenuItem value={1}>Store in Warehouse</MenuItem>
              <MenuItem value={2}>Endorse for Deposit</MenuItem>
              <MenuItem value={3}>Pull Out</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            disabled={state.pdcStatus !== 3}
            size="small"
            variant="outlined"
            sx={{
              width: "100%",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel id="label-selection-reason">PDC Remarks</InputLabel>
            <Select
              labelId="label-selection-reason"
              value={state.pdcRemarks}
              name="pdcRemarks"
              onChange={handleInputChange}
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"ALL"}>ALL</MenuItem>
              <MenuItem value={"Fully Paid"}>Fully Paid</MenuItem>
              <MenuItem value={"Replaced"}>Replaced</MenuItem>
              <MenuItem value={"Foreclosed"}>Foreclosed</MenuItem>
              <MenuItem value={"Account Closed"}>Account Closed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="PN No."
            size="small"
            name="pnno"
            value={state.pnno}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: "100%",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          >
            <InputLabel id="label-selection-reason">Sort Name By</InputLabel>
            <Select
              labelId="label-selection-reason"
              value={state.sort}
              name="sort"
              onChange={handleInputChange}
              autoWidth
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={0}>Ascending</MenuItem>
              <MenuItem value={1}>Descending</MenuItem>
            </Select>
          </FormControl>
          <div
            style={{
              border: "1px solid black",
              borderRadius: "6px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", columnGap: "10px", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label
                  htmlFor="checkbox1"
                  style={{ fontSize: "13px", fontWeight: "500" }}
                >
                  Date Range :{" "}
                </label>{" "}
                <input
                  checked={!state.specificDate}
                  id="checkbox1"
                  style={{ fontSize: "13px", fontWeight: "500" }}
                  type="checkbox"
                  onChange={() => {
                    handleInputChange({
                      target: { value: false, name: "specificDate" },
                    });
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label
                  htmlFor="checkbox2"
                  style={{ fontSize: "13px", fontWeight: "500" }}
                >
                  Specific Date :{" "}
                </label>{" "}
                <input
                  checked={state.specificDate}
                  id="checkbox2"
                  type="checkbox"
                  onChange={() => {
                    handleInputChange({
                      target: { value: true, name: "specificDate" },
                    });
                  }}
                />
              </div>
            </div>
            <CustomDatePicker
              fullWidth={false}
              disabled={!state.specificDate}
              label="Date From"
              onChange={(value: any) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "dateFrom",
                  value: value,
                });
              }}
              value={new Date(state.dateFrom)}
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
            <CustomDatePicker
              fullWidth={false}
              label="Date To"
              disabled={!state.specificDate}
              onChange={(value: any) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "dateTo",
                  value: value,
                });
              }}
              value={new Date(state.dateTo)}
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
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <LoadingButton
              loading={isLoading}
              disabled={isLoading}
              sx={{
                height: "30px",
                fontSize: "11px",
                width: "150px",
              }}
              variant="contained"
              color="success"
              onClick={handlePrintClick}
            >
              Preview / Print
            </LoadingButton>
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
                width: "150px",
              }}
              variant="contained"
              color="warning"
              onClick={() => {
                setShowReportModal(false);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
