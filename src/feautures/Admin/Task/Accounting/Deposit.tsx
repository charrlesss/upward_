import {
  useState,
  createContext,
  useContext,
  CSSProperties,
  useEffect,
  useRef,
  useReducer,
} from "react";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import CustomDatePicker from "../../../../components/DatePicker";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import PolicyIcon from "@mui/icons-material/Policy";
import LoadingButton from "@mui/lab/LoadingButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { wait } from "@testing-library/user-event/dist/utils";
import useMultipleComponent from "../../../../hooks/useMultipleComponent";
import Table from "../../../../components/Table";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
const defaultCashBreakDown = [
  { value1: "1,000.00", value2: "", value3: "0.00" },
  { value1: "500.00", value2: "", value3: "0.00" },
  { value1: "200.00", value2: "", value3: "0.00" },
  { value1: "100.00", value2: "", value3: "0.00" },
  { value1: "50.00", value2: "", value3: "0.00" },
  { value1: "20.00", value2: "", value3: "0.00" },
  { value1: "10.00", value2: "", value3: "0.00" },
  { value1: "5.00", value2: "", value3: "0.00" },
  { value1: "2.00", value2: "", value3: "0.00" },
  { value1: "1.00", value2: "", value3: "0.00" },
  { value1: ".50", value2: "", value3: "0.00" },
  { value1: ".25", value2: "", value3: "0.00" },
  { value1: ".10", value2: "", value3: "0.00" },
  { value1: ".05", value2: "", value3: "0.00" },
  { value1: ".01", value2: "", value3: "0.00" },
];
const buttons = [
  {
    title: "Cash Collection",
    index: 0,
  },
  {
    title: "Check Collection",
    index: 1,
  },
  {
    title: "Selected Collection",
    index: 2,
  },
  {
    title: "Collection for Deposit",
    index: 3,
  },
];
interface DepositContextType {
  cashCollection: GridRowSelectionModel;
  setCashCollection: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  checkCollection: GridRowSelectionModel;
  setCheckCollection: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  selectedCollection: GridRowSelectionModel;
  setSelectedCollection: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  collectionForDeposit: GridRowSelectionModel;
  setCollectionForDeposit: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  tableRows: Array<{ value1: string; value2: string; value3: string }>;
  updateTableRowsInput: (
    fields: {
      value1: string;
      value2: string;
      value3: string;
    },
    idx: number
  ) => void;
  LoadingCashTable: boolean;
  LoadingCheckTable: boolean;
  total: string;
  setTotal: React.Dispatch<React.SetStateAction<string>>;
  TotalCashForDeposit: string;
  loadingSearchByDepositSlip: boolean;
}
const initialState = {
  depositSlip: "",
  temp_depositSlip: "",
  depositdate: new Date(),
  Account_ID: "",
  Account_Name: "",
  Account_No: "",
  Account_Type: "",
  Desc: "",
  IDNo: "",
  Short: "",
  ShortName: "",
  Sub_ShortName: "",
  Sub_Acct: "",
  search: "",
  depositMode: "",
  Identity: "",
};
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
const DepositContext = createContext<DepositContextType>({
  cashCollection: [],
  setCashCollection: () => {},
  checkCollection: [],
  setCheckCollection: () => {},
  selectedCollection: [],
  setSelectedCollection: () => {},
  collectionForDeposit: [],
  setCollectionForDeposit: () => {},
  tableRows: [],
  updateTableRowsInput: () => {},
  LoadingCashTable: false,
  LoadingCheckTable: false,
  setTotal: () => {},
  total: "0.00",
  TotalCashForDeposit: "0.00",
  loadingSearchByDepositSlip: false,
});

