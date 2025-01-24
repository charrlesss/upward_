import { LoadingButton } from "@mui/lab";
import { Autocomplete } from "./PettyCash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { DataGridViewMultiSelectionReact } from "../../../../components/DataGridViewReact";
import { Button } from "@mui/material";
import { orange } from "@mui/material/colors";
import { wait } from "@testing-library/user-event/dist/utils";
import Swal from "sweetalert2";
import { Loading } from "../../../../components/Loading";
import PageHelmet from "../../../../components/Helmet";

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
  const [paymentTypeLoading, setPaymentTypeLoading] = useState(false);
  const [pdcAtributeData, setPdcAtributeData] = useState<Array<any>>([]);

  const executeQueryToClientRef = useRef(executeQueryToClient);
  const table = useRef<any>(null);

  const _rcpnRefParent = useRef<any>(null);
  const _rcpnRef = useRef<HTMLSelectElement>(null);
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
        loadChecks(variable.ppno);
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

  const LoadPNNo = useCallback(async () => {
    setPaymentTypeLoading(true);
    const qry = `SELECT DISTINCT PNo, Name FROM PDC WHERE PDC_Status = 'Stored' order by PNo DESC`;
    const { data: response } = await executeQueryToClientRef.current(qry);
    setPdcAtributeData(response.data);
    setPaymentTypeLoading(false);
  }, []);

  const Load_RCPNo = async () => {
    const qry = `
        select '' as RCPNo
        union 
        SELECT DISTINCT
            (RCPNo)
        FROM
            PullOut_Request
        WHERE
            Branch = 'HO' AND Status = 'PENDING'
        ORDER BY RCPNo
        `;
    const { data: response } = await executeQueryToClientRef.current(qry);

    wait(100).then(() => {
      _rcpnRefParent.current.setDataSource(response.data);
    });
  };
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
    let rcpn =
      flag === "add" ? rcpnRef.current?.value : _rcpnRef.current?.value;

    const qry = `
          SELECT DISTINCT
                    date_format(Check_Date,'%Y-%d-%m') as Check_Date,
                    Bank,
                    Check_No,
                    Check_Amnt,
                    ifnull(c.Status,'--') as Status,
                    ifnull(c.RCPNo,'--') as RCPNO
                FROM
                    PDC a
                    left join pullout_request_details b on a.Check_No = b.CheckNo
					left join pullout_request c on b.RCPNo = c.RCPNo
                WHERE
                    PNo = '${pnno}'
					AND PDC_Status = 'Stored'
                ORDER BY Check_No
        `;
    const { data: response } = await executeQueryToClientRef.current(qry);
    if (flag == "edit") {
      const qry1 = `
            SELECT DISTINCT
                      Check_No
                  FROM
                      PDC a
                      left join pullout_request_details b on a.Check_No = b.CheckNo    
                      left join pullout_request c on b.RCPNo = c.RCPNo   
                  WHERE
                      PNo = '${pnno}'
                      AND PDC_Status = 'Stored'
                      AND c.Status is not null
                      AND c.RCPNo = '${rcpn}'
                  ORDER BY Check_No
          `;
      const { data: response1 } = await executeQueryToClientRef.current(qry1);
      const checkNoSelected = response1.data.map((itm: any) => itm.Check_No);
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

  useEffect(() => {
    LoadPNNo();
  }, [LoadPNNo]);

  return (
    <div
      style={{
        flex: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F1F1F1",
      }}
    >
      <PageHelmet title="Pullout Request" />
      {isLoadingSavePulloutRequest && <Loading />}
      <div
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
          {flag === "edit" &&
            (paymentTypeLoading ? (
              <LoadingButton loading={paymentTypeLoading} />
            ) : (
              <div
                style={{
                  width: "100%",
                  marginBottom: "8px",
                }}
              >
                <SelectInput
                  ref={_rcpnRefParent}
                  label={{
                    title: "RCP No.  : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  selectRef={_rcpnRef}
                  select={{
                    style: { flex: 1, height: "22px" },
                    defaultValue: "Non-VAT",
                    onChange: async (e) => {
                      if (flag === "edit") {
                        //
                        const qry = `
                                                Select 
                                                        *,
                                                        (selecT distinct(name) from pdc where PNo =a.PNNo) as 'Name'
                                                    From PullOut_Request a 
                                                    Where Branch = 'HO' and Status = 'PENDING' and rcpno = '${e.currentTarget.value}' 
                                                    Order by RCPNo
                                                `;
                        const { data: response } =
                          await executeQueryToClientRef.current(qry);
                        if (response.data.length > 0) {
                          wait(100).then(() => {
                            if (ppnoRef.current)
                              ppnoRef.current.value = response.data[0].PNNo;
                            if (nameRef.current)
                              nameRef.current.value = response.data[0].Name;
                            if (reasonRef.current)
                              reasonRef.current.value = response.data[0].Reason;

                            loadChecks(response.data[0].PNNo);
                          });
                        } else {
                          table.current.setData([]);
                          fieldsReset();
                        }
                      }
                    },
                  }}
                  containerStyle={{
                    width: "50%",
                    marginBottom: "12px",
                  }}
                  datasource={[]}
                  values={"RCPNo"}
                  display={"RCPNo"}
                />
              </div>
            ))}
          {(flag === "" || flag === "add") && (
            <TextInput
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
          {paymentTypeLoading ? (
            <LoadingButton loading={paymentTypeLoading} />
          ) : (
            <div
              style={{
                width: "50%",
                marginBottom: "8px",
              }}
            >
              <Autocomplete
                disableInput={flag === "" || flag === "edit"}
                label={{
                  title: "PN No. :",
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
                DisplayMember={"PNo"}
                DataSource={pdcAtributeData}
                inputRef={ppnoRef}
                onChange={(selected: any, e: any) => {
                  if (ppnoRef.current) ppnoRef.current.value = selected.PNo;
                  if (nameRef.current) nameRef.current.value = selected.Name;

                  if (reasonRef.current && reasonRef.current.selectedIndex > 0)
                    loadChecks(selected.PNo);
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
          {paymentTypeLoading ? (
            <LoadingButton loading={paymentTypeLoading} />
          ) : (
            <div style={{ width: "50%", marginBottom: "8px" }}>
              <Autocomplete
                disableInput={flag === "" || flag === "edit"}
                label={{
                  title: "Client :",
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
                DisplayMember={"Name"}
                DataSource={pdcAtributeData}
                inputRef={nameRef}
                onChange={(selected: any, e: any) => {
                  if (ppnoRef.current) ppnoRef.current.value = selected.PNo;
                  if (nameRef.current) nameRef.current.value = selected.Name;

                  if (reasonRef.current && reasonRef.current.selectedIndex > 0)
                    loadChecks(selected.PNo);
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
          <SelectInput
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
                if (ppnoRef.current) loadChecks(ppnoRef.current.value);
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
              { key: "Not Renewed by Camfin", value: "Not Renewed by Camfin" },
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
                  Load_RCPNo();
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
                  if (ppnoRef.current && nameRef.current && reasonRef.current) {
                    let rcpn =
                      flag === "add"
                        ? rcpnRef.current?.value
                        : _rcpnRef.current?.value;

                    mutateSavePulloutRequest({
                      flag,
                      rcpn,
                      ppno: ppnoRef.current.value,
                      name: nameRef.current.value,
                      reason: reasonRef.current.value,
                      data: JSON.stringify(data),
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
  );
}
