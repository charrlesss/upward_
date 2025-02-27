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
import { Autocomplete } from "../../../../Accounting/PettyCash";
import { wait } from "../../../../../../../lib/wait";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Loading } from "../../../../../../../components/Loading";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";

export default function BondsPolicy() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const _policyInformationRef = useRef<any>(null);
  const _policyPremiumRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);

  const { isLoading: isLoadingBondSubline } = useQuery({
    queryKey: "bond-subline",
    queryFn: () => {
      return myAxios.get("/task/production/bond/get-bond-subline", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyInformationRef.current
          .getRefs()
          ._policyTypeRef.current.setDataSource(response.data?.data);
      });
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: mutateAccount, isLoading: isLoadingAccount } = useMutation({
    mutationKey: "get-account",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/production/bond/get-account",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: async (response) => {
      wait(100).then(() => {
        _policyInformationRef.current
          .getRefs()
          ._accountRef.current.setDataSource(response.data?.data);
      });
    },
  });

  const mutateAccountRef = useRef<any>(mutateAccount);

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

  useEffect(() => {
    mutateAccountRef.current({ policyType: "" });
  }, []);

  return (
    <>
      {(isLoadingBondSubline ||
        isLoadingAccount ||
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
        <PageHelmet title="Bonds Policy" />
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
            onChangeAccount={(e: any) => {
              mutateAccountRef.current({ policyType: e.currentTarget.value });
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
              const txtInsured = parseFloat(
                refs.insuredValueRef.current?.value.toString().replace(/,/g, "")
              );
              const txtPercent = parseFloat(
                refs.percentageRef.current?.value.toString().replace(/,/g, "")
              );
              const txtNotarial = parseFloat(
                refs.umisRef.current?.value.toString().replace(/,/g, "")
              );
              const txtMiscFee = parseFloat(
                refs.principalRef.current?.value.toString().replace(/,/g, "")
              );

              let txtPremium = txtInsured * (txtPercent / 100);
              let txtVat = txtPremium * 0.12;
              let txtDocStamp = txtPremium * 0.125;
              let txtLocGovTax = txtPremium * 0.0075;

              let txtTotalDue =
                txtPremium +
                txtVat +
                txtDocStamp +
                txtLocGovTax +
                txtNotarial +
                txtMiscFee;

              if (refs.totalPremiumRef.current) {
                refs.totalPremiumRef.current.value = formatNumber(txtPremium);
              }
              if (refs.vatRef.current) {
                refs.vatRef.current.value = formatNumber(txtVat);
              }
              if (refs.docstampRef.current) {
                refs.docstampRef.current.value = formatNumber(txtDocStamp);
              }
              if (refs._localGovTaxRef.current) {
                refs._localGovTaxRef.current.value = formatNumber(txtLocGovTax);
              }
              if (refs.totalDueRef.current) {
                refs.totalDueRef.current.value = formatNumber(txtTotalDue);
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

  // Bonds Policy
  const _accountRef = useRef<any>(null);
  const accountRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);
  const _policyTypeRef = useRef<any>(null);
  const policyTypeRef = useRef<HTMLSelectElement>(null);
  const officerRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);

  // Period of Insurance
  const biddingDateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);
  const validityRef = useRef<HTMLTextAreaElement>(null);

  // Insured Unit
  const unitRef = useRef<HTMLTextAreaElement>(null);
  const obligeeRef = useRef<HTMLTextAreaElement>(null);

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
        _accountRef: _accountRef.current?.value,
        accountRef: accountRef.current?.value,
        policyNoRef: policyNoRef.current?.value,
        _policyTypeRef: _policyTypeRef.current?.value,
        policyTypeRef: policyTypeRef.current?.value,
        officerRef: officerRef.current?.value,
        positionRef: positionRef.current?.value,
        biddingDateRef: biddingDateRef.current?.value,
        timeRef: timeRef.current?.value,
        dateIssuedRef: dateIssuedRef.current?.value,
        validityRef: validityRef.current?.value,
        unitRef: unitRef.current?.value,
        obligeeRef: obligeeRef.current?.value,
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
        _accountRef,
        accountRef,
        policyNoRef,
        _policyTypeRef,
        policyTypeRef,
        officerRef,
        positionRef,
        biddingDateRef,
        timeRef,
        dateIssuedRef,
        validityRef,
        unitRef,
        obligeeRef,
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

      if (biddingDateRef.current) {
        biddingDateRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (timeRef.current) {
        timeRef.current.value = format(new Date(), "hh:mm");
      }
      if (dateIssuedRef.current) {
        dateIssuedRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (validityRef.current) {
        validityRef.current.value = "";
      }

      if (accountRef.current) {
        accountRef.current.value = "";
      }
      if (policyNoRef.current) {
        policyNoRef.current.value = "";
      }
      if (policyNoRef.current) {
        policyNoRef.current.value = "";
      }

      if (officerRef.current) {
        officerRef.current.value = "";
      }
      if (positionRef.current) {
        positionRef.current.value = "";
      }

      if (unitRef.current) {
        unitRef.current.value = "";
      }

      if (obligeeRef.current) {
        obligeeRef.current.value = "";
      }
    },
    refEnableDisable: (disabled: boolean, department: string) => {
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

      if (biddingDateRef.current) {
        biddingDateRef.current.disabled = disabled;
      }
      if (timeRef.current) {
        timeRef.current.disabled = disabled;
      }
      if (dateIssuedRef.current) {
        dateIssuedRef.current.disabled = disabled;
      }
      if (validityRef.current) {
        validityRef.current.disabled = disabled;
      }

      if (accountRef.current) {
        accountRef.current.disabled = disabled;
      }
      if (policyNoRef.current) {
        policyNoRef.current.disabled = disabled;
      }
      if (policyNoRef.current) {
        policyNoRef.current.disabled = disabled;
      }

      if (officerRef.current) {
        officerRef.current.disabled = disabled;
      }
      if (positionRef.current) {
        positionRef.current.disabled = disabled;
      }

      if (unitRef.current) {
        unitRef.current.disabled = disabled;
      }

      if (obligeeRef.current) {
        obligeeRef.current.disabled = disabled;
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
        {/* Bonds Policy*/}
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
            Bonds Policy
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
                  policyTypeRef.current?.focus();
                }
              },
            }}
            inputRef={policyNoRef}
          />
          <SelectInput
            ref={_policyTypeRef}
            label={{
              title: "Policy Type :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            selectRef={policyTypeRef}
            select={{
              disabled: props.disabled,
              style: { flex: 1, height: "22px" },
              defaultValue: "",
              onChange: props.onChangeAccount,
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  officerRef.current?.focus();
                }
              },
            }}
            containerStyle={{
              width: "90%",
            }}
            datasource={[]}
            values={"SubLineName"}
            display={"SubLineName"}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Officer : ",
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
                  positionRef.current?.focus();
                }
              },
            }}
            inputRef={officerRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Position : ",
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
                  biddingDateRef.current?.focus();
                }
              },
            }}
            inputRef={positionRef}
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
              title: "Bidding Date:",
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
                  timeRef.current?.focus();
                }
              },
            }}
            inputRef={biddingDateRef}
          />
          <TextInput
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Time :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "time",
              defaultValue: format(new Date(), "hh:mm"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  dateIssuedRef.current?.focus();
                }
              },
            }}
            inputRef={timeRef}
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
                  validityRef.current?.focus();
                }
              },
            }}
            inputRef={dateIssuedRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Validity :",
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
                  unitRef.current?.focus();
                }
              },
            }}
            _inputRef={validityRef}
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
              width: "50%",
              alignItems: "flex-start",
            }}
            label={{
              title: "Unit :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            textarea={{
              disabled: props.disabled,
              rows: 4,
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  obligeeRef.current?.focus();
                }
              },
            }}
            _inputRef={unitRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "50%",
              alignItems: "flex-start",
            }}
            label={{
              title: "Obligee :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            textarea={{
              disabled: props.disabled,
              rows: 4,
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  // occupancyRef.current?.focus();
                }
              },
            }}
            _inputRef={obligeeRef}
          />
        </div>
      </div>
    </div>
  );
});
const PolicyPremium = forwardRef((props: any, ref) => {
  const cumputationButtonRef = useRef<HTMLButtonElement>(null);

  const name1Ref = useRef<HTMLInputElement>(null);
  const tcn1Ref = useRef<HTMLInputElement>(null);
  const il1Ref = useRef<HTMLInputElement>(null);
  const di1Ref = useRef<HTMLInputElement>(null);

  const name2Ref = useRef<HTMLInputElement>(null);
  const tcn2Ref = useRef<HTMLInputElement>(null);
  const il2Ref = useRef<HTMLInputElement>(null);
  const di2Ref = useRef<HTMLInputElement>(null);

  //Premiums
  const insuredValueRef = useRef<HTMLInputElement>(null);
  const percentageRef = useRef<HTMLInputElement>(null);
  const totalPremiumRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const docstampRef = useRef<HTMLInputElement>(null);
  const localGovTaxRef = useRef<HTMLInputElement>(null);
  const _localGovTaxRef = useRef<HTMLInputElement>(null);
  const umisRef = useRef<HTMLInputElement>(null);
  const principalRef = useRef<HTMLInputElement>(null);
  const totalDueRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {};
    },
    getRefs: () => {
      return {};
    },
    resetRefs: () => {},
    refEnableDisable: (disabled: boolean) => {},
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
            flexDirection: "column",
            rowGap: "20px",
          }}
        >
          {/* firt layer */}
          <div
            style={{
              border: "1px solid #9ca3af",
              width: "100%",
              display: "flex",
              padding: "10px",
              position: "relative",
              flex: 1,
              flexDirection: "column",
              rowGap: "5px",
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
              Information for notary (Officer)
            </span>
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Name : ",
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
                    tcn1Ref.current?.focus();
                  }
                },
              }}
              inputRef={name1Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Tax Certificate No : ",
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
                    il1Ref.current?.focus();
                  }
                },
              }}
              inputRef={tcn1Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Issued Location : ",
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
                    di1Ref.current?.focus();
                  }
                },
              }}
              inputRef={il1Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Officer : ",
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
                    name2Ref.current?.focus();
                  }
                },
              }}
              inputRef={di1Ref}
            />
          </div>
          <div
            style={{
              border: "1px solid #9ca3af",
              width: "100%",
              display: "flex",
              padding: "10px",
              position: "relative",
              flex: 1,
              flexDirection: "column",
              rowGap: "5px",
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
              Information for notary (Insurance Corp)
            </span>
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Capacity as : ",
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
                    tcn2Ref.current?.focus();
                  }
                },
              }}
              inputRef={name2Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Tax Certificate No : ",
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
                    il2Ref.current?.focus();
                  }
                },
              }}
              inputRef={tcn2Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Issued Location : ",
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
                    di2Ref.current?.focus();
                  }
                },
              }}
              inputRef={il2Ref}
            />
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Officer : ",
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
                    insuredValueRef.current?.focus();
                  }
                },
              }}
              inputRef={di2Ref}
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
                      umisRef,
                      principalRef,
                      totalDueRef
                    });
                    totalPremiumRef.current?.focus();
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
                    umisRef,
                    principalRef,
                    totalDueRef
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
                    principalRef.current?.focus();
                  }
                },
              }}
              inputRef={_localGovTaxRef}
            />
          </div>
          <TextFormatedInput
            label={{
              title: "Notary/Misc(umis):",
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
                  principalRef.current?.focus();
                }
              },
            }}
            inputRef={umisRef}
          />
          <TextFormatedInput
            label={{
              title: "Notary Misc(Principal):",
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
                  totalDueRef.current?.focus();
                }
              },
            }}
            inputRef={principalRef}
          />
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
