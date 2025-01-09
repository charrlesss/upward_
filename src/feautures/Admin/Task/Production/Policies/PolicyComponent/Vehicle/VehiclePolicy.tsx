import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "react-query";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import ModalWithTable from "../../../../../../../components/ModalWithTable";
import { LoadingButton } from "@mui/lab";
import { flushSync } from "react-dom";
import useMultipleComponent from "../../../../../../../hooks/useMultipleComponent";
import PolicyInformation from "./VehicleComponent/PolicyInformation";
import PolicyPremium from "./VehicleComponent/PolicyPremium";
import PolicyTypeDetails from "./VehicleComponent/PolicyTypeDetails";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import styled from "@emotion/styled";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";
import { addYears, format } from "date-fns";
import ArticleIcon from "@mui/icons-material/Article";
import PageHelmet from "../../../../../../../components/Helmet";




import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
import { grey, pink } from "@mui/material/colors";
import { AuthContext } from "../../../../../../../components/AuthContext";
import { SelectInput, TextAreaInput, TextFormatedInput, TextInput } from "../../../../../../../components/UpwardFields";
import CalculateIcon from '@mui/icons-material/Calculate';


import SearchIcon from '@mui/icons-material/Search';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete } from "../../../../Accounting/PettyCash";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";
import { Loading } from "../../../../../../../components/Loading";
import { wait } from "../../../../../../../lib/wait";

export default function VehiclePolicy() {
  const { user } = useContext(AuthContext)
  const [policy, setPolicy] = useState(window.localStorage.getItem('__policy__'))
  const _policy = useRef<any>(null)


  useEffect(() => {
    if (user) {
      if (user.department === 'UMIS') {
        return _policy.current?.setDataSource([
          { key: "COM" },
          { key: "TPL" },
        ])
      } else {
        return _policy.current?.setDataSource([
          { key: "COM" },
        ])
      }
    }

  }, [user, policy])

  return (
    <div style={{
      flex: 1,
      height: "calc(100% - 35px)",
      paddingTop: "5px",
      display: "flex",
      flexDirection: "column"
    }}>

      {policy === 'COM' ?
        <COMPolicy
          user={user}
          policy={policy}
          setPolicy={setPolicy}
          _policy={_policy}

        />
        :
        <TPLPolicy
          user={user}
          policy={policy}
          setPolicy={setPolicy}
          _policy={_policy}
        />
      }
    </div>
  )
}

function COMPolicy({
  user,
  policy,
  setPolicy,
  _policy
}: any) {
  const [selectedPage, setSelectedPage] = useState(0)
  const [policyType, setPolicyType] = useState(window.localStorage.getItem('__policy_type__'))
  const searchRef = useRef<HTMLInputElement>(null)
  const regularPolicyRef = useRef<any>(null)

  function handleSave() {
    regularPolicyRef.current.handleOnSave()
  }

  return (

    <>
      <div style={{ display: "flex", columnGap: "8px", alignItems: "center", marginBottom: "15px" }}>
        {user?.department === 'UMIS' && <SelectInput
          ref={_policy}
          label={{
            title: "Policy: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "50px",
            },
          }}
          select={{
            style: { width: "70px", height: "20px" },
            value: policy,
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                e.preventDefault()
              }
            },
            onChange: (e) => {
              setPolicy(e.currentTarget.value)
            }
          }}
          datasource={[]}
          values={"key"}
          display={"key"}
        />}
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
                // openModalSearchCollection(e.currentTarget.value);
              }
            },
            style: { width: "100%", height: "22px" },
          }}

          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault()
            alert('qwe')
            // if (searchRef.current)
            // openModalSearchCollection(searchRef.current.value);
          }}
          inputRef={searchRef}
        />
        <IconButton size="small" color="primary">
          <AddBoxIcon />
        </IconButton>
        <IconButton size="small" onClick={handleSave}>
          <SaveAsIcon color="success" />
        </IconButton>
        <IconButton size="small" >
          <CloseIcon color="error" />
        </IconButton>
      </div>
      <div style={{ display: "flex", columnGap: "7px", marginBottom: "6px" }}>
        <div style={{ display: "flex", columnGap: "2px" }}>
          <Button
            disabled={policyType === 'REG'}
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            variant="contained"
            color={policyType === 'REG' ? "secondary" : "info"}
            onClick={() => {
              setPolicyType('REG')
            }}
          >REGULAR</Button>
          <Button
            disabled={policyType === 'TEMP'}
            sx={{
              height: "23px",
              fontSize: "11px",
              marginLeft: "5px"
            }}
            onClick={() => {
              setPolicyType('TEMP')
            }}
            variant="contained"
            color={policyType === 'TEMP' ? "secondary" : "info"}
          >TEMPORAY</Button>
        </div>
        <div>|</div>
        <div style={{ display: "flex", columnGap: "2px" }}>
          <Button
            disabled={selectedPage === 0}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 0 ? grey[500] : grey[700],
              "&:hover": {
                background: grey[800],
              }
            }}
            variant="contained"
            onClick={() => {
              setSelectedPage(0)
            }}
          >Policy Information</Button>
          <Button
            disabled={selectedPage === 1}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 1 ? grey[500] : grey[700],
              "&:hover": {
                background: grey[800],
              }
            }}
            onClick={() => {
              setSelectedPage(1)
            }}
            variant="contained"
          >Policy Type Details</Button>
          <Button
            disabled={selectedPage === 2}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 2 ? grey[500] : grey[700],
              "&:hover": {
                background: grey[800],
              }
            }}
            onClick={() => {
              setSelectedPage(2)
            }}
            variant="contained"
          >Policy Premium</Button>
        </div>
      </div>
      {policyType === 'REG' ? <COMRegular ref={regularPolicyRef} selectedPage={selectedPage} /> : <COMTemporary selectedPage={selectedPage} />}
    </>
  )
}
const COMRegular = forwardRef(({
  selectedPage
}: any, ref) => {
  const { user, myAxios } = useContext(AuthContext)

  const _policyInformationRef = useRef<any>(null)
  const _policyTypeDetailsRef = useRef<any>(null)
  const _policyPremiumRef = useRef<any>(null)


  const {
    UpwardTableModalSearch: ClientUpwardTableModalSearch,
    openModal: clientOpenModal,
    closeModal: clientCloseModal
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
        hide: true
      },
      {
        key: "sale_officer",
        label: "Sale Officer",
        width: 90,
        hide: true
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (_policyInformationRef.current.getRefs().clientIDRef.current) {
          _policyInformationRef.current.getRefs().clientIDRef.current.value = rowItm[0]
        }
        if (_policyInformationRef.current.getRefs().clientNameRef.current) {
          _policyInformationRef.current.getRefs().clientNameRef.current.value = rowItm[1]
        }
        if (_policyInformationRef.current.getRefs().clientAddressRef.current) {
          _policyInformationRef.current.getRefs().clientAddressRef.current.value = rowItm[3]
        }
        if (_policyInformationRef.current.getRefs().saleOfficerRef.current) {
          _policyInformationRef.current.getRefs().saleOfficerRef.current.value = rowItm[4]
        }
        clientCloseModal()
      }
    }
  })
  const {
    UpwardTableModalSearch: AgentUpwardTableModalSearch,
    openModal: agentOpenModal,
    closeModal: agentCloseModal
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/production/search-agent-by-id-or-name",
    column: [
      { key: "IDNo", label: "ID No", width: 120 },
      { key: "Name", label: "Name", width: 200 },
      {
        key: "IDType",
        label: "ID Type",
        width: 90,
      }
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        console.log(rowItm)
        if (_policyInformationRef.current.getRefs().agentIdRef.current) {
          _policyInformationRef.current.getRefs().agentIdRef.current.value = rowItm[0]
        }
        if (_policyInformationRef.current.getRefs().agentNameRef.current) {
          _policyInformationRef.current.getRefs().agentNameRef.current.value = rowItm[1]
        }

        agentCloseModal()
      }
    }
  })

  const {
    mutate: mutatateAccount,
    isLoading: isLoadingAccount
  } = useMutation({
    mutationKey: "account",
    mutationFn: (variables: any) => {
      return myAxios.post('/task/production/account', variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyInformationRef.current.getRefs()._accountRef.current.setDataSource(response.data?.data)
      })
    },
  })
  const {
    mutate: mutatateMortgagee,
    isLoading: isLoadingMortgagee
  } = useMutation({
    mutationKey: "account",
    mutationFn: (variables: any) => {
      return myAxios.post('/task/production/mortgagee', variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyPremiumRef.current.getRefs().mortgageeSelect_.current.setDataSource(response.data?.data)
      })
    },
  })
  const {
    mutate: mutatateDenomination,
    isLoading: isLoadingDenomination
  } = useMutation({
    mutationKey: "denomination",
    mutationFn: (variables: any) => {
      return myAxios.post('/task/production/denomination', variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyTypeDetailsRef.current.getRefs()._dinomination.current.setDataSource(response.data?.data)
      })
    },
  })

  const {
    mutate: mutatateSave,
    isLoading: isLoadingSave
  } = useMutation({
    mutationKey: "denomination",
    mutationFn: (variables: any) => {
      return myAxios.post('/task/production/save', variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      })
    },
    onSuccess(response) {
      wait(100).then(() => {
        _policyTypeDetailsRef.current.getRefs()._dinomination.current.setDataSource(response.data?.data)
      })
    },
  })
  useImperativeHandle(ref, () => ({
    handleOnSave: () => {
      const data = {
        ..._policyInformationRef.current.getRefsValue(),
        ..._policyTypeDetailsRef.current.getRefsValue(),
        ..._policyPremiumRef.current.getRefsValue(),
      }
      mutatateSave(data)
    },
  }))
  useEffect(() => {
    mutatateAccount({ policy: window.localStorage.getItem('__policy__') })
    mutatateMortgagee({ policy: window.localStorage.getItem('__policy__') })
    mutatateDenomination({ policy: window.localStorage.getItem('__policy__') })
  }, [])
  function computation() {
    const insuredValue = parseFloat(_policyTypeDetailsRef.current.getRefs().estimatedValueSchedVehicleRef.current?.value.replace(/,/g, "") || 0);
    const aircon = parseFloat(_policyTypeDetailsRef.current.getRefs().airconRef.current?.value.replace(/,/g, "") || 0);
    const stereo = parseFloat(_policyTypeDetailsRef.current.getRefs().stereoRef.current?.value.replace(/,/g, "") || 0);
    const magwheels = parseFloat(_policyTypeDetailsRef.current.getRefs().magwheelsRef.current?.value.replace(/,/g, "") || 0);
    const others = parseFloat(_policyTypeDetailsRef.current.getRefs().othersSpecifyRef_.current?.value.replace(/,/g, "") || 0);

    const secIII = parseFloat(_policyPremiumRef.current.getRefs().sectionIIIRef.current?.value.replace(/,/g, "") || 0);
    const premiumPaid = parseFloat(_policyTypeDetailsRef.current.getRefs().premiumPaidRef.current?.value.replace(/,/g, "") || 0);
    const theft = parseFloat(_policyPremiumRef.current.getRefs().theftRef.current?.value.replace(/,/g, "") || 0);
    const secIVA = parseFloat(_policyPremiumRef.current.getRefs().sectionIVARef.current?.value.replace(/,/g, "") || 0);
    const secIVB = parseFloat(_policyPremiumRef.current.getRefs().sectionIVBRef.current?.value.replace(/,/g, "") || 0);
    const other = parseFloat(_policyPremiumRef.current.getRefs().othersRef.current?.value || 0);
    const aog = parseFloat(_policyPremiumRef.current.getRefs().aogRef.current?.value.replace(/,/g, "") || 0);
    const stradCom = parseFloat(_policyPremiumRef.current.getRefs().stradComRef.current?.value.replace(/,/g, "") || 0);

    const localGovTax = parseFloat(_policyPremiumRef.current.getRefs().localGovTaxRef.current?.value.replace(/,/g, "") || 0);

    // Calculate Insured
    const insured =
      insuredValue + aircon + stereo + magwheels + others;
    // Calculate Own Damage
    const ownDamage = insured * (secIII / 100);

    const newAog = (aog / 100) * insuredValue
    // Calculate Premium
    const premium =
      premiumPaid +
      ownDamage +
      theft +
      secIVA +
      secIVB +
      other +
      newAog;
    // aog;


    const vat = premium * 0.12;
    // Calculate Doc Stamp
    const docStamp = premium * 0.125;

    // Calculate Local Government Tax
    const locGovTax = premium * (localGovTax / 100);

    // Calculate StradCom
    const stradComValue = stradCom;

    const totalDue =
      premium +
      vat +
      docStamp +
      locGovTax +
      stradComValue;

    if (_policyPremiumRef.current.getRefs()._aogRef.current) {
      _policyPremiumRef.current.getRefs()._aogRef.current.value =
        newAog.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
      _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
        premiumPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
      _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
        premiumPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().ownDamageRef.current) {
      _policyPremiumRef.current.getRefs().ownDamageRef.current.value =
        ownDamage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
      _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
        premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().vatRef.current) {
      _policyPremiumRef.current.getRefs().vatRef.current.value =
        vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().docstampRef.current) {
      _policyPremiumRef.current.getRefs().docstampRef.current.value =
        docStamp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
      _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
        locGovTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().stradComRef.current) {
      _policyPremiumRef.current.getRefs().stradComRef.current.value =
        stradComValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
      _policyPremiumRef.current.getRefs().totalDueRef.current.value =
        totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }



  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
        padding: "5px"
      }}
    >
      {(isLoadingAccount || isLoadingMortgagee || isLoadingDenomination || isLoadingSave) && <Loading />}
      <ClientUpwardTableModalSearch />
      <AgentUpwardTableModalSearch />
      <div style={{
        display: selectedPage === 0 ? "flex" : "none",
        flex: 1,
        height: "100%",
      }}>
        <_PolicyInformation
          ref={_policyInformationRef}
          clientSearch={(input: string) => {
            clientOpenModal(input)
          }}
          agentSearch={(input: string) => {
            agentOpenModal(input)
          }}
          onChangeAccount={(e: any) => {
            mutatateDenomination({ policy: window.localStorage.getItem('__policy__'), account: e.target.value })
          }}
        />
      </div>
      <div style={{
        display: selectedPage === 1 ? "flex" : "none",
        flex: 1,
        height: "100%",
      }}>
        <_PolicyTypeDetails
          ref={_policyTypeDetailsRef}
        />
      </div>
      <div style={{
        display: selectedPage === 2 ? "flex" : "none",
        flex: 1,
        height: "100%",
      }}>
        <_PolicyPremium
          ref={_policyPremiumRef}
          onComputation={() => {
            computation()
          }}
        />
      </div>

    </div>
  )
})


function COMTemporary({ }: any) {

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        border: "1px solid red",
        height: "100%",
        padding: "5px"
      }}
    >
      COMTemporary
    </div>
  )
}

function TPLPolicy({
  user,
  policy,
  setPolicy,
  _policy
}: any) {
  const searchRef = useRef<HTMLInputElement>(null)

  return (

    <>
      <div style={{ display: "flex", columnGap: "8px", alignItems: "center" }}>
        {user?.department === 'UMIS' && <SelectInput
          ref={_policy}
          label={{
            title: "Policy: ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "50px",
            },
          }}
          select={{
            style: { width: "70px", height: "20px" },
            value: policy,
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === 'Enter') {
                e.preventDefault()
              }
            },
            onChange: (e) => {
              setPolicy(e.currentTarget.value)
            }
          }}
          datasource={[]}
          values={"key"}
          display={"key"}
        />}
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
                // openModalSearchCollection(e.currentTarget.value);
              }
            },
            style: { width: "100%", height: "22px" },
          }}

          icon={<SearchIcon sx={{ fontSize: "18px" }} />}
          onIconClick={(e) => {
            e.preventDefault()
            alert('qwe')
            // if (searchRef.current)
            // openModalSearchCollection(searchRef.current.value);
          }}
          inputRef={searchRef}
        />
        <IconButton size="small" color="primary">
          <AddBoxIcon />
        </IconButton>
        <IconButton size="small" >
          <SaveAsIcon color="success" />
        </IconButton>
        <IconButton size="small" >
          <CloseIcon color="error" />
        </IconButton>
      </div>
      <div>TPL</div>
    </>
  )
}

