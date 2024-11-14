import { useContext, CSSProperties, useRef, useState } from "react";
import { BondContext } from "../BondsPolicy";
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
import CustomTimePicker from "../../../../../../../../components/TimePicker";
import { LoadingButton } from "@mui/lab";
import { useQuery } from "react-query";
import useQueryModalTable from "../../../../../../../../hooks/useQueryModalTable";

export default function BondsPolicyInformation() {
  const {
    state,
    handleInputChange,
    customInputchange,
    myAxios,
    user,
    isAddOrEditMode,
  } = useContext(BondContext);
  const [account, setAccount] = useState([]);
  const biddingDateRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLElement>(null);
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
  const { data: policyTypes, isLoading: isLoadingPolicyTypes } = useQuery({
    queryKey: "get-bond-acc-type",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-policy-account-types`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
  });
  const { isLoading: isLoadingPolicyAccount } = useQuery({
    queryKey: "get-bond-acc",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-policy-account-bonds`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(data) {
      setAccount(data.data?.getPolicyAccountByBonds);
    },
    refetchOnWindowFocus: false,
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
              marginBottom: "10px",
              height: "100%",
              width: "100%",
            }}
          >
            <legend style={{ color: "#065f46" }}>Bonds Policy</legend>
            <div>
              {isLoadingPolicyAccount ? (
                <LoadingButton loading={isLoadingPolicyAccount} />
              ) : (
                <FormControl
                  size="small"
                  fullWidth
                  disabled={isAddOrEditMode}
                  sx={{
                    flex: 1,
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
                    onChange={(e) => {
                      handleInputChange(e);
                    }}
                    sx={{
                      height: "27px",
                      fontSize: "14px",
                    }}
                  >
                    {account.map((items: any, idx: number) => {
                      return (
                        <MenuItem key={idx} value={items.Account}>
                          {items.Account}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                  height: "40px",
                  marginTop: "10px",
                }}
              >
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
                {isLoadingPolicyTypes ? (
                  <LoadingButton loading={isLoadingPolicyTypes} />
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
                    <InputLabel id="policyType">Policy Type</InputLabel>
                    <Select
                      labelId="policyType"
                      value={state.policyType}
                      label="policyType"
                      name="policyType"
                      onChange={(e) => {
                        setAccount((d) => {
                          if (e.target.value === "G02") {
                            d = d.filter((i: any) => i.G02 === 1);
                            return d;
                          } else if (e.target.value === "G13") {
                            d = d.filter((i: any) => i.G02 === 1);
                            return d;
                          } else if (e.target.value === "G16") {
                            d = d.filter((i: any) => i.G02 === 1);
                            return d;
                          } else {
                            return d;
                          }
                        });
                        handleInputChange(e);
                      }}
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                    >
                      {policyTypes &&
                        [
                          { SubLineName: "" },
                          ...policyTypes.data?.getPolicyAccountType,
                        ].map((items: any, idx: number) => {
                          return (
                            <MenuItem key={idx} value={items.SubLineName}>
                              {items.SubLineName}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              width: "100%",
            }}
          >
            <legend style={{ height: "22px" }}></legend>
            <TextField
              disabled={isAddOrEditMode}
              variant="outlined"
              size="small"
              label="Officer"
              name="officer"
              value={state.officer}
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
              label="Position"
              name="position"
              value={state.position}
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
            <legend style={{ color: "#065f46" }}>Period of Insurance</legend>
            <div style={{ display: "flex", columnGap: "10px" }}>
              <CustomDatePicker
                disabled={isAddOrEditMode}
                label="Bidding Date"
                onChange={(e: any) => {
                  customInputchange(e, "biddingDate");
                }}
                value={new Date(state.biddingDate)}
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
                      biddingDateRef.current?.querySelector("button")?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={biddingDateRef}
              />
              <CustomTimePicker
                disabled={isAddOrEditMode}
                label="Time"
                onChange={(e: any) => {
                  customInputchange(e, "time");
                }}
                value={new Date(state.time)}
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
                      timeRef.current?.querySelector("button")?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={timeRef}
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
            </div>
            <TextField
              disabled={isAddOrEditMode}
              fullWidth
              variant="outlined"
              size="small"
              label="Validity"
              name="validity"
              value={state.validity}
              onChange={handleInputChange}
              rows={2}
              multiline
            />
          </fieldset>
        </div>
      </div>
      <fieldset
        style={{
          display: "flex",
          gap: "15px",
          padding: "15px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          flexDirection: "row",
          flexGrow: 1,
        }}
      >
        <legend style={{ height: "20px" }}></legend>
        <TextField
          disabled={isAddOrEditMode}
          fullWidth
          variant="outlined"
          size="small"
          label="Unit"
          name="unit"
          value={state.unit}
          onChange={handleInputChange}
          multiline
          rows={3}
        />
        <TextField
          disabled={isAddOrEditMode}
          fullWidth
          variant="outlined"
          size="small"
          label="Obligee"
          name="obligee"
          value={state.obligee}
          onChange={handleInputChange}
          multiline
          rows={3}
        />
      </fieldset>
      {ModalClientIDs}
      {ModalAgentId}
    </div>
  );
}
