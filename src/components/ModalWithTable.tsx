import React from "react";
import {
  GridRowSelectionModel,
  GridRowParams,
  GridCellParams,
  GridTreeNode,
} from "@mui/x-data-grid";
import { Modal, Box, Typography, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Table from "./Table";

interface ModalWithTableParams {
  height: number;
  isLoading: boolean;
  queryKey: string;
  columns: Array<any>;
  onSelectionChange: (rowSelectionModel: Array<any>, data: Array<any>) => void;
  setRows: React.Dispatch<React.SetStateAction<GridRowSelectionModel>>;
  rows: GridRowSelectionModel;
  id: string;
  onCloseModal: () => void;
  onClickCloseIcon: () => void;
  showModal: boolean;
  searchOnChange:
  | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  | undefined;
  title?: string;
  searchRef?: React.RefObject<HTMLInputElement>;
  onCellKeyDown?: any;
  onSearchKeyEnter?: (search: string) => void;
  isRowSelectable?: ((params: GridRowParams<any>) => boolean) | undefined;
  getCellClassName?:
  | ((params: GridCellParams<any, any, any, GridTreeNode>) => string)
  | undefined;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  heigth: "auto",
};

export default function ModalWithTable({
  height,
  isLoading,
  queryKey,
  columns,
  onSelectionChange,
  setRows,
  rows,
  id,
  onCloseModal,
  showModal,
  onClickCloseIcon,
  searchOnChange,
  title = "",
  searchRef,
  onCellKeyDown,
  onSearchKeyEnter = () => { },
  isRowSelectable,
  getCellClassName,
}: ModalWithTableParams) {
  const mainId = generateRandomClass();

  return (
    <Modal
      open={showModal}
      onClose={onCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
          {title}
        </Typography>
        <TextField
          size="small"
          label="Search"
          sx={{ marginBottom: "10px" }}
          fullWidth
          onChange={searchOnChange}
          InputProps={{
            inputRef: searchRef,
          }}
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
              onSearchKeyEnter(searchRef?.current?.value as string);
            }
            keyBoardSelectionTable(
              e,
              mainId,
              searchRef?.current as HTMLInputElement
            );
          }}
        />
        <div
          className={`${mainId} main-table-selection-container`}
          style={{ position: "relative", height: `${height + 20}px` }}
        >
          <Table
            isSingleSelection={true}
            isRowFreeze={false}
            columns={columns}
            isLoading={isLoading}
            dataSelection={(selection, data, code) => {
              onSelectionChange(selection, data);
            }}
            table_id={id}
            rows={rows}
            isRowSelectable={isRowSelectable}
            getCellClassName={getCellClassName}
          />
        </div>

        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <IconButton
            aria-label="search-client"
            color="secondary"
            onClick={onClickCloseIcon}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Box>
    </Modal>
  );
}

export function generateRandomClass() {
  const randomNumber = Math.floor(Math.random() * 10000);
  const randomClass = "main-" + randomNumber;
  return randomClass;
}

function keyBoardUpDown(className: string, el: HTMLElement) {
  const firstRowParent = document.querySelector(
    `.${className} .MuiDataGrid-row`
  );
  const firstInput = firstRowParent?.querySelector("input");
  firstInput?.focus();
  const event = new MouseEvent("mouseenter", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  firstRowParent?.dispatchEvent(event);
  firstInput?.addEventListener("keydown", (es: any) => {
    if (es.key === "ArrowUp") {
      es.preventDefault();
      el.focus();
    }
    if (es.key === "ArrowUp") {
      firstRowParent?.classList.remove("hover-keyboard");
    }
  });
}

export function keyBoardSelectionTable(
  e: React.KeyboardEvent<HTMLDivElement>,
  className: string,
  el: HTMLElement
) {
  const mainId = className;
  if (e.code === "ArrowDown") {
    const rows = document.querySelectorAll(`.${mainId} .MuiDataGrid-row`);
    e.preventDefault();
    rows[0]?.classList.add("hover-keyboard");
    keyBoardUpDown(className, el);
    rows.forEach((el, idx) => {
      el.addEventListener("keydown", (es: any) => {
        if (es.key === "ArrowUp") {
          if (idx <= 0) {
            return;
          }

          es.preventDefault();
          rows[idx]?.classList.remove("hover-keyboard");
          rows[idx - 1]?.classList.add("hover-keyboard");
          return;
        }
        if (es.key === "ArrowDown") {
          es.preventDefault();
          if (idx >= rows.length - 1) {
            return;
          }
          rows[idx]?.classList.remove("hover-keyboard");
          rows[idx + 1]?.classList.add("hover-keyboard");
        }
      });
    });
  }
}
