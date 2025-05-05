import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { AuthContext } from "../../../../../components/AuthContext";
import { useMutation, useQuery } from "react-query";
import Swal from "sweetalert2";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { wait } from "../../../../../lib/wait";
import { pink } from "@mui/material/colors";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../lib/confirmationAlert";
import PageHelmet from "../../../../../components/Helmet";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReact } from "../../../../../components/DataGridViewReact";
import { Loading } from "../../../../../components/Loading";
import { Autocomplete } from "../../../Task/Accounting/PettyCash";
const clientColumn = [
  { key: "entry_agent_id", label: "ID", width: 130 },
  { key: "firstname", label: "First Name", width: 200 },
  {
    key: "lastname",
    label: "Last Name",
    width: 200,
  },
  {
    key: "middlename",
    label: "Middle Name",
    width: 200,
  },
  {
    key: "suffix",
    label: "Suffix",
    width: 130,
  },
  {
    key: "mobile",
    label: "Mobile",
    width: 200,
  },
  {
    key: "ShortName",
    label: "Sub Account",
    width: 130,
  },
  {
    key: "position",
    label: "Position",
    width: 130,
  },
  {
    key: "address",
    label: "Address",
    width: 500,
  },

  {
    key: "sub_account",
    label: "sub_account",
    width: 300,
    hide: true,
  },
];
export default function Agent() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");

  const tableRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clientIdRef = useRef<HTMLInputElement>(null);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const middleRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);

  const suffixRef = useRef<HTMLInputElement>(null);
  const _subAccount = useRef<any>(null);
  const subAccount = useRef<HTMLSelectElement>(null);
  const branchCodeRef = useRef("");
  const branchRef = useRef<HTMLSelectElement>(null);

  const mobileNoRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);

  const addressRef = useRef<HTMLTextAreaElement>(null);

  const { isLoading: loadingClientId, refetch: refetchClientId } = useQuery({
    queryKey: "client-generate-id",
    queryFn: async () =>
      await myAxios.post(
        "/reference/id-entry-generate-id",
        { sign: "A", type: "entry agent" },
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      wait(100).then(() => {
        if (clientIdRef.current) {
          clientIdRef.current.value = res.data.generateID;
        }
      });
    },
  });

  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: "add-client",
    mutationFn: async (variables: any) =>
      await myAxios.post("/reference/id-entry-agent", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "edit-agent",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/id-entry-agent-update`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "delete-agent",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-delete?entry=Agent`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess,
  });
  const { isLoading: isLoadingSearch, mutate: mutateSearch } = useMutation({
    mutationKey: "search",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/search-entry`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess: (res) => {
      tableRef.current.setDataFormated((res as any)?.data.entry);
    },
  });
  const { isLoading: subAccountLoading, refetch: refetchSubAcct } = useQuery({
    queryKey: "sub-accounts",
    queryFn: async () =>
      await myAxios.get(`/reference/sub-account`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess: (res) => {
      wait(100).then(() => {
        if (_subAccount.current)
          _subAccount.current.setDataSource(res.data?.subAccount);
        wait(100).then(() => {
          const data = res.data?.subAccount.filter(
            (itm: any) => itm.Acronym === "HO"
          );

          if (subAccount.current) subAccount.current.value = data[0].ShortName;
          branchCodeRef.current = data[0].Sub_Acct;
        });
      });
    },
  });

  const mutateSearchRef = useRef(mutateSearch);
  useEffect(() => {
    mutateSearchRef.current({
      search: "",
      entry: "Agent",
    });
  }, []);

  function onSuccess(res: any) {
    if (res.data.success) {
      resetField();
      setMode("");
      tableRef.current.setSelectedRow(null);
      tableRef.current.resetCheckBox();

      mutateSearchRef.current({
        search: "",
        entry: "Agent",
      });
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
  function handleOnSave(e: any) {
    if (firstnameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Firstname is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (lastnameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Lastname is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (subAccount.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Sub Account is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    const state = {
      entry_agent_id: clientIdRef.current?.value,
      firstname: firstnameRef.current?.value.toLocaleUpperCase(),
      middlename: middleRef.current?.value.toLocaleUpperCase(),
      lastname: lastnameRef.current?.value.toLocaleUpperCase(),
      suffix: suffixRef.current?.value,
      sub_account: branchCodeRef.current,
      mobile: mobileNoRef.current?.value,
      address: addressRef.current?.value,
      position: positionRef.current?.value,
    };
    e.preventDefault();
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
  function resetField() {
    wait(100).then(() => {
      refetchClientId();
      refetchSubAcct();

      if (firstnameRef.current) {
        firstnameRef.current.value = "";
      }
      if (middleRef.current) {
        middleRef.current.value = "";
      }
      if (lastnameRef.current) {
        lastnameRef.current.value = "";
      }

      if (suffixRef.current) {
        suffixRef.current.value = "";
      }
      if (mobileNoRef.current) {
        mobileNoRef.current.value = "";
      }

      if (positionRef.current) {
        positionRef.current.value = "";
      }
      if (addressRef.current) {
        addressRef.current.value = "";
      }
      if (branchRef.current) {
        branchRef.current.value = "";
      }
      branchCodeRef.current = "";
    });
  }

  return (
    <>
      <PageHelmet title="ID Entry - Agent" />
      {isLoadingSearch && <Loading />}
      <div
        style={{
          display: "flex",
          columnGap: "10px",
          marginBottom: "10px",
        }}
      >
        <TextInput
          containerClassName="custom-input"
          containerStyle={{
            width: "500px",
          }}
          label={{
            title: "Search: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "70px",
            },
          }}
          input={{
            className: "search-input-up-on-key-down",
            type: "search",
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
                mutateSearch({
                  search: e.currentTarget.value,
                  entry: "Agent",
                });
              }
            },
            style: { width: "100%" },
          }}
          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault();
            if (searchInputRef.current) {
              mutateSearch({
                search: searchInputRef.current.value,
                entry: "Agent",
              });
            }
          }}
          inputRef={searchInputRef}
        />
        <div
          className="button-action-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "5px",
            marginLeft: "10px",
          }}
        >
          {mode === "" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              id="entry-header-save-button"
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              onClick={() => {
                refetchClientId();
                setMode("add");
              }}
            >
              New
            </Button>
          )}
          <LoadingButton
            id="save-entry-header"
            color="primary"
            variant="contained"
            type="submit"
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            onClick={handleOnSave}
            startIcon={<SaveIcon />}
            disabled={mode === ""}
            loading={loadingAdd || loadingEdit}
          >
            Save
          </LoadingButton>

          <LoadingButton
            disabled={mode === ""}
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
            onClick={() => {
              codeCondfirmationAlert({
                isUpdate: false,
                cb: (userCodeConfirmation) => {
                  mutateDelete({
                    id: clientIdRef.current?.value,
                    userCodeConfirmation,
                  });
                },
              });
            }}
          >
            Delete
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
                    resetField();
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
        </div>
      </div>
      <div
        className="container-fields-custom-client"
        style={{
          display: "flex",
          columnGap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            flex: 1,
          }}
        >
          {loadingClientId ? (
            <LoadingButton loading={loadingClientId} />
          ) : (
            <TextInput
              containerClassName="custom-input"
              label={{
                title: "Agent ID : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "130px",
                },
              }}
              input={{
                disabled: mode === "",
                readOnly: true,
                type: "text",
                style: { width: "100%", height: "22px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    firstnameRef.current?.focus();
                  }
                },
              }}
              inputRef={clientIdRef}
            />
          )}

          <TextInput
            containerClassName="custom-input"
            label={{
              title: "First Name : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: {
                width: "100%",
                height: "22px",
                textTransform: "uppercase",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  middleRef.current?.focus();
                }
              },
            }}
            inputRef={firstnameRef}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Middle Name : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: {
                width: "100%",
                height: "22px",
                textTransform: "uppercase",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  lastnameRef.current?.focus();
                }
              },
            }}
            inputRef={middleRef}
          />

          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Last Name : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: {
                width: "100%",
                height: "22px",
                textTransform: "uppercase",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  suffixRef.current?.focus();
                }
              },
            }}
            inputRef={lastnameRef}
          />

          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Suffix : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "100%", height: "22px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  subAccount.current?.focus();
                }
              },
            }}
            inputRef={suffixRef}
          />
        </div>
        <div
          className="clear-margin custom-padding"
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            marginBottom: "40px",
            flex: 1,
          }}
        >
          {subAccountLoading ? (
            <LoadingButton loading={subAccountLoading} />
          ) : (
            <Autocomplete
              containerClassName="custom-input"
              disableInput={mode === ""}
              ref={_subAccount}
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Sub Account : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "110px",
                },
              }}
              DisplayMember={"ShortName"}
              DataSource={[]}
              inputRef={subAccount}
              input={{
                style: {
                  width: "100%",
                },
              }}
              onChange={(selected: any, e: any) => {
                if (subAccount.current)
                  subAccount.current.value = selected.ShortName;
                console.log(selected);

                branchCodeRef.current = selected.Sub_Acct;
              }}
              onKeydown={(e: any) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  mobileNoRef.current?.focus();
                }
              }}
            />
          )}
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Mobile No. : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "100%", height: "22px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  positionRef.current?.focus();
                }
              },
            }}
            inputRef={mobileNoRef}
          />

          <TextInput
            containerClassName="custom-input"
            label={{
              title: "Position : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
              },
            }}
            input={{
              disabled: mode === "",
              type: "text",
              style: { width: "100%", height: "22px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  addressRef.current?.focus();
                }
              },
            }}
            inputRef={positionRef}
          />
          <TextAreaInput
            containerClassName="custom-input"
            label={{
              title: "Address : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
              },
            }}
            containerStyle={{
              alignItems: "flex-start",
            }}
            textarea={{
              rows: 2,
              disabled: mode === "",
              style: { width: "100%", height: "auto" },
              onKeyDown: (e) => {
                e.stopPropagation();
                if (
                  (e.code === "NumpadEnter" && !e.shiftKey) ||
                  (e.code === "Enter" && !e.shiftKey)
                ) {
                }
              },
            }}
            _inputRef={addressRef}
          />
        </div>
      </div>
      <div
        className="add-padding"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
        }}
      >
        <DataGridViewReact
          height="340px"
          ref={tableRef}
          rows={[]}
          columns={clientColumn}
          getSelectedItem={(rowSelected: any, _: any, RowIndex: any) => {
            if (rowSelected) {
              setMode("edit");
              wait(100).then(() => {
                if (clientIdRef.current) {
                  clientIdRef.current.value = rowSelected[0];
                }

                if (firstnameRef.current) {
                  firstnameRef.current.value = rowSelected[1];
                }
                if (lastnameRef.current) {
                  lastnameRef.current.value = rowSelected[2];
                }
                if (middleRef.current) {
                  middleRef.current.value = rowSelected[3];
                }

                if (suffixRef.current) {
                  suffixRef.current.value = rowSelected[4];
                }
                if (mobileNoRef.current) {
                  mobileNoRef.current.value = rowSelected[5];
                }
                if (subAccount.current) {
                  subAccount.current.value = rowSelected[6];
                }

                if (positionRef.current) {
                  positionRef.current.value = rowSelected[7];
                }
                if (addressRef.current) {
                  addressRef.current.value = rowSelected[8];
                }

                branchCodeRef.current = rowSelected[9];
              });
            } else {
              tableRef.current.setSelectedRow(null);
              tableRef.current.resetCheckBox();
              resetField();
              setMode("");
              return;
            }
          }}
          onKeyDown={(rowSelected: any, RowIndex: any, e: any) => {
            if (e.code === "Delete" || e.code === "Backspace") {
              wait(100).then(() => {
                codeCondfirmationAlert({
                  isUpdate: false,
                  cb: (userCodeConfirmation) => {
                    mutateDelete({
                      id: rowSelected[0],
                      userCodeConfirmation,
                    });
                  },
                });
              });
              return;
            }
          }}
        />
      </div>
      <div
        className="button-action-mobile"
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: "5px",
        }}
      >
        {mode === "" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            id="entry-header-save-button"
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            onClick={() => {
              refetchClientId();
              setMode("add");
            }}
          >
            New
          </Button>
        )}
        <LoadingButton
          id="save-entry-header"
          color="primary"
          variant="contained"
          type="submit"
          sx={{
            height: "22px",
            fontSize: "11px",
          }}
          onClick={handleOnSave}
          startIcon={<SaveIcon />}
          disabled={mode === ""}
          loading={loadingAdd || loadingEdit}
        >
          Save
        </LoadingButton>

        <LoadingButton
          disabled={mode === ""}
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
          onClick={() => {
            codeCondfirmationAlert({
              isUpdate: false,
              cb: (userCodeConfirmation) => {
                mutateDelete({
                  id: clientIdRef.current?.value,
                  userCodeConfirmation,
                });
              },
            });
          }}
        >
          Delete
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
                  resetField();
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
      </div>
    </>
  );
}
