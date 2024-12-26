
import { useContext, useRef, useState } from "react";
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";

import { Button } from "@mui/material";
import { DataGridViewReact } from "../../../../components/DataGridViewReact";
import { orange } from "@mui/material/colors";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { LoadingButton } from "@mui/lab";
import { wait } from "@testing-library/user-event/dist/utils";
import { addMonths, format } from "date-fns";

const columns = [
    { key: "Check_No", label: "Check No", width: 170 },
    { key: "Check_Date", label: "Check Date", width: 170 },
    { key: "Bank_Branch", label: "Bank/Branch", width: 300 },
    { key: "Acct_Code", label: "DR Code", width: 170 },
    { key: "Acct_Title", label: "DR Title", width: 300 },
    { key: "Deposit_Slip", label: "Deposit Slip", width: 170 },
]
export default function ChekPostponementRequest() {
    const { myAxios, user } = useContext(AuthContext)
    const table = useRef<any>(null)
    const [inputType, setInpuType] = useState('text')

    // first field
    const RPCDNoRef = useRef<HTMLInputElement>(null)
    const BranchRef = useRef<HTMLInputElement>(null)
    const PNNoRef = useRef<HTMLSelectElement>(null)
    const _PNNoRef = useRef<any>(null)
    const NameRef = useRef<HTMLSelectElement>(null)
    const _NameRef = useRef<any>(null)

    // second field
    const _CheckNoRef = useRef<any>(null)
    const CheckNoRef = useRef<HTMLSelectElement>(null)
    const NewDateRef = useRef<HTMLInputElement>(null)
    const DateRef = useRef<HTMLInputElement>(null)
    const ReasonRef = useRef<HTMLTextAreaElement>(null)
    const BankRef = useRef<HTMLInputElement>(null)
    const AmpountRef = useRef<HTMLInputElement>(null)

    // third field
    const HoldingFeesRef = useRef<HTMLInputElement>(null)
    const PenaltyChargeRef = useRef<HTMLInputElement>(null)
    const SurplusRef = useRef<HTMLInputElement>(null)
    const DeductedToRef = useRef<HTMLSelectElement>(null)
    const TotalRef = useRef<HTMLInputElement>(null)
    const HowToBePaidRef = useRef<HTMLSelectElement>(null)
    const RemarksRef = useRef<HTMLTextAreaElement>(null)

    // load pnno / name
    const {
        isLoading: isLoadingLoadPnnoData,
    } = useQuery({
        queryKey: 'load-pnno',
        queryFn: async () =>
            await myAxios.get(`/task/accounting/check-postponement/request/load-pnno`, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }
            const dt = response?.data.data
            if (dt.length > 0) {
                wait(100).then(() => {
                    _PNNoRef.current.setDataSource(dt)
                    _NameRef.current.setDataSource(dt)
                })
            }
        },
    });
    // load auto id
    const {
        isLoading: isLoadingLoadAutoIdData,
        refetch: loadARefetch
    } = useQuery({
        queryKey: 'auto-id',
        queryFn: async () =>
            await myAxios.get(`/task/accounting/check-postponement/request/auto-id`, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }

            const dt = response?.data.data
            if (dt.length > 0) {
                wait(100).then(() => {
                    if (RPCDNoRef.current) {
                        RPCDNoRef.current.value = `HORPCD${dt[0].Year}${dt[0].Count}`
                    }
                })
            }
        },
    });
    //load-check
    const {
        isLoading: isLoadingChecks,
        mutate: mutateChecks
    } = useMutation({
        mutationKey: 'load-checks',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/load-checks`, variable, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }
            _CheckNoRef.current.setDataSource(response?.data.data)
        },
    });
    //load check details
    const {
        isLoading: isLoadingCheckDetails,
        mutate: mutateCheckDetails
    } = useMutation({
        mutationKey: 'load-check-details',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/load-checks-details`, variable, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }
            const res = response?.data.data
            if (res.length > 0) {
                setInpuType('date')
                setTimeout(() => {
                    if (DateRef.current) {
                        DateRef.current.value = format(new Date(res[0].CheckDate), "yyyy-MM-dd")
                    }
                    if (BankRef.current) {
                        BankRef.current.value = res[0].Bank
                    }
                    if (AmpountRef.current) {
                        AmpountRef.current.value = res[0].Amount
                    }
                }, 100);
            } else {
                setInpuType('text')
                setTimeout(() => {
                    if (DateRef.current) {
                        DateRef.current.value = ''
                    }
                    if (BankRef.current) {
                        BankRef.current.value = ''
                    }
                    if (AmpountRef.current) {
                        AmpountRef.current.value = ''
                    }
                }, 100);
            }

        },
    });

    function handleAddCheck() {
        if (((BankRef.current && BankRef.current.value === '') || (BankRef.current && BankRef.current.value === null) || (BankRef.current && BankRef.current.value === undefined)) || ((CheckNoRef.current && CheckNoRef.current.value === '') || (CheckNoRef.current && CheckNoRef.current.value === null) || (CheckNoRef.current && CheckNoRef.current.value === undefined)))
            return alert('Incomplete details!')

            


    }



    return (
        <div style={{
            padding: "10px",
            background: "#F1F1F1",
            height: "100%"
        }}>
            {/* ===========  first field  =========== */}
            <div
                style={{
                    position: "relative",
                    padding: "12px",
                    borderLeft: "1px solid #d1d5db",
                    borderRight: "1px solid #d1d5db",
                    borderTop: "1px solid #d1d5db",
                }}>
                <span
                    style={{
                        fontSize: "12px",
                        position: "absolute",
                        top: "-10px",
                        left: "20px",
                        background: "#F1F1F1",
                        padding: "0 5px"
                    }}
                >Account Informations</span>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px"
                    }}
                >
                    {isLoadingLoadAutoIdData ? <LoadingButton loading={isLoadingLoadAutoIdData} /> : <TextInput
                        containerStyle={{
                            width: "50%",
                            marginBottom: "8px"
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
                                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                }
                            },
                        }}
                        inputRef={RPCDNoRef}
                    />}

                    <TextInput
                        containerStyle={{
                            width: "50%",
                            marginBottom: "8px"
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
                                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                }
                            },
                        }}
                        inputRef={BranchRef}
                    />

                </div>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px"
                    }}
                >
                    {isLoadingLoadPnnoData ? <LoadingButton loading={isLoadingLoadPnnoData} /> :
                        <SelectInput
                            ref={_PNNoRef}
                            label={{
                                title: "PN NO: :",
                                style: {
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    width: "80px",
                                },
                            }}
                            selectRef={PNNoRef}
                            select={{
                                style: { flex: 1, height: "22px" },
                                defaultValue: "Non-VAT",
                                onChange: (e) => {
                                    const data = _PNNoRef.current.getDataSource()
                                    const res = data.filter((itm: any) => itm.PNo === e.target.value)
                                    mutateChecks({
                                        PNNo: res[0].PNo,
                                    })

                                    if (PNNoRef.current) {
                                        PNNoRef.current.value = res[0].PNo
                                    }
                                    if (BranchRef.current) {
                                        BranchRef.current.value = res[0].BName
                                    }
                                    if (NameRef.current) {
                                        NameRef.current.value = res[0].Name
                                    }

                                }

                            }}
                            containerStyle={{
                                width: "50%",
                                marginBottom: "12px"
                            }}
                            datasource={[]}
                            values={"PNo"}
                            display={"PNo"}
                        />}
                    {isLoadingLoadPnnoData ?
                        <LoadingButton loading={isLoadingLoadPnnoData} /> :
                        <SelectInput
                            ref={_NameRef}
                            label={{
                                title: "Account Name :",
                                style: {
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    width: "110px",
                                },
                            }}
                            selectRef={NameRef}
                            select={{
                                style: { flex: 1, height: "22px" },
                                defaultValue: "Non-VAT",
                                onChange: (e) => {

                                    const data = _NameRef.current.getDataSource()
                                    const res = data.filter((itm: any) => itm.Name === e.target.value)

                                    mutateChecks({
                                        PNNo: res[0].PNo,
                                    })
                                    if (PNNoRef.current) {
                                        PNNoRef.current.value = res[0].PNo
                                    }
                                    if (BranchRef.current) {
                                        BranchRef.current.value = res[0].BName
                                    }
                                    if (NameRef.current) {
                                        NameRef.current.value = res[0].Name
                                    }
                                }

                            }}
                            containerStyle={{
                                width: "50%",
                                marginBottom: "12px"
                            }}
                            datasource={[]}
                            values={"Name"}
                            display={"Name"}
                        />}
                </div>
            </div>
            {/* ===========  second field  =========== */}
            <div
                style={{
                    position: "relative",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                }}>
                <span
                    style={{
                        fontSize: "12px",
                        position: "absolute",
                        top: "-10px",
                        left: "20px",
                        background: "#F1F1F1",
                        padding: "0 5px"
                    }}
                >Check Details :</span>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px"
                    }}
                >

                    {isLoadingLoadAutoIdData ? <LoadingButton loading={isLoadingChecks} /> :

                        <SelectInput
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
                                style: { flex: 1, height: "22px" },
                                defaultValue: "",
                                onChange: (e) => {
                                    mutateCheckDetails({ checkNo: e.target.value, PNNo: PNNoRef.current?.value })
                                }

                            }}
                            containerStyle={{
                                width: "50%",
                                marginBottom: "12px"
                            }}
                            datasource={[]}
                            values={"CheckNo"}
                            display={"CheckNo"}
                        />}
                    <TextInput
                        containerStyle={{
                            width: "50%",
                            marginBottom: "8px"
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
                            type: inputType,
                            value: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
                            style: { width: "calc(100% - 100px)" },
                            onKeyDown: (e) => {
                                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                }
                            },
                        }}
                        inputRef={NewDateRef}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px",
                        width: "100%",
                    }}
                >

                    {isLoadingCheckDetails ? <span>Loading...</span> : <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "50%",
                    }}>
                        <TextInput
                            containerStyle={{
                                width: "100%",
                                marginBottom: "8px"
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
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                },
                            }}
                            inputRef={DateRef}
                        />
                        <TextInput
                            containerStyle={{
                                width: "100%",
                                marginBottom: "8px"
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
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                },
                            }}
                            inputRef={BankRef}
                        />
                    </div>}
                    <div
                        style={{
                            width: "50%"
                        }}
                    >
                        <TextAreaInput
                            label={{
                                title: "Reason : ",
                                style: {
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    width: "110px",

                                },
                            }}
                            textarea={{
                                rows: 3,
                                style: { flex: 1 },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                        //  refDate.current?.focus()
                                    }
                                },
                                onChange: (e) => {

                                },
                            }}
                            _inputRef={ReasonRef}
                        />
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px",
                        justifyContent: "space-between"
                    }}
                >
                    {isLoadingCheckDetails ? <span>Loading...</span> : <TextFormatedInput
                        label={{
                            title: "Amount : ",
                            style: {
                                fontSize: "12px",
                                fontWeight: "bold",
                                width: "80px",
                            },
                        }}
                        containerStyle={{
                            width: "50%"
                        }}
                        input={{
                            disabled: true,
                            type: "text",
                            style: { width: "calc(100% - 105px)" },
                            onKeyDown: (e) => {
                                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                }
                            }
                        }}
                        inputRef={AmpountRef}
                    />}
                    <Button
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
            <DataGridViewReact
                ref={table}
                columns={columns}
                rows={[]}
                containerStyle={{
                    height: '180px',
                }}
                getSelectedItem={(rowItm: any) => {
                    if (rowItm) {



                    } else {

                    }
                }}
                onKeyDown={(rowItm: any, rowIdx: any, e: any) => {
                    if (e.code === 'Delete' || e.code === 'Backspace') {

                    }
                }}
            />
            {/* ===========  third field  =========== */}
            <div
                style={{
                    position: "relative",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    marginTop: "10px"

                }}>
                <span
                    style={{
                        fontSize: "12px",
                        position: "absolute",
                        top: "-10px",
                        left: "20px",
                        background: "#F1F1F1",
                        padding: "0 5px"
                    }}
                >Fees and Charges</span>
                <div
                    style={{
                        display: "flex",
                        columnGap: "50px",
                    }}
                >
                    <div style={{
                        flex: 1,
                        display: "flex",
                        rowGap: "10px",
                        flexDirection: "column"

                    }}>
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
                                width: "100%"
                            }}
                            input={{
                                type: "text",
                                style: { width: "calc(100% - 100px)" },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                }
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
                                width: "100%"
                            }}
                            input={{
                                type: "text",
                                style: { width: "calc(100% - 100px)" },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                }
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
                                width: "100%"
                            }}
                            input={{
                                type: "text",
                                style: { width: "calc(100% - 100px)" },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                }
                            }}
                            inputRef={SurplusRef}
                        />
                        <SelectInput
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
                                style: { flex: 1, height: "22px" },
                                defaultValue: "Non-VAT",
                                onChange: (e) => {

                                }

                            }}
                            containerStyle={{
                                width: "100%",
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
                                width: "100%"
                            }}
                            input={{
                                type: "text",
                                style: { width: "calc(100% - 100px)" },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                    }
                                }
                            }}
                            inputRef={TotalRef}
                        />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <SelectInput
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
                                style: { flex: 1, height: "22px" },
                                defaultValue: "Non-VAT",
                                onChange: (e) => {

                                }

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
                        <label
                            htmlFor="remarks"
                            style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                            }}>Name of Bank && Branch / Date && Time of deposit :</label>
                        <TextAreaInput
                            label={{
                                title: "Reason : ",
                                style: {
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    width: "110px",
                                    display: "none"
                                },
                            }}
                            textarea={{
                                rows: 4,
                                style: { flex: 1 },
                                id: 'remarks',
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                        //  refDate.current?.focus()
                                    }
                                },
                                onChange: (e) => {

                                },
                            }}
                            _inputRef={RemarksRef}
                        />
                        <div style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            columnGap: "7px"
                        }}>
                            <Button
                                variant="contained"
                                color="info"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {
                                    loadARefetch()
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                    background: orange[800]
                                }}
                                onClick={(e) => {

                                }}
                            >
                                edit
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={async (e) => {


                                }}
                            >
                                save
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {

                                }}
                            >
                                cancel
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}