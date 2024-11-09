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
  Button,
} from "@mui/material";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import LoadingButton from "@mui/lab/LoadingButton";
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
import { TextInput } from "../../../../components/UpwardFields";
import { format } from 'date-fns'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import '../../../../style/laoding.css'
import { UpwardTable } from "../../../../components/UpwardTable";
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
const DepositContext = createContext<any>({
  cashCollection: [],
  setCashCollection: () => { },
  checkCollection: [],
  setCheckCollection: () => { },
  selectedCollection: [],
  setSelectedCollection: () => { },
  collectionForDeposit: [],
  setCollectionForDeposit: () => { },
  tableRows: [],
  updateTableRowsInput: () => { },
  LoadingCashTable: false,
  LoadingCheckTable: false,
  setTotal: () => { },
  total: "0.00",
  TotalCashForDeposit: "0.00",
  loadingSearchByDepositSlip: false,
});

export default function Deposit() {
  const depositSearch = useRef<HTMLInputElement>(null)
  const inputSearchRef = useRef<HTMLInputElement>(null)
  const refSlipCode = useRef<HTMLInputElement>(null)
  const refDateDepo = useRef<HTMLInputElement>(null)
  const refBankAcctCode = useRef<HTMLInputElement>(null)
  const refBankAcctName = useRef<HTMLInputElement>(null)

  const bankDepositSearch = useRef<HTMLInputElement>(null)
  const _refTempSlipCode = useRef<string>("")

  const refBankAcctCodeTag = useRef('')
  const refBankAcctNameTag = useRef('')
  const refAcctID = useRef('')
  const refAcctName = useRef('')
  const refClassification = useRef('')
  const refSubAccount = useRef('')
  const refShortName = useRef('')

  const { myAxios, user } = useContext(AuthContext);
  const { currentStepIndex, step, goTo } = useMultipleComponent([
    <CashCollection />,
    <CheckCollection />,
    <SelectedCollection />,
    <CollectionForDeposit />,
  ]);

  const [cashCollection, setCashCollection] = useState<any>([])
  const [checkCollection, setCheckCollection] = useState<any>([])
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [selectedRowsCashIndex, setSelectedRowsCashIndex] = useState<any>([])
  const [selectedRowsCheckedIndex, setSelectedRowsCheckedIndex] = useState<any>([])
  const [collectionForDeposit, setCollectionForDeposit] = useState<any>([]);
  const [tableRowsInputValue, setTableRowsInputValue] =
    useState<Array<{ value1: string; value2: string; value3: string }>>(
      defaultCashBreakDown
    );
  const [depositMode, setDepositMode] = useState('')
  const [total, setTotal] = useState("0.00");
  const TotalCashForDeposit = selectedRows
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
        wait(100).then(() => {
          if (refSlipCode.current) {
            refSlipCode.current.value = response.data.slipcode[0].collectionID
            _refTempSlipCode.current = response.data.slipcode[0].collectionID
          }
          if (refDateDepo.current) {
            refDateDepo.current.value = format(new Date(), "yyyy-MM-dd")
          }
        })
      },
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
      if (selectedRowData.length > 0) {
        if (refBankAcctCode.current)
          refBankAcctCode.current.value = selectedRowData[0].Account_No
        if (refBankAcctName.current)
          refBankAcctName.current.value = selectedRowData[0].Account_Name

        refBankAcctCodeTag.current = selectedRowData[0]?.IDNo
        refBankAcctNameTag.current = selectedRowData[0]?.Desc
        refAcctID.current = selectedRowData[0]?.Account_ID
        refAcctName.current = selectedRowData[0]?.Short
        refShortName.current = selectedRowData[0]?.client_name
        refClassification.current = selectedRowData[0]?.Sub_Acct
        refSubAccount.current = selectedRowData[0]?.ShortName

        closeDepositBanks();
      }
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
          setSelectedRows([]);
          setCollectionForDeposit([]);
          RefetchDepositSlipCode();
          setTableRowsInputValue(defaultCashBreakDown);
          resetRefs()
          refetchCashCollection()
          refetchCheckCollection()
          setSelectedRowsCashIndex([])
          setSelectedRowsCheckedIndex([])
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
        resetRefs()
        setSelectedRows([]);
        setCollectionForDeposit([]);
        RefetchDepositSlipCode();
        setTableRowsInputValue(defaultCashBreakDown);
        resetRefs()
        refetchCashCollection()
        refetchCheckCollection()
        setSelectedRowsCashIndex([])
        setSelectedRowsCheckedIndex([])
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
        const obj = res.data.data.obj
        const cash = res.data.data.cash
        const check = res.data.data.checks
        const cash_breakdown = res.data.data.cash_breakdown

        wait(100).then(() => {
          if (refBankAcctCode.current)
            refBankAcctCode.current.value = obj.refBankAcctCode
          if (refBankAcctName.current)
            refBankAcctName.current.value = obj.refBankAcctName
          if (refDateDepo.current)
            refDateDepo.current.value = format(new Date(obj.refDate), "yyyy-MM-dd")



          refBankAcctCodeTag.current = obj?.refBankAcctCodeTag
          refBankAcctNameTag.current = obj?.refBankAcctNameTag
          refAcctID.current = obj?.refAcctID
          refAcctName.current = obj?.refAcctName
          refShortName.current = obj?.client_name
          refClassification.current = obj?.refClassification
          refSubAccount.current = obj?.refSubAccount

          const cashIndex = cash
            .map((obj: any, index: number) => obj.SlipCode !== null && obj.SlipCode !== '' ? index : null)
            .filter((index: number) => index !== null);

          const checkIndex = check
            .map((obj: any, index: number) => obj.SlipCode !== null && obj.SlipCode !== '' ? index : null)
            .filter((index: number) => index !== null);


          setSelectedRowsCashIndex(cashIndex)
          setSelectedRowsCheckedIndex(checkIndex)
          setCashCollection(cash);
          setCheckCollection(check);


          const filteredCash = cash.filter((itm: any) => itm.SlipCode !== '' && itm.SlipCode === refSlipCode.current?.value)
          const filteredCheck = check.filter((itm: any) => itm.SlipCode !== '' && itm.SlipCode === refSlipCode.current?.value)

          if (filteredCash.length > 0) {
            filteredCash.forEach((rowSelected: any) => {
              setSelectedRows((d: any) => {

                const newSelected: any = {
                  Deposit: "Cash",
                  Check_No: "",
                  Check_Date: "",
                  Bank: "",
                  Amount: rowSelected.Amount,
                  Name: rowSelected.Client_Name,
                  RowIndex: d.length + 1,
                  DRCode: rowSelected.DRCode,
                  ORNo: rowSelected.OR_No,
                  DRRemarks: "",
                  IDNo: rowSelected.ID_No,
                  TempOR: rowSelected.Temp_OR,
                  Short: rowSelected.Short,
                };

                d = [...d, newSelected];
                return d;
              });
            });
          }
          if (filteredCheck.length > 0) {
            filteredCheck.forEach((rowSelected: any) => {
              setSelectedRows((d: any) => {
                const newSelected: any = {
                  Deposit: "Check",//0
                  Check_No: rowSelected.Check_No,//1
                  Check_Date: rowSelected.Check_Date,//2
                  Bank: rowSelected.Bank_Branch,//3
                  Amount: rowSelected.Amount,//4
                  Name: rowSelected.Client_Name,//5
                  RowIndex: d.length + 1,//6
                  DRCode: rowSelected.DRCode,//7
                  ORNo: rowSelected.OR_No,//8
                  DRRemarks: rowSelected.DRRemarks,//9
                  IDNo: rowSelected.ID_No,//10
                  TempOR: rowSelected.Temp_OR,//11
                  Short: rowSelected.Short,//12
                };
                d = [...d, newSelected];
                return d;
              });


              setCollectionForDeposit((d: any) => {
                const newSelectedCheckForDeposit: any = {
                  Bank: rowSelected.Bank_Branch,
                  Check_No: rowSelected.Check_No,
                  Amount: rowSelected.Amount,
                  TempOR: rowSelected.Temp_OR,
                };
                d = [...d, newSelectedCheckForDeposit];
                return d;
              });
            });
          }
          setTableRowsInputValue(cash_breakdown)
        })

        setDepositMode('edit')

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
      searchByDepositSlip({ SlipCode });

      wait(100).then(() => {
        if (refSlipCode.current) {
          refSlipCode.current.value = SlipCode
        }
      })

      closeDeposit();
    },
    onCloseFunction: (value: any) => {
      if (inputSearchRef.current) {
        inputSearchRef.current.value = ""
      }
    },
    searchRef: depositSearch,
  });

  const { isLoading: loadingCashCollection, refetch: refetchCashCollection } =
    useQuery({
      queryKey: "get-cash-collection",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/get-cash-collection`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const response = data as any;
        setCashCollection(response.data.cash)
      },
    });

  const { isLoading: loadingCheckCollection, refetch: refetchCheckCollection } =
    useQuery({
      queryKey: "get-check-collection",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/get-check-collection`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const response = data as any;
        setCheckCollection(response.data.check)
      },
    });

  const handleOnSave = (e: any) => {
    e.preventDefault();
    if (refBankAcctCode.current && refBankAcctCode.current?.value.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Bank Account is too long!",
        timer: 1500,
      });
    }
    if (refBankAcctCode.current && refBankAcctCode.current?.value === "") {
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
    if (selectedRows.length <= 0) {
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
    const state = {
      depositSlip: refSlipCode.current?.value,
      depositdate: refDateDepo.current?.value,
      BankAcctCode: refBankAcctCode.current?.value,
      BankAcctName: refBankAcctName.current?.value,
      BankAcctCodeTag: refBankAcctCodeTag.current,
      BankAcctNameTag: refBankAcctNameTag.current,
      AcctID: refAcctID.current,
      AcctName: refAcctName.current,
      Classification: refClassification.current,
      SubAccount: refSubAccount.current,
      ShortName: refShortName.current,
    }
    if (depositMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {

          updateDepositMutation({
            ...state,
            userCodeConfirmation,
            selectedCollection: JSON.stringify(selectedRows),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addDepositMutation({
            ...state,
            selectedCollection: JSON.stringify(selectedRows),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    }
  };

  function resetRefs() {

    if (refBankAcctCode.current) {
      refBankAcctCode.current.value = ''
    }
    if (refBankAcctName.current) {
      refBankAcctName.current.value = ''
    }
    if (bankDepositSearch.current)
      bankDepositSearch.current.value = ''
    refBankAcctCodeTag.current = ''
    refBankAcctNameTag.current = ''
    refAcctID.current = ''
    refAcctName.current = ''
    refClassification.current = ''
    refSubAccount.current = ''
    refShortName.current = ''
  }

  const disabledFields = depositMode === "";


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
          <TextInput
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "50px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  openDeposit(inputSearchRef.current?.value);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const datagridview = document.querySelector(
                    ".grid-container"
                  ) as HTMLDivElement;
                  datagridview.focus();
                }
              },
              style: { width: "500px" },
            }}
            inputRef={inputSearchRef}
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
              setDepositMode("add")

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
                  setDepositMode("")
                  setSelectedRows([]);
                  setCollectionForDeposit([]);
                  RefetchDepositSlipCode();
                  setTableRowsInputValue(defaultCashBreakDown);
                  resetRefs()
                  refetchCheckCollection()
                  refetchCashCollection()

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
        {LoadingDepositSlipCode ? "Loading..." : <TextInput
          label={{
            title: "Slip Code: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "70px",
            },
          }}
          input={{
            disabled: disabledFields,
            className: "search-input-up-on-key-down",
            type: "text",
            style: { width: "200px" },
          }}
          inputRef={refSlipCode}
          icon={<AutorenewIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault()
            RefetchDepositSlipCode()
          }}
        />}
        <TextInput
          label={{
            title: "Deposit Date: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "80px",
            },
          }}
          input={{
            className: "search-input-up-on-key-down",
            type: "date",
            style: { width: "200px" },
            disabled: disabledFields
          }}
          inputRef={refDateDepo}
        />

        {isLoadingDepostitBanks ? (
          "Loading..."
        ) : (
          <TextInput
            label={{
              title: "Bank Account: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "text",
              style: { width: "200px" },
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  openDepositBanks(refBankAcctCode.current?.value)
                }

              },
              disabled: disabledFields
            }}
            inputRef={refBankAcctCode}
            icon={<AccountBalanceIcon sx={{ fontSize: "18px", color: disabledFields ? "gray" : "black" }} />}
            onIconClick={(e) => {
              e.preventDefault()
              openDepositBanks(refBankAcctCode.current?.value)
            }}
            disableIcon={disabledFields}
          />)}

        <TextInput
          label={{
            title: "Account Name: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "100px",
            },
          }}
          input={{
            className: "search-input-up-on-key-down",
            type: "text",
            style: { width: "200px" },
            readOnly: true,
            disabled: disabledFields

          }}
          inputRef={refBankAcctName}
        />
        <button
          // ref={submitButton}
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
          myAxios,
          user,
          cashCollection,
          setCashCollection,
          checkCollection,
          setCheckCollection,
          selectedRows,
          setSelectedRows,
          collectionForDeposit,
          setCollectionForDeposit,
          total,
          setTotal,
          TotalCashForDeposit,
          tableRows: tableRowsInputValue,
          setTableRowsInputValue,
          updateTableRowsInput,
          loadingCheckCollection,
          loadingCashCollection,
          selectedRowsCashIndex,
          setSelectedRowsCashIndex,
          selectedRowsCheckedIndex,
          setSelectedRowsCheckedIndex
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
      {loadingSearchByDepositSlip || updateDepositMutationLoading || addDepositMutationLoading && <div className="loading-component"><div className="loader"></div></div>}
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
    setSelectedRows,
    selectedRowsCashIndex,
    setSelectedRowsCashIndex,

  } = useContext(DepositContext);

  const table = useRef<any>(null);
  const cashColumns = [
    {
      field: "OR_No",
      headerName: "OR No.",
      width: 270,
    },
    {
      field: "OR_Date",
      headerName: "OR Date",
      width: 270,
    },
    {
      field: "Amount",
      headerName: "Amount",
      width: 200,
      type: "number",
      cellClassName: "super-app-theme--cell",
    },
    {
      field: "Client_Name",
      headerName: "Client Name",
      flex: 1,
      width: 540,
    },
    {
      field: "Temp_OR",
      headerName: "Temp_OR",
      hide: true,
    },
  ];

  useEffect(() => {
    table.current?.setSelectRows(
      selectedRowsCashIndex
    );
  }, [selectedRowsCashIndex, table]);

  const width = window.innerWidth - 70;
  const height = window.innerHeight - 200;

  //[checkSelected, table, loadingSearchByDepositSlip]
  console.log(selectedRowsCashIndex)

  return (
    <div
      style={{
        flex: 1,
        marginTop: "10px",
        width: "100%",
        position: "relative",
      }}
    >

      <UpwardTable
        isLoading={false}
        ref={table}
        rows={cashCollection}
        column={cashColumns}
        width={width}
        height={height}
        dataReadOnly={true}
        freeze={true}
        isMultipleSelect={true}
        onSelectionChange={(selectedRow, rowIndex) => {
          const rowSelected = selectedRow[0];
          if (selectedRow.length > 0) {
            if (selectedRowsCashIndex?.includes(rowIndex)) {
              return
            }
            setSelectedRowsCashIndex((d: any) => [...d, rowIndex])
            setSelectedRows((d: any) => {
              const newSelected: any = {
                Deposit: "Cash",
                Check_No: "",
                Check_Date: "",
                Bank: "",
                Amount: rowSelected.Amount,
                Name: rowSelected.Client_Name,
                RowIndex: d.length + 1,
                DRCode: rowSelected.DRCode,
                ORNo: rowSelected.OR_No,
                DRRemarks: "",
                IDNo: rowSelected.ID_No,
                TempOR: rowSelected.Temp_OR,
                Short: rowSelected.Short,
              };

              d = [...d, newSelected];
              return d;
            });

          } else {

          }
        }}
        inputsearchselector=".manok"
      />
      {/*               
      <Box
        style={{
          height: `${document.getElementById("concatiner")?.getBoundingClientRect()
            .height
            }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={loadingCashCollection}
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


            setSelectedRows((d: any) => {

              const newSelected: any = {
                Deposit: "Cash",
                Check_No: "",
                Check_Date: "",
                Bank: "",
                Amount: rowSelected.Amount,
                Name: rowSelected.Client_Name,
                RowIndex: d.length + 1,
                DRCode: rowSelected.DRCode,
                ORNo: rowSelected.OR_No,
                DRRemarks: "",
                IDNo: rowSelected.ID_No,
                TempOR: rowSelected.Temp_OR,
                Short: rowSelected.Short,
              };

              d = [...d, newSelected];
              return d;
            });
          }}
        />
      </Box> */}
    </div>
  );
}
function CheckCollection() {
  const {
    checkCollection,
    setSelectedRows,
    setCollectionForDeposit,
    selectedRowsCheckedIndex,
    setSelectedRowsCheckedIndex

  } = useContext(DepositContext)


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
    table.current?.setSelectRows(
      selectedRowsCheckedIndex
    );
  }, [selectedRowsCheckedIndex, table]);

  const width = window.innerWidth - 70;
  const height = window.innerHeight - 200;
  // / [selectedRows, table, loadingSearchByDepositSlip]

  return (
    <div
      style={{
        marginTop: "10px",
        width: "100%",
        position: "relative",
        flex: 1,
      }}
    >
      <UpwardTable
        isLoading={false}
        ref={table}
        rows={checkCollection}
        column={checkColumns}
        width={width}
        height={height}
        dataReadOnly={true}
        freeze={true}
        isMultipleSelect={true}
        onSelectionChange={(selectedRow, rowIndex) => {
          const rowSelected = selectedRow[0];
          if (selectedRow.length > 0) {
            if (selectedRowsCheckedIndex.includes(rowIndex)) {
              return
            }
            setSelectedRowsCheckedIndex((d: any) => [...d, rowIndex])
            setSelectedRows((d: any) => {
              const newSelected: any = {
                Deposit: "Check",//0
                Check_No: rowSelected.Check_No,//1
                Check_Date: rowSelected.Check_Date,//2
                Bank: rowSelected.Bank_Branch,//3
                Amount: rowSelected.Amount,//4
                Name: rowSelected.Client_Name,//5
                RowIndex: d.length + 1,//6
                DRCode: rowSelected.DRCode,//7
                ORNo: rowSelected.OR_No,//8
                DRRemarks: rowSelected.DRRemarks,//9
                IDNo: rowSelected.ID_No,//10
                TempOR: rowSelected.Temp_OR,//11
                Short: rowSelected.Short,//12
              };
              d = [...d, newSelected];
              return d;
            });


            setCollectionForDeposit((d: any) => {
              const newSelectedCheckForDeposit: any = {
                Bank: rowSelected.Bank_Branch,
                Check_No: rowSelected.Check_No,
                Amount: rowSelected.Amount,
                TempOR: rowSelected.Temp_OR,
              };
              d = [...d, newSelectedCheckForDeposit];
              return d;
            });
          } else {

          }
        }}
        inputsearchselector=".manok"
      />
      {/* <UpwardTable
        isLoading={false}
        ref={table}
        rows={checkCollection}
        column={checkColumns}
        width={width}
        height={height}
        dataReadOnly={true}
        onSelectionChange={(selectedRow, rowIndex) => {
          const rowSelected = selectedRow[0];
          if (selectedRow.length > 0) {
            setSelectedRowsIndex(rowIndex)
            setSelectedRows((d: any) => {
              const newSelected: any = {
                Deposit: "Check",//0
                Check_No: rowSelected.Check_No,//1
                Check_Date: rowSelected.Check_Date,//2
                Bank: rowSelected.Bank_Branch,//3
                Amount: rowSelected.Amount,//4
                Name: rowSelected.Client_Name,//5
                RowIndex: d.length + 1,//6
                DRCode: rowSelected.DRCode,//7
                ORNo: rowSelected.OR_No,//8
                DRRemarks: rowSelected.DRRemarks,//9
                IDNo: rowSelected.ID_No,//10
                TempOR: rowSelected.Temp_OR,//11
                Short: rowSelected.Short,//12
              };
              d = [...d, newSelected];
              return d;
            });


            setCollectionForDeposit((d: any) => {
              const newSelectedCheckForDeposit: any = {
                Bank: rowSelected.Bank_Branch,
                Check_No: rowSelected.Check_No,
                Amount: rowSelected.Amount,
                TempOR: rowSelected.Temp_OR,
              };
              d = [...d, newSelectedCheckForDeposit];
              return d;
            });
          } else {

          }
        }}
        inputsearchselector=".manok"
      /> */}
      {/*       
      <Box
        style={{
          height: `${document.getElementById("concatiner")?.getBoundingClientRect()
            .height
            }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={loadingCheckCollection}
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

            setSelectedRows((d: any) => {
              const newSelected: any = {
                Deposit: "Check",//0
                Check_No: rowSelected.Check_No,//1
                Check_Date: rowSelected.Check_Date,//2
                Bank: rowSelected.Bank_Branch,//3
                Amount: rowSelected.Amount,//4
                Name: rowSelected.Client_Name,//5
                RowIndex: d.length + 1,//6
                DRCode: rowSelected.DRCode,//7
                ORNo: rowSelected.OR_No,//8
                DRRemarks: rowSelected.DRRemarks,//9
                IDNo: rowSelected.ID_No,//10
                TempOR: rowSelected.Temp_OR,//11
                Short: rowSelected.Short,//12
              };
              d = [...d, newSelected];
              return d;
            });


            setCollectionForDeposit((d: any) => {
              const newSelectedCheckForDeposit: any = {
                Bank: rowSelected.Bank_Branch,
                Check_No: rowSelected.Check_No,
                Amount: rowSelected.Amount,
                TempOR: rowSelected.Temp_OR,
              };
              d = [...d, newSelectedCheckForDeposit];
              return d;
            });
          }}
        />
      </Box> */}
    </div>
  );



}
function SelectedCollection() {

  const {
    selectedRows,
    setSelectedRows,
    setCollectionForDeposit,
    setSelectedRowsCheckedIndex,
    setSelectedRowsCashIndex,
    checkCollection,
    cashCollection
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


  const width = window.innerWidth - 70;
  const height = window.innerHeight - 200;
  return (
    <div
      style={{
        marginTop: "10px",
        width: "100%",
        position: "relative",
        flex: 1,
      }}
    >
      <UpwardTable
        isLoading={false}
        ref={table}
        rows={selectedRows}
        column={selectedCollectionColumns}
        width={width}
        height={height}
        dataReadOnly={true}
        freeze={true}
        isMultipleSelect={true}
        onSelectionChange={(selectedRow, rowIndex) => {
          const rowSelected = selectedRow[0];
          if (selectedRow.length > 0) {
            if (rowSelected.Deposit === "Check") {
              const getRowIndex = checkCollection.findIndex((d: any) => d.Temp_OR === rowSelected.TempOR)

              setSelectedRowsCheckedIndex((d: any) => {
                const r = d.filter((d: any) => d !== getRowIndex)
                return r
              })
            } else {
              const getRowIndex = cashCollection.findIndex((d: any) => d.Temp_OR === rowSelected.TempOR)
              setSelectedRowsCashIndex((d: any) => {
                console.log(d, rowIndex)
                const r = d.filter((d: any) => d !== getRowIndex)
                return r
              })

            }
            setSelectedRows((d: any) => {
              return d.filter((item: any) => item.TempOR !== rowSelected.TempOR);
            });
            setCollectionForDeposit((d: any) => {
              return d.filter((item: any) => item.TempOR !== rowSelected.TempOR);
            });

          } else {

          }
        }}
        inputsearchselector=".manok"
      />

      {/* <Box
        style={{
          height: `${document.getElementById("concatiner")?.getBoundingClientRect()
            .height
            }px`,
          width: "100%",
          overflowX: "scroll",
          position: "absolute",
        }}
      >
        <Table
          ref={table}
          isLoading={false}
          columns={selectedCollectionColumns}
          rows={selectedRows}
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

            setSelectedRows((d: any) => {
              return d.filter((item: any) => item.TempOR !== selection[0]);
            });
            setCollectionForDeposit((d: any) => {
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
      </Box> */}
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
        ?.reduce((accumulator: any, currentValue: any) => {
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
  const width = 600;
  const height = window.innerHeight - 200;
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
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          width: "60%",
          position: "relative",
        }}
      >
        <legend>Checks</legend>

        <UpwardTable
          isLoading={false}
          ref={table}
          rows={collectionForDeposit}
          column={[
            {
              field: "Bank",
              headerName: "Bank/Branch",
              flex: 1,
              width: 170,
            },
            {
              field: "Check_No",
              headerName: "Check No",
              flex: 1,
              width: 170,
            },
            {
              field: "Amount",
              headerName: "Amount",
              flex: 1,
              width: 300,
            },
          ]}
          width={width}
          height={height}
          dataReadOnly={true}
          freeze={true}
          isMultipleSelect={true}
          onSelectionChange={() => { }}
          inputsearchselector=".manok"
        />

        {/* <div style={{ marginTop: "10px", width: "100%", position: "relative" }}>
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
        </div> */}
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
            {tableRows?.map((items: any, idx: number) => {
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
    height: "20px",
    borderRight: "none",
    borderLeft: "none",
    borderTop: "none",
    outline: "none",
    borderBottom: "1px solid #cbd5e1",
    padding: "0 8px",
    width: "100%",
    fontSize: "11px",
    margin: "0",

  };

  return (
    <tr style={{ margin: "0", padding: "0 !important" }} >
      <td
        style={{
          borderRight: "2px solid black", margin: "0", padding: "0"
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
          overflow: "hidden", margin: 0, padding: "0 !important"
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
          borderRight: "2px solid black", margin: "0", padding: "0 !important"
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
