import { useContext, useEffect, useRef, useState } from "react";
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
import { DataGridViewReactUpgraded } from "../../../../../components/DataGridViewReact";
import { Loading } from "../../../../../components/Loading";
import { Autocomplete } from "../../../Task/Accounting/PettyCash";

const supplierColumn = [
  { key: "entry_supplier_id", label: "ID", width: 130 },
  {
    key: "ShortName",
    label: "Sub Account",
    width: 120,
  },
  { key: "company", label: "Company", width: 200 },
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
    key: "mobile",
    label: "Mobile",
    width: 200,
  },

  {
    key: "option",
    label: "Option",
    width: 130,
  },
  {
    key: "tin_no",
    label: "TIN",
    width: 130,
  },
  {
    key: "address",
    label: "Address",
    width: 500,
  },
  {
    key: "createdAt",
    label: "Created At",
    width: 130,
    hide: true,
  },

  {
    key: "sub_account",
    label: "sub_account",
    width: 300,
    hide: true,
  },
];
export default function Supplier() {
  const { myAxios, user } = useContext(AuthContext);
  const [option, setOption] = useState("individual");
  const [mode, setMode] = useState("");

  const tableRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clientIdRef = useRef<HTMLInputElement>(null);
  const optionRef = useRef<HTMLSelectElement>(null);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const middleRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);

  const fullnameRef = useRef<HTMLTextAreaElement>(null);
  const authorizeRepRef = useRef<HTMLInputElement>(null);

  const suffixRef = useRef<HTMLInputElement>(null);
  const _subAccount = useRef<any>(null);
  const subAccount = useRef<HTMLSelectElement>(null);
  const branchCodeRef = useRef("");
  const branchRef = useRef<HTMLSelectElement>(null);

  const mobileNoRef = useRef<HTMLInputElement>(null);
  const mortgageeRef = useRef<HTMLSelectElement>(null);
  const tinRef = useRef<HTMLInputElement>(null);

  const addressRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading: loadingClientId, refetch: refetchClientId } = useQuery({
    queryKey: "supplier-generate-id",
    queryFn: async () =>
      await myAxios.post(
        "/reference/id-entry-generate-id",
        { sign: "S", type: "entry supplier" },
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
    mutationKey: "add-entry-supplier",
    mutationFn: async (variables: any) =>
      await myAxios.post("/reference/id-entry-supplier", variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateEdit, isLoading: loadingEdit } = useMutation({
    mutationKey: "entry-supplier-update",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/id-entry-supplier-update`, variables, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      }),
    onSuccess,
  });
  const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
    mutationKey: "delete-client",
    mutationFn: async (variables: any) =>
      await myAxios.post(`/reference/entry-delete?entry=Supplier`, variables, {
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
        `/reference/search-entry?entrySearch=${searchInputRef.current?.value}&entry=Client`,
        variables,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      ),
    onSuccess: (res) => {
      tableRef.current.setData((res as any)?.data.entry);
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
      entry: "Supplier",
    });
  }, []);

  function onSuccess(res: any) {
    if (res.data.success) {
      resetField();
      setMode("");
      tableRef.current.setSelectedRow(null);

      mutateSearchRef.current({
        search: "",
        entry: "Supplier",
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
    if (optionRef.current?.value === "Individual") {
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
    } else {
      if (fullnameRef.current?.value === "") {
        return Swal.fire({
          position: "center",
          icon: "error",
          title: "Full Name is required!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
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
      entry_supplier_id: clientIdRef.current?.value,
      option: optionRef.current?.value,
      firstname: firstnameRef.current?.value.toLocaleUpperCase(),
      middlename: middleRef.current?.value.toLocaleUpperCase(),
      lastname: lastnameRef.current?.value.toLocaleUpperCase(),
      company: fullnameRef.current?.value.toLocaleUpperCase(),
      sub_account: branchCodeRef.current,
      mobile: mobileNoRef.current?.value,
      tin_no: tinRef.current?.value,
      address: addressRef.current?.value,
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
      setOption("individual");

      if (optionRef.current) {
        optionRef.current.value = "individual";
      }
      if (firstnameRef.current) {
        firstnameRef.current.value = "";
      }
      if (middleRef.current) {
        middleRef.current.value = "";
      }
      if (lastnameRef.current) {
        lastnameRef.current.value = "";
      }
      if (fullnameRef.current) {
        fullnameRef.current.value = "";
      }
      if (authorizeRepRef.current) {
        authorizeRepRef.current.value = "";
      }
      if (suffixRef.current) {
        suffixRef.current.value = "";
      }
      if (mobileNoRef.current) {
        mobileNoRef.current.value = "";
      }
      if (mortgageeRef.current) {
        mortgageeRef.current.value = "";
      }
      if (tinRef.current) {
        tinRef.current.value = "";
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
      <PageHelmet title="ID Entry - Client" />
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
                  entry: "Supplier",
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
                entry: "Supplier",
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
          marginBottom: "10px",
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
                title: "Client ID : ",
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
                    optionRef.current?.focus();
                  }
                },
              }}
              inputRef={clientIdRef}
            />
          )}
          <SelectInput
            containerClassName="custom-input custom-label"
            label={{
              title: "Option : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "130px",
              },
            }}
            selectRef={optionRef}
            select={{
              disabled: mode === "",
              value: option,
              style: { width: "100%", height: "22px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  if (option === "Individual") {
                    firstnameRef.current?.focus();
                  } else {
                    fullnameRef.current?.focus();
                  }
                }
              },
              onChange: (e) => {
                setOption(e.currentTarget.value);
              },
            }}
            datasource={[
              { key: "Individual", value: "individual" },
              { key: "Company", value: "company" },
            ]}
            values={"value"}
            display={"key"}
          />
          {option === "individual" && (
            <>
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
            </>
          )}

          {option === "company" && (
            <>
              <TextAreaInput
                containerClassName="custom-input"
                label={{
                  title: "Full Name : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "130px",
                  },
                }}
                textarea={{
                  disabled: mode === "",
                  style: { width: "100%" },
                  onKeyDown: (e) => {
                    e.stopPropagation();
                    if (
                      (e.code === "NumpadEnter" && !e.shiftKey) ||
                      (e.code === "Enter" && !e.shiftKey)
                    ) {
                      authorizeRepRef.current?.focus();
                    }
                  },
                }}
                _inputRef={fullnameRef}
              />
            </>
          )}
        </div>
        <div
          className="clear-margin custom-padding"
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
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
              title: "Contact No. : ",
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
                  mortgageeRef.current?.focus();
                }
              },
            }}
            inputRef={mobileNoRef}
          />
          <TextInput
            containerClassName="custom-input"
            label={{
              title: "TIN : ",
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
            inputRef={tinRef}
          />
        </div>
        <div
          className="clear-margin "
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            flex: 1,
          }}
        >
          <TextAreaInput
            containerClassName="custom-input"
            containerStyle={{
              alignItems: "flex-start",
            }}
            label={{
              title: "Address : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
              },
            }}
            textarea={{
              disabled: mode === "",
              style: { width: "100%", height: "80px" },
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
        style={{
          width: "100%",
          position: "relative",
          flex: 1,
          display: "flex",
        }}
      >
        <DataGridViewReactUpgraded
          ref={tableRef}
          adjustVisibleRowCount={280}
          disableDeleteAll={true}
          columns={supplierColumn}
          handleSelectionChange={(rowSelected: any) => {
            if (rowSelected) {
              setMode("edit");
              setOption(rowSelected.option?.toLowerCase());
              wait(100).then(() => {
                if (clientIdRef.current) {
                  clientIdRef.current.value = rowSelected.entry_supplier_id;
                }
                if (subAccount.current) {
                  subAccount.current.value = rowSelected.ShortName;
                }
                if (fullnameRef.current) {
                  fullnameRef.current.value = rowSelected.company;
                }
                if (firstnameRef.current) {
                  firstnameRef.current.value = rowSelected.firstname;
                }
                if (lastnameRef.current) {
                  lastnameRef.current.value = rowSelected.lastname;
                }
                if (middleRef.current) {
                  middleRef.current.value = rowSelected.middlename;
                }
                if (mobileNoRef.current) {
                  mobileNoRef.current.value = rowSelected.mobile;
                }
                if (optionRef.current) {
                  optionRef.current.value = rowSelected.option
                    ?.toString()
                    .toLowerCase();
                }
                if (tinRef.current) {
                  tinRef.current.value = rowSelected.tin_no;
                }
                if (addressRef.current) {
                  addressRef.current.value = rowSelected.address;
                }

                // hidden fields
                branchCodeRef.current = rowSelected.sub_account;
              });
            } else {
              tableRef.current.setSelectedRow(null);
              resetField();
              setMode("");
              return;
            }
          }}
          onKeyDelete={(rowSelected: any) => {
            codeCondfirmationAlert({
              isUpdate: false,
              cb: (userCodeConfirmation) => {
                mutateDelete({
                  id: rowSelected.entry_supplier_id,
                  userCodeConfirmation,
                });
              },
            });
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
