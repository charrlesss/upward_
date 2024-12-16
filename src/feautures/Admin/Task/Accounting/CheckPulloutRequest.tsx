import { LoadingButton } from "@mui/lab"
import { Autocomplete } from "./PettyCash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import { DataGridViewReact } from "../../../../components/DataGridViewReact";
import { Button } from "@mui/material";
import { orange } from "@mui/material/colors";
const column = [
    {
        key: "Check_Date",
        label: "Date",
        width: 100,
    },
    {
        key: "Bank",
        label: "Bank",
        width: 200,
    },
    { key: "Check_No", label: "Check No", width: 170 },
    { key: "Check_Amnt", label: "Amount", width: 120 },
    { key: "Status", label: "Status", width: 300 },
    { key: "RCPNO", label: "", width: 170 },
]

export default function CheckPulloutRequest() {
    const { executeQueryToClient } = useExecuteQueryFromClient()
    const [flag, setFlag] = useState('')
    const [paymentTypeLoading, setPaymentTypeLoading] = useState(false)
    const [pdcAtributeData, setPdcAtributeData] = useState<Array<any>>([])

    const executeQueryToClientRef = useRef(executeQueryToClient)
    const table = useRef<any>(null)

    const rcpnRef = useRef<HTMLInputElement>(null)
    const ppnoRef = useRef<HTMLSelectElement>(null)
    const nameRef = useRef<HTMLSelectElement>(null)
    const reasonRef = useRef<HTMLSelectElement>(null)


    const btnAddRef = useRef<HTMLButtonElement>(null)
    const btnEditRef = useRef<HTMLButtonElement>(null)
    const btnSaveRef = useRef<HTMLButtonElement>(null)
    const btnCancelRef = useRef<HTMLButtonElement>(null)


    const LoadPNNo = useCallback(async () => {
        setPaymentTypeLoading(true)
        const qry = `SELECT DISTINCT PNo, Name FROM PDC WHERE PDC_Status = 'Stored' order by PNo DESC`
        const { data: response } = await executeQueryToClientRef.current(qry)
        setPdcAtributeData(response.data)
        setPaymentTypeLoading(false)
    }, [])


    const AutoID = async () => {
        const qry = `
        SELECT
            right(year(curdate()) ,2) as Year,
            lpad(COUNT(1) + 1, 4, '0') as Count
        FROM pullout_request
            where substring(RCPNo,5,2) = right(year(curdate()) ,2) and Branch = 'HO'`

        const { data: response } = await executeQueryToClientRef.current(qry)

        if (rcpnRef.current)
            rcpnRef.current.value = `HOPO${response.data[0].Year}${response.data[0].Count}`

    }


    useEffect(() => {
        LoadPNNo()
    }, [LoadPNNo])



    return <div style={{
        flex: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }}>
        <div style={{
            padding: "10px",
            width: "70%",
            border: "1px sold black",
            height: "500px",
            boxShadow: "1px 1px 2px 2px black",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                height: "auto"
            }}>
                {
                    flag === 'edit' && (
                        <>
                            {paymentTypeLoading ?
                                <LoadingButton loading={paymentTypeLoading} />
                                : <div
                                    style={{
                                        width: "50%",
                                        marginBottom: "8px"
                                    }}>
                                    <Autocomplete
                                        label={
                                            {
                                                title: "PN No. :",
                                                style: {
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    width: "100px",
                                                },
                                            }
                                        }
                                        input={{
                                            id: "auto-solo-collection",
                                            style: {
                                                width: "100%",
                                                flex: 1
                                            }
                                        }}
                                        width={"100%"}
                                        DisplayMember={'PNo'}
                                        DataSource={pdcAtributeData}
                                        inputRef={ppnoRef}
                                        onChange={(selected: any, e: any) => {

                                        }}
                                        onKeydown={(e: any) => {
                                            if (e.key === "Enter" || e.key === 'NumpadEnter') {
                                                e.preventDefault()
                                            }
                                        }}
                                    />
                                </div>}
                        </>
                    )
                }
                {(flag === '' || flag === 'add') && <TextInput
                    containerStyle={{
                        width: "50%",
                        marginBottom: "8px"
                    }}
                    label={{
                        title: "Client Name : ",
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
                        onKeyDown: (e) => {
                            if (e.code === "NumpadEnter" || e.code === 'Enter') {
                            }
                        },
                    }}
                    inputRef={rcpnRef}
                />}
                {paymentTypeLoading ?
                    <LoadingButton loading={paymentTypeLoading} />
                    : <div
                        style={{
                            width: "50%",
                            marginBottom: "8px"
                        }}>
                        <Autocomplete
                            disableInput={flag === '' || flag === 'edit'}
                            label={
                                {
                                    title: "PN No. :",
                                    style: {
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        width: "100px",
                                    },
                                }
                            }
                            input={{
                                id: "auto-solo-collection",
                                style: {
                                    width: "100%",
                                    flex: 1
                                }
                            }}
                            width={"100%"}
                            DisplayMember={'PNo'}
                            DataSource={pdcAtributeData}
                            inputRef={ppnoRef}
                            onChange={(selected: any, e: any) => {
                                if (ppnoRef.current)
                                    ppnoRef.current.value = selected.PNo
                                if (nameRef.current)
                                    nameRef.current.value = selected.Name

                            }}
                            onKeydown={(e: any) => {
                                if (e.key === "Enter" || e.key === 'NumpadEnter') {
                                    e.preventDefault()
                                }
                            }}
                        />
                    </div>}
                {paymentTypeLoading ?
                    <LoadingButton loading={paymentTypeLoading} />
                    : <div style={{ width: "50%", marginBottom: "8px" }}>
                        <Autocomplete
                            disableInput={flag === '' || flag === 'edit'}

                            label={
                                {
                                    title: "Client :",
                                    style: {
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        width: "100px",
                                    },
                                }
                            }
                            input={{
                                id: "auto-solo-collection",
                                style: {
                                    width: "100%",
                                    flex: 1,
                                }
                            }}
                            width={"100%"}
                            DisplayMember={'Name'}
                            DataSource={pdcAtributeData}
                            inputRef={nameRef}
                            onChange={(selected: any, e: any) => {

                            }}
                            onKeydown={(e: any) => {
                                if (e.key === "Enter" || e.key === 'NumpadEnter') {
                                    e.preventDefault()
                                }
                            }}
                        />
                    </div>}
                <SelectInput
                    label={{
                        title: "Vat Type : ",
                        style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                        },
                    }}
                    selectRef={reasonRef}
                    select={{
                        disabled: flag === '',
                        style: { flex: 1, height: "22px" },
                        defaultValue: "Non-VAT",

                    }}
                    containerStyle={{
                        width: "50%",
                        marginBottom: "12px"
                    }}
                    datasource={[
                        { key: "", value: "" },
                        { key: "Fully Paid", value: "Fully Paid" },
                        { key: "Cash Replacement", value: "Cash Replacement" },
                        { key: "Check Replacement", value: "Check Replacement" },
                        { key: "Account Closed", value: "Account Closed" },
                        { key: "Hold", value: "Hold" },
                        { key: "Not Renewed by Camfin", value: "Not Renewed by Camfin" },
                    ]}
                    values={"value"}
                    display={"key"}
                />

            </div>
            <DataGridViewReact
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
                onKeyDown={(rowItm: any, rowIdx: any, e: any) => {

                }}
            />
            <div style={{
                height: "35px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                columnGap: "5px"
            }}>
                {flag === '' ? (
                    <>
                        <Button
                            ref={btnAddRef}
                            variant="contained"
                            color="info"
                            style={{
                                height: "25px",
                                fontSize: "12px",
                            }}
                            onClick={(e) => {
                                setFlag('add')
                                AutoID()
                                if (btnSaveRef.current)
                                    btnSaveRef.current.disabled = false
                            }}
                        >
                            Add
                        </Button>
                        <Button
                            ref={btnEditRef}
                            variant="contained"
                            color="success"
                            style={{
                                height: "25px",
                                fontSize: "12px",
                                background: orange[800]
                            }}
                            onClick={(e) => {
                                setFlag('edit')
                            }}
                        >
                            edit
                        </Button>
                    </>
                ) :
                    (
                        <>
                            <Button
                                ref={btnSaveRef}
                                variant="contained"
                                color="success"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {

                                }}
                            >
                                save
                            </Button>
                            <Button
                                ref={btnCancelRef}
                                variant="contained"
                                color="error"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {
                                    setFlag('')
                                }}
                            >
                                cancel
                            </Button>
                        </>
                    )}
            </div>
        </div>

    </div>
}