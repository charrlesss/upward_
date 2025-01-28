import { Button } from "@mui/material";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { wait } from "../../../../lib/wait";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useContext,
  useEffect,
} from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { format } from "date-fns";
import {
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";

export default function ReturnCheck() {

  const { user, myAxios } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const returnCheckComponentRef = useRef<any>(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  const refDate = useRef<HTMLInputElement>(null);
  const refExp = useRef<HTMLInputElement>(null);

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
  const { isLoading: isLoadingReturnChecksID, refetch } = useQuery({
    queryKey: "generate-id",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/return-checks/generate-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(res) {
      wait(100).then(() => {
        if (refNoRef.current) {
          refNoRef.current.value = res.data.newRefCode;
        }
      });
    },
  });

  const {
    isLoading: isLoadingReturnChecksSearchSelectedSave,
    mutate: mutateReturnChecksSearchSelectedSave,
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
      const data2 = JSON.parse(res.data.data2);
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
          newSelectedCheck.push([
            data1[0].ORNum,
            format(new Date(data1[0].Date_Collect), "MM/dd/yyy"),
            data1[0].SlipCode,
            format(new Date(data1[0].Date_Deposit), "MM/dd/yyy"),
            data1[0].Check_No,
            format(new Date(data1[0].Check_Date), "MM/dd/yyy"),
            formatNumber(
              parseFloat(data1[0].Amount.toString().replace(/,/g, ""))
            ),
            data1[0].Bank,
            data1[0].BankAccnt,
            data1[0].Reason,
            format(new Date(data1[0].Date_Return), "MM/dd/yyy"),
          ]);
        }
        returnCheckComponentRef.current.refSelectedCheckToBeReturned.current.table.current.setData(
          newSelectedCheck
        );
        if (returnCheckComponentRef.current.tssAmountRef.current) {
          returnCheckComponentRef.current.tssAmountRef.current.value = `Total Amount:   ${formatNumber(
            getSum(data1, "Amount")
          )}`;
        }

        if (data2.length > 0) {
          const newAccoutningEntry: any = [];
          for (let index = 0; index < data2.length; index++) {
            newAccoutningEntry.push([
              data2[index].GL_Acct,
              data2[index].cGL_Acct,
              formatNumber(
                parseFloat(data2[index].Debit.toString().replace(/,/g, ""))
              ),
              formatNumber(
                parseFloat(data2[index].Credit.toString().replace(/,/g, ""))
              ),
              data2[index].ID_No,
              data2[index].cID_No,
              data2[index].Sub_Acct,
              data2[index].cSub_Acct,
              data2[index].Check_No,
              data2[index].Check_Bank,
              format(new Date(data2[index].Check_Date), "MM/dd/yyy"),
              format(new Date(data2[index].Check_Return), "MM/dd/yyy"),
              data2[index].Check_Reason,
              data2[index].Check_No,
              format(new Date(data2[index].Check_Deposit), "MM/dd/yyy"),
              format(new Date(data2[index].Check_Collect), "MM/dd/yyy"),
            ]);
          }
          returnCheckComponentRef.current.refAccountingEntry.current.table.current.setData(
            newAccoutningEntry
          );

          if (
            returnCheckComponentRef.current.refAccountingEntry.current.debitRef
              .current
          ) {
            returnCheckComponentRef.current.refAccountingEntry.current.debitRef.current.value =
              formatNumber(getSum(data2, "Debit"));
          }

          if (
            returnCheckComponentRef.current.refAccountingEntry.current.creditRef
              .current
          ) {
            returnCheckComponentRef.current.refAccountingEntry.current.creditRef.current.value =
              formatNumber(getSum(data2, "Credit"));
          }
        }

        setMode("update");
      }
    },
  });
  const {
    UpwardTableModalSearch: SearchReturnCheckUpwardTableModalSearch,
    openModal: searchReturnCheckCreditOpenModal,
    closeModal: searchReturnCheckCreditCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/return-checks/return-checks-search",
    column: [
      { key: "RefDate", label: "Ref. Date", width: 120 },
      { key: "RefNo", label: "Ref. No.", width: 100 },
      { key: "Explanation", label: "Explanation", width: 200 },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          mutateReturnChecksSearchSelectedSave({ RefNo: rowItm[1] });
        });
        searchReturnCheckCreditCloseModal();
      }
    },
  });

  const handleOnSave = () => {
    // tabRef.current.test();
    if (refExp.current?.value === "") {
      alert("Pease provide an explanation");
      refExp.current?.focus();
      return;
    }
    const dgvSelChecks =
      returnCheckComponentRef.current.refSelectedCheckToBeReturned.current.table.current.getData();
    const dgvAccountingEntry =
      returnCheckComponentRef.current.refAccountingEntry.current.table.current.getData();

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

  function resetReturnChecks() {
    setMode("");
    refetch();
    if (refDate.current) {
      refDate.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (refExp.current) {
      refExp.current.value = "Returned Checks";
    }

    returnCheckComponentRef.current.refSelectCheck.current.table.current.resetCheckBox();
    returnCheckComponentRef.current.refSelectCheck.current.table.current.setSelectedRow(
      null
    );
    returnCheckComponentRef.current.refSelectCheck.current.table.current.setData(
      []
    );
    returnCheckComponentRef.current.refSelectCheck.current.refetchList();

    returnCheckComponentRef.current.refSelectedCheckToBeReturned.current.table.current.resetCheckBox();
    returnCheckComponentRef.current.refSelectedCheckToBeReturned.current.table.current.setSelectedRow(
      null
    );
    returnCheckComponentRef.current.refSelectedCheckToBeReturned.current.table.current.setData(
      []
    );

    returnCheckComponentRef.current.refAccountingEntry.current.table.current.resetCheckBox();
    returnCheckComponentRef.current.refAccountingEntry.current.table.current.setSelectedRow(
      null
    );
    returnCheckComponentRef.current.refAccountingEntry.current.table.current.setData(
      []
    );

    if (
      returnCheckComponentRef.current.refAccountingEntry.current.debitRef
        .current
    ) {
      returnCheckComponentRef.current.refAccountingEntry.current.debitRef.current.value =
        "0.00";
    }

    if (
      returnCheckComponentRef.current.refAccountingEntry.current.creditRef
        .current
    ) {
      returnCheckComponentRef.current.refAccountingEntry.current.creditRef.current.value =
        "0.00";
    }

    returnCheckComponentRef.current.tssAmountRef.current.value = `Total Amount:   0.00`;
  }

  return (
    <>
      {(isLoadingReturnChecksSave ||
        isLoadingReturnChecksID ||
        isLoadingReturnChecksSearchSelectedSave ||
        isLoadingReturnChecksUpdate) && <Loading />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",
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
                  searchReturnCheckCreditOpenModal(e.currentTarget.value);
                }
              },
              style: { width: "500px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current)
                searchReturnCheckCreditOpenModal(inputSearchRef.current.value);
            }}
            inputRef={inputSearchRef}
          />
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
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "10px 40px",
            flexDirection: "column",
            rowGap: "10px",
            border: "1px solid #64748b",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              columnGap: "200px",
            }}
          >
            <TextInput
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
                // RefetchDepositSlipCode();
              }}
            />
            <TextInput
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
        <TabPage ref={returnCheckComponentRef} mode={mode} />
      </div>
      <SearchReturnCheckUpwardTableModalSearch />
    </>
  );
}

