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
import { TextInput } from "../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReact } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import { Autocomplete } from "../Task/Accounting/PettyCash";
import "../../../style/monbileview/reference/reference.css";

export const bankColumn = [
  { key: "Line", label: "Line", width: 120 },
  { key: "SublineName", label: "Subline Name", width: 500 },
  { key: "ID", label: "", width: 0, hide: true },
];
export default function Subline() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);

  const lineRef = useRef<HTMLSelectElement>(null);
  const sublineRef = useRef<HTMLInputElement>(null);
  const refId = useRef("");

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-subline",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-subline", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
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
      return await myAxios.post("/reference/add-subline", variables, {
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
      return await myAxios.post("/reference/update-subline", variables, {
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
      return await myAxios.post("/reference/delete-subline", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });

  function handleOnSave(e: any) {
    e.preventDefault();
    if (lineRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please select Line!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (sublineRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Please put subline!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    const state = {
      Line: lineRef.current?.value,
      SublineName: sublineRef.current?.value,
      ID: refId.current,
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
    if (lineRef.current) {
      lineRef.current.value = "";
    }
    if (sublineRef.current) {
      sublineRef.current.value = "";
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
      <PageHelmet title="Sub Line" />
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
                  text: `Are you sure you want to delete '${sublineRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      ID: refId.current,
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
              title: "Line : ",
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
                sublineRef.current?.focus();
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
                }
              },
            }}
            inputRef={sublineRef}
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
                if (lineRef.current) {
                  lineRef.current.value = rowItm[0];
                }
                if (sublineRef.current) {
                  sublineRef.current.value = rowItm[1];
                }
                refId.current = rowItm[2];
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
                text: `Are you sure you want to delete '${sublineRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    ID: refId.current,
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
