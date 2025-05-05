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
import "../../../../../../../style/monbileview/production/production.css";

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
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
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
          if (_policyPremiumRef.current.getRefs().fsTaxRef.current) {
            _policyPremiumRef.current.getRefs().fsTaxRef.current.value =
              formatNumber(
                parseFloat((selected.FireTax || 0).toString().replace(/,/g, ""))
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

          //  wait(100).then(()=>{
          //   _policyPremiumRef.current.getRefs().cumputationButtonRef.current.click()
          //  })
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
      {(isLoadingOccupancy ||
        isLoadingAccount ||
        isLoadingMortgagee ||
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
              Information
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
            <SelectInput
              ref={subAccountRef_}
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

  // Fire Policy
  const _accountRef = useRef<any>(null);
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
        billNoRef,
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        locationRiskRef,
        occupancyRef,
        boundariesRef,
        constructionRef,
        _accountRef,
        _occupancyRef,
        propertyInsuredRef,
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
      if (propertyInsuredRef.current) {
        propertyInsuredRef.current.value = "";
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
            Insurer Information
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
        className="container-fields"
        style={{
          display: "flex",
          columnGap: "15px",
        }}
      >
        {/* Fire Policy*/}
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
            Fire Policy
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
                  billNoRef.current?.focus();
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
        className="container-fields"
        style={{
          width: "100%",
          border: "1px solid #9ca3af",
          boxSizing: "border-box",
          padding: "10px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          rowGap: "10px",
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
          style={{
            display: "flex",
            columnGap: "100px",
          }}
        >
          <TextAreaInput
            containerClassName="custom-input"
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
            className="container-max-width"
            style={{
              width: "50%",
            }}
          >
            <SelectInput
              containerClassName="custom-select"
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
            containerClassName="custom-input"
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
  const cumputationButtonRef = useRef<HTMLButtonElement>(null);
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
        cumputationButtonRef,
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
            <div className="mobile-content-premium">
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
            <div className="mobile-content-premium">
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
