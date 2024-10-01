import { Fragment, useContext, useRef } from "react";
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
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
  formatNumberWithCommas,
} from "../../../../components/PrintPreview/PrintPreview";
import { format } from "date-fns";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

const initialState = {
  dateFormat: "Monthly",
  format: 0,
  date: new Date(),
  sub_acct: "All",
  title: "",
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
    datakey: "Title",
    header: "PARTICULARS",
    width: "400px",
  },
  {
    datakey: "PrevBalance",
    header: "PREVIOUS BALANCE",
    total: true,
    type: "number",
    width: "100px",
  },

  {
    datakey: "CurrBalance",
    header: "TRANSACTIONS",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    datakey: "TotalBalance",
    header: "ENDING BALANCE",
    total: true,
    type: "number",
    width: "100px",
  },
];
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\n${state.dateFormat} Income Statement - Long\n${DateToStringFormat(state)}`;
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
    dispatch({
      type: "UPDATE_FIELD",
      field: "title",
      value: setupTitle(
        { ...state, [name]: value },
        user?.department as string
      ),
    });
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
            <MenuItem value={0}>Default</MenuItem>
            <MenuItem value={1}>Summary</MenuItem>
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
            onChange={handleInputChange}
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
        {state.dateFormat === "Monthly" ? (
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
        ) : (
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
export default function IncomeStatementLong() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);
  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/income-statement-report",
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
      column: column,
      beforeArrangeData: (itm) => {
        const columnNumber = column
          .filter((itm: any) => itm.type === "number")
          .map((d: any) => d.datakey);
        columnNumber.forEach((datakey: any) => {
          if (itm.hasOwnProperty(datakey)) {
            if (isNaN(parseFloat(itm[datakey]))) {
              return itm;
            }
            itm[datakey] = formatNumberWithCommas(
              parseFloat(
                Math.abs(parseFloat(itm[datakey].toString()))
                  .toString()
                  .replace(/,/g, "")
              )
            );
          }
        });
        return itm;
      },
      adjustMaxHeight: 500,
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
                              borderBottom: "1px solid black",
                              textAlign:
                                itm.datakey === "Title" ? "left" : "right",
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
                        <tr key={rowIdx}>
                          {column.map((colItem: any, colIdx: number) => {
                            return (
                              <td
                                onClick={columnSelection}
                                className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                key={colIdx}
                                style={{
                                  borderBottom:
                                    rowItem.third && colItem.datakey !== "Title"
                                      ? "1px dashed #cbd5e1"
                                      : colItem.datakey !== "Title" &&
                                        (rowItem.totalIncome ||
                                          rowItem.totalExpenses)
                                      ? "1px solid black"
                                      : "",
                                  paddingTop:
                                    rowItem.third || rowItem.first
                                      ? "10px"
                                      : "",
                                  paddingBottom:
                                    rowItem.third || rowItem.first
                                      ? "10px"
                                      : "",
                                  paddingLeft: rowItem.first
                                    ? ""
                                    : rowItem.second
                                    ? "20px"
                                    : "50px",
                                  fontSize: "11px",
                                  fontWeight:
                                    rowItem.third || rowItem.first
                                      ? "bold"
                                      : "500",
                                  width: `${colItem.width} !important`,
                                  textAlign:
                                    colItem.datakey === "Title"
                                      ? "left"
                                      : "right",
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
                  <tfoot>
                    {pageNumber === data.length - 1 && (
                      <tr key={"qwewqe"}>
                        <td
                          key={"dddd"}
                          style={{
                            fontWeight: "bold",
                            fontSize: "11px",
                          }}
                          colSpan={1}
                        >
                          NET INCOME / (LOSS)
                        </td>
                        {column.map((itm: any, idx: number) => {
                          if (!itm.total) {
                            return <Fragment key={idx}></Fragment>;
                          }
                          let flattenedArray = data.flat();
                          const total = flattenedArray
                            .filter((itm: any) => itm.second)
                            .reduce((d: any, itms: any) => {
                              return (
                                d +
                                Math.abs(
                                  parseFloat(
                                    itms[itm.datakey]?.replace(/,/g, "")
                                  )
                                )
                              );
                            }, 0);

                          return (
                            <td
                              key={idx}
                              style={{
                                borderBottom: "1px solid black",
                                fontWeight: "bold",
                                textAlign: "right",
                                fontSize: "11px",
                                paddingTop: "20px",
                                paddingBottom: "5px",
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
                  {format(new Date(), "MM/dd/Y")}
                </p>
                <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                  Page {pageNumber + 1} of {data.length}
                </p>
              </div>
            </div>
          );
        });
      }}
      pageHeight={"14in"}
      pageWidth={"10.5in"}
    />
  );
}
