import React, { useContext, Fragment } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Box,
} from "@mui/material";
import { AuthContext } from "../../../../components/AuthContext";
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
  format: "All Accounts",
  dateFormat: "Monthly",
  sub_acct: "All",
  date: new Date(),
  policyType: "Regular",
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
    datakey: "Row_Num",
    header: "NO.",
    width: "40px",
  },
  {
    datakey: "IDNo",
    header: "Client ID",
    width: "100px",
  },
  {
    datakey: "Shortname",
    header: "Client Name",
    width: "200px",
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "100px",
  },
  {
    datakey: "UnitInssured",
    header: "Unit\nInssured",
    width: "160px",
  },
  {
    datakey: "_DateIssued",
    header: "DATE\nISSUED",
    width: "80px",
  },
  {
    datakey: "_EstimatedValue",
    header: "SUM\nINSURED",
    width: "100px",
  },
  {
    datakey: "_TotalDue",
    header: "GROSS\nPRIUM",
    width: "100px",
  },
  {
    datakey: "_TotalPaid",
    header: "PAYMENT\nMADE",
    width: "100px",
  },
  {
    datakey: "_AgentCom",
    header: "COMM.",
    width: "80px",
  },
  {
    datakey: "_Discount",
    header: "DISC",
    width: "80px",
  },
  {
    datakey: "_Balance",
    header: "COLLECTIBLE",
    width: "100px",
  },
  {
    datakey: "due_days",
    header: "DAYS\nDUE",
    width: "80px",
  },
  {
    datakey: "Remarks",
    header: "Remarks",
    width: "200px",
  },
];
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\n${state.dateFormat} Aging of Accounts\n${DateToStringFormat(state)}`;
}
function DateToStringFormat(state: any) {
  const formattedDate = format(new Date(state.date), "MMMM dd, yyyy");

  return formattedDate;
}
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const { user } = useContext(AuthContext);
  // const { data: dataSubAccounts, isLoading: isLoadingSubAccounts } = useQuery({
  //   queryKey: "sub-accounts",
  //   queryFn: async () =>
  //     await myAxios.get("/reports/accounting/get-sub-account-acronym", {
  //       headers: {
  //         Authorization: `Bearer ${user?.accessToken}`,
  //       },
  //     }),
  // });

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
          <InputLabel id="date_format">Format</InputLabel>
          <Select
            labelId="date_format"
            value={state.format}
            label="Format"
            name="format"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={"All Accounts"}>All Accounts</MenuItem>
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
            <MenuItem value={"Monthly"}>Monthly</MenuItem>
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
          </Select>
        </FormControl>
        {/* {isLoadingSubAccounts ? (
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
        )} */}
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
        {/* {state.dateFormat === "Daily" && (
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
        )} */}

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
            labelId="policyType"
            value={state.policyType}
            label="Policy Type"
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
      </Box>
    </div>
  );
}

export default function AgingAccounts() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);

  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/aging-accounts",
      state,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    );

    const jsonData = await response.data;
    console.log(jsonData);

    arrangeData({
      data: jsonData.report,
      column: column,
      beforeArrangeData: (itm) => {
        return itm;
      },
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
      onReportSubmit={onReportSubmit}
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
                      if (rowItem.isTotal) {
                        return (
                          <React.Fragment key={rowIdx}>
                            <tr style={{ height: "10px" }}></tr>
                            <tr>
                              {column.map((colItem: any, colIdx: number) => {
                                return (
                                  <td
                                    key={colIdx}
                                    style={{
                                      textAlign: "right",
                                      fontWeight: "bold",
                                      fontSize: "11px",
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
                      return (
                        <tr key={rowIdx}>
                          {column.map((colItem: any, colIdx: number) => {
                            return (
                              <td
                                key={colIdx}
                                onClick={columnSelection}
                                className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-${colIdx}`}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: rowItem.total ? "bold" : "500",
                                  width: `${colItem.width} !important`,
                                  textAlign:
                                    colItem.datakey === "_EstimatedValue" ||
                                    colItem.datakey === "_TotalDue" ||
                                    colItem.datakey === "_TotalPaid" ||
                                    colItem.datakey === "_Balance" ||
                                    colItem.datakey === "_Discount" ||
                                    colItem.datakey === "_AgentCom" ||
                                    colItem.datakey === "due_days"
                                      ? "right"
                                      : "left",
                                  padding: rowItem.total ? "5px" : "0 5px",
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
      pageHeight={"8.5in"}
      pageWidth={"14in"}
    />
  );
}
