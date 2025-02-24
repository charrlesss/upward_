import {
  useContext,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
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
import { Autocomplete } from "../../../../Accounting/PettyCash";
import { wait } from "../../../../../../../lib/wait";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Loading } from "../../../../../../../components/Loading";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";

export default function MarinePolicy() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const _policyInformationRef = useRef<any>(null);
  const _policyPremiumRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);

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
  });

  const { isLoading: isLoadingSubAccount } = useQuery({
    queryKey: "sub-account",
    queryFn: () => {
      return myAxios.get("/task/production/sub-account", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        if (subAccountRef_.current)
          subAccountRef_.current.setDataSource(response.data?.data);
        wait(100).then(() => {
          if (subAccountRef.current) subAccountRef.current.value = "HO";
        });
      });
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: mutateAddUpdate, isLoading: loadingAddUpdate } = useMutation({
    mutationKey: "add-update",
    mutationFn: async (variables: any) => {
      if (mode === "edit") {
        return await myAxios.post(
          "/task/production/update-fire-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post("/task/production/add-fire-policy", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: async (res) => {
      if (res.data.success) {
        setMode("");
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
          "/task/production/selected-search-fire-policy",
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
          console.log(selected);
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
          if (_policyInformationRef.current.getRefs().billNoRef.current) {
            _policyInformationRef.current.getRefs().billNoRef.current.value =
              selected.BillNo;
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
          if (_policyInformationRef.current.getRefs().locationRiskRef.current) {
            _policyInformationRef.current.getRefs().locationRiskRef.current.value =
              selected.Location;
          }
          if (_policyInformationRef.current.getRefs().occupancyRef.current) {
            _policyInformationRef.current.getRefs().occupancyRef.current.value =
              selected.Occupancy;
          }
          if (
            _policyInformationRef.current.getRefs().propertyInsuredRef.current
          ) {
            _policyInformationRef.current.getRefs().propertyInsuredRef.current.value =
              selected.PropertyInsured;
          }
          if (_policyInformationRef.current.getRefs().boundariesRef.current) {
            _policyInformationRef.current.getRefs().boundariesRef.current.value =
              selected.Boundaries;
          }
          if (_policyInformationRef.current.getRefs().constructionRef.current) {
            _policyInformationRef.current.getRefs().constructionRef.current.value =
              selected.Constraction;
          }

          // mortgagee
          if (_policyPremiumRef.current.getRefs().mortgageeSelect.current) {
            _policyPremiumRef.current.getRefs().mortgageeSelect.current.value =
              selected.Mortgage;
          }
          if (_policyPremiumRef.current.getRefs().warrientiesRef.current) {
            _policyPremiumRef.current.getRefs().warrientiesRef.current.value =
              selected.Warranties;
          }

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
              selected.Percentage;
          }

          wait(100).then(() => {
            _policyPremiumRef.current
              .getRefs()
              .cumputationButtonRef.current.click();
          });
        }
      },
    });

  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/production/search-client-by-id-or-name",
    column: [
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
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (_policyInformationRef.current.getRefs().clientIDRef.current) {
          _policyInformationRef.current.getRefs().clientIDRef.current.value =
            rowItm[0];
        }
        if (_policyInformationRef.current.getRefs().clientNameRef.current) {
          _policyInformationRef.current.getRefs().clientNameRef.current.value =
            rowItm[1];
        }
        if (_policyInformationRef.current.getRefs().clientAddressRef.current) {
          _policyInformationRef.current.getRefs().clientAddressRef.current.value =
            rowItm[3];
        }
        if (_policyInformationRef.current.getRefs().saleOfficerRef.current) {
          _policyInformationRef.current.getRefs().saleOfficerRef.current.value =
            rowItm[4];
        }
        clientCloseModal();
        wait(100).then(() => {
          _policyInformationRef.current.getRefs().agentIdRef.current?.focus();
        });
      }
    },
  });

  const {
    UpwardTableModalSearch: AgentUpwardTableModalSearch,
    openModal: agentOpenModal,
    closeModal: agentCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/production/search-agent-by-id-or-name",
    column: [
      { key: "IDNo", label: "ID No", width: 120 },
      { key: "Name", label: "Name", width: 200 },
      {
        key: "IDType",
        label: "ID Type",
        width: 90,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (_policyInformationRef.current.getRefs().agentIdRef.current) {
          _policyInformationRef.current.getRefs().agentIdRef.current.value =
            rowItm[0];
        }
        if (_policyInformationRef.current.getRefs().agentNameRef.current) {
          _policyInformationRef.current.getRefs().agentNameRef.current.value =
            rowItm[1];
        }

        agentCloseModal();
        wait(100).then(() => {
          _policyInformationRef.current.getRefs().accountRef.current?.focus();
        });
      }
    },
  });

  const {
    UpwardTableModalSearch: SearchFireUpwardTableModalSearch,
    openModal: searchFireOpenModal,
    closeModal: searchFireCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/production/search-fire-policy",
    column: [
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
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        setMode("edit");
        mutateSelectedSearch({ policyNo: rowItm[1] });
        searchFireCloseModal();
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
          };
          mutateAddUpdate(data);
        },
      });
    }
  }

  return (
    <>
      {(isLoadingAccount ||
        isLoadingSubAccount ||
        laodingSelectedSearch ||
        loadingAddUpdate) && <Loading />}
      <AgentUpwardTableModalSearch />
      <ClientUpwardTableModalSearch />
      <SearchFireUpwardTableModalSearch />
      <div
        style={{
          flex: 1,
          height: "calc(100% - 35px)",
          paddingTop: "5px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageHelmet title="Fire Policy" />
        <div
          style={{
            display: "flex",
            columnGap: "8px",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <TextInput
            containerStyle={{ width: "350px" }}
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
                  searchFireOpenModal(e.currentTarget.value);
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                searchFireOpenModal(searchRef.current.value);
              }
            }}
            inputRef={searchRef}
          />
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
                confirmButtonText: "Yes, cencel it!",
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
        <div style={{ display: "flex", columnGap: "7px", marginBottom: "6px" }}>
          <div style={{ display: "flex", columnGap: "2px" }}>
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
            <SelectInput
              ref={subAccountRef_}
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
              datasource={[]}
              values={"Acronym"}
              display={"Acronym"}
            />
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
            clientSearch={(input: string) => {
              clientOpenModal(input);
            }}
            agentSearch={(input: string) => {
              agentOpenModal(input);
            }}
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
              if (refs.fsTaxRef.current) {
                refs.fsTaxRef.current.value = formatNumber(fsTax);
              }
              if (refs.totalDueRef.current) {
                refs.totalDueRef.current.value = formatNumber(totalDue);
              }
            }}
          />
        </div>
      </div>
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
    <div
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
        style={{
          display: "flex",
          columnGap: "15px",
        }}
      >
        {/* Insurer Information*/}
        <div
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
            Insurer Information
          </span>
          <TextInput
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
                  props.clientSearch(e.currentTarget.value);
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              props.clientSearch(clientIDRef.current?.value);
            }}
            inputRef={clientIDRef}
          />
          <TextInput
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
                  props.agentSearch(e.currentTarget.value);
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              props.agentSearch(agentIdRef.current?.value);
            }}
            inputRef={agentIdRef}
          />
          <TextInput
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
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Sale Officer:",
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
        style={{
          display: "flex",
          columnGap: "15px",
        }}
      >
        {/* Marine Policy*/}
        <div
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
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextAreaInput
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
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextAreaInput
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
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextAreaInput
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
          style={{
            border: "1px solid #9ca3af",
            width: "60%",
            display: "flex",
            padding: "10px",
            position: "relative",
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
                defaultValue: `-ROBBERY/HIJACKING CLAUSE
-TERRORISM EXCLUSION ENDORSEMENT
-TRUCK RISK CLAUSE
-DATE RECOGNITION MARINE CARGO
-OVERLOADING WARRANTY
-YEAR 2000 (Y2K) EXCLUSION ENDORSEMENT
-DEDUCTIBLE CLAUSE
-REINSTATEMENT CLAUSE
              `,
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

// import {
//   createContext,
//   useContext,
//   useReducer,
//   useState,
//   useRef,
//   useCallback,
//   useEffect,
// } from "react";
// import { Box, Button, TextField } from "@mui/material";
// import { pink } from "@mui/material/colors";
// import AddIcon from "@mui/icons-material/Add";
// import { AuthContext } from "../../../../../../../components/AuthContext";
// import { useQuery, useMutation, useQueryClient } from "react-query";
// import CloseIcon from "@mui/icons-material/Close";
// import SaveIcon from "@mui/icons-material/Save";
// import Swal from "sweetalert2";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// import useQueryModalTable from "../../../../../../../hooks/useQueryModalTable";
// import { LoadingButton } from "@mui/lab";
// import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import { CustomButton } from "../Vehicle/VehiclePolicy";
// import useMultipleComponent from "../../../../../../../hooks/useMultipleComponent";
// import MarinePolicyInformation from "./MarinePolicyComponents/MarinePolicyInformation";
// import MarinePolicyPremium from "./MarinePolicyComponents/MarinePolicyPremium";
// import {
//   codeCondfirmationAlert,
//   saveCondfirmationAlert,
// } from "../../../../../../../lib/confirmationAlert";
// import { addYears } from "date-fns";
// import PageHelmet from "../../../../../../../components/Helmet";

// const initialState = {
//   form_action: "REG",
//   form_type: "COM",
//   sub_account: "HO",
//   //insurer info
//   client_id: "",
//   client_name: "",
//   client_address: "",
//   //agent info
//   agent_id: "",
//   agent_name: "",
//   agent_com: "0.00",
//   sale_officer: "",
//   //Vehicle policy
//   PolicyAccount: "",
//   PolicyNo: "",
//   location: "",
//   //Period Insurance
//   DateFrom: new Date(),
//   DateTo: addYears(new Date(), 1),
//   DateIssued: new Date(),
//   //Insured Unit
//   consignee: "",
//   smi: "",
//   vessel: "",
//   add_info: "",
//   point_orig: "",
//   point_dis: "",
//   //policy premuim
//   prem_text_one: "",
//   prem_text_two: "",
//   //calculation
//   insuredValue: "",
//   percentagePremium: "",
//   totalPremium: "",
//   vat: "",
//   docStamp: "",
//   localGovTaxPercent: "0.75",
//   localGovTax: "",
//   totalDue: "",
//   // extra
//   marineActioMode: "",
// };

// const reducer = (state: any, action: any) => {
//   switch (action.type) {
//     case "UPDATE_FIELD":
//       const newState = {
//         ...state,
//         [action.field]: action.value,
//       };
//       return newState;
//     default:
//       return state;
//   }
// };

// export const MarineContext = createContext<any>({});

// const queryKeySearchPolicy = "marine-search";
// const queryKeySearchClientEntry = "clients";
// const queryKeySearchAgentEntry = "agents";
// const queryKeyNeedData = "marine-policy";
// const queryKeyAddOrUpdatePolicy = "marine-policy";
// const queryKeyDeletePolicy = "marine-policy";

// export default function MarinePolicy() {
//   const { step, goTo, currentStepIndex } = useMultipleComponent([
//     <MarinePolicyInformation />,
//     <MarinePolicyPremium />,
//   ]);
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { myAxios, user } = useContext(AuthContext);
//   const [search, setSearch] = useState("");
//   const [Mortgagee, setMortgagee] = useState(false);
//   const [showField, setShowField] = useState({
//     thirdparty: state.form_type.toLowerCase() === "tpl",
//     compre: state.form_type.toLowerCase() === "com",
//   });
//   const queryClient = useQueryClient();
//   const isAddOrEditMode = state.marineActioMode === "";

//   const newButtonRef = useRef<HTMLButtonElement>(null);
//   const cancelButtonRef = useRef<HTMLButtonElement>(null);
//   const deleteButtonRef = useRef<HTMLButtonElement>(null);

//   const searchMarPolicyInputRef = useRef<HTMLInputElement>(null);
//   const { data: dataSubAccount, isLoading: isLoadingSubAccount } = useQuery({
//     queryKey: "get-sub_account",
//     queryFn: async () =>
//       await myAxios.get(`/task/production/get-sub_account`, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//   });

//   const {
//     ModalComponent: ModalSearchMPolicy,
//     openModal: openModalSearchMPolicy,
//     isLoading: isLoadingModalSearchMPolicy,
//     closeModal: closeModalSearchMPolicy,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/production/search-marine-policy",
//       queryUrlName: "searchMarinePolicy",
//     },
//     columns: [
//       { field: "_DateIssued", headerName: "Date", width: 200 },
//       { field: "PolicyNo", headerName: "Policy No", width: 250 },
//       {
//         field: "Account",
//         headerName: "Account",
//         width: 170,
//       },
//       {
//         field: "client_fullname",
//         headerName: "Full Name",
//         flex: 1,
//       },
//     ],
//     queryKey: "search-marine-policy",
//     uniqueId: "PolicyNo",
//     responseDataKey: "marinePolicy",
//     onSelected: (selectedRowData) => {
//       onSearchSelected(selectedRowData);
//       closeModalSearchMPolicy();
//     },
//     onCellKeyDown: (__: any, key: any) => {
//       if (key.code === "Enter" || key.code === "NumpadEnter") {
//         onSearchSelected([__.row]);
//         closeModalSearchMPolicy();
//       }
//     },
//     searchRef: searchMarPolicyInputRef,
//   });

//   const { mutate, isLoading: loadingAddNew } = useMutation({
//     mutationKey: queryKeyAddOrUpdatePolicy,
//     mutationFn: async (variables: any) => {
//       if (state.marineActioMode === "delete") {
//         return await myAxios.post(
//           "/task/production/update-marine-policy",
//           variables,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.accessToken}`,
//             },
//           }
//         );
//       }
//       return await myAxios.post(
//         "/task/production/add-marine-policy",
//         variables,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       );
//     },
//     onSuccess: async (res) => {
//       if (res.data.success) {
//         await updateQueryByKey();
//         backToDefaultState(initialState, true);
//         return Swal.fire({
//           position: "center",
//           icon: "success",
//           title: res.data.message,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }

//       Swal.fire({
//         position: "center",
//         icon: "error",
//         title: res.data.message,
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     },
//   });
//   const { mutate: mutateDelete, isLoading: loadingDelete } = useMutation({
//     mutationKey: queryKeyDeletePolicy,
//     mutationFn: async (variables: any) => {
//       return await myAxios.post(
//         "/task/production/delete-marine-policy",
//         variables,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       );
//     },
//     onSuccess: async (res) => {
//       if (res.data.success) {
//         await updateQueryByKey();
//         backToDefaultState(initialState, true);
//         return Swal.fire({
//           position: "center",
//           icon: "success",
//           title: res.data.message,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }

//       Swal.fire({
//         position: "center",
//         icon: "error",
//         title: res.data.message,
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     },
//   });

