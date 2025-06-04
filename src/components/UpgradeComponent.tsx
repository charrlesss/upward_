import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import "../style/datagridview.css";

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
    const tbodyRef = useRef<HTMLTableSectionElement>(null);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0);
    const [columnHeader, setColumnHeader] = useState(
      columns.filter((itm: any) => !itm.hide)
    );
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
      let colIndex = columnHeader.findIndex((col: any) => col.key === colKey);

      if (e.key === "Enter") {
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
      const scrollTop = containerRef.current?.scrollTop || 0;
      const newStartIndex = Math.floor(scrollTop / rowHeight);
      setStartIndex(newStartIndex);
    }, []);

    useEffect(() => {
      if (columnHeader.length > 0) {
        setColumn(columnHeader.filter((itm: any) => !itm.hide));
      }
    }, [columnHeader]);

    useImperativeHandle(ref, () => ({
      checkNoIsExist: (checkNo: string) => {
        return data.some((subArray: any) => subArray[2] === checkNo);
      },
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
      // getSelectedRow: () => {
      //   return selectedRowIndex;
      // },
      // setSelectedRow: (value: any) => {
      //   return setSelectedRowIndex(value);
      // },
      resetCheckBox: () => {
        // return handleResetCheckBox();
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
              zIndex: 2,
              marginBottom: "2px",
            }}
          >
            {columnHeader.map((col: any, colIdx: number) => (
              <div
                key={col.key}
                style={{
                  width: `${col.width}px`,
                  padding: "2px 5px",
                  boxSizing: "border-box",
                  // borderRight: "1px solid #ccc",
                  borderLeft: colIdx === 0 ? "none" : "1px solid #ccc",
                  fontSize: "12px",
                  position: "relative",
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
                  {columnHeader.map((col: any, colIdx: number) => {
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
                          position: "relative",
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
                              document.removeEventListener(
                                "mousemove",
                                onMouseMove
                              );
                              document.removeEventListener(
                                "mouseup",
                                onMouseUp
                              );
                              resizingColIndexRef.current = null;
                            };

                            document.addEventListener("mousemove", onMouseMove);
                            document.addEventListener("mouseup", onMouseUp);
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
