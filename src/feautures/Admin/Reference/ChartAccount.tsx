import { useContext, useState, useRef } from "react";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../lib/confirmationAlert";
import { UpwardTable } from "../../../components/UpwardTable";
import {
  ButtonField,
  SelectInput,
  TextInput,
} from "../../../components/UpwardFields";
import PageHelmet from "../../../components/Helmet";

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
export const chartAccountColumn = [
  { field: "Acct_Code", headerName: "Account Code", width: 150 },
  { field: "Acct_Title", headerName: "Account Name/Account Title", width: 300 },
  { field: "Short", headerName: "Short Name", width: 300 },
  { field: "Acct_Type", headerName: "Account Type", width: 200 },
  { field: "Account", headerName: "Account", width: 100 },
  { field: "SubAccnt", headerName: "Sub Account ?", width: 100 },
  { field: "IDNo", headerName: "I.D. ?", width: 100 },
  { field: "Inactive", headerName: "Inactive ?", width: 100 },
];
const queryKey = "chart-account";

export default function ChartAccount() {
  const tableRef = useRef<any>(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const inputCodeRef = useRef<HTMLInputElement>(null);
  const inputAccountClassificationRef = useRef<HTMLSelectElement>(null);
  const inputAccountTypeRef = useRef<HTMLSelectElement>(null);
  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputShortNameRef = useRef<HTMLInputElement>(null);
  const inputRequiredSubAccountRef = useRef<HTMLInputElement>(null);
  const inputRequiredIDRef = useRef<HTMLInputElement>(null);
  const inputMarkInactiveRef = useRef<HTMLInputElement>(null);

  const { myAxios, user } = useContext(AuthContext);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const [mode, setMode] = useState<string>("");

  const { isLoading, refetch: refetchChartAccountSearch } = useQuery({
    queryKey,
    queryFn: async () =>
      await myAxios.get(
        `/reference/get-chart-accounts?chartAccountSearch=${inputSearchRef.current?.value ?? ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      setRows((res as any)?.data.chartAccount);
      resetField();
      tableRef?.current?.resetTableSelected();
    },
    refetchOnWindowFocus: false,
  });
  const { mutate: mutateAdd, isLoading: loadingAdd } = useMutation({
    mutationKey: queryKey,
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
    mutationKey: queryKey,
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
    mutationKey: queryKey,
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/delete-chart-account", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess,
  });
  function onSuccess(res: any) {
    if (res.data.success) {
      return Swal.fire({
        position: "center",
        icon: "success",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        handleCancel();
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
  const handleSave = (e: any) => {
    if (inputCodeRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Code is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (inputNameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Title is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (inputShortNameRef.current?.value === "") {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Short Name is required!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if ((inputCodeRef.current?.value as string).length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Code is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if ((inputNameRef.current?.value as string).length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Acct Title is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if ((inputShortNameRef.current?.value as string).length >= 200) {
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: "Short Name is too long!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    e.preventDefault();
    const state = {
      Acct_Code: inputCodeRef.current?.value,
      Acct_Title: inputNameRef.current?.value,
      Short: inputShortNameRef.current?.value,
      Account: inputAccountClassificationRef.current?.value,
      Acct_Type: inputAccountTypeRef.current?.value,
      IDNo: inputRequiredIDRef.current?.checked,
      SubAccnt: inputRequiredSubAccountRef.current?.checked,
      Inactive: inputMarkInactiveRef.current?.checked,
      mode: "",
      search: "",
    };
    if (mode === "update") {
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
  };
  const handleCancel = () => {
    setMode("");
    resetField();
    tableRef?.current?.resetTableSelected();
  };
  const handleAdd = () => {
    setMode("add");
    setTimeout(() => {
      inputCodeRef.current?.focus()
    }, 100)
  };
  const handleDelete = () => {
    codeCondfirmationAlert({
      isUpdate: false,
      cb: (userCodeConfirmation) => {
        mutateDelete({
          Acct_Code: inputCodeRef.current?.value,
          userCodeConfirmation,
        });
      },
    });
  };
  const onSelectionChange = (selectedRow: any) => {
    if (selectedRow.length > 0) {
      const row = selectedRow[0];
      if (inputCodeRef.current) {
        inputCodeRef.current.value = row.Acct_Code;
      }
      if (inputAccountClassificationRef.current) {
        inputAccountClassificationRef.current.value = row.Account.trim();
      }
      if (inputAccountTypeRef.current) {
        inputAccountTypeRef.current.value = row.Acct_Type.trim();
      }
      if (inputNameRef.current) {
        inputNameRef.current.value = row.Acct_Title;
      }
      if (inputShortNameRef.current) {
        inputShortNameRef.current.value = row.Short;
      }
      if (inputRequiredSubAccountRef.current) {
        inputRequiredSubAccountRef.current.checked = row.SubAccnt === "YES";
      }
      if (inputRequiredIDRef.current) {
        inputRequiredIDRef.current.checked = row.IDNo === "YES";
      }
      if (inputMarkInactiveRef.current) {
        inputMarkInactiveRef.current.checked = row.Inactive === "YES";
      }
      setMode("update");
    } else {
      resetField();
    }
  };
  function resetField() {
    if (inputCodeRef.current) {
      inputCodeRef.current.value = "";
    }
    if (inputAccountClassificationRef.current) {
      inputAccountClassificationRef.current.selectedIndex = 0;
    }
    if (inputAccountTypeRef.current) {
      inputAccountTypeRef.current.selectedIndex = 0;
    }
    if (inputNameRef.current) {
      inputNameRef.current.value = "";
    }
    if (inputShortNameRef.current) {
      inputShortNameRef.current.value = "";
    }
    if (inputRequiredSubAccountRef.current) {
      inputRequiredSubAccountRef.current.checked = false;
    }
    if (inputRequiredIDRef.current) {
      inputRequiredIDRef.current.checked = false;
    }
    if (inputMarkInactiveRef.current) {
      inputMarkInactiveRef.current.checked = false;
    }
  }

  const width = window.innerWidth - 100;
  const height = window.innerHeight - 90;
  const disableFields = mode === "";

  if (isLoading || loadingAdd || loadingEdit || loadingDelete) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHelmet title="Chart Account" />
      <div
        style={{
          flex: 1,
          backgroundColor: "#F8F8FF",
        }}
      >
        <div
          style={{ width: `${width}px`, height: `${height}px`, margin: "auto" }}
        >
          <div
            style={{
              height: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "30px",
                columnGap: "10px",
              }}
            >
              <TextInput
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
                      refetchChartAccountSearch();
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
                inputRef={inputSearchRef}
              />
              {!disableFields && (
                <ButtonField
                  button={{
                    style: {
                      margin: 0,
                      padding: "5px",
                      borderRadius: "5px",
                      background: "transparent",
                    },
                    onClick: handleCancel,
                  }}
                  tooltipText="CANCEL"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17px"
                    height="17px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                      fill="#d97706"
                    />
                  </svg>
                </ButtonField>
              )}
              {disableFields && (
                <ButtonField
                  button={{
                    style: {
                      margin: 0,
                      padding: "5px",
                      borderRadius: "5px",
                      background: "transparent",
                    },
                    onClick: handleAdd,
                  }}
                  tooltipText="ADD"
                >
                  <svg width="20px" height="20px" viewBox="0 0 24 24">
                    <title />

                    <g id="Complete">
                      <g data-name="add" id="add-2">
                        <g>
                          <line
                            fill="none"
                            stroke="#000000"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            x1="12"
                            x2="12"
                            y1="19"
                            y2="5"
                          />

                          <line
                            fill="none"
                            stroke="#000000"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            x1="5"
                            x2="19"
                            y1="12"
                            y2="12"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                </ButtonField>
              )}
              <ButtonField
                disabled={disableFields}
                button={{
                  style: {
                    margin: 0,
                    padding: "5px",
                    borderRadius: "5px",
                    background: "transparent",
                  },
                  onClick: handleSave,
                }}
                tooltipText="SAVE"
              >
                <svg width="17px" height="17px" viewBox="0 0 24 24" fill="green">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z"
                    fill="green"
                  />
                </svg>
              </ButtonField>
              <ButtonField
                disabled={mode !== "update"}
                button={{
                  style: {
                    margin: 0,
                    padding: "5px",
                    borderRadius: "5px",
                    background: "transparent",
                  },
                  onClick: handleDelete,
                }}
                tooltipText="DELETE"
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7H20"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ButtonField>
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                columnGap: "30px",
                rowGap: "15px",
                flexWrap: "wrap",
              }}
            >
              <TextInput
                label={{
                  title: "Code: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "40px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { width: "90px" },
                }}
                inputRef={inputCodeRef}
              />
              <SelectInput
                label={{
                  title: "Account Classification: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "135px",
                  },
                }}
                selectRef={inputAccountClassificationRef}
                select={{
                  disabled: disableFields,
                  style: { width: "120px" },
                }}
                datasource={[
                  { key: "Asset" },
                  { key: "Liability" },
                  { key: "Equity" },
                  { key: "Revenue" },
                  { key: "Expense" },
                ]}
                values={"key"}
                display={"key"}
              />
              <SelectInput
                label={{
                  title: "Account Type: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                selectRef={inputAccountTypeRef}
                select={{
                  disabled: disableFields,
                  style: { width: "120px" },
                }}
                datasource={[
                  { key: "Group Header" },
                  { key: "Header" },
                  { key: "Detail" },
                ]}
                values={"key"}
                display={"key"}
              />
              <TextInput
                label={{
                  title: "Name/Title: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { width: "350px" },
                }}
                inputRef={inputNameRef}
              />
              <TextInput
                label={{
                  title: "ShortName: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: disableFields,
                  type: "text",
                  style: { width: "200px" },
                }}
                inputRef={inputShortNameRef}
              />
              <TextInput
                label={{
                  title: "Required sub-account?: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "140px",
                  },
                }}
                input={{
                  disabled: disableFields,

                  type: "checkbox",
                  style: { width: "12px", height: "12px" },
                }}
                inputRef={inputRequiredSubAccountRef}
              />
              <TextInput
                label={{
                  title: "Required I.D.?: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "85px",
                  },
                }}
                input={{
                  disabled: disableFields,

                  type: "checkbox",
                  style: { width: "12px", height: "12px" },
                }}
                inputRef={inputRequiredIDRef}
              />
              <TextInput
                label={{
                  title: "Mark As Inactive: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: disableFields,

                  type: "checkbox",
                  style: { width: "12px", height: "12px" },
                }}
                inputRef={inputMarkInactiveRef}
              />
            </div>
          </div>
          <UpwardTable
            ref={tableRef}
            rows={rows}
            column={chartAccountColumn}
            width={width}
            height={height}
            dataReadOnly={true}
            onSelectionChange={onSelectionChange}
            isMultipleSelect={false}
          />
        </div>
      </div>
    </>
  );
}
