import React, { useContext, useRef, useState, CSSProperties } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Box,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import { useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import CustomDatePicker from "../../../../components/DatePicker";
import { LoadingButton } from "@mui/lab";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PrintPreview, {
  columnSelection,
  copiedByHeaderOnDoubleClick,
} from "../../../../components/PrintPreview/PrintPreview";
import "./productionreport.css";
import { flushSync } from "react-dom";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { format } from "date-fns";

const initialState = {
  account: "",
  account_title: "",
  dateFormat: "Custom",
  dateFrom: new Date(),
  dateTo: new Date(),
  yearCount: new Date().getFullYear().toString().slice(-2),
  subsi: 0,
  subsi_options: "",
  format: 0,
  field: 0,
  title: "",
  report: "Custom",
};
const subsidiaryLedgerColumnWithBalance = [
  {
    datakey: "Date_Entry",
    header: "DATE",
    width: "170px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Source_No",
    header: "REF NO.",
    width: "300px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Sub_Acct",
    header: "SUB ACCT.",
    width: "100px",
    excelColumnWidth: 20,
  },
  {
    datakey: "ID_No",
    header: "ID NO",
    width: "300px",
    excelColumnWidth: 20,
  },
  // {
  //   datakey: "Check_No",
  //   header: "CHECK NO",
  //   width: "120px",
  //   excelColumnWidth: 20,
  // },
  {
    datakey: "Debit",
    header: "DEBIT",
    type: "number",
    total: true,
    width: "100px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Credit",
    header: "CREDIT",
    type: "number",
    total: true,
    width: "100px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Bal",
    header: "BALANCE",
    total: true,
    type: "number",
    width: "100px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Explanation",
    header: "EXPLANATION",
    width: "300px",
    excelColumnWidth: 20,
  },
];
const subsidiaryLedgerColumnNoBalance = [
  {
    datakey: "Date_Entry",
    header: "DATE",
    width: "170px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Source_No",
    header: "REF NO.",
    width: "250px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Sub_Acct",
    header: "SUB ACCT.",
    width: "100px",
    excelColumnWidth: 20,
  },
  {
    datakey: "ID_No",
    header: "ID NO",
    width: "300px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Check_No",
    header: "CHECK NO",
    width: "120px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Debit",
    header: "DEBIT",
    total: true,
    type: "number",
    width: "120px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Credit",
    header: "CREDIT",
    total: true,
    type: "number",
    width: "120px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Explanation",
    header: "EXPLANATION",
    width: "200px",
    excelColumnWidth: 20,
  },
];
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
function ShowDateSelection({ state, dispatch, handleInputChange, user }: any) {
  const dateFromRef = useRef<HTMLElement>(null);
  const dateToRef = useRef<HTMLElement>(null);

  return (
    <>
      <CustomDatePicker
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
        sx={{}}
      />
      <CustomDatePicker
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
    </>
  );
}
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\nSubsidiary Ledger\n\n\nAccount:${
    state.account === "" ? "" : `${state.account_title} `
  }(${state.account === "" ? "ALL" : state.account})\n${
    state.subsi === 0
      ? `For the Period: ${DateToStringFormat(state)}`
      : state.subsi === 1
      ? `ID No.:  (${state.subsi_options})`
      : `Sub Account: (${state.subsi_options})`
  }
`;
}
function DateToStringFormat(state: any) {
  let dateString = "";
  if (state.dateFormat === "Daily") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (state.dateFormat === "Monthly") {
    dateString = state.dateFrom.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } else if (state.dateFormat === "Yearly") {
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
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const clientSearchInput = useRef<HTMLInputElement>(null);
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

  const {
    ModalComponent: ModalClientIDs,
    openModal: openCliendIDsModal,
    isLoading: isLoadingClientIdsModal,
    closeModal: closeCliendIDsModal,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-pdc-policy-id",
      queryUrlName: "searchPdcPolicyIds",
    },
    columns: [
      { field: "Type", headerName: "Type", width: 130 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      {
        field: "Name",
        headerName: "Name",
        flex: 1,
      },
      {
        field: "ID",
        headerName: "ID",
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "client-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "subsi_options",
        value: selectedRowData[0].IDNo,
      });
      state.subsi_options = selectedRowData[0].IDNo;
      dispatch({
        type: "UPDATE_FIELD",
        field: "title",
        value: setupTitle(state, user?.department as string),
      });

      closeCliendIDsModal();
    },
    searchRef: clientSearchInput,
  });

  const {
    ModalComponent: modalChartAccount,
    openModal: openChartAccountModal,
    isLoading: isLoadingChartAccountModal,
    closeModal: closeChartAccountModal,
  } = useQueryModalTable({
    link: {
      url: "/reports/accounting/chart-schedule-account",
      queryUrlName: "account_search",
    },
    columns: [
      { field: "Acct_Code", headerName: "Code", width: 130 },
      { field: "Acct_Title", headerName: "Tittle", flex: 1 },
      {
        field: "Short",
        headerName: "Short Name",
        flex: 1,
      },
    ],
    queryKey: "chart-account-ids",
    uniqueId: "Acct_Code",
    responseDataKey: "chartAccount",
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "account",
        value: selectedRowData[0].Acct_Code,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "account_title",
        value: selectedRowData[0].Acct_Title,
      });

      state.account = selectedRowData[0].Acct_Code;
      dispatch({
        type: "UPDATE_FIELD",
        field: "title",
        value: setupTitle(state, user?.department as string),
      });

      state.account_title = selectedRowData[0].Acct_Title;
      dispatch({
        type: "UPDATE_FIELD",
        field: "title",
        value: setupTitle(state, user?.department as string),
      });

      closeChartAccountModal();
    },
    searchRef: chartAccountSearchInput,
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "account" && value === "") {
      dispatch({ type: "UPDATE_FIELD", field: "account_title", value: "" });
    }
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
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "10px 0",
          width: "100%",
        })}
      >
        {isLoadingChartAccountModal ? (
          <LoadingButton loading={isLoadingChartAccountModal} />
        ) : (
          <FormControl
            sx={{
              gridColumn: "1 / span 2",
              width: "100%",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            variant="outlined"
            size="small"
          >
            <InputLabel htmlFor="account_id">Account</InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              name="account"
              value={state.account}
              onChange={handleInputChange}
              id="account_id"
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  return openChartAccountModal(state.account);
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      openChartAccountModal(state.account);
                    }}
                    edge="end"
                    color="secondary"
                  >
                    <PersonSearchIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Account"
            />
          </FormControl>
        )}
        <TextField
          fullWidth
          name="account_title"
          value={state.account_title}
          onChange={handleInputChange}
          InputProps={{
            readOnly: true,
            style: { height: "27px" },
          }}
          sx={{
            gridColumn: "1 / span 2",
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
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
          <InputLabel id="subsi_id">Subsidiary</InputLabel>
          <Select
            labelId="subsi_id"
            value={state.subsi}
            label="Subsidiary"
            name="subsi"
            onChange={(e) => {
              handleInputChange(e);
              handleInputChange({
                target: {
                  value: "",
                  name: "subsi_options",
                },
              });
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
              width: "120px",
            }}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1}>I.D No.</MenuItem>
            <MenuItem value={2}>Sub Acct</MenuItem>
          </Select>
        </FormControl>
        {state.subsi === 0 && (
          <TextField
            InputProps={{
              readOnly: true,
              style: { height: "27px" },
            }}
            sx={{
              flex: 1,
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        )}
        {state.subsi === 1 && (
          <React.Fragment>
            {isLoadingClientIdsModal ? (
              <LoadingButton loading={isLoadingClientIdsModal} />
            ) : (
              <FormControl
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": {
                    fontSize: "14px",
                    background: "white",
                    zIndex: 99,
                    padding: "0 3px",
                  },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="clients_id">Clients</InputLabel>
                <OutlinedInput
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                  label="Clients"
                  name="subsi_options"
                  value={state.subsi_options}
                  onChange={handleInputChange}
                  id="clients_id"
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      return openCliendIDsModal(state.subsi_options);
                    }
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          openCliendIDsModal(state.subsi_options);
                        }}
                        edge="end"
                        color="secondary"
                      >
                        <PersonSearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            )}
          </React.Fragment>
        )}
        {state.subsi === 2 && (
          <React.Fragment>
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
                  value={state.subsi_options}
                  label="Sub Account"
                  name="subsi_options"
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
          </React.Fragment>
        )}

        <ShowDateSelection
          dispatch={dispatch}
          state={state}
          handleInputChange={handleInputChange}
          user={user}
        />
      </Box>
      <fieldset
        style={
          {
            gridArea: "content4",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            position: "relative",
            flex: 1,
          } as CSSProperties
        }
      >
        <legend style={{ color: "black", fontFamily: "serif" }}>Report</legend>
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            alignItems: "center",
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
              <MenuItem value={0}>With Running Balance</MenuItem>
              <MenuItem value={1}>No Running Balance</MenuItem>
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
              label="Sort"
              name="field"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={0}>Explanations</MenuItem>
              <MenuItem value={1}>Payee</MenuItem>
              <MenuItem value={2}>Remarks</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </fieldset>
      {modalChartAccount}
      {ModalClientIDs}
    </div>
  );
}
function columnRender(format: any) {
  return [
    subsidiaryLedgerColumnWithBalance,
    subsidiaryLedgerColumnWithBalance,
    subsidiaryLedgerColumnNoBalance,
  ][format];
}

export default function SubsidiaryLedger() {
  const { myAxios, user } = useContext(AuthContext);
  const [column, setColumn] = useState(columnRender(initialState.subsi));
  async function onReportSubmit(setData: any, setLoading: any, state: any) {
    const updateColumn = columnRender(state.subsi);
    flushSync(() => {
      setColumn(updateColumn);
    });

    const response = await myAxios.post(
      "/reports/accounting/subsidiary-ledger-report",
      state,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    );
    const jsonData = await response.data;
    arrangeData({
      data: JSON.parse(jsonData.report),
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
      adjustMaxHeight: 250,
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
      //               onDoubleClick={(e) =>
      //                 copiedByHeaderOnDoubleClick(e, itm.datakey, data)
      //               }
      //               style={{
      //                 width: itm.width,
      //                 fontSize: "12px",
      //                 fontWeight: "bold",
      //                 borderBottom: "1px solid black",
      //               }}
      //               key={rowIdx}
      //             >
      //               {itm.header}
      //             </th>
      //           );
      //         })}
      //       </tr>
      //     </thead>
      //   );

      //   return ReactDOMServer.renderToString(<DrawHeader state={state} />);
      // },
      // drawTable: (rowItem: any) => {
      //   const DrawData = () => {
      //     return (
      //       <tr>
      //         {column.map((colItem: any, colIdx: number) => {
      //           return (
      //             <td
      //               onClick={columnSelection}
      //               className={`editable not-looking `}
      //               key={colIdx}
      //               style={{
      //                 fontSize: "11px",
      //                 fontWeight: "500",
      //                 width: `${colItem.width} !important`,
      //                 textAlign:
      //                   colItem.datakey === "AssuredName" ||
      //                   colItem.datakey === "Mortgagee"
      //                     ? "center"
      //                     : colItem.total || colItem.datakey === "InsuredValue"
      //                     ? "right"
      //                     : "left",
      //               }}
      //             >
      //               {rowItem[colItem.datakey]}
      //             </td>
      //           );
      //         })}
      //       </tr>
      //     );
      //   };

      //   return ReactDOMServer.renderToString(<DrawData />);
      // },
    }).then((newData) => {
      setData(newData);
      setLoading(false);
    });
  }
  initialState.title = setupTitle(initialState, user?.department as string);

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
                          colSpan={3}
                        >
                          No. of Records: {data.flat().length - 1}
                        </td>
                        {column.map((itm: any, idx: number) => {
                          if (!itm.total) {
                            if (idx < 3) {
                              return (
                                <React.Fragment key={idx}></React.Fragment>
                              );
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
    />
  );
}

function formatNumberWithCommas(number: number) {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
