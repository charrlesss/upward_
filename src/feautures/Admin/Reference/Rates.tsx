import { useContext, useState, useRef, useEffect } from "react";
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
import { TextFormatedInput, TextInput } from "../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReactUpgraded } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import { Autocomplete } from "../Task/Accounting/PettyCash";
import "../../../style/monbileview/reference/reference.css";

export const rateColumn = [
  { key: "Account", label: "Account", width: 200 },
  { key: "Line", label: "Line", width: 120 },
  { key: "Type", label: "Type", width: 300 },
  { key: "Rate", label: "Rate", width: 120, type: "number" },
  { key: "ID", label: "ID", width: 100, hide: true },
];
export default function Rates() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const accountRef = useRef<HTMLSelectElement>(null);
  const _accountRef = useRef<any>(null);

  const lineRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const idRef = useRef("");

  const { mutate: mutateAccount, isLoading: isLoadingAccount } = useMutation({
    mutationKey: "get-accounts-from-rates",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reference/get-accounts-from-rates",
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
        wait(100).then(() => {
          _accountRef.current.setDataSource(response.data.data);
        });
      }
    },
  });

  const mutateAccountRef = useRef<any>(mutateAccount);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-mortgagee",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-rates", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        console.log(response.data);
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
      return await myAxios.post("/reference/add-rates", variables, {
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
      return await myAxios.post("/reference/update-rates", variables, {
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
      return await myAxios.post("/reference/delete-rates", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

  function handleOnSave(e: any) {
    e.preventDefault();
    if (accountRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please select Account",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (lineRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please select Line",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (typeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please put Type",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (rateRef.current?.value === "0.00") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Rate must be greater than zero (0.00)",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    const state = {
      Line: lineRef.current?.value,
      Account: accountRef.current?.value,
      Type: typeRef.current?.value,
      Rate: rateRef.current?.value,
      ID: idRef.current,
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
    if (accountRef.current) {
      accountRef.current.value = "";
    }
    if (lineRef.current) {
      lineRef.current.value = "";
    }
    if (typeRef.current) {
      typeRef.current.value = "";
    }
    if (rateRef.current) {
      rateRef.current.value = "0.00";
    }
    idRef.current = "";
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
    mutateAccountRef.current({});
  }, []);

  return (
    <>
      {(loadingSearch || isLoadingAccount) && <Loading />}
      <PageHelmet title="Rates" />
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
                      tableRef.current.resetTable();
                      mutateSearchRef.current({ search: "" });
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
                  text: `Are you sure you want to delete '${accountRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      ID: idRef.current,
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
          <Autocomplete
            label={{
              title: "Line",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
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
            DisplayMember={"Line"}
            DataSource={[
              { Line: "Vehicle" },
              { Line: "Fire" },
              { Line: "Marine" },
              { Line: "Bonds" },
              { Line: "MSPR" },
              { Line: "PA" },
              { Line: "CGL" },
            ]}
            disableInput={mode === ""}
            inputRef={lineRef}
            onChange={(selected: any, e: any) => {
              if (lineRef.current) lineRef.current.value = selected.Line;
            }}
            onKeydown={(e: any) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
                accountRef.current?.focus();
              }
            }}
          />
          <Autocomplete
            ref={_accountRef}
            label={{
              title: "Account",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
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
            DisplayMember={"Account"}
            DataSource={[]}
            disableInput={mode === "" || mode === "edit"}
            inputRef={accountRef}
            onChange={(selected: any, e: any) => {
              if (accountRef.current)
                accountRef.current.value = selected.Account;
            }}
            onKeydown={(e: any) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
                typeRef.current?.focus();
              }
            }}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Type : ",
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
                  rateRef.current?.focus();
                }
              },
            }}
            inputRef={typeRef}
          />
          <TextFormatedInput
            containerClassName="custom-input"
            label={{
              title: "Cost : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              placeholder: "0.00",
              defaultValue: "",
              type: "text",
              style: { width: "200px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={rateRef}
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
          <DataGridViewReactUpgraded
            ref={tableRef}
            adjustVisibleRowCount={240}
            columns={rateColumn}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                if (accountRef.current) {
                  accountRef.current.value = rowItm.Account;
                }
                if (lineRef.current) {
                  lineRef.current.value = rowItm.Line;
                }
                if (typeRef.current) {
                  typeRef.current.value = rowItm.Type;
                }
                if (rateRef.current) {
                  rateRef.current.value = rowItm.Rate;
                }
                idRef.current = rowItm.ID;
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
                    mutateSearchRef.current({ search: "" });
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
                text: `Are you sure you want to delete '${accountRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    ID: idRef.current,
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