//   const setDefaultValueForNumber = useCallback(() => {
//     state.insuredValue = state.insuredValue === "" ? "0" : state.insuredValue;
//     state.percentagePremium =
//       state.percentagePremium === "" ? "0" : state.percentagePremium;
//     state.totalPremium = state.totalPremium === "" ? "0" : state.totalPremium;
//     state.vat = state.vat === "" ? "0" : state.vat;
//     state.docStamp = state.docStamp === "" ? "0" : state.docStamp;
//     state.localGovTaxPercent =
//       state.localGovTaxPercent === "" ? "0" : state.localGovTaxPercent;
//     state.localGovTax = state.localGovTax === "" ? "0" : state.localGovTax;
//     state.totalDue = state.totalDue === "" ? "0" : state.totalDue;
//   }, [state]);

//   const handleOnSave = useCallback(() => {
//     if (
//       state.client_name === "" ||
//       state.client_name === null ||
//       state.client_name === undefined
//     ) {
//       return Swal.fire(
//         "Unable to save! Invalid Client ID",
//         "you missed the Client Id Field?",
//         "error"
//       );
//     }

//     if (state.client_id === "" || state.client_id === null) {
//       return Swal.fire(
//         "Unable to save! Invalid IDNo.",
//         "you missed the Client Id Field?",
//         "error"
//       );
//     }
//     if (state.PolicyAccount === "" || state.PolicyAccount === null) {
//       return Swal.fire(
//         "Unable to save! Please select Account.",
//         "you missed the Account Field?",
//         "error"
//       );
//     }
//     if (state.PolicyNo === "" || state.PolicyNo === null) {
//       return Swal.fire(
//         "Unable to save! Invalid Policy No.",
//         "you missed the Policy No Field?",
//         "error"
//       );
//     }

