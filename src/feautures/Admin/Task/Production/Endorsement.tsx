import { wait } from "@testing-library/user-event/dist/utils";
import {
  DataGridViewReactUpgraded,
  UpwardTableModalSearch,
} from "../../../../components/DataGridViewReact";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { addYears, format } from "date-fns";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import { Button, IconButton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CalculateIcon from "@mui/icons-material/Calculate";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CloseIcon from "@mui/icons-material/Close";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { formatNumber } from "../Accounting/ReturnCheck";
import Swal from "sweetalert2";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../lib/confirmationAlert";

const columns = [
  {
    key: "endorsement_no",
    label: "Endorsement No.",
    width: 150,
    type: "text",
  },
  {
    key: "policyNo",
    label: "Policy No.",
    width: 150,
    type: "text",
  },
  {
    key: "name",
    label: "Name",
    width: 200,
    type: "text",
  },
  {
    key: "address",
    label: "Address",
    width: 300,
    type: "text",
  },
  {
    key: "datefrom",
    label: "Date From",
    width: 100,
    type: "text",
  },
  {
    key: "dateto",
    label: "Date To",
    width: 100,
    type: "text",
  },
  {
    key: "suminsured",
    label: "Sum Insured",
    width: 100,
    type: "text",
  },
  {
    key: "deleted",
    label: "Deleted",
    width: 300,
    type: "text",
  },
  {
    key: "replacement",
    label: "Replacement",
    width: 300,
    type: "text",
  },
  {
    key: "additional",
    label: "Additional",
    width: 300,
    type: "text",
  },
  {
    key: "totalpremium",
    label: "Total Premium",
    width: 100,
    type: "text",
  },
  {
    key: "vat",
    label: "Vat",
    width: 100,
    type: "text",
  },
  {
    key: "docstamp",
    label: "Doc Stamp",
    width: 100,
    type: "text",
  },
  {
    key: "lgovtaxpercent",
    label: "Local Gov Tax Percentage",
    width: 180,
    type: "text",
  },
  {
    key: "lgovtax",
    label: "Local Gov Tax ",
    width: 100,
    type: "text",
  },
  {
    key: "totaldue",
    label: "Total Due ",
    width: 100,
    type: "text",
  },
];
const Endorsement = () => {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const tableRef = useRef<any>(null);
  const inputfieldRef = useRef<any>(null);
  const searchListRef = useRef<HTMLInputElement>(null);
  const policyModalRef = useRef<any>(null);

  const { mutate: mutateEndorsementList, isLoading: isLoadingEndorsementList } =
    useMutation({
      mutationKey: "get-endorsement-by-policyno",
      mutationFn: async (variable: any) =>
        await myAxios.post(
          "/task/production/endorsement/get-endorsement-by-policyno",
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        ),
      onSuccess: (response, variable) => {
        const data = response.data.data;
        if (data.length <= 0) {
          if (inputfieldRef.current.getRefs().endorsementNoRef.current) {
            inputfieldRef.current.getRefs().endorsementNoRef.current.value = `${variable.policyNo}-E1`;
          }
        } else {
          if (inputfieldRef.current.getRefs().endorsementNoRef.current) {
            inputfieldRef.current.getRefs().endorsementNoRef.current.value = `${
              variable.policyNo
            }-E${data.length + 1}`;
          }
        }

        tableRef.current.setData(data);
      },
    });

  const {
    mutate: mutateAddNewEndorsement,
    isLoading: isLoadingAddNewEndorsement,
  } = useMutation({
    mutationKey: "add-new-endorsement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/production/endorsement/add-new-endorsement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (response, variable) => {
      const data = response.data.data;

      if (response.data.success) {
        if (data.length > 0) {
          if (inputfieldRef.current.getRefs().endorsementNoRef.current) {
            inputfieldRef.current.getRefs().endorsementNoRef.current.value = `${
              variable.policyNo
            }-E${data.length + 1}`;
          }
        }
        tableRef.current.setData(data);
        resetFields();
      }

      return Swal.fire({
        position: "center",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  const {
    mutate: mutateDeleteEndorsement,
    isLoading: isLoadingDeleteEndorsement,
  } = useMutation({
    mutationKey: "delete-endorsement",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/production/endorsement/delete-endorsement",
        variable,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess: (response, variable) => {
      const data = response.data.data;

      if (response.data.success) {
        if (data.length > 0) {
          if (inputfieldRef.current.getRefs().endorsementNoRef.current) {
            inputfieldRef.current.getRefs().endorsementNoRef.current.value = `${
              variable.policyNo
            }-E${data.length + 1}`;
          }
        }
        tableRef.current.setData(data);
        resetFields();
      }

      return Swal.fire({
        position: "center",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  function inititalizeFields() {
    const queryParams = new URLSearchParams(window.location.search);
    const dataParam = queryParams.get("Mkr44Rt2iuy13R");
    if (dataParam) {
      const state = JSON.parse(decodeURIComponent(dataParam));
      if (state.policyInformation) {
        if (inputfieldRef.current.getRefs().policyNoRef.current) {
          inputfieldRef.current.getRefs().policyNoRef.current.value =
            state.policyInformation.policyNoRef;
        }
        if (inputfieldRef.current.getRefs().clientNameRef.current) {
          inputfieldRef.current.getRefs().clientNameRef.current.value =
            state.policyInformation.clientNameRef;
        }
        if (inputfieldRef.current.getRefs().clientAddressRef.current) {
          inputfieldRef.current.getRefs().clientAddressRef.current.value =
            state.policyInformation.clientAddressRef;
        }

        if (inputfieldRef.current.getRefs().dateFromRef.current) {
          inputfieldRef.current.getRefs().dateFromRef.current.value = format(
            new Date(state.policyInformation.dateFromRef),
            "yyyy-MM-dd"
          );
        }

        if (inputfieldRef.current.getRefs().dateToRef.current) {
          inputfieldRef.current.getRefs().dateToRef.current.value = format(
            new Date(state.policyInformation.dateToRef),
            "yyyy-MM-dd"
          );
        }
        mutateEndorsementList({
          policyNo: state.policyInformation.policyNoRef,
        });
      }
    }
  }

  function resetFields() {
    const {
      sumInsuredRef,
      netPremiumRef,
      vatRef,
      docstampRef,
      localGovTaxRef,
      _localGovTaxRef,
      totalDueRef,
      deletedRef,
      replacementRef,
      additionalRef,
    } = inputfieldRef.current.getRefs();

    setMode("");
    inititalizeFields();
    if (sumInsuredRef.current) {
      sumInsuredRef.current.value = "0.00";
    }
    if (netPremiumRef.current) {
      netPremiumRef.current.value = "0.00";
    }
    if (vatRef.current) {
      vatRef.current.value = "0.00";
    }
    if (docstampRef.current) {
      docstampRef.current.value = "0.00";
    }
    if (localGovTaxRef.current) {
      localGovTaxRef.current.value = "0.0075";
    }
    if (_localGovTaxRef.current) {
      _localGovTaxRef.current.value = "0.00";
    }
    if (totalDueRef.current) {
      totalDueRef.current.value = "0.00";
    }
    if (deletedRef.current) {
      deletedRef.current.value = "";
    }
    if (replacementRef.current) {
      replacementRef.current.value = "";
    }
    if (additionalRef.current) {
      additionalRef.current.value = "";
    }
  }

  useEffect(() => {
    inititalizeFields();
  }, [mutateEndorsementList]);

  return (
    <>
      {(isLoadingAddNewEndorsement ||
        isLoadingDeleteEndorsement ||
        isLoadingEndorsementList) && <Loading />}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "40px",
            background: "#70acf7ff",
            marginBottom: "5px",
            boxShadow: "-3px -8px 20px -12px rgba(112, 107, 107, 0.75) inset",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0px 20px",
            columnGap: "5px",
          }}
        >
          {mode === "" && (
            <Button
              sx={{
                height: "25px",
                fontSize: "11px",
              }}
              size="small"
              color="success"
              onClick={() => {
                setMode("add");
                wait(100).then(() => {
                  inputfieldRef.current.focusOnDateFromField();
                });
              }}
              variant="contained"
              startIcon={<AddBoxIcon />}
            >
              Add New Endorsement
            </Button>
          )}
          {mode !== "" && (
            <Button
              sx={{
                height: "25px",
                fontSize: "11px",
              }}
              size="small"
              color="success"
              onClick={() => {
                if (inputfieldRef.current) {
                  const {
                    policyNoRef,
                    clientNameRef,
                    clientAddressRef,
                    dateFromRef,
                    dateToRef,
                    sumInsuredRef,
                    netPremiumRef,
                    vatRef,
                    docstampRef,
                    localGovTaxRef,
                    _localGovTaxRef,
                    totalDueRef,
                    deletedRef,
                    replacementRef,
                    additionalRef,
                    endorsementNoRef,
                  } = inputfieldRef.current.getRefs();

                  if (mode === "update") {
                    codeCondfirmationAlert({
                      isUpdate: true,
                      cb: (userCodeConfirmation) => {
                        mutateAddNewEndorsement({
                          endorsement_no: endorsementNoRef.current?.value,
                          policyNo: policyNoRef.current?.value,
                          name: clientNameRef.current?.value,
                          address: clientAddressRef.current?.value,
                          datefrom: new Date(dateFromRef.current?.value),
                          dateto: new Date(dateToRef.current?.value),
                          suminsured: parseFloat(
                            sumInsuredRef.current?.value.replace(/,/g, "")
                          ),
                          deleted: deletedRef.current?.value,
                          replacement: replacementRef.current?.value,
                          additional: additionalRef.current?.value,
                          totalpremium: parseFloat(
                            netPremiumRef.current?.value.replace(/,/g, "")
                          ),

                          vat: parseFloat(
                            vatRef.current?.value.replace(/,/g, "")
                          ),
                          docstamp: parseFloat(
                            docstampRef.current?.value.replace(/,/g, "")
                          ),
                          lgovtaxpercent: parseFloat(
                            localGovTaxRef.current?.value.replace(/,/g, "")
                          ),
                          lgovtax: parseFloat(
                            _localGovTaxRef.current?.value.replace(/,/g, "")
                          ),
                          totaldue: parseFloat(
                            totalDueRef.current?.value.replace(/,/g, "")
                          ),
                          mode,
                          userCodeConfirmation,
                        });
                      },
                    });
                  } else {
                    saveCondfirmationAlert({
                      isConfirm: () => {
                        mutateAddNewEndorsement({
                          endorsement_no: endorsementNoRef.current?.value,
                          policyNo: policyNoRef.current?.value,
                          name: clientNameRef.current?.value,
                          address: clientAddressRef.current?.value,
                          datefrom: new Date(dateFromRef.current?.value),
                          dateto: new Date(dateToRef.current?.value),
                          suminsured: parseFloat(
                            sumInsuredRef.current?.value.replace(/,/g, "")
                          ),
                          deleted: deletedRef.current?.value,
                          replacement: replacementRef.current?.value,
                          additional: additionalRef.current?.value,
                          totalpremium: parseFloat(
                            netPremiumRef.current?.value.replace(/,/g, "")
                          ),

                          vat: parseFloat(
                            vatRef.current?.value.replace(/,/g, "")
                          ),
                          docstamp: parseFloat(
                            docstampRef.current?.value.replace(/,/g, "")
                          ),
                          lgovtaxpercent: parseFloat(
                            localGovTaxRef.current?.value.replace(/,/g, "")
                          ),
                          lgovtax: parseFloat(
                            _localGovTaxRef.current?.value.replace(/,/g, "")
                          ),
                          totaldue: parseFloat(
                            totalDueRef.current?.value.replace(/,/g, "")
                          ),
                          mode,
                        });
                      },
                    });
                  }
                }
              }}
              variant="contained"
              startIcon={<SaveAsIcon />}
            >
              {mode === "add"
                ? "Save New Endorsement"
                : "Save Update Endorsement"}
            </Button>
          )}
          {mode !== "" && (
            <Button
              sx={{
                height: "25px",
                fontSize: "11px",
              }}
              size="small"
              color="error"
              variant="contained"
              startIcon={<CloseIcon />}
              onClick={() => {
                resetFields();
                tableRef.current.setSelectedRow(null);
              }}
            >
              Cancel
            </Button>
          )}
          {mode !== "" && (
            <Button
              sx={{
                height: "25px",
                fontSize: "11px",
              }}
              size="small"
              color="warning"
              variant="contained"
              startIcon={<CloseIcon />}
              onClick={() => {
                codeCondfirmationAlert({
                  isUpdate: true,
                  cb: (userCodeConfirmation) => {
                    if (inputfieldRef.current) {
                      mutateDeleteEndorsement({
                        endorsement_no:
                          inputfieldRef.current.getRefs().endorsementNoRef
                            .current?.value,
                        userCodeConfirmation,
                      });
                    }
                  },
                });
              }}
            >
              Delete
            </Button>
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "5px",
            rowGap: "10px",
            marginTop: "5px",
            position: "relative",
          }}
        >
          <PolicyInformation
            ref={inputfieldRef}
            policyModalRef={policyModalRef}
            disabled={mode === ""}
            onComputation={() => {}}
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
                marginBottom: "5px",
              }}
              label={{
                title: "Search Policy:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "80px",
                },
              }}
              input={{
                type: "text",
                style: {
                  width: "calc(100% - 80px) ",
                },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
              }}
              inputRef={searchListRef}
            />
            <div
              style={{
                width: "100%",
                position: "relative",
                flex: 1,
                display: "flex",
              }}
            >
              <DataGridViewReactUpgraded
                ref={tableRef}
                adjustVisibleRowCount={330}
                columns={columns}
                DisplayData={({ row, col }: any) => {
                  return (
                    <>
                      {col.key === "datefrom" || col.key === "dateto"
                        ? format(new Date(row[col.key]), "MM/dd/yyyy")
                        : row[col.key]}
                    </>
                  );
                }}
                handleSelectionChange={(rowItm: any) => {
                  if (rowItm) {
                    const {
                      policyNoRef,
                      clientNameRef,
                      clientAddressRef,
                      dateFromRef,
                      dateToRef,
                      sumInsuredRef,
                      netPremiumRef,
                      vatRef,
                      docstampRef,
                      localGovTaxRef,
                      _localGovTaxRef,
                      totalDueRef,
                      deletedRef,
                      replacementRef,
                      additionalRef,
                      endorsementNoRef,
                    } = inputfieldRef.current.getRefs();
                    setMode("update");
                    if (endorsementNoRef.current) {
                      endorsementNoRef.current.value = rowItm.endorsement_no;
                    }
                    if (policyNoRef.current) {
                      policyNoRef.current.value = rowItm.policyNo;
                    }
                    if (clientNameRef.current) {
                      clientNameRef.current.value = rowItm.name;
                    }
                    if (clientAddressRef.current) {
                      clientAddressRef.current.value = rowItm.address;
                    }
                    if (dateFromRef.current) {
                      dateFromRef.current.value = format(
                        new Date(rowItm.datefrom),
                        "yyyy-MM-dd"
                      );
                    }
                    if (dateToRef.current) {
                      dateToRef.current.value = format(
                        new Date(rowItm.dateto),
                        "yyyy-MM-dd"
                      );
                    }
                    if (sumInsuredRef.current) {
                      sumInsuredRef.current.value = formatNumber(
                        parseFloat(rowItm.suminsured)
                      );
                    }
                    if (netPremiumRef.current) {
                      netPremiumRef.current.value = formatNumber(
                        parseFloat(rowItm.totalpremium)
                      );
                    }
                    if (vatRef.current) {
                      vatRef.current.value = formatNumber(
                        parseFloat(rowItm.vat)
                      );
                    }
                    if (docstampRef.current) {
                      docstampRef.current.value = rowItm.docstamp;
                    }
                    if (localGovTaxRef.current) {
                      localGovTaxRef.current.value = rowItm.lgovtaxpercent;
                    }
                    if (_localGovTaxRef.current) {
                      _localGovTaxRef.current.value = formatNumber(
                        parseFloat(rowItm.lgovtax)
                      );
                    }
                    if (totalDueRef.current) {
                      totalDueRef.current.value = formatNumber(
                        parseFloat(rowItm.totaldue)
                      );
                    }
                    if (deletedRef.current) {
                      deletedRef.current.value = rowItm.deleted;
                    }
                    if (replacementRef.current) {
                      replacementRef.current.value = rowItm.replacement;
                    }
                    if (additionalRef.current) {
                      additionalRef.current.value = rowItm.additional;
                    }
                  } else {
                    resetFields();
                  }
                }}
                onKeyDelete={(row: any) => {
                  codeCondfirmationAlert({
                    isUpdate: true,
                    cb: (userCodeConfirmation) => {
                      if (inputfieldRef.current) {
                        mutateDeleteEndorsement({
                          endorsement_no: row.endorsement_no,
                          userCodeConfirmation,
                        });
                      }
                    },
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PolicyInformation = forwardRef(
  ({ policyModalRef, ...props }: any, ref) => {
    const cumputationButtonRef = useRef<HTMLButtonElement>(null);
    // Insurer Information

    const policyNoRef = useRef<HTMLInputElement>(null);
    const clientNameRef = useRef<HTMLTextAreaElement>(null);
    const clientAddressRef = useRef<HTMLTextAreaElement>(null);
    const dateFromRef = useRef<HTMLInputElement>(null);
    const dateToRef = useRef<HTMLInputElement>(null);
    const sumInsuredRef = useRef<HTMLInputElement>(null);

    const endorsementNoRef = useRef<HTMLInputElement>(null);
    const deletedRef = useRef<HTMLTextAreaElement>(null);
    const replacementRef = useRef<HTMLTextAreaElement>(null);
    const additionalRef = useRef<HTMLTextAreaElement>(null);
    // premuim
    const netPremiumRef = useRef<HTMLInputElement>(null);
    const vatRef = useRef<HTMLInputElement>(null);
    const docstampRef = useRef<HTMLInputElement>(null);
    const localGovTaxRef = useRef<HTMLInputElement>(null);
    const _localGovTaxRef = useRef<HTMLInputElement>(null);
    const totalDueRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getRefsValue: () => {
        return {
          endorsementNoRef: endorsementNoRef.current?.value,
          cumputationButtonRef: cumputationButtonRef.current?.value,
          clientNameRef: clientNameRef.current?.value,
          clientAddressRef: clientAddressRef.current?.value,
          policyNoRef: policyNoRef.current?.value,
          dateFromRef: dateFromRef.current?.value,
          dateToRef: dateToRef.current?.value,
          sumInsuredRef: sumInsuredRef.current?.value,
          netPremiumRef: netPremiumRef.current?.value,
          vatRef: vatRef.current?.value,
          docstampRef: docstampRef.current?.value,
          localGovTaxRef: localGovTaxRef.current?.value,
          _localGovTaxRef: _localGovTaxRef.current?.value,
          totalDueRef: totalDueRef.current?.value,
        };
      },
      getRefs: () => {
        return {
          cumputationButtonRef,
          policyNoRef,
          clientNameRef,
          clientAddressRef,
          dateFromRef,
          dateToRef,
          sumInsuredRef,
          netPremiumRef,
          vatRef,
          docstampRef,
          localGovTaxRef,
          _localGovTaxRef,
          totalDueRef,
          endorsementNoRef,
          deletedRef,
          replacementRef,
          additionalRef,
        };
      },
      resetRefs: () => {
        if (clientNameRef.current) {
          clientNameRef.current.value = "";
        }
        if (clientAddressRef.current) {
          clientAddressRef.current.value = "";
        }

        if (policyNoRef.current) {
          policyNoRef.current.value = "";
        }

        if (dateFromRef.current) {
          dateFromRef.current.value = format(new Date(), "yyyy-MM-dd");
        }
        if (dateToRef.current) {
          dateToRef.current.value = format(
            addYears(new Date(), 1),
            "yyyy-MM-dd"
          );
        }

        if (sumInsuredRef.current) {
          sumInsuredRef.current.value = "0.00";
        }

        if (netPremiumRef.current) {
          netPremiumRef.current.value = "0.00";
        }
        if (vatRef.current) {
          vatRef.current.value = "0.00";
        }
        if (docstampRef.current) {
          docstampRef.current.value = "0.00";
        }

        if (localGovTaxRef.current) {
          localGovTaxRef.current.value = "0.75";
        }
        if (_localGovTaxRef.current) {
          _localGovTaxRef.current.value = "0.00";
        }
        if (totalDueRef.current) {
          totalDueRef.current.value = "0.00";
        }
      },
      refEnableDisable: (disabled: boolean, department: string) => {
        if (clientNameRef.current) {
          clientNameRef.current.disabled = disabled;
        }
        if (clientAddressRef.current) {
          clientAddressRef.current.disabled = disabled;
        }
        if (policyNoRef.current) {
          policyNoRef.current.disabled = disabled;
        }

        if (dateFromRef.current) {
          dateFromRef.current.disabled = disabled;
        }
        if (dateToRef.current) {
          dateToRef.current.disabled = disabled;
        }

        if (sumInsuredRef.current) {
          sumInsuredRef.current.disabled = disabled;
        }

        if (netPremiumRef.current) {
          netPremiumRef.current.disabled = disabled;
        }
        if (vatRef.current) {
          vatRef.current.disabled = disabled;
        }
        if (docstampRef.current) {
          docstampRef.current.disabled = disabled;
        }
        if (localGovTaxRef.current) {
          localGovTaxRef.current.disabled = disabled;
        }
        if (_localGovTaxRef.current) {
          _localGovTaxRef.current.disabled = disabled;
        }

        if (totalDueRef.current) {
          totalDueRef.current.disabled = disabled;
        }
      },
      requiredField: () => {},
      focusOnDateFromField: () => {
        dateFromRef.current?.focus();
      },
    }));

    return (
      <>
        <div
          className="main-field-container"
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "20px",
          }}
        >
          {/* First Field*/}
          <div
            className="container-fields"
            style={{
              display: "flex",
              columnGap: "15px",
              padding: "0px 5px",
            }}
          >
            {/* 1*/}
            <div
              className="container-max-width"
              style={{
                width: "50%",
                border: "1px solid #e3e7ecff",
                boxSizing: "border-box",
                padding: "10px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                borderRadius: "5px",
                boxShadow:
                  "-3px -8px 20px -12px rgba(112, 107, 107, 0.75) inset",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "10px",
                  fontSize: "14px",
                  background: "white",
                  padding: "0 2px",
                  fontWeight: "bold",
                }}
              >
                Policy Information
              </span>
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Policy No :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  readOnly: true,
                  disabled: props.disabled,
                  type: "text",
                  style: {
                    width: "calc(100% - 100px) ",
                  },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={policyNoRef}
              />
              <TextAreaInput
                containerStyle={{
                  marginBottom: "5px",
                }}
                containerClassName="custom-input"
                label={{
                  title: "Name",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                textarea={{
                  readOnly: true,
                  disabled: props.disabled,
                  rows: 2,
                  style: { flex: 1 },
                  defaultValue: "",
                }}
                _inputRef={clientNameRef}
              />
              <TextAreaInput
                containerStyle={{
                  marginBottom: "5px",
                }}
                containerClassName="custom-input"
                label={{
                  title: "Address",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                textarea={{
                  readOnly: true,
                  disabled: props.disabled,
                  rows: 2,
                  style: { flex: 1 },
                  defaultValue: "",
                }}
                _inputRef={clientAddressRef}
              />

              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Date From:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  disabled: props.disabled,
                  type: "date",
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateToRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateFromRef}
              />
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Date To:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  readOnly: true,
                  disabled: props.disabled,
                  type: "date",
                  defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      sumInsuredRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateToRef}
              />
              <TextFormatedInput
                containerClassName="custom-input"
                label={{
                  title: "Sum Insured :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                containerStyle={{
                  width: "300px",
                }}
                input={{
                  disabled: props.disabled,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      deletedRef.current?.focus();
                    }
                  },
                }}
                inputRef={sumInsuredRef}
              />
            </div>

            {/* 2*/}
            <div
              className="container-max-width"
              style={{
                width: "50%",
                border: "1px solid #e3e7ecff",
                boxSizing: "border-box",
                padding: "10px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                borderRadius: "5px",
                boxShadow:
                  "-3px -8px 20px -12px rgba(112, 107, 107, 0.75) inset",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "10px",
                  fontSize: "14px",
                  background: "white",
                  padding: "0 2px",
                  fontWeight: "bold",
                }}
              >
                Description
              </span>
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "ENDO. No :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                  },
                }}
                input={{
                  readOnly: true,
                  disabled: props.disabled,
                  type: "text",
                  style: {
                    width: "calc(100% - 80px) ",
                  },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={endorsementNoRef}
              />
              <TextAreaInput
                containerStyle={{ marginBottom: "5px" }}
                containerClassName="custom-input"
                label={{
                  title: "Deleted : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                    alignSelf: "flex-start",
                  },
                }}
                textarea={{
                  disabled: props.disabled,
                  rows: 3,
                  style: { flex: 1 },
                  defaultValue: "",
                }}
                _inputRef={deletedRef}
              />
              <TextAreaInput
                containerStyle={{ marginBottom: "5px" }}
                containerClassName="custom-input"
                label={{
                  title: "Replacement :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                    alignSelf: "flex-start",
                  },
                }}
                textarea={{
                  disabled: props.disabled,
                  rows: 3,
                  style: { flex: 1 },
                  defaultValue: "",
                  onChange: (e) => {},
                }}
                _inputRef={replacementRef}
              />
              <TextAreaInput
                containerStyle={{ marginBottom: "5px" }}
                containerClassName="custom-input"
                label={{
                  title: "Additional :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "80px",
                    alignSelf: "flex-start",
                  },
                }}
                textarea={{
                  disabled: props.disabled,
                  rows: 3,
                  style: { flex: 1 },
                  defaultValue: "",
                  onChange: (e) => {},
                }}
                _inputRef={additionalRef}
              />
            </div>

            {/* 3*/}
            <div
              className="container-max-width"
              style={{
                width: "50%",
                border: "1px solid #e3e7ecff",
                boxSizing: "border-box",
                padding: "10px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                borderRadius: "5px",
                boxShadow:
                  "-3px -8px 20px -12px rgba(112, 107, 107, 0.75) inset",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "10px",
                  fontSize: "14px",
                  background: "white",
                  padding: "0 2px",
                  fontWeight: "bold",
                }}
              >
                Premium
              </span>
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                  height: "22px",
                }}
              >
                <TextFormatedInput
                  label={{
                    title: "Net Premium :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  input={{
                    disabled: props.disabled,
                    defaultValue: "0.00",
                    type: "text",
                    style: { width: "calc(100% - 90px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        vatRef.current?.focus();
                        props.onComputation({
                          netPremiumRef,
                          vatRef,
                          docstampRef,
                          localGovTaxRef,
                          _localGovTaxRef,
                          totalDueRef,
                        });
                      }
                    },
                  }}
                  inputRef={netPremiumRef}
                />
                <div
                  style={{
                    height: "100%",
                    width: "50px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    ref={cumputationButtonRef}
                    size="small"
                    color="info"
                    onClick={() => {
                      props.onComputation({
                        netPremiumRef,
                        vatRef,
                        docstampRef,
                        localGovTaxRef,
                        _localGovTaxRef,
                        totalDueRef,
                      });
                    }}
                  >
                    <CalculateIcon />
                  </IconButton>
                </div>
              </div>
              <TextFormatedInput
                label={{
                  title: "Vat :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                containerStyle={{
                  width: "100%",
                }}
                input={{
                  disabled: props.disabled,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 90px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      docstampRef.current?.focus();
                    }
                  },
                }}
                inputRef={vatRef}
              />
              <TextFormatedInput
                label={{
                  title: "Doc Stamp :",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                containerStyle={{
                  width: "100%",
                }}
                input={{
                  disabled: props.disabled,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 90px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      localGovTaxRef.current?.focus();
                    }
                  },
                }}
                inputRef={docstampRef}
              />
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                  height: "22px",
                  width: "100%",
                }}
              >
                <TextFormatedInput
                  label={{
                    title: "Local Gov Tax :",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "90px",
                    },
                  }}
                  containerStyle={{
                    width: "70%",
                  }}
                  input={{
                    disabled: props.disabled,
                    defaultValue: "0.0075",
                    type: "text",
                    style: { width: "calc(100% - 90px)" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        _localGovTaxRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={localGovTaxRef}
                />
                <TextFormatedInput
                  label={{
                    title: "",
                    style: {
                      display: "none",
                    },
                  }}
                  containerStyle={{
                    width: "30%",
                  }}
                  input={{
                    disabled: props.disabled,
                    defaultValue: "0.00",
                    type: "text",
                    style: { width: "100%" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        totalDueRef.current?.focus();
                      }
                    },
                  }}
                  inputRef={_localGovTaxRef}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  border: "1px dashed black",
                  margin: "5px 0px",
                }}
              ></div>
              <TextFormatedInput
                label={{
                  title: "Total Due:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "90px",
                  },
                }}
                containerStyle={{
                  width: "100%",
                }}
                input={{
                  disabled: props.disabled,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 90px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={totalDueRef}
              />
            </div>
          </div>
        </div>

        <style>
          {`
          input:{
            height:18px !important;
            border:1px solid red !important;
          }
        `}
        </style>
      </>
    );
  }
);

export default Endorsement;
