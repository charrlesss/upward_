import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
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
import CGLPolicyInformation from "./CGLPolicyComponent/CGLPolicyInformation";
import useQueryModalTable from "../../../../../../../hooks/useQueryModalTable";
import { LoadingButton } from "@mui/lab";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";
import { addYears } from "date-fns";
import PageHelmet from "../../../../../../../components/Helmet";

const initialState = {
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

  //Period Insurance
  DateFrom: new Date(),
  DateTo: addYears(new Date(), 1),
  DateIssued: new Date(),

  //
  sumInsured: "",
  premisisOperation: "",
  address: "",
  blPremium: "0.00",
  pdPremium: "0.00",

  //calculation
  netPremium: "0.00",
  vat: "0.00",
  docStamp: "0.00",
  localGovTaxPercent: "0.75",
  localGovTax: "0.00",
  totalDue: "0.00",
  // extra
  cglActioMode: "",
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
export const CGLContext = createContext<any>({});

const queryKeySearchPolicy = "cgl-search";
const queryKeySearchClientEntry = "clients";
const queryKeySearchAgentEntry = "agents";
const queryKeyNeedData = "cgl-policy";
const queryKeyAddOrUpdatePolicy = "cgl-policy";
const queryKeyDeletePolicy = "cgl-policy";

export default function CGLPolicy() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const [clientRows, setClientRows] = useState<GridRowSelectionModel>([]);
  const [agentRows, setAgentRows] = useState<GridRowSelectionModel>([]);
  const [search, setSearch] = useState("");
  const [Mortgagee, setMortgagee] = useState(false);
  const searchCglPolicyInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const isAddOrEditMode = state.cglActioMode === "";

  const newButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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
    ModalComponent: ModalSearchCGLPolicy,
    openModal: openModalSearchCGLPolicy,
    isLoading: isLoadingModalSearchCGLPolicy,
    closeModal: closeModalSearchCGLPolicy,
  } = useQueryModalTable({
    link: {
      url: "/task/production/search-cgl-policy",
      queryUrlName: "searchCglPolicy",
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
    queryKey: "search-cgl-policy",
    uniqueId: "PolicyNo",
    responseDataKey: "cglPolicy",
    onSelected: (selectedRowData) => {
      onSearchSelected(selectedRowData);
      closeModalSearchCGLPolicy();
    },
    onCellKeyDown: (__: any, key: any) => {
      if (key.code === "Enter" || key.code === "NumpadEnter") {
        onSearchSelected([__.row]);
        closeModalSearchCGLPolicy();
      }
    },
    onSuccess: console.log,
    searchRef: searchCglPolicyInputRef,
  });

  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: queryKeyAddOrUpdatePolicy,
    mutationFn: async (variables: any) => {
      if (state.cglActioMode === "delete") {
        return await myAxios.post(
          "/task/production/update-cgl-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post("/task/production/add-cgl-policy", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
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
        "/task/production/delete-cgl-policy",
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
    state.blPremium = state.blPremium === "" ? "0" : state.blPremium;
    state.pdPremium = state.pdPremium === "" ? "0" : state.pdPremium;
    state.netPremium = state.netPremium === "" ? "0" : state.netPremium;
    state.vat = state.vat === "" ? "0" : state.vat;
    state.docStamp = state.docStamp === "" ? "0" : state.docStamp;
    state.localGovTaxPercent =
      state.localGovTaxPercent === "" ? "0" : state.localGovTaxPercent;
    state.localGovTax = state.localGovTax === "" ? "0" : state.localGovTax;
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

    if (state.cglActioMode === "delete") {
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
  }, [setDefaultValueForNumber, state, mutate]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (
        state.cglActioMode === "" &&
        (event.code === "KeyN" ||
          event.code === "Enter" ||
          event.code === "NumpadEnter")
      ) {
        event.preventDefault();
        newButtonRef.current?.click();
      }
      if (state.cglActioMode !== "" && event.code === "Escape") {
        event.preventDefault();
        cancelButtonRef.current?.click();
      }
      if (state.cglActioMode === "delete" && event.code === "Delete") {
        event.preventDefault();
        deleteButtonRef.current?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOnSave, state.cglActioMode]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  // cglActioMode

  const customInputchange = (value: any, name: string) => {
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  function computation() {
    setDefaultValueForNumber();
    const inpLocalGovTaxPercent = parseFloat(state.localGovTaxPercent);
    const VatPercentage = 12 / 100;
    const DocPercentage = 12.5 / 100;
    const LOGPercentage = inpLocalGovTaxPercent / 100;
    const NewTotalPremium = parseFloat(state.netPremium);

    customInputchange((VatPercentage * NewTotalPremium).toFixed(2), "vat");
    customInputchange((DocPercentage * NewTotalPremium).toFixed(2), "docStamp");
    customInputchange(
      (LOGPercentage * NewTotalPremium).toFixed(2),
      "localGovTax"
    );
    customInputchange(NewTotalPremium.toFixed(2), "netPremium");
    customInputchange(
      (
        parseFloat(NewTotalPremium.toFixed(2)) +
        parseFloat((VatPercentage * NewTotalPremium).toFixed(2)) +
        parseFloat((DocPercentage * NewTotalPremium).toFixed(2)) +
        parseFloat((LOGPercentage * NewTotalPremium).toFixed(2))
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
      json.cglActioMode = state.cglActioMode;
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
      PeriodFrom,
      PeriodTo,
      Location,
      IDNo,
      SubAcct,
      DateIssued,
      TotalPremium,
      AgentID,
      AgentCom,
      client_fullname,
      agent_fullname,
      address,
      LimitA,
      LimitB,
      sumInsured,
      cgl_address,
      sale_officer,
      Vat,
      DocStamp,
      LGovTax,
      TotalDue
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

    customInputchange(PeriodFrom, "DateFrom");
    customInputchange(PeriodTo, "DateTo");
    customInputchange(DateIssued, "DateIssued");

    customInputchange(Location, "premisisOperation");

    customInputchange(Location, "premisisOperation");
    customInputchange(sumInsured, "sumInsured");
    customInputchange(cgl_address, "address");

    customInputchange(LimitA, "blPremium");
    customInputchange(LimitB, "pdPremium");
    console.log(selectedRowData)

    customInputchange(formatNumber(parseFloat(TotalPremium)), "netPremium");
    customInputchange(formatNumber(parseFloat(Vat)), "vat");
    customInputchange(formatNumber(parseFloat(DocStamp)), "docStamp");
    customInputchange(formatNumber(parseFloat(LGovTax)), "localGovTax");
    customInputchange(formatNumber(parseFloat(TotalDue)), "totalDue");

    customInputchange("delete", "cglActioMode");
  }


  function formatNumber(num: number) {
    return (num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
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


  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleOnSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOnSave]);

  return (
    <>
      <PageHelmet title="CGL Policy" />

      <CGLContext.Provider
        value={{
          state,
          handleInputChange,
          customInputchange,
          Mortgagee,
          setMortgagee,
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
              {state.cglActioMode === "" && (
                <Button
                  sx={{
                    height: "30px",
                    fontSize: "11px",
                  }}
                  ref={newButtonRef}
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    customInputchange("add", "cglActioMode");
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
                disabled={state.cglActioMode === ""}
                startIcon={<SaveIcon />}
              >
                Save
              </LoadingButton>

              {state.cglActioMode !== "" && (
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
                        customInputchange("", "cglActioMode");
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
                disabled={state.cglActioMode !== "delete"}
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
        </Box>
        <div style={{ marginBottom: "5px", display: "flex", gap: "10px" }}>
          {isLoadingModalSearchCGLPolicy ? (
            <LoadingButton loading={isLoadingModalSearchCGLPolicy} />
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
                  openModalSearchCGLPolicy(search);
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
        </div>
        <CGLPolicyInformation />
        {ModalSearchCGLPolicy}
      </CGLContext.Provider>
    </>
  );
}
