import {
  useContext,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Button, IconButton } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { AuthContext } from "../../../../../../../components/AuthContext";
import { useQuery, useMutation } from "react-query";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";
import { addYears } from "date-fns";
import PageHelmet from "../../../../../../../components/Helmet";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../../../../components/UpwardFields";
import CalculateIcon from "@mui/icons-material/Calculate";
import { formatNumber } from "../../../../Accounting/ReturnCheck";
import { wait } from "../../../../../../../lib/wait";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Loading } from "../../../../../../../components/Loading";
import {
  UpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../../../../components/DataGridViewReact";
import { PolicyContext } from "../../Policy";

export default function MarinePolicy() {
  const { careOfData, subAccountData } = useContext(PolicyContext);

  const [width, setWidth] = useState(window.innerWidth);

  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const _policyInformationRef = useRef<any>(null);
  const _policyPremiumRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const careOfRef = useRef<HTMLSelectElement>(null);

  const searchMarineRef = useRef<any>(null);

  const { isLoading: isLoadingAccount } = useQuery({
    queryKey: "account",
    queryFn: () => {
      return myAxios.get("/task/production/marine/get-account", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyInformationRef.current
          .getRefs()
          ._accountRef.current.setDataSource(response.data?.account);
      });
    },
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingWords, refetch: refetchWord } = useQuery({
    queryKey: "words",
    queryFn: () => {
      return myAxios.get("/task/production/marine/get-words", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      response.data.words.forEach((itm: any) => {
        if (itm.SType) {
          wait(100).then(() => {
            if (_policyPremiumRef.current.getRefs().remarks1Ref.current) {
              _policyPremiumRef.current.getRefs().remarks1Ref.current.value =
                itm.Phrase;
            }
          });
        } else {
          wait(100).then(() => {
            if (_policyPremiumRef.current.getRefs().remarks2Ref.current) {
              _policyPremiumRef.current.getRefs().remarks2Ref.current.value =
                itm.Phrase;
            }
          });
        }
      });
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: mutateAddUpdate, isLoading: loadingAddUpdate } = useMutation({
    mutationKey: "add-update",
    mutationFn: async (variables: any) => {
      if (mode === "edit") {
        return await myAxios.post(
          "/task/production/update-marine-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post(
        "/task/production/add-marine-policy",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: async (res) => {
      if (res.data.success) {
        setMode("");
        if (subAccountRef.current) {
          subAccountRef.current.value = "HO";
        }
        if (careOfRef.current) {
          careOfRef.current.value = "NONE";
        }
        _policyInformationRef.current.resetRefs();
        _policyPremiumRef.current.resetRefs();

        return Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }

      Swal.fire({
        position: "center",
        icon: "error",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  const { mutate: mutateSelectedSearch, isLoading: laodingSelectedSearch } =
    useMutation({
      mutationKey: "selected-search",
      mutationFn: async (variables: any) => {
        return await myAxios.post(
          "/task/production/get-selected-search-marine-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess: async (res) => {
        if (res.data.success) {
          const selected = res.data.data[0];

          if (subAccountRef.current) {
            subAccountRef.current.value = selected.SubAcct;
          }
          if (careOfRef.current) {
            careOfRef.current.value = selected.careOf;
          }
          // client
          if (_policyInformationRef.current.getRefs().clientIDRef.current) {
            _policyInformationRef.current.getRefs().clientIDRef.current.value =
              selected.IDNo;
          }
          if (_policyInformationRef.current.getRefs().clientNameRef.current) {
            _policyInformationRef.current.getRefs().clientNameRef.current.value =
              selected.ShortName;
          }
          if (
            _policyInformationRef.current.getRefs().clientAddressRef.current
          ) {
            _policyInformationRef.current.getRefs().clientAddressRef.current.value =
              selected.client_address;
          }

          // agent
          if (_policyInformationRef.current.getRefs().agentIdRef.current) {
            _policyInformationRef.current.getRefs().agentIdRef.current.value =
              selected.agentIDNo;
          }
          if (_policyInformationRef.current.getRefs().agentNameRef.current) {
            _policyInformationRef.current.getRefs().agentNameRef.current.value =
              selected.agentName;
          }
          if (
            _policyInformationRef.current.getRefs().agentCommisionRef.current
          ) {
            _policyInformationRef.current.getRefs().agentCommisionRef.current.value =
              selected.AgentCom;
          }
          if (_policyInformationRef.current.getRefs().saleOfficerRef.current) {
            _policyInformationRef.current.getRefs().saleOfficerRef.current.value =
              selected.sale_officer;
          }

          // v policy
          if (_policyInformationRef.current.getRefs().accountRef.current) {
            _policyInformationRef.current.getRefs().accountRef.current.value =
              selected.Account;
          }
          if (_policyInformationRef.current.getRefs().policyNoRef.current) {
            _policyInformationRef.current.getRefs().policyNoRef.current.value =
              selected.PolicyNo;
          }
          if (_policyInformationRef.current.getRefs().locationRef.current) {
            _policyInformationRef.current.getRefs().locationRef.current.value =
              selected.Location;
          }

          // periiod insurance
          if (_policyInformationRef.current.getRefs().dateFromRef.current) {
            _policyInformationRef.current.getRefs().dateFromRef.current.value =
              format(new Date(selected.DateFrom), "yyyy-MM-dd");
          }
          if (_policyInformationRef.current.getRefs().dateToRef.current) {
            _policyInformationRef.current.getRefs().dateToRef.current.value =
              format(new Date(selected.DateTo), "yyyy-MM-dd");
          }
          if (_policyInformationRef.current.getRefs().dateIssuedRef.current) {
            _policyInformationRef.current.getRefs().dateIssuedRef.current.value =
              format(new Date(selected.DateIssued), "yyyy-MM-dd");
          }

          // insured unit
          if (_policyInformationRef.current.getRefs().consigneeRef.current) {
            _policyInformationRef.current.getRefs().consigneeRef.current.value =
              selected.Consignee;
          }
          if (
            _policyInformationRef.current.getRefs().subjectMatterInsuredRef
              .current
          ) {
            _policyInformationRef.current.getRefs().subjectMatterInsuredRef.current.value =
              selected.SubjectInsured;
          }
          if (_policyInformationRef.current.getRefs().vesselRef.current) {
            _policyInformationRef.current.getRefs().vesselRef.current.value =
              selected.Vessel;
          }
          if (
            _policyInformationRef.current.getRefs().additionalInformationRef
              .current
          ) {
            _policyInformationRef.current.getRefs().additionalInformationRef.current.value =
              selected.AdditionalInfo;
          }
          if (_policyInformationRef.current.getRefs().pointOriginRef.current) {
            _policyInformationRef.current.getRefs().pointOriginRef.current.value =
              selected.PointOfOrigin;
          }
          if (
            _policyInformationRef.current.getRefs().pointDestinationRef.current
          ) {
            _policyInformationRef.current.getRefs().pointDestinationRef.current.value =
              selected.PointofDestination;
          }

          // mortgagee
          refetchWord();

          // Premiums
          if (_policyPremiumRef.current.getRefs().insuredValueRef.current) {
            _policyPremiumRef.current.getRefs().insuredValueRef.current.value =
              formatNumber(
                parseFloat(
                  (selected.InsuredValue || 0).toString().replace(/,/g, "")
                )
              );
          }

          if (_policyPremiumRef.current.getRefs().percentageRef.current) {
            _policyPremiumRef.current.getRefs().percentageRef.current.value =
              formatNumber(
                parseFloat(
                  (selected.Percentage || 0).toString().replace(/,/g, "")
                )
              );
          }

          if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
            _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
              formatNumber(
                parseFloat(
                  (selected.TotalPremium || 0).toString().replace(/,/g, "")
                )
              );
          }

          if (_policyPremiumRef.current.getRefs().vatRef.current) {
            _policyPremiumRef.current.getRefs().vatRef.current.value =
              formatNumber(
                parseFloat((selected.Vat || 0).toString().replace(/,/g, ""))
              );
          }
          if (_policyPremiumRef.current.getRefs().docstampRef.current) {
            _policyPremiumRef.current.getRefs().docstampRef.current.value =
              formatNumber(
                parseFloat(
                  (selected.DocStamp || 0).toString().replace(/,/g, "")
                )
              );
          }
          if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
            _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
              formatNumber(
                parseFloat((selected.LGovTax || 0).toString().replace(/,/g, ""))
              );
          }
          if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
            _policyPremiumRef.current.getRefs().totalDueRef.current.value =
              formatNumber(
                parseFloat(
                  (selected.TotalDue || 0).toString().replace(/,/g, "")
                )
              );
          }

          // wait(100).then(() => {
          //   _policyPremiumRef.current
          //     .getRefs()
          //     .cumputationButtonRef.current.click();
          // });
        }
      },
    });


  function handleSave() {
    if (
      _policyInformationRef.current.requiredField() ||
      _policyPremiumRef.current.requiredField()
    ) {
      return;
    }

    if (mode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          const data = {
            ..._policyInformationRef.current.getRefsValue(),
            ..._policyPremiumRef.current.getRefsValue(),
            subAccountRef: subAccountRef.current?.value,
            careOfRef: careOfRef.current?.value,
            userCodeConfirmation,
          };
          mutateAddUpdate(data);
        },
      });
    } else {
      saveCondfirmationAlert({
        isConfirm: () => {
          const data = {
            ..._policyInformationRef.current.getRefsValue(),
            ..._policyPremiumRef.current.getRefsValue(),
            subAccountRef: subAccountRef.current?.value,
            careOfRef: careOfRef.current?.value,
          };
          mutateAddUpdate(data);
        },
      });
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {(isLoadingAccount ||
        isLoadingWords ||
        laodingSelectedSearch ||
        loadingAddUpdate) && <Loading />}
    
      <div
        style={{
          flex: 1,
          height: "calc(100% - 35px)",
          paddingTop: "5px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageHelmet title="Marine Policy" />
        <div
          style={{
            display: "flex",
            columnGap: "8px",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <TextInput
            containerStyle={{ width: "550px" }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "60px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  searchMarineRef.current.openModal(e.currentTarget.value);
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                searchMarineRef.current.openModal(searchRef.current.value);
              }
            }}
            inputRef={searchRef}
          />
          <div
            className="button-action-desktop"
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "8px",
            }}
          >
            <Button
              sx={{
                height: "23px",
                fontSize: "11px",
              }}
              disabled={mode === "add" || mode === "edit"}
              size="small"
              color="primary"
              onClick={() => {
                setMode("add");
              }}
              variant="contained"
              startIcon={<AddBoxIcon />}
            >
              New
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveAsIcon />}
              disabled={mode === ""}
              size="small"
              onClick={handleSave}
              sx={{
                height: "23px",
                fontSize: "11px",
              }}
            >
              Save
            </Button>
            <Button
              sx={{
                height: "23px",
                fontSize: "11px",
              }}
              variant="contained"
              color="error"
              startIcon={<CloseIcon />}
              disabled={mode === ""}
              size="small"
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, cancel it!",
                  cancelButtonText: "No",
                }).then((result) => {
                  if (result.isConfirmed) {
                    if (subAccountRef.current) {
                      subAccountRef.current.value = "HO";
                    }
                    if (careOfRef.current) {
                      careOfRef.current.value = "NONE";
                    }
                    setMode("");
                    _policyInformationRef.current.resetRefs();
                    _policyPremiumRef.current.resetRefs();
                  }
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", columnGap: "7px", marginBottom: "6px" }}>
          <div
            className="desktop-choices-buttons"
            style={{ display: "flex", columnGap: "2px" }}
          >
            <Button
              // disabled={selectedPage === 0}
              sx={{
                height: "23px",
                fontSize: "11px",
                background: selectedPage === 0 ? blue[700] : grey[700],
                "&:hover": {
                  background: selectedPage === 0 ? blue[800] : grey[800],
                },
              }}
              variant="contained"
              onClick={() => {
                setSelectedPage(0);
              }}
            >
              Policy Information
            </Button>
            <Button
              // disabled={selectedPage === 2}
              sx={{
                height: "23px",
                fontSize: "11px",

                background: selectedPage === 2 ? blue[700] : grey[700],
                "&:hover": {
                  background: selectedPage === 2 ? blue[800] : grey[800],
                },
              }}
              onClick={() => {
                setSelectedPage(2);
              }}
              variant="contained"
            >
              Policy Premium
            </Button>
            {width > 768 && (
              <>
                {subAccountData && (
                  <SelectInput
                    label={{
                      title: "Sub Account :",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "100px",
                      },
                    }}
                    selectRef={subAccountRef}
                    select={{
                      style: { flex: 1, height: "22px" },
                      defaultValue: "HO",
                    }}
                    containerStyle={{
                      flex: 2,
                      marginLeft: "20px",
                    }}
                    datasource={subAccountData}
                    values={"Acronym"}
                    display={"Acronym"}
                  />
                )}
                {careOfData && (
                  <SelectInput
                    label={{
                      title: "Care of :",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "70px",
                      },
                    }}
                    selectRef={careOfRef}
                    select={{
                      style: { width: "calc(100% - 70px)", height: "22px" },
                      defaultValue: "NONE",
                    }}
                    containerStyle={{
                      width: "350px",
                      marginLeft: "20px",
                    }}
                    datasource={careOfData}
                    values={"careOf"}
                    display={"careOf"}
                  />
                )}
              </>
            )}
          </div>
          <div
            className="mobile-choices-buttons"
            style={{ display: "flex", columnGap: "5px", alignItems: "center" }}
          >
            <Button
              // disabled={selectedPage === 0}
              sx={{
                height: "23px",
                fontSize: "11px",
                background: selectedPage === 0 ? blue[700] : grey[700],
                "&:hover": {
                  background: selectedPage === 0 ? blue[800] : grey[800],
                },
              }}
              variant="contained"
              onClick={() => {
                setSelectedPage(0);
              }}
            >
              Info
            </Button>
            <Button
              // disabled={selectedPage === 2}
              sx={{
                height: "23px",
                fontSize: "11px",

                background: selectedPage === 2 ? blue[700] : grey[700],
                "&:hover": {
                  background: selectedPage === 2 ? blue[800] : grey[800],
                },
              }}
              onClick={() => {
                setSelectedPage(2);
              }}
              variant="contained"
            >
              Premium
            </Button>
            {width <= 768 && (
              <>
                {subAccountData && (
                  <SelectInput
                    label={{
                      title: "Sub Account :",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "100px",
                        display: "none",
                      },
                    }}
                    selectRef={subAccountRef}
                    select={{
                      style: { flex: 1, height: "22px" },
                      defaultValue: "HO",
                    }}
                    containerStyle={{
                      flex: 2,
                    }}
                    datasource={subAccountData}
                    values={"Acronym"}
                    display={"Acronym"}
                  />
                )}
                {careOfData && (
                  <SelectInput
                    label={{
                      title: "",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                      },
                    }}
                    selectRef={careOfRef}
                    select={{
                      style: { width: "100%", height: "22px" },
                      defaultValue: "NONE",
                    }}
                    containerStyle={{
                      width: "60px",
                    }}
                    datasource={careOfData}
                    values={"careOf"}
                    display={"careOf"}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: selectedPage === 0 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyInformation
            myAxios={myAxios}
            user={user}
            disabled={mode === ""}
            ref={_policyInformationRef}
          />
        </div>
        <div
          style={{
            display: selectedPage === 2 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyPremium
            disabled={mode === ""}
            ref={_policyPremiumRef}
            onComputation={(refs: any) => {
              const insuredValue = parseFloat(
                refs.insuredValueRef.current?.value.replace(/,/g, "") || 0
              );
              const percentage = parseFloat(
                refs.percentageRef.current?.value.replace(/,/g, "") || 0
              );
              const localGovTaxPercentage = parseFloat(
                refs.localGovTaxRef.current?.value.replace(/,/g, "") || 0
              );

              let premium = insuredValue * (percentage / 100);
              let vat = premium * 0.12;
              let docStamp = premium * 0.125;
              let locGovTax = premium * localGovTaxPercentage;
              let fsTax = premium * 0.02;

              let totalDue = premium + vat + docStamp + locGovTax + fsTax;

              if (refs.totalPremiumRef.current) {
                refs.totalPremiumRef.current.value = formatNumber(premium);
              }
              if (refs.vatRef.current) {
                refs.vatRef.current.value = formatNumber(vat);
              }
              if (refs.docstampRef.current) {
                refs.docstampRef.current.value = formatNumber(docStamp);
              }
              if (refs._localGovTaxRef.current) {
                refs._localGovTaxRef.current.value = formatNumber(locGovTax);
              }
              if (refs.totalDueRef.current) {
                refs.totalDueRef.current.value = formatNumber(totalDue);
              }
            }}
          />
        </div>
      </div>
      <div
        className="button-action-mobile"
        style={{
          display: "none",
          alignItems: "center",
          columnGap: "8px",
        }}
      >
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          disabled={mode === "add" || mode === "edit"}
          size="small"
          color="primary"
          onClick={() => {
            setMode("add");
          }}
          variant="contained"
          startIcon={<AddBoxIcon />}
        >
          New
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveAsIcon />}
          disabled={mode === ""}
          size="small"
          onClick={handleSave}
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
        >
          Save
        </Button>
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          variant="contained"
          color="error"
          startIcon={<CloseIcon />}
          disabled={mode === ""}
          size="small"
          onClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, cancel it!",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.isConfirmed) {
                setMode("");
                _policyInformationRef.current.resetRefs();
                _policyPremiumRef.current.resetRefs();
              }
            });
          }}
        >
          Cancel
        </Button>
      </div>
      <UpwardTableModalSearch
        ref={searchMarineRef}
        link={"/task/production/search-marine-policy"}
        column={[
          { key: "_DateIssued", label: "Date", width: 100 },
          { key: "PolicyNo", label: "Policy No", width: 150 },
          {
            key: "Account",
            label: "Account",
            width: 110,
          },
          {
            key: "client_fullname",
            label: "Full Name",
            width: 200,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            setMode("edit");
            mutateSelectedSearch({ policyNo: rowItm.PolicyNo });
            searchMarineRef.current.closeModal();
          }
        }}
      />
    </>
  );
}

const PolicyInformation = forwardRef((props: any, ref) => {
  // Insurer Information
  const clientIDRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const clientAddressRef = useRef<HTMLTextAreaElement>(null);

  // Insurer Information
  const agentIdRef = useRef<HTMLInputElement>(null);
  const agentNameRef = useRef<HTMLInputElement>(null);
  const agentCommisionRef = useRef<HTMLInputElement>(null);
  const saleOfficerRef = useRef<HTMLInputElement>(null);

  // Marine Policy
  const _accountRef = useRef<any>(null);
  const accountRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  // Period of Insurance
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);

  // Insured Unit
  const consigneeRef = useRef<HTMLTextAreaElement>(null);
  const subjectMatterInsuredRef = useRef<HTMLTextAreaElement>(null);
  const vesselRef = useRef<HTMLTextAreaElement>(null);
  const additionalInformationRef = useRef<HTMLTextAreaElement>(null);
  const pointOriginRef = useRef<HTMLTextAreaElement>(null);
  const pointDestinationRef = useRef<HTMLTextAreaElement>(null);

  const clientModalRef = useRef<any>(null);
  const agentModalRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        clientIDRef: clientIDRef.current?.value,
        clientNameRef: clientNameRef.current?.value,
        clientAddressRef: clientAddressRef.current?.value,
        agentIdRef: agentIdRef.current?.value,
        agentNameRef: agentNameRef.current?.value,
        agentCommisionRef: agentCommisionRef.current?.value,
        saleOfficerRef: saleOfficerRef.current?.value,
        accountRef: accountRef.current?.value,
        policyNoRef: policyNoRef.current?.value,
        dateFromRef: dateFromRef.current?.value,
        dateToRef: dateToRef.current?.value,
        dateIssuedRef: dateIssuedRef.current?.value,
        consigneeRef: consigneeRef.current?.value,
        subjectMatterInsuredRef: subjectMatterInsuredRef.current?.value,
        vesselRef: vesselRef.current?.value,
        additionalInformationRef: additionalInformationRef.current?.value,
        pointOriginRef: pointOriginRef.current?.value,
        pointDestinationRef: pointDestinationRef.current?.value,
        locationRef: locationRef.current?.value,
      };
    },
    getRefs: () => {
      return {
        clientIDRef,
        clientNameRef,
        clientAddressRef,
        agentIdRef,
        agentNameRef,
        agentCommisionRef,
        saleOfficerRef,
        accountRef,
        policyNoRef,
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        _accountRef,
        locationRef,
        consigneeRef,
        subjectMatterInsuredRef,
        vesselRef,
        additionalInformationRef,
        pointOriginRef,
        pointDestinationRef,
      };
    },
    resetRefs: () => {
      if (clientIDRef.current) {
        clientIDRef.current.value = "";
      }
      if (clientNameRef.current) {
        clientNameRef.current.value = "";
      }
      if (clientAddressRef.current) {
        clientAddressRef.current.value = "";
      }
      if (agentIdRef.current) {
        agentIdRef.current.value = "";
      }
      if (agentNameRef.current) {
        agentNameRef.current.value = "";
      }
      if (agentCommisionRef.current) {
        agentCommisionRef.current.value = "0.00";
      }
      if (saleOfficerRef.current) {
        saleOfficerRef.current.value = "";
      }

      if (accountRef.current) {
        accountRef.current.value = "";
      }
      if (policyNoRef.current) {
        policyNoRef.current.value = "";
      }
      if (locationRef.current) {
        locationRef.current.value = "";
      }

      if (dateFromRef.current) {
        dateFromRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (dateToRef.current) {
        dateToRef.current.value = format(addYears(new Date(), 1), "yyyy-MM-dd");
      }
      if (dateIssuedRef.current) {
        dateIssuedRef.current.value = format(new Date(), "yyyy-MM-dd");
      }

      if (consigneeRef.current) {
        consigneeRef.current.value = "";
      }
      if (subjectMatterInsuredRef.current) {
        subjectMatterInsuredRef.current.value = "";
      }
      if (vesselRef.current) {
        vesselRef.current.value = "";
      }
      if (additionalInformationRef.current) {
        additionalInformationRef.current.value = "";
      }
      if (pointOriginRef.current) {
        pointOriginRef.current.value = "";
      }
      if (pointDestinationRef.current) {
        pointDestinationRef.current.value = "";
      }
    },
    refEnableDisable: (disabled: boolean, department: string) => {
      if (accountRef.current) {
        accountRef.current.disabled = disabled;
      }
      if (clientIDRef.current) {
        clientIDRef.current.disabled = disabled;
      }
      if (clientNameRef.current) {
        clientNameRef.current.disabled = disabled;
      }
      if (clientAddressRef.current) {
        clientAddressRef.current.disabled = disabled;
      }
      if (agentIdRef.current) {
        agentIdRef.current.disabled = disabled;
      }
      if (agentNameRef.current) {
        agentNameRef.current.disabled = disabled;
      }
      if (agentCommisionRef.current) {
        agentCommisionRef.current.disabled = disabled;
      }
      if (saleOfficerRef.current) {
        saleOfficerRef.current.disabled = disabled;
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

      if (dateIssuedRef.current) {
        dateIssuedRef.current.disabled = disabled;
      }
      if (consigneeRef.current) {
        consigneeRef.current.disabled = disabled;
      }
      if (subjectMatterInsuredRef.current) {
        subjectMatterInsuredRef.current.disabled = disabled;
      }
      if (vesselRef.current) {
        vesselRef.current.disabled = disabled;
      }
      if (additionalInformationRef.current) {
        additionalInformationRef.current.disabled = disabled;
      }
      if (pointOriginRef.current) {
        pointOriginRef.current.disabled = disabled;
      }
      if (pointDestinationRef.current) {
        pointDestinationRef.current.disabled = disabled;
      }
    },
    requiredField: () => {
      if (clientIDRef.current?.value === "") {
        clientIDRef.current.focus();
        alert("Client Details is Required!");
        return true;
      } else if (policyNoRef.current?.value === "") {
        policyNoRef.current.focus();
        alert("Policy No is Required!");
        return true;
      } else if (accountRef.current?.value === "") {
        accountRef.current.focus();
        alert("Account No is Required!");
        return true;
      } else {
        return false;
      }
    },
  }));

  return (
    <>
      <div
        className="main-field-container"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginTop: "10px",
          rowGap: "20px",
        }}
      >
        {/* First Field*/}
        <div
          className="container-fields"
          style={{
            display: "flex",
            columnGap: "15px",
          }}
        >
          {/* Insurer Information*/}
          <div
            className="container-max-width"
            style={{
              width: "50%",
              border: "1px solid #9ca3af",
              boxSizing: "border-box",
              padding: "10px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                fontSize: "14px",
                background: "#F1F1F1",
                padding: "0 2px",
                fontWeight: "bold",
              }}
            >
              Insured Information
            </span>
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "70%",
              }}
              label={{
                title: "Client ID:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    clientModalRef.current.openModal(e.currentTarget.value);
                  }
                },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                clientModalRef.current.openModal(clientIDRef.current?.value);
              }}
              inputRef={clientIDRef}
            />
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Name:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={clientNameRef}
            />
            <TextAreaInput
              containerClassName="custom-input"
              label={{
                title: "Address",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 3,
                style: { flex: 1 },
                defaultValue: "",
                onChange: (e) => {},
              }}
              _inputRef={clientAddressRef}
            />
          </div>
          {/* Agent Information*/}
          <div
            className="container-max-width"
            style={{
              width: "50%",
              border: "1px solid #9ca3af",
              boxSizing: "border-box",
              padding: "10px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                fontSize: "14px",
                background: "#F1F1F1",
                padding: "0 2px",
                fontWeight: "bold",
              }}
            >
              Agent Information
            </span>
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "70%",
              }}
              label={{
                title: "Agent ID:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    agentModalRef.current.openModal(
                      e.currentTarget.value
                    );
                  }
                },
              }}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                agentModalRef.current.openModal(agentIdRef.current?.value);
              }}
              inputRef={agentIdRef}
            />
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Name:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={agentNameRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Commission:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "50%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={agentCommisionRef}
            />
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Sales Officer:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              inputRef={saleOfficerRef}
            />
          </div>
        </div>
        {/* Second Field*/}
        <div
          className="container-fields"
          style={{
            display: "flex",
            columnGap: "15px",
          }}
        >
          {/* Marine Policy*/}
          <div
            className="container-max-width"
            style={{
              width: "50%",
              border: "1px solid #9ca3af",
              boxSizing: "border-box",
              padding: "10px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                fontSize: "14px",
                background: "#F1F1F1",
                padding: "0 2px",
                fontWeight: "bold",
              }}
            >
              Marine Policy
            </span>
            <SelectInput
              containerClassName="custom-input"
              ref={_accountRef}
              label={{
                title: "Account:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              selectRef={accountRef}
              select={{
                disabled: props.disabled,
                style: { flex: 1, height: "22px" },
                defaultValue: "",
                onChange: props.onChangeAccount,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    policyNoRef.current?.focus();
                  }
                },
              }}
              containerStyle={{
                width: "90%",
              }}
              datasource={[]}
              values={"Account"}
              display={"Account"}
            />
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Policy No: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    locationRef.current?.focus();
                  }
                },
              }}
              inputRef={policyNoRef}
            />

            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Location :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    dateFromRef.current?.focus();
                  }
                },
              }}
              inputRef={locationRef}
            />
          </div>
          {/* Period of Insurance*/}
          <div
            className="container-max-width"
            style={{
              width: "50%",
              border: "1px solid #9ca3af",
              boxSizing: "border-box",
              padding: "10px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                fontSize: "14px",
                background: "#F1F1F1",
                padding: "0 2px",
                fontWeight: "bold",
              }}
            >
              Period of Insurance
            </span>
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
              }}
              label={{
                title: "Date From:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "date",
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                style: { width: "calc(100% - 150px)" },
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
                width: "50%",
              }}
              label={{
                title: "Date To:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "date",
                defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    dateIssuedRef.current?.focus();
                  }
                },
              }}
              inputRef={dateToRef}
            />
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
              }}
              label={{
                title: "Date Issued:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "date",
                defaultValue: format(new Date(), "yyyy-MM-dd"),
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    consigneeRef.current?.focus();
                  }
                },
              }}
              inputRef={dateIssuedRef}
            />
          </div>
        </div>
        {/* Last Field*/}
        {/* Insured Unit*/}
        <div
          className="container-fields"
          style={{
            width: "100%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Insured Unit
          </span>
          <div
            className="container-fields-tpl"
            style={{ display: "flex", columnGap: "100px" }}
          >
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Consignee :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    subjectMatterInsuredRef.current?.focus();
                  }
                },
              }}
              _inputRef={consigneeRef}
            />
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Subject Matter Insured :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    vesselRef.current?.focus();
                  }
                },
              }}
              _inputRef={subjectMatterInsuredRef}
            />
          </div>
          <div
            className="container-fields-tpl"
            style={{ display: "flex", columnGap: "100px" }}
          >
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
              }}
              label={{
                title: "Vessel :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    additionalInformationRef.current?.focus();
                  }
                },
              }}
              _inputRef={vesselRef}
            />
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "50%",
              }}
              label={{
                title: "Additional Information :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    pointOriginRef.current?.focus();
                  }
                },
              }}
              _inputRef={additionalInformationRef}
            />
          </div>
          <div
            className="container-fields-tpl"
            style={{ display: "flex", columnGap: "100px" }}
          >
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Point of Origin :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    pointDestinationRef.current?.focus();
                  }
                },
              }}
              _inputRef={pointOriginRef}
            />
            <TextAreaInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Point of Destination :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              textarea={{
                disabled: props.disabled,
                rows: 2,
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                  }
                },
              }}
              _inputRef={pointDestinationRef}
            />
          </div>
        </div>
      </div>
      <UpwardTableModalSearch
        ref={clientModalRef}
        link={"/task/production/search-client-by-id-or-name"}
        column={[
          { key: "IDNo", label: "ID No", width: 120 },
          { key: "Name", label: "Name", width: 200 },
          {
            key: "IDType",
            label: "ID Type",
            width: 90,
          },
          {
            key: "address",
            label: "Address",
            width: 90,
            hide: true,
          },
          {
            key: "sale_officer",
            label: "Sale Officer",
            width: 90,
            hide: true,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            if (clientIDRef.current) {
              clientIDRef.current.value = rowItm.IDNo;
            }
            if (clientNameRef.current) {
              clientNameRef.current.value = rowItm.Name;
            }
            if (clientAddressRef.current) {
              clientAddressRef.current.value = rowItm.address;
            }
            if (saleOfficerRef.current) {
              saleOfficerRef.current.value = rowItm.sale_officer;
            }
            wait(100).then(() => {
              agentIdRef.current?.focus();
            });
            clientModalRef.current.closeModal();
          }
        }}
      />
      <UpwardTableModalSearch
        ref={agentModalRef}
        link={"/task/production/search-agent-by-id-or-name"}
        column={[
          { key: "IDNo", label: "ID No", width: 120 },
          { key: "Name", label: "Name", width: 200 },
          {
            key: "IDType",
            label: "ID Type",
            width: 90,
          },
        ]}
        handleSelectionChange={(rowItm) => {
          if (rowItm) {
            if (agentIdRef.current) {
              agentIdRef.current.value = rowItm.IDNo;
            }
            if (agentNameRef.current) {
              agentNameRef.current.value = rowItm.Name;
            }

            wait(100).then(() => {
              accountRef.current?.focus();
            });
            agentModalRef.current.closeModal();
          }
        }}
      />
    </>
  );
});

