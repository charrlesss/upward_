import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../../components/AuthContext";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
} from "../../../../components/PrintPreview/PrintPreview";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CustomDatePicker from "../../../../components/DatePicker";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import { LoadingButton } from "@mui/lab";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

const claimsStatus = [
  "With Offer Letter",
  "With Lacking Documents",
  "With LOA",
  "Submitted to Insurance Company",
  "For Evaluation",
  "For Inspection",
  "For Check Prep",
  "Denied",
  "Done",
  "",
];
const claimType = [
  "OWN DAMAGE",
  "LOST/CARNAP",
  "VTPL-PROPERTY DAMAGE",
  "VTPL-BODILY INJURY",
  "THIRD PARTY-DEATH",
];
const column = [
  { datakey: "AssuredName", header: "Name of Clients", width: "400px" },
  { datakey: "UnitInsured", header: "Unit Insured", width: "400px" },
  { datakey: "PolicyNo", header: "Policy No.", width: "160px" },
  { datakey: "ChassisNo", header: "Chassis No.", width: "160px" },
  { datakey: "PlateNo", header: "Plate No.", width: "160px" },
  { datakey: "DateReceived", header: "Date Received", width: "130px" },
  { datakey: "DateClaim", header: "Date Claim", width: "130px" },
  { datakey: "claim_type", header: "Claim Type", width: "230px" },
  {
    datakey: "AmountClaim",
    header: "Amount Claim",
    width: "160px",
    type: "number",
  },
  {
    datakey: "AmountApproved",
    header: "Amount Approved",
    width: "160px",
    type: "number",
  },
  {
    datakey: "dateInspected",
    header: "Date Inspected",
    width: "130px",
  },
  { datakey: "NameTPPD", header: "Name TPPD", width: "300px" },
  { datakey: "status", header: "Status", width: "230px" },
];
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const policySearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "title",
      value: setupTitle(state),
    });
  }, [state, dispatch]);

  const {
    ModalComponent: PolicyModal,
    isLoading: isLoadingPolicyModal,
    openModal: openPolicyModal,
    closeModal: closePolicyModal,
  } = useQueryModalTable({
    link: {
      url: "/task/claims/claims/get-policy",
      queryUrlName: "searchPolicy",
    },
    columns: [
      { field: "PolicyNo", headerName: "Policy No.", width: 300 },
      { field: "AssuredName", headerName: "Name.", width: 350 },
      { field: "IDNo", headerName: "ID No..", width: 200 },
    ],
    queryKey: "get-policy",
    uniqueId: "PolicyNo",
    responseDataKey: "claimPolicy",
    onSelected: (selectedRowData) => {
      handleInputChange({
        target: {
          name: "PolicyNo",
          value: selectedRowData[0].PolicyNo,
        },
      });
      handleInputChange({
        target: {
          name: "AssuredName",
          value: selectedRowData[0].AssuredName,
        },
      });
      closePolicyModal();
    },
    searchRef: policySearchInputRef,
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      <TextField
        label="Title"
        fullWidth
        name="title"
        value={state.title}
        onChange={handleInputChange}
        rows={6}
        multiline
        InputProps={{
          style: { height: "140px", fontSize: "12px" },
        }}
        sx={{
          flex: 1,
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
        }}
      />
      <Box
        sx={(theme) => ({
          height: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "10px",
          margin: "10px 0",
          [theme.breakpoints.down("sm")]: {
            gridTemplateColumns: "repeat(1,1fr)",
          },
        })}
      >
        <FormControl
          fullWidth
          variant="outlined"
          size="small"
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
          <InputLabel id="status">Status</InputLabel>
          <Select
            labelId="status"
            value={state.status}
            label="Status"
            name="status"
            onChange={(e) => {
              handleInputChange(e);
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1}>Ongoing</MenuItem>
            <MenuItem value={2}>Denied</MenuItem>
            <MenuItem value={3}>Done</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          fullWidth
          variant="outlined"
          size="small"
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
          <InputLabel id="report">Report</InputLabel>
          <Select
            labelId="report"
            value={state.format}
            label="Report"
            name="format"
            onChange={(e) => {
              handleInputChange(e);
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Date Created</MenuItem>
            <MenuItem value={2}>Date Claim</MenuItem>
            <MenuItem value={3}>Date Inspected</MenuItem>
            <MenuItem value={4}>Date Received</MenuItem>
            <MenuItem value={5}>Claim Type</MenuItem>
            <MenuItem value={6}>Policy No.</MenuItem>
          </Select>
        </FormControl>
        {state.format === 5 ? (
          <FormControl
            sx={{
              width: "100%",
              marginRight: "10px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
            }}
          >
            <InputLabel id="claim-type">Claim Types</InputLabel>
            <Select
              labelId="claim-type"
              value={state.claim_type}
              onChange={handleInputChange}
              label="Claim Types"
              size="small"
              name="claim_type"
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              {claimType.map((itm, idx) => {
                return (
                  <MenuItem key={idx} value={idx}>
                    {itm}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        ) : state.format === 6 ? (
          <>
            {isLoadingPolicyModal ? (
              <LoadingButton loading={isLoadingPolicyModal} />
            ) : (
              <FormControl
                sx={{
                  gridColumn: "1/ span 2",
                  width: "100%",
                  ".MuiFormLabel-root": {
                    fontSize: "14px",
                    background: "white",
                    zIndex: 99,
                    padding: "0 3px",
                  },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="policy-no">Policy No.</InputLabel>
                <OutlinedInput
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                    legend: {
                      background: "red",
                    },
                  }}
                  inputRef={policySearchInputRef}
                  name="PolicyNo"
                  value={state.PolicyNo}
                  onChange={handleInputChange}
                  id="policy-no"
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      return openPolicyModal(state.PolicyNo);
                    }
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          openPolicyModal(state.PolicyNo);
                        }}
                        edge="end"
                        color="secondary"
                      >
                        <PersonSearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Policy No."
                />
              </FormControl>
            )}
            <TextField
              name="AssuredName"
              label="Assured Name"
              size="small"
              value={state.AssuredName}
              onChange={handleInputChange}
              InputProps={{
                style: {
                  height: "27px",
                  fontSize: "14px",
                  color: "whie",
                },
                readOnly: true,
              }}
              sx={{
                gridColumn: "1/ span 2",
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
          </>
        ) : (
          <>
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
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
              <InputLabel id="dateFormat_id">Date Format</InputLabel>
              <Select
                id="dateFormat_id"
                label="Date Format"
                value={state.dateFormat}
                name="dateFormat"
                onChange={handleInputChange}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                <MenuItem value={"Monthly"}>Monthly</MenuItem>
                <MenuItem value={"Yearly"}>Yearly</MenuItem>
                <MenuItem value={"Custom"}>Custom</MenuItem>
              </Select>
            </FormControl>
            <ShowDateSelection
              dispatch={dispatch}
              state={state}
              handleInputChange={handleInputChange}
            />
          </>
        )}

        {PolicyModal}
      </Box>
    </div>
  );
}

export default function ClaimsReport() {
  const initialState = {
    format: 0,
    dateFormat: "Monthly",
    dateFrom: new Date(),
    dateTo: new Date(),
    yearCount: new Date().getFullYear().toString().slice(-2),
    title: "",
    PolicyNo: "",
    AssuredName: "",
    claim_type: 0,
    status: 0,
  };
  initialState.title = setupTitle(initialState);
  const { myAxios, user } = useContext(AuthContext);
  async function fetchTable(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/task/claims/claims/report-claim",
      state,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    );
    const jsonData = await response.data;
    arrangeData({
      data: jsonData.report,
      column,
      beforeArrangeData: (itm) => {
        const claimsStatusSorted = claimsStatus.sort();
        if (
          (itm.status === "" ||
            itm.status === null ||
            itm.status === undefined) &&
          itm.header === "0"
        ) {
          itm.status = "---";
        } else {
          itm.status = claimsStatusSorted[parseInt(itm.status?.toString()) -1];
        }
        itm.claim_type = claimType[parseInt(itm.claim_type?.toString())];
        if (itm.header === "0") {
          itm.AmountClaim = parseFloat(
            itm.AmountClaim.replace(/,/g, "")
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          itm.AmountApproved = parseFloat(
            itm.AmountApproved.replace(/,/g, "")
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return itm;
      },
      fontSize: "16px",
      adjustMaxHeight: 200,
    }).then((newData) => {
      setData(newData);
      setLoading(false);
    });
  }

  return (
    <PrintPreview
      column={column}
      initialState={initialState}
      Setting={(state, dispatch) => (
        <Setting state={state} dispatch={dispatch} />
      )}
      onReportSubmit={fetchTable}
      scaleDefaultValue={80}
      drawTable={(data, state) => {
        return data.map((pages: any, pageNumber: number) => {
          return (
            <div className="page out-page" key={pageNumber}>
              <div className="header" style={{ height: "50px" }}></div>
              <div className="content">
                <table>
                  <thead>
                    {state.title.split("\n").map((t: string, idx: number) => {
                      return (
                        <tr key={idx}>
                          <th
                            style={{
                              fontSize: "15px",
                              fontWeight: "bold",
                              textAlign: "left",
                            }}
                            colSpan={column.length}
                          >
                            {t}
                          </th>
                        </tr>
                      );
                    })}
                    <tr style={{ height: "40px" }}></tr>
                    <tr style={{ borderBottom: "1px solid black" }}>
                      {column.map((itm: any, rowIdx: number) => {
                        return (
                          <th
                            onDoubleClick={(e) =>
                              copiedByHeaderOnDoubleClick(e, itm.datakey, data)
                            }
                            style={{
                              width: itm.width,
                              fontSize: "15px",
                              fontWeight: "bold",
                            }}
                            key={rowIdx}
                          >
                            {itm.header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((rowItem: any, rowIdx: number) => {
                      return (
                        <React.Fragment key={rowIdx}>
                          {rowItem.header === "1" && (
                            <tr
                              style={{ height: rowIdx === 0 ? "10px" : "30px" }}
                            ></tr>
                          )}
                          <tr>
                            {column.map((colItem: any, colIdx: number) => {
                              return (
                                <td
                                  onClick={columnSelection}
                                  className={`editable not-looking  page-${pageNumber} row-${rowIdx}_col-${colIdx}`}
                                  key={colIdx}
                                  style={{
                                    fontSize:
                                      rowItem.header === "1" ? "15px" : "14px",
                                    fontWeight:
                                      rowItem.header === "1" ? "700" : "500",
                                    paddingLeft:
                                      colItem.datakey === "AssuredName" &&
                                      rowItem.header === "0"
                                        ? "50px"
                                        : "",
                                    width: `${colItem.width} !important`,
                                    textAlign:
                                      rowItem[colItem.datakey] === "---"
                                        ? "center"
                                        : colItem.type === "number"
                                        ? "right"
                                        : "left",
                                  }}
                                >
                                  {rowItem[colItem.datakey]}
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div
                className="footer"
                style={{
                  height: "50px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                  01/01/2024
                </p>
                <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                  Page {pageNumber + 1} of {data.length}
                </p>
              </div>
            </div>
          );
        });
      }}
      pageHeight={"11in"}
      pageWidth={"14in"}
    />
  );
}

function setupTitle(state: any) {
  return `UPWARD MANAGEMENT INSURANCE SERVICES\nClaims Report (${DateToStringFormat(
    state
  )})
`;
}
function DateToStringFormat(state: any) {
  let dateString = "";
  if (state.dateFormat === "Daily") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (state.dateFormat === "Monthly") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } else if (state.dateFormat === "Yearly") {
    const year = new Date(state.dateFrom).getFullYear();
    const { startYearFormatted, endYearFormatted } = formatYearRange(
      year,
      parseInt(state.yearCount)
    );
    dateString = `${startYearFormatted}-${endYearFormatted}`;
  } else {
    const dateFrom = state.dateFrom.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const dateTo = state.dateTo.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dateString = `${dateFrom} - ${dateTo}`;
  }

  return dateString;
}
function formatYearRange(startYear: number, yearCount: number) {
  const startDate = new Date(startYear, 0, 1); // Month is 0-based, so 0 is January
  const endDate = new Date(startYear + yearCount, 11, 31); // Last day of the last year

  const startYearFormatted = startDate.getFullYear();
  const endYearFormatted = endDate.getFullYear();

  if (endYearFormatted < startYearFormatted) {
    return {
      startYearFormatted: endYearFormatted,
      endYearFormatted: startYearFormatted,
    };
  } else {
    return {
      startYearFormatted,
      endYearFormatted,
    };
  }
}
function ShowDateSelection({ state, dispatch, handleInputChange }: any) {
  const dateFromRef = useRef<HTMLElement>(null);
  const dateToRef = useRef<HTMLElement>(null);

  return (
    <React.Fragment>
      {state.dateFormat === "Custom" && (
        <React.Fragment>
          <CustomDatePicker
            fullWidth={true}
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
                  dateFromRef.current?.querySelector("button")?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={dateFromRef}
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
            fullWidth={true}
            label="Date To"
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
                  dateToRef.current?.querySelector("button")?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={dateToRef}
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
        </React.Fragment>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {state.dateFormat === "Monthly" && (
          <DatePicker
            sx={{
              width: "100%",
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            slotProps={{
              textField: {
                size: "small",
                name: "",
                InputLabelProps: {
                  style: {
                    fontSize: "14px",
                  },
                },
                InputProps: {
                  style: { height: "27px", fontSize: "14px" },
                },
              },
            }}
            label={"Date"}
            views={["month", "year"]}
            value={state.dateFrom}
            onChange={(value) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "dateFrom",
                value: value,
              });
            }}
          />
        )}
        {state.dateFormat === "Yearly" && (
          <React.Fragment>
            <DatePicker
              sx={{
                width: "100%",
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              slotProps={{
                textField: {
                  size: "small",
                  name: "",
                  inputRef: dateFromRef,
                  InputLabelProps: {
                    style: {
                      fontSize: "14px",
                    },
                  },
                  InputProps: {
                    style: { height: "27px", fontSize: "14px" },
                  },
                },
              }}
              label={"Date"}
              views={["year"]}
              value={state.dateFrom}
              onChange={(value) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "dateFrom",
                  value: value,
                });
              }}
            />
            <TextField
              type="number"
              label="Year Count"
              name="yearCount"
              value={state.yearCount}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "12px" },
              }}
              sx={{
                flex: 1,
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          </React.Fragment>
        )}
      </LocalizationProvider>
    </React.Fragment>
  );
}
