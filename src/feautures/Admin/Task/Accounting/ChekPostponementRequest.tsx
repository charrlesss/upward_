
import { useContext, useRef, useState } from "react";
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../components/UpwardFields";

import { Button } from "@mui/material";
import { DataGridViewReact } from "../../../../components/DataGridViewReact";
import { orange } from "@mui/material/colors";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { LoadingButton } from "@mui/lab";
import { wait } from "@testing-library/user-event/dist/utils";
import { addMonths, differenceInDays, format } from "date-fns";
import { Loading } from "../../../../components/Loading";
import Swal from "sweetalert2";

const columns = [
    { key: "ln", label: "#", width: 40 },
    { key: "CheckNo", label: "Check No", width: 120 },
    { key: "Bank", label: "Bank", width: 200 },
    { key: "Amount", label: "Amount", width: 120 },
    { key: "OldDepositDate", label: "Old Deposit Date", width: 200 },
    { key: "NewDate", label: "New Deposit Date", width: 200 },
    { key: "Penalty", label: "Penalty", width: 120 },
    { key: "Datediff", label: "Datediff", width: 120 },
    { key: "Reason", label: "Reason", width: 200 },
]

export default function ChekPostponementRequest() {
    const { myAxios, user } = useContext(AuthContext)
    const table = useRef<any>(null)
    const [inputType, setInpuType] = useState('text')
    const [reason, setReason] = useState('')
    const [paid, setPaid] = useState('')
    const [remarks, setRemarks] = useState('')
    const [mode, setMode] = useState('')

    // first field
    const RPCDNoRef = useRef<HTMLInputElement>(null)
    const BranchRef = useRef<HTMLInputElement>(null)
    const PNNoRef = useRef<HTMLSelectElement>(null)
    const _PNNoRef = useRef<any>(null)
    const NameRef = useRef<HTMLSelectElement>(null)
    const _NameRef = useRef<any>(null)

    //edit sub refs
    const RPCDNoSubRef = useRef<HTMLSelectElement>(null)
    const _RPCDNoSubRef = useRef<any>(null)

    const PNNoSubRef = useRef<HTMLInputElement>(null)
    const PNNoSubNameRef = useRef<HTMLInputElement>(null)


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
                    if (mode === 'edit') return

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
    //load check RPCDNo
    const {
        isLoading: isLoadingLoadRPCDNo,
        mutate: mutateLoadRPCDNo
    } = useMutation({
        mutationKey: 'load-rpcdno',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/load-rpcdno`, variable, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }
            const res = response?.data.data


            wait(100).then(() => {
                _RPCDNoSubRef.current.setDataSource(res)
            })

        },
    });
    //load check RPCDNo
    const {
        isLoading: isLoadingLoadRPCDNoDetails,
        mutate: mutateLoadRPCDNoDetails
    } = useMutation({
        mutationKey: 'load-rpcd-details',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/load-rpcd-details`, variable, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }
            const selected = response.data.data
            wait(100).then(() => {
                if (PNNoSubRef.current) {
                    PNNoSubRef.current.value = selected[0].PNNO
                }
                if (PNNoSubNameRef.current) {
                    PNNoSubNameRef.current.value = selected[0].Name
                }
                if (HowToBePaidRef.current) {
                    HowToBePaidRef.current.value = selected[0].PaidVia
                }
                if (BranchRef.current) {
                    BranchRef.current.value = 'HO'
                }
                if (RemarksRef.current) {
                    RemarksRef.current.value = selected[0].PaidInfo
                }
                if (SurplusRef.current) {
                    SurplusRef.current.value = selected[0].Surplus
                }
                if (DeductedToRef.current) {
                    DeductedToRef.current.value = selected[0].Deducted_to
                }

                const data = selected.map((itm: any, idx: number) => {
                    const Datediff = differenceInDays(new Date(itm.NewCheckDate as any), new Date(itm.OldCheckDate))
                    return {
                        ln: `${idx + 1}`,
                        OldDepositDate: itm.OldCheckDate,
                        Bank: itm.Bank,
                        CheckNo: itm.CheckNo,
                        Amount: itm.check_Amnt,
                        NewDate: itm.NewCheckDate,
                        Reason: itm.Reason,
                        Datediff,
                    }
                });

                table.current.setDataFormated(data)


            })
        },
    });
    // check add row
    const {
        isLoading: isLoadingCheckIsPending,
        mutate: mutateCheckIsPending
    } = useMutation({
        mutationKey: 'check-is-pending',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/check-is-pending`, variable, {
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
                return alert(` Pending Request \nRPCD No.: ${res[0].RPCDNo}!`)
            }
            const tableData = table.current.getData()
            if (tableData.some((itm: any) => itm[1] === CheckNoRef.current?.value)) {
                return alert('Already added')
            }
            const Datediff = differenceInDays(new Date(NewDateRef.current?.value as any), new Date(DateRef.current?.value as any))

            if (Datediff <= 0) {
                return alert('Invalid date for deposit')
            }
            const formatedTableData = tableData.map((itm: any) => {
                return {
                    ln: itm[0],
                    CheckNo: itm[1],
                    Bank: itm[2],
                    Amount: itm[3],
                    OldDepositDate: itm[4],
                    NewDate: itm[5],
                    Penalty: itm[6],
                    Datediff: itm[7],
                    Reason: itm[8],
                }
            })
            const newData = [
                ...formatedTableData,
                {
                    ln: tableData.length + 1,
                    CheckNo: CheckNoRef.current?.value,
                    Bank: BankRef.current?.value,
                    Amount: AmpountRef.current?.value,
                    OldDepositDate: DateRef.current?.value,
                    NewDate: NewDateRef.current?.value,
                    Penalty: '',
                    Datediff,
                    Reason: ReasonRef.current?.value,
                }
            ]
            table.current.setDataFormated(newData)
            resetSecondFields()
        },
    });
    // saving
    const {
        isLoading: isLoadingSave,
        mutate: mutateSave
    } = useMutation({
        mutationKey: 'saving',
        mutationFn: async (variable: any) =>
            await myAxios.post(`/task/accounting/check-postponement/request/saving`, variable, {
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
            }),
        onSuccess(response) {
            if (!response.data.success) {
                return alert(response.data.message)
            }

            return Swal.fire({
                position: "center",
                icon: "success",
                title: response.data.message,
                timer: 1500,
            });



        },
    });

    function handleAddCheck() {
        if ((
            (BankRef.current && BankRef.current.value === '') ||
            (BankRef.current && BankRef.current.value === null) ||
            (BankRef.current && BankRef.current.value === undefined))
            ||
            (
                (CheckNoRef.current && CheckNoRef.current.value === '') ||
                (CheckNoRef.current && CheckNoRef.current.value === null) ||
                (CheckNoRef.current && CheckNoRef.current.value === undefined))
        ) {
            return alert('Incomplete details!')
        }

        mutateCheckIsPending({ checkNo: CheckNoRef.current?.value })
    }

    function resetSecondFields() {
        if (CheckNoRef.current) {
            CheckNoRef.current.value = ''
        }

        if (DateRef.current) {
            DateRef.current.value = ''
        }
        if (ReasonRef.current) {
            ReasonRef.current.value = ''
        }
        if (BankRef.current) {
            BankRef.current.value = ''
        }
        if (AmpountRef.current) {
            AmpountRef.current.value = ''
        }
        setInpuType('text')
    }

    function handleOnSave() {
        const data = table.current.getData()
        if (mode === 'add') {
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
                        PNNoRef: PNNoRef.current?.value,
                        HoldingFeesRef: HoldingFeesRef.current?.value,
                        PenaltyChargeRef: PenaltyChargeRef.current?.value,
                        HowToBePaidRef: HowToBePaidRef.current?.value,
                        RemarksRef: RemarksRef.current?.value,
                        BranchRef: BranchRef.current?.value,
                        SurplusRef: SurplusRef.current?.value,
                        DeductedToRef: DeductedToRef.current?.value,
                        Prepared_By: user?.username,
                        data: JSON.stringify(data)
                    })
                }
            });


        } else if (mode === 'edit') {

        }
    }


    return (
        <div style={{
            padding: "10px",
            background: "#F1F1F1",
            height: "100%"
        }}>
            {(isLoadingCheckIsPending || isLoadingSave || isLoadingLoadRPCDNoDetails) && <Loading />}
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
                    {
                        mode === 'edit' ?
                            isLoadingLoadRPCDNo ? <LoadingButton loading={isLoadingLoadRPCDNo} /> :
                                <SelectInput
                                    ref={_RPCDNoSubRef}
                                    label={{
                                        title: "RPCD no. :",
                                        style: {
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            width: "80px",
                                        },
                                    }}
                                    selectRef={RPCDNoSubRef}
                                    select={{
                                        style: { flex: 1, height: "22px" },
                                        defaultValue: "",
                                        onChange: (e) => {
                                            mutateLoadRPCDNoDetails({ RPCDNo: e.target.value })
                                        }

                                    }}
                                    containerStyle={{
                                        width: "50%",
                                        marginBottom: "12px"
                                    }}
                                    datasource={[]}
                                    values={"RPCDNo"}
                                    display={"RPCDNo"}
                                />
                            :
                            isLoadingLoadAutoIdData ? <LoadingButton loading={isLoadingLoadAutoIdData} /> :
                                <TextInput
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
                                />

                    }

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
                    {
                        mode === 'edit' ? <>
                            {isLoadingLoadRPCDNoDetails ? <LoadingButton loading={isLoadingLoadRPCDNoDetails} /> : <TextInput
                                containerStyle={{
                                    width: "50%",
                                    marginBottom: "8px"
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
                                    disabled: true,
                                    type: "text",
                                    style: { width: "calc(100% - 80px)" },
                                    onKeyDown: (e) => {
                                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                        }
                                    },
                                }}
                                inputRef={PNNoSubRef}
                            />}

                        </> : <>

                            {isLoadingLoadPnnoData ? <LoadingButton loading={isLoadingLoadPnnoData} /> :
                                <SelectInput
                                    ref={_PNNoRef}
                                    label={{
                                        title: "PN NO : ",
                                        style: {
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            width: "80px",
                                        },
                                    }}
                                    selectRef={PNNoRef}
                                    select={{
                                        disabled: mode === '',
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
                        </>
                    }



                    {
                        mode === 'edit' ? <>
                            {isLoadingLoadRPCDNoDetails ? <LoadingButton loading={isLoadingLoadPnnoData} /> : <TextInput
                                containerStyle={{
                                    width: "50%",
                                    marginBottom: "8px"
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
                                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                        }
                                    },
                                }}
                                inputRef={PNNoSubNameRef}
                            />}
                        </> :
                            <>

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
                                            disabled: mode === '',
                                            style: { flex: 1, height: "22px" },
                                            defaultValue: "",
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
                            </>


                    }
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
                                disabled: mode === '',
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
                            disabled: mode === '',
                            type: 'date',
                            defaultValue: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
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
                                disabled: mode === '',
                                rows: 3,
                                style: { flex: 1 },
                                onKeyDown: (e) => {
                                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                        //  refDate.current?.focus()
                                    }
                                },
                                onChange: (e) => {
                                    setReason(e.target.value)
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
                        disabled={reason === ''}
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
                getSelectedItem={(rowItm: any, _: any, rowIdx: any) => {
                    if (rowItm) {
                        const isConfim = window.confirm(`Are you sure you want to delete?`)
                        if (isConfim) {
                            const tableData = table.current.getData()
                            tableData.splice(rowIdx, 1);
                            table.current.setDataFormated(tableData)
                        }

                        table.current.setSelectedRow(null)
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
                                defaultValue: "0.00",
                                disabled: mode === '',
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
                                defaultValue: "0.00",
                                disabled: mode === '',
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
                                defaultValue: "0.00",
                                disabled: mode === '',
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
                                disabled: mode === '',
                                style: { flex: 1, height: "22px" },
                                defaultValue: "Non-VAT",
                            }}
                            containerStyle={{
                                width: "100%",
                                marginBottom: "12px"
                            }}
                            datasource={[
                                { key: "", value: "" },
                                { key: "Penalties", value: "Penalties" },
                                { key: "Loan Amortization", value: "Loan Amortization" },
                                { key: "Loan Amort.-Other Charges", value: "Loan Amort.-Other Charges" },
                                { key: "Miscellaneous Income", value: "Miscellaneous Income" },
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
                                defaultValue: "0.00",
                                disabled: mode === '',
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
                                disabled: mode === '',
                                style: { flex: 1, height: "22px" },
                                value: paid,
                                onChange: (e) => {
                                    setPaid(e.target.value)
                                    setRemarks('')
                                }
                            }}
                            containerStyle={{
                                width: "50%",
                                marginBottom: "12px"
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
                            }}>Name of Bank && Branch / Date && Time of deposit :</label>
                        <TextAreaInput
                            label={{
                                title: "",
                                style: {
                                    display: "none"
                                },
                            }}
                            textarea={{
                                disabled: mode === '' || paid === '' || paid === 'Over-The-Counter',
                                rows: 4,
                                style: { flex: 1 },
                                id: 'remarks',
                                value: remarks,
                                onChange: (e) => {
                                    setRemarks(e.target.value)
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
                                disabled={mode !== ''}
                                variant="contained"
                                color="info"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {
                                    loadARefetch()
                                    setMode('add')
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                disabled={mode !== ''}
                                variant="contained"
                                color="success"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                    background: orange[800]
                                }}
                                onClick={(e) => {
                                    setMode('edit')
                                    mutateLoadRPCDNo({})
                                }}
                            >
                                edit
                            </Button>
                            <Button
                                disabled={mode === '' || paid === '' || (paid === 'Direct Deposit' && remarks === '')}
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
                                disabled={mode === ''}
                                variant="contained"
                                color="error"
                                style={{
                                    height: "25px",
                                    fontSize: "12px",
                                }}
                                onClick={(e) => {
                                    setMode('')
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