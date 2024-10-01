import { useContext, useRef } from "react";
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
} from "../../../../components/PrintPreview/PrintPreview";
import { format } from "date-fns";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ReactDOMServer from "react-dom/server";

const initialState = {
  dateFormat: "Daily",
  format: 0,
  date: new Date(),
  sub_acct: "All",
  title: "",
  nominalAccount: 0,
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
    datakey: "N",
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
    datakey: "CurrDebit",
    header: "DEBIT",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    datakey: "CurrCredit",
    header: "CREDIT",
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
  }\n${state.dateFormat} Balance Sheet - Long\n${DateToStringFormat(state)}`;
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
          <InputLabel id="nominal-account">Nominal Account</InputLabel>
          <Select
            labelId="nominal-account"
            value={state.nominalAccount}
            label="Nominal Account"
            name="nominalAccount"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Pre Closing</MenuItem>
            <MenuItem value={1}>Post Closing</MenuItem>
          </Select>
        </FormControl>
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
            label="Date"
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
export default function BalanceSheetLong() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);

  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting//balance-sheet-long-report",
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
        return itm;
      },
      adjustMaxHeight: 720,
      // drawHeader: (data: any) => {
      //   const DrawHeader = ({ state }: any) => (
      //     <thead>
      //       {state.title.split("\n").map((t: string, idx: number) => {
      //         return (
      //           <tr key={idx}>
      //             <th
      //               style={{
      //                 fontSize: "14px",
      //                 fontWeight: "bold",
      //                 textAlign: "left",
      //               }}
      //               colSpan={column.length}
      //             >
      //               {t}
      //             </th>
      //           </tr>
      //         );
      //       })}
      //       <tr style={{ height: "40px" }}></tr>
      //       <tr>
      //         {column.map((itm: any, rowIdx: number) => {
      //           return (
      //             <th
      //               style={{
      //                 width: itm.width,
      //                 fontSize: "12px",
      //                 fontWeight: "bold",
      //                 borderBottom: "1px solid black",
      //                 textAlign: itm.datakey === "Title" ? "left" : "right",
      //               }}
      //               key={rowIdx}
      //             >
      //               {itm.header}
      //             </th>
      //           );
      //         })}
      //       </tr>
      //       <tr style={{ height: "10px" }}></tr>
      //     </thead>
      //   );
      //   return ReactDOMServer.renderToString(<DrawHeader state={state} />);
      // },
      // drawTable: (rowItem: any) => {
      //   const DrawData = () => (
      //     <tr>
      //       {column.map((colItem: any, colIdx: number) => {
      //         return (
      //           <td
      //             onClick={columnSelection}
      //             key={colIdx}
      //             style={{
      //               paddingBottom:
      //                 rowItem.h2 || rowItem.h3 || rowItem.h1 ? "10px" : "",
      //               paddingTop:
      //                 rowItem.h2 || rowItem.h3 || rowItem.h1 ? "10px" : "",
      //               borderTop:
      //                 rowItem.borderTop && colItem.datakey !== "N"
      //                   ? "1px dotted #94a3b8"
      //                   : "",
      //               borderBottom:
      //                 rowItem.border && colItem.datakey !== "N"
      //                   ? "1px double black"
      //                   : "",
      //               paddingLeft: rowItem.h2
      //                 ? "20px"
      //                 : rowItem.h3
      //                 ? "40px"
      //                 : rowItem.h4
      //                 ? "60px"
      //                 : "0px",
      //               fontSize: "11px",
      //               fontWeight: "500",
      //               width: `${colItem.width} !important`,
      //               textAlign: colItem.datakey === "N" ? "left" : "right",
      //             }}
      //           >
      //             {rowItem[colItem.datakey]}
      //           </td>
      //         );
      //       })}
      //     </tr>
      //   );

      //   return ReactDOMServer.renderToString(<DrawData />);
      // },
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
                      <th></th>
                      <th></th>
                      <th
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        colSpan={2}
                      >
                        TRANSACTION
                      </th>
                      <th></th>
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
                              borderBottom: "1px solid black",
                              textAlign: itm.datakey === "N" ? "center" : "right",
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
                      return (
                        <tr key={rowIdx}>
                          {column.map((colItem: any, colIdx: number) => {
                            return (
                              <td
                                onClick={columnSelection}
                                className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                key={colIdx}
                                style={{
                                  paddingBottom:
                                    rowItem.h2 || rowItem.h3 || rowItem.h1
                                      ? "10px"
                                      : "",
                                  paddingTop:
                                    rowItem.h2 || rowItem.h3 || rowItem.h1
                                      ? "10px"
                                      : "",
                                  borderTop:
                                    rowItem.borderTop && colItem.datakey !== "N"
                                      ? "1px dotted #94a3b8"
                                      : "",
                                  borderBottom:
                                    rowItem.border && colItem.datakey !== "N"
                                      ? "1px double black"
                                      : "",
                                  paddingLeft: rowItem.h2
                                    ? "20px"
                                    : rowItem.h3
                                    ? "40px"
                                    : rowItem.h4
                                    ? "60px"
                                    : "0px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  width: `${colItem.width} !important`,
                                  textAlign:
                                    colItem.datakey === "N" ? "left" : "right",
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
