import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useContext,
  Fragment,
  useCallback,
} from "react";
import SearchIcon from "@mui/icons-material/Search";
import { TextInput } from "./UpwardFields";
import { wait } from "../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "./AuthContext";
import { Loading } from "./Loading";
import "../style/datagridview.css";
import { useMutation } from "react-query";

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
      adjustOnRezise = true,
      onDelete = (data: any) => {},
      onKeyDelete,
      beforeDelete = (data: any) => false,
      fixedRowCount = 0,
      DisplayData = ({ row, col }: any) => {
        return <>{row[col.key]}</>;
      },
      disableUnselection = false,
      isModal = false,
      disableDelete = false,
      disableDeleteAll = false,
    }: any,
    ref
  ) => {
    let lastColIdx: any = null;
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [selectAll, setSelectAll] = useState(false);
    const [highlightsRow, setHighlightsRow] = useState<Array<number>>([]);
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
      if (!disableDelete) {
        if (e.code === "Delete" || e.code === "Backspace") {
          const rowItm = data.filter(
            (itm: any) => itm.rowIndex === row.rowIndex
          );
          if (onKeyDelete) {
            return onKeyDelete(rowItm[0]);
          }
          if (beforeDelete(rowItm[0])) {
            return;
          }

          const confirm = window.confirm(
            "Are you sure you want to delete all the rows?"
          );
          if (confirm) {
            const newData = data.filter(
              (itm: any) => itm.rowIndex !== row.rowIndex
            );
            setData(newData);
            onDelete(newData);
          }
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
      if (fixedRowCount > 0) {
        return setVisibleRowCount(fixedRowCount);
      }

      const wH = window.innerHeight - adjustVisibleRowCount;
      const rowCount = Math.round(wH) / rowHeight;
      setVisibleRowCount(rowCount);

      const resize = () => {
        if (adjustOnRezise) {
          const wH = window.innerHeight - adjustVisibleRowCount;
          const rowCount = Math.round(wH) / rowHeight;
          setVisibleRowCount(rowCount);
        }
      };
      window.addEventListener("resize", resize);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }, [adjustOnRezise, fixedRowCount, adjustVisibleRowCount]);

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
          if (disableUnselection) {
            return;
          }

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
        setStartIndex(d);
        // setSelectedRow(lastRowIndex);

        setTimeout(() => {
          const key = `${lastRowIndex}-${columns[0]?.key}`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
      scrollToBottom: () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      },
      scrollToTop: () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      },
      resetSelectedRow: () => {
        return setSelectedRow(null);
      },
      getSelectedRow: () => {
        return selectedRow;
      },
      setSelectedRow: (_selectedRow: number) => {
        if (_selectedRow) {
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
              setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus();
              });
            }
          }, 10);
        } else {
          setSelectedRow(_selectedRow);
        }
      },
      setHighlightsRow: (items: Array<number>) => {
        setHighlightsRow(items);
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
            boxShadow: " -1px 3px 5px -3px rgba(0,0,0,0.75)",
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
                    }
                    ${
                      highlightsRow.includes(row.rowIndex) ? "row-selected" : ""
                    }
                    
                    `}
                    key={actualIndex}
                    style={{
                      position: "absolute",
                      top: `${actualIndex * rowHeight}px`,
                      display: "flex",
                      height: `${rowHeight}px`,
                      boxSizing: "border-box",
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
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                handleCellKeyDown(e, actualIndex, col.key, row);
                              }}
                              className={` row-data row-idx-${
                                row.rowIndex
                              } col-${colIdx} ${col.freeze ? "freeze" : ""}`}
                              onContextMenu={(e) => {
                                e.stopPropagation();
                                handleContextMenu(e, row, col);
                              }}
                              style={{
                                width: `${col.width}px`,
                                boxSizing: "border-box",
                                outline: "none",
                                borderLeft:
                                  colIdx === 0
                                    ? "none"
                                    : "1px solid rgb(245, 240, 240)",
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
                                  selectedRow === row.rowIndex ||
                                  highlightsRow.includes(row.rowIndex) ||
                                  selectAll
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
                              } `}
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
                                  colIdx === 0
                                    ? "none"
                                    : "1px solid rgb(245, 240, 240)",
                                // borderBottom: "1px solid #ebe8e8",
                                fontSize: "12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                position: col.freeze ? "sticky" : "relative",
                                left: col.freeze
                                  ? `${getFrozenLeft(colIdx)}px`
                                  : "auto",
                                textAlign:
                                  col.type === "number" ? "right" : "left",
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                selectedRowAction(row);
                              }}
                            >
                              {/* {row[col.key]} */}
                              <DisplayData row={row} col={col} />
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
              Total Rows :{" "}
              {(data.length > 0 ? data.length : 0).toLocaleString("en-US")}
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
              <RightClickComponent
                row={
                  data.filter(
                    (itm: any) => itm.rowIndex === rightClickRowIndex.rowIndex
                  )[0]
                }
              />
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
              {!disableDelete && (
                <>
                  <div
                    className="modal-action"
                    onClick={() => {
                      const rowItm = data.filter(
                        (itm: any) =>
                          itm.rowIndex === rightClickRowIndex.rowIndex
                      );
                      if (onKeyDelete) {
                        return onKeyDelete(rowItm[0]);
                      }
                      if (beforeDelete(rowItm[0])) {
                        return;
                      }

                      const confirm = window.confirm(
                        "Are you sure you want to delete this rows?"
                      );
                      if (confirm) {
                        const newData = data.filter(
                          (itm: any) =>
                            itm.rowIndex !== rightClickRowIndex.rowIndex
                        );
                        setData(newData);
                        onDelete(newData);
                      }
                    }}
                  >
                    🗑️ Delete Row
                  </div>
                  {!disableDeleteAll && (
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
                            onDelete([]);
                          }
                          setSelectAll(false);
                        }, 100);
                      }}
                    >
                      🗑️ Delete All Row
                    </div>
                  )}
                </>
              )}
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
      otherFormData = () => ({}),
      disableUnselection = false,
      DisplayData = ({ row, col }: any) => {
        return <>{row[col.key]}</>;
      },
      autoselection = true,
      showSearchInput = true,
      onCloseModal = () => ({}),
    }: {
      link: string;
      size?: "small" | "large" | "medium";
      column: Array<any>;
      handleSelectionChange: (row: any) => void;
      otherFormData?: any;
      disableUnselection?: Boolean;
      DisplayData?: any;
      autoselection?: Boolean;
      showSearchInput?: Boolean;
      onCloseModal?: () => void;
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
        await myAxios.post(
          link,
          { ...variable, ...otherFormData },
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (response, variables) => {
        const data = response.data?.data;
        if (autoselection) {
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
      onCloseModal();
      setShow(false);
    }

    function openModal(search: string = "", selectedRow: Array<number>) {
      mutate({ search, ...otherFormData(), selectedRow });
      // setShow(true);
    }

    useImperativeHandle(ref, () => ({
      mutate,
      closeModal,
      openModal,
      resetSelectedRow: () => {
        tableRef.current.resetSelectedRow();
      },
      setHighlightsRow: (items: Array<number>) => {
        tableRef.current.setHighlightsRow(items);
      },
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
                  buttonStyle={{
                    opacity: showSearchInput ? 1 : 0,
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
                    disabled: !showSearchInput,
                    type: "text",
                    style: { width: "100%" },
                    onKeyDown: async (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        tableRef.current.resetSelectedRow();
                        mutate({
                          search: e.currentTarget.value,
                          ...otherFormData(),
                        });
                      }

                      if (e.code === "ArrowDown") {
                        tableRef.current.focusOnFirstRowColumn();
                      }
                    },
                    onInput: (e) => {
                      if (e.currentTarget.value === "") {
                        mutate({ search: "", ...otherFormData() });
                      }
                    },
                  }}
                  inputRef={searchInputRef}
                  icon={
                    <SearchIcon
                      sx={{
                        fontSize: "18px",
                        opacity: showSearchInput ? 1 : 0,
                      }}
                    />
                  }
                  onIconClick={async (e) => {
                    e.preventDefault();
                    if (searchInputRef.current)
                      mutate({
                        search: searchInputRef.current?.value,
                        ...otherFormData(),
                      });
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
                  disableUnselection={disableUnselection}
                  adjustVisibleRowCount={180}
                  DisplayData={DisplayData}
                  ref={tableRef}
                  columns={column}
                  handleSelectionChange={handleSelectionChange}
                  onMaxScrollUp={() => {
                    searchInputRef.current?.focus();
                  }}
                  fixedRowCount={21}
                  adjustOnRezise={false}
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
export const DataGridViewReactMultipleSelection = forwardRef(
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
      beforeSelectionChange,
      onDelete = (data: any) => {},
      rows = [],
      disableUnselection = false,
      disableSelection = false,
      disableSelectAll = false,
      adjustOnRezise = true,
      fixedRowCount = 0,
      DisplayData = ({ row, col }: any) => {
        return <>{row[col.key]}</>;
      },
    }: any,
    ref
  ) => {
    let lastColIdx: any = null;
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [rightClickRowIndex, setRightClickRowIndex] = useState<any>(null);
    const [rightClickColumnIndex, setRightClickColumnIndex] =
      useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [selectedRow, setSelectedRow] = useState<Array<number | null>>([]);
    const [visibleRowCount, setVisibleRowCount] = useState(25);
    const [data, setData] = useState(rows);
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
      if (e.key === "Backspace" || e.key === "Delete") {
        const confirm = window.confirm(
          "Are you sure you want to delete all the rows?"
        );
        if (confirm) {
          const newData = data.filter(
            (itm: any) => itm.rowIndex !== row.rowIndex
          );
          setData(newData);
          onDelete(newData);
        }
        return;
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
      if (fixedRowCount > 0) {
        return setVisibleRowCount(fixedRowCount);
      }

      const wH = window.innerHeight - adjustVisibleRowCount;
      const rowCount = Math.round(wH) / rowHeight;
      setVisibleRowCount(rowCount);

      const resize = () => {
        if (adjustOnRezise) {
          const wH = window.innerHeight - adjustVisibleRowCount;
          const rowCount = Math.round(wH) / rowHeight;
          setVisibleRowCount(rowCount);
        }
      };
      window.addEventListener("resize", resize);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }, [adjustOnRezise, fixedRowCount, adjustVisibleRowCount]);

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
      if (disableSelection) {
        return;
      }
      if (beforeSelectionChange) {
        if (beforeSelectionChange(row)) {
          return;
        }
      }
      if (selectedRow.length > 0) {
        if (!selectedRow.includes(row.rowIndex)) {
          const newSelection = [...selectedRow, row.rowIndex];
          setSelectedRow(newSelection);
          handleSelectionChange(row);
        } else {
          if (disableUnselection) {
            return;
          }
          const newSelection = selectedRow.filter(
            (itm) => itm !== row.rowIndex
          );
          setSelectedRow(newSelection);
          handleSelectionChange(null);
        }
      } else {
        const newSelection = [...selectedRow, row.rowIndex];
        handleSelectionChange(row);
        setSelectedRow(newSelection);
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
        setSelectedRow([]);
        setStartIndex(0);
      },
      getColumns: () => {
        return columns;
      },
      focusOnFirstRowColumn: () => {
        const firstCell = cellRefs.current[`${startIndex}-${columns[0].key}`];
        if (firstCell) {
          firstCell.focus();
        }
      },
      focusOnLastRowColumn: () => {
        const lastRowIndex = data.length - 1;
        const d = Math.round(lastRowIndex - visibleRowCount);
        console.log(d);
        setStartIndex(d);
        setSelectedRow([lastRowIndex]);

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
      setSelectedRowWithoutScroll: (_selectedRow: Array<number | null>) => {
        // setStartIndex(0);
        setSelectedRow(_selectedRow);
      },
      setSelectedRow: (_selectedRow: Array<number | null>) => {
        const startSelected =
          _selectedRow.length > 0
            ? (_selectedRow[_selectedRow.length - 1] as number)
            : 0;
        setStartIndex(
          Math.max(0, startSelected - Math.floor(visibleRowCount / 2))
        );
        setSelectedRow(_selectedRow);

        setTimeout(() => {
          const key = `${startSelected}-${columns[0]?.key}`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
      getSelectedRowData: () => {
        return data.filter((row: any) => selectedRow.includes(row.rowIndex));
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
                      textAlign: col.type === "number" ? "center" : "left",
                    }}
                  >
                    {col.key === "checkbox" ? (
                      <input
                        disabled={disableSelection || disableSelectAll}
                        type="checkbox"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          if (e.currentTarget.checked) {
                            setSelectedRow(
                              Array.from({ length: data.length }, (_, i) => i)
                            );
                          } else {
                            setSelectedRow([]);
                          }
                        }}
                      />
                    ) : (
                      col.label
                    )}

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
              {data.slice(startIndex, endIndex).map((row: any, idx: number) => {
                const actualIndex = startIndex + idx;
                return (
                  <div
                    className={`row ${
                      selectedRow.includes(row.rowIndex)
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
                                checked={selectedRow.includes(row.rowIndex)}
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
                                textAlign:
                                  col.type === "number" ? "right" : "left",
                              }}
                              onDoubleClick={() => {
                                selectedRowAction(row);
                              }}
                            >
                              {/* {row[col.key]} */}
                              <DisplayData row={row} col={col} />
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
            <div style={{ width: "150px" }}>
              Selected Rows : {selectedRow.length.toLocaleString("en-US")}
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
                  if (selectedRow.length <= 0) {
                    setSelectedRow(
                      Array.from({ length: data.length }, (_, i) => i)
                    );
                  } else {
                    setSelectedRow([]);
                  }
                }}
              >
                {selectedRow.length > 0 ? "❎ UnSelect All" : "✅ Select All"}
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  selectedRowAction(rightClickRowIndex);
                }}
              >
                {selectedRow.includes(rightClickRowIndex.rowIndex)
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
                    setData((data: any) => {
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
                  setSelectedRow(
                    Array.from({ length: data.length }, (_, i) => i)
                  );
                  setTimeout(() => {
                    const confirm = window.confirm(
                      "Are you sure you want to delete this rows?"
                    );
                    if (confirm) {
                      setData([]);
                    }

                    setSelectedRow([]);
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