const PolicyPremium = forwardRef((props: any, ref) => {
  const cumputationButtonRef = useRef<HTMLButtonElement>(null);

  const remarks1Ref = useRef<HTMLTextAreaElement>(null);
  const remarks2Ref = useRef<HTMLTextAreaElement>(null);

  //Premiums
  const insuredValueRef = useRef<HTMLInputElement>(null);
  const percentageRef = useRef<HTMLInputElement>(null);
  const totalPremiumRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const docstampRef = useRef<HTMLInputElement>(null);
  const localGovTaxRef = useRef<HTMLInputElement>(null);
  const _localGovTaxRef = useRef<HTMLInputElement>(null);
  const fsTaxRef = useRef<HTMLInputElement>(null);
  const totalDueRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        remarks1Ref: remarks1Ref.current?.value,
        remarks2Ref: remarks2Ref.current?.value,
        insuredValueRef: insuredValueRef.current?.value,
        percentageRef: percentageRef.current?.value,
        totalPremiumRef: totalPremiumRef.current?.value,
        vatRef: vatRef.current?.value,
        docstampRef: docstampRef.current?.value,
        localGovTaxRef: localGovTaxRef.current?.value,
        _localGovTaxRef: _localGovTaxRef.current?.value,
        fsTaxRef: fsTaxRef.current?.value,
        totalDueRef: totalDueRef.current?.value,
      };
    },
    getRefs: () => {
      return {
        insuredValueRef,
        percentageRef,
        totalPremiumRef,
        vatRef,
        docstampRef,
        localGovTaxRef,
        cumputationButtonRef,
        _localGovTaxRef,
        fsTaxRef,
        totalDueRef,
        remarks1Ref,
        remarks2Ref,
      };
    },
    resetRefs: () => {
      if (remarks1Ref.current) {
        remarks1Ref.current.value = "";
      }
      if (remarks2Ref.current) {
        remarks2Ref.current.value = "";
      }
      if (insuredValueRef.current) {
        insuredValueRef.current.value = "0.00";
      }
      if (percentageRef.current) {
        percentageRef.current.value = "0.00";
      }

      if (totalPremiumRef.current) {
        totalPremiumRef.current.value = "0.00";
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
      if (fsTaxRef.current) {
        fsTaxRef.current.value = "0.00";
      }

      if (totalDueRef.current) {
        totalDueRef.current.value = "0.00";
      }
    },
    refEnableDisable: (disabled: boolean) => {
      if (remarks1Ref.current) {
        remarks1Ref.current.disabled = disabled;
      }
      if (remarks2Ref.current) {
        remarks2Ref.current.disabled = disabled;
      }
      if (insuredValueRef.current) {
        insuredValueRef.current.disabled = disabled;
      }
      if (percentageRef.current) {
        percentageRef.current.disabled = disabled;
      }

      if (totalPremiumRef.current) {
        totalPremiumRef.current.disabled = disabled;
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
      if (fsTaxRef.current) {
        fsTaxRef.current.disabled = disabled;
      }

      if (totalDueRef.current) {
        totalDueRef.current.disabled = disabled;
      }
    },
    requiredField: () => {
      if (totalDueRef.current?.value === "0.00") {
        totalDueRef.current.focus();
        alert("Total Due is Required!");
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        className="premuim-content-container"
        style={{
          height: "100%",
          width: "65%",
          padding: "15px",
          display: "flex",
          rowGap: "20px",
          boxSizing: "border-box",
          columnGap: "10px",
        }}
      >
        {/* first layer */}
        <div
          className="container-max-width"
          style={{
            border: "1px solid #9ca3af",
            width: "60%",
            display: "flex",
            padding: "10px",
            position: "relative",
          }}
        >
          <span
            className="adjust-font-size"
            style={{
              position: "absolute",
              top: "-12px",
              left: "10px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Clauses, Endorsements, Special conditions and Warranties
          </span>
          {/* firt layer */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <TextAreaInput
              containerStyle={{
                flex: 1,
              }}
              label={{
                style: {
                  display: "none",
                },
              }}
              textarea={{
                disabled: props.disabled,
                style: { flex: 1 },
                defaultValue: "",
                onKeyDown: (e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    insuredValueRef.current?.focus();
                  }
                },
              }}
              _inputRef={remarks1Ref}
            />
            <TextAreaInput
              containerStyle={{
                flex: 1,
              }}
              label={{
                style: {
                  display: "none",
                },
              }}
              textarea={{
                disabled: props.disabled,
                style: { flex: 1 },
                defaultValue: "",
                onKeyDown: (e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    insuredValueRef.current?.focus();
                  }
                },
              }}
              _inputRef={remarks2Ref}
            />
          </div>
        </div>
        {/* second layer */}
        <div
          className="container-max-width"
          style={{
            border: "1px solid #9ca3af",
            width: "40%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "10px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Premiums
          </span>
          <TextFormatedInput
            label={{
              title: "Insured Value :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  percentageRef.current?.focus();
                }
              },
            }}
            inputRef={insuredValueRef}
          />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              height: "22px",
            }}
          >
            <TextFormatedInput
              label={{
                title: "Percentage :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    props.onComputation({
                      insuredValueRef,
                      percentageRef,
                      totalPremiumRef,
                      vatRef,
                      docstampRef,
                      localGovTaxRef,
                      _localGovTaxRef,
                      fsTaxRef,
                      totalDueRef,
                    });
                  }
                },
              }}
              inputRef={percentageRef}
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
                    insuredValueRef,
                    percentageRef,
                    totalPremiumRef,
                    vatRef,
                    docstampRef,
                    localGovTaxRef,
                    _localGovTaxRef,
                    fsTaxRef,
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
              title: "Total Premium:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  vatRef.current?.focus();
                }
              },
            }}
            inputRef={totalPremiumRef}
          />
          <TextFormatedInput
            label={{
              title: "Vat:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
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
              title: "Doc Stamp:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
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
                title: "Local Gov Tax",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "70%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.0075",
                type: "text",
                style: { width: "calc(100% - 150px)" },
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
                    fsTaxRef.current?.focus();
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
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
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
  );
});
