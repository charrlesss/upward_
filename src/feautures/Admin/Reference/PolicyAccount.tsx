import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useId,
} from "react";
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
import { Loading } from "../../../components/Loading";
import {
  DataGridViewReactUpgraded,
} from "../../../components/DataGridViewReact";
import "../../../style/monbileview/reference/reference.css";

export const poliyAccountColumn = [
  { key: "AccountCode", label: "Code", width: 200 },
  { key: "Account", label: "Account", width: 350 },
  { key: "Description", label: "Description", width: 400 },
  { key: "_Inactive", label: "Inactive", width: 100 },
  { key: "Inactive", label: "Inactive", hide: true },
  { key: "COM", label: "", hide: true },
  { key: "TPL", label: "", hide: true },
  { key: "MAR", label: "", hide: true },
  { key: "FIRE", label: "", hide: true },
  { key: "G02", label: "", hide: true },
  { key: "G13", label: "", hide: true },
  { key: "G16", label: "", hide: true },
  { key: "MSPR", label: "", hide: true },
  { key: "PA", label: "", hide: true },
  { key: "CGL", label: "", hide: true },
  { key: "createdAt", label: "", hide: true },
];

export default function PolicyAccount() {
  const tableRef = useRef<any>(null);
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const inputSearchRef = useRef<HTMLInputElement>(null);

  const accountCodeRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const inactiveRef = useRef<HTMLInputElement>(null);
  const comRef = useRef<HTMLInputElement>(null);
  const tplRef = useRef<HTMLInputElement>(null);
  const marineRef = useRef<HTMLInputElement>(null);
  const fireRef = useRef<HTMLInputElement>(null);
  const bondG02Ref = useRef<HTMLInputElement>(null);
  const bondG13Ref = useRef<HTMLInputElement>(null);
  const bondG16Ref = useRef<HTMLInputElement>(null);
  const msprRef = useRef<HTMLInputElement>(null);
  const paRef = useRef<HTMLInputElement>(null);
  const cglRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-policy",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/search-policy-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        wait(100).then(() => {
          console.log(response.data.data);
          tableRef.current.setData(response.data.data);
        });
      }
    },
  });
  const mutateSearchRef = useRef<any>(mutateSearch);

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "add",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/add-policy-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "update",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/update-policy-account", variables, {
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
      return await myAxios.post("/reference/delete-policy-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  function handleOnSave(e: any) {
    if (accountCodeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (accountRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Account Code is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    e.preventDefault();
    const state = {
      AccountCode: accountCodeRef.current?.value,
      Account: accountRef.current?.value,
      Description: descriptionRef.current?.value,
      Inactive: inactiveRef.current?.checked,
      COM: comRef.current?.checked,
      TPL: tplRef.current?.checked,
      MAR: marineRef.current?.checked,
      FIRE: fireRef.current?.checked,
      G02: bondG02Ref.current?.checked,
      G13: bondG13Ref.current?.checked,
      G16: bondG16Ref.current?.checked,
      MSPR: msprRef.current?.checked,
      PA: paRef.current?.checked,
      CGL: cglRef.current?.checked,
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
    if (accountCodeRef.current) {
      accountCodeRef.current.value = "";
    }
    if (accountRef.current) {
      accountRef.current.value = "";
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = "";
    }
    if (inactiveRef.current) {
      inactiveRef.current.checked = false;
    }
    if (comRef.current) {
      comRef.current.checked = false;
    }
    if (tplRef.current) {
      tplRef.current.checked = false;
    }
    if (marineRef.current) {
      marineRef.current.checked = false;
    }
    if (fireRef.current) {
      fireRef.current.checked = false;
    }
    if (bondG02Ref.current) {
      bondG02Ref.current.checked = false;
    }
    if (bondG13Ref.current) {
      bondG13Ref.current.checked = false;
    }
    if (bondG16Ref.current) {
      bondG16Ref.current.checked = false;
    }
    if (msprRef.current) {
      msprRef.current.checked = false;
    }
    if (paRef.current) {
      paRef.current.checked = false;
    }
    if (cglRef.current) {
      cglRef.current.checked = false;
    }
  }
  function onSuccess(res: any) {
    if (res.data.success) {
      tableRef.current.resetTable();
      mutateSearchRef.current({ search: "" });
      setMode("");
      resetModule();
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
      <PageHelmet title="Policy Account" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          padding: "5px",
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
            containerClassName="custom-input"
            containerStyle={{
              width: "550px",
              marginRight: "10px",
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
                sx={{
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
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              id="save-entry-header"
              color="primary"
              variant="contained"
              type="submit"
              onClick={handleOnSave}
              disabled={mode === ""}
              startIcon={<SaveIcon />}
              loading={loadingAdd || loadingEdit}
            >
              Save
            </LoadingButton>
            {mode !== "" && (
              <Button
                sx={{
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
              disabled={mode !== "edit"}
              startIcon={<DeleteIcon />}
              loading={loadingDelete}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  title: "Confirmation",
                  saveTitle: "Confirm",
                  text: `Are you sure you want to delete '${accountRef.current?.value}'?`,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      Account: accountCodeRef.current?.value,
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <div
            className="container-fields-custom"
            style={{
              display: "flex",
              width: "590px",
              justifyContent: "space-between",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Account Code: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "95px",
                },
              }}
              input={{
                disabled: mode === "" || mode === "edit",
                type: "text",
                style: { width: "300px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                  }
                },
              }}
              inputRef={accountCodeRef}
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
              title: "Account : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "95px",
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
            inputRef={accountRef}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Description : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "95px",
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
            inputRef={descriptionRef}
          />

          <fieldset
            className="container-max-width"
            style={{
              border: "1px solid black",
              padding: "5px",
              width: "590px",
            }}
          >
            <legend
              style={{ color: "black", fontSize: "13px", fontWeight: "bold" }}
            >
              Policy Type
            </legend>
            <div
              className="container-fields-grid"
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "10px",
              }}
            >
              <CheckBoxLabel
                gridRow={1}
                inputRef={comRef}
                label="Comprehensive"
              />
              <CheckBoxLabel gridRow={2} inputRef={tplRef} label="TPL" />
              <CheckBoxLabel gridRow={1} inputRef={marineRef} label="Marine" />
              <CheckBoxLabel gridRow={2} inputRef={fireRef} label="Fire" />
              <CheckBoxLabel
                gridRow={1}
                inputRef={bondG02Ref}
                label="Bond G(02)"
              />
              <CheckBoxLabel
                gridRow={2}
                inputRef={bondG13Ref}
                label="Bond G(13)"
              />
              <CheckBoxLabel
                gridRow={1}
                inputRef={bondG16Ref}
                label="Bond G(16)"
              />
              <CheckBoxLabel gridRow={2} inputRef={msprRef} label="MSPR" />
              <CheckBoxLabel gridRow={1} inputRef={paRef} label="PA" />
              <CheckBoxLabel gridRow={2} inputRef={cglRef} label="CGL" />
            </div>
          </fieldset>
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
            adjustVisibleRowCount={260}
            columns={poliyAccountColumn}
            handleSelectionChange={(rowItm: any) => {
              if (rowItm) {
                setMode("edit");
                console.log(rowItm);
                if (accountCodeRef.current) {
                  accountCodeRef.current.value = rowItm.AccountCode;
                }
                if (accountRef.current) {
                  accountRef.current.value = rowItm.Account;
                }
                if (descriptionRef.current) {
                  descriptionRef.current.value = rowItm.Account;
                }
                if (inactiveRef.current) {
                  inactiveRef.current.checked = rowItm.Inactive;
                }
                if (comRef.current) {
                  comRef.current.checked = rowItm.COM;
                }
                if (tplRef.current) {
                  tplRef.current.checked = rowItm.TPL;
                }
                if (marineRef.current) {
                  marineRef.current.checked = rowItm.MAR;
                }
                if (fireRef.current) {
                  fireRef.current.checked = rowItm.FIRE;
                }
                if (bondG02Ref.current) {
                  bondG02Ref.current.checked = rowItm.G02;
                }
                if (bondG13Ref.current) {
                  bondG13Ref.current.checked = rowItm.G13;
                }
                if (bondG16Ref.current) {
                  bondG16Ref.current.checked = rowItm.G16;
                }
                if (msprRef.current) {
                  msprRef.current.checked = rowItm.MSPR;
                }
                if (paRef.current) {
                  paRef.current.checked = rowItm.PA;
                }
                if (cglRef.current) {
                  cglRef.current.checked = rowItm.CGL;
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
              sx={{
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
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            id="save-entry-header"
            color="primary"
            variant="contained"
            type="submit"
            onClick={handleOnSave}
            disabled={mode === ""}
            startIcon={<SaveIcon />}
            loading={loadingAdd || loadingEdit}
          >
            Save
          </LoadingButton>
          {mode !== "" && (
            <Button
              sx={{
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
            disabled={mode !== "edit"}
            startIcon={<DeleteIcon />}
            loading={loadingDelete}
            onClick={() => {
              codeCondfirmationAlert({
                isUpdate: false,
                title: "Confirmation",
                saveTitle: "Confirm",
                text: `Are you sure you want to delete '${accountRef.current?.value}'?`,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    Account: accountCodeRef.current?.value,
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

export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
