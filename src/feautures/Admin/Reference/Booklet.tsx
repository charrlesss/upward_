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
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { wait } from "@testing-library/user-event/dist/utils";
import { format } from "date-fns";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SearchIcon from "@mui/icons-material/Search";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { AuthContext } from "../../../components/AuthContext";
import PageHelmet from "../../../components/Helmet";
import { SelectInput, TextInput } from "../../../components/UpwardFields";
import {
  DataGridViewReactMultipleSelection,
  DataGridViewReactUpgraded,
} from "../../../components/DataGridViewReact";
import "../../../style/laoding.css";
import "../../../style/monbileview/accounting/deposit.css";
import { Loading } from "../../../components/Loading";
import { formatNumber, getSum } from "../Task/Accounting/ReturnCheck";

const columnsSelectCheck = [
  { key: "Deposit_Slip", label: "Deposit_Slip", width: 100 },
  { key: "Depo_Date", label: "Depo_Date", width: 130 },
  {
    key: "Check_No",
    label: "Check_No",
    width: 200,
  },
  {
    key: "Check_Date",
    label: "Check_Date",
    width: 200,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 200,
  },
  {
    key: "Bank",
    label: "Bank",
    width: 200,
  },
  {
    key: "Official_Receipt",
    label: "Official_Receipt",
    width: 100,
  },
  {
    key: "Date_OR",
    label: "Date_OR",
    width: 100,
  },
  {
    key: "BankAccount",
    label: "BankAccount",
    width: 0,
    hide: true,
  },
  {
    key: "_formatted_date",
    label: "_formatted_date",
    width: 0,
    hide: true,
  },
  {
    key: "Deposit_ID",
    label: "",
    width: 0,
    hide: true,
  },
];
const columnsSelectedCheckToBeReturned = [
  { key: "ORNo", label: "OR No.", width: 80 },
  { key: "ORDate", label: "OR Date", width: 130 },
  {
    key: "DepoSlip",
    label: "Depo Slip",
    width: 130,
  },
  {
    key: "DepoDate",
    label: "Depo Date",
    width: 130,
  },
  {
    key: "CheckNo",
    label: "Check No.",
    width: 130,
  },
  {
    key: "CheckDate",
    label: "Check Date",
    width: 130,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 130,
  },
  {
    key: "Bank",
    label: "Bank/Branch",
    width: 100,
  },
  {
    key: "BankAccount",
    label: "Bank Account",
    width: 200,
  },
  {
    key: "Reason",
    label: "Reason",
    width: 200,
  },
  {
    key: "ReturnDate",
    label: "Return Date",
    width: 200,
  },
  {
    key: "Temp_OR",
    label: "",
    width: 0,
    hide: true,
  },
];
const columnsAccountingEntry = [
  { key: "Code", label: "Code", width: 80 },
  { key: "AccountName", label: "Account Name", width: 200 },
  {
    key: "Debit",
    label: "Debit",
    width: 130,
  },
  {
    key: "Credit",
    label: "Credit",
    width: 130,
  },
  {
    key: "IDNo",
    label: "ID No.",
    width: 200,
  },
  {
    key: "Identity",
    label: "Identity",
    width: 350,
  },
  {
    key: "SubAcct",
    label: "Sub Acct",
    width: 130,
  },
  {
    key: "SubAcctName",
    label: "Sub Acct Name",
    width: 130,
  },
  {
    key: "CheckNo",
    label: "Check No",
    width: 120,
  },
  {
    key: "Bank",
    label: "Bank/Branch",
    width: 350,
  },
  {
    key: "CheckDate",
    label: "Check Date",
    width: 100,
  },
  {
    key: "CheckReturn",
    label: "Check Return",
    width: 100,
  },
  {
    key: "CheckReason",
    label: "Check Reason",
    width: 150,
  },
  {
    key: "PK",
    label: "PK",
    width: 100,
  },
  {
    key: "DateDeposit",
    label: "Date Deposit",
    width: 100,
  },
  {
    key: "DateCollection",
    label: "Date Collection",
    width: 100,
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{
        display: "flex",
        flex: 1,
        position: "absolute",
        top: index === 0 ? "170px" : "145px",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "5px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {value === index && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

let selected: Array<any> = [];
let accountingEntry: Array<any> = [];

export default function Deposit() {
  const [value, setValue] = useState(0);
  const { user, myAxios } = useContext(AuthContext);
  const [mode, setMode] = useState("");

  const inputSearchRef = useRef<HTMLInputElement>(null);
  const searchChecksRef = useRef<HTMLInputElement>(null);

  const refNoRef = useRef<HTMLInputElement>(null);
  const refDate = useRef<HTMLInputElement>(null);
  const refExp = useRef<HTMLInputElement>(null);

  const selectedChecksTableRef = useRef<any>(null);
  const selectedChecksToBeReturnTableRef = useRef<any>(null);
  const accountingEntryTableRef = useRef<any>(null);
  const modalReturnCheckEntriesRef = useRef<any>(null);

  const { isLoading: isLoadingReturnChecksID, refetch } = useQuery({
    queryKey: "generate-id",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/return-checks/generate-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess(res) {
      wait(100).then(() => {
        if (refNoRef.current) {
          refNoRef.current.value = res.data.newRefCode;
        }
      });
    },
  });
  const { isLoading: isLoadingCheckSelected, mutate: mutateCheckSelected } =
    useMutation({
      mutationKey: "load-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/task/accounting/get-check-list`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        console.log(res.data.checkList);
        selectedChecksTableRef.current.setData(res.data.checkList);
      },
    });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      mutateCheckSelected({ search: searchChecksRef.current?.value });
      setTimeout(() => {
        if (selectedChecksTableRef.current) {
          const checks = selectedChecksTableRef.current.getData?.();
          if (checks?.length > 0) {
            const getRowIndexs = checks
              .filter((itm: any) => selected.includes(itm.Deposit_ID))
              .map((itm: any) => itm.rowIndex);

            console.log(getRowIndexs);
            selectedChecksTableRef.current.setSelectedRow(
              getRowIndexs
            );
          }
        }
      }, 100);
      console.log(selected);
    }
    setValue(newValue);
  };
  const resetAll = () => {};
  const handleSave = (e: any) => {
    e.preventDefault();

    // const state = {
    //   depositSlip: refSlipCode.current?.value,
    //   depositdate: refDateDepo.current?.value,
    //   BankAcctCode: refBankAcctCode.current?.value,
    //   BankAcctName: refBankAcctName.current?.value,
    //   BankAcctCodeTag: refBankAcctCodeTag.current,
    //   BankAcctNameTag: refBankAcctNameTag.current,
    //   AcctID: refAcctID.current,
    //   AcctName: refAcctName.current,
    //   Classification: refClassification.current,
    //   SubAccount: refSubAccount.current,
    //   ShortName: refShortName.current,
    // };

    // const newCashData = cashData
    //   .filter((itm) => selected.includes(itm.Temp_OR))
    //   .map((itm: any) => {
    //     return {
    //       Deposit: "Cash",
    //       Check_No: "",
    //       Check_Date: "",
    //       Bank: "",
    //       Amount: itm.Amount,
    //       Name: itm.Client_Name,
    //       DRCode: itm.DRCode,
    //       ORNo: itm.OR_No,
    //       DRRemarks: "",
    //       IDNo: itm.ID_No,
    //       TempOR: itm.Temp_OR,
    //       Short: itm.Short,
    //     };
    //   });
    // const newCheckData = checkData
    //   .filter((itm) => selected.includes(itm.Temp_OR))
    //   .map((itm: any) => {
    //     return {
    //       Deposit: "Check", //0
    //       Check_No: itm.Check_No, //1
    //       Check_Date: itm.Check_Date, //2
    //       Bank: itm.Bank_Branch, //3
    //       Amount: itm.Amount, //4
    //       Name: itm.Client_Name, //5
    //       DRCode: itm.DRCode, //7
    //       ORNo: itm.OR_No, //8
    //       DRRemarks: itm.DRRemarks, //9
    //       IDNo: itm.ID_No, //10
    //       TempOR: itm.Temp_OR, //11
    //       Short: itm.Short, //12
    //     };
    //   });
    // const selectedData = [...newCashData, ...newCheckData];

    // if (depositMode === "edit") {
    //   codeCondfirmationAlert({
    //     isUpdate: true,
    //     cb: (userCodeConfirmation) => {
    //       updateDepositMutation({
    //         ...state,
    //         userCodeConfirmation,
    //         selectedCollection: JSON.stringify(selectedData),
    //         tableRowsInputValue: JSON.stringify(tableRowsInputValue),
    //       });
    //     },
    //   });
    // } else {
    //   saveCondfirmationAlert({
    //     isConfirm: () => {
    //       addDepositMutation({
    //         ...state,
    //         selectedCollection: JSON.stringify(selectedData),
    //         tableRowsInputValue: JSON.stringify(tableRowsInputValue),
    //       });
    //     },
    //   });
    // }
  };
  const handleOnSave = () => {};

  useEffect(() => {
    if (value === 0) {
      mutateCheckSelected({ search: searchChecksRef.current?.value });
    } else if (value === 1) {
      selectedChecksToBeReturnTableRef.current.setData(selected);
    } else if (value === 2) {
      accountingEntryTableRef.current.setData(accountingEntry);
    }
  }, [value, mutateCheckSelected]);

  return (
    <>
      <PageHelmet title="Returned Checks" />
      {(isLoadingReturnChecksID || isLoadingCheckSelected) && <Loading />}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          position: "relative",
          padding: "10px",
          background: "#F1F1F1",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            marginBottom: "10px",
          }}
        >
          <TextInput
            containerClassName="search-input"
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
                  // searchReturnCheckCreditOpenModal(e.currentTarget.value);
                }
              },
              style: { width: "500px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              // if (inputSearchRef.current)
              // searchReturnCheckCreditOpenModal(inputSearchRef.current.value);
            }}
            inputRef={inputSearchRef}
          />
          <div
            className="return-checks-desktop-buttons"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "10px",
            }}
          >
            {mode === "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setMode("add");
                }}
              >
                New
              </Button>
            )}
            {mode !== "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                id="save-entry-header"
                color="primary"
                variant="contained"
                type="submit"
                startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
                onClick={handleOnSave}
              >
                Save
              </Button>
            )}
            <Button
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              disabled={mode === ""}
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
                      // resetReturnChecks();
                    });
                  }
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div
          className="layer-one"
          style={{
            display: "flex",
            width: "100%",
            padding: "5px 10px",
            flexDirection: "column",
            rowGap: "10px",
            marginBottom: "10px",
            position: "relative",
          }}
        >
          <div
            className="content"
            style={{
              display: "flex",
              columnGap: "200px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Ref No.: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: mode === "",
                readOnly: true,
                className: "ref_no",
                type: "text",
                style: { width: "200px" },
                defaultValue: "",
              }}
              inputRef={refNoRef}
              icon={<AutorenewIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                refetch();
              }}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Date : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: mode === "",
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                className: "date",
                type: "date",
                style: { width: "200px" },
              }}
              inputRef={refDate}
            />
          </div>
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Explanation : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              disabled: mode === "",
              className: "exp",
              type: "text",
              style: { width: "670px" },
              defaultValue: "Returned Checks",
            }}
            inputRef={refExp}
          />
        </div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            style={{
              minHeight: "25px",
            }}
          >
            <Tab
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  SELECT CHECK
                </span>
              }
              sx={{
                width: "250px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              {...a11yProps(0)}
            />
            <Tab
              sx={{
                width: "250px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  SELECTED CHECK TO BE RETURNED
                </span>
              }
              {...a11yProps(1)}
            />
            <Tab
              sx={{
                width: "250px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  ACCOUNTING ENTRY
                </span>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TextInput
          containerStyle={{
            marginTop: "5px",
            zIndex: value === 0 ? 5 : 0,
          }}
          containerClassName="search-input"
          label={{
            title: "Search Check : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "100px",
            },
          }}
          input={{
            className: "search-input-up-on-key-down",
            type: "search",
            defaultValue: "",
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
                // searchReturnCheckCreditOpenModal(e.currentTarget.value);
              }
            },
            style: { width: "calc(100% - 100px)" },
          }}
          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault();
            // if (inputSearchRef.current)
            // searchReturnCheckCreditOpenModal(inputSearchRef.current.value);
          }}
          inputRef={searchChecksRef}
        />
        <CustomTabPanel value={value} index={0}>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <DataGridViewReactUpgraded
              ref={selectedChecksTableRef}
              disableUnselection={true}
              adjustVisibleRowCount={250}
              columns={columnsSelectCheck}
              handleSelectionChange={(rowItm: any) => {
                if (rowItm) {
                  if (
                    selected
                      .map((itm) => itm.ORNo)
                      .includes(rowItm.Official_Receipt)
                  ) {
                    alert(`Check ${rowItm.Check_No} already exist!`);
                    wait(100).then(() => {
                      selectedChecksTableRef.current.setSelectedRow(null);
                    });
                    return;
                  }

                  modalReturnCheckEntriesRef.current.showModal();
                  modalReturnCheckEntriesRef.current.setRefs({
                    checkNo: rowItm.Check_No,
                    amount: rowItm.Amount,
                  });
                  modalReturnCheckEntriesRef.current.mutateEntries({
                    ORNo: rowItm.Official_Receipt,
                    Account_No: rowItm.BankAccount,
                  });
                  modalReturnCheckEntriesRef.current.selectItem(rowItm);
                } else {
                }
              }}
            />
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <DataGridViewReactMultipleSelection
              ref={selectedChecksToBeReturnTableRef}
              disableUnselection={true}
              adjustVisibleRowCount={210}
              columns={columnsSelectedCheckToBeReturned}
              handleSelectionChange={(row: any) => {
                if (row) {
                } else {
                }
              }}
            />
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <DataGridViewReactUpgraded
              ref={accountingEntryTableRef}
              adjustVisibleRowCount={210}
              columns={columnsAccountingEntry}
              handleSelectionChange={(rowItm: any) => {
                if (rowItm) {
                } else {
                }
              }}
            />
          </div>
        </CustomTabPanel>
      </div>
      <ModalReturnCheckEntries
        ref={modalReturnCheckEntriesRef}
        handleConfirm={(row: any, state: any, ref: any) => {
          if (state.lblTextRef !== state.refAmount) {
            return alert("Debit must equal to Credit!");
          }

          const retDebit =
            modalReturnCheckEntriesRef.current.table.current.getData();

          const RetReason =
            ref.refReturnReason.current?.selectedIndex === 2
              ? "AC"
              : ref.refReturnReason.current?.value;

          const RetDateRet = ref.refDateReturned.current?.value;
          const retCredit: any = [];
          retCredit[0] = state.refAccountID;
          retCredit[1] = state.refAccountName;
          retCredit[2] = state.refAmount;
          retCredit[3] = state.refAcronym;
          retCredit[4] = state.refSubAccount;
          retCredit[5] = state.refAccountId;

          // SelectedCheckToBeReturned
          selected.push({
            ORNo: row.Official_Receipt,
            ORDate: row.Date_OR,
            DepoSlip: row.Deposit_Slip,
            DepoDate: row.Depo_Date,
            CheckNo: row.Check_No,
            CheckDate: row.Check_Date,
            Amount: row.Amount,
            Bank: row.Bank,
            BankAccount: row.BankAccount,
            Reason: RetReason,
            ReturnDate: format(new Date(RetDateRet), "MM/dd/yyyy"),
          });

          // Accounting Entry
          let newSelectedDataAccountingEntry: any = [];
          for (let i = 0; i < retDebit.length; i++) {
            newSelectedDataAccountingEntry.push({
              Code: retDebit[i].CRCode,
              AccountName: retDebit[i].CRTitle,
              Debit: retDebit[i].Credit,
              Credit: "0.00",
              IDNo: retDebit[i].CRLoanID,
              Identity: retDebit[i].CRLoanName,
              SubAcct: retDebit[i].SAcctCode,
              SubAcctName: retDebit[i].SAcctName,
              CheckNo: row.Check_No,
              Bank: row.Bank,
              CheckDate: row.Check_Date,
              CheckReturn: format(new Date(RetDateRet), "MM/dd/yyyy"),
              CheckReason: RetReason,
              PK: row.Check_No,
              DateDeposit: row.Depo_Date,
              DateCollection: row.Date_OR,
              Temp_OR: retDebit[i].Temp_OR,
            });
          }
          newSelectedDataAccountingEntry.push({
            Code: state.refAccountID,
            AccountName: state.refAccountName,
            Debit: "0.00",
            Credit: state.refAmount,
            IDNo: state.refAccountId,
            Identity: state.identityRef,
            SubAcct: state.refAcronym,
            SubAcctName: state.refSubAccount,
            CheckNo: row.Check_No,
            Bank: row.Bank,
            CheckDate: row.Check_Date,
            CheckReturn: format(new Date(RetDateRet), "MM/dd/yyyy"),
            CheckReason: RetReason,
            PK: row.Check_No,
            DateDeposit: row.Depo_Date,
            DateCollection: row.Date_OR,
            Temp_OR: row.Official_Receipt,
          });
          accountingEntry.push(...newSelectedDataAccountingEntry);
        
        
          selectedChecksTableRef.current.setSelectedRow(null);
          modalReturnCheckEntriesRef.current.closeModal();
        }}
        handleCancel={(row: any) => {
                selectedChecksTableRef.current.setSelectedRow(null);
    
        }}
      />
    </>
  );
}

