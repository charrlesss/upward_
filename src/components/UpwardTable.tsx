

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

import "../style/datagridview.css";
import { Pagination } from "@mui/material";

interface UpwardTablePropsType {
  rows: Array<any>;
  column: Array<any>;
  width: number;
  height: number;
  dataReadOnly: boolean;
  onSelectionChange?: (row: Array<any>, rowIndex: number) => void;
  onKeyDown?: (row: Array<any>, key: string) => void;
  isMultipleSelect?: boolean;
  freeze?: boolean;
  inputsearchselector?: string;
  isRowSelectable?: boolean;
  unSelectable?: (row: any) => boolean;
  isLoading?: boolean
}

const UpwardTable = forwardRef(
  (
    {
      rows,
      column,
      width,
      height,
      dataReadOnly,
      onSelectionChange = () => { },
      isMultipleSelect = false,
      freeze = false,
      onKeyDown,
      inputsearchselector = ".search-input-up-on-key-down",
      isRowSelectable = true,
      unSelectable = () => false,
      isLoading
    }: UpwardTablePropsType,
    UpwardTableRef
  ) => {
    const [pages, setPages] = useState<Array<any>>([])
    const [pageNumber, setPageNumber] = useState(0)
    const onSelectionChangeRef = useRef(onSelectionChange);
    const onKeyDownRef = useRef(onKeyDown);
    const [columns, setColumns] = useState(column.filter((itm) => !itm.hide));
    const [hoveredColumn, setHoveredColumn] = useState(null);
    const [selectedRows, setSelectedRows] = useState<Array<number>>([0]);
    const [lastSelectedRowIndex, setLastSelectedRowIndex] = useState(0);
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const divRef = useRef<HTMLDivElement>(null);
    const [_clickTimeout, _setClickTimeout] = useState(null);


    useEffect(() => {
      const _pages = formatArrayIntoChunks(rows, 100)
      setPages(_pages)
    }, [rows])

    const startResize = (index: any, e: any) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columns[index].width;

      const doDrag = (moveEvent: any) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        const updatedColumns = [...columns];
        updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
        setColumns(updatedColumns);
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
    const handleRowClick = (
      rowIndex: any,
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      function getIndexAndData(selectedRowData: Array<any>) {
        const filterSelectrowData = selectedRowData.map((d, idx) => {
          if (!unSelectable(d)) {
            return { idx, data: d };
          }
          return null;
        });
        const removeNullValue = filterSelectrowData.filter((d) => d !== null);
        const data = removeNullValue.map((itm: any) => itm.data);
        const newSelectedRowsFiltered = removeNullValue.map(
          (itm: any) => itm.idx
        );
        return { newSelectedRowsFiltered, data };
      }

      if (!isMultipleSelect) {
        // Single selection mode
        setSelectedRows([rowIndex]);
      } else {
        // Multiple selection mode
        if (event.shiftKey && lastSelectedRowIndex !== null) {
          // Shift + Click: Select range between last clicked row and current clicked row
          const rangeStart = Math.min(lastSelectedRowIndex, rowIndex);
          const rangeEnd = Math.max(lastSelectedRowIndex, rowIndex);
          const newSelectedRows: Array<number> = [];
          for (let i = rangeStart; i <= rangeEnd; i++) {
            if (!selectedRows.includes(i)) {
              newSelectedRows.push(i);
            }
          }

          let selectedItemsParams: Array<number> = [
            ...selectedItems,
            ...newSelectedRows,
          ];

          setSelectedRows([...selectedRows, ...newSelectedRows]);
          const selectedRowData = rows.filter((d, idx) =>
            selectedItemsParams.includes(idx)
          );
          const { newSelectedRowsFiltered, data } =
            getIndexAndData(selectedRowData);

          setSelectedItems(newSelectedRowsFiltered);
          // onSelectionChangeRef.current(data, rowIndex);
        } else if (event.ctrlKey || event.metaKey) {
          // Ctrl (or Cmd on macOS) + Click: Toggle row selection
          if (selectedRows.includes(rowIndex) && !freeze) {
            setSelectedRows(selectedRows.filter((i) => i !== rowIndex));
            setSelectedItems((d) => {
              d = d.filter((i) => i !== rowIndex);
              return d;
            });
            let selectedItemsParams: Array<number> = selectedItems.filter(
              (i) => i !== rowIndex
            );
            const selectedRowData = rows.filter((d, idx) =>
              selectedItemsParams.includes(idx)
            );

            setSelectedItems(selectedItemsParams);
            // onSelectionChangeRef.current(selectedRowData, rowIndex);
          } else {
            setSelectedRows([...selectedRows, rowIndex]);
            setSelectedItems((d) => {
              d.push(rowIndex);
              return d;
            });
            let selectedItemsParams: Array<number> = [
              ...selectedItems,
              rowIndex,
            ];

            const selectedRowData = rows.filter((d, idx) =>
              selectedItemsParams.includes(idx)
            );

            setSelectedItems(selectedItemsParams);
            // onSelectionChangeRef.current(selectedRowData, rowIndex);
          }
        } else {
          // Regular click in multiple selection mode: Single click to select a row
          setSelectedRows([rowIndex]);
        }
      }
      setLastSelectedRowIndex(rowIndex); // Update the last selected index
    };
    const handleRowDoubleClick = (
      rowIndex: any,
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      const row = rows[rowIndex];
      if (unSelectable(row)) return;
      if (!isRowSelectable) return;


      let selectedItemsParams: Array<number> = [];
      if (isMultipleSelect) {
        selectedItemsParams = [...selectedItems, ...selectedRows];
      } else {
        selectedItemsParams = [rowIndex];
      }


      if (selectedItems.includes(rowIndex) && !freeze) {
        selectedItemsParams = selectedItems.filter((i) => i !== rowIndex);
        setSelectedItems(selectedItemsParams);
        onSelectionChangeRef.current([], rowIndex);
        return;
      }

      setSelectedItems(selectedItemsParams);
      onSelectionChangeRef.current([row], rowIndex);
    };
    const handleKeyDown = (e: any) => {

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedRows((prevIndex: any) => {
          if (prevIndex[prevIndex.length - 1] === null) return [0];
          if (prevIndex[prevIndex.length - 1] >= rows.length - 1) {
            return [rows.length - 1];
          }
          const newPrevIndex = prevIndex[prevIndex.length - 1] + 1;
          const row = document.querySelector(`.row-${newPrevIndex}`);
          row?.querySelector("input")?.focus();

          row?.scrollIntoView({ block: "end", behavior: "smooth" });
          return [newPrevIndex];
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();

        if (selectedRows[selectedRows.length - 1] === 0) {
          const input = document.querySelector(
            inputsearchselector
          ) as HTMLInputElement;
          if (input && input.tagName === "INPUT") {
            input?.focus();
          } else if (input && input.tagName === "DIV") {
            const divInput = document.querySelector(
              `${inputsearchselector} input`
            ) as HTMLInputElement;

            divInput?.focus();
          }
        }

        setSelectedRows((prevIndex: any) => {
          if (prevIndex[prevIndex.length - 1] === 0) return [0];
          const newPrevIndex = prevIndex[prevIndex.length - 1] - 1;
          const row = document.querySelector(`.row-${newPrevIndex}`);

          row?.scrollIntoView({ block: "end", behavior: "smooth" });
          row?.querySelector("input")?.focus();
          return [newPrevIndex];
        });
      }

    };
    const handleRowKeyDown = (e: any) => {
      e.stopPropagation()

      if (e.key === "Enter" || e.key === "NumpadEnter") {
        e.preventDefault();
        if (!isRowSelectable) return;

        let selectedItemsParams: Array<number> = [];
        const rowIndex = selectedRows[selectedRows.length - 1];
        if (isMultipleSelect) {
          selectedItemsParams = [...selectedItems, ...selectedRows];
        } else {
          selectedItemsParams = [rowIndex];
        }
        const row = rows[selectedItemsParams[selectedItemsParams.length - 1]];
        if (unSelectable(row)) {
          return;
        }

        if (selectedItems.includes(rowIndex) && !freeze) {
          selectedItemsParams = selectedItems.filter((i) => i !== rowIndex);
          setSelectedItems(selectedItemsParams);
          onSelectionChangeRef.current([], rowIndex);
          return;
        }

        setSelectedItems(selectedItemsParams);
        onSelectionChangeRef.current([row], rowIndex);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (!isRowSelectable) return;

        const selectedRowData = rows.filter((d, idx) =>
          selectedRows.includes(idx)
        );

        if (onKeyDownRef?.current) {
          onKeyDownRef?.current(selectedRowData, e.key);
        }
      }
    }
    useImperativeHandle(UpwardTableRef, () => ({
      resetTableSelected: () => {
        setSelectedRows([0]);
        setLastSelectedRowIndex(0);
        setSelectedItems([]);
        if (rows.length > 0) {
          const row = document.querySelector(`.row-${0}`);
          row?.scrollIntoView({ block: "end", behavior: "smooth" });
        }
      },
      getSelectedRows: () => {
        return rows.filter((d, idx) => selectedItems.includes(idx));
      },
      setSelectRows: (selectRows: any) => {
        setSelectedItems(selectRows)
      }
    }));





    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
        onKeyDown={handleKeyDown}
      >
        <div>
          <div className="table-frame-color">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: `${width - 10}px        `,
                height: `${height - 135}px`,
                minHeight: "270px"
              }}
              className="table-frame"
            >
              <div className="table-panel">
                <div ref={divRef} className={`grid-container `} tabIndex={-1}>
                  <div
                    className="grid-row grid-header"
                    style={{
                      position: "sticky",
                      zIndex: "10",
                      top: "-1px",
                      background: "white",
                    }}
                  >
                    {columns.map((col: any, index: number) => (
                      <div
                        key={index}
                        className={`grid-cell header-cell ${hoveredColumn === index ? `highlight-column` : ""
                          }`} // Add the class if hovered
                        style={{ width: col.width, height: "20px", }}
                      >
                        <input
                          style={{ fontWeight: "bold" }}
                          defaultValue={col.headerName}
                          readOnly
                          onChange={(e) => { }}
                        />
                        <div
                          className="resize-handle"
                          onMouseDown={(e) => startResize(index, e)}
                          onMouseEnter={(e) => {
                            e.preventDefault();
                            handleMouseEnter(index);
                          }} // On hover
                          onMouseLeave={(e) => {
                            e.preventDefault();
                            handleMouseLeave();
                          }} // On mouse leave
                        />
                      </div>
                    ))}
                  </div>
                  {pages[pageNumber]?.map((row: any, rowIndex: any) => (
                    <div
                      className={`grid-row row-${rowIndex}`} // Highlight selected row
                      key={rowIndex}
                      onClick={(e) => handleRowClick(rowIndex, e)}
                      onDoubleClick={(e) => {
                        e.stopPropagation()

                        if (_clickTimeout) {
                          clearTimeout(_clickTimeout);
                          _setClickTimeout(null);
                        }

                        const timeoutId: any = setTimeout(() => {
                          handleRowDoubleClick(rowIndex, e)
                        }, 300);

                        _setClickTimeout(timeoutId);



                      }}
                      onKeyDown={(e) => {

                        // e.stopPropagation()

                        if (_clickTimeout) {
                          clearTimeout(_clickTimeout);
                          _setClickTimeout(null);
                        }

                        const timeoutId: any = setTimeout(() => {
                          handleRowKeyDown(e)
                        }, 300);

                        _setClickTimeout(timeoutId);


                      }}
                    >
                      {columns.map((col: any, colIndex: number) => (
                        <div
                          key={colIndex}
                          style={{ width: col.width }}
                          className={`grid-cell ${hoveredColumn === colIndex ? `highlight-column` : ""
                            }`}
                        >
                          <input
                            value={row[col.field]}
                            onChange={(e) => { }}
                            readOnly={dataReadOnly}
                            className={`${selectedRows.includes(rowIndex)
                              ? "selected-row"
                              : ""
                              } ${selectedItems.includes(rowIndex)
                                ? "selected-items"
                                : ""
                              }
                          ${col.type === "number" ? "number" : "text"}
                          `}
                          />
                          <div
                            className="resize-handle"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              startResize(colIndex, e);
                            }}
                            onMouseEnter={(e) => {
                              e.preventDefault();
                              handleMouseEnter(colIndex);
                            }} // On hover
                            onMouseLeave={(e) => {
                              e.preventDefault();
                              handleMouseLeave();
                            }} // On mouse leave
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isLoading && <div className="table-loading">
              <div className="loader"></div>
            </div>}
          </div>
          <div className="table-panel-footer" >
            <div>Records : {rows.length}</div>
            <div><Pagination count={pages.length} onChange={(e, value) => {
              setPageNumber(value - 1)
            }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function formatArrayIntoChunks(arr: Array<any>, chunkSize = 100) {
  let result = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    // Use slice to create chunks of 'chunkSize'
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}





export { UpwardTable, };
