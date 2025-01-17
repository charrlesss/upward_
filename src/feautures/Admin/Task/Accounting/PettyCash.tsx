import {
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
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
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
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
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import SearchIcon from "@mui/icons-material/Search";
import { Loading } from "../../../../components/Loading";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { flushSync } from "react-dom";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";


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
const columns = [
  { key: "purpose", label: "Purpose", width: 400 },
  { key: "amount", label: "Amount", width: 140 },
  {
    key: "usage",
    label: "Usage",
    width: 450,
  },
  { key: "accountID", label: "Account ID", width: 400 },
  { key: "sub_account", label: "Sub Account", width: 120 },
  { key: "clientID", label: "ID No", width: 140 },
  // hide
  { key: "clientName", label: "Name", width: 350 },
  { key: "accountCode", label: "Accoount Code", width: 130 },
  {
    key: "accountShort",
    label: "Account Short",
    width: 300,
  },
  { key: "vatType", label: "Vat Type", width: 100 },
  { key: "invoice", label: "Invoice", width: 200 },
  { key: "TempID", label: "TempId", hide: true },
];
export const chartColumn = [
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Acct_Title", headerName: "Title", flex: 1 },
  { field: "Short", headerName: "Short Name", flex: 1 },
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
  const usageRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLSelectElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);

  const pdcSearchInput = useRef<HTMLInputElement>(null);

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

      tableRef.current.setDataFormated(loadPettyCash);
    },
  });
  const { isLoading: laodPettyCashTransaction, data: dataCashTransaction } =
    useQuery({
      queryKey: "load-transcation",
      queryFn: async () =>
        await myAxios.get(`/task/accounting/load-transcation`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      refetchOnWindowFocus: false,
    });
  // const {
  //   ModalComponent: ModalClientIDs,
  //   openModal: openCliendIDsModal,
  //   isLoading: isLoadingClientIdsModal,
  //   closeModal: closeCliendIDsModal,
  // } = useQueryModalTable({
  //   link: {
  //     url: "/task/accounting/search-pdc-policy-id",
  //     queryUrlName: "searchPdcPolicyIds",
  //   },
  //   columns: [
  //     { field: "Type", headerName: "Type", width: 130 },
  //     { field: "IDNo", headerName: "ID No.", width: 200 },
  //     {
  //       field: "Name",
  //       headerName: "Name",
  //       flex: 1,
  //     },
  //     {
  //       field: "ID",
  //       headerName: "ID",
  //       flex: 1,
  //       hide: true,
  //     },
  //   ],
  //   queryKey: "collection-polidy-ids",
  //   uniqueId: "IDNo",
  //   responseDataKey: "clientsId",
  //   onSelected: (selectedRowData, data) => {
  //     closeCliendIDsModal();
  //     wait(100).then(() => {
  // clientIdRef.current = selectedRowData[0].IDNo;
  // subAcctRef.current = selectedRowData[0].Acronym;
  // if (usageRef.current) usageRef.current.value = selectedRowData[0].Name;
  //     });
      // wait(200).then(() => {
      //   if (amountRef.current) {
      //     amountRef.current?.focus();
      //     amountRef.current.value = "";
      //   }
      // });
  //   },
  //   searchRef: pdcSearchInput,
  // });

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
    const newDataFormatted = newData.map((itm: any) => {
      let newItm = {
        purpose: itm[0],
        amount: itm[1],
        usage: itm[2],
        accountID: itm[3],
        sub_account: itm[4],
        clientID: itm[5],
        clientName: itm[6],
        accountCode: itm[7],
        accountShort: itm[8],
        vatType: itm[9],
        invoice: itm[10],
      };
      return newItm;
    });

    if (newDataFormatted.length <= 0) {
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
            pettyCash: newDataFormatted,
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
            pettyCash: newDataFormatted,
          });
        },
      });
    }
  }
  async function handleAddTransaction() {
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
            clientOpenModal(usageRef.current.value);
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
              Petty_Log
                  LEFT JOIN
              Chart_Account ON Petty_Log.Acct_Code = Chart_Account.Acct_Code
          WHERE
              Petty_Log.Acct_Code = '${transactionCodeRef.current}'
      `);

    const currentData = tableRef.current.getData();
    let RowIndex = 0;
    if (currentData.length <= 0) {
      currentData[0] = [];
    } else {
      const getSelectedRow = tableRef.current.getSelectedRow();
      if (getSelectedRow) {
        RowIndex = getSelectedRow;
      } else {
        RowIndex = currentData.length;
        currentData[currentData.length] = [];
      }
    }
    currentData[RowIndex][0] = accountRef.current?.value;
    currentData[RowIndex][1] = amountRef.current?.value;
    currentData[
      RowIndex
    ][2] = `${usageRef.current?.value} > ${clientIdRef.current} > ${subAcctRef.current}`;
    currentData[
      RowIndex
    ][3] = `${TransDetail.data.data[0].Short} > ${TransDetail.data.data[0].Acct_Code}`;
    currentData[RowIndex][4] = subAcctRef.current;
    currentData[RowIndex][5] = clientIdRef.current;
    currentData[RowIndex][6] = usageRef.current?.value;
    currentData[RowIndex][7] = TransDetail.data.data[0].Acct_Code;
    currentData[RowIndex][8] = TransDetail.data.data[0].Short;
    currentData[RowIndex][9] = vatRef.current?.value;
    currentData[RowIndex][10] = invoiceRef.current?.value;
    tableRef.current.setData(currentData);
    tableRef.current.setSelectedRow(null);

    resetRefs();

    if (accountRef.current) {
      accountRef.current.focus();
    }
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
    tableRef.current.setData([]);
  }
  function valueIsNaN(input: any) {
    if (input !== "" && input !== null) {
      const num = parseFloat(input.replace(/,/g, ""));
      return isNaN(num) ? "0.00" : input;
    }
    return "0.00";
  }

  const {
    UpwardTableModalSearch: PettyCashUpwardTableModalSearch,
    openModal: pettyCashOpenModal,
    closeModal: pettyCashCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/search-petty-cash",
    column: [
      { key: "PC_Date", label: "Type", width: 130 },
      { key: "PC_No", label: "ID No.", width: 200 },
      {
        key: "Payee",
        label: "Name",
        flex: 1,
      },
      {
        key: "Explanation",
        label: "ID",
        flex: 1,
      },
      {
        key: "Explanation",
        label: "ID",
        flex: 1,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          mutateLoadSelectedPettyCash({ PC_No: rowItm[1] });
        });
        setPettyCashMode("edit");
        pettyCashCloseModal();
      }
    },
  });

  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/accounting/search-pdc-policy-id",
    column: [
      { key: "Type", label: "Type", width: 100 },
      { key: "IDNo", label: "ID No.", width: 120 },
      {
        key: "Name",
        label: "Name",
        width: 350,
      },
      { key: "chassis", label: "Chassis No.", width: 200 },
      {
        key: "remarks",
        label: "remarks",
        width: 0,
        hide: true,
      },
      {
        key: "client_id",
        label: "client_id",
        width: 0,
        hide: true,
      },
      {
        key: "Acronym",
        label: "Acronym",
        width: 0,
        hide: true,
      },
      {
        key: "sub_account",
        label: "sub_account",
        width: 0,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          clientIdRef.current = rowItm[1];
          subAcctRef.current = rowItm[6];
          if (usageRef.current)
            usageRef.current.value = rowItm[2];
        });
        wait(200).then(() => {
          if (amountRef.current) {
            amountRef.current?.focus();
            amountRef.current.value = "";
          }
        });
        clientCloseModal();
      }
    },
  });

  return (
    <>
      {(isLoadingLoadSelectedPettyCash || loadingAddUpdatePettyCash) && (
        <Loading />
      )}
      <PageHelmet title="Petty Cash" />
      <PettyCashUpwardTableModalSearch />
      <ClientUpwardTableModalSearch />
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
                  pettyCashOpenModal(e.currentTarget.value);
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
                pettyCashOpenModal(inputSearchRef.current.value);
            }}
            inputRef={inputSearchRef}
          />
          {pettyCashMode === "" && (
            <Button
              sx={{
                height: "30px",
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
              height: "30px",
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
                    resetPettyCash();
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        <div
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
              />
            )}
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
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            {laodPettyCashTransaction ? (
              <LoadingButton loading={laodPettyCashTransaction} />
            ) : (
              <Autocomplete
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Transaction : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                DisplayMember={"Purpose"}
                DataSource={dataCashTransaction?.data.laodTranscation}
                disableInput={isDisableField}
                inputRef={accountRef}
                input={{
                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (accountRef.current)
                    accountRef.current.value = selected.Purpose;
                  transactionCodeRef.current = selected.Acct_Code;
                  transactionShortRef.current = selected.Short;
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    usageRef.current?.focus();
                  }
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                columnGap: "20px",
              }}
            >
              <TextInput
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
                      clientOpenModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={   <PersonSearchIcon
                  sx={{
                    fontSize: "18px",
                    color: isDisableField ? "gray" : "black",
                  }}
                />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (usageRef.current) {
                    clientOpenModal(usageRef.current.value);
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
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  }}
                >
                  Amount :
                </label>
                <NumericFormat
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
              style={{
                display: "flex",
                columnGap: "20px",
              }}
            >
              <SelectInput
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
        <br />
        <DataGridViewReact
          ref={tableRef}
          width="100%"
          height="350px"
          columns={columns}
          getSelectedItem={(
            rowItm: any,
            colItm: any,
            rowIdx: any,
            colIdx: any
          ) => {
            if (rowItm) {
              if (accountRef.current) {
                accountRef.current.value = rowItm[0];
              }
              if (amountRef.current) {
                amountRef.current.value = rowItm[1];
              }
              if (usageRef.current) {
                usageRef.current.value = rowItm[6];
              }
              if (vatRef.current) {
                vatRef.current.value = rowItm[9];
              }
              if (invoiceRef.current) {
                invoiceRef.current.value = rowItm[10];
              }
              subAcctRef.current = rowItm[4];
              clientIdRef.current = rowItm[5];
              transactionCodeRef.current = rowItm[7];
              transactionShortRef.current = rowItm[8];
            } else {
              resetRefs();
            }
          }}
        />
      </div>
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
