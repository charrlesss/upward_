import { useContext, CSSProperties, useRef } from "react";
import { MarineContext } from "../MarinePolicy";
import {
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CustomDatePicker from "../../../../../../../../components/DatePicker";
import { LoadingButton } from "@mui/lab";
import useQueryModalTable from "../../../../../../../../hooks/useQueryModalTable";
import { useQuery } from "react-query";
import { addYears } from "date-fns";

export default function MarinePolicyInformation() {
  const {
    state,
    handleInputChange,
    customInputchange,
    isAddOrEditMode,
    myAxios,
    user,
  } = useContext(MarineContext);

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
      await myAxios.get(
        `/task/production/policy-accounts-by-line?Line=Marine`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
  });

  const dateFrom = useRef<HTMLElement>(null);
  const dateToDateRef = useRef<HTMLElement>(null);
  const dateIssuedDateRef = useRef<HTMLElement>(null);

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
              height: "150px",
            } as any
          }
        >
          <fieldset
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              flexGrow: 1,
            }}
          >
            <legend style={{ color: "#065f46" }}>Marine Policy</legend>
            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              {isLoadingPolicyAccount ? (
                <LoadingButton loading={isLoadingPolicyAccount} />
              ) : (
                <FormControl
                  size="small"
                  disabled={isAddOrEditMode}
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
                    {policyAccount.data?.policyAccounts.map(
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
            </div>
            <TextField
              disabled={isAddOrEditMode}
              variant="outlined"
              size="small"
              label="Location"
              name="location"
              value={state.location}
              onChange={handleInputChange}
              multiline
              rows={2}
              InputProps={{
                style: { height: "auto", fontSize: "14px" },
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
          <fieldset
            style={{
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
              value={new Date(state.DateIssued)}
              disabled={isAddOrEditMode}
              datePickerRef={dateIssuedDateRef}
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
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend style={{ height: "22px" }}></legend>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(2,1fr)",
              }}
            >
              <TextField
                disabled={isAddOrEditMode}
                fullWidth
                variant="outlined"
                size="small"
                label="Consignee"
                name="consignee"
                value={state.consignee}
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
                fullWidth
                variant="outlined"
                size="small"
                label="Subject Matter Insured"
                name="smi"
                value={state.smi}
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
                fullWidth
                variant="outlined"
                size="small"
                label="Vessel"
                name="vessel"
                value={state.vessel}
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
                fullWidth
                variant="outlined"
                size="small"
                label="Additional Information"
                name="add_info"
                value={state.add_info}
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
                fullWidth
                variant="outlined"
                size="small"
                label="Point of Origin"
                name="point_orig"
                value={state.point_orig}
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
                fullWidth
                variant="outlined"
                size="small"
                label="Point off Destination"
                name="point_dis"
                value={state.point_dis}
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
            </div>
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
        ></div>
      </div>
      {ModalClientIDs}
      {ModalAgentId}
    </div>
  );
}
