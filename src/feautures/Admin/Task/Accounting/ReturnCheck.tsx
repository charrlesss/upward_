import {
  useState,
  useContext,
  useEffect,
  useRef,
  forwardRef,
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
import { AuthContext } from "../../../../components/AuthContext";
import PageHelmet from "../../../../components/Helmet";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import "../../../../style/monbileview/accounting/deposit.css";
import { Loading } from "../../../../components/Loading";
import HandshakeIcon from "@mui/icons-material/Handshake";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";

const columnsSelectCheck = [
  { key: "Deposit_Slip", label: "Deposit_Slip", width: 100 },
  { key: "Depo_Date", label: "Depo_Date", width: 100 },
  {
    key: "Check_No",
    label: "Check_No",
    width: 150,
  },
  {
    key: "Check_Date",
    label: "Check_Date",
    width: 100,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    type: "number",
  },
  {
    key: "Bank",
    label: "Bank",
    width: 350,
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
    width: 90,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    type: "number",
  },
  {
    key: "Bank",
    label: "Bank/Branch",
    width: 250,
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
    type: "number",
  },
  {
    key: "Credit",
    label: "Credit",
    width: 130,
    type: "number",
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
  {
    key: "Temp_OR",
    label: "",
    width: 0,
    hide: true,
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
export default function ReturnCheck() {
  const [value, setValue] = useState(0);
  const { user, myAxios } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [selected, setSelected] = useState<Array<any>>([]);
  const [accountingEntry, setAccountingEntry] = useState<Array<any>>([]);

  const inputSearchRef = useRef<HTMLInputElement>(null);
  const searchChecksRef = useRef<HTMLInputElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  const refDate = useRef<HTMLInputElement>(null);
  const refExp = useRef<HTMLInputElement>(null);

  const searchReturnCheckModal = useRef<any>(null);

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
        setTableData(res.data.checkList);
        selectedChecksTableRef.current.setData(res.data.checkList);
      },
    });
  const {
    isLoading: isLoadingReturnChecksSave,
    mutate: mutateReturnChecksSave,
  } = useMutation({
    mutationKey: "save",
    mutationFn: async (variable: any) =>
      await myAxios.post(`/task/accounting/return-checks/save`, variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      if (res.data.success) {
        resetReturnChecks();
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
  const {
    isLoading: isLoadingReturnChecksUpdate,
    mutate: mutateReturnChecksUpdate,
  } = useMutation({
    mutationKey: "save",
    mutationFn: async (variable: any) =>
      await myAxios.post(`/task/accounting/return-checks/update`, variable, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      if (res.data.success) {
        resetReturnChecks();
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
  const handleOnSave = () => {
    if (refExp.current?.value === "") {
      alert("Pease provide an explanation");
      refExp.current?.focus();
      return;
    }
    const dgvSelChecks = selected;
    const dgvAccountingEntry = accountingEntry;

    if (dgvSelChecks.length <= 0) {
      alert("Please provide return entry");
      return;
    }
    if (mode === "add") {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateReturnChecksSave({
            dgvSelChecks,
            dgvAccountingEntry,
            refNo: refNoRef.current?.value,
            date: refDate.current?.value,
            explanation: refExp.current?.value,
            mode,
          });
        },
      });
    } else {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateReturnChecksUpdate({
            dgvSelChecks,
            dgvAccountingEntry,
            refNo: refNoRef.current?.value,
            date: refDate.current?.value,
            explanation: refExp.current?.value,
            mode,
            userCodeConfirmation,
          });
        },
      });
    }
  };

  const {
    isLoading: isLoadingReturnChecksSearchSelected,
    mutate: mutateReturnChecksSearchSelected,
  } = useMutation({
    mutationKey: "selected-search",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/return-checks/return-checks-search-selected`,
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      const data1 = JSON.parse(res.data.data1);
      const data2 = JSON.parse(res.data.data2).map((j: any) => {
        const match = data1.find(
          (r: any) => r.RC_No === j.Source_No && r.Check_No === j.Check_No
        );
        return {
          ...j,
          ORNum: match ? match.ORNum : null,
        };
      });

      if (data1.length > 0) {
        if (refNoRef.current) {
          refNoRef.current.value = data1[0].RC_No;
        }
        if (refDate.current) {
          refDate.current.value = format(
            new Date(data1[0].RC_Date),
            "yyyy-MM-dd"
          );
        }
        if (refExp.current) {
          refExp.current.value = data1[0].Explanation;
        }
        const newSelectedCheck: any = [];

        for (let index = 0; index < data1.length; index++) {
          newSelectedCheck.push({
            ORNo: data1[index].ORNum,
            ORDate: format(new Date(data1[index].Date_Collect), "MM/dd/yyy"),
            DepoSlip: data1[index].SlipCode,
            DepoDate: format(new Date(data1[index].Date_Deposit), "MM/dd/yyy"),
            CheckNo: data1[index].Check_No,
            CheckDate: format(new Date(data1[index].Check_Date), "MM/dd/yyy"),
            Amount: formatNumber(
              parseFloat(data1[index].Amount.toString().replace(/,/g, ""))
            ),
            Bank: data1[index].Bank,
            BankAccount: data1[index].BankAccnt,
            Reason: data1[index].Reason,
            ReturnDate: format(new Date(data1[index].Date_Return), "MM/dd/yyy"),
            Temp_OR: data1[index].ORNum,
          });
        }
        setSelected(newSelectedCheck);

        // if (returnCheckComponentRef.current.tssAmountRef.current) {
        //   returnCheckComponentRef.current.tssAmountRef.current.value = `Total Amount:   ${formatNumber(
        //     getSum(data1, "Amount")
        //   )}`;
        // }

        if (data2.length > 0) {
          const newAccoutningEntry: any = [];
          for (let index = 0; index < data2.length; index++) {
            newAccoutningEntry.push({
              Code: data2[index].GL_Acct,
              AccountName: data2[index].cGL_Acct,
              Debit: formatNumber(
                parseFloat(data2[index].Debit.toString().replace(/,/g, ""))
              ),
              Credit: formatNumber(
                parseFloat(data2[index].Credit.toString().replace(/,/g, ""))
              ),
              IDNo: data2[index].ID_No,
              Identity: data2[index].cID_No,
              SubAcct: data2[index].Sub_Acct,
              SubAcctName: data2[index].cSub_Acct,
              CheckNo: data2[index].Check_No,
              Bank: data2[index].Check_Bank,
              CheckDate: format(new Date(data2[index].Check_Date), "MM/dd/yyy"),
              CheckReturn: format(
                new Date(data2[index].Check_Return),
                "MM/dd/yyy"
              ),
              CheckReason: data2[index].Check_Reason,
              PK: data2[index].Check_No,
              DateDeposit: format(
                new Date(data2[index].Check_Deposit),
                "MM/dd/yyy"
              ),
              DateCollection: format(
                new Date(data2[index].Check_Collect),
                "MM/dd/yyy"
              ),
              Temp_OR: data2[index].ORNum,
            });
          }
          setAccountingEntry(newAccoutningEntry);
        }

        setMode("update");
      }
    },
  });

  function resetReturnChecks() {
    setMode("");
    refetch();
    setSelected([]);
    setAccountingEntry([]);

    if (refDate.current) {
      refDate.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (refExp.current) {
      refExp.current.value = "Returned Checks";
    }
    if (value === 1) {
      selectedChecksToBeReturnTableRef.current.setData([]);
    }
    if (value === 2) {
      accountingEntryTableRef.current.setData([]);
    }
  }

  useEffect(() => {
    mutateCheckSelected({ search: searchChecksRef.current?.value });
  }, [mutateCheckSelected]);

  useEffect(() => {
    if (value === 0) {
      selectedChecksTableRef.current.setData(tableData);
    } else if (value === 1) {
      selectedChecksToBeReturnTableRef.current.setData(selected);
    } else if (value === 2) {
      accountingEntryTableRef.current.setData(accountingEntry);
    }
  }, [value,tableData, selected, accountingEntry, mutateCheckSelected]);

  return (
    <>
      <PageHelmet title="Returned Checks" />
      {(isLoadingReturnChecksID ||
        isLoadingReturnChecksSave ||
        isLoadingReturnChecksUpdate ||
        isLoadingCheckSelected ||
        isLoadingReturnChecksSearchSelected) && <Loading />}
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
                  searchReturnCheckModal.current.openModal(
                    e.currentTarget.value
                  );
                }
              },
              style: { width: "500px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current)
                searchReturnCheckModal.current.openModal(
                  inputSearchRef.current.value
                );
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
                      resetReturnChecks();
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
            onChange={(event: React.SyntheticEvent, newValue: number) => {
              setValue(newValue);
            }}
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
                mutateCheckSelected({ search: e.currentTarget.value });
              }
            },
            style: { width: "calc(100% - 100px)" },
          }}
          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault();
            if (inputSearchRef.current)
              mutateCheckSelected({ search: inputSearchRef.current.value });
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
                  modalReturnCheckEntriesRef.current.viewer(false);
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
            <DataGridViewReactUpgraded
              ref={selectedChecksToBeReturnTableRef}
              disableUnselection={true}
              disableDelete={true}
              adjustVisibleRowCount={210}
              columns={columnsSelectedCheckToBeReturned}
              handleSelectionChange={(rowItm: any) => {
                if (rowItm) {
                  modalReturnCheckEntriesRef.current.showModal();
                  modalReturnCheckEntriesRef.current.setRefs({
                    checkNo: rowItm.CheckNo,
                    amount: rowItm.Amount,
                  });
                  modalReturnCheckEntriesRef.current.mutateEntries({
                    ORNo: rowItm.ORNo,
                    Account_No: rowItm.BankAccount,
                  });
                  modalReturnCheckEntriesRef.current.selectItem(rowItm);
                  modalReturnCheckEntriesRef.current.viewer(true);
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
              disableDelete={true}
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
          if (mode === "") {
            setMode("add");
          }

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
          if (selectedChecksTableRef.current)
            selectedChecksTableRef.current.setSelectedRow(null);

          if (selectedChecksToBeReturnTableRef.current)
            selectedChecksToBeReturnTableRef.current.setSelectedRow(null);
        }}
        handleDelete={(selectedItem: any) => {
          if (selectedItem) {
            const newSelected = selected.filter(
              (itm: any) => itm.ORNo !== selectedItem.ORNo
            );
            setSelected(newSelected);
            const newAccountingEntry = accountingEntry.filter(
              (itm: any) => itm.Temp_OR !== selectedItem.ORNo
            );
            setAccountingEntry(newAccountingEntry);

            wait(100).then(() => {
              if (selectedChecksToBeReturnTableRef.current)
                selectedChecksToBeReturnTableRef.current.setSelectedRow(null);

              modalReturnCheckEntriesRef.current.closeModal();
            });
          }
        }}
      />
      <UpwardTableModalSearch
        ref={searchReturnCheckModal}
        link={"/task/accounting/return-checks/return-checks-search"}
        column={[
          { key: "RefDate", label: "Ref. Date", width: 120 },
          { key: "RefNo", label: "Ref. No.", width: 100 },
          { key: "Explanation", label: "Explanation", width: 200 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              mutateReturnChecksSearchSelected({ RefNo: rowItm.RefNo });
            });
            searchReturnCheckModal.current.closeModal();
          }
        }}
      />
    </>
  );
}
const ModalReturnCheckEntries = forwardRef(
  ({ handleConfirm, handleCancel, handleDelete }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const { user, myAxios } = useContext(AuthContext);
    const table = useRef<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [isViewer, setIsViewer] = useState(false);
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
              Temp_OR: itm.Official_Receipt,
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
      viewer: (value: boolean) => {
        setIsViewer(value);
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

    useEffect(() => {
      if (showModal) {
        if (refReturnReason.current) refReturnReason.current.focus();
      }
    }, [showModal]);

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
            height: blick ? "482px" : "480px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "65%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            opacity:  1,
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
              Return Detail and Accounting Entry (Check No.:{" "}
              <span style={{ color: "#df31c8ff" }}>{checkNo}</span>)
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
                  flex: 1,
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
                        disabled: isViewer,
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
                        disabled: isViewer,
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
                disableDelete={true}
                adjustVisibleRowCount={350}
                columns={columns}
                handleSelectionChange={(rowItm: any) => {
                  if (rowItm) {
                  } else {
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

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "6px",
                columnGap: "5px",
              }}
            >
              <TextInput
                containerClassName="search-input"
                containerStyle={{
                  width: "300px",
                }}
                label={{
                  title: "Total Amount : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  readOnly: true,
                  className: "search-input-up-on-key-down",
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                    }
                  },
                  style: {
                    width: "calc(100% - 100px)",
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#0c42d8ff",
                  },
                }}
                inputRef={lblTextRef}
              />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginTop: "6px",
                  columnGap: "5px",
                }}
              >
                {isViewer && (
                  <Button
                    sx={{
                      height: "22px",
                      fontSize: "11px",
                    }}
                    variant="contained"
                    startIcon={
                      <DeleteForeverIcon sx={{ width: 15, height: 15 }} />
                    }
                    color="error"
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You want to delete this row.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, proceed!",
                        didOpen: () => {
                          Swal.getPopup()?.style.setProperty(
                            "z-index",
                            "999999"
                          );
                          Swal.getContainer()?.style.setProperty(
                            "z-index",
                            "999999"
                          );
                        },
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleDelete(selectedItem);
                        }
                      });
                    }}
                  >
                    DELETE
                  </Button>
                )}
                {!isViewer && (
                  <Button
                    sx={{
                      height: "22px",
                      fontSize: "11px",
                    }}
                    variant="contained"
                    startIcon={<HandshakeIcon sx={{ width: 15, height: 15 }} />}
                    color="success"
                    onClick={() => {
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
                    ACCEPT
                  </Button>
                )}
                <Button
                  sx={{
                    height: "22px",
                    fontSize: "11px",
                  }}
                  variant="contained"
                  startIcon={<DoDisturbIcon sx={{ width: 15, height: 15 }} />}
                  color="warning"
                  onClick={() => {
                    setShowModal(false);
                    handleCancel(selectedItem);
                  }}
                >
                  CANCEL
                </Button>
              </div>
            </div>
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
export function formatNumber(num: number) {
  return (num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function getSum(data: Array<any>, key: string): number {
  if (data.length <= 0) {
    return 0;
  }
  return data.reduce((total: number, row: any) => {
    total += parseFloat(row[key].toString().replace(/,/g, ""));
    return total;
  }, 0);
}