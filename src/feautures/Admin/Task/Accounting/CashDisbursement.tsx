import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import { wait } from "../../../../lib/wait";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { deepOrange, grey } from "@mui/material/colors";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { format } from "date-fns";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import PageHelmet from "../../../../components/Helmet";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import SaveIcon from "@mui/icons-material/Save";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Loading } from "../../../../components/Loading";
import SearchIcon from "@mui/icons-material/Search";
import "../../../../style/monbileview/accounting/cashdisbursement.css";

const columns = [
  {
    key: "code",
    label: "Code",
    width: 100,
    type: "text",
  },
  {
    key: "acctName",
    label: "Account Name",
    width: 200,
    type: "text",
    readonly: () => true,
  },
  {
    key: "subAcctName",
    label: "Sub Account",
    width: 120,
    type: "text",
    readonly: () => true,
  },
  {
    key: "ClientName",
    label: "Name",
    width: 300,
    type: "text",
  },
  {
    key: "debit",
    label: "Debit",
    width: 100,
    type: "number",
  },
  {
    key: "credit",
    label: "Credit",
    width: 100,
    type: "number",
  },
  {
    key: "checkNo",
    label: "Check No",
    width: 200,
    type: "text",
  },
  {
    key: "checkDate",
    label: "Check Date",
    width: 100,
    type: "date",
  },
  {
    key: "TC_Code",
    label: "TC",
    width: 90,
    type: "text",
  },
  {
    key: "remarks",
    label: "Remarks",
    width: 300,
    type: "text",
  },
  {
    key: "Payto",
    label: "Payto",
    width: 300,
    type: "text",
  },
  {
    key: "vatType",
    label: "Vat Type",
    width: 100,
    type: "select",
  },
  {
    key: "invoice",
    label: "Invoice",
    width: 200,
    type: "text",
  },
  { key: "IDNo", label: "I.D.", width: 300, hide: true },
  {
    key: "BranchCode",
    headerName: "BranchCode",
    width: 300,
    hide: true,
  },
  {
    key: "addres",
    headerName: "addres",
    hide: true,
  },
  {
    key: "subAcct",
    headerName: "subAcct",
    hide: true,
  },
  {
    key: "TC_Desc",
    headerName: "TC_Desc",
    hide: true,
  },
];

