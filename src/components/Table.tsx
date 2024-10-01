import {
  useState,
  useContext,
  createContext,
  ReactElement,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridSlotsComponentsProps,
  gridPageCountSelector,
  GridPagination,
  useGridApiContext,
  useGridSelector,
  GridRowSelectionModel,
  GridColDef,
  GridRowParams,
  GridCellParams,
  GridTreeNode,
} from "@mui/x-data-grid";
import { TablePaginationProps } from "@mui/material/TablePagination";
import MuiPagination from "@mui/material/Pagination";

interface TableProps {
  isLoading: boolean;
  columns: Array<any>;
  rows: Array<any>;
  table_id: string;
  isSingleSelection: boolean;
  isRowFreeze: boolean;
  dataSelection?: (selection: any, data: any, code: string | null) => void;
  CustomFooterComponent?: any;
  isRowSelectable?: ((params: GridRowParams<any>) => boolean) | undefined;
  getCellClassName?:
    | ((params: GridCellParams<any, any, any, GridTreeNode>) => string)
    | undefined;
  footerChildren?: (
    rowSelectionModel: GridRowSelectionModel,
    rows: Array<any>
  ) => ReactElement;
  footerPaginationPosition?: string;
  showFooterSelectedCount?: boolean;
  checkboxSelection?: boolean | undefined;
}

