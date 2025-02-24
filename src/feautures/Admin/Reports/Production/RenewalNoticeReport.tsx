import { useContext, useRef, useState } from "react"
import { AuthContext } from "../../../../components/AuthContext"
import { SelectInput, TextAreaInput, TextInput } from "../../../../components/UpwardFields"
import { format } from "date-fns"
import { Button } from "@mui/material"
import { useQuery } from "react-query"
import PageHelmet from "../../../../components/Helmet"
import { Loading } from "../../../../components/Loading"


export default function RenewalNoticeReport() {
  const { user, myAxios } = useContext(AuthContext)
  const [title, setTitle] = useState(generateTitle({
    format2: "All",
    type: "COM",
    account: "All",
    dateFormat: "Monthly",
    date: new Date()
  }))

 
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const format2Ref = useRef<HTMLSelectElement>(null)
  const dateFormatRef = useRef<HTMLSelectElement>(null)
  const TypeRef = useRef<HTMLSelectElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const policyTypeRef = useRef<HTMLSelectElement>(null)
  const accountRef = useRef<HTMLSelectElement>(null)
  const _accountRef = useRef<any>(null)

  function generateTitle(props: any) {
    const newTitle: string = `UPWARD MANAGEMENT INSURANCE SERVICES \nMonthly Renewal Notice Report (${props.type} - ${props.account})\nCut off Date: ${format(new Date(props.date), 'MMMM yyyy')}`
    return newTitle
  }

  const {
    isLoading: loadingAccount,
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
      if(_accountRef.current)
      _accountRef.current.setDataSource(response.data.data)
      
    },
  });


  async function generateReport() {
    const reportDetails: any = {
      date: new Date(dateRef.current?.value as any),
      account: `${accountRef.current?.value}`,
      type: policyTypeRef.current?.value,
      policy: TypeRef.current?.value,
      title,

    }
    try {
      const response = await myAxios.post('/reports/reports/renewal-notice', reportDetails, {
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
    <>
    <PageHelmet title={"Renewal Notice Report"} />
    {loadingAccount && <Loading />}
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

        <SelectInput
          label={{
            title: "Policy : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{
            // flex: 1,
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
            { key: "COM" },
            { key: "FIRE" },
            { key: "MAR" },
            { key: "PA" },
          ]}
          values={"key"}
          display={"key"}
        />
        <SelectInput
          ref={_accountRef}
          label={{
            title: "Account : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "90px",
            },
          }}
          containerStyle={{
            // flex: 1,
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
          datasource={[]}
          values={"Account"}
          display={"Account"}
        />
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
            // flex: 1,
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
        <TextInput
          containerStyle={{
            // flex: 1,
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
        <Button onClick={generateReport} color="success" variant="contained" sx={{ height: "22px", fontSize: "12px" }}>Generate Report</Button>
      </div>
    </div>
    </>

    )
}