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
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { format } from "date-fns";

const initialState = {
  format: 0,
  field: 0,
  type: 0,
  datefrom: new Date(),
  dateto: new Date(),
  sub_acct: "All",
  sort: 0,
  order: 0,
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

const column = [
  {
    datakey: "Date",
    header: "DATE\nRECEIVED",
    width: "100px",
  },
  {
    datakey: "Name",
    header: "NAME",
    width: "250px",
  },
  {
    datakey: "Check_Date",
    header: "CHECK\nDATE",
    width: "100px",
  },
  {
    datakey: "Bank",
    header: "BANK",
    width: "100px",
  },
  {
    datakey: "Check_No",
    header: "CHECK #",
    width: "100px",
  },
  {
    datakey: "Check_Amnt",
    header: "AMOUNT",
    width: "100px",
    type: "number",
  },
  {
    datakey: "ORNum",
    header: "OR #",
    width: "100px",
  },
  {
    datakey: "Check_Remarks",
    header: "REMARKS",
    width: "100px",
  },
];
function setupTitle(state: any) {
  let titleArray = state.title.split("\n");

  let newTitle = [];

  newTitle = titleArray.map((itm: string, idx: number) => {
    if (idx === 2) {
      const vFindIndex1 = itm.split(" ").findIndex((v: string) => {
        return v.includes("From");
      });
      const vFindIndex2 = itm.split(" ").findIndex((v: string) => {
        return v.includes("To");
      });

      const stringSplit = itm.split(" ");
      const newItm = stringSplit.map((itms: any, index: number) => {
        if (index === vFindIndex1 + 1) {
          itms = format(new Date(state.datefrom), "MM/dd/yyyy");
        }
        if (index === vFindIndex2 + 1) {
          itms = format(new Date(state.dateto), "MM/dd/yyyy");
        }
        return itms;
      });
      itm = newItm.join(" ");
    }
    return itm;
  });

  return newTitle.join("\n");
}

function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const dateFromRef = useRef<HTMLElement>(null);
  const dateToRef = useRef<HTMLElement>(null);

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
            <MenuItem value={1}>Format - 2</MenuItem>
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
          <InputLabel id="field">Field</InputLabel>
          <Select
            labelId="field"
            value={state.field}
            label="Field"
            name="field"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Check Date</MenuItem>
            <MenuItem value={1}>Date Received</MenuItem>
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
            <InputLabel id="sub_account_id">Branch</InputLabel>
            <Select
              labelId="sub_account_id"
              value={state.sub_acct}
              label="Branch"
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
        <CustomDatePicker
          fullWidth={true}
          label="Date From"
          onChange={(value: any) => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "datefrom",
              value: value,
            });
            dispatch({
              type: "UPDATE_FIELD",
              field: "title",
              value: setupTitle({ ...state, datefrom: value }),
            });
          }}
          value={new Date(state.datefrom)}
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
              field: "dateto",
              value: value,
            });
            dispatch({
              type: "UPDATE_FIELD",
              field: "title",
              value: setupTitle({ ...state, dateto: value }),
            });
          }}
          value={new Date(state.dateto)}
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
          <InputLabel id="type">Type</InputLabel>
          <Select
            labelId="type"
            value={state.type}
            label="Type"
            name="type"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1}>Rent</MenuItem>
            <MenuItem value={2}>Loan</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <div
        style={{
          border: "1px solid #6b7280",
          padding: "10px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          rowGap: "10px",
        }}
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
            <MenuItem value={0}>Name</MenuItem>
            <MenuItem value={1}>Check Date</MenuItem>
            <MenuItem value={2}>Date Received</MenuItem>
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
          <InputLabel id="order">Order</InputLabel>
          <Select
            labelId="order"
            value={state.order}
            label="Order"
            name="order"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Ascending</MenuItem>
            <MenuItem value={1}>Descending</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  );
}

export default function PostDatedChecksRegistry() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = `${
    user?.department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\nPost Date Checks Registry\nFrom ${format(
    new Date(),
    "MM/dd/yyyy"
  )} To ${format(new Date(), "MM/dd/yyyy")}
  `;
  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/post-dated-check-registered",
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
        return itm;
      },
      adjustMaxHeight: 250,
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
                              textAlign:
                                itm.datakey === "Name" ? "center" : "left",
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
                      if (rowItem.header) {
                        return (
                          <tr key={rowIdx}>
                            <td
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textAlign: "left",
                              }}
                              colSpan={column.length}
                            >
                              {rowItem.Date}
                            </td>
                          </tr>
                        );
                      }
                      if (rowItem.footer) {
                        return (
                          <tr key={rowIdx}>
                            <td colSpan={2}></td>
                            <td
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textAlign: "left",
                              }}
                              colSpan={3}
                            >
                              {rowItem.Check_Date}
                            </td>
                            <td
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textAlign: "right",
                                borderTop: "1px solid black",
                                padding: "5px 0",
                              }}
                            >
                              {rowItem.Check_Amnt}
                            </td>
                            <td
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textAlign: "right",
                                borderTop: "1px solid black",
                                padding: "0px 5px",
                              }}
                            ></td>
                            <td
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                textAlign: "right",
                                borderTop: "1px solid black",
                                padding: "5px 0",
                              }}
                            ></td>
                          </tr>
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
                                    colItem.datakey === "Check_Amnt"
                                      ? "right"
                                      : colItem.datakey === "Name"
                                      ? "center"
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
      pageHeight={"11in"}
      pageWidth={"8.5in"}
    />
  );
}