//     if (state.marineActioMode === "delete") {
//       codeCondfirmationAlert({
//         isUpdate: true,
//         cb: (userCodeConfirmation) => {
//           setDefaultValueForNumber();
//           mutate({ ...state, userCodeConfirmation });
//         },
//       });
//     } else {
//       saveCondfirmationAlert({
//         isConfirm: () => {
//           setDefaultValueForNumber();
//           mutate(state);
//         },
//       });
//     }
//   }, [mutate, state, setDefaultValueForNumber]);

//   useEffect(() => {
//     const handleKeyDown = (event: any) => {
//       if (
//         event.code === "AudioVolumeMute" ||
//         event.code === "F1" ||
//         event.keyCode === 173
//       ) {
//         event.preventDefault();
//         goTo(0);
//       }
//       if (
//         event.code === "AudioVolumeDown" ||
//         event.code === "F2" ||
//         event.keyCode === 174
//       ) {
//         event.preventDefault();
//         goTo(1);
//       }

//       if (
//         state.marineActioMode === "" &&
//         (event.code === "KeyN" ||
//           event.code === "Enter" ||
//           event.code === "NumpadEnter")
//       ) {
//         event.preventDefault();
//         newButtonRef.current?.click();
//       }
//       if (state.marineActioMode !== "" && event.code === "Escape") {
//         event.preventDefault();
//         cancelButtonRef.current?.click();
//       }
//       if (state.marineActioMode === "delete" && event.code === "Delete") {
//         event.preventDefault();
//         deleteButtonRef.current?.click();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [goTo, handleOnSave, state.marineActioMode]);

