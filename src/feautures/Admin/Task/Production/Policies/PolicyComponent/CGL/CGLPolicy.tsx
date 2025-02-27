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
import { wait } from "../../../../../../../lib/wait";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Loading } from "../../../../../../../components/Loading";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";

export default function PAPolicy() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const _policyInformationRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);

  const { isLoading: isLoadingAccount } = useQuery({
    queryKey: "account",
    queryFn: () => {
      return myAxios.get("/task/production/cgl/get-account", {
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
          "/task/production/update-cgl-policy",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      }
      return await myAxios.post("/task/production/add-cgl-policy", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: async (res) => {
      if (res.data.success) {
        setMode("");
        _policyInformationRef.current.resetRefs();

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
          "/task/production/selected-search-cgl-policy",
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

          // periiod insurance
          if (_policyInformationRef.current.getRefs().dateFromRef.current) {
            _policyInformationRef.current.getRefs().dateFromRef.current.value =
              format(new Date(selected.PeriodFrom), "yyyy-MM-dd");
          }
          if (_policyInformationRef.current.getRefs().dateToRef.current) {
            _policyInformationRef.current.getRefs().dateToRef.current.value =
              format(new Date(selected.PeriodTo), "yyyy-MM-dd");
          }
          if (_policyInformationRef.current.getRefs().dateIssuedRef.current) {
            _policyInformationRef.current.getRefs().dateIssuedRef.current.value =
              format(new Date(selected.DateIssued), "yyyy-MM-dd");
          }

          // insured unit
          if (_policyInformationRef.current.getRefs().sumInsuredRef.current) {
            _policyInformationRef.current.getRefs().sumInsuredRef.current.value =
              formatNumber(
                parseFloat(selected.sumInsured.toString().replace(/,/g, ""))
              );
          }
          if (
            _policyInformationRef.current.getRefs().premisesOperationsRef.current
          ) {
            _policyInformationRef.current.getRefs().premisesOperationsRef.current.value =
              selected.Location;
          }

          if (
            _policyInformationRef.current.getRefs().addressRef.current
          ) {
            _policyInformationRef.current.getRefs().addressRef.current.value =
              selected.address;
          }

          if (
            _policyInformationRef.current.getRefs().blPremium.current
          ) {
            _policyInformationRef.current.getRefs().blPremium.current.value =
              selected.LimitA;
          }

          if (
            _policyInformationRef.current.getRefs().pdPremium.current
          ) {
            _policyInformationRef.current.getRefs().pdPremium.current.value =
              selected.LimitB;
          }


          // premuim
          if (_policyInformationRef.current.getRefs().netPremiumRef.current) {
            _policyInformationRef.current.getRefs().netPremiumRef.current.value =
              formatNumber(
                parseFloat(selected.TotalPremium.toString().replace(/,/g, ""))
              );
          }

          wait(100).then(() => {
            _policyInformationRef.current
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
    link: "/task/production/search-cgl-policy",
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
    if (_policyInformationRef.current.requiredField()) {
      return;
    }

    if (mode === "edit") {
      codeCondfirmationAlert({
        isUpdate: true,
        cb: (userCodeConfirmation) => {
          const data = {
            ..._policyInformationRef.current.getRefsValue(),
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
        <PageHelmet title="CGL Policy" />
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
                }
              });
            }}
          >
            Cancel
          </Button>
        </div>
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
          onComputation={(refs: any) => {
            let txtPremium = parseFloat(
              (refs.netPremiumRef.current?.value || 0)
                .toString()
                .replace(/,/g, "")
            );
            let vat = txtPremium * 0.12;
            let docStamp = txtPremium * 0.125;
            let locGovTax = txtPremium * 0.0075;
            let totalDue = txtPremium + vat + docStamp + locGovTax;

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
    </>
  );
}

const PolicyInformation = forwardRef((props: any, ref) => {
  const cumputationButtonRef = useRef<HTMLButtonElement>(null);
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

  // Period of Insurance
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);

  // Insured Unit
  const sumInsuredRef = useRef<HTMLInputElement>(null);
  const premisesOperationsRef = useRef<HTMLTextAreaElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const blPremium = useRef<HTMLInputElement>(null);
  const pdPremium = useRef<HTMLInputElement>(null);

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
        cumputationButtonRef  :cumputationButtonRef.current?.value,
        clientIDRef:clientIDRef.current?.value,
        clientNameRef:clientNameRef.current?.value,
        clientAddressRef:clientAddressRef.current?.value,
        agentIdRef:agentIdRef.current?.value,
        agentNameRef:agentNameRef.current?.value,
        agentCommisionRef:agentCommisionRef.current?.value,
        saleOfficerRef:saleOfficerRef.current?.value,
        _accountRef:_accountRef.current?.value,
        accountRef:accountRef.current?.value,
        policyNoRef:policyNoRef.current?.value,
        dateFromRef:dateFromRef.current?.value,
        dateToRef:dateToRef.current?.value,
        dateIssuedRef:dateIssuedRef.current?.value,
        sumInsuredRef:sumInsuredRef.current?.value,
        premisesOperationsRef:premisesOperationsRef.current?.value,
        addressRef:addressRef.current?.value,
        blPremium:blPremium.current?.value,
        pdPremium:pdPremium.current?.value,
        netPremiumRef:netPremiumRef.current?.value,
        vatRef:vatRef.current?.value,
        docstampRef:docstampRef.current?.value,
        localGovTaxRef:localGovTaxRef.current?.value,
        _localGovTaxRef:_localGovTaxRef.current?.value,
        totalDueRef:totalDueRef.current?.value,
      };
    },
    getRefs: () => {
      return {
        cumputationButtonRef      ,
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
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        sumInsuredRef,
        premisesOperationsRef,
        addressRef,
        blPremium,
        pdPremium,
        netPremiumRef,
        vatRef,
        docstampRef,
        localGovTaxRef,
        _localGovTaxRef,
        totalDueRef,
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

      if (sumInsuredRef.current) {
        sumInsuredRef.current.value = "0.00";
      }

      if (premisesOperationsRef.current) {
        premisesOperationsRef.current.value = "";
      }

      if (addressRef.current) {
        addressRef.current.value = "";
      }

      if (blPremium.current) {
        blPremium.current.value = "0.00";
      }
      if (blPremium.current) {
        blPremium.current.value = "0.00";
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

      if (sumInsuredRef.current) {
        sumInsuredRef.current.disabled = disabled;
      }
      if (premisesOperationsRef.current) {
        premisesOperationsRef.current.disabled = disabled;
      }
      if (addressRef.current) {
        addressRef.current.disabled = disabled;
      }
      if (blPremium.current) {
        blPremium.current.disabled = disabled;
      }
      if (pdPremium.current) {
        pdPremium.current.disabled = disabled;
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
                  dateFromRef.current?.focus();
                }
              },
            }}
            inputRef={policyNoRef}
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
                  sumInsuredRef.current?.focus();
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
          padding: "20px",
          position: "relative",
          display: "flex",
          rowGap: "5px",
          columnGap: "10px",
        }}
      >
        <div
          style={{
            flex: 1,
            rowGap: "5px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextFormatedInput
            label={{
              title: "Sum Insured :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "300px",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  premisesOperationsRef.current?.focus()
                }
              },
            }}
            inputRef={sumInsuredRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
            label={{
              title: "Premises Operations :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            textarea={{
              disabled: props.disabled,
              rows: 3,
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  addressRef.current?.focus()
                }
              },
            }}
            _inputRef={premisesOperationsRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
            label={{
              title: "Address :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            textarea={{
              disabled: props.disabled,
              rows: 3,
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  blPremium.current?.focus()

                }
              },
            }}
            _inputRef={addressRef}
          />
          <TextFormatedInput
            label={{
              title: "BL Premium :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "300px",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  pdPremium.current?.focus()
                }
              },
            }}
            inputRef={blPremium}
          />
          <TextFormatedInput
            label={{
              title: "PD Premium :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "300px",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  netPremiumRef.current?.focus()

                }
              },
            }}
            inputRef={pdPremium}
          />
        </div>
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
            flex: 1,
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
            Premiums
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
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
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
// import { GridRowSelectionModel } from "@mui/x-data-grid";
// import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// import CGLPolicyInformation from "./CGLPolicyComponent/CGLPolicyInformation";
// import useQueryModalTable from "../../../../../../../hooks/useQueryModalTable";
// import { LoadingButton } from "@mui/lab";
// import {
//   codeCondfirmationAlert,
//   saveCondfirmationAlert,
// } from "../../../../../../../lib/confirmationAlert";
// import { addYears } from "date-fns";
// import PageHelmet from "../../../../../../../components/Helmet";

