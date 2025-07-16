import { useContext, useRef, useState } from "react";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";

import { Button } from "@mui/material";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import { orange } from "@mui/material/colors";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { LoadingButton } from "@mui/lab";
import { wait } from "@testing-library/user-event/dist/utils";
import { addMonths, differenceInDays, format } from "date-fns";
import { Loading } from "../../../../components/Loading";
import Swal from "sweetalert2";
import PageHelmet from "../../../../components/Helmet";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import "../../../../style/monbileview/accounting/checkpostponement.css";
import { formatNumber } from "./ReturnCheck";

const columns = [
  { key: "ln", label: "#", width: 40 },
  { key: "CheckNo", label: "Check No", width: 120 },
  { key: "Bank", label: "Bank", width: 200 },
  { key: "Amount", label: "Amount", width: 120, type: "number" },
  {
    key: "OldDepositDate",
    label: "Old Deposit Date",
    width: 200,
    type: "date",
  },
  { key: "NewDate", label: "New Deposit Date", width: 200, type: "date" },
  { key: "Penalty", label: "Penalty", width: 120 },
  { key: "Datediff", label: "Number of Days", width: 120, type: "number" },
  { key: "Reason", label: "Reason", width: 200 },
];

export default function ChekPostponementRequest() {
  const { myAxios, user } = useContext(AuthContext);
  const table = useRef<any>(null);
  const [inputType, setInpuType] = useState("text");
  const [reason, setReason] = useState("");
  const [paid, setPaid] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mode, setMode] = useState("");

  // first field
  const RPCDNoRef = useRef<HTMLInputElement>(null);
  const BranchRef = useRef<HTMLInputElement>(null);
  const PNNoRef = useRef<HTMLInputElement>(null);
  const NameRef = useRef<HTMLInputElement>(null);

  // second field
  const _CheckNoRef = useRef<any>(null);
  const CheckNoRef = useRef<HTMLSelectElement>(null);
  const NewDateRef = useRef<HTMLInputElement>(null);
  const DateRef = useRef<HTMLInputElement>(null);
  const ReasonRef = useRef<HTMLTextAreaElement>(null);
  const BankRef = useRef<HTMLInputElement>(null);
  const AmpountRef = useRef<HTMLInputElement>(null);

  // third field
  const HoldingFeesRef = useRef<HTMLInputElement>(null);
  const PenaltyChargeRef = useRef<HTMLInputElement>(null);
  const SurplusRef = useRef<HTMLInputElement>(null);
  const DeductedToRef = useRef<HTMLSelectElement>(null);
  const TotalRef = useRef<HTMLInputElement>(null);
  const HowToBePaidRef = useRef<HTMLSelectElement>(null);
  const RemarksRef = useRef<HTMLTextAreaElement>(null);

  const pnnoModalRef = useRef<any>(null);
  const rcpnModalRef = useRef<any>(null);

  // load auto id
  const { isLoading: isLoadingLoadAutoIdData, refetch: loadARefetch } =
    useQuery({
      queryKey: "auto-id",
      queryFn: async () =>
        await myAxios.get(
          `/task/accounting/check-postponement/request/auto-id`,
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

        const dt = response?.data.data;
        if (dt.length > 0) {
          wait(100).then(() => {
            if (RPCDNoRef.current) {
              RPCDNoRef.current.value = `HORPCD${dt[0].Year}${dt[0].Count}`;
            }
          });
        }
      },
      refetchOnWindowFocus: false,
    });
  //load-check
  const { isLoading: isLoadingChecks, mutate: mutateChecks } = useMutation({
    mutationKey: "load-checks",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/check-postponement/request/load-checks`,
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
      console.log(response);
      _CheckNoRef.current.setDataSource(response?.data.data);
    },
  });
  //load check details
  const { isLoading: isLoadingCheckDetails, mutate: mutateCheckDetails } =
    useMutation({
      mutationKey: "load-check-details",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/check-postponement/request/load-checks-details`,
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
        const res = response?.data.data;
        if (res.length > 0) {
          setInpuType("date");
          setTimeout(() => {
            if (DateRef.current) {
              DateRef.current.value = format(
                new Date(res[0].CheckDate),
                "yyyy-MM-dd"
              );
            }
            if (BankRef.current) {
              BankRef.current.value = res[0].Bank;
            }
            if (AmpountRef.current) {
              AmpountRef.current.value = res[0].Amount;
            }
          }, 100);
        } else {
          setInpuType("text");
          setTimeout(() => {
            if (DateRef.current) {
              DateRef.current.value = "";
            }
            if (BankRef.current) {
              BankRef.current.value = "";
            }
            if (AmpountRef.current) {
              AmpountRef.current.value = "";
            }
          }, 100);
        }
      },
    });

  //load check RPCDNo
  const {
    isLoading: isLoadingLoadRPCDNoDetails,
    mutate: mutateLoadRPCDNoDetails,
  } = useMutation({
    mutationKey: "load-rpcd-details",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/check-postponement/request/load-rpcd-details`,
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
      const selected = response.data.data;
      wait(100).then(() => {
        if (PNNoRef.current) {
          PNNoRef.current.value = selected[0].PNNO;
        }
        if (NameRef.current) {
          NameRef.current.value = selected[0].Name;
        }
        if (HowToBePaidRef.current) {
          HowToBePaidRef.current.value = selected[0].PaidVia;
        }
        if (BranchRef.current) {
          BranchRef.current.value = "HO";
        }
        if (RemarksRef.current) {
          RemarksRef.current.value = selected[0].PaidInfo;
        }
        if (SurplusRef.current) {
          SurplusRef.current.value = selected[0].Surplus;
        }
        if (DeductedToRef.current) {
          DeductedToRef.current.value = selected[0].Deducted_to;
        }

        const data = selected.map((itm: any, idx: number) => {
          const Datediff = differenceInDays(
            new Date(itm.NewCheckDate as any),
            new Date(itm.OldCheckDate)
          );
          return {
            ln: `${idx + 1}`,
            OldDepositDate: itm.OldCheckDate,
            Bank: itm.Bank,
            CheckNo: itm.CheckNo,
            Amount: parseFloat(
              itm.check_Amnt.toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            NewDate: itm.NewCheckDate,
            Reason: itm.Reason,
            Datediff,
          };
        });

        table.current.setData(data);
      });
    },
  });

  // check add row
  const { isLoading: isLoadingCheckIsPending, mutate: mutateCheckIsPending } =
    useMutation({
      mutationKey: "check-is-pending",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/task/accounting/check-postponement/request/check-is-pending`,
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
        const res = response?.data.data;
        if (res.length > 0) {
          return alert(` Pending Request \nRPCD No.: ${res[0].RPCDNo}!`);
        }
        const tableData = table.current.getData();
        if (
          tableData.some((itm: any) => itm[1] === CheckNoRef.current?.value)
        ) {
          return alert("Already added");
        }
        const Datediff = differenceInDays(
          new Date(NewDateRef.current?.value as any),
          new Date(DateRef.current?.value as any)
        );

        if (Datediff <= 0) {
          return alert("Invalid date for deposit");
        }
        const newData = [
          ...tableData,
          {
            ln: tableData.length + 1,
            CheckNo: CheckNoRef.current?.value,
            Bank: BankRef.current?.value,
            Amount: AmpountRef.current?.value,
            OldDepositDate: DateRef.current?.value,
            NewDate: NewDateRef.current?.value,
            Penalty: "",
            Datediff,
            Reason: ReasonRef.current?.value,
          },
        ];
        table.current.setData(newData);
        resetSecondFields();
      },
    });
  // saving add
  const { isLoading: isLoadingSave, mutate: mutateSave } = useMutation({
    mutationKey: "saving",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/check-postponement/request/saving`,
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
        resetFirstFields();
        resetSecondFields();
        resetThirdFields();
        table.current.resetTable();
        setMode("");
      });
      return Swal.fire({
        position: "center",
        icon: "success",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  // saving edit
  const { isLoading: isLoadingEdit, mutate: mutateEdit } = useMutation({
    mutationKey: "edit",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        `/task/accounting/check-postponement/request/edit`,
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
        resetFirstFields();
        resetSecondFields();
        resetThirdFields();
        table.current.resetTable();
        setMode("");
      });

      return Swal.fire({
        position: "center",
        icon: "success",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  function handleAddCheck() {
    if (
      (BankRef.current && BankRef.current.value === "") ||
      (BankRef.current && BankRef.current.value === null) ||
      (BankRef.current && BankRef.current.value === undefined) ||
      (CheckNoRef.current && CheckNoRef.current.value === "") ||
      (CheckNoRef.current && CheckNoRef.current.value === null) ||
      (CheckNoRef.current && CheckNoRef.current.value === undefined)
    ) {
      return alert("Incomplete details!");
    }

    mutateCheckIsPending({ checkNo: CheckNoRef.current?.value });
  }
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
  function resetSecondFields() {
    if (CheckNoRef.current) {
      CheckNoRef.current.value = "";
    }

    if (DateRef.current) {
      DateRef.current.value = "";
    }
    if (ReasonRef.current) {
      ReasonRef.current.value = "";
    }
    if (BankRef.current) {
      BankRef.current.value = "";
    }
    if (AmpountRef.current) {
      AmpountRef.current.value = "";
    }
    setInpuType("text");
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
    setPaid("");
    setRemarks("");
  }
  function handleOnSave() {
    const data = table.current.getData();
    if (mode === "add") {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, save it!",
      }).then((result) => {
        if (result.isConfirmed) {
          mutateSave({
            RPCDNoRef: RPCDNoRef.current?.value,
            NameRef: NameRef.current?.value,
            PNNoRef: PNNoRef.current?.value,
            HoldingFeesRef: HoldingFeesRef.current?.value,
            PenaltyChargeRef: PenaltyChargeRef.current?.value,
            HowToBePaidRef: HowToBePaidRef.current?.value,
            RemarksRef: RemarksRef.current?.value,
            BranchRef: BranchRef.current?.value,
            SurplusRef: SurplusRef.current?.value,
            DeductedToRef: DeductedToRef.current?.value,
            Prepared_By: user?.username,
            data: JSON.stringify(data),
          });
        }
      });
    } else if (mode === "edit") {
      mutateEdit({
        RPCDNoRef: RPCDNoRef.current?.value,
        NameRef: NameRef.current?.value,
        PNNoRef: PNNoRef.current?.value,
        HoldingFeesRef: HoldingFeesRef.current?.value,
        PenaltyChargeRef: PenaltyChargeRef.current?.value,
        HowToBePaidRef: HowToBePaidRef.current?.value,
        RemarksRef: RemarksRef.current?.value,
        BranchRef: BranchRef.current?.value,
        SurplusRef: SurplusRef.current?.value,
        DeductedToRef: DeductedToRef.current?.value,
        Prepared_By: user?.username,
        data: JSON.stringify(data),
      });
    }
  }

  return (
    <>
      <PageHelmet title="Check Postponement Request" />
      <div
        className="main"
        style={{
          padding: "10px",
          background: "#F1F1F1",
          height: "100%",
        }}
      >
        {(isLoadingCheckIsPending ||
          isLoadingSave ||
          isLoadingLoadRPCDNoDetails ||
          isLoadingEdit) && <Loading />}
        {/* ===========  first field  =========== */}
        <div
          className="second-field"
          style={{
            position: "relative",
            padding: "12px",
            borderLeft: "1px solid #d1d5db",
            borderRight: "1px solid #d1d5db",
            borderTop: "1px solid #d1d5db",
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
            {mode === "edit" ? (
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "50%",
                  marginBottom: "8px",
                }}
                label={{
                  title: "RPCD no. :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "calc(100% - 80px) " },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      rcpnModalRef.current.openModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (PNNoRef.current) {
                    rcpnModalRef.current.openModal(PNNoRef.current.value);
                  }
                }}
                inputRef={RPCDNoRef}
              />
            ) : isLoadingLoadAutoIdData ? (
              <LoadingButton loading={isLoadingLoadAutoIdData} />
            ) : (
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "50%",
                  marginBottom: "8px",
                }}
                label={{
                  title: "RPCD no. :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: true,
                  type: "text",
                  style: { width: "calc(100% - 80px) " },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={RPCDNoRef}
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
                disabled: mode === "" || mode === "edit",
                type: "text",
                style: { width: "calc(100% - 80px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    pnnoModalRef.current.openModal(e.currentTarget.value);
                  }
                },
              }}
              disableIcon={mode === "" || mode === "edit"}
              icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (PNNoRef.current) {
                  pnnoModalRef.current.openModal(PNNoRef.current.value);
                }
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
        {/* ===========  second field  =========== */}
        <div
          className="second-field"
          style={{
            position: "relative",
            padding: "12px",
            border: "1px solid #d1d5db",
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
            Check Details :
          </span>
          <div
            className="first-field"
            style={{
              display: "flex",
              columnGap: "50px",
            }}
          >
            {isLoadingLoadAutoIdData ? (
              <LoadingButton loading={isLoadingChecks} />
            ) : (
              <SelectInput
                containerClassName="custom-input"
                ref={_CheckNoRef}
                label={{
                  title: "Check No. :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                selectRef={CheckNoRef}
                select={{
                  disabled: mode === "",
                  style: { flex: 1, height: "22px" },
                  defaultValue: "",
                  onChange: (e) => {
                    mutateCheckDetails({
                      checkNo: e.target.value,
                      PNNo: PNNoRef.current?.value,
                    });
                  },
                }}
                containerStyle={{
                  width: "50%",
                  marginBottom: "12px",
                }}
                datasource={[]}
                values={"CheckNo"}
                display={"CheckNo"}
              />
            )}
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
                marginBottom: "8px",
              }}
              label={{
                title: "New Date :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "110px",
                },
              }}
              input={{
                disabled: mode === "",
                type: "date",
                defaultValue: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
                style: { width: "calc(100% - 100px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={NewDateRef}
            />
          </div>
          <div
            className="first-field"
            style={{
              display: "flex",
              columnGap: "50px",
              width: "100%",
            }}
          >
            {isLoadingCheckDetails ? (
              <span>Loading...</span>
            ) : (
              <div
                className="first-field"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                    marginBottom: "8px",
                  }}
                  label={{
                    title: "Date :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "80px",
                    },
                  }}
                  input={{
                    disabled: true,
                    type: inputType,
                    style: { width: "calc(100% - 80px)" },
                    defaultValue: "",
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                      }
                    },
                  }}
                  inputRef={DateRef}
                />
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                    marginBottom: "8px",
                  }}
                  label={{
                    title: "Bank :",
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
                  inputRef={BankRef}
                />
              </div>
            )}
            <div
              className="first-field reason"
              style={{
                width: "50%",
              }}
            >
              <TextAreaInput
                containerClassName="custom-input"
                label={{
                  title: "Reason : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "110px",
                  },
                }}
                textarea={{
                  disabled: mode === "",
                  rows: 3,
                  style: { flex: 1 },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      //  refDate.current?.focus()
                    }
                  },
                  onChange: (e) => {
                    setReason(e.target.value);
                  },
                }}
                _inputRef={ReasonRef}
              />
            </div>
          </div>
          <div
            className="first-field row-gap"
            style={{
              display: "flex",
              columnGap: "50px",
              justifyContent: "space-between",
            }}
          >
            {isLoadingCheckDetails ? (
              <span>Loading...</span>
            ) : (
              <TextFormatedInput
                containerClassName="custom-input"
                label={{
                  title: "Amount : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                containerStyle={{
                  width: "50%",
                }}
                input={{
                  disabled: true,
                  type: "text",
                  style: { width: "calc(100% - 105px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={AmpountRef}
              />
            )}
            <Button
              disabled={reason === ""}
              sx={{
                height: "22px",
                fontSize: "11px",
              }}
              variant="contained"
              onClick={handleAddCheck}
              color="success"
            >
              Add
            </Button>
          </div>
        </div>
        {/* ========== Table ======= */}
        <div
          style={{
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
          }}
        >
          <DataGridViewReactUpgraded
            ref={table}
            fixedRowCount={7}
            columns={columns}
            DisplayData={({ row, col }: any) => {
              return (
                <>
                  {col.key.trim() === "OldDepositDate" || col.key.trim() === "NewDate"
                    ? format(new Date(row[col.key]), "MM/dd/yyyy")
                    :col.key.trim() === "Amount"  ? 
                    formatNumber(parseFloat(row[col.key]))
                    :
                    row[col.key]}
                </>
              );
            }}
            handleSelectionChange={async (rowItm: any) => {
              if (rowItm) {
                const rowIdx = table.current.getSelectedRow();
                const isConfim = window.confirm(
                  `Are you sure you want to delete?`
                );
                if (isConfim) {
                  const tableData = table.current.getData();
                  tableData.splice(rowIdx, 1);
                  table.current.setData(tableData);
                }

                table.current.setSelectedRow(null);
              } else {
              }
            }}
          />
        </div>

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
            className="first-field "
            style={{
              display: "flex",
              columnGap: "50px",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                rowGap: "10px",
                flexDirection: "column",
              }}
            >
              <TextFormatedInput
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
                  disabled: mode === "",
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
                  disabled: mode === "",
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
                  disabled: mode === "",
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
                  disabled: mode === "",
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
                  {
                    key: "Miscellaneous Income",
                    value: "Miscellaneous Income",
                  },
                ]}
                values={"value"}
                display={"key"}
              />
              <TextFormatedInput
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
                  disabled: mode === "",
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
            <div
              className="container-how-to-be-paid"
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
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
                  disabled: mode === "",
                  style: { flex: 1, height: "22px" },
                  value: paid,
                  onChange: (e) => {
                    setPaid(e.target.value);
                    setRemarks("");
                  },
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
                label={{
                  title: "",
                  style: {
                    display: "none",
                  },
                }}
                textarea={{
                  disabled:
                    mode === "" || paid === "" || paid === "Over-The-Counter",
                  rows: 4,
                  style: { flex: 1 },
                  id: "remarks",
                  value: remarks,
                  onChange: (e) => {
                    setRemarks(e.target.value);
                  },
                }}
                _inputRef={RemarksRef}
              />
              <div
                className="desktop-action-buttons"
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  columnGap: "7px",
                }}
              >
                <Button
                  disabled={mode !== ""}
                  variant="contained"
                  color="info"
                  style={{
                    height: "25px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    loadARefetch();
                    setMode("add");
                  }}
                >
                  Add
                </Button>
                <Button
                  disabled={mode !== ""}
                  variant="contained"
                  color="success"
                  style={{
                    height: "25px",
                    fontSize: "12px",
                    background: orange[800],
                  }}
                  onClick={(e) => {
                    setMode("edit");
                    if (RPCDNoRef.current) {
                      RPCDNoRef.current.value = "";
                    }
                  }}
                >
                  edit
                </Button>
                <Button
                  disabled={
                    mode === "" ||
                    paid === "" ||
                    (paid === "Direct Deposit" && remarks === "")
                  }
                  variant="contained"
                  color="success"
                  style={{
                    height: "25px",
                    fontSize: "12px",
                  }}
                  onClick={handleOnSave}
                >
                  save
                </Button>
                <Button
                  disabled={mode === ""}
                  variant="contained"
                  color="error"
                  style={{
                    height: "25px",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    setMode("");
                    resetFirstFields();
                    resetSecondFields();
                    resetThirdFields();
                    table.current.resetTable();
                  }}
                >
                  cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="mobile-action-buttons"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            columnGap: "7px",
          }}
        >
          <Button
            disabled={mode !== ""}
            variant="contained"
            color="info"
            style={{
              height: "25px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              loadARefetch();
              setMode("add");
            }}
          >
            Add
          </Button>
          <Button
            disabled={mode !== ""}
            variant="contained"
            color="success"
            style={{
              height: "25px",
              fontSize: "12px",
              background: orange[800],
            }}
            onClick={(e) => {
              setMode("edit");
              if (RPCDNoRef.current) {
                RPCDNoRef.current.value = "";
              }
            }}
          >
            edit
          </Button>
          <Button
            disabled={
              mode === "" ||
              paid === "" ||
              (paid === "Direct Deposit" && remarks === "")
            }
            variant="contained"
            color="success"
            style={{
              height: "25px",
              fontSize: "12px",
            }}
            onClick={handleOnSave}
          >
            save
          </Button>
          <Button
            disabled={mode === ""}
            variant="contained"
            color="error"
            style={{
              height: "25px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              setMode("");
              resetFirstFields();
              resetSecondFields();
              resetThirdFields();
              table.current.resetTable();
            }}
          >
            cancel
          </Button>
        </div>
        <div
          className="add-height"
          style={{ height: "30px", display: "none" }}
        ></div>
      </div>
      {/* search PNNo Details */}
      <UpwardTableModalSearch
        ref={pnnoModalRef}
        size="medium"
        link={"/task/accounting/check-postponement/request/load-pnno"}
        column={[
          { key: "PNo", label: "PNo", width: 150 },
          { key: "Name", label: "Name", width: 300 },
          {
            key: "BName",
            label: "Branch",
            width: 100,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            wait(100).then(() => {
              mutateChecks({
                PNNo: rowItm.PNo,
              });
              if (BranchRef.current) {
                BranchRef.current.value = rowItm.BName;
              }
              if (PNNoRef.current) {
                PNNoRef.current.value = rowItm.PNo;
              }
              if (NameRef.current) {
                NameRef.current.value = rowItm.Name;
              }
            });
            pnnoModalRef.current.closeModal();
          }
        }}
      />
      {/* search RCPNo Edit */}
      <UpwardTableModalSearch
        ref={rcpnModalRef}
        size="medium"
        link={"/task/accounting/check-postponement/request/load-rpcdno"}
        column={[{ key: "RPCDNo", label: "Name", width: 300 }]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            if (RPCDNoRef.current) {
              RPCDNoRef.current.value = rowItm.RPCDNo;
            }
            mutateLoadRPCDNoDetails({ RPCDNo: rowItm.RPCDNo });
            rcpnModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
}