const _PolicyInformation = forwardRef((props: any, ref) => {
  // Insurer Information
  const clientIDRef = useRef<HTMLInputElement>(null)
  const clientNameRef = useRef<HTMLInputElement>(null)
  const clientAddressRef = useRef<HTMLTextAreaElement>(null)

  // Insurer Information
  const agentIdRef = useRef<HTMLInputElement>(null)
  const agentNameRef = useRef<HTMLInputElement>(null)
  const agentCommisionRef = useRef<HTMLInputElement>(null)
  const saleOfficerRef = useRef<HTMLInputElement>(null)

  // Vehicle Policy
  const _accountRef = useRef<any>(null)
  const accountRef = useRef<HTMLSelectElement>(null)
  const policyNoRef = useRef<HTMLInputElement>(null)
  const corNoRef = useRef<HTMLInputElement>(null)
  const orNoRef = useRef<HTMLInputElement>(null)

  // Period of Insurance
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)
  const dateIssuedRef = useRef<HTMLInputElement>(null)

  // Insured Unit
  const modelRef = useRef<HTMLInputElement>(null)
  const plateNoRef = useRef<HTMLInputElement>(null)
  const makeRef = useRef<HTMLInputElement>(null)
  const chassisNoRef = useRef<HTMLInputElement>(null)
  const typeOfBodyRef = useRef<HTMLInputElement>(null)
  const motorNoRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)
  const authorizedCapacityRef = useRef<HTMLInputElement>(null)
  const bltFileNoRef = useRef<HTMLInputElement>(null)
  const unladenWeightRef = useRef<HTMLInputElement>(null)

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
        corNoRef: corNoRef.current?.value,
        orNoRef: orNoRef.current?.value,
        dateFromRef: dateFromRef.current?.value,
        dateToRef: dateToRef.current?.value,
        dateIssuedRef: dateIssuedRef.current?.value,
        modelRef: modelRef.current?.value,
        plateNoRef: plateNoRef.current?.value,
        makeRef: makeRef.current?.value,
        chassisNoRef: chassisNoRef.current?.value,
        typeOfBodyRef: typeOfBodyRef.current?.value,
        motorNoRef: motorNoRef.current?.value,
        colorRef: colorRef.current?.value,
        authorizedCapacityRef: authorizedCapacityRef.current?.value,
        bltFileNoRef: bltFileNoRef.current?.value,
        unladenWeightRef: unladenWeightRef.current?.value
      }
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
        corNoRef,
        orNoRef,
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        modelRef,
        plateNoRef,
        makeRef,
        chassisNoRef,
        typeOfBodyRef,
        motorNoRef,
        colorRef,
        authorizedCapacityRef,
        bltFileNoRef,
        unladenWeightRef,
        _accountRef
      }
    }
  }))

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      marginTop: "10px",
      rowGap: "20px"
    }}>
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
            rowGap: "5px"
          }}>
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Insurer Information</span>
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
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  props.clientSearch(e.currentTarget.value)
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault()
              props.clientSearch(clientIDRef.current?.value)
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
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
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
              rows: 3,
              style: { flex: 1 },
              defaultValue: "",
              onChange: (e) => {
              },
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
            rowGap: "5px"
          }}>
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Agent Information</span>
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
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  props.agentSearch(e.currentTarget.value)

                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault()
              props.agentSearch(agentIdRef.current?.value)

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
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
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
              width: "50%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
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
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
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
          columnGap: "15px"
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
            rowGap: "5px"
          }}>
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Vehicle Policy</span>
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
              style: { flex: 1, height: "22px" },
              defaultValue: "",
              onChange: props.onChangeAccount
            }}
            containerStyle={{
              width: "90%",
              marginBottom: "12px"
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
              title: "Policy No:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
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
              title: "Certificate of Cover No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={corNoRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Official Receipt No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={orNoRef}
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
            rowGap: "5px"
          }}>
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Period of Insurance</span>
          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px"
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
              type: 'date',
              defaultValue: format(new Date(), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={dateFromRef}
          />
          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px"
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
              type: 'date',
              defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={dateToRef}
          />
          <TextInput
            containerStyle={{
              width: "50%",
              marginBottom: "8px"
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
              type: 'date',
              defaultValue: format(new Date(), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={dateIssuedRef}
          />
        </div>
      </div>
      {/* Last Field*/}
      {/* Insured Unit*/}
      <div style={{
        width: "100%",
        border: "1px solid #9ca3af",
        boxSizing: "border-box",
        padding: "10px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        rowGap: "5px"
      }}>
        <span
          style={{
            position: "absolute",
            top: "-12px",
            left: "20px",
            fontSize: "14px",
            background: "#F1F1F1",
            padding: "0 2px",
            fontWeight: "bold"

          }}
        >Insured Unit</span>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextInput
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Model:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={modelRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Make:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={plateNoRef}
          />
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextInput
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Make:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={makeRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Chassis No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={chassisNoRef}
          />
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextInput
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Type of Body:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={typeOfBodyRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Motor No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={motorNoRef}
          />
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextInput
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Color:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={colorRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Authorized Capacity:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={authorizedCapacityRef}
          />
        </div>
        <div style={{ display: "flex", columnGap: "100px" }}>
          <TextInput
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "BLT File No:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}
            inputRef={bltFileNoRef}
          />
          <TextInput
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Unladen Weight:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              },
            }}

            inputRef={unladenWeightRef}
          />
        </div>
      </div>
    </div>
  )
})
const _PolicyTypeDetails = forwardRef((props: any, ref) => {
  const policy = window.localStorage.getItem('__policy__')
  const premiumPaidRef = useRef<HTMLInputElement>(null)
  const estimatedValueSchedVehicleRef = useRef<HTMLInputElement>(null)
  const airconRef = useRef<HTMLInputElement>(null)
  const stereoRef = useRef<HTMLInputElement>(null)
  const magwheelsRef = useRef<HTMLInputElement>(null)
  const othersSpecifyRef = useRef<HTMLInputElement>(null)
  const othersSpecifyRef_ = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)
  const _typeRef = useRef<any>(null)
  const DeductibleRef = useRef<HTMLInputElement>(null)
  const towingRef = useRef<HTMLInputElement>(null)
  const authorizedRepairLimitRef = useRef<HTMLInputElement>(null)
  const bodyInjuryRef = useRef<HTMLInputElement>(null);
  const propertyDamageRef = useRef<HTMLInputElement>(null);
  const personalAccidentRef = useRef<HTMLInputElement>(null);
  const dinomination = useRef<HTMLSelectElement>(null)
  const _dinomination = useRef<any>(null)


  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        premiumPaidRef: premiumPaidRef.current?.value,
        estimatedValueSchedVehicleRef: estimatedValueSchedVehicleRef.current?.value,
        airconRef: airconRef.current?.value,
        stereoRef: stereoRef.current?.value,
        magwheelsRef: magwheelsRef.current?.value,
        othersSpecifyRef: othersSpecifyRef.current?.value,
        othersSpecifyRef_: othersSpecifyRef_.current?.value,
        typeRef: typeRef.current?.value,
        DeductibleRef: DeductibleRef.current?.value,
        towingRef: towingRef.current?.value,
        authorizedRepairLimitRef: authorizedRepairLimitRef.current?.value,
        bodyInjuryRef: bodyInjuryRef.current?.value,
        propertyDamageRef: propertyDamageRef.current?.value,
        personalAccidentRef: personalAccidentRef.current?.value,
        dinomination: dinomination.current?.value
      }
    },
    getRefs: () => {
      return {
        premiumPaidRef,
        estimatedValueSchedVehicleRef,
        airconRef,
        stereoRef,
        magwheelsRef,
        othersSpecifyRef,
        othersSpecifyRef_,
        typeRef,
        DeductibleRef,
        towingRef,
        authorizedRepairLimitRef,
        bodyInjuryRef,
        propertyDamageRef,
        personalAccidentRef,
        dinomination,
        _dinomination
      }
    },

  }))

  const isDisableTPL = policy !== 'COM'


  return (
    <div style={{
      display: "flex",
      flex: 1,
      width: "100%",
      justifyContent: "center",
      boxSizing: "border-box"
    }}>
      <div
        style={{
          border: "1px solid #9ca3af",
          height: "100%",
          width: "70%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          rowGap: "20px",
          boxSizing: "border-box"
        }}
      >
        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <input disabled={!isDisableTPL} type="checkbox" id="tpl" defaultChecked={policy === 'TPL'} />
          <label htmlFor="tpl"
            style={{
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: !isDisableTPL ? "300" : "bold"
            }}
          >THIRD PARTY LIABILITY</label>
        </div>

        <div style={{
          height: "auto",
          display: "flex",
          border: "1px solid #9ca3af",
          padding: "10px",
          columnGap: "20px",
          position: "relative"
        }}>
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "20px",
              fontSize: "12px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Section I/II</span>
          <SelectInput

            ref={_typeRef}
            label={{
              title: "Type :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "40px",
              },
            }}
            selectRef={typeRef}
            select={{
              disabled: !isDisableTPL,
              style: { flex: 1, height: "22px" },
              defaultValue: "",
              onChange: (e) => {
              }

            }}
            containerStyle={{
              flex: 2
            }}
            datasource={[
              { key: `` },
              { key: `LIGHT PRIVATE VEHICLE(1YR)` },
              { key: `MEDIUM PRIVATE VEHICLE(1YR)` },
              { key: `HEAVY PRIVATE VEHICLE(1YR)` },
              { key: `MC/TC - MOTORCYCLE/TRICYCLE(1YR)` },
              { key: `LIGHT PRIVATE VEHICLE(3YR)` },
              { key: `MEDIUM PRIVATE VEHICLE(3YR)` },
              { key: `HEAVY PRIVATE VEHICLE(3YR)` },
              { key: `MC/TC - MOTORCYCLE/TRICYCLE(3YR)` },
            ]}
            values={"key"}
            display={"key"}
          />
          <TextFormatedInput
            label={{
              title: "Premium Paid:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              flex: 1
            }}
            input={{
              disabled: !isDisableTPL,
              defaultValue: "0.00",
              type: "text",
              style: { width: "100%" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={premiumPaidRef}
          />
        </div>

        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <input type="checkbox" id="compre" defaultChecked={policy === 'COM'} />
          <label htmlFor="compre" style={{ fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}>COMPREHENSIVE</label>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            border: "1px solid #9ca3af",
            padding: "8px",
            position: "relative"
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "20px",
              fontSize: "12px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold"

            }}
          >Section III/IV</span>

          <div
            style={{
              width: "50%",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px"
            }}>

            <TextFormatedInput
              onBlur={(e) => {
                let insuredValue = parseFloat(e.currentTarget.value.replace(/,/g, ""));
                if (isNaN(insuredValue)) insuredValue = 0;

                const deductible = insuredValue * 0.01;
                if (DeductibleRef.current) {
                  console.log(DeductibleRef)
                  DeductibleRef.current.value = deductible.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
              }}
              label={{
                title: "Estimated Value of Schedule Vehicle:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%"
              }}
              input={{
                disabled: isDisableTPL,
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                },

              }}
              inputRef={estimatedValueSchedVehicleRef}
            />
            <TextFormatedInput
              label={{
                title: "Aircon:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%"
              }}
              input={{
                disabled: isDisableTPL,

                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={airconRef}
            />
            <TextFormatedInput
              label={{

                title: "Stereo:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%"
              }}
              input={{
                disabled: isDisableTPL,

                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={stereoRef}
            />
            <TextFormatedInput
              label={{

                title: "Magwheels:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%"
              }}
              input={{
                disabled: isDisableTPL,

                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={magwheelsRef}
            />
          </div>
          <div style={{
            width: "65%",
            height: "auto",
            display: "flex",
            columnGap: "5px",
            marginTop: "5px"
          }}>

            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Others (Specify) :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              input={{
                disabled: isDisableTPL,

                type: "text",
                style: { width: "calc(100% - 120px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                },
              }}
              inputRef={othersSpecifyRef}
            />
            <TextFormatedInput
              label={{
                title: "Magwheels:",
                style: {
                  display: "none"
                },
              }}
              containerStyle={{
                width: "53%"
              }}
              input={{
                disabled: isDisableTPL,

                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={othersSpecifyRef_}
            />
          </div>
          <div
            style={{
              width: "65%",
              height: "auto",
              display: "flex",
              columnGap: "5px",
              marginTop: "5px",
            }}
          >
            <SelectInput
              ref={_typeRef}
              label={{
                title: "Type :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              selectRef={typeRef}
              select={{
                disabled: isDisableTPL,
                style: { flex: 1, height: "22px" },
                defaultValue: "",
                onChange: (e) => {
                }

              }}
              containerStyle={{
                width: "100%",
              }}
              datasource={[
                { key: `` },
                { key: `PRIVATE VEHICLE` },
                { key: `LIGHT AND MEDIUM VEHICLE` },
                { key: `HEAVY VEHICLE` },
                { key: `MC/TC - MOTORCYCLE/TRICYCLE` },
              ]}
              values={"key"}
              display={"key"}
            />
          </div>
          <div
            style={{
              width: "100%",
              height: "auto",
              display: "flex",
              columnGap: "5px",
              marginTop: "5px",
              padding: "5px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                flex: 1,
                border: "1px solid #9ca3af",
                padding: "8px"
              }}
            >
              <TextFormatedInput
                label={{
                  title: "Deductible:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  disabled: isDisableTPL,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    }
                  }
                }}
                inputRef={DeductibleRef}
              />
              <TextFormatedInput
                label={{
                  title: "Towing:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  disabled: isDisableTPL,

                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    }
                  }
                }}
                inputRef={towingRef}
              />
              <TextFormatedInput
                label={{
                  title: "Authorized Repair Limit:",
                  style: {

                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  disabled: isDisableTPL,
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                    }
                  }
                }}
                inputRef={authorizedRepairLimitRef}
              />

            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                flex: 1,
                border: "1px solid #9ca3af",
                padding: "8px"
              }}
            >
              <Autocomplete
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Bodily Injury: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  }
                }}
                DisplayMember={'key'}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={bodyInjuryRef}
                input={{
                  disabled: isDisableTPL,
                  style: {
                    width: "100%",
                    flex: 1,
                  }
                }}
                onChange={(selected: any, e: any) => {
                  if (bodyInjuryRef.current) {
                    bodyInjuryRef.current.value = selected.key
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === 'NumpadEnter') {
                    e.preventDefault()
                  }
                }}
              />
              <Autocomplete
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Property Damage: ",
                  style: {

                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  }
                }}
                DisplayMember={'key'}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={propertyDamageRef}
                input={{
                  disabled: isDisableTPL,
                  style: {
                    width: "100%",
                    flex: 1,
                  }
                }}
                onChange={(selected: any, e: any) => {
                  if (propertyDamageRef.current) {
                    propertyDamageRef.current.value = selected.key
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === 'NumpadEnter') {
                    e.preventDefault()
                  }
                }}
              />
              <Autocomplete
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Personal Accident: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  }
                }}
                DisplayMember={'key'}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={personalAccidentRef}
                input={{
                  disabled: isDisableTPL,
                  style: {
                    width: "100%",
                    flex: 1,
                  }
                }}
                onChange={(selected: any, e: any) => {
                  if (personalAccidentRef.current) {
                    personalAccidentRef.current.value = selected.key
                  }

                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === 'NumpadEnter') {
                    e.preventDefault()
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, width: "100%" }}>
          <SelectInput
            ref={_dinomination}
            label={{
              title: "Donomination :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "120px",
              },
            }}
            selectRef={dinomination}
            select={{
              disabled: isDisableTPL,
              style: { flex: 1, height: "22px" },
              defaultValue: "",

            }}
            containerStyle={{
              width: "400px",
            }}
            datasource={[]}
            values={"Type"}
            display={"Type"}
          />
        </div>
      </div>


    </div>
  )
})

