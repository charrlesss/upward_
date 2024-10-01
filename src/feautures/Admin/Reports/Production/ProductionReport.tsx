import React, { useContext, useRef, useState } from "react";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
  formatNumberWithCommas,
} from "../../../../components/PrintPreview/PrintPreview";
import { columnRender } from "../Production/productionreport.column";
import { AuthContext } from "../../../../components/AuthContext";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Box,
} from "@mui/material";
import CustomDatePicker from "../../../../components/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQuery } from "react-query";
import { LoadingButton } from "@mui/lab";
import { flushSync } from "react-dom";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";

const center = ["DateIssued", "PolicyNo", "AssuredName", "EffictiveDate"];
function ShowDateSelection({ user, state, dispatch, handleInputChange }: any) {
  const dateFromRef = useRef<HTMLElement>(null);
  const dateToRef = useRef<HTMLElement>(null);
  return (
    <React.Fragment>
      {state.report === "Custom" && (
        <React.Fragment>
          <CustomDatePicker
            minWidth="150px"
            fullWidth={true}
            label="Date From"
            onChange={(value: any) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "dateFrom",
                value: value,
              });
              state.dateFrom = value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
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
            minWidth="150px"
            fullWidth={true}
            label="Date To"
            onChange={(value: any) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "dateTo",
                value: value,
              });

              state.dateTo = value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
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

      {state.report === "Daily" && (
        <CustomDatePicker
          minWidth="150px"
          fullWidth={true}
          label="Date"
          onChange={(value: any) => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "dateFrom",
              value: value,
            });
            state.dateFrom = value;
            dispatch({
              type: "UPDATE_FIELD",
              field: "title",
              value: setupTitle(state, user?.department as string),
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
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {state.report === "Monthly" && (
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

              state.dateFrom = value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
              });
            }}
          />
        )}
        {state.report === "Yearly" && (
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
                state.dateFrom = value;
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: setupTitle(state, user?.department as string),
                });
              }}
            />
            <TextField
              type="number"
              label="Year Count"
              name="yearCount"
              value={state.yearCount}
              onChange={(e) => {
                handleInputChange(e);
                state.yearCount = e.target.value;
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: setupTitle(state, user?.department as string),
                });
              }}
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
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const { myAxios, user } = useContext(AuthContext);
  const { data: dataAccount, isLoading: isLoadingAccount } = useQuery({
    queryKey: "account",
    queryFn: async () =>
      await myAxios.get("/reports/reports/report-fields/accounts", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  const { data: dataPolicy, isLoading: isLoadingPolicy } = useQuery({
    queryKey: "policy",
    queryFn: async () =>
      await myAxios.get("/reports/reports/report-fields/policy", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "policy" && value !== "TPL") {
      dispatch({ type: "UPDATE_FIELD", field: "mortgagee", value: "" });
    }
    if (name === "mortgagee" && value !== "") {
      dispatch({ type: "UPDATE_FIELD", field: "account", value: "" });
    }
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
          display: "flex",
          gap: "10px",
          margin: "10px 0",
          flexDirection: "column",
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
          <InputLabel id="paper-format-1">Format</InputLabel>
          <Select
            labelId="paper-format-1"
            value={state.format1}
            label="Format"
            name="format1"
            onChange={(e) => {
              handleInputChange(e);
              state.format1 = e.target.value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
              });
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={"Full"}>Full</MenuItem>
            <MenuItem value={"Summary"}>Summary</MenuItem>
          </Select>
        </FormControl>
        {state.mortgagee === "" && (
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
            <InputLabel id="paper-format-2">Format</InputLabel>

            <Select
              id="paper-format-2"
              label="Format"
              value={state.format2}
              name="format2"
              onChange={(e) => {
                handleInputChange(e);
                state.format2 = e.target.value;
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: setupTitle(state, user?.department as string),
                });
              }}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"All"}>All</MenuItem>
              <MenuItem value={"Financed"}>Financed</MenuItem>
            </Select>
          </FormControl>
        )}
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
            id="report"
            label="Report"
            value={state.report}
            name="report"
            onChange={(e) => {
              handleInputChange(e);
              state.report = e.target.value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
              });
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={"Daily"}>Daily</MenuItem>
            <MenuItem value={"Monthly"}>Monthly</MenuItem>
            {state.mortgagee === "" && (
              <MenuItem value={"Yearly"}>Yearly</MenuItem>
            )}
            <MenuItem value={"Custom"}>Custom</MenuItem>
          </Select>
        </FormControl>
        {isLoadingPolicy ? (
          <LoadingButton loading={isLoadingPolicy} />
        ) : (
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
            <InputLabel id="policy">Type</InputLabel>
            <Select
              id="policy"
              label="Type"
              value={state.policy}
              name="policy"
              onChange={(e) => {
                handleInputChange(e);
                state.policy = e.target.value;
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: setupTitle(state, user?.department as string),
                });
              }}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              {dataPolicy?.data.policy.map((item: any, idx: number) => {
                return (
                  <MenuItem key={idx} value={item.Bonds}>
                    {item.Bonds}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
        <ShowDateSelection
          dispatch={dispatch}
          state={state}
          handleInputChange={handleInputChange}
          user={user}
        />
        {state.mortgagee === "" && (
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
            <InputLabel id="policyType">Policy Type</InputLabel>
            <Select
              id="policyType"
              label="Policy Type"
              value={state.policyType}
              name="policyType"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"Regular"}>Regular</MenuItem>
              <MenuItem value={"Temporary"}>Temporary</MenuItem>
            </Select>
          </FormControl>
        )}
        {state.policy === "TPL" && (
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
            <InputLabel id="Mortgagee">Mortgagee</InputLabel>
            <Select
              id="Mortgagee"
              label="Mortgagee"
              value={state.mortgagee}
              name="mortgagee"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={""}></MenuItem>
              <MenuItem value={"AMIFIN"}>AMIFIN</MenuItem>
              <MenuItem value={"N I L - HN"}>N I L - HN</MenuItem>
              <MenuItem value={"N I L - ASTRA"}>N I L - ASTRA</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      <Box
        sx={{
          height: "100%",
          flex: 1,
          alignItems: "center",
          padding: "20px 10px",
          border: "1px solid #94a3b8",
        }}
      >
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            flexDirection: "row",
            columnGap: "10px",
            alignItems: "center",
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
              rowGap: "10px",
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
            <InputLabel id="sort">Sort</InputLabel>
            <Select
              labelId="sort"
              value={state.sort}
              label="Sort"
              name="sort"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"Date Issued"}>Date Issued</MenuItem>
              <MenuItem value={"Policy No#"}>Policy No#</MenuItem>
              <MenuItem value={"Date From"}>Date From</MenuItem>
            </Select>
          </FormControl>
          {isLoadingAccount ? (
            <LoadingButton loading={isLoadingAccount} />
          ) : (
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
              <InputLabel id="account">Account</InputLabel>
              <Select
                id="account"
                label="Account"
                value={state.account}
                name="account"
                onChange={(e) => {
                  handleInputChange(e);
                  state.account = e.target.value;
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "title",
                    value: setupTitle(state, user?.department as string),
                  });
                }}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                {[
                  { Account: state.mortgagee === "" ? "All" : "" },
                  ...dataAccount?.data.accounts,
                ].map((item: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={item.Account}>
                      {item.Account}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>
    </div>
  );
}
const initialState = {
  format1: "Summary",
  format2: "All",
  dateFrom: new Date(),
  dateTo: new Date(),
  policyType: "Regular",
  policy: "COM",
  sort: "Policy No#",
  account: "All",
  report: "Monthly",
  yearCount: "1",
  mortgagee: "",
  title: "",
};
// full
// DateIssued
// PolicyNo
// AssuredName
// EffictiveDate
// InsuredValue
// TotalPremium
// Misc
// Notarial
// DocStamp
// Vat
// LGovTax
// TotalDue
export default function ProductionReport() {
  const { myAxios, user } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);
  const [column, setColumn] = useState(
    columnRender(initialState.policy, initialState.format1)
  );
  async function fetchTable(setData: any, setLoading: any, state: any) {
    const updateColumn = columnRender(state.policy, state.format1);
    console.log(updateColumn)
    flushSync(() => {
      setColumn(updateColumn);
    });
    const response = await myAxios.post(
      "/reports/reports/get-production-report",
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
      column: updateColumn,
      beforeArrangeData: (itm) => {
        const columnNumber = updateColumn
          .filter((itm) => itm.type === "number")
          .map((d) => d.datakey);
        columnNumber.forEach((datakey) => {
          if (itm.hasOwnProperty(datakey)) {
            itm[datakey] = formatNumberWithCommas(
              parseFloat(itm[datakey]?.toString().replace(/,/g, ""))
            );
          }
        });
        return itm;
      },
      adjustMaxHeight: 320,
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
      drawTable={(data, state) => {
        return data.map((pages: any, pageNumber: number) => {
          return (
            <div className="page out-page" key={pageNumber}>
              <div className="header" style={{ height: "50px" }}></div>
              <div className="content">
                <table>
                  <thead>
                    {state.title.split("\n").map((d: any, i: number) => {
                      return (
                        <tr key={i}>
                          <td
                            style={{
                              fontSize: "14px",
                              fontWeight: "bold",
                              textAlign: "left",
                            }}
                            colSpan={column.length}
                          >
                            {d}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ height: "40px" }}></tr>
                    <tr style={{ borderBottom: "1px solid black" }}>
                      {column.map((itm, idx) => {
                        return (
                          <th
                            onDoubleClick={(e) =>
                              copiedByHeaderOnDoubleClick(e, itm.datakey, data)
                            }
                            key={idx}
                            style={{
                              width: itm.width,
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: !center.includes(itm.datakey)
                                ? "center"
                                : "left",
                            }}
                          >
                            {itm.header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((r: any, idx: number) => {
                      return (
                        <tr key={idx}>
                          {column.map((c, i) => {
                            return (
                              <td
                                onClick={columnSelection}
                                className={`page-${pageNumber} row-${idx}_col-${i}`}
                                style={{
                                  width: c.width,
                                  fontSize:
                                    c.datakey === "AssuredName"
                                      ? "10px"
                                      : "11px",
                                  fontWeight: "500",
                                  textAlign:
                                    c.type === "number" ? "right" : "left",
                                }}
                                key={i}
                              >
                                {r[c.datakey]}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {pageNumber === data.length - 1 && (
                      <tr>
                        <td
                          style={{ fontWeight: "bold", fontSize: "11px" }}
                          colSpan={3}
                        >
                          No. of Records:{" "}
                          {(data.flat().length - 1).toLocaleString("en-US")}
                        </td>
                        {column.map((itm: any, idx: number) => {
                          if (!itm.total) {
                            if (idx < 3) {
                              return (
                                <React.Fragment key={idx}></React.Fragment>
                              );
                            }
                            return <td key={idx}></td>;
                          }
                          let flattenedArray = data.flat();
                          const total = flattenedArray.reduce(
                            (d: any, itms: any) => {
                              return (
                                d +
                                parseFloat(itms[itm.datakey]?.replace(/,/g, ""))
                              );
                            },
                            0
                          );

                          return (
                            <td
                              key={idx}
                              style={{
                                borderTop: "1px solid black",
                                fontWeight: "bold",
                                textAlign: "right",
                                fontSize: "11px",
                              }}
                            >
                              {isNaN(total)
                                ? "0"
                                : formatNumberWithCommas(total)}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                    <tr style={{ height: "50px" }}></tr>
                    <tr>
                      <td
                        colSpan={column.length}
                        style={{
                          fontSize: "11px",
                          fontWeight: "bolder",
                          textAlign: "center",
                        }}
                      >
                        Prepared: ________________________________
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Checked: ________________________________
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Approved:
                        ________________________________
                      </td>
                    </tr>
                  </tfoot>
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
                <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                  01/01/2024
                </p>
                <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                  Page {pageNumber + 1} of {data.length}
                </p>
              </div>
            </div>
          );
        });
      }}
    />
  );
}
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  } ${state.format2 !== "All" ? "(Financed)" : ""}\n${
    state.report === "Custom" ? "" : `${state.report} `
  }Production Report(${state.policy} - ${state.account}) ${
    state.format1 === "Summary" ? "Summary" : ""
  }\nCut off Date: ${DateToStringFormat(state)}`;
}
function DateToStringFormat(state: any) {
  let dateString = "";
  if (state.report === "Daily") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (state.report === "Monthly") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } else if (state.report === "Yearly") {
    const year = new Date(state.dateFrom).getFullYear();
    const { startYearFormatted, endYearFormatted } = formatYearRange(
      year,
      parseInt(state.yearCount)
    );
    dateString = `${startYearFormatted}-${endYearFormatted}`;
  } else {
    const dateFrom = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateTo = state.dateTo.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dateString = `${dateFrom} to ${dateTo}`;
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