// const initialState = {
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

//   //Period Insurance
//   DateFrom: new Date(),
//   DateTo: addYears(new Date(), 1),
//   DateIssued: new Date(),

//   //
//   sumInsured: "",
//   premisisOperation: "",
//   address: "",
//   blPremium: "0.00",
//   pdPremium: "0.00",

//   //calculation
//   netPremium: "0.00",
//   vat: "0.00",
//   docStamp: "0.00",
//   localGovTaxPercent: "0.75",
//   localGovTax: "0.00",
//   totalDue: "0.00",
//   // extra
//   cglActioMode: "",
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
// export const CGLContext = createContext<any>({});

// const queryKeySearchPolicy = "cgl-search";
// const queryKeySearchClientEntry = "clients";
// const queryKeySearchAgentEntry = "agents";
// const queryKeyNeedData = "cgl-policy";
// const queryKeyAddOrUpdatePolicy = "cgl-policy";
// const queryKeyDeletePolicy = "cgl-policy";

// export default function CGLPolicy() {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { myAxios, user } = useContext(AuthContext);
//   const [clientRows, setClientRows] = useState<GridRowSelectionModel>([]);
//   const [agentRows, setAgentRows] = useState<GridRowSelectionModel>([]);
//   const [search, setSearch] = useState("");
//   const [Mortgagee, setMortgagee] = useState(false);
//   const searchCglPolicyInputRef = useRef<HTMLInputElement>(null);

