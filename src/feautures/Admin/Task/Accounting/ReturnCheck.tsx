import React, {
  useReducer,
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
} from "react";
import {
  TextField,
  Button,
  FormControl,
  InputAdornment,
  IconButton,
  InputLabel,
  OutlinedInput,
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import CustomDatePicker from "../../../../components/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery, UseMutateFunction } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AxiosResponse } from "axios";
import { wait } from "@testing-library/user-event/dist/utils";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import { flushSync } from "react-dom";
import Table from "../../../../components/Table";
import useMultipleComponent from "../../../../hooks/useMultipleComponent";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import {
  generateRandomClass,
  keyBoardSelectionTable,
} from "../../../../components/ModalWithTable";
import PageHelmet from "../../../../components/Helmet";

interface ReturnCheckContextType {
  checkCollection: Array<any>;
  checkSelectedCollection: Array<any>;
  accountingEntry: Array<any>;
  LoadingCheckList: boolean;
  addReturnCheckLoading: boolean;
  tableSelectedCheck: React.MutableRefObject<any>;
  tableAccountingEntryCheck: React.MutableRefObject<any>;
  tableSelectedCheckReturn: React.MutableRefObject<any>;
  dispatchModal: React.Dispatch<any>;
  modalSelectedMutate: UseMutateFunction<
    AxiosResponse<any, any>,
    unknown,
    any,
    unknown
  >;
  getSearchReturnCheckInfoLoading: boolean;
  modalSelectedCheckLoading: boolean;
  debitModalCollection: Array<any>;
  myAxios: any;
  user: any;
  setCheckCollection: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  openSelectedCheckModal: boolean;
  setOpenSelectedCheckModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentStepIndex: number;
  fireModal: (onConfirmCallback: any) => void;
  stateModal: any;
  datePickerModalRef: React.RefObject<HTMLElement>;
  setAccountingEntry: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  handleModalInputChange: (e: any) => void;
  LoadSelectedCheckInSelectedTable: (selectedRowValue: any) => void;
  setCheckSelectedCollection: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
}
const initialState = {
  RefNo: "",
  Sub_RefNo: "",
  DateReturn: new Date(),
  Explanation: "Returned Checks",
  search: "",
  returnMode: "",
  searchCheckList: "",
};
const initialModalState = {
  ModalDateReturn: new Date().toLocaleDateString(),
  ReturnReason: "",
  AccountName: "",
  AccountID: "",
  Amount: "",
  SubAccount: "",
  BranchCode: "",
  IDNo: "",
  Short: "",
  Check_No: "",
  TempID: "",
  updateAmount: "",
  updateAmountID: "",
  depoBankName: "",
  depoBankIdentity: "",
  subSelectedChecks: {},
};

const ReturnCheckContext = createContext<ReturnCheckContextType>({
  checkCollection: [],
  checkSelectedCollection: [],
  accountingEntry: [],
  LoadingCheckList: false,
  addReturnCheckLoading: false,
  tableSelectedCheck: { current: {} },
  tableAccountingEntryCheck: { current: {} },
  tableSelectedCheckReturn: { current: {} },
  dispatchModal: () => { },
  modalSelectedMutate: () => { },
  getSearchReturnCheckInfoLoading: false,
  modalSelectedCheckLoading: false,
  debitModalCollection: [],
  myAxios: {},
  user: {},
  setCheckCollection: () => { },
  openSelectedCheckModal: false,
  setOpenSelectedCheckModal: () => { },
  currentStepIndex: 0,
  fireModal: () => { },
  stateModal: {},
  datePickerModalRef: { current: null },
  setAccountingEntry: () => { },
  handleModalInputChange: () => { },
  LoadSelectedCheckInSelectedTable: () => { },
  setCheckSelectedCollection: () => { },
});
const buttons = [
  {
    title: "Selected Check",
    index: 0,
  },
  {
    title: "Selected Check to be Returned",
    index: 1,
  },
  {
    title: "Accounting Entry",
    index: 2,
  },
];
const modalDebitEntryColumn = [
  {
    field: "CRCode",
    headerName: "Code",
    minWidth: 140,
  },
  {
    field: "CRTitle",
    headerName: "Account Name",
    minWidth: 300,
    flex: 1,
  },
  {
    field: "Credit",
    headerName: "Amount",
    minWidth: 140,
    align: "right",
  },
  {
    field: "CRLoanID",
    headerName: "ID No.",
    minWidth: 140,
  },
  {
    field: "CRLoanName",
    headerName: "Identity",
    minWidth: 300,
    flex: 1,
  },
  {
    field: "SubAcctCode",
    headerName: "Sub Account",
    minWidth: 160,
    flex: 1,
  },
  {
    field: "SubAcctName",
    headerName: "Sub Account Name",
    minWidth: 300,
    flex: 1,
  },
  {
    field: "TempID",
    headerName: "Sub Account Name",
    hide: true,
  },
];

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
export default function ReturnCheck() {
  const { ConfirmationModal, fireModal } = useConfirmation();
  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [stateModal, dispatchModal] = useReducer(reducer, initialModalState);
  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <SelectedCheck />,
    <SelectedCheckToBeReturn />,
    <AccountingEntry />,
  ]);
  const [checkCollection, setCheckCollection] = useState<GridRowSelectionModel>(
    []
  );
  const [checkSelectedCollection, setCheckSelectedCollection] =
    useState<GridRowSelectionModel>([]);
  const [accountingEntry, setAccountingEntry] = useState<GridRowSelectionModel>(
    []
  );
  const [debitModalCollection, setDebitModalCollection] =
    useState<GridRowSelectionModel>([]);
  const [openSelectedCheckModal, setOpenSelectedCheckModal] = useState(false);
  const datePickerRef = useRef<HTMLElement>(null);
  const reloadIDButtonRef = useRef<HTMLButtonElement>(null);
  const datePickerModalRef = useRef<HTMLElement>(null);
  const explanationInputRef = useRef<HTMLInputElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const searchReturnChecks = useRef<HTMLInputElement>(null);
  const tableSelectedCheck = useRef<any>(null);
  const tableAccountingEntryCheck = useRef<any>(null);
  const tableSelectedCheckReturn = useRef<any>(null);

  const { isLoading: LoadingReturnCheckLoading, refetch: RefetchReturnCheck } =
    useQuery({
      queryKey: "return-check-id",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/get-new-return-check-id`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const response = data as any;

        dispatch({
          type: "UPDATE_FIELD",
          field: "RefNo",
          value: response.data.returnCheckID[0].return_check_id,
        });
        dispatch({
          type: "UPDATE_FIELD",
          field: "Sub_RefNo",
          value: response.data.returnCheckID[0].return_check_id,
        });
      },
    });
  const { isLoading: LoadingCheckList, refetch: refetchCheckList } = useQuery({
    queryKey: "check-list",
    queryFn: async () =>
      await myAxios.get(
        `/task/accounting/get-check-list?checkListSearch=${state.searchCheckList}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      setCheckCollection(response.data.checkList);
    },
  });
  const { isLoading: modalSelectedCheckLoading, mutate: modalSelectedMutate } =
    useMutation({
      mutationKey: "selected-check-modal",
      mutationFn: async (variables: any) =>
        myAxios.post(
          "/task/accounting/get-modal-return-check-data",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (res) => {
        const response = res as any;
        const credit = response.data.credit[0];
        const debit = response.data.debit[0];
        console.log(response)
        setDebitModalCollection(response.data.debit);

        dispatchModal({
          type: "UPDATE_FIELD",
          field: "AccountName",
          value: credit.Acct_Title,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "AccountID",
          value: credit.Account_ID,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "IDNo",
          value: debit.ID_No,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "Short",
          value: debit.CRLoanName,
        });

        dispatchModal({
          type: "UPDATE_FIELD",
          field: "depoBankName",
          value: credit.IDNo,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "depoBankIdentity",
          value: credit.Identity,
        });

        dispatchModal({
          type: "UPDATE_FIELD",
          field: "Short",
          value: debit.CRLoanName,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "Short",
          value: debit.CRLoanName,
        });

        dispatchModal({
          type: "UPDATE_FIELD",
          field: "SubAccount",
          value: debit.SubAcctName,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "BranchCode",
          value: debit.SubAcctCode,
        });
        dispatchModal({
          type: "UPDATE_FIELD",
          field: "Amount",
          value: response.data.debit
            .reduce(
              (sum: any, obj: any) =>
                sum + parseFloat(obj.Credit.replace(/,/g, "")),
              0
            )
            .toLocaleString("en-US", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        });
        setOpenSelectedCheckModal(true);
      },
    });
  const {
    isLoading: getSearchReturnCheckInfoLoading,
    mutate: getSearchReturnCheckInfoMutate,
  } = useMutation({
    mutationKey: "selected-search-return-check",
    mutationFn: async (variables: any) =>
      myAxios.post(
        "/task/accounting/get-search-selected-checks-information",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const selectedRow = response.data.selected[0];

      const selectedChecks = response.data.selected.map((itm: any) => {
        itm.Amount = parseFloat(
          itm.Amount.toString().replace(/,/g, "")
        ).toLocaleString("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return itm;
      });
      setAccountingEntry(response.data.accountingEntry);
      setCheckSelectedCollection(selectedChecks);
      setNewStateValue(dispatch, {
        ...state,
        ...{
          RefNo: selectedRow.RC_No,
          Sub_RefNo: selectedRow.RC_No,
          DateReturn: selectedRow.RC_Date,
          Explanation: selectedRow.Explanation,
          returnMode: "edit",
        },
      });
    },
  });
  const { isLoading: addReturnCheckLoading, mutate: addReturnCheckMutate } =
    useMutation({
      mutationKey: "selected-check-modal",
      mutationFn: async (variables: any) =>
        myAxios.post("/task/accounting/add-return-check", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess: (res) => {
        const response = res as any;

        if (response.data.isClearableError) {
          RefetchReturnCheck();
          refetchCheckList();
          setCheckSelectedCollection([]);
          setAccountingEntry([]);
          dispatch({
            type: "UPDATE_FIELD",
            field: "returnMode",
            value: "",
          });
          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            timer: 1500,
          });
        }

        return Swal.fire({
          position: "center",
          icon: "warning",
          title: response.data.message,
          timer: 1500,
        });
      },
    });
  const {
    ModalComponent: ReturnChecksModal,
    openModal: openReturnChecksModal,
    isLoading: isLoadingReturnChecksModal,
    closeModal: closeReturnChecksModal,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-return-checks",
      queryUrlName: "searchReturnChecks",
    },
    columns: [
      { field: "RC_Date", headerName: "Date", width: 150 },
      { field: "RC_No", headerName: "Slip Code", width: 170 },
      {
        field: "Explanation",
        headerName: "Bank Account",
        flex: 1,
      },
    ],
    queryKey: "return-checks-search",
    uniqueId: "RC_No",
    responseDataKey: "returnCheckSearch",
    onSelected: (selectedRowData) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "returnMode",
        value: "edit",
      });
      getSearchReturnCheckInfoMutate({
        RC_No: selectedRowData[0].RC_No,
      });
      closeReturnChecksModal();
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: searchReturnChecks,
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleModalInputChange = (e: any) => {
    const { name, value } = e.target;
    dispatchModal({ type: "UPDATE_FIELD", field: name, value });
  };
  function handleOnSave(e: any) {
    e.preventDefault();

    if (state.Explanation === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide an explanation",
        timer: 1500,
      }).then((result) => {
        wait(350).then(() => {
          explanationInputRef.current?.focus();
        });
      });
    }
    if (checkSelectedCollection.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide return entry!",
        timer: 1500,
      });
    }
    const credit = accountingEntry
      .reduce(
        (sum: any, obj: any) => sum + parseFloat(obj.Credit.replace(/,/g, "")),
        0
      )
      .toLocaleString("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const debit = accountingEntry
      .reduce(
        (sum: any, obj: any) => sum + parseFloat(obj.Debit.replace(/,/g, "")),
        0
      )
      .toLocaleString("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    if (credit !== debit) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Accounting entry must be equal in Debit and Credit amount!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          goTo(3);
        });
      });
    }

    if (state.returnMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addReturnCheckMutate({
            selected: checkSelectedCollection,
            accountingEntry,
            RefNo: state.RefNo,
            Sub_RefNo: state.Sub_RefNo,
            DateReturn: state.DateReturn,
            Explanation: state.Explanation,
            ModalDateReturn: stateModal.ModalDateReturn,
            ReturnReason: stateModal.ReturnReason,
            AccountName: stateModal.AccountName,
            AccountID: stateModal.AccountID,
            Amount: stateModal.Amount,
            SubAccount: stateModal.SubAccount,
            BranchCode: stateModal.BranchCode,
            IDNo: stateModal.IDNo,
            Short: stateModal.Short,
            Check_No: stateModal.Check_No,
            isUpdated: state.returnMode === "edit",
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addReturnCheckMutate({
            selected: checkSelectedCollection,
            accountingEntry,
            RefNo: state.RefNo,
            Sub_RefNo: state.Sub_RefNo,
            DateReturn: state.DateReturn,
            Explanation: state.Explanation,
            ModalDateReturn: stateModal.ModalDateReturn,
            ReturnReason: stateModal.ReturnReason,
            AccountName: stateModal.AccountName,
            AccountID: stateModal.AccountID,
            Amount: stateModal.Amount,
            SubAccount: stateModal.SubAccount,
            BranchCode: stateModal.BranchCode,
            IDNo: stateModal.IDNo,
            Short: stateModal.Short,
            Check_No: stateModal.Check_No,
            isUpdated: state.returnMode === "edit",
          });
        },
      });
    }
  }
  function LoadSelectedCheckInSelectedTable(selectedRowValue: any) {
    const selectedCheck = {
      Temp_OR: `${selectedRowValue.Official_Receipt}${(
        checkCollection.length + 1
      )
        .toString()
        .padStart(2, "0")}`,
      OR_NO: selectedRowValue.Official_Receipt,
      OR_Date: selectedRowValue.Date_OR,
      DepoSlip: selectedRowValue.DepoSlip,
      DepoDate: selectedRowValue.DepoDate,
      Check_No: selectedRowValue.Check_No,
      Check_Date: selectedRowValue.Check_Date,
      Amount: selectedRowValue.Amount,
      Bank: selectedRowValue.Bank,
      Bank_Account: selectedRowValue.BankAccount,
      Reason: stateModal.ReturnReason,
      Return_Date: new Date(stateModal.ModalDateReturn).toLocaleDateString(
        "en-US",
        {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }
      ),
      TempID: selectedRowValue.TempID,
    };
    setCheckSelectedCollection((d: any) => {
      return [...d, selectedCheck];
    });
  }

  const handleAccept = () => {
    const totalDebit = debitModalCollection
      .reduce(
        (sum: any, obj: any) => sum + parseFloat(obj.Credit.replace(/,/g, "")),
        0
      )
      .toLocaleString("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    if (stateModal.Amount !== totalDebit) {
      flushSync(() => {
        setOpenSelectedCheckModal(false);
      });
      return Swal.fire({
        text: "Debit must eequal to Credit!",
        icon: "warning",
        showCancelButton: false,
        timer: 1500,
        position: "center",
      });
    }
    if (tableSelectedCheckReturn.current?.getSelectedRows()) {
      const selectRow = tableSelectedCheckReturn.current?.getSelectedRows();
      const selected = selectRow[selectRow.length - 1];
      setCheckSelectedCollection((d) => {
        d = d.filter((item: any) => item.TempID !== selected.TempID);
        return d;
      });
      setAccountingEntry((d) => {
        d = d.filter((item: any) => item.Check_No !== selected.Check_No);
        return d;
      });

      LoadSelectedCheckInSelectedTable({
        ...selected,
        Official_Receipt: selected.OR_NO,
        Date_OR: selected.OR_Date,
        BankAccount: selected.Bank_Account,
      });
    } else {
      const selectRow = tableSelectedCheck.current?.getSelectedRows();
      const selected = selectRow[selectRow.length - 1];

      LoadSelectedCheckInSelectedTable(selected);
    }

    function generateTempId(array: Array<any>) {
      const lastItem =
        array.length > 0 ? array[array.length - 1].TempID : "000";
      const numericPart = (parseInt(lastItem.match(/\d+/)[0]) + 1)
        .toString()
        .padStart(3, "0");
      return numericPart;
    }
    //debit
    debitModalCollection.forEach((item: any) => {
      setAccountingEntry((d: any) => {
        return [
          ...d,
          {
            Code: item.CRCode,
            AccountName: item.CRTitle,
            Debit: item.Credit,
            Credit: "0.00",
            IDNo: item.ID_No,
            Identity: item.Short,
            SubAcct: item.SubAcctCode,
            SubAcctName: item.SubAcctName,
            Check_No: stateModal.subSelectedChecks.Check_No,
            Bank: stateModal.subSelectedChecks.Bank,
            Check_Date: stateModal.subSelectedChecks.Check_Date,
            Check_Return: stateModal.ModalDateReturn,
            Check_Reason: stateModal.ReturnReason,
            PK: stateModal.subSelectedChecks.Check_No,
            DepoDate: stateModal.subSelectedChecks.DepoDate,
            Date_Collection: stateModal.subSelectedChecks.Date_Collection,
            TempID: generateTempId(d),
          },
        ];
      });
    });

    //cash
    console.log(stateModal)
    setAccountingEntry((d: any) => {
      d = [
        ...d,
        {
          Code: stateModal.AccountID,
          AccountName: stateModal.AccountName,
          Debit: "0.00",
          Credit: stateModal.Amount,
          IDNo: stateModal.depoBankName,
          Identity: stateModal.depoBankIdentity,
          SubAcct: stateModal.BranchCode,
          SubAcctName: stateModal.SubAccount,
          Check_No: stateModal.subSelectedChecks.Check_No,
          Bank: stateModal.subSelectedChecks.Bank,
          Check_Date: stateModal.subSelectedChecks.Check_Date,
          Check_Return: stateModal.ModalDateReturn,
          Check_Reason: stateModal.ReturnReason,
          PK: stateModal.subSelectedChecks.Check_No,
          DepoDate: stateModal.subSelectedChecks.DepoDate,
          Date_Collection: stateModal.subSelectedChecks.Date_Collection,
          TempID: generateTempId(d),
        },
      ];
      return d;
    });

    setOpenSelectedCheckModal(false);
    tableSelectedCheck.current?.removeSelection();
    tableSelectedCheckReturn.current?.removeSelection();
  };

  const isFieldDisable = state.returnMode === "";

  return (
    <>
      <PageHelmet title="Returned Check" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",

        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
          }}
        >
          {isLoadingReturnChecksModal ? (
            <LoadingButton loading={isLoadingReturnChecksModal} />
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
                  return openReturnChecksModal(
                    (e.target as HTMLInputElement).value
                  );
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

          {state.returnMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "returnMode",
                  value: "add",
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
            disabled={state.returnMode === ""}
            startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
            loading={addReturnCheckLoading}
          >
            {state.returnMode === "edit" ? "Update" : "Save"}
          </LoadingButton>
          {state.returnMode !== "" && (
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
                    refetchCheckList();
                    setCheckSelectedCollection([]);
                    setAccountingEntry([]);
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "returnMode",
                      value: "",
                    });
                    setNewStateValue(dispatch, initialState);
                    RefetchReturnCheck();
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
          {LoadingReturnCheckLoading ? (
            <LoadingButton loading={LoadingReturnCheckLoading} />
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
              disabled={isFieldDisable}
            >
              <InputLabel htmlFor="return-check-id-field">Ref. No.</InputLabel>
              <OutlinedInput
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                // inputRef={checkBankRef}
                disabled={isFieldDisable}
                fullWidth
                label="Ref. No."
                name="RefNo"
                value={state.RefNo}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    return handleOnSave(e);
                  }
                }}
                readOnly={user?.department !== "UCSMI"}
                id="return-check-id-field"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      ref={reloadIDButtonRef}
                      disabled={isFieldDisable}
                      aria-label="search-client"
                      color="secondary"
                      edge="end"
                      onClick={() => {
                        RefetchReturnCheck();
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
            disabled={isFieldDisable}
            label="Date Returned"
            onChange={(value: any) => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "DateReturn",
                value: value,
              });
            }}
            value={new Date(state.DateReturn)}
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
          <TextField
            disabled={isFieldDisable}
            fullWidth
            label="Explanation"
            size="small"
            name="Explanation"
            value={state.Explanation}
            onChange={handleInputChange}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                return;
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
            inputRef={explanationInputRef}
          />
          <button
            ref={submitButton}
            style={{ display: "none" }}
            type="submit"
          ></button>
        </form>
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
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
          <div>
            Total Amount:{" "}
            <strong>
              {accountingEntry
                .reduce(
                  (sum: any, obj: any) =>
                    sum + parseFloat(obj.Credit.replace(/,/g, "")),
                  0
                )
                .toLocaleString("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </strong>
          </div>
        </div>
        <br />
        <ReturnCheckContext.Provider
          value={{
            checkCollection,
            checkSelectedCollection,
            accountingEntry,
            LoadingCheckList,
            addReturnCheckLoading,
            tableSelectedCheck,
            dispatchModal,
            modalSelectedMutate,
            getSearchReturnCheckInfoLoading,
            debitModalCollection,
            tableAccountingEntryCheck,
            tableSelectedCheckReturn,
            modalSelectedCheckLoading,
            myAxios,
            user,
            setCheckCollection,
            openSelectedCheckModal,
            setOpenSelectedCheckModal,
            currentStepIndex,
            fireModal,
            stateModal,
            datePickerModalRef,
            setAccountingEntry,
            handleModalInputChange,
            LoadSelectedCheckInSelectedTable,
            setCheckSelectedCollection,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
            id="container"
          >
            {step}
            {ReturnChecksModal}
            <Modal
              open={openSelectedCheckModal}
              onClose={() => {
                setOpenSelectedCheckModal(false);
                tableSelectedCheck.current?.removeSelection();
                tableSelectedCheckReturn.current?.removeSelection();
              }}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              onKeyDown={(e) => {
                if (
                  currentStepIndex === 1 &&
                  (e.code === "Backspace" || e.code === "Delete")
                ) {
                  setOpenSelectedCheckModal(false);

                  fireModal({
                    onConfirmCallback: () => {
                      setCheckSelectedCollection((d) =>
                        d.filter((itm: any) => {
                          return (
                            itm.TempID.toString() !== stateModal.TempID.toString()
                          );
                        })
                      );
                      setAccountingEntry((d) => {
                        return d.filter((itm: any) => {
                          return (
                            itm.Check_No.split("-")[0] !==
                            stateModal.Check_No.toString()
                          );
                        });
                      });
                    },

                    onCancelCallback: () => {
                      setOpenSelectedCheckModal(false);
                      tableSelectedCheck.current?.removeSelection();
                      tableSelectedCheckReturn.current?.removeSelection();
                    },
                  });
                }
                if (
                  currentStepIndex === 0 &&
                  (e.code === "Enter" || e.code === "NumpadEnter")
                ) {
                  handleAccept();
                }
              }}
            >
              <Box
                sx={{
                  position: "absolute" as "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  bgcolor: "background.paper",
                  p: 3,
                  boxSizing: "border-box",
                }}
              >
                <IconButton
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                  }}
                  // disabled={!addNew}
                  aria-label="search-client"
                  onClick={() => {
                    setOpenSelectedCheckModal(false);
                    tableSelectedCheck.current?.removeSelection();
                    tableSelectedCheckReturn.current?.removeSelection();
                    dispatchModal({
                      type: "UPDATE_FIELD",
                      field: "TempID",
                      value: "",
                    });
                    dispatchModal({
                      type: "UPDATE_FIELD",
                      field: "subSelectedChecks",
                      value: {},
                    });
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography id="modal-modal-title" variant="body1" component="h2">
                  Return Detail and Accounting Entry (Check No.:
                  <strong>{stateModal.Check_No}</strong>)
                </Typography>
                <fieldset
                  style={{
                    display: "flex",
                    columnGap: "10px",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    marginTop: "20px",
                  }}
                >
                  <legend style={{ fontSize: "14px" }}>Return Detail</legend>
                  <FormControl
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      ".MuiFormLabel-root": {
                        fontSize: "14px",
                        background: "white",
                        zIndex: 99,
                        padding: "0 3px",
                      },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                    }}
                  >
                    <InputLabel id="label-selection-reason">
                      Return Reason
                    </InputLabel>
                    <Select
                      labelId="label-selection-reason"
                      value={stateModal.ReturnReason}
                      name="ReturnReason"
                      onChange={handleModalInputChange}
                      autoWidth
                      sx={{
                        height: "27px",
                        fontSize: "14px",
                      }}
                    >
                      <MenuItem value="DAIF">DAIF</MenuItem>
                      <MenuItem value={"DAUD"}>DAUD</MenuItem>
                      <MenuItem value={"AC"}>ACCOUNT CLOSED</MenuItem>
                      <MenuItem value={"SPO"}>SPO</MenuItem>
                      <MenuItem value={"SD"}>SIGNATURE DIFFERS</MenuItem>
                    </Select>
                  </FormControl>
                  <CustomDatePicker
                    fullWidth={true}
                    label="Date Returned"
                    onChange={(value: any) => {
                      dispatchModal({
                        type: "UPDATE_FIELD",
                        field: "ModalDateReturn",
                        value: value.toLocaleDateString(),
                      });
                    }}
                    value={new Date(stateModal.ModalDateReturn)}
                    onKeyDown={(e: any) => {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        const timeout = setTimeout(() => {
                          datePickerModalRef.current
                            ?.querySelector("button")
                            ?.click();
                          clearTimeout(timeout);
                        }, 150);
                      }
                    }}
                    datePickerRef={datePickerModalRef}
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
                </fieldset>
                <fieldset
                  style={{
                    display: "flex",
                    columnGap: "10px",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    marginTop: "5px",
                  }}
                >
                  <legend style={{ fontSize: "14px" }}>Credit Entry</legend>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      width: "100%",
                    }}
                  >
                    <TextField
                      size="small"
                      label="Account Name"
                      name="AccountName"
                      value={stateModal.Short}
                      onChange={handleModalInputChange}
                      InputProps={{
                        readOnly: true,
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      sx={{
                        flex: 1,
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                      }}
                    />
                    <TextField
                      size="small"
                      label="Account ID"
                      name="AccountID"
                      value={stateModal.AccountID}
                      onChange={handleModalInputChange}
                      InputProps={{
                        readOnly: true,
                        style: {
                          height: "27px",
                          fontSize: "14px",
                          width: "200px",
                        },
                      }}
                      sx={{
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                      }}
                    />
                    <TextField
                      size="small"
                      label="Amount"
                      name="Amount"
                      value={stateModal.Amount}
                      onChange={handleModalInputChange}
                      InputProps={{
                        readOnly: true,
                        style: {
                          height: "27px",
                          fontSize: "14px",
                          width: "200px",
                        },
                      }}
                      sx={{
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                      }}
                    />
                    <TextField
                      size="small"
                      label="Sub Account"
                      name="SubAccount"
                      value={stateModal.SubAccount}
                      onChange={handleModalInputChange}
                      InputProps={{
                        readOnly: true,
                        style: {
                          height: "27px",
                          fontSize: "14px",
                          width: "200px",
                        },
                      }}
                      sx={{
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
                      }}
                    />
                  </div>
                </fieldset>
                <fieldset
                  style={{
                    display: "flex",
                    columnGap: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    marginTop: "5px",
                  }}
                >
                  <legend style={{ fontSize: "14px" }}>Debit Entry</legend>
                  <div
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      position: "relative",
                      height: "300px",
                    }}
                  >
                    <div
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      <Box
                        style={{
                          height: "300px",
                          width: "100%",
                          overflowX: "scroll",
                          position: "absolute",
                        }}
                      >
                        <Table
                          isLoading={modalSelectedCheckLoading}
                          columns={modalDebitEntryColumn}
                          rows={debitModalCollection}
                          table_id={"TempID"}
                          isSingleSelection={true}
                          isRowFreeze={true}
                          checkboxSelection={false}
                          footerChildren={() => <DebitFooterComponent />}
                          footerPaginationPosition="left-right"
                          showFooterSelectedCount={false}
                        />
                      </Box>
                    </div>
                  </div>
                </fieldset>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "20px",
                    marginTop: "15px",
                  }}
                >
                  <div>
                    <Button
                      color="success"
                      variant="contained"
                      onClick={handleAccept}
                      style={{ marginRight: "10px" }}
                      startIcon={<CheckCircleOutlineIcon />}
                      sx={{
                        height: "30px",
                        fontSize: "14px",
                        textTransform: "none",
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      color="error"
                      variant="contained"
                      onClick={() => {
                        setOpenSelectedCheckModal(false);
                        tableSelectedCheck.current?.removeSelection();
                        tableSelectedCheckReturn.current?.removeSelection();

                        dispatchModal({
                          type: "UPDATE_FIELD",
                          field: "TempID",
                          value: "",
                        });
                        dispatchModal({
                          type: "UPDATE_FIELD",
                          field: "subSelectedChecks",
                          value: {},
                        });
                        // setIsSelectedFromTobeReturnTable(false);
                      }}
                      startIcon={<NotInterestedIcon />}
                      sx={{
                        height: "30px",
                        fontSize: "14px",
                        textTransform: "none",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Box>
            </Modal>
            <ConfirmationModal />
          </div>
        </ReturnCheckContext.Provider>
      </div>
    </>

  );
}

const styles: any = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "5px",
    textAlign: "center",
    width: "300px",
  },
  button: {
    margin: "0 10px",
    background: "white",
    fontFamily: '"Roboto", sans-serif',
    color: "#475569",
    padding: "5px 10px",
  },
};

