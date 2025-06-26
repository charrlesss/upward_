import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import PageHelmet from "../../../components/Helmet";
import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TextInput } from "../../../components/UpwardFields";
import { DataGridViewReactUpgraded } from "../../../components/UpgradeComponent";
import { useMutation } from "react-query";
import { AuthContext } from "../../../components/AuthContext";
import { wait } from "@testing-library/user-event/dist/utils";
import { Loading } from "../../../components/Loading";
import { format } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";

export default function Booklet() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);
  const modalRef = useRef<any>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "practice-journal",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/practice-journal", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        console.log(response.data);
        wait(100).then(() => {
          tableRef.current.setData(
            response.data.data.map((itm: any) => {
              itm.DateIssued = format(new Date(itm.DateIssued), "MM/dd/yyyy");
              return itm;
            })
          );
        });
      }
    },
  });

  return (
    <>
      {loadingSearch && <Loading />}
      <PageHelmet title="Booklet" />
      <Button
        variant="contained"
        sx={{
          width: "200px",
        }}
        onClick={() => {
          mutateSearch({});
        }}
      >
        Search
      </Button>
      <div
        style={{
          padding: "5px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextInput
          containerClassName="custom-input "
          containerStyle={{
            width: "550px",
          }}
          label={{
            title: "Search: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "50px",
            },
          }}
          input={{
            className: "search-input-up-on-key-down",
            type: "search",
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                e.preventDefault();
                // mutateSearch({ search: e.currentTarget.value });
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                tableRef.current.focusFirstRowColumn();
              }
            },
            style: { width: "500px" },
          }}
          icon={
            <SearchIcon
              sx={{
                fontSize: "18px",
              }}
            />
          }
          onIconClick={(e) => {
            e.preventDefault();
            if (inputSearchRef.current) {
              // mutateSearch({ search: inputSearchRef.current.value });
            }
          }}
          inputRef={inputSearchRef}
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
            ref={tableRef}
            adjustVisibleRowCount={150}
            columns={[
              { key: "IDNo", label: "ID No.", width: 150, freeze: true },
              { key: "Account", label: "Account", width: 150, freeze: false },
              { key: "SubAcct", label: "Sub Acct", width: 150, freeze: true },
              {
                key: "PolicyType",
                label: "Policy Type",
                width: 150,
                freeze: false,
              },
              {
                key: "PolicyNo",
                label: "Policy No",
                width: 150,
                freeze: false,
              },
              {
                key: "DateIssued",
                label: "Date Issued",
                width: 150,
                freeze: false,
              },
              {
                key: "TotalPremium",
                label: "Total Premium",
                width: 200,
                freeze: false,
              },
              { key: "Vat", label: "Vat", width: 150, freeze: false },
              {
                key: "DocStamp",
                label: "DocS tamp",
                width: 150,
                freeze: false,
              },
              { key: "FireTax", label: "Fire Tax", width: 150, freeze: false },
              { key: "LGovTax", label: "LGovTax", width: 150, freeze: false },
              { key: "Notarial", label: "Notarial", width: 150, freeze: false },
            ]}
            RightClickComponent={({ row }: any) => {
              return (
                <>
                  {row.PolicyType === "TPL" ? (
                    <div
                      className="modal-action"
                      onClick={() => {
                        console.log(row);
                        // alert('primnting')
                      }}
                    >
                      🖨️ Print Check
                    </div>
                  ) : null}
                </>
              );
            }}
            FooterComponent={() => {
        
              return (
                <div
                  style={{
                    flex: 1,
                    // background: "red",
                    height: "22px",
                  }}
                ></div>
              );
            }}
            handleSelectionChange={(row: any) => {
              if (row) {
              } else {
              }
            }}
          />
        </div>
      </div>
      <ModalCheck ref={modalRef} handleOnClose={() => {}} />
    </>
  );
}

const ModalCheck = forwardRef(
  ({ handleOnSave, handleOnClose, hasSelectedRow }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };
    const closeDelayRef = useRef<any>(closeDelay);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        return {};
      },
      closeDelay,
    }));

    useEffect(() => {
      window.addEventListener("keydown", (e: any) => {
        if (e.key === "Escape") {
          closeDelayRef.current();
        }
      });
    }, []);

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
          className="modal-add-check"
          ref={modalRef}
          style={{
            height: blick ? "202px" : "200px",
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
              Check Details
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
            className="main-content"
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          ></div>
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);
