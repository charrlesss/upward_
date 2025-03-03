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
  TextAreaInput,
  TextInput,
} from "../../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReact } from "../../../../../components/DataGridViewReact";
import { Loading } from "../../../../../components/Loading";
import { Autocomplete } from "../../../Task/Accounting/PettyCash";
const fixedAssetsColumn = [
  { key: "entry_fixed_assets_id", label: "ID", width: 130 },
  { key: "fullname", label: "Full Name", width: 400 },
  {
    key: "ShortName",
    label: "ShortName",
    width: 200,
  },
  {
    key: "description",
    label: "Description",
    width: 400,
  },
  {
    key: "remarks",
    label: "Remarks",
    width: 400,
  },
 
  {
    key: "createdAt",
    label: "createdAt",
    width: 200,
    hide:true
  },
  {
    key: "sub_account",
    label: "sub_account",
    width: 200,
    hide:true
  },

];
export default function FixedAssets() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");

  const tableRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clientIdRef = useRef<HTMLInputElement>(null);
  const fullnameRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const _subAccountRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const Sub_AcctRef = useRef("");

  const { isLoading: loadingClientId, refetch: refetchClientId } = useQuery({
    queryKey: "fixed_assets-generate-id",
    queryFn: async () =>
      await myAxios.post(
        "/reference/id-entry-generate-id",
        { sign: "FA", type: "entry fixed assets" },
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
    mutationKey: "add-fixed-assets",
    mutationFn: async (variables: any) =>
      await myAxios.post("/reference/id-entry-fixed-assets", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });

  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "edit-fixed-assets",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/id-entry-fixed-assets-update`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "delete-client",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-delete?entry=Fixed Assets`, variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess,
  });
  const { isLoading: isLoadingSearch, mutate: mutateSearch } = useMutation({
    mutationKey: "search",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/reference/search-entry`,
        variables,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
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
        if (_subAccountRef.current)
          _subAccountRef.current.setDataSource(res.data?.subAccount);
        wait(100).then(() => {
          const data = res.data?.subAccount.filter(
            (itm: any) => itm.Acronym === "HO"
          );

          if (subAccountRef.current)
            subAccountRef.current.value = data[0].ShortName;
          Sub_AcctRef.current = data[0].Sub_Acct;
        });
      });
    },
  });

  const mutateSearchRef = useRef(mutateSearch);
  useEffect(() => {
    mutateSearchRef.current({
      search: "",
      entry: "Fixed Assets",
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
        entry: "Fixed Assets",
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
    if (fullnameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "error",
        title: "Full Name is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    
    const state = {
      entry_fixed_assets_id: clientIdRef.current?.value,
      fullname: fullnameRef.current?.value.toLocaleUpperCase(),
      description: descriptionRef.current?.value,
      remarks: remarksRef.current?.value,
      sub_account: Sub_AcctRef.current,
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
      if(fullnameRef.current){
        fullnameRef.current.value = ''
      }
      if(descriptionRef.current){
        descriptionRef.current.value = ''
      }
      if(remarksRef.current){
        remarksRef.current.value = ''
      }
      if(subAccountRef.current){
        subAccountRef.current.value = 'Head Office'
      }
    });
  }

  return (
    <>
      <PageHelmet title="ID Entry - Fixed Assets" />
      {isLoadingSearch && <Loading />}
      <div
        style={{
          display: "flex",
          columnGap: "10px",
          marginBottom: "10px",
        }}
      >
        <TextInput
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
                  entry: "Fixed Assets",
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
                entry: "Fixed Assets",
              });
            }
          }}
          inputRef={searchInputRef}
        />
        <div
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
              label={{
                title: "Fixed Assets ID: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "130px",
                },
              }}
              containerStyle={{ width: "50%" }}
              input={{
                disabled: mode === "",
                readOnly: true,
                type: "text",
                style: { width: "calc(100% - 130px)", height: "22px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    fullnameRef.current?.focus();
                  }
                },
              }}
              inputRef={clientIdRef}
            />
          )}
          <TextAreaInput
            label={{
              title: "Full Name : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            containerStyle={{
              alignItems: "flex-start",
              width: "100%",
            }}
            textarea={{
              disabled: mode === "",
              style: { width: "calc(100% - 130px)" },
              rows: 2,
              onKeyDown: (e) => {
                e.stopPropagation();
                if (
                  (e.code === "NumpadEnter" && !e.shiftKey) ||
                  (e.code === "Enter" && !e.shiftKey)
                ) {
                  descriptionRef.current?.focus();
                }
              },
            }}
            _inputRef={fullnameRef}
          />
          <TextAreaInput
            label={{
              title: "Description : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            containerStyle={{
              alignItems: "flex-start",
              width: "100%",
            }}
            textarea={{
              disabled: mode === "",
              style: { width: "calc(100% - 130px)" },
              rows: 2,
              onKeyDown: (e) => {
                e.stopPropagation();
                if (
                  (e.code === "NumpadEnter" && !e.shiftKey) ||
                  (e.code === "Enter" && !e.shiftKey)
                ) {
                  subAccountRef.current?.focus();
                }
              },
            }}
            _inputRef={descriptionRef}
          />
        </div>
        <div
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
              disableInput={mode === ""}
              ref={_subAccountRef}
              containerStyle={{
                width: "50%",
              }}
              label={{
                title: "Sub Account : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "165px",
                },
              }}
              DisplayMember={"ShortName"}
              DataSource={[]}
              inputRef={subAccountRef}
              input={{
                style: {
                  width: "100%",
                },
              }}
              onChange={(selected: any, e: any) => {
                if (subAccountRef.current)
                  subAccountRef.current.value = selected.ShortName;
                console.log(selected);

                Sub_AcctRef.current = selected.Sub_Acct;
              }}
              onKeydown={(e: any) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  remarksRef.current?.focus();
                }
              }}
            />
          )}

          <TextAreaInput
            label={{
              title: "Remarks : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            containerStyle={{
              alignItems: "flex-start",
            }}
            textarea={{
              disabled: mode === "",
              style: { width: "100%", height: "50px" },
              onKeyDown: (e) => {
                e.stopPropagation();
                if (
                  (e.code === "NumpadEnter" && !e.shiftKey) ||
                  (e.code === "Enter" && !e.shiftKey)
                ) {
                }
              },
            }}
            _inputRef={remarksRef}
          />
        </div>
      </div>
      <div
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
          columns={fixedAssetsColumn}
          getSelectedItem={(rowSelected: any, _: any, RowIndex: any) => {
            if (rowSelected) {
              setMode("edit");
              wait(100).then(() => {
                if (clientIdRef.current) {
                  clientIdRef.current.value = rowSelected[0];
                }
                if (fullnameRef.current) {
                  fullnameRef.current.value = rowSelected[1];
                }
                if (subAccountRef.current) {
                  subAccountRef.current.value = rowSelected[2];
                }
                if (descriptionRef.current) {
                  descriptionRef.current.value = rowSelected[3];
                }
                if (remarksRef.current) {
                  remarksRef.current.value = rowSelected[4];
                }
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
    </>
  );
}
