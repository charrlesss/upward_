import { Button } from "@mui/material";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { useContext, useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { format, isValid, parse } from "date-fns";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";
import { wait } from "../../../../lib/wait";
import { Loading } from "../../../../components/Loading";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PageHelmet from "../../../../components/Helmet";

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
        setButtonList([{ label: "Post Dated Checks Registry", id: 10 }]);
        setButtonSelected(10);
      }
    }
  }, [user]);

  return (
    <>
    <PageHelmet title={buttonList[buttonSelected].label} />
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
            width: "700px",
            height: "480px",
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
                        {itm.id === 7 && <div style={{ height: "15px" }}></div>}
                        {itm.id === 10 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        {itm.id === 11 && (
                          <div style={{ height: "15px" }}></div>
                        )}
                        {itm.id === 16 && (
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
            {buttonSelected === 3 && (
              <FormFSReport
                link={
                  "/reports/accounting/report/generate-report-trial-balance"
                }
                reportTitle={"Trial Balance"}
              />
            )}
            {buttonSelected === 4 && (
              <FormFSReport
                link={
                  "/reports/accounting/report/generate-report-income-statement"
                }
                reportTitle={"Income Statement - Long"}
              />
            )}
            {buttonSelected === 5 && (
              <FormFSReport
                link={
                  "/reports/accounting/report/generate-report-balance-sheet"
                }
                reportTitle={"Balance Sheet"}
              />
            )}
            {buttonSelected === 6 && (
              <FormFSReport
                link={
                  "/reports/accounting/report/generate-report-general-ledger"
                }
                reportTitle={"General Ledger"}
              />
            )}
            {buttonSelected === 7 && (
              <FormAbsDepoReturned
                link={
                  "/reports/accounting/report/generate-report-abstract-collection"
                }
                reportTitle={"Abstract of Collections"}
              />
            )}
            {buttonSelected === 8 && (
              <FormAbsDepoReturned
                link={
                  "/reports/accounting/report/generate-report-deposit-collection"
                }
                reportTitle={"Deposited of Collections"}
              />
            )}
            {buttonSelected === 9 && (
              <FormAbsDepoReturned
                link={
                  "/reports/accounting/report/generate-report-returned-checks"
                }
                reportTitle={"Returned  of Checks"}
              />
            )}
            {buttonSelected === 10 && <FormPostDatedCheckRegistry />}
            {buttonSelected === 11 && <PettyCashFundDisbursement />}
            {buttonSelected === 12 && (
              <FormAbsDepoReturned
                link={
                  "/reports/accounting/report/generate-report-cash-disbursement-book-CDB"
                }
                reportTitle={"Cash Disbursement Book - CDB"}
              />
            )}
            {buttonSelected === 13 && (
              <FormAbsDepoReturned
                link={
                  "/reports/accounting/report/generate-report-general-journal-book-GJB"
                }
                reportTitle={"General Journal Book - GJB"}
              />
            )}
            {buttonSelected === 16 && (
              <AgingAccounts
                link={
                  "/reports/accounting/report/generate-report-aging-account"
                }
                reportTitle={"Aging of Accounts"}
              />
            )}
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
              dateValue: validateDate(dateRef.current?.value as any)
                ? new Date(dateRef.current?.value as any)
                : new Date(),
              account: rowItm[0],
              accountTitle: rowItm[1],
            })
          );

          subsiRef.current?.focus();
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
      process.env.REACT_APP_DEPARTMENT === "UMIS"
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
                  dateValue: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
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
                    dateValue: validateDate(dateRef.current?.value as any)
                      ? new Date(dateRef.current?.value as any)
                      : new Date(),
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
                      dateValue: validateDate(dateRef.current?.value as any)
                        ? new Date(dateRef.current?.value as any)
                        : new Date(),
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
                      dateValue: validateDate(dateRef.current?.value as any)
                        ? new Date(dateRef.current?.value as any)
                        : new Date(),
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
                  dateValue: validateDate(e.currentTarget.value as any)
                    ? new Date(e.currentTarget.value as any)
                    : new Date(),
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
      subsi: 0,
      accountName: "Premium Receivables",
      account: "1.03.01",
      dateFrom: new Date(),
      dateTo: new Date(),
    })
  );
  const [subsi, setSubsi] = useState("ALL");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const _accountRef = useRef<HTMLInputElement>(null);
  const subsiRef = useRef<HTMLSelectElement>(null);

  const __subsiRef = useRef<any>(null);
  const subsiTextRef = useRef<HTMLInputElement>(null);

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const formatRef = useRef<HTMLSelectElement>(null);
  const fieldRef = useRef<HTMLSelectElement>(null);

  const idNoRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef("");

  const subAcctRef = useRef<HTMLInputElement>(null);
  const shortNameRef = useRef("");

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
              subsi: subsiRef.current?.selectedIndex,
              accountName: rowItm[1],
              account: rowItm[0],
              subsiName: nameRef.current,
              subsiId: idNoRef.current?.value,
              dateFrom: validateDate(dateFromRef.current?.value as any)
                ? new Date(dateFromRef.current?.value as any)
                : new Date(),
              dateTo: validateDate(dateToRef.current?.value as any)
                ? new Date(dateToRef.current?.value as any)
                : new Date(),
            })
          );

          subsiRef.current?.focus();
        });

        chartAccountCloseModal();
      }
    },
  });
  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/accounting/search-pdc-policy-id",
    column: [
      { key: "Type", label: "Type", width: 60 },
      { key: "IDNo", label: "ID No.", width: 100 },
      {
        key: "Name",
        label: "Name",
        width: 350,
      },
      {
        key: "client_id",
        label: "client_id",
        width: 0,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (idNoRef.current) {
            idNoRef.current.value = rowItm[1];
          }
          nameRef.current = rowItm[2];
          setTitle(
            generateTitle({
              subsi: 1,
              accountName: _accountRef.current?.value,
              account: accountRef.current?.value,
              subsiName: rowItm[2],
              subsiId: rowItm[1],
              dateFrom: validateDate(dateFromRef.current?.value as any)
                ? new Date(dateFromRef.current?.value as any)
                : new Date(),
              dateTo: validateDate(dateToRef.current?.value as any)
                ? new Date(dateToRef.current?.value as any)
                : new Date(),
            })
          );
        });
        clientCloseModal();
      }
    },
  });
  const {
    UpwardTableModalSearch: SubAccountUpwardTableModalSearch,
    openModal: subAccountOpenModal,
    closeModal: subAccountCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/reports/accounting/report/sub-account-search",
    column: [
      { key: "Acronym", label: "Acronym", width: 80 },
      { key: "ShortName", label: "ShortName", width: 200 },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        wait(100).then(() => {
          if (subAcctRef.current) {
            subAcctRef.current.value = rowItm[0];
          }
          shortNameRef.current = rowItm[1];

          setTitle(
            generateTitle({
              subsi: 2,
              accountName: _accountRef.current?.value,
              account: accountRef.current?.value,
              subsiName: rowItm[1],
              subsiId: rowItm[0],
              dateFrom: validateDate(dateFromRef.current?.value as any)
                ? new Date(dateFromRef.current?.value as any)
                : new Date(),
              dateTo: validateDate(dateToRef.current?.value as any)
                ? new Date(dateToRef.current?.value as any)
                : new Date(),
            })
          );
        });
        subAccountCloseModal();
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
    subsi,
    accountName,
    account,
    subsiName,
    subsiId,
    dateFrom,
    dateTo,
  }: any) {
    const _title =
      process.env.REACT_APP_DEPARTMENT === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";
    let Subsi = "\n";

    if (subsi === 1) {
      Subsi += `ID No. : ${subsiName} (${subsiId || ""})`;
    } else if (subsi === 2) {
      Subsi += `Sub Account : ${subsiName} (${subsiId || ""})`;
    }

    let txtReportTitleText = `${_title}
Subsidiary Ledger\n\n
Account: ${accountName} (${account})${subsi === 0 ? "" : Subsi}
For the Period: ${format(new Date(dateFrom), "MMMM dd, yyyy")} to ${format(
      new Date(dateTo),
      "MMMM dd, yyyy"
    )}
`;
    // setTitle(txtReportTitleText);
    return txtReportTitleText;
  }

  function generateReport() {
    let subsi_options: any = "";

    if (subsi === "ID #") {
      subsi_options = idNoRef.current?.value;
    } else if (subsi === "Sub-Acct #") {
      subsi_options = subAcctRef.current?.value;
    }

    mutateGenerateReport({
      title,
      dateFrom: dateFromRef.current?.value,
      dateTo: dateToRef.current?.value,
      account: accountRef.current?.value,
      mField: fieldRef.current?.value,
      subsi,
      subsi_options,
      format: formatRef.current?.value,
    });
  }

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/reports/accounting/report/generate-report-subsidiary-ledger",
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
            defaultValue: "1.03.01",
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
            defaultValue: "Premium Receivables",
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
            containerStyle={{ flex: 1 }}
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

                setTitle(
                  generateTitle({
                    subsi: subsiRef.current?.selectedIndex,
                    accountName: _accountRef.current?.value,
                    account: accountRef.current?.value,
                    subsiName: nameRef.current,
                    subsiId: idNoRef.current?.value,
                    dateFrom: validateDate(dateFromRef.current?.value as any)
                      ? new Date(dateFromRef.current?.value as any)
                      : new Date(),
                    dateTo: validateDate(dateToRef.current?.value as any)
                      ? new Date(dateToRef.current?.value as any)
                      : new Date(),
                  })
                );
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
          {subsi === "ALL" && (
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
                disabled: true,
                readOnly: true,
                type: "text",
                defaultValue: "",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    // searchCashDisbursementOpenModal(e.currentTarget.value);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                },
                onChange: (e) => {},
                style: { width: "100%" },
              }}
              inputRef={subsiTextRef}
            />
          )}
          {subsi === "ID #" && (
            <TextInput
              label={{
                title: "PN/Client ID : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                  display: "none",
                },
              }}
              containerStyle={{ flex: 1 }}
              input={{
                type: "text",
                style: { width: "100%", height: "22px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    clientOpenModal(e.currentTarget.value);
                  }
                },
              }}
              inputRef={idNoRef}
              icon={
                <PersonSearchIcon
                  sx={{
                    fontSize: "18px",
                    color: "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (idNoRef.current) {
                  clientOpenModal(idNoRef.current.value);
                }
              }}
            />
          )}
          {subsi === "Sub-Acct #" && (
            <TextInput
              label={{
                title: "",
                style: {
                  display: "none",
                },
              }}
              containerStyle={{ flex: 1 }}
              input={{
                type: "text",
                style: { width: "100%", height: "22px" },
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    subAccountOpenModal(e.currentTarget.value);
                  }
                },
              }}
              inputRef={subAcctRef}
              icon={
                <PersonSearchIcon
                  sx={{
                    fontSize: "18px",
                    color: "black",
                  }}
                />
              }
              onIconClick={(e) => {
                e.preventDefault();
                if (subAcctRef.current) {
                  subAccountOpenModal(subAcctRef.current.value);
                }
              }}
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
            onBlur: (e) => {
              if (subsi === "ID #") {
                setTitle(
                  generateTitle({
                    subsi: 1,
                    accountName: accountRef.current?.value,
                    account: _accountRef.current?.value,
                    subsiName: nameRef.current,
                    subsiId: idNoRef.current?.value,
                    dateFrom: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                    dateTo: validateDate(dateToRef.current?.value as any)
                      ? new Date(dateToRef.current?.value as any)
                      : new Date(),
                  })
                );
              } else if (subsi === "ID #") {
                setTitle(
                  generateTitle({
                    subsi: 2,
                    accountName: accountRef.current?.value,
                    account: _accountRef.current?.value,
                    subsiName: shortNameRef.current,
                    subsiId: subAcctRef.current?.value,
                    dateFrom: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                    dateTo: validateDate(dateToRef.current?.value as any)
                      ? new Date(dateToRef.current?.value as any)
                      : new Date(),
                  })
                );
              } else {
                setTitle(
                  generateTitle({
                    subsi: 0,
                    accountName: accountRef.current?.value,
                    account: _accountRef.current?.value,
                    subsiName: "",
                    subsiId: "",
                    dateFrom: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                    dateTo: validateDate(dateToRef.current?.value as any)
                      ? new Date(dateToRef.current?.value as any)
                      : new Date(),
                  })
                );
              }
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
              // const newDateTo = isValidDateString(e.currentTarget.value)
              //   ? e.currentTarget.value
              //   : new Date();
              if (subsi === "ID #") {
                setTitle(
                  generateTitle({
                    subsi: 1,
                    accountName: _accountRef.current?.value,
                    account: accountRef.current?.value,
                    subsiName: nameRef.current,
                    subsiId: idNoRef.current?.value,
                    dateFrom: validateDate(dateFromRef.current?.value as any)
                      ? new Date(dateFromRef.current?.value as any)
                      : new Date(),
                    dateTo: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                  })
                );
              } else if (subsi === "ID #") {
                setTitle(
                  generateTitle({
                    subsi: 2,
                    accountName: _accountRef.current?.value,
                    account: accountRef.current?.value,
                    subsiName: shortNameRef.current,
                    subsiId: subAcctRef.current?.value,
                    dateFrom: validateDate(dateFromRef.current?.value as any)
                      ? new Date(dateFromRef.current?.value as any)
                      : new Date(),
                    dateTo: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                  })
                );
              } else {
                setTitle(
                  generateTitle({
                    subsi: 0,
                    accountName: accountRef.current?.value,
                    account: _accountRef.current?.value,
                    subsiName: "",
                    subsiId: "",
                    dateFrom: validateDate(dateFromRef.current?.value as any)
                      ? new Date(dateFromRef.current?.value as any)
                      : new Date(),
                    dateTo: validateDate(e.currentTarget.value)
                      ? new Date(e.currentTarget.value)
                      : new Date(),
                  })
                );
              }
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
      <ClientUpwardTableModalSearch />
      <SubAccountUpwardTableModalSearch />
    </>
  );
}
function FormFSReport({ link, reportTitle }: any) {
  const { myAxios, user } = useContext(AuthContext);

  const [title, setTitle] = useState(
    generateTitle({
      cmbformat: "Default",
      report: "Monthly",
      subAccount: "ALL",
      date: new Date(),
    })
  );

  const [report, setReport] = useState("Monthly");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const formatRef = useRef<HTMLSelectElement>(null);
  const reportRef = useRef<HTMLSelectElement>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const _subAccountRef = useRef<any>(null);
  const nominalAccountRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(link, variables, {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
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

  function generateTitle({ report, cmbformat, subAccount, date }: any) {
    const _title =
      process.env.REACT_APP_DEPARTMENT === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";

    return `${_title} ${
      subAccount.toUpperCase() === "ALL" ? "" : `(${subAccount})`
    }\n${report} ${reportTitle} ${
      cmbformat === "Summary" ? "(Per Revenue Center)" : ""
    }\n${
      report === "Monthly"
        ? format(new Date(date), "MMMM, yyyy")
        : format(new Date(date), "MMMM dd, yyyy")
    }`;
  }

  function generateReport() {
    mutateGenerateReport({
      cmbformat: formatRef.current?.value,
      report: reportRef.current?.value,
      subAccount: subAccountRef.current?.value,
      nominalAccountRef: nominalAccountRef.current?.value,
      date: dateRef.current?.value,
      title,
    });
  }

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
          _subAccountRef.current.setDataSource(res.data.data);
        }
      },
    });

  const mutateSubAccountRef = useRef(mutateSubAccount);

  useEffect(() => {
    mutateSubAccountRef.current({});
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
          rowGap: "10px",
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
              width: "120px",
            },
          }}
          selectRef={formatRef}
          select={{
            defaultValue: "Default",
            style: { width: "calc(100% - 120px)", height: "22px" },
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  cmbformat: e.currentTarget.value,
                  report: reportRef.current?.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ key: "Default" }, { key: "Summary" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          label={{
            title: "Report :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={reportRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            value: report,
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              if (e.currentTarget.value === "Monthly") {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM");
                  }
                });
              } else {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM-dd");
                  }
                });
              }
              setReport(e.currentTarget.value);
              setTitle(
                generateTitle({
                  cmbformat: formatRef.current?.value,
                  report: e.currentTarget.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ key: "Daily" }, { key: "Monthly" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          ref={_subAccountRef}
          label={{
            title: "Sub Account :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={subAccountRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            defaultValue: "HO",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  cmbformat: formatRef.current?.value,
                  report: reportRef.current?.value,
                  subAccount: e.currentTarget.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[]}
          values={"Acronym"}
          display={"Acronym"}
        />
        <SelectInput
          label={{
            title: "Nominal Account :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={nominalAccountRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            defaultValue: "Pre Closing",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
          }}
          datasource={[{ key: "Pre Closing" }, { key: "Post Closing" }]}
          values={"key"}
          display={"key"}
        />
        <TextInput
          label={{
            title: "Date : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          input={{
            type: report === "Monthly" ? "month" : "date",
            defaultValue:
              report === "Monthly"
                ? format(new Date(), "yyyy-MM")
                : format(new Date(), "yyyy-MM-dd"),
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
                  cmbformat: formatRef.current?.value,
                  report: reportRef.current?.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(e.currentTarget.value)
                    ? new Date(e.currentTarget.value)
                    : new Date(),
                })
              );
            },
            onBlur: (e) => {},
            style: { width: "calc(100% - 120px)" },
          }}
          inputRef={dateRef}
        />

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
function FormAbsDepoReturned({ link, reportTitle }: any) {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState(
    generateTitle({
      report: "Monthly",
      subAccount: "ALL",
      date: new Date(),
    })
  );
  const [report, setReport] = useState("Monthly");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const formatRef = useRef<HTMLSelectElement>(null);
  const reportRef = useRef<HTMLSelectElement>(null);
  const branchRef = useRef<HTMLSelectElement>(null);
  const _branchRef = useRef<any>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const orderRef = useRef<HTMLSelectElement>(null);

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(link, variables, {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
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

  function generateTitle({ report, subAccount, date }: any) {
    const _title =
      process.env.REACT_APP_DEPARTMENT === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";

    return `${_title} ${
      subAccount.toUpperCase() === "ALL" ? "" : `(${subAccount})`
    }\n${report} ${reportTitle}\n${
      report === "Monthly"
        ? format(new Date(date), "MMMM, yyyy")
        : format(new Date(date), "MMMM dd, yyyy")
    }
    `;
  }

  function generateReport() {
    mutateGenerateReport({
      title: titleRef.current?.value,
      cmbFormat: formatRef.current?.value,
      report: reportRef.current?.value,
      subAccount: branchRef.current?.value,
      date: dateRef.current?.value,
      sort: sortRef.current?.value,
      order: orderRef.current?.value,
    });
  }

  const mutateSubAccountRef = useRef<any>(mutateSubAccount);

  useEffect(() => {
    mutateSubAccountRef.current({});
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
          rowGap: "10px",
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
          datasource={[{ key: "Format - 1" }]}
          values={"key"}
          display={"key"}
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
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "Monthly",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              if (e.currentTarget.value === "Monthly") {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM");
                  }
                });
              } else {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM-dd");
                  }
                });
              }
              setReport(e.currentTarget.value);
              setTitle(
                generateTitle({
                  report: e.currentTarget.value,
                  subAccount: branchRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ key: "Daily" }, { key: "Monthly" }]}
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
                  report: reportRef.current?.value,
                  subAccount: branchRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
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
            title: "Date :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{ width: "100%" }}
          input={{
            defaultValue:
              report === "Monthly"
                ? format(new Date(), "yyyy-MM")
                : format(new Date(), "yyyy-MM-dd"),
            type: report === "Monthly" ? "month" : "date",
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
                  report: reportRef.current?.value,
                  subAccount: branchRef.current?.value,
                  date: validateDate(e.currentTarget.value)
                    ? new Date(e.currentTarget.value)
                    : new Date(),
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
            datasource={[{ key: "Reference No" }]}
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
        window.open(
          `/${
            process.env.REACT_APP_DEPARTMENT
          }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
          "_blank"
        );
      },
    });
  const {
    mutate: mutateGenerateExcelReport,
    isLoading: isLoadingGenerateExcelReport,
  } = useMutation({
    mutationKey: "generate-excel-report",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/reports/accounting/report/generate-excel-report-post-dated-checks-registry",
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
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = "report.xls"; // Set the desired file name
      link.click(); // Simulate a click to start the download
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
  function generateExcelReport() {
    mutateGenerateExcelReport({
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
      {(isLaodingSubAccount ||
        isLoadingGenerateReport ||
        isLoadingGenerateExcelReport) && <Loading />}
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
                  dateFrom: validateDate(dateFromRef.current?.value as any)
                    ? new Date(dateFromRef.current?.value as any)
                    : new Date(),
                  dateTo: validateDate(dateToRef.current?.value as any)
                    ? new Date(dateToRef.current?.value as any)
                    : new Date(),
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
                  dateFrom: validateDate(e.currentTarget.value)
                    ? new Date(e.currentTarget.value)
                    : new Date(),
                  dateTo: validateDate(dateToRef.current?.value as any)
                    ? new Date(dateToRef.current?.value as any)
                    : new Date(),
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
                  dateFrom: validateDate(dateFromRef.current?.value as any)
                    ? new Date(dateFromRef.current?.value as any)
                    : new Date(),
                  dateTo: validateDate(e.currentTarget.value as any)
                    ? new Date(e.currentTarget.value as any)
                    : new Date(),
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
              defaultValue: "Check Date",
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
              defaultValue: "Ascending",
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
          Generate PDF Report
        </Button>
        <Button
          onClick={generateExcelReport}
          color="success"
          variant="contained"
          sx={{ height: "22px", fontSize: "12px", width: "100%" }}
        >
          Generate Excel Report
        </Button>
      </div>
    </>
  );
}
function PettyCashFundDisbursement() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fundRef = useRef<HTMLSelectElement>(null);
  const branchRef = useRef<HTMLSelectElement>(null);
  const _branchRef = useRef<any>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/reports/accounting/report/generate-report-petty-cash-fund-disbursement",
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

  function generateTitle({ branch, from, to }: any) {
    const department = user?.department;
    return `${
      department === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES "
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC. "
    } ${
      branch === "All" ? "" : `( ${branch} )`
    }\nPetty Cash Fund Disbursement\nFrom ${from} to ${to}`;
  }

  function generateReport() {
    mutateGenerateReport({
      title,
      subAccount: branchRef.current?.value,
      seriesFrom: fromRef.current?.value,
      seriesTo: toRef.current?.value,
    });
  }

  const mutateSubAccountRef = useRef<any>(mutateSubAccount);
  const generateTitleRef = useRef<any>(generateTitle);

  useEffect(() => {
    mutateSubAccountRef.current();
    setTitle(
      generateTitleRef.current({
        branch: "All",
        to: "",
        from: "",
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
            title: "Fund :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          selectRef={fundRef}
          select={{
            style: { width: "calc(100% - 90px)", height: "22px" },
            defaultValue: "Petty Cash",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {},
          }}
          datasource={[{ key: "Petty Cash" }]}
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
                  to: toRef.current?.value,
                  from: fromRef.current?.value,
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
            title: "From :",
            defaultValue: "",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{ width: "100%" }}
          input={{
            type: "text",
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  branch: branchRef.current?.value,
                  to: toRef.current?.value,
                  from: e.currentTarget.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={fromRef}
        />
        <span
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            width: "185px",
            textAlign: "right",
          }}
        >
          Example : {format(new Date(), "yyMM")}-001
        </span>
        <TextInput
          label={{
            title: "To :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{ width: "100%" }}
          input={{
            type: "text",
            defaultValue: "",
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
                  to: e.currentTarget.value,
                  from: fromRef.current?.value,
                })
              );
            },
            style: { width: "calc(100% - 90px)" },
          }}
          inputRef={toRef}
        />
        <span
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            width: "185px",
            textAlign: "right",
          }}
        >
          Example : {format(new Date(), "yyMM")}-100
        </span>
        <Button
          onClick={generateReport}
          color="success"
          variant="contained"
          sx={{ height: "22px", fontSize: "12px", width: "100%" }}
        >
          Generate PDF Report
        </Button>
      </div>
    </>
  );
}

function AgingAccounts({ link, reportTitle }: any) {
  const { myAxios, user } = useContext(AuthContext);

  const [title, setTitle] = useState(
    generateTitle({
      cmbformat: "Default",
      report: "Monthly",
      subAccount: "ALL",
      date: new Date(),
    })
  );

  const [report, setReport] = useState("Monthly");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const formatRef = useRef<HTMLSelectElement>(null);
  const reportRef = useRef<HTMLSelectElement>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const _subAccountRef = useRef<any>(null);
  const policyTypeRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateGenerateReport, isLoading: isLoadingGenerateReport } =
    useMutation({
      mutationKey: "generate-report",
      mutationFn: async (variables: any) => {
        return await myAxios.post(link, variables, {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
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

  function generateTitle({ report, cmbformat, subAccount, date }: any) {
    const _title =
      process.env.REACT_APP_DEPARTMENT === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";

    return `${_title} ${
      subAccount.toUpperCase() === "ALL" ? "" : `(${subAccount})`
    }\n${report} ${reportTitle} ${
      cmbformat === "Summary" ? "(Per Revenue Center)" : ""
    }\n${
      report === "Monthly"
        ? format(new Date(date), "MMMM, yyyy")
        : format(new Date(date), "MMMM dd, yyyy")
    }`;
  }

  function generateReport() {
    mutateGenerateReport({
      cmbformat: formatRef.current?.value,
      report: reportRef.current?.value,
      subAccount: subAccountRef.current?.value,
      policyType: policyTypeRef.current?.value,
      date: dateRef.current?.value,
      title,
    });
  }

  return (
    <>
      {isLoadingGenerateReport && <Loading />}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          padding: "5px",
          rowGap: "10px",
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
              width: "120px",
            },
          }}
          selectRef={formatRef}
          select={{
            defaultValue: "All Accounts",
            style: { width: "calc(100% - 120px)", height: "22px" },
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  cmbformat: e.currentTarget.value,
                  report: reportRef.current?.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ key: "All Accounts" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          label={{
            title: "Report :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={reportRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            value: report,
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              if (e.currentTarget.value === "Monthly") {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM");
                  }
                });
              } else {
                wait(100).then(() => {
                  if (dateRef.current) {
                    dateRef.current.value = format(new Date(), "yyyy-MM-dd");
                  }
                });
              }
              setReport(e.currentTarget.value);
              setTitle(
                generateTitle({
                  cmbformat: formatRef.current?.value,
                  report: e.currentTarget.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ key: "Monthly" }]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          ref={_subAccountRef}
          label={{
            title: "Sub Account :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={subAccountRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            defaultValue: "HO",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
            onChange: (e) => {
              setTitle(
                generateTitle({
                  cmbformat: formatRef.current?.value,
                  report: reportRef.current?.value,
                  subAccount: e.currentTarget.value,
                  date: validateDate(dateRef.current?.value as any)
                    ? new Date(dateRef.current?.value as any)
                    : new Date(),
                })
              );
            },
          }}
          datasource={[{ Acronym: "All" }]}
          values={"Acronym"}
          display={"Acronym"}
        />

        <TextInput
          label={{
            title: "Date : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          input={{
            type: report === "Monthly" ? "month" : "date",
            defaultValue:
              report === "Monthly"
                ? format(new Date(), "yyyy-MM")
                : format(new Date(), "yyyy-MM-dd"),
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
                  cmbformat: formatRef.current?.value,
                  report: reportRef.current?.value,
                  subAccount: subAccountRef.current?.value,
                  date: validateDate(e.currentTarget.value)
                    ? new Date(e.currentTarget.value)
                    : new Date(),
                })
              );
            },
            onBlur: (e) => {},
            style: { width: "calc(100% - 120px)" },
          }}
          inputRef={dateRef}
        />
        <SelectInput
          label={{
            title: "Policy Type :",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "120px",
            },
          }}
          selectRef={policyTypeRef}
          select={{
            style: { width: "calc(100% - 120px)", height: "22px" },
            defaultValue: "Regular",
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
          }}
          datasource={[{ key: "Regular" }, { key: "Temporary" }]}
          values={"key"}
          display={"key"}
        />
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
const validateDate = (dateStr: any, dateFormat = "yyyy-MM-dd") => {
  const parsedDate = parse(dateStr, dateFormat, new Date());
  const isDateValid =
    isValid(parsedDate) && format(parsedDate, dateFormat) === dateStr;
  return isDateValid;
};
