import { useContext, useState, useRef, useEffect, useId } from "react";
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
import { DataGridViewReact } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import "../../../style/monbileview/reference/reference.css";

export const bankColumn = [
  { key: "Code", label: "Transaction Code", width: 200 },
  { key: "Description", label: "Description", width: 500 },
  { key: "Acct_Code", label: "Account Code Name", width: 200 },
  { key: "Inactive", label: "Inactive", width: 100 },
];
export default function TransactionCode() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const transactionCodeRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const inactiveRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-transaction-code",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/search-transaction-code",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      if (response.data.success) {
        console.log(response.data);
        wait(100).then(() => {
          tableRef.current.setDataFormated(response.data.data);
        });
      }
    },
  });
  const mutateSearchRef = useRef<any>(mutateSearch);

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "add",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-transaction-code", variables, {
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
      return await myAxios.post(
        "/reference/update-transaction-code",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "delete",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/delete-transaction-code",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess,
  });

  function handleOnSave(e: any) {
    e.preventDefault();
    if (transactionCodeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide sub account code!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (descriptionRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide description!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (descriptionRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide short name!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    const state = {
      Code: transactionCodeRef.current?.value,
      Description: descriptionRef.current?.value,
      Acct_Code: accountRef.current?.value,
      Inactive: inactiveRef.current?.checked,
    };
    if (mode === "edit") {
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
    if (transactionCodeRef.current) {
      transactionCodeRef.current.value = "";
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = "";
    }
    if (accountRef.current) {
      accountRef.current.value = "";
    }
    if (inactiveRef.current) {
      inactiveRef.current.checked = false;
    }
  }

  function onSuccess(res: any) {
    if (res.data.success) {
      tableRef.current.setSelectedRow(null);
      tableRef.current.resetCheckBox();
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
      <PageHelmet title="Transation Code" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",
          position:"relative"
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
              marginRight: "20px",
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
                      tableRef.current.setSelectedRow(null);
                      tableRef.current.resetCheckBox();
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
                  text: `Are you sure you want to delete '${transactionCodeRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Code: transactionCodeRef.current?.value,
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
          className="container-max-width"
          style={{
            // border: "1px solid black",
            padding: "5px",
            width: "590px",
            rowGap: "5px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Transaction  Code : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "500px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  descriptionRef.current?.focus();
                }
              },
            }}
            inputRef={transactionCodeRef}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Description : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "500px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  accountRef.current?.focus();

                  e.preventDefault();
                }
              },
            }}
            inputRef={descriptionRef}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Account : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "500px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  inactiveRef.current?.focus();
                }
              },
            }}
            inputRef={accountRef}
          />
          <CheckBoxLabel
            gridRow={1}
            inputRef={inactiveRef}
            label="Mark as Inactive"
          />
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
          <DataGridViewReact
            containerStyle={{
              flex: 1,
              height: "auto",
            }}
            ref={tableRef}
            columns={bankColumn}
            height="280px"
            getSelectedItem={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                if (transactionCodeRef.current) {
                  transactionCodeRef.current.value = rowItm[0];
                }
                if (descriptionRef.current) {
                  descriptionRef.current.value = rowItm[1];
                }
                if (accountRef.current) {
                  accountRef.current.value = rowItm[2];
                }
                if (inactiveRef.current) {
                  inactiveRef.current.checked = rowItm[3] == "YES";
                }
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
                    tableRef.current.setSelectedRow(null);
                    tableRef.current.resetCheckBox();
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
                text: `Are you sure you want to delete '${transactionCodeRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    Code: transactionCodeRef.current?.value,
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
