import { LoadingButton } from "@mui/lab";
import { Autocomplete } from "./PettyCash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import {
  DataGridViewMultiSelectionReact,
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

const column = [
  {
    key: "Check_Date",
    label: "Date",
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
        AutoID();
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

  const {
    UpwardTableModalSearch: PNoClientSearchUpwardTableModalSearch,
    openModal: pNoClientSearchOpenModal,
    closeModal: pNoClientSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/pullout/reqeust/get-pnno-client",
    column: [
      { key: "PNo", label: "PN No.", width: 150 },
      { key: "Name", label: "Client Name", width: 270 },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (ppnoRef.current) {
          ppnoRef.current.value = rowItm[0];
        }
        if (nameRef.current) {
          nameRef.current.value = rowItm[1];
        }

        loadChecks(rowItm[0]);
        pNoClientSearchCloseModal();
      }
    },
  });

  const {
    UpwardTableModalSearch: RcpnNoSearchUpwardTableModalSearch,
    openModal: rcpnNoSearchOpenModal,
    closeModal: rcpnNoSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/pullout/reqeust/get-rcpn-no",
    column: [{ key: "RCPNo", label: "RCPN No.", width: 400 }],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        mutateGetSelectedRcpnNoPulloutRequest({
          rcpno: rowItm[0],
        });
        rcpnNoSearchCloseModal();
      }
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
    table.current.setData([]);
    let rcpn = rcpnRef.current?.value;

    const qry = `
    SELECT DISTINCT
        DATE_FORMAT(Check_Date, '%Y-%d-%m') AS Check_Date,
        Bank,
        Check_No,
        Check_Amnt,
        ifnull(b.Status,'--') AS Status,
        ifnull(b.RCPNo,'--') AS RCPNO 
    FROM
        pdc a
        left join (
        SELECT PNNo,a.RCPNo,Status,CheckNo FROM upward_insurance_umis.pullout_request  a
        left join pullout_request_details b on a.RCPNo = b.RCPNo
        where PNNo = '${ppnoRef.current?.value}' and Approved_By is null and Approved_Date is null
        ) b on a.Check_No = b.CheckNo
    WHERE
        PNo = '${ppnoRef.current?.value}'
      AND PDC_Status = 'Stored'
    order by Check_Date asc
        `;

    const { data: response } = await executeQueryToClientRef.current(qry);
    if (flag == "edit") {
      const qry1 = `
                    SELECT DISTINCT
                      CheckNo
                  FROM
                      pullout_request a
                          LEFT JOIN
                      pullout_request_details b ON a.RCPNo = b.RCPNo
                  WHERE
                      a.PNNo = '${pnno}'
                          AND Status = 'PENDING'
                  ORDER BY CheckNo
          `;
      const { data: response1 } = await executeQueryToClientRef.current(qry1);
      const checkNoSelected = response1.data.map((itm: any) => itm.CheckNo);
      const filteredData = response.data.map((itm: any, idx: number) => {
        if (checkNoSelected.includes(itm.Check_No)) {
          return idx;
        }
        return null;
      });

      const selectedRows = filteredData.filter((itm: any) => itm !== null);
      table.current.setDataFormated(response.data);
      table.current.setSelectedRow(selectedRows);
    } else {
      const filteredData = response.data.map((itm: any, idx: number) => {
        if (
          itm.RCPNO !== "--" &&
          itm.RCPNO !== "" &&
          itm.Status !== "APPROVED"
        ) {
          return idx;
        }
        return null;
      });
      const selectedRows = filteredData.filter((itm: any) => itm !== null);
      table.current.setDataFormated(response.data);
      table.current.setSelectedRow(selectedRows);
    }
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

      <PNoClientSearchUpwardTableModalSearch />
      <RcpnNoSearchUpwardTableModalSearch />
      <div
        className="main"
        style={{
          flex: "1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F1F1F1",
        }}
      >
        <PageHelmet title="Pullout Request" />
        <div
          className="content"
          style={{
            padding: "10px",
            width: "62%",
            border: "1px sold black",
            height: "500px",
            boxShadow: "1px 1px 2px 2px black",
            display: "flex",
            flexDirection: "column",
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
                      rcpnNoSearchOpenModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (rcpnRef.current) {
                    rcpnNoSearchOpenModal(rcpnRef.current.value);
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
                    pNoClientSearchOpenModal(e.currentTarget.value);
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
                  pNoClientSearchOpenModal(ppnoRef.current.value);
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
                  key: "Not Renewed by Camfin",
                  value: "Not Renewed by Camfin",
                },
              ]}
              values={"value"}
              display={"key"}
            />
          </div>
          <DataGridViewMultiSelectionReact
            ref={table}
            columns={column}
            rows={[]}
            containerStyle={{
              flex: 1,
            }}
            rowIsSelectable={(rowItm: any) => {
              return ["APPROVED", "PENDING"].includes(rowItm[4]);
            }}
            getSelectedItem={(rowItm: any) => {
              if (rowItm) {
              }
            }}
            onKeyDown={(rowItm: any, rowIdx: any, e: any) => {}}
            onCheckAll={() => {
              const getData = table.current.getData();
              const filteredData = getData.map((itm: any, idx: number) => {
                if (
                  itm.RCPNO !== "--" &&
                  itm.RCPNO !== "" &&
                  itm.Status !== "APPROVED"
                ) {
                  return idx;
                }
                return null;
              });
              const selectedRows = filteredData.filter(
                (itm: any) => itm !== null
              );
              table.current.setSelectedRow(selectedRows);
            }}
            onUnCheckAll={() => {
              table.current.setSelectedRow([]);
            }}
          />
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
                    if (btnSaveRef.current) btnSaveRef.current.disabled = false;
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
                    const getData = table.current.getSelectedRowsData();
                    if (getData.length <= 0) {
                      return alert("No selected row found!");
                    }

                    if (reasonRef.current?.value === "") {
                      return alert("Reason is required!");
                    }
                    saveCondfirmationAlert({
                      isConfirm: () => {
                        const data = getData.map((itm: any) => {
                          return {
                            Check_Date: itm[0],
                            Bank: itm[1],
                            Check_No: itm[2],
                            Check_Amnt: itm[3],
                            Status: itm[4],
                            RCPNO: itm[5],
                          };
                        });
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
                    fieldsReset();
                    table.current.setData([]);
                  }}
                >
                  cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
