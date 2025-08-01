import { LoadingButton } from "@mui/lab";
import { Autocomplete } from "./PettyCash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import {
  DataGridViewMultiSelectionReact,
  DataGridViewReactMultipleSelection,
  UpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { Button } from "@mui/material";
import { orange } from "@mui/material/colors";
import { wait } from "@testing-library/user-event/dist/utils";
import Swal from "sweetalert2";
import { Loading } from "../../../../components/Loading";
import PageHelmet from "../../../../components/Helmet";
import "../../../../style/monbileview/accounting/pullout.css";
import SearchIcon from "@mui/icons-material/Search";
import { saveCondfirmationAlert } from "../../../../lib/confirmationAlert";
import { format } from "date-fns";

const column = [
  {
    key: "Check_Date",
    label: "Check Date",
    width: 80,
  },
  {
    key: "Bank",
    label: "Bank",
    width: 150,
  },
  { key: "Check_No", label: "Check No", width: 150 },
  { key: "Check_Amnt", label: "Amount", width: 120 },
  { key: "Status", label: "Status", width: 150 },
  { key: "RCPNO", label: "RCPNO", width: 150 },
];
export default function CheckPulloutRequest() {
  const { myAxios, user } = useContext(AuthContext);

  const { executeQueryToClient } = useExecuteQueryFromClient();
  const [flag, setFlag] = useState("");
  const [disableSelectAll, setDisableSelectAll] = useState(false);

  const executeQueryToClientRef = useRef(executeQueryToClient);
  const table = useRef<any>(null);

  const rcpnRef = useRef<HTMLInputElement>(null);
  const ppnoRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLSelectElement>(null);

  const btnAddRef = useRef<HTMLButtonElement>(null);
  const btnEditRef = useRef<HTMLButtonElement>(null);
  const btnSaveRef = useRef<HTMLButtonElement>(null);
  const btnCancelRef = useRef<HTMLButtonElement>(null);

  const PNoModalRef = useRef<any>(null);
  const rcpnModalRef = useRef<any>(null);

  const {
    isLoading: isLoadingSavePulloutRequest,
    mutate: mutateSavePulloutRequest,
  } = useMutation({
    mutationKey: "save-pullout-request",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/task/accounting/pullout/reqeust/save-pullout-request`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (data, variable) => {
      const response = data as any;
      if (response.data.success) {
        // loadChecks(variable.ppno);
        table.current.resetTable();
        AutoID();
        fieldsReset();
        setDisableSelectAll(false);
        setFlag("");
        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  const {
    isLoading: isLoadingGetSelectedRcpnNoPulloutRequest,
    mutate: mutateGetSelectedRcpnNoPulloutRequest,
  } = useMutation({
    mutationKey: "get-selected-rcpn-no",
    mutationFn: async (variables: any) =>
      await myAxios.post(
        `/task/accounting/pullout/reqeust/get-selected-rcpn-no`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (response) => {
      const rcpnDetails = response.data.data[0];
      if (rcpnRef.current) {
        rcpnRef.current.value = rcpnDetails.RCPNo;
      }
      if (ppnoRef.current) {
        ppnoRef.current.value = rcpnDetails.PNNo;
      }
      if (nameRef.current) {
        nameRef.current.value = rcpnDetails.Name;
      }
      if (reasonRef.current) {
        reasonRef.current.value = rcpnDetails.Reason;
      }
      loadChecks(rcpnDetails.PNNo);
    },
  });

  const AutoID = async () => {
    const qry = `
        SELECT
            right(year(curdate()) ,2) as Year,
            lpad(COUNT(1) + 1, 4, '0') as Count
        FROM pullout_request
            where substring(RCPNo,5,2) = right(year(curdate()) ,2) and Branch = 'HO'`;

    const { data: response } = await executeQueryToClientRef.current(qry);

    if (rcpnRef.current)
      rcpnRef.current.value = `HOPO${response.data[0].Year}${response.data[0].Count}`;
  };

  const loadChecks = async (pnno: string) => {
    setDisableSelectAll(false);
    table.current.setData([]);
    let rcpn = rcpnRef.current?.value;

    const qry = `
    SELECT DISTINCT
        Check_Date,
        Bank,
        Check_No,
        Check_Amnt,
        ifnull(b.Status,'--') AS Status,
        ifnull(b.RCPNo,'--') AS RCPNO 
    FROM
        pdc a
        left join (
        SELECT PNNo,a.RCPNo,Status,CheckNo FROM pullout_request  a
        left join pullout_request_details b on a.RCPNo = b.RCPNo
        where PNNo = '${ppnoRef.current?.value}' 
        ) b on a.Check_No = b.CheckNo
    WHERE
        PNo = '${ppnoRef.current?.value}'
      AND PDC_Status = 'Stored'
    order by Check_Date asc
        `;
    const { data: response } = await executeQueryToClientRef.current(qry);

    table.current.setData(response.data);
  };
  const fieldsReset = () => {
    setTimeout(() => {
      if (rcpnRef.current) {
        rcpnRef.current.value = "";
      }
      if (ppnoRef.current) {
        ppnoRef.current.value = "";
      }
      if (nameRef.current) {
        nameRef.current.value = "";
      }
      if (reasonRef.current) {
        reasonRef.current.selectedIndex = 0;
      }
    }, 100);
  };

  return (
    <>
      {(isLoadingSavePulloutRequest ||
        isLoadingGetSelectedRcpnNoPulloutRequest) && <Loading />}

      <PageHelmet title="Pullout Request" />
      <div
        className="main"
        style={{
          flex: "1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F1F1F1",
          flexDirection: "column",
        }}
      >
        <div
          className="content"
          style={{
            width: "62%",
            height: "500px",
            boxShadow: "1px 1px 5px 2px #ACB0B0",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            borderRadius: "15px",
          }}
        >
          <div
            style={{
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
              background: "#399494",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 15px",
            }}
          >
            <div
              style={{
                height: "15px",
                width: "15px",
                background: "white",
                borderRadius: "50%",
              }}
            ></div>
            <span
              style={{
                fontSize: "11px",
                textAlign: "center",
                textTransform: "uppercase",
                padding: "0 20px",
                color: "white",
              }}
            >
              Pullout Request
            </span>
            <div
              style={{
                height: "15px",
                width: "15px",
                background: "white",
                borderRadius: "50%",
              }}
            ></div>
          </div>
          <div
            style={{
              padding: "10px",
              flex: 1,
            }}
          >
            <div
              style={{
                height: "auto",
              }}
            >
              {flag === "edit" && (
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "50%",
                    marginBottom: "8px",
                  }}
                  label={{
                    title: "RCP No. :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        rcpnModalRef.current.openModal(e.currentTarget.value);
                      }
                    },
                  }}
                  icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={(e) => {
                    e.preventDefault();
                    if (rcpnRef.current) {
                      rcpnModalRef.current.openModal(rcpnRef.current.value);
                    }
                  }}
                  inputRef={rcpnRef}
                />
              )}
              {(flag === "" || flag === "add") && (
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "50%",
                    marginBottom: "8px",
                  }}
                  label={{
                    title: "RCP No. :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    disabled: true,
                    type: "text",
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                      }
                    },
                  }}
                  inputRef={rcpnRef}
                />
              )}
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "50%", marginBottom: "8px" }}
                label={{
                  title: "PN No. : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: flag === "" || flag === "edit",
                  type: "search",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      PNoModalRef.current.openModal(e.currentTarget.value);
                    }
                  },
                  style: {
                    width: "calc(100% - 100px)",
                    height: "22px",
                  },
                }}
                disableIcon={flag === "" || flag === "edit"}
                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (ppnoRef.current) {
                    PNoModalRef.current.openModal(ppnoRef.current.value);
                  }
                }}
                inputRef={ppnoRef}
              />
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "50%", marginBottom: "8px" }}
                label={{
                  title: "Client : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: flag === "",
                  readOnly: true,
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                    }
                  },
                  style: {
                    width: "calc(100% - 100px)",
                    height: "22px",
                  },
                }}
                inputRef={nameRef}
              />
              <SelectInput
                containerClassName="custom-input"
                label={{
                  title: "Reason : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                selectRef={reasonRef}
                select={{
                  disabled: flag === "",
                  style: { flex: 1, height: "22px" },
                  defaultValue: "Non-VAT",
                  onChange: (e) => {
                    // if (ppnoRef.current) loadChecks(ppnoRef.current.value);
                  },
                }}
                containerStyle={{
                  width: "50%",
                  marginBottom: "12px",
                }}
                datasource={[
                  { key: "", value: "" },
                  { key: "Fully Paid", value: "Fully Paid" },
                  { key: "Cash Replacement", value: "Cash Replacement" },
                  { key: "Check Replacement", value: "Check Replacement" },
                  { key: "Account Closed", value: "Account Closed" },
                  { key: "Hold", value: "Hold" },
                  {
                    key: "Not Renewed",
                    value: "Not Renewed",
                  },
                  {
                    key: "Foreclosed",
                    value: "Foreclosed",
                  },
                ]}
                values={"value"}
                display={"key"}
              />
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                zIndex: 2,
              }}
            >
              <DataGridViewReactMultipleSelection
                ref={table}
                adjustOnRezise={false}
                fixedRowCount={14}
                adjustVisibleRowCount={320}
                columns={column}
                DisplayData={({ row, col }: any) => {
                  return (
                    <>
                      {col.key.trim() === "Check_Date" ? (
                        format(new Date(row[col.key]), "MM/dd/yyyy")
                      ) : col.key.trim() === "Status" ? (
                        <span style={{ color: setStatusColor(row[col.key]) }}>
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key]
                      )}
                    </>
                  );
                }}
                beforeSelectionChange={(row: any) => {
                  if (flag === "edit") {
                    if (row.Status !== "--" && row.Status !== "PENDING") {
                      return true;
                    }
                  } else {
                    if (row.Status !== "--") {
                      return true;
                    }
                  }
                }}
                handleSelectionChange={(row: any) => {
                  if (row) {
                    // if (flag === "edit") {
                    //   if (row.Status !== "--" && row.Status !== "PENDING") {
                    //     alert(`Can't select this, its already ${row.Status}!`);
                    //     wait(100).then(() => {
                    //       const getSelectedRows =
                    //         table.current.getSelectedRow();
                    //       const filteredSelectedRows = getSelectedRows.filter(
                    //         (itm: number) => itm !== row.rowIndex
                    //       );
                    //       table.current.setSelectedRowWithoutScroll(
                    //         filteredSelectedRows
                    //       );
                    //     });
                    //   }
                    // } else {
                    //   if (row.Status !== "--") {
                    //     alert(`Can't select this, its already ${row.Status}!`);
                    //     wait(100).then(() => {
                    //       const getSelectedRows =
                    //         table.current.getSelectedRow();
                    //       const filteredSelectedRows = getSelectedRows.filter(
                    //         (itm: number) => itm !== row.rowIndex
                    //       );
                    //       table.current.setSelectedRowWithoutScroll(
                    //         filteredSelectedRows
                    //       );
                    //     });
                    //   }
                    // }
                  }
                }}
                disableSelectAll={disableSelectAll}
              />
            </div>
            <div
              style={{
                height: "35px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                columnGap: "5px",
              }}
            >
              {flag === "" ? (
                <>
                  <Button
                    ref={btnAddRef}
                    variant="contained"
                    color="info"
                    style={{
                      height: "25px",
                      fontSize: "12px",
                    }}
                    onClick={(e) => {
                      setFlag("add");
                      fieldsReset();
                      if (btnSaveRef.current)
                        btnSaveRef.current.disabled = false;
                      setTimeout(() => {
                        AutoID();
                      }, 100);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    ref={btnEditRef}
                    variant="contained"
                    color="success"
                    style={{
                      height: "25px",
                      fontSize: "12px",
                      background: orange[800],
                    }}
                    onClick={(e) => {
                      setFlag("edit");
                      // Load_RCPNo();
                    }}
                  >
                    edit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    ref={btnSaveRef}
                    variant="contained"
                    color="success"
                    style={{
                      height: "25px",
                      fontSize: "12px",
                    }}
                    onClick={async (e) => {
                      const data = table.current.getSelectedRowData();
                      if (data.length <= 0 && flag === "add") {

                        return alert("No selected row found!");
                      }

                      if (reasonRef.current?.value === "") {
                        return alert("Reason is required!");
                      }

                      if (flag === "add") {
                        saveCondfirmationAlert({
                          isConfirm: () => {
                            if (
                              ppnoRef.current &&
                              nameRef.current &&
                              reasonRef.current
                            ) {
                              mutateSavePulloutRequest({
                                flag,
                                rcpn: rcpnRef.current?.value,
                                ppno: ppnoRef.current.value,
                                name: nameRef.current.value,
                                reason: reasonRef.current.value,
                                data: JSON.stringify(data),
                              });
                            }
                          },
                        });
                      } else {

                        Swal.fire({
                            title: "Are you sure?",
                            text:  `${data.length <= 0 ? `No selected found! it means this request RCNo: ${rcpnRef.current?.value} is you want to delete.` : ""} Do you want to proceed with saving?`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, save it!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                                mutateSavePulloutRequest({
                                flag,
                                rcpn: rcpnRef.current?.value,
                                ppno: ppnoRef.current?.value,
                                name: nameRef.current?.value,
                                reason: reasonRef.current?.value,
                                data: JSON.stringify(data),
                              });
                            }
                           
                          });
                      }
                    }}
                  >
                    save
                  </Button>
                  <Button
                    ref={btnCancelRef}
                    variant="contained"
                    color="error"
                    style={{
                      height: "25px",
                      fontSize: "12px",
                    }}
                    onClick={(e) => {
                      setFlag("");
                      setDisableSelectAll(false);
                      fieldsReset();

                      table.current.setData([]);
                      table.current.setSelectedRow([]);
                    }}
                  >
                    cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <UpwardTableModalSearch
        ref={PNoModalRef}
        link={"/task/accounting/pullout/reqeust/get-pnno-client"}
        column={[
          { key: "PNo", label: "PN No.", width: 150 },
          { key: "Name", label: "Client Name", width: 270 },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            if (ppnoRef.current) {
              ppnoRef.current.value = rowItm.PNo;
            }
            if (nameRef.current) {
              nameRef.current.value = rowItm.Name;
            }

            loadChecks(rowItm.PNo);
            PNoModalRef.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={rcpnModalRef}
        link={"/task/accounting/pullout/reqeust/get-rcpn-no"}
        column={[{ key: "RCPNo", label: "RCPN No.", width: 400 }]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            mutateGetSelectedRcpnNoPulloutRequest({
              rcpno: rowItm.RCPNo,
            });
            rcpnModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
function setStatusColor(rowdata: string) {
  if (rowdata === "PENDING") {
    return "orange";
  } else if (rowdata === "APPROVED") {
    return "green";
  } else if (rowdata === "DISAPPROVED") {
    return "red";
  } else {
    return "blue";
  }
}
