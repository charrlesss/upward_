import { useEffect, useRef, useState, useId } from "react";
import "../style/upwardtablemodel.css";
import { TextInput } from "../components/UpwardFields";
import { UpwardTable } from "../components/UpwardTable";
import { throttle } from "lodash";
import { AxiosInstance } from "axios";
import { User } from "../components/AuthContext";
import { useMutation } from "react-query";
import { wait } from "../lib/wait";
import { IconButton, Modal } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";


interface UseUpwardTableModalProps {
  myAxios: AxiosInstance;
  user: User | null;
  column: Array<any>;
  link: {
    url: string;
    queryUrlName: string;
  };
  onSelectionChange: (selectedRow: any) => void;
  onModalClose?: () => void;
  responseDataKey: string;
}
export const useUpwardTableModal = ({
  myAxios,
  user,
  column,
  link,
  onSelectionChange,
  responseDataKey,
  onModalClose = () => { },
}: UseUpwardTableModalProps) => {
  const id = useId();
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);
  const parentRef = useRef<any>(null);
  const [show, setShowModal] = useState(false);
  const [rows, setRows] = useState([]);
  const { isLoading, mutate } = useMutation({
    mutationKey: id,
    mutationFn: async (variable: any) =>
      await myAxios.get(
        `${link?.url}?${link?.queryUrlName}=${variable.search}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (res) => {
      const response = res as any;
      setRows(response.data[responseDataKey]);
    },
  });
  const performSearch = (query: string) => {
    if (query === "") {
      mutate({ search: query });
    }
  };
  // Throttle the search function to limit it to once every 500ms
  const throttledSearch = throttle((query) => performSearch(query), 500)

  const openModal = (search: string) => {
    mutate({ search: search });
    setShowModal(true);
    setTimeout(() => {
      if (inputSearchRef.current) {
        inputSearchRef.current.value = search;
      }
      inputSearchRef.current?.focus();
    }, 150);
  };
  const closeModal = () => {
    setShowModal(false);
    onModalClose();
  };

  const width = 460;
  const height = 530;

  useEffect(() => {
    if (show && parentRef.current) {
      wait(1050).then(() => {
        parentRef.current?.focus();
      })
    }
  }, [show, parentRef]);

  const ModalComponent = (
    <Modal
      open={show}
      onClose={() => {
        setShowModal(false);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "auto",
        background: "#fff",
        paddingTop: "30px",
        paddingBottom: "20px",
        paddingLeft: "10px",
        paddingRight: "10px"
      }}>
        <div >
          <TextInput
            label={{ style: { display: "none" } }}
            input={{
              className: "search-input-up-on-key-down",
              type: "text",
              style: { width: "100%", marginBottom: "20px" },
              onChange: (e) => {
                e.preventDefault();
                throttledSearch(e.currentTarget.value);
              },
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  mutate({ search: (e.target as any).value });
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const datagridview = tableRef.current.getParentElement().querySelector(
                    `.grid-container .row-0.col-0 input`
                  ) as HTMLDivElement;
                  setTimeout(() => {
                    if (datagridview)
                      datagridview.focus();
                  }, 100)
                }
              },
            }}
            inputRef={inputSearchRef}
          />
          <UpwardTable
            ref={tableRef}
            rows={rows}
            column={column.filter((itm) => !itm.hide)}
            width={width}
            height={height}
            dataReadOnly={true}
            onSelectionChange={onSelectionChange}
          />

          <IconButton
            style={{
              position: "absolute",
              top: "5px",
              right: "10px",
            }}
            aria-label="search-client"
            onClick={closeModal}
          >
            <CloseIcon style={{ fontSize: "15px" }} />
          </IconButton>


        </div>
      </div>

    </Modal>

  );

  return {
    Modal: ModalComponent,
    openModal,
    closeModal,
    isLoading,
  };
};
