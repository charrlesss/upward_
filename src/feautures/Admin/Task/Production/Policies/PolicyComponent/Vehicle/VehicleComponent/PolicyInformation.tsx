import React, {
  CSSProperties,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { VehicleContext } from "../VehiclePolicy";
import {
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  OutlinedInput,
  Button,
  CircularProgress,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CustomDatePicker from "../../../../../../../../components/DatePicker";
import PolicyIcon from "@mui/icons-material/Policy";
import { LoadingButton } from "@mui/lab";
import useQueryModalTable from "../../../../../../../../hooks/useQueryModalTable";
import { useMutation, useQuery } from "react-query";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CloseIcon from "@mui/icons-material/Close";
import { addYears } from "date-fns";
const initialClientDetailsState = {
  ShortName: "",
  IDNo: "",
  firstname: "",
  middlename: "",
  company: "",
  address: "",
  options: "",
  sub_account: "",
  createdAt: "",
  updatedAt: "",
  contact_details_id: "",
  description: "",
  remarks: "",
  VAT_Type: "",
  tin_no: "",
  Sub_Acct: "",
  Description: "",
  Acronym: "",
  update: "",
  email: "",
  mobile: "",
  telephone: "",
};
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      const newState = {
        ...state,
        [action.field]: action.value,
      };
      return newState;
    default:
      return state;
  }
};

