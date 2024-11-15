import { useContext, useRef, CSSProperties } from "react";
import {
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CustomDatePicker from "../../../../../../../../components/DatePicker";
import { CGLContext } from "../CGLPolicy";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";
import { LoadingButton } from "@mui/lab";
import { useQuery } from "react-query";
import useQueryModalTable from "../../../../../../../../hooks/useQueryModalTable";
import { addYears } from "date-fns";

export default function CGLPolicyInformation() {
  const {
    state,
    handleInputChange,
    customInputchange,
    myAxios,
    user,
    isAddOrEditMode,
    computation,
    dispatch,
  } = useContext(CGLContext);
  const dateFrom = useRef<HTMLElement>(null);
  const dateToDateRef = useRef<HTMLElement>(null);
  const dateIssuedDateRef = useRef<HTMLElement>(null);
  const searchClientInputRef = useRef<HTMLInputElement>(null);
  const searchAgentInputRef = useRef<HTMLInputElement>(null);
  const {
    ModalComponent: ModalClientIDs,
    openModal: openCliendIDsModal,
    isLoading: isLoadingClientIdsModal,
    closeModal: closeCliendIDsModal,
  } = useQueryModalTable({
    link: {
      url: "/task/production/get-clients",
      queryUrlName: "clientSearch",
    },
    columns: [
      { field: "entry_client_id", headerName: "ID", width: 130 },
      { field: "fullname", headerName: "First Name", flex: 1 },
      {
        field: "entry_type",
        headerName: "ID Type",
        width: 150,
      },
    ],
    queryKey: "get-clients",
    uniqueId: "entry_client_id",
    responseDataKey: "clients",
    onSelected: (selectedRowData) => {
      customInputchange(selectedRowData[0].entry_client_id, "client_id");
      customInputchange(selectedRowData[0].fullname, "client_name");
      customInputchange(selectedRowData[0].address, "client_address");
      customInputchange(selectedRowData[0].sale_officer, "sale_officer");
      closeCliendIDsModal();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        customInputchange(__.row.entry_client_id, "client_id");
        customInputchange(__.row.fullname, "client_name");
        customInputchange(__.row.address, "client_address");
        customInputchange(__.row.sale_officer, "sale_officer");
        closeCliendIDsModal();
      }
    },
    searchRef: searchClientInputRef,
  });
  const {
    ModalComponent: ModalAgentId,
    openModal: openModalAgentId,
    isLoading: isLoadingModalAgentId,
    closeModal: closeModalAgentId,
  } = useQueryModalTable({
    link: {
      url: "/task/production/get-agents",
      queryUrlName: "agentSearch",
    },
    columns: [
      { field: "entry_agent_id", headerName: "ID", width: 130 },
      { field: "fullname", headerName: "First Name", flex: 1 },
      {
        field: "entry_type",
        headerName: "ID Type",
        width: 150,
      },
    ],
    queryKey: "get-agents",
    uniqueId: "entry_agent_id",
    responseDataKey: "agents",
    onSelected: (selectedRowData) => {
      customInputchange(selectedRowData[0].entry_agent_id, "agent_id");
      customInputchange(selectedRowData[0].fullname, "agent_name");
      closeModalAgentId();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        customInputchange(__.row.entry_agent_id, "agent_id");
        customInputchange(__.row.fullname, "agent_name");
        closeModalAgentId();
      }
    },
    searchRef: searchAgentInputRef,
  });
  const { data: policyAccount, isLoading: isLoadingPolicyAccount } = useQuery({
    queryKey: "bond-policy-account-ss",
    queryFn: async () =>
      await myAxios.get(`/task/production/policy-accounts-by-line?Line=CGL`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  function onKeyDownComputation(e: any) {
    if (e.code === "NumpadEnter" || e.code === "Enter") {
      computation();
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}
      >
        <div
          style={
            {
              display: "flex",
              columnGap: "10px",
              flex: 1,
              boxSizing: "border-box",
            } as any
          }
        >
          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={
                {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "15px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  boxSizing: "border-box",
                } as CSSProperties
              }
            >
              <legend style={{ color: "#065f46" }}>Insurer Information</legend>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexGrow: 1,
                  flexDirection: "column",
                }}
              >
                {isLoadingClientIdsModal ? (
                  <LoadingButton loading={isLoadingClientIdsModal} />
                ) : (
                  <FormControl
                    variant="outlined"
                    size="small"
                    disabled={isAddOrEditMode}
                    sx={{
                      width: "170px",
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  >
                    <InputLabel htmlFor="client-id-field">Client ID</InputLabel>
                    <OutlinedInput
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                      disabled={isAddOrEditMode}
                      fullWidth
                      label="Client ID"
                      name="client_id"
                      value={state.client_id}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          e.preventDefault();
                          return openCliendIDsModal(state.client_id);
                        }
                      }}
                      id="client-id-field"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            // ref={reloadIDButtonRef}
                            disabled={isAddOrEditMode}
                            aria-label="search-client"
                            color="secondary"
                            edge="end"
                            onClick={() => {
                              openCliendIDsModal(state.client_id);
                            }}
                          >
                            <PersonSearchIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  disabled={isAddOrEditMode}
                  variant="outlined"
                  size="small"
                  label="Client Name"
                  name="client_name"
                  value={state.client_name}
                  onChange={handleInputChange}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    readOnly: true,
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
              </div>
              <TextField
                rows={5}
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Client Address"
                multiline
                name="client_address"
                value={state.client_address}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "100px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  flex: 1,
                  height: "100px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </fieldset>
          </div>
          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={
                {
                  flexDirection: "row",
                  gap: "10px",
                  padding: "15px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  height: "100%",
                  flex: 1,
                  flexWrap: "wrap",
                } as CSSProperties
              }
            >
              <legend style={{ color: "#065f46" }}>Agent Information</legend>
              {isLoadingModalAgentId ? (
                <LoadingButton loading={isLoadingModalAgentId} />
              ) : (
                <FormControl
                  variant="outlined"
                  size="small"
                  disabled={isAddOrEditMode}
                  sx={{
                    width: "170px",
                    ".MuiFormLabel-root": {
                      fontSize: "14px",
                      background: "white",
                      zIndex: 99,
                      padding: "0 3px",
                    },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                >
                  <InputLabel htmlFor="AGENT-id-field">Agent ID</InputLabel>
                  <OutlinedInput
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                    disabled={isAddOrEditMode}
                    label="Agent ID"
                    name="agent_id"
                    value={state.agent_id}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        e.preventDefault();
                        return openModalAgentId(state.agent_id);
                      }
                    }}
                    id="AGENT-id-field"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          // ref={reloadIDButtonRef}
                          disabled={isAddOrEditMode}
                          aria-label="search-client"
                          color="secondary"
                          edge="end"
                          onClick={() => {
                            openModalAgentId(state.agent_id);
                          }}
                        >
                          <PersonSearchIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
              <TextField
                fullWidth
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Agent Name"
                name="agent_name"
                value={state.agent_name}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  marginTop: "10px",
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                fullWidth
                variant="outlined"
                size="small"
                label="Sale Officer"
                multiline
                name="sale_officer"
                value={state.sale_officer}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  marginTop: "10px",
                }}
              />
            </fieldset>
          </div>
        </div>
        <div
          style={
            {
              display: "flex",
              columnGap: "10px",
              flex: 1,
              boxSizing: "border-box",
            } as any
          }
        >
          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={{
                gap: "10px",
                display: "flex",
                flexDirection: "row",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                marginBottom: "10px",
              }}
            >
              <legend style={{ color: "#065f46" }}>CGL Policy</legend>
              {isLoadingPolicyAccount ? (
                <LoadingButton loading={isLoadingPolicyAccount} />
              ) : (
                <FormControl
                  size="small"
                  fullWidth
                  disabled={isAddOrEditMode}
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
                  <InputLabel id="PolicyAccount">Account</InputLabel>
                  <Select
                    labelId="PolicyAccount"
                    value={state.PolicyAccount}
                    label="Account"
                    name="PolicyAccount"
                    onChange={handleInputChange}
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                  >
                    {[
                      { Account: "" },
                      ...policyAccount?.data.policyAccounts,
                    ].map((items: any, idx: number) => {
                      return (
                        <MenuItem key={idx} value={items.Account}>
                          {items.Account}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Policy No"
                name="PolicyNo"
                value={state.PolicyNo}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </fieldset>
          </div>
          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                gridArea: "content4",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
              }}
            >
              <legend style={{ color: "#065f46" }}>Period of Insurance</legend>

              <CustomDatePicker
                disabled={isAddOrEditMode}
                label="Date From"
                onChange={(e: any) => {
                  customInputchange(e, "DateFrom");
                  const newDate = new Date(e);
                  const newDatePlusOneYear = addYears(newDate, 1);
                  customInputchange(newDatePlusOneYear, "DateTo");
                }}
                value={new Date(state.DateFrom)}
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
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      dateFrom.current?.querySelector("button")?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={dateFrom}
              />
              <CustomDatePicker
                disabled={isAddOrEditMode}
                label="Date To"
                onChange={(e: any) => {
                  customInputchange(e, "DateTo");
                }}
                value={new Date(state.DateTo)}
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
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      dateToDateRef.current?.querySelector("button")?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={dateToDateRef}
              />
              <CustomDatePicker
                label="Date Issued"
                name="DateIssued"
                onChange={(e: any) => {
                  customInputchange(e, "DateIssued");
                }}
                value={new Date(state.DateIssued)}
                disabled={isAddOrEditMode}
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
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      dateIssuedDateRef.current
                        ?.querySelector("button")
                        ?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={dateIssuedDateRef}
              />
            </fieldset>
          </div>
        </div>
        <div
          style={
            {
              display: "flex",
              columnGap: "10px",
              flex: 1,
              boxSizing: "border-box",
            } as any
          }
        >
          <div
            style={{
              flex: 1,
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                gridArea: "content4",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                height: "100%",
              }}
            >
              <legend style={{ color: "#065f46", height: "20px" }}></legend>
              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Sum Insured"
                name="sumInsured"
                value={state.sumInsured}
                onChange={handleInputChange}
                placeholder="0.00"
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "sumInsured",
                    value: parseFloat(state.sumInsured).toFixed(2),
                  });
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Premises Operations"
                name="premisisOperation"
                value={state.premisisOperation}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Address"
                name="address"
                value={state.address}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="BL Premium"
                name="blPremium"
                value={state.blPremium}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="PD Premium"
                name="pdPremium"
                value={state.pdPremium}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </fieldset>
          </div>

          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "50%",
            }}
          >
            <fieldset
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "10px",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
              }}
            >
              <legend>Premiums</legend>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "5px",
                }}
              >
                <Button
                  disabled={isAddOrEditMode}
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    computation();
                  }}
                >
                  Compute
                </Button>
              </div>

              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Net Premium"
                name="netPremium"
                value={state.netPremium}
                onChange={handleInputChange}
                onKeyDown={onKeyDownComputation}
                placeholder="0.00"
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "netPremium",
                    value: parseFloat(state.netPremium).toFixed(2),
                  });
                }}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Vat"
                name="vat"
                value={state.vat}
                onChange={handleInputChange}
                onKeyDown={onKeyDownComputation}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "vat",
                    value: parseFloat(state.vat).toFixed(2),
                  });
                }}
              />
              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Doc Stamp"
                name="docStamp"
                value={state.docStamp}
                onChange={handleInputChange}
                onKeyDown={onKeyDownComputation}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "docStamp",
                    value: parseFloat(state.docStamp).toFixed(2),
                  });
                }}
              />
              <div
                style={{ display: "flex", gap: "5px", position: "relative" }}
              >
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  name="localGovTaxPercent"
                  value={state.localGovTaxPercent}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputComponent: NumericFormatCustom as any,
                  }}
                  sx={{
                    width: "80px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "localGovTaxPercent",
                      value: parseFloat(state.localGovTaxPercent).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  label="Local Gov Tax"
                  name="localGovTax"
                  value={state.localGovTax}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                    inputComponent: NumericFormatCustom as any,
                  }}
                  sx={{
                    width: "100%",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "localGovTax",
                      value: parseFloat(state.localGovTax).toFixed(2),
                    });
                  }}
                />
              </div>
              <Divider color="secondary" />
              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Total Due"
                name="totalDue"
                value={state.totalDue}
                onChange={handleInputChange}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  width: "100%",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "totalDue",
                    value: parseFloat(state.totalDue).toFixed(2),
                  });
                }}
              />
            </fieldset>
          </div>
        </div>
      </div>
      {ModalClientIDs}
      {ModalAgentId}
    </div>
  );
}
