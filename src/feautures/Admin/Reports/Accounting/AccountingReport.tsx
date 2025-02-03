import { Button } from "@mui/material";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { useContext, useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";
import { wait } from "../../../../lib/wait";
import { Loading } from "../../../../components/Loading";

const buttons = [
  { label: "Chart of Accounts", id: 0 },
  { label: "Schedule of Account", id: 1 },
  { label: "Subsidiary Ledger", id: 2 },
  { label: "Trial Balance", id: 3 },
  { label: "Income Statement -Long", id: 4 },
  { label: "Balance Sheet -Long", id: 5 },
  { label: "General edger", id: 6 },
  { label: "Abstract of Collections", id: 7 },
  { label: "Deposited Collections", id: 8 },
  { label: "Returned Checks", id: 9 },
  { label: "Post Dated Checks Registry", id: 10 },
  { label: "Petty Cash Fund Disbursement", id: 11 },
  { label: "Cash Disbursement Book - CDB", id: 12 },
  { label: "General Journal Book - GJB", id: 13 },
  { label: "Production Book - PB", id: 14 },
  { label: "VAT Book - VB", id: 15 },
  { label: "Aging Account", id: 16 },
  { label: "Cancel Accounts", id: 17 },
  { label: "Fully Paid Accounts", id: 18 },
  { label: "Summary of Expenses", id: 19 },
  { label: "List of Purchase", id: 20 },
  { label: "Checklist on Month-End Accrual", id: 21 },
];

export default function AccountingReport() {
  const { user } = useContext(AuthContext);
  const [buttonList, setButtonList] = useState(buttons);
  const [buttonSelected, setButtonSelected] = useState(1);

  useEffect(() => {
    if (user) {
      if (user.userAccess === "ACCOUNTING_CHECKS") {
        setButtonList([{ label: "Post Dated Checks Registry", id: 1 }]);
      }
    }
  }, [user]);
  return (
    <>
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
              columnGap: "10px",
            }}
          >
            <div
              style={{
                width: "250px",
                background: "white",
                display: "flex",
                flexDirection: "column",
                rowGap: "2px",
                position: "relative",
              }}
            >
              <span
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  padding: "5px",
                }}
              >
                *** ACCOUNTING ****
              </span>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "380px",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                >
                  {buttonList.map((itm, idx) => {
                    return (
                      <>
                        {itm.id === 1 && <div style={{ height: "15px" }}></div>}
                        {itm.id === 5 && <div style={{ height: "15px" }}></div>}
                        {itm.id === 9 && <div style={{ height: "15px" }}></div>}
                        {itm.id === 10 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        {itm.id === 15 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        {itm.id === 19 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        {itm.id === 21 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        <button
                          key={idx}
                          style={{
                            fontSize: "12px",
                            border: "none",
                            background:
                              buttonSelected === itm.id
                                ? "#0076d7"
                                : "transparent",
                            color:
                              buttonSelected === itm.id ? "white" : "black",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setButtonSelected(itm.id);
                          }}
                        >
                          {itm.label}
                        </button>
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
            {buttonSelected === 1 && <FormScheduleAccount />}
            {buttonSelected === 2 && <FormSubsidiaryLedger />}
            {buttonSelected === 10 && <FormPostDatedCheckRegistry />}
          </div>
        </div>
      </div>
    </>
  );
}

function FormScheduleAccount() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState(
    generateTitle({
      report: "All Accounts",
      subsiText: "ALL",
      insuarnceIndex: 0,
      insurance: "ALL",
      dateValue: format(new Date(), "MMMM dd, yyyy"),
      account: "",
      accountTitle: "",
    })
  );
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

          setTitle(
            generateTitle({
              report,
              subsiText: subsiTextRef.current?.value || "",
              insuarnceIndex: _subsiRef.current?.selectedIndex,
              insurance: _subsiRef.current?.value,
              dateValue: dateRef.current?.value,
              account: rowItm[0],
              accountTitle: rowItm[1],
            })
          );
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
    report,
    subsiText,
    insuarnceIndex,
    insurance,
    dateValue,
    account,
    accountTitle,
  }: any) {
    const _title =
      user?.department === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";
    if (report === "GL Account (Detailed)") {
      let txtReportTitleText = `${_title}${
        subsiText === "" || subsiText === "ALL" ? "" : `\n(${subsiText})`
      }\nSchedule of ${accountTitle} ${` - ${
        insurance ? insurance : ""
      }`} (${account})\n${format(new Date(dateValue), "MMMM dd, yyyy")}`;
      // setTitle(txtReportTitleText);
      return txtReportTitleText;
    }
    if (report === "All Accounts") {
      let txtReportTitleText = `${_title}${
        subsiText === "" || subsiText === "ALL" ? "" : `\n(${subsiText})`
      }\nSchedule of Accounts\n${format(new Date(dateValue), "MMMM dd, yyyy")}`;
      // setTitle(txtReportTitleText);
      return txtReportTitleText;
    }
  }

  function generateReport() {
    mutateGenerateReport({
      title,
      report: reportRef.current?.value,
      account: accountRef.current?.value,
      accountName: _accountRef.current?.value,
      subsi: subsiRef.current?.selectedIndex,
      subsiText: subsiTextRef.current?.value,
      insurance: _subsiRef.current?.value || "",
      date: dateRef.current?.value,
      sort: sortRef.current?.selectedIndex,
      order: sortRef.current?.selectedIndex,
    });
  }

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/reports/accounting/report/generate-report-schedule-of-account",
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
        console.log(response);

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        // window.open(pdfUrl);
        var newTab = window.open();
        if (newTab) {
          newTab.document.write("<!DOCTYPE html>");
          newTab.document.write(
            "<html><head><title>New Tab with iframe</title></head>"
          );
          newTab.document.write(
            '<body style="width:100vw;height:100vh;padding:0;margin:0;box-sizing:border-box;">'
          );
          newTab.document.write(
            `<iframe style="border:none;outline:none;padding:0;margin:0" src="${pdfUrl}" width="99%" height="99%"></iframe>`
          );

          newTab.document.write("</body></html>");
          // Optional: Close the document stream after writing
          newTab.document.close();
        }
      },
    });

  return (
    <>
      {(isLoadingInsurance || isLoadingGenerateReport) && <Loading />}
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

              setTitle(
                generateTitle({
                  report: e.currentTarget.value,
                  subsiText: subsiTextRef.current?.value || "",
                  insuarnceIndex: _subsiRef.current?.selectedIndex,
                  insurance: _subsiRef.current?.value,
                  dateValue: dateRef.current?.value,
                  account: accountRef.current?.value,
                  accountTitle: _accountRef.current?.value,
                })
              );
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
            className: "search-input-up-on-key-down",
            type: "text",
            value: "7.10.06",
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
            readOnly: true,
            defaultValue: "Communications Expense",
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

                setTitle(
                  generateTitle({
                    report,
                    subsiText: subsiTextRef.current?.value || "",
                    insuarnceIndex: _subsiRef.current?.selectedIndex,
                    insurance: _subsiRef.current?.value,
                    dateValue: dateRef.current?.value,
                    account: accountRef.current?.value,
                    accountTitle: _accountRef.current?.value,
                  })
                );
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
                onChange: (e) => {
                  setTitle(
                    generateTitle({
                      report,
                      subsiText: e.currentTarget.value || "",
                      insuarnceIndex: _subsiRef.current?.selectedIndex,
                      insurance: _subsiRef.current?.value,
                      dateValue: dateRef.current?.value,
                      account: accountRef.current?.value,
                      accountTitle: _accountRef.current?.value,
                    })
                  );
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
                  setTitle(
                    generateTitle({
                      report,
                      subsiText: subsiTextRef.current?.value || "",
                      insuarnceIndex: e.currentTarget.selectedIndex,
                      insurance: e.currentTarget.value,
                      dateValue: dateRef.current?.value,
                      account: accountRef.current?.value,
                      accountTitle: _accountRef.current?.value,
                    })
                  );
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
              setTitle(
                generateTitle({
                  report,
                  subsiText: subsiTextRef.current?.value || "",
                  insuarnceIndex: _subsiRef.current?.selectedIndex,
                  insurance: _subsiRef.current?.value,
                  dateValue: e.currentTarget.value,
                  account: accountRef.current?.value,
                  accountTitle: _accountRef.current?.value,
                })
              );
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
      <ChartAccountUpwardTableModalSearch />
    </>
  );
}
function FormSubsidiaryLedger() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState(
    generateTitle({
      report: "All Accounts",
      subsiText: "ALL",
      insuarnceIndex: 0,
      insurance: "ALL",
      dateValue: format(new Date(), "MMMM dd, yyyy"),
      account: "",
      accountTitle: "",
    })
  );
  const [subsi, setSubsi] = useState("I.D No.");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const reportRef = useRef<HTMLSelectElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const _accountRef = useRef<HTMLInputElement>(null);
  const subsiRef = useRef<HTMLSelectElement>(null);

  const __subsiRef = useRef<any>(null);
  const _subsiRef = useRef<HTMLSelectElement>(null);
  const subsiTextRef = useRef<HTMLInputElement>(null);

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  
  const formatRef = useRef<HTMLSelectElement>(null);
  const fieldRef = useRef<HTMLSelectElement>(null);

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
    report,
    subsiText,
    insuarnceIndex,
    insurance,
    dateValue,
    account,
    accountTitle,
  }: any) {
    const _title =
      user?.department === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";
    if (report === "GL Account (Detailed)") {
      let txtReportTitleText = `${_title}\n ${
        subsiText === "" || subsiText === "ALL" ? "" : `(${subsiText})\n`
      }Schedule of ${accountTitle} ${` - ${
        insurance ? insurance : ""
      }`} (${account})\n${format(new Date(dateValue), "MMMM dd, yyyy")}`;
      // setTitle(txtReportTitleText);
      return txtReportTitleText;
    }
    if (report === "All Accounts") {
      let txtReportTitleText = `${_title}\n ${
        subsiText === "" || subsiText === "ALL" ? "" : `(${subsiText})\n`
      }Schedule of Accounts\n${format(new Date(dateValue), "MMMM dd, yyyy")}`;
      // setTitle(txtReportTitleText);
      return txtReportTitleText;
    }
  }

  function generateReport() {
    mutateGenerateReport({
      title,
      report: reportRef.current?.value,
      account: accountRef.current?.value,
      accountName: _accountRef.current?.value,
      subsi: subsiRef.current?.selectedIndex,
      subsiText: subsiTextRef.current?.value,
      insurance: _subsiRef.current?.value || "",
      date: dateFromRef.current?.value,
      sort: formatRef.current?.selectedIndex,
      order: formatRef.current?.selectedIndex,
    });
  }

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/reports/accounting/report/generate-report-schedule-of-account",
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
        console.log(response);

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        // window.open(pdfUrl);
        var newTab = window.open();
        if (newTab) {
          newTab.document.write("<!DOCTYPE html>");
          newTab.document.write(
            "<html><head><title>New Tab with iframe</title></head>"
          );
          newTab.document.write(
            '<body style="width:100vw;height:100vh;padding:0;margin:0;box-sizing:border-box;">'
          );
          newTab.document.write(
            `<iframe style="border:none;outline:none;padding:0;margin:0" src="${pdfUrl}" width="99%" height="99%"></iframe>`
          );

          newTab.document.write("</body></html>");
          // Optional: Close the document stream after writing
          newTab.document.close();
        }
      },
    });

  return (
    <>
      {(isLoadingInsurance || isLoadingGenerateReport) && <Loading />}
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
            className: "search-input-up-on-key-down",
            type: "text",
            value: "7.10.06",
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
            readOnly: true,
            defaultValue: "Communications Expense",
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
              { key: "ALL" },
              { key: "ID #" },
              { key: "Sub-Acct #" },
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
                onChange: (e) => {
           
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
            title: "Date From : ",
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
              setTitle(
                generateTitle({
                  subsiText: subsiTextRef.current?.value || "",
                  insuarnceIndex: _subsiRef.current?.selectedIndex,
                  insurance: _subsiRef.current?.value,
                  dateValue: e.currentTarget.value,
                  account: accountRef.current?.value,
                  accountTitle: _accountRef.current?.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={dateFromRef}
        />
        <TextInput
          label={{
            title: "Date To : ",
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
              setTitle(
                generateTitle({
                  subsiText: subsiTextRef.current?.value || "",
                  insuarnceIndex: _subsiRef.current?.selectedIndex,
                  insurance: _subsiRef.current?.value,
                  dateValue: e.currentTarget.value,
                  account: accountRef.current?.value,
                  accountTitle: _accountRef.current?.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={dateToRef}
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
              title: "Format :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "90px",
              },
            }}
            selectRef={formatRef}
            select={{
              style: { width: "calc(100% - 90px)", height: "22px" },
              defaultValue: "All Accounts",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                }
              },
            }}
            datasource={[
              { key: "No Running Balance" },
              { key: "With Running Balance" },
            ]}
            values={"key"}
            display={"key"}
          />
          <SelectInput
            label={{
              title: "Field :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "90px",
              },
            }}
            selectRef={fieldRef}
            select={{
              style: { width: "calc(100% - 90px)", height: "22px" },
              defaultValue: "All Accounts",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                }
              },
            }}
            datasource={[
              { key: "Explanations" },
              { key: "Payee" },
              { key: "Remarks" },
            ]}
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
      <ChartAccountUpwardTableModalSearch />
    </>
  );
}
function FormPostDatedCheckRegistry() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const formatRef = useRef<HTMLSelectElement>(null);
  const fieldRef = useRef<HTMLSelectElement>(null);
  const branchRef = useRef<HTMLSelectElement>(null);
  const _branchRef = useRef<any>(null);
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const orderRef = useRef<HTMLSelectElement>(null);

  const { isLoading: isLaodingSubAccount, mutate: mutateSubAccount } =
    useMutation({
      mutationKey: "sub-account",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/reports/accounting/report/sub-account`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        if (res.data.success) {
          _branchRef.current.setDataSource(res.data.data);
        }
      },
    });

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/reports/accounting/report/generate-report-post-dated-checks-registry",
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
        // window.open(pdfUrl);
        var newTab = window.open();
        if (newTab) {
          newTab.document.write("<!DOCTYPE html>");
          newTab.document.write(
            "<html><head><title>New Tab with iframe</title></head>"
          );
          newTab.document.write(
            '<body style="width:100vw;height:100vh;padding:0;margin:0;box-sizing:border-box;">'
          );
          newTab.document.write(
            `<iframe style="border:none;outline:none;padding:0;margin:0" src="${pdfUrl}" width="99%" height="99%"></iframe>`
          );

          newTab.document.write("</body></html>");
          // Optional: Close the document stream after writing
          newTab.document.close();
        }
      },
    });

  function generateReport() {
    mutateGenerateReport({
      title,
      format: formatRef.current?.value,
      field: fieldRef.current?.value,
      branch: branchRef.current?.value,
      dateFrom: dateFromRef.current?.value,
      dateTo: dateToRef.current?.value,
      type: typeRef.current?.value,
      sort: sortRef.current?.value,
      order: orderRef.current?.value,
    });
  }

  function generateTitle({ branch, dateFrom, dateTo }: any) {
    const department = user?.department;
    return `${
      department === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES "
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC. "
    } ${
      branch === "All" ? "" : `( ${branch} )`
    }\nPost Dated Checks Registered\nFrom ${format(
      new Date(dateFrom),
      "MM/dd/yyyy"
    )} to ${format(new Date(dateTo), "MM/dd/yyyy")}`;
  }
  const mutateSubAccountRef = useRef<any>(mutateSubAccount);
  const generateTitleRef = useRef<any>(generateTitle);

  useEffect(() => {
    mutateSubAccountRef.current();
    setTitle(
      generateTitleRef.current({
        branch: "All",
        dateTo: new Date(),
        dateFrom: new Date(),
      })
    );
  }, []);

  return (
    <>
      {(isLaodingSubAccount || isLoadingGenerateReport) && <Loading />}
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
            title: "Format :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          selectRef={formatRef}
          select={{
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "Format - 2",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {},
          }}
          datasource={[{ key: "Format - 1" }, { key: "Format - 2" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          label={{
            title: "Field :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          selectRef={fieldRef}
          select={{
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "Check Date",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {},
          }}
          datasource={[{ key: "Check Date" }, { key: "Date Received" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          label={{
            title: "Branch :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          ref={_branchRef}
          selectRef={branchRef}
          select={{
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "ALL",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  branch: e.currentTarget.value,
                  dateTo: dateFromRef.current?.value,
                  dateFrom: dateToRef.current?.value,
                })
              );
            },
          }}
          datasource={[]}
          values={"Acronym"}
          display={"Acronym"}
        />
        <TextInput
          label={{
            title: "Date From :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{ width: "100%" }}
          input={{
            defaultValue: format(new Date(), "yyyy-MM-dd"),
            type: "date",
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
              setTitle(
                generateTitle({
                  branch: branchRef.current?.value,
                  dateTo: dateToRef.current?.value,
                  dateFrom: e.currentTarget.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={dateFromRef}
        />
        <TextInput
          label={{
            title: "Date To :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{ width: "100%" }}
          input={{
            defaultValue: format(new Date(), "yyyy-MM-dd"),
            type: "date",
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
              setTitle(
                generateTitle({
                  branch: branchRef.current?.value,
                  dateTo: e.currentTarget.value,
                  dateFrom: dateFromRef.current?.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={dateToRef}
        />
        <SelectInput
          label={{
            title: "Type :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          selectRef={typeRef}
          select={{
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "ALL",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {},
          }}
          datasource={[{ key: "All" }, { key: "Rent" }, { key: "Loan" }]}
          values={"key"}
          display={"key"}
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
            datasource={[
              { key: "Name" },
              { key: "Check Date" },
              { key: "Date Received" },
            ]}
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
    </>
  );
}