const TabPage = forwardRef(({ mode }: any, ref) => {
  const [activeTab, setActiveTab] = useState(0);
  const [buttonPosition, setButtonPosition] = useState<any>({});
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const refSelectCheck = useRef<any>(null);
  const refSelectedCheckToBeReturned = useRef<any>(null);
  const refAccountingEntry = useRef<any>(null);
  const tssAmountRef = useRef<HTMLInputElement>(null);
  const chkFndRef = useRef<HTMLInputElement>(null);

  const tabs = [
    {
      id: 0,
      label: "Select Check",
      content: (
        <SelectCheck
          ref={refSelectCheck}
          refSelectedCheckToBeReturned={refSelectedCheckToBeReturned}
          refAccountingEntry={refAccountingEntry}
          tssAmountRef={tssAmountRef}
          chkFndRef={chkFndRef}
          mode={mode}
        />
      ),
    },
    {
      id: 1,
      label: "Selected Check To Be Returned",
      content: <SelectedCheckToBeReturned ref={refSelectedCheckToBeReturned} />,
    },
    {
      id: 2,
      label: "Accounting Entry",
      content: <AccountingEntry ref={refAccountingEntry} />,
    },
  ];

  useEffect(() => {
    setButtonPosition(buttonsRef.current[0]?.getBoundingClientRect());
  }, []);

  useImperativeHandle(ref, () => ({
    test: () => {
      refSelectCheck.current.test();
      refSelectedCheckToBeReturned.current.test();
      refAccountingEntry.current.test();
    },
    refSelectCheck,
    refSelectedCheckToBeReturned,
    refAccountingEntry,
    tssAmountRef,
  }));

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tab Buttons */}
      <div style={{ display: "flex" }}>
        {tabs.map((tab, index) => (
          <button
            ref={(el) => (buttonsRef.current[index] = el)}
            key={tab.id}
            onClick={(el) => {
              setActiveTab(tab.id);
              setButtonPosition(el.currentTarget.getBoundingClientRect());
            }}
            style={{
              width: "auto",
              fontSize: "11px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: activeTab === tab.id ? "white" : "transparent",
              color: activeTab === tab.id ? "#0074cc" : "#000",
              border: "none",
              borderRight:
                activeTab === tab.id
                  ? tab.id === 0
                    ? "none"
                    : "1px solid #0074cc"
                  : tab.id === 0
                  ? "none"
                  : "1px solid #64748b",
              borderLeft:
                activeTab === tab.id
                  ? tab.id === 2
                    ? "none"
                    : "1px solid #0074cc"
                  : tab.id === 2
                  ? "none"
                  : "1px solid #64748b",
              borderTop:
                activeTab === tab.id
                  ? "1px solid #0074cc"
                  : "1px solid #64748b",

              // borderBottom:
              //   activeTab === tab.id ? "2px solid #007BFF" : "2px solid #ccc",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render All Tab Contents */}
      <div
        style={{
          padding: "7px",
          flex: 1,
          display: "flex",
          // borderTop: "2px solid #007BFF",
          position: "relative",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: 0,
            width: `${(buttonPosition?.left as number) - 5 || 0}px`,
            height: "1px",
            background: "#64748b",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "-2px",
            right: 0,
            left: `${(buttonPosition?.right as number) - 5 || 0}px`,
            height: "1px",
            background: "#64748b",
          }}
        ></div>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              display: activeTab === tab.id ? "flex" : "none", // Show only the active tab
              flex: 1,
              flexDirection: "column",
            }}
          >
            {tab.content}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "5px",
          }}
        >
          <input
            ref={chkFndRef}
            readOnly={true}
            defaultValue={"0.00"}
            style={{
              textAlign: "left",
              fontWeight: "bold",
              width: "200px",
              border: "none",
            }}
          />
          <input
            ref={tssAmountRef}
            readOnly={true}
            defaultValue={"0.00"}
            style={{
              textAlign: "right",
              fontWeight: "bold",
              width: "200px",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
});

const SelectCheck = forwardRef(
  (
    {
      refAccountingEntry,
      refSelectedCheckToBeReturned,
      tssAmountRef,
      chkFndRef,
      mode,
    }: any,
    ref
  ) => {
    const { user, myAxios } = useContext(AuthContext);
    const searchSelectCheckRef = useRef<HTMLInputElement>(null);
    const table = useRef<any>(null);
    const modalReturnCheckEntriesRef = useRef<any>(null);

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
          table.current.setDataFormated(res.data.checkList);
          if (chkFndRef.current) {
            chkFndRef.current.value = `Check Found: Top ${res.data.checkList.length}`;
          }
        },
      });
    const mutateCheckSelectedRef = useRef<any>(mutateCheckSelected);
    useEffect(() => {
      mutateCheckSelectedRef.current({
        search: searchSelectCheckRef.current?.value,
      });
    }, []);
    useImperativeHandle(ref, () => ({
      test: () => {
        alert("qweqweqweqwe1");
      },
      refetchList: () => {
        mutateCheckSelectedRef.current({
          search: "",
        });
      },
      table,
    }));

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          rowGap: "10px",
        }}
      >
        {isLoadingCheckSelected && <Loading />}
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
                mutateCheckSelectedRef.current({
                  search: e.currentTarget.value,
                });
              }
            },
            onChange: (e) => {
              if (e.target.value === "") {
                mutateCheckSelectedRef.current({
                  search: "",
                });
              }
            },
            style: { width: "100%" },
          }}
          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault();
            if (searchSelectCheckRef.current)
              mutateCheckSelectedRef.current({
                search: searchSelectCheckRef.current?.value,
              });
          }}
          inputRef={searchSelectCheckRef}
        />
        <div
          style={{
            display: "flex",
            flex: 1,
          }}
        >
          <DataGridViewReact
            disbaleTable={mode === ""}
            ref={table}
            columns={[
              { key: "Deposit_Slip", label: "Deposit_Slip", width: 80 },
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
            ]}
            rows={[]}
            containerStyle={{
              height: "auto",
              flex: 1,
            }}
            getSelectedItem={(rowItm: any) => {
              if (rowItm) {
                wait(100).then(() => {
                  const selectedChecks =
                    refSelectedCheckToBeReturned.current.getSelectedCheck();
                  if (selectedChecks.includes(rowItm[2])) {
                    alert(`Check ${rowItm[2]} already exist!`);
                    table.current.setSelectedRow(null);
                    table.current.resetCheckBox();
                    return;
                  }
                  modalReturnCheckEntriesRef.current.showModal();
                  modalReturnCheckEntriesRef.current.setRefs({
                    checkNo: rowItm[2],
                    amount: rowItm[4],
                  });
                  modalReturnCheckEntriesRef.current.mutateEntries({
                    ORNo: rowItm[6],
                    Account_No: rowItm[8],
                  });
                  modalReturnCheckEntriesRef.current.selectItem(rowItm);
                });
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
        <ModalReturnCheckEntries
          ref={modalReturnCheckEntriesRef}
          handleConfirm={(
            e: any,
            itm: Array<any>,
            state: any,
            tableData: Array<any>,
            columns: Array<any>,
            ref: any
          ) => {
            if (state.lblTextRef !== state.refAmount) {
              return alert("Debit must equal to Credit!");
            }

            const retDebit = tableData;
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
            const newSelectedData = [
              ...refSelectedCheckToBeReturned.current.table.current.getData(),
              [
                itm[6],
                itm[7],
                itm[0],
                itm[1],
                itm[2],
                itm[3],
                itm[4],
                itm[5],
                itm[8],
                RetReason,
                format(new Date(RetDateRet), "MM/dd/yyyy"),
              ],
            ];

            refSelectedCheckToBeReturned.current.table.current.setData(
              newSelectedData
            );

            if (tssAmountRef.current) {
              tssAmountRef.current.value = `Total Amount:   ${formatNumber(
                newSelectedData.reduce((total: number, row: any) => {
                  total += parseFloat(row[6].replace(/,/g, ""));
                  return total;
                }, 0)
              )}`;
            }
            let newSelectedDataAccountingEntry: any = [];
            for (let i = 0; i < retDebit.length; i++) {
              newSelectedDataAccountingEntry = [
                ...refAccountingEntry.current.table.current.getData(),
                [
                  retDebit[i][0],
                  retDebit[i][1],
                  retDebit[i][2],
                  "0.00",
                  retDebit[i][3],
                  retDebit[i][4],
                  retDebit[i][5],
                  retDebit[i][6],
                  itm[2],
                  itm[5],
                  itm[3],
                  format(new Date(RetDateRet), "MM/dd/yyyy"),
                  RetReason,
                  itm[2],
                  itm[1],
                  itm[7],
                ],
              ];
            }
            newSelectedDataAccountingEntry = [
              ...newSelectedDataAccountingEntry,
              [
                retCredit[0],
                retCredit[1],
                "0.00",
                retCredit[2],
                retCredit[5],
                "",
                retCredit[3],
                retCredit[4],
                itm[2],
                itm[5],
                itm[3],
                format(new Date(RetDateRet), "MM/dd/yyyy"),
                RetReason,
                itm[2],
                itm[1],
                itm[7],
              ],
            ];

            refAccountingEntry.current.table.current.setData(
              newSelectedDataAccountingEntry
            );

            const reformatData = newSelectedDataAccountingEntry.map(
              (itm: any) => {
                return {
                  debit: itm[2],
                  credit: itm[3],
                };
              }
            );
            if (refAccountingEntry.current.debitRef.current) {
              refAccountingEntry.current.debitRef.current.value = formatNumber(
                getSum(reformatData, "debit")
              );
            }

            if (refAccountingEntry.current.creditRef.current) {
              refAccountingEntry.current.creditRef.current.value = formatNumber(
                getSum(reformatData, "credit")
              );
            }

            // AccountingEntry
          }}
          handleCancel={(e: any) => {
            table.current.setSelectedRow(null);
            table.current.resetCheckBox();
          }}
        />
      </div>
    );
  }
);
const SelectedCheckToBeReturned = forwardRef((props: any, ref) => {
  const table = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    test: () => {
      alert("qweqweqweqwe2");
    },
    table,
    getSelectedCheck: () => {
      const checkList = table.current.getData();
      if (checkList.length > 0) {
        return checkList.map((itm: any) => {
          return itm[4];
        });
      }
      return [];
    },
  }));
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
      }}
    >
      <DataGridViewReact
        ref={table}
        columns={[
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
        ]}
        rows={[]}
        containerStyle={{
          height: "auto",
          flex: 1,
        }}
        getSelectedItem={(rowItm: any) => {
          if (rowItm) {
            wait(100).then(() => {});
          } else {
            wait(100).then(() => {});
          }
        }}
        onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
          if (e.code === "Delete" || e.code === "Backspace") {
            const isConfim = window.confirm(`Are you sure you want to delete?`);
            if (isConfim) {
              return;
            }
          }
        }}
      />
    </div>
  );
});
const AccountingEntry = forwardRef((props: any, ref) => {
  const table = useRef<any>(null);
  const debitRef = useRef<HTMLInputElement>(null);
  const creditRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    test: () => {
      alert("qweqweqweqwe3");
    },
    table,
    debitRef,
    creditRef,
  }));

  return (
    <>
      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <DataGridViewReact
          ref={table}
          columns={[
            { key: "Code", label: "Code", width: 80 },
            { key: "AccountName", label: "Account Name", width: 130 },
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
              width: 130,
            },
            {
              key: "Identity",
              label: "Identity",
              width: 130,
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
              width: 100,
            },
            {
              key: "Bank",
              label: "Bank/Branch",
              width: 200,
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
              width: 200,
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
          ]}
          rows={[]}
          containerStyle={{
            height: "auto",
            flex: 1,
          }}
          getSelectedItem={(rowItm: any) => {
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
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "flex-end",
          padding: "5px 0",
          columnGap: "5px",
        }}
      >
        <span
          style={{ fontSize: "13px", fontWeight: "bold", marginRight: "10px" }}
        >
          Total:
        </span>
        <input
          ref={debitRef}
          readOnly={true}
          defaultValue={"0.00"}
          style={{
            textAlign: "right",
            fontWeight: "bold",
            width: "140px",
            border: "none",
          }}
        />
        <input
          ref={creditRef}
          readOnly={true}
          defaultValue={"0.00"}
          style={{
            textAlign: "right",
            fontWeight: "bold",
            width: "140px",
            border: "none",
          }}
        />
      </div>
    </>
  );
});
const ModalReturnCheckEntries = forwardRef(
  ({ handleConfirm, handleCancel, hasSelectedRow }: any, ref) => {
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

    const lblTextRef = useRef<HTMLInputElement>(null);

    const { isLoading: isLoadingEntries, mutate: mutateEntries } = useMutation({
      mutationKey: "load-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting//return-check/load-entries`,
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
            };
          });
          table.current.setDataFormated(data);
        }

        if (lblTextRef.current)
          lblTextRef.current.value = formatNumber(getSum(dt2, "Debit"));
      },
    });

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleCancel();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
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
      closeDelay,
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
    ];

    return showModal ? (
      <>
        {isLoadingEntries && <Loading />}
        <div
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
          style={{
            height: blick ? "402px" : "400px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "35%",
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
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
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
                closeDelay();
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
                        style: { flex: 1, height: "22px" },
                        defaultValue: "",
                      }}
                      datasource={[
                        { key: "DAIF", value: "DAIF" },
                        { key: "DAUD", value: "DAUD" },
                        { key: "Account Closed", value: "Account Closed" },
                        { key: "SPO", value: "SPO" },
                      ]}
                      values={"value"}
                      display={"key"}
                    />
                    {/* <TextInput
                      label={{
                        title: "Return Reason : ",
                        style: {
                          fontSize: "12px",
                          fontWeight: "bold",
                          width: "100px",
                        },
                      }}
                      input={{
                        className: "ref_no",
                        type: "text",
                        style: { width: "200px" },
                      }}
                      inputRef={refReturnReason}
                    /> */}
                    <TextInput
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
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                      height: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        columnGap: "50px",
                      }}
                    >
                      <TextInput
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
                      style={{
                        display: "flex",
                        columnGap: "50px",
                      }}
                    >
                      <TextInput
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
                    handleConfirm(e, selectedItem, state, data, columns, ref);
                    closeDelay();
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
                    handleCancel(e);
                    closeDelay();
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
              }}
            >
              <DataGridViewReact
                ref={table}
                columns={columns}
                rows={[]}
                containerStyle={{
                  height: "200px",
                  flex: 1,
                }}
                getSelectedItem={(rowItm: any) => {
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
        className={`${uniClass} ${isBlinking ? "blinking" : ""}`}
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

