import React, { useContext, useState, useRef, useId, useEffect } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { pink } from "@mui/material/colors";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import { wait } from "../../../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import PageHelmet from "../../../components/Helmet";
import { TextInput } from "../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import "../../../style/monbileview/reference/reference.css";

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
export const bankAccountColumn = [
  { key: "Account_Number", label: "Account Number", width: 120 },
  { key: "Account_Name", label: "Account Name", width: 350 },
  { key: "Account_Type", label: "AccountType", width: 100 },
  { key: "Bank_Name", label: "Bank Name", width: 100 },
  { key: "Account_ID", label: "Account ID", width: 100 },
  { key: "Inactive", label: "Inactive", width: 100 },
  { key: "ID_No", label: "IDNo", width: 100 },
  { key: "Identity", label: "Identity", width: 300 },
  { key: "Bank", label: "", width: 300, hide: true },
  { key: "Acct_Title", label: "", width: 300, hide: true },
  { key: "Auto", label: "", width: 300, hide: true },
];

export default function BankAccount() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const accountNoRef = useRef<HTMLInputElement>(null);
  const accountNameRef = useRef<HTMLInputElement>(null);
  const accountTypeRef = useRef<HTMLInputElement>(null);
  const inactiveRef = useRef<HTMLInputElement>(null);

  const bankCodeRef = useRef("");
  const bankRef = useRef<HTMLInputElement>(null);
  const accountCodeRef = useRef("");
  const accountRef = useRef<HTMLInputElement>(null);
  const iDNoRef = useRef<HTMLInputElement>(null);
  const identityRef = useRef<HTMLInputElement>(null);
  const autoRef = useRef("");

  const bankAccountModalRef = useRef<any>(null);
  const chartAccountModalRef = useRef<any>(null);
  const clientBankAccountModalRef = useRef<any>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-banck-account",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-bank-accounts", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        wait(100).then(() => {
          tableRef.current.setData(response.data.data);
        });
      }
    },
  });
  const mutateSearchRef = useRef<any>(mutateSearch);

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "add",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "edit",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/update-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "delete",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/delete-bank-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  function handleOnSave(e: any) {
    e.preventDefault();
    if (accountNoRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account number!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (accountNameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account name",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (accountTypeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account account type",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (bankRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide bank on deposit slip",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (accountRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account on deposit slip",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (iDNoRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide identity on deposit slip",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    let state: any = {
      Account_No: accountNoRef.current?.value,
      Account_Name: accountNameRef.current?.value,
      Account_Type: accountTypeRef.current?.value,
      Desc: bankCodeRef.current,
      Option: 0,
      Account_ID: accountCodeRef.current,
      Inactive: inactiveRef.current?.checked,
      IDNo: iDNoRef.current?.value,
      Identity: identityRef.current?.value,
    };
    if (mode === "edit") {
      state = {
        ...state,
        Auto: autoRef.current,
      };
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateEdit({ ...state, userCodeConfirmation });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAdd(state);
        },
      });
    }
  }
  function resetModule() {
    if (accountNoRef.current) {
      accountNoRef.current.value = "";
    }
    if (accountNameRef.current) {
      accountNameRef.current.value = "";
    }
    if (accountTypeRef.current) {
      accountTypeRef.current.value = "";
    }
    if (inactiveRef.current) {
      inactiveRef.current.checked = false;
    }

    if (bankRef.current) {
      bankRef.current.value = "";
    }
    if (accountRef.current) {
      accountRef.current.value = "";
    }
    if (iDNoRef.current) {
      iDNoRef.current.value = "";
    }
    if (identityRef.current) {
      identityRef.current.value = "";
    }
    bankCodeRef.current = "";
    accountCodeRef.current = "";
    autoRef.current = "";
  }
  function onSuccess(res: any) {
    if (res.data.success) {
      tableRef.current.resetTable();
      mutateSearchRef.current({ search: "" });
      resetModule();
      setMode("");
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
  }
  useEffect(() => {
    mutateSearchRef.current({ search: "" });
  }, []);

  return (
    <>
      {loadingSearch && <Loading />}
      <PageHelmet title="Bank" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",
          position: "relative",
        }}
      >
        <div
          style={{
            marginTop: "10px",
            marginBottom: "12px",
            width: "100%",
            display: "flex",
            columnGap: "7px",
          }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "550px",
            }}
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
                  mutateSearch({ search: e.currentTarget.value });
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
                mutateSearch({ search: inputSearchRef.current.value });
              }
            }}
            inputRef={inputSearchRef}
          />
          <div
            className="button-action-desktop"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "8px",
            }}
          >
            {mode === "" && (
              <Button
                style={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<AddIcon />}
                id="entry-header-save-button"
                onClick={() => {
                  setMode("add");
                }}
              >
                New
              </Button>
            )}
            <LoadingButton
              style={{
                height: "22px",
                fontSize: "11px",
              }}
              id="save-entry-header"
              color="primary"
              variant="contained"
              type="submit"
              sx={{
                height: "30px",
                fontSize: "11px",
              }}
              onClick={handleOnSave}
              startIcon={<SaveIcon />}
              disabled={mode === ""}
              loading={loadingAdd || loadingEdit}
            >
              Save
            </LoadingButton>
            {mode !== "" && (
              <Button
                style={{
                  height: "22px",
                  fontSize: "11px",
                }}
                variant="contained"
                startIcon={<CloseIcon />}
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
                      resetModule();
                      setMode("");
                      tableRef.current.resetTable();
                      mutateSearch({search:""})
                    }
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <LoadingButton
              id="save-entry-header"
              variant="contained"
              sx={{
                height: "22px",
                fontSize: "11px",
                backgroundColor: pink[500],
                "&:hover": {
                  backgroundColor: pink[600],
                },
              }}
              loading={loadingDelete}
              startIcon={<DeleteIcon />}
              disabled={mode !== "edit"}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  title: "Confirmation",
                  saveTitle: "Confirm",
                  text: `Are you sure you want to delete '${accountNoRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Auto: autoRef.current,
                      userCodeConfirmation,
                    });
                  },
                });
              }}
            >
              Delete
            </LoadingButton>
          </div>
        </div>
        <fieldset
          className=" container-fields"
          style={{
            border: "1px solid black",
            padding: "5px",
            width: "590px",
            rowGap: "5px",
            display: "flex",
            alignItems: "center",
            columnGap: "20px",
          }}
        >
          <legend
            style={{ color: "black", fontSize: "13px", fontWeight: "bold" }}
          >
            Bank Account Details
          </legend>

          <div
            className="container-max-width"
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account No: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "200px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    accountNameRef.current?.focus();
                  }
                },
              }}
              inputRef={accountNoRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "350px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    accountTypeRef.current?.focus();
                  }
                },
              }}
              inputRef={accountNameRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account Type : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "350px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    bankRef.current?.focus();
                  }
                },
              }}
              inputRef={accountTypeRef}
            />
            <CheckBoxLabel
              gridRow={1}
              inputRef={inactiveRef}
              label="Mark as Inactive"
            />
          </div>
          <fieldset
            className="container-max-width"
            style={{
              border: "1px solid black",
              padding: "5px",
              width: "50%",
              rowGap: "5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <legend
              style={{ color: "black", fontSize: "13px", fontWeight: "bold" }}
            >
              Deposit Slip
            </legend>
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Bank : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              containerStyle={{ width: "395px" }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    bankAccountModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
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
                  bankAccountModalRef.current.openModal(
                    inputSearchRef.current.value
                  );
                }
              }}
              inputRef={bankRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              containerStyle={{ width: "395px" }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    chartAccountModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
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
                  chartAccountModalRef.current.openModal(
                    inputSearchRef.current.value
                  );
                }
              }}
              inputRef={accountRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "ID No. : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              containerStyle={{ width: "395px" }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    clientBankAccountModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
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
                  clientBankAccountModalRef.current.openModal(
                    inputSearchRef.current.value
                  );
                }
              }}
              inputRef={iDNoRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Identity : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "400px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                  }
                },
              }}
              inputRef={identityRef}
            />
          </fieldset>
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
            adjustVisibleRowCount={280}
            columns={bankAccountColumn}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                if (accountNoRef.current) {
                  accountNoRef.current.value = rowItm.Account_Number;
                }
                if (accountNameRef.current) {
                  accountNameRef.current.value = rowItm.Account_Name;
                }
                if (accountTypeRef.current) {
                  accountTypeRef.current.value = rowItm.Account_Type;
                }
                if (inactiveRef.current) {
                  inactiveRef.current.checked = rowItm.Inactive === "YES";
                }

                if (bankRef.current) {
                  bankRef.current.value = rowItm.Bank;
                }
                if (accountRef.current) {
                  accountRef.current.value = rowItm.Acct_Title;
                }
                if (iDNoRef.current) {
                  iDNoRef.current.value = rowItm.ID_No;
                }
                if (identityRef.current) {
                  identityRef.current.value = rowItm.Identity;
                }
                bankCodeRef.current = rowItm.Bank_Name;
                accountCodeRef.current = rowItm.Account_ID;
                autoRef.current = rowItm.Auto;
              } else {
                resetModule();
              }
            }}
          />
        </div>
        <div
          className="button-action-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          {mode === "" && (
            <Button
              style={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<AddIcon />}
              id="entry-header-save-button"
              onClick={() => {
                setMode("add");
              }}
            >
              New
            </Button>
          )}
          <LoadingButton
            style={{
              height: "22px",
              fontSize: "11px",
            }}
            id="save-entry-header"
            color="primary"
            variant="contained"
            type="submit"
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            onClick={handleOnSave}
            startIcon={<SaveIcon />}
            disabled={mode === ""}
            loading={loadingAdd || loadingEdit}
          >
            Save
          </LoadingButton>
          {mode !== "" && (
            <Button
              style={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              startIcon={<CloseIcon />}
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
                    resetModule();
                    setMode("");
                    tableRef.current.resetTable();
                    mutateSearch({search:""})
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
          <LoadingButton
            id="save-entry-header"
            variant="contained"
            sx={{
              height: "22px",
              fontSize: "11px",
              backgroundColor: pink[500],
              "&:hover": {
                backgroundColor: pink[600],
              },
            }}
            loading={loadingDelete}
            startIcon={<DeleteIcon />}
            disabled={mode !== "edit"}
            onClick={() => {
              codeCondfirmationAlert({
                isUpdate: false,
                title: "Confirmation",
                saveTitle: "Confirm",
                text: `Are you sure you want to delete '${accountNoRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    Auto: autoRef.current,
                    userCodeConfirmation,
                  });
                },
              });
            }}
          >
            Delete
          </LoadingButton>
        </div>
      </div>
      <UpwardTableModalSearch
        ref={bankAccountModalRef}
        link={"/reference/search-bank-from-bank-account"}
        column={[
          { key: "Code", label: "Code", width: 130 },
          { key: "Bank_Name", label: "Bank Name", width: 350 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (bankRef.current) {
                bankRef.current.value = rowItm.Bank_Name;
              }
              bankCodeRef.current = rowItm.Code;

              accountRef.current?.focus();
            });
            bankAccountModalRef.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={chartAccountModalRef}
        link={"/reference/search-chart-account-from-bank-account"}
        column={[
          { key: "Code", label: "Code", width: 80 },
          { key: "Title", label: "Title", width: 270 },
          { key: "Short", label: "Short Name", width: 300 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (accountRef.current) {
                accountRef.current.value = rowItm.Title;
              }
              accountCodeRef.current = rowItm.Code;
              iDNoRef.current?.focus();
            });
            chartAccountModalRef.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={clientBankAccountModalRef}
        link={"/reference/search-client-from-bank-account"}
        column={[
          { key: "IDNo", label: "ID. No.", width: 130 },
          { key: "Name", label: "Name", width: 350 },
          { key: "IDType", label: "ID Type", width: 80 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              if (iDNoRef.current) {
                iDNoRef.current.value = rowItm.IDNo;
              }
              if (identityRef.current) {
                identityRef.current.value = rowItm.Name;
              }
              inactiveRef.current?.focus();
            });
            clientBankAccountModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
}

const CheckBoxLabel = ({
  inputRef,
  label,
  gridRow,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  label: string;
  gridRow: number;
}) => {
  const id = useId();
  return (
    <div style={{ display: "flex", columnGap: "5px", gridRow }}>
      <input
        id={id}
        ref={inputRef}
        type="checkbox"
        style={{
          cursor: "pointer",
        }}
      />
      <label
        htmlFor={id}
        style={{
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        {label}
      </label>
    </div>
  );
};

export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
