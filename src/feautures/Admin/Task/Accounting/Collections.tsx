import {
  useContext,
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery } from "react-query";
import Swal from "sweetalert2";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { AuthContext } from "../../../../components/AuthContext";
import { wait } from "../../../../lib/wait";
import LoadingButton from "@mui/lab/LoadingButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import PageHelmet from "../../../../components/Helmet";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import ForwardIcon from "@mui/icons-material/Forward";
import { Autocomplete } from "./PettyCash";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import {
  UpwardTableModalSearch,
  DataGridViewReactUpgraded,
} from "../../../../components/DataGridViewReact";
import { Loading } from "../../../../components/Loading";
import { formatNumber } from "./ReturnCheck";
import { format, isValid, parse } from "date-fns";
import "../../../../style/monbileview/accounting/collection.css";

export const debitColumn = [
  { key: "Payment", label: "Payment", flex: 1, width: 170 },
  {
    key: "Amount",
    label: "Amount",
    flex: 1,
    width: 170,
    type: "number",
  },
  { key: "Check_No", label: "Check No", width: 170 },
  { key: "Check_Date", label: "Check Date", width: 170, type: "date" },
  { key: "Bank_Branch", label: "Bank/Branch", width: 300 },
  { key: "Acct_Code", label: "DR Code", width: 170 },
  { key: "Acct_Title", label: "DR Title", width: 300 },
  { key: "Deposit_Slip", label: "Deposit Slip", width: 170, type: "date" },
  { key: "Cntr", label: "Cntr", width: 170 },
  { key: "Remarks", label: "Remarks", width: 300 },
  { key: "TC", label: "TC", width: 170 },
  { key: "Bank", label: "Bank", hide: true },
  { key: "BankName", label: "BankName", hide: true },
];
export const creditColumn = [
  { key: "transaction", label: "Transaction", width: 200 },
  { key: "amount", label: "Amount", width: 150, type: "number" },
  { key: "Name", label: "Name", width: 350 },
  { key: "Remarks", label: "Remarks", width: 350 },
  { key: "VATType", label: "VAT Type", width: 150 },
  { key: "invoiceNo", label: "Invoice No", width: 250 },
  { key: "Code", label: "Code", width: 150 },
  { key: "Title", label: "Title", width: 350 },
  { key: "TC", label: "TC", width: 200 },
  { key: "Account_No", label: "Account No.", width: 180 },
];
export default function Collection() {
  const debitTable = useRef<any>(null);
  const creditTable = useRef<any>(null);
  const modalCheckRef = useRef<any>(null);

  const [paymentType, setPaymentType] = useState("CSH");
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [collectionMode, setCollectionMode] = useState("");

  // SEARCH COLLECTION
  const searchRef = useRef<HTMLInputElement>(null);

  // first layer fields
  const ornoSubRef = useRef("");
  const ornoRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const pnClientRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const IDNo = useRef("");

  // second layer fields
  const paymentTypeRef = useRef<HTMLSelectElement>(null);
  const amountDebitRef = useRef<HTMLInputElement>(null);
  const buttonCshSave = useRef<HTMLButtonElement>(null);
  const buttonCheckSave = useRef<HTMLButtonElement>(null);
  const buttonCheckList = useRef<HTMLButtonElement>(null);

  // third layer fields
  const transactionRef = useRef<HTMLSelectElement>(null);
  const amountCreditRef = useRef<HTMLInputElement>(null);
  const faoRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const vatTypeRef = useRef<HTMLSelectElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);
  const foaIDNoRef = useRef("");
  const accCodeRef = useRef("");
  const accTitleRef = useRef("");
  const accTCRef = useRef("");

  const { myAxios, user } = useContext(AuthContext);
  const { executeQueryToClient } = useExecuteQueryFromClient();

  const disableFields = collectionMode === "";

  const outputTaxRef = useRef<any>({});

  const clientModalRef = useRef<any>(null);
  const clientCreditModalRef = useRef<any>(null);
  const checksFromPDCModalRef = useRef<any>(null);
  const searchCollectionModalRef = useRef<any>(null);

  const { isLoading: NewORNoLoading, refetch: refetchNewOR } = useQuery({
    queryKey: "new-or-number",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-new-or-number`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      const response = res as any;
      wait(100).then(() => {
        ornoSubRef.current = response.data?.ORNo[0].collectionID;
        if (ornoRef.current) {
          ornoRef.current.value = response.data?.ORNo[0].collectionID;
        }
      });
    },
  });
  const { isLoading: paymentTypeLoading, data: transactionDesc } = useQuery({
    queryKey: "transaction-code-title",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-transaction-code-title`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
  });
  const { isLoading: isLoadingOutputTax } = useQuery({
    queryKey: "output-tax",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-data-from-output-tax`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess(response) {
      outputTaxRef.current = response.data.data;
    },
    refetchOnWindowFocus: false,
  });

  const { mutate, isLoading: loadingAddNew } = useMutation({
    mutationKey: "add-update-collection",
    mutationFn: async (variables: any) => {
      if (collectionMode === "update") {
        delete variables.mode;
        return await myAxios.post(
          "/task/accounting/update-collection",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      delete variables.mode;
      return await myAxios.post("/task/accounting/add-collection", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data.success) {
        resetCollection();
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
  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/task/accounting/print-or", variables, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
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
  const {
    mutate: mutateGetSearchCheckFromClientId,
    isLoading: isLoadingGetSearchCheckFromClientId,
  } = useMutation({
    mutationKey: "get-search-checks-from-client-id",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/accounting/get-search-checks-from-client-id",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      const checkDetails = response.data.data[0];
      wait(100).then(() => {
        if (modalCheckRef.current) {
          if (modalCheckRef.current.checknoRef.current) {
            modalCheckRef.current.checknoRef.current.value =
              checkDetails.Check_No;
          }
          if (modalCheckRef.current.bankRef.current) {
            modalCheckRef.current.bankRef.current.value = checkDetails.Bank;
          }
          if (modalCheckRef.current.branchRef.current) {
            modalCheckRef.current.branchRef.current.value = checkDetails.Branch;
          }
          if (modalCheckRef.current.remarksRef.current) {
            modalCheckRef.current.remarksRef.current.value =
              checkDetails.Remarks;
          }
          if (modalCheckRef.current.checkdateRef.current) {
            modalCheckRef.current.checkdateRef.current.value =
              checkDetails.Check_Date;
          }
          if (modalCheckRef.current.amountRef.current) {
            modalCheckRef.current.amountRef.current.value =
              checkDetails.Check_Amnt;
          }
          if (modalCheckRef.current.bankRefName.current) {
            modalCheckRef.current.bankRefName.current = checkDetails.BName;
          }
        }
      });
      saveCheckDebit(
        {
          amountRef: { current: { value: checkDetails.Check_Amnt } },
          checknoRef: { current: { value: checkDetails.Check_No } },
          checkdateRef: {
            current: { value: checkDetails.Check_Date },
          },
          branchRef: { current: { value: checkDetails.Branch } },
          remarksRef: { current: { value: checkDetails.Remarks } },
          bankRef: { current: { value: checkDetails.Bank } },
          bankRefName: { current: checkDetails.BName },
        },
        false
      );
      wait(250).then(() => {
        buttonCheckList.current?.focus();
      });
    },
  });

  const {
    isLoading: loadingCollectionDataSearch,
    mutate: mutateCollectionDataSearch,
  } = useMutation({
    mutationKey: "get-collection-data-search",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/task/accounting/get-collection-data-search`,
        variables,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      const dataCollection = response.data.collection;

      if (
        ornoRef.current &&
        dateRef.current &&
        pnClientRef.current &&
        clientNameRef.current
      ) {
        ornoRef.current.value = dataCollection[0].ORNo;
        dateRef.current.value = dataCollection[0].Date_OR;
        pnClientRef.current.value = dataCollection[0].ID_No;
        clientNameRef.current.value = dataCollection[0].Short;
      }

      const debit: Array<any> = [];
      const credit: Array<any> = [];

      for (let i = 0; i <= dataCollection.length - 1; i++) {
        if (
          dataCollection[i].Payment !== null &&
          dataCollection[i].Payment.toString() !== ""
        ) {
          console.log(dataCollection[i]);

          const isCash = dataCollection[i].Payment.toLowerCase() === "cash";
          debit.push({
            Payment: dataCollection[i].Payment,
            Amount: formatNumber(
              parseFloat(dataCollection[i].Debit.toString().replace(/,/g, ""))
            ),
            Check_No: isCash ? "" : dataCollection[i].Check_No,
            Check_Date: isCash
              ? ""
              : format(new Date(dataCollection[i].Check_Date), "yyyy-MM-dd"),
            Bank_Branch: isCash ? "" : dataCollection[i].Bank,
            Acct_Code: dataCollection[i].DRCode,
            Acct_Title: dataCollection[i].DRTitle,
            Deposit_Slip: dataCollection[i].SlipCode,
            Cntr: "",
            Remarks: dataCollection[i].DRRemarks,
            TC: isCash ? "CSH" : "CHK",
            Bank: dataCollection[i].Bank_Code,
            BankName: dataCollection[i].BankName,
          });
        }

        if (
          dataCollection[i].Purpose !== null &&
          dataCollection[i].Purpose.toString() !== ""
        ) {
          credit.push({
            temp_id: `${i}`,
            transaction: dataCollection[i].Purpose,
            amount: formatNumber(
              parseFloat(dataCollection[i].Credit.toString().replace(/,/g, ""))
            ),
            Remarks: dataCollection[i].CRRemarks,
            Code: dataCollection[i].CRCode,
            Title: dataCollection[i].CRTitle,
            TC: dataCollection[i].TC,
            Account_No: dataCollection[i].CRLoanID,
            Name: dataCollection[i].CRLoanName,
            VATType: dataCollection[i].CRVATType,
            invoiceNo: dataCollection[i].CRInvoiceNo,
          });
        }
      }

      debitTable.current.setData(debit);
      creditTable.current.setData(credit);
      setTotalDebit(
        debit.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.Amount.replace(/,/g, "")),
          0
        )
      );
      setTotalCredit(
        credit.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.amount.replace(/,/g, "")),
          0
        )
      );
      setCollectionMode("update");
    },
  });

  function resetCollection() {
    wait(100).then(() => {
      refetchNewOR();
      resetFields();
      resetCredit(false);
      resetDebit(false);
      debitTable.current?.setData([]);
      creditTable.current?.setData([]);
      pnClientRef.current?.focus();
      setTotalCredit(0);
      setTotalDebit(0);
    });
  }
  async function saveCashDebit(value: string, paymentType: string) {
    const amount = parseFloat(value.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      amountDebitRef.current?.focus();
      return alert("Please provide amount!");
    }
    const getSelectedRow = debitTable.current.getSelectedRow();
    const debitTableData = debitTable.current.getData();

    if (getSelectedRow !== null) {
      debitTableData[getSelectedRow].Amount = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      debitTable.current.setData(debitTableData);
      debitTable.current.setSelectedRow(null);
      setTotalDebit(
        debitTableData.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.Amount.replace(/,/g, "")),
          0
        )
      );
    } else {
      const data = {
        Payment: "Cash",
        Amount: amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Check_No: "",
        Check_Date: "",
        Bank_Branch: "",
        Acct_Code: outputTaxRef.current.chart_account_cash[0].Acct_Code,
        Acct_Title: outputTaxRef.current.chart_account_cash[0].Acct_Title,
        Deposit_Slip: "",
        Cntr: "",
        Remarks: "",
        TC: paymentType,
        Bank: "",
        BankName: "",
      };
      const newDataTable = [...debitTableData, data];
      debitTable.current.setData(newDataTable);
      setTotalDebit(
        newDataTable.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.Amount.replace(/,/g, "")),
          0
        )
      );
    }

    if (amountDebitRef.current) {
      amountDebitRef.current.value = "";
      amountDebitRef.current?.focus();
    }
  }
  function saveCheckDebit(refs: any, autoClose = true) {
    wait(100).then(async () => {
      // const refs = modalCheckRef.current.getRefs()

      const amount = parseFloat(
        refs.amountRef.current?.value.replace(/,/g, "")
      );
      const checkno = refs.checknoRef.current?.value;
      const checkdate = refs.checkdateRef.current?.value;
      const branch = refs.branchRef.current?.value;
      const remarks = refs.remarksRef.current?.value;
      const bank = refs.bankRef.current?.value;
      const bankRefName = refs.bankRefName.current;

      const getSelectedRow = debitTable.current.getSelectedRow();
      const data = debitTable.current.getData();
      // check if exist
      if (
        data.some((itm: any) => itm.name === checkno) &&
        getSelectedRow === null
      ) {
        return alert(`check no is already exist`);
      }

      if (getSelectedRow !== null) {
        const debitTableData = debitTable.current.getData();
        debitTableData[getSelectedRow].Amount = amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        debitTableData[getSelectedRow].Check_No = checkno;
        debitTableData[getSelectedRow].Check_Date = checkdate;
        debitTableData[getSelectedRow].Bank_Branch = `${bank}/${branch}`;
        debitTableData[getSelectedRow].Remarks = remarks;
        debitTableData[getSelectedRow].Bank = bank;
        debitTableData[getSelectedRow].BankName = bankRefName;
        debitTable.current.setData(debitTableData);
        debitTable.current.setSelectedRow(null);
        setTotalDebit(
          debitTableData.reduce(
            (sum: any, subArray: any) =>
              sum + parseFloat(subArray.Amount.replace(/,/g, "")),
            0
          )
        );
      } else {
        const dd = await executeQueryToClient(
          `select * from transaction_code LEFT JOIN chart_account ON transaction_code.Acct_Code = chart_account.Acct_Code WHERE Code = 'CHK'`
        );
        const data = {
          Payment: "Check",
          Amount: amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          Check_No: checkno,
          Check_Date: checkdate,
          Bank_Branch: `${bank}/${branch}`,
          Acct_Code: dd.data?.data[0].Acct_Code,
          Acct_Title: dd.data?.data[0].Acct_Title,
          Deposit_Slip: "",
          Cntr: "",
          Remarks: remarks,
          TC: paymentType,
          Bank: bank,
          BankName: bankRefName,
        };
        const debitTableData = debitTable.current.getData();

        const newDataTable = [...debitTableData, data];
        debitTable.current.setData(newDataTable);
        setTotalDebit(
          newDataTable.reduce(
            (sum: any, subArray: any) =>
              sum + parseFloat(subArray.Amount.replace(/,/g, "")),
            0
          )
        );
      }

      if (autoClose) {
        modalCheckRef.current.closeDelay();
      }
    });
  }
  async function saveCredit() {
    if (
      (transactionRef.current && transactionRef.current.value === "") ||
      (transactionRef.current && transactionRef.current.value === null) ||
      (transactionRef.current && transactionRef.current.value === undefined)
    ) {
      transactionRef.current.focus();
      return alert(`Please select a transaction!`);
    }
    if (transactionRef.current) {
      const dd = await executeQueryToClient(
        `SELECT * FROM transaction_code where Description = "${transactionRef.current.value}"`
      );
      if (dd.data.data?.length <= 0) {
        return alert("Transaction not yet defined!");
      }
    }
    if (amountCreditRef.current) {
      if (
        isNaN(parseFloat(amountCreditRef.current.value.replace(/,/g, ""))) ||
        parseFloat(amountCreditRef.current.value.replace(/,/g, "")) <= 0
      ) {
        amountCreditRef.current.focus();
        return alert("Please provide amount!");
      }
    }
    if (invoiceRef.current && invoiceRef.current.value === "") {
      invoiceRef.current.focus();
      return alert("Please provide invoice!");
    }
    if (foaIDNoRef.current === "") {
      faoRef.current?.focus();
      return alert("Please provide usage!");
    }

    const getSelectedRow = creditTable.current.getSelectedRow();
    const creditTableData = creditTable.current.getData();

    if (getSelectedRow !== null) {
      creditTableData[getSelectedRow].transaction =
        transactionRef.current?.value;
      creditTableData[getSelectedRow].amount = amountCreditRef.current?.value;
      creditTableData[getSelectedRow].Name = faoRef.current?.value;
      creditTableData[getSelectedRow].Remarks = remarksRef.current?.value;
      creditTableData[getSelectedRow].VATType = vatTypeRef.current?.value;
      creditTableData[getSelectedRow].invoiceNo = invoiceRef.current?.value;
      creditTableData[getSelectedRow].Code = accCodeRef.current;
      creditTableData[getSelectedRow].Title = accTitleRef.current;
      creditTableData[getSelectedRow].TC = accTCRef.current;
      creditTableData[getSelectedRow].Account_No = foaIDNoRef.current;

      creditTable.current.setData(creditTableData);
      creditTable.current.setSelectedRow(null);
      setTotalCredit(
        creditTableData.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.amount.replace(/,/g, "")),
          0
        )
      );
      if (vatTypeRef.current && vatTypeRef.current.value === "VAT") {
        addVat(getSelectedRow, creditTableData);
      }
    } else {
      const data = {
        transaction: transactionRef.current?.value,
        amount: amountCreditRef.current?.value,
        Name: faoRef.current?.value,
        Remarks: remarksRef.current?.value,
        VATType: vatTypeRef.current?.value,
        invoiceNo: invoiceRef.current?.value,
        Code: accCodeRef.current,
        Title: accTitleRef.current,
        TC: accTCRef.current,
        Account_No: foaIDNoRef.current,
      };

      const newCreditTableData = [...creditTableData, data];
      creditTable.current.setData(newCreditTableData);
      setTotalCredit(
        newCreditTableData.reduce(
          (sum: any, subArray: any) =>
            sum + parseFloat(subArray.amount.replace(/,/g, "")),
          0
        )
      );

      if (vatTypeRef.current && vatTypeRef.current.value === "VAT") {
        addVat(getSelectedRow, newCreditTableData);
      }
    }

    resetCredit();
  }
  function addVat(getSelectedRow: any, creditTableData: any) {
    const chart_account = outputTaxRef.current.chart_account[0];
    const transaction_code = outputTaxRef.current.transaction_code[0];
    let taxableamt = 0;
    let inputtax = 0;

    if (amountCreditRef.current) {
      taxableamt =
        parseFloat(amountCreditRef.current.value.replace(/,/g, "")) / 1.12;
      inputtax = taxableamt * 0.12;
    }

    if (getSelectedRow !== null) {
      const newData = {
        transaction: "Output Tax",
        amount: inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Name: faoRef.current?.value,
        Remarks: remarksRef.current?.value,
        VATType: "VAT",
        invoiceNo: invoiceRef.current?.value,
        Code: chart_account.Acct_Code,
        Title: chart_account.Acct_Title,
        TC: transaction_code.Code,
        Account_No: foaIDNoRef.current,
      };

      creditTableData[getSelectedRow].amount = taxableamt.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      creditTableData.splice(getSelectedRow + 1, 0, newData);
      creditTable.current.setData(creditTableData);
    } else {
      const newData = {
        transaction: "Output Tax",
        amount: inputtax.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Name: faoRef.current?.value,
        Remarks: remarksRef.current?.value,
        VATType: "VAT",
        invoiceNo: invoiceRef.current?.value,
        Code: chart_account.Acct_Code,
        Title: chart_account.Acct_Title,
        TC: transaction_code.Code,
        Account_No: foaIDNoRef.current,
      };

      creditTableData[creditTableData.length - 1].amount =
        taxableamt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      creditTableData.push(newData);
      creditTable.current.setData(creditTableData);
    }
  }
  function resetFields() {
    wait(100).then(() => {
      if (dateRef.current) {
        dateRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (pnClientRef.current) {
        pnClientRef.current.value = "";
      }
      if (clientNameRef.current) {
        clientNameRef.current.value = "";
      }
      IDNo.current = "";
    });
  }
  function resetDebit(setFocus = true) {
    modalCheckRef.current?.closeDelay();
    setPaymentType("CSH");
    if (paymentTypeRef.current) {
      paymentTypeRef.current.value = "CSH";
    }
    wait(100).then(() => {
      if (amountDebitRef.current) {
        amountDebitRef.current.value = "";
        if (setFocus) amountDebitRef.current?.focus();
      }
    });
  }
  function resetCredit(setFocus = true) {
    wait(100).then(() => {
      if (transactionRef.current) {
        transactionRef.current.value = "";
      }
      if (amountCreditRef.current) {
        amountCreditRef.current.value = "0.00";
      }
      if (faoRef.current) {
        faoRef.current.value = "";
      }
      if (remarksRef.current) {
        remarksRef.current.value = "";
      }
      if (vatTypeRef.current) {
        vatTypeRef.current.value = "Non-VAT";
      }
      if (invoiceRef.current) {
        invoiceRef.current.value = "";
      }
      accCodeRef.current = "";
      accTitleRef.current = "";
      accTCRef.current = "";
      foaIDNoRef.current = "";
      if (setFocus) transactionRef.current?.focus();
    });
  }
  function handleOnAdd() {
    setCollectionMode("add");
    resetCollection();
  }
  function handleOnSave() {
    const debitTableData = debitTable.current.getData();
    const creditTableData = creditTable.current.getData();

    if (ornoRef.current && ornoRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide OR number",
        timer: 1500,
      });
    } else if (pnClientRef.current && pnClientRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide PN/Client ID",
        timer: 1500,
      }).then(() => {
        wait(350).then(() => {
          if (pnClientRef.current)
            clientModalRef.current.openModal(pnClientRef.current?.value);
        });
      });
    } else if (debitTableData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide debit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          paymentTypeRef.current?.focus();
        });
      });
    } else if (creditTableData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide credit entry",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          transactionRef.current?.focus();
        });
      });
    } else if (
      parseFloat(
        debitTableData.reduce(
          (sum: any, obj: any) =>
            sum + parseFloat(obj.Amount.toString().replace(/,/g, "")),
          0
        )
      ).toFixed(2) !==
      parseFloat(
        creditTableData.reduce(
          (sum: any, obj: any) =>
            sum + parseFloat(obj.amount.toString().replace(/,/g, "")),
          0
        )
      ).toFixed(2)
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title:
          "Transaction is not balanced. Check if the amount you entered are correct!",
        timer: 1500,
      });
    }

    const state = {
      ORNo: ornoRef.current?.value,
      Date: dateRef.current?.value,
      PNo: pnClientRef.current?.value,
      Name: clientNameRef.current?.value,
      debit: JSON.stringify(debitTableData),
      credit: JSON.stringify(creditTableData),
    };

    if (collectionMode === "update") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutate({ ...state, userCodeConfirmation, mode: "" });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutate({ ...state, mode: "" });
        },
      });
    }
  }
  function handleOnClose() {
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
        setCollectionMode("");
        resetCollection();
      }
    });
  }
  function handleOnPrint() {
    if (ornoRef.current)
      mutatePrint({
        ORNo: ornoRef.current.value,
        reportTitle:
          process.env.REACT_APP_DEPARTMENT === "UMIS"
            ? "UPWARD MANAGEMENT INSURANCE SERVICES"
            : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.",
      });
  }

  return (
    <>
      {(loadingAddNew ||
        NewORNoLoading ||
        isLoadingPrint ||
        isLoadingGetSearchCheckFromClientId ||
        loadingCollectionDataSearch ||
        isLoadingOutputTax) && <Loading />}

      <PageHelmet title="Collection" />
      <div
        className="main"
        style={{
          height: "auto",
          width: "100%",
          background: "#F1F1F1",
          flex: 1,
        }}
      >
        <ModalCheck
          ref={modalCheckRef}
          handleOnSave={() => {
            const refs = modalCheckRef.current.getRefs();
            saveCheckDebit(refs);
          }}
          handleOnClose={() => {
            debitTable.current.setSelectedRow(null);
            buttonCheckSave.current?.focus();
          }}
        />

        <div
          style={{
            width: "100%",
            height: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "5px",
          }}
        >
          <div
            style={{
              height: "30px",
              display: "flex",
              columnGap: "10px",
            }}
          >
            <TextInput
              containerClassName="search-input"
              containerStyle={{ width: "550px" }}
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
                    searchCollectionModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
                style: { width: "500px", height: "22px" },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (searchRef.current)
                  searchCollectionModalRef.current.openModal(
                    searchRef.current.value
                  );
              }}
              inputRef={searchRef}
            />
            <div
              className="collection-desktop-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              <IconButton
                aria-label="add"
                size="small"
                color="info"
                onClick={handleOnAdd}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                disabled={disableFields}
                aria-label="save"
                size="small"
                color="success"
                onClick={handleOnSave}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                disabled={collectionMode !== "update"}
                aria-label="print"
                size="small"
                color="secondary"
                onClick={handleOnPrint}
              >
                <LocalPrintshopIcon />
              </IconButton>
              <IconButton
                disabled={disableFields}
                aria-label="print"
                size="small"
                color="error"
                onClick={handleOnClose}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          {/*first layer*/}
          <div
            className="layer-one"
            style={{
              height: "auto",
              display: "flex",
              alignItems: "center",
              columnGap: "50px",
              padding: "7px",
              width: "100%",
            }}
          >
            <div
              className="layer-content"
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                width: "50%",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "320px",
                }}
                label={{
                  title: "OR No. : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  readOnly: true,
                  type: "text",
                  style: { width: "250px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      refetchNewOR();
                    }
                  },
                }}
                disableIcon={collectionMode !== "add"}
                inputRef={ornoRef}
                icon={<RestartAltIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  refetchNewOR();
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
                  disabled: disableFields,
                  type: "date",
                  style: { width: "250px" },
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      pnClientRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateRef}
              />
            </div>
            <div
              className="layer-content"
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                width: "50%",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "60%",
                }}
                label={{
                  title: "PN/Client ID : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      clientModalRef.current.openModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (pnClientRef.current) {
                    clientModalRef.current.openModal(pnClientRef.current.value);
                  }
                }}
                inputRef={pnClientRef}
              />
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Client Name : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { width: "80%" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={clientNameRef}
              />
            </div>
          </div>
        </div>
        <ContentContainer
          containerClassName="first"
          title={"Particulars (Debit)"}
          firstContent={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "15px",
                  marginTop: "5px",
                  flex: 1,
                }}
              >
                <SelectInput
                  containerStyle={{ width: "100%" }}
                  label={{
                    title: "Payment Type : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  selectRef={paymentTypeRef}
                  select={{
                    disabled: disableFields,
                    style: { flex: 1, height: "22px" },
                    value: paymentType,
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        e.preventDefault();
                        amountDebitRef.current?.focus();
                      }
                    },
                    onChange: (e) => {
                      if (e.target.value === "CHK" && amountDebitRef.current) {
                        amountDebitRef.current.value = "0.00";
                        wait(100).then(() => {
                          buttonCheckSave.current?.focus();
                        });
                      }
                      setPaymentType(e.target.value);
                    },
                  }}
                  datasource={[
                    { key: "Cash", value: "CSH" },
                    { key: "Check", value: "CHK" },
                  ]}
                  values={"value"}
                  display={"key"}
                />
                <button
                  ref={buttonCheckSave}
                  disabled={paymentType === "CSH"}
                  className={`custom-btn ripple-button ${
                    paymentType === "CSH" ? "disabled" : "not-disabled"
                  }`}
                  style={{
                    padding: "0 5px",
                    borderRadius: "0px",
                    color: "white",
                    height: "22px",
                    background: paymentType === "CSH" ? "#8fc993" : "#1b5e20",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    modalCheckRef.current?.showModal();
                    wait(100).then(() => {
                      modalCheckRef.current?.checknoRef.current?.focus();
                    });
                  }}
                >
                  <AddIcon sx={{ fontSize: "22px" }} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "15px",
                }}
              >
                <TextFormatedInput
                  containerStyle={{
                    flex: 1,
                  }}
                  label={{
                    title: "Amount : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    disabled: paymentType === "CHK" || disableFields,
                    type: "text",
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        buttonCshSave.current?.click();
                      }
                    },
                  }}
                  inputRef={amountDebitRef}
                />
                <button
                  ref={buttonCshSave}
                  disabled={paymentType === "CHK"}
                  className={`custom-btn ripple-button ${
                    paymentType === "CHK" ? "disabled" : "not-disabled"
                  }`}
                  style={{
                    padding: "0 5px",
                    borderRadius: "0px",
                    color: "white",
                    height: "22px",
                    cursor: "pointer",
                    background: paymentType === "CHK" ? "#8fc993" : "#1b5e20",
                  }}
                  onClick={(e) => {
                    if (amountDebitRef.current && paymentTypeRef.current) {
                      saveCashDebit(
                        amountDebitRef.current.value,
                        paymentTypeRef.current.value
                      );
                    }
                  }}
                >
                  <ForwardIcon sx={{ fontSize: "20px" }} />
                </button>
              </div>
              <Button
                className="add-chk-button"
                ref={buttonCheckList}
                disabled={paymentType === "CSH"}
                startIcon={<AddIcon />}
                sx={{
                  height: "30px",
                  fontSize: "11px",
                  marginTop: "20px",
                }}
                color="success"
                variant="contained"
                onClick={() => {
                  checksFromPDCModalRef.current.openModal("");
                }}
              >
                Add Check from PDC Entry
              </Button>
            </div>
          }
          secondContent={
            <div
              style={{
                width: "100%",
                position: "relative",
                flex: 1,
                display: "flex",
              }}
            >
              <DataGridViewReactUpgraded
                ref={debitTable}
                fixedRowCount={10}
                columns={debitColumn}
                handleSelectionChange={async (rowItm: any) => {
                  if (rowItm) {
                    if (rowItm.Payment === "Cash") {
                      wait(100).then(() => {
                        if (amountDebitRef.current)
                          amountDebitRef.current.value = rowItm.Amount;
                      });
                    } else {
                      if (rowItm.Deposit_Slip && rowItm.Deposit_Slip !== "") {
                        debitTable.current.setSelectedRow(null);
                        buttonCheckSave.current?.focus();
                        return alert(
                          ` Unable to edit. Check No [${rowItm.Check_No}] already deposited!`
                        );
                      }
                      if (rowItm.Cntr && rowItm.Cntr !== "") {
                        debitTable.current.setSelectedRow(null);
                        buttonCheckSave.current?.focus();
                        return alert(
                          ` Unable to edit. Check No [${rowItm.Check_No}] is a PDC reference!`
                        );
                      }

                      modalCheckRef.current?.showModal();

                      wait(100).then(() => {
                        if (modalCheckRef.current) {
                          if (modalCheckRef.current.checknoRef.current) {
                            modalCheckRef.current.checknoRef.current.value =
                              rowItm.Check_No;
                          }
                          if (modalCheckRef.current.bankRef.current) {
                            modalCheckRef.current.bankRef.current.value =
                              rowItm.Bank_Branch.split("/")[0];
                          }
                          if (modalCheckRef.current.branchRef.current) {
                            modalCheckRef.current.branchRef.current.value =
                              rowItm.Bank_Branch.split("/")[1];
                          }
                          if (modalCheckRef.current.remarksRef.current) {
                            modalCheckRef.current.remarksRef.current.value =
                              rowItm.Remarks;
                          }
                          if (modalCheckRef.current.checkdateRef.current) {
                            modalCheckRef.current.checkdateRef.current.value =
                              rowItm.Check_Date;
                          }
                          if (modalCheckRef.current.amountRef.current) {
                            modalCheckRef.current.amountRef.current.value =
                              rowItm.Amount;
                          }
                          if (modalCheckRef.current.bankRefName.current) {
                            modalCheckRef.current.bankRefName.current =
                              rowItm.Bank_Branch.split("/")[0];
                          }
                        }
                      });
                    }
                  } else {
                    wait(100).then(() => {
                      if (amountDebitRef.current)
                        amountDebitRef.current.value = "0.00";
                    });
                  }
                }}
                FooterComponent={() => {
                  return (
                    <div
                      style={{
                        fontSize: "13px",
                        textAlign: "right",
                        // background: "#dcdcdc",
                        fontWeight: "bold",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {totalDebit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  );
                }}
                onDelete={(data: any) => {
                  setTotalDebit(
                    data.reduce(
                      (sum: any, subArray: any) =>
                        sum + parseFloat(subArray[1].replace(/,/g, "")),
                      0
                    )
                  );
                }}
                DisplayData={({ row, col }: any) => {
                  return (
                    <>
                      {col.key === "Check_Date"
                        ? row.Payment.toLowerCase() === "cash"
                          ? ""
                          : format(new Date(row[col.key]), "MM/dd/yyyy")
                        : row[col.key]}
                    </>
                  );
                }}
              />
            </div>
          }
          contentStyle={`
          .custom-btn.not-disabled:hover{
            background:#154f19 !important;
          }
          .main-container-controller{
            height:240px !important;
          }
          `}
        />
        <ContentContainer
          containerClassName="second"
          title={"Particulars Breakdown (Credit)"}
          firstContent={
            <div
              style={{
                display: "flex",
                rowGap: "5px",
                flexDirection: "column",
              }}
            >
              <label
                htmlFor="auto-solo-collection"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                Transaction :
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "15px",
                  flex: 1,
                }}
              >
                {paymentTypeLoading ? (
                  <LoadingButton loading={paymentTypeLoading} />
                ) : (
                  <div style={{ flex: 1 }}>
                    <Autocomplete
                      label={{
                        title: " ",
                        style: {
                          width: "0px",
                          display: "none",
                        },
                      }}
                      input={{
                        id: "auto-solo-collection",
                        style: {
                          width: "100%",
                          flex: 1,
                        },
                      }}
                      width={"100%"}
                      DisplayMember={"Description"}
                      DataSource={transactionDesc?.data.transactionDesc}
                      disableInput={disableFields}
                      inputRef={transactionRef}
                      onChange={(selected: any, e: any) => {
                        console.log(selected);
                        if (transactionRef.current)
                          transactionRef.current.value = selected.Description;

                        accCodeRef.current = selected.Acct_Code;
                        accTitleRef.current = selected.Acct_Title;
                        accTCRef.current = selected.Code;
                      }}
                      onKeydown={(e: any) => {
                        if (e.key === "Enter" || e.key === "NumpadEnter") {
                          e.preventDefault();
                          amountCreditRef.current?.focus();
                        }
                      }}
                    />
                  </div>
                )}
                <button
                  className="custom-btn ripple-button"
                  style={{
                    background: "#1b5e20",
                    padding: "0 5px",
                    borderRadius: "0px",
                    color: "white",
                    height: "22px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    wait(100).then(() => {
                      if (transactionRef.current) {
                        transactionRef.current.value = "";
                      }
                      if (amountCreditRef.current) {
                        amountCreditRef.current.value = "0.00";
                      }
                      if (faoRef.current) {
                        faoRef.current.value = "";
                      }
                      if (remarksRef.current) {
                        remarksRef.current.value = "";
                      }
                      if (vatTypeRef.current) {
                        vatTypeRef.current.value = "Non-VAT";
                      }
                      if (invoiceRef.current) {
                        invoiceRef.current.value = "";
                      }
                      accCodeRef.current = "";
                      accTitleRef.current = "";
                      accTCRef.current = "";
                      foaIDNoRef.current = "";
                      transactionRef.current?.focus();
                      creditTable.current.setSelectedRow(null);
                    });
                  }}
                >
                  <AddIcon sx={{ fontSize: "22px" }} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "15px",
                  width: "100%",
                  flex: 1,
                }}
              >
                <TextFormatedInput
                  containerStyle={{
                    flex: 1,
                  }}
                  label={{
                    title: "Amount : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  input={{
                    disabled: disableFields,
                    type: "text",
                    style: { flex: 1, width: "100%" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        faoRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={amountCreditRef}
                />

                <button
                  className="custom-btn ripple-button"
                  style={{
                    background: "#1b5e20",
                    padding: "0 5px",
                    borderRadius: "0px",
                    color: "white",
                    height: "22px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    saveCredit();
                  }}
                >
                  <ForwardIcon sx={{ fontSize: "22px" }} />
                </button>
              </div>
              <TextInput
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "FAO : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      clientCreditModalRef.current.openModal(
                        e.currentTarget.value
                      );
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (faoRef.current) {
                    clientCreditModalRef.current.openModal(
                      faoRef.current.value
                    );
                  }
                }}
                inputRef={faoRef}
              />
              <TextAreaInput
                label={{
                  title: "Remarks : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                textarea={{
                  disabled: disableFields,
                  rows: 3,
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    e.stopPropagation();
                    if (
                      (e.code === "NumpadEnter" && !e.shiftKey) ||
                      (e.code === "Enter" && !e.shiftKey)
                    ) {
                      vatTypeRef.current?.focus();
                    }
                  },
                }}
                _inputRef={remarksRef}
              />
              <SelectInput
                label={{
                  title: "Vat Type : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                selectRef={vatTypeRef}
                select={{
                  disabled: disableFields,
                  style: { flex: 1, height: "22px" },
                  defaultValue: "Non-VAT",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                      invoiceRef.current?.focus();
                    }
                  },
                }}
                datasource={[
                  { key: "VAT", value: "VAT" },
                  { key: "Non-VAT", value: "Non-VAT" },
                ]}
                values={"value"}
                display={"key"}
              />
              <TextInput
                label={{
                  title: "Invoice : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      saveCredit();
                    }
                  },
                }}
                inputRef={invoiceRef}
              />
            </div>
          }
          secondContent={
            <div
              style={{
                width: "100%",
                position: "relative",
                flex: 1,
                display: "flex",
              }}
            >
              <DataGridViewReactUpgraded
                ref={creditTable}
                fixedRowCount={10}
                columns={creditColumn}
                handleSelectionChange={(rowItm: any) => {
                  if (rowItm) {
                    wait(100).then(() => {
                      if (transactionRef.current) {
                        transactionRef.current.value = rowItm.transaction;
                      }
                      if (amountCreditRef.current) {
                        amountCreditRef.current.value = rowItm.amount;
                      }
                      if (faoRef.current) {
                        faoRef.current.value = rowItm.Name;
                      }
                      if (remarksRef.current) {
                        remarksRef.current.value = rowItm.Remarks;
                      }
                      if (vatTypeRef.current) {
                        vatTypeRef.current.value = rowItm.VATType;
                      }
                      if (invoiceRef.current) {
                        invoiceRef.current.value = rowItm.invoiceNo;
                      }
                      accCodeRef.current = rowItm.Code;
                      accTitleRef.current = rowItm.Title;
                      accTCRef.current = rowItm.TC;
                      foaIDNoRef.current = rowItm.Account_No;
                    });
                  } else {
                    resetCredit(false);
                  }
                }}
                FooterComponent={() => {
                  return (
                    <div
                      style={{
                        fontSize: "13px",
                        textAlign: "right",
                        // background: "#dcdcdc",
                        fontWeight: "bold",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {totalCredit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  );
                }}
                onDelete={(data: any) => {
                  setTotalCredit(
                    data.reduce(
                      (sum: any, subArray: any) =>
                        sum + parseFloat(subArray[1].replace(/,/g, "")),
                      0
                    )
                  );
                }}
              />
            </div>
          }
          contentStyle={`
          .custom-btn.not-disabled:hover{
            background:#154f19 !important;
          }
            .custom-btn:focus{
              outline:3px solid #2563eb;
            }
          .custom-btn:hover{
            background-color:#154218;
          }
        `}
        />
        <div
          className="collection-mobile-buttons"
          style={{
            display: "none",
            alignItems: "center",
            columnGap: "10px",
          }}
        >
          <IconButton
            aria-label="add"
            size="small"
            color="info"
            onClick={handleOnAdd}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            disabled={disableFields}
            aria-label="save"
            size="small"
            color="success"
            onClick={handleOnSave}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            disabled={collectionMode !== "update"}
            aria-label="print"
            size="small"
            color="secondary"
            onClick={handleOnPrint}
          >
            <LocalPrintshopIcon />
          </IconButton>
          <IconButton
            disabled={disableFields}
            aria-label="print"
            size="small"
            color="error"
            onClick={handleOnClose}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      {/* client modal */}
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
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              IDNo.current = rowItm.client_id;
              if (pnClientRef.current) {
                pnClientRef.current.value = rowItm.IDNo;
              }
              if (clientNameRef.current) {
                clientNameRef.current.value = rowItm.Name ?? "";
              }
              paymentTypeRef.current?.focus();
            });
            clientModalRef.current.closeModal();
          }
        }}
      />
      {/* client credit modal */}
      <UpwardTableModalSearch
        ref={clientCreditModalRef}
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
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              foaIDNoRef.current = rowItm.IDNo;
              if (faoRef.current) {
                faoRef.current.value = rowItm.Name ?? "";
              }
              remarksRef.current?.focus();
            });
            clientCreditModalRef.current.closeModal();
          }
        }}
      />
      {/* search checks from pd modal */}
      <UpwardTableModalSearch
        ref={checksFromPDCModalRef}
        link={"/task/accounting/search-checks-from-client-id"}
        otherFormData={() => {
          return {
            PNo: pnClientRef.current?.value,
          };
        }}
        column={[
          { key: "Check_No", label: "Check No", width: 100 },
          { key: "Check_Date", label: "Check Date", width: 100 },
          {
            key: "Amount",
            label: "Amount",
            width: 90,
            type: "number",
          },
          {
            key: "Bank_Branch",
            label: "Bank Branch",
            width: 200,
          },
          {
            key: "Remarks",
            label: "Remarks",
            width: 200,
            hide: true,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(async () => {
              if (pnClientRef.current) {
                mutateGetSearchCheckFromClientId({
                  PNo: pnClientRef.current.value,
                  checkNo: rowItm.Check_No,
                });
                //     const dt = await executeQueryToClient(`
                // SELECT
                //   Check_No,
                //   Check_Date,
                //   Check_Amnt,
                //   bank.Bank as Bank,
                //   CONCAT(bank.Bank, '/', Branch)  AS BName,
                //   Branch,
                //   Remarks
                // FROM pdc
                // LEFT JOIN bank  ON pdc.Bank = bank.Bank_Code
                // WHERE PNo = '${pnClientRef.current.value}' AND Check_No = '${rowItm[0]}'`);
              }
            });
            checksFromPDCModalRef.current.closeModal();
          }
        }}
      />
      {/* search collection modal */}
      <UpwardTableModalSearch
        ref={searchCollectionModalRef}
        link={"/task/accounting/search-collection"}
        column={[
          { key: "Date_OR", label: "OR Date", width: 100 },
          { key: "ORNo", label: "OR No.", width: 100 },
          { key: "Name", label: "Name", width: 400 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              resetCredit(false);
              resetDebit(false);
              mutateCollectionDataSearch({ ORNo: rowItm.ORNo });
            });
            searchCollectionModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
export const ContentContainer = ({
  firstContent,
  secondContent,
  title,
  contentStyle,
  containerClassName,
}: any) => {
  return (
    <div
      className={`main-container-controller  ${containerClassName}`}
      style={{
        width: "100%",
        height: "auto",
        display: "flex",
        // padding: "5px",
      }}
    >
      <style>{contentStyle}</style>
      <div
        className="container-controller"
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          borderTop: "1px solid rgb(213, 216, 221)",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "-12px",
            left: "10px",
            background: "#F1F1F1",
            padding: "0 5px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {title}
        </span>
        <div
          className="first-content"
          style={{
            width: "30%",
            height: "100%",
            padding: "10px 5px",
            boxSizing: "border-box",
          }}
        >
          {firstContent}
        </div>
        <div
          className="second-content"
          style={{
            width: "70%",
            height: "100%",
            padding: "10px 5px",
            boxSizing: "border-box",
          }}
        >
          {secondContent}
        </div>
      </div>
    </div>
  );
};
const ModalCheck = forwardRef(({ handleOnSave, handleOnClose }: any, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [handleDelayClose, setHandleDelayClose] = useState(false);
  const [blick, setBlick] = useState(false);

  const checknoRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const branchRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const checkdateRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const bankRefName = useRef("");
  const searchModalInputRef = useRef<HTMLInputElement>(null);

  const bankModalRef = useRef<any>(null);

  const closeDelay = () => {
    setHandleDelayClose(true);
    setTimeout(() => {
      setShowModal(false);
      setHandleDelayClose(false);
      handleOnClose();
    }, 100);
  };
  const closeDelayRef = useRef<any>(closeDelay);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setShowModal(true);
    },
    clsoeModal: () => {
      setShowModal(false);
    },
    getRefs: () => {
      const refs = {
        checknoRef,
        bankRef,
        branchRef,
        remarksRef,
        checkdateRef,
        amountRef,
        bankRefName,
      };
      return refs;
    },
    checknoRef,
    bankRef,
    branchRef,
    remarksRef,
    checkdateRef,
    amountRef,
    bankRefName,
    searchModalInputRef,
    closeDelay,
  }));

  useEffect(() => {
    window.addEventListener("keydown", (e: any) => {
      if (e.key === "Escape") {
        closeDelayRef.current();
      }
    });
  }, []);

  return showModal ? (
    <>
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
        className="modal-add-check"
        style={{
          height: blick ? "202px" : "200px",
          width: blick ? "60.3%" : "60%",
          border: "1px solid #64748b",
          position: "absolute",
          left: "50%",
          top: "50%",
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
            Check Details
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
          className="main-content"
          style={{
            flex: 1,
            background: "#F1F1F1",
            padding: "5px",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "55%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
              padding: "10px",
            }}
          >
            <TextInput
              label={{
                title: "Check No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                type: "text",
                style: { width: "160px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    bankRef.current?.focus();
                  }
                },
              }}
              inputRef={checknoRef}
            />

            <TextInput
              containerStyle={{
                width: "370px",
              }}
              label={{
                title: "Bank : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                disabled: false,
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    bankModalRef.current.openModal(e.currentTarget.value);
                  }
                },
              }}
              icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (bankRef.current) {
                  bankModalRef.current.openModal(bankRef.current.value);
                }
              }}
              inputRef={bankRef}
            />

            <TextInput
              label={{
                title: "Branch : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    remarksRef.current?.focus();
                  }
                },
              }}
              inputRef={branchRef}
            />
            <TextAreaInput
              label={{
                title: "Remarks : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              textarea={{
                rows: 4,
                style: { width: "300px" },
                onKeyDown: (e) => {
                  e.stopPropagation();
                  if (
                    (e.code === "NumpadEnter" && !e.shiftKey) ||
                    (e.code === "Enter" && !e.shiftKey)
                  ) {
                    checkdateRef.current?.focus();
                  }
                },
              }}
              _inputRef={remarksRef}
            />
          </div>
          <div
            style={{
              width: "45%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
              position: "relative",
              padding: "10px",
              alignItems: "flex-end",
            }}
          >
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
                type: "date",
                style: { width: "200px" },
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    amountRef.current?.focus();
                  }
                },
              }}
              inputRef={checkdateRef}
            />
            <TextFormatedInput
              label={{
                title: "Amount : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                type: "text",
                style: { width: "200px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (handleOnSave) {
                      if (!validateDate(checkdateRef.current?.value)) {
                        return alert("Not Valid Date!");
                      }

                      handleOnSave();
                    }
                  }
                },
              }}
              inputRef={amountRef}
            />
            <div
              className="modal-add-check-buttons"
              style={{
                display: "flex",
                columnGap: "10px",
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="success"
                style={{
                  height: "22px",
                  fontSize: "12px",
                }}
                onClick={(e) => {
                  if (handleOnSave) {
                    if (!validateDate(checkdateRef.current?.value)) {
                      return alert("Not Valid Date!");
                    }
                    handleOnSave();
                  }
                }}
              >
                OK
              </Button>
              <Button
                variant="contained"
                color="success"
                style={{
                  height: "22px",
                  fontSize: "12px",
                }}
                onClick={(e) => {
                  closeDelay();
                }}
              >
                Cancel
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
      {/* Bank */}
      <UpwardTableModalSearch
        ref={bankModalRef}
        link={"/task/accounting/search-pdc-banks"}
        column={[
          { key: "Bank_Code", label: "Code", width: 130 },
          { key: "Bank", label: "Bank Name", width: 300 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              bankRefName.current = rowItm.Bank_Code;
              if (bankRef.current) {
                bankRef.current.value = rowItm.Bank;
              }
              branchRef.current?.focus();
            });
            bankModalRef.current.closeModal();
          }
        }}
      />
    </>
  ) : null;
});
const validateDate = (dateStr: any, dateFormat = "yyyy-MM-dd") => {
  const parsedDate = parse(dateStr, dateFormat, new Date());
  const isDateValid =
    isValid(parsedDate) && format(parsedDate, dateFormat) === dateStr;
  return isDateValid;
};
