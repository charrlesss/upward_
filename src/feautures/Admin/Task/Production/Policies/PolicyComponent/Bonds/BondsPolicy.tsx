import {
  createContext,
  useContext,
  useReducer,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Box, Button, TextField } from "@mui/material";
import { pink } from "@mui/material/colors";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../../../../../../../components/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import useQueryModalTable from "../../../../../../../hooks/useQueryModalTable";
import { LoadingButton } from "@mui/lab";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { CustomButton } from "../Vehicle/VehiclePolicy";
import useMultipleComponent from "../../../../../../../hooks/useMultipleComponent";
import BondsPolicyInformation from "./BondsPolicyComponents/BondsPolicyInformation";
import BondsPolicyPremium from "./BondsPolicyComponents/BondsPolicyPremium";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";

const initialState = {
  form_action: "REG",
  form_type: "COM",
  sub_account: "HO",
  //insurer info
  client_id: "",
  client_name: "",
  client_address: "",
  //agent info
  agent_id: "",
  agent_name: "",
  agent_com: "0.00",
  sale_officer: "",
  //Vehicle policy
  PolicyAccount: "",
  PolicyNo: "",
  policyType: "",
  //Period Insurance
  biddingDate: new Date(),
  time: new Date(),
  DateIssued: new Date(),
  validity: "",

  //
  officer: "",
  position: "",
  unit: "",
  obligee: "",
  //
  printType: "Front Page",
  //
  officerName: "",
  officerTaxCertNo: "",
  officerIssuedLoc: "",
  officerDateIssued: new Date(),
  //information
  insuranceCapacity: "",
  insuranceOfficerTaxCert: "",
  insuranceIssuedLoc: "",
  insuranceDateIssued: new Date(),

  //calculation
  insuredValue: "",
  percentagePremium: "",
  totalPremium: "",
  vat: "",
  docStamp: "",
  localGovTaxPercent: "0.75",
  localGovTax: "",
  umis: "",
  principal: "",
  totalDue: "",
  // extra
  bondActioMode: "",
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
export const BondContext = createContext<any>({});

const queryKeySearchPolicy = "bond-search";
const queryKeySearchClientEntry = "clients";
const queryKeySearchAgentEntry = "agents";
const queryKeyNeedData = "bond-policy";
const queryKeyAddOrUpdatePolicy = "bond-policy";
const queryKeyDeletePolicy = "bond-policy";

export default function BondsPolicy() {
  const { step, goTo, currentStepIndex } = useMultipleComponent([
    <BondsPolicyInformation />,
    <BondsPolicyPremium />,
  ]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [clientRows, setClientRows] = useState<GridRowSelectionModel>([]);
  const [agentRows, setAgentRows] = useState<GridRowSelectionModel>([]);
  const [search, setSearch] = useState("");
  const [Mortgagee, setMortgagee] = useState(false);
  const [showField, setShowField] = useState({
    thirdparty: state.form_type.toLowerCase() === "tpl",
    compre: state.form_type.toLowerCase() === "com",
  });
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const isAddOrEditMode = state.bondActioMode === "";
  const searchMarPolicyInputRef = useRef<HTMLInputElement>(null);
  const { data: dataSubAccount, isLoading: isLoadingSubAccount } = useQuery({
    queryKey: "get-sub_account",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-sub_account`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  const {
    ModalComponent: ModalSearchBPolicy,
    openModal: openModalSearchBPolicy,
    isLoading: isLoadingModalSearchBPolicy,
    closeModal: closeModalSearchBPolicy,
  } = useQueryModalTable({
    link: {
      url: "/task/production/search-bonds-policy",
      queryUrlName: "searchBondsPolicy",
    },
    columns: [
      { field: "DateIssued", headerName: "Date", width: 200 },
      { field: "PolicyNo", headerName: "Policy No", width: 250 },
      {
        field: "Account",
        headerName: "Account",
        width: 170,
      },
      {
        field: "client_fullname",
        headerName: "Full Name",
        flex: 1,
      },
    ],
    queryKey: "search-bonds-policy",
    uniqueId: "PolicyNo",
    responseDataKey: "bondsPolicy",
    onSelected: (selectedRowData) => {
      onSearchSelected(selectedRowData);
      closeModalSearchBPolicy();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        onSearchSelected([__.row]);
        closeModalSearchBPolicy();
      }
    },
    onSuccess(data) {
      console.log(data);
    },
    searchRef: searchMarPolicyInputRef,
  });
  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: queryKeyAddOrUpdatePolicy,
    mutationFn: async (variables: any) => {
      if (state.bondActioMode === "delete") {
        return await myAxios.post(
          "/task/production/update-bonds-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post(
        "/task/production/add-bonds-policy",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: async (res) => {
      if (res.data.success) {
        await updateQueryByKey();
        backToDefaultState(initialState, true);
        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
      Swal.fire({
        position: "center",
        icon: "error",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: queryKeyDeletePolicy,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/production/delete-bonds-policy",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: async (res) => {
      if (res.data.success) {
        await updateQueryByKey();
        backToDefaultState(initialState, true);
        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }

      Swal.fire({
        position: "center",
        icon: "error",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });
  const setDefaultValueForNumber = useCallback(() => {
    state.insuredValue = state.insuredValue === "" ? "0" : state.insuredValue;
    state.percentagePremium =
      state.percentagePremium === "" ? "0" : state.percentagePremium;
    state.totalPremium = state.totalPremium === "" ? "0" : state.totalPremium;
    state.vat = state.vat === "" ? "0" : state.vat;
    state.docStamp = state.docStamp === "" ? "0" : state.docStamp;
    state.localGovTaxPercent =
      state.localGovTaxPercent === "" ? "0" : state.localGovTaxPercent;
    state.localGovTax = state.localGovTax === "" ? "0" : state.localGovTax;
    state.umis = state.umis === "" ? "0" : state.umis;
    state.principal = state.principal === "" ? "0" : state.principal;
    state.totalDue = state.totalDue === "" ? "0" : state.totalDue;
  }, [state]);
  const handleOnSave = useCallback(() => {
    if (
      state.client_name === "" ||
      state.client_name === null ||
      state.client_name === undefined
    ) {
      return Swal.fire(
        "Unable to save! Invalid Client ID",
        "you missed the Client Id Field?",
        "error"
      );
    }
    if (state.client_id === "" || state.client_id === null) {
      return Swal.fire(
        "Unable to save! Invalid IDNo.",
        "you missed the Client Id Field?",
        "error"
      );
    }
    if (state.PolicyAccount === "" || state.PolicyAccount === null) {
      return Swal.fire(
        "Unable to save! Please select Account.",
        "you missed the Account Field?",
        "error"
      );
    }
    if (state.PolicyNo === "" || state.PolicyNo === null) {
      return Swal.fire(
        "Unable to save! Invalid Policy No.",
        "you missed the Policy No Field?",
        "error"
      );
    }
    if (state.bondActioMode === "delete") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          setDefaultValueForNumber();
          mutate({ ...state, userCodeConfirmation });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          setDefaultValueForNumber();
          mutate(state);
        },
      });
    }
  }, [state, setDefaultValueForNumber, mutate]);
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (
        event.code === "AudioVolumeMute" ||
        event.code === "F1" ||
        event.keyCode === 173
      ) {
        event.preventDefault();
        goTo(0);
      }
      if (
        event.code === "AudioVolumeDown" ||
        event.code === "F2" ||
        event.keyCode === 174
      ) {
        event.preventDefault();
        goTo(1);
      }

      if (
        state.bondActioMode === "" &&
        (event.code === "KeyN" ||
          event.code === "Enter" ||
          event.code === "NumpadEnter")
      ) {
        event.preventDefault();
        newButtonRef.current?.click();
      }
      if (state.bondActioMode !== "" && event.code === "Escape") {
        event.preventDefault();
        cancelButtonRef.current?.click();
      }
      if (state.bondActioMode === "delete" && event.code === "Delete") {
        event.preventDefault();
        deleteButtonRef.current?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [goTo, state.bondActioMode]);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const customInputchange = (value: any, name: string) => {
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function computation() {
    setDefaultValueForNumber();
    const inpInsurerVal = parseFloat(state.insuredValue);
    const inPercentagePremium = parseFloat(state.percentagePremium);
    const inpLocalGovTaxPercent = parseFloat(state.localGovTaxPercent);

    const umis = parseFloat(state.umis);

    const principal = parseFloat(state.principal);

    const Percentage = inPercentagePremium / 100;
    const VatPercentage = 12 / 100;
    const DocPercentage = 12.5 / 100;
    const LOGPercentage = inpLocalGovTaxPercent / 100;
    const NewTotalPremium = inpInsurerVal * Percentage;

    customInputchange(inpInsurerVal.toFixed(2), "insuredValue");
    customInputchange(inPercentagePremium.toFixed(2), "percentagePremium");
    customInputchange(NewTotalPremium.toFixed(2), "totalPremium");
    customInputchange((VatPercentage * NewTotalPremium).toFixed(2), "vat");
    customInputchange((DocPercentage * NewTotalPremium).toFixed(2), "docStamp");
    customInputchange(
      (LOGPercentage * NewTotalPremium).toFixed(2),
      "localGovTax"
    );

    customInputchange(umis.toFixed(2), "umis");
    customInputchange(principal.toFixed(2), "principal");

    customInputchange(
      (
        parseFloat(NewTotalPremium.toFixed(2)) +
        parseFloat((VatPercentage * NewTotalPremium).toFixed(2)) +
        parseFloat((DocPercentage * NewTotalPremium).toFixed(2)) +
        parseFloat((LOGPercentage * NewTotalPremium).toFixed(2)) +
        parseFloat(umis.toFixed(2)) +
        parseFloat(principal.toFixed(2))
      ).toFixed(2),
      "totalDue"
    );
  }
  function backToDefaultState(json: any, resetAll: boolean = false) {
    json.form_type = state.form_type;
    json.form_action = state.form_action;
    json.prem_text_one = state.prem_text_one;
    json.prem_text_two = state.prem_text_two;
    if (!resetAll) {
      json.bondActioMode = state.bondActioMode;
    }
    Object.entries(json).forEach(([key, value]) => {
      customInputchange(value, key);
    });
  }
  async function updateQueryByKey() {
    return Promise.all([
      queryClient.invalidateQueries(queryKeySearchPolicy),
      queryClient.invalidateQueries(queryKeySearchClientEntry),
      queryClient.invalidateQueries(queryKeySearchAgentEntry),
      queryClient.invalidateQueries(queryKeyNeedData),
      queryClient.invalidateQueries(queryKeyAddOrUpdatePolicy),
      queryClient.invalidateQueries(queryKeyDeletePolicy),
    ]);
  }
  function onSearchSelected(selectedRowData: any) {
    const {
      PolicyNo,
      Account,
      PolicyType,
      Percentage,
      BidDate,
      BidTime,
      Obligee,
      UnitDetail,
      BondValue,
      NotaryName,
      TaxCerNo,
      IssuedLocation,
      NIssued,
      CapacityAs,
      TaxCerNoCorp,
      IssuedLoctCorp,
      CIssued,
      Officer,
      OPosition,
      Validity,
      IDNo,
      SubAcct,
      DateIssued,
      Notarial,
      Misc,
      AgentID,
      AgentCom,
      client_fullname,
      agent_fullname,
      address,
      sale_officer,
    } = selectedRowData[0];
    customInputchange(SubAcct, "sub_account");
    customInputchange(IDNo, "client_id");
    customInputchange(client_fullname, "client_name");
    customInputchange(address, "client_address");

    customInputchange(AgentID, "agent_id");
    customInputchange(agent_fullname, "agent_name");
    customInputchange(AgentCom, "agent_com");
    customInputchange(sale_officer, "sale_officer");

    customInputchange(Account, "PolicyAccount");
    customInputchange(PolicyNo, "PolicyNo");
    customInputchange(PolicyType, "policyType");

    customInputchange(BidDate, "biddingDate");
    customInputchange(BidTime, "time");
    customInputchange(DateIssued, "DateIssued");
    customInputchange(Validity, "validity");

    customInputchange(Officer, "officer");
    customInputchange(OPosition, "position");
    customInputchange(UnitDetail, "unit");
    customInputchange(Obligee, "obligee");

    customInputchange(NotaryName, "officerName");
    customInputchange(TaxCerNo, "officerTaxCertNo");
    customInputchange(IssuedLocation, "officerIssuedLoc");
    customInputchange(NIssued, "officerDateIssued");

    customInputchange(CapacityAs, "insuranceCapacity");
    customInputchange(TaxCerNoCorp, "insuranceOfficerTaxCert");
    customInputchange(IssuedLoctCorp, "insuranceIssuedLoc");
    customInputchange(CIssued, "insuranceDateIssued");

    state.insuredValue = BondValue;
    state.percentagePremium = Percentage;
    state.umis = Notarial;
    state.principal = Misc;
    computation();
    customInputchange("delete", "bondActioMode");
  }
  function keySave(event: any) {
    if (
      state.mode !== "" &&
      (event.code === "Enter" || event.code === "NumpadEnter")
    ) {
      event.preventDefault();
      handleOnSave();
    }
  }

  return (
    <BondContext.Provider
      value={{
        state,
        handleInputChange,
        customInputchange,
        Mortgagee,
        setMortgagee,
        showField,
        setShowField,
        clientRows,
        setClientRows,
        myAxios,
        user,
        agentRows,
        setAgentRows,
        computation,
        isAddOrEditMode,
        dispatch,
        keySave,
      }}
    >
      <div style={{ display: "flex", columnGap: "5px" }}>
        <div
          style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
        >
          <CustomButton
            onClick={() => {
              goTo(0);
            }}
            currentStepIndex={currentStepIndex}
            index={0}
          >
            Policy Information
          </CustomButton>
          <NavigateNextIcon fontSize="small" />
        </div>
        <div
          style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
        >
          <CustomButton
            onClick={() => {
              goTo(1);
            }}
            currentStepIndex={currentStepIndex}
            index={1}
          >
            Policy Premium
          </CustomButton>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "20px",
            marginLeft: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
            }}
          >
            {state.bondActioMode === "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                ref={newButtonRef}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  customInputchange("add", "bondActioMode");
                }}
              >
                New
              </Button>
            )}

            <LoadingButton
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              loading={loadingAddNew}
              color="primary"
              variant="contained"
              type="submit"
              onClick={handleOnSave}
              disabled={state.bondActioMode === ""}
              startIcon={<SaveIcon />}
            >
              Save
            </LoadingButton>
            {state.bondActioMode !== "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                ref={cancelButtonRef}
                variant="contained"
                startIcon={<CloseIcon />}
                color="error"
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, cancel it!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      customInputchange("", "bondActioMode");
                      backToDefaultState(initialState, true);
                    }
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <LoadingButton
              loading={loadingDelete}
              ref={deleteButtonRef}
              id="save-entry-header"
              variant="contained"
              sx={{
                height: "30px",
                fontSize: "11px",
                backgroundColor: pink[500],
                "&:hover": {
                  backgroundColor: pink[600],
                },
              }}
              disabled={state.bondActioMode !== "delete"}
              startIcon={<DeleteIcon />}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      PolicyAccount: state.PolicyAccount,
                      PolicyNo: state.PolicyNo,
                      policyType: state.policyType,
                      userCodeConfirmation,
                    });
                  },
                });
              }}
            >
              Delete
            </LoadingButton>
          </div>
        </div>
      </div>
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          columnGap: "20px",
          marginBottom: "10px",
          [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "flex-start",
            flex: 1,
          },
        })}
      >
        <div
          style={{
            marginTop: "10px",
            marginBottom: "12px",
            width: "100%",
          }}
        ></div>
      </Box>
      <div style={{ marginBottom: "5px", display: "flex", gap: "10px" }}>
        {isLoadingModalSearchBPolicy ? (
          <LoadingButton loading={isLoadingModalSearchBPolicy} />
        ) : (
          <TextField
            label="Search"
            size="small"
            name="search"
            value={search}
            onChange={(e: any) => {
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                openModalSearchBPolicy(search);
              }
            }}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "300px",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        )}

        {isLoadingSubAccount ? (
          <LoadingButton loading={isLoadingSubAccount} />
        ) : (
          <FormControl
            size="small"
            sx={(theme) => ({
              width: "150px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            })}
          >
            <InputLabel id="subAccount">Sub Account</InputLabel>
            <Select
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              size="small"
              labelId="subAccount"
              label="subAccount"
              name="sub_account"
              value={state.sub_account}
              onChange={(e) => {
                handleInputChange(e);
              }}
            >
              {(dataSubAccount?.data.sub_account).map(
                (items: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={items.Acronym.trim()}>
                      {items.Acronym}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        )}
        <FormControl
          size="small"
          sx={(theme) => ({
            width: "150px",
            ".MuiFormLabel-root": {
              fontSize: "14px",
              background: "white",
              zIndex: 99,
              padding: "0 3px",
            },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          })}
        >
          <InputLabel id="print-type">Print Type</InputLabel>
          <Select
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
            size="small"
            labelId="print-type"
            label="Print Type"
            name="printType"
            value={state.printType}
            onChange={handleInputChange}
          >
            {[{ title: "Front Page" }, { title: "Back Page" }].map(
              (items: any, idx: number) => {
                return (
                  <MenuItem key={idx} value={items.title}>
                    {items.title}
                  </MenuItem>
                );
              }
            )}
          </Select>
        </FormControl>
      </div>
      {step}
      {ModalSearchBPolicy}
    </BondContext.Provider>
  );
}
