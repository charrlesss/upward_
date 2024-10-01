import React, { useContext, useRef, useState } from "react";
import PrintPreview, {
  bgSetting,
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
  Box,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQuery } from "react-query";
import { LoadingButton } from "@mui/lab";
import { flushSync } from "react-dom";
import CustomDatePicker from "../../../../components/DatePicker";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { arrangeData } from "../../../../components/PrintPreview/dataCore";
import { format } from "date-fns";

const initialState = {
  format: 0,
  account: "",
  account_title: "",
  dateFormat: "Yearly",
  dateFrom: new Date(),
  dateTo: new Date(),
  yearCount: new Date().getFullYear().toString().slice(-2),
  subsi: 1,
  subsi_options: "All",
  sort: "Name",
  order: "asc",
  title: "",
};

const subAcctColumn = [
  {
    datakey: "GL_Acct",
    header: "ID No.",
    width: "220px",
  },
  {
    datakey: "mSub_Acct",
    header: "IDENTITY",
    width: "400px",
  },
  {
    datakey: "Balance",
    header: "AMOUNT",
    total: true,
    type: "number",
    width: "160px",
  },
];
const idColumn = [
  {
    datakey: "ID_No",
    header: "ID No.",
    width: "220px",
  },
  {
    datakey: "mID",
    header: "IDENTITY",
    width: "400px",
  },
  {
    datakey: "Balance",
    header: "AMOUNT",
    total: true,
    type: "number",
    width: "160px",
  },
];
const insuranceColumn = [
  {
    datakey: "ID_No",
    header: "ID. No.",
    width: "220px",
  },
  {
    datakey: "mID",
    header: "Insurance",
    width: "400px",
  },
  {
    datakey: "Balance",
    header: "Balance",
    total: true,
    type: "number",
    width: "160px",
  },
];
function columnRender(subsi: number) {
  const columns = [subAcctColumn, idColumn, insuranceColumn];
  return columns[subsi];
}
function ShowDateSelection({ state, dispatch, handleInputChange, user }: any) {
  const dateFromRef = useRef<HTMLElement>(null);
  const dateToRef = useRef<HTMLElement>(null);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
      }}
    >
      {state.dateFormat === "Custom" && (
        <React.Fragment>
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
        </React.Fragment>
      )}

      {state.dateFormat === "Daily" && (
        <CustomDatePicker
          fullWidth={true}
          label="Date"
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
        />
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {state.dateFormat === "Monthly" && (
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
        )}
        {state.dateFormat === "Yearly" && (
          <React.Fragment>
            <DatePicker
              sx={{
                width: "100%",
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              slotProps={{
                textField: {
                  size: "small",
                  name: "",
                  inputRef: dateFromRef,
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
              views={["year"]}
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
            <TextField
              type="number"
              label="Year Count"
              name="yearCount"
              value={state.yearCount}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "12px" },
              }}
              sx={{
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          </React.Fragment>
        )}
      </LocalizationProvider>
    </div>
  );
}
function Setting({ state, dispatch }: { state: any; dispatch: any }) {
  const chartAccountSearchInput = useRef<HTMLInputElement>(null);
  const clientSearchInput = useRef<HTMLInputElement>(null);
  const { myAxios, user } = useContext(AuthContext);
  const { data: dataAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: "chart-account",
    queryFn: async () =>
      await myAxios.get("/reports/accounting/schedule-accounts", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
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
    if (name === "policy" && value !== "TPL") {
      dispatch({ type: "UPDATE_FIELD", field: "mortgagee", value: "" });
    }
    if (name === "mortgagee" && value !== "") {
      dispatch({ type: "UPDATE_FIELD", field: "account", value: "" });
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
        background: "transparent",
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
          gap: "10px",
          margin: "10px 0",
          flexDirection: "column",
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
            ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl": {
              background: bgSetting,
            },
          }}
        >
          <InputLabel id="report">Report</InputLabel>
          <Select
            labelId="report"
            value={state.format}
            label="Report"
            name="format"
            onChange={(e) => {
              handleInputChange(e);
              dispatch({
                type: "UPDATE_FIELD",
                field: "account",
                value: "",
              });
              dispatch({
                type: "UPDATE_FIELD",
                field: "account_title",
                value: "",
              });
            }}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>All Accounts</MenuItem>
            <MenuItem value={1}>GL Account (Detailed)</MenuItem>
          </Select>
        </FormControl>
        {isLoadingChartAccountModal ? (
          <LoadingButton loading={isLoadingChartAccountModal} />
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
              ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                {
                  background: bgSetting,
                },
            }}
            variant="outlined"
            size="small"
            disabled={state.format === 0}
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
                    disabled={state.format === 0}
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
            ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl": {
              background: bgSetting,
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
            ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl": {
              background: bgSetting,
            },
          }}
        >
          <InputLabel id="subsi_id">Subsidiary</InputLabel>
          <Select
            labelId="subsi_id"
            value={state.subsi}
            label="Subsidiary"
            name="subsi"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={0}>Sub Acct</MenuItem>
            <MenuItem value={1}>I.D No.</MenuItem>
            <MenuItem value={2}>Insurance</MenuItem>
          </Select>
        </FormControl>
        {state.subsi === 0 && (
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
                  ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                    {
                      background: bgSetting,
                    },
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
                  ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                    {
                      background: bgSetting,
                    },
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
            {isLoadingAccounts ? (
              <LoadingButton loading={isLoadingAccounts} />
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
                  ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                    {
                      background: bgSetting,
                    },
                }}
              >
                <InputLabel id="insurance_id">Insurance</InputLabel>
                <Select
                  labelId="insurance_id"
                  value={state.subsi_options}
                  label="Insurance"
                  name="subsi_options"
                  onChange={handleInputChange}
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                >
                  <MenuItem value={"All"}>All</MenuItem>
                  {dataAccounts?.data.accounts.map((itm: any, idx: number) => {
                    return (
                      <MenuItem key={idx} value={itm.AccountCode}>
                        {itm.AccountCode}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </React.Fragment>
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
            ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl": {
              background: bgSetting,
            },
          }}
        >
          <InputLabel id="dateFormat_id">Date Format</InputLabel>
          <Select
            id="dateFormat_id"
            label="Date Format"
            value={state.dateFormat}
            name="dateFormat"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            <MenuItem value={"Daily"}>Daily</MenuItem>
            <MenuItem value={"Monthly"}>Monthly</MenuItem>
            <MenuItem value={"Yearly"}>Yearly</MenuItem>
            <MenuItem value={"Custom"}>Custom</MenuItem>
          </Select>
        </FormControl>
        <ShowDateSelection
          dispatch={dispatch}
          state={state}
          handleInputChange={handleInputChange}
        />
      </Box>
      <Box
        sx={{
          height: "100%",
          flex: 1,
          alignItems: "center",
          padding: "20px 10px",
          border: "1px solid #94a3b8",
        }}
      >
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            flexDirection: "row",
            columnGap: "10px",
            alignItems: "center",
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
              rowGap: "10px",
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
              ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                {
                  background: bgSetting,
                },
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
              <MenuItem value={"Name"}>Name</MenuItem>
              <MenuItem value={"Sub Account/I.D No."}>
                Sub Account/I.D No.
              </MenuItem>
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
              ".MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl":
                {
                  background: bgSetting,
                },
            }}
          >
            <InputLabel id="order">Order</InputLabel>
            <Select
              labelId="order"
              value={state.order}
              label="Sort"
              name="order"
              onChange={handleInputChange}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
            >
              <MenuItem value={"asc"}>Ascending</MenuItem>
              <MenuItem value={"desc"}>Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {modalChartAccount}
      {ModalClientIDs}
    </div>
  );
}
export default function ScheduleAccount() {
  const { myAxios, user } = useContext(AuthContext);
  const [column, setColumn] = useState(columnRender(initialState.subsi));
  initialState.title = setupTitle(initialState, user?.department as string);
  async function fetchTable(setData: any, setLoading: any, state: any) {
    const updateColumn = columnRender(state.subsi);
    flushSync(() => {
      setColumn(updateColumn);
    });
    const response = await myAxios.post(
      "/reports/accounting/schedule-account-report",
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
              Math.abs(parseFloat(itm[datakey].toString().replace(/,/g, "")))
            );
          }
        });
        return itm;
      },
      adjustMaxHeight: 520,
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
                    <tr style={{ height: "20px" }}></tr>
                    {pages.map((rowItem: any, rowIdx: number) => {
                      if (rowItem.ArrayHeader) {
                        return (
                          <tr key={rowIdx}>
                            <td
                              className={`editable not-looking page-${pageNumber}  row-${rowIdx}_col-0`}
                              colSpan={column.length}
                              style={{
                                fontWeight: "bold",
                                fontSize: "11px",
                              }}
                            >
                              {rowItem.mShort}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <React.Fragment key={rowIdx}>
                          <tr key={rowIdx}>
                            {column.map((colItem: any, colIdx: number) => {
                              if (rowItem.ArrayFooter) {
                                if (colIdx === 0) {
                                  return null;
                                }

                                if (colIdx === 1) {
                                  return (
                                    <td
                                      className={`editable not-looking  page-${pageNumber} row-${rowIdx}_col-${colIdx}`}
                                      key={colIdx}
                                      colSpan={2}
                                      style={{
                                        borderTop: "1px dashed #cbd5e1",
                                        width: colItem.width,
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      TOTAL:{" "}
                                    </td>
                                  );
                                }

                                return (
                                  <td
                                    key={colIdx}
                                    className={`editable not-looking  page-${pageNumber} row-${rowIdx}_col-${colIdx}`}
                                    style={{
                                      textAlign: "right",
                                      borderTop: "1px dashed #cbd5e1",
                                      width: colItem.width,
                                      fontSize: "11px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {rowItem[colItem.datakey]}
                                  </td>
                                );
                              }

                              return (
                                <td
                                  onClick={columnSelection}
                                  className={`editable not-looking  page-${pageNumber} row-${rowIdx}_col-${colIdx}`}
                                  key={colIdx}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    paddingLeft:
                                      colItem.datakey === "GL_Acct" ||
                                      colItem.datakey === "ID_No"
                                        ? "50px"
                                        : "10px",
                                    width: `${colItem.width} !important`,
                                    textAlign:
                                      colItem.datakey === "Balance"
                                        ? "right"
                                        : "left",
                                  }}
                                >
                                  {rowItem[colItem.datakey]}
                                </td>
                              );
                            })}
                          </tr>
                          <tr style={{ height: "7px" }}></tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {pageNumber === data.length - 1 && (
                      <React.Fragment>
                        <tr style={{ height: "10px" }}></tr>
                        <tr>
                          <td
                            style={{
                              fontWeight: "bold",
                              fontSize: "11px",
                            }}
                          >
                            No. of Records:{" "}
                            {(data.flat().length - 1).toLocaleString("en-US")}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                              fontSize: "11px",
                            }}
                          >
                            TOTAL:{" "}
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

                            const filter = flattenedArray.filter((d: any) => {
                              // if (
                              //   !isNaN(parseFloat(d.Balance)) &&
                              //   d.ArrayFooter
                              // ) {
                              //   return d.Balance;
                              // }
                              return (
                                !isNaN(parseFloat(d.Balance)) && d.ArrayFooter
                              );
                            });

                            const total = filter.reduce((d: any, val: any) => {
                              return (
                                d +
                                parseFloat(
                                  val.Balance.toString().replace(/,/g, "")
                                )
                              );
                            }, 0);

                            return (
                              <td
                                key={idx}
                                style={{
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
                      </React.Fragment>
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
      pageWidth={"8.5in"}
    />
  );
}
function setupTitle(state: any, department: string) {
  return `${
    department === "UMIS"
      ? "UPWARD MANAGEMENT INSURANCE SERVICES"
      : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC."
  }\nSchedule of ${
    state.format === 0
      ? "Accounts "
      : `${state.account_title} (${state.account}) `
  }\nCut off Date: ${DateToStringFormat(state)}
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
