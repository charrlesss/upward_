import {
    useState, useRef,
    forwardRef, useEffect,
    useImperativeHandle,

} from "react";
import useExecuteQueryFromClient from "../lib/executeQueryFromClient";
import SearchIcon from '@mui/icons-material/Search';
import { TextInput } from "./UpwardFields";
import { wait } from "../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOMServer from "react-dom/server";

export const DataGridViewReact = forwardRef(({
    columns,
    rows = [],
    height = "400px",
    getSelectedItem,
    onKeyDown,
    disbaleTable = false,
    isTableSelectable = true,
    containerStyle,
    focusElementOnMaxTop
}: any, ref) => {
    const parentElementRef = useRef<any>(null)
    const tbodyRef = useRef<HTMLTableSectionElement>(null)
    const [data, setData] = useState([])
    const [column, setColumn] = useState([])
    const [selectedRow, setSelectedRow] = useState<any>(0)
    const [selectedRowIndex, setSelectedRowIndex] = useState<any>(null)
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)

    useEffect(() => {
        if (columns.length > 0) {
            setColumn(columns.filter((itm: any) => !itm.hide))
        }
    }, [columns])

    useImperativeHandle(ref, () => ({
        checkNoIsExist: (checkNo: string) => {
            return data.some((subArray: any) => subArray[2] === checkNo);
        },
        selectedRow: () => selectedRow,
        getData: () => {
            const newData = [...data];
            return newData
        },
        setData: (newData: any) => {
            setData(newData)
        },
        getColumns: () => {
            return columns
        },
        resetTable: () => {
            setData([])
            setSelectedRow(0)
            setSelectedRowIndex(null)
        },
        getSelectedRow: () => {
            return selectedRowIndex
        },
        setSelectedRow: (value: any) => {
            return setSelectedRowIndex(value)
        },
        _setSelectedRow: (value: any) => {
            return setSelectedRow(value)
        },
        setDataFormated: (newData: any) => {
            setData(newData.map((itm: any) => {
                return columns.map((col: any) => itm[col.key])
            }))
        },
        getDataFormatted: () => {
            const newData = [...data];
            const newDataFormatted = newData.map((itm: any) => {
                let newItm = {
                    Check_No: itm[0],
                    Check_Date: itm[1],
                    Check_Amnt: itm[2],
                    BankName: itm[3],
                    Branch: itm[4],
                    Check_Remarks: itm[5],
                    Deposit_Slip: itm[6],
                    DateDeposit: itm[7],
                    OR_No: itm[8],
                    BankCode: itm[9]

                }
                return newItm
            })

            return newDataFormatted
        },
        getElementBody: () => tbodyRef.current,
        getParentElement: () => parentElementRef.current
    }))


    return (
        <div
            ref={parentElementRef}
            style={{
                width: "100%",
                height,
                overflow: "auto",
                position: "relative",
                pointerEvents: disbaleTable ? "none" : "auto",
                border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
                boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
                ...containerStyle,
                background: "#dcdcdc"
            }}

        >
            <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
                <table
                    id="upward-cutom-table"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        position: "relative",
                        background: "#dcdcdc"
                    }}>
                    <thead >
                        <tr>
                            <th style={{
                                width: '30px',
                                border: "none",
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                                background: "#f0f0f0",

                            }}
                            >

                            </th>
                            {
                                column.map((colItm: any, idx: number) => {
                                    return (
                                        <th
                                            key={idx}
                                            style={{
                                                width: colItm.width,
                                                borderRight: "1px solid #e2e8f0",
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 1,
                                                background: "#f0f0f0",
                                                fontSize: "12px",
                                                padding: "0px 5px",
                                                textAlign: colItm.type === 'number' ? "center" : "left"

                                            }}
                                        >{colItm.label}</th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody ref={tbodyRef} >
                        {
                            data?.map((rowItm: any, rowIdx: number) => {

                                return (
                                    <tr
                                        data-index={rowIdx}
                                        key={rowIdx}
                                        className={`row ${(selectedRow === rowIdx) || (selectedRowIndex === rowIdx) ? "selected" : ""}`}>
                                        <td
                                            style={{
                                                position: "relative",
                                                border: "none",
                                                cursor: "pointer",
                                                background: selectedRow === rowIdx ? "#0076d" : "",
                                                padding: 0,
                                                margin: 0,

                                            }}>
                                            <div style={{
                                                width: "18px",
                                                height: "18px",
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <input
                                                    style={{
                                                        cursor: "pointer",
                                                        margin: "0px !important",
                                                        position: "absolute",
                                                    }}
                                                    readOnly={true}
                                                    checked={selectedRowIndex === rowIdx}
                                                    type="checkbox"
                                                    onClick={() => {
                                                        if (!isTableSelectable) {
                                                            return
                                                        }
                                                        setSelectedRowIndex(rowIdx)

                                                        if (getSelectedItem) {
                                                            getSelectedItem(rowItm, null, rowIdx, null)
                                                        }
                                                        setSelectedRow(null)

                                                    }}
                                                />

                                            </div>

                                        </td>

                                        {
                                            column.map((colItm: any, colIdx: number) => {
                                                return (
                                                    <td
                                                        className={`td row-${rowIdx} col-${colIdx} `}
                                                        tabIndex={0}
                                                        onDoubleClick={() => {
                                                            if (!isTableSelectable) {
                                                                return
                                                            }
                                                            if (selectedRowIndex === rowIdx) {
                                                                setSelectedRowIndex(null)

                                                                if (getSelectedItem) {
                                                                    getSelectedItem(null, null, rowIdx, null)
                                                                }
                                                            } else {

                                                                setSelectedRowIndex(rowIdx)
                                                                if (getSelectedItem) {
                                                                    getSelectedItem(rowItm, null, rowIdx, null)
                                                                }
                                                            }
                                                            setSelectedRow(null)
                                                        }}
                                                        onClick={() => {
                                                            setSelectedRow(rowIdx)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (onKeyDown) {
                                                                onKeyDown(rowItm, rowIdx, e)
                                                            }
                                                            if (e.key === "ArrowUp") {
                                                                setSelectedRow((prev: any) => {
                                                                    const index = Math.max(prev - 1, -1)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (index < 0) {
                                                                        if (focusElementOnMaxTop) {
                                                                            focusElementOnMaxTop()
                                                                        }
                                                                        return
                                                                    }
                                                                    if (td) {
                                                                        td.focus();
                                                                    }
                                                                    return index
                                                                });
                                                            } else if (e.key === "ArrowDown") {

                                                                setSelectedRow((prev: any) => {
                                                                    const index = Math.min(prev + 1, data.length - 1)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (td) {
                                                                        td.focus();
                                                                        if (index <= 15) {
                                                                            parentElementRef.current.style.overflow = "hidden";
                                                                            setTimeout(() => {
                                                                                parentElementRef.current.style.overflow = "auto";
                                                                            }, 100)
                                                                            return index
                                                                        }
                                                                    }
                                                                    return index
                                                                });
                                                            }
                                                            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                                                                e.preventDefault()

                                                                if (!isTableSelectable) {
                                                                    return
                                                                }

                                                                setSelectedRowIndex(rowIdx)
                                                                if (getSelectedItem) {
                                                                    getSelectedItem(rowItm, null, rowIdx, null)
                                                                }
                                                                setSelectedRow(null)
                                                            }
                                                        }}
                                                        key={colIdx}

                                                        style={{
                                                            border: "none",
                                                            fontSize: "12px",
                                                            padding: "0px 5px",
                                                            cursor: "pointer",
                                                            height: "20px",
                                                            userSelect: "none",

                                                        }}
                                                    >{
                                                            <input
                                                                readOnly={true}
                                                                value={rowItm[colIdx]}
                                                                style={{
                                                                    width: colItm.width,
                                                                    pointerEvents: "none",
                                                                    border: "none",
                                                                    background: "transparent",
                                                                    userSelect: "none",
                                                                    height: "100%",
                                                                    textAlign: colItm.type === 'number' ? "right" : "left"

                                                                }} />
                                                        }</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <style>

                    {`
             #upward-cutom-table tr td{
               border-right:1px solid #f1f5f9 !important;
             }
          
              #upward-cutom-table tr:nth-child(odd) td {
                  background-color: #ffffff !important;
              }
              #upward-cutom-table tr:nth-child(even) td {
                  background-color: #f5f5f5 !important;
              }
              #upward-cutom-table tr.selected td {
                  background-color: #0076d7 !important;
                  color: #ffffff !important;
                  border-right:1px solid white !important;
                border-bottom:1px solid white !important;

              }
              
               #upward-cutom-table tr.selected td input {
                  color: #ffffff !important;
              }
  
              `}
                </style>
            </div>

        </div>

    )
})
export const DataGridViewMultiSelectionReact = forwardRef(({
    columns,
    rows = [],
    height = "400px",
    getSelectedItem,
    onKeyDown,
    disbaleTable = false,
    isTableSelectable = true,
    containerStyle,
    focusElementOnMaxTop
}: any, ref) => {
    const parentElementRef = useRef<any>(null)
    const tbodyRef = useRef<HTMLTableSectionElement>(null)
    const [data, setData] = useState([])
    const [column, setColumn] = useState([])
    const [selectedRow, setSelectedRow] = useState<any>(0)
    const [selectedRowIndex, setSelectedRowIndex] = useState<Array<any>>([])
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0)

    useEffect(() => {
        if (columns.length > 0) {
            setColumn(columns.filter((itm: any) => !itm.hide))
        }
    }, [columns])

    useImperativeHandle(ref, () => ({
        checkNoIsExist: (checkNo: string) => {
            return data.some((subArray: any) => subArray[2] === checkNo);
        },
        selectedRow: () => selectedRow,
        getData: () => {
            const newData = [...data];
            return newData
        },
        setData: (newData: any) => {
            setData(newData)
        },
        getColumns: () => {
            return columns
        },
        resetTable: () => {
            setData([])
            setSelectedRow(0)
            setSelectedRowIndex([])
        },
        getSelectedRow: () => {
            return selectedRowIndex
        },
        setSelectedRow: (value: any) => {
            return setSelectedRowIndex(value)
        },
        _setSelectedRow: (value: any) => {
            return setSelectedRow(value)
        },
        setDataFormated: (newData: any) => {
            setData(newData.map((itm: any) => {
                return columns.map((col: any) => itm[col.key])
            }))
        },
        getDataFormatted: () => {
            const newData = [...data];
            const newDataFormatted = newData.map((itm: any) => {
                let newItm = {
                    Check_No: itm[0],
                    Check_Date: itm[1],
                    Check_Amnt: itm[2],
                    BankName: itm[3],
                    Branch: itm[4],
                    Check_Remarks: itm[5],
                    Deposit_Slip: itm[6],
                    DateDeposit: itm[7],
                    OR_No: itm[8],
                    BankCode: itm[9]

                }
                return newItm
            })

            return newDataFormatted
        },
        getElementBody: () => tbodyRef.current,
        getParentElement: () => parentElementRef.current
    }))


    return (
        <div
            ref={parentElementRef}
            style={{
                width: "100%",
                height,
                overflow: "auto",
                position: "relative",
                pointerEvents: disbaleTable ? "none" : "auto",
                border: disbaleTable ? "2px solid #8c8f8e" : '2px solid #c0c0c0',
                boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
                ...containerStyle,
                background: "#dcdcdc"
            }}

        >
            <div style={{ position: "absolute", width: `${totalRowWidth}px`, height: "auto" }}>
                <table
                    id="upward-cutom-table"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        position: "relative",
                        background: "#dcdcdc"
                    }}>
                    <thead >
                        <tr>
                            <th style={{
                                width: '30px',
                                border: "none",
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                                background: "#f0f0f0",

                            }}
                            >

                            </th>
                            {
                                column.map((colItm: any, idx: number) => {
                                    return (
                                        <th
                                            key={idx}
                                            style={{
                                                width: colItm.width,
                                                borderRight: "1px solid #e2e8f0",
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 1,
                                                background: "#f0f0f0",
                                                fontSize: "12px",
                                                padding: "0px 5px",
                                                textAlign: colItm.type === 'number' ? "center" : "left"

                                            }}
                                        >{colItm.label}</th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody ref={tbodyRef} >
                        {
                            data?.map((rowItm: any, rowIdx: number) => {

                                return (
                                    <tr
                                        data-index={rowIdx}
                                        key={rowIdx}
                                        className={`row ${(selectedRow === rowIdx) || (selectedRowIndex.includes(rowIdx)) ? "selected" : ""}`}>
                                        <td
                                            style={{
                                                position: "relative",
                                                border: "none",
                                                cursor: "pointer",
                                                background: selectedRow === rowIdx ? "#0076d" : "",
                                                padding: 0,
                                                margin: 0,

                                            }}>
                                            <div style={{
                                                width: "18px",
                                                height: "18px",
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <input
                                                    style={{
                                                        cursor: "pointer",
                                                        margin: "0px !important",
                                                        position: "absolute",
                                                    }}
                                                    readOnly={true}
                                                    checked={selectedRowIndex.includes(rowIdx)}
                                                    type="checkbox"
                                                    onClick={() => {
                                                        if (!isTableSelectable) {
                                                            return
                                                        }

                                                        if (selectedRowIndex.includes(rowIdx)) {
                                                            setSelectedRowIndex((d: any) => d.filter((i: any) => i !== rowIdx))
                                                        } else {
                                                            setSelectedRowIndex((d: any) => [...d, rowIdx])
                                                        }

                                                        if (getSelectedItem) {
                                                            getSelectedItem(rowItm, null, rowIdx, null)
                                                        }

                                                    }}
                                                />

                                            </div>

                                        </td>

                                        {
                                            column.map((colItm: any, colIdx: number) => {
                                                return (
                                                    <td
                                                        className={`td row-${rowIdx} col-${colIdx} `}
                                                        tabIndex={0}
                                                        onDoubleClick={() => {
                                                            if (!isTableSelectable) {
                                                                return
                                                            }

                                                            if (selectedRowIndex.includes(rowIdx)) {
                                                                setSelectedRowIndex((d: any) => d.filter((i: any) => i !== rowIdx))

                                                                if (getSelectedItem) {
                                                                    getSelectedItem(null, null, rowIdx, null)
                                                                }

                                                                return
                                                            } else {

                                                                setSelectedRowIndex((d: any) => [...d, rowIdx])

                                                                if (getSelectedItem) {
                                                                    getSelectedItem(rowItm, null, rowIdx, null)
                                                                }
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setSelectedRow(rowIdx)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (onKeyDown) {
                                                                onKeyDown(rowItm, rowIdx, e)
                                                            }
                                                            if (e.key === "ArrowUp") {
                                                                setSelectedRow((prev: any) => {
                                                                    const index = Math.max(prev - 1, -1)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (index < 0) {
                                                                        if (focusElementOnMaxTop) {
                                                                            focusElementOnMaxTop()
                                                                        }
                                                                        return
                                                                    }
                                                                    if (td) {
                                                                        td.focus();
                                                                    }
                                                                    return index
                                                                });
                                                            } else if (e.key === "ArrowDown") {

                                                                setSelectedRow((prev: any) => {
                                                                    const index = Math.min(prev + 1, data.length - 1)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (td) {
                                                                        td.focus();
                                                                        if (index <= 15) {
                                                                            parentElementRef.current.style.overflow = "hidden";
                                                                            setTimeout(() => {
                                                                                parentElementRef.current.style.overflow = "auto";
                                                                            }, 100)
                                                                            return index
                                                                        }
                                                                    }
                                                                    return index
                                                                });
                                                            }
                                                            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                                                                e.preventDefault()

                                                                if (!isTableSelectable) {
                                                                    return
                                                                }

                                                                if (selectedRowIndex.includes(rowIdx)) {
                                                                    setSelectedRowIndex((d: any) => d.filter((i: any) => i !== rowIdx))
                                                                } else {
                                                                    setSelectedRowIndex((d: any) => [...d, rowIdx])

                                                                }
                                                                if (getSelectedItem) {
                                                                    getSelectedItem(rowItm, null, rowIdx, null)
                                                                }
                                                            }
                                                        }}
                                                        key={colIdx}

                                                        style={{
                                                            border: "none",
                                                            fontSize: "12px",
                                                            padding: "0px 5px",
                                                            cursor: "pointer",
                                                            height: "20px",
                                                            userSelect: "none",

                                                        }}
                                                    >{
                                                            <input
                                                                readOnly={true}
                                                                value={rowItm[colIdx]}
                                                                style={{
                                                                    width: colItm.width,
                                                                    pointerEvents: "none",
                                                                    border: "none",
                                                                    background: "transparent",
                                                                    userSelect: "none",
                                                                    height: "100%",
                                                                    textAlign: colItm.type === 'number' ? "right" : "left"

                                                                }} />
                                                        }</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <style>

                    {`
             #upward-cutom-table tr td{
               border-right:1px solid #f1f5f9 !important;
             }
          
              #upward-cutom-table tr:nth-child(odd) td {
                  background-color: #ffffff !important;
              }
              #upward-cutom-table tr:nth-child(even) td {
                  background-color: #f5f5f5 !important;
              }
              #upward-cutom-table tr.selected td {
                  background-color: #0076d7 !important;
                  color: #ffffff !important;
                  border-right:1px solid white !important;
                border-bottom:1px solid white !important;

              }
              
               #upward-cutom-table tr.selected td input {
                  color: #ffffff !important;
              }
  
              `}
                </style>
            </div>

        </div>

    )
})



let dataCache: any = []
let searchInputValueCache = ''
export const useUpwardTableModalSearch = ({
    column,
    query,
    getSelectedItem,
    onKeyDown
}: any) => {
    const [show, setShow] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    function openModal() {
        const body = document.body
        const div = document.createElement('div')
        div.id = 'modal-portal'

        if (document.getElementById('modal-portal'))
            body.removeChild(document.getElementById('modal-portal') as HTMLElement)

        body.insertBefore(div, document.getElementById('root'))
        wait(100).then(() => {
            div.innerHTML = ReactDOMServer.renderToString(<UpwardTableModalSearch />)
        })

        setShow(true)
        setTimeout(() => {
            if (searchInputRef.current) {
                const event = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
                searchInputRef.current.focus(); // Ensure the element has focus
                searchInputRef.current.dispatchEvent(event); // Dispatch the native event
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100)
            }
        }, 100)
    }
    function closeModal() {
        setShow(false)
        dataCache = []
    }
    const UpwardTableModalSearch = () => {
        const tableRef = useRef<any>(null)
        const [blick, setBlick] = useState(false)
        const [data, setData] = useState([])
        const { executeQueryToClient } = useExecuteQueryFromClient()

        useEffect(() => {
            if (dataCache.length > 0) {
                if (searchInputRef.current) {
                    searchInputRef.current.value = searchInputValueCache
                }
                setData(dataCache)
            }
        }, [setData])

        useEffect(() => {
            if (data.length > 0) {
                dataCache = data
                tableRef.current?.setDataFormated(data)
            }
        }, [data])


        return (
            show ?
                <div id="modal-inject">
                    <div style={{
                        position: "fixed",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "transparent",
                        zIndex: "88"
                    }}
                        onClick={() => {
                            setBlick(true)
                            setTimeout(() => {
                                setBlick(false)
                            }, 250)
                        }}

                    ></div>

                    <div
                        style={{
                            background: "#F1F1F1",
                            width: blick ? "451px" : "450px",
                            height: blick ? "501px" : "500px",
                            position: "absolute",
                            zIndex: 111111,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%,-50%)",
                            boxShadow: '3px 6px 32px -7px rgba(0,0,0,0.75)',
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <div
                            style={{
                                height: "22px",
                                background: "white",
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "5px",
                                position: "relative",
                                alignItems: "center"

                            }}
                        >
                            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Search</span>
                            <button
                                className="btn-check-exit-modal"
                                style={{
                                    padding: "0 5px",
                                    borderRadius: "0px",
                                    background: "white",
                                    color: "black",
                                    height: "22px",
                                    position: "absolute",
                                    top: 0,
                                    right: 0
                                }}
                                onClick={() => {
                                    closeModal()
                                }}
                            >
                                <CloseIcon sx={{ fontSize: "22px" }} />
                            </button>
                        </div>
                        <div style={{
                            padding: "5px",
                        }}>
                            <TextInput
                                containerStyle={{
                                    width: "100%"
                                }}
                                label={{
                                    title: "Search : ",
                                    style: {
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        width: "70px",
                                        display: "none"
                                    },
                                }}
                                input={{
                                    type: "text",
                                    style: { width: "100%" },
                                    onKeyDown: async (e) => {
                                        if (e.code === "NumpadEnter" || e.code === 'Enter') {
                                            searchInputValueCache = e.currentTarget.value
                                            const searchQuery = query(e.currentTarget.value)
                                            const dd = await executeQueryToClient(searchQuery)
                                            setData(dd.data.data)
                                        }

                                        if (e.code === "ArrowDown") {
                                            const td = document.querySelector(`.td.row-0`) as HTMLTableDataCellElement
                                            if (td) {
                                                const parentElement = tableRef.current.getParentElement()

                                                td.focus({
                                                    preventScroll: true
                                                });
                                                parentElement.style.overflow = "hidden";
                                                wait(100).then(() => {
                                                    parentElement.style.overflow = "auto";
                                                })
                                            }
                                            tableRef.current?._setSelectedRow(0)
                                        }

                                    },
                                }}
                                inputRef={searchInputRef}
                                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                                onIconClick={async (e) => {
                                    e.preventDefault()
                                    if (searchInputRef.current)
                                        searchInputValueCache = searchInputRef.current.value
                                    const searchQuery = query(searchInputRef.current?.value)
                                    const dd = await executeQueryToClient(searchQuery)
                                    setData(dd.data.data)
                                }}
                            />
                        </div>
                        <div style={{
                            flex: 1,
                        }}>
                            <DataGridViewReact
                                columns={column}
                                height={"100%"}
                                ref={tableRef}
                                getSelectedItem={getSelectedItem}
                                onKeyDown={onKeyDown}
                                focusElementOnMaxTop={() => {
                                    searchInputRef.current?.focus()
                                }}
                            />
                        </div>
                        <style>
                            {
                                `
                                    .btn-check-exit-modal:hover{
                                        background:red !important;
                                        color:white !important;
                                    }
                                `
                            }
                        </style>
                    </div >
                </div>
                : <></>
        )

    }

    return {
        openModal,
        closeModal,
        UpwardTableModalSearch
    }
}