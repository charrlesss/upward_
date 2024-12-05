import {
  useState,
  createContext,
  useContext,
  CSSProperties,
  useEffect,
  useRef,
  forwardRef,
  Fragment,
  useImperativeHandle,
} from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import {
  Button,
} from "@mui/material";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { wait } from "@testing-library/user-event/dist/utils";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import { TextInput } from "../../../../components/UpwardFields";
import { format } from 'date-fns'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import '../../../../style/laoding.css'
import PageHelmet from "../../../../components/Helmet";
import SearchIcon from '@mui/icons-material/Search';


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
const cashColumns = [
  {
    key: "OR_No",
    label: "OR No.",
    width: 270,
  },
  {
    key: "OR_Date",
    label: "OR Date",
    width: 270,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 200,
    type: "number",
    cellClassName: "super-app-theme--cell",
  },
  {
    key: "Client_Name",
    label: "Client Name",
    flex: 1,
    width: 540,
  },
  {
    key: "DRCode",
    label: "DRCode",
    hide: true,
  },
  {
    key: "ID_No",
    label: "ID_No",
    hide: true,
  },
  {
    key: "Short",
    label: "Short",
    hide: true,
  },
  {
    key: "Temp_OR",
    label: "Temp_OR",
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
  const cashTable = useRef<any>(null)
  const checkTable = useRef<any>(null)
  const selectedTable = useRef<any>(null)
  const collectionCheckTable = useRef<any>(null)

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
  const { currentStepIndex, goTo } = useMultipleComponent([0, 1, 2, 3,]);
  const [cashCollection, setCashCollection] = useState<any>([])
  const [checkCollection, setCheckCollection] = useState<any>([])
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [collectionForDeposit, setCollectionForDeposit] = useState<any>([]);
  const [tableRowsInputValue, setTableRowsInputValue] =
    useState<Array<{ value1: string; value2: string; value3: string }>>(
      defaultCashBreakDown
    );

  const [selectedRowsCashIndex, setSelectedRowsCashIndex] = useState<any>([])
  const [selectedRowsCheckedIndex, setSelectedRowsCheckedIndex] = useState<any>([])

  const [depositMode, setDepositMode] = useState('')
  const [total, setTotal] = useState("0.00");

  const disabledFields = depositMode === "";

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
          wait(100).then(() => {
            resetTables()
            resetRefs()
            setTableRowsInputValue(defaultCashBreakDown);
            setSelectedRows([]);
            setCollectionForDeposit([]);
            setSelectedRowsCashIndex([])
            setSelectedRowsCheckedIndex([])

            refetchCashCollection()
            refetchCheckCollection()
            RefetchDepositSlipCode();
            setDepositMode('')
            goTo(0)

          })


          return Swal.fire({
            position: "center",
            icon: "success",
            title: resposnse.data.message,
            timer: 1500,
          })
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
        wait(100).then(() => {
          resetTables()
          resetRefs()
          setTableRowsInputValue(defaultCashBreakDown);
          setSelectedRows([]);
          setCollectionForDeposit([]);
          setSelectedRowsCashIndex([])
          setSelectedRowsCheckedIndex([])

          refetchCashCollection()
          refetchCheckCollection()
          RefetchDepositSlipCode();
          setDepositMode('')
          goTo(0)


        })
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

        setCashCollection([])
        setCheckCollection([])
        setSelectedRows([])
        setCollectionForDeposit([])
        setTableRowsInputValue([])
        wait(100).then(() => {
          collectionCheckTable.current.resetTable()
          selectedTable.current.resetTable()
          cashTable.current.resetTable()
          checkTable.current.resetTable()

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

          cashTable.current.setDataFormated(cash)
          checkTable.current.setDataFormated(check)
          setCashCollection(cash)
          setCheckCollection(check)
          setTableRowsInputValue(cash_breakdown)



          setTimeout(() => {
            cash.forEach((d: any, idx: number) => {
              if (refSlipCode.current && d.SlipCode === refSlipCode.current.value) {
                const row = cashTable.current.parentElement().querySelector(`.tr-row-${idx}`);
                const col = row.querySelectorAll('td')[0]
                const checkbox = col.querySelector('input') as HTMLInputElement
                if (checkbox) {
                  checkbox.click()
                }
              }
            });

            check.forEach((d: any, idx: number) => {
              if (refSlipCode.current && d.SlipCode === refSlipCode.current.value) {
                const row = checkTable.current.parentElement().querySelector(`.tr-row-${idx}`);
                const col = row.querySelectorAll('td')[0]
                const checkbox = col.querySelector('input') as HTMLInputElement
                if (checkbox) {
                  checkbox.click()
                }
              }
            });

          }, 200)

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
      onSuccess: (data) => {
        const response = data as any;
        if (depositMode === 'edit') {
          setCashCollection((d: any) => {
            const filteredData = d.filter((itm: any) => {
              return refSlipCode.current && itm.SlipCode === refSlipCode.current.value
            })
            return [...response.data.cash, ...filteredData]
          })
        } else {
          setCashCollection(response.data.cash)
          wait(100).then(() => {
            cashTable.current.setDataFormated(response.data.cash)
          })
        }
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
      onSuccess: (data) => {
        const response = data as any;
        if (depositMode === 'edit') {
          setCashCollection((d: any) => {
            const filteredData = d.filter((itm: any) => {
              return refSlipCode.current && itm.SlipCode === refSlipCode.current.value
            })
            return [...response.data.check, ...filteredData]
          })
        } else {
          setCheckCollection(response.data.check)
          wait(100).then(() => {
            checkTable.current.setDataFormated(response.data.check)
          })
        }

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
  function resetTables() {
    cashTable.current.resetTable()
    checkTable.current.resetTable()
    selectedTable.current.resetTable()
    collectionCheckTable.current.resetTable()
  }

  return (
    <>
      <PageHelmet title="Deposit" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",
          background: "#F1F1F1"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            marginBottom: "10px"
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
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault()
                if (inputSearchRef.current)
                  openDeposit(inputSearchRef.current.value);
              }}
              inputRef={inputSearchRef}
            />
          )}
          {disabledFields && (
            <Button
              sx={{
                height: "22px",
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
              height: "22px",
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
                height: "22px",
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
                    wait(100).then(() => {
                      resetTables()
                      resetRefs()
                      setTableRowsInputValue(defaultCashBreakDown);
                      setSelectedRows([]);
                      setCollectionForDeposit([]);
                      setSelectedRowsCashIndex([])
                      setSelectedRowsCheckedIndex([])

                      refetchCashCollection()
                      refetchCheckCollection()
                      RefetchDepositSlipCode();
                      setDepositMode('')
                      goTo(0)
                    })
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
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
              defaultValue: format(new Date(), "yyyy-MM-dd"),
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
                  disabled={disabledFields}
                  style={{
                    border: "1px solid #c0c0c0",
                    outline: "none",
                    backgroundColor: currentStepIndex === idx ? "#c0c0c0" : "rgba(51, 51, 51, 0.05)",
                    borderWidth: "0",
                    color: "black",
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
                    verticalAlign: "baseline",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    touchAction: "manipulation",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "0px",
                  }}
                  onClick={() => {
                    if (idx === 0) {
                      refetchCashCollection()
                    } else if (idx === 1) {
                      refetchCheckCollection()
                    }
                    goTo(idx)
                  }}
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
        <DepositContext.Provider
          value={{
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
            setSelectedRowsCheckedIndex,
            cashTable,
            checkTable,
            selectedTable,
            collectionCheckTable,
            refetchCheckCollection,
            refetchCashCollection,
            disabledFields
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
            <div style={{ display: currentStepIndex === 0 ? "block" : "none" }}>
              <CashCollection />
            </div>
            <div style={{ display: currentStepIndex === 1 ? "block" : "none" }}>
              <CheckCollection />
            </div>
            <div style={{ display: currentStepIndex === 2 ? "block" : "none" }}>
              <SelectedCollection />
            </div>
            <div style={{ display: currentStepIndex === 3 ? "block" : "none" }}>
              <CollectionForDeposit />
            </div>
          </div>
        </DepositContext.Provider>
        {ModalDepostitBanks}
        {ModalDeposit}
        {(loadingSearchByDepositSlip || updateDepositMutationLoading || addDepositMutationLoading) && <div className="loading-component"><div className="loader"></div></div>}
        <style>

          {`
            #upward-cutom-table tr td{
            border-right:1px solid #f1f5f9 !important;
            }

            #upward-cutom-table tr:nth-child(odd) td {
            background-color: #ffffff !important;
            }
            #upward-cutom-table tr:nth-child(even) td {
            background-color: #f5f5f5 !important;
            }
            #upward-cutom-table tr.selected td {
            background-color: #0076d7 !important;
            color: #ffffff !important;
            border-right:1px solid white !important;
              border-bottom:1px solid white !important;
            }

            #upward-cutom-table tr.selected td input {
            color: #ffffff !important;
            }

            `}
        </style>
      </div>
    </>

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
    cashTable,
    disabledFields
  } = useContext(DepositContext);



  return (
    <div
      style={{
        flex: 1,
        marginTop: "10px",
        width: "100%",
        position: "relative",
      }}
    >
      <DepositTable
        disbaleTable={disabledFields}
        ref={cashTable}
        columns={cashColumns}
        rows={cashCollection}
        getSelectedItem={(rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
          const rowSelected = rowItm;
          setSelectedRows((d: any) => {
            const newSelected: any = {
              Deposit: "Cash",
              Check_No: "",
              Check_Date: "",
              Bank: "",
              Amount: rowSelected[2],
              Name: rowSelected[3],
              RowIndex: d.length + 1,
              DRCode: rowSelected[4],
              ORNo: rowSelected[0],
              DRRemarks: "",
              IDNo: rowSelected[5],
              TempOR: rowSelected[7],
              Short: rowSelected[6],
            };

            d = [...d, newSelected];
            return d;
          });


        }}
      />
    </div>
  );
}
function CheckCollection() {
  const {
    checkCollection,
    setSelectedRows,
    checkTable,
    setCollectionForDeposit,
    disabledFields
  } = useContext(DepositContext)
  const checkColumns = [
    {
      key: "OR_No",
      label: "OR No.",
      width: 170,
    },
    {
      key: "OR_Date",
      label: "OR Date",
      width: 170,
    },
    {
      key: "Check_No",
      label: "Check No",
      width: 170,
    },
    {
      key: "Check_Date",
      label: "Check Date",
      width: 170,
    },
    {
      key: "Amount",
      label: "Amount",
      width: 160,
      align: "right",
      type: "number"
    },
    {
      key: "Bank_Branch",
      label: "Bank/Branch",
      width: 300,
    },
    {
      key: "Client_Name",
      label: "Client Name",
      width: 300,
    },
    {
      key: "Temp_OR",
      hide: true,
    },
    {
      key: "DRCode",
      hide: true,
    },
    {
      key: "DRRemarks",
      hide: true,
    },
    {
      key: "ID_No",
      hide: true,
    },
    {
      key: "Short",
      hide: true,
    },
    {
      key: "SlipCode",
      hide: true,
    },
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

      <DepositTable
        disbaleTable={disabledFields}
        ref={checkTable}
        columns={checkColumns}
        rows={checkCollection}
        getSelectedItem={(rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
          const rowSelected = rowItm;
          setSelectedRows((d: any) => {
            const newSelected: any = {
              Deposit: "Check",//0
              Check_No: rowSelected[2],//1
              Check_Date: rowSelected[3],//2
              Bank: rowSelected[5],//3
              Amount: rowSelected[4],//4
              Name: rowSelected[6],//5
              DRCode: rowSelected[8],//7
              ORNo: rowSelected[0],//8
              DRRemarks: rowSelected[9],//9
              IDNo: rowSelected[10],//10
              TempOR: rowSelected[7],//11
              Short: rowSelected[11],//12
            };
            d = [...d, newSelected];
            return d;
          });

          setCollectionForDeposit((d: any) => {
            const newSelectedCheckForDeposit: any = {
              Bank: rowSelected[5],
              Check_No: rowSelected[2],
              Amount: rowSelected[4],
              TempOR: rowSelected[7],
            };
            d = [...d, newSelectedCheckForDeposit];
            return d;
          });

        }}
      />
    </div>
  );



}
function SelectedCollection() {
  const {
    setSelectedRows,
    selectedRows,
    selectedTable,
    cashTable,
    checkTable,
    setCollectionForDeposit,
    collectionForDeposit,
    collectionCheckTable
  } = useContext(DepositContext);

  const selectedCollectionColumns = [
    { key: "Deposit", label: "Deposit", width: 170 },
    { key: "Check_No", label: "Check No", width: 170 },
    {
      key: "Check_Date",
      label: "Check Date",
      width: 170,
    },
    { key: "Bank", label: "Bank/Branch", width: 200 },
    {
      key: "Amount", label: "Amount", width: 170, type: "number"
    },
    { key: "Name", label: "Client Name", width: 400 },
    // hide
    { key: "DRCode", label: "DRCode", hide: true },
    { key: "ORNo", label: "ORNo", hide: true },
    { key: "DRRemarks", label: "DRRemarks", hide: true },
    { key: "IDNo", label: "IDNo", hide: true },
    { key: "TempOR", label: "TempOR", hide: true },
    { key: "Short", label: "Short", hide: true },
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
      <DepositTableSelected
        ref={selectedTable}
        columns={selectedCollectionColumns}
        rows={selectedRows}
        getSelectedItem={(rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
          const rowSelected = rowItm;
          const selectedData = selectedTable.current.getData()

          if (rowSelected[0] === 'Cash') {
            const cashData = cashTable.current.getData()
            const getSelectedRow = cashTable.current.getSelectedRow()
            const rowIdx = cashData.findIndex((itm: any) => itm[7] === rowSelected[10])
            const index = getSelectedRow.indexOf(rowIdx);
            if (index !== -1) {
              getSelectedRow.splice(index, 1);
            }
            cashTable.current.setSelectedRow(getSelectedRow)
          } else {
            const cashData = checkTable.current.getData()
            const getSelectedRow = checkTable.current.getSelectedRow()
            const rowIdx = cashData.findIndex((itm: any) => itm[7] === rowSelected[10])
            const index = getSelectedRow.indexOf(rowIdx);
            if (index !== -1) {
              getSelectedRow.splice(index, 1);
            }
            checkTable.current.setSelectedRow(getSelectedRow)
          }

          setSelectedRows((d: any) => {
            if (d.length === 1 && d[0].TempOR === rowSelected[10]) {
              return []
            }
            return d.filter((itm: any) => itm.TempOR !== rowSelected[10])
          })



          const newData = (d: any) => {
            if (d.length === 1 && d[0].TempOR === rowSelected[10]) {
              return []
            }
            return d.filter((item: any) => item.TempOR !== rowSelected[10]);
          }
          const dd = newData(collectionForDeposit)
          setCollectionForDeposit(dd);

          const columns = collectionCheckTable.current?.getColumns()
          collectionCheckTable.current?.setData(dd.map((itm: any) => {
            return columns.map((col: any) => itm[col.key])
          }))


          if (selectedData.length === 1 && selectedData[0][10] === rowSelected[10]) {
            return selectedTable.current.setData([])
          } else {
            const newSelectedData = selectedData.filter((itm: any) => {
              return itm[10] !== rowSelected[10]
            })
            selectedTable.current.setData(newSelectedData)
          }



        }}
      />
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
    collectionCheckTable
  } = useContext(DepositContext);

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
          width: "70%",
          position: "relative",
        }}
      >
        <legend>Checks</legend>
        <DepositTableSelected
          isTableSelectable={false}
          ref={collectionCheckTable}
          width="100%"
          columns={[
            {
              key: "Bank",
              label: "Bank/Branch",
              width: 170,
            },
            {
              key: "Check_No",
              label: "Check No",
              width: 170,
            },
            {
              key: "Amount",
              label: "Amount",
              width: 300,
              type: "number"

            },
          ]}
          rows={collectionForDeposit}
          getSelectedItem={(rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
          }}
        />
      </fieldset>
      <fieldset
        style={{
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          alignSelf: "flex-end",
          display: "flex",
          width: "30%",
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
          id="cash-breakdown-table"
          style={{
            border: "2px solid black",
            borderCollapse: "collapse",
            width: "100%",
            background: "white"
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
              return <TrComponent
                key={idx}
                value1={items.value1}
                value2={items.value2}
                value3={items.value3}
                idx={idx}
              />
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                borderTop: "2px solid black",
                height: "auto",
              }}
            >
              <td colSpan={3}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "right",
                      justifyContent: "flex-end",
                      columnGap: "5px"
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      Total Cash Deposit:
                    </span>
                    <input
                      style={{
                        fontWeight: "bold",
                        border: "1px solid black",
                        textAlign: "right",
                        fontSize: "13px",
                        width: "180px",
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
    height: "18px",
    borderRight: "none",
    borderLeft: "none",
    borderTop: "none",
    outline: "none",
    borderBottom: "1px solid #cbd5e1",
    padding: "0 8px",
    width: "100%",
    fontSize: "13px",
    margin: "0 !important",

  };

  return (
    <tr  >
      <td
        style={{
          borderRight: "2px solid black",
          margin: "0",
          padding: "0",
          height: "15px"

        }}
      >
        <input
          disabled={true}
          className={`row-${idx} col-0`}
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
          margin: 0,
          padding: "0 !important",
          height: "15px"

        }}
      >
        <input
          className={`row-${idx} col-1`}
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
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
              e.preventDefault()
              const nextInput = document.querySelector(`#cash-breakdown-table td .row-${idx + 1}.col-1`) as HTMLInputElement
              if (nextInput) {
                nextInput.focus()
              }
            }
          }}
        />
      </td>
      <td
        style={{
          borderRight: "2px solid black",
          margin: "0",
          padding: "0 !important",
          height: "15px"
        }}
      >
        <input
          disabled={true}
          className={`row-${idx} col-2`}
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
const DepositTable = forwardRef(({
  columns,
  rows,
  height = "400px",
  width = "calc(100vw - 40px)",
  getSelectedItem,
  disbaleTable = false

}: any, ref) => {
  const parentElementRef = useRef<any>(null)
  const [data, setData] = useState([])
  const [column, setColumn] = useState([])
  const [selectedRow, setSelectedRow] = useState<Array<any>>([])
  const [selectedRowIndex, setSelectedRowIndex] = useState<any>(0)

  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)


  useEffect(() => {
    if (columns.length > 0) {
      setColumn(columns.filter((itm: any) => !itm.hide))
    }
  }, [columns])

  useEffect(() => {
    if (rows.length > 0) {
      setData(rows.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    }
  }, [rows, columns])

  useImperativeHandle(ref, () => ({
    getData: () => {
      return data
    },
    setData: (newData: any) => {
      setData(newData)
    },
    setSelectedRow: (rowIdx: any) => {
      setSelectedRow(rowIdx)
    },
    getSelectedRow: (rowIdx: any) => {
      return selectedRow
    },
    getColumns: () => {
      return columns
    },
    resetTable: () => {
      setData([])
      setSelectedRow([])
    },
    setDataFormated: (newData: any) => {
      setData(newData.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    },
    parentElement: () => {
      return parentElementRef.current
    },
  }))


  return (
    <Fragment>
      <div ref={parentElementRef}
        style={{
          width,
          height,
          overflow: "auto",
          position: "relative",
          pointerEvents: disbaleTable ? "none" : "auto",
          border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
          boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`
        }}>
        <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
          <table id="upward-cutom-table" style={{ borderCollapse: "collapse", width: "100%", position: "relative" }}>
            <thead >
              <tr>
                <th style={{ width: '30px', border: "none", position: "sticky", top: 0, zIndex: 1, background: "#f0f0f0" }}
                ></th>
                {
                  column.map((colItm: any, idx: number) => {
                    return (
                      <th
                        key={idx}
                        style={{
                          width: colItm.width,
                          borderRight: "1px solid #e2e8f0",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          background: "#f0f0f0",
                          fontSize: "12px",
                          padding: "0px 5px",
                          textAlign: colItm.type === 'number' ? "center" : "left"
                        }}
                      >{colItm.label}</th>
                    )
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                data?.map((rowItm: any, rowIdx: number) => {
                  return (
                    <tr
                      key={rowIdx}
                      className={`tr-row-${rowIdx} row ${selectedRow.includes(rowIdx) || (selectedRowIndex === rowIdx) ? "selected" : ""}`}

                    >
                      <td style={{
                        position: "relative",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        margin: 0,
                        background: selectedRow.includes(rowIdx) ? "#bae6fd" : "",
                      }}
                      >
                        <div style={{
                          width: "18px",
                          height: "18px",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <input
                            className="check-input"
                            style={{
                              cursor: "pointer",
                              background: "transparent"
                            }}
                            readOnly={true}
                            type="checkbox"
                            checked={selectedRow.includes(rowIdx)}
                            onClick={() => {
                              if (selectedRow.includes(rowIdx)) {
                                return
                              }

                              setSelectedRow((d: any) => {
                                return [...d, rowIdx]
                              })

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null)
                              }
                            }}
                          />

                        </div>

                      </td>

                      {
                        column.map((colItm: any, colIdx: number) => {
                          return (
                            <td
                              onDoubleClick={() => {
                                if (selectedRow.includes(rowIdx)) {
                                  return
                                }

                                setSelectedRow((d: any) => {
                                  return [...d, rowIdx]
                                })
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, colItm, rowIdx, colIdx)
                                }
                              }}
                              onClick={() => {
                                setSelectedRowIndex(rowIdx)
                              }}
                              key={colIdx}
                              style={{
                                border: "none",
                                fontSize: "12px",
                                padding: "0px 5px",
                                cursor: "pointer",
                                height: "20px",
                                userSelect: "none",
                              }}
                            >{
                                <input
                                  readOnly={true}
                                  value={rowItm[colIdx]}
                                  style={{

                                    width: colItm.width,
                                    pointerEvents: "none",
                                    border: "none",
                                    background: "transparent",
                                    userSelect: "none",
                                    height: "100%",
                                    textAlign: colItm.type === 'number' ? "right" : "left"

                                  }} />
                              }</td>
                          )
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  )
})
const DepositTableSelected = forwardRef(({
  columns,
  rows,
  height = "400px",
  getSelectedItem,
  disbaleTable = false,
  isTableSelectable = true
}: any, ref) => {
  const parentElementRef = useRef<any>(null)
  const [data, setData] = useState([])
  const [column, setColumn] = useState([])
  const [selectedRow, setSelectedRow] = useState<any>(0)
  const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)


  useEffect(() => {
    if (columns.length > 0) {
      setColumn(columns.filter((itm: any) => !itm.hide))
    }
  }, [columns])

  useEffect(() => {
    if (rows.length > 0) {
      setData(rows.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    }
  }, [rows, columns])

  useImperativeHandle(ref, () => ({
    getData: () => {
      return data
    },
    setData: (newData: any) => {
      setData(newData)
    },
    getColumns: () => {
      return columns
    },
    resetTable: () => {
      setData([])
      setSelectedRow(0)
    },
    setDataFormated: (newData: any) => {
      setData(newData.map((itm: any) => {
        return columns.map((col: any) => itm[col.key])
      }))
    }
  }))





  return (
    <Fragment>
      <div
        ref={parentElementRef}
        style={{
          width: "100%",
          height,
          overflow: "auto",
          position: "relative",
          pointerEvents: disbaleTable ? "none" : "auto",
          border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
          boxShadow: `inset -2px -2px 0 #ffffff, 
                      inset 2px 2px 0 #808080`,
          background: "#dcdcdc"


        }}>
        <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
          <table id="upward-cutom-table" style={{ borderCollapse: "collapse", width: "100%", position: "relative" }}>
            <thead >
              <tr style={{
                background: "#f0f0f0",
              }}>
                <th style={{
                  width: '30px',
                  border: "none",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "#f0f0f0"
                }}
                ></th>
                {
                  column.map((colItm: any, idx: number) => {
                    return (
                      <th
                        key={idx}
                        style={{
                          width: colItm.width,
                          borderRight: "1px solid #e2e8f0",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          fontSize: "12px",
                          padding: "0px 5px",
                          background: "#f0f0f0",
                          textAlign: colItm.type === 'number' ? "center" : "left"

                        }}
                      >{colItm.label}</th>
                    )
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                data?.map((rowItm: any, rowIdx: number) => {
                  return (
                    <tr
                      key={rowIdx}
                      className={`tr-row-${rowIdx} row ${(selectedRow === rowIdx) ? "selected" : ""}`}
                    >
                      <td style={{
                        position: "relative",
                        border: "none",
                        cursor: "pointer",
                        background: selectedRow === rowIdx ? "#0076d" : "",
                        padding: 0,
                        margin: 0,

                      }}>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <input
                            style={{
                              cursor: "pointer",
                              margin: "0px !important",
                              position: "absolute",
                            }}
                            readOnly={true}
                            checked={false}
                            type="checkbox"
                            onClick={() => {
                              if (!isTableSelectable) {
                                return
                              }

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null)
                              }
                              setSelectedRow(null)

                            }}
                          />
                        </div>

                      </td>

                      {
                        column.map((colItm: any, colIdx: number) => {
                          return (
                            <td
                              onDoubleClick={() => {
                                if (!isTableSelectable) {
                                  return
                                }
                                if (getSelectedItem) {
                                  getSelectedItem(rowItm, null, rowIdx, null)
                                }
                                setSelectedRow(null)

                              }}
                              onClick={() => {
                                setSelectedRow(rowIdx)
                              }}
                              key={colIdx}
                              style={{
                                border: "none",
                                fontSize: "12px",
                                padding: "0px 5px",
                                cursor: "pointer",
                                height: "20px",
                                userSelect: "none",
                              }}
                            >{
                                <input
                                  readOnly={true}
                                  value={rowItm[colIdx]}
                                  style={{
                                    width: colItm.width,
                                    pointerEvents: "none",
                                    border: "none",
                                    background: "transparent",
                                    userSelect: "none",
                                    height: "100%",
                                    textAlign: colItm.type === 'number' ? "right" : "left"

                                  }} />
                              }</td>
                          )
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  )
})
function useMultipleComponent(steps: any) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);


  function goTo(index: number) {
    // Ensure the index is within bounds
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }

  return {
    goTo,
    currentStepIndex,
  };
}



