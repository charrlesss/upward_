import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button, IconButton } from "@mui/material";
import Swal from "sweetalert2";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  DataGridViewMultiSelectionReact,
  DataGridViewReactMultipleSelection,
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { grey } from "@mui/material/colors";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { wait } from "@testing-library/user-event/dist/utils";
import PageHelmet from "../../../../components/Helmet";
import "../../../../style/monbileview/accounting/warehouse.css";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

const warehouseColumn = [
  { key: "PNo", label: "PN No.", width: 150 },
  { key: "IDNo", label: "I.D. No.", width: 300 },
  {
    key: "Date",
    label: "Date Received",
    width: 170,
  },
  { key: "Name", label: "Name", width: 300 },
  { key: "CheckDate", label: "Check Date", width: 120 },
  { key: "Check_No", label: "Check No", width: 120 },
  { key: "Check_Amnt", label: "Check Amount", width: 120 },
  { key: "Bank", label: "Bank", width: 300 },
  { key: "PDC_Status", label: "PDC Status", width: 120 },
];

export default function WarehouseChecks() {
  const { myAxios, user } = useContext(AuthContext);
  const [disableSelection, setDisableSelection] = useState(false);
  const tableRef = useRef<any>(null);
  const searchModalRef = useRef<any>(null);
  const modalCheckRef = useRef<any>(null);

  const refPDCStatus = useRef<HTMLSelectElement>(null);
  const refRemarks = useRef<HTMLSelectElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [warehouseMode, setWarehouseMode] = useState("");
  const { executeQueryToClient } = useExecuteQueryFromClient();

  const { mutate: mutatePdcChecks, isLoading: isLoadingPdcChecks } =
    useMutation({
      mutationKey: "search-pdc",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/task/accounting/warehouse/search-pdc",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess: (res) => {
        tableRef.current.setData(res.data.data);
      },
    });
  const { mutate: mutateSave, isLoading: isLoadingSave } = useMutation({
    mutationKey: "save",
    mutationFn: async (variables: any) => {
      console.log(variables);
      return await myAxios.post(
        "/task/accounting/warehouse/save-checks",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (res) => {
      const resposnse = res as any;
      if (resposnse.data.success) {
        wait(500).then(() => {
          setDisableSelection(false);
          if (refPDCStatus.current) {
            refPDCStatus.current.disabled = true;
            refPDCStatus.current.selectedIndex = 0;
          }

          if (searchRef.current) {
            searchRef.current.disabled = true;
            searchRef.current.value = "";
          }
          if (refRemarks.current) {
            refRemarks.current.disabled = true;
            refRemarks.current.selectedIndex = 0;
          }

          tableRef.current.resetTable();
          setWarehouseMode("");
        });

        return Swal.fire({
          position: "center",
          icon: "success",
          title: resposnse.data.message,
          timer: 1500,
        });
      }
      return Swal.fire({
        position: "center",
        icon: "warning",
        title: resposnse.data.message,
        timer: 1500,
      });
    },
  });
  function hanldeOnSave() {
    if (
      refPDCStatus.current?.selectedIndex === 2 &&
      refRemarks.current?.selectedIndex === 0
    ) {
      refRemarks.current.focus();
      return alert("Please provide remarks!");
    } else if (tableRef.current.getSelectedRow().length <= 0) {
      return alert("No selected row to be stored!");
    } else {
      const texts = [
        "store in warehouse?",
        "endorse for deposit?",
        "pulled out?",
      ];
      if (refPDCStatus.current) {
        Swal.fire({
          title: `Do you want the check(s) to be ${
            texts[refPDCStatus.current.selectedIndex]
          }`,
          text: "",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: `${capitalizeWords(
            texts[refPDCStatus.current.selectedIndex]
          )}`,
        }).then(async (result) => {
          if (result.isConfirmed) {
            mutateSave({
              pdcStatus: refPDCStatus.current?.selectedIndex,
              remarksValue: refRemarks.current?.value,
              tableData: tableRef.current.getSelectedRowData(),
            });
          }
        });
      }
    }
  }
  function onClickNew() {
    if (refPDCStatus.current) {
      refPDCStatus.current.disabled = false;
      refPDCStatus.current.selectedIndex = 0;
    }

    if (searchRef.current) {
      searchRef.current.disabled = false;
      searchRef.current.value = "";
    }
    if (refRemarks.current) {
      refRemarks.current.disabled = true;
      refRemarks.current.selectedIndex = 0;
    }

    tableRef.current.resetTable();
    setWarehouseMode("add");
  }
  function onClickCancel() {
    Swal.fire({
      title: `Are you sure you want to cancel?`,
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes Cancel it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDisableSelection(false);
        if (refPDCStatus.current) {
          refPDCStatus.current.disabled = true;
          refPDCStatus.current.selectedIndex = 0;
        }

        if (searchRef.current) {
          searchRef.current.disabled = true;
          searchRef.current.value = "";
        }
        if (refRemarks.current) {
          refRemarks.current.disabled = true;
          refRemarks.current.selectedIndex = 0;
        }

        tableRef.current.resetTable();
        setWarehouseMode("");
      }
    });
  }

  return (
    <>
      {(isLoadingPdcChecks || isLoadingSave) && <Loading />}
      <div
        className="main"
        style={{
          padding: "10px",
          flex: 1,
          position: "relative",
        }}
      >
        <PageHelmet title="Treasury" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="first-layer"
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
            }}
          >
            <SelectInput
              containerClassName="custom-input"
              label={{
                title: "PDC Status: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              selectRef={refPDCStatus}
              select={{
                disabled: true,
                style: { width: "220px", height: "22px" },
                defaultValue: "Store in Warehouse",
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                    refRemarks.current?.focus();
                  }
                },
                onChange: (e) => {
                  if (e.currentTarget.selectedIndex === 0) {
                    setDisableSelection(false);
                  } else {
                    setDisableSelection(true);
                  }
                  
                  if (e.target.selectedIndex !== 2) {
                    if (refRemarks.current) {
                      refRemarks.current.selectedIndex = 0;
                    }
                  } else {
                    if (refRemarks.current) {
                      refRemarks.current.selectedIndex = 1;
                    }
                  }
                  if (refRemarks.current) {
                    refRemarks.current.disabled = e.target.selectedIndex !== 2;
                  }
                  if (searchRef.current && searchRef.current.value !== "") {
                    mutatePdcChecks({
                      pdcStatus: e.target.selectedIndex,
                      search: searchRef.current.value,
                    });
                  }
                },
              }}
              datasource={[
                { key: "Store in Warehouse" },
                { key: "Endorse for Deposit" },
                { key: "Pull Out" },
              ]}
              values={"key"}
              display={"key"}
            />
            <SelectInput
              containerClassName="custom-input"
              label={{
                title: "Remarks: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                  marginLeft: "10px",
                },
              }}
              selectRef={refRemarks}
              select={{
                disabled: true,
                style: { width: "190px", height: "22px" },
                defaultValue: "",
                onChange: (e) => {
                  if (searchRef.current && searchRef.current.value !== "") {
                    mutatePdcChecks({
                      pdcStatus: refPDCStatus.current?.value,
                      search: searchRef.current.value,
                    });
                  }
                },
              }}
              datasource={[
                { key: "" },
                { key: "Fully Paid" },
                { key: "Cash Replacement" },
                { key: "Check Replacement" },
                { key: "Account Closed" },
                { key: "Hold" },
                { key: "Not Renewed by Camfin" },
              ]}
              values={"key"}
              display={"key"}
            />
            <div
              className="pdc-desktop-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "5px",
              }}
            >
              {warehouseMode === "" && (
                <Button
                  sx={{
                    height: "22px",
                    fontSize: "11px",
                  }}
                  variant="contained"
                  startIcon={<AddIcon sx={{ width: 15, height: 15 }} />}
                  id="entry-header-save-button"
                  color="primary"
                  onClick={onClickNew}
                >
                  New
                </Button>
              )}
              <Button
                sx={{
                  height: "22px",
                  fontSize: "11px",
                }}
                id="save-entry-header"
                color="success"
                variant="contained"
                type="submit"
                onClick={hanldeOnSave}
                disabled={warehouseMode === ""}
                startIcon={<SaveIcon sx={{ width: 15, height: 15 }} />}
              >
                Save
              </Button>
              {(warehouseMode === "add" || warehouseMode === "update") && (
                <Button
                  sx={{
                    height: "22px",
                    fontSize: "11px",
                  }}
                  variant="contained"
                  startIcon={<CloseIcon sx={{ width: 15, height: 15 }} />}
                  onClick={onClickCancel}
                  color="error"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <div
            className="second-layer"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div
              className="first-content"
              style={{ display: "flex", columnGap: "10px" }}
            >
              <TextInput
                containerStyle={{ width: "500px" }}
                containerClassName="custom-input search-special"
                label={{
                  title: "Search : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  disabled: true,
                  type: "text",
                  style: { width: "calc(100% - 80px)", height: "22px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      searchModalRef.current.openModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (searchRef.current)
                    searchModalRef.current.openModal(searchRef.current.value);
                }}
                inputRef={searchRef}
              />
              <div
                className="buttons-search-client-container"
                style={{
                  display: "flex",
                  columnGap: "8px",
                  alignItems: "center",
                }}
              >
                <Button
                  className="check-for-pull-out-mobile"
                  sx={{
                    height: "23px",
                    fontSize: "11px",
                    marginLeft: "10px",
                    bgcolor: grey[600],
                    "&:hover": {
                      bgcolor: grey[700],
                    },
                  }}
                  variant="contained"
                  onClick={() => {
                    modalCheckRef.current?.showModal();
                    wait(100).then(() => {
                      modalCheckRef.current?.mutate();
                    });
                  }}
                >
                  Check for pull-out
                </Button>
              </div>
            </div>
            <div className="second-content">
              <Button
                className="check-for-pull-out-desktop"
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  marginLeft: "10px",
                  bgcolor: grey[600],
                  "&:hover": {
                    bgcolor: grey[700],
                  },
                }}
                variant="contained"
                onClick={() => {
                  modalCheckRef.current?.showModal();
                  wait(100).then(() => {
                    modalCheckRef.current?.mutate();
                  });
                }}
              >
                Check for pull-out
              </Button>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              zIndex: 2,
            }}
          >
            <DataGridViewReactMultipleSelection
              ref={tableRef}
              adjustVisibleRowCount={150}
              columns={warehouseColumn}
              disableSelection={disableSelection}
              handleSelectionChange={(row: any) => {
                if (row) {
                  if (
                    row.PDC_Status !== "Stored" &&
                    row.PDC_Status !== "Received"
                  ) {
                    alert("its alredy pullout");
                    wait(100).then(() => {
                      const getRowSelected = tableRef.current.getSelectedRow();
                      const selected = getRowSelected.filter(
                        (s: any) => s !== row.rowIndex
                      );
                      tableRef.current.setSelectedRow(selected);
                    });
                    return;
                  }
                } else {
                }
              }}
            />
          </div>
        </div>
        <ModalCheck
          ref={modalCheckRef}
          handleOnSave={() => {
            const refs = modalCheckRef.current.getRefs();
          }}
          handleOnClose={() => {}}
          getSelectedItem={async (rowItm: any, table: any) => {
            if (rowItm) {
              if (
                refPDCStatus.current &&
                refPDCStatus.current.value !== "Pull Out"
              ) {
                alert("Status should be for pull-out!");
                return;
              }
              if (
                refRemarks.current &&
                (refRemarks.current.value === null ||
                  refRemarks.current.value === "")
              ) {
                alert("No remarks selected!");
                return;
              }
              // if (
              //   refSearch.current &&
              //   (refSearch.current.value === null ||
              //     refSearch.current.value === "")
              // ) {
              //   return alert("Please enter ID!");
              // }
              const { data: response } = await executeQueryToClient(`
              Select 
                CheckNo 
              From pullout_request a 
              Inner join pullout_request_details b  on a.RCPNo = b.RCPNo 
              Where a.Status = 'APPROVED' 
              And a.RCPNo = '${rowItm.RCPNo}'`);

              const dr = response.data.map((itm: any) => itm.CheckNo);
              setDisableSelection(true);
              if (dr.length > 0) {
                if (refPDCStatus.current) {
                  refPDCStatus.current.value = "Pull Out";
                }

                if (refRemarks.current) {
                  refRemarks.current.value = rowItm.Reason;
                }
                if (searchRef.current) {
                  searchRef.current.value = rowItm.PNNo;
                }

                mutatePdcChecks({
                  pdcStatus: 2,
                  search: rowItm.PNNo,
                });

                wait(100).then(() => {
                  const getData = tableRef.current.getData();
                  const filtered = getData.filter((itm: any, idx: number) => {
                    if (dr.includes(itm.Check_No)) {
                      return itm;
                    }
                  });
                  const selected = filtered.map((itm: any) => itm.rowIndex);
                  tableRef.current.setSelectedRow(selected);
                });
              } else {
                return alert("No request for pull-out!");
              }
            } else {
            }

            modalCheckRef.current.closeDelay();
          }}
        />
        <div className="mobile-ctions-buttons">
          <Button
            disabled={warehouseMode === "add"}
            sx={{
              height: "23px",
              fontSize: "11px",
              marginLeft: "10px",
            }}
            variant="contained"
            color="info"
            onClick={onClickNew}
          >
            New
          </Button>
          <Button
            disabled={warehouseMode !== "add"}
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            variant="contained"
            color="error"
            onClick={onClickCancel}
          >
            Cancel
          </Button>
        </div>
        <UpwardTableModalSearch
          ref={searchModalRef}
          link={"/task/accounting/search-pdc-policy-id"}
          column={[
            { key: "Type", label: "Type", width: 100 },
            { key: "IDNo", label: "ID No.", width: 150 },
            {
              key: "Name",
              label: "Name",
              width: 300,
            },
            {
              key: "ID",
              label: "ID",
              hide: true,
            },
            {
              key: "client_id",
              label: "client_id",
              hide: true,
            },
            {
              key: "sub_account",
              label: "sub_account",
              hide: true,
            },
            {
              key: "ShortName",
              label: "ShortName",
              hide: true,
            },
          ]}
          handleSelectionChange={(rowItm) => {
            if (rowItm) {
              wait(100).then(() => {
                tableRef.current.resetTable([]);
                if (searchRef.current) {
                  searchRef.current.value = rowItm.IDNo;
                  mutatePdcChecks({
                    pdcStatus: refPDCStatus.current?.selectedIndex,
                    search: rowItm.IDNo,
                  });
                }
              });
              searchModalRef.current.closeModal();
            }
          }}
        />
      </div>
    </>
  );
}

