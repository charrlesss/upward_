import { useContext, CSSProperties, useRef } from "react";
import { MSPRContext } from "../MSPRPolicy";
import {
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CustomDatePicker from "../../../../../../../../components/DatePicker";
import { LoadingButton } from "@mui/lab";
import { useQuery } from "react-query";
import useQueryModalTable from "../../../../../../../../hooks/useQueryModalTable";
import { addYears } from "date-fns";

export default function MSPRPolicyInformation() {
  const {
    state,
    handleInputChange,
    customInputchange,
    myAxios,
    user,
    isAddOrEditMode,
    keySave,
  } = useContext(MSPRContext);

  const dateFrom = useRef<HTMLElement>(null);
  const dateToDateRef = useRef<HTMLElement>(null);
  const dateIssuedDateRef = useRef<HTMLElement>(null);
  const searchClientInputRef = useRef<HTMLInputElement>(null);
  const searchAgentInputRef = useRef<HTMLInputElement>(null);

  const { data: policyAccount, isLoading: isLoadingPolicyAccount } = useQuery({
    queryKey: "bond-policy-account-ss",
    queryFn: async () =>
      await myAxios.get(`/task/production/policy-accounts-by-line?Line=MSPR`, {
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

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
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
              } as CSSProperties
            }
          >
            <legend style={{ color: "#065f46" }}>Insurer Information</legend>
            <div
              style={{ display: "flex", gap: "10px", flexDirection: "column" }}
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
                onKeyDown={keySave}
                disabled={isAddOrEditMode}
                fullWidth
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
              onKeyDown={keySave}
              disabled={isAddOrEditMode}
              fullWidth
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
          style={
            {
              display: "flex",
              columnGap: "10px",
              flex: 1,
              boxSizing: "border-box",
            } as any
          }
        >
          <fieldset
            style={
              {
                height: "100%",
                flexDirection: "row",
                gap: "10px",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
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
              onKeyDown={keySave}
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
                marginTop: "10px",
                flex: 1,
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            <TextField
              onKeyDown={keySave}
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
                marginTop: "10px",
                width: "100%",
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          </fieldset>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
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
          <fieldset
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              marginBottom: "10px",
              height: "100%",
            }}
          >
            <legend style={{ color: "#065f46" }}>MSPR Policy</legend>
            {isLoadingPolicyAccount ? (
              <LoadingButton loading={isLoadingPolicyAccount} />
            ) : (
              <FormControl
                size="small"
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
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                  labelId="PolicyAccount"
                  value={state.PolicyAccount}
                  label="Account"
                  name="PolicyAccount"
                  onChange={handleInputChange}
                >
                  {[{ Account: "" }, ...policyAccount?.data.policyAccounts].map(
                    (items: any, idx: number) => {
                      return (
                        <MenuItem key={idx} value={items.Account}>
                          {items.Account}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            )}
            <TextField
              disabled={isAddOrEditMode || state.msprActioMode === "delete"}
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
          style={
            {
              display: "flex",
              columnGap: "10px",
              flex: 1,
              boxSizing: "border-box",
            } as any
          }
        >
          {" "}
          <fieldset
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
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
                    dateIssuedDateRef.current?.querySelector("button")?.click();
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
        style={{
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}
      >
        <fieldset
          style={{
            marginTop: "10px",
            display: "grid",
            gap: "10px",
            gridArea: "content5",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            gridTemplateColumns: "repeat(2,1fr)",
          }}
        >
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            fullWidth
            variant="outlined"
            size="small"
            label="Premises Address"
            name="pAddress"
            value={state.pAddress}
            onChange={handleInputChange}
            multiline
            rows={1}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            fullWidth
            variant="outlined"
            size="small"
            label="Money Routes From"
            name="moneyRoutesFrom"
            value={state.moneyRoutesFrom}
            onChange={handleInputChange}
            multiline
            rows={1}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            fullWidth
            variant="outlined"
            size="small"
            label="Safe and/or Strongroom Desc."
            name="safeDesc"
            value={state.safeDesc}
            onChange={handleInputChange}
            multiline
            rows={1}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            fullWidth
            variant="outlined"
            size="small"
            label="Money Routes To"
            name="moneyRoutesTo"
            value={state.moneyRoutesTo}
            onChange={handleInputChange}
            multiline
            rows={1}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            fullWidth
            variant="outlined"
            size="small"
            label="Method of Transportation"
            name="methodTrans"
            value={state.methodTrans}
            onChange={handleInputChange}
            multiline
            rows={1}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              width: "100%",
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              onKeyDown={keySave}
              disabled={isAddOrEditMode}
              fullWidth
              variant="outlined"
              size="small"
              label="Guards Minimum Number"
              name="guardsMinNum"
              value={state.guardsMinNum}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "auto", fontSize: "14px" },
              }}
              sx={{
                width: "100%",
                height: "auto",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            <TextField
              onKeyDown={keySave}
              disabled={isAddOrEditMode}
              fullWidth
              variant="outlined"
              size="small"
              label="Messenger Maximum Number"
              name="messengerMaxNum"
              value={state.messengerMaxNum}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "auto", fontSize: "14px" },
              }}
              sx={{
                width: "100%",
                height: "auto",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
          </div>
        </fieldset>
      </div>
      {ModalClientIDs}
      {ModalAgentId}
    </div>
  );
}
