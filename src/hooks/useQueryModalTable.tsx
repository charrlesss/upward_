import { useContext, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext, User } from "../components/AuthContext";
import {
  GridRowSelectionModel,
  GridCellParams,
  GridTreeNode,
} from "@mui/x-data-grid";
import ModalWithTable from "../components/ModalWithTable";
import { flushSync } from "react-dom";
import { AxiosResponse, AxiosInstance } from "axios";
import { GridRowParams } from "@mui/x-data-grid";
interface QueryModalTableParamsType {
  link?: {
    url: string;
    queryUrlName: string;
  };
  uniqueId: string;
  queryKey: string;
  responseDataKey: string;
  columns: Array<any>;
  onSelected?: (selectedRowData: Array<any>, data: Array<any>) => void;
  onRemoveSelected?: (data: Array<any>) => void;
  onSuccess?: (data: any) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  onCellKeyDown?: any;
  onCloseFunction?: (search: any) => void;
  CustomizeAxios?: (
    myAxios: AxiosInstance,
    user: User | null,
    link: QueryModalTableParamsType["link"],
    search?: string
  ) => Promise<AxiosResponse<any, any>>;
  isRowSelectable?: ((params: GridRowParams<any>) => boolean) | undefined;
  getCellClassName?:
    | ((params: GridCellParams<any, any, any, GridTreeNode>) => string)
    | undefined;
}

async function CustomizeAxiosFunc(
  myAxios: AxiosInstance,
  user: User | null,
  link: QueryModalTableParamsType["link"],
  search: string = ""
) {
  return myAxios.get(`${link?.url}?${link?.queryUrlName}=${search}`, {
    headers: {
      Authorization: `Bearer ${user?.accessToken}`,
    },
  });
}

const useQueryModalTable = ({
  link,
  uniqueId,
  queryKey,
  responseDataKey,
  columns,
  onSelected = () => {},
  onRemoveSelected = () => {},
  onSuccess = () => {},
  searchRef,
  onCellKeyDown,
  onCloseFunction = () => {},
  CustomizeAxios = CustomizeAxiosFunc,
  isRowSelectable,
  getCellClassName,
}: QueryModalTableParamsType) => {
  const { myAxios, user } = useContext(AuthContext);
  const [show, setShowModal] = useState(false);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  async function customizeAxiostool(search: string = "") {
    return await CustomizeAxios(myAxios, user, link, search);
  }
  const { isLoading, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => await customizeAxiostool(),
    onSuccess: (res) => {
      const response = res as any;
      setRows(response.data[responseDataKey]);
      onSuccess(response);
    },
    refetchOnWindowFocus: false,
  });

  const openModal = (search: string = "") => {
    flushSync(() => {
      setShowModal(true);
    });
    if (searchRef?.current) {
      searchRef.current.value = search;
      customizeAxiostool(search).then((res: any) => {
        if (!res?.data.success) {
          return alert(`Error : ${res?.data.message}`);
        }
        const response = res as any;
        setRows(response.data[responseDataKey]);
        if (searchRef?.current) searchRef.current.focus();
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (onCloseFunction) {
      onCloseFunction(searchRef?.current?.value);
    }
  };

  const ModalComponent = (
    <ModalWithTable
      getCellClassName={getCellClassName}
      searchRef={searchRef}
      showModal={show}
      onCloseModal={() => {
        setShowModal(false);
        if (onCloseFunction) {
          onCloseFunction(searchRef?.current?.value);
        }
      }}
      onClickCloseIcon={() => {
        setShowModal(false);
        if (onCloseFunction) {
          onCloseFunction(searchRef?.current?.value);
        }
      }}
      searchOnChange={(e) => {
        // myAxios
        //   .get(`${link.url}?${link.queryUrlName}=${e.target.value}`, {
        //     headers: {
        //       Authorization: `Bearer ${user?.accessToken}`,
        //     },
        //   })
        //   .then((res: any) => {
        //     if (!res?.data.success) {
        //       return alert(`Error : ${res?.data.message}`);
        //     }
        //     const response = res as any;
        //     setRows(response.data[responseDataKey]);
        //   });
      }}
      onSearchKeyEnter={(value) => {
        customizeAxiostool(value).then((res: any) => {
          if (!res?.data.success) {
            return alert(`Error : ${res?.data.message}`);
          }
          const response = res as any;
          setRows(response.data[responseDataKey]);
        });
      }}
      onCellKeyDown={onCellKeyDown}
      height={300}
      isLoading={isLoading}
      queryKey={queryKey}
      columns={columns}
      onSelectionChange={(rowSelectionModel, data) => {
        if (rowSelectionModel.length <= 0) {
          return onRemoveSelected(data);
        }
        const selectedIDs = new Set(rowSelectionModel);
        const selectedRowData = data.filter((row: any) => {
          return selectedIDs.has(row[uniqueId].toString());
        });
        if (selectedRowData.length <= 0) return;
        onSelected(selectedRowData, data);
      }}
      id={uniqueId}
      rows={rows}
      setRows={setRows}
      isRowSelectable={isRowSelectable}
    />
  );

  return {
    show,
    rows,
    isLoading,
    openModal,
    closeModal,
    ModalComponent,
    refetch,
  };
};

export default useQueryModalTable;