const TableContext = createContext<{
  rowSelectionModel: GridRowSelectionModel;
  rows: Array<any>;
  footerPaginationPosition?: string;
  showFooterSelectedCount?: boolean;
  footerChildren: (
    rowSelectionModel: GridRowSelectionModel,
    rows: Array<any>
  ) => ReactElement;
}>({
  rows: [],
  rowSelectionModel: [],
  footerChildren: () => <div></div>,
  footerPaginationPosition: "right-left",
  showFooterSelectedCount: true,
});
const Table = forwardRef(
  (
    {
      isLoading,
      columns,
      rows,
      table_id,
      isSingleSelection,
      isRowFreeze,
      dataSelection,
      CustomFooterComponent = DefaultooterComponent,
      isRowSelectable,
      getCellClassName,
      checkboxSelection = true,
      footerChildren = (
        rowSelectionModel: GridRowSelectionModel,
        rows: Array<any>
      ) => <div></div>,
      footerPaginationPosition = "right-left",
      showFooterSelectedCount = true,
    }: TableProps,
    ref
  ) => {
    const [selectedRows, setSelectedRows] = useState<any>([]);

    useImperativeHandle(ref, () => ({
      removeSelection: () => {
        setSelectedRows([]);
      },
      getSelectedRows: () => {
        return rows.filter((item: any) =>
          selectedRows?.includes(item[table_id])
        );
      },
      setSelectedRows: (data: Array<any>) => {
        setSelectedRows(data);
      },
    }));

    function onSelectionChange(selection: any, data: any, code: string | null) {
      if (dataSelection) {
        dataSelection(selection, data, code);
      }
    }
    let freezeArray: Array<any> = [];

    return (
      <TableContext.Provider
        value={{
          showFooterSelectedCount,
          footerPaginationPosition,
          rowSelectionModel: selectedRows,
          rows,
          footerChildren,
        }}
      >
        <DataGrid
          slots={{
            loadingOverlay: LinearProgress,
            footer: CustomFooterComponent,
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 35 } },
          }}
          loading={isLoading}
          getRowId={(row) => row[table_id]}
          columns={columns.filter((col: any) => !col.hide) as GridColDef<any>[]}
          rows={rows}
          showCellVerticalBorder={true}
          showColumnVerticalBorder={true}
          checkboxSelection={checkboxSelection}
          rowSelectionModel={selectedRows}
          rowHeight={25}
          columnHeaderHeight={35}
          pageSizeOptions={[10, 20, 35, 50, 75, 100]}
          sx={{
            "& .cash": {
              color: "#ec4899",
            },
            "& .check": {
              color: "#0891b2",
            },
            "& .approved": {
              color: "green",
            },
            "& .pending": {
              color: "orange",
            },
            "& .disapproved": {
              color: "red",
            },
            "& .normal": {
              color: "red",
            },
            "& .MuiDataGrid-row.Mui-selected:hover": {
              color: "black",
              "& .MuiSvgIcon-root ": {
                fill: "#3b82f6",
              },
            },
            "& .hover-keyboard": {
              background: "#2563eb",
              color: "white",
              "& .MuiSvgIcon-root ": {
                fill: "white",
              },
            },
            "& .MuiDataGrid-row:hover": {
              background: "#2563eb",
              color: "white",
              "& .MuiSvgIcon-root ": {
                fill: "white",
              },
            },
            "& .MuiDataGrid-row.hover": {
              background: "#2563eb",
              color: "white",
              "& .MuiSvgIcon-root ": {
                fill: "white",
              },
            },
            "& .MuiTablePagination-root p ": {
              padding: "0 !important",
            },

            ...{
              "& .MuiDataGrid-columnHeaders": {
                background: "#64748b",
                color: "white",
                fontSize: "14px",
                // borderBottomColor: "#38bdf8",
              },
              "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer .MuiSvgIcon-root ":
                {
                  display: isSingleSelection || isRowFreeze ? "none" : "block",
                  fill: "white",
                },
              "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer input ":
                {
                  display: isSingleSelection || isRowFreeze ? "none" : "block",
                },
            },
            ...{
              fontSize: 13,
              fontWeight: 500,
              "& .MuiDataGrid-checkboxInput": {
                height: "27px",
                width: "27px",
              },
              "& .MuiDataGrid-checkboxInput svg": {
                height: "20px",
                width: "20px",
              },
            },
          }}
          // onRowDoubleClick={(e, r) => {
          //   console.log(e, r);
          // }}

          onRowSelectionModelChange={(selection) => {
            if (isRowFreeze) {
              if (selection.length <= 0) return;
              freezeArray = selection;
              if (selectedRows.includes(freezeArray[freezeArray.length - 1]))
                return;

              setSelectedRows(selection);

              onSelectionChange([selection[selection.length - 1]], rows, null);
              return;
            }

            if (!isRowFreeze && isSingleSelection) {
              if (selectedRows && selectedRows?.length > 0) {
                const selectionSet = new Set(selectedRows);
                setSelectedRows(
                  selection.filter((s: any) => !selectionSet.has(s))
                );
              } else {
                setSelectedRows(selection);
              }
            } else {
              setSelectedRows(selection);
            }

            onSelectionChange([selection[selection.length - 1]], rows, null);
          }}
          onCellKeyDown={(__: any, key: any) => {
            const keyFinding = ["NumpadEnter", "Enter", "Delete", "Backspace"];
            if (!keyFinding.includes(key.code)) {
              return;
            }
            key.preventDefault();
            if (key.code === "Enter" || key.code === "NumpadEnter") {
              if (isSingleSelection && !isRowFreeze) {
                return setSelectedRows((data: any) => {
                  if (data && data.length > 0 && data[0] === __.rowNode.id) {
                    onSelectionChange([], rows, key.code);
                    return [];
                  }
                  onSelectionChange([__.rowNode.id], rows, key.code);
                  return [__.rowNode.id];
                });
              } else {
                setSelectedRows((data: any) => {
                  if (
                    data &&
                    !isRowFreeze &&
                    data.length > 0 &&
                    data.includes(__.rowNode.id)
                  ) {
                    data = data.filter((item: any) => item !== __.rowNode.id);
                    onSelectionChange([], rows, key.code);
                    return data;
                  }
                  if (
                    data &&
                    isRowFreeze &&
                    data.length > 0 &&
                    data.includes(__.rowNode.id)
                  ) {
                    return data;
                  }
                  onSelectionChange([__.rowNode.id], rows, key.code);
                  return [...data, __.rowNode.id];
                });
              }
              return;
            }
            if (key.code === "Delete" || key.code === "Backspace") {
              setSelectedRows([__.rowNode.id]);
              return onSelectionChange([__.rowNode.id], rows, key.code);
            }
          }}
          disableVirtualization
          isRowSelectable={isRowSelectable}
          getCellClassName={getCellClassName}
        />
      </TableContext.Provider>
    );
  }
);

export default Table;
function Pagination({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <MuiPagination
      variant="outlined"
      color="primary"
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1);
      }}
    />
  );
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}
function DefaultooterComponent(
  props: NonNullable<GridSlotsComponentsProps["footer"]>
) {
  const {
    rowSelectionModel,
    showFooterSelectedCount,
    footerPaginationPosition,
    footerChildren,
    rows,
  } = useContext(TableContext);
  return (
    <Box
      sx={{
        columnGap: "50px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        px: 3,
        alignItems: "center",
        flexDirection:
          footerPaginationPosition === "right-left" ? "row-reverse" : "row",
      }}
    >
      <CustomPagination {...props} />
      <Box
        sx={{
          display: "flex",
          justifyContent:
            footerPaginationPosition === "right-left"
              ? "flex-start"
              : "flex-end",
          flex: 1,
          alignItems: "center",
        }}
      >
        {showFooterSelectedCount && (
          <div>Selected:{rowSelectionModel?.length}</div>
        )}
        <div>{footerChildren(rowSelectionModel, rows)}</div>
      </Box>
    </Box>
  );
}
