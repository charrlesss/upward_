import { useContext, useRef, useState } from "react"
import { AuthContext } from "../../../../components/AuthContext"
import { SelectInput, TextAreaInput, TextInput } from "../../../../components/UpwardFields"
import { format, lastDayOfMonth, subYears, setDate } from "date-fns"
import { Button } from "@mui/material"
import { useQuery } from "react-query"

export default function ProductionReport() {
  const { user, myAxios } = useContext(AuthContext)
  const [title, setTitle] = useState(generateTitle({
    format2: "All",
    type: "COM",
    account: "All",
    dateFormat: "Monthly",
    date: new Date()
  }))

  const [dateFormatState, setDateFormatState] = useState('Monthly')

  const {
    isLoading: loadingAccount,
    data: dataAccount
  } = useQuery({
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
      console.log(response)
    },
  });

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const format1Ref = useRef<HTMLSelectElement>(null)
  const format2Ref = useRef<HTMLSelectElement>(null)
  const dateFormatRef = useRef<HTMLSelectElement>(null)
  const numberRef = useRef<HTMLInputElement>(null)
  const TypeRef = useRef<HTMLSelectElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const policyTypeRef = useRef<HTMLSelectElement>(null)
  const sortRef = useRef<HTMLSelectElement>(null)
  const accountRef = useRef<HTMLSelectElement>(null)

  function generateTitle(props: any) {

    const newTitle: string = `UPWARD MANAGEMENT INSURANCE SERVICES ${props.format2 === 'All' ? "" : props.format2}\n${props.dateFormat} Production Report (${props.type} - ${props.account})\nCut off Date: ${dateFormat(props.dateFormat, props.date)}`
    return newTitle
  }
  function dateFormat(dateFormat: string, date: Date) {
    if (dateFormat === 'Daily') {
      return format(date, 'MMMM d, yyyy')
    } else if (dateFormat === 'Monthly') {
      return format(date, 'MMMM yyyy')
    } else if (dateFormat === 'Yearly') {
      return format(date, 'yyyy')
    }
  }

  async function generateReport() {
    let FDate = ''
    let TDate = ''
    let date = new Date(dateRef.current?.value as any)
    const numYear = parseInt(numberRef.current?.value as any)


    if (dateFormatRef.current?.value === 'Daily') {
      FDate = format(date, "MM/dd/yyyy")
      TDate = format(date, "MM/dd/yyyy")
    } else if (dateFormatRef.current?.value === 'Monthly') {
      FDate = format(date, "MM/01/yyyy")
      TDate = format(lastDayOfMonth(date), "MM/dd/yyyy")
    } else if (dateFormatRef.current?.value === 'Yearly') {
      const adjustedDate = subYears(date, numYear);
      const firstDayOfMonth = setDate(adjustedDate, 1);
      FDate = format(firstDayOfMonth, 'MM/dd/yyyy');
      TDate = format(lastDayOfMonth(date), "MM/dd/yyyy")
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
      format: format1Ref.current?.selectedIndex
    }
    try {
      const response = await myAxios.post('/reports/reports/test-new-report', reportDetails, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);
    } catch (error) {
      console.error('SERVER ERROR :', error);
    }

  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      height: "100vh",
      backgroundColor: "#F1F1F1",

    }}>
      <div style={{
        border: "1px solid #94a3b8",
        width: "500px",
        height: "450px",
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
        padding: "20px",
        boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.75)"
      }}>
        <TextAreaInput
          label={{
            title: " ",
            style: {
              display: "none"
            },
          }}
          textarea={{
            rows: 6,
            style: { flex: 1, fontSize: "14px", },
            value: title,
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                //  refDate.current?.focus()
              }
            },
            onChange: (e) => {
              setTitle(e.target.value)
            },
          }}
          _inputRef={titleRef}
        />
        <div style={{ display: "flex", columnGap: "2px", width: "100%" }}>
          <SelectInput
            containerStyle={{
              flex: 1
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  // refInvoice.current?.focus()
                }
              }
            }}
            datasource={[
              { key: "Full" },
              { key: "Summary" },
            ]}
            values={"key"}
            display={"key"}
          />
          <SelectInput
            label={{
              title: "Format : ",
              style: {
                display: "none"
              },
            }}
            selectRef={format2Ref}
            select={{
              disabled: false,
              style: { width: "80px", height: "22px" },
              defaultValue: "All",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  // refInvoice.current?.focus()
                }
              },
              onChange: (e) => {
                setTitle(generateTitle({
                  format2: e.target.value,
                  type: TypeRef.current?.value,
                  account: accountRef.current?.value,
                  dateFormat: dateFormatRef.current?.value,
                  date: new Date(dateRef.current?.value as any)
                }))
              }
            }}
            datasource={[
              { key: "All" },
              { key: "Financed" },
            ]}
            values={"key"}
            display={"key"}
          />
        </div>
        <div style={{ display: "flex", columnGap: "2px", width: "100%" }}>
          <SelectInput
            containerStyle={{
              flex: 1
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  // refInvoice.current?.focus()
                }
              },
              onChange: (e) => {
                setDateFormatState(e.currentTarget.value)
                if (e.target.value === 'Yearly') {
                  if (numberRef.current)
                    numberRef.current.disabled = false
                } else {
                  if (numberRef.current)
                    numberRef.current.disabled = true
                }
                console.log(dateRef.current?.value)

                setTitle(generateTitle({
                  format2: format2Ref.current?.value,
                  type: e.target.value,
                  account: accountRef.current?.value,
                  dateFormat: dateFormatRef.current?.value,
                  date: new Date(dateRef.current?.value as any)
                }))
              }
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
                display: "none"
              },
            }}
            input={{
              disabled: true,
              type: "number",
              defaultValue: 0,
              style: { width: "80px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
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
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                e.preventDefault()
                // refInvoice.current?.focus()
              }
            },
            onChange: (e) => {
              setTitle(generateTitle({
                format2: format2Ref.current?.value,
                type: e.target.value,
                account: accountRef.current?.value,
                dateFormat: dateFormatRef.current?.value,
                date: new Date(dateRef.current?.value as any)
              }))
            }
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
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
              }
            },
            onChange: (e) => {
              setTitle(generateTitle({
                format2: format2Ref.current?.value,
                type: TypeRef.current?.value,
                account: accountRef.current?.value,
                dateFormat: dateFormatRef.current?.value,
                date: new Date(e.target.value as any)
              }))
            }
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
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                e.preventDefault()
                // refInvoice.current?.focus()
              }
            }
          }}
          datasource={[
            { key: "Regular" },
            { key: "Temporary" },
          ]}
          values={"key"}
          display={"key"}
        />
        <div style={{ flex: 1, border: "1px solid #94a3b8", padding: "10px", display: "flex", flexDirection: "column", rowGap: "10px" }}>
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  // refInvoice.current?.focus()
                }
              }
            }}
            datasource={[
              { key: "Date Issued" },
              { key: "Policy No#" },
              { key: "Date From" },
            ]}
            values={"key"}
            display={"key"}
          />
          {loadingAccount ? <div>Loading...</div> : <SelectInput
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  // refInvoice.current?.focus()
                }
              },
              onChange: (e) => {
                setTitle(generateTitle({
                  format2: format2Ref.current?.value,
                  type: TypeRef.current?.value,
                  account: e.target.value,
                  dateFormat: dateFormatRef.current?.value,
                  date: new Date(dateRef.current?.value as any)
                }))
              }
            }}
            datasource={dataAccount?.data.data}
            values={"Account"}
            display={"Account"}
          />}
        </div>
        <Button onClick={generateReport} color="success" variant="contained" sx={{ height: "22px", fontSize: "12px" }}>Generate Report</Button>
      </div>
    </div>
  )
}