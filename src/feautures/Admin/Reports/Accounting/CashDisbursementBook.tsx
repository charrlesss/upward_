import React, { useContext, useRef } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Box,
} from "@mui/material";
import { useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import CustomDatePicker from "../../../../components/DatePicker";
import { LoadingButton } from "@mui/lab";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
} from "../../../../components/PrintPreview/PrintPreview";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import ReactDOMServer from "react-dom/server";
import { format } from "date-fns";

const initialState = {
  dateFormat: "Monthly",
  date: new Date(),
  sub_acct: "All",
  title: "",
  format: 0,
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

const column = [
  {
    groupId: "",
    datakey: "Acct_Code",
    header: "ACCT.",
    width: "110px",
  },
  {
    groupId: "",
    datakey: "Acct_Title",
    header: "ACCOUNT NAME",
    width: "130px",
  },
  {
    groupId: "",
    datakey: "subAcct",
    header: "SUB-ACCOUNT",
    width: "180px",
  },
  {
    groupId: "",
    datakey: "IDNo",
    header: "ID NO.",
    width: "150px",
  },
  {
    groupId: "",
    datakey: "Name",
    header: "ID NAME",
    width: "150px",
  },
  {
    groupId: "",
    datakey: "Debit",
    header: "DEBIT",
    type: "number",
    width: "90px",
  },
  {
    groupId: "",
    datakey: "Credit",
    header: "CREDIT",
    type: "number",
    width: "90px",
  },
  {
    groupId: "",
    datakey: "TC",
    header: "",
    width: "70px",
  },
];
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\n${state.dateFormat} Cash Disbursement Book - CDB\n${DateToStringFormat(
    state
  )}`;
}
function DateToStringFormat(state: any) {
  let dateString = "";
  if (state.dateFormat === "Daily") {
    dateString = state.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (state.dateFormat === "Monthly") {
    dateString = state.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  return dateString.toString();
}
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const dateFromRef = useRef<HTMLElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const { data: dataSubAccounts, isLoading: isLoadingSubAccounts } = useQuery({
    queryKey: "sub-accounts",
    queryFn: async () =>
      await myAxios.get("/reports/accounting/get-sub-account-acronym", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
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
          gridTemplateColumns: "repeat(1,1fr)",
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
          <InputLabel id="format">Format</InputLabel>
          <Select
            labelId="format"
            value={state.format}
            label="Format"
            name="format"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Format - 1</MenuItem>
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
          <InputLabel id="date_format">Report</InputLabel>
          <Select
            labelId="date_format"
            value={state.dateFormat}
            label="Report"
            name="dateFormat"
            onChange={(e) => {
              handleInputChange(e);
              state.dateFormat = e.target.value;
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
          </Select>
        </FormControl>
        {isLoadingSubAccounts ? (
          <LoadingButton loading={isLoadingSubAccounts} />
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
            <InputLabel id="sub_account_id">Sub Account</InputLabel>
            <Select
              labelId="sub_account_id"
              value={state.sub_acct}
              label="Sub Account"
              name="sub_acct"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"All"}>All</MenuItem>
              {dataSubAccounts?.data.sub_account.map(
                (itm: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={itm.Acronym}>
                      {itm.Acronym}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        )}
        {state.dateFormat === "Monthly" && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              value={state.date}
              onChange={(value) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "date",
                  value: value,
                });
                state.date = value;
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: setupTitle(state, user?.department as string),
                });
              }}
            />
          </LocalizationProvider>
        )}
        {state.dateFormat === "Daily" && (
          <CustomDatePicker
            fullWidth={true}
            label="Date From"
            onChange={(value: any) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "date",
                value: value,
              });
              state.date = value;
              dispatch({
                type: "UPDATE_FIELD",
                field: "title",
                value: setupTitle(state, user?.department as string),
              });
            }}
            value={new Date(state.date)}
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
      </Box>
    </div>
  );
}

export default function CashDisbursementBook() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);
  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/cash-disbursement-book-cdb",
      state,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    );
    const jsonData = await response.data;
    const SummaryTable = () => (
      <table>
        <tbody>
          {jsonData.summary.map((rowItem: any, rowIdx: number) => {
            if (rowItem.summary) {
              return (
                <React.Fragment key={rowIdx}>
                  <tr style={{ height: "20px" }}></tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.Acct_Title}
                    </td>
                  </tr>
                </React.Fragment>
              );
            }
            if (rowItem.summaryHeader) {
              return (
                <React.Fragment key={rowIdx}>
                  <tr style={{ height: "50px" }}></tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      ACCOUNT TITLE
                    </td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      DEBIT
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      CREDIT
                    </td>
                  </tr>
                  <tr style={{ height: "10px" }}></tr>
                </React.Fragment>
              );
            }
            if (rowItem.summaryData) {
              return (
                <React.Fragment key={rowIdx}>
                  <tr>
                    <td colSpan={2}></td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.Acct_Code}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {rowItem.Acct_Title}
                    </td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                        paddingRight: "100px",
                      }}
                    >
                      {rowItem.Debit}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                        paddingRight: "120px",
                      }}
                    >
                      {rowItem.Credit}
                    </td>
                  </tr>
                </React.Fragment>
              );
            }
            if (rowItem.summaryFooter) {
              return (
                <React.Fragment key={rowIdx}>
                  <tr style={{ height: "10px" }}></tr>
                  <tr style={{ height: "5px" }}>
                    <td colSpan={2}></td>
                    <td colSpan={2}></td>
                    <td style={{ borderTop: "1px solid black" }}></td>
                    <td style={{ borderTop: "1px solid black" }}></td>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                        paddingRight: "20px",
                      }}
                    >
                      {rowItem.Acct_Title}
                    </td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                        paddingRight: "100px",
                      }}
                    >
                      {rowItem.Debit}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "right",
                        paddingRight: "120px",
                      }}
                    >
                      {rowItem.Credit}
                    </td>
                  </tr>
                  <tr style={{ height: "5px" }}>
                    <td colSpan={2}></td>
                    <td colSpan={2}></td>
                    <td style={{ borderBottom: "2px solid black" }}></td>
                    <td style={{ borderBottom: "2px solid black" }}></td>
                  </tr>
                </React.Fragment>
              );
            }

            return <React.Fragment key={rowIdx}></React.Fragment>;
          })}
        </tbody>
      </table>
    );
    const componentAsString = ReactDOMServer.renderToString(<SummaryTable />);
    const summaryContainer = document.createElement("div");
    summaryContainer.innerHTML = componentAsString;
    document.body.appendChild(summaryContainer);
    const summaryHeight = summaryContainer.getBoundingClientRect().height;
    document.body.removeChild(summaryContainer);
    console.log(jsonData)
    arrangeData({
      data: jsonData.report,
      column: column,
      beforeArrangeData: (itm) => {
        return itm;
      },
      adjustMaxHeight: 500,
      summaryHeight,
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
      onReportSubmit={onReportSubmit}
      scaleDefaultValue={100}
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
                              fontSize: "14px",
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
                    <tr>
                      <th
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textAlign: "left",
                        }}
                      >
                        DATE
                      </th>
                      <th
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textAlign: "left",
                        }}
                      >
                        REFERENCE #
                      </th>
                      <th
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textAlign: "left",
                        }}
                        colSpan={6}
                      >
                        EXPLANATION
                      </th>
                    </tr>
                    <tr>
                      {column.map((itm: any, rowIdx: number) => {
                        return (
                          <th
                            onDoubleClick={(e) =>
                              copiedByHeaderOnDoubleClick(e, itm.datakey, data)
                            }
                            style={{
                              width: itm.width,
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "left",
                            }}
                            key={rowIdx}
                          >
                            {itm.header}
                          </th>
                        );
                      })}
                    </tr>
                    <tr style={{ height: "10px" }}></tr>
                  </thead>
                  <tbody>
                    {pages.map((rowItem: any, rowIdx: number) => {
                      console.log(rowItem.nHeader);
                      if (rowItem.nHeader === "1") {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "5px" }}></tr>
                            <tr>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                {rowItem.Date_Entry}
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                {rowItem.nST}
                              </td>

                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                                colSpan={6}
                              >
                                {rowItem.Explanation}
                              </td>
                            </tr>
                            <tr key={rowIdx}>
                              {column.map((colItem: any, colIdx: number) => {
                                return (
                                  <td
                                    onClick={columnSelection}
                                    className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                    key={colIdx}
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      width: `${colItem.width} !important`,
                                      textAlign:
                                        colItem.type === "number"
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
                      }
                      if (rowItem.mainTotal) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "10px" }}></tr>
                            <tr>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                }}
                                colSpan={5}
                              >
                                {rowItem.Name}
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Debit}
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Credit}
                              </td>
                            </tr>
                            <tr
                              style={{
                                height: "5px",
                              }}
                            >
                              <td colSpan={5}></td>
                              <td
                                style={{
                                  borderBottom: "2px solid black",
                                }}
                              ></td>
                              <td
                                style={{
                                  borderBottom: "2px solid black",
                                }}
                              ></td>
                            </tr>
                          </React.Fragment>
                        );
                      }

                      if (rowItem.summary) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "20px" }}></tr>
                            <tr>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Acct_Title}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      }
                      if (rowItem.summaryHeader) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "50px" }}></tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                ACCOUNT TITLE
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                DEBIT
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                CREDIT
                              </td>
                            </tr>
                            <tr style={{ height: "10px" }}></tr>
                          </React.Fragment>
                        );
                      }
                      if (rowItem.summaryData) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr>
                              <td colSpan={2}></td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.Acct_Code}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {rowItem.Acct_Title}
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  paddingRight: "100px",
                                }}
                              >
                                {rowItem.Debit}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  paddingRight: "120px",
                                }}
                              >
                                {rowItem.Credit}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      }
                      if (rowItem.summaryFooter) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "10px" }}></tr>
                            <tr style={{ height: "5px" }}>
                              <td colSpan={2}></td>
                              <td colSpan={2}></td>
                              <td style={{ borderTop: "1px solid black" }}></td>
                              <td style={{ borderTop: "1px solid black" }}></td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  paddingRight: "20px",
                                }}
                              >
                                {rowItem.Acct_Title}
                              </td>
                              <td
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  paddingRight: "100px",
                                }}
                              >
                                {rowItem.Debit}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  paddingRight: "120px",
                                }}
                              >
                                {rowItem.Credit}
                              </td>
                            </tr>
                            <tr style={{ height: "5px" }}>
                              <td colSpan={2}></td>
                              <td colSpan={2}></td>
                              <td
                                style={{ borderBottom: "2px solid black" }}
                              ></td>
                              <td
                                style={{ borderBottom: "2px solid black" }}
                              ></td>
                            </tr>
                          </React.Fragment>
                        );
                      }

                      return (
                        <tr key={rowIdx}>
                          {column.map((colItem: any, colIdx: number) => {
                            return (
                              <td
                                onClick={columnSelection}
                                className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                key={colIdx}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  width: `${colItem.width} !important`,
                                  textAlign:
                                    colItem.type === "number"
                                      ? "right"
                                      : "left",
                                }}
                              >
                                {rowItem[colItem.datakey]}
                              </td>
                            );
                          })}
                        </tr>
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
                <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                  {format(new Date(), "dd/MM/yyyy")}
                </p>
                <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                  Page {pageNumber + 1} of {data.length}
                </p>
              </div>
            </div>
          );
        });
      }}
      pageHeight={"13in"}
      pageWidth={"9in"}
    />
  );
}
