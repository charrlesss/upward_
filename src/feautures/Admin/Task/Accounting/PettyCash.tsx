import { useReducer, useContext, useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { AuthContext } from "../../../../components/AuthContext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery, QueryClient } from "react-query";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import { wait } from "../../../../lib/wait";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";
import PageHelmet from "../../../../components/Helmet";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";

const initialState = {
  sub_refNo: "",
  refNo: "",
  datePetty: new Date(),
  payee: "",
  explanation: "",
  transactionPurpose: "",
  transactionCode: "",
  transactionTitle: "",
  transactionShort: "",
  clientName: "",
  clientID: "",
  amount: "",
  invoice: "",
  option: "non-vat",
  search: "",
  pettyCashMode: "",
};
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
  { key: "amount", label: "Amount", width: 170 },
  {
    key: "usage",
    label: "Usage",
    width: 300,
  },
  { key: "accountID", label: "Account ID", width: 300 },
  { key: "sub_account", label: "Sub Account", width: 80 },
  { key: "clientID", label: "ID No", width: 100 },
  // hide
  { key: "clientName", label: "Name", width: 300 },
  { key: "accountCode", label: "Accoount Code", width: 200 },
  {
    key: "accountShort",
    label: "Account Short",
    width: 200,
  },
  { key: "vatType", label: "Vat Type", width: 100 },
  { key: "invoice", label: "Invoice", width: 100 },
  { key: "TempID", label: "TempId", hide: true },
];
export const chartColumn = [
  { field: "Acct_Code", headerName: "Code", flex: 1 },
  { field: "Acct_Title", headerName: "Title", flex: 1 },
  { field: "Short", headerName: "Short Name", flex: 1 },
];
export default function PettyCash() {
  const tableRef = useRef<any>(null)
  const inputSearchRef = useRef<HTMLInputElement>(null)

  const subrefNoRef = useRef('')
  const refNoRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const payeeRef = useRef<HTMLInputElement>(null)
  const explanationRef = useRef<HTMLInputElement>(null)


  const accountRef = useRef<HTMLInputElement>(null);
  const usageRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLSelectElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);

  const transactionCodeRef = useRef('')
  const transactionShortRef = useRef('')
  const clientIdRef = useRef('')





  const { myAxios, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [editTransaction, setEditTransaction] = useState({
    edit: false,
    updateId: "",
  });
  const [pettyCash, setPettyCash] = useState<GridRowSelectionModel>([]);
  const payeeInputRef = useRef<HTMLInputElement>(null);
  const explanationInputRef = useRef<HTMLInputElement>(null);
  let creditTransactionRef = useRef<HTMLInputElement>(null);
  const pdcSearchInput = useRef<HTMLInputElement>(null);
  const queryClient = new QueryClient();
  const isDisableField = state.pettyCashMode === "";
  const table = useRef<any>(null);
  const chartAccountSearchRef = useRef<HTMLInputElement>(null);





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
        subrefNoRef.current = response.data.pettyCashId[0].petty_cash_id
        if (refNoRef.current) {
          refNoRef.current.value = response.data.pettyCashId[0].petty_cash_id
        }
      })
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
        initialState.pettyCashMode = "";
        setNewStateValue(dispatch, initialState);
        refetchettyCashIdGenerator();
        setPettyCash([]);
        queryClient.invalidateQueries("petty-cash-search");
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

      setNewStateValue(dispatch, {
        ...state,
        ...{
          sub_refNo: loadPettyCash[0].PC_No,
          refNo: loadPettyCash[0].PC_No,
          datePetty: loadPettyCash[0].PC_Date,
          payee: loadPettyCash[0].Payee,
          explanation: loadPettyCash[0].Explanation,
          pettyCashMode: "edit",
        },
      });
      setPettyCash(loadPettyCash);
    },
  });

  const {
    isLoading: laodPettyCashTransaction,
    data: dataCashTransaction
  } = useQuery({
    queryKey: "load-transcation",
    queryFn: async () =>
      await myAxios.get(`/task/accounting/load-transcation`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
  });

  const {
    ModalComponent: ModalClientIDs,
    openModal: openCliendIDsModal,
    isLoading: isLoadingClientIdsModal,
    closeModal: closeCliendIDsModal,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-pdc-policy-id",
      queryUrlName: "searchPdcPolicyIds",
    },
    columns: [
      { field: "Type", headerName: "Type", width: 130 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      {
        field: "Name",
        headerName: "Name",
        flex: 1,
      },
      {
        field: "ID",
        headerName: "ID",
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "collection-polidy-ids",
    uniqueId: "IDNo",
    responseDataKey: "clientsId",
    onSelected: (selectedRowData, data) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "clientName",
        value: selectedRowData[0].Name,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "clientID",
        value: selectedRowData[0].IDNo,
      });
      closeCliendIDsModal();
      wait(100).then(() => {
        clientIdRef.current = selectedRowData[0].IDNo
        if (usageRef.current)
          usageRef.current.value = selectedRowData[0].Name
      })
      wait(200).then(() => {
        amountRef.current?.focus()
      })
    },
    searchRef: pdcSearchInput,
  });
  const {
    ModalComponent: ModalSearchPettyCash,
    openModal: openModalSearchPettyCash,
    isLoading: isLoadingModalSearchPettyCash,
    closeModal: closeModalSearchPettyCash,
  } = useQueryModalTable({
    link: {
      url: "/task/accounting/search-petty-cash",
      queryUrlName: "searchPettyCash",
    },
    columns: [
      { field: "PC_Date", headerName: "Type", width: 130 },
      { field: "PC_No", headerName: "ID No.", width: 200 },
      {
        field: "Payee",
        headerName: "Name",
        flex: 1,
      },
      {
        field: "Explanation",
        headerName: "ID",
        flex: 1,
      },
      {
        field: "Explanation",
        headerName: "ID",
        flex: 1,
        hide: true,
      },
    ],
    queryKey: "petty-cash-search",
    uniqueId: "PC_No",
    responseDataKey: "searchPettyCash",
    onSelected: (selectedRowData) => {
      mutateLoadSelectedPettyCash({ PC_No: selectedRowData[0].PC_No });
      dispatch({
        type: "UPDATE_FIELD",
        field: "pettyCashMode",
        value: "edit",
      });
      closeModalSearchPettyCash();
    },
    onCloseFunction: (value: any) => {
      dispatch({ type: "UPDATE_FIELD", field: "search", value });
    },
    searchRef: pdcSearchInput,
  });

  function handleOnSave() {
    if (state.payee.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Payee is too long!",
        timer: 1500,
      });
    }
    if (state.invoice.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Invoice is too long!",
        timer: 1500,
      });
    }
    if (state.amount.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Amount is too long!",
        timer: 1500,
      });
    }
    if (state.clientID.length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Usage is too long!",
        timer: 1500,
      });
    }
    if (state.payee === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide payee!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          payeeInputRef.current?.focus();
        });
      });
    }
    if (state.explanation === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide explanation!",
        timer: 1500,
      }).then((result) => {
        wait(300).then(() => {
          explanationInputRef.current?.focus();
        });
      });
    }
    if (pettyCash.length <= 0) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide transaction entry!",
        timer: 1500,
      });
    }
    if (state.pettyCashMode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateAddUpdatePettyCash({
            refNo: state.refNo,
            datePetty: state.datePetty,
            payee: state.payee,
            explanation: state.explanation,
            hasSelected: state.pettyCashMode === "edit",
            pettyCash,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAddUpdatePettyCash({
            refNo: state.refNo,
            datePetty: state.datePetty,
            payee: state.payee,
            explanation: state.explanation,
            hasSelected: state.pettyCashMode === "edit",
            pettyCash,
          });
        },
      });
    }
  }

  function handleAddTransaction() {
    // if (transactionCodeRef.current === "") {
    //   return Swal.fire({
    //     position: "center",
    //     icon: "warning",
    //     title: "Please provide transaction",
    //     timer: 1500,
    //   }).then(() => {
    //     wait(300).then(() => {
    //       creditTransactionRef.current?.focus();
    //     });
    //   });
    // }
    // if (clientIdRef.current === "") {
    //   return Swal.fire({
    //     position: "center",
    //     icon: "warning",
    //     title: "Please provide usage",
    //     timer: 1500,
    //   }).then(() => {
    //     wait(300).then(() => {
    //       openCliendIDsModal();
    //     });
    //   });
    // }
    // if (amountRef.current && (amountRef.current.value === "" || parseFloat(amountRef.current.value.replace(/,/g, "")) < 1)) {
    //   return Swal.fire({
    //     position: "center",
    //     icon: "warning",
    //     title: "Please provide proper amount",
    //     timer: 1500,
    //   }).then(() => {
    //     wait(300).then(() => {
    //       amountRef.current?.focus();
    //     });
    //   });
    // }
    // setPettyCash((d) => {
    //   let FirstTempId = "";
    //   if (editTransaction.edit) {
    //     FirstTempId = editTransaction.updateId;
    //   } else {
    //     FirstTempId = generateID(
    //       d.length > 0 ? (d[d.length - 1] as any).TempID : "000"
    //     );
    //   }

    //   const addPettyCashTransaction: Array<any> = [];
    //   d = d.filter((item: any) => item.TempID !== FirstTempId);

    //   addPettyCashTransaction.push({
    //     purpose: state.transactionPurpose,
    //     amount: parseFloat(state.amount).toLocaleString("en-US", {
    //       style: "decimal",
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     }),
    //     usage: `${state.clientName} > ${state.clientID} > HO`,
    //     accountID: `${state.transactionShort} > ${state.transactionCode}`,
    //     sub_account: "HO",
    //     clientID: state.clientID,
    //     clientName: state.clientName,
    //     accountCode: state.transactionCode,
    //     accountShort: state.transactionShort,
    //     vatType: state.option.toUpperCase(),
    //     invoice: state.invoice,
    //     TempID: FirstTempId,
    //   });

    //   if (state.transactionPurpose !== "Input Tax" && state.option === "vat") {
    //     const SecondTempId = generateID((d[d.length - 1] as any).TempID);
    //     const taxableAmount = parseFloat(state.amount.replace(/,/g, "")) / 1.12;
    //     const inputTax = taxableAmount * 0.12;
    //     addPettyCashTransaction.push({
    //       purpose: state.transactionPurpose,
    //       amount: parseFloat(inputTax.toFixed(2)).toLocaleString("en-US", {
    //         style: "decimal",
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //       }),
    //       usage: `${state.clientName} > ${state.clientID} > HO`,
    //       accountID: `${state.transactionShort} > ${state.transactionCode}`,
    //       sub_account: "HO",
    //       clientID: state.clientID,
    //       clientName: state.clientName,
    //       accountCode: "1.06.02",
    //       accountShort: "Input Tax",
    //       vatType: state.option.toUpperCase(),
    //       invoice: state.invoice,
    //       TempID: SecondTempId,
    //     });
    //   }

    //   function generateID(lastItem: any) {
    //     const numericPart = (parseInt(lastItem.match(/\d+/)[0]) + 1)
    //       .toString()
    //       .padStart(3, "0");
    //     return numericPart;
    //   }

    //   d = [...d, ...addPettyCashTransaction];
    //   return d;
    // });





    // initialState.datePetty = state.datePetty;
    // initialState.payee = state.payee;
    // initialState.explanation = state.explanation;
    // initialState.pettyCashMode = state.pettyCashMode;
    // initialState.sub_refNo = state.sub_refNo;
    // initialState.refNo = state.refNo;
    // setNewStateValue(dispatch, initialState);
    // setEditTransaction({ edit: false, updateId: "" });
  }

  function valueIsNaN(input: any) {
    if (input !== '' && input !== null) {
      const num = parseFloat(input.replace(/,/g, ''));
      return isNaN(num) ? '0.00' : input
    }
    return '0.00'
  }




  return (
    <>
      <PageHelmet title="Petty Cash" />
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
            marginBottom: "10px"
          }}
        >
          {isLoadingModalSearchPettyCash ? (
            <LoadingButton loading={isLoadingModalSearchPettyCash} />
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
                    openModalSearchPettyCash(e.currentTarget.value);
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
          {state.pettyCashMode === "" && (
            <Button
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
              id="entry-header-save-button"
              onClick={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "pettyCashMode",
                  value: "add",
                });
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
            disabled={state.pettyCashMode === ""}
            startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
            loading={loadingAddUpdatePettyCash}
          >
            {state.pettyCashMode === "edit" ? "Update" : "Save"}
          </LoadingButton>
          {state.pettyCashMode !== "" && (
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
                    initialState.pettyCashMode = "";
                    setNewStateValue(dispatch, initialState);
                    refetchettyCashIdGenerator();
                    setPettyCash([]);
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
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      dateRef.current?.focus()
                    }
                  }
                }}
                icon={<RestartAltIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault()
                  refetchettyCashIdGenerator()
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
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    payeeRef.current?.focus()
                  }
                }
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
            }}>
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
                style: { width: '400px' },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    explanationRef.current?.focus()
                  }
                }
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
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    accountRef.current?.focus()
                  }
                }
              }}
              inputRef={explanationRef}
            />
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          paddingTop: "20px",
          gap: "50px",
          borderRadius: "3px",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px"
          }}>
            {
              laodPettyCashTransaction ?
                <LoadingButton loading={laodPettyCashTransaction} /> :
                <Autocomplete
                  DisplayMember={'Purpose'}
                  DataSource={dataCashTransaction?.data.laodTranscation}
                  disableInput={isDisableField}
                  inputRef={accountRef}
                  onChange={(selected: any, e: any) => {
                    console.log(selected)
                  }}
                  onKeydown={(e: any) => {
                    if (e.key === "Enter" || e.key === 'NumpadEnter') {
                      e.preventDefault()
                      usageRef.current?.focus()
                    }
                  }}
                />
            }
            <div
              style={{
                display: "flex",
                columnGap: "20px"
              }}
            >
              {isLoadingClientIdsModal ? (
                <LoadingButton loading={isLoadingClientIdsModal} />
              ) : (
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
                      if (e.code === "NumpadEnter" || e.code === 'Enter') {
                        openCliendIDsModal(e.currentTarget.value)
                      }
                    }
                  }}
                  icon={<RestartAltIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={(e) => {
                    e.preventDefault()
                    if (usageRef.current) {
                      openCliendIDsModal(usageRef.current.value)
                    }
                  }}
                  inputRef={usageRef}
                />
              )}
              <div style={{
                display: "flex",
              }}>
                <label style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                }}>Amount :</label>
                <NumericFormat
                  disabled={isDisableField}
                  getInputRef={amountRef}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  style={{
                    width: '200px',
                  }}
                  onKeyDown={(e) => {
                    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                      vatRef.current?.focus()
                      e.currentTarget.value = valueIsNaN(e.currentTarget.value)
                    }

                  }}
                  onBlur={(e) => {
                    console.log(e.currentTarget.value)
                    if (e.currentTarget.value === '') {
                      e.currentTarget.value = '0.00'
                    }
                  }}
                  allowNegative={false}
                  thousandSeparator
                  valueIsNumericString
                />
              </div>

            </div>
            <div style={{
              display: "flex",
              columnGap: "20px"
            }}>
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
                    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                      invoiceRef.current?.focus()
                    }
                  },
                }}
                datasource={[{ key: 'NON-VAT' }, { key: 'VAT' }]}
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
                  style: { width: '270px' },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      e.preventDefault()
                      handleAddTransaction();
                    }
                  }
                }}
                inputRef={invoiceRef}
              />
              <Button
                disabled={isDisableField}
                color="success"
                variant="contained"
                style={{ gridArea: "button", height: "22px", fontSize: "12px", width: "270px" }}
                startIcon={<AddIcon />}
                onClick={() => {
                  handleAddTransaction();
                }}
              >
                {editTransaction.edit ? "Update Transaction" : "add Transaction"}
              </Button>
            </div>
          </div>
        </div>
        <br />
        <DepositTableSelected
          ref={tableRef}
          width="100%"
          height="350px"
          columns={columns}
          rows={pettyCash}
          getSelectedItem={(rowItm: any, colItm: any, rowIdx: any, colIdx: any) => {
          }}

        />
        {/* <div
          ref={refParent}
          style={{
            marginTop: "10px",
            width: "100%",
            position: "relative",
            flex: 1,
          }}
        >
          <Box
            style={{
              height: `${refParent.current?.getBoundingClientRect().height}px`,
              width: "100%",
              overflowX: "scroll",
              position: "absolute",
            }}
          >
            <Table
              ref={table}
              isLoading={
                loadingAddUpdatePettyCash || isLoadingLoadSelectedPettyCash
              }
              columns={selectedCollectionColumns}
              rows={pettyCash}
              table_id={"TempID"}
              isSingleSelection={true}
              isRowFreeze={false}
              dataSelection={(selection, data, code) => {
                const rowSelected = data.filter(
                  (item: any) => item.TempID === selection[0]
                )[0];
                if (rowSelected === undefined || rowSelected.length <= 0) {
                  setEditTransaction({
                    edit: false,
                    updateId: "",
                  });
                  setNewStateValue(dispatch, {
                    ...state,
                    ...{
                      transactionPurpose: "",
                      transactionCode: "",
                      transactionTitle: "",
                      transactionShort: "",
                      clientName: "",
                      clientID: "",
                      amount: "",
                      invoice: "",
                      option: "non-vat",
                    },
                  });
                  return;
                }

                if (code === "Delete" || code === "Backspace") {
                  Swal.fire({
                    title: "Are you sure?",
                    text: `You won't to delete this Check No. ${rowSelected.Check_No}`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      return setPettyCash((dt) => {
                        return dt.filter(
                          (item: any) => item.TempID !== selection[0]
                        );
                      });
                    }
                    table.current?.removeSelection();
                  });
                  return;
                }
                setNewStateValue(dispatch, {
                  ...state,
                  ...{
                    transactionPurpose: rowSelected.purpose,
                    transactionCode: rowSelected.accountCode,
                    transactionTitle: rowSelected.purpose,
                    transactionShort: rowSelected.DRShort,
                    clientName: rowSelected.clientName,
                    clientID: rowSelected.clientID,
                    amount: rowSelected.amount,
                    invoice: rowSelected.invoice,
                    option: rowSelected.vatType.toLowerCase(),
                  },
                });
                setEditTransaction({
                  edit: true,
                  updateId: rowSelected.TempID,
                });
              }}
            />
          </Box>
        </div> */}
        {ModalClientIDs}
        {ModalSearchPettyCash}
      </div>
    </>

  );
}
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
                      inset 2px 2px 0 #808080`

      }}>
      <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", position: "relative" }}>
          <thead >
            <tr>
              <th style={{
                width: '30px', border: "1px solid black",
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
                        border: "1px solid black",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        textAlign: "left",
                        padding: "0px 5px"
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
                  <tr key={rowIdx}>
                    <td style={{
                      position: "relative", borderBottom: "1px solid black",
                      borderLeft: "1px solid black",
                      borderTop: "none",
                      borderRight: "1px solid black",
                      cursor: "pointer",
                      background: selectedRow === rowIdx ? "#bae6fd" : "#f0f0f0",
                    }}>
                      <input
                        style={{
                          cursor: "pointer",
                          height: "10px"
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
                        onDoubleClick={() => {

                        }}
                      />
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
                              border: "1px solid black",
                              background: selectedRow === rowIdx ? "#cbd5e1" : "transparent",
                              fontSize: "12px",
                              padding: "0px 5px",
                              cursor: "pointer",
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
                                  userSelect: "none"
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
  )
})
const Autocomplete = ({
  DisplayMember,
  DataSource,
  inputRef,
  disableInput = false,
  onKeydown,
  onChange
}: any) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // Ref to store the suggestion container
  const suggestionListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Scroll the active suggestion into view
    const activeElement = suggestionListRef.current?.children[activeSuggestionIndex];
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSuggestionIndex]);

  const handleChange = (e: any) => {
    const value = e.target.value;

    setInputValue(value);

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
    setInputValue(suggestion[DisplayMember]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestionIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault()

      setActiveSuggestionIndex((prevIndex) =>
        Math.max(prevIndex - 1, 0)
      );
    } else if (e.key === "Enter" || e.key === 'NumpadEnter') {
      e.preventDefault()


      if (filteredSuggestions.length > 0) {
        const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
        onChange(selectedSuggestion, e)
        setInputValue(selectedSuggestion[DisplayMember]);
        setShowSuggestions(false);
      }

    }

    setTimeout(() => {
      if (onKeydown)
        onKeydown(e)
    }, 150)
  };

  return (
    <div>
      <TextInput
        label={{
          title: "Transaction : ",
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            width: "80px",
          },
        }}
        input={{
          disabled: disableInput,
          type: "text",
          style: { width: '740px' },
          value: inputValue,
          onKeyDown: handleKeyDown,
          onChange: handleChange
        }}
        inputRef={inputRef}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions" ref={suggestionListRef}>
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={(e) => {
                handleClick(suggestion)
                onChange(suggestion, e)
              }}
              className={index === activeSuggestionIndex ? "active" : ""}
              onMouseEnter={(e) => {
                e.preventDefault()
                setActiveSuggestionIndex(Math.min(index, filteredSuggestions.length - 1));
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
            border: 1px solid #ddd;
            margin-top: 0;
            padding: 0;
            list-style: none;
            max-height: 150px;
            overflow-y: auto;
            position:absolute;
            z-index:100;
            background:#F1F1F1;
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
};

function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