export default function CashDisbursement() {
  const tableRef = useRef<any>(null);
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);
  const particularRef = useRef<HTMLTextAreaElement>(null);

  const [cashDMode, setCashDMode] = useState("");
  const [getTotalDebit, setGetTotalDebit] = useState(0);
  const [getTotalCredit, setGetTotalCredit] = useState(0);
  const isDisableField = cashDMode === "";

  const refCode = useRef<HTMLInputElement>(null);
  const refAccountName = useRef<HTMLInputElement>(null);
  const refSubAccount = useRef<HTMLInputElement>(null);
  const _refSubAccount = useRef("");
  const refName = useRef<HTMLInputElement>(null);
  const _refName = useRef("");

  const refDebit = useRef<HTMLInputElement>(null);
  const refCredit = useRef<HTMLInputElement>(null);
  const refCheckNo = useRef<HTMLInputElement>(null);
  const refCheckDate = useRef<HTMLInputElement>(null);

  const refTC = useRef<HTMLInputElement>(null);
  const _refTC = useRef("");
  const refRemarks = useRef<HTMLInputElement>(null);
  const refPayTo = useRef<HTMLInputElement>(null);
  const _refPayTo = useRef("");

  const refVat = useRef<HTMLSelectElement>(null);
  const refInvoice = useRef<HTMLInputElement>(null);

  const chartAccountModalRef = useRef<any>(null);
  const clientModalRef = useRef<any>(null);
  const tcModalRef = useRef<any>(null);
  const paytoRef = useRef<any>(null);
  const searchCashDisbursementRef = useRef<any>(null);

  const {
    isLoading: loadingGeneralJournalGenerator,
    refetch: refetchGeneralJournalGenerator,
  } = useQuery({
    queryKey: "general-journal-id-generator",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/cash-disbursement/generate-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (response) => {
      if (refNoRef.current) {
        refNoRef.current.value = response.data.generatedId[0].id;
      }
    },
  });
  const {
    mutate: getSearchSelectedCashDisbursement,
    isLoading: loadingGetSearchSelectedCashDisbursement,
  } = useMutation({
    mutationKey: "get-selected-search-general-journal",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/get-selected-search-cash-disbursement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const selected = response.data.selectedCashDisbursement;
      const { explanation, dateEntry, refNo, particulars } = selected[0];

      if (refNoRef.current) {
        refNoRef.current.value = refNo;
      }
      if (dateRef.current) {
        dateRef.current.value = dateEntry;
      }
      if (expRef.current) {
        expRef.current.value = explanation;
      }
      if (particularRef.current) {
        particularRef.current.value = particulars;
      }

      const SearchData = selected.map((itm: any, idx: number) => {
        itm.credit = parseFloat(itm.credit.replace(/,/g, "")).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
        itm.debit = parseFloat(itm.debit.replace(/,/g, "")).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );

        if (itm.code === "1.01.10") {
          itm.checkDate = new Date(itm.checkDate).toISOString().split("T")[0];
        } else {
          itm.checkDate = "";
        }

        return itm;
      });

      wait(250).then(() => {
        tableRef.current?.setData(SearchData);

        setTotals(SearchData);
        wait(250).then(() => {
          refCode.current?.focus();
        });
      });
    },
  });
  const {
    mutate: addCashDisbursementMutate,
    isLoading: loadingCashDisbursementMutate,
  } = useMutation({
    mutationKey: "add-cash-disbursement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/add-cash-disbursement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      if (response.data.success) {
        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        }).then(() => {
          Swal.fire({
            text: "Do you want to print it?",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, print it!",
          }).then((result) => {
            if (result.isConfirmed) {
              mutatePrint({
                check: false,
                Source_No: refNoRef.current?.value,
                reportTitle:
                  process.env.REACT_APP_DEPARTMENT === "UMIS"
                    ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                    : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
              });

              wait(100).then(() => {
                resetAll();
              });
            }
          });
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
    mutate: mutateVoidCashDisbursement,
    isLoading: loadingVoidCashDisbursement,
  } = useMutation({
    mutationKey: "void-cash-disbursement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/accounting/cash-disbursement/void-cash-disbursement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      if (response.data.success) {
        resetAll();
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
  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/accounting/cash-disbursement/print",
        variables,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(
        `/${
          process.env.REACT_APP_DEPARTMENT
        }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
        "_blank"
      );
    },
  });
  function handleVoid() {
    codeCondfirmationAlert({
      isUpdate: false,
      text: `Are you sure you want to void ${refNoRef.current?.value}`,
      cb: (userCodeConfirmation) => {
        mutateVoidCashDisbursement({
          refNo: refNoRef.current?.value,
          dateEntry: dateRef.current?.value,
          userCodeConfirmation,
        });
      },
    });
  }
  function handleClickPrint() {
    mutatePrint({
      check: false,
      Source_No: refNoRef.current?.value,
      checkDate: "",
      Payto: "",
      credit: "",
      reportTitle:
        process.env.REACT_APP_DEPARTMENT === "UMIS"
          ? "UPWARD MANAGEMENT INSURANCE SERVICES"
          : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
    });
  }
  function setTotals(tableData: any) {
    const credit =
      tableData?.reduce((a: number, item: any) => {
        let deb = 0;
        if (!isNaN(parseFloat(item.credit.replace(/,/g, "")))) {
          deb = parseFloat(item.credit.replace(/,/g, ""));
        }
        return a + deb;
      }, 0) || 0;

    const debit =
      tableData?.reduce((a: number, item: any) => {
        let deb = 0;
        if (!isNaN(parseFloat(item.debit.replace(/,/g, "")))) {
          deb = parseFloat(item.debit.replace(/,/g, ""));
        }
        return a + deb;
      }, 0) || 0;

    setGetTotalDebit(debit);
    setGetTotalCredit(credit);
  }
  function resetAll() {
    setCashDMode("");
    refetchGeneralJournalGenerator();
    setGetTotalDebit(0);
    setGetTotalCredit(0);
    wait(100).then(() => {
      resetRowField();
      tableRef.current?.resetTable();
    });
  }
  const handleOnSave = useCallback(() => {
    if (refNoRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide reference number!",
        timer: 1500,
      });
    }
    if (expRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide explanation!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          expRef.current?.focus();
        });
      });
    }
    if (getTotalDebit <= 0 && getTotalCredit <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must not be zero(0), please double check the entries",
        timer: 1500,
      });
    }

    if (getTotalDebit.toFixed(2) !== getTotalCredit.toFixed(2)) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Total Debit and Credit amount must be balance, please double check the entries",
        timer: 1500,
      });
    }
    const tableData = tableRef.current.getData();
    const cashDisbursement = tableData.filter((itm: any) => itm.code !== "");

    if (cashDMode === "update") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          addCashDisbursementMutate({
            hasSelected: cashDMode === "update",
            refNo: refNoRef.current?.value,
            dateEntry: dateRef.current?.value,
            explanation: expRef.current?.value,
            particulars: particularRef.current?.value,
            cashDisbursement,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addCashDisbursementMutate({
            hasSelected: cashDMode === "update",
            refNo: refNoRef.current?.value,
            dateEntry: dateRef.current?.value,
            explanation: expRef.current?.value,
            particulars: particularRef.current?.value,
            cashDisbursement,
          });
        },
      });
    }
  }, [addCashDisbursementMutate, cashDMode, getTotalCredit, getTotalDebit]);
  function resetRowField() {
    if (refCode.current) {
      refCode.current.value = "";
    }
    if (refAccountName.current) {
      refAccountName.current.value = "";
    }
    if (refSubAccount.current) {
      refSubAccount.current.value = "";
    }
    if (refName.current) {
      refName.current.value = "";
    }
    if (refDebit.current) {
      refDebit.current.value = "";
    }
    if (refCredit.current) {
      refCredit.current.value = "";
    }
    if (refCheckNo.current) {
      refCheckNo.current.value = "";
    }
    if (refCheckDate.current) {
      refCheckDate.current.value = format(new Date(), "yyyy-MM-dd");
    }
    if (refTC.current) {
      refTC.current.value = "";
    }
    if (refRemarks.current) {
      refRemarks.current.value = "";
    }
    if (refPayTo.current) {
      refPayTo.current.value = "";
    }
    if (refVat.current) {
      refVat.current.value = "Non-VAT";
    }
    if (refInvoice.current) {
      refInvoice.current.value = "";
    }

    _refSubAccount.current = "";
    _refName.current = "";
    _refTC.current = "";
    _refPayTo.current = "";

    if (refCheckNo.current) refCheckNo.current.disabled = true;
    if (refCheckDate.current) refCheckDate.current.disabled = true;
    if (refPayTo.current) refPayTo.current.disabled = true;
    tableRef.current.setSelectedRow(null);
    // tableRef.current.resetTable();
  }
  function SumbitRow() {
    if (!refCode.current) {
      return alert("Account Code is required");
    }

    if (refCode.current.value === "") {
      alert("Account Code is required");
      refCode.current.focus();
      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refCheckNo.current?.value === ""
    ) {
      alert("Check No is required");
      refCheckNo.current.focus();

      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refCheckDate.current?.value === ""
    ) {
      alert("Check Date is required");
      refCheckDate.current.focus();
      return false;
    } else if (
      refCode.current.value !== "" &&
      refCode.current.value === "1.01.10" &&
      refPayTo.current?.value === ""
    ) {
      alert("Pay To is required");
      refPayTo.current.focus();
      return false;
    } else if (refName.current?.value === "") {
      alert("Name is required");
      refName.current.focus();
      return false;
    } else if (refDebit.current?.value === refCredit.current?.value) {
      alert(
        "Credit and Debit cannot be the same. They must have a difference."
      );
      refCredit.current?.focus();
      return false;
    } else if (refTC.current?.value === "") {
      alert("TC is required");
      refTC.current.focus();

      return false;
    }

    const getSelectedItem = tableRef.current.getSelectedRow();
    if (getSelectedItem !== null) {
      const data = tableRef.current.getData();
      data.splice(getSelectedItem, 1);
      tableRef.current.setData(data);
    }

    wait(100).then(() => {
      if (!refCode.current) {
        return alert("Account Code is required");
      }

      const newData = {
        code: refCode.current?.value, // code:
        acctName: refAccountName.current?.value, // acctName:"",
        subAcctName: refSubAccount.current?.value, // subAcctName:"",
        ClientName: refName.current?.value, // ClientName:"",
        debit: refDebit.current?.value, // debit:"",
        credit: refCredit.current?.value, // credit:"",
        checkNo: refCheckNo.current?.value, // checkNo:"",
        checkDate: refCheckDate.current?.value, // checkDate:"",
        TC_Code: refTC.current?.value, // TC_Code:"",
        remarks: refRemarks.current?.value, // remarks:"",
        Payto: refPayTo.current?.value, // Payto:"",
        vatType: refVat.current?.value, // vatType:"",
        invoice: refInvoice.current?.value, // invoice:"",
        IDNo: _refName.current, // IDNo:"",
        BranchCode: "HO", // BranchCode:"",
        addres: _refPayTo.current, // addres:"",
        subAcct: _refSubAccount.current, // subAcct:"",
        TC_Desc: _refTC.current, // TC_Desc:"",
      };

      if (
        refVat.current &&
        refVat.current.value === "VAT" &&
        refCode.current.value !== "1.06.02"
      ) {
        if (!refCredit.current || !refDebit.current) {
          return;
        }

        const credit = parseFloat(refCredit.current.value.replace(/,/g, ""));
        const debit = parseFloat(refDebit.current.value.replace(/,/g, ""));
        let taxableamt = 0;

        if (debit !== 0) {
          taxableamt = debit / 1.12;
          newData.debit = taxableamt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          taxableamt = credit / 1.12;
          newData.credit = taxableamt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }

        let inputtax = taxableamt * 0.12;
        const _newData: any = {
          code: "1.06.02",
          acctName: "Input Tax",
          subAcctName: refSubAccount.current?.value,
          ClientName: refName.current?.value,
          debit: "",
          credit: "",
          checkNo: refCheckNo.current?.value,
          checkDate: refCheckDate.current?.value,
          TC_Code: refTC.current?.value,
          remarks: refRemarks.current?.value,
          Payto: refPayTo.current?.value,
          vatType: refVat.current?.value,
          invoice: refInvoice.current?.value,
          IDNo: _refName.current,
          BranchCode: "HO",
          addres: _refPayTo.current,
          subAcct: _refSubAccount.current,
          TC_Desc: _refTC.current,
        };

        if (parseFloat(refDebit.current.value.replace(/,/g, "")) !== 0) {
          _newData.debit = inputtax.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          _newData.credit = newData.credit;
        } else {
          _newData.credit = inputtax.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          _newData.debit = newData.debit;
        }
        const totalData = [...tableRef.current.getData(), newData, _newData];
        tableRef.current.setData(totalData);
        const SearchData = totalData.map((itm: any) => {
          itm.debit = parseFloat(itm.debit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          itm.credit = parseFloat(itm.credit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );

          return itm;
        });
        setTotals(SearchData);
        resetRowField();
        wait(100).then(() => {
          refCode.current?.focus();
        });

        wait(50).then(() => {
          tableRef.current.scrollToBottom();
        });
        return;
      } else {
        const totalData = [...tableRef.current.getData(), newData];
        tableRef.current.setData(totalData);
        const SearchData = totalData.map((itm: any) => {
          itm.debit = parseFloat(itm.debit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          itm.credit = parseFloat(itm.credit.replace(/,/g, "")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
          return itm;
        });
        setTotals(SearchData);
        resetRowField();
        wait(100).then(() => {
          refCode.current?.focus();
        });
        wait(50).then(() => {
          tableRef.current.scrollToBottom();
        });
        return;
      }
    });
  }
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleOnSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOnSave]);

  return (
    <>
      {(loadingGetSearchSelectedCashDisbursement ||
        loadingGeneralJournalGenerator ||
        isLoadingPrint ||
        loadingVoidCashDisbursement) && <Loading />}
      <PageHelmet title="Cash Disbursement" />
      <div
        className="main"
        style={{
          background: "#F1F1F1",
          padding: "5px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          height: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "5px",
              width: "100%",
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
                    searchCashDisbursementRef.current.openModal(
                      e.currentTarget.value
                    );
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
              icon={
                <SearchIcon
                  sx={{
                    fontSize: "18px",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (inputSearchRef.current) {
                  searchCashDisbursementRef.current.openModal(
                    inputSearchRef.current.value
                  );
                }
              }}
              inputRef={inputSearchRef}
            />
            <div
              className="cash-disbursement-desktop-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              {cashDMode === "" && (
                <Button
                  sx={{
                    height: "22px",
                    fontSize: "11px",
                  }}
                  variant="contained"
                  startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                  id="entry-header-save-button"
                  onClick={() => {
                    setCashDMode("add");
                  }}
                  color="primary"
                >
                  New
                </Button>
              )}
              <LoadingButton
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                loading={loadingCashDisbursementMutate}
                disabled={cashDMode === ""}
                onClick={handleOnSave}
                color="success"
                variant="contained"
              >
                Save
              </LoadingButton>
              {cashDMode !== "" && (
                <LoadingButton
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
                        resetAll();
                      }
                    });
                  }}
                  disabled={cashDMode === ""}
                >
                  Cancel
                </LoadingButton>
              )}
              <LoadingButton
                sx={{
                  height: "22px",
                  fontSize: "11px",
                  background: deepOrange[500],
                  ":hover": {
                    background: deepOrange[600],
                  },
                }}
                onClick={handleVoid}
                loading={loadingVoidCashDisbursement}
                disabled={cashDMode !== "update"}
                variant="contained"
                startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
              >
                Void
              </LoadingButton>
              <LoadingButton
                loading={isLoadingPrint}
                disabled={cashDMode !== "update"}
                id="basic-button"
                aria-haspopup="true"
                onClick={handleClickPrint}
                sx={{
                  height: "22px",
                  fontSize: "11px",
                  color: "white",
                  backgroundColor: grey[600],
                  "&:hover": {
                    backgroundColor: grey[700],
                  },
                }}
              >
                Print
              </LoadingButton>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <fieldset
            className="layer-one"
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              position: "relative",
              flex: 1,
              height: "auto",
              display: "flex",
              marginTop: "5px",
              gap: "10px",
              padding: "7px",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                width: "300px",
                display: "flex",
                rowGap: "5px",
                flexDirection: "column",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Reference:   CV- ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "text",
                  style: { width: "190px" },
                  name: "refNo",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateRef.current?.focus();
                    }
                  },
                }}
                inputRef={refNoRef}
              />
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Date : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "date",
                  name: "dateEntry",
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  style: { width: "190px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      expRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateRef}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                rowGap: "5px",
                flexDirection: "column",
              }}
            >
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
                  disabled: isDisableField,
                  type: "text",
                  style: { flex: 1 },
                  name: "explanation",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      particularRef.current?.focus();
                    }
                  },
                }}
                inputRef={expRef}
              />
              <TextAreaInput
                containerClassName="custom-input"
                label={{
                  title: "Particulars : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                textarea={{
                  rows: 4,
                  disabled: isDisableField,
                  style: { flex: 1 },
                  name: "particulars",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      //  refDate.current?.focus()
                    }
                  },
                }}
                _inputRef={particularRef}
              />
            </div>
          </fieldset>
        </div>
        <fieldset
          className="layer-two"
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            position: "relative",
            width: "100%",
            height: "auto",
            margin: "5px 0px",
            padding: "7px",
          }}
        >
          <div
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "40px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Code : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refCode.current) {
                      chartAccountModalRef.current.openModal(
                        refCode.current.value
                      );
                    }
                  }
                },
              }}
              inputRef={refCode}
              icon={
                <SupervisorAccountIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refCode.current) {
                  chartAccountModalRef.current.openModal(refCode.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "105px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                readOnly: true,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refSubAccount.current?.focus();
                  }
                },
              }}
              inputRef={refAccountName}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Sub Account : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "85px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                readOnly: true,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refName.current?.focus();
                  }
                },
              }}
              inputRef={refSubAccount}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "I.D : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "290px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refName.current) {
                      clientModalRef.current.openModal(e.currentTarget.value);
                    }
                  }
                },
              }}
              inputRef={refName}
              icon={
                <AccountCircleIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refName.current) {
                  clientModalRef.current.openModal(refName.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
          </div>
          <div
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Debit : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refCredit.current?.focus();
                  }
                },
              }}
              inputRef={refDebit}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Credit : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "105px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (refCode.current) {
                      if (refCode.current?.value === "1.01.10") {
                        refCheckNo.current?.focus();
                      } else {
                        refTC.current?.focus();
                      }
                    } else {
                      refTC.current?.focus();
                    }
                  }
                },
              }}
              inputRef={refCredit}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Check No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "85px",
                },
              }}
              input={{
                disabled: true,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refCheckDate.current?.focus();
                  }
                },
              }}
              inputRef={refCheckNo}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Check Date : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                disabled: true,
                type: "date",
                style: { width: "190px" },
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    refTC.current?.focus();
                  }
                },
              }}
              inputRef={refCheckDate}
            />
          </div>
          <div
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "TC : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "190px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    if (refTC.current) {
                      tcModalRef.current.openModal(e.currentTarget.value);
                    }
                  }
                },
              }}
              inputRef={refTC}
              icon={
                <AccountBalanceWalletIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refTC.current) {
                  tcModalRef.current.openModal(refTC.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Remarks : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "105px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "505px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (
                      refCode.current &&
                      refCode.current.value === "1.01.10"
                    ) {
                      refPayTo.current?.focus();
                    } else {
                      refVat.current?.focus();
                    }
                  }
                },
              }}
              inputRef={refRemarks}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Pay To: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                disabled: true,
                type: "text",
                style: { width: "290px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    paytoRef.current.openModal(e.currentTarget.value);
                  }
                },
              }}
              inputRef={refPayTo}
              icon={
                <AccountCircleIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (refPayTo.current) {
                  paytoRef.current.openModal(refPayTo.current.value);
                }
              }}
              disableIcon={isDisableField}
            />
          </div>
          <div
            className="layer-two-main-div-container"
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "10px",
            }}
          >
            <SelectInput
              containerClassName="custom-input"
              label={{
                title: "Vat Type : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "60px",
                },
              }}
              selectRef={refVat}
              select={{
                disabled: isDisableField,
                style: { width: "190px", height: "22px" },
                defaultValue: "Non-VAT",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    refInvoice.current?.focus();
                  }
                },
              }}
              datasource={[{ key: "VAT" }, { key: "Non-VAT" }]}
              values={"key"}
              display={"key"}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "OR/Invoice No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "105px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    SumbitRow();
                  }
                },
              }}
              inputRef={refInvoice}
            />

            <Button
              className="button-transaction"
              disabled={isDisableField}
              sx={{
                height: "22px",
                fontSize: "11px",
                width: "165px",
              }}
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: "12px" }} />}
              onClick={() => {
                SumbitRow();
              }}
              color="success"
            >
              Save Row
            </Button>
          </div>
        </fieldset>
        <div
          style={{
            marginTop: "10px",
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
          }}
        >
          <DataGridViewReactUpgraded
            ref={tableRef}
            adjustVisibleRowCount={365}
            columns={columns}
            DisplayData={({ row, col }: any) => {
              return (
                <>
                  {col.key === "checkDate"
                    ? row.code.trim() === "1.01.10"
                      ? format(new Date(row[col.key]), "MM/dd/yyyy")
                      : ""
                    : row[col.key]}
                </>
              );
            }}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                if (rowItm.code === "1.01.10") {
                  if (refCheckNo.current) {
                    refCheckNo.current.value = rowItm.checkNo;
                  }
                  if (refCheckDate.current) {
                    refCheckDate.current.value = format(
                      new Date(rowItm.checkDate),
                      "yyyy-MM-dd"
                    );
                  }
                  if (refPayTo.current) {
                    refPayTo.current.value = rowItm.Payto;
                  }

                  if (refCheckNo.current) refCheckNo.current.disabled = false;
                  if (refCheckDate.current)
                    refCheckDate.current.disabled = false;
                  if (refPayTo.current) refPayTo.current.disabled = false;
                }

                if (refCode.current) {
                  refCode.current.value = rowItm.code;
                }
                if (refAccountName.current) {
                  refAccountName.current.value = rowItm.acctName;
                }
                if (refSubAccount.current) {
                  refSubAccount.current.value = rowItm.subAcctName;
                }
                if (refName.current) {
                  refName.current.value = rowItm.ClientName;
                }
                if (refDebit.current) {
                  refDebit.current.value = rowItm.debit;
                }
                if (refCredit.current) {
                  refCredit.current.value = rowItm.credit;
                }
                if (refTC.current) {
                  refTC.current.value = rowItm.TC_Code;
                }
                if (refRemarks.current) {
                  refRemarks.current.value = rowItm.remarks;
                }

                if (refVat.current) {
                  refVat.current.value = rowItm.vatType;
                }
                if (refInvoice.current) {
                  refInvoice.current.value = rowItm.invoice;
                }

                _refSubAccount.current = rowItm.subAcct;
                _refName.current = rowItm.IDNo;
                _refTC.current = rowItm.TC_Desc ?? "";
                _refPayTo.current = rowItm.addres;
              } else {
                resetRowField();
              }
            }}
            FooterComponent={() => {
              return (
                <div
                  className="footer-table"
                  style={{
                    fontSize: "13px",
                    width: "100%",
                    display: "flex",
                    columnGap: "50px",
                    height: "auto",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0px 10px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        width: "80px",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      Total Debit:
                    </p>
                    <strong>
                      {getTotalDebit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        width: "80px",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      Total Credit:
                    </p>
                    <strong>
                      {getTotalCredit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div
                    style={{
                      margin: 0,
                      padding: 0,
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        width: "80px",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      Balance:
                    </p>
                    <strong
                      style={{
                        color:
                          getTotalDebit - getTotalCredit > 0 ? "red" : "black",
                      }}
                    >
                      {(getTotalDebit - getTotalCredit).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>
                </div>
              );
            }}
            RightClickComponent={({ row }: any) => {
              return (
                <>
                  {row?.code === "1.01.10" ? (
                    <div
                      className="modal-action"
                      onClick={() => {
                        mutatePrint({
                          check: true,
                          Source_No: refNoRef.current?.value,
                          checkDate: row.checkDate,
                          Payto: row.Payto,
                          credit: row.credit,
                          reportTitle:
                            process.env.REACT_APP_DEPARTMENT === "UMIS"
                              ? "UPWARD MANAGEMENT INSURANCE SERVICES"
                              : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
                        });
                      }}
                    >
                      🖨️ Print Check
                    </div>
                  ) : null}
                </>
              );
            }}
            onDelete={(data: any) => {
              setTotals(data);
            }}
          />
        </div>
        <div
          className="cash-disbursement-mobile-buttons"
          style={{
            display: "none",
            alignItems: "center",
            columnGap: "10px",
          }}
        >
          {cashDMode === "" && (
            <Button
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                setCashDMode("add");
              }}
              color="primary"
            >
              New
            </Button>
          )}
          <LoadingButton
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            loading={loadingCashDisbursementMutate}
            disabled={cashDMode === ""}
            onClick={handleOnSave}
            color="success"
            variant="contained"
          >
            Save
          </LoadingButton>
          {cashDMode !== "" && (
            <LoadingButton
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
                    resetAll();
                  }
                });
              }}
              disabled={cashDMode === ""}
            >
              Cancel
            </LoadingButton>
          )}
          <LoadingButton
            sx={{
              height: "22px",
              fontSize: "11px",
              background: deepOrange[500],
              ":hover": {
                background: deepOrange[600],
              },
            }}
            onClick={handleVoid}
            loading={loadingVoidCashDisbursement}
            disabled={cashDMode !== "update"}
            variant="contained"
            startIcon={<NotInterestedIcon sx={{ width: 20, height: 20 }} />}
          >
            Void
          </LoadingButton>
          <LoadingButton
            loading={isLoadingPrint}
            disabled={cashDMode !== "update"}
            id="basic-button"
            aria-haspopup="true"
            onClick={handleClickPrint}
            sx={{
              height: "22px",
              fontSize: "11px",
              color: "white",
              backgroundColor: grey[600],
              "&:hover": {
                backgroundColor: grey[700],
              },
            }}
          >
            Print
          </LoadingButton>
        </div>
      </div>
      {/* chart of account Search*/}
      <UpwardTableModalSearch
        ref={chartAccountModalRef}
        link={"/task/accounting/general-journal/get-chart-account"}
        column={[
          { key: "Acct_Code", label: "Account Code", width: 130 },
          { key: "Acct_Title", label: "Account Title.", width: 250 },
          {
            key: "Short",
            label: "Short",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refCode.current) {
                refCode.current.value = rowItm.Acct_Code;
              }
              if (refAccountName.current) {
                refAccountName.current.value = rowItm.Acct_Title;
              }

              if (refCode.current && refCode.current.value === "1.01.10") {
                if (refCheckNo.current) refCheckNo.current.disabled = false;
                if (refCheckDate.current) refCheckDate.current.disabled = false;
                if (refPayTo.current) refPayTo.current.disabled = false;
              } else {
                if (refCheckNo.current) refCheckNo.current.disabled = true;
                if (refCheckDate.current) refCheckDate.current.disabled = true;
                if (refPayTo.current) refPayTo.current.disabled = true;
              }

              refName.current?.focus();
            });
            chartAccountModalRef.current.closeModal();
          }
        }}
      />
      {/* client search*/}
      <UpwardTableModalSearch
        ref={clientModalRef}
        link={"/task/accounting/search-pdc-policy-id"}
        column={[
          { key: "Type", label: "Type", width: 130 },
          { key: "IDNo", label: "ID No.", width: 150 },
          {
            key: "Name",
            label: "Name",
            width: 300,
          },
          {
            key: "ID",
            label: "ID",
            hide: true,
          },
          {
            key: "client_id",
            label: "client_id",
            hide: true,
          },
          {
            key: "sub_account",
            label: "sub_account",
            hide: true,
          },
          {
            key: "Acronym",
            label: "Acronym",
            hide: true,
          },
          {
            key: "ShortName",
            label: "ShortName",
            hide: true,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refSubAccount.current) {
                refSubAccount.current.value = rowItm.ShortName;
              }
              if (refName.current) {
                refName.current.value = rowItm.Name;
              }

              _refSubAccount.current = rowItm.Acronym;
              _refName.current = rowItm.IDNo;

              refDebit.current?.focus();
            });
            clientModalRef.current.closeModal();
          }
        }}
      />
      {/* tc search*/}
      <UpwardTableModalSearch
        ref={tcModalRef}
        link={"/task/accounting/general-journal/get-transaction-account"}
        column={[
          { key: "Code", label: "Code", width: 130 },
          {
            key: "Description",
            label: "Description",
            width: 300,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refTC.current) {
                refTC.current.value = rowItm.Code;
              }
              _refTC.current = rowItm.Description;
              refRemarks.current?.focus();
            });
            tcModalRef.current.closeModal();
          }
        }}
      />
      {/* pay to search*/}
      <UpwardTableModalSearch
        ref={paytoRef}
        link={"/task/accounting/cash-disbursement/search-pay-to"}
        column={[
          { key: "Type", label: "Type", width: 130 },
          { key: "IDNo", label: "ID No.", width: 150 },
          {
            key: "Name",
            label: "Name",
            width: 300,
          },
          {
            key: "ID",
            label: "ID",
            hide: true,
          },
          {
            key: "client_id",
            label: "client_id",
            hide: true,
          },
          {
            key: "sub_account",
            label: "sub_account",
            hide: true,
          },
          {
            key: "ShortName",
            label: "ShortName",
            hide: true,
          },
          {
            key: "address",
            label: "address",
            hide: true,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (refPayTo.current) {
                refPayTo.current.value = rowItm.Name;
              }
              _refPayTo.current = rowItm.ShortName;

              refVat.current?.focus();
            });
            paytoRef.current.closeModal();
          }
        }}
      />
      {/* Search Cash Disbursement*/}
      <UpwardTableModalSearch
        ref={searchCashDisbursementRef}
        link={"/task/accounting/cash-disbursement/search-cash-disbursement"}
        column={[
          { key: "Date_Entry", label: "Date", width: 100 },
          { key: "Source_No", label: "Ref No.", width: 130 },
          {
            key: "Explanation",
            label: "Explanation",
            width: 350,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              getSearchSelectedCashDisbursement({
                Source_No: rowItm.Source_No,
              });
              setCashDMode("update");
            });
            searchCashDisbursementRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