//   const queryClient = useQueryClient();
//   const isAddOrEditMode = state.cglActioMode === "";

//   const newButtonRef = useRef<HTMLButtonElement>(null);
//   const cancelButtonRef = useRef<HTMLButtonElement>(null);
//   const deleteButtonRef = useRef<HTMLButtonElement>(null);

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
//     ModalComponent: ModalSearchCGLPolicy,
//     openModal: openModalSearchCGLPolicy,
//     isLoading: isLoadingModalSearchCGLPolicy,
//     closeModal: closeModalSearchCGLPolicy,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/production/search-cgl-policy",
//       queryUrlName: "searchCglPolicy",
//     },
//     columns: [
//       { field: "DateIssued", headerName: "Date", width: 200 },
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
//     queryKey: "search-cgl-policy",
//     uniqueId: "PolicyNo",
//     responseDataKey: "cglPolicy",
//     onSelected: (selectedRowData) => {
//       onSearchSelected(selectedRowData);
//       closeModalSearchCGLPolicy();
//     },
//     onCellKeyDown: (__: any, key: any) => {
//       if (key.code === "Enter" || key.code === "NumpadEnter") {
//         onSearchSelected([__.row]);
//         closeModalSearchCGLPolicy();
//       }
//     },
//     onSuccess: console.log,
//     searchRef: searchCglPolicyInputRef,
//   });

//   const { mutate, isLoading: loadingAddNew } = useMutation({
//     mutationKey: queryKeyAddOrUpdatePolicy,
//     mutationFn: async (variables: any) => {
//       if (state.cglActioMode === "delete") {
//         return await myAxios.post(
//           "/task/production/update-cgl-policy",
//           variables,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.accessToken}`,
//             },
//           }
//         );
//       }
//       return await myAxios.post("/task/production/add-cgl-policy", variables, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       });
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
//         "/task/production/delete-cgl-policy",
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
//     state.blPremium = state.blPremium === "" ? "0" : state.blPremium;
//     state.pdPremium = state.pdPremium === "" ? "0" : state.pdPremium;
//     state.netPremium = state.netPremium === "" ? "0" : state.netPremium;
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

//     if (state.cglActioMode === "delete") {
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
//   }, [setDefaultValueForNumber, state, mutate]);

//   useEffect(() => {
//     const handleKeyDown = (event: any) => {
//       if (
//         state.cglActioMode === "" &&
//         (event.code === "KeyN" ||
//           event.code === "Enter" ||
//           event.code === "NumpadEnter")
//       ) {
//         event.preventDefault();
//         newButtonRef.current?.click();
//       }
//       if (state.cglActioMode !== "" && event.code === "Escape") {
//         event.preventDefault();
//         cancelButtonRef.current?.click();
//       }
//       if (state.cglActioMode === "delete" && event.code === "Delete") {
//         event.preventDefault();
//         deleteButtonRef.current?.click();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [handleOnSave, state.cglActioMode]);

//   const handleInputChange = (e: any) => {
//     const { name, value } = e.target;
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };

//   // cglActioMode

//   const customInputchange = (value: any, name: string) => {
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };

