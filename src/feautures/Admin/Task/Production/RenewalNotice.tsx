import { useContext, useRef, useState } from "react";
import PageHelmet from "../../../../components/Helmet";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";
import { useUpwardTableModalSearchSafeMode } from "../../../../components/DataGridViewReact";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { isMobile } from "react-device-detect";
import { wait } from "@testing-library/user-event/dist/utils";
import { formatNumber } from "../Accounting/ReturnCheck";

function RenewalNotice() {
  const { myAxios, user } = useContext(AuthContext);
  const [policyType, setPolicyType] = useState("COM");

  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const policyTypeRef = useRef<HTMLSelectElement>(null);

  const paPropertyInsuredRef = useRef<HTMLInputElement>(null);
  const firePropertyInsuredRef = useRef<HTMLInputElement>(null);
  const fireMortgageeRef = useRef<HTMLInputElement>(null);

  const marPropertyInsuredRef = useRef<HTMLInputElement>(null);
  const marMortgageeRef = useRef<HTMLInputElement>(null);
  const marAdditionalInfoRef = useRef<HTMLTextAreaElement>(null);

  const comPassenger1Ref = useRef<HTMLInputElement>(null);
  const comPassenger2Ref = useRef<HTMLInputElement>(null);
  const sumInsuredEBIRef = useRef<HTMLInputElement>(null);
  const sumInsuredTPPDRef = useRef<HTMLInputElement>(null);
  const premiumSec3Ref = useRef<HTMLInputElement>(null);
  const premiumAOFRef = useRef<HTMLInputElement>(null);
  const premiumAOGRef = useRef<HTMLInputElement>(null);
  const premiumEBIRef = useRef<HTMLInputElement>(null);
  const premiumTPPDRef = useRef<HTMLInputElement>(null);
  const premiumAPARef = useRef<HTMLInputElement>(null);

  const balanceRef = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState(false);

  const { mutate: mutatateRenewalNotice, isLoading: isLoadingRenewalNotice } =
    useMutation({
      mutationKey: "save",
      mutationFn: (variables: any) => {
        return myAxios.post(
          "/task/production/generate-renewal-notice-pdf",
          variables,
          {
            responseType: "arraybuffer",
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess: (response) => {
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if (isMobile) {
          // MOBILE: download directly
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.download = "report.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        } else {
          window.open(
            `/${
              process.env.REACT_APP_DEPARTMENT
            }/dashboard/report?pdf=${encodeURIComponent(pdfUrl)}`,
            "_blank"
          );
        }
      },
    });

  const { mutate: mutatatePayment, isLoading: isLoadingPayment } = useMutation({
    mutationKey: "payment",
    mutationFn: (variables: any) => {
      return myAxios.post("/task/production/get-balance", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      const totalGross = parseFloat(
        response.data.payment.totalGross[0].TotalDue
      );
      const totalPaidDeposit = parseFloat(
        response.data.payment.totalPaidDeposit[0].totalDeposit
      );
      const totalPaidReturned = parseFloat(
        response.data.payment.totalPaidReturned[0].totalReturned
      );
      const totalDiscount = parseFloat(
        response.data.payment.totalDiscount[0].discount
      );

      let totalPaid = totalPaidDeposit - totalPaidReturned;
      let totalBalance = totalGross - (totalPaid + totalDiscount);

      if (balanceRef.current) {
        balanceRef.current.value = formatNumber(totalBalance);
      }
    },
  });

  const {
    UpwardTableModalSearch: PolicyComSearchUpwardTableModalSearch,
    openModal: policyComSearchOpenModal,
    closeModal: policyComSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/production/search-policy-renewal-notice-com",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
      {
        key: "ChassisNo",
        label: "Chassis No",
        width: 255,
      },
      {
        key: "EstimatedValue",
        label: "EstimatedValue",
        width: 255,
        hide: true,
      },
      {
        key: "SecIIPercent",
        label: "SecIIPercent",
        width: 255,
        hide: true,
      },
      {
        key: "BodilyInjury",
        label: "BodilyInjury",
        width: 255,
        hide: true,
      },
      {
        key: "PropertyDamage",
        label: "PropertyDamage",
        width: 255,
        hide: true,
      },
      {
        key: "PersonalAccident",
        label: "PersonalAccident",
        width: 255,
        hide: true,
      },
      {
        key: "Sec4A",
        label: "Sec4A",
        width: 255,
        hide: true,
      },
      {
        key: "Sec4B",
        label: "Sec4B",
        width: 255,
        hide: true,
      },
      {
        key: "Sec4C",
        label: "Sec4C",
        width: 255,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (searchRef.current) {
          searchRef.current.value = rowItm[1];
        }
        if (nameRef.current) {
          nameRef.current.value = rowItm[3];
        }
        if (premiumSec3Ref.current) {
          premiumSec3Ref.current.value = formatNumber(
            parseFloat(rowItm[6].toString().replace(/,/g, ""))
          );
        }

        if (sumInsuredEBIRef.current) {
          sumInsuredEBIRef.current.value = formatNumber(
            parseFloat(rowItm[7].toString().replace(/,/g, ""))
          );
        }
        if (sumInsuredTPPDRef.current) {
          sumInsuredTPPDRef.current.value = formatNumber(
            parseFloat(rowItm[8].toString().replace(/,/g, ""))
          );
        }

        if (premiumEBIRef.current) {
          premiumEBIRef.current.value = formatNumber(
            parseFloat(rowItm[10].toString().replace(/,/g, ""))
          );
        }
        if (premiumTPPDRef.current) {
          premiumTPPDRef.current.value = formatNumber(
            parseFloat(rowItm[11].toString().replace(/,/g, ""))
          );
        }
        if (premiumAPARef.current) {
          premiumAPARef.current.value = formatNumber(
            parseFloat(rowItm[12].toString().replace(/,/g, ""))
          );
        }
        setIsEditMode(true);
        mutatatePayment({ policyNo: rowItm[1] });
        policyComSearchCloseModal();
      }
    },
  });

  const {
    UpwardTableModalSearch: PolicyFireSearchUpwardTableModalSearch,
    openModal: policyFireSearchOpenModal,
    closeModal: policyFireSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/production/search-policy-renewal-notice-fire",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
      {
        key: "ChassisNo",
        label: "Chassis No",
        width: 255,
      },
      {
        key: "PropertyInsured",
        label: "PropertyInsured",
        width: 255,
        hide: true,
      },
      {
        key: "Mortgage",
        label: "Mortgage",
        width: 255,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (searchRef.current) {
          searchRef.current.value = rowItm[1];
        }
        if (nameRef.current) {
          nameRef.current.value = rowItm[3];
        }

        if (firePropertyInsuredRef.current) {
          firePropertyInsuredRef.current.value = rowItm[5];
        }
        if (fireMortgageeRef.current) {
          fireMortgageeRef.current.value = rowItm[6] || "";
        }
        setIsEditMode(true);
        mutatatePayment({ policyNo: rowItm[1] });
        policyFireSearchCloseModal();
      }
    },
  });

  const {
    UpwardTableModalSearch: PolicyMarSearchUpwardTableModalSearch,
    openModal: policyMarSearchOpenModal,
    closeModal: policyMarSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/production/search-policy-renewal-notice-mar",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
      {
        key: "ChassisNo",
        label: "Chassis No",
        width: 255,
      },
      {
        key: "SubjectInsured",
        label: "SubjectInsured",
        width: 255,
        hide: true,
      },
      {
        key: "AdditionalInfo",
        label: "AdditionalInfo",
        width: 255,
        hide: true,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (searchRef.current) {
          searchRef.current.value = rowItm[1];
        }
        if (nameRef.current) {
          nameRef.current.value = rowItm[3];
        }

        if (marPropertyInsuredRef.current) {
          marPropertyInsuredRef.current.value = rowItm[5];
        }
        if (marAdditionalInfoRef.current) {
          marAdditionalInfoRef.current.value = rowItm[6];
        }
        setIsEditMode(true);
        mutatatePayment({ policyNo: rowItm[1] });
        policyMarSearchCloseModal();
      }
    },
  });

  const {
    UpwardTableModalSearch: PolicyPaSearchUpwardTableModalSearch,
    openModal: policyPaSearchOpenModal,
    closeModal: policyPaSearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/production/search-policy-renewal-notice-pa",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
      {
        key: "ChassisNo",
        label: "Chassis No",
        width: 255,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (searchRef.current) {
          searchRef.current.value = rowItm[1];
        }
        if (nameRef.current) {
          nameRef.current.value = rowItm[3];
        }
        setIsEditMode(true);
        mutatatePayment({ policyNo: rowItm[1] });
        policyPaSearchCloseModal();
      }
    },
  });

  const generateRenewalNotice = () => {
    mutatateRenewalNotice({
      PolicyNo: searchRef.current?.value,
      PolicyType: policyType,
      PAPropertyInsured: paPropertyInsuredRef.current?.value,
      FirePropertyInsured: firePropertyInsuredRef.current?.value,
      FireMortgagee: fireMortgageeRef.current?.value,
      MarPropertyInsured: marPropertyInsuredRef.current?.value,
      MarMortgageeRef: marMortgageeRef.current?.value,
      comPassenger1Ref: comPassenger1Ref.current?.value,
      comPassenger2Ref: comPassenger2Ref.current?.value,
      MarAdditionalInfoRef: marAdditionalInfoRef.current?.value,
      sumInsuredEBIRef: sumInsuredEBIRef.current?.value,
      sumInsuredTPPDRef: sumInsuredTPPDRef.current?.value,
      premiumSec3Ref: premiumSec3Ref.current?.value,
      premiumAOFRef: premiumAOFRef.current?.value,
      premiumAOGRef: premiumAOGRef.current?.value,
      premiumEBIRef: premiumEBIRef.current?.value,
      premiumTPPDRef: premiumTPPDRef.current?.value,
      premiumAPARef: premiumAPARef.current?.value,
    });
  };

  function search(search: string, policyType: string) {
    if (policyType === "COM") {
      policyComSearchOpenModal(search);
    } else if (policyType === "FIRE") {
      policyFireSearchOpenModal(search);
    } else if (policyType === "MAR") {
      policyMarSearchOpenModal(search);
    } else if (policyType === "PA") {
      policyPaSearchOpenModal(search);
    } else {
      policyComSearchOpenModal(search);
    }
  }

  return (
    <>
      {(isLoadingRenewalNotice || isLoadingPayment) && <Loading />}
      <PageHelmet title="RENEWAL NOTICE" />
      <PolicyComSearchUpwardTableModalSearch />
      <PolicyFireSearchUpwardTableModalSearch />
      <PolicyMarSearchUpwardTableModalSearch />
      <PolicyPaSearchUpwardTableModalSearch />
      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "600px",
            height: "auto",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            border: "1px solid #94a3b8",
            boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.75)",
          }}
        >
          <TextInput
            containerClassName="custom-input adjust-label-search"
            containerStyle={{ width: "100%" }}
            label={{
              title: "Policy: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: policyType === "COM" ? "100px" : "150px",
              },
            }}
            input={{
              readOnly: isEditMode,
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  search(e.currentTarget.value, policyType);
                }
              },
              style: {
                width:
                  policyType === "COM"
                    ? "calc(100% - 100px)"
                    : "calc(100% - 150px)",
                height: "22px",
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                search(searchRef.current.value, policyType);
              }
            }}
            inputRef={searchRef}
          />
          <TextInput
            containerClassName="custom-input adjust-label-search"
            containerStyle={{ width: "100%" }}
            label={{
              title: "Name : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: policyType === "COM" ? "100px" : "150px",
              },
            }}
            input={{
              readOnly: true,
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  search(e.currentTarget.value, policyType);
                }
              },
              style: {
                width:
                  policyType === "COM"
                    ? "calc(100% - 100px)"
                    : "calc(100% - 150px)",
                height: "22px",
              },
            }}
            inputRef={nameRef}
          />
          {policyType === "COM" && (
            <>
              <div
                className="container-max-width"
                style={{
                  width: "100%",
                  border: "1px solid #9ca3af",
                  boxSizing: "border-box",
                  padding: "10px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "5px",
                  marginTop: "5px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "20px",
                    fontSize: "14px",
                    background: "white",
                    padding: "0 2px",
                    fontWeight: "bold",
                  }}
                >
                  Previous Policy
                </span>
                <TextInput
                  containerClassName="custom-input adjust-label-search"
                  containerStyle={{ width: "100%" }}
                  label={{
                    title: "Passenger : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "185px",
                    },
                  }}
                  input={{
                    readOnly: !isEditMode,
                    defaultValue: "(50,000 per passenger)",
                    type: "text",
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === "NumpadEnter") {
                        e.preventDefault();
                        search(e.currentTarget.value, policyType);
                      }
                    },
                    style: { width: "calc(100% - 185px)", height: "22px" },
                  }}
                  inputRef={comPassenger1Ref}
                />
              </div>
              <div
                className="container-max-width"
                style={{
                  width: "100%",
                  border: "1px solid #9ca3af",
                  boxSizing: "border-box",
                  padding: "10px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "5px",
                  marginTop: "5px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "20px",
                    fontSize: "14px",
                    background: "white",
                    padding: "0 2px",
                    fontWeight: "bold",
                  }}
                >
                  Quataion for your Renewal
                </span>
                <TextInput
                  containerClassName="custom-input adjust-label-search"
                  containerStyle={{ width: "100%" }}
                  label={{
                    title: "Passenger : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "185px",
                    },
                  }}
                  input={{
                    readOnly: !isEditMode,
                    defaultValue: "(50,000 per passenger)",
                    type: "text",
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === "NumpadEnter") {
                        e.preventDefault();
                        search(e.currentTarget.value, policyType);
                      }
                    },
                    style: { width: "calc(100% - 185px)", height: "22px" },
                  }}
                  inputRef={comPassenger2Ref}
                />
                <div
                  className="container-max-width"
                  style={{
                    width: "100%",
                    border: "1px solid #9ca3af",
                    boxSizing: "border-box",
                    padding: "10px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "5px",
                    marginTop: "5px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "20px",
                      fontSize: "14px",
                      background: "white",
                      padding: "0 2px",
                      fontWeight: "bold",
                    }}
                  >
                    Sum Insured
                  </span>
                  <TextFormatedInput
                    label={{
                      title: "Excess Bodily Injury : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={sumInsuredEBIRef}
                  />
                  <TextFormatedInput
                    label={{
                      title: "Third Party Property Damage : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={sumInsuredTPPDRef}
                  />
                </div>
                <div
                  className="container-max-width"
                  style={{
                    width: "100%",
                    border: "1px solid #9ca3af",
                    boxSizing: "border-box",
                    padding: "10px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "5px",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "20px",
                      fontSize: "14px",
                      background: "white",
                      padding: "0 2px",
                      fontWeight: "bold",
                    }}
                  >
                    Premium
                  </span>
                  <TextFormatedInput
                    label={{
                      title: "Section ||| % : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "2.00",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumSec3Ref}
                  />
                  <TextFormatedInput
                    label={{
                      title: "Acts of Nature %: ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "0.5",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumAOFRef}
                  />
                  <TextFormatedInput
                    label={{
                      title: "AOG % : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "0.75",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumAOGRef}
                  />
                  <TextFormatedInput
                    label={{
                      title: "Excess Bodily Injury : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumEBIRef}
                  />
                  <TextFormatedInput
                    label={{
                      title: "Third Party Property Damage : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumTPPDRef}
                  />
                  <TextFormatedInput
                    label={{
                      title: "Auto Passenger Accident : ",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "185px",
                      },
                    }}
                    input={{
                      readOnly: !isEditMode,
                      placeholder: "0.00",
                      defaultValue: "",
                      type: "text",
                      style: { width: "calc(100% - 185px)" },
                      onKeyDown: (e) => {
                        if (e.code === "NumpadEnter" || e.code === "Enter") {
                        }
                      },
                    }}
                    inputRef={premiumAPARef}
                  />
                </div>
              </div>
            </>
          )}
          {policyType === "FIRE" && (
            <>
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "100%" }}
                label={{
                  title: "Property Insured : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                input={{
                  readOnly: !isEditMode,
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      search(e.currentTarget.value, policyType);
                    }
                  },
                  style: { width: "calc(100% - 150px)", height: "22px" },
                }}
                inputRef={firePropertyInsuredRef}
              />
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "100%" }}
                label={{
                  title: "Mortgagee : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                input={{
                  readOnly: !isEditMode,
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      search(e.currentTarget.value, policyType);
                    }
                  },
                  style: { width: "calc(100% - 150px)", height: "22px" },
                }}
                inputRef={fireMortgageeRef}
              />
            </>
          )}
          {policyType === "MAR" && (
            <>
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "100%" }}
                label={{
                  title: "Property Insured : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                input={{
                  readOnly: !isEditMode,
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      search(e.currentTarget.value, policyType);
                    }
                  },
                  style: { width: "calc(100% - 150px)", height: "22px" },
                }}
                inputRef={marPropertyInsuredRef}
              />
              <TextInput
                containerClassName="custom-input adjust-label-search"
                containerStyle={{ width: "100%" }}
                label={{
                  title: "Mortgagee : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                input={{
                  readOnly: !isEditMode,
                  type: "text",
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      search(e.currentTarget.value, policyType);
                    }
                  },
                  style: { width: "calc(100% - 150px)", height: "22px" },
                }}
                inputRef={marMortgageeRef}
              />
              <TextAreaInput
                label={{
                  title: "Additional Info : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                textarea={{
                  readOnly: !isEditMode,
                  rows: 4,
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    e.stopPropagation();
                  },
                }}
                _inputRef={marAdditionalInfoRef}
              />
            </>
          )}
          {policyType === "PA" && (
            <TextInput
              containerClassName="custom-input adjust-label-search"
              containerStyle={{ width: "100%" }}
              label={{
                title: "Property Insured : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                readOnly: !isEditMode,
                type: "text",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    search(e.currentTarget.value, policyType);
                  }
                },
                style: { width: "calc(100% - 150px)", height: "22px" },
              }}
              inputRef={paPropertyInsuredRef}
            />
          )}
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                columnGap: "10px",
                alignItems: "center",
              }}
            >
              <SelectInput
                selectRef={policyTypeRef}
                containerClassName="custom-input adjust-label"
                label={{
                  title: "Policy Type : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: policyType === "COM" ? "100px" : "150px",
                  },
                }}
                select={{
                  disabled: isEditMode,
                  style: {
                    width:
                      policyType === "COM"
                        ? "calc(100% - 100px)"
                        : "calc(100% - 150px)",
                    height: "20px",
                  },
                  value: policyType,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                    }
                  },
                  onChange: (e) => {
                    setPolicyType(e.currentTarget.value);
                  },
                }}
                datasource={[
                  {
                    key: "COM",
                  },
                  {
                    key: "FIRE",
                  },
                  {
                    key: "MAR",
                  },
                  {
                    key: "PA",
                  },
                ]}
                values={"key"}
                display={"key"}
              />
              <Button
                onClick={() => {
                  if (searchRef.current) {
                    searchRef.current.value = "";
                  }
                  if (nameRef.current) {
                    nameRef.current.value = "";
                  }
                  if (paPropertyInsuredRef.current) {
                    paPropertyInsuredRef.current.value = "";
                  }
                  if (firePropertyInsuredRef.current) {
                    firePropertyInsuredRef.current.value = "";
                  }
                  if (fireMortgageeRef.current) {
                    fireMortgageeRef.current.value = "";
                  }
                  if (marPropertyInsuredRef.current) {
                    marPropertyInsuredRef.current.value = "";
                  }
                  if (marMortgageeRef.current) {
                    marMortgageeRef.current.value = "";
                  }
                  if (marAdditionalInfoRef.current) {
                    marAdditionalInfoRef.current.value = "";
                  }
                  if (comPassenger1Ref.current) {
                    comPassenger1Ref.current.value = "(50,000 per passenger)";
                  }
                  if (comPassenger2Ref.current) {
                    comPassenger2Ref.current.value = "(50,000 per passenger)";
                  }
                  if (sumInsuredEBIRef.current) {
                    sumInsuredEBIRef.current.value = "0.00";
                  }
                  if (sumInsuredTPPDRef.current) {
                    sumInsuredTPPDRef.current.value = "0.00";
                  }
                  if (premiumSec3Ref.current) {
                    premiumSec3Ref.current.value = "2.00";
                  }
                  if (premiumAOFRef.current) {
                    premiumAOFRef.current.value = "0.5";
                  }
                  if (premiumAOGRef.current) {
                    premiumAOGRef.current.value = "0.75";
                  }
                  if (premiumEBIRef.current) {
                    premiumEBIRef.current.value = "0.00";
                  }
                  if (premiumTPPDRef.current) {
                    premiumTPPDRef.current.value = "0.00";
                  }
                  if (premiumAPARef.current) {
                    premiumAPARef.current.value = "0.00";
                  }
                  if (balanceRef.current) {
                    balanceRef.current.value = "0.00";
                  }
                  setIsEditMode(false);
                }}
                disabled={!isEditMode}
                color="warning"
                variant="contained"
                sx={{ height: "22px", fontSize: "12px", width: "50px" }}
              >
                Edit
              </Button>
            </div>
            <TextInput
              containerClassName="custom-input adjust-label-search"
              containerStyle={{ width: "200px" }}
              label={{
                title: "Balance : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                },
              }}
              input={{
                defaultValue: "0.00",
                readOnly: true,
                type: "text",
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    search(e.currentTarget.value, policyType);
                  }
                },
                style: { width: "calc(100% - 70px)", height: "22px" },
              }}
              inputRef={balanceRef}
            />
          </div>
          <Button
            disabled={!isEditMode}
            onClick={generateRenewalNotice}
            color="success"
            variant="contained"
            sx={{ height: "22px", fontSize: "12px", width: "100%" }}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </>
  );
}

export default RenewalNotice;
