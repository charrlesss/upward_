import { useContext, Fragment } from "react";
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
import { LoadingButton } from "@mui/lab";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
} from "../../../../components/PrintPreview/PrintPreview";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { format } from "date-fns";
import ReactDOMServer from "react-dom/server";

const initialState = {
  fund: 0,
  seriesFrom: `${format(new Date(), "yyMM")}-001`,
  seriesTo: `${format(new Date(), "yyMM")}-010`,
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
    groupId: "a",
  },
  {
    groupHeader: "",
    groupId: "b",
  },
  {
    groupHeader: "",
    groupId: "c",
  },
  {
    groupHeader: "",
    groupId: "d",
  },
  {
    groupHeader: "",
    groupId: "e",
  },
  {
    groupHeader: "DEBIT",
    groupId: "debit",
  },
  {
    groupHeader: "CREDIT",
    groupId: "credit",
  },
];
const column = [
  {
    groupId: "a",
    datakey: "DT",
    header: "DATE",
    width: "150px",
  },
  {
    groupId: "b",
    datakey: "Payee",
    header: "PAYEE",
    width: "150px",
  },
  {
    groupId: "c",
    datakey: "particulars",
    header: "PARTICULARS",
    width: "150px",
  },
  {
    groupId: "d",
    datakey: "transaction",
    header: "TRANSACTION",
    width: "150px",
  },
  {
    groupId: "e",
    datakey: "identity",
    header: "IDENTITY",
    width: "250px",
  },
  {
    groupId: "debit",
    datakey: "Debit",
    header: "AMOUNT",
    type: "number",
    width: "100px",
  },
  {
    groupId: "debit",
    datakey: "DRShort",
    header: "ACCOUNTS",
    width: "150px",
  },
  {
    groupId: "credit",
    datakey: "Credit",
    header: "AMOUNT",
    type: "number",
    width: "100px",
  },
  {
    groupId: "credit",
    datakey: "CRShort",
    header: "ACCOUNTS",
    width: "150px",
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
          itms = state.seriesFrom;
        }
        if (index === vFindIndex2 + 1) {
          itms = state.seriesTo;
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
          <InputLabel id="Fund">Fund</InputLabel>
          <Select
            labelId="fund"
            value={state.fund}
            label="Fund"
            name="fund"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Petty Cash</MenuItem>
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
        <TextField
          label="From"
          fullWidth
          name="seriesFrom"
          value={state.seriesFrom}
          onChange={(e) => {
            handleInputChange(e);
            dispatch({
              type: "UPDATE_FIELD",
              field: "title",
              value: setupTitle({ ...state, seriesFrom: e.target.value }),
            });
          }}
          placeholder={`Ex. ${format(new Date(), "yyMM")}-001`}
          InputProps={{
            style: { height: "27px", fontSize: "12px" },
          }}
          sx={{
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
          }}
        />
        <TextField
          label="To"
          fullWidth
          name="seriesTo"
          value={state.seriesTo}
          onChange={(e) => {
            handleInputChange(e);
            dispatch({
              type: "UPDATE_FIELD",
              field: "title",
              value: setupTitle({ ...state, seriesTo: e.target.value }),
            });
          }}
          placeholder={`Ex. ${format(new Date(), "yyMM")}-001`}
          InputProps={{
            style: { height: "27px", fontSize: "12px" },
          }}
          sx={{
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
          }}
        />
      </Box>
    </div>
  );
}

