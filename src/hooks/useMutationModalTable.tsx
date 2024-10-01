import { useContext, useState } from "react";
import { useMutation } from "react-query";
import { AuthContext } from "../components/AuthContext";
import { GridRowSelectionModel ,GridRowParams} from "@mui/x-data-grid";
import ModalWithTable from "../components/ModalWithTable";
import { flushSync } from "react-dom";

interface QueryModalTableParamsType {
  link: {
    queryWithVariable: (variable: any) => string;
    queryExtraBySearch: string;
  };
  uniqueId: string;
  queryKey: string;
  responseDataKey: string;
  columns: Array<any>;
  onSelected?: (selectedRowData: Array<any>, data: Array<any>) => void;
  onRemoveSelected?: (data: Array<any>) => void;
  onSuccess?: (data: Array<any>) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  onCellKeyDown?: any;
  onCloseFunction?: (search: any) => void;
  isRowSelectable?: ((params: GridRowParams<any>) => boolean) | undefined;
}
const useMutationModalTable = ({
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
  onCloseFunction,
  isRowSelectable
}: QueryModalTableParamsType) => {
  const { myAxios, user } = useContext(AuthContext);
  const [openSearchCollection, setOpenSearchCollection] = useState(false);
  const [rows, setRows] = useState<GridRowSelectionModel>([]);
  const { isLoading, mutate } = useMutation({
    mutationKey: queryKey,
    mutationFn: async (variables: any) =>
      await myAxios.get(`${link.queryWithVariable(variables)}`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    onSuccess: (res) => {
      const response = res as any;
      setRows(response.data[responseDataKey]);
      onSuccess(response);
    },
  });

  const openModal = (search: string = "") => {
    flushSync(() => {
      setOpenSearchCollection(true);
    });

    if (searchRef?.current) {
      searchRef.current.value = search;

      myAxios
        .get(`${link.queryExtraBySearch}=${search}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        })
        .then((res: any) => {
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
    setOpenSearchCollection(false);
    if (onCloseFunction) {
      onCloseFunction(searchRef?.current?.value);
    }
  };

  const ModalComponent = (
    <ModalWithTable
      searchRef={searchRef}
      showModal={openSearchCollection}
      onCloseModal={() => {
        setOpenSearchCollection(false);
        if (onCloseFunction) {
          onCloseFunction(searchRef?.current?.value);
        }
      }}
      onClickCloseIcon={() => {
        setOpenSearchCollection(false);
        if (onCloseFunction) {
          onCloseFunction(searchRef?.current?.value);
        }
      }}
      searchOnChange={(e) => {
        myAxios
          .get(`${link.queryExtraBySearch}=${e.target.value}`, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          })
          .then((res: any) => {
            if (!res?.data.success) {
              return alert(`Error : ${res?.data.message}`);
            }
            const response = res as any;
            setRows(response.data[responseDataKey]);
          });
      }}
      onSearchKeyEnter={(value) => {
        myAxios
          .get(`${link.queryExtraBySearch}=${value}`, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          })
          .then((res: any) => {
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
      isRowSelectable={isRowSelectable}
      id={uniqueId}
      rows={rows}
      setRows={setRows}
    />
  );

  return {
    openSearchCollection,
    rows,
    isLoading,
    openModal,
    closeModal,
    ModalComponent,
    mutate,
  };
};

export default useMutationModalTable;
