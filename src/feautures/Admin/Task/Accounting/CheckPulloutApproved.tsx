import { LoadingButton } from "@mui/lab";
import { useContext, useRef } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import {
  DataGridViewMultiSelectionReact,
  UpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { Loading } from "../../../../components/Loading";
import PageHelmet from "../../../../components/Helmet";
import "../../../../style/monbileview/accounting/pullout.css";
import SearchIcon from "@mui/icons-material/Search";
import { formatNumber } from "./ReturnCheck";

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

  const rcpnRef = useRef<HTMLInputElement>(null);
  const ppnoRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const btnAddRef = useRef<HTMLButtonElement>(null);

  const rcpnModalRef = useRef<any>(null);

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
        const details = res?.data.details.map((itm: any) => {
          return {
            ...itm,
            Check_Amnt: formatNumber(
              parseFloat(itm.Check_Amnt.toString().replace(/,/g, ""))
            ),
          };
        });

        if (ppnoRef.current) ppnoRef.current.value = details[0].PNNo;
        if (nameRef.current) nameRef.current.value = details[0].Name;
        if (reasonRef.current) reasonRef.current.value = details[0].Reason;
        table.current.setDataFormated(details);
      },
    });

  const { mutate: mutatePrint, isLoading: isLoadingPrint } = useMutation({
    mutationKey: "print",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/accounting/pullout/approved/print",
        variables,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(
        `/${
          process.env.REACT_APP_DEPARTMENT
        }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
        "_blank"
      );
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
        if (res.data.success) {
          Swal.fire({
            text: res.data.message,
            icon: "success",
            timer: 1500,
          })
            .then(() => {
              mutatePrint({
                state: {
                  PNo: ppnoRef.current?.value,
                  Name: nameRef.current?.value,
                  rcpnNo: rcpnRef.current?.value,
                  reportTitle: "",
                },
                tableData: table.current.getData().map((itm: Array<any>) => {
                  return {
                    Check_No: itm[3],
                    Check_Date: itm[1],
                    BankName: itm[2],
                    Check_Amnt: itm[4],
                    seq: itm[0],
                  };
                }),
              });
            })
            .finally(() => {
              table.current.resetTable();
              if (rcpnRef.current) rcpnRef.current.value = "";
              if (ppnoRef.current) ppnoRef.current.value = "";
              if (nameRef.current) nameRef.current.value = "";
              if (reasonRef.current) reasonRef.current.value = "";
              if (codeRef.current) codeRef.current.value = "";
            });
        } else {
          Swal.fire({
            text: res.data.message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, confirm it!",
          });
        }
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
    <>
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
        <PageHelmet title="Pullout Approved" />
        {(isLoadingLoadDetails ||
          isLoadingConfirm ||
          isLoadingConfirmCode ||
          isLoadingPrint) && <Loading />}
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
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: "auto",
              boxSizing: "border-box",
            }}
          >
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

            <TextInput
              containerClassName="custom-input"
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
              containerClassName="custom-input"
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
              containerClassName="custom-input"
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
              containerClassName="custom-input"
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
      <UpwardTableModalSearch
        ref={rcpnModalRef}
        link={"/task/accounting/pullout/reqeust/get-rcpn-no"}
        column={[{ key: "RCPNo", label: "RCPN No.", width: 400 }]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            
            mutateDetails({
              RCPNo: rowItm.RCPNo,
            });

            if (rcpnRef.current) {
              rcpnRef.current.value = rowItm.RCPNo;
            }
            rcpnModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
