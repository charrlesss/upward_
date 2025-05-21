import { Fragment, useEffect, useRef, useState } from "react";
import { TextInput } from "../../../../../../../components/UpwardFields";
import { addYears, format } from "date-fns";
import { wait } from "@testing-library/user-event/dist/utils";
import { Button } from "@mui/material";
import { useMutation } from "react-query";
import axios from "axios";
import { Loading } from "../../../../../../../components/Loading";
import { formatNumber } from "../../../../Accounting/ReturnCheck";
import "../../../../../../../style/monbileview/production/production.css";
import Swal from "sweetalert2";
import { codeCondfirmationAlert } from "../../../../../../../lib/confirmationAlert";

const instance = axios.create();

let requestCount = 0;

const setLoading = (isLoading: any) => {
  // Connect this to your global store or React state setter
  const event = new CustomEvent("axios-loading", { detail: isLoading });
  window.dispatchEvent(event);
};

instance.interceptors.request.use((config) => {
  requestCount++;
  setLoading(true);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    requestCount--;
    if (requestCount === 0) setLoading(false);
    return response;
  },
  (error) => {
    requestCount--;
    if (requestCount === 0) setLoading(false);
    return Promise.reject(error);
  }
);

function TempToRegular() {
  const [accessToken, setAccessToken] = useState("");
  const [oldPolicy, setOldPolicy] = useState("");
  const [viewing, setViewing] = useState("");
  const policyNoRef = useRef<HTMLInputElement>(null);
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<Array<any>>([]);
  const [policyDetails, setPolicyDetails] = useState<any>({});

  const { mutate: mutateTempToRegular, isLoading: isLoadingTempToRegular } =
    useMutation({
      mutationKey: "temp-to-regular",
      mutationFn: (variables: any) => {
        return axios.post(
          `${process.env.REACT_APP_API_URL}/task/production/temp-to-regular`,
          variables,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
      },
      onSuccess(response) {
        if (response.data.success) {
          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.href = `/${process.env.REACT_APP_DEPARTMENT}/dashboard/task/production/policy/`;
          });
        }

        return Swal.fire({
          position: "center",
          icon: "error",
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      },
    });

  const { mutate: mutate, isLoading: isLoading } = useMutation({
    mutationKey: "get-transaction-history",
    mutationFn: (variables: any) => {
      return axios.post(
        `${process.env.REACT_APP_API_URL}/task/production/get-transaction-history`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
    },
    onSuccess(response) {
      if (response.data.success) {
        const [first, ...rest] = JSON.parse(response.data.history);
        setPolicyDetails(first[0]);
        setHistory(rest);
      }
    },
  });

  useEffect(() => {
    wait(100).then(() => {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get("Mkr44Rt2iuy13R");
      if (dataParam) {
        const state = JSON.parse(decodeURIComponent(dataParam));
        setOldPolicy(JSON.parse(state.policy_no));
        setAccessToken(JSON.parse(state.accessToken));
        setViewing(JSON.parse(state.viewing));
      }
    });
  }, []);

  useEffect(() => {
    const handleLoading = (e: any) => setLoading(e.detail);
    window.addEventListener("axios-loading", handleLoading);
    return () => window.removeEventListener("axios-loading", handleLoading);
  }, []);

  useEffect(() => {
    if (oldPolicy && accessToken) {
      mutate({ policyNo: oldPolicy });
    }
  }, [oldPolicy, accessToken]);

  return (
    <>
      {(isLoading || isLoadingTempToRegular) && <Loading />}
      <div
        style={{
          flex: 1,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="temp-to-reg-main-content"
          style={{
            height: "100%",
            width: "80%",
            borderLeft: "1px",
            borderRight: "1px",
            boxShadow: "0px 0px 6px -2px rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            background: "#EFEEEA",
          }}
        >
          <div
            style={{
              background: "#183B4E",
              width: "100%",
              textAlign: "center",
              height: "35px",
            }}
          >
            <p
              style={{
                padding: 5,
                margin: 0,
                color: "white",
              }}
            >
              TRANSACTION DETAILS{" "}
              <span style={{ color: "#DDEB9D" }}>({oldPolicy})</span>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "10px",
              rowGap: "15px",
            }}
          >
            {!viewing && (
              <div
                className="fields-content"
                style={{
                  boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  width: "100%",
                  padding: "20px",
                  boxSizing: "border-box",
                  rowGap: "15px",
                  columnGap: "20px",
                  borderRadius: "5px",
                  height: "105px",
                }}
              >
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "New Policy No: ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "calc(100% - 100px) " },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        dateFromRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={policyNoRef}
                />
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "Date Issued:",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "date",
                    defaultValue: format(new Date(), "yyyy-MM-dd"),
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                      }
                    },
                  }}
                  inputRef={dateIssuedRef}
                />
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "Date From:",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "date",
                    defaultValue: format(new Date(), "yyyy-MM-dd"),
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        dateToRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={dateFromRef}
                />
                <TextInput
                  containerClassName="custom-input"
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "Date To:",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "date",
                    defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
                    style: { width: "calc(100% - 100px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        dateIssuedRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={dateToRef}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: 0,
                  margin: 0,
                  width: "100%",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                TRANSACTION HISTORY
              </div>
              {/* <Button
              className="export-button"
                color="success"
                variant="contained"
                sx={{
                  height: "22px",
                  fontSize: "12px",
                  width: "160px",
                }}
              >
                Export History
              </Button> */}
            </div>
            <div
            className="history-content"
              style={{
                height: viewing ? "100%" : "calc(100% - 190px)",
                border: viewing ? "none" : "1px solid #D4C9BE",
                boxSizing: "border-box",
                position: "relative",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "15px",
                borderRadius: viewing ? "0px" : "5px",
                boxShadow: viewing
                  ? "none"
                  : "0px 0px 5px -2px rgba(0,0,0,0.75)",
              }}
            >
              <div
                style={{
                  height: "auto",
                  width: "calc(100% - 30px)",
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "10px",
                }}
              >
                <div
                  style={{
                    background: "#EFEEEA",
                    padding: "10px",
                    borderRadius: "5px",
                    boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
                    width: "calc(100% - 20px)",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "10px",
                  }}
                >
                  <strong>Policy Details</strong>
                  <div
                    className="policy-details"
                    style={{ display: "flex", columnGap: "100px" }}
                  >
                    <div>
                      <DisplayText
                        label={"Policy No :"}
                        value={policyDetails.PolicyNo}
                      />
                      <DisplayText
                        label={"Date Issued :"}
                        value={policyDetails.DateIssued}
                      />
                      <DisplayText
                        label={"Date From :"}
                        value={policyDetails.DateFrom}
                      />
                      <DisplayText
                        label={"Date To :"}
                        value={policyDetails.DateTo}
                      />
                      <DisplayText
                        label={"Account :"}
                        value={policyDetails.Account}
                      />
                      <DisplayText
                        label={"ChassisNo :"}
                        value={policyDetails.ChassisNo}
                      />
                      <DisplayText
                        label={"Make :"}
                        value={policyDetails.Make}
                      />
                      <DisplayText
                        label={"Model :"}
                        value={policyDetails.Model}
                      />
                      <DisplayText
                        label={"Body Type :"}
                        value={policyDetails.BodyType}
                      />
                      <DisplayText
                        label={"BLT File No. :"}
                        value={policyDetails.BLTFileNo}
                      />
                      <DisplayText
                        label={"Plate No. :"}
                        value={policyDetails.PlateNo}
                      />
                      <DisplayText
                        label={"Motor No. :"}
                        value={policyDetails.MotorNo}
                      />
                      <DisplayText
                        label={"Mortgagee :"}
                        value={policyDetails.Mortgagee}
                      />
                      <DisplayText
                        label={"Estimated Value :"}
                        value={policyDetails.EstimatedValue}
                      />
                      <DisplayText
                        label={"Total Due :"}
                        value={policyDetails.TotalDue}
                      />
                    </div>
                    <div>
                      <DisplayText
                        label={"Client ID :"}
                        value={policyDetails.entry_client_id}
                      />
                      <DisplayText
                        label={"Company :"}
                        value={policyDetails.company}
                      />
                      <DisplayText
                        label={"First Name :"}
                        value={policyDetails.firstname}
                      />
                      <DisplayText
                        label={"Last Name :"}
                        value={policyDetails.lastname}
                      />
                      <DisplayText
                        label={"Middle Name :"}
                        value={policyDetails.middlename}
                      />
                      <DisplayText
                        label={"Suffix :"}
                        value={policyDetails.suffix}
                      />
                      <DisplayText
                        label={"Address :"}
                        value={policyDetails.address}
                      />
                      <DisplayText
                        label={"Mobile No :"}
                        value={policyDetails.mobile}
                      />
                      <DisplayText
                        label={"Client Mortgagee :"}
                        value={policyDetails.client_mortgagee}
                      />
                      <DisplayText
                        label={"Client Branch :"}
                        value={policyDetails.client_branch}
                      />
                      <DisplayText
                        label={"Sale Officer :"}
                        value={policyDetails.sale_officer}
                      />
                    </div>
                  </div>
                </div>
                {history.map((itm, idx) => {
                  const { title, columns, data } = cardDetails(idx, itm);
                  return (
                    <Fragment key={idx}>
                      {itm.length > 0 ? (
                        <div
                        className="history-container"
                          style={{
                            background: "#EFEEEA",
                            padding: "10px",
                            borderRadius: "5px",
                            boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
                            width: "calc(100% - 20px)",
                            display: "flex",
                            flexDirection: "column",
                            rowGap: "10px",
                          }}
                        >
                          <strong>{title}</strong>
                          <DisplayCardHistory columns={columns} data={data} />
                        </div>
                      ) : null}
                    </Fragment>
                  );
                })}
              </div>
            </div>
            {!viewing && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (policyNoRef.current && policyNoRef.current.value === "") {
                    return alert("New Policy No  is required field!");
                  }
                  codeCondfirmationAlert({
                    title: `Are you sure you want to update it to regular policy?`,
                    text: "You won't be able to revert this!",
                    isUpdate: false,
                    saveTitle: "Confirm",
                    cancelTitle: "Decline",
                    cb: (userCodeConfirmation) => {
                      mutateTempToRegular({
                        oldPolicyNo: oldPolicy,
                        newPolicyNo: policyNoRef.current?.value,
                        newDateFrom: dateFromRef.current?.value,
                        newDateTo: dateToRef.current?.value,
                        newDateIssued: dateIssuedRef.current?.value,
                        userCodeConfirmation,
                      });
                    },
                  });
                }}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
function DisplayText({ value, label }: any) {
  return (
    <div style={{ display: "flex", columnGap: "10px", fontSize: "12px" }}>
      <div style={{ width: "110px" }}>{label}</div>
      <div
        style={{
          minWidth: "100px",
          maxWidth: "250px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: "bold",
        }}
      >
        {value}
      </div>
    </div>
  );
}
function DisplayCardHistory({ columns, data }: any) {
  return (
    <div className="table-history">
      {/* Header */}
      <div
        className="row header"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        }}
      >
        {columns.map((col: any, colIdx: any) => (
          <div className="cell" key={colIdx}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {data.map((row: any, rowIndex: number) => (
        <div
          className="row"
          key={rowIndex}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, minmax(90px, 1fr))`,
          }}
        >
          {columns.map((col: any) => (
            <div className="cell" key={col.key}>
              {row[col.key]}
            </div>
          ))}
        </div>
      ))}

      <div
        className="row total"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        }}
      >
        <div
          className="cell"
          style={{
            fontWeight: "bold",
            gridColumn: `span ${columns.length}`,
            padding: "8px 16px",
          }}
        >
          TOTAL ROWS: {data.length}
        </div>
      </div>
    </div>
  );
}
function cardDetails(
  idx: number,
  data: Array<any>
): {
  title: string;
  columns: Array<{ key: string; label: string }>;
  data: Array<any>;
} {
  switch (idx) {
    case 0:
      return {
        title: "PDC",
        data,
        columns: [
          { key: "Ref_No", label: "Reference No." },
          { key: "Check_Date", label: "Check Date" },
          { key: "Check_No", label: "Check No." },
          { key: "Check_Amnt", label: "Amount" },
          { key: "Bank", label: "Bank" },
          { key: "Branch", label: "Branch" },
        ],
      };
    case 1:
      const newData: Array<any> = [];

      for (let i = 0; i <= data.length - 1; i++) {
        if (data[i].Payment !== null && data[i].Payment.toString() !== "") {
          console.log(data[i]);

          const isCash = data[i].Payment.toLowerCase() === "cash";
          newData.push({
            ORNo: data[i].ORNo,
            Payment: data[i].Payment,
            Amount: formatNumber(
              parseFloat(data[i].Debit.toString().replace(/,/g, ""))
            ),
            Check_No: isCash ? "" : data[i].Check_No,
            Check_Date: isCash
              ? ""
              : format(new Date(data[i].Check_Date), "yyyy-MM-dd"),
            Bank_Branch: isCash ? "" : data[i].Bank,
          });
        }

        if (data[i].Purpose !== null && data[i].Purpose.toString() !== "") {
          newData.push({
            ORNo: "",
            Payment: data[i].CRTitle,
            Amount: formatNumber(
              parseFloat(data[i].Credit.toString().replace(/,/g, ""))
            ),
            Check_No: data[i].CRCode,
            Check_Date: "",
            Bank_Branch: data[i].CRLoanID,
          });
        }
      }

      return {
        title: "Collection",
        data: newData,
        columns: [
          { key: "ORNo", label: "OR No." },
          { key: "Payment", label: "Payment" },
          { key: "Check_Date", label: "Check Date" },
          { key: "Check_No", label: "Check No" },
          { key: "Amount", label: "Amount" },
          { key: "Bank_Branch", label: "Branch" },
        ],
      };
    case 2:
      return {
        title: "Deposit",
        data,
        columns: [
          { key: "Date__Deposit", label: "Date Deposit" },
          { key: "Slip_Code", label: "Slip Code" },
          { key: "Account_ID", label: "Account ID" },
          { key: "Account_Name", label: "Account Name" },
          { key: "Debit", label: "Debit" },
          { key: "Credit", label: "Credit" },
          { key: "Check__Date", label: "Check Date" },
          { key: "Check_No", label: "Check No" },
          { key: "Bank", label: "Bank" },
          { key: "BankAccount", label: "Bank Account" },
        ],
      };
    case 3:
      return {
        title: "Return Checks",
        data: formatGroupedRows(data),
        columns: [
          { key: "Date_Entry", label: "Date" },
          { key: "Source_No", label: "Ref No." },
          { key: "Explanation", label: "Explanation" },
          { key: "Check_Date", label: "Check Date" },
          { key: "Check_No", label: "Check No" },
          { key: "Check_Bank", label: "Bank" },
          { key: "Check_Return", label: "Check Return" },
          { key: "Check_Reason", label: "Check Reason" },
        ],
      };
    case 4:
      return {
        title: "General Journal",
        data,
        columns: [
          { key: "Date_Entry", label: "Date Entry" },
          { key: "Source_No", label: "Source No" },
          { key: "Explanation", label: "Explanation" },
          { key: "cGL_Acct", label: "Accoutn Title" },
          { key: "Debit", label: "Debit" },
          { key: "Credit", label: "Credit" },
          { key: "Remarks", label: "Remarks" },
        ],
      };
    case 5:
      return {
        title: "Cash Disbursement",
        data,
        columns: [
          { key: "Date_Entry", label: "Date Entry" },
          { key: "Source_No", label: "Source No" },
          { key: "Explanation", label: "Explanation" },
          { key: "cGL_Acct", label: "Accoutn Title" },
          { key: "Debit", label: "Debit" },
          { key: "Credit", label: "Credit" },
          { key: "Remarks", label: "Remarks" },
        ],
      };
    case 6:
      return {
        title: "Pullout",
        data,
        columns: [
          { key: "RCPNo", label: "RCPNo" },
          { key: "Requested_By", label: "Requested By" },
          { key: "Requested_Date", label: "Requested Date" },
          { key: "CheckNo", label: "Check No" },
          { key: "Reason", label: "Reason" },
          { key: "Status", label: "Status" },
        ],
      };
    case 7:
      return {
        title: "Postponement",
        data,
        columns: [
          { key: "RPCD", label: "RPCD" },
          { key: "CheckNo", label: "Check No" },
          { key: "OldCheckDate", label: "Old Check Date" },
          { key: "NewCheckDate", label: "New Check Date" },
          { key: "Reason", label: "Reason" },
          { key: "Status", label: "Status" },
        ],
      };
    default:
      return { title: "", data: [], columns: [{ key: "", label: "" }] };
  }
}

function formatGroupedRows(rows: any) {
  const grouped: any = {};

  // Group by Source_No (e.g. RC_No)
  rows.forEach((row: any) => {
    const key = row.Source_No;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  const result: any = [];

  // Build formatted output
  Object.values(grouped).forEach((group: any) => {
    group.forEach((row: any, index: any) => {
      if (index === 0) {
        result.push(row);
      } else {
        result.push({
          ...row,
          Branch_Code: "",
          Date_Entry: "",
          Source_Type: "",
          Source_No: "",
          Explanation: "",
        });
      }
    });
  });

  return result;
}
export default TempToRegular;
