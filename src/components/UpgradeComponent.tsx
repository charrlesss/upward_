import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useCallback,
  Fragment,
  ReactElement,
} from "react";
import "../style/datagridview.css";

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
      handleSelectionChange,
    }: any,
    ref
  ) => {
    let lastColIdx: any = null;
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
      const clickX = e.clientX;
      const clickY = e.clientY;

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
      getColumns: () => {
        return columns;
      },
      focusFirstRowColumn: () => {
        const firstCell = cellRefs.current[`${startIndex}-${columns[0].key}`];
        if (firstCell) {
          firstCell.focus();
        }
      },
    }));

    const selectedRowAction = (row: any) => {
      if (selectedRow !== null) {
        if (selectedRow !== row.rowIndex) {
          setSelectedRow(row.rowIndex);
          handleSelectionChange(row);
        } else {
          setSelectedRow(null);
          handleSelectionChange(null);
        }
      } else {
        handleSelectionChange(row);
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
              padding: "0px 3px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                fontWeight: "bold",
                borderBottom: "1px solid #ebe8e8",
                background: "#f5f5f5",
                position: "sticky",
                top: 0,
                width: `${totalRowWidth + 25}px`,
                zIndex: 2,
              }}
            >
              {columnHeader.map((col: any, colIdx: number) => (
                <div
                  className={`col-${colIdx}`}
                  key={col.key}
                  style={{
                    width: `${col.width}px`,
                    padding: "1px 4px",
                    boxSizing: "border-box",
                    borderLeft: colIdx === 0 ? "none" : "1px solid #ebe8e8",
                    fontSize: "12px",
                    position: "relative",
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
              ))}
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
                              className={` row-data row-idx-${row.rowIndex} col-${colIdx}`}
                              onContextMenu={(e) => {
                                handleContextMenu(e, row, col);
                              }}
                              style={{
                                width: `25px`,
                                boxSizing: "border-box",
                                outline: "none",
                                borderRight: "1px solid #ebe8e8",
                                borderBottom: "1px solid #ebe8e8",
                                fontSize: "12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap", // Prevent text wrapping
                                overflow: "hidden", // Hide overflowing text
                                textOverflow: "ellipsis",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
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
                              className={`row-data col-${colIdx}`}
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
                                whiteSpace: "nowrap", // Prevent text wrapping
                                overflow: "hidden", // Hide overflowing text
                                textOverflow: "ellipsis",
                                position: "relative",
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
            }}
          >
            Total Rows : {data.length.toLocaleString("en-US")}
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
                      "Are you sure you want to delete all the rows?"
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