//   const handleInputChange = (e: any) => {
//     const { name, value } = e.target;
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };
//   const customInputchange = (value: any, name: string) => {
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };

//   function computation() {
//     setDefaultValueForNumber();
//     const inpInsurerVal = parseFloat(state.insuredValue);
//     const inPercentagePremium = parseFloat(state.percentagePremium);
//     const inpLocalGovTaxPercent = parseFloat(state.localGovTaxPercent);

//     const Percentage = inPercentagePremium / 100;
//     const VatPercentage = 12 / 100;
//     const DocPercentage = 12.5 / 100;
//     const LOGPercentage = inpLocalGovTaxPercent / 100;
//     const NewTotalPremium = inpInsurerVal * Percentage;

//     customInputchange(inpInsurerVal.toFixed(2), "insuredValue");
//     customInputchange(inPercentagePremium.toFixed(2), "percentagePremium");
//     customInputchange(NewTotalPremium.toFixed(2), "totalPremium");
//     customInputchange((VatPercentage * NewTotalPremium).toFixed(2), "vat");
//     customInputchange((DocPercentage * NewTotalPremium).toFixed(2), "docStamp");
//     customInputchange(
//       (LOGPercentage * NewTotalPremium).toFixed(2),
//       "localGovTax"
//     );
//     customInputchange(
//       (
//         parseFloat(NewTotalPremium.toFixed(2)) +
//         parseFloat((VatPercentage * NewTotalPremium).toFixed(2)) +
//         parseFloat((DocPercentage * NewTotalPremium).toFixed(2)) +
//         parseFloat((LOGPercentage * NewTotalPremium).toFixed(2))
//       ).toFixed(2),
//       "totalDue"
//     );
//   }
//   function backToDefaultState(json: any, resetAll: boolean = false) {
//     json.form_type = state.form_type;
//     json.form_action = state.form_action;
//     json.prem_text_one = state.prem_text_one;
//     json.prem_text_two = state.prem_text_two;
//     if (!resetAll) {
//       json.marineActioMode = state.marineActioMode;
//     }
//     Object.entries(json).forEach(([key, value]) => {
//       customInputchange(value, key);
//     });
//   }
//   // function setDefaultValueForClause(data: Array<any>) {
//   //   data.forEach((item: any) => {
//   //     if (item.SType === 0) {
//   //       customInputchange(item.Phrase, "prem_text_one");
//   //     } else {
//   //       customInputchange(item.Phrase, "prem_text_two");
//   //     }
//   //   });
//   // }
//   function keySave(event: any) {
//     if (
//       state.mode !== "" &&
//       (event.code === "Enter" || event.code === "NumpadEnter")
//     ) {
//       event.preventDefault();
//       handleOnSave();
//     }
//   }
//   async function updateQueryByKey() {
//     return Promise.all([
//       queryClient.invalidateQueries(queryKeySearchPolicy),
//       queryClient.invalidateQueries(queryKeySearchClientEntry),
//       queryClient.invalidateQueries(queryKeySearchAgentEntry),
//       queryClient.invalidateQueries(queryKeyNeedData),
//       queryClient.invalidateQueries(queryKeyAddOrUpdatePolicy),
//       queryClient.invalidateQueries(queryKeyDeletePolicy),
//     ]);
//   }
//   function formatNumber(num: number) {
//     return (num || 0).toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })
//   }
//   function onSearchSelected(selectedRowData: any) {
//     const {
//       Account,
//       AdditionalInfo,
//       AgentCom,
//       AgentID,
//       Consignee,
//       DateFrom,
//       _DateIssued,
//       DateTo,
//       IDNo,
//       InsuredValue,
//       Location,
//       Percentage,
//       PointOfOrigin,
//       PointofDestination,
//       PolicyNo,
//       SubAcct,
//       SubjectInsured,
//       Vessel,
//       address,
//       agent_fullname,
//       client_fullname,
//       sale_officer,
//       TotalPremium,
//       Vat,
//       DocStamp,
//       LGovTax,
//       TotalDue
//     } = selectedRowData[0];