const _PolicyPremium = forwardRef((props: any, ref) => {
  const mortgageecheckRef = useRef<HTMLInputElement>(null)
  const mortgageeSelect_ = useRef<any>(null)
  const mortgageeSelect = useRef<HTMLSelectElement>(null)
  const formIndorsementRef = useRef<HTMLTextAreaElement>(null)

  //Premiums
  const sectionI_IIRef = useRef<HTMLInputElement>(null)
  const sectionIIIRef = useRef<HTMLInputElement>(null)
  const ownDamageRef = useRef<HTMLInputElement>(null)
  const theftRef = useRef<HTMLInputElement>(null)
  const sectionIVARef = useRef<HTMLInputElement>(null)
  const sectionIVBRef = useRef<HTMLInputElement>(null)
  const othersRef = useRef<HTMLInputElement>(null)
  const aogRef = useRef<HTMLInputElement>(null)
  const _aogRef = useRef<HTMLInputElement>(null)
  const totalPremiumRef = useRef<HTMLInputElement>(null)
  const vatRef = useRef<HTMLInputElement>(null)
  const docstampRef = useRef<HTMLInputElement>(null)
  const localGovTaxRef = useRef<HTMLInputElement>(null)
  const _localGovTaxRef = useRef<HTMLInputElement>(null)
  const stradComRef = useRef<HTMLInputElement>(null)
  const totalDueRef = useRef<HTMLInputElement>(null)


  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        mortgageeSelect: mortgageeSelect.current?.value,
        formIndorsementRef: formIndorsementRef.current?.value,
        sectionI_IIRef: sectionI_IIRef.current?.value,
        sectionIIIRef: sectionIIIRef.current?.value,
        ownDamageRef: ownDamageRef.current?.value,
        theftRef: theftRef.current?.value,
        sectionIVARef: sectionIVARef.current?.value,
        sectionIVBRef: sectionIVBRef.current?.value,
        othersRef: othersRef.current?.value,
        aogRef: aogRef.current?.value,
        _aogRef: _aogRef.current?.value,
        totalPremiumRef: totalPremiumRef.current?.value,
        vatRef: vatRef.current?.value,
        docstampRef: docstampRef.current?.value,
        localGovTaxRef: localGovTaxRef.current?.value,
        _localGovTaxRef: _localGovTaxRef.current?.value,
        stradComRef: stradComRef.current?.value,
        totalDueRef: totalDueRef.current?.value,
      }
    },
    getRefs: () => {
      return {
        mortgageeSelect_,
        mortgageeSelect,
        formIndorsementRef,
        sectionI_IIRef,
        sectionIIIRef,
        ownDamageRef,
        theftRef,
        sectionIVARef,
        sectionIVBRef,
        othersRef,
        aogRef,
        _aogRef,
        totalPremiumRef,
        vatRef,
        docstampRef,
        localGovTaxRef,
        _localGovTaxRef,
        stradComRef,
        totalDueRef,
      }
    },

  }))

  function setFormIndorseValue(check: boolean) {
    if (check) {
      if (formIndorsementRef.current) {
        formIndorsementRef.current.value = "LOSS and/or DAMAGE, if any under this policy shall be payable to " + mortgageeSelect.current?.value + " as their interest may appear subject to all terms and conditions, clauses and warranties of this policy. SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING; PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVE CLAUSE THIS POLICY OR ANY RENEWAL THEREOF SHALL NOT BE CANCELLED WITHOUT PRIOR WRITTEN NOTIFICATION AND CONFORMIY TO " + mortgageeSelect.current?.value
      }
    } else {
      if (formIndorsementRef.current) {
        formIndorsementRef.current.value = "SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE"
      }
    }

  }

  return (
    <div style={{
      display: "flex",
      flex: 1,
      width: "100%",
      justifyContent: "center",
      boxSizing: "border-box"
    }}>
      <div
        style={{
          border: "1px solid #9ca3af",
          height: "100%",
          width: "65%",
          padding: "15px",
          display: "flex",
          rowGap: "20px",
          boxSizing: "border-box",
          columnGap: "10px"
        }}
      >
        {/* first layer */}
        <div
          style={{
            border: "1px solid #9ca3af",
            width: "60%",
            display: "flex",
            padding: "10px",
            position: "relative"
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
              fontWeight: "bold"

            }}
          >Mortgagee</span>
          {/* firt layer */}
          <div style={{
            width: '140px',
            display: "flex",
            flexDirection: "column",
            rowGap: '10px',
            padding: "5px",

          }}>
            <div style={{ width: "100%", display: "flex", alignItems: "center", columnGap: "10px" }}>
              <input ref={mortgageecheckRef} type="checkbox" id="mortgagee" onChange={(e) => {
                setFormIndorseValue(e.target.checked)

              }} />
              <label htmlFor="mortgagee"
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >Mortgagee:</label>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>Form and</span>
            <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: "5px" }}>Endorsement :</span>
          </div>
          {/* second layer */}
          <div style={{
            flex: 1,
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            rowGap: '10px'

          }}>
            <SelectInput
              ref={mortgageeSelect_}
              label={{
                style: {
                  display: "none"
                },
              }}
              selectRef={mortgageeSelect}
              select={{
                style: { width: "100%", height: "22px" },
                defaultValue: "",
                onChange: (e) => {
                  if (mortgageecheckRef.current)
                    setFormIndorseValue(mortgageecheckRef.current.checked)
                }

              }}
              containerStyle={{
                width: "100%",
              }}
              datasource={[]}
              values={"Mortgagee"}
              display={"Mortgagee"}
            />
            <TextAreaInput

              label={{
                title: "Address",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                  display: "none"
                },
              }}
              textarea={{
                rows: 25,
                style: { flex: 1 },
                defaultValue: `SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE`,
                onChange: (e) => {
                },
              }}
              _inputRef={formIndorsementRef}
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
            boxSizing: "border-box"

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
          >Premiums</span>
          <TextFormatedInput
            label={{
              title: "Section I/II:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={sectionI_IIRef}
          />
          <div style={{
            display: "flex",
            columnGap: "10px",
            height: "22px"
          }}>
            <TextFormatedInput
              label={{
                title: "Section III(%):",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "100%"
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={sectionIIIRef}
            />
            <div style={{
              height: "100%",
              width: "50px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <IconButton size="small" color="info" onClick={props.onComputation}>
                <CalculateIcon />
              </IconButton>
            </div>

          </div>
          <TextFormatedInput
            label={{
              title: "Own Damage:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={ownDamageRef}
          />
          <TextFormatedInput
            label={{
              title: "Theft:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={theftRef}
          />
          <TextFormatedInput
            label={{
              title: "Section IV-A:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={sectionIVARef}
          />
          <TextFormatedInput
            label={{
              title: "Section IV-B:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={sectionIVBRef}
          />
          <TextFormatedInput
            label={{
              title: "Others:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={othersRef}
          />
          <div style={{
            display: "flex",
            columnGap: "10px",
            height: "22px",
            width: "100%",
          }}>
            <TextFormatedInput
              label={{
                title: "AOG",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "70%"
              }}
              input={{
                defaultValue: "0.5",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={aogRef}
            />
            <TextFormatedInput
              label={{
                title: "",
                style: {
                  display: "none"
                },
              }}
              containerStyle={{
                width: "30%"
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={_aogRef}
            />

          </div>
          <div style={{ width: "100%", border: "1px dashed black", margin: "5px 0px" }}></div>
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
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
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
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
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
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={docstampRef}
          />
          <div style={{
            display: "flex",
            columnGap: "10px",
            height: "22px",
            width: "100%",
          }}>
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
                width: "70%"
              }}
              input={{
                defaultValue: "0.75",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={localGovTaxRef}
            />
            <TextFormatedInput
              label={{
                title: "",
                style: {
                  display: "none"
                },
              }}
              containerStyle={{
                width: "30%"
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  }
                }
              }}
              inputRef={_localGovTaxRef}
            />
          </div>
          <TextFormatedInput
            label={{
              title: "StradCom:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={stradComRef}
          />
          <div style={{ width: "100%", border: "1px dashed black", margin: "5px 0px" }}></div>
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
              width: "100%"
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                }
              }
            }}
            inputRef={totalDueRef}
          />
        </div>
      </div>
    </div>
  )
})


interface CustomButtonProps {
  currentStepIndex: number;
  index: number;
}
export const CustomButton = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  font-size: 17px;
  color:${(props: CustomButtonProps) => {
    return props.currentStepIndex === props.index ? "#0284c7;" : "#020617;";
  }}
  padding: 0;
  &:hover  {
    color: #64748b;
    background:white;
  },
`;
const initialState = {
  form_action: "REG",
  form_type: "COM",
  sub_account: "HO",
  //insurer info
  client_id: "",
  client_name: "",
  client_address: "",
  //agent info
  agent_id: "",
  agent_name: "",
  agent_com: "0.00",
  sale_officer: "",
  //Vehicle policy
  PolicyAccount: "",
  PolicyNo: "",
  CCN: "",
  ORN: "",
  rateCost: "",
  //Period Insurance
  DateFrom: new Date(),
  DateTo: addYears(new Date(), 1),
  DateIssued: new Date(),
  //Insured Unit
  Model: "",
  Make: "",
  TB: "",
  Color: "",
  BLTFileNo: "",
  PlateNo: "",
  ChassisNo: "",
  MotorNo: "",
  AuthorizedCapacity: "",
  UnladenWeigth: "",

  //==========================
  //tpl
  TplType: "",
  PremiumPaid: "",
  //compre
  EVSV: "",
  Aircon: "",
  Stereo: "",
  Magwheels: "",
  OthersRate: "",
  OthersDesc: "",
  CompreType: "",

  Deductible: "",
  Towing: "",
  ARL: "",
  BodyInjury: "0.00",
  PropertyDamage: "0.00",
  PersinalAccident: "0.00",
  Denomination: "",

  //==========================
  //mortgage
  Mortgagee: "",
  MortgageeForm: "false",
  remarks: "",
  //Premiums
  SectionI_II: "",
  SectionIII: "",
  OwnDamage: "",
  Theft: "",
  SectionIVA: "",
  SectionIVB: "",
  PremiumOther: "",
  AOG: "",
  AOGPercent: "0.5",
  TotalPremium: "",
  Vat: "",
  DocStamp: "",
  LocalGovTaxPercent: "0.75",
  LocalGovTax: "",
  StradCom: "",
  TotalDue: "",
  Type: "charles1",
  Source_No_Ref_ID: "",
  vehicle: "private",

  // extra
  mode: "",
};

const initialSummaryState = {
  PolicyNo: "",
  PolicyType: "",
  DateIssued: "",
  Account: " ",
  Mortgagee: "",
  agent_fullname: "",
  sale_officer: "",
  TotalDue: "",
  IDNo: "",
  ShortName: "",
  address: "",
  options: "",
  subShortName: "",
  email: "",
  mobile: "",
  telephone: "",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      const newState = {
        ...state,
        [action.field]: action.value,
      };
      return newState;
    default:
      return state;
  }
};
export const VehicleContext = createContext<any>({});
const queryKeySearch = "vehicle-policy-search";
const queryKeyUpdateAdd = "vehicle-policy-search";
const queryKeyGet = "vehicle-policy-get";
const querySearchPolicyIds = "vehicle-policy-search-ppolicy-id";
export const vpolicyColumn = [
  { field: "_DateIssued", headerName: "Date", width: 200 },
  { field: "PolicyNo", headerName: "Policy No", width: 170 },
  {
    field: "Account",
    headerName: "Account",
    width: 170,
  },
  {
    field: "client_fullname",
    headerName: "Full Name",
    flex: 1,
  },
];
const vpolicyKey = "vehicle-policy";

// export default function VehiclePolicy() {
//   const [showClientDetails, setShowCLientDetails] = useState(false);
//   const [domination, setDomination] = useState([]);
//   const { step, goTo, currentStepIndex } = useMultipleComponent([
//     <PolicyInformation />,
//     <PolicyTypeDetails />,
//     <PolicyPremium />,
//   ]);
//   const [summaryState, summaryDispatch] = useReducer(
//     reducer,
//     initialSummaryState
//   );
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { myAxios, user } = useContext(AuthContext);
//   const [rows, setRows] = useState<GridRowSelectionModel>([]);
//   const [tplId, setTplId] = useState<GridRowSelectionModel>([]);
//   const [search, setSearch] = useState("");
//   const [searchShow, setSearchShow] = useState(false);
//   const [Mortgagee, setMortgagee] = useState(false);
//   const [showField, setShowField] = useState({
//     thirdparty: state.form_type.toLowerCase() === "tpl",
//     compre: state.form_type.toLowerCase() === "com",
//   });
//   const newButtonRef = useRef<HTMLButtonElement>(null);
//   const cancelButtonRef = useRef<HTMLButtonElement>(null);
//   const deleteButtonRef = useRef<HTMLButtonElement>(null);
//   const vPolicySearchInput = useRef<HTMLInputElement>(null);
//   const queryClient = useQueryClient();
//   const isAddOrEditMode = state.mode === "";

//   function onSearchSelected(selectedRowData: any) {
//     const {
//       address,
//       IDNo,
//       Account,
//       SubAcct,
//       PolicyNo,
//       DateIssued,
//       TotalPremium,
//       Vat,
//       DocStamp,
//       LGovTax,
//       Misc,
//       TotalDue,
//       AgentID,
//       AgentCom,
//       CoverNo,
//       ORNo,
//       DateFrom,
//       DateTo,
//       Model,
//       Make,
//       BodyType,
//       Color,
//       BLTFileNo,
//       PlateNo,
//       ChassisNo,
//       MotorNo,
//       AuthorizedCap,
//       UnladenWeight,
//       PremiumPaid,
//       EstimatedValue,
//       Aircon,
//       Stereo,
//       Magwheels,
//       Others,
//       OthersAmount,
//       Deductible,
//       Towing,
//       RepairLimit,
//       BodilyInjury,
//       PropertyDamage,
//       PersonalAccident,
//       SecI,
//       SecIIPercent,
//       ODamage,
//       Theft,
//       Sec4A,
//       Sec4B,
//       Sec4C,
//       AOG,
//       MortgageeForm,
//       Mortgagee,
//       Denomination,
//       client_fullname,
//       agent_fullname,
//       TPLTypeSection_I_II,
//       AOGPercent,
//       LocalGovTaxPercent,
//       Remarks,
//       sale_officer,
//     } = selectedRowData[0];

//     function formatTextNumber(input: string) {
//       const userInput = input.toString();
//       if (isNaN(parseFloat(userInput))) {
//         return "0.00";
//       }
//       var formattedNumber = parseFloat(
//         userInput.replace(/,/g, "")
//       ).toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       });

//       return formattedNumber;
//     }

//     function setFixValue(value: string) {
//       const intVal = parseFloat(value);
//       return intVal.toFixed(2);
//     }
//     function intToBoolean(value: string) {
//       const intVal = parseInt(value);
//       return intVal ? true : false;
//     }

//     handleDateChange(SubAcct, "sub_account");
//     handleDateChange(IDNo, "client_id");
//     handleDateChange(client_fullname, "client_name");
//     handleDateChange(address, "client_address");

//     handleDateChange(AgentID, "agent_id");
//     handleDateChange(agent_fullname, "agent_name");
//     handleDateChange(AgentCom, "agent_com");

//     handleDateChange(Account, "PolicyAccount");
//     handleDateChange(PolicyNo, "PolicyNo");
//     handleDateChange(CoverNo, "CCN");
//     handleDateChange(ORNo, "ORN");

//     handleDateChange(DateFrom, "DateFrom");
//     handleDateChange(DateTo, "DateTo");
//     handleDateChange(DateIssued, "DateIssued");

//     handleDateChange(Model, "Model");
//     handleDateChange(Make, "Make");
//     handleDateChange(BodyType, "TB");
//     handleDateChange(Color, "Color");
//     handleDateChange(BLTFileNo, "BLTFileNo");
//     handleDateChange(PlateNo, "PlateNo");
//     handleDateChange(ChassisNo, "ChassisNo");
//     handleDateChange(MotorNo, "MotorNo");
//     handleDateChange(AuthorizedCap, "AuthorizedCapacity");
//     handleDateChange(UnladenWeight, "UnladenWeigth");

//     handleDateChange(setFixValue(PremiumPaid), "PremiumPaid");
//     handleDateChange(setFixValue(EstimatedValue), "EVSV");
//     handleDateChange(setFixValue(Aircon), "Aircon");
//     handleDateChange(setFixValue(Stereo), "Stereo");
//     handleDateChange(setFixValue(Magwheels), "Magwheels");
//     handleDateChange(setFixValue(Aircon), "Aircon");
//     handleDateChange(setFixValue(OthersAmount), "OthersRate");
//     handleDateChange(Others, "OthersDesc");

//     handleDateChange(setFixValue(Deductible), "Deductible");
//     handleDateChange(setFixValue(Towing), "Towing");
//     handleDateChange(setFixValue(RepairLimit), "ARL");
//     handleDateChange(formatTextNumber(BodilyInjury), "BodyInjury");
//     handleDateChange(formatTextNumber(PropertyDamage), "PropertyDamage");
//     handleDateChange(formatTextNumber(PersonalAccident), "PersinalAccident");
//     handleDateChange(setFixValue(SecI), "SectionI_II");
//     handleDateChange(setFixValue(SecIIPercent), "SectionIII");
//     handleDateChange(setFixValue(ODamage), "OwnDamage");
//     handleDateChange(setFixValue(Theft), "Theft");
//     handleDateChange(setFixValue(Sec4A), "SectionIVA");
//     handleDateChange(setFixValue(Sec4B), "SectionIVB");
//     handleDateChange(setFixValue(Sec4C), "PremiumOther");
//     handleDateChange(setFixValue(AOG), "AOG");

//     handleDateChange(Mortgagee, "Mortgagee");
//     handleDateChange(intToBoolean(MortgageeForm), "MortgageeForm");
//     handleDateChange(Denomination, "Denomination");

//     handleDateChange(setFixValue(TotalDue), "TotalDue");
//     handleDateChange(setFixValue(Vat), "Vat");
//     handleDateChange(setFixValue(DocStamp), "DocStamp");
//     handleDateChange(setFixValue(TotalPremium), "TotalPremium");
//     handleDateChange(setFixValue(LGovTax), "LocalGovTax");
//     handleDateChange(setFixValue(Misc), "StradCom");

//     handleDateChange(setFixValue(LocalGovTaxPercent), "LocalGovTaxPercent");
//     handleDateChange(setFixValue(AOGPercent), "LocaAOGPercent");
//     handleDateChange(TPLTypeSection_I_II, "TplType");
//     handleDateChange(Remarks, "remarks");

//     handleDateChange(sale_officer, "sale_officer");
//     handleDateChange("delete", "mode");
//     setSearchShow(false);
//     setSearchShow(false);
//   }
//   const {
//     isLoading: isLoadingTempId,
//     // refetch: refetchTempId,
//     data: dataTemp,
//   } = useQuery({
//     queryKey: "temp-id",
//     queryFn: async () =>
//       await myAxios.get(`/task/production/get-vehicle-policy-temp-id`, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//   });
//   const { isLoading: searchLoading, refetch } = useQuery({
//     queryKey: queryKeySearch,
//     queryFn: async () =>
//       await myAxios.get(
//         `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=`,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       ),
//     onSuccess: (res) => {
//       const response = res.data?.searchVPolicy as any;
//       setRows(response);
//     },
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
//     mutationKey: queryKeyUpdateAdd,
//     mutationFn: async (variables: any) => {
//       if (state.mode === "delete" && state.form_type === "COM") {
//         return await myAxios.post(
//           "/task/production/com-update-vehicle-policy",
//           variables,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.accessToken}`,
//             },
//           }
//         );
//       }

//       if (state.mode === "delete" && state.form_type !== "COM") {
//         return await myAxios.post(
//           "/task/production/tpl-update-vehicle-policy",
//           variables,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.accessToken}`,
//             },
//           }
//         );
//       }
//       return await myAxios.post(
//         "/task/production/tpl-add-vehicle-policy",
//         variables,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       );
//     },
//     onSuccess: (res) => {
//       console.log(res.data)

//       if (res.data.success) {
//         Promise.all([
//           queryClient.invalidateQueries(queryKeySearch),
//           queryClient.invalidateQueries(queryKeyUpdateAdd),
//           queryClient.invalidateQueries(queryKeyGet),
//           queryClient.invalidateQueries(querySearchPolicyIds),
//         ]);
//         return Swal.fire({
//           position: "center",
//           icon: "success",
//           title: res.data.message,
//           showConfirmButton: false,
//           timer: 1500,
//         }).then(() => {
//           if (state.form_action === "TEMP") {
//             const getNumbers = state.PolicyNo.split("TP-")[1];
//             const inc = parseInt(getNumbers) + 1;
//             const getZero = getNumbers.slice(0, getNumbers.length - 1);
//             initialState.PolicyNo = `TP-${getZero}${inc}`;
//             initialState.form_action = "TEMP";
//           }
//           initialState.form_type = state.form_type;
//           backToDefaultState(initialState);
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
//     mutationKey: queryKeyUpdateAdd,
//     mutationFn: async (variables: any) => {
//       return await myAxios.post(
//         "/task/production/tpl-delete-vehicle-policy",
//         variables,
//         {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }
//       );
//     },
//     onSuccess: (res) => {
//       if (res.data.success) {
//         Promise.all([
//           queryClient.invalidateQueries(queryKeySearch),
//           queryClient.invalidateQueries(queryKeyUpdateAdd),
//           queryClient.invalidateQueries(queryKeyGet),
//           queryClient.invalidateQueries(querySearchPolicyIds),
//         ]);
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
//   const { isLoading: isLoadingrates, mutate: mutateRates } = useMutation({
//     mutationKey: "post-rates",
//     mutationFn: async (variables) =>
//       await myAxios.post(`/task/production/get-rates`, variables, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//     onSuccess(res) {
//       setDomination(res.data.rates);
//     },
//   });
//   const { isLoading: isLoadingPolicyDetails, mutate: mutatePolicyDetails } =
//     useMutation({
//       mutationKey: "get-policy-summary",
//       mutationFn: async (variable: any) =>
//         await myAxios.post(`/task/production/get-policy-summary`, variable, {
//           headers: {
//             Authorization: `Bearer ${user?.accessToken}`,
//           },
//         }),
//       onSuccess(res) {
//         const response = res.data as any;
//         setShowCLientDetails(true);
//         setNewStateValue(summaryDispatch, response.policyDetails[0]);
//       },
//     });
//   const setDefaultValueForNumber = useCallback(() => {
//     state.EVSV = parseStringToNumber(state.EVSV);
//     state.Aircon = parseStringToNumber(state.Aircon);
//     state.Stereo = parseStringToNumber(state.Stereo);
//     state.Magwheels = parseStringToNumber(state.Magwheels);
//     state.OthersRate = parseStringToNumber(state.OthersRate);
//     state.Deductible = parseStringToNumber(state.Deductible);
//     state.Towing = parseStringToNumber(state.Towing);
//     state.ARL = parseStringToNumber(state.ARL);
//     state.TotalPremium = parseStringToNumber(state.TotalPremium);
//     state.Vat = parseStringToNumber(state.Vat);
//     state.DocStamp = parseStringToNumber(state.DocStamp);
//     state.LocalGovTaxPercent = parseStringToNumber(state.LocalGovTaxPercent);
//     state.LocalGovTaxPercent = parseStringToNumber(state.LocalGovTaxPercent);
//     state.LocalGovTax = parseStringToNumber(state.LocalGovTax);
//     state.TotalDue = parseStringToNumber(state.TotalDue);
//     state.AOG = parseStringToNumber(state.AOG);
//     state.AOGPercent = parseStringToNumber(state.AOGPercent);
//     state.PremiumOther = parseStringToNumber(state.PremiumOther);
//     state.SectionIVB = parseStringToNumber(state.SectionIVB);
//     state.SectionIVA = parseStringToNumber(state.SectionIVA);
//     state.Theft = parseStringToNumber(state.Theft);
//     state.OwnDamage = parseStringToNumber(state.OwnDamage);
//     state.SectionIII = parseStringToNumber(state.SectionIII);
//     state.SectionI_II = parseStringToNumber(state.SectionI_II);
//     state.PremiumPaid = parseStringToNumber(state.PremiumPaid);
//     state.StradCom = parseStringToNumber(state.StradCom);
//   }, [state]);
//   const handleOnSave = useCallback(() => {
//     if (
//       state.client_name === "" ||
//       state.client_name === null ||
//       state.client_name === undefined
//     ) {
//       return Swal.fire({
//         icon: "warning",
//         title: "Register on ID Entry?",
//         text: "Unable to save! Invalid Client ID!",
//         showCancelButton: true,
//         showConfirmButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           return window.open(
//             "/dashboard/reference/id-entry",
//             "_blank"
//           );
//         }
//       });
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
//     if (state.mode === "delete") {
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
//   }, [setDefaultValueForNumber, mutate, state]);

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
//         event.code === "AudioVolumeUp" ||
//         event.code === "F3" ||
//         event.keyCode === 175
//       ) {
//         event.preventDefault();
//         goTo(2);
//       }

//       if (
//         state.mode === "" &&
//         (event.code === "KeyN" ||
//           event.code === "Enter" ||
//           event.code === "NumpadEnter")
//       ) {
//         event.preventDefault();
//         newButtonRef.current?.click();
//       }
//       if (state.mode !== "" && event.code === "Escape") {
//         event.preventDefault();
//         cancelButtonRef.current?.click();
//       }
//       if (state.mode === "delete" && event.code === "Delete") {
//         event.preventDefault();
//         deleteButtonRef.current?.click();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [goTo, handleOnSave, state.mode]);

//   const handleInputChange = (e: any) => {
//     const { name, value } = e.target;
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };
//   const handleDateChange = (value: any, name: string) => {
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };
//   function parseStringToNumber(input: string) {
//     const parsedNumber = parseFloat(input);

//     if (!isNaN(parsedNumber)) {
//       return input;
//     } else {
//       return "0.00";
//     }
//   }
//   function tplCompuation() {
//     setDefaultValueForNumber();

//     if (isNaN(parseFloat(state.PremiumPaid))) {
//       return Swal.fire({
//         position: "center",
//         icon: "error",
//         title: "Premiumn Paid is Required",
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     }

//     const vatPercentage = 12 / 100;
//     const dsPercentage = 12.5 / 100;
//     const lgtPercentage = 0.75 / 100;
//     const vatResult = vatPercentage * parseFloat(state.PremiumPaid);
//     const dsResult = dsPercentage * parseFloat(state.PremiumPaid);
//     const lgtResult = lgtPercentage * parseFloat(state.PremiumPaid);

//     const totalResult =
//       vatResult +
//       dsResult +
//       lgtResult +
//       parseFloat(state.StradCom) +
//       parseFloat(state.PremiumPaid);

//     handleDateChange(
//       `${parseFloat(state.PremiumPaid).toFixed(2)}`,
//       "SectionI_II"
//     );
//     handleDateChange(
//       `${parseFloat(state.PremiumPaid).toFixed(2)}`,
//       "TotalPremium"
//     );
//     handleDateChange(`${vatResult.toFixed(2)}`, "Vat");
//     handleDateChange(`${dsResult.toFixed(2)}`, "DocStamp");
//     handleDateChange(`${lgtResult.toFixed(2)}`, "LocalGovTax");
//     handleDateChange(`${Math.round(totalResult).toFixed(2)}`, "TotalDue");
//   }
//   function comComputation() {
//     setDefaultValueForNumber();

//     const vatPercentage = 12 / 100;
//     const docPercentage = 12.5 / 100;
//     const lgtPercentage =
//       parseFloat(state.LocalGovTaxPercent.replace(/,/g, "")) / 100;
//     const section = parseFloat(state.SectionIII.replace(/,/g, "")) / 100;
//     const aogPercent = parseFloat(state.AOGPercent.replace(/,/g, "")) / 100;
//     const owmDamageResult = parseFloat(state.EVSV.replace(/,/g, "")) * section;
//     const aogDamageResult =
//       parseFloat(state.EVSV.replace(/,/g, "")) * aogPercent;
//     handleDateChange(`${owmDamageResult.toFixed(2)}`, "OwnDamage");
//     handleDateChange(
//       `${formatNumberWithTwoDecimals(aogDamageResult.toString())}`,
//       "AOG"
//     );
//     const totalPremiumResult =
//       parseFloat(owmDamageResult.toFixed(2)) +
//       parseFloat(aogDamageResult.toString()) +
//       parseFloat(state.SectionIVB.replace(/,/g, "")) +
//       parseFloat(state.PremiumOther.replace(/,/g, "")) +
//       parseFloat(state.SectionIVA.replace(/,/g, ""));
//     handleDateChange(
//       `${(vatPercentage * totalPremiumResult).toFixed(2)}`,
//       "Vat"
//     );
//     handleDateChange(
//       `${(docPercentage * totalPremiumResult).toFixed(2)}`,
//       "DocStamp"
//     );
//     handleDateChange(
//       `${(lgtPercentage * totalPremiumResult).toFixed(2)}`,
//       "LocalGovTax"
//     );

//     handleDateChange("0.00", "TotalPremium");
//     handleDateChange("0.00", "TotalDue");

//     const totalDuePremiumResult =
//       totalPremiumResult +
//       parseFloat((vatPercentage * totalPremiumResult).toFixed(2)) +
//       parseFloat((docPercentage * totalPremiumResult).toFixed(2)) +
//       parseFloat((lgtPercentage * totalPremiumResult).toFixed(2)) +
//       parseFloat(parseFloat(state.StradCom.replace(/,/g, "")).toFixed(2));

//     handleDateChange(
//       `${formatNumberWithTwoDecimals(totalPremiumResult.toString())}`,
//       "TotalPremium"
//     );
//     handleDateChange(`${totalDuePremiumResult.toFixed(2)}`, "TotalDue");
//   }
//   function backToDefaultState(json: any, resetAll: boolean = false) {
//     Object.entries(json).forEach(([key, value]) => {
//       handleDateChange(value, key);
//     });
//   }
//   function formatNumberWithTwoDecimals(value: string) {
//     const input = parseStringToNumber(value);

//     if (input.includes(".")) {
//       const parts = input.split(".");
//       const integerPart = parts[0];
//       const decimalPart = parts[1].slice(0, 2) || "00";
//       return `${integerPart}.${decimalPart}`;
//     }

//     return `${input}.00`;
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
//   const DisplayDetails = ({ datakey, label, value }: any) => {
//     return (
//       <div style={{ width: "100%", display: "flex" }}>
//         <label style={{ width: "200px" }} htmlFor={datakey}>
//           {label}
//         </label>
//         :
//         <input
//           style={{ flex: 1, border: "none", padding: "0 20px" }}
//           defaultValue={value ?? ""}
//           id={datakey}
//           readOnly={true}
//         />
//       </div>
//     );
//   };
//   function setNewStateValue(dispatch: any, obj: any) {
//     Object.entries(obj).forEach(([field, value]) => {
//       dispatch({ type: "UPDATE_FIELD", field, value });
//     });
//   }

//   useEffect(() => {
//     if (user?.department === "UCSMI")
//       handleInputChange({ target: { value: "TEMP", name: "form_action" } });

//     handleDateChange(dataTemp?.data.tempId[0].tempPolicy_No, "PolicyNo");
//     handleInputChange({
//       target: { value: "COM", name: "form_type" },
//     });
//   }, [user?.department, dataTemp?.data.tempId]);

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
//       <PageHelmet title="Vehicle Policy" />

//       <VehicleContext.Provider
//         value={{
//           parseStringToNumber,
//           state,
//           handleInputChange,
//           handleDateChange,
//           Mortgagee,
//           setMortgagee,
//           showField,
//           setShowField,
//           myAxios,
//           user,
//           tplCompuation,
//           comComputation,
//           tplId,
//           setTplId,
//           isAddOrEditMode,
//           dispatch,
//           isLoadingTempId,
//           keySave,
//           domination,
//           mutateRates,
//           isLoadingrates,
//           reducer,
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
//               Policy Type and Details
//             </CustomButton>
//             <NavigateNextIcon fontSize="small" />
//           </div>
//           <div
//             style={{ display: "flex", columnGap: "8px", alignItems: "center" }}
//           >
//             <CustomButton
//               onClick={() => {
//                 goTo(2);
//               }}
//               currentStepIndex={currentStepIndex}
//               index={2}
//             >
//               Policy Premium
//             </CustomButton>
//           </div>
//           <div
//             style={{
//               marginLeft: "30px",
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
//               {state.mode === "" && (
//                 <Button
//                   sx={{
//                     height: "30px",
//                     fontSize: "11px",
//                   }}
//                   ref={newButtonRef}
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => {
//                     handleDateChange("add", "mode");
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
//                 disabled={state.mode === ""}
//                 startIcon={<SaveIcon />}
//               >
//                 Save
//               </LoadingButton>
//               {state.mode !== "" && (
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
//                         initialState.form_action = state.form_action;
//                         initialState.form_type = state.form_type;
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
//                 ref={deleteButtonRef}
//                 disabled={state.mode !== "delete"}
//                 startIcon={<DeleteIcon />}
//                 onClick={() => {
//                   codeCondfirmationAlert({
//                     isUpdate: false,
//                     cb: (userCodeConfirmation) => {
//                       mutateDelete({
//                         PolicyAccount: state.PolicyAccount,
//                         form_type: state.form_type,
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
//           {searchLoading ? (
//             <LoadingButton loading={searchLoading} />
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

//                   flushSync(() => {
//                     setSearchShow(true);
//                   });
//                   if (vPolicySearchInput?.current) {
//                     vPolicySearchInput.current.value = search;

//                     myAxios
//                       .get(
//                         `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=${search}`,
//                         {
//                           headers: {
//                             Authorization: `Bearer ${user?.accessToken}`,
//                           },
//                         }
//                       )
//                       .then((res: any) => {
//                         if (!res?.data.success) {
//                           return alert(`Error : ${res?.data.message}`);
//                         }

//                         const response = res as any;
//                         setRows(response.data["searchVPolicy"]);
//                         if (vPolicySearchInput?.current)
//                           vPolicySearchInput.current.focus();
//                       });
//                   }
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
//                   handleDateChange("", "Denomination");
//                   handleDateChange("", "PolicyAccount");
//                   handleDateChange("", "Mortgagee");
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

//           <FormControl
//             size="small"
//             sx={(theme) => ({
//               width: "100px",
//               ".MuiFormLabel-root": {
//                 fontSize: "14px",
//                 background: "white",
//                 zIndex: 99,
//                 padding: "0 3px",
//               },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             })}
//           >
//             <Select
//               sx={{
//                 height: "27px",
//                 fontSize: "14px",
//               }}
//               labelId="formType"
//               name="form_type"
//               value={state.form_type}
//               onChange={(e) => {
//                 Swal.fire({
//                   title: "Are you sure?",
//                   text: "You won't be able to revert this!",
//                   icon: "warning",
//                   showCancelButton: true,
//                   confirmButtonColor: "#3085d6",
//                   cancelButtonColor: "#d33",
//                   confirmButtonText: "Yes, change it!",
//                 }).then((result) => {
//                   if (result.isConfirmed) {
//                     initialState.form_action = state.form_action;
//                     backToDefaultState(initialState);
//                     setShowField({
//                       thirdparty: e.target.value.toLowerCase() === "tpl",
//                       compre: e.target.value.toLowerCase() === "com",
//                     });

//                     refetch();
//                     handleInputChange(e);
//                   }
//                 });
//               }}
//             >
//               {[
//                 { Account: "TPL", show: state.form_action === "REG" },
//                 { Account: "COM", show: true },
//               ].map((items: any, idx: number) => {
//                 return items.show ? (
//                   <MenuItem key={idx} value={items.Account}>
//                     {items.Account}
//                   </MenuItem>
//                 ) : null;
//               })}
//             </Select>
//           </FormControl>
//           <FormControl
//             size="small"
//             sx={(theme) => ({
//               width: "100px",
//               ".MuiFormLabel-root": {
//                 fontSize: "14px",
//                 background: "white",
//                 zIndex: 99,
//                 padding: "0 3px",
//               },
//               ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//             })}
//           >
//             <Select
//               sx={{
//                 height: "27px",
//                 fontSize: "14px",
//               }}
//               name="form_action"
//               value={state.form_action}
//               onChange={(e) => {
//                 Swal.fire({
//                   title: "Are you sure?",
//                   text: "You won't be able to revert this!",
//                   icon: "warning",
//                   showCancelButton: true,
//                   confirmButtonColor: "#3085d6",
//                   cancelButtonColor: "#d33",
//                   confirmButtonText: "Yes, change it!",
//                 }).then((result) => {
//                   if (result.isConfirmed) {
//                     initialState.form_type = "COM";
//                     backToDefaultState(initialState);
//                     refetch();
//                     handleInputChange(e);

//                     if (e.target.value === "TEMP") {
//                       handleDateChange(
//                         dataTemp?.data.tempId[0].tempPolicy_No,
//                         "PolicyNo"
//                       );
//                       handleInputChange({
//                         target: { value: "COM", name: "form_type" },
//                       });
//                     }

//                     if (e.target.value === "REG") {
//                       handleDateChange("", "PolicyNo");
//                     }
//                   }
//                 });
//               }}
//             >
//               <MenuItem value={"REG"}>REG</MenuItem>
//               {state.form_type !== "TPL" && (
//                 <MenuItem value={"TEMP"}>TEMP</MenuItem>
//               )}
//             </Select>
//           </FormControl>
//           {isLoadingPolicyDetails ? (
//             <div>
//               <CircularProgress size="20px" />
//             </div>
//           ) : (
//             <Button
//               disabled={state.mode !== "delete"}
//               variant="outlined"
//               startIcon={<ArticleIcon />}
//               sx={{
//                 height: "27px",
//                 fontSize: "11px",
//               }}
//               onClick={() => {
//                 mutatePolicyDetails({
//                   PolicyNo: state.PolicyNo,
//                 });
//               }}
//             >
//               Summary
//             </Button>
//           )}
//         </div>
//         {step}
//         <ModalWithTable
//           searchRef={vPolicySearchInput}
//           showModal={searchShow}
//           onCloseModal={() => {
//             setSearchShow(false);
//           }}
//           onClickCloseIcon={() => {
//             setSearchShow(false);
//           }}
//           searchOnChange={() => { }}
//           onSearchKeyEnter={(value) => {
//             myAxios
//               .get(
//                 `/task/production/tpl-search-vehicle-policy?form_type=${state.form_type}&form_action=${state.form_action}&search=${value}`,
//                 {
//                   headers: {
//                     Authorization: `Bearer ${user?.accessToken}`,
//                   },
//                 }
//               )
//               .then((res: any) => {
//                 if (!res?.data.success) {
//                   return alert(`Error : ${res?.data.message}`);
//                 }
//                 const response = res as any;
//                 setRows(response.data["searchVPolicy"]);
//               });
//           }}
//           height={300}
//           isLoading={searchLoading}
//           queryKey={vpolicyKey}
//           columns={vpolicyColumn}
//           onCellKeyDown={(__: any, key: any) => {
//             if (key.code === "Enter" || key.code === "NumpadEnter") {
//               key.preventDefault();
//               onSearchSelected([__.row]);
//             }
//           }}
//           onSelectionChange={(rowSelectionModel, data) => {
//             if (rowSelectionModel.length <= 0) {
//               return;
//             }

//             const selectedIDs = new Set(rowSelectionModel);
//             const selectedRowData = data.filter((row: any) => {
//               return selectedIDs.has(row["PolicyNo"].toString());
//             });
//             if (selectedRowData.length <= 0) return;
//             mutateRates({
//               Account: selectedRowData[0].Account.trim(),
//               Type: state.form_type.toUpperCase(),
//             } as any);

//             onSearchSelected(selectedRowData);
//           }}
//           id={"PolicyNo"}
//           rows={rows}
//           setRows={setRows}
//         />
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0,
//             background: "rgba(158, 155, 157, 0.31)",
//             zIndex: "999",
//             display: showClientDetails ? "flex" : "none",
//             justifyContent: "center",
//             alignItems: "center",
//             boxShadow: "-1px 15px 74px 38px rgba(0,0,0,0.37)",
//           }}
//         >
//           <div
//             style={{
//               background: "white",
//               width: "70%",
//               height: "700px",
//               position: "relative",
//               padding: "50px 20px",
//             }}
//           >
//             <IconButton
//               sx={{
//                 position: "absolute",
//                 top: "10px",
//                 right: "10px",
//               }}
//               onClick={() => setShowCLientDetails(false)}
//             >
//               <CloseIcon />
//             </IconButton>
//             <div style={{ width: "100%", height: "100%" }}>
//               <hr style={{ margin: "5px 0" }} />
//               <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
//                 Policy Details
//               </p>
//               <hr style={{ margin: "5px 0" }} />
//               <DisplayDetails
//                 datakey={"DateIssued"}
//                 label={"Date Issued"}
//                 value={format(new Date(), "yyyy/MM/dd")}
//               />
//               <DisplayDetails
//                 datakey={"PolicyNo"}
//                 label={"Policy No."}
//                 value={summaryState.PolicyNo}
//               />
//               <DisplayDetails
//                 datakey={"PolicyType"}
//                 label={"Policy Type"}
//                 value={summaryState.PolicyType}
//               />
//               <DisplayDetails
//                 datakey={"Account"}
//                 label={"Account"}
//                 value={summaryState.Account}
//               />
//               <DisplayDetails
//                 datakey={"Mortgagee"}
//                 label={"Mortgagee"}
//                 value={summaryState.Mortgagee}
//               />
//               <DisplayDetails
//                 datakey={"TotalDue"}
//                 label={"Total Due"}
//                 value={parseFloat(
//                   summaryState.TotalDue.toString().replace(/,/g, "")
//                 ).toLocaleString("en-US", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}
//               />
//               <DisplayDetails
//                 datakey={"sale_officer"}
//                 label={"Sale Officer"}
//                 value={summaryState.sale_officer}
//               />
//               <hr style={{ margin: "5px 0" }} />
//               <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
//                 Client Details
//               </p>
//               <hr style={{ margin: "5px 0" }} />
//               <DisplayDetails
//                 datakey={"IDNo_dr"}
//                 label={"ID NO."}
//                 value={summaryState.IDNo}
//               />
//               <DisplayDetails
//                 datakey={"ShortName_dr"}
//                 label={"Short Name"}
//                 value={summaryState.ShortName}
//               />
//               <DisplayDetails
//                 datakey={"subShortName_dr"}
//                 label={"Sub Account"}
//                 value={summaryState.subShortName}
//               />
//               <DisplayDetails
//                 datakey={"mobile_dr"}
//                 label={"Mobile"}
//                 value={summaryState.mobile}
//               />
//               <DisplayDetails
//                 datakey={"email_dr"}
//                 label={"Email"}
//                 value={summaryState.email}
//               />
//               <DisplayDetails
//                 datakey={"address_dr"}
//                 label={"Address"}
//                 value={summaryState.address}
//               />
//               <DisplayDetails
//                 datakey={"options_dr"}
//                 label={"Option"}
//                 value={summaryState.options}
//               />
//               <hr style={{ margin: "5px 0" }} />
//               <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
//                 Agent Details
//               </p>
//               <hr style={{ margin: "5px 0" }} />
//               <DisplayDetails
//                 datakey={"agent_fullname"}
//                 label={"Agent Name"}
//                 value={summaryState.agent_fullname}
//               />
//             </div>
//           </div>
//         </div>
//       </VehicleContext.Provider>
//     </>
//   );
// }
