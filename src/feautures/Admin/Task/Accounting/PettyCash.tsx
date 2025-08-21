import {
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useId,
} from "react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery } from "react-query";
import { wait } from "../../../../lib/wait";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import PageHelmet from "../../../../components/Helmet";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import SearchIcon from "@mui/icons-material/Search";
import { Loading } from "../../../../components/Loading";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { flushSync } from "react-dom";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import "../../../../style/monbileview/accounting/pettycash.css";

const columns = [
  { key: "purpose", label: "Purpose", width: 250 },
  { key: "amount", label: "Amount", width: 100, type:"number" },
  {
    key: "usage",
    label: "Usage",
    width: 350,
  },
  { key: "accountID", label: "Account ID", width: 250 },
  { key: "sub_account", label: "Sub Account", width: 100 },
  { key: "clientID", label: "ID No", width: 100 },
  // hide
  { key: "clientName", label: "Name", width: 350 },
  { key: "accountCode", label: "Accoount Code", width: 100 },
  {
    key: "accountShort",
    label: "Account Short",
    width: 300,
  },
  { key: "vatType", label: "Vat Type", width: 100 },
  { key: "invoice", label: "Invoice", width: 200 },
  { key: "TempID", label: "TempId", hide: true },
];

export default function PettyCash() {
  const { myAxios, user } = useContext(AuthContext);
  const [pettyCashMode, setPettyCashMode] = useState("");
  const { executeQueryToClient } = useExecuteQueryFromClient();
  const tableRef = useRef<any>(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);

  const subrefNoRef = useRef("");
  const refNoRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const payeeRef = useRef<HTMLInputElement>(null);
  const explanationRef = useRef<HTMLInputElement>(null);

  const accountRef = useRef<HTMLInputElement>(null);
  const _accountRef = useRef<any>(null);
  const usageRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLSelectElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);

  const pettyCashSearchRef = useRef<any>(null);
  const clientModalRef = useRef<any>(null);

  const transactionCodeRef = useRef("");
  const transactionShortRef = useRef("");
  const clientIdRef = useRef("");
  const subAcctRef = useRef("");

  const isDisableField = pettyCashMode === "";

  const {
    isLoading: loadingPettyCashIdGenerator,
    refetch: refetchettyCashIdGenerator,
  } = useQuery({
    queryKey: "petty-cash-id-generator",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/get-petty-cash-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      wait(100).then(() => {
        subrefNoRef.current = response.data.pettyCashId[0].petty_cash_id;
        if (refNoRef.current) {
          refNoRef.current.value = response.data.pettyCashId[0].petty_cash_id;
        }
      });
    },
  });
  const {
    isLoading: loadingAddUpdatePettyCash,
    mutate: mutateAddUpdatePettyCash,
  } = useMutation({
    mutationKey: "add-update-petty-cash",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/task/accounting/add-petty-cash`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (data) => {
      const response = data as any;
      if (response.data.success) {
        resetPettyCash();
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
    isLoading: isLoadingLoadSelectedPettyCash,
    mutate: mutateLoadSelectedPettyCash,
  } = useMutation({
    mutationKey: "load-selected-petty-cash",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/task/accounting/load-selected-petty-cash`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (data) => {
      const response = data as any;
      const loadPettyCash = response.data.loadSelectedPettyCash;
      subrefNoRef.current = loadPettyCash[0].PC_No;
      if (refNoRef.current) {
        refNoRef.current.value = loadPettyCash[0].PC_No;
      }
      if (dateRef.current) {
        dateRef.current.value = format(
          new Date(loadPettyCash[0].PC_Date),
          "yyyy-MM-dd"
        );
      }
      if (payeeRef.current) {
        payeeRef.current.value = loadPettyCash[0].Payee;
      }
      if (explanationRef.current) {
        explanationRef.current.value = loadPettyCash[0].Explanation;
      }

      tableRef.current.setData(loadPettyCash);
    },
  });
  const { isLoading: laodPettyCashTransaction } = useQuery({
    queryKey: "load-transcation",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/load-transcation`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),

    onSuccess(res) {
      wait(100).then(() => {
        if (_accountRef.current)
          _accountRef.current.setDataSource(res.data.laodTranscation);
      });
    },
    refetchOnWindowFocus: false,
  });

  function handleOnSave() {
    if (payeeRef.current && payeeRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide payee!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          payeeRef.current?.focus();
        });
      });
    }
    if (explanationRef.current && explanationRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide explanation!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          explanationRef.current?.focus();
        });
      });
    }

    const newData = tableRef.current.getData();


    if (newData.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide transaction entry!",
        timer: 1500,
      });
    }

    if (pettyCashMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateAddUpdatePettyCash({
            refNo: refNoRef.current?.value,
            datePetty: dateRef.current?.value,
            payee: payeeRef.current?.value,
            explanation: explanationRef.current?.value,
            hasSelected: pettyCashMode === "edit",
            pettyCash: newData,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAddUpdatePettyCash({
            refNo: refNoRef.current?.value,
            datePetty: dateRef.current?.value,
            payee: payeeRef.current?.value,
            explanation: explanationRef.current?.value,
            hasSelected: pettyCashMode === "edit",
            pettyCash: newData,
          });
        },
      });
    }
  }
  async function handleAddTransaction() {
    if (transactionCodeRef.current === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Transaction not found!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          accountRef.current?.focus();
        });
      });
    }
    if (transactionShortRef.current === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Transaction not found!",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          accountRef.current?.focus();
        });
      });
    }
    if (accountRef.current && accountRef.current.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide transaction",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          accountRef.current?.focus();
        });
      });
    }
    if (clientIdRef.current === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide usage",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          if (usageRef.current) {
            clientModalRef.current.openModal(usageRef.current.value);
          }
        });
      });
    }
    if (
      amountRef.current &&
      (amountRef.current.value === "" ||
        parseFloat(amountRef.current.value.replace(/,/g, "")) < 1)
    ) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide proper amount",
        timer: 1500,
      }).then(() => {
        wait(300).then(() => {
          amountRef.current?.focus();
        });
      });
    }

    const TransDetail = await executeQueryToClient(`
         SELECT DISTINCT
              Chart_Account.Acct_Code,
              Chart_Account.Acct_Title,
              Chart_Account.Short
          FROM
             petty_log as  Petty_Log
                  LEFT JOIN
             chart_account as  Chart_Account ON Petty_Log.Acct_Code = Chart_Account.Acct_Code
          WHERE
              Petty_Log.Acct_Code = '${transactionCodeRef.current}'
      `);

    const getSelectedItem = tableRef.current.getSelectedRow();
    if (getSelectedItem !== null) {
      const data = tableRef.current.getData();
      data.splice(getSelectedItem, 1);
      tableRef.current.setData(data);
    }

    wait(100).then(() => {
      const currentData = tableRef.current.getData();
      const newData = {
        purpose: accountRef.current?.value,
        amount: amountRef.current?.value,
        usage: `${usageRef.current?.value} > ${clientIdRef.current} > ${subAcctRef.current}`,
        accountID: `${TransDetail.data.data[0].Short} > ${TransDetail.data.data[0].Acct_Code}`,
        sub_account: subAcctRef.current,
        clientID: clientIdRef.current,
        clientName: usageRef.current?.value,
        accountCode: TransDetail.data.data[0].Acct_Code,
        accountShort: TransDetail.data.data[0].Short,
        vatType: vatRef.current?.value,
        invoice: invoiceRef.current?.value,
      };

      if (getSelectedItem !== null) {
        currentData.splice(getSelectedItem, 0, newData);
        tableRef.current.setData(currentData);
        tableRef.current.setSelectedRow(null);
      } else {
        tableRef.current.setData([...currentData, newData]);
        tableRef.current.setSelectedRow(null);
      }

      resetRefs();

      if (accountRef.current) {
        accountRef.current.focus();
      }
    });
  }
  function resetRefs() {
    setTimeout(() => {
      if (accountRef.current) {
        accountRef.current.value = "";
      }
      if (amountRef.current) {
        amountRef.current.value = "";
      }
      if (usageRef.current) {
        usageRef.current.value = "";
      }
      if (vatRef.current) {
        vatRef.current.value = "NON-VAT";
      }
      if (invoiceRef.current) {
        invoiceRef.current.value = "";
      }
      subAcctRef.current = "";
      clientIdRef.current = "";
      transactionCodeRef.current = "";
      transactionShortRef.current = "";
    }, 100);
  }
  function resetRefsEntry() {
    setTimeout(() => {
      refetchettyCashIdGenerator();
      if (dateRef.current) {
        dateRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (payeeRef.current) {
        payeeRef.current.value = "";
      }
      if (explanationRef.current) {
        explanationRef.current.value = "";
      }
    }, 100);
  }
  function resetPettyCash() {
    setPettyCashMode("");
    refetchettyCashIdGenerator();
    resetRefsEntry();
    resetRefs();
    tableRef.current.resetTable();
  }
  function valueIsNaN(input: any) {
    if (input !== "" && input !== null) {
      const num = parseFloat(input.replace(/,/g, ""));
      return isNaN(num) ? "0.00" : input;
    }
    return "0.00";
  }

  return (
    <>
      {(isLoadingLoadSelectedPettyCash || loadingAddUpdatePettyCash) && (
        <Loading />
      )}
      <PageHelmet title="Petty Cash" />
      <div
        className="main"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "auto",
          flex: 1,
          padding: "5px",
          background: "#F1F1F1",
          position: "relative",
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
                  pettyCashSearchRef.current.openModal(e.currentTarget.value);
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
              e.preventDefault();
              if (inputSearchRef.current)
                pettyCashSearchRef.current.openModal(
                  inputSearchRef.current.value
                );
            }}
            inputRef={inputSearchRef}
          />
          <div
            className="petty-cash-desktop-buttons"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "10px",
            }}
          >
            {pettyCashMode === "" && (
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                id="entry-header-save-button"
                onClick={() => {
                  setPettyCashMode("add");
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
              disabled={pettyCashMode === ""}
              startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
              loading={loadingAddUpdatePettyCash}
            >
              {pettyCashMode === "edit" ? "Update" : "Save"}
            </LoadingButton>
            {pettyCashMode !== "" && (
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
                      resetPettyCash();
                    }
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        <div
          className="layer-one"
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            borderBottom: "1px dashed  #334155",
            paddingBottom: "20px",
            gap: "50px",
            marginTop: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            {loadingPettyCashIdGenerator ? (
              <LoadingButton loading={loadingPettyCashIdGenerator} />
            ) : (
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Ref. No. : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "text",
                  style: { width: "200px" },
                  readOnly: true,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateRef.current?.focus();
                    }
                  },
                }}
                icon={<RestartAltIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  refetchettyCashIdGenerator();
                }}
                inputRef={refNoRef}
                disableIcon={pettyCashMode !== "add"}
              />
            )}
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Date: ",
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
                disabled: isDisableField,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    payeeRef.current?.focus();
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
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Payee : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: isDisableField,
                type: "text",
                style: { width: "400px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    explanationRef.current?.focus();
                  }
                },
              }}
              inputRef={payeeRef}
            />
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
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    accountRef.current?.focus();
                  }
                },
              }}
              inputRef={explanationRef}
            />
          </div>
        </div>
        <div
          className="layer-two"
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            paddingTop: "20px",
            gap: "50px",
            borderRadius: "3px",
          }}
        >
          <div
            className="layer-two-main-div"
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            {laodPettyCashTransaction ? (
              <LoadingButton loading={laodPettyCashTransaction} />
            ) : (
              <AutoCompletePro
                ref={_accountRef}
                inputRef={accountRef}
                disableInput={isDisableField}
                label={{
                  title: "Transaction : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                onChange={(e: any, selected: any) => {
                  if (selected) {
                    if (accountRef.current)
                      accountRef.current.value = selected.Purpose;
                    transactionCodeRef.current = selected.Acct_Code;
                    transactionShortRef.current = selected.Short;
                  } else {
                    if (accountRef.current)
                      accountRef.current.value = e.currentTarget.value;
                    transactionCodeRef.current = "";
                    transactionShortRef.current = "";
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    usageRef.current?.focus();
                  }
                }}
                containerStyle={{
                  width: "450px",
                }}
              />
            )}
            <div
              className="layer-two-main-div-container"
              style={{
                display: "flex",
                columnGap: "20px",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Usage : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "text",
                  style: { width: "450px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      clientModalRef.current.openModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={
                  <PersonSearchIcon
                    sx={{
                      fontSize: "18px",
                      color: isDisableField ? "gray" : "black",
                    }}
                  />
                }
                onIconClick={(e) => {
                  e.preventDefault();
                  if (usageRef.current) {
                    clientModalRef.current.openModal(usageRef.current.value);
                  }
                }}
                inputRef={usageRef}
              />
              <div
                style={{
                  display: "flex",
                }}
              >
                <label
                  className="petty-cash-amount-label"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  }}
                >
                  Amount :
                </label>
                <NumericFormat
                  className="petty-cash-amount-input"
                  disabled={isDisableField}
                  getInputRef={amountRef}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  style={{
                    width: "200px",
                  }}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      e.currentTarget.value = valueIsNaN(e.currentTarget.value);
                      vatRef.current?.focus();
                    }
                  }}
                  onBlur={(e) => {
                    if (e.currentTarget.value === "") {
                      e.currentTarget.value = "0.00";
                    }
                  }}
                  allowNegative={false}
                  thousandSeparator
                  valueIsNumericString
                />
              </div>
            </div>
            <div
              className="layer-two-main-div-container"
              style={{
                display: "flex",
                columnGap: "20px",
              }}
            >
              <SelectInput
                containerClassName="custom-input"
                containerStyle={{
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                label={{
                  title: "VAT Type",
                  style: {
                    width: "80px",
                  },
                }}
                select={{
                  defaultValue: "NON-VAT",
                  disabled: isDisableField,
                  style: {
                    width: "100% !important",
                    flex: 1,
                    height: "100% !important",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                  },
                  onKeyDown: (e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      invoiceRef.current?.focus();
                    }
                  },
                }}
                datasource={[{ key: "NON-VAT" }, { key: "VAT" }]}
                values={"key"}
                display={"key"}
                selectRef={vatRef}
              />
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Invoice : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: isDisableField,
                  type: "text",
                  style: { width: "270px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                      handleAddTransaction();
                    }
                  },
                }}
                inputRef={invoiceRef}
              />
              <Button
                className="button-transaction"
                disabled={isDisableField}
                color="success"
                variant="contained"
                style={{
                  gridArea: "button",
                  height: "22px",
                  fontSize: "12px",
                  width: "270px",
                }}
                startIcon={<AddIcon />}
                onClick={() => {
                  handleAddTransaction();
                }}
              >
                Save Transaction
              </Button>
            </div>
          </div>
        </div>

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
            adjustVisibleRowCount={290}
            columns={columns}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                if (accountRef.current) {
                  accountRef.current.value = rowItm.purpose;
                }
                if (amountRef.current) {
                  amountRef.current.value = rowItm.amount;
                }
                if (usageRef.current) {
                  usageRef.current.value = rowItm.clientName;
                }
                if (vatRef.current) {
                  vatRef.current.value = rowItm.vatType;
                }
                if (invoiceRef.current) {
                  invoiceRef.current.value = rowItm.invoice;
                }
                subAcctRef.current = rowItm.sub_account;
                clientIdRef.current = rowItm.clientID;
                transactionCodeRef.current = rowItm.accountCode;
                transactionShortRef.current = rowItm.accountShort;
              } else {
                resetRefs();
              }
            }}
          />
        </div>

        <div
          className="petty-cash-mobile-buttons"
          style={{
            display: "none",
            alignItems: "center",
            columnGap: "10px",
          }}
        >
          {pettyCashMode === "" && (
            <Button
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                setPettyCashMode("add");
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
            disabled={pettyCashMode === ""}
            startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
            loading={loadingAddUpdatePettyCash}
          >
            {pettyCashMode === "edit" ? "Update" : "Save"}
          </LoadingButton>
          {pettyCashMode !== "" && (
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
                    resetPettyCash();
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      {/* client modal */}
      <UpwardTableModalSearch
        ref={clientModalRef}
        link={"/task/accounting/search-pdc-policy-id"}
        column={[
          { key: "Type", label: "Type", width: 100 },
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
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              wait(100).then(() => {
                clientIdRef.current = rowItm.IDNo;
                subAcctRef.current = rowItm.Acronym;
                if (usageRef.current) usageRef.current.value = rowItm.Name;
              });
              wait(200).then(() => {
                if (amountRef.current) {
                  amountRef.current?.focus();
                  amountRef.current.value = "";
                }
              });
            });
            clientModalRef.current.closeModal();
          }
        }}
      />
      {/* search petty cash modal */}
      <UpwardTableModalSearch
        ref={pettyCashSearchRef}
        link={"/task/accounting/search-petty-cash"}
        column={[
          { key: "PC_Date", label: "Type", width: 90 },
          { key: "PC_No", label: "ID No.", width: 100 },
          {
            key: "Payee",
            label: "Name",
            width: 200,
          },
          {
            key: "Explanation",
            label: "Explanation",
            width: 200,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              wait(100).then(() => {
                mutateLoadSelectedPettyCash({ PC_No: rowItm.PC_No });
              });
              setPettyCashMode("edit");
            });
            pettyCashSearchRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
export const Autocomplete = forwardRef(
  (
    {
      DisplayMember,
      DataSource: _DataSource,
      inputRef,
      disableInput = false,
      onKeydown,
      onChange,
      label = {
        title: "Transaction : ",
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          width: "100px",
        },
      },
      input = {
        width: "740px",
      },
      containerStyle,
    }: any,
    ref: any
  ) => {
    const [DataSource, setDataSource] = useState(_DataSource);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    // Ref to store the suggestion container
    const suggestionListRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      // Scroll the active suggestion into view
      const activeElement =
        suggestionListRef.current?.children[activeSuggestionIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [activeSuggestionIndex]);

    const handleChange = (e: any) => {
      const value = e.target.value;

      if (value.trim()) {
        const filtered = DataSource.filter((item: any) =>
          item[DisplayMember].toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const handleClick = (suggestion: any) => {
      setShowSuggestions(false);
    };

    const handleKeyDown = (e: any) => {
      if (e.key === "Tab") {
        flushSync(() => {
          setShowSuggestions(false);
          setFilteredSuggestions([]);
        });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredSuggestions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();

        setActiveSuggestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter" || e.key === "NumpadEnter") {
        e.preventDefault();
        if (filteredSuggestions.length > 0) {
          const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
          onChange(selectedSuggestion, e);
          setShowSuggestions(false);
        }
      }

      setTimeout(() => {
        if (onKeydown) onKeydown(e);
      }, 150);
    };

    useImperativeHandle(ref, () => ({
      setDataSource: (newDataSource: Array<any>) => {
        setDataSource(newDataSource);
      },
    }));

    return (
      <div style={{ width: "100%" }}>
        <TextInput
          containerClassName="custom-input"
          containerStyle={containerStyle}
          label={label}
          input={{
            ...input,
            disabled: disableInput,
            type: "text",
            onKeyDown: handleKeyDown,
            onChange: handleChange,
            onFocus: (e) => {
              e.preventDefault();
              e.currentTarget?.focus();
              setShowSuggestions(true);
              setFilteredSuggestions(DataSource);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            },
            onBlur: (e) => {
              if (e.relatedTarget && e.relatedTarget.tagName === "LI") {
                wait(250).then(() => {
                  setShowSuggestions(false);
                  setFilteredSuggestions([]);
                });
              } else {
                setShowSuggestions(false);
                setFilteredSuggestions([]);
              }
            },
          }}
          icon={<KeyboardArrowDownIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          inputRef={inputRef}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="suggestions" ref={suggestionListRef}>
            {filteredSuggestions.map((suggestion, index) => (
              <li
                tabIndex={0}
                key={index}
                onClick={(e) => {
                  handleClick(suggestion);
                  onChange(suggestion, e);
                }}
                className={index === activeSuggestionIndex ? "active" : ""}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  setActiveSuggestionIndex(
                    Math.min(index, filteredSuggestions.length - 1)
                  );
                }}
              >
                {suggestion[DisplayMember]}
              </li>
            ))}
          </ul>
        )}
        <style>
          {`
          .suggestions {
            margin-top: 0;
            padding: 0;
            list-style: none;
            max-height: 150px;
            overflow-y: auto;
            position:absolute;
            z-index:100;
            background:white;
            width:350px;
            border:1px solid #e5e7eb;
            box-shadow: 0px 23px 32px -17px rgba(0,0,0,0.75);
          }
          .suggestions li {
            padding:3px 10px;
            cursor: pointer;
            font-size:14px;
          }
          .suggestions li.active {
            background-color: #e2e8f0;
          }
      
        `}
        </style>
      </div>
    );
  }
);

export const AutocompleteNumber = forwardRef(
  (
    {
      DisplayMember,
      DataSource: _DataSource,
      inputRef,
      disableInput = false,
      onKeydown,
      onChange,
      label = {
        title: "Transaction : ",
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          width: "100px",
        },
      },
      input = {
        width: "740px",
      },
      containerStyle,
    }: any,
    ref: any
  ) => {
    const [DataSource, setDataSource] = useState(_DataSource);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    // Ref to store the suggestion container
    const suggestionListRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      // Scroll the active suggestion into view
      const activeElement =
        suggestionListRef.current?.children[activeSuggestionIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [activeSuggestionIndex]);

    const handleClick = (suggestion: any) => {
      setShowSuggestions(false);
    };

    const handleKeyDown = (e: any) => {
      if (e.key === "Tab") {
        flushSync(() => {
          setShowSuggestions(false);
          setFilteredSuggestions([]);
        });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredSuggestions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();

        setActiveSuggestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter" || e.key === "NumpadEnter") {
        e.preventDefault();
        if (filteredSuggestions.length > 0) {
          const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
          onChange(selectedSuggestion, e);
          setShowSuggestions(false);
        }
      }

      setTimeout(() => {
        if (onKeydown) onKeydown(e);
      }, 150);
    };

    const formatNumber = (value: string) => {
      if (!value) return value;

      // Split the value into integer and decimal parts
      const parts = value.split(".");

      // Add commas to the integer part only
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Join the integer and decimal parts if decimal exists
      return parts.join(".");
    };

    // Helper function to remove commas
    const unformatNumber = (value: string) => {
      return value.replace(/,/g, "");
    };

    // Function to ensure two decimal places
    const ensureTwoDecimals = (value: string) => {
      // If the value has no decimal part, append '.00'
      if (!value.includes(".")) {
        if (value === "") {
          return "0.00";
        } else {
          return value + ".00";
        }
      }

      // If the value has one decimal place, append '0'
      const parts = value.split(".");
      if (parts[1].length === 1) {
        return value + "0";
      }

      // If it already has two decimal places, return as is
      return value;
    };

    const handleChange = (e: any) => {
      let value = e.target.value;

      // Remove commas for processing
      value = unformatNumber(value);

      // Allow only numbers, commas, and one decimal point
      const regex = /^-?\d+(,\d{3})*(\.\d*)?$/;

      // Remove commas for processing
      value = unformatNumber(value);

      // Check if the value is valid
      if (value === "" || regex.test(value)) {
        // Set the formatted value back in the input field
        //setInputValue(formatNumber(value));
        e.target.value = formatNumber(value);
      } else {
        const numbers = value.match(/\d+/g);
        if (numbers) {
          const newV = numbers.join("");
          e.target.value = formatNumber(newV);
        } else {
          e.target.value = "0";
        }
      }

      filterOnChange(e.target.value);
    };

    const filterOnChange = (value: any) => {
      if (value.trim()) {
        const filtered = DataSource.filter((item: any) =>
          item[DisplayMember].toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const formatOnBlur = (value: any, e: any) => {
      let newValue = unformatNumber(value);

      // Ensure the value has two decimal places
      newValue = ensureTwoDecimals(newValue);

      // Set the value with commas and .00 (if needed)
      // setInputValue(formatNumber(value));
      e.target.value = formatNumber(newValue);
    };

    useImperativeHandle(ref, () => ({
      setDataSource: (newDataSource: Array<any>) => {
        setDataSource(newDataSource);
      },
    }));

    return (
      <div style={{ flex: 1 }}>
        <TextInput
          containerStyle={containerStyle}
          label={label}
          input={{
            ...input,
            disabled: disableInput,
            type: "text",
            onKeyDown: handleKeyDown,
            onChange: handleChange,
            onFocus: (e) => {
              e.preventDefault();
              e.currentTarget?.focus();
              setShowSuggestions(true);
              setFilteredSuggestions(DataSource);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            },
            onBlur: (e) => {
              formatOnBlur(e.currentTarget.value, e);
              if (e.relatedTarget && e.relatedTarget.tagName === "LI") {
                wait(250).then(() => {
                  setShowSuggestions(false);
                  setFilteredSuggestions([]);
                });
              } else {
                setShowSuggestions(false);
                setFilteredSuggestions([]);
              }
            },
          }}
          icon={<KeyboardArrowDownIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          inputRef={inputRef}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="suggestions" ref={suggestionListRef}>
            {filteredSuggestions.map((suggestion, index) => (
              <li
                tabIndex={0}
                key={index}
                onClick={(e) => {
                  handleClick(suggestion);
                  onChange(suggestion, e);
                }}
                className={index === activeSuggestionIndex ? "active" : ""}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  setActiveSuggestionIndex(
                    Math.min(index, filteredSuggestions.length - 1)
                  );
                }}
              >
                {suggestion[DisplayMember]}
              </li>
            ))}
          </ul>
        )}
        <style>
          {`
          .suggestions {
            margin-top: 0;
            padding: 0;
            list-style: none;
            max-height: 150px;
            overflow-y: auto;
            position:absolute;
            z-index:100;
            background:white;
            width:350px;
            border:1px solid #e5e7eb;
            box-shadow: 0px 23px 32px -17px rgba(0,0,0,0.75);
          }
          .suggestions li {
            padding:3px 10px;
            cursor: pointer;
            font-size:14px;
          }
          .suggestions li.active {
            background-color: #e2e8f0;
          }
      
        `}
        </style>
      </div>
    );
  }
);

export const AutoCompletePro = forwardRef(
  (
    { containerStyle, label, inputRef, onChange, onKeydown, disableInput }: any,
    ref
  ) => {
    const listid = useId();
    const [options, setOptions] = useState<Array<any>>([]);

    // Handle selection
    const handleChange = (e: any) => {
      const value = e.target.value;

      // Find the matching object
      const match = options.find((item: any) => item.Purpose === value);
      onChange(e, match);
    };

    useImperativeHandle(ref, () => ({
      setDataSource: (data: Array<any>) => {
        setOptions(data);
      },
    }));

    return (
      <>
        <TextInput
          containerClassName="custom-input"
          containerStyle={containerStyle}
          label={label}
          input={{
            disabled: disableInput,
            list: listid,
            type: "text",
            onChange: handleChange,
            onKeyDown: onKeydown,
            style: {
              width: "calc(100% - 80px)",
            },
          }}
          inputRef={inputRef}
        />

        <datalist id={listid}>
          {options.map((item: any, index) => (
            <option key={index} value={item.Purpose} />
          ))}
        </datalist>
      </>
    );
  }
);
