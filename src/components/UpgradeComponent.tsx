import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useContext,
  useCallback,
} from "react";
import useExecuteQueryFromClient from "../lib/executeQueryFromClient";
import SearchIcon from "@mui/icons-material/Search";
import { TextInput } from "./UpwardFields";
import { wait } from "../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOMServer from "react-dom/server";
import { AuthContext } from "./AuthContext";
import { Loading } from "./Loading";
import ReactDOM from "react-dom";
import "../style/datagridview.css";
import "../style/upgradecomponent.css";
import { formatNumber } from "../feautures/Admin/Task/Accounting/ReturnCheck";

const rowHeight = 20;
const buffer = 5;
const visibleRowCount = 25; // how many rows to show at once

export const DataGridViewReactUpgraded = forwardRef(
  (
    {
      columns,
      rows = [],
      height = "400px",
      getSelectedItem,
      onKeyDown,
      disbaleTable = false,
      isTableSelectable: _isTableSelectable = true,
      containerStyle,
      focusElementOnMaxTop,
      ActionComponent = () => <></>,
      showSequence = false,
    }: any,
    ref
  ) => {
    const parentElementRef = useRef<any>(null);
    const actionModalRef = useRef<any>(null);
    const checkboxRef = useRef([]);
    const tbodyRef = useRef<HTMLTableSectionElement>(null);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState<any>(null);
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0);
    const [isTableSelectable, setIsTableSelectable] =
      useState(_isTableSelectable);

    const [columnHeader, setColumnHeader] = useState(
      columns.filter((itm: any) => !itm.hide)
    );
    const [hoveredColumn, setHoveredColumn] = useState(null);

    // ====================================================================

    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const resizingColIndexRef = useRef<number | null>(null);

    const [startIndex, setStartIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const endIndex = Math.min(
      data.length,
      startIndex + visibleRowCount + buffer
    );

    const handleCellKeyDown = (
      e: React.KeyboardEvent<HTMLDivElement>,
      rowIndex: number,
      colKey: string
    ) => {
      let targetRow = rowIndex;
      let colIndex = columns.findIndex((col: any) => col.key === colKey);

      if (e.key === "ArrowDown" && targetRow < data.length - 1) {
        targetRow++;
      } else if (e.key === "ArrowUp" && targetRow > 0) {
        targetRow--;
      } else if (e.key === "ArrowLeft" && colIndex > 0) {
        colIndex--;
      } else if (e.key === "ArrowRight" && colIndex < columns.length - 1) {
        colIndex++;
      } else {
        return;
      }

      e.preventDefault();

      const nextKey = `${targetRow}-${columns[colIndex].key}`;
      const nextEl = cellRefs.current[nextKey];

      // ⬇️ Focus the cell if it exists (might not if not yet rendered)
      if (nextEl) {
        nextEl.focus();
      }

      // 🔁 Scroll to row if it's not currently in view
      const scrollTop = containerRef.current?.scrollTop || 0;
      const containerHeight = containerRef.current?.clientHeight || 0;

      const rowTop = targetRow * rowHeight;
      const rowBottom = rowTop + rowHeight;

      if (rowTop < scrollTop) {
        // Scroll up
        containerRef.current?.scrollTo({ top: rowTop });
      } else if (rowBottom > scrollTop + containerHeight) {
        // Scroll down
        containerRef.current?.scrollTo({ top: rowBottom - containerHeight });
      }
    };

    const handleScroll = useCallback(() => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const newStartIndex = Math.floor(scrollTop / rowHeight);
      setStartIndex(newStartIndex);
    }, []);

    useEffect(() => {
      if (columns.length > 0) {
        setColumn(columns.filter((itm: any) => !itm.hide));
      }
    }, [columns]);
    useImperativeHandle(ref, () => ({
      checkNoIsExist: (checkNo: string) => {
        return data.some((subArray: any) => subArray[2] === checkNo);
      },
      selectedRow: () => selectedRow,
      getData: () => {
        const newData = [...data];
        return newData;
      },
      setData: (newData: any) => {
        setData(newData);
      },
      getColumns: () => {
        return columns;
      },
      resetTable: () => {
        setData([]);
        setSelectedRow(0);
        setSelectedRowIndex(null);
      },
      getSelectedRow: () => {
        return selectedRowIndex;
      },
      setSelectedRow: (value: any) => {
        return setSelectedRowIndex(value);
      },
      resetCheckBox: () => {
        // return handleResetCheckBox();
      },
      _setSelectedRow: (value: any) => {
        return setSelectedRow(value);
      },
      setIsTableSelectable: (param: boolean) => {
        setIsTableSelectable(param);
      },
      setDataFormated: (newData: any) => {
        setData(
          newData.map((itm: any) => {
            return columns.map((col: any) => itm[col.key]);
          })
        );
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
            BankCode: itm[9],
          };
          return newItm;
        });

        return newDataFormatted;
      },
      getElementBody: () => tbodyRef.current,
      getParentElement: () => parentElementRef.current,
      getcellRefs: () => cellRefs.current,
      focusFirstRowColumn: () => {
        const firstCell = cellRefs.current[`${startIndex}-${columns[0].key}`];
        if (firstCell) {
          firstCell.focus();
        }
      },
    }));

    return (
      <div
        tabIndex={0}
        style={{
          flex: 1,
          width: "100vw",
          height: "auto",
          border: "1px solid #ccc",
          overflow: "auto",
          position: "relative",
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Rows */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            height: `${rowHeight * visibleRowCount}px`,
            overflowY: "auto",
            position: "relative",
            padding: "0px 3px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              borderBottom: "1px solid #ccc",
              background: "white",
              position: "sticky",
              top: 0,
              width: `${totalRowWidth}px`,
              zIndex: 999,
              marginBottom: "2px",
            }}
          >
            {columns.map((col: any, colIdx: number) => (
              <div
                key={col.key}
                style={{
                  width: `${col.width}px`,
                  padding: "1px 5px",
                  boxSizing: "border-box",
                  //   borderRight: "1px solid #eee",
                  borderLeft: colIdx === 0 ? "none" : "1px solid #eee",
                  fontSize: "12px",
                  position:"relative"
                }}
              >
                {col.label}
                <div
                  onMouseDown={(e) => {
                    startXRef.current = e.clientX;
                    startWidthRef.current = col.width;
                    resizingColIndexRef.current = colIdx;

                    const onMouseMove = (e: MouseEvent) => {
                      const delta = e.clientX - startXRef.current;
                      const newWidth = Math.max(
                        startWidthRef.current + delta,
                        50
                      ); // minimum 50px
                      setColumnHeader((prev: any) =>
                        prev.map((c: any, i: any) =>
                          i === colIdx ? { ...c, width: newWidth } : c
                        )
                      );
                    };

                    const onMouseUp = () => {
                      document.removeEventListener("mousemove", onMouseMove);
                      document.removeEventListener("mouseup", onMouseUp);
                      resizingColIndexRef.current = null;
                    };

                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "10px",
                    height: "10px",
                    cursor: "col-resize",
                    zIndex: 2,
                    background:"red"
                  }}
                />
              </div>
            ))}
          </div>
          {/* Body */}
          <div
            style={{
              height: `${data.length * rowHeight}px`,
              position: "relative",
            }}
          >
            {data.slice(startIndex, endIndex).map((row, idx) => {
              const actualIndex = startIndex + idx;
              return (
                <div
                  key={actualIndex}
                  style={{
                    position: "absolute",
                    top: `${actualIndex * rowHeight}px`,
                    display: "flex",
                    height: `${rowHeight}px`,
                  }}
                >
                  {columns.map((col: any, colIdx: number) => {
                    const key = `${actualIndex}-${col.key}`;
                    return (
                      <div
                        key={col.key}
                        ref={(el) => (cellRefs.current[key] = el)}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          handleCellKeyDown(e, actualIndex, col.key)
                        }
                        title={row[colIdx]}
                        style={{
                          width: `${col.width}px`,
                          padding: "1px 4px",
                          boxSizing: "border-box",
                          outline: "none",
                          borderLeft: colIdx === 0 ? "none" : "1px solid #ccc",
                          borderBottom: "1px solid #ccc",
                          fontSize: "12px",
                          cursor: "pointer",
                          whiteSpace: "nowrap", // Prevent text wrapping
                          overflow: "hidden", // Hide overflowing text
                          textOverflow: "ellipsis",
                        }}
                        onFocus={(e) => {
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.style.background =
                              "#E6F9FC";
                          }
                          e.currentTarget.style.outline = "3px solid #2344EB";
                          e.currentTarget.style.zIndex = "22";
                        }}
                        onBlur={(e) => {
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.style.background =
                              "transparent";
                          }
                          e.currentTarget.style.outline = "transparent";
                        }}
                      >
                        {row[colIdx]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {/* Footer */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            padding: "2px 10px ",
          }}
        >
          Total Rows : {data.length.toLocaleString("en-US")}
        </div>
      </div>
    );
  }
);

const RowComponent = forwardRef(
  (
    {
      rowIdx,
      rowItm,
      selectedRowIndex,
      selectedRow,
      isTableSelectable,
      setSelectedRowIndex,
      getSelectedItem,
      setSelectedRow,
      column,
      onKeyDown,
      focusElementOnMaxTop,
      data,
      parentElementRef,
      checkboxRef,
      handleResetCheckBox,
      handleResetCheckBoxByIndex,
      handleRightClick,
      showSequence,
    }: any,
    ref
  ) => {
    return (
      <tr
        data-index={rowIdx}
        key={rowIdx}
        className={`row ${
          selectedRow === rowIdx || selectedRowIndex === rowIdx
            ? "selected"
            : ""
        }`}
      >
        <td
          style={{
            position: "relative",
            border: "none",
            cursor: "pointer",
            background: selectedRow === rowIdx ? "#0076d" : "",
            padding: 0,
            margin: 0,
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckBoxSelection
              key={rowIdx}
              checkboxRef={checkboxRef}
              isTableSelectable={isTableSelectable}
              setSelectedRowIndex={setSelectedRowIndex}
              rowIdx={rowIdx}
              rowItm={rowItm}
              getSelectedItem={getSelectedItem}
              setSelectedRow={setSelectedRow}
              handleResetCheckBoxByIndex={handleResetCheckBoxByIndex}
            />
          </div>
        </td>

        {showSequence && (
          <td
            style={{
              position: "relative",
              border: "none",
              cursor: "pointer",
              background: selectedRow === rowIdx ? "#0076d" : "",
              padding: 0,
              margin: 0,
            }}
          >
            <input
              readOnly={true}
              defaultValue={`${String(rowIdx + 1).padStart(2, "0")}`}
              style={{
                width: "50px",
                pointerEvents: "none",
                border: "none",
                background: "transparent",
                userSelect: "none",
                height: "100%",
                textAlign: "center",
              }}
            />
          </td>
        )}

        {column.map((colItm: any, colIdx: number) => {
          return (
            <td
              className={`td row-${rowIdx} col-${colIdx} `}
              tabIndex={0}
              onDoubleClick={() => {
                if (!isTableSelectable) {
                  return;
                }
                handleResetCheckBox();
                if (selectedRowIndex === rowIdx) {
                  setSelectedRowIndex(null);

                  checkboxRef.current[rowIdx].checked = false;

                  if (getSelectedItem) {
                    getSelectedItem(null, null, rowIdx, null);
                  }
                } else {
                  checkboxRef.current[rowIdx].checked = true;

                  setSelectedRowIndex(rowIdx);
                  if (getSelectedItem) {
                    getSelectedItem(rowItm, null, rowIdx, null);
                  }
                }
                setSelectedRow(null);
              }}
              onClick={() => {
                setSelectedRow(rowIdx);
              }}
              onKeyDown={(e) => {
                if (onKeyDown) {
                  onKeyDown(rowItm, rowIdx, e);
                }
                if (e.key === "ArrowUp") {
                  setSelectedRow((prev: any) => {
                    const index = Math.max(prev - 1, -1);
                    const td = document.querySelector(
                      `.td.row-${index}`
                    ) as HTMLTableDataCellElement;

                    if (index < 0) {
                      if (focusElementOnMaxTop) {
                        focusElementOnMaxTop();
                      }
                      return;
                    }
                    if (td) {
                      td.focus();
                    }
                    return index;
                  });
                } else if (e.key === "ArrowDown") {
                  setSelectedRow((prev: any) => {
                    const index = Math.min(prev + 1, data.length - 1);
                    const td = document.querySelector(
                      `.td.row-${index}`
                    ) as HTMLTableDataCellElement;

                    if (td) {
                      td.focus();
                      if (index <= 15) {
                        parentElementRef.current.style.overflow = "hidden";
                        setTimeout(() => {
                          parentElementRef.current.style.overflow = "auto";
                        }, 100);
                        return index;
                      }
                    }
                    return index;
                  });
                }
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();

                  if (!isTableSelectable) {
                    return;
                  }

                  setSelectedRowIndex(rowIdx);

                  if (getSelectedItem) {
                    getSelectedItem(rowItm, null, rowIdx, null);
                  }
                  setSelectedRow(null);
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
              onContextMenu={(e) => handleRightClick(e, rowIdx)}
            >
              {
                <input
                  type={isValidDateStrict(rowItm[colIdx]) ? "date" : "text"}
                  readOnly={true}
                  value={rowItm[colIdx]}
                  style={{
                    width: colItm.width,
                    pointerEvents: "none",
                    border: "none",
                    background: "transparent",
                    userSelect: "none",
                    height: "100%",
                    textAlign: colItm.type === "number" ? "right" : "left",
                  }}
                />
              }
            </td>
          );
        })}
      </tr>
    );
  }
);
const CheckBoxSelection = forwardRef(
  (
    {
      isTableSelectable,
      setSelectedRowIndex,
      rowIdx,
      rowItm,
      getSelectedItem,
      setSelectedRow,
      checkboxRef,
      handleResetCheckBoxByIndex,
    }: any,
    ref
  ) => {
    return (
      <input
        ref={(el) => (checkboxRef.current[rowIdx] = el)}
        style={{
          cursor: "pointer",
          margin: "0px !important",
          position: "absolute",
        }}
        readOnly={true}
        type="checkbox"
        onClick={(e) => {
          if (!isTableSelectable) {
            return;
          }
          handleResetCheckBoxByIndex(rowIdx);
          if (e.currentTarget.checked) {
            setSelectedRowIndex(rowIdx);
            if (getSelectedItem) {
              getSelectedItem(rowItm, null, rowIdx, null);
            }
            setSelectedRow(null);
            return;
          } else {
            setSelectedRowIndex(null);
            if (getSelectedItem) {
              getSelectedItem(null, null, rowIdx, null);
            }
            setSelectedRow(null);
            return;
          }
        }}
      />
    );
  }
);
const ActionModal = forwardRef(
  ({ handleOnSave, handleOnClose, hasSelectedRow, Component }: any, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        if (handleOnClose) handleOnClose();
      }, 100);
    };
    const closeDelayRef = useRef<any>(closeDelay);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      blick,
      closeDelay,
    }));

    useEffect(() => {
      window.addEventListener("keydown", (e: any) => {
        if (e.key === "Escape") {
          closeDelayRef.current();
        }
      });
    }, []);

    return showModal ? (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        <div
          style={{
            height: "auto",
            width: "auto",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
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
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Action</span>
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
                right: 0,
              }}
              onClick={() => {
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          {Component}
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);
function isValidDateStrict(dateString: any) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date as any) &&
    date.toISOString().slice(0, 10) === dateString
  );
}