export default function PolicyInformation() {
  const {
    state,
    handleInputChange,
    handleDateChange,
    myAxios,
    user,
    isAddOrEditMode,
    isLoadingTempId,
    mutateRates,
  } = useContext(VehicleContext);
  const [clientDetailsState, dispatch] = useReducer(
    reducer,
    initialClientDetailsState
  );

  const [showClientDetails, setShowCLientDetails] = useState(false);
  const periodInsuranceDateRef = useRef<HTMLElement>(null);
  const dateToDateRef = useRef<HTMLElement>(null);
  const dateIssuedDateRef = useRef<HTMLElement>(null);

  const searchClientInputRef = useRef<HTMLInputElement>(null);
  const searchAgentInputRef = useRef<HTMLInputElement>(null);
  const searchTPLInputRef = useRef<HTMLInputElement>(null);

  const handleChangeRef = useRef<any>(handleInputChange);

  const { data: dataPolicyAccount, isLoading: isLoadingPolicyAccount } =
    useQuery({
      queryKey: "get-policy-account",
      queryFn: async () =>
        await myAxios.get(`/task/production/get-policy-account`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
    });
  const { isLoading: isLoadingClientDetails, mutate: mutateDetails } =
    useMutation({
      mutationKey: "get-client-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/task/production/get-client-details`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        const response = res.data as any;
        setNewStateValue(dispatch, response?.clients[0]);
        setShowCLientDetails(true);
      },
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
      { field: "fullname", headerName: "Full Name", flex: 1 },
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
      handleDateChange(selectedRowData[0].entry_client_id, "client_id");
      handleDateChange(selectedRowData[0].fullname, "client_name");
      handleDateChange(selectedRowData[0].address, "client_address");
      handleDateChange(selectedRowData[0].sale_officer, "sale_officer");
      closeCliendIDsModal();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        handleDateChange(__.row.entry_client_id, "client_id");
        handleDateChange(__.row.fullname, "client_name");
        handleDateChange(__.row.address, "client_address");
        handleDateChange(__.row.sale_officer, "sale_officer");
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
      handleDateChange(selectedRowData[0].entry_agent_id, "agent_id");
      handleDateChange(selectedRowData[0].fullname, "agent_name");
      closeModalAgentId();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        handleDateChange(__.row.entry_agent_id, "agent_id");
        handleDateChange(__.row.fullname, "agent_name");
        closeModalAgentId();
      }
    },
    searchRef: searchAgentInputRef,
  });

  const {
    ModalComponent: ModalTPLId,
    openModal: openModalTPLId,
    isLoading: isLoadingModalTPLId,
    closeModal: closeModalTPLId,
  } = useQueryModalTable({
    link: {
      url: "/task/production/tpl-ids-vehicle-policy",
      queryUrlName: "tplIDSearch",
    },
    columns: [
      { field: "Source_No", headerName: "ID", width: 130 },
      { field: "Cost", headerName: "Cost", flex: 1 },
    ],
    queryKey: "get-tpl-ids",
    uniqueId: "Source_No",
    responseDataKey: "tpl_ids",
    onSelected: (selectedRowData) => {
      handleDateChange(selectedRowData[0].Source_No, "PolicyNo");
      handleDateChange(selectedRowData[0].Cost, "rateCost");
      handleDateChange(selectedRowData[0].Source_No_Ref_ID, "Source_No_Ref_ID");
      closeModalTPLId();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        handleDateChange(__.row.Source_No, "PolicyNo");
        handleDateChange(__.row.Cost, "rateCost");
        handleDateChange(__.row.Source_No_Ref_ID, "Source_No_Ref_ID");
        closeModalTPLId();
      }
    },
    searchRef: searchTPLInputRef,
  });

  useEffect(() => {
    if (state.form_action === "TEMP" && user?.department === "UCSMI") {
      mutateRates({
        Account: "TEMPORARY",
        Type: state.form_type.toUpperCase(),
      } as any);
      handleChangeRef.current({
        target: {
          name: "PolicyAccount",
          value: "TEMPORARY",
        },
      });
      handleChangeRef.current({
        target: {
          name: "Denomination",
          value: "COM-ALL TYPE",
        },
      });
    }
  }, [state.form_action, state.form_type, mutateRates, user]);

  const DisplayDetails = ({ datakey, label, value }: any) => {
    return (
      <div style={{ width: "100%", display: "flex" }}>
        <label style={{ width: "200px" }} htmlFor={datakey}>
          {label}
        </label>
        :
        <input
          style={{ flex: 1, border: "none", padding: "0 20px" }}
          defaultValue={value ?? ""}
          id={datakey}
          readOnly={true}
        />
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "column",
        }}
      >
        <div
          style={
            {
              flex: 1,
              display: "flex",
              gap: "10px",
            } as CSSProperties
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
              <div style={{ display: "flex", columnGap: "10px" }}>
                {isLoadingClientIdsModal ? (
                  <LoadingButton loading={isLoadingClientIdsModal} />
                ) : (
                  <FormControl
                    variant="outlined"
                    size="small"
                    disabled={isAddOrEditMode}
                    sx={{
                      width: "200px",
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
                          openCliendIDsModal(state.client_id);
                          return;
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
                {isLoadingClientDetails ? (
                  <div>
                    <CircularProgress size="20px" />
                  </div>
                ) : (
                  <Button
                    // disabled={state.client_id === ""}
                    variant="outlined"
                    startIcon={<PersonOutlineIcon />}
                    sx={{
                      height: "27px",
                      fontSize: "11px",
                    }}
                    onClick={() => {
                      mutateDetails({
                        userId: state.client_id,
                      });
                    }}
                  >
                    Client
                  </Button>
                )}
              </div>

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
                style: { height: "100px", fontSize: "14px", padding: "10px" },
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
          <fieldset
            style={
              {
                gap: "10px",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                flexWrap: "wrap",
                flex: 1,
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
        <div
          style={
            {
              display: "flex",
              gap: "10px",
              flex: 1,
            } as CSSProperties
          }
        >
          <fieldset
            style={
              {
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "10px",
                gridArea: "content3",
                padding: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                flex: 1,
              } as CSSProperties
            }
          >
            <legend style={{ color: "#065f46" }}>Vehicle Policy</legend>
            {isLoadingPolicyAccount ? (
              <LoadingButton loading={isLoadingPolicyAccount} />
            ) : (
              <FormControl
                size="small"
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
                  disabled={
                    state.form_action === "TEMP" && user?.department === "UCSMI"
                  }
                  labelId="PolicyAccount"
                  value={state.PolicyAccount}
                  label="Account"
                  name="PolicyAccount"
                  onChange={(e) => {
                    mutateRates({
                      Account: e.target.value.trim(),
                      Type: state.form_type.toUpperCase(),
                    } as any);
                    handleInputChange({
                      target: { name: "Denomination", value: "" },
                    });
                    handleInputChange(e);
                  }}
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                >
                  {dataPolicyAccount.data.policy_account[
                    `${state.form_type.toUpperCase()}`
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
            {state.form_type.toLowerCase() === "tpl" ? (
              <React.Fragment>
                {isLoadingModalTPLId ? (
                  <LoadingButton loading={isLoadingModalTPLId} />
                ) : (
                  <FormControl
                    variant="outlined"
                    size="small"
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
                    <InputLabel id="PolicyNo">Policy No</InputLabel>
                    <OutlinedInput
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                      id="PolicyNo"
                      label="Policy No"
                      name="PolicyNo"
                      value={state.PolicyNo}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                          e.preventDefault();
                          return openModalTPLId(state.PolicyNo);
                        }
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="search-client"
                            color="secondary"
                            edge="end"
                            onClick={() => {
                              openModalTPLId(state.PolicyNo);
                            }}
                          >
                            <PolicyIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                )}
              </React.Fragment>
            ) : state.form_action === "REG" ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Policy No."
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
            ) : (
              <React.Fragment>
                {isLoadingTempId ? (
                  <LoadingButton loading={isLoadingTempId} />
                ) : (
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Policy No."
                    name="PolicyNo"
                    value={state.PolicyNo}
                    onChange={handleInputChange}
                    InputProps={{
                      readOnly: true,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    sx={{
                      width: "100%",
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                  />
                )}
              </React.Fragment>
            )}
            <TextField
              disabled={isAddOrEditMode}
              fullWidth
              variant="outlined"
              size="small"
              label="Certificate of Cover No."
              name="CCN"
              value={state.CCN}
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
              label="Official Receipt No."
              name="ORN"
              value={state.ORN}
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
            <legend style={{ color: "#065f46" }}>Period of Insurance</legend>
            <div
              style={{
                position: "absolute",
                display: "flex",
                gap: "10px",
                width: "90%",
              }}
            >
              <CustomDatePicker
                fullWidth={false}
                disabled={isAddOrEditMode}
                label="Date From"
                onChange={(e: any) => {
                  handleDateChange(e, "DateFrom");
                  const newDate = new Date(e);
                  const newDatePlusOneYear = addYears(newDate, 1);
                  handleDateChange(newDatePlusOneYear, "DateTo");
                }}
                value={new Date(state.DateFrom)}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      periodInsuranceDateRef.current
                        ?.querySelector("button")
                        ?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={periodInsuranceDateRef}
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
                fullWidth={false}
                disabled={isAddOrEditMode}
                label="Date To"
                onChange={(e: any) => {
                  handleDateChange(e, "DateTo");
                }}
                value={new Date(state.DateTo)}
                onKeyDown={(e: any) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    const timeout = setTimeout(() => {
                      dateToDateRef.current?.querySelector("button")?.click();
                      clearTimeout(timeout);
                    }, 150);
                  }
                }}
                datePickerRef={dateToDateRef}
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
                fullWidth={false}
                label="Date Issued"
                name="DateIssued"
                onChange={(e: any) => {
                  handleDateChange(e, "DateIssued");
                }}
                value={new Date(state.DateIssued)}
                disabled={isAddOrEditMode}
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
            </div>
          </fieldset>
        </div>
        <div style={{ width: "50%" }}>
          <fieldset
            style={{
              display: "flex",
              gap: "20px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend style={{ color: "#065f46" }}>Insured Unit</legend>
            <div
              style={
                {
                  flex: 1,
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                } as CSSProperties
              }
            >
              <TextField
                disabled={isAddOrEditMode}
                fullWidth
                variant="outlined"
                size="small"
                label="Model"
                name="Model"
                value={state.Model}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Make"
                name="Make"
                value={state.Make}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Type of Body"
                name="TB"
                value={state.TB}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Color"
                name="Color"
                value={state.Color}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="BLT File No"
                name="BLTFileNo"
                value={state.BLTFileNo}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </div>
            <div
              style={
                {
                  flex: 1,
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                } as CSSProperties
              }
            >
              <TextField
                disabled={isAddOrEditMode}
                fullWidth
                variant="outlined"
                size="small"
                label="Plate No"
                name="PlateNo"
                value={state.PlateNo}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Chassis No"
                name="ChassisNo"
                value={state.ChassisNo}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Motor No."
                name="MotorNo"
                value={state.MotorNo}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Authorized Capacity"
                name="AuthorizedCapacity"
                value={state.AuthorizedCapacity}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
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
                label="Unladen Weight"
                name="UnladenWeigth"
                value={state.UnladenWeigth}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              />
            </div>
          </fieldset>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(158, 155, 157, 0.31)",
          zIndex: "999",
          display: showClientDetails ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "-1px 15px 74px 38px rgba(0,0,0,0.37)",
        }}
      >
        <div
          style={{
            background: "white",
            width: "70%",
            height: "700px",
            position: "relative",
            padding: "50px 20px",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
            onClick={() => setShowCLientDetails(false)}
          >
            <CloseIcon />
          </IconButton>
          <div style={{ width: "100%", height: "100%" }}>
            <hr style={{ margin: "5px 0" }} />
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              Client Details
            </p>
            <hr style={{ margin: "5px 0" }} />
            <DisplayDetails
              datakey={"IDNo"}
              label={"ID NO."}
              value={clientDetailsState.IDNo}
            />
            <DisplayDetails
              datakey={"ShortName"}
              label={"Short Name"}
              value={clientDetailsState.ShortName}
            />
            <DisplayDetails
              datakey={"subShortName"}
              label={"Sub Account"}
              value={clientDetailsState.subShortName}
            />
            <DisplayDetails
              datakey={"mobile"}
              label={"Mobile"}
              value={clientDetailsState.mobile}
            />
            <DisplayDetails
              datakey={"email"}
              label={"Email"}
              value={clientDetailsState.email}
            />
            <DisplayDetails
              datakey={"address"}
              label={"Address"}
              value={clientDetailsState.address}
            />
            <DisplayDetails
              datakey={"options"}
              label={"Option"}
              value={clientDetailsState.options}
            />
          </div>
        </div>
      </div>
      {ModalClientIDs}
      {ModalAgentId}
      {ModalTPLId}
    </div>
  );
}
function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
