import {
  useState,
  useContext,
  CSSProperties,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import { useMutation, useQuery } from "react-query";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { wait } from "@testing-library/user-event/dist/utils";
import { format } from "date-fns";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SearchIcon from "@mui/icons-material/Search";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { AuthContext } from "../../../../components/AuthContext";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import { formatNumber } from "./ReturnCheck";
import PageHelmet from "../../../../components/Helmet";
import { Loading } from "../../../../components/Loading";
import { TextInput } from "../../../../components/UpwardFields";
import {
  DataGridViewReactMultipleSelection,
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import "../../../../style/monbileview/accounting/deposit.css";

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
const cashColumns = [
  {
    key: "OR_No",
    label: "OR No.",
    width: 100,
  },
  {
    key: "OR_Date",
    label: "OR Date",
    width: 100,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    type: "number",
    cellClassName: "super-app-theme--cell",
  },
  {
    key: "Client_Name",
    label: "Client Name",
    width: 350,
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
const checkColumns = [
  {
    key: "OR_No",
    label: "OR No.",
    width: 100,
  },
  {
    key: "OR_Date",
    label: "OR Date",
    width: 100,
  },
  {
    key: "Check_No",
    label: "Check No",
    width: 150,
  },
  {
    key: "Check_Date",
    label: "Check Date",
    width: 100,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    align: "right",
    type: "number",
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
const selectedCollectionColumns = [
  { key: "Deposit", label: "Deposit", width: 80 },
  { key: "Check_No", label: "Check No", width: 150 },
  {
    key: "Check_Date",
    label: "Check Date",
    width: 100,
  },
  { key: "Bank", label: "Bank/Branch", width: 350 },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    type: "number",
  },
  { key: "Name", label: "Client Name", width: 350 },
  // hide
  { key: "DRCode", label: "DRCode", hide: true },
  { key: "ORNo", label: "ORNo", hide: true },
  { key: "DRRemarks", label: "DRRemarks", hide: true },
  { key: "IDNo", label: "IDNo", hide: true },
  { key: "TempOR", label: "TempOR", hide: true },
  { key: "Short", label: "Short", hide: true },
];
const selectedCollectionForDeposit = [
  {
    key: "Bank",
    label: "Bank/Branch",
    width: 230,
  },
  {
    key: "Check_No",
    label: "Check No",
    width: 150,
  },
  {
    key: "Amount",
    label: "Amount",
    width: 100,
    type: "number",
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
        top: "105px",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "0px 5px",
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
export default function Deposit() {
  const { myAxios, user } = useContext(AuthContext);
  const [value, setValue] = useState(0);
  const [depositMode, setDepositMode] = useState("");

  const inputSearchRef = useRef<HTMLInputElement>(null);
  const refSlipCode = useRef<HTMLInputElement>(null);
  const refDateDepo = useRef<HTMLInputElement>(null);
  const refBankAcctCode = useRef<HTMLInputElement>(null);
  const refBankAcctName = useRef<HTMLInputElement>(null);

  const refBankAcctCodeTag = useRef("");
  const refBankAcctNameTag = useRef("");
  const refAcctID = useRef("");
  const refAcctName = useRef("");
  const refClassification = useRef("");
  const refSubAccount = useRef("");
  const refShortName = useRef("");

  const bankModalRef = useRef<any>(null);
  const searchDepositModalRef = useRef<any>(null);

  const cashTableRef = useRef<any>(null);
  const checksTableRef = useRef<any>(null);
  const selectedTableRef = useRef<any>(null);
  const collectionForDepositTableRef = useRef<any>(null);

  const checkTotalInputRef = useRef<HTMLInputElement>(null);
  const cashTotalInputRef = useRef<HTMLInputElement>(null);
  const cashTotalRef = useRef<HTMLSpanElement>(null);

  const [tableRowsInputValue, setTableRowsInputValue] =
    useState<Array<{ value1: string; value2: string; value3: string }>>(
      defaultCashBreakDown
    );

  const [cashData, setCashData] = useState<Array<any>>([]);
  const [checkData, setCheckData] = useState<Array<any>>([]);
  const disabledFields = depositMode === "";

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
            refSlipCode.current.value = response.data.slipcode[0].collectionID;
          }
        });
      },
    });
  const { isLoading: loadingCashCollection, refetch: refetchCash } = useQuery({
    queryKey: "get-cash-collection",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-cash-collection`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      console.log(response.data.cash);
      setCashData(response.data.cash);
    },
    refetchOnWindowFocus: false,
  });
  const { isLoading: loadingCheckCollection, refetch: refetchCheck } = useQuery(
    {
      queryKey: "get-check-collection",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/get-check-collection`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess: (data) => {
        const response = data as any;
        console.log(response.data.check);
        setCheckData(response.data.check);
      },
      refetchOnWindowFocus: false,
    }
  );
  const {
    mutate: mutateDepositSearchSelected,
    isLoading: isLoadingDepositSearchSelected,
  } = useMutation({
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
      selected = [];
      if (cashTotalInputRef.current) {
        cashTotalInputRef.current.value = "0.00";
      }
      if (cashTotalInputRef.current) {
        cashTotalInputRef.current.value = "0.00";
      }
      if (cashTotalRef.current) {
        cashTotalRef.current.textContent = "0.00";
      }
      setTableRowsInputValue(defaultCashBreakDown);

      wait(100).then(() => {
        const obj = res.data.data.obj;
        const cash = res.data.data.cash;
        const check = res.data.data.checks;
        const cash_breakdown = res.data.data.cash_breakdown;

        const cashSelected = cash
          .filter(
            (itm: any) =>
              typeof itm.SlipCode === "string" && itm.SlipCode !== ""
          )
          .map((itm: any) => itm.Temp_OR);

        const checkSelected = check
          .filter(
            (itm: any) =>
              typeof itm.SlipCode === "string" && itm.SlipCode !== ""
          )
          .map((itm: any) => itm.Temp_OR);

        setCashData([...cash]);
        setCheckData([...check]);

        selected = [...cashSelected, ...checkSelected];
        setTableRowsInputValue(cash_breakdown);

        if (value === 0) {
          if (cashTableRef.current) {
            const cashSelectedIndex = cash
              .map((itm: any, idx: number) => {
                return {
                  ...itm,
                  rowIndex: idx,
                };
              })
              .filter(
                (itm: any) =>
                  typeof itm.SlipCode === "string" && itm.SlipCode !== ""
              )
              .map((itm: any) => itm.rowIndex);

            cashTableRef.current.setSelectedRow(cashSelectedIndex);
          }
        }
        if (value === 1) {
          if (checksTableRef.current) {
            const checkSelectedIndex = check
              .map((itm: any, idx: number) => {
                return {
                  ...itm,
                  rowIndex: idx,
                };
              })
              .filter(
                (itm: any) =>
                  typeof itm.SlipCode === "string" && itm.SlipCode !== ""
              )
              .map((itm: any) => itm.rowIndex);
            checksTableRef.current.setSelectedRow(checkSelectedIndex);
          }
        }

        if (refBankAcctCode.current)
          refBankAcctCode.current.value = obj.refBankAcctCode;
        if (refBankAcctName.current)
          refBankAcctName.current.value = obj.refBankAcctName;
        if (refDateDepo.current)
          refDateDepo.current.value = format(
            new Date(obj.refDate),
            "yyyy-MM-dd"
          );

        refBankAcctCodeTag.current = obj?.refBankAcctCodeTag;
        refBankAcctNameTag.current = obj?.refBankAcctNameTag;
        refAcctID.current = obj?.refAcctID;
        refAcctName.current = obj?.refAcctName;
        refShortName.current = obj?.client_name;
        refClassification.current = obj?.refClassification;
        refSubAccount.current = obj?.refSubAccount;
      });
    },
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
          resetAll();
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
        resetAll();
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
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const updateTableRows = (params: any, idx: number) => {
    setTableRowsInputValue((itm) => {
      const newItm = itm.map((d: any, index: number) => {
        if (index === idx) {
          d = params;
        }
        return d;
      });
      return newItm;
    });
  };
  const resetAll = () => {
    setTimeout(() => {
      selected = [];
      setDepositMode("");
      RefetchDepositSlipCode();
      if (refDateDepo.current) {
        refDateDepo.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (refBankAcctCode.current) {
        refBankAcctCode.current.value = "";
      }
      if (refBankAcctName.current) {
        refBankAcctName.current.value = "";
      }
      refetchCash();
      refetchCheck();
      if (value === 2) {
        selectedTableRef.current.resetTable([]);
      } else if (value === 3) {
        collectionForDepositTableRef.current.resetTable([]);
        setTableRowsInputValue(defaultCashBreakDown);
        if (checkTotalInputRef.current) {
          checkTotalInputRef.current.value = "0.00";
        }
        if (cashTotalInputRef.current) {
          cashTotalInputRef.current.value = "0.00";
        }
        if (cashTotalRef.current) {
          cashTotalRef.current.textContent = "0.00";
        }
      }
    }, 1000);
  };
  const handleSave = (e: any) => {
    e.preventDefault();
    if (
      refBankAcctCode.current &&
      refBankAcctCode.current?.value.length >= 200
    ) {
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
          bankModalRef.current.openModal(refBankAcctCode.current?.value);
        });
      });
    }

    if (selected.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "No selected collection to be deposit",
        timer: 1500,
      });
    }
    if (
      cashTotalRef.current?.textContent?.trim() !==
      cashTotalInputRef.current?.value.trim()
    ) {
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
    };

    const newCashData = cashData
      .filter((itm) => selected.includes(itm.Temp_OR))
      .map((itm: any) => {
        return {
          Deposit: "Cash",
          Check_No: "",
          Check_Date: "",
          Bank: "",
          Amount: itm.Amount,
          Name: itm.Client_Name,
          DRCode: itm.DRCode,
          ORNo: itm.OR_No,
          DRRemarks: "",
          IDNo: itm.ID_No,
          TempOR: itm.Temp_OR,
          Short: itm.Short,
        };
      });
    const newCheckData = checkData
      .filter((itm) => selected.includes(itm.Temp_OR))
      .map((itm: any) => {
        return {
          Deposit: "Check", //0
          Check_No: itm.Check_No, //1
          Check_Date: itm.Check_Date, //2
          Bank: itm.Bank_Branch, //3
          Amount: itm.Amount, //4
          Name: itm.Client_Name, //5
          DRCode: itm.DRCode, //7
          ORNo: itm.OR_No, //8
          DRRemarks: itm.DRRemarks, //9
          IDNo: itm.ID_No, //10
          TempOR: itm.Temp_OR, //11
          Short: itm.Short, //12
        };
      });
    const selectedData = [...newCashData, ...newCheckData];

    if (depositMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          updateDepositMutation({
            ...state,
            userCodeConfirmation,
            selectedCollection: JSON.stringify(selectedData),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          addDepositMutation({
            ...state,
            selectedCollection: JSON.stringify(selectedData),
            tableRowsInputValue: JSON.stringify(tableRowsInputValue),
          });
        },
      });
    }
  };

  useEffect(() => {
    if (value === 0) {
      cashTableRef.current.setData(cashData);
    } else if (value === 1) {
      checksTableRef.current.setData(checkData);
    } else if (value === 2) {
      const newCashData = cashData
        .filter((itm) => selected.includes(itm.Temp_OR))
        .map((itm: any) => {
          return {
            Deposit: "Cash",
            Check_No: "",
            Check_Date: "",
            Bank: "",
            Amount: itm.Amount,
            Name: itm.Client_Name,
            DRCode: itm.DRCode,
            ORNo: itm.OR_No,
            DRRemarks: "",
            IDNo: itm.ID_No,
            TempOR: itm.Temp_OR,
            Short: itm.Short,
          };
        });
      const newCheckData = checkData
        .filter((itm) => selected.includes(itm.Temp_OR))
        .map((itm: any) => {
          return {
            Deposit: "Check", //0
            Check_No: itm.Check_No, //1
            Check_Date: itm.Check_Date, //2
            Bank: itm.Bank_Branch, //3
            Amount: itm.Amount, //4
            Name: itm.Client_Name, //5
            DRCode: itm.DRCode, //7
            ORNo: itm.OR_No, //8
            DRRemarks: itm.DRRemarks, //9
            IDNo: itm.ID_No, //10
            TempOR: itm.Temp_OR, //11
            Short: itm.Short, //12
          };
        });
      const newData = [...newCashData, ...newCheckData];

      selectedTableRef.current.setData(newData);
    } else if (value === 3) {
      const newCashData = cashData
        .filter((itm) => selected.includes(itm.Temp_OR))
        .map((itm: any) => {
          return {
            Deposit: "Cash",
            Check_No: "",
            Check_Date: "",
            Bank: "",
            Amount: itm.Amount,
            Name: itm.Client_Name,
            prevRowIndex: itm.rowIndex,
            DRCode: itm.DRCode,
            ORNo: itm.OR_No,
            DRRemarks: "",
            IDNo: itm.ID_No,
            TempOR: itm.Temp_OR,
            Short: itm.Short,
          };
        });

      const newCheckData = checkData
        .filter((itm) => selected.includes(itm.Temp_OR))
        .map((itm: any) => {
          return {
            Bank: itm.Bank_Branch,
            Check_No: itm.Check_No,
            Amount: itm.Amount,
            TempOR: itm.Temp_OR,
          };
        });

      if (checkTotalInputRef.current) {
        checkTotalInputRef.current.value = formatNumber(
          newCheckData?.reduce((a: number, item: any) => {
            let deb = 0;
            if (!isNaN(parseFloat(item.Amount.replace(/,/g, "")))) {
              deb = parseFloat(item.Amount.replace(/,/g, ""));
            }
            return a + deb;
          }, 0) || 0
        );
      }

      if (cashTotalRef.current) {
        cashTotalRef.current.textContent = formatNumber(
          newCashData?.reduce((a: number, item: any) => {
            let deb = 0;
            if (!isNaN(parseFloat(item.Amount.replace(/,/g, "")))) {
              deb = parseFloat(item.Amount.replace(/,/g, ""));
            }
            return a + deb;
          }, 0) || 0
        );
      }

      collectionForDepositTableRef.current.setData(newCheckData);
    }
  }, [value, cashData, checkData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value === 0 && cashTableRef.current) {
        const cashData = cashTableRef.current.getData?.();
        if (cashData?.length > 0) {
          const getRowIndexs = cashData
            .filter((itm: any) => selected.includes(itm.Temp_OR))
            .map((itm: any) => itm.rowIndex);

          cashTableRef.current.setSelectedRowWithoutScroll(getRowIndexs);
        }
      } else if (value === 1 && checksTableRef.current) {
        const checkData = checksTableRef.current.getData?.();
        if (checkData?.length > 0) {
          const getRowIndexs = checkData
            .filter((itm: any) => selected.includes(itm.Temp_OR))
            .map((itm: any) => itm.rowIndex);

          checksTableRef.current.setSelectedRowWithoutScroll(getRowIndexs);
        }
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value === 3) {
        const value3Total = tableRowsInputValue.map((itm) => itm.value3);
        const totalInputCash = value3Total.reduce(
          (acc, val) => acc + parseFloat(val.replace(/,/g, "")),
          0
        );

        if (cashTotalInputRef.current) {
          cashTotalInputRef.current.value = formatNumber(totalInputCash);

          if (cashTotalRef.current) {
            if (
              cashTotalRef.current.textContent === formatNumber(totalInputCash)
            ) {
              cashTotalRef.current.style.color = "green";
            } else {
              cashTotalRef.current.style.color = "red";
            }
          }
        }
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [tableRowsInputValue, value, checkData]);

  return (
    <>
      <PageHelmet title="Deposit" />
      {(isLoadingDepositSearchSelected ||
        LoadingDepositSlipCode ||
        loadingCashCollection ||
        loadingCheckCollection ||
        addDepositMutationLoading ||
        updateDepositMutationLoading) && <Loading />}
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
                  searchDepositModalRef.current.openModal(
                    inputSearchRef.current?.value
                  );
                }
              },
              style: { width: "500px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current)
                searchDepositModalRef.current.openModal(
                  inputSearchRef.current.value
                );
            }}
            inputRef={inputSearchRef}
          />
          <div
            className="deposit-desktop-buttons"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "10px",
            }}
          >
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
                  setDepositMode("add");
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
              onClick={handleSave}
              disabled={disabledFields}
              startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
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
                      resetAll();
                    }
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        <form
          className="layer-one"
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
              return;
            }
          }}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Slip Code: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "70px",
              },
            }}
            input={{
              readOnly: false,
              disabled: disabledFields,
              className: "search-input-up-on-key-down",
              type: "text",
              style: { width: "200px" },
            }}
            inputRef={refSlipCode}
            icon={<AutorenewIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              RefetchDepositSlipCode();
            }}
          />
          <TextInput
            containerClassName="custom-input"
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
              disabled: disabledFields,
            }}
            inputRef={refDateDepo}
          />
          <TextInput
            containerClassName="custom-input"
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
                  bankModalRef.current.openModal(
                    refBankAcctCode.current?.value
                  );
                }
              },
              disabled: disabledFields,
            }}
            inputRef={refBankAcctCode}
            icon={
              <AccountBalanceIcon
                sx={{
                  fontSize: "18px",
                  color: disabledFields ? "gray" : "black",
                }}
              />
            }
            onIconClick={(e) => {
              e.preventDefault();
              bankModalRef.current.openModal(refBankAcctCode.current?.value);
            }}
            disableIcon={disabledFields}
          />
          <TextInput
            containerClassName="custom-input"
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
              disabled: disabledFields,
            }}
            inputRef={refBankAcctName}
          />
        </form>
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
                  Cash Collection
                </span>
              }
              sx={{
                width: "150px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              {...a11yProps(0)}
            />
            <Tab
              sx={{
                width: "150px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  Check Collection
                </span>
              }
              {...a11yProps(1)}
            />
            <Tab
              sx={{
                width: "200px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  Selected Collection
                </span>
              }
              {...a11yProps(2)}
            />
            <Tab
              sx={{
                width: "230px",
                minHeight: "30px",
                padding: 0,
                color: "black",
              }}
              label={
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  Collection For Deposit
                </span>
              }
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <DataGridViewReactMultipleSelection
              ref={cashTableRef}
              disableUnselection={true}
              adjustVisibleRowCount={180}
              columns={cashColumns}
              handleSelectionChange={(row: any) => {
                if (row) {
                  selected.push(row.Temp_OR);
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
              ref={checksTableRef}
              disableUnselection={true}
              adjustVisibleRowCount={180}
              columns={checkColumns}
              handleSelectionChange={(row: any) => {
                if (row) {
                  selected.push(row.Temp_OR);
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
              ref={selectedTableRef}
              adjustVisibleRowCount={180}
              columns={selectedCollectionColumns}
              handleSelectionChange={(rowItm: any) => {
                if (rowItm) {
                  selected = selected.filter(
                    (itm: string) => itm !== rowItm.TempOR
                  );
                  const selectedData = selectedTableRef.current.getData();
                  const newSelectedData = selectedData.filter(
                    (itm: any) => itm.rowIndex !== rowItm.rowIndex
                  );
                  selectedTableRef.current.setData(newSelectedData);
                  wait(100).then(() => {
                    selectedTableRef.current.setSelectedRow(null);
                  });
                } else {
                }
              }}
            />
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <div
              className="collection-for-deposit"
              style={{
                display: "flex",
                gap: "10px",
                height: "auto",
              }}
            >
              <div
                style={{
                  borderRadius: "5px",
                  width: "30%",
                  position: "relative",
                  paddingTop: "15px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    position: "absolute",
                    top: "3px",
                    left: "10px",
                    background: "#F1F1F1",
                    zIndex: 2,
                    fontSize: "14px",
                  }}
                >
                  Checks
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    width: "100%",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    padding: "10px",
                    flexDirection: "column",
                    rowGap: "5px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    <DataGridViewReactMultipleSelection
                      ref={collectionForDepositTableRef}
                      disableSelection={true}
                      adjustVisibleRowCount={241}
                      columns={selectedCollectionForDeposit}
                      handleSelectionChange={(row: any) => {
                        if (row) {
                        } else {
                        }
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "right",
                      columnGap: "5px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      Total Check Deposit:
                    </span>
                    <input
                      ref={checkTotalInputRef}
                      style={{
                        fontWeight: "bold",
                        border: "1px solid black",
                        textAlign: "right",
                        fontSize: "13px",
                        width: "180px",
                      }}
                      defaultValue={"0,00"}
                      readOnly={true}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  flexDirection: "column",
                  gap: "5px",
                  display: "flex",
                  width: "auto",
                  height: "480px",
                  position: "relative",
                  paddingTop: "15px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    // color:
                    // total === TotalCashForDeposit ? "#3b7a22" : "#ec4899",
                    position: "absolute",
                    top: "3px",
                    left: "10px",
                    background: "#F1F1F1",
                    zIndex: 2,
                    fontSize: "14px",
                  }}
                >
                  Cash (<span ref={cashTotalRef}>0.00</span>)
                </div>
                <div
                  style={{
                    border: "1px solid #cbd5e1",
                    padding: "8px",
                    borderRadius: "5px",
                  }}
                >
                  <CashBreakdownTable
                    tableRows={tableRowsInputValue}
                    updateTableRows={updateTableRows}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "right",
                      justifyContent: "flex-end",
                      columnGap: "5px",
                      padding: "0 10px",
                      marginTop: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      Total Cash Deposit:
                    </span>
                    <input
                      ref={cashTotalInputRef}
                      style={{
                        fontWeight: "bold",
                        textAlign: "right",
                        fontSize: "13px",
                        width: "140px",
                        border: "none",
                      }}
                      defaultValue={"0,00"}
                      readOnly={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomTabPanel>
        <UpwardTableModalSearch
          ref={bankModalRef}
          link={"/task/accounting/getBanks"}
          column={[
            { key: "Account_Type", label: "Account_Type", width: 80 },
            { key: "Account_No", label: "Account_No", width: 130 },
            {
              key: "Account_Name",
              label: "Account_Name",
              width: 200,
            },
            {
              key: "IDNo",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "Desc",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "Account_ID",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "Short",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "client_name",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "Sub_Acct",
              label: "",
              width: 0,
              hide: true,
            },
            {
              key: "ShortName",
              label: "",
              width: 0,
              hide: true,
            },
          ]}
          handleSelectionChange={(rowItm) => {
            if (rowItm) {
              wait(100).then(() => {
                if (refBankAcctCode.current)
                  refBankAcctCode.current.value = rowItm.Account_No; // selectedRowData[0]?.Account_No;
                if (refBankAcctName.current)
                  refBankAcctName.current.value = rowItm.Account_Name; // selectedRowData[0]?.Account_Name;

                refBankAcctCodeTag.current = rowItm.IDNo; // selectedRowData[0]?.IDNo;
                refBankAcctNameTag.current = rowItm.Desc; // selectedRowData[0]?.Desc;
                refAcctID.current = rowItm.Account_ID; //selectedRowData[0]?.Account_ID;
                refAcctName.current = rowItm.Short; //selectedRowData[0]?.Short;
                refShortName.current = rowItm.client_name; //selectedRowData[0]?.client_name;
                refClassification.current = rowItm.Sub_Acct; //selectedRowData[0]?.Sub_Acct;
                refSubAccount.current = rowItm.ShortName; //selectedRowData[0]?.ShortName;
              });
              bankModalRef.current.closeModal();
            }
          }}
        />
        <UpwardTableModalSearch
          ref={searchDepositModalRef}
          link={"/task/accounting/search-deposit"}
          column={[
            { key: "Date", label: "Date", width: 150 },
            { key: "SlipCode", label: "Slip Code", width: 170 },
            {
              key: "BankAccount",
              label: "Bank Account",
              width: 180,
            },
            {
              key: "AccountName",
              label: "Account Name",
              width: 300,
            },
          ]}
          handleSelectionChange={(rowItm) => {
            if (rowItm) {
              setDepositMode("edit");
              mutateDepositSearchSelected({ SlipCode: rowItm.SlipCode });
              wait(100).then(() => {
                if (refSlipCode.current) {
                  refSlipCode.current.value = rowItm.SlipCode;
                }
              });
              searchDepositModalRef.current.closeModal();
            }
          }}
        />
      </div>
    </>
  );
}
const CashBreakdownTable = ({ tableRows, updateTableRows }: any) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "2px",
        width: "350px",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          fontWeight: "bold",
          padding: "2px 6px",
          borderBottom: "1px solid #ccc",
          fontSize: "13px",
          textAlign: "center",
          width: "100px",
        }}
      >
        Denomination
      </div>
      <div
        style={{
          fontWeight: "bold",
          padding: "2px 6px",
          borderBottom: "1px solid #ccc",
          fontSize: "13px",
          textAlign: "center",
          width: "100px",
        }}
      >
        Qty
      </div>
      <div
        style={{
          fontWeight: "bold",
          padding: "2px 6px",
          borderBottom: "1px solid #ccc",
          fontSize: "13px",
          textAlign: "center",
          width: "100px",
        }}
      >
        Amount
      </div>
      {/* Data Rows */}
      {tableRows.map((row: any, index: number) => {
        return row.value1 !== "2.00" ? (
          <TrComponent
            idx={index}
            key={index}
            updateTableRows={updateTableRows}
            updateState={(params: any) => {
              params(row.value1, row.value2, row.value3);
            }}
          />
        ) : null;
      })}
    </div>
  );
};
const TrComponent = forwardRef(
  ({ idx, updateTableRows, updateState }: any, ref) => {
    const [input1, setInput1] = useState("");
    const [input2, setInput2] = useState("");
    const [input3, setInput3] = useState("");

    const inputStyle = (isBold: boolean): CSSProperties => ({
      border: "none",
      textAlign: "right",
      width: "100px",
      fontSize: "12px",
      fontWeight: isBold ? "bold" : "500",
    });

    useEffect(() => {
      updateState((value1: string, value2: string, value3: string) => {
        setInput1(value1);
        setInput2(value2);
        setInput3(value3);
      });
    }, [updateState]);

    return (
      <>
        <div
          style={{
            padding: "2px 6px",
            fontSize: "13px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
          }}
        >
          <input
            disabled={true}
            className={`row-${idx} col-0`}
            type="text"
            style={inputStyle(false)}
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            readOnly={true}
          />
        </div>
        <div
          style={{
            padding: "2px 6px",
            fontSize: "13px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
          }}
        >
          <input
            className={`row-${idx} col-1`}
            value={input2}
            style={inputStyle(false)}
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

              updateTableRows(
                {
                  value1: input1,
                  value2: e.target.value,
                  value3: valueFor3,
                },
                idx
              );
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                const nextInput = document.querySelector(
                  `#cash-breakdown-table td .row-${idx + 1}.col-1`
                ) as HTMLInputElement;
                if (nextInput) {
                  nextInput.focus();
                }
              }
            }}
          />
        </div>
        <div
          style={{
            padding: "2px 6px",
            fontSize: "13px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
          }}
        >
          <input
            style={inputStyle(parseFloat(input3.toString()) > 0)}
            disabled={true}
            className={`row-${idx} col-2`}
            type="text"
            value={input3}
            onChange={(e) => setInput3(e.target.value)}
            readOnly={true}
          />
        </div>
      </>
    );
  }
);