const ModalReturnCheckEntries = forwardRef(
  ({ handleConfirm, handleCancel, hasSelectedRow }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const { user, myAxios } = useContext(AuthContext);
    const table = useRef<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [selectedItem, setSelectedItem] = useState([]);
    const [blick, setBlick] = useState(false);
    const [checkNo, setcheckNo] = useState("");
    // return details
    const refReturnReason = useRef<HTMLSelectElement>(null);
    const refDateReturned = useRef<HTMLInputElement>(null);

    // credit entry
    const refAccountName = useRef<HTMLInputElement>(null);
    const refAmount = useRef<HTMLInputElement>(null);
    const refAccountId = useRef<HTMLInputElement>(null);
    const refSubAccount = useRef<HTMLInputElement>(null);

    const refAccountID = useRef("");
    const refAcronym = useRef("");
    const identityRef = useRef("");

    const lblTextRef = useRef<HTMLInputElement>(null);

    const { isLoading: isLoadingEntries, mutate: mutateEntries } = useMutation({
      mutationKey: "load-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/return-check/load-entries`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        const dt1 = res.data.dt1;
        const dt2 = res.data.dt2;
        if (dt1.length > 0) {
          if (refAccountId.current) {
            refAccountId.current.value = dt1[0].IDNo;
          }
          if (refAccountName.current) {
            refAccountName.current.value = dt1[0].Short;
          }
          if (refSubAccount.current) {
            refSubAccount.current.value = "Head Office";
          }
          refAcronym.current = "HO";
          refAccountID.current = dt1[0].Account_ID;
          identityRef.current = dt1[0].Shortname;
        }

        if (dt2.length > 0) {
          const data = dt2.map((itm: any) => {
            return {
              CRCode: itm.CRCode,
              CRTitle: itm.CRTitle,
              Credit: itm.Credit,
              CRLoanID: itm.CRLoanID,
              CRLoanName: itm.CRLoanName,
              SAcctCode: itm.SubAcct,
              SAcctName: itm.ShortName,
              Temp_OR: itm.Temp_OR,
            };
          });
          table.current.setData(data);
        }

        if (lblTextRef.current)
          lblTextRef.current.value = formatNumber(getSum(dt2, "Debit"));
      },
    });

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      closeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        const refs = {};
        return refs;
      },
      selectItem: (itm: any) => {
        setSelectedItem(itm);
      },
      setRefs: (props: any) => {
        setcheckNo(props.checkNo);
        wait(100).then(() => {
          if (refAmount.current) refAmount.current.value = props.amount;
          if (refReturnReason.current) refReturnReason.current.value = "DAIF";
        });
      },
      mutateEntries: (variables: string) => {
        mutateEntries(variables);
      },
      table,
    }));

    const columns = [
      { key: "CRCode", label: "Code", width: 90 },
      { key: "CRTitle", label: "Account Name", width: 200 },
      {
        key: "Credit",
        label: "Amount",
        width: 110,
      },
      {
        key: "CRLoanID",
        label: "ID No",
        width: 200,
      },
      {
        key: "CRLoanName",
        label: "Identity",
        width: 200,
      },
      {
        key: "SAcctCode",
        label: "Sub Account",
        width: 100,
      },
      {
        key: "SAcctName",
        label: "Sub Account Name",
        width: 200,
      },
      {
        key: "Temp_OR",
        label: "",
        width: 0,
        hide: true,
      },
    ];

    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    return showModal ? (
      <>
        {isLoadingEntries && <Loading />}
        <div
          className="modal-accounting-entry-shadow"
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        <div
          className="modal-accounting-entry"
          ref={modalRef}
          style={{
            height: blick ? "452px" : "450px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "65%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <span
              className="modal-title"
              style={{ fontSize: "13px", fontWeight: "bold" }}
            >
              Return Detail and Accounting Entry (Check No.: {checkNo})
            </span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                setShowModal(false);
                handleCancel(selectedItem);
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                columnGap: "5px",
                height: "auto",
              }}
              className="modal-content"
            >
              <div
                style={{
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                  rowGap: "20px",
                }}
              >
                <div
                  style={{
                    height: "auto",
                    padding: "10px",
                    display: "flex",
                    width: "100%",
                    border: "1px solid #64748b",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-15px",
                      left: "20px",
                      background: "#F1F1F1",
                      padding: "0 5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Return Detail
                  </span>
                  <div
                    className="modal-layer-one"
                    style={{
                      display: "flex",
                      columnGap: "50px",
                    }}
                  >
                    <SelectInput
                      containerStyle={{ width: "100%" }}
                      label={{
                        title: "Return Reason : ",
                        style: {
                          fontSize: "12px",
                          fontWeight: "bold",
                          width: "100px",
                        },
                      }}
                      selectRef={refReturnReason}
                      select={{
                        style: { width: "calc(85% - 100px)", height: "22px" },
                        defaultValue: "",
                      }}
                      datasource={[
                        { key: "DAIF", value: "DAIF" },
                        { key: "DAUD", value: "DAUD" },
                        { key: "Account Closed", value: "Account Closed" },
                        { key: "SPO", value: "SPO" },
                        {
                          key: "Account under Garnishment",
                          value: "Account under Garnishment",
                        },
                        {
                          key: "Unauthorized Signature",
                          value: "Unauthorized Signature",
                        },
                      ]}
                      values={"value"}
                      display={"key"}
                    />
                    <TextInput
                      containerClassName="custom-input"
                      label={{
                        title: "Return Date : ",
                        style: {
                          fontSize: "12px",
                          fontWeight: "bold",
                          width: "100px",
                        },
                      }}
                      input={{
                        defaultValue: format(new Date(), "yyyy-MM-dd"),
                        className: "date",
                        type: "date",
                        style: { width: "200px" },
                      }}
                      inputRef={refDateReturned}
                    />
                  </div>
                </div>
                <div
                  style={{
                    height: "auto",
                    padding: "10px",
                    display: "flex",
                    width: "100%",
                    border: "1px solid #64748b",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-15px",
                      left: "20px",
                      background: "#F1F1F1",
                      padding: "0 5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Credit Entry
                  </span>
                  <div
                    className="modal-layer-two"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                      height: "auto",
                    }}
                  >
                    <div
                      className="content"
                      style={{
                        display: "flex",
                        columnGap: "50px",
                      }}
                    >
                      <TextInput
                        containerClassName="custom-input"
                        label={{
                          title: "Account Name : ",
                          style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                          },
                        }}
                        input={{
                          readOnly: true,
                          className: "ref_no",
                          type: "text",
                          style: { width: "200px" },
                        }}
                        inputRef={refAccountName}
                      />
                      <TextInput
                        containerClassName="custom-input"
                        label={{
                          title: "Account ID : ",
                          style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                          },
                        }}
                        input={{
                          readOnly: true,
                          className: "account-id",
                          type: "text",
                          style: { width: "200px" },
                        }}
                        inputRef={refAccountId}
                      />
                    </div>
                    <div
                      className="content"
                      style={{
                        display: "flex",
                        columnGap: "50px",
                      }}
                    >
                      <TextInput
                        containerClassName="custom-input"
                        label={{
                          title: "Amount : ",
                          style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                          },
                        }}
                        input={{
                          readOnly: true,
                          className: "ref_no",
                          type: "text",
                          style: { width: "200px" },
                        }}
                        inputRef={refAmount}
                      />
                      <TextInput
                        containerClassName="custom-input"
                        label={{
                          title: "Sub Account : ",
                          style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                          },
                        }}
                        input={{
                          readOnly: true,
                          className: "sub-account",
                          type: "text",
                          style: { width: "200px" },
                        }}
                        inputRef={refSubAccount}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="modal-buttons"
                style={{
                  width: "100px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  rowGap: "20px",
                  height: "auto",
                }}
              >
                <BlinkingButton
                  style={{
                    width: "80px",
                    height: "50px",
                    border: "1px solid #153002",
                    fontSize: "12px",
                    padding: 0,
                    margin: 0,
                    boxSizing: "border-box",
                    background: "#8fbc8b",
                    color: "black",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "arial",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={(e: any) => {
                    const data = table.current.getData();
                    const state = {
                      refReturnReason: refReturnReason.current?.value,
                      refDateReturned: refDateReturned.current?.value,
                      refAccountName: refAccountName.current?.value,
                      refAmount: refAmount.current?.value,
                      refAccountId: refAccountId.current?.value,
                      refSubAccount: refSubAccount.current?.value,
                      refAccountID: refAccountID.current,
                      refAcronym: refAcronym.current,
                      identityRef: identityRef.current,
                      lblTextRef: lblTextRef.current?.value,
                    };
                    const ref = {
                      refReturnReason,
                      refDateReturned,
                      refAccountName,
                      refAmount,
                      refAccountId,
                      refSubAccount,
                      refAccountID,
                      refAcronym,
                      lblTextRef,
                    };
                    handleConfirm(selectedItem, state, ref);
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22px"
                      height="22px"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M8.5 12.5L10.5 14.5L15.5 9.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                        stroke="#a5e15b"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span
                    className="button-tittle"
                    style={{
                      position: "absolute",
                      top: "25px",
                    }}
                  >
                    Accept
                  </span>
                </BlinkingButton>
                <BlinkingButton
                  style={{
                    width: "80px",
                    height: "50px",
                    border: "1px solid #153002",
                    fontSize: "12px",
                    padding: 0,
                    margin: 0,
                    boxSizing: "border-box",
                    background: "#8fbc8b",
                    color: "black",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "arial",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={(e: any) => {
                    setShowModal(false);
                    handleCancel(selectedItem);
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="red"
                      width="21px"
                      height="21px"
                      viewBox="0 0 36 36"
                      version="1.1"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <title>ban-line</title>
                      <path
                        className="clr-i-outline clr-i-outline-path-1"
                        d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM4,18A13.93,13.93,0,0,1,7.43,8.85L27.15,28.57A14,14,0,0,1,4,18Zm24.57,9.15L8.85,7.43A14,14,0,0,1,28.57,27.15Z"
                      />
                      <rect
                        x="0"
                        y="0"
                        width="36"
                        height="36"
                        fillOpacity="0"
                      />
                    </svg>
                  </span>
                  <span
                    className="button-tittle"
                    style={{
                      position: "absolute",
                      top: "25px",
                    }}
                  >
                    Cancel
                  </span>
                </BlinkingButton>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                zIndex: 2,
              }}
            >
              <DataGridViewReactUpgraded
                ref={table}
                fixedRowCount={10}
                adjustOnRezise={false}
                adjustVisibleRowCount={350}
                columns={columns}
                handleSelectionChange={(rowItm: any) => {
                  if (rowItm) {
                    wait(100).then(() => {});
                  } else {
                    wait(100).then(() => {});
                  }
                }}
                onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
                  if (e.code === "Delete" || e.code === "Backspace") {
                    const isConfim = window.confirm(
                      `Are you sure you want to delete?`
                    );
                    if (isConfim) {
                      return;
                    }
                  }
                }}
              />
            </div>
            <input
              style={{
                width: "100%",
                textAlign: "right",
                fontWeight: "bold",
                paddingRight: "10px",
                marginTop: "5px",
              }}
              ref={lblTextRef}
              defaultValue={"0.00"}
              readOnly
            />
          </div>
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);

const BlinkingButton = ({ onClick, style, children }: any) => {
  const uniClass = `btn-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const [isBlinking, setIsBlinking] = useState(false);

  const handleClick = (e: any) => {
    setIsBlinking(true); // Start blinking
    setTimeout(() => setIsBlinking(false), 200); // Stop blinking after 1 second
    onClick(e);
  };
  return (
    <>
      <button
        className={`${uniClass} ${
          isBlinking ? "blinking" : ""
        } blinking-button-access-class`}
        onClick={handleClick}
        style={style}
      >
        {children}
      </button>
      <style>
        {`
        .${uniClass} {
          padding: 10px 20px;
          font-size: 16px;
          color: white;
          border: ${isBlinking ? "2px solid #153002 !important" : "none "};
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;

        }

        .${uniClass}:hover {
          background-color:rgb(145, 177, 142) !important;
        }

        /* Blink animation */
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        .blinking {
          animation: blink 0.5s linear infinite;
        }
                `}
      </style>
    </>
  );
};
