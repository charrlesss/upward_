import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { blue, grey, pink } from "@mui/material/colors";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../../../../../../../components/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import useQueryModalTable from "../../../../../../../hooks/useQueryModalTable";
import useMultipleComponent from "../../../../../../../hooks/useMultipleComponent";
import FirePolicyPremium from "./FirePolicyComponents/FirePolicyPremium";
import FirePolicyInformation from "./FirePolicyComponents/FirePolicyInformation";
import { CustomButton } from "../Vehicle/VehiclePolicy";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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
import {
  Autocomplete,
  AutocompleteNumber,
} from "../../../../Accounting/PettyCash";
import { wait } from "../../../../../../../lib/wait";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Loading } from "../../../../../../../components/Loading";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";

export default function FirePolicy() {
  const { myAxios, user } = useContext(AuthContext);
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const _policyInformationRef = useRef<any>(null);
  const _policyPremiumRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);

  const { isLoading: isLoadingOccupancy } = useQuery({
    queryKey: "occupancy",
    queryFn: () => {
      return myAxios.get("/task/production/fire/get-occupancy", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyInformationRef.current
          .getRefs()
          ._occupancyRef.current.setDataSource(response.data?.occupancy);
      });
    },
  });

  const { isLoading: isLoadingAccount } = useQuery({
    queryKey: "account",
    queryFn: () => {
      return myAxios.get("/task/production/fire/get-account", {
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
  const { isLoading: isLoadingMortgagee } = useQuery({
    queryKey: "mortgagee",
    queryFn: () => {
      return myAxios.get("/task/production/fire/get-mortgagee", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyPremiumRef.current
          .getRefs()
          .mortgageeSelect_.current.setDataSource(response.data?.mortgagee);
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
        subAccountRef_.current.setDataSource(response.data?.data);
        wait(100).then(() => {
          if (subAccountRef.current) subAccountRef.current.value = "HO";
        });
      });
    },
  });

  const { mutate:mutateAddUpdate, isLoading: loadingAddUpdate } = useMutation({
    mutationKey: "add-update",
    mutationFn: async (variables: any) => {
      if (mode === "update") {
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
      size:"medium",
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
          // if (_policyInformationRef.current.getRefs().clientIDRef.current) {
          //   _policyInformationRef.current.getRefs().clientIDRef.current.value =
          //     rowItm[0];
          // }
          // if (_policyInformationRef.current.getRefs().clientNameRef.current) {
          //   _policyInformationRef.current.getRefs().clientNameRef.current.value =
          //     rowItm[1];
          // }
          // if (
          //   _policyInformationRef.current.getRefs().clientAddressRef.current
          // ) {
          //   _policyInformationRef.current.getRefs().clientAddressRef.current.value =
          //     rowItm[3];
          // }
          // if (_policyInformationRef.current.getRefs().saleOfficerRef.current) {
          //   _policyInformationRef.current.getRefs().saleOfficerRef.current.value =
          //     rowItm[4];
          // }
          // clientCloseModal();
          // wait(100).then(() => {
          //   _policyInformationRef.current.getRefs().agentIdRef.current?.focus();
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
      {(isLoadingOccupancy ||
        isLoadingAccount ||
        isLoadingMortgagee ||
        isLoadingSubAccount ||
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
        <PageHelmet title="Vehicle Policy" />

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
                  searchFireOpenModal(e.currentTarget.value)
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if(searchRef.current){
                searchFireOpenModal(searchRef.current.value)
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

          
              let premium =
                 insuredValue * (percentage / 100);
              let vat =  premium * 0.12;
              let docStamp =
                 premium * 0.125;
              let locGovTax =
                 premium * localGovTaxPercentage;
              let fsTax =  premium * 0.02;

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

  // Vehicle Policy
  const _accountRef = useRef<any>(null);
  const rateCostRef = useRef<any>(null);
  const accountRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);
  const billNoRef = useRef<HTMLInputElement>(null);

  // Period of Insurance
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);

  // Insured Unit
  const locationRiskRef = useRef<HTMLTextAreaElement>(null);
  const occupancyRef = useRef<HTMLSelectElement>(null);
  const propertyInsuredRef = useRef<HTMLTextAreaElement>(null);
  const boundariesRef = useRef<HTMLTextAreaElement>(null);
  const constructionRef = useRef<HTMLTextAreaElement>(null);
  const _occupancyRef = useRef<any>(null);

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
        billNoRef: billNoRef.current?.value,
        dateFromRef: dateFromRef.current?.value,
        dateToRef: dateToRef.current?.value,
        dateIssuedRef: dateIssuedRef.current?.value,
        locationRiskRef: locationRiskRef.current?.value,
        occupancyRef: occupancyRef.current?.value,
        boundariesRef: boundariesRef.current?.value,
        constructionRef: constructionRef.current?.value,
        rateCost: rateCostRef.current,
        propertyInsuredRef: propertyInsuredRef.current?.value,
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
        corNoRef: billNoRef,
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        modelRef: locationRiskRef,
        plateNoRef: occupancyRef,
        makeRef: occupancyRef,
        chassisNoRef: boundariesRef,
        typeOfBodyRef: constructionRef,
        _accountRef,
        rateCostRef,
        _occupancyRef,
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

      if (billNoRef.current) {
        billNoRef.current.value = "";
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

      if (locationRiskRef.current) {
        locationRiskRef.current.value = "";
      }
      if (occupancyRef.current) {
        occupancyRef.current.value = "";
      }
      if (occupancyRef.current) {
        occupancyRef.current.value = "";
      }
      if (boundariesRef.current) {
        boundariesRef.current.value = "";
      }
      if (constructionRef.current) {
        constructionRef.current.value = "";
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
      if (rateCostRef.current) {
        rateCostRef.current.disabled = disabled;
      }

      if (policyNoRef.current) {
        policyNoRef.current.disabled = disabled;
      }
      if (billNoRef.current) {
        billNoRef.current.disabled = disabled;
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
      if (locationRiskRef.current) {
        locationRiskRef.current.disabled = disabled;
      }
      if (occupancyRef.current) {
        occupancyRef.current.disabled = disabled;
      }
      if (occupancyRef.current) {
        occupancyRef.current.disabled = disabled;
      }
      if (boundariesRef.current) {
        boundariesRef.current.disabled = disabled;
      }
      if (constructionRef.current) {
        constructionRef.current.disabled = disabled;
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
        {/* Vehicle Policy*/}
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
            Vehicle Policy
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
                  billNoRef.current?.focus();
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
              title: "Bill No:",
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
            inputRef={billNoRef}
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
                  locationRiskRef.current?.focus();
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
              width: "50%",
            }}
            label={{
              title: "Location of Risk :",
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
                  occupancyRef.current?.focus();
                }
              },
            }}
            _inputRef={locationRiskRef}
          />
          <div
            style={{
              width: "50%",
            }}
          >
            <SelectInput
              ref={_occupancyRef}
              label={{
                title: "Occupancy :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              selectRef={occupancyRef}
              select={{
                disabled: props.disabled,
                style: { flex: 1, height: "22px" },
                defaultValue: "",
                onChange: props.onChangeAccount,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    propertyInsuredRef.current?.focus();
                  }
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              datasource={[]}
              values={"SubLineName"}
              display={"SubLineName"}
            />
          </div>
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextAreaInput
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Property Insured:",
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
                  boundariesRef.current?.focus();
                }
              },
            }}
            _inputRef={propertyInsuredRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Boundaries:",
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
                  constructionRef.current?.focus();
                }
              },
            }}
            _inputRef={boundariesRef}
          />
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextAreaInput
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Construction :",
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
            _inputRef={constructionRef}
          />
        </div>
      </div>
    </div>
  );
});
const PolicyPremium = forwardRef((props: any, ref) => {
  const mortgageeSelect_ = useRef<any>(null);
  const mortgageeSelect = useRef<HTMLSelectElement>(null);

  const warrientiesRef = useRef<HTMLTextAreaElement>(null);

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
        mortgageeSelect: mortgageeSelect.current?.value,
        warrientiesRef: warrientiesRef.current?.value,
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
        mortgageeSelect_,
        mortgageeSelect,
        insuredValueRef,
        percentageRef,
        totalPremiumRef,
        vatRef,
        docstampRef,
        localGovTaxRef,
        _localGovTaxRef,
        fsTaxRef,
        totalDueRef,
        warrientiesRef,
      };
    },
    resetRefs: () => {
      if (mortgageeSelect.current) {
        mortgageeSelect.current.value = "";
      }

      if (warrientiesRef.current) {
        warrientiesRef.current.value = "";
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
      if (mortgageeSelect.current) {
        mortgageeSelect.current.disabled = disabled;
      }

      if (warrientiesRef.current) {
        warrientiesRef.current.disabled = disabled;
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
            Mortgagee
          </span>
          {/* firt layer */}
          <div
            style={{
              width: "140px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              padding: "5px",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              <label
                htmlFor="mortgagee"
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Mortgagee:
              </label>
            </div>
            <label
              htmlFor="warranties"
              style={{
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Warranties:
            </label>
          </div>
          {/* second layer */}
          <div
            style={{
              flex: 1,
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <div>
              <Autocomplete
                disableInput={props.disabled}
                ref={mortgageeSelect_}
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  style: {
                    display: "none",
                  },
                }}
                DisplayMember={"Mortgagee"}
                DataSource={[]}
                inputRef={mortgageeSelect}
                input={{
                  style: {
                    width: "100%",
                    flex: 1,
                  },
                  id: "mortgagee",
                }}
                onChange={(selected: any, e: any) => {
                  if (mortgageeSelect.current) {
                    mortgageeSelect.current.value = selected.Mortgagee;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    warrientiesRef.current?.focus();
                  }
                }}
              />
            </div>

            <div
              style={{
                height: "150px",
                display: "flex",
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
                  id: "warranties",
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
                _inputRef={warrientiesRef}
              />
            </div>
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
                    props.onComputation();
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
                size="small"
                color="info"
                onClick={() => {
                  props.onComputation({
                    mortgageeSelect_,
                    mortgageeSelect,
                    insuredValueRef,
                    percentageRef,
                    totalPremiumRef,
                    vatRef,
                    docstampRef,
                    localGovTaxRef,
                    _localGovTaxRef,
                    fsTaxRef,
                    totalDueRef,
                    warrientiesRef,
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
          <TextFormatedInput
            label={{
              title: "F.S Tax:",
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
            inputRef={fsTaxRef}
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
//   bill_no: "",
//   //Period Insurance
//   DateFrom: new Date(),
//   DateTo: addYears(new Date(), 1),
//   DateIssued: new Date(),
//   //Insured Unit
//   locRisk: "",
//   propertyInsured: "",
//   construction: "",
//   occupancy: "",
//   boundaries: "",
//   //policy premuim
//   mortgage: "",
//   warranties: "",
//   insuredValue: "",
//   percentagePremium: "",
//   totalPremium: "",
//   vat: "",
//   docStamp: "",
//   localGovTaxPercent: "0.75",
//   localGovTax: "",
//   fsTax: "",
//   totalDue: "",
//   // extra
//   fireActioMode: "",
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
export const FireContext = createContext<any>({});

// const queryKeySearchPolicy = "fire-search";
// const queryKeySearchClientEntry = "clients";
// const queryKeySearchAgentEntry = "agents";
// const queryKeyNeedData = "fire-policy";
// const queryKeyAddOrUpdatePolicy = "fire-policy";
// const queryKeyDeletePolicy = "fire-policy";

// export default function FirePolicy() {
//   const { step, goTo, currentStepIndex } = useMultipleComponent([
//     <FirePolicyInformation />,
//     <FirePolicyPremium />,
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
//   const isAddOrEditMode = state.fireActioMode === "";
//   const searchFirePolicyInputRef = useRef<HTMLInputElement>(null);

//   const newButtonRef = useRef<HTMLButtonElement>(null);
//   const cancelButtonRef = useRef<HTMLButtonElement>(null);
//   const deleteButtonRef = useRef<HTMLButtonElement>(null);
//   const {
//     ModalComponent: ModalFirePolicySearch,
//     openModal: openModalFirePolicySearch,
//     isLoading: isLoadingModalFirePolicySearch,
//     closeModal: closeModalFirePolicySearch,
//   } = useQueryModalTable({
//     link: {
//       url: "/task/production/search-fire-policy",
//       queryUrlName: "searchFirePolicy",
//     },
//     columns: [
//       { field: "_DateIssued", headerName: "Date", width: 100 },
//       { field: "PolicyNo", headerName: "Policy No", width: 200 },
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
//     queryKey: "search-fire-policy",
//     uniqueId: "PolicyNo",
//     responseDataKey: "firePolicy",
//     onSelected: (selectedRowData) => {
//       onSearchSelected(selectedRowData);
//       closeModalFirePolicySearch();
//     },
//     onCellKeyDown: (__: any, key: any) => {
//       if (key.code === "Enter" || key.code === "NumpadEnter") {
//         onSearchSelected([__.row]);
//         closeModalFirePolicySearch();
//       }
//     },
//     searchRef: searchFirePolicyInputRef,
//   });
//   const { data: dataSubAccount, isLoading: isLoadingSubAccount } = useQuery({
//     queryKey: "get-sub_account",
//     queryFn: async () =>
//       await myAxios.get(`/task/production/get-sub_account`, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//   });
//   const { mutate, isLoading: loadingAddNew } = useMutation({
//     mutationKey: queryKeyAddOrUpdatePolicy,
//     mutationFn: async (variables: any) => {
//       if (state.fireActioMode === "delete") {
//         return await myAxios.post(
//           "/task/production/update-fire-policy",
//           variables,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.accessToken}`,
//             },
//           }
//         );
//       }
//       return await myAxios.post("/task/production/add-fire-policy", variables, {
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
//         "/task/production/delete-fire-policy",
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
//     state.fsTax = state.fsTax === "" ? "0" : state.fsTax;
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
//       );
//     }

//     if (state.client_id === "" || state.client_id === null) {
//       return Swal.fire(
//         "Unable to save! Invalid IDNo.",
//         "you missed the Client Id Field?",
//       );
//     }

//     if (state.PolicyAccount === "" || state.PolicyAccount === null) {
//       return Swal.fire(
//         "Unable to save! Please select Account.",
//         "you missed the Account Field?",
//       );
//     }
//     if (state.PolicyNo === "" || state.PolicyNo === null) {
//       return Swal.fire(
//         "Unable to save! Invalid Policy No.",
//         "you missed the Policy No Field?",
//       );
//     }
//     if (state.occupancy === "" || state.occupancy === null) {
//       return Swal.fire(
//         "Unable to save! occupancy is required.",
//       );
//     }

//     if (state.fireActioMode === "delete") {
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
//   }, [state, setDefaultValueForNumber, mutate]);

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
//         state.fireActioMode === "" &&
//         (event.code === "KeyN" ||
//           event.code === "Enter" ||
//           event.code === "NumpadEnter")
//       ) {
//         event.preventDefault();
//         newButtonRef.current?.click();
//       }
//       if (state.fireActioMode !== "" && event.code === "Escape") {
//         event.preventDefault();
//         cancelButtonRef.current?.click();
//       }
//       if (state.fireActioMode === "delete" && event.code === "Delete") {
//         event.preventDefault();
//         deleteButtonRef.current?.click();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [goTo, handleOnSave, state.fireActioMode]);

//   // fireActioMode
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
//     const FsTaxPercentage = 2 / 100;
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
//     customInputchange((FsTaxPercentage * NewTotalPremium).toFixed(2), "fsTax");
//     customInputchange(
//       (
//         parseFloat(NewTotalPremium.toFixed(2)) +
//         parseFloat((VatPercentage * NewTotalPremium).toFixed(2)) +
//         parseFloat((DocPercentage * NewTotalPremium).toFixed(2)) +
//         parseFloat((LOGPercentage * NewTotalPremium).toFixed(2)) +
//         parseFloat((FsTaxPercentage * NewTotalPremium).toFixed(2))
//       ).toFixed(2),
//       "totalDue"
//     );
//   }
//   function backToDefaultState(json: any, resetAll: boolean = false) {
//     json.form_type = state.form_type;
//     json.form_action = state.form_action;
//     if (!resetAll) {
//       json.fireActioMode = state.fireActioMode;
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
//       DateFrom,
//       DateTo,
//       BillNo,
//       Percentage,
//       Location,
//       InsuredValue,
//       PropertyInsured,
//       Constraction,
//       Occupancy,
//       Boundaries,
//       Mortgage,
//       Warranties,
//       IDNo,
//       SubAcct,
//       _DateIssued,
//       AgentID,
//       AgentCom,
//       client_fullname,
//       address,
//       agent_fullname,
//       sale_officer,
//       TotalPremium,
//       Vat,
//       DocStamp,
//       LGovTax,
//       FireTax,
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
//     customInputchange(BillNo, "bill_no");

//     customInputchange(DateFrom, "DateFrom");
//     customInputchange(DateTo, "DateTo");
//     customInputchange(_DateIssued, "DateIssued");

//     customInputchange(Location, "locRisk");
//     customInputchange(PropertyInsured, "propertyInsured");
//     customInputchange(Constraction, "construction");
//     customInputchange(Occupancy, "occupancy");
//     customInputchange(Boundaries, "boundaries");
//     customInputchange(Mortgage, "mortgage");
//     customInputchange(Warranties, "warranties");

//     function formatNumber(num: number) {
//       return (num || 0).toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })
//     }

//     console.log(selectedRowData[0])

//     customInputchange(formatNumber(parseFloat(InsuredValue)), "insuredValue");
//     customInputchange(formatNumber(parseFloat(Percentage)), "percentagePremium");
//     customInputchange(formatNumber(parseFloat(TotalPremium)), "totalPremium");
//     customInputchange(formatNumber(parseFloat(Vat)), "vat");
//     customInputchange(formatNumber(parseFloat(DocStamp)), "docStamp");
//     customInputchange(formatNumber(parseFloat(LGovTax)), "localGovTax");
//     customInputchange(formatNumber(parseFloat(FireTax)), "fsTax");
//     customInputchange(formatNumber(parseFloat(TotalDue)), "totalDue");

//     customInputchange("delete", "fireActioMode");
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
//       <PageHelmet title="Fire Policy" />

//       <FireContext.Provider
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
//               {state.fireActioMode === "" && (
//                 <Button
//                   sx={{
//                     height: "30px",
//                     fontSize: "11px",
//                   }}
//                   ref={newButtonRef}
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => {
//                     customInputchange("add", "fireActioMode");
//                   }}
//                 >
//                   New
//                 </Button>
//               )}
//               <LoadingButton
//                 sx={{
//                   height: "30px",
//                   fontSize: "11px",
//                 }}
//                 color="primary"
//                 variant="contained"
//                 type="submit"
//                 onClick={handleOnSave}
//                 disabled={state.fireActioMode === ""}
//                 startIcon={<SaveIcon />}
//                 loading={loadingAddNew}
//               >
//                 Save
//               </LoadingButton>
//               {state.fireActioMode !== "" && (
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
//                         customInputchange("", "fireActioMode");
//                         backToDefaultState(initialState, true);
//                       }
//                     });
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               )}
//               <LoadingButton
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
//                 disabled={state.fireActioMode !== "delete"}
//                 startIcon={<DeleteIcon />}
//                 onClick={() => {
//                   codeCondfirmationAlert({
//                     isUpdate: false,
//                     cb: (userCodeConfirmation) => {
//                       setDefaultValueForNumber();
//                       mutateDelete({
//                         PolicyAccount: state.PolicyAccount,
//                         PolicyNo: state.PolicyNo,
//                         userCodeConfirmation,
//                       });
//                     },
//                   });
//                 }}
//                 loading={loadingDelete}
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
//           {isLoadingModalFirePolicySearch ? (
//             <LoadingButton loading={isLoadingModalFirePolicySearch} />
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
//                   openModalFirePolicySearch(search);
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
//         {ModalFirePolicySearch}
//       </FireContext.Provider>
//     </>
//   );
// }
