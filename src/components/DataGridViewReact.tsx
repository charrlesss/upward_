import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useContext,
  Fragment,
  useCallback,
  useId,
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
import { useMutation } from "react-query";
import { set } from "lodash";

export const DataGridViewReact = forwardRef(
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
        return handleResetCheckBox();
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
    }));
    const handleResetCheckBox = () => {
      checkboxRef.current.forEach((checkbox: HTMLInputElement, idx: any) => {
        if (checkbox) checkbox.checked = false;
      });
    };
    const handleResetCheckBoxByIndex = (_idx: any) => {
      checkboxRef.current.forEach((checkbox: HTMLInputElement, idx: any) => {
        if (_idx === idx) {
          return;
        } else {
          if (checkbox) checkbox.checked = false;
        }
      });
    };
    const handleRightClick = (event: any, idx: number) => {
      event.preventDefault(); // Prevent the default context menu from appearing
      if (idx === selectedRowIndex) {
        actionModalRef.current.showModal();
      }
    };
    const startResize = (index: any, e: any) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columnHeader[index].width;

      const doDrag = (moveEvent: any) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        const updatedColumns = [...columnHeader];
        updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
        setColumnHeader(updatedColumns);
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    };
    const handleMouseEnter = (index: any) => {
      setHoveredColumn(index); // Set the hovered column index
    };
    const handleMouseLeave = () => {
      setHoveredColumn(null); // Reset hovered column index
    };

    return (
      <>
        <ActionModal
          ref={actionModalRef}
          Component={
            <ActionComponent
              selectedRowIndex={selectedRowIndex}
              closeModal={() => actionModalRef.current.closeDelay()}
              rowItm={data[selectedRowIndex]}
            />
          }
        />
        <div
          className="table-datagridview-main"
          ref={parentElementRef}
          style={{
            width: "100%",
            height,
            overflow: "auto",
            position: "relative",
            pointerEvents: disbaleTable ? "none" : "auto",
            border: disbaleTable ? "2px solid #8c8f8e" : "2px solid #c0c0c0",
            boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
            ...containerStyle,
            background: "#dcdcdc",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: `${totalRowWidth}px`,
              height: "auto",
            }}
          >
            <table
              id="upward-cutom-table"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                position: "relative",
                background: "#dcdcdc",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: "30px",
                      border: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background: "#f0f0f0",
                    }}
                  ></th>
                  {showSequence && (
                    <th
                      style={{
                        width: "50px",
                        borderRight: "1px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        padding: "0px 5px",
                        textAlign: "center",
                      }}
                    >
                      SEQ
                    </th>
                  )}
                  {column.map((colItm: any, idx: number) => {
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
                          textAlign:
                            colItm.type === "number" ? "center" : "left",
                        }}
                      >
                        <div
                          key={idx}
                          className={` ${
                            hoveredColumn === idx ? `highlight-column` : ""
                          }`} // Add the class if hovered
                          style={{ width: colItm.width, height: "20px" }}
                        >
                          {colItm.label}

                          <div
                            className="resize-handle"
                            onMouseDown={(e) => startResize(idx, e)}
                            onMouseEnter={(e) => {
                              e.preventDefault();
                              handleMouseEnter(idx);
                            }} // On hover
                            onMouseLeave={(e) => {
                              e.preventDefault();
                              handleMouseLeave();
                            }} // On mouse leave
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {data?.map((rowItm: any, rowIdx: number) => {
                  return (
                    <RowComponent
                      key={rowIdx}
                      rowIdx={rowIdx}
                      rowItm={rowItm}
                      selectedRowIndex={selectedRowIndex}
                      selectedRow={selectedRow}
                      isTableSelectable={isTableSelectable}
                      setSelectedRowIndex={setSelectedRowIndex}
                      getSelectedItem={getSelectedItem}
                      setSelectedRow={setSelectedRow}
                      column={column}
                      onKeyDown={onKeyDown}
                      focusElementOnMaxTop={focusElementOnMaxTop}
                      data={data}
                      parentElementRef={parentElementRef}
                      checkboxRef={checkboxRef}
                      handleResetCheckBox={handleResetCheckBox}
                      handleResetCheckBoxByIndex={handleResetCheckBoxByIndex}
                      handleRightClick={handleRightClick}
                      showSequence={showSequence}
                    />
                  );
                })}
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

              .resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    cursor: col-resize;
                    background-color: transparent;
                  }

                  .resize-handle:hover {
                    background-color: #101111;
                  }

                  .highlight-column {
                    border-right: 2px solid #007bff !important;
                  }
  
              `}
            </style>
          </div>
        </div>
      </>
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
export const DataGridViewMultiSelectionReact = forwardRef(
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
      onCheckAll,
      onUnCheckAll,
      rowIsSelectable,
    }: any,
    ref
  ) => {
    const parentElementRef = useRef<any>(null);
    const tbodyRef = useRef<HTMLTableSectionElement>(null);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState<Array<any>>([]);
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0);
    const [isTableSelectable, setIsTableSelectable] =
      useState(_isTableSelectable);

    const [columnHeader, setColumnHeader] = useState(
      columns.filter((itm: any) => !itm.hide)
    );
    const [hoveredColumn, setHoveredColumn] = useState(null);

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
      getSelectedRowsData: () => {
        const newData = [...data];
        return selectedRowIndex
          .map((index) => newData[index])
          .filter((item) => item !== undefined);
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
        setSelectedRowIndex([]);
      },
      getSelectedRow: () => {
        return selectedRowIndex;
      },
      setSelectedRow: (value: any) => {
        return setSelectedRowIndex(value);
      },
      _setSelectedRow: (value: any) => {
        return setSelectedRow(value);
      },
      setDataFormated: (newData: any) => {
        setData(
          newData.map((itm: any) => {
            return columns.map((col: any) => itm[col.key]);
          })
        );
      },
      setIsTableSelectable: (param: boolean) => {
        setIsTableSelectable(param);
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
      isTableSelectable,
    }));

    const startResize = (index: any, e: any) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columnHeader[index].width;

      const doDrag = (moveEvent: any) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        const updatedColumns = [...columnHeader];
        updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
        setColumnHeader(updatedColumns);
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    };
    const handleMouseEnter = (index: any) => {
      setHoveredColumn(index); // Set the hovered column index
    };
    const handleMouseLeave = () => {
      setHoveredColumn(null); // Reset hovered column index
    };

    return (
      <div
        ref={parentElementRef}
        style={{
          width: "100%",
          height,
          overflow: "auto",
          position: "relative",
          pointerEvents: disbaleTable ? "none" : "auto",
          border: disbaleTable ? "2px solid #8c8f8e" : "2px solid #c0c0c0",
          boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
          ...containerStyle,
          background: "#dcdcdc",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: `${totalRowWidth}px`,
            height: "auto",
          }}
        >
          <table
            id="upward-cutom-table-multi"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              position: "relative",
              background: "#dcdcdc",
            }}
          >
            <thead>
              <tr>
                {isTableSelectable && (
                  <th
                    style={{
                      width: "30px",
                      border: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background: "#f0f0f0",
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
                      <input
                        style={{
                          cursor: "pointer",
                          margin: "0px !important",
                          position: "absolute",
                        }}
                        readOnly={true}
                        type="checkbox"
                        onClick={(e) => {
                          if (e.currentTarget.checked) {
                            if (onCheckAll) {
                              onCheckAll();
                            }
                          } else {
                            if (onUnCheckAll) {
                              onUnCheckAll();
                            }
                          }
                        }}
                      />
                    </div>
                  </th>
                )}
                {column.map((colItm: any, idx: number) => {
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
                        textAlign: colItm.type === "number" ? "center" : "left",
                      }}
                    >
                      <div
                        key={idx}
                        className={` ${
                          hoveredColumn === idx ? `highlight-column` : ""
                        }`} // Add the class if hovered
                        style={{ width: colItm.width, height: "20px" }}
                      >
                        {colItm.label}

                        <div
                          className="resize-handle"
                          onMouseDown={(e) => startResize(idx, e)}
                          onMouseEnter={(e) => {
                            e.preventDefault();
                            handleMouseEnter(idx);
                          }} // On hover
                          onMouseLeave={(e) => {
                            e.preventDefault();
                            handleMouseLeave();
                          }} // On mouse leave
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {data?.map((rowItm: any, rowIdx: number) => {
                return (
                  <tr
                    data-index={rowIdx}
                    key={rowIdx}
                    className={`row ${
                      selectedRow === rowIdx &&
                      selectedRowIndex.includes(rowIdx)
                        ? "multi-selected-row-item"
                        : selectedRow === rowIdx
                        ? "multi-selected-row"
                        : selectedRowIndex.includes(rowIdx)
                        ? "multi-selected-item"
                        : ""
                    }`}
                  >
                    {isTableSelectable && (
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
                              if (rowIsSelectable && rowIsSelectable(rowItm)) {
                                return;
                              }
                              if (!isTableSelectable) {
                                return;
                              }

                              if (selectedRowIndex.includes(rowIdx)) {
                                setSelectedRowIndex((d: any) =>
                                  d.filter((i: any) => i !== rowIdx)
                                );
                              } else {
                                setSelectedRowIndex((d: any) => [...d, rowIdx]);
                              }

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
                              }
                            }}
                          />
                        </div>
                      </td>
                    )}

                    {column.map((colItm: any, colIdx: number) => {
                      return (
                        <td
                          className={`td row-${rowIdx} col-${colIdx} `}
                          tabIndex={0}
                          onDoubleClick={() => {
                            if (rowIsSelectable && rowIsSelectable(rowItm)) {
                              return;
                            }
                            if (!isTableSelectable) {
                              return;
                            }

                            if (selectedRowIndex.includes(rowIdx)) {
                              setSelectedRowIndex((d: any) =>
                                d.filter((i: any) => i !== rowIdx)
                              );

                              if (getSelectedItem) {
                                getSelectedItem(null, null, rowIdx, null);
                              }

                              return;
                            } else {
                              setSelectedRowIndex((d: any) => [...d, rowIdx]);

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
                              }
                            }
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
                                const index = Math.min(
                                  prev + 1,
                                  data.length - 1
                                );
                                const td = document.querySelector(
                                  `.td.row-${index}`
                                ) as HTMLTableDataCellElement;
                                if (td) {
                                  td.focus();
                                  if (index <= 15) {
                                    parentElementRef.current.style.overflow =
                                      "hidden";
                                    setTimeout(() => {
                                      parentElementRef.current.style.overflow =
                                        "auto";
                                    }, 100);
                                    return index;
                                  }
                                }
                                return index;
                              });
                            }
                            if (
                              e.code === "Enter" ||
                              e.code === "NumpadEnter"
                            ) {
                              e.preventDefault();

                              if (!isTableSelectable) {
                                return;
                              }

                              if (selectedRowIndex.includes(rowIdx)) {
                                setSelectedRowIndex((d: any) =>
                                  d.filter((i: any) => i !== rowIdx)
                                );
                              } else {
                                setSelectedRowIndex((d: any) => [...d, rowIdx]);
                              }
                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
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
                        >
                          {
                            <input
                              type={
                                isValidDateStrict(rowItm[colIdx])
                                  ? "date"
                                  : "text"
                              }
                              readOnly={true}
                              value={rowItm[colIdx]}
                              style={{
                                width: colItm.width,
                                pointerEvents: "none",
                                border: "none",
                                background: "transparent",
                                userSelect: "none",
                                height: "100%",
                                textAlign:
                                  colItm.type === "number" ? "right" : "left",
                              }}
                            />
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <style>
            {`
             #upward-cutom-table-multi tr td{
               border-right:1px solid #f1f5f9 !important;
             }
          
              #upward-cutom-table-multi tr:nth-child(odd) td {
                  background-color: #ffffff !important;
              }
              #upward-cutom-table-multi tr:nth-child(even) td {
                  background-color: #f5f5f5 !important;
              }

             #upward-cutom-table-multi tr.multi-selected-row-item td {
                background-color: rgba(84, 84, 82, 0.73) !important;
                border-right:1px solid white !important;
                border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-row-item td input {
                  color: #ffffff !important;
              }

            #upward-cutom-table-multi tr.multi-selected-item td {
                background-color: rgba(232, 232, 226, 0.99) !important;
                border-right:1px solid white !important;
                border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-item td input {
                  color: black !important;
              }

              #upward-cutom-table-multi tr.multi-selected-row td {
                  background-color: #0076d7 !important;
                  border-right:1px solid white !important;
                  border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-row td input {
                  color: #ffffff !important;
              }
                  .resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    cursor: col-resize;
                    background-color: transparent;
                  }

                  .resize-handle:hover {
                    background-color: #101111;
                  }

                  .highlight-column {
                    border-right: 2px solid #007bff !important;
                  }
  
  
              `}
          </style>
        </div>
      </div>
    );
  }
);
let dataCache: any = [];
let searchInputValueCache = "";
export const useUpwardTableModalSearch = ({
  column,
  query,
  getSelectedItem,
  onKeyDown,
  customWidth,
  onClose,
}: any) => {
  const [show, setShow] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function openModal(search: string) {
    const body = document.body;
    const div = document.createElement("div");
    div.id = "modal-portal";

    if (document.getElementById("modal-portal"))
      body.removeChild(document.getElementById("modal-portal") as HTMLElement);

    body.insertBefore(div, document.getElementById("root"));
    wait(100).then(() => {
      div.innerHTML = ReactDOMServer.renderToString(<UpwardTableModalSearch />);
    });

    setShow(true);

    wait(100).then(() => {
      if (searchInputRef.current) {
        searchInputRef.current.value = search;
        const event = new KeyboardEvent("keydown", {
          code: "Enter",
          bubbles: true,
        });
        searchInputRef.current.focus(); // Ensure the element has focus
        searchInputRef.current.dispatchEvent(event); // Dispatch the native event
        wait(100).then(() => {
          searchInputRef.current?.focus();
        });
      }
    });
  }
  function closeModal(muteOnClose = true) {
    if (onClose && muteOnClose) {
      onClose();
    }
    setShow(false);
    dataCache = [];
  }

  const UpwardTableModalSearch = () => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const tableRef = useRef<any>(null);
    const [blick, setBlick] = useState(false);
    const [data, setData] = useState([]);
    const { executeQueryToClient } = useExecuteQueryFromClient();

    useEffect(() => {
      if (dataCache.length > 0) {
        if (searchInputRef.current) {
          searchInputRef.current.value = searchInputValueCache;
        }
        setData(dataCache);
      }
    }, [setData]);

    useEffect(() => {
      if (data.length > 0) {
        dataCache = data;
        tableRef.current?.setDataFormated(data);
      }
    }, [data]);

    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    return show ? (
      <div id="modal-inject">
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
          className="modal-table-datagridview"
          ref={modalRef}
          style={{
            background: "#F1F1F1",
            width: customWidth
              ? customWidth(blick, column)
              : blick
              ? "451px"
              : "450px",
            height: blick ? "501px" : "500px",
            position: "absolute",
            zIndex: 111111,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
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
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
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
                right: 0,
              }}
              onClick={() => {
                closeModal();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              padding: "5px",
            }}
          >
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Search : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                  display: "none",
                },
              }}
              input={{
                type: "text",
                style: { width: "100%" },
                onKeyDown: async (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    searchInputValueCache = e.currentTarget.value;
                    const searchQuery = query(e.currentTarget.value);
                    console.log(searchQuery);
                    const dd = await executeQueryToClient(searchQuery);
                    setData(dd.data.data);
                  }

                  if (e.code === "ArrowDown") {
                    const td = document.querySelector(
                      `.td.row-0`
                    ) as HTMLTableDataCellElement;
                    if (td) {
                      const parentElement = tableRef.current.getParentElement();

                      td.focus({
                        preventScroll: true,
                      });
                      parentElement.style.overflow = "hidden";
                      wait(100).then(() => {
                        parentElement.style.overflow = "auto";
                      });
                    }
                    tableRef.current?._setSelectedRow(0);
                  }
                },
                onInput: async (e) => {
                  if (e.currentTarget.value === "") {
                    const searchQuery = query(searchInputRef.current?.value);
                    const dd = await executeQueryToClient(searchQuery);
                    setData(dd.data.data);
                  }
                },
              }}
              inputRef={searchInputRef}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={async (e) => {
                e.preventDefault();
                if (searchInputRef.current)
                  searchInputValueCache = searchInputRef.current.value;
                const searchQuery = query(searchInputRef.current?.value);
                const dd = await executeQueryToClient(searchQuery);
                setData(dd.data.data);
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
            }}
          >
            <DataGridViewReact
              columns={column}
              height={"100%"}
              ref={tableRef}
              getSelectedItem={getSelectedItem}
              onKeyDown={onKeyDown}
              focusElementOnMaxTop={() => {
                searchInputRef.current?.focus();
              }}
            />
          </div>
          <div style={{ padding: "0 10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Records: Top {data.length}
            </span>
          </div>
          <style>
            {`
                .btn-check-exit-modal:hover{
                    background:red !important;
                    color:white !important;
                }
            `}
          </style>
        </div>
      </div>
    ) : (
      <></>
    );
  };

  return {
    openModal,
    closeModal,
    UpwardTableModalSearch,
  };
};
let _dataCache: any = [];
let _searchInputValueCache = "";
export const useUpwardTableModalSearchSafeMode = ({
  column,
  link,
  getSelectedItem,
  onKeyDown,
  customWidth,
  onClose,
  size = "small",
}: any) => {
  const [show, setShow] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function openModal(search: string = "") {
    const body = document.body;
    const div = document.createElement("div");
    div.id = "modal-portal";

    if (document.getElementById("modal-portal"))
      body.removeChild(document.getElementById("modal-portal") as HTMLElement);
    body.insertBefore(div, body.firstChild);

    setShow(true);
    wait(100).then(() => {
      if (searchInputRef.current) {
        searchInputRef.current.value = search;
        const event = new KeyboardEvent("keydown", {
          code: "Enter",
          bubbles: true,
        });
        searchInputRef.current.focus(); // Ensure the element has focus
        searchInputRef.current.dispatchEvent(event); // Dispatch the native event
        wait(100).then(() => {
          searchInputRef.current?.focus();
        });
      }
    });
  }
  function closeModal(muteOnClose = true) {
    if (onClose && muteOnClose) {
      onClose();
    }
    setShow(false);
    _dataCache = [];
  }

  const UpwardTableModalSearch = forwardRef(({}: any, ref) => {
    const { user, myAxios } = useContext(AuthContext);

    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const tableRef = useRef<any>(null);
    const [blick, setBlick] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    function mutate(variable: any) {
      setIsLoading(true);
      myAxios
        .post(link, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        })
        .then((response) => {
          setData(response.data?.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    async function mutateReturnValue(variable: any) {
      try {
        setIsLoading(true);
        return await myAxios.post(link, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }

    useEffect(() => {
      if (_dataCache.length > 0) {
        if (searchInputRef.current) {
          searchInputRef.current.value = _searchInputValueCache;
        }
        setData(_dataCache);
      }
    }, [setData]);

    useEffect(() => {
      if (data.length > 0) {
        _dataCache = data;
      }
      tableRef.current?.setDataFormated(data);
    }, [data]);

    function customWidth(blick: boolean) {
      if (size === "large") {
        return blick ? "851px" : "850px";
      } else if (size === "medium") {
        return blick ? "651px" : "650px";
      } else {
        return blick ? "451px" : "450px";
      }
    }

    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    useImperativeHandle(ref, () => ({
      mutate,
      mutateReturnValue,
    }));

    return show ? (
      ReactDOM.createPortal(
        <div id="modal-inject">
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
            className="modal-table-datagridview"
            ref={modalRef}
            style={{
              background: "#F1F1F1",
              width: customWidth(blick),
              height: blick ? "501px" : "500px",
              position: "absolute",
              zIndex: 111111,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading && <Loading />}
            <div
              style={{
                height: "22px",
                background: "white",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                position: "relative",
                alignItems: "center",
                cursor: "grab",
              }}
              onMouseDown={handleMouseDown}
            >
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Search
              </span>
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
                  closeModal();
                }}
              >
                <CloseIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            <div
              style={{
                padding: "5px",
              }}
            >
              <TextInput
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Search : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                    display: "none",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "100%" },
                  onKeyDown: async (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      _searchInputValueCache = e.currentTarget.value;
                      mutate({ search: e.currentTarget.value });
                    }

                    if (e.code === "ArrowDown") {
                      const td = document.querySelector(
                        `.td.row-0`
                      ) as HTMLTableDataCellElement;
                      if (td) {
                        const parentElement =
                          tableRef.current.getParentElement();

                        td.focus({
                          preventScroll: true,
                        });
                        parentElement.style.overflow = "hidden";
                        wait(100).then(() => {
                          parentElement.style.overflow = "auto";
                        });
                      }
                      tableRef.current?._setSelectedRow(0);
                    }
                  },
                  onInput: (e) => {
                    if (e.currentTarget.value === "") {
                      mutate({ search: "" });
                    }
                  },
                }}
                inputRef={searchInputRef}
                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={async (e) => {
                  e.preventDefault();
                  if (searchInputRef.current)
                    _searchInputValueCache = searchInputRef.current.value;

                  mutate({ search: searchInputRef.current?.value });
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
              }}
            >
              <DataGridViewReact
                columns={column}
                height={"100%"}
                ref={tableRef}
                getSelectedItem={getSelectedItem}
                onKeyDown={onKeyDown}
                focusElementOnMaxTop={() => {
                  searchInputRef.current?.focus();
                }}
              />
            </div>
            <div style={{ padding: "0 10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Records: Top {data.length}
              </span>
            </div>
            <style>
              {`
                                    .btn-check-exit-modal:hover{
                                        background:red !important;
                                        color:white !important;
                                    }
                                `}
            </style>
          </div>
        </div>,
        document.getElementById("modal-portal") as HTMLElement
      )
    ) : (
      <></>
    );
  });

  return {
    openModal,
    closeModal,
    UpwardTableModalSearch,
    searchInputRef,
  };
};

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

const rowHeight = 20;
const buffer = 5;
export const DataGridViewReactUpgraded = forwardRef(
  (
    {
      columns,
      adjustVisibleRowCount = 100,
      RightClickComponent = (props: any) => {
        return <></>;
      },
      FooterComponent = (props: any) => {
        return <></>;
      },
      handleSelectionChange,
      onMaxScrollUp,
      adjustRightClickClientXAndY = { x: 0, y: 0 },
    }: any,
    ref
  ) => {
    let lastColIdx: any = null;
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [selectAll, setSelectAll] = useState(false);
    const [rightClickRowIndex, setRightClickRowIndex] = useState<any>(null);
    const [rightClickColumnIndex, setRightClickColumnIndex] =
      useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [visibleRowCount, setVisibleRowCount] = useState(25);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0);
    const [columnHeader, setColumnHeader] = useState([
      {
        key: "checkbox",
        label: "",
        width: 25,
        freeze: true,
      },
      ...columns.filter((itm: any) => !itm.hide),
    ]);
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

    const handleContextMenu = (e: React.MouseEvent, row: any, col: any) => {
      e.preventDefault();
      setRightClickRowIndex(row);
      setRightClickColumnIndex(col);
      const clickX = e.clientX - adjustRightClickClientXAndY.x;
      const clickY = e.clientY - adjustRightClickClientXAndY.y;

      setVisible(true);
      setPos({ x: clickX, y: clickY });
    };
    const handleClickCloseRightClickModal = () => {
      setVisible(false);
    };
    const handleCellKeyDown = (
      e: React.KeyboardEvent<HTMLDivElement>,
      rowIndex: number,
      colKey: string,
      row: any
    ) => {
      let targetRow = rowIndex;
      let colIndex = columnHeader.findIndex((col: any) => col.key === colKey);

      if (e.key === "Enter") {
        selectedRowAction(row);
      }

      if (e.code === "Delete" || e.code === "Backspace") {
        const confirm = window.confirm(
          "Are you sure you want to delete all the rows?"
        );
        if (confirm) {
          setData((data) => {
            return data.filter((itm: any) => itm.rowIndex !== row.rowIndex);
          });
        }
      }

      if (e.key === "ArrowUp" && targetRow === 0) {
        if (onMaxScrollUp) {
          onMaxScrollUp();
        }
      }

      if (e.key === "ArrowDown" && targetRow < data.length - 1) {
        targetRow++;
      } else if (e.key === "ArrowUp" && targetRow > 0) {
        targetRow--;
      } else if (e.key === "ArrowLeft" && colIndex > 0) {
        colIndex--;
      } else if (e.key === "ArrowRight" && colIndex < columnHeader.length - 1) {
        colIndex++;
      } else {
        return;
      }

      e.preventDefault();

      const nextKey = `${targetRow}-${columnHeader[colIndex].key}`;
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
      setVisible(false);
      const scrollTop = containerRef.current?.scrollTop || 0;
      const newStartIndex = Math.floor(scrollTop / rowHeight);
      setStartIndex(newStartIndex);
    }, []);

    useEffect(() => {
      if (columnHeader.length > 0) {
        setColumn([
          {
            key: "checkbox",
            label: "",
            width: 25,
            freeze: true,
          },
          ...columnHeader.filter((itm: any) => !itm.hide),
        ] as any);
      }
    }, [columnHeader]);
    useEffect(() => {
      const wH = window.innerHeight - adjustVisibleRowCount;
      const rowCount = Math.round(wH) / rowHeight;
      setVisibleRowCount(rowCount);

      const resize = () => {
        const wH = window.innerHeight - adjustVisibleRowCount;
        const rowCount = Math.round(wH) / rowHeight;
        setVisibleRowCount(rowCount);
      };
      window.addEventListener("resize", resize);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }, []);
    useEffect(() => {
      if (visible && menuRef.current) {
        const menu = menuRef.current;
        const { innerWidth, innerHeight } = window;
        const rect = menu.getBoundingClientRect();
        let newX = pos.x;
        let newY = pos.y;

        if (rect.width + pos.x > innerWidth) {
          newX = innerWidth - rect.width - 10;
        }

        if (rect.height + pos.y > innerHeight) {
          newY = innerHeight - rect.height - 10;
        }

        if (newX !== pos.x || newY !== pos.y) {
          setPos({ x: newX, y: newY });
        }
      }
    }, [visible, pos]);
    useEffect(() => {
      window.addEventListener("click", handleClickCloseRightClickModal);
      return () => {
        window.removeEventListener("click", handleClickCloseRightClickModal);
      };
    }, []);

    const selectedRowAction = (row: any) => {
      const _row = data.filter((itm: any) => itm.rowIndex === row.rowIndex);
      if (selectedRow !== null) {
        if (selectedRow !== row.rowIndex) {
          setSelectedRow(row.rowIndex);
          handleSelectionChange(_row[0]);
        } else {
          setSelectedRow(null);
          handleSelectionChange(null);
        }
      } else {
        handleSelectionChange(_row[0]);
        setSelectedRow(row.rowIndex);
      }
    };
    const widening = (colIdx: number | null) => {
      if (colIdx) {
        lastColIdx = colIdx;
        const allColumn: any = [...document.querySelectorAll(`.col-${colIdx}`)];
        allColumn.forEach((itm: HTMLDivElement) => {
          itm.style.borderRight = "2px solid #2344eb";
        });
        if (containerRef.current) {
          containerRef.current.classList.add("noselect");
        }
      } else {
        const allColumn: any = [
          ...document.querySelectorAll(`.col-${lastColIdx}`),
        ];
        allColumn.forEach((itm: HTMLDivElement) => {
          itm.style.borderRight = "1px solid #ebe8e8";
        });
        if (containerRef.current) {
          containerRef.current.classList.remove("noselect");
        }
      }
    };
    const onMouseDown = (e: any, col: any, colIdx: number) => {
      startXRef.current = e.clientX;
      startWidthRef.current = col.width;
      resizingColIndexRef.current = colIdx;

      const onMouseMove = (e: MouseEvent) => {
        widening(colIdx);
        const delta = e.clientX - startXRef.current;
        const newWidth = Math.max(startWidthRef.current + delta, 50); // minimum 50px
        setColumnHeader((prev: any) =>
          prev.map((c: any, i: any) =>
            i === colIdx ? { ...c, width: newWidth } : c
          )
        );
      };

      const onMouseUp = () => {
        widening(null);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        resizingColIndexRef.current = null;
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    const getFrozenLeft = (colIdx: number) => {
      let left = 0;
      for (let i = 0; i < colIdx; i++) {
        if (columnHeader[i].freeze) {
          left += columnHeader[i].width;
        }
      }
      return left;
    };

    useImperativeHandle(ref, () => ({
      getData: () => {
        const newData = [...data];
        return newData;
      },
      setData: (newData: any) => {
        setData(
          newData.map((itm: any, idx: number) => {
            return { ...itm, rowIndex: idx };
          })
        );
      },
      resetTable: () => {
        setData([]);
        setSelectedRow(null);
        setStartIndex(0);
      },
      getColumns: () => {
        return columns;
      },
      focusOnFirstRowColumn: () => {
        const firstCell = cellRefs.current[`${startIndex}-${columns[0].key}`];
        if (firstCell) {
          if (containerRef.current) {
            containerRef.current.style.overflowY = "hidden";
            wait(5).then(() => {
              if (containerRef.current)
                containerRef.current.style.overflowY = "auto";
            });
          }

          firstCell.focus();
        }
      },
      focusOnLastRowColumn: () => {
        const lastRowIndex = data.length - 1;
        const d = Math.round(lastRowIndex - visibleRowCount);
        console.log(d);
        setStartIndex(d);
        setSelectedRow(lastRowIndex);

        setTimeout(() => {
          const key = `${lastRowIndex}-${columns[0]?.key}`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
      getSelectedRow: () => {
        return selectedRow;
      },
      setSelectedRow: (_selectedRow: number) => {
        setStartIndex(
          Math.max(0, _selectedRow - Math.floor(visibleRowCount / 2))
        );
        setSelectedRow(_selectedRow);

        setTimeout(() => {
          const key = `${_selectedRow}-${columns[0]?.key}`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
    }));

    return (
      <>
        <div
          tabIndex={0}
          style={{
            flex: 1,
            width: "100vw",
            height: "auto",
            border: "1px solid #ebe8e8",
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
            }}
          >
            {/* Header */}
            <div
              className="header"
              style={{
                display: "flex",
                fontWeight: "bold",
                borderBottom: "1px solid #ebe8e8",
                background: "#f5f5f5",
                position: "sticky",
                top: 0,
                width: `${totalRowWidth - 25}px`,
                zIndex: 2,
              }}
            >
              {columnHeader.map((col: any, colIdx: number) => {
                return (
                  <div
                    key={col.key}
                    className={`col-${colIdx} header-col ${
                      col.freeze ? "freeze" : ""
                    }`}
                    style={{
                      width: `${col.width}px`,
                      padding: "1px 4px",
                      boxSizing: "border-box",
                      borderLeft: colIdx === 0 ? "none" : "1px solid #ebe8e8",
                      fontSize: "12px",
                      position: col.freeze ? "sticky" : "relative",
                      left: col.freeze ? `${getFrozenLeft(colIdx)}px` : "auto",
                      background: "#f5f5f5",
                      zIndex: col.freeze ? 2 : 1,
                    }}
                  >
                    {col.label}
                    <div
                      onMouseDown={(e) => {
                        onMouseDown(e, col, colIdx);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "3px",
                        height: "100%",
                        cursor: "col-resize",
                        zIndex: 2,
                        background: "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Body */}
            <div
              style={{
                height: `${data.length * rowHeight}px`,
                position: "relative",
              }}
            >
              {data.slice(startIndex, endIndex).map((row: any, idx) => {
                const actualIndex = startIndex + idx;
                return (
                  <div
                    className={`row ${
                      selectedRow === row.rowIndex || selectAll
                        ? "row-selected"
                        : "row-notSelected"
                    }`}
                    key={actualIndex}
                    style={{
                      position: "absolute",
                      top: `${actualIndex * rowHeight}px`,
                      display: "flex",
                      height: `${rowHeight}px`,
                    }}
                    draggable
                    onDragStart={() => setDraggedRowIndex(actualIndex)}
                    onDragOver={(e) => {
                      e.preventDefault(); // Required to allow drop
                    }}
                    onDrop={() => {
                      if (
                        draggedRowIndex === null ||
                        draggedRowIndex === actualIndex
                      )
                        return;

                      const updatedData = [...data];
                      const [draggedRow] = updatedData.splice(
                        draggedRowIndex,
                        1
                      );
                      updatedData.splice(actualIndex, 0, draggedRow);

                      // Re-index after drop
                      const reindexed: any = updatedData.map(
                        (item: any, index) => ({
                          ...item,
                          rowIndex: index,
                        })
                      );

                      setData(reindexed);
                      setDraggedRowIndex(null);
                    }}
                  >
                    {columnHeader.map((col: any, colIdx: number) => {
                      const key = `${actualIndex}-${col.key}`;
                      return (
                        <Fragment key={col.key}>
                          {colIdx === 0 && col.key === "checkbox" ? (
                            <div
                              tabIndex={0}
                              ref={(el) => (cellRefs.current[key] = el)}
                              onKeyDown={(e) =>
                                handleCellKeyDown(e, actualIndex, col.key, row)
                              }
                              className={` row-data row-idx-${
                                row.rowIndex
                              } col-${colIdx} ${col.freeze ? "freeze" : ""}`}
                              onContextMenu={(e) => {
                                handleContextMenu(e, row, col);
                              }}
                              style={{
                                width: `${col.width}px`,
                                boxSizing: "border-box",
                                outline: "none",
                                borderLeft:
                                  colIdx === 0 ? "none" : "1px solid #ebe8e8",
                                borderBottom: "1px solid #ebe8e8",
                                fontSize: "12px",
                                // cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                position: col.freeze ? "sticky" : "relative",
                                left: col.freeze
                                  ? `${getFrozenLeft(colIdx)}px`
                                  : "auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                checked={
                                  selectedRow === row.rowIndex || selectAll
                                }
                                type="checkbox"
                                readOnly={true}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  selectedRowAction(row);
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`row-data col-${colIdx} ${
                                col.freeze ? "freeze" : ""
                              }`}
                              ref={(el) => (cellRefs.current[key] = el)}
                              tabIndex={0}
                              onKeyDown={(e) =>
                                handleCellKeyDown(e, actualIndex, col.key, row)
                              }
                              onContextMenu={(e) => {
                                handleContextMenu(e, row, col);
                              }}
                              title={row[colIdx]}
                              style={{
                                width: `${col.width}px`,
                                padding: "1px 4px",
                                boxSizing: "border-box",
                                outline: "none",
                                borderLeft:
                                  colIdx === 0 ? "none" : "1px solid #ebe8e8",
                                borderBottom: "1px solid #ebe8e8",
                                fontSize: "12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                position: col.freeze ? "sticky" : "relative",
                                left: col.freeze
                                  ? `${getFrozenLeft(colIdx)}px`
                                  : "auto",
                              }}
                              onDoubleClick={() => {
                                selectedRowAction(row);
                              }}
                            >
                              {row[col.key]}
                              <div
                                onMouseDown={(e) => {
                                  onMouseDown(e, col, colIdx);
                                }}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  width: "3px",
                                  height: "100%",
                                  cursor: "col-resize",
                                  zIndex: 2,
                                  background: "transparent",
                                }}
                              />
                            </div>
                          )}
                        </Fragment>
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
              display: "flex",
            }}
          >
            <div style={{ width: "120px" }}>
              Total Rows : {data.length.toLocaleString("en-US")}
            </div>
            <FooterComponent />
          </div>
          {visible && (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: `${pos.y}px`,
                left: `${pos.x}px`,
                background: "#fff",
                border: "1px solid #ebe8e8",
                borderRadius: "6px",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
                zIndex: 1000,
                minWidth: "150px",
              }}
            >
              <RightClickComponent row={data[rightClickRowIndex.rowIndex]} />
              <div
                className="modal-action"
                onClick={() => {
                  selectedRowAction(rightClickRowIndex);
                }}
              >
                {selectedRow === rightClickRowIndex.rowIndex
                  ? "❎ UnSelect"
                  : "✅ Select"}
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  navigator.clipboard.writeText(
                    rightClickRowIndex[rightClickColumnIndex.key] || ""
                  );
                }}
              >
                📄 Copy
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  delete rightClickRowIndex.rowIndex;
                  navigator.clipboard.writeText(
                    Object.values(rightClickRowIndex).join(",")
                  );
                }}
              >
                📄 Copy Row
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  const confirm = window.confirm(
                    "Are you sure you want to delete all the rows?"
                  );
                  if (confirm) {
                    setData((data) => {
                      return data.filter(
                        (itm: any) =>
                          itm.rowIndex !== rightClickRowIndex.rowIndex
                      );
                    });
                  }
                }}
              >
                🗑️ Delete Row
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  setSelectAll(true);
                  setTimeout(() => {
                    const confirm = window.confirm(
                      "Are you sure you want to delete this rows?"
                    );
                    if (confirm) {
                      setData([]);
                    }
                    setSelectAll(false);
                  }, 100);
                }}
              >
                🗑️ Delete All Row
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
);

export const UpwardTableModalSearch = forwardRef(
  (
    {
      link,
      size = "small",
      column,
      handleSelectionChange,
    }: {
      link: string;
      size?: "small" | "large" | "medium";
      column: Array<any>;
      handleSelectionChange: (row: any) => void;
    },
    ref
  ) => {
    const { user, myAxios } = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const [blick, setBlick] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableRef = useRef<any>(null);
    const offset = useRef({ x: 0, y: 0 });
    const isMoving = useRef(false);

    const { mutate, isLoading } = useMutation({
      mutationKey: link,
      mutationFn: async (variable: any) =>
        await myAxios.post(link, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess: (response, variables) => {
        const data = response.data?.data;
        if (!show && data.length === 1) {
          handleSelectionChange(data[0]);
        } else {
          setShow(true);
          setTimeout(() => {
            tableRef.current?.setData(data);
            if (searchInputRef.current) {
              searchInputRef.current.value = variables.search;
            }
            searchInputRef.current?.focus();
          }, 100);
        }
      },
    });

    function customWidth(blick: boolean) {
      if (size === "large") {
        return blick ? "851px" : "850px";
      } else if (size === "medium") {
        return blick ? "651px" : "650px";
      } else {
        return blick ? "451px" : "450px";
      }
    }
    function adjustRightClickClientXAndY(size: string) {
      if (size === "large") {
        return { x: 260, y: 85 };
      } else if (size === "medium") {
        return { x: 360, y: 85 };
      } else {
        return { x: 460, y: 85 };
      }
    }

    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    //close Modal

    function closeModal() {
      setShow(false);
    }

    function openModal(search: string = "") {
      mutate({ search });
      // setShow(true);
    }

    useImperativeHandle(ref, () => ({
      mutate,
      closeModal,
      openModal,
    }));

    return (
      <>
        {isLoading && !show && <Loading />}
        {show && (
          <div id="modal-inject">
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
              className="modal-table-datagridview"
              ref={modalRef}
              style={{
                background: "#F1F1F1",
                width: customWidth(blick),
                height: blick ? "501px" : "500px",
                position: "absolute",
                zIndex: 111111,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
            >
              {isLoading && <Loading />}
              <div
                style={{
                  height: "22px",
                  background: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px",
                  position: "relative",
                  alignItems: "center",
                  cursor: "grab",
                }}
                onMouseDown={handleMouseDown}
              >
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Search
                </span>
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
                    closeModal();
                  }}
                >
                  <CloseIcon sx={{ fontSize: "22px" }} />
                </button>
              </div>
              <div
                style={{
                  padding: "5px",
                }}
              >
                <TextInput
                  containerStyle={{
                    width: "100%",
                  }}
                  label={{
                    title: "Search : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                      display: "none",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "100%" },
                    onKeyDown: async (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        mutate({ search: e.currentTarget.value });
                      }

                      if (e.code === "ArrowDown") {
                        tableRef.current.focusOnFirstRowColumn();
                      }
                    },
                    onInput: (e) => {
                      if (e.currentTarget.value === "") {
                        mutate({ search: "" });
                      }
                    },
                  }}
                  inputRef={searchInputRef}
                  icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={async (e) => {
                    e.preventDefault();
                    if (searchInputRef.current)
                      mutate({ search: searchInputRef.current?.value });
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  position: "relative",
                  flex: 1,
                  display: "flex",
                }}
              >
                <DataGridViewReactUpgraded
                  adjustVisibleRowCount={210}
                  ref={tableRef}
                  columns={column}
                  handleSelectionChange={handleSelectionChange}
                  onMaxScrollUp={() => {
                    searchInputRef.current?.focus();
                  }}
                  adjustRightClickClientXAndY={adjustRightClickClientXAndY(
                    size
                  )}
                />
              </div>
              <style>
                {`
              .btn-check-exit-modal:hover{
                  background:red !important;
                  color:white !important;
              }
          `}
              </style>
            </div>
          </div>
        )}
      </>
    );
  }
);
