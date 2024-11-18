                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   import { useContext, useRef, Fragment } from "react";
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
import { format } from "date-fns";
import ReactDOMServer from "react-dom/server";
const initialState = {
  dateFormat: "Monthly",
  date: new Date(),
  sub_acct: "All",
  title: ``,
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
const groubHeader = [
  {
    groupHeader: "",
    groupId: "code",
  },
  {
    groupHeader: "",
    groupId: "title",
  },
  {
    groupHeader: "",
    groupId: "client",
  },
  {
    groupHeader: "",
    groupId: "or",
  },
  {
    groupHeader: "",
    groupId: "or",
  },
  {
    groupHeader: "",
    groupId: "or",
  },

  {
    groupHeader: "DEBIT",
    groupId: "debit",
  },
  {
    groupHeader: "CREDIT",
    groupId: "credit",
  },
  {
    groupHeader: "",
    groupId: "or",
  },
  {
    groupHeader: "",
    groupId: "or",
  },
];
const column = [
  {
    groupId: "",
    datakey: "Date",
    header: "DATE",
    width: "90px",
  },
  {
    groupId: "",
    datakey: "IDNo",
    header: "ID#",
    width: "160px",
  },
  {
    groupId: "",
    datakey: "cName",
    header: "CLIENT NAME",
    width: "300px",
  },
  {
    groupId: "",
    datakey: "ORNo",
    header: "OR#",
    width: "80px",
  },
  {
    groupId: "",
    datakey: "Bank",
    header: "BANK/BRANCH",
    width: "100px",
  },
  {
    groupId: "",
    datakey: "cCheck_No",
    header: "CHECK",
    width: "100px",
  },
  {
    groupId: "debit",
    datakey: "Debit",
    header: "AMOUNT",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "debit",
    datakey: "DRTitle",
    header: "ACCOUNTS",
    width: "120px",
  },
  {
    groupId: "credit",
    datakey: "Credit",
    header: "AMOUNT",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "credit",
    datakey: "CRTitle",
    header: "ACCOUNTS",
    width: "120px",
  },
  {
    groupId: "",
    datakey: "Purpose",
    header: "PURPOSE",
    width: "300px",
  },
  {
    groupId: "",
    datakey: "CRRemarks",
    header: "REMARKS",
    width: "300px",
  },
];
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\n${state.dateFormat} Abstract Collections\n${DateToStringFormat(state)}`;
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
export default function AbstractCollections() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);

  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/abstract-collection-report",
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
            if (
              rowItem.summ &&
              !rowItem.header &&
              !rowItem.footer &&
              !rowItem.signature
            ) {
              return (
                <Fragment key={rowIdx}>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "right",
                      }}
                    ></td>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "left",
                      }}
                    >
                      {`${rowItem.GL_Acct}  ${rowItem.Title}`}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.Debit}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.Credit}
                    </td>
                  </tr>
                </Fragment>
              );
            }
            if (rowItem.summ && rowItem.header) {
              return (
                <Fragment key={rowIdx}>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    ></td>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "center",
                      }}
                    >
                      {rowItem.ORNo}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.Purpose}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.CRRemarks}
                    </td>
                  </tr>
                </Fragment>
              );
            }
            if (rowItem.summ && rowItem.footer) {
              return (
                <Fragment key={rowIdx}>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    ></td>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.ORNo}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderTop: "1px solid black",
                        borderBottom: "2px solid black",
                      }}
                    >
                      {rowItem.Debit}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderTop: "1px solid black",
                        borderBottom: "2px solid black",
                      }}
                    >
                      {rowItem.Credit}
                    </td>
                  </tr>
                </Fragment>
              );
            }
            if (rowItem.summ && rowItem.signature) {
              return (
                <Fragment key={rowIdx}>
                  <tr style={{ height: "40px" }}></tr>
                  <tr>
                    <td
                      colSpan={column.length}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "center",
                      }}
                    >
                      Prepared: ________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      Checked: ________________
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Approved: ________________
                    </td>
                  </tr>
                </Fragment>
              );
            }
            if (rowItem.summary) {
              return (
                <Fragment key={rowIdx}>
                  <tr style={{ height: "15px" }}></tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.cName}
                    </td>
                  </tr>
                  <tr style={{ height: "15px" }}></tr>
                </Fragment>
              );
            }
            return <Fragment key={rowIdx}></Fragment>;
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

    arrangeData({
      data: jsonData.report,
      column: column,
      beforeArrangeData: (itm) => {
        if (!isNaN(parseFloat(itm.Debit.replace(/,/g, "")))) {
          itm.Debit = parseFloat(itm.Debit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        }
        if (!isNaN(parseFloat(itm.Credit.replace(/,/g, "")))) {
          itm.Credit = parseFloat(itm.Credit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        }
        return itm;
      },
      adjustMaxHeight: 150,
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
      scaleDefaultValue={90}
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
                      {groubHeader.map((itm, idx) => {
                        const colSpan = column.filter(
                          (itms) => itms.groupId === itm.groupId
                        );
                        return (
                          <th
                            key={idx}
                            colSpan={colSpan.length}
                            style={{
                              fontSize: "10.5px",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {itm.groupHeader}
                          </th>
                        );
                      })}
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
                              fontSize: "10.5px",
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
                  </thead>
                  <tbody>
                    {pages.map((rowItem: any, rowIdx: number) => {
                      if (
                        rowItem.summ &&
                        !rowItem.header &&
                        !rowItem.footer &&
                        !rowItem.signature
                      ) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "right",
                                }}
                              ></td>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "left",
                                }}
                              >
                                {`${rowItem.GL_Acct}  ${rowItem.Title}`}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Debit}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Credit}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      }
                      if (rowItem.summ && rowItem.header) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                }}
                              ></td>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "center",
                                }}
                              >
                                {rowItem.ORNo}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.Purpose}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.CRRemarks}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      }
                      if (rowItem.summ && rowItem.footer) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                }}
                              ></td>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.ORNo}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                  borderTop: "1px solid black",
                                  borderBottom: "2px solid black",
                                }}
                              >
                                {rowItem.Debit}
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                  borderTop: "1px solid black",
                                  borderBottom: "2px solid black",
                                }}
                              >
                                {rowItem.Credit}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      }

                      if (rowItem.summ && rowItem.signature) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr style={{ height: "40px" }}></tr>
                            <tr>
                              <td
                                colSpan={column.length}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "center",
                                }}
                              >
                                Prepared: ________________
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Checked:
                                ________________
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Approved:
                                ________________
                              </td>
                            </tr>
                          </Fragment>
                        );
                      }

                      if (rowItem.summary) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr style={{ height: "15px" }}></tr>
                            <tr>
                              <td
                                colSpan={3}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.cName}
                              </td>
                            </tr>
                            <tr style={{ height: "15px" }}></tr>
                          </Fragment>
                        );
                      }

                      if (rowItem.follows) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr style={{ height: "10px" }}></tr>
                            <tr>
                              <td
                                colSpan={column.length}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "center",
                                }}
                              >
                                {rowItem.cCheck_No}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      }
                      return (
                        <tr key={rowIdx}>
                          {column.map((colItem: any, colIdx: number) => {
                            return (
                              <Fragment key={colIdx}>
                                {(rowItem.total &&
                                  colItem.datakey === "DRTitle") ||
                                (rowItem.total &&
                                  colItem.datakey === "CRTitle") ? (
                                  <></>
                                ) : (
                                  <td
                                    onClick={columnSelection}
                                    className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: rowItem.total
                                        ? "bold"
                                        : "500",
                                      width: `${colItem.width} !important`,
                                      textAlign:
                                        colItem.type === "number"
                                          ? "right"
                                          : "left",
                                      borderTop:
                                        (rowItem.total &&
                                          colItem.datakey === "Debit") ||
                                        (rowItem.total &&
                                          colItem.datakey === "Credit") ||
                                        (rowItem.total &&
                                          colItem.datakey === "DRTitle") ||
                                        (rowItem.total &&
                                          colItem.datakey === "CRTitle")
                                          ? "1px solid black"
                                          : "",
                                    }}
                                    colSpan={
                                      (rowItem.total &&
                                        colItem.datakey === "Debit") ||
                                      (rowItem.total &&
                                        colItem.datakey === "Credit")
                                        ? 2
                                        : 1
                                    }
                                  >
                                    {rowItem[colItem.datakey]}
                                  </td>
                                )}
                              </Fragment>
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
      pageHeight={"8.5in"}
      pageWidth={"13in"}
      addHeaderGroup={
        <tr>
          {groubHeader.map((itm, idx) => {
            const colSpan = column.filter(
              (itms) => itms.groupId === itm.groupId
            );
            return (
              <th
                key={idx}
                colSpan={colSpan.length}
                style={{
                  fontSize: "12.5px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {itm.groupHeader}
              </th>
            );
          })}
        </tr>
      }
    />
  );
}