//     customInputchange(SubAcct, "sub_account");
//     customInputchange(IDNo, "client_id");
//     customInputchange(client_fullname, "client_name");
//     customInputchange(address, "client_address");

//     customInputchange(AgentID, "agent_id");
//     customInputchange(agent_fullname, "agent_name");
//     customInputchange(AgentCom, "agent_com");
//     customInputchange(sale_officer, "sale_officer");

//     customInputchange(Account, "PolicyAccount");
//     customInputchange(PolicyNo, "PolicyNo");
//     customInputchange(Location, "location");

//     customInputchange(DateFrom, "DateFrom");
//     customInputchange(DateTo, "DateTo");
//     customInputchange(_DateIssued, "DateIssued");

//     customInputchange(Consignee, "consignee");
//     customInputchange(SubjectInsured, "smi");
//     customInputchange(Vessel, "vessel");
//     customInputchange(AdditionalInfo, "add_info");
//     customInputchange(PointOfOrigin, "point_orig");
//     customInputchange(PointofDestination, "point_dis");

//     customInputchange(formatNumber(parseFloat(InsuredValue)), "insuredValue");
//     customInputchange(formatNumber(parseFloat(Percentage)), "percentagePremium");
//     customInputchange(formatNumber(parseFloat(TotalPremium)), "totalPremium");
//     customInputchange(formatNumber(parseFloat(Vat)), "vat");
//     customInputchange(formatNumber(parseFloat(DocStamp)), "docStamp");
//     customInputchange(formatNumber(parseFloat(LGovTax)), "localGovTax");
//     customInputchange(formatNumber(parseFloat(TotalDue)), "totalDue");

