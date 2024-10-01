import { useContext, useEffect, useRef, Fragment } from "react";
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
  formatNumberWithCommas,
} from "../../../../components/PrintPreview/PrintPreview";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { format } from "date-fns";

const initialState = {
  dateFormat: "Monthly",
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
    groupHeader: "PREVIOUS BALANCE",
    groupId: "prev-bal",
  },
  {
    groupHeader: "TRANSACTION",
    groupId: "transaction",
  },
  {
    groupHeader: "ENDING",
    groupId: "ending",
  },
];
const column = [
  {
    groupId: "code",
    datakey: "Code",
    header: "Acct No.",
    width: "100px",
  },
  {
    groupId: "title",
    datakey: "Title",
    header: "Account Name",
    width: "250px",
  },
  {
    groupId: "prev-bal",
    datakey: "PrevDebit",
    header: "Debit",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "prev-bal",
    datakey: "PrevCredit",
    header: "Credit",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "prev-bal",
    datakey: "PrevBalance",
    header: "Balance",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "transaction",
    datakey: "CurrDebit",
    header: "Debit",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "transaction",
    datakey: "CurrCredit",
    header: "Credit",
    total: true,
    type: "number",
    width: "100px",
  },
  {
    groupId: "ending",
    datakey: "TotalBalance",
    header: "Balance",
    total: true,
    type: "number",
    width: "100px",
  },
];
function setupTitle(state: any) {
  return `UPWARD MANAGEMENT INSURANCE SERVICES\n${
    state.dateFormat
  } Trial Balance (${DateToStringFormat(state)})`;
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

  useEffect(() => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "title",
      value: setupTitle(state),
    });
  }, [state, dispatch]);

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

export default function FullyPaidAccounts() {
  initialState.title = setupTitle(initialState);
  const { user, myAxios } = useContext(AuthContext);

  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/trial-balance-report",
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
      adjustMaxHeight: 150,
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
                                itm.datakey === "Code" ||
                                itm.datakey === "Title"
                                  ? "left"
                                  : "right",
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
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  width: `${colItem.width} !important`,
                                  textAlign:
                                    colItem.datakey === "AssuredName" ||
                                    colItem.datakey === "Mortgagee"
                                      ? "center"
                                      : colItem.total ||
                                        colItem.datakey === "InsuredValue"
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
                  <tfoot>
                    {pageNumber === data.length - 1 && (
                      <tr>
                        <td
                          style={{
                            fontWeight: "bold",
                            borderTop: "1px solid black",
                            fontSize: "11px",
                          }}
                          colSpan={2}
                        >
                          No. of Records: {data.flat().length - 1}
                        </td>
                        {column.map((itm: any, idx: number) => {
                          if (!itm.total) {
                            if (idx < 2) {
                              return <Fragment key={idx}></Fragment>;
                            }
                            return (
                              <td
                                key={idx}
                                style={{
                                  borderTop: "1px solid black",
                                }}
                              ></td>
                            );
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
      pageHeight={"14in"}
      pageWidth={"10.5in"}
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
