import React, { useContext, useState } from "react";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
  formatNumberWithCommas,
} from "../../../../components/PrintPreview/PrintPreview";
import { AuthContext } from "../../../../components/AuthContext";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  InputLabel,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQuery } from "react-query";
import { LoadingButton } from "@mui/lab";
import { flushSync } from "react-dom";
import { columnRenderForRenewalNotice } from "./renewalnoticereport.column";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";

const initialState = {
  dateFrom: new Date(),
  policy: "COM",
  type: "Regular",
  account: "All",
  title: "",
};

const center = ["DateIssued", "PolicyNo", "AssuredName", "EffictiveDate"];
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
      <div
        style={{
          height: "100%",
          display: "flex",
          gap: "10px",
          margin: "10px 0",
          flexDirection: "column",
        }}
      >
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
        </LocalizationProvider>
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
          <InputLabel id="policy">Policy</InputLabel>
          <Select
            id="policy"
            label="Policy"
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
            <MenuItem value={"COM"}>COM</MenuItem>
            <MenuItem value={"FIRE"}>FIRE</MenuItem>
            <MenuItem value={"MAR"}>MAR</MenuItem>
            <MenuItem value={"PA"}>PA</MenuItem>
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
              {[{ Account: "All" }, ...dataAccount?.data.accounts].map(
                (item: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={item.Account}>
                      {item.Account}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        )}
        {state.policy === "COM" && (
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
            <InputLabel id="paper-format-1">Type</InputLabel>
            <Select
              labelId="paper-format-1"
              value={state.type}
              label="Type"
              name="type"
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
      </div>
    </div>
  );
}
export default function RenewalNoticeReport() {
  const { myAxios, user } = useContext(AuthContext);
  initialState.title = setupTitle(initialState, user?.department as string);
  const [column, setColumn] = useState(
    columnRenderForRenewalNotice(initialState.policy)
  );
  async function fetchTable(setData: any, setLoading: any, state: any) {
    const updateColumn = columnRenderForRenewalNotice(state.policy);
    flushSync(() => {
      setColumn(updateColumn);
    });
    const response = await myAxios.post(
      "/reports/reports/renewal-notice",
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
          .filter((itm: any) => itm.type === "number")
          .map((d: any) => d.datakey);
        columnNumber.forEach((datakey: any) => {
          if (itm.hasOwnProperty(datakey)) {
            itm[datakey] = formatNumberWithCommas(
              parseFloat(itm[datakey].toString().replace(/,/g, ""))
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
      scaleDefaultValue={100}
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
                      {column.map((itm: any, idx: number) => {
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
                          {column.map((c: any, i: number) => {
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
  } 
Monthly Production Report(${state.policy} - ${state.account}) ${
    state.format1 === "Summary" ? "Summary" : ""
  }
Cut off Date: ${DateToStringFormat(state)}`;
}
function DateToStringFormat(state: any) {
  return state.dateFrom.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
