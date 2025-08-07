import { useContext, useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import { wait } from "../../../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import { pink } from "@mui/material/colors";
import PageHelmet from "../../../components/Helmet";
import {
  SelectInput,
  TextFormatedInput,
  TextInput,
} from "../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReactUpgraded } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import "../../../style/monbileview/reference/reference.css";

const pettyLogColumn = [
  { key: "Prefix", label: "Prefix", width: 100 },
  { key: "NumSeriesFrom", label: "Number Series From", width: 150 },
  { key: "NumSeriesTo", label: "Number Series To", width: 150 },
  { key: "Cost", label: "Cost", width: 120 },
  { key: "Vehicle", label: "Vehicle Type", width: 120 },
  { key: "ctplId", label: "", width: 0, hide: true },
  { key: "ctplType", label: "", width: 0, hide: true },
];

export default function CTPL() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const prefixRef = useRef<HTMLInputElement>(null);
  const newprefixRef = useRef<HTMLInputElement>(null);

  const numSeriesFromRef = useRef<HTMLInputElement>(null);
  const numSeriesToRef = useRef<HTMLInputElement>(null);

  const newSeriesFromRef = useRef<HTMLInputElement>(null);
  const newSeriesToRef = useRef<HTMLInputElement>(null);

  const costRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const ctplType = useRef("");
  const ctplId = useRef("");

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-ctpl",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-ctpl", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        wait(100).then(() => {
          console.log(response.data);
          tableRef.current.setData(response.data.data);
        });
      }
    },
  });
  const mutateSearchRef = useRef<any>(mutateSearch);
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "add",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-ctpl", variables, {
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
      return await myAxios.post("/reference/update-ctpl", variables, {
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
      return await myAxios.post("/reference/delete-ctpl", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  function handleOnSave(e: any) {
    e.preventDefault();
    if (mode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          mutateEdit({
            Prefix: prefixRef.current?.value,
            NewPrefix: newprefixRef.current?.value,
            NumSeriesFrom: numSeriesFromRef.current?.value,
            NumSeriesTo: numSeriesToRef.current?.value,
            NewSeriesFrom: newSeriesFromRef.current?.value,
            NewSeriesTo: newSeriesToRef.current?.value,
            Cost: costRef.current?.value,
            ctplType: ctplType.current,
            ctplId: ctplId.current,
            Vehicle: selectRef.current?.value,
            userCodeConfirmation,
          });
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          mutateAdd({
            Prefix: prefixRef.current?.value,
            NumSeriesFrom: numSeriesFromRef.current?.value,
            NumSeriesTo: numSeriesToRef.current?.value,
            Cost: costRef.current?.value,
            ctplType: ctplType.current,
            ctplId: ctplId.current,
            Vehicle: selectRef.current?.value,
          });
        },
      });
    }
  }
  function resetModule() {
    if (newprefixRef.current) {
      newprefixRef.current.value = "";
    }
    if (newSeriesFromRef.current) {
      newSeriesFromRef.current.value = "";
    }
    if (newSeriesToRef.current) {
      newSeriesToRef.current.value = "";
    }

    if (prefixRef.current) {
      prefixRef.current.value = "";
    }
    if (numSeriesFromRef.current) {
      numSeriesFromRef.current.value = "0";
    }
    if (numSeriesToRef.current) {
      numSeriesToRef.current.value = "0";
    }
    if (costRef.current) {
      costRef.current.value = "0.00";
    }

    if (selectRef.current) {
      selectRef.current.value = "LIGHT";
    }

    ctplType.current = "";
    ctplId.current = "";
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
      {(loadingSearch || loadingEdit || loadingDelete) && <Loading />}
      <PageHelmet title="CTPL" />
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
                mutateSearch({ search: inputSearchRef.current?.value });
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
              loading={loadingAdd}
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
            <Button
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
              startIcon={<DeleteIcon />}
              disabled={mode !== "edit"}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  title: "Confirmation",
                  saveTitle: "Confirm",
                  text: `Are you sure you want to delete ?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Prefix: prefixRef.current?.value,
                      NewPrefix: newprefixRef.current?.value,
                      NumSeriesFrom: numSeriesFromRef.current?.value,
                      NumSeriesTo: numSeriesToRef.current?.value,
                      NewSeriesFrom: newSeriesFromRef.current?.value,
                      NewSeriesTo: newSeriesToRef.current?.value,
                      Cost: costRef.current?.value,
                      ctplType: ctplType.current,
                      ctplId: ctplId.current,
                      userCodeConfirmation,
                    });
                  },
                });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
        <div
          className="container-max-width"
          style={{
            // border: "1px solid black",
            padding: "5px",
            width: "auto",
            rowGap: "5px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
            }}
          >
            <TextInput
              containerStyle={{
                width: "320px",
              }}
              label={{
                title: "Prefix: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              input={{
                disabled: mode === "" || mode === "edit",
                className: "search-input-up-on-key-down",
                type: "text",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    numSeriesFromRef.current?.focus();
                  }
                },
                style: { width: "calc(320px - 120px)" },
              }}
              inputRef={prefixRef}
            />
            {mode === "edit" && (
              <>
                -
                <TextInput
                  containerStyle={{
                    width: "320px",
                  }}
                  label={{
                    title: "New Prefix: ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "120px",
                    },
                  }}
                  input={{
                    className: "search-input-up-on-key-down",
                    type: "text",
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === "NumpadEnter") {
                        e.preventDefault();
                        numSeriesFromRef.current?.focus();
                      }
                    },
                    style: { width: "calc(320px - 120px)" },
                  }}
                  inputRef={newprefixRef}
                />
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
            }}
          >
            <TextInput
              label={{
                title: "Num Series From : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              input={{
                disabled: mode === "" || mode === "edit",
                min: 1,
                defaultValue: "0",
                type: "number",
                style: { width: "200px", textAlign: "right" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (mode === "edit") {
                      newSeriesFromRef.current?.focus();
                    } else {
                      numSeriesToRef.current?.focus();
                    }
                  }
                },
                onFocus: (e) => {
                  e.currentTarget.select();
                },
              }}
              inputRef={numSeriesFromRef}
            />
            {mode === "edit" && (
              <>
                -
                <TextInput
                  label={{
                    title: "New Series From : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "120px",
                    },
                  }}
                  input={{
                    min: 1,
                    defaultValue: "0",
                    type: "number",
                    style: { width: "200px", textAlign: "right" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        numSeriesToRef.current?.focus();
                      }
                    },
                    onFocus: (e) => {
                      e.currentTarget.select();
                    },
                  }}
                  inputRef={newSeriesFromRef}
                />
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
            }}
          >
            <TextInput
              label={{
                title: "Num Series To : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              input={{
                disabled: mode === "" || mode === "edit",
                min: 1,
                defaultValue: "0",
                type: "number",
                style: { width: "200px", textAlign: "right" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    if (mode === "edit") {
                      newSeriesToRef.current?.focus();
                    } else {
                      costRef.current?.focus();
                    }
                  }
                },
                onFocus: (e) => {
                  e.currentTarget.select();
                },
              }}
              inputRef={numSeriesToRef}
            />
            {mode === "edit" && (
              <>
                -
                <TextInput
                  label={{
                    title: "New Series To : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "120px",
                    },
                  }}
                  input={{
                    min: 1,
                    defaultValue: "0",
                    type: "number",
                    style: { width: "200px", textAlign: "right" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        costRef.current?.focus();
                      }
                    },
                    onFocus: (e) => {
                      e.currentTarget.select();
                    },
                  }}
                  inputRef={newSeriesToRef}
                />
              </>
            )}
          </div>
          <TextFormatedInput
            containerStyle={{
              width: "320px",
            }}
            label={{
              title: "Cost : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "120px",
              },
            }}
            input={{
              disabled: mode === "",
              placeholder: "0.00",
              defaultValue: "",
              type: "text",
              style: { width: "calc(100% - 120px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  selectRef.current?.focus();
                }
              },
            }}
            inputRef={costRef}
          />
          <SelectInput
            containerClassName="custom-input"
            containerStyle={{ width: "320px" }}
            label={{
              title: "Vehicle Type : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "120px",
              },
            }}
            selectRef={selectRef}
            select={{
              style: { width: "calc(100% - 120px)", height: "22px" },
              defaultValue: "LIGHT",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                }
              },
            }}
            datasource={[
              { key: "MOTORCYCLE" },
              { key: "LIGHT" },
              { key: "HEAVY" },
              { key: "TRAILER" },
            ]}
            values={"key"}
            display={"key"}
          />
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
            adjustVisibleRowCount={240}
            columns={pettyLogColumn}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                wait(100).then(() => {
                  if (prefixRef.current) {
                    prefixRef.current.value = rowItm.Prefix;
                  }
                  if (newprefixRef.current) {
                    newprefixRef.current.value = rowItm.Prefix;
                  }

                  if (numSeriesFromRef.current) {
                    numSeriesFromRef.current.value = rowItm.NumSeriesFrom;
                  }
                  if (numSeriesToRef.current) {
                    numSeriesToRef.current.value = rowItm.NumSeriesTo;
                  }

                  if (newSeriesFromRef.current) {
                    newSeriesFromRef.current.value = rowItm.NumSeriesFrom;
                  }
                  if (newSeriesToRef.current) {
                    newSeriesToRef.current.value = rowItm.NumSeriesTo;
                  }

                  if (costRef.current) {
                    costRef.current.value = rowItm.Cost;
                  }

                  if (selectRef.current) {
                    selectRef.current.value = rowItm.Vehicle || "LIGHT";
                  }

                  ctplId.current = rowItm.ctplId;
                  ctplType.current = rowItm.ctplType;
                });
              } else {
                setMode("");
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
            loading={loadingAdd}
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
                text: `Are you sure you want to delete ?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    Prefix: prefixRef.current?.value,
                    NewPrefix: newprefixRef.current?.value,
                    NumSeriesFrom: numSeriesFromRef.current?.value,
                    NumSeriesTo: numSeriesToRef.current?.value,
                    NewSeriesFrom: newSeriesFromRef.current?.value,
                    NewSeriesTo: newSeriesToRef.current?.value,
                    Cost: costRef.current?.value,
                    ctplType: ctplType.current,
                    ctplId: ctplId.current,
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