export default function PettyCashFundDisbursement() {
  const { user, myAxios } = useContext(AuthContext);
  initialState.title = `${
    user?.department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\nPetty Cash Fund Disbursement\nFrom ${format(
    new Date(),
    "yyMM"
  )}-001 To ${format(new Date(), "yyMM")}-002
  `;
  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const response = await myAxios.post(
      "/reports/accounting/petty-cash-fund-disbursement",
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
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.identity}
                    </td>
                    <td
                      colSpan={1}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.DRShort}
                    </td>
                    <td
                      colSpan={1}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.Debit}
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
                      colSpan={2}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "center",
                      }}
                    >
                      {rowItem.identity}
                    </td>
                    <td
                      colSpan={1}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.DRShort}
                    </td>
                    <td
                      colSpan={1}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "bolder",
                        textAlign: "left",
                      }}
                    >
                      {rowItem.Debit}
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
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.identity}
                    </td>
                    <td
                      colSpan={1}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderTop: "1px solid black",
                        borderBottom: "2px solid black",
                      }}
                    >
                      {rowItem.DRShort}
                    </td>
                    <td
                      colSpan={1}
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
                  </tr>
                </Fragment>
              );
            }
            if (rowItem.summ && rowItem.signature) {
              return (
                <Fragment key={rowIdx}>
                  <tr style={{ height: "25px" }}></tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    ></td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.identity}
                    </td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderBottom: "1px solid black",
                        width: "100px",
                      }}
                    ></td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.DRShort}
                    </td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderBottom: "1px solid black",
                      }}
                    ></td>
                    <td
                      style={{
                        fontSize: "11px",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      {rowItem.Debit}
                    </td>
                    <td
                      style={{
                        fontSize: "10px",
                        fontWeight: "bolder",
                        textAlign: "right",
                        borderBottom: "1px solid black",
                      }}
                    ></td>
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
                      {rowItem.particulars}
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

            return <></>;
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
        if (!isNaN(parseFloat(itm.Debit.toString().replace(/,/g, "")))) {
          itm.Debit = parseFloat(
            itm.Debit.toString().replace(/,/g, "")
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        if (!isNaN(parseFloat(itm.Credit.toString().replace(/,/g, "")))) {
          itm.Credit = parseFloat(
            itm.Credit.toString().replace(/,/g, "")
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return itm;
      },
      adjustMaxHeight: 400,
      summaryHeight: summaryHeight - 100,
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
                              textAlign:
                                itm.datakey === "identity" ? "center" : "left",
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
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.identity}
                              </td>
                              <td
                                colSpan={1}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.DRShort}
                              </td>
                              <td
                                colSpan={1}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.Debit}
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
                                colSpan={2}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "center",
                                }}
                              >
                                {rowItem.identity}
                              </td>
                              <td
                                colSpan={1}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.DRShort}
                              </td>
                              <td
                                colSpan={1}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "bolder",
                                  textAlign: "left",
                                }}
                              >
                                {rowItem.Debit}
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
                                colSpan={2}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                }}
                              >
                                {rowItem.identity}
                              </td>
                              <td
                                colSpan={1}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "right",
                                  borderTop: "1px solid black",
                                  borderBottom: "2px solid black",
                                }}
                              >
                                {rowItem.DRShort}
                              </td>
                              <td
                                colSpan={1}
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
                            </tr>
                          </Fragment>
                        );
                      }
                      if (rowItem.summ && rowItem.signature) {
                        return (
                          <Fragment key={rowIdx}>
                            <tr style={{ height: "25px" }}></tr>
                            <tr>
                              <td
                                colSpan={column.length}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bolder",
                                  textAlign: "center",
                                }}
                              >
                                Prepared: ____________________________
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Checked:
                                ____________________________
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Approved:
                                ____________________________
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
                                {rowItem.particulars}
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
                                          : colItem.datakey === "identity"
                                          ? "center"
                                          : rowItem.total
                                          ? "right"
                                          : "left",
                                      padding: rowItem.total ? "5px" : "0 5px",
                                      whiteSpace: "pre-line",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      borderTop:
                                        (rowItem.total &&
                                          colItem.datakey === "Debit") ||
                                        (rowItem.total &&
                                          colItem.datakey === "DRShort") ||
                                        (rowItem.total &&
                                          colItem.datakey === "CRShort") ||
                                        (rowItem.total &&
                                          colItem.datakey === "Credit")
                                          ? "1px solid black"
                                          : "",
                                    }}
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