//   function computation() {
//     setDefaultValueForNumber();
//     const inpLocalGovTaxPercent = parseFloat(state.localGovTaxPercent);
//     const VatPercentage = 12 / 100;
//     const DocPercentage = 12.5 / 100;
//     const LOGPercentage = inpLocalGovTaxPercent / 100;
//     const NewTotalPremium = parseFloat(state.netPremium);

//     customInputchange((VatPercentage * NewTotalPremium).toFixed(2), "vat");
//     customInputchange((DocPercentage * NewTotalPremium).toFixed(2), "docStamp");
//     customInputchange(
//       (LOGPercentage * NewTotalPremium).toFixed(2),
//       "localGovTax"
//     );
//     customInputchange(NewTotalPremium.toFixed(2), "netPremium");
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
//       json.cglActioMode = state.cglActioMode;
//     }
//     Object.entries(json).forEach(([key, value]) => {
//       customInputchange(value, key);
//     });
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
//   function onSearchSelected(selectedRowData: any) {
//     const {
//       PolicyNo,
//       Account,
//       PeriodFrom,
//       PeriodTo,
//       Location,
//       IDNo,
//       SubAcct,
//       DateIssued,
//       TotalPremium,
//       AgentID,
//       AgentCom,
//       client_fullname,
//       agent_fullname,
//       address,
//       LimitA,
//       LimitB,
//       sumInsured,
//       cgl_address,
//       sale_officer,
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

//     customInputchange(PeriodFrom, "DateFrom");
//     customInputchange(PeriodTo, "DateTo");
//     customInputchange(DateIssued, "DateIssued");

//     customInputchange(Location, "premisisOperation");

//     customInputchange(Location, "premisisOperation");
//     customInputchange(sumInsured, "sumInsured");
//     customInputchange(cgl_address, "address");

//     customInputchange(LimitA, "blPremium");
//     customInputchange(LimitB, "pdPremium");
//     console.log(selectedRowData)

//     customInputchange(formatNumber(parseFloat(TotalPremium)), "netPremium");
//     customInputchange(formatNumber(parseFloat(Vat)), "vat");
//     customInputchange(formatNumber(parseFloat(DocStamp)), "docStamp");
//     customInputchange(formatNumber(parseFloat(LGovTax)), "localGovTax");
//     customInputchange(formatNumber(parseFloat(TotalDue)), "totalDue");

//     customInputchange("delete", "cglActioMode");
//   }

//   function formatNumber(num: number) {
//     return (num || 0).toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })
//   }

//   function keySave(event: any) {
//     if (
//       state.mode !== "" &&
//       (event.code === "Enter" || event.code === "NumpadEnter")
//     ) {
//       event.preventDefault();
//       handleOnSave();
//     }
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
//       <PageHelmet title="CGL Policy" />

//       <CGLContext.Provider
//         value={{
//           state,
//           handleInputChange,
//           customInputchange,
//           Mortgagee,
//           setMortgagee,
//           clientRows,
//           setClientRows,
//           myAxios,
//           user,
//           agentRows,
//           setAgentRows,
//           computation,
//           isAddOrEditMode,
//           dispatch,
//           keySave,
//         }}
//       >
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
//               display: "flex",
//               alignItems: "center",
//               columnGap: "20px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 columnGap: "5px",
//               }}
//             >
//               {state.cglActioMode === "" && (
//                 <Button
//                   sx={{
//                     height: "30px",
//                     fontSize: "11px",
//                   }}
//                   ref={newButtonRef}
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => {
//                     customInputchange("add", "cglActioMode");
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
//                 disabled={state.cglActioMode === ""}
//                 startIcon={<SaveIcon />}
//               >
//                 Save
//               </LoadingButton>

//               {state.cglActioMode !== "" && (
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
//                         customInputchange("", "cglActioMode");
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
//                 disabled={state.cglActioMode !== "delete"}
//                 startIcon={<DeleteIcon />}
//                 onClick={() => {
//                   codeCondfirmationAlert({
//                     isUpdate: false,
//                     cb: (userCodeConfirmation) => {
//                       mutateDelete({
//                         PolicyAccount: state.PolicyAccount,
//                         PolicyNo: state.PolicyNo,
//                         policyType: state.policyType,
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
//         </Box>
//         <div style={{ marginBottom: "5px", display: "flex", gap: "10px" }}>
//           {isLoadingModalSearchCGLPolicy ? (
//             <LoadingButton loading={isLoadingModalSearchCGLPolicy} />
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
//                   openModalSearchCGLPolicy(search);
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
//         <CGLPolicyInformation />
//         {ModalSearchCGLPolicy}
//       </CGLContext.Provider>
//     </>
//   );
// }
