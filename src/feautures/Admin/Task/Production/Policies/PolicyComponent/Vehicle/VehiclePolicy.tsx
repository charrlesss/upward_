import {
  createContext,
  useContext,
  useReducer,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
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
import ModalWithTable from "../../../../../../../components/ModalWithTable";
import { LoadingButton } from "@mui/lab";
import { flushSync } from "react-dom";
import useMultipleComponent from "../../../../../../../hooks/useMultipleComponent";
import PolicyInformation from "./VehicleComponent/PolicyInformation";
import PolicyPremium from "./VehicleComponent/PolicyPremium";
import PolicyTypeDetails from "./VehicleComponent/PolicyTypeDetails";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import styled from "@emotion/styled";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";
import { addYears, format } from "date-fns";
import ArticleIcon from "@mui/icons-material/Article";

interface CustomButtonProps {
  currentStepIndex: number;
  index: number;
}
export const CustomButton = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  font-size: 17px;
  color:${(props: CustomButtonProps) => {
    return props.currentStepIndex === props.index ? "#0284c7;" : "#020617;";
  }}
  padding: 0;
  &:hover  {
    color: #64748b;
    background:white;
  },
`;
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
  CCN: "",
  ORN: "",
  rateCost: "",
  //Period Insurance
  DateFrom: new Date(),
  DateTo: addYears(new Date(), 1),
  DateIssued: new Date(),
  //Insured Unit
  Model: "",
  Make: "",
  TB: "",
  Color: "",
  BLTFileNo: "",
  PlateNo: "",
  ChassisNo: "",
  MotorNo: "",
  AuthorizedCapacity: "",
  UnladenWeigth: "",

  //==========================
  //tpl
  TplType: "",
  PremiumPaid: "",
  //compre
  EVSV: "",
  Aircon: "",
  Stereo: "",
  Magwheels: "",
  OthersRate: "",
  OthersDesc: "",
  CompreType: "",

  Deductible: "",
  Towing: "",
  ARL: "",
  BodyInjury: "0.00",
  PropertyDamage: "0.00",
  PersinalAccident: "0.00",
  Denomination: "",

  //==========================
  //mortgage
  Mortgagee: "",
  MortgageeForm: "false",
  remarks: "",
  //Premiums
  SectionI_II: "",
  SectionIII: "",
  OwnDamage: "",
  Theft: "",
  SectionIVA: "",
  SectionIVB: "",
  PremiumOther: "",
  AOG: "",
  AOGPercent: "0.5",
  TotalPremium: "",
  Vat: "",
  DocStamp: "",
  LocalGovTaxPercent: "0.75",
  LocalGovTax: "",
  StradCom: "",
  TotalDue: "",
  Type: "charles1",
  Source_No_Ref_ID: "",
  vehicle: "private",

  // extra
  mode: "",
};

const initialSummaryState = {
  PolicyNo: "",
  PolicyType: "",
  DateIssued: "",
  Account: " ",
  Mortgagee: "",
  agent_fullname: "",
  sale_officer: "",
  TotalDue: "",
  IDNo: "",
  ShortName: "",
  address: "",
  options: "",
  subShortName: "",
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
export const VehicleContext = createContext<any>({});
const queryKeySearch = "vehicle-policy-search";
const queryKeyUpdateAdd = "vehicle-policy-search";
const queryKeyGet = "vehicle-policy-get";
const querySearchPolicyIds = "vehicle-policy-search-ppolicy-id";
export const vpolicyColumn = [
  { field: "_DateIssued", headerName: "Date", width: 200 },
  { field: "PolicyNo", headerName: "Policy No", width: 170 },
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
];
const vpolicyKey = "vehicle-policy";

export default function VehiclePolicy() {
  const [showClientDetails, setShowCLientDetails] = useState(false);
  const [domination, setDomination] = useState([]);
  const { step, goTo, currentStepIndex } = useMultipleComponent([
    <PolicyInformation />,
    <PolicyTypeDetails />,
    <PolicyPremium />,
  ]);
  const [summaryState, summaryDispatch] = useReducer(
    reducer,
    initialSummaryState
  );
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const [tplId, setTplId] = useState<GridRowSelectionModel>([]);
  const [search, setSearch] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [Mortgagee, setMortgagee] = useState(false);
  const [showField, setShowField] = useState({
    thirdparty: state.form_type.toLowerCase() === "tpl",
    compre: state.form_type.toLowerCase() === "com",
  });
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const vPolicySearchInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const isAddOrEditMode = state.mode === "";

  function onSearchSelected(selectedRowData: any) {
    const {
      address,
      IDNo,
      Account,
      SubAcct,
      PolicyNo,
      DateIssued,
      TotalPremium,
      Vat,
      DocStamp,
      LGovTax,
      Misc,
      TotalDue,
      AgentID,
      AgentCom,
      CoverNo,
      ORNo,
      DateFrom,
      DateTo,
      Model,
      Make,
      BodyType,
      Color,
      BLTFileNo,
      PlateNo,
      ChassisNo,
      MotorNo,
      AuthorizedCap,
      UnladenWeight,
      PremiumPaid,
      EstimatedValue,
      Aircon,
      Stereo,
      Magwheels,
      Others,
      OthersAmount,
      Deductible,
      Towing,
      RepairLimit,
      BodilyInjury,
      PropertyDamage,
      PersonalAccident,
      SecI,
      SecIIPercent,
      ODamage,
      Theft,
      Sec4A,
      Sec4B,
      Sec4C,
      AOG,
      MortgageeForm,
      Mortgagee,
      Denomination,
      client_fullname,
      agent_fullname,
      TPLTypeSection_I_II,
      AOGPercent,
      LocalGovTaxPercent,
      Remarks,
      sale_officer,
    } = selectedRowData[0];

    function formatTextNumber(input: string) {
      const userInput = input.toString();
      if (isNaN(parseFloat(userInput))) {
        return "0.00";
      }
      var formattedNumber = parseFloat(
        userInput.replace(/,/g, "")
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return formattedNumber;
    }
    function formatNumber(num: number) {
      return (num || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    function setFixValue(value: string) {
      const intVal = parseFloat(value);
      return intVal.toFixed(2);
    }
    function intToBoolean(value: string) {
      const intVal = parseInt(value);
      return intVal ? true : false;
    }

    handleDateChange(SubAcct, "sub_account");
    handleDateChange(IDNo, "client_id");
    handleDateChange(client_fullname, "client_name");
    handleDateChange(address, "client_address");

    handleDateChange(AgentID, "agent_id");
    handleDateChange(agent_fullname, "agent_name");
    handleDateChange(AgentCom, "agent_com");

    handleDateChange(Account, "PolicyAccount");
    handleDateChange(PolicyNo, "PolicyNo");
    handleDateChange(CoverNo, "CCN");
    handleDateChange(ORNo, "ORN");

    handleDateChange(DateFrom, "DateFrom");
    handleDateChange(DateTo, "DateTo");
    handleDateChange(DateIssued, "DateIssued");

    handleDateChange(Model, "Model");
    handleDateChange(Make, "Make");
    handleDateChange(BodyType, "TB");
    handleDateChange(Color, "Color");
    handleDateChange(BLTFileNo, "BLTFileNo");
    handleDateChange(PlateNo, "PlateNo");
    handleDateChange(ChassisNo, "ChassisNo");
    handleDateChange(MotorNo, "MotorNo");
    handleDateChange(AuthorizedCap, "AuthorizedCapacity");
    handleDateChange(UnladenWeight, "UnladenWeigth");

    handleDateChange(setFixValue(PremiumPaid), "PremiumPaid");
    handleDateChange(setFixValue(EstimatedValue), "EVSV");
    handleDateChange(setFixValue(Aircon), "Aircon");
    handleDateChange(setFixValue(Stereo), "Stereo");
    handleDateChange(setFixValue(Magwheels), "Magwheels");
    handleDateChange(setFixValue(Aircon), "Aircon");
    handleDateChange(setFixValue(OthersAmount), "OthersRate");
    handleDateChange(Others, "OthersDesc");

    handleDateChange(setFixValue(Deductible), "Deductible");
    handleDateChange(setFixValue(Towing), "Towing");
    handleDateChange(setFixValue(RepairLimit), "ARL");
    handleDateChange(formatTextNumber(BodilyInjury), "BodyInjury");
    handleDateChange(formatTextNumber(PropertyDamage), "PropertyDamage");
    handleDateChange(formatTextNumber(PersonalAccident), "PersinalAccident");
    handleDateChange(setFixValue(SecI), "SectionI_II");
    handleDateChange(setFixValue(SecIIPercent), "SectionIII");
    handleDateChange(setFixValue(ODamage), "OwnDamage");
    handleDateChange(setFixValue(Theft), "Theft");
    handleDateChange(setFixValue(Sec4A), "SectionIVA");
    handleDateChange(setFixValue(Sec4B), "SectionIVB");
    handleDateChange(setFixValue(Sec4C), "PremiumOther");
    handleDateChange(setFixValue(AOG), "AOG");

    handleDateChange(Mortgagee, "Mortgagee");
    handleDateChange(intToBoolean(MortgageeForm), "MortgageeForm");
    handleDateChange(Denomination, "Denomination");

    handleDateChange(setFixValue(TotalDue), "TotalDue");
    handleDateChange(setFixValue(Vat), "Vat");
    handleDateChange(setFixValue(DocStamp), "DocStamp");
    handleDateChange(setFixValue(TotalPremium), "TotalPremium");
    handleDateChange(setFixValue(LGovTax), "LocalGovTax");
    handleDateChange(setFixValue(Misc), "StradCom");

    handleDateChange(setFixValue(LocalGovTaxPercent), "LocalGovTaxPercent");
    handleDateChange(setFixValue(AOGPercent), "LocaAOGPercent");
    handleDateChange(TPLTypeSection_I_II, "TplType");
    handleDateChange(Remarks, "remarks");

    handleDateChange(sale_officer, "sale_officer");
    handleDateChange("delete", "mode");
    setSearchShow(false);
    setSearchShow(false);
  }
  const {
    isLoading: isLoadingTempId,
    // refetch: refetchTempId,
    data: dataTemp,
  } = useQuery({
    queryKey: "temp-id",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-vehicle-policy-temp-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  const { isLoading: searchLoading, refetch } = useQuery({
    queryKey: queryKeySearch,
    queryFn: async () =>
      await myAxios.get(
        `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res.data?.searchVPolicy as any;
      setRows(response);
    },
  });
  const { data: dataSubAccount, isLoading: isLoadingSubAccount } = useQuery({
    queryKey: "get-sub_account",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-sub_account`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });
  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: queryKeyUpdateAdd,
    mutationFn: async (variables: any) => {
      if (state.mode === "delete" && state.form_type === "COM") {
        return await myAxios.post(
          "/task/production/com-update-vehicle-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }

      if (state.mode === "delete" && state.form_type !== "COM") {
        return await myAxios.post(
          "/task/production/tpl-update-vehicle-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post(
        "/task/production/tpl-add-vehicle-policy",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (res) => {
      console.log(res.data)

      if (res.data.success) {
        Promise.all([
          queryClient.invalidateQueries(queryKeySearch),
          queryClient.invalidateQueries(queryKeyUpdateAdd),
          queryClient.invalidateQueries(queryKeyGet),
          queryClient.invalidateQueries(querySearchPolicyIds),
        ]);
        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          if (state.form_action === "TEMP") {
            const getNumbers = state.PolicyNo.split("TP-")[1];
            const inc = parseInt(getNumbers) + 1;
            const getZero = getNumbers.slice(0, getNumbers.length - 1);
            initialState.PolicyNo = `TP-${getZero}${inc}`;
            initialState.form_action = "TEMP";
          }
          initialState.form_type = state.form_type;
          backToDefaultState(initialState);
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
    mutationKey: queryKeyUpdateAdd,
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/production/tpl-delete-vehicle-policy",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (res) => {
      if (res.data.success) {
        Promise.all([
          queryClient.invalidateQueries(queryKeySearch),
          queryClient.invalidateQueries(queryKeyUpdateAdd),
          queryClient.invalidateQueries(queryKeyGet),
          queryClient.invalidateQueries(querySearchPolicyIds),
        ]);
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
  const { isLoading: isLoadingrates, mutate: mutateRates } = useMutation({
    mutationKey: "post-rates",
    mutationFn: async (variables) =>
      await myAxios.post(`/task/production/get-rates`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      setDomination(res.data.rates);
    },
  });
  const { isLoading: isLoadingPolicyDetails, mutate: mutatePolicyDetails } =
    useMutation({
      mutationKey: "get-policy-summary",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/task/production/get-policy-summary`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        const response = res.data as any;
        setShowCLientDetails(true);
        setNewStateValue(summaryDispatch, response.policyDetails[0]);
      },
    });
  const setDefaultValueForNumber = useCallback(() => {
    state.EVSV = parseStringToNumber(state.EVSV);
    state.Aircon = parseStringToNumber(state.Aircon);
    state.Stereo = parseStringToNumber(state.Stereo);
    state.Magwheels = parseStringToNumber(state.Magwheels);
    state.OthersRate = parseStringToNumber(state.OthersRate);
    state.Deductible = parseStringToNumber(state.Deductible);
    state.Towing = parseStringToNumber(state.Towing);
    state.ARL = parseStringToNumber(state.ARL);
    state.TotalPremium = parseStringToNumber(state.TotalPremium);
    state.Vat = parseStringToNumber(state.Vat);
    state.DocStamp = parseStringToNumber(state.DocStamp);
    state.LocalGovTaxPercent = parseStringToNumber(state.LocalGovTaxPercent);
    state.LocalGovTaxPercent = parseStringToNumber(state.LocalGovTaxPercent);
    state.LocalGovTax = parseStringToNumber(state.LocalGovTax);
    state.TotalDue = parseStringToNumber(state.TotalDue);
    state.AOG = parseStringToNumber(state.AOG);
    state.AOGPercent = parseStringToNumber(state.AOGPercent);
    state.PremiumOther = parseStringToNumber(state.PremiumOther);
    state.SectionIVB = parseStringToNumber(state.SectionIVB);
    state.SectionIVA = parseStringToNumber(state.SectionIVA);
    state.Theft = parseStringToNumber(state.Theft);
    state.OwnDamage = parseStringToNumber(state.OwnDamage);
    state.SectionIII = parseStringToNumber(state.SectionIII);
    state.SectionI_II = parseStringToNumber(state.SectionI_II);
    state.PremiumPaid = parseStringToNumber(state.PremiumPaid);
    state.StradCom = parseStringToNumber(state.StradCom);
  }, [state]);
  const handleOnSave = useCallback(() => {
    if (
      state.client_name === "" ||
      state.client_name === null ||
      state.client_name === undefined
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Register on ID Entry?",
        text: "Unable to save! Invalid Client ID!",
        showCancelButton: true,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          return window.open(
            "/dashboard/reference/id-entry?drawer=false",
            "_blank"
          );
        }
      });
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
    if (state.mode === "delete") {
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
  }, [setDefaultValueForNumber, mutate, state]);

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
        event.code === "AudioVolumeUp" ||
        event.code === "F3" ||
        event.keyCode === 175
      ) {
        event.preventDefault();
        goTo(2);
      }

      if (
        state.mode === "" &&
        (event.code === "KeyN" ||
          event.code === "Enter" ||
          event.code === "NumpadEnter")
      ) {
        event.preventDefault();
        newButtonRef.current?.click();
      }
      if (state.mode !== "" && event.code === "Escape") {
        event.preventDefault();
        cancelButtonRef.current?.click();
      }
      if (state.mode === "delete" && event.code === "Delete") {
        event.preventDefault();
        deleteButtonRef.current?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [goTo, handleOnSave, state.mode]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleDateChange = (value: any, name: string) => {
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  function parseStringToNumber(input: string) {
    const parsedNumber = parseFloat(input);

    if (!isNaN(parsedNumber)) {
      return input;
    } else {
      return "0.00";
    }
  }
  function tplCompuation() {
    setDefaultValueForNumber();

    if (isNaN(parseFloat(state.PremiumPaid))) {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Premiumn Paid is Required",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    const vatPercentage = 12 / 100;
    const dsPercentage = 12.5 / 100;
    const lgtPercentage = 0.75 / 100;
    const vatResult = vatPercentage * parseFloat(state.PremiumPaid);
    const dsResult = dsPercentage * parseFloat(state.PremiumPaid);
    const lgtResult = lgtPercentage * parseFloat(state.PremiumPaid);

    const totalResult =
      vatResult +
      dsResult +
      lgtResult +
      parseFloat(state.StradCom) +
      parseFloat(state.PremiumPaid);

    handleDateChange(
      `${parseFloat(state.PremiumPaid).toFixed(2)}`,
      "SectionI_II"
    );
    handleDateChange(
      `${parseFloat(state.PremiumPaid).toFixed(2)}`,
      "TotalPremium"
    );
    handleDateChange(`${vatResult.toFixed(2)}`, "Vat");
    handleDateChange(`${dsResult.toFixed(2)}`, "DocStamp");
    handleDateChange(`${lgtResult.toFixed(2)}`, "LocalGovTax");
    handleDateChange(`${Math.round(totalResult).toFixed(2)}`, "TotalDue");
  }
  function comComputation() {
    setDefaultValueForNumber();

    const vatPercentage = 12 / 100;
    const docPercentage = 12.5 / 100;
    const lgtPercentage =
      parseFloat(state.LocalGovTaxPercent.replace(/,/g, "")) / 100;
    const section = parseFloat(state.SectionIII.replace(/,/g, "")) / 100;
    const aogPercent = parseFloat(state.AOGPercent.replace(/,/g, "")) / 100;
    const owmDamageResult = parseFloat(state.EVSV.replace(/,/g, "")) * section;
    const aogDamageResult =
      parseFloat(state.EVSV.replace(/,/g, "")) * aogPercent;
    handleDateChange(`${owmDamageResult.toFixed(2)}`, "OwnDamage");
    handleDateChange(
      `${formatNumberWithTwoDecimals(aogDamageResult.toString())}`,
      "AOG"
    );
    const totalPremiumResult =
      parseFloat(owmDamageResult.toFixed(2)) +
      parseFloat(aogDamageResult.toString()) +
      parseFloat(state.SectionIVB.replace(/,/g, "")) +
      parseFloat(state.PremiumOther.replace(/,/g, "")) +
      parseFloat(state.SectionIVA.replace(/,/g, ""));
    handleDateChange(
      `${(vatPercentage * totalPremiumResult).toFixed(2)}`,
      "Vat"
    );
    handleDateChange(
      `${(docPercentage * totalPremiumResult).toFixed(2)}`,
      "DocStamp"
    );
    handleDateChange(
      `${(lgtPercentage * totalPremiumResult).toFixed(2)}`,
      "LocalGovTax"
    );

    handleDateChange("0.00", "TotalPremium");
    handleDateChange("0.00", "TotalDue");

    const totalDuePremiumResult =
      totalPremiumResult +
      parseFloat((vatPercentage * totalPremiumResult).toFixed(2)) +
      parseFloat((docPercentage * totalPremiumResult).toFixed(2)) +
      parseFloat((lgtPercentage * totalPremiumResult).toFixed(2)) +
      parseFloat(parseFloat(state.StradCom.replace(/,/g, "")).toFixed(2));

    handleDateChange(
      `${formatNumberWithTwoDecimals(totalPremiumResult.toString())}`,
      "TotalPremium"
    );
    handleDateChange(`${totalDuePremiumResult.toFixed(2)}`, "TotalDue");
  }
  function backToDefaultState(json: any, resetAll: boolean = false) {
    Object.entries(json).forEach(([key, value]) => {
      handleDateChange(value, key);
    });
  }
  function formatNumberWithTwoDecimals(value: string) {
    const input = parseStringToNumber(value);

    if (input.includes(".")) {
      const parts = input.split(".");
      const integerPart = parts[0];
      const decimalPart = parts[1].slice(0, 2) || "00";
      return `${integerPart}.${decimalPart}`;
    }

    return `${input}.00`;
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
  function setNewStateValue(dispatch: any, obj: any) {
    Object.entries(obj).forEach(([field, value]) => {
      dispatch({ type: "UPDATE_FIELD", field, value });
    });
  }

  useEffect(() => {
    if (user?.department === "UCSMI")
      handleInputChange({ target: { value: "TEMP", name: "form_action" } });

    handleDateChange(dataTemp?.data.tempId[0].tempPolicy_No, "PolicyNo");
    handleInputChange({
      target: { value: "COM", name: "form_type" },
    });
  }, [user?.department, dataTemp?.data.tempId]);

  return (
    <VehicleContext.Provider
      value={{
        parseStringToNumber,
        state,
        handleInputChange,
        handleDateChange,
        Mortgagee,
        setMortgagee,
        showField,
        setShowField,
        myAxios,
        user,
        tplCompuation,
        comComputation,
        tplId,
        setTplId,
        isAddOrEditMode,
        dispatch,
        isLoadingTempId,
        keySave,
        domination,
        mutateRates,
        isLoadingrates,
        reducer,
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
            Policy Type and Details
          </CustomButton>
          <NavigateNextIcon fontSize="small" />
        </div>
        <div
          style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
        >
          <CustomButton
            onClick={() => {
              goTo(2);
            }}
            currentStepIndex={currentStepIndex}
            index={2}
          >
            Policy Premium
          </CustomButton>
        </div>
        <div
          style={{
            marginLeft: "30px",
            display: "flex",
            alignItems: "center",
            columnGap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
            }}
          >
            {state.mode === "" && (
              <Button
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                ref={newButtonRef}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  handleDateChange("add", "mode");
                }}
              >
                New
              </Button>
            )}
            <LoadingButton
              loading={loadingAddNew}
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              color="primary"
              variant="contained"
              type="submit"
              onClick={handleOnSave}
              disabled={state.mode === ""}
              startIcon={<SaveIcon />}
            >
              Save
            </LoadingButton>
            {state.mode !== "" && (
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
                      initialState.form_action = state.form_action;
                      initialState.form_type = state.form_type;
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
              ref={deleteButtonRef}
              disabled={state.mode !== "delete"}
              startIcon={<DeleteIcon />}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      PolicyAccount: state.PolicyAccount,
                      form_type: state.form_type,
                      PolicyNo: state.PolicyNo,
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
        {searchLoading ? (
          <LoadingButton loading={searchLoading} />
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

                flushSync(() => {
                  setSearchShow(true);
                });
                if (vPolicySearchInput?.current) {
                  vPolicySearchInput.current.value = search;

                  myAxios
                    .get(
                      `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=${search}`,
                      {
                        headers: {
                          Authorization: `Bearer ${user?.accessToken}`,
                        },
                      }
                    )
                    .then((res: any) => {
                      if (!res?.data.success) {
                        return alert(`Error : ${res?.data.message}`);
                      }

                      const response = res as any;
                      setRows(response.data["searchVPolicy"]);
                      if (vPolicySearchInput?.current)
                        vPolicySearchInput.current.focus();
                    });
                }
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
                handleDateChange("", "Denomination");
                handleDateChange("", "PolicyAccount");
                handleDateChange("", "Mortgagee");
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
            width: "100px",
            ".MuiFormLabel-root": {
              fontSize: "14px",
              background: "white",
              zIndex: 99,
              padding: "0 3px",
            },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          })}
        >
          <Select
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
            labelId="formType"
            name="form_type"
            value={state.form_type}
            onChange={(e) => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, change it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  initialState.form_action = state.form_action;
                  backToDefaultState(initialState);
                  setShowField({
                    thirdparty: e.target.value.toLowerCase() === "tpl",
                    compre: e.target.value.toLowerCase() === "com",
                  });

                  refetch();
                  handleInputChange(e);
                }
              });
            }}
          >
            {[
              { Account: "TPL", show: state.form_action === "REG" },
              { Account: "COM", show: true },
            ].map((items: any, idx: number) => {
              return items.show ? (
                <MenuItem key={idx} value={items.Account}>
                  {items.Account}
                </MenuItem>
              ) : null;
            })}
          </Select>
        </FormControl>
        <FormControl
          size="small"
          sx={(theme) => ({
            width: "100px",
            ".MuiFormLabel-root": {
              fontSize: "14px",
              background: "white",
              zIndex: 99,
              padding: "0 3px",
            },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          })}
        >
          <Select
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
            name="form_action"
            value={state.form_action}
            onChange={(e) => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, change it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  initialState.form_type = "COM";
                  backToDefaultState(initialState);
                  refetch();
                  handleInputChange(e);

                  if (e.target.value === "TEMP") {
                    handleDateChange(
                      dataTemp?.data.tempId[0].tempPolicy_No,
                      "PolicyNo"
                    );
                    handleInputChange({
                      target: { value: "COM", name: "form_type" },
                    });
                  }

                  if (e.target.value === "REG") {
                    handleDateChange("", "PolicyNo");
                  }
                }
              });
            }}
          >
            <MenuItem value={"REG"}>REG</MenuItem>
            {state.form_type !== "TPL" && (
              <MenuItem value={"TEMP"}>TEMP</MenuItem>
            )}
          </Select>
        </FormControl>
        {isLoadingPolicyDetails ? (
          <div>
            <CircularProgress size="20px" />
          </div>
        ) : (
          <Button
            disabled={state.mode !== "delete"}
            variant="outlined"
            startIcon={<ArticleIcon />}
            sx={{
              height: "27px",
              fontSize: "11px",
            }}
            onClick={() => {
              mutatePolicyDetails({
                PolicyNo: state.PolicyNo,
              });
            }}
          >
            Summary
          </Button>
        )}
      </div>
      {step}
      <ModalWithTable
        searchRef={vPolicySearchInput}
        showModal={searchShow}
        onCloseModal={() => {
          setSearchShow(false);
        }}
        onClickCloseIcon={() => {
          setSearchShow(false);
        }}
        searchOnChange={() => {}}
        onSearchKeyEnter={(value) => {
          myAxios
            .get(
              `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=${value}`,
              {
                headers: {
                  Authorization: `Bearer ${user?.accessToken}`,
                },
              }
            )
            .then((res: any) => {
              if (!res?.data.success) {
                return alert(`Error : ${res?.data.message}`);
              }
              const response = res as any;
              setRows(response.data["searchVPolicy"]);
            });
        }}
        height={300}
        isLoading={searchLoading}
        queryKey={vpolicyKey}
        columns={vpolicyColumn}
        onCellKeyDown={(__: any, key: any) => {
          if (key.code === "Enter" || key.code === "NumpadEnter") {
            key.preventDefault();
            onSearchSelected([__.row]);
          }
        }}
        onSelectionChange={(rowSelectionModel, data) => {
          if (rowSelectionModel.length <= 0) {
            return;
          }

          const selectedIDs = new Set(rowSelectionModel);
          const selectedRowData = data.filter((row: any) => {
            return selectedIDs.has(row["PolicyNo"].toString());
          });
          if (selectedRowData.length <= 0) return;
          mutateRates({
            Account: selectedRowData[0].Account.trim(),
            Type: state.form_type.toUpperCase(),
          } as any);

          onSearchSelected(selectedRowData);
        }}
        id={"PolicyNo"}
        rows={rows}
        setRows={setRows}
      />
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
              Policy Details
            </p>
            <hr style={{ margin: "5px 0" }} />
            <DisplayDetails
              datakey={"DateIssued"}
              label={"Date Issued"}
              value={format(new Date(), "yyyy/MM/dd")}
            />
            <DisplayDetails
              datakey={"PolicyNo"}
              label={"Policy No."}
              value={summaryState.PolicyNo}
            />
            <DisplayDetails
              datakey={"PolicyType"}
              label={"Policy Type"}
              value={summaryState.PolicyType}
            />
            <DisplayDetails
              datakey={"Account"}
              label={"Account"}
              value={summaryState.Account}
            />
            <DisplayDetails
              datakey={"Mortgagee"}
              label={"Mortgagee"}
              value={summaryState.Mortgagee}
            />
            <DisplayDetails
              datakey={"TotalDue"}
              label={"Total Due"}
              value={parseFloat(
                summaryState.TotalDue.toString().replace(/,/g, "")
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <DisplayDetails
              datakey={"sale_officer"}
              label={"Sale Officer"}
              value={summaryState.sale_officer}
            />
            <hr style={{ margin: "5px 0" }} />
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              Client Details
            </p>
            <hr style={{ margin: "5px 0" }} />
            <DisplayDetails
              datakey={"IDNo_dr"}
              label={"ID NO."}
              value={summaryState.IDNo}
            />
            <DisplayDetails
              datakey={"ShortName_dr"}
              label={"Short Name"}
              value={summaryState.ShortName}
            />
            <DisplayDetails
              datakey={"subShortName_dr"}
              label={"Sub Account"}
              value={summaryState.subShortName}
            />
            <DisplayDetails
              datakey={"mobile_dr"}
              label={"Mobile"}
              value={summaryState.mobile}
            />
            <DisplayDetails
              datakey={"email_dr"}
              label={"Email"}
              value={summaryState.email}
            />
            <DisplayDetails
              datakey={"address_dr"}
              label={"Address"}
              value={summaryState.address}
            />
            <DisplayDetails
              datakey={"options_dr"}
              label={"Option"}
              value={summaryState.options}
            />
            <hr style={{ margin: "5px 0" }} />
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              Agent Details
            </p>
            <hr style={{ margin: "5px 0" }} />
            <DisplayDetails
              datakey={"agent_fullname"}
              label={"Agent Name"}
              value={summaryState.agent_fullname}
            />
          </div>
        </div>
      </div>
    </VehicleContext.Provider>
  );
}