export default function Deposit() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { myAxios, user } = useContext(AuthContext);
  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <CashCollection />,
    <CheckCollection />,
    <SelectedCollection />,
    <CollectionForDeposit />,
  ]);
  const [tableRowsInputValue, setTableRowsInputValue] =
    useState<Array<{ value1: string; value2: string; value3: string }>>(
      defaultCashBreakDown
    );
  const [cashCollection, setCashCollection] = useState<GridRowSelectionModel>(
    []
  );
  const [checkCollection, setCheckCollection] = useState<GridRowSelectionModel>(
    []
  );
  const [selectedCollection, setSelectedCollection] =
    useState<GridRowSelectionModel>([]);
  const [collectionForDeposit, setCollectionForDeposit] =
    useState<GridRowSelectionModel>([]);
  const updateTableRowsInput = (
    fields: { value1: string; value2: string; value3: string },
    idx: number
  ) => {
    setTableRowsInputValue((d) => {
      return d.map((item, index) => {
        if (idx === index) {
          item = { ...item, ...fields };
        }
        return item;
      });
    });
  };
  const queryClient = useQueryClient();
  const { isLoading: LoadingCashTable, refetch: refetchCash } = useQuery({
    queryKey: "cash",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/getCashCollection`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      setCashCollection(response.data.cash);
    },
  });
  const { isLoading: LoadingDepositSlipCode, refetch: RefetchDepositSlipCode } =
    useQuery({
      queryKey: "deposit-slipcode",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/get-deposit-slipcode`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const response = data as any;
    
        dispatch({
          type: "UPDATE_FIELD",
          field: "depositSlip",
          value: response.data.slipcode[0].collectionID,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "temp_depositSlip",
          value: response.data.slipcode[0].collectionID,
        });
      },
    });
  const { isLoading: LoadingCheckTable, refetch: refetchCheck } = useQuery({
    queryKey: "check",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/getCheckCollection`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      setCheckCollection(response.data.check);
    },
  });
  const [total, setTotal] = useState("0.00");
  const datePickerRef = useRef<HTMLElement>(null);
  const bankDepositSearch = useRef<HTMLInputElement>(null);
  const depositSearch = useRef<HTMLInputElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const goToRef = useRef<(index: number) => void>(goTo);

  const TotalCashForDeposit = selectedCollection
    .reduce((accumulator: number, currentValue: any) => {
      const dd =
        currentValue.Check_No || currentValue.Check_No !== ""
          ? 0
          : parseFloat(currentValue.Amount.replace(/,/g, ""));
      return accumulator + dd;
    }, 0.0)
    .toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const {
    ModalComponent: ModalDepostitBanks,
    openModal: openDepositBanks,
    isLoading: isLoadingDepostitBanks,
    closeModal: closeDepositBanks,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/getBanks",
      queryUrlName: "bankDepositSearch",
    },
    columns: [
      { field: "Account_Type", headerName: "Account_Type", width: 200 },
      { field: "Account_No", headerName: "Account_No", width: 170 },
      {
        field: "Account_Name",
        headerName: "Account_Name",
        flex: 1,
      },
    ],
    queryKey: "bank-deposit",
    uniqueId: "Account_No",
    responseDataKey: "banks",
    onSelected: (selectedRowData) => {
      console.log(selectedRowData[0]);
      const newState = {
        ...state,
        ...selectedRowData[0],
      };
      setNewStateValue(dispatch, newState);
      closeDepositBanks();
    },

    searchRef: bankDepositSearch,
  });
  const { mutate: addDepositMutation, isLoading: addDepositMutationLoading } =
    useMutation({
      mutationKey: "add-deposit",
      mutationFn: async (variables: any) => {
        return await myAxios.post("/task/accounting/add-deposit", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess: (res) => {
        const resposnse = res as any;
        if (resposnse.data.success) {
          queryClient.invalidateQueries("deposit-search");
          setNewStateValue(dispatch, initialState);
          setSelectedCollection([]);
          setCollectionForDeposit([]);
          refetchCash();
          RefetchDepositSlipCode();
          refetchCheck();
          setTableRowsInputValue(defaultCashBreakDown);
          return Swal.fire({
            position: "center",
            icon: "success",
            title: resposnse.data.message,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "warning",
          title: resposnse.data.message,
          timer: 1500,
        });
      },
    });
  const {
    mutate: updateDepositMutation,
    isLoading: updateDepositMutationLoading,
  } = useMutation({
    mutationKey: "update-deposit",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/task/accounting/update-deposit", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      const resposnse = res as any;
      if (resposnse.data.success) {
        queryClient.invalidateQueries("deposit-search");
        setNewStateValue(dispatch, initialState);
        setSelectedCollection([]);
        setCollectionForDeposit([]);
        refetchCash();
        RefetchDepositSlipCode();
        refetchCheck();
        setTableRowsInputValue(defaultCashBreakDown);
        return Swal.fire({
          position: "center",
          icon: "success",
          title: resposnse.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: resposnse.data.message,
        timer: 1500,
      });
    },
  });
  const { mutate: searchByDepositSlip, isLoading: loadingSearchByDepositSlip } =
    useMutation({
      mutationKey: "search-deposit-cash-check",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/task/accounting/search-cash-check",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess: (res) => {
        const response = res as any;
        console.log("asdasd", response);

        setCashCollection(response.data.cash);
        setCheckCollection(response.data.check);
        setSelectedCollection([
          ...response.data.cash.filter((items: any) => items.SlipCode !== ""),
          ...response.data.check.filter((items: any) => items.SlipCode !== ""),
        ]);
        setCollectionForDeposit([
          ...response.data.check.filter((items: any) => items.SlipCode !== ""),
        ]);
        setTableRowsInputValue(response.data.cashBreakDownToArray);
        setNewStateValue(dispatch, {
          ...state,
          ...response.data.getBankFromDeposit[0],
        });
        setTotal(response.data.cashBreakDownTotal);
        handleInputChange({ target: { name: "depositMode", value: "edit" } });
      },
    });
  const {
    ModalComponent: ModalDeposit,
    openModal: openDeposit,
    isLoading: isLoadingDeposit,
    closeModal: closeDeposit,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-deposit",
      queryUrlName: "searchDeposit",
    },
    columns: [
      { field: "Date", headerName: "Date", width: 150 },
      { field: "SlipCode", headerName: "Slip Code", width: 170 },
      {
        field: "BankAccount",
        headerName: "Bank Account",
        width: 170,
      },
      {
        field: "AccountName",
        headerName: "Account Name",
        flex: 1,
      },
    ],
    queryKey: "deposit-search",
    uniqueId: "SlipCode",
    responseDataKey: "deposit",
    onSelected: (selectedRowData) => {
      const SlipCode = selectedRowData[0].SlipCode;
      const BankAccount = selectedRowData[0].BankAccount;
      searchByDepositSlip({ SlipCode, BankAccount });
      dispatch({
        type: "UPDATE_FIELD",
        field: "depositSlip",
        value: SlipCode,
      });
      state.depositSlip = SlipCode;
      closeDeposit();
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: depositSearch,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleOnSave = (e: any) => {
    e.preventDefault();
    if (state.Account_ID.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Bank Account is too long!",
        timer: 1500,
      });
    }
    if (state.Account_ID === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide bank account",
        timer: 1500,
      }).then((result) => {
        wait(350).then(() => {
          openDepositBanks();
        });
      });
    }
    if (selectedCollection.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "No selected collection to be deposit",
        timer: 1500,
      });
    }
    if (TotalCashForDeposit.trim() !== total.trim()) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Cash breakdown is not balance",
        timer: 1500,
      });
    }
    if (state.depositMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          updateDepositMutation({
            ...state,
            userCodeConfirmation,
            selectedCollection: JSON.stringify(selectedCollection),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addDepositMutation({
            ...state,
            selectedCollection: JSON.stringify(selectedCollection),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    }
  };

  // useEffect(() => {
  //   if (selectedCollection.length > 0) {
  //     goToRef.current(2);
  //   }
  // }, [selectedCollection]);

  const disabledFields = state.depositMode === "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: "5px",
        }}
      >
        {isLoadingDeposit ? (
          <LoadingButton loading={isLoadingDeposit} />
        ) : (
          <TextField
            label="Search"
            size="small"
            name="search"
            value={state.search}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                return openDeposit((e.target as HTMLInputElement).value);
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
        {disabledFields && (
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
            id="entry-header-save-button"
            onClick={() => {
              handleInputChange({
                target: { name: "depositMode", value: "add" },
              });
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
          id="save-entry-header"
          color="primary"
          variant="contained"
          type="submit"
          onClick={handleOnSave}
          disabled={disabledFields}
          startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
          loading={updateDepositMutationLoading || addDepositMutationLoading}
        >
          Save
        </LoadingButton>
        {!disabledFields && (
          <Button
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            variant="contained"
            startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
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
                  initialState.depositMode = "";
                  setNewStateValue(dispatch, initialState);
                  setSelectedCollection([]);
                  setCollectionForDeposit([]);
                  refetchCash();
                  RefetchDepositSlipCode();
                  refetchCheck();
                  setTableRowsInputValue(defaultCashBreakDown);
                }
              });
            }}
          >
            Cancel
          </Button>
        )}
      </div>
      <br />
      <form
        onKeyDown={(e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault();
            return;
          }
        }}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        {LoadingDepositSlipCode ? (
          <LoadingButton loading={LoadingDepositSlipCode} />
        ) : (
          <FormControl
            variant="outlined"
            size="small"
            disabled={disabledFields}
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
            <InputLabel htmlFor="deposit-id-field">Slip Code</InputLabel>
            <OutlinedInput
              // inputRef={checkBankRef}
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              disabled={disabledFields}
              fullWidth
              label="Slip Code"
              name="depositSlip"
              value={state.depositSlip}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  return handleOnSave(e);
                }
              }}
              readOnly={user?.department !== "UCSMI"}
              id="deposit-id-field"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    disabled={disabledFields}
                    aria-label="search-client"
                    color="secondary"
                    edge="end"
                    onClick={() => {
                      RefetchDepositSlipCode();
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
        <CustomDatePicker
          disabled={disabledFields}
          label="Deposit Date"
          onChange={(value: any) => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "depositdate",
              value: value,
            });
          }}
          value={new Date(state.depositdate)}
          onKeyDown={(e: any) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              const timeout = setTimeout(() => {
                datePickerRef.current?.querySelector("button")?.click();
                clearTimeout(timeout);
              }, 150);
            }
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
          datePickerRef={datePickerRef}
        />
        {isLoadingDepostitBanks ? (
          <LoadingButton loading={isLoadingDepostitBanks} />
        ) : (
          <FormControl
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
            variant="outlined"
            size="small"
            disabled={disabledFields}
          >
            <InputLabel htmlFor="deposit-bank">Bank Account</InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              disabled={disabledFields}
              label="Bank Account"
              name="Account_ID"
              value={state.Account_ID}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  return openDepositBanks(state.Account_ID);
                }
              }}
              id="deposit-bank"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    disabled={disabledFields}
                    aria-label="search-client"
                    color="secondary"
                    edge="end"
                    onClick={() => openDepositBanks(state.Account_ID)}
                  >
                    <PolicyIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
        <TextField
          disabled={disabledFields}
          name="Account_Name"
          onChange={handleInputChange}
          value={state.Account_Name}
          label="Account Name"
          size="small"
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              return handleOnSave(e);
            }
          }}
          InputProps={{
            style: { height: "27px", fontSize: "14px" },
            readOnly: true,
          }}
          sx={{
            flex: 1,
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          }}
        />
        <button
          ref={submitButton}
          style={{ display: "none" }}
          type="submit"
        ></button>
      </form>
      <br />
      <div>
        <div style={{ display: "flex" }}>
          {buttons.map((item, idx) => {
            return (
              <button
                key={idx}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "rgba(51, 51, 51, 0.05)",
                  borderWidth: "0",
                  color: currentStepIndex === idx ? "#7e22ce" : "#333333",
                  cursor: "pointer",
                  display: "inline-block",
                  fontFamily: `"Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif`,
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  listStyle: "none",
                  margin: "0",
                  padding: "10px 12px",
                  textAlign: "center",
                  transition: "all 200ms",
                  verticalAlign: "baseline",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  touchAction: "manipulation",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => goTo(idx)}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(206, 214, 211, 0.18)",
                    transition: "all 200ms",
                    transform: slideAnimation(currentStepIndex, idx),
                  }}
                ></span>
                {item.title}
              </button>
            );
          })}
        </div>
      </div>
      <br />
      <DepositContext.Provider
        value={{
          cashCollection,
          setCashCollection,
          checkCollection,
          setCheckCollection,
          selectedCollection,
          setSelectedCollection,
          collectionForDeposit,
          setCollectionForDeposit,
          tableRows: tableRowsInputValue,
          updateTableRowsInput,
          LoadingCashTable,
          LoadingCheckTable,
          total,
          setTotal,
          TotalCashForDeposit,
          loadingSearchByDepositSlip,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
          id="concatiner"
        >
          {step}
        </div>
      </DepositContext.Provider>
      {ModalDepostitBanks}
      {ModalDeposit}
    </div>
  );
}
function slideAnimation(activeButton: number, idx: number) {
  if (activeButton === idx) {
    return "translateX(100%)";
  } else {
    return "translateX(0%)";
  }
}
function CashCollection() {
  const {
    cashCollection,
    LoadingCashTable,
    setSelectedCollection,
    selectedCollection,
    loadingSearchByDepositSlip,
  } = useContext(DepositContext);

  const table = useRef<any>(null);
  const cashColumns = [
    {
      field: "OR_No",
      headerName: "OR No.",
      minWidth: 170,
    },
    {
      field: "OR_Date",
      headerName: "OR Date",
      minWidth: 170,
    },
    {
      field: "Amount",
      headerName: "Amount",
      minWidth: 150,
      align: "right",
      cellClassName: "super-app-theme--cell",
    },
    {
      field: "Client_Name",
      headerName: "Client Name",
      flex: 1,
      minWidth: 400,
    },
    {
      field: "Temp_OR",
      headerName: "Temp_OR",
      hide: true,
    },
  ];

  useEffect(() => {
    table.current?.setSelectedRows(
      selectedCollection
        .filter((item: any) => item.Check_No === "")
        .map((item: any) => item.TempOR)
    );
  }, [selectedCollection, table, loadingSearchByDepositSlip]);
  return (
    <div
      style={{
        flex: 1,
        marginTop: "10px",
        width: "100%",
        position: "relative",
      }}
    >
      <Box
        style={{
          height: `${
            document.getElementById("concatiner")?.getBoundingClientRect()
              .height
          }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={LoadingCashTable || loadingSearchByDepositSlip}
          columns={cashColumns}
          rows={cashCollection}
          table_id={"Temp_OR"}
          isSingleSelection={true}
          isRowFreeze={true}
          dataSelection={(selection, data, code) => {
            const rowSelected = data.filter(
              (item: any) => item.Temp_OR === selection[0]
            )[0];
            if (rowSelected === undefined || rowSelected.length <= 0) {
              return;
            }

            const newSelected: any = {
              Deposit: "Cash",
              Check_No: "",
              Check_Date: "",
              Bank: "",
              Amount: rowSelected.Amount,
              Name: rowSelected.Client_Name,
              RowIndex: rowSelected.Temp_OR,
              DRCode: rowSelected.DRCode,
              ORNo: rowSelected.OR_No,
              DRRemarks: rowSelected.ORNo,
              IDNo: rowSelected.ID_No,
              TempOR: rowSelected.Temp_OR,
              Short: rowSelected.Short,
            };
            setSelectedCollection((d) => {
              d = [...d, newSelected];
              return d;
            });
          }}
        />
      </Box>
    </div>
  );
}
function CheckCollection() {
  const {
    checkCollection,
    LoadingCheckTable,
    setSelectedCollection,
    selectedCollection,
    setCollectionForDeposit,
    loadingSearchByDepositSlip,
  } = useContext(DepositContext);
  const checkColumns = [
    {
      field: "OR_No",
      headerName: "OR No.",
      minWidth: 170,
    },
    {
      field: "OR_Date",
      headerName: "OR Date",
      minWidth: 170,
    },
    {
      field: "Check_No",
      headerName: "Check No",
      minWidth: 170,
    },
    {
      field: "Check_Date",
      headerName: "Check Date",
      minWidth: 170,
    },
    {
      field: "Amount",
      headerName: "Amount",
      minWidth: 160,
      align: "right",
    },
    {
      field: "Bank_Branch",
      headerName: "Bank/Branch",
      minWidth: 300,
    },
    {
      field: "Client_Name",
      headerName: "Client Name",
      minWidth: 300,
      flex: 1,
    },
    {
      field: "Temp_OR",
      headerName: "Temp_OR",
      hide: true,
    },
  ];
  const table = useRef<any>(null);
  useEffect(() => {
    table.current?.setSelectedRows(
      selectedCollection
        .filter((item: any) => item.Check_No !== "")
        .map((item: any) => item.TempOR)
    );
  }, [selectedCollection, table, loadingSearchByDepositSlip]);
  return (
    <div
      style={{
        marginTop: "10px",
        width: "100%",
        position: "relative",
        flex: 1,
      }}
    >
      <Box
        style={{
          height: `${
            document.getElementById("concatiner")?.getBoundingClientRect()
              .height
          }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={LoadingCheckTable || loadingSearchByDepositSlip}
          columns={checkColumns}
          rows={checkCollection}
          table_id={"Temp_OR"}
          isSingleSelection={true}
          isRowFreeze={true}
          dataSelection={(selection, data, code) => {
            const rowSelected = data.filter(
              (item: any) => item.Temp_OR === selection[0]
            )[0];
            if (rowSelected === undefined || rowSelected.length <= 0) {
              return;
            }
            const newSelected: any = {
              Deposit: "Check",
              Check_No: rowSelected.Check_No,
              Check_Date: rowSelected.Check_Date,
              Bank: rowSelected.Bank_Branch,
              Amount: rowSelected.Amount,
              Name: rowSelected.Client_Name,
              RowIndex: rowSelected.Temp_OR,
              DRCode: rowSelected.DRCode,
              ORNo: rowSelected.OR_No,
              DRRemarks: rowSelected.DRRemarks,
              IDNo: rowSelected.ID_No,
              TempOR: rowSelected.Temp_OR,
              Short: rowSelected.Short,
            };
            setSelectedCollection((d) => {
              d = [...d, newSelected];
              return d;
            });

            const newSelectedCheckForDeposit: any = {
              Bank: rowSelected.Bank_Branch,
              Check_No: rowSelected.Check_No,
              Amount: rowSelected.Amount,
              TempOR: rowSelected.Temp_OR,
            };
            setCollectionForDeposit((d) => {
              d = [...d, newSelectedCheckForDeposit];
              return d;
            });
          }}
        />
      </Box>
    </div>
  );
}
function SelectedCollection() {
  const {
    selectedCollection,
    setSelectedCollection,
    setCollectionForDeposit,
    loadingSearchByDepositSlip,
  } = useContext(DepositContext);

  const table = useRef<any>(null);

  const selectedCollectionColumns = [
    { field: "Deposit", headerName: "Deposit", flex: 1, minWidth: 170 },
    { field: "Check_No", headerName: "Check No", flex: 1, minWidth: 170 },
    {
      field: "Check_Date",
      headerName: "Check Date",
      flex: 1,
      minWidth: 170,
    },
    { field: "Bank", headerName: "Bank/Branch", flex: 1, minWidth: 200 },
    { field: "Amount", headerName: "Amount", flex: 1, minWidth: 170 },
    { field: "Name", headerName: "Client Name", flex: 1, minWidth: 400 },
    // hide
    { field: "RowIndex", headerName: "RowIndex", hide: true },
    { field: "DRCode", headerName: "DRCode", hide: true },
    { field: "ORNo", headerName: "ORNo", hide: true },
    { field: "DRRemarks", headerName: "DRRemarks", hide: true },
    { field: "IDNo", headerName: "IDNo", hide: true },
    { field: "TempOR", headerName: "TempOR", hide: true },
    { field: "Short", headerName: "Short", hide: true },
  ];

  return (
    <div
      style={{
        marginTop: "10px",
        width: "100%",
        position: "relative",
        flex: 1,
      }}
    >
      <Box
        style={{
          height: `${
            document.getElementById("concatiner")?.getBoundingClientRect()
              .height
          }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={loadingSearchByDepositSlip}
          columns={selectedCollectionColumns}
          rows={selectedCollection}
          table_id={"TempOR"}
          isSingleSelection={true}
          isRowFreeze={false}
          dataSelection={(selection, data, code) => {
            const rowSelected = data.filter(
              (item: any) => item.TempOR === selection[0]
            )[0];
            if (rowSelected === undefined || rowSelected.length <= 0) {
              return;
            }

            setSelectedCollection((d) => {
              return d.filter((item: any) => item.TempOR !== selection[0]);
            });
            setCollectionForDeposit((d) => {
              return d.filter((item: any) => item.TempOR !== selection[0]);
            });
          }}
          getCellClassName={(params) => {
            if (params.field === "Deposit" && params.value === "Cash") {
              return "cash";
            } else if (params.field === "Deposit" && params.value === "Check") {
              return "check";
            } else {
              return "";
            }
          }}
        />
      </Box>
    </div>
  );
}
function CollectionForDeposit() {
  const {
    collectionForDeposit,
    tableRows,
    total,
    setTotal,
    TotalCashForDeposit,
  } = useContext(DepositContext);
  const table = useRef<any>(null);
  useEffect(() => {
    setTotal(
      tableRows
        .reduce((accumulator, currentValue) => {
          return (
            accumulator + parseFloat(currentValue.value3.replace(/,/g, ""))
          );
        }, 0.0)
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
    );
  }, [tableRows, setTotal]);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        height: "auto ",
      }}
    >
      <fieldset
        style={{
          flexDirection: "column",
          gap: "10px",
          padding: "15px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          width: "60%",
          position: "relative",
        }}
      >
        <legend>Checks</legend>
        <div style={{ marginTop: "10px", width: "100%", position: "relative" }}>
          <Box
            style={{
              height: "530px",
              width: "100%",
              overflowX: "scroll",
              position: "absolute",
            }}
          >
            <Table
              ref={table}
              isLoading={false}
              checkboxSelection={false}
              columns={[
                {
                  field: "Bank",
                  headerName: "Bank/Branch",
                  flex: 1,
                  minWidth: 170,
                },
                {
                  field: "Check_No",
                  headerName: "Check No",
                  flex: 1,
                  minWidth: 170,
                },
                {
                  field: "Amount",
                  headerName: "Amount",
                  flex: 1,
                  minWidth: 170,
                },
              ]}
              rows={collectionForDeposit}
              table_id={"TempOR"}
              isSingleSelection={true}
              isRowFreeze={false}
              isRowSelectable={() => false}
              footerChildren={() => {
                return <FooterCollectionForDepositCheck />;
              }}
              footerPaginationPosition={"left-right"}
              showFooterSelectedCount={false}
            />
          </Box>
        </div>
      </fieldset>
      <fieldset
        style={{
          flexDirection: "column",
          gap: "10px",
          padding: "15px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          alignSelf: "flex-end",
          display: "flex",
          width: "40%",
        }}
      >
        <legend
          style={{
            color: total === TotalCashForDeposit ? "green" : "#ec4899",
          }}
        >
          Cash ( {TotalCashForDeposit} )
        </legend>
        <table
          style={{
            border: "2px solid black",
            borderCollapse: "collapse",
            marginTop: "10px",
            width: "100%",
          }}
        >
          <colgroup>
            <col style={{ width: "140px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "140px" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                borderBottom: "2px solid black",
                fontSize: "14px",
              }}
            >
              <th
                style={{
                  borderRight: "2px solid black",
                }}
              >
                Denominations
              </th>
              <th
                style={{
                  borderRight: "2px solid black",
                }}
              >
                QTY
              </th>
              <th
                style={{
                  borderRight: "2px solid black",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((items, idx) => {
              return (
                <TrComponent
                  key={idx}
                  value1={items.value1}
                  value2={items.value2}
                  value3={items.value3}
                  idx={idx}
                />
              );
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                borderTop: "2px solid black",
                height: "50px",
              }}
            >
              <td colSpan={3}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "0 10px  ",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "250px",
                    }}
                  >
                    <span style={{ fontSize: "14px", marginRight: "5px" }}>
                      Total Cash Deposit:
                    </span>
                    <input
                      style={{
                        fontWeight: "bold",
                        border: "1px solid black",
                        textAlign: "right",
                        fontSize: "15px",
                        width: "117px",
                      }}
                      value={total}
                      onChange={(e) => {
                        setTotal(e.target.value);
                      }}
                      readOnly={true}
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </fieldset>
    </div>
  );
}
function TrComponent({ value1, value2, value3, idx }: any) {
  const { updateTableRowsInput } = useContext(DepositContext);

  const [input1, setInput1] = useState(value1);
  const [input2, setInput2] = useState(value2);
  const [input3, setInput3] = useState(value3);
  const InputStyle: CSSProperties = {
    textAlign: "right",
    height: "28px",
    borderRight: "none",
    borderLeft: "none",
    borderTop: "none",
    outline: "none",
    borderBottom: "1px solid #cbd5e1",
    padding: "0 8px",
    width: "100%",
  };

  return (
    <tr>
      <td
        style={{
          borderRight: "2px solid black",
        }}
      >
        <input
          type="text"
          style={InputStyle}
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          readOnly={true}
        />
      </td>
      <td
        style={{
          borderRight: "2px solid black",
          overflow: "hidden",
        }}
      >
        <input
          style={InputStyle}
          value={input2}
          onChange={(e) => {
            let input1Value = input1;
            setInput2(e.target.value);
            if (input1.includes(",")) {
              input1Value = input1.replace(/,/g, "").toString();
            }
            const valueFor3 = (
              parseFloat(input1Value) *
              (isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            setInput3(valueFor3);

            updateTableRowsInput(
              {
                value1,
                value2: e.target.value,
                value3: valueFor3,
              },
              idx
            );
          }}
        />
      </td>
      <td
        style={{
          borderRight: "2px solid black",
        }}
      >
        <input
          type="text"
          style={InputStyle}
          value={input3}
          onChange={(e) => setInput3(e.target.value)}
          readOnly={true}
        />
      </td>
    </tr>
  );
}
function FooterCollectionForDepositCheck() {
  const { collectionForDeposit } = useContext(DepositContext);
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        justifyContent: "flex-end",
        borderTop: "2px solid #e2e8f0",
      }}
    >
      <strong>
        Total:{" "}
        {collectionForDeposit
          .reduce((sum: number, obj: any) => {
            return sum + parseFloat(obj.Amount.replace(/,/g, ""));
          }, 0)
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </strong>
    </Box>
  );
}
function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