const ModalCheck = forwardRef(
  ({ handleOnSave, handleOnClose, getSelectedItem }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const { user, myAxios } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const table = useRef<any>(null);
    const searchRCPNoModal = useRef<any>(null);
    const rcpnRef = useRef<HTMLInputElement>(null);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        const refs = {
          rcpnRef,
        };
        return refs;
      },
      mutate: () => {
        mutate({ RCPNo: rcpnRef.current?.value });
      },
      closeDelay,
    }));

    const { isLoading: isLoading, mutate: mutate } = useMutation({
      mutationKey: "load-list",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/task/accounting/warehouse/load-list`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        table.current.setData(
          res.data.list.map((itm: any, idx: number) => {
            return {
              row_count: idx + 1,
              ...itm,
            };
          })
        );
      },
    });

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
    return showModal ? (
      <>
        {isLoading && <Loading />}
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
          className="modal-pullout"
          ref={modalRef}
          style={{
            height: blick ? "402px" : "400px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
          }}
        >
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
              Pull Out Viewer
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
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                padding: "10px",
              }}
            >
              <TextInput
                containerStyle={{ width: "400px", marginLeft: "20px" }}
                containerClassName="custom-input search-special"
                label={{
                  title: "Search : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "calc(100% - 70px)", height: "22px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      searchRCPNoModal.current.openModal(e.currentTarget.value);
                    }
                  },
                  onInput: (e) => {
                    if (e.currentTarget.value === "") {
                      mutate({ RCPNo: "" });
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (rcpnRef.current) {
                    searchRCPNoModal.current.openModal(rcpnRef.current.value);
                  }
                }}
                inputRef={rcpnRef}
              />
              <div
                style={{
                  marginTop: "10px",
                  width: "100%",
                  position: "relative",
                  flex: 1,
                  display: "flex",
                }}
              >
                <DataGridViewReactUpgraded
                  ref={table}
                  adjustVisibleRowCount={350}
                  columns={[
                    { key: "row_count", label: "#", width: 35 },
                    { key: "RCPNo", label: "RCP No.", width: 100 },
                    { key: "PNNo", label: "PN No.", width: 150 },
                    { key: "Name", label: "Name", width: 250 },
                    { key: "NoOfChecks", label: "# of Checks", width: 150 },
                    { key: "Reason", label: "Reason", width: 150 },
                  ]}
                  handleSelectionChange={(rowItm: any) => {
                    if (rowItm) {
                      getSelectedItem(rowItm, table);
                      wait(100).then(() => {
                        table.current.setSelectedRow(null);
                      });
                    } else {
                    }
                  }}
                />
              </div>
            </div>
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
        <UpwardTableModalSearch
          ref={searchRCPNoModal}
          link={"/task/accounting/warehouse/get-pullout-rcpno"}
          column={[{ key: "RCPNo", headerName: "RCPNo", width: 200 }]}
          handleSelectionChange={(rowItm) => {
            if (rowItm) {
              wait(100).then(() => {
                if (rcpnRef.current) {
                  rcpnRef.current.value = rowItm.RCPNo;
                }
                mutate({ RCPNo: rowItm.RCPNo });
              });
              searchRCPNoModal.current.closeModal();
            }
          }}
        />
      </>
    ) : null;
  }
);
function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
function capitalizeWords(str: string) {
  return str
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
}