const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => { });
  const [onCancel, setOnCancel] = useState(() => () => { });

  const fireModal = (p: any) => {
    setIsOpen(true);
    setOnConfirm(() => p.onConfirmCallback);
    setOnCancel(() => p.onCancelCallback);
  };

  const closeModal = () => {
    onCancel();
    setIsOpen(false);
  };

  const confirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const ConfirmationModal = () => {
    const okRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (isOpen) {
        okRef.current?.focus();
      }
    }, []);
    if (!isOpen) return null;

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <p style={{ color: "black" }}>Do you want to proceed?</p>
          <button ref={okRef} onClick={confirm} style={styles.button}>
            Yes
          </button>
          <button onClick={closeModal} style={styles.button}>
            No
          </button>
        </div>
      </div>
    );
  };

  return {
    ConfirmationModal,
    fireModal,
  };
};
function SelectedCheck() {
  const {
    checkCollection,
    LoadingCheckList,
    dispatchModal,
    modalSelectedMutate,
    checkSelectedCollection,
    getSearchReturnCheckInfoLoading,
    tableSelectedCheck,
    myAxios,
    setCheckCollection,
    user,
  } = useContext(ReturnCheckContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkColumns = [
    {
      field: "DepoSlip",
      headerName: "Deposit Slip",
      minWidth: 140,
    },
    {
      field: "DepoDate",
      headerName: "Deposit Date",
      minWidth: 140,
    },
    {
      field: "Check_No",
      headerName: "Check No",
      minWidth: 140,
    },
    {
      field: "Check_Date",
      headerName: "Check Date",
      minWidth: 140,
    },
    {
      field: "Amount",
      headerName: "Amount",
      minWidth: 160,
      align: "right",
    },
    {
      field: "Bank",
      headerName: "Bank",
      minWidth: 300,
    },
  ];

  const { isLoading: LoadingCheckListOnSearch, mutate } = useMutation({
    mutationKey: "check-list",
    mutationFn: async (variable: any) =>
      await myAxios.get(
        `/task/accounting/get-check-list?checkListSearch=${variable.searchCheckList}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      setCheckCollection(response.data.checkList);
    },
  });
  const mainId = generateRandomClass();

  return (
    <React.Fragment>
      <TextField
        inputRef={inputRef}
        label="Search by check no."
        name="searchCheckList"
        onKeyDown={(e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            mutate({
              searchCheckList: inputRef.current?.value,
            });
          }
          // if(e.code === 'ArrowDown'){
          //   alert('qweqwe')
          // }

          keyBoardSelectionTable(
            e,
            mainId,
            inputRef?.current as HTMLInputElement
          );
        }}
        InputProps={{
          style: { height: "27px", fontSize: "14px" },

          inputRef: inputRef,
        }}
        sx={{
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": { top: "-13px" },
        }}
      />
      <div style={{ marginTop: "10px", width: "100%", position: "relative" }}>
        <div
          className={mainId}
          style={{
            height: `${(document.getElementById("container")?.getBoundingClientRect()
                .height as number) - 30
              }px`,
            width: "100%",
            overflowX: "scroll",
            position: "absolute",
          }}
        >
          <Table
            ref={tableSelectedCheck}
            isLoading={
              LoadingCheckList ||
              getSearchReturnCheckInfoLoading ||
              LoadingCheckListOnSearch
            }
            columns={checkColumns}
            rows={checkCollection}
            table_id={"TempID"}
            isSingleSelection={true}
            isRowFreeze={true}
            dataSelection={(selection, data, code) => {
              const rowSelected = data.filter(
                (item: any) => item.TempID === selection[0]
              )[0];
              if (rowSelected === undefined || rowSelected.length <= 0) {
                return;
              }
              dispatchModal({
                type: "UPDATE_FIELD",
                field: "subSelectedChecks",
                value: {
                  Check_No: rowSelected.Check_No,
                  Bank: rowSelected.Bank,
                  Check_Date: rowSelected.Check_Date,
                  PK: rowSelected.Check_No,
                  DepoDate: rowSelected.DepoDate,
                  Date_Collection: rowSelected.Date_OR,
                  TempID: rowSelected.TempID,
                },
              });
              dispatchModal({
                type: "UPDATE_FIELD",
                field: "ReturnReason",
                value: "DAIF",
              });
              dispatchModal({
                type: "UPDATE_FIELD",
                field: "TempID",
                value: rowSelected.TempID,
              });
              dispatchModal({
                type: "UPDATE_FIELD",
                field: "Check_No",
                value: rowSelected.Check_No,
              });

              modalSelectedMutate({
                BankAccount: rowSelected.BankAccount,
                Official_Receipt: rowSelected.Official_Receipt,
              });
            }}
            isRowSelectable={(params) =>
              !checkSelectedCollection
                .map((item: any) => item.Check_No)
                .includes(params.row.Check_No)
            }
          />
        </div>
      </div>
    </React.Fragment>
  );
}
function SelectedCheckToBeReturn() {
  const {
    dispatchModal,
    modalSelectedMutate,
    checkSelectedCollection,
    tableSelectedCheckReturn,
  } = useContext(ReturnCheckContext);

  const selectedCheckToBeReturnColumns = [
    {
      field: "OR_NO",
      headerName: "OR No.",
      minWidth: 170,
    },
    {
      field: "OR_Date",
      headerName: "OR Date",
      minWidth: 160,
    },
    {
      field: "DepoSlip",
      headerName: "Deposit Slip",
      minWidth: 160,
    },
    {
      field: "DepoDate",
      headerName: "Deposit Date",
      minWidth: 160,
    },
    {
      field: "Check_No",
      headerName: "Check No",
      minWidth: 160,
    },
    {
      field: "Check_Date",
      headerName: "Check Date",
      minWidth: 160,
    },
    {
      field: "Amount",
      headerName: "Amount",
      minWidth: 160,
      align: "right",
    },
    {
      field: "Bank",
      headerName: "Bank/Branch",
      minWidth: 160,
    },
    {
      field: "Bank_Account",
      headerName: "Bank Account",
      minWidth: 160,
    },
    {
      field: "Reason",
      headerName: "Reason",
      minWidth: 160,
    },
    {
      field: "Return_Date",
      headerName: "Return Date",
      minWidth: 160,
    },
  ];

  return (
    <div style={{ marginTop: "10px", width: "100%", position: "relative" }}>
      <Box
        style={{
          height: `${(document.getElementById("container")?.getBoundingClientRect()
              .height as number) - 30
            }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={tableSelectedCheckReturn}
          isLoading={false}
          columns={selectedCheckToBeReturnColumns}
          rows={checkSelectedCollection}
          table_id={"TempID"}
          isSingleSelection={true}
          isRowFreeze={true}
          dataSelection={(selection, data, code) => {
            const rowSelected = data.filter(
              (item: any) => item.TempID === selection[0]
            )[0];
            if (rowSelected === undefined || rowSelected.length <= 0) {
              return;
            }
            dispatchModal({
              type: "UPDATE_FIELD",
              field: "subSelectedChecks",
              value: {
                Check_No: rowSelected.Check_No,
                Bank: rowSelected.Bank,
                Check_Date: rowSelected.Check_Date,
                PK: rowSelected.Check_No,
                DepoDate: rowSelected.DepoDate,
                Date_Collection: rowSelected.OR_Date,
                TempID: rowSelected.TempID,
              },
            });
            dispatchModal({
              type: "UPDATE_FIELD",
              field: "ReturnReason",
              value: rowSelected.Reason,
            });
            dispatchModal({
              type: "UPDATE_FIELD",
              field: "ModalDateReturn",
              value: rowSelected.Return_Date,
            });
            dispatchModal({
              type: "UPDATE_FIELD",
              field: "TempID",
              value: rowSelected.TempID,
            });
            dispatchModal({
              type: "UPDATE_FIELD",
              field: "Check_No",
              value: rowSelected.Check_No,
            });

            modalSelectedMutate({
              BankAccount: rowSelected.Bank_Account,
              Official_Receipt: rowSelected.OR_NO,
            });
          }}
        />
      </Box>
    </div>
  );
}
function AccountingEntry() {
  const { accountingEntry, tableAccountingEntryCheck } =
    useContext(ReturnCheckContext);
  const accountingentryColumns = [
    {
      field: "Code",
      headerName: "Code",
      minWidth: 170,
    },
    {
      field: "AccountName",
      headerName: "Account Name",
      minWidth: 160,
    },
    {
      field: "Debit",
      headerName: "Debit",
      minWidth: 160,
      align: "right",
    },
    {
      field: "Credit",
      headerName: "Credit",
      minWidth: 160,
      align: "right",
    },
    {
      field: "IDNo",
      headerName: "ID No.",
      minWidth: 160,
    },
    {
      field: "Identity",
      headerName: "Identity",
      minWidth: 160,
    },
    {
      field: "SubAcct",
      headerName: "Sub Acct",
      minWidth: 160,
    },
    {
      field: "SubAcctName",
      headerName: "Sub Acct Name",
      minWidth: 300,
    },
    {
      field: "Check_No",
      headerName: "Check No",
      minWidth: 160,
    },
    {
      field: "Bank",
      headerName: "Bank/Branch",
      minWidth: 160,
    },
    {
      field: "Check_Date",
      headerName: "Check Date",
      minWidth: 160,
    },
    {
      field: "Check_Return",
      headerName: "Check Return",
      minWidth: 160,
    },
    {
      field: "Check_Reason",
      headerName: "Check Reason",
      minWidth: 160,
    },
    {
      field: "PK",
      headerName: "PK",
      minWidth: 160,
    },
    {
      field: "DepoDate",
      headerName: "Date Deposit",
      minWidth: 160,
    },
    {
      field: "Date_Collection",
      headerName: "Date Collection",
      minWidth: 160,
    },
  ];
  return (
    <div style={{ marginTop: "10px", width: "100%", position: "relative" }}>
      <Box
        style={{
          height: `${(document.getElementById("container")?.getBoundingClientRect()
              .height as number) - 30
            }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={tableAccountingEntryCheck}
          isLoading={false}
          columns={accountingentryColumns}
          rows={accountingEntry}
          table_id={"TempID"}
          isSingleSelection={true}
          isRowFreeze={true}
          checkboxSelection={false}
          footerPaginationPosition="left-right"
          footerChildren={() => <AccountingEntryFooterComponent />}
          showFooterSelectedCount={false}
        />
      </Box>
    </div>
  );
}
function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
function slideAnimation(activeButton: number, idx: number) {
  if (activeButton === idx) {
    return "translateX(100%)";
  } else {
    return "translateX(0%)";
  }
}
function DebitFooterComponent() {
  const { debitModalCollection } = useContext(ReturnCheckContext);
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
        {debitModalCollection
          .reduce(
            (sum: any, obj: any) =>
              sum + parseFloat(obj.Credit.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </strong>
    </Box>
  );
}
function AccountingEntryFooterComponent() {
  const { accountingEntry } = useContext(ReturnCheckContext);
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
      <span style={{ marginRight: "10px" }}>Total:</span>
      <input
        style={{
          fontWeight: "bold",
        }}
        type="text"
        readOnly={true}
        value={accountingEntry
          .reduce(
            (sum: any, obj: any) =>
              sum + parseFloat(obj.Credit.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      />
      <input
        style={{
          fontWeight: "bold",
        }}
        type="text"
        readOnly={true}
        value={accountingEntry
          .reduce(
            (sum: any, obj: any) =>
              sum + parseFloat(obj.Debit.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      />
    </Box>
  );
}
