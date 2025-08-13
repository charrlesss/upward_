import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../../../components/AuthContext";
import {
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { format, lastDayOfMonth, subYears, setDate } from "date-fns";
import { Button } from "@mui/material";
import { useQuery } from "react-query";
import PageHelmet from "../../../../components/Helmet";
import { isMobile } from "react-device-detect";

export default function ProductionReport() {
  const { user, myAxios } = useContext(AuthContext);
  const [title, setTitle] = useState(
    generateTitle({
      format2: "All",
      type: "COM",
      account: "All",
      dateFormat: "Monthly",
      date: new Date(),
    })
  );

  const [dateFormatState, setDateFormatState] = useState("Monthly");

  const { isLoading: loadingAccount, data: dataAccount } = useQuery({
    queryKey: "policy-account",
    queryFn: async () =>
      await myAxios.get(`/reports/reports/policy-account`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const response = data as any;
      console.log(response);
    },
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const format1Ref = useRef<HTMLSelectElement>(null);
  const format2Ref = useRef<HTMLSelectElement>(null);
  const dateFormatRef = useRef<HTMLSelectElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const TypeRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const policyTypeRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const accountRef = useRef<HTMLSelectElement>(null);

  function generateTitle(props: any) {
     const _title =
      process.env.REACT_APP_DEPARTMENT === "UMIS"
        ? "UPWARD MANAGEMENT INSURANCE SERVICES"
        : "UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.";


    const newTitle: string = `${_title} ${
      props.format2 === "All" ? "" : props.format2
    }\n${props.dateFormat} Production Report (${props.type} - ${
      props.account
    })\nCut off Date: ${dateFormat(props.dateFormat, props.date)}`;
    return newTitle;
  }
  function dateFormat(dateFormat: string, date: Date) {
    if (dateFormat === "Daily") {
      return format(date, "MMMM d, yyyy");
    } else if (dateFormat === "Monthly") {
      return format(date, "MMMM yyyy");
    } else if (dateFormat === "Yearly") {
      return format(date, "yyyy");
    }
  }

  async function generateReport() {
    let FDate = "";
    let TDate = "";
    let date = new Date(dateRef.current?.value as any);
    const numYear = parseInt(numberRef.current?.value as any);

    if (dateFormatRef.current?.value === "Daily") {
      FDate = format(date, "MM/dd/yyyy");
      TDate = format(date, "MM/dd/yyyy");
    } else if (dateFormatRef.current?.value === "Monthly") {
      FDate = format(date, "MM/01/yyyy");
      TDate = format(lastDayOfMonth(date), "MM/dd/yyyy");
    } else if (dateFormatRef.current?.value === "Yearly") {
      const adjustedDate = subYears(date, numYear);
      const firstDayOfMonth = setDate(adjustedDate, 1);
      FDate = format(firstDayOfMonth, "MM/dd/yyyy");
      TDate = format(lastDayOfMonth(date), "MM/dd/yyyy");
    }
    const reportDetails: any = {
      FDate,
      TDate,
      cmbOrder: accountRef.current?.value,
      cmbSubAcct: TypeRef.current?.value,
      cmbType: `${format2Ref.current?.selectedIndex}`,
      cmbpolicy: policyTypeRef.current?.value,
      cmbSort: sortRef.current?.value,
      title,
      format: format1Ref.current?.selectedIndex,
    };
    try {
      const response = await myAxios.post(
        "/reports/reports/production-report",
        reportDetails,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (isMobile) {
        // MOBILE: download directly
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } else {
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
          newTab.document
            .write(`<button id="excel" style="width:auto;height:auto;padding:5px;border-radius:50%;background:transparent;position:absolute;top:37px;right:19px;font-size:11px;cursor:pointer;border:none;">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20px" 
          height="20px" 
          viewBox="0 0 32 32">
          <title>Download Excel</title>
          <path d="M28.781,4.405H18.651V2.018L2,4.588V27.115l16.651,2.868V26.445H28.781A1.162,1.162,0,0,0,30,25.349V5.5A1.162,1.162,0,0,0,28.781,4.405Zm.16,21.126H18.617L18.6,23.642h2.487v-2.2H18.581l-.012-1.3h2.518v-2.2H18.55l-.012-1.3h2.549v-2.2H18.53v-1.3h2.557v-2.2H18.53v-1.3h2.557v-2.2H18.53v-2H28.941Z" style="fill:#20744a;fill-rule:evenodd"/><rect x="22.487" y="7.439" width="4.323" height="2.2" style="fill:#20744a"/><rect x="22.487" y="10.94" width="4.323" height="2.2" style="fill:#20744a"/><rect x="22.487" y="14.441" width="4.323" height="2.2" style="fill:#20744a"/><rect x="22.487" y="17.942" width="4.323" height="2.2" style="fill:#20744a"/><rect x="22.487" y="21.443" width="4.323" height="2.2" style="fill:#20744a"/><polygon points="6.347 10.673 8.493 10.55 9.842 14.259 11.436 10.397 13.582 10.274 10.976 15.54 13.582 20.819 11.313 20.666 9.781 16.642 8.248 20.513 6.163 20.329 8.585 15.666 6.347 10.673" style="fill:#ffffff;fill-rule:evenodd"/>
          </svg>
        </button>
        `);
          newTab.document.write(`
          <script>
            document.getElementById('excel').onclick = function() {
             
              fetch('${
                process.env.REACT_APP_API_URL
              }/reports/reports/production-report-to-excel', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ${user?.accessToken}',  
              },
              body:JSON.stringify(${JSON.stringify(reportDetails)})
            })
           .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              // Return the response as a blob (binary data for file)
              return response.blob();
            })
            .then(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'report.xls';  // Set the desired file name
              link.click();  // Simulate a click to start the download
            })
            .catch(error => {
              alert('Error with POST request: ' + error);
            });

            };
          </script>
        `);
          newTab.document.write("</body></html>");
          // Optional: Close the document stream after writing
          newTab.document.close();
        }
      }
    } catch (error) {
      console.error("SERVER ERROR :", error);
    }
  }
  return (
    <>
      <PageHelmet title={"Production Report"} />
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
            width: "500px",
            height: "450px",
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            padding: "20px",
            boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.75)",
          }}
        >
          <TextAreaInput
            label={{
              title: " ",
              style: {
                display: "none",
              },
            }}
            textarea={{
              rows: 6,
              style: { flex: 1, fontSize: "14px" },
              value: title,
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  //  refDate.current?.focus()
                }
              },
              onChange: (e) => {
                setTitle(e.target.value);
              },
            }}
            _inputRef={titleRef}
          />
          <div style={{ display: "flex", columnGap: "2px", width: "100%" }}>
            <SelectInput
              containerStyle={{
                flex: 1,
              }}
              label={{
                title: "Format : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "90px",
                },
              }}
              selectRef={format1Ref}
              select={{
                disabled: false,
                style: { width: "100%", height: "22px" },
                defaultValue: "Full",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    // refInvoice.current?.focus()
                  }
                },
              }}
              datasource={[{ key: "Full" }, { key: "Summary" }]}
              values={"key"}
              display={"key"}
            />
            <SelectInput
              label={{
                title: "Format : ",
                style: {
                  display: "none",
                },
              }}
              selectRef={format2Ref}
              select={{
                disabled: false,
                style: { width: "80px", height: "22px" },
                defaultValue: "All",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    // refInvoice.current?.focus()
                  }
                },
                onChange: (e) => {
                  setTitle(
                    generateTitle({
                      format2: e.target.value,
                      type: TypeRef.current?.value,
                      account: accountRef.current?.value,
                      dateFormat: dateFormatRef.current?.value,
                      date: new Date(dateRef.current?.value as any),
                    })
                  );
                },
              }}
              datasource={[{ key: "All" }, { key: "Financed" }]}
              values={"key"}
              display={"key"}
            />
          </div>
          <div style={{ display: "flex", columnGap: "2px", width: "100%" }}>
            <SelectInput
              containerStyle={{
                flex: 1,
              }}
              label={{
                title: "Report : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "90px",
                },
              }}
              selectRef={dateFormatRef}
              select={{
                disabled: false,
                style: { width: "100%", height: "22px" },
                defaultValue: dateFormatState,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    // refInvoice.current?.focus()
                  }
                },
                onChange: (e) => {
                  setDateFormatState(e.currentTarget.value);
                  if (e.target.value === "Yearly") {
                    if (numberRef.current) numberRef.current.disabled = false;
                  } else {
                    if (numberRef.current) numberRef.current.disabled = true;
                  }
                  console.log(dateRef.current?.value);

                  setTitle(
                    generateTitle({
                      format2: format2Ref.current?.value,
                      type: e.target.value,
                      account: accountRef.current?.value,
                      dateFormat: dateFormatRef.current?.value,
                      date: new Date(dateRef.current?.value as any),
                    })
                  );
                },
              }}
              datasource={[
                { key: "Daily" },
                { key: "Monthly" },
                { key: "Yearly" },
              ]}
              values={"key"}
              display={"key"}
            />
            <TextInput
              label={{
                title: " ",
                style: {
                  display: "none",
                },
              }}
              input={{
                disabled: true,
                type: "number",
                defaultValue: 0,
                style: { width: "80px" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={numberRef}
            />
          </div>
          <SelectInput
            label={{
              title: "Type : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "90px",
              },
            }}
            containerStyle={{
              flex: 1,
              height: "22px",
            }}
            selectRef={TypeRef}
            select={{
              disabled: false,
              style: { width: "100%", height: "22px" },
              defaultValue: "COM",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  // refInvoice.current?.focus()
                }
              },
              onChange: (e) => {
                setTitle(
                  generateTitle({
                    format2: format2Ref.current?.value,
                    type: e.target.value,
                    account: accountRef.current?.value,
                    dateFormat: dateFormatRef.current?.value,
                    date: new Date(dateRef.current?.value as any),
                  })
                );
              },
            }}
            datasource={[
              { key: "Bonds" },
              { key: "CGL" },
              { key: "COM" },
              { key: "FIRE" },
              { key: "MAR" },
              { key: "MSPR" },
              { key: "PA" },
              { key: "TPL" },
            ]}
            values={"key"}
            display={"key"}
          />
          <TextInput
            containerStyle={{
              flex: 1,
            }}
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
              style: { width: "100%", height: "22px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
              onChange: (e) => {
                setTitle(
                  generateTitle({
                    format2: format2Ref.current?.value,
                    type: TypeRef.current?.value,
                    account: accountRef.current?.value,
                    dateFormat: dateFormatRef.current?.value,
                    date: new Date(e.target.value as any),
                  })
                );
              },
            }}
            inputRef={dateRef}
          />
          <SelectInput
            label={{
              title: "Policy Type : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "90px",
              },
            }}
            containerStyle={{
              flex: 1,
              height: "22px",
            }}
            selectRef={policyTypeRef}
            select={{
              disabled: false,
              style: { width: "100%", height: "22px" },
              defaultValue: "Regular",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  // refInvoice.current?.focus()
                }
              },
            }}
            datasource={[{ key: "Regular" }, { key: "Temporary" }]}
            values={"key"}
            display={"key"}
          />
          <div
            style={{
              flex: 1,
              border: "1px solid #94a3b8",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <SelectInput
              label={{
                title: "Sort : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "90px",
                },
              }}
              containerStyle={{
                flex: 1,
                height: "22px",
              }}
              selectRef={sortRef}
              select={{
                disabled: false,
                style: { width: "100%", height: "22px" },
                defaultValue: "Date Issued",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    // refInvoice.current?.focus()
                  }
                },
              }}
              datasource={[
                { key: "Date Issued" },
                { key: "Policy No#" },
                { key: "Date From" },
              ]}
              values={"key"}
              display={"key"}
            />
            {loadingAccount ? (
              <div>Loading...</div>
            ) : (
              <SelectInput
                label={{
                  title: "Account : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                  height: "22px",
                }}
                selectRef={accountRef}
                select={{
                  disabled: false,
                  style: { width: "100%", height: "22px" },
                  defaultValue: "All",
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                      // refInvoice.current?.focus()
                    }
                  },
                  onChange: (e) => {
                    setTitle(
                      generateTitle({
                        format2: format2Ref.current?.value,
                        type: TypeRef.current?.value,
                        account: e.target.value,
                        dateFormat: dateFormatRef.current?.value,
                        date: new Date(dateRef.current?.value as any),
                      })
                    );
                  },
                }}
                datasource={dataAccount?.data.data}
                values={"Account"}
                display={"Account"}
              />
            )}
          </div>
          <Button
            onClick={generateReport}
            color="success"
            variant="contained"
            sx={{ height: "22px", fontSize: "12px" }}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </>
  );
}
