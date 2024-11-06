import { useEffect, useRef, useState, useId } from "react";
import "../style/upwardtablemodel.css";
import { TextInput } from "../components/UpwardFields";
import { UpwardTable } from "../components/UpwardTable";
import { throttle } from "lodash";
import { AxiosInstance } from "axios";
import { User } from "../components/AuthContext";
import { useMutation } from "react-query";

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
      parentRef.current?.focus();
    }
  }, [show, parentRef]);

  const Modal = show ? (
    <div
      className="modal-parent"
      ref={parentRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          closeModal();

        }
      }}
    >
      <div className="modal-content">
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
                const datagridview = document.querySelector(
                  `.grid-container`
                ) as HTMLDivElement;
                console.log(datagridview);
                datagridview.focus();
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
        <button className="close-modal" onClick={closeModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16px"
            height="16px"
            viewBox="-0.5 0 25 25"
            fill="none"
          >
            <path
              d="M3 21.32L21 3.32001"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 3.32001L21 21.32"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  ) : null;

  return {
    Modal,
    openModal,
    closeModal,
    isLoading,
  };
};