//     customInputchange("delete", "marineActioMode");
//   }

//   useEffect(() => {
//     const handleKeyDown = (event: any) => {
//       if ((event.ctrlKey || event.metaKey) && event.key === 's') {
//         event.preventDefault();
//         handleOnSave();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleOnSave]);

//   return (
//     <>
//       <PageHelmet title="Marine Policy" />
//       <MarineContext.Provider
//         value={{
//           state,
//           handleInputChange,
//           customInputchange,
//           Mortgagee,
//           setMortgagee,
//           showField,
//           setShowField,
//           myAxios,
//           user,
//           computation,
//           isAddOrEditMode,
//           dispatch,
//           keySave,
//         }}
//       >
//         <div style={{ display: "flex", columnGap: "5px" }}>
//           <div
//             style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
//           >
//             <CustomButton
//               onClick={() => {
//                 goTo(0);
//               }}
//               currentStepIndex={currentStepIndex}
//               index={0}
//             >
//               Policy Information
//             </CustomButton>
//             <NavigateNextIcon fontSize="small" />
//           </div>
//           <div
//             style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
//           >
//             <CustomButton
//               onClick={() => {
//                 goTo(1);
//               }}
//               currentStepIndex={currentStepIndex}
//               index={1}
//             >
//               Policy Premium
//             </CustomButton>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               columnGap: "20px",
//               marginLeft: "30px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 columnGap: "5px",
//               }}
//             >
//               {state.marineActioMode === "" && (
//                 <Button
//                   sx={{
//                     height: "30px",
//                     fontSize: "11px",
//                   }}
//                   ref={newButtonRef}
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => {
//                     customInputchange("add", "marineActioMode");
//                   }}
//                 >
//                   New
//                 </Button>
//               )}

//               <LoadingButton
//                 loading={loadingAddNew}
//                 sx={{
//                   height: "30px",
//                   fontSize: "11px",
//                 }}
//                 color="primary"
//                 variant="contained"
//                 type="submit"
//                 onClick={handleOnSave}
//                 disabled={state.marineActioMode === ""}
//                 startIcon={<SaveIcon />}
//               >
//                 Save
//               </LoadingButton>
//               {state.marineActioMode !== "" && (
//                 <Button
//                   sx={{
//                     height: "30px",
//                     fontSize: "11px",
//                   }}
//                   ref={cancelButtonRef}
//                   variant="contained"
//                   startIcon={<CloseIcon />}
//                   color="error"
//                   onClick={() => {
//                     Swal.fire({
//                       title: "Are you sure?",
//                       text: "You won't be able to revert this!",
//                       icon: "warning",
//                       showCancelButton: true,
//                       confirmButtonColor: "#3085d6",
//                       cancelButtonColor: "#d33",
//                       confirmButtonText: "Yes, cancel it!",
//                     }).then((result) => {
//                       if (result.isConfirmed) {
//                         customInputchange("", "marineActioMode");
//                         backToDefaultState(initialState, true);
//                       }
//                     });
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               )}
//               <LoadingButton
//                 loading={loadingDelete}
//                 ref={deleteButtonRef}
//                 id="save-entry-header"
//                 variant="contained"
//                 sx={{
//                   height: "30px",
//                   fontSize: "11px",
//                   backgroundColor: pink[500],
//                   "&:hover": {
//                     backgroundColor: pink[600],
//                   },
//                 }}
//                 disabled={state.marineActioMode !== "delete"}
//                 startIcon={<DeleteIcon />}
//                 onClick={() => {
//                   codeCondfirmationAlert({
//                     isUpdate: false,
//                     cb: (userCodeConfirmation) => {
//                       mutateDelete({
//                         PolicyAccount: state.PolicyAccount,
//                         PolicyNo: state.PolicyNo,
//                         userCodeConfirmation,
//                       });
//                     },
//                   });
//                 }}
//               >
//                 Delete
//               </LoadingButton>
//             </div>
//           </div>
//         </div>
//         <Box
//           sx={(theme) => ({
//             display: "flex",
//             alignItems: "center",
//             columnGap: "20px",
//             marginBottom: "10px",
//             [theme.breakpoints.down("sm")]: {
//               flexDirection: "column",
//               alignItems: "flex-start",
//               flex: 1,
//             },
//           })}
//         >
//           <div
//             style={{
//               marginTop: "10px",
//               marginBottom: "12px",
//               width: "100%",
//             }}
//           ></div>
//         </Box>
//         <div style={{ marginBottom: "5px", display: "flex", gap: "10px" }}>
//           {isLoadingModalSearchMPolicy ? (
//             <LoadingButton loading={isLoadingModalSearchMPolicy} />
//           ) : (
//             <TextField
//               label="Search"
//               size="small"
//               name="search"
//               value={search}
//               onChange={(e: any) => {
//                 setSearch(e.target.value);
//               }}
//               onKeyDown={(e) => {
//                 if (e.code === "Enter" || e.code === "NumpadEnter") {
//                   e.preventDefault();
//                   openModalSearchMPolicy(search);
//                 }
//               }}
//               InputProps={{
//                 style: { height: "27px", fontSize: "14px" },
//               }}
//               sx={{
//                 width: "300px",
//                 height: "27px",
//                 ".MuiFormLabel-root": { fontSize: "14px" },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               }}
//             />
//           )}
//           {isLoadingSubAccount ? (
//             <LoadingButton loading={isLoadingSubAccount} />
//           ) : (
//             <FormControl
//               size="small"
//               sx={(theme) => ({
//                 width: "150px",
//                 ".MuiFormLabel-root": {
//                   fontSize: "14px",
//                   background: "white",
//                   zIndex: 99,
//                   padding: "0 3px",
//                 },
//                 ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//               })}
//             >
//               <InputLabel id="subAccount">Sub Account</InputLabel>
//               <Select
//                 sx={{
//                   height: "27px",
//                   fontSize: "14px",
//                 }}
//                 size="small"
//                 labelId="subAccount"
//                 label="subAccount"
//                 name="sub_account"
//                 value={state.sub_account}
//                 onChange={(e) => {
//                   handleInputChange(e);
//                 }}
//               >
//                 {(dataSubAccount?.data.sub_account).map(
//                   (items: any, idx: number) => {
//                     return (
//                       <MenuItem key={idx} value={items.Acronym.trim()}>
//                         {items.Acronym}
//                       </MenuItem>
//                     );
//                   }
//                 )}
//               </Select>
//             </FormControl>
//           )}
//         </div>
//         {step}
//         {ModalSearchMPolicy}
//       </MarineContext.Provider>
//     </>

//   );
// }
