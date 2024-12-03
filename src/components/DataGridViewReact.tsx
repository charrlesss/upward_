import {
    useState, useRef,
    forwardRef, useEffect,
    useImperativeHandle,
} from "react";

export const DataGridViewReact = forwardRef(({
    columns,
    rows = [],
    height = "400px",
    getSelectedItem,
    onKeyDown,
    disbaleTable = false,
    isTableSelectable = true,
    containerStyle
}: any, ref) => {
    const parentElementRef = useRef<any>(null)
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

    useEffect(() => {
        if (rows.length > 0) {
            setData(rows.map((itm: any) => {
                return columns.map((col: any) => itm[col.key])
            }))
        }
    }, [rows, columns])

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
        }
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
                                                textAlign: "left",
                                                padding: "0px 5px",

                                            }}
                                        >{colItm.label}</th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data?.map((rowItm: any, rowIdx: number) => {

                                return (
                                    <tr key={rowIdx} className={`${(selectedRow === rowIdx) || (selectedRowIndex === rowIdx) ? "selected" : ""}`}>
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
                                                                    const index = Math.max(prev - 1, 0)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (td) {
                                                                        td.focus()
                                                                    }
                                                                    return index
                                                                });
                                                            } else if (e.key === "ArrowDown") {
                                                                setSelectedRow((prev: any) => {
                                                                    const index = Math.min(prev + 1, data.length - 1)
                                                                    const td = document.querySelector(`.td.row-${index}`) as HTMLTableDataCellElement
                                                                    if (td) {
                                                                        // td.focus()
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