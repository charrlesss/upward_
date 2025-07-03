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
import { DataGridViewReactUpgraded } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import { Autocomplete } from "../Task/Accounting/PettyCash";
import "../../../style/monbileview/reference/reference.css";

export const bankColumn = [
  { key: "Acct_Code", label: "Account Code", width: 200 },
  { key: "Acct_Title", label: "Account Name / Account Title", width: 500 },
  { key: "Short", label: "Short Name", width: 200 },
  { key: "Account", label: "Account Type", width: 200 },
  { key: "Acct_Type", label: "Account Type", width: 200 },
  { key: "SubAccnt", label: "Sub Account?", width: 100 },
  { key: "IDNo", label: "I.D?", width: 100 },
  { key: "Inactive", label: "Inactive?", width: 100 },
];

export default function ChartAccount() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const accountClassificationRef = useRef<HTMLInputElement>(null);
  const acountTypeRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const shortNameRef = useRef<HTMLInputElement>(null);
  const inactiveRef = useRef<HTMLInputElement>(null);
  const requriedSubAccountRef = useRef<HTMLInputElement>(null);
  const requriedIdRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-chart-account",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-chart-account", variables, {
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
      return await myAxios.post("/reference/add-chart-account", variables, {
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
      return await myAxios.post("/reference/update-chart-account", variables, {
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
      return await myAxios.post("/reference/delete-chart-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

  function handleOnSave(e: any) {
    e.preventDefault();
    if (codeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account code!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (titleRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account name or title!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (shortNameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please provide account short name!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    const state = {
      Acct_Code: codeRef.current?.value,
      Acct_Title: titleRef.current?.value,
      Short: shortNameRef.current?.value,
      Account: accountClassificationRef.current?.value,
      Acct_Type: acountTypeRef.current?.value,
      IDNo: requriedIdRef.current?.checked,
      SubAccnt: requriedSubAccountRef.current?.checked,
      Inactive: inactiveRef.current?.checked,
      mode: "",
      search: "",
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
    if (accountClassificationRef.current) {
      accountClassificationRef.current.value = "";
    }
    if (acountTypeRef.current) {
      acountTypeRef.current.value = "";
    }
    if (codeRef.current) {
      codeRef.current.value = "";
    }
    if (titleRef.current) {
      titleRef.current.value = "";
    }
    if (shortNameRef.current) {
      shortNameRef.current.value = "";
    }
    if (inactiveRef.current) {
      inactiveRef.current.checked = false;
    }
    if (requriedSubAccountRef.current) {
      requriedSubAccountRef.current.checked = false;
    }
    if (requriedIdRef.current) {
      requriedIdRef.current.checked = false;
    }
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
      <PageHelmet title="Chart Account" />
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
                      mutateSearch({ search: "" });
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
                  text: `Are you sure you want to delete '${codeRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Acct_Code: codeRef.current?.value,
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
          className="container-fields"
          style={{
            // border: "1px solid black",
            padding: "5px",
            width: "75%",
            rowGap: "5px",
            display: "flex",
            columnGap: "20px",
          }}
        >
          <legend style={{ fontSize: "12px", fontWeight: "bold" }}>
            Account Details
          </legend>
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <Autocomplete
              containerClassName="custom-input"
              label={{
                title: "Account Classification :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
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
                { Line: "Asset" },
                { Line: "Liability" },
                { Line: "Equity" },
                { Line: "Revenue" },
                { Line: "Expense" },
              ]}
              disableInput={mode === ""}
              inputRef={accountClassificationRef}
              onChange={(selected: any, e: any) => {
                if (accountClassificationRef.current)
                  accountClassificationRef.current.value = selected.Line;
              }}
              onKeydown={(e: any) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  acountTypeRef.current?.focus();
                }
              }}
            />
            <Autocomplete
              containerClassName="custom-input"
              label={{
                title: "Account Type :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
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
                { Line: "Group Header" },
                { Line: "Header" },
                { Line: "Detail" },
              ]}
              disableInput={mode === ""}
              inputRef={acountTypeRef}
              onChange={(selected: any, e: any) => {
                if (acountTypeRef.current)
                  acountTypeRef.current.value = selected.Line;
              }}
              onKeydown={(e: any) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  codeRef.current?.focus();
                }
              }}
            />
          </div>
          <div
            className="container-max-width"
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <div
              className="container-fields-custom"
              style={{
                display: "flex",
                columnGap: "5px",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                label={{
                  title: "Code : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: mode === "" || mode === "edit",
                  type: "text",
                  style: { width: "250px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                      titleRef.current?.focus();
                    }
                  },
                }}
                inputRef={codeRef}
              />
              <CheckBoxLabel
                gridRow={1}
                inputRef={inactiveRef}
                label="Mark as Inactive"
              />
            </div>
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Name / Title : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "text",
                style: { width: "400px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    shortNameRef.current?.focus();

                    e.preventDefault();
                  }
                },
              }}
              inputRef={titleRef}
            />
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Short Name : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
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
              inputRef={shortNameRef}
            />
            <div style={{ display: "flex", columnGap: "10px" }}>
              <CheckBoxLabel
                gridRow={1}
                inputRef={requriedSubAccountRef}
                label="Required sub-account?"
              />
              <CheckBoxLabel
                gridRow={1}
                inputRef={requriedIdRef}
                label="Required I.D.?"
              />
            </div>
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
            adjustVisibleRowCount={250}
            columns={bankColumn}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                if (accountClassificationRef.current) {
                  accountClassificationRef.current.value = rowItm.Account;
                }
                if (acountTypeRef.current) {
                  acountTypeRef.current.value = rowItm.Acct_Type;
                }
                if (codeRef.current) {
                  codeRef.current.value = rowItm.Acct_Code;
                }
                if (titleRef.current) {
                  titleRef.current.value = rowItm.Acct_Title;
                }
                if (shortNameRef.current) {
                  shortNameRef.current.value = rowItm.Short;
                }
                if (inactiveRef.current) {
                  inactiveRef.current.checked = rowItm.Inactive === "YES";
                }
                if (requriedSubAccountRef.current) {
                  requriedSubAccountRef.current.checked =
                    rowItm.SubAccnt === "YES";
                }
                if (requriedIdRef.current) {
                  requriedIdRef.current.checked = rowItm.IDNo === "YES";
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
                    tableRef.current.resetTable();
                    mutateSearch({ search: "" });
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
                text: `Are you sure you want to delete '${codeRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    Acct_Code: codeRef.current?.value,
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
