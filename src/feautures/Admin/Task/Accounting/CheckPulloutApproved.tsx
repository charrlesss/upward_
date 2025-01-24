import { LoadingButton } from "@mui/lab";
import { useContext, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { DataGridViewMultiSelectionReact } from "../../../../components/DataGridViewReact";
import { Button } from "@mui/material";
import { wait } from "@testing-library/user-event/dist/utils";
import Swal from "sweetalert2";
import { Loading } from "../../../../components/Loading";
import PageHelmet from "../../../../components/Helmet";

const column = [
  {
    key: "row_count",
    label: "#",
    width: 30,
  },
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
  { key: "CheckNo", label: "Check No", width: 150 },
  { key: "Check_Amnt", label: "Amount", width: 120, type: "number" },
];
export default function CheckPulloutApproved() {
  const { myAxios, user } = useContext(AuthContext);
  const table = useRef<any>(null);

  const rcpnRef = useRef<HTMLSelectElement>(null);
  const ppnoRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const btnAddRef = useRef<HTMLButtonElement>(null);

  const {
    isLoading: isLoadingLoadRequestNumber,
    data: dataLoadRequestNumber,
    refetch: refetchRequestNumber,
  } = useQuery({
    queryKey: "load-request-number",
    queryFn: async () =>
      await myAxios.get(
        `/task/accounting/pullout/approved/load-request-number`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
  });

  const { isLoading: isLoadingLoadDetails, mutate: mutateDetails } =
    useMutation({
      mutationKey: "load-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/pullout/approved/load-details`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        const details = res?.data.details;
        if (ppnoRef.current) ppnoRef.current.value = details[0].PNNo;
        if (nameRef.current) nameRef.current.value = details[0].Name;
        if (reasonRef.current) reasonRef.current.value = details[0].Reason;
        table.current.setDataFormated(details);
      },
    });

  const { isLoading: isLoadingConfirmCode, mutate: mutateConfirmCode } =
    useMutation({
      mutationKey: "confirm-code",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/pullout/approved/confirm-code`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        table.current.resetTable();
        if (rcpnRef.current) rcpnRef.current.value = "";
        if (ppnoRef.current) ppnoRef.current.value = "";
        if (nameRef.current) nameRef.current.value = "";
        if (reasonRef.current) reasonRef.current.value = "";
        if (codeRef.current) codeRef.current.value = "";

        Swal.fire({
          position: "center",
          icon: "warning",
          title: res.data.message,
          timer: 1500,
        }).then(() => {
          refetchRequestNumber();
        });
      },
    });

  const { isLoading: isLoadingConfirm, mutate: mutateConfirm } = useMutation({
    mutationKey: "confirm",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/pullout/approved/confirm`,
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      if (res.data.success) {
        return Swal.fire({
          title: "Are you sure?",
          text: res.data.message,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, confirm it!",
        }).then((result) => {
          if (result.isConfirmed) {
            const getData = table.current.getData();
            const formatData = getData.map((itm: any) => {
              return {
                Check_Date: itm[1],
                Bank: itm[2],
                Check_No: itm[3],
                Check_Amnt: itm[4],
              };
            });
            mutateConfirmCode({
              RCPNo: rcpnRef.current?.value,
              PNNo: ppnoRef.current?.value,
              reason: reasonRef.current?.value,
              Name: nameRef.current?.value,
              code: codeRef.current?.value,
              selected: JSON.stringify(formatData),
            });
          }
        });
      }

      alert(res.data.message);
    },
  });

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
      <PageHelmet title="Pullout Approved" />
      {(isLoadingLoadDetails || isLoadingConfirm || isLoadingConfirmCode) && (
        <Loading />
      )}
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
          {isLoadingLoadRequestNumber ? (
            <LoadingButton loading={isLoadingLoadRequestNumber} />
          ) : (
            <div
              style={{
                width: "100%",
                marginBottom: "8px",
              }}
            >
              <SelectInput
                label={{
                  title: "RCP No.  : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                selectRef={rcpnRef}
                select={{
                  style: { flex: 1, height: "22px" },
                  defaultValue: "Non-VAT",
                  onChange: async (e) => {
                    if (e.currentTarget.selectedIndex === 0) {
                      table.current.resetTable();
                      if (rcpnRef.current) rcpnRef.current.value = "";
                      if (ppnoRef.current) ppnoRef.current.value = "";
                      if (nameRef.current) nameRef.current.value = "";
                      if (reasonRef.current) reasonRef.current.value = "";
                      if (codeRef.current) codeRef.current.value = "";
                    }
                    mutateDetails({ RCPNo: e.target.value });
                  },
                }}
                containerStyle={{
                  width: "300px",
                  marginBottom: "12px",
                }}
                datasource={dataLoadRequestNumber?.data.rcpn}
                values={"RCPNo"}
                display={"RCPNo"}
              />
            </div>
          )}

          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
              marginLeft: "50px",
            }}
            label={{
              title: "PN No. :",
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
            }}
            inputRef={ppnoRef}
          />

          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
              marginLeft: "50px",
            }}
            label={{
              title: "Client :",
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
            }}
            inputRef={nameRef}
          />
          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
              marginLeft: "50px",
            }}
            label={{
              title: "Reason :",
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
            }}
            inputRef={reasonRef}
          />
        </div>
        <DataGridViewMultiSelectionReact
          isTableSelectable={false}
          ref={table}
          columns={column}
          rows={[]}
          containerStyle={{
            flex: 1,
          }}
          getSelectedItem={(rowItm: any) => {
            if (rowItm) {
            }
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
          <TextInput
            label={{
              title: "Authentication Code:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "140px",
              },
            }}
            input={{
              type: "text",
              style: { width: "300px" },
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumEnter") {
                  mutateConfirm({
                    RCPNo: rcpnRef.current?.value,
                    code: e.currentTarget.value,
                  });
                }
              },
            }}
            inputRef={codeRef}
          />
          <Button
            ref={btnAddRef}
            variant="contained"
            color="info"
            style={{
              height: "25px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              mutateConfirm({
                RCPNo: rcpnRef.current?.value,
                code: codeRef.current?.value,
              });
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
