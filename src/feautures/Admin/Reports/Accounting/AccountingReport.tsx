import { Button } from "@mui/material";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { useContext, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { format, setDate } from "date-fns";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";
import { wait } from "../../../../lib/wait";
import { Loading } from "../../../../components/Loading";

export default function AccountingReport() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [subsi, setSubsi] = useState("I.D No.");
  const [report, setReport] = useState("All Accounts");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const reportRef = useRef<HTMLSelectElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const _accountRef = useRef<HTMLInputElement>(null);
  const subsiRef = useRef<HTMLSelectElement>(null);

  const __subsiRef = useRef<any>(null);
  const _subsiRef = useRef<HTMLSelectElement>(null);
  const subsiTextRef = useRef<HTMLInputElement>(null);

  const dateRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const orderRef = useRef<HTMLSelectElement>(null);

  const {
    UpwardTableModalSearch: ChartAccountUpwardTableModalSearch,
    openModal: chartAccountOpenModal,
    closeModal: chartAccountCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/reports/accounting/report/get-chart-account",
    column: [
      { key: "Code", label: "Code", width: 80 },
      { key: "Title", label: "Title", width: 200 },
      {
        key: "Short_Name",
        label: "Short Name",
        width: 370,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (accountRef.current) {
            accountRef.current.value = rowItm[0];
          }
          if (_accountRef.current) {
            _accountRef.current.value = rowItm[1];
          }
          generateTitle({
            subsiInsurance: _subsiRef.current?.value,
            _account: rowItm[1],
            account: rowItm[0],
            subsi: subsiRef.current?.selectedIndex,
            subsiText: subsiTextRef.current?.value,
            dateValue:dateRef.current?.value,
            report: report,
          });
        });
        chartAccountCloseModal();
      }
    },
  });
  const { isLoading: isLoadingInsurance, mutate: mutateInsurance } =
    useMutation({
      mutationKey: "insurance",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          `/reports/accounting/report/get-list-of-insurance`,
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess(res) {
        if (res.data.success) {
          __subsiRef.current.setDataSource([
            { AccountCode: "ALL" },
            ...res.data.data,
          ]);
        }
      },
    });

  function generateTitle({
    subsiInsurance,
    _account,
    account,
    subsi,
    subsiText,
    dateValue,
    report,
  }: any) {
    wait(100).then(() => {
      if (report === "GL Account (Detailed)") {
        let txtReportTitleText = `UPWARD MANAGEMENT INSURANCE SERVICES\n ${subsiInsurance || subsiInsurance === "" || subsiInsurance === "ALL"? "": `(${subsiInsurance})\n`} Schedule of ${_account} ${subsi === 2 ? ` - ${subsiText}` : "" } (${account})\n${format(new Date(dateValue), "MM dd, yyyy")}`;
        setTitle(txtReportTitleText);
        return;
      }
      if (report === "All Accounts") {
        let txtReportTitleText = `UPWARD MANAGEMENT INSURANCE SERVICES\n ${subsiInsurance || subsiInsurance === "" || subsiInsurance === "ALL" ? "": `(${subsiInsurance})\n`}Schedule of Accounts\n${format(new Date(dateValue), "MM dd, yyyy")}`;
        setTitle(txtReportTitleText);
        return;
      }
    });
  }
  function generateReport() {}
  return (
    <>
      {isLoadingInsurance && <Loading />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: "100vh",
          backgroundColor: "#F1F1F1",
        }}
      >
        <div
          style={{
            border: "1px solid #94a3b8",
            width: "600px",
            height: "450px",
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            padding: "20px",
            boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
            }}
          >
            <div style={{ width: "250px", border: "1px solid red" }}></div>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                padding: "5px",
                rowGap: "7px",
              }}
            >
              <TextAreaInput
                containerStyle={{
                  marginBottom: "10px",
                }}
                label={{
                  title: "Title : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                    display: "none",
                  },
                }}
                textarea={{
                  rows: 7,
                  style: { flex: 1 },
                  value: title,
                  onChange: (e) => {
                    setTitle(e.currentTarget.value);
                  },
                }}
                _inputRef={titleRef}
              />
              <SelectInput
                label={{
                  title: "Report :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                selectRef={reportRef}
                select={{
                  value: report,
                  style: { width: "calc(100% - 90px)", height: "22px" },
                  defaultValue: "All Accounts",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                    }
                  },
                  onChange: (e) => {
                    setReport(e.currentTarget.value);
                    generateTitle({
                      subsiInsurance: _subsiRef.current?.value,
                      _account: _accountRef.current?.value,
                      account: accountRef.current?.value,
                      subsi: subsiRef.current?.selectedIndex,
                      subsiText: subsiTextRef.current?.value,
                      dateValue: dateRef.current?.value,
                      report: e.currentTarget.value,
                    });
                  },
                }}
                datasource={[
                  { key: "GL Account (Detailed)" },
                  { key: "All Accounts" },
                ]}
                values={"key"}
                display={"key"}
              />
              <TextInput
                label={{
                  title: "Account : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                input={{
                  disabled: report === "All Accounts",
                  className: "search-input-up-on-key-down",
                  type: "text",
                  value:"7.10.06",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      chartAccountOpenModal(e.currentTarget.value);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  },
                  style: { width: "calc(100% - 90px)" },
                }}
                icon={
                  <SearchIcon
                    sx={{
                      fontSize: "18px",
                    }}
                  />
                }
                disableIcon={report === "All Accounts"}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (accountRef.current) {
                    chartAccountOpenModal(accountRef.current.value);
                  }
                }}
                inputRef={accountRef}
              />
              <TextInput
                label={{
                  title: "",
                  style: {
                    display: "none",
                  },
                }}
                input={{
                  defaultValue:"Communications Expense",
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      // searchCashDisbursementOpenModal(e.currentTarget.value);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  },
                  style: { width: "100%" },
                }}
                inputRef={_accountRef}
              />

              <div
                style={{
                  display: "flex",
                  columnGap: "6px",
                  alignItems: "center",
                }}
              >
                <SelectInput
                  label={{
                    title: "Subsidiary :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  selectRef={subsiRef}
                  containerStyle={{ flex: 2 }}
                  select={{
                    style: { flex: 1, height: "22px" },
                    value: subsi,
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        e.preventDefault();
                      }
                    },
                    onChange: (e) => {
                      if (e.currentTarget.selectedIndex === 2) {
                        mutateInsurance({});
                      }
                      setSubsi(e.target.value);
                    },
                  }}
                  datasource={[
                    { key: "Sub Acct" },
                    { key: "I.D No." },
                    { key: "Insurance" },
                  ]}
                  values={"key"}
                  display={"key"}
                />
                {subsi !== "Insurance" ? (
                  <TextInput
                    containerStyle={{
                      flex: 1,
                    }}
                    label={{
                      title: "",
                      style: {
                        display: "none",
                      },
                    }}
                    input={{
                      type: "text",
                      readOnly: true,
                      defaultValue: "ALL",
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === "NumpadEnter") {
                          e.preventDefault();
                          // searchCashDisbursementOpenModal(e.currentTarget.value);
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      },
                      style: { width: "100px" },
                    }}
                    inputRef={subsiTextRef}
                  />
                ) : (
                  <SelectInput
                    label={{
                      title: "",
                      style: {
                        display: "none",
                      },
                    }}
                    ref={__subsiRef}
                    selectRef={_subsiRef}
                    containerStyle={{
                      flex: 1,
                    }}
                    select={{
                      style: { flex: 1, height: "22px" },
                      defaultValue: "ALL",
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                          e.preventDefault();
                        }
                      },
                      onChange: (e) => {
                        generateTitle({
                          subsiInsurance: e.currentTarget.value,
                          _account: _accountRef.current?.value,
                          account: accountRef.current?.value,
                          subsi: subsiRef.current?.selectedIndex,
                          subsiText: subsiTextRef.current?.value,
                          dateValue: dateRef.current?.value,
                          report: report,
                        });
                      },
                    }}
                    datasource={[]}
                    values={"AccountCode"}
                    display={"AccountCode"}
                  />
                )}
              </div>
              <TextInput
                label={{
                  title: "Date : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                input={{
                  type: "date",
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      // searchCashDisbursementOpenModal(e.currentTarget.value);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  },
                  onChange: (e) => {
                    generateTitle({
                      subsiInsurance: _subsiRef.current?.value,
                      _account: _accountRef.current?.value,
                      account: accountRef.current?.value,
                      subsi: subsiRef.current?.selectedIndex,
                      subsiText: subsiTextRef.current?.value,
                      dateValue: e.currentTarget.value,
                      report: report,
                    });
                  },
                  style: { width: "calc(100% - 90px)" },
                }}
                inputRef={dateRef}
              />
              <fieldset
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "5px",
                  position: "relative",
                  width: "100%",
                  height: "auto",
                  margin: "10px 0px",
                  padding: "15px",
                  display: "flex",
                  rowGap: "10px",
                  flexDirection: "column",
                }}
              >
                <SelectInput
                  label={{
                    title: "Sort :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  selectRef={sortRef}
                  select={{
                    style: { width: "calc(100% - 90px)", height: "22px" },
                    defaultValue: "All Accounts",
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        e.preventDefault();
                      }
                    },
                  }}
                  datasource={[{ key: "Name" }, { key: "Sub Account/I.D No." }]}
                  values={"key"}
                  display={"key"}
                />
                <SelectInput
                  label={{
                    title: "Order :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  selectRef={orderRef}
                  select={{
                    style: { width: "calc(100% - 90px)", height: "22px" },
                    defaultValue: "All Accounts",
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        e.preventDefault();
                      }
                    },
                  }}
                  datasource={[{ key: "Ascending" }, { key: "Descending" }]}
                  values={"key"}
                  display={"key"}
                />
              </fieldset>
              <Button
                onClick={generateReport}
                color="success"
                variant="contained"
                sx={{ height: "22px", fontSize: "12px", width: "100%" }}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ChartAccountUpwardTableModalSearch />
    </>
  );
}
