import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { DataGridViewReact } from "../../../../components/DataGridViewReact";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import Swal from "sweetalert2";
import { LoadingButton } from "@mui/lab";
import { wait } from "../../../../lib/wait";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import PageHelmet from "../../../../components/Helmet";
import "../../../../style/monbileview/accounting/checkpostponement.css";

const columns = [
  { key: "ln", label: "#", width: 40 },
  { key: "CheckNo", label: "Check No", width: 120 },
  { key: "Bank", label: "Bank", width: 200 },
  { key: "Amount", label: "Amount", width: 120 },
  { key: "OldDepositDate", label: "Old Deposit Date", width: 200 },
  { key: "NewDate", label: "New Deposit Date", width: 200 },
  { key: "Penalty", label: "Penalty", width: 120 },
  { key: "Datediff", label: "Number of Days", width: 120 },
  { key: "Reason", label: "Reason", width: 200 },
];

export default function ChekPostponementApproved() {
  const { myAxios, user } = useContext(AuthContext);
  const table = useRef<any>(null);
  const [disabledButtons, setDisabledButtons] = useState(true);
  const modal = useRef<any>(null);
  // first field
  const RPCDNoRef = useRef<HTMLSelectElement>(null);
  const _RPCDNoRef = useRef<any>(null);
  const BranchRef = useRef<HTMLInputElement>(null);
  const PNNoRef = useRef<HTMLInputElement>(null);
  const NameRef = useRef<HTMLInputElement>(null);

  // third field
  const HoldingFeesRef = useRef<HTMLInputElement>(null);
  const PenaltyChargeRef = useRef<HTMLInputElement>(null);
  const SurplusRef = useRef<HTMLInputElement>(null);
  const DeductedToRef = useRef<HTMLSelectElement>(null);
  const TotalRef = useRef<HTMLInputElement>(null);
  const HowToBePaidRef = useRef<HTMLSelectElement>(null);
  const RemarksRef = useRef<HTMLTextAreaElement>(null);

  // laod rpcno
  const { isLoading: isLoadingLoadROCNo, refetch } = useQuery({
    queryKey: "saving",
    queryFn: async (variable: any) =>
      await myAxios.get(
        `/task/accounting/check-postponement/approve/load-rpcdno`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(response) {
      if (!response.data.success) {
        return alert(response.data.message);
      }

      wait(100).then(() => {
        _RPCDNoRef.current.setDataSource(response.data.data);
      });
    },
    refetchOnWindowFocus: false,
  });
  // load details
  const { isLoading: isLoadingDetails, mutate: mutateDetails } = useMutation({
    mutationKey: "load-details",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/check-postponement/approve/load-details`,
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(response) {
      if (!response.data.success) {
        return alert(response.data.message);
      }
      const data = response.data.data;

      wait(100).then(() => {
        if (BranchRef.current) {
          BranchRef.current.value = data[0].Branch;
        }
        if (PNNoRef.current) {
          PNNoRef.current.value = data[0].PNNO;
        }
        if (NameRef.current) {
          NameRef.current.value = data[0].Name;
        }
        if (SurplusRef.current) {
          SurplusRef.current.value = data[0].Surplus;
        }
        if (DeductedToRef.current) {
          DeductedToRef.current.value = data[0].Deducted_to;
        }
        if (HowToBePaidRef.current) {
          HowToBePaidRef.current.value = data[0].PaidVia;
        }
        if (RemarksRef.current) {
          RemarksRef.current.value = data[0].PaidInfo;
        }
        // default
        if (TotalRef.current) {
          TotalRef.current.value = "0.00";
        }
        if (HoldingFeesRef.current) {
          HoldingFeesRef.current.value = "0.00";
        }
        if (PenaltyChargeRef.current) {
          PenaltyChargeRef.current.value = "0.00";
        }

        table.current.setDataFormated(data);
      });
    },
  });
  // handle continue Confirmation
  const { isLoading: isLoadingConConfirmation, mutate: mutateConConfirmation } =
    useMutation({
      mutationKey: "con-confirmation",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/check-postponement/approve/con-confirmation`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(response) {
        if (!response.data.success) {
          return alert(response.data.message);
        }

        wait(100).then(() => {
          setDisabledButtons(true);
          resetFirstFields();
          resetThirdFields();
          table.current.resetTable();
          modal.current.closeDelay();
          refetch();
        });

        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      },
    });

  // handle Confirmation
  const { isLoading: isLoadingConfirmation, mutate: mutateConfirmation } =
    useMutation({
      mutationKey: "confirmation",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/check-postponement/approve/confirmation`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(response) {
        if (!response.data.success) {
          return alert(response.data.message);
        }
        const isConfirm = window.confirm(response.data.message);
        if (isConfirm) {
          const data = table.current.getData();
          mutateConConfirmation({
            ...response.data.data[0],
            RPCDNoRef: RPCDNoRef.current?.value,
            BranchRef: BranchRef.current?.value,
            PNNoRef: PNNoRef.current?.value,
            NameRef: NameRef.current?.value,
            HoldingFeesRef: HoldingFeesRef.current?.value,
            PenaltyChargeRef: PenaltyChargeRef.current?.value,
            SurplusRef: SurplusRef.current?.value,
            DeductedToRef: DeductedToRef.current?.value,
            TotalRef: TotalRef.current?.value,
            HowToBePaidRef: HowToBePaidRef.current?.value,
            RemarksRef: RemarksRef.current?.value,
            data: JSON.stringify(data),
          });
        }
      },
    });
  function resetFirstFields() {
    if (RPCDNoRef.current) {
      RPCDNoRef.current.value = "";
    }
    if (PNNoRef.current) {
      PNNoRef.current.value = "";
    }
    if (NameRef.current) {
      NameRef.current.value = "";
    }
    if (BranchRef.current) {
      BranchRef.current.value = "";
    }
  }

  function resetThirdFields() {
    if (HoldingFeesRef.current) {
      HoldingFeesRef.current.value = "";
    }
    if (PenaltyChargeRef.current) {
      PenaltyChargeRef.current.value = "";
    }
    if (SurplusRef.current) {
      SurplusRef.current.value = "";
    }
    if (DeductedToRef.current) {
      DeductedToRef.current.value = "";
    }
    if (TotalRef.current) {
      TotalRef.current.value = "";
    }
    if (HowToBePaidRef.current) {
      HowToBePaidRef.current.value = "";
    }
    if (RemarksRef.current) {
      RemarksRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        padding: "10px",
        background: "#F1F1F1",
        height: "100%",
      }}
    >
      <PageHelmet title="Check Postponement Approved" />

      {(isLoadingDetails ||
        isLoadingConfirmation ||
        isLoadingConConfirmation) && <Loading />}
      <Modal
        ref={modal}
        handleOnSave={(mode: string, code: string) => {
          mutateConfirmation({
            code,
            mode,
          });
        }}
        handleOnClose={() => {}}
      />
      {/* ===========  first field  =========== */}
      <div
        className="second-field"
        style={{
          position: "relative",
          padding: "12px",
          border: "1px solid #d1d5db",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            position: "absolute",
            top: "-10px",
            left: "20px",
            background: "#F1F1F1",
            padding: "0 5px",
          }}
        >
          Account Informations
        </span>
        <div
          className="first-field"
          style={{
            display: "flex",
            columnGap: "50px",
          }}
        >
          {isLoadingLoadROCNo ? (
            <LoadingButton loading={isLoadingLoadROCNo} />
          ) : (
            <SelectInput
              containerClassName="custom-input"
              ref={_RPCDNoRef}
              label={{
                title: "RPCD no. :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              selectRef={RPCDNoRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "",
                onChange: (e) => {
                  if (e.target.value !== "") {
                    mutateDetails({ RPCDNo: e.target.value });
                    setDisabledButtons(false);
                  } else {
                    setDisabledButtons(true);
                    resetFirstFields();
                    resetThirdFields();
                    table.current.resetTable();
                  }
                },
              }}
              containerStyle={{
                width: "50%",
                marginBottom: "12px",
              }}
              datasource={[]}
              values={"RPCDNo"}
              display={"RPCDNo"}
            />
          )}
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
            }}
            label={{
              title: "Branch :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
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
            inputRef={BranchRef}
          />
        </div>
        <div
          className="first-field"
          style={{
            display: "flex",
            columnGap: "50px",
          }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
            }}
            label={{
              title: "PN NO :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "80px",
              },
            }}
            input={{
              disabled: true,
              type: "text",
              style: { width: "calc(100% - 80px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={PNNoRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "50%",
              marginBottom: "8px",
            }}
            label={{
              title: "Account Name :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "110px",
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
            inputRef={NameRef}
          />
        </div>
      </div>

      {/* ========== Table ======= */}
      <DataGridViewReact
        ref={table}
        columns={columns}
        rows={[]}
        containerStyle={{
          height: "180px",
        }}
        getSelectedItem={(rowItm: any, _: any, rowIdx: any) => {
          if (rowItm) {
            const isConfim = window.confirm(`Are you sure you want to delete?`);
            if (isConfim) {
              const tableData = table.current.getData();
              tableData.splice(rowIdx, 1);
              table.current.setDataFormated(tableData);
            }

            table.current.setSelectedRow(null);
            table.current.resetCheckBox();
          }
        }}
        onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
          if (e.code === "Delete" || e.code === "Backspace") {
          }
        }}
      />
      {/* ===========  third field  =========== */}
      <div
        style={{
          position: "relative",
          padding: "12px",
          border: "1px solid #d1d5db",
          marginTop: "10px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            position: "absolute",
            top: "-10px",
            left: "20px",
            background: "#F1F1F1",
            padding: "0 5px",
          }}
        >
          Fees and Charges
        </span>
        <div
          className="first-field"
          style={{
            display: "flex",
            columnGap: "50px",
          }}
        >
          <div
            className="first-field"
            style={{
              flex: 1,
              display: "flex",
              rowGap: "10px",
              flexDirection: "column",
            }}
          >
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Holding Fees :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                disabled: true,
                type: "text",
                style: { width: "calc(100% - 100px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={HoldingFeesRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Penalty Charge :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                disabled: true,
                type: "text",
                style: { width: "calc(100% - 100px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={PenaltyChargeRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Surplus:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                disabled: true,
                type: "text",
                style: { width: "calc(100% - 100px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={SurplusRef}
            />
            <SelectInput
              containerClassName="custom-input"
              label={{
                title: "Deducted to:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              selectRef={DeductedToRef}
              select={{
                disabled: true,
                style: { flex: 1, height: "22px" },
                defaultValue: "Non-VAT",
              }}
              containerStyle={{
                width: "100%",
                marginBottom: "12px",
              }}
              datasource={[
                { key: "", value: "" },
                { key: "Penalties", value: "Penalties" },
                { key: "Loan Amortization", value: "Loan Amortization" },
                {
                  key: "Loan Amort.-Other Charges",
                  value: "Loan Amort.-Other Charges",
                },
                { key: "Miscellaneous Income", value: "Miscellaneous Income" },
              ]}
              values={"value"}
              display={"key"}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Total :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                disabled: true,
                type: "text",
                style: { width: "calc(100% - 100px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={TotalRef}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SelectInput
              containerClassName="custom-input how-to-be-paid"
              label={{
                title: "How to be paid :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              selectRef={HowToBePaidRef}
              select={{
                disabled: true,
                style: { flex: 1, height: "22px" },
                defaultValue: "",
              }}
              containerStyle={{
                width: "50%",
                marginBottom: "12px",
              }}
              datasource={[
                { key: "", value: "" },
                { key: "Over-The-Counter", value: "Over-The-Counter" },
                { key: "Direct Deposit", value: "Direct Deposit" },
              ]}
              values={"value"}
              display={"key"}
            />
            <label
              htmlFor="remarks"
              style={{
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Name of Bank & Branch / Date & Time of deposit :
            </label>
            <TextAreaInput
              containerClassName="custom-input "
              label={{
                title: "",
                style: {
                  display: "none",
                },
              }}
              textarea={{
                disabled: true,
                rows: 4,
                style: { flex: 1 },
                id: "remarks",
                defaultValue: "",
                onChange: (e) => {},
              }}
              _inputRef={RemarksRef}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: "10px",
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px",
            columnGap: "10px",
          }}
        >
          <Button
            disabled={disabledButtons}
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            variant="contained"
            onClick={() => {
              modal.current.showModal();
              modal.current.setMode("Approve");
            }}
            color="success"
          >
            Approve
          </Button>
          <Button
            disabled={disabledButtons}
            sx={{
              height: "22px",
              fontSize: "11px",
            }}
            variant="contained"
            onClick={() => {
              modal.current.showModal();
              modal.current.setMode("Disapprove");
            }}
            color="error"
          >
            Disapprove
          </Button>
          <Button
            sx={{
              height: "22px",
              fontSize: "11px",
              backgroundColor: grey[700],
              "&:hover": {
                backgroundColor: grey[800],
              },
            }}
            variant="contained"
            onClick={() => {
              setDisabledButtons(true);
              resetFirstFields();
              resetThirdFields();
              table.current.resetTable();
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
const Modal = forwardRef(
  ({ handleOnSave, handleOnClose, getSelectedItem }: any, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("");
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const codeRef = useRef<HTMLInputElement>(null);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      setMode: (_mode: string) => {
        setMode(_mode);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {},
      mutate: () => {},
      closeDelay,
      mode,
    }));

    return showModal ? (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        {false && <Loading />}
        <div
          style={{
            height: blick ? "103px" : "100px",
            width: blick ? "403px" : "400px",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Enter Authentication Code:
            </span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                padding: "5px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <TextInput
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "Authentication Code:",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "140px",
                      display: "none",
                    },
                  }}
                  input={{
                    autoFocus: true,
                    type: "text",
                    style: { width: "100%" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        handleOnSave(mode, e.currentTarget.value);
                      }
                    },
                  }}
                  inputRef={codeRef}
                />
                <Button
                  sx={{
                    height: "22px",
                    fontSize: "11px",
                    marginTop: "10px",
                  }}
                  variant="contained"
                  onClick={() => handleOnSave(mode, codeRef.current?.value)}
                  color={mode === "Approve" ? "success" : "error"}
                >
                  Confirm {mode}
                </Button>
              </div>
            </div>
          </div>
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);
