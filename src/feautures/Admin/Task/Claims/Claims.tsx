import React, {
  useContext,
  useId,
  useReducer,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import useQueryModalTable from "../../../../hooks/useQueryModalTable";
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Menu,
  Stack,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { AuthContext } from "../../../../components/AuthContext";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CustomDatePicker from "../../../../components/DatePicker";
import { useMutation, useQuery } from "react-query";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Swal from "sweetalert2";
import { flushSync } from "react-dom";
import { codeCondfirmationAlert } from "../../../../lib/confirmationAlert";
import ReactDOMServer from "react-dom/server";
import format from "date-fns/format";
import "../../../../style/claim.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { grey } from "@mui/material/colors";
import { NumericFormatCustom } from "../../../../components/NumberFormat";
import ArticleIcon from "@mui/icons-material/Article";

const initialClaimState = {
  claims_id: "",
  dateReported: null,
  dateAccident: null,
  dateInspected: null,
  department: 1,
  remarks: "",
  search: "",
  mode: "",
  claim_no: "",
};
const initialPolicyState = {
  policy: "",
  claim_type: 0,
  insurance: "",
  PolicyNo: "",
  PlateNo: "",
  Model: "",
  BodyType: "",
  Make: "",
  ChassisNo: "",
  MotorNo: "",
  ORNo: "",
  CoverNo: "",
  BLTFileNo: "",
  AssuredName: "",
  IDNo: "",
  totaDue: "00.00",
  totalpaid: "00.00",
  balance: "00.00",
  remitted: "00.00",
  Account: "",
  status: 0,
  DateFrom: "",
  DateTo: "",
  DateReceived: null,
  DateClaim: null,
  AmountClaim: "",
  AmountApproved: "",
  NameTPPD: "",
};
const claimType = [
  "OWN DAMAGE",
  "CARNAP",
  "VTPL-PROPERTY DAMAGE",
  "VTPL-BODILY INJURY",
  "THIRD PARTY-DEATH",
];
const basicDocuments = [
  { label: "Policy", name: "policyFile" },
  { label: "ENDORCEMENT", name: "endorsement" },
  { label: "OR of Premium Payment", name: "OPP" },
  {
    label: "Official Receipt and Certificate of Registration",
    name: "ORCR",
  },
  {
    label: "Drivers License and Official Receipt",
    name: "DLOR",
  },
  { label: "Police Report", name: "PR" },
  { label: "Driver's Affidavit", name: "DA" },
  { label: "Stencil of Motor and Chassis No.", name: "SMCN" },
];
const insuranceDocuments = [
  { label: "LOA", name: "loa" },
  { label: "Offer Letter", name: "offerLetter" },
  { label: "Comparative Evaluation", name: "CE" },
];
const claimsStatus = [
  "Ongoing Repair",
  "With Offer Letter",
  "With Lacking Documents",
  "With LOA",
  "Submitted to Insurance Company",
  "For Evaluation",
  "For Inspection",
  "For Check Preparation",
  "Denied",
  "Done",
  "",
];
const renderFields = () => {
  const arrs = [
    [
      { label: "Copies of Colored Picture", name: "ct1_1" },
      { label: "Copy of Repair Estimate", name: "ct1_2" },
    ],
    [
      { label: "Complaint Sheet", name: "ct2_1" },
      { label: "Alarm Sheet", name: "ct2_2" },
      { label: "Original Keys", name: "ct2_3" },
      { label: "Certificate of NO RECOVERY", name: "ct2_4" },
    ],
    [
      { label: "Copies of Colored Picture", name: "ct3_1" },
      { label: "Copy of Repair Estimate", name: "ct3_2" },
      { label: "Certificate of Registration and OR", name: "ct3_3" },
      { label: "Photocopy of Driver's license", name: "ct3_4" },
      { label: "Certificate of NO Claim from Insurer", name: "ct3_5" },
    ],
    [
      { label: "Medical Certificate", name: "ct4_1" },
      { label: "Receipt of Medicine/Drugs", name: "ct4_2" },
      { label: "Hospital Bill", name: "ct4_3" },
      { label: "Birth Certificate", name: "ct4_4" },
      { label: "Affidavit of Desistance", name: "ct4_5" },
    ],
    [
      { label: "Death Certificate, ID", name: "ct5_1" },
      { label: "Marriage Contract ", name: "ct5_2" },
      { label: "Funeral/Burial Official Receipts", name: "ct5_3" },
    ],
  ];
  return arrs;
};
export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
};

function Claims() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [claimsSubmited, setClaimsSubmited] = useState([]);
  const { myAxios, user } = useContext(AuthContext);
  const [claimState, claimDispatch] = useReducer(reducer, initialClaimState);
  const [policyState, policyDispatch] = useReducer(reducer, initialPolicyState);
  const [listofClaim, setListofClaim] = useState<Array<any>>([]);
  const [showModal, setShowModal] = useState(false);
  const searchClaimInputRef = useRef<HTMLInputElement>(null);
  const policySearchInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLElement>(null);
  const dateAccidentRef = useRef<HTMLElement>(null);
  const dateInspectedRef = useRef<HTMLElement>(null);
  const { isLoading: isLoadingClaimsId, refetch: refetchClaimsId } = useQuery({
    queryKey: "get-claims-id",
    queryFn: async () =>
      await myAxios.get(`/task/claims/claims/get-claims-id`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
    refetchOnWindowFocus: false,
    onSuccess(res) {
      claimDispatch({
        type: "UPDATE_FIELD",
        field: "claims_id",
        value: res.data.claim_id[0].id,
      });
    },
  });
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    claimDispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const { isLoading: isLoadingSelectedSearch, mutate: mutateSelectedSearch } =
    useMutation({
      mutationFn: (variable: any) => {
        return myAxios.post(
          "/task/claims/claims/selected-search-claims",
          variable,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess(res) {
        const formattedSelectedData = res.data.formattedSelectedData;
        const claims_id = res.data.claims_id;
        const policyTypeContainer: Array<any> = [];
        formattedSelectedData.map(async (item: any) => {
          policyTypeContainer.push(
            parseInt(item.policyState.claim_type?.toString())
          );
          const basicDocuments: Array<any> = item.basicFileCustom;
          const otherDocuments: Array<any> = item.otherFileCustom;
          const insuranceDocuments: Array<any> = item.insuranceFileCustom;
          const newObjContainerBasic = await formatDataToDocument(
            basicDocuments,
            `${process.env.REACT_APP_IMAGE_URL}claim-files/${claims_id}/${item.id}/Basic-Document/`
          );

          const newObjContainerOther = await formatDataToDocument(
            otherDocuments,
            `${process.env.REACT_APP_IMAGE_URL}claim-files/${claims_id}/${item.id}/Other-Document/`
          );

          const newObjContainerInsurance = await formatDataToDocument(
            insuranceDocuments,
            `${process.env.REACT_APP_IMAGE_URL}claim-files/${claims_id}/${item.id}/Insurance-Document/`
          );

          item.basicFileCustom = await Promise.all(newObjContainerBasic);
          item.otherFileCustom = await Promise.all(newObjContainerOther);
          item.insuranceFileCustom = await Promise.all(
            newObjContainerInsurance
          );

          return item;
        });
        async function formatDataToDocument(
          dataDocument: Array<any>,
          url: string
        ) {
          const newObjContainer: Array<any> = [];
          for (let index = 0; index < dataDocument.length; index++) {
            const basicItem = dataDocument[index];
            const mainURL = `${url}/${basicItem.uniqueFilename}`;
            const response = await fetch(mainURL);
            const blob = await response.blob();
            const file = new File([blob], basicItem.fileName, {
              type: basicItem.fileType,
            });
            const reader = new FileReader();
            newObjContainer.push(
              new Promise((resolve, reject) => {
                reader.onload = function (event) {
                  resolve({
                    fileContent: event.target?.result,
                    datakey: basicItem.datakey,
                    fileName: basicItem.fileName,
                    fileType: basicItem.fileType,
                    file,
                  });
                };
                reader.onerror = function (event) {
                  reject(new Error("Error reading file: " + file.name));
                };
                reader.readAsDataURL(file);
              })
            );
          }
          return newObjContainer;
        }
        setListofClaim(policyTypeContainer);
        setNewStateValue(policyDispatch, formattedSelectedData[0].policyState);
        setClaimsSubmited(formattedSelectedData);
      },
    });
  const { isLoading: isLoadingClaimSave, mutate: mutateClaimSave } =
    useMutation({
      mutationKey: "save-claim",
      mutationFn: async (variable: any) =>
        await myAxios.post("/task/claims/claims/save", variable, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        const response = res as any;

        if (response.data.success) {
          setNewStateValue(claimDispatch, initialClaimState);
          setNewStateValue(policyDispatch, initialPolicyState);
          setClaimsSubmited([]);
          refetchClaimsId();

          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "warning",
          title: response.data.message,
          timer: 1500,
        });
      },
    });
  const {
    isLoading: isLoadingClaimSelectedPolicyDetails,
    mutate: mutateClaimSelectedPolicyDetails,
  } = useMutation({
    mutationKey: "get-selected-policy-details",
    mutationFn: async (variable: any) =>
      await myAxios.post(
        "/task/claims/claims/get-selected-policy-details",
        variable,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    onSuccess(res) {
      const response = res as any;

      if (response.data.success && response.data.data.length > 0) {
        console.log(response);
        setNewStateValue(policyDispatch, response.data.data[0]);
      }
      closePolicyModal();
    },
  });
  const {
    ModalComponent: SearchClaimModal,
    isLoading: isLoadingClaimModal,
    openModal: openClaimModal,
    closeModal: closeClaimModal,
  } = useQueryModalTable({
    link: {
      url: "/task/claims/claims/search-claims",
      queryUrlName: "searchClaims",
    },
    columns: [
      { field: "claims_id", headerName: "Ref No.", width: 300 },
      { field: "AssuredName", headerName: "Name", width: 350 },
      { field: "PolicyNo", headerName: "Policy No.", width: 200 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      { field: "ChassisNo", headerName: "Chassis No.", width: 200 },
      { field: "MotorNo", headerName: "Motor No.", width: 200 },
      { field: "PlateNo", headerName: "Plate No.", width: 200 },
    ],
    queryKey: "search-claims",
    uniqueId: "claims_id",
    responseDataKey: "claims",
    onSelected: (selectedRowData) => {
      mutateSelectedSearch({ selectedRowData });
      setNewStateValue(claimDispatch, {
        claims_id: selectedRowData[0].claims_id,
        dateReported: selectedRowData[0].dateReported,
        dateAccident: selectedRowData[0].dateAccident,
        dateInspected: selectedRowData[0].dateInspected,
        department: parseInt(selectedRowData[0].department),
        remarks: selectedRowData[0].remarks,
        claim_no: "",
        mode: "update",
      });
      closeClaimModal();
    },
    searchRef: searchClaimInputRef,
  });
  const {
    ModalComponent: PolicyModal,
    isLoading: isLoadingPolicyModal,
    openModal: openPolicyModal,
    closeModal: closePolicyModal,
  } = useQueryModalTable({
    link: {
      url: "/task/claims/claims/get-policy",
      queryUrlName: "searchPolicy",
    },
    columns: [
      { field: "PolicyNo", headerName: "Policy No.", width: 300 },
      { field: "AssuredName", headerName: "Name.", width: 350 },
      { field: "IDNo", headerName: "ID No.", width: 200 },
      { field: "ChassisNo", headerName: "Chassis No.", width: 200 },
    ],
    queryKey: "get-policy",
    uniqueId: "PolicyNo",
    responseDataKey: "claimPolicy",
    onSelected: (selectedRowData) => {
      setNewStateValue(policyDispatch, selectedRowData[0]);
      mutateClaimSelectedPolicyDetails({
        PolicyNo: selectedRowData[0].PolicyNo,
      });
    },
    searchRef: policySearchInputRef,
  });

  function sortList(data: any) {
    if (data.length <= 0) {
      return [];
    }
    const sortedData = data.sort((a: any, b: any) => {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    });
    return sortedData;
  }
  const handleTdClick = (itm: any) => {
    flushSync(() => {
      setShowModal(true);
    });
    const groupByLabel = (arr: any) => {
      const grouped: any = {};
      arr.forEach((item: any) => {
        if (!grouped[item.datakey]) {
          grouped[item.datakey] = [];
        }
        grouped[item.datakey].push(item);
      });

      return Object.entries(grouped);
    };
    const displayFile = (groupedData: Array<any>) => {
      groupedData.forEach(([datakey, items]: any) => {
        const fileList = new DataTransfer();
        const input = document.querySelector(
          `#${datakey} input`
        ) as HTMLInputElement;
        items.forEach((itm: any) => {
          fileList.items.add(itm.file);
        });
        input.files = fileList.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    };
    setNewStateValue(policyDispatch, itm.policyState);
    displayFile(groupByLabel(itm.basicFileCustom));
    displayFile(groupByLabel(itm.otherFileCustom));
    displayFile(groupByLabel(itm.insuranceFileCustom));
    handleInputChange({
      target: { name: "claim_no", value: itm.id },
    });
  };

  const clickClaimInformationSheet = () => {
    localStorage.setItem("paper-width", "8.5in");
    localStorage.setItem("paper-height", "13in");
    let printString = (claimdsDetails: any) => {
      return (
        <div>
          <div
            style={{
              borderBottom: "3px solid black",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {claimdsDetails.department === 0
                ? "UPWARD INSURANCE SERVICES AND MANAGEMENT INC."
                : "UPWARD CONSULTANT SERVICES AND MANAGEMENT INC."}
            </h3>
          </div>
          <h1
            style={{
              textAlign: "center",
              fontWeight: "bolder",
            }}
          >
            CLAIMS INFORMATION SHEET
          </h1>
          <p
            style={{
              textAlign: "right",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            <p
              style={{
                textAlign: "right",
                fontSize: "16px",
              }}
            >
              <span style={{ fontWeight: "bolder" }}>CLAIM NO.: </span>
              <span style={{ fontWeight: "bold" }}>
                {" "}
                {claimdsDetails.claims_id}
              </span>
            </p>
          </p>
          <div
            style={{
              minHeight: "200px",
              maxHeight: "auto",
              marginBottom: "20px",
              display: "flex",
              border: "2px solid black",
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: "200px",
                maxHeight: "auto",
                borderRight: "2px solid black",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bolder",
                  }}
                >
                  Assured's Name
                </span>
                <span style={{ width: "40px", textAlign: "left" }}>:</span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {claimdsDetails.AssuredName}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bolder",
                  }}
                >
                  Unit Insured
                </span>
                <span style={{ width: "40px", textAlign: "left" }}>:</span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {claimdsDetails.policy === "COM" ||
                  claimdsDetails.policy === "TPL"
                    ? `${claimdsDetails.Model} ${claimdsDetails.Make} ${claimdsDetails.BodyType}`
                    : `${
                        claimdsDetails.policy === "PA"
                          ? "Group Personal Accident"
                          : claimdsDetails.policy
                      }`}
                </span>
              </div>
              {claimdsDetails.policy === "VPolicy" && (
                <>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      padding: "0 10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "bolder",
                      }}
                    >
                      Engine No.
                    </span>
                    <span style={{ width: "40px", textAlign: "left" }}>:</span>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      {claimdsDetails.MotorNo}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      padding: "0 10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "bolder",
                      }}
                    >
                      Chassis No.
                    </span>
                    <span style={{ width: "40px", textAlign: "left" }}>:</span>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      {claimdsDetails.ChassisNo}
                    </span>
                  </div>
                </>
              )}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bolder",
                  }}
                >
                  Inception
                </span>
                <span style={{ width: "40px", textAlign: "left" }}>:</span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {`${format(
                    new Date(claimdsDetails.DateFrom),
                    "MMMM d, yyyy"
                  )} - ${format(new Date(claimdsDetails.DateTo), "yyyy")}`}
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: "bolder",
                  }}
                >
                  Type of Claim
                </span>
                <span style={{ width: "40px", textAlign: "left" }}>:</span>
                <div style={{ flex: 1 }}>
                  {listofClaim.map((d: any, idx) => {
                    return (
                      <p
                        style={{
                          textAlign: "left",
                          fontWeight: "bold",
                          padding: "0",
                          margin: "0",
                        }}
                        key={idx}
                      >
                        {claimType[d]}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              style={{
                width: "220px",
                alignSelf: "self-start",
                minHeight: "200px",
                maxHeight: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  borderBottom: "2px solid black",
                  padding: "0 10px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bolder",
                    marginLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: "10px",
                    padding: 0,
                  }}
                >
                  Date Prepared:
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {format(new Date(), "MMMM d, yyyy")}
                </p>
              </div>
              <div
                style={{
                  flex: 1,
                  borderBottom: "2px solid black",
                  padding: "0 10px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bolder",
                    marginLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: "10px",
                    padding: 0,
                  }}
                >
                  Policy No.
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {claimdsDetails.PolicyNo}
                </p>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "0 10px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bolder",
                    marginLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: "10px",
                    padding: 0,
                  }}
                >
                  Date of Accident
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {format(new Date(claimState.dateAccident), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              border: "2px solid black",
              height: "170px",
              position: "relative",
            }}
          >
            <p
              style={{
                borderBottom: "2px solid black",
                padding: "2px 5px",
                margin: "0",
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              {claimdsDetails.department === 0
                ? "Under Writer"
                : "Insurance Coordinator"}
            </p>
            <p
              style={{
                width: "200px",
                borderTop: "2px solid black",
                padding: "0",
                margin: "0",
                fontWeight: "bold",
                position: "absolute",
                right: "0",
                bottom: "20px",
                textAlign: "center",
              }}
            >
              {claimdsDetails.department === 0
                ? "Angelo Dacula"
                : "Rina Fernandez"}
            </p>
          </div>
          <div
            style={{
              borderBottom: "2px solid black",
              borderLeft: "2px solid black",
              borderRight: "2px solid black",
              height: "170px",
              position: "relative",
            }}
          >
            <p
              style={{
                borderBottom: "2px solid black",
                padding: "2px 5px",
                margin: "0",
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              Accounting
            </p>
            <p
              style={{
                width: "200px",
                borderTop: "2px solid black",
                padding: "0",
                margin: "0",
                fontWeight: "bold",
                position: "absolute",
                right: "0",
                bottom: "20px",
                textAlign: "center",
              }}
            >
              Gina Rondina
            </p>
            <div
              style={{
                padding: "2px 5px",
                margin: "0",
                fontWeight: "bold",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {parseFloat(
                      claimdsDetails.balance.toString().replace(/,/, "")
                    ) <= 0
                      ? "Fully Paid,"
                      : "Not Fully Paid,"}
                  </span>
                  <span
                    style={{
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {parseFloat(
                      claimdsDetails.balance.toString().replace(/,/, "")
                    ) <= 0
                      ? ""
                      : ` Total balance : ${claimdsDetails.balance}`}
                  </span>
                </div>
                <div>
                  <span>
                    {parseFloat(
                      claimdsDetails.remitted.toString().replace(/,/, "")
                    ) <= 0
                      ? "Not Remitted"
                      : "Remitted"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              borderBottom: "2px solid black",
              borderLeft: "2px solid black",
              borderRight: "2px solid black",
              height: "170px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                padding: "2px 5px",
                margin: "0",
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              Remarks:
            </p>
            <pre
              style={{
                padding: "2px 5px",
                margin: "0",
                fontWeight: "bold",
                textAlign: "left",
                fontSize: "15px",
              }}
            >
              {claimdsDetails.remarks}
            </pre>
          </div>
          <div
            style={{
              border: "2px solid black",
              height: "140px",
              display: "flex",
              justifyContent: "space-around",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                padding: "2px",
                margin: "0",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Prepared by
              </span>
              <span
                style={{
                  margin: "0",
                  fontWeight: "bold",
                  marginLeft: "100px",
                }}
              >
                Checked by
              </span>
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "auto",
                justifyContent: "space-between",
                padding: "0 10px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontWeight: "bolder",
                    fontSize: "19px ",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  Pio Mendoza
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  Claims Officer
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontWeight: "bolder",
                      margin: 0,
                      padding: 0,
                      fontSize: "19px ",
                    }}
                  >
                    Mary Grace Lanera
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Operations Supervisor
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontWeight: "bolder",
                      margin: 0,
                      padding: 0,
                      fontSize: "19px ",
                    }}
                  >
                    Leo Aquino
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    General Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    flushSync(() => {
      const elementString = ReactDOMServer.renderToString(
        printString({
          ...claimState,
          ...policyState,
        })
      );

      localStorage.setItem("printString", elementString);
    });
    window.open("/dashboard/print", "_blank");

    handleClose();
  };
  if (isLoadingClaimSelectedPolicyDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{ display: "flex", columnGap: "10px", flexDirection: "column" }}
    >
      <div style={{ display: "flex", columnGap: "10px" }}>
        {isLoadingClaimModal ? (
          <LoadingButton loading={isLoadingClaimModal} />
        ) : (
          <FormControl
            sx={{
              width: "400px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": {
                top: "-5px",
              },
            }}
            variant="outlined"
            size="small"
          >
            <InputLabel htmlFor="search-claim-id">Search</InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
                legend: {
                  background: "red",
                },
              }}
              inputRef={policySearchInputRef}
              name="search"
              value={claimState.search}
              onChange={handleInputChange}
              id="search-claim-id"
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  return openClaimModal(claimState.search);
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      openClaimModal(claimState.search);
                    }}
                    edge="end"
                    color="secondary"
                  >
                    <PersonSearchIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Search"
            />
          </FormControl>
        )}
        {isLoadingClaimsId ? (
          <LoadingButton loading={isLoadingClaimsId} />
        ) : (
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              width: "140px",
              ".MuiFormLabel-root": {
                fontSize: "14px",
                background: "white",
                zIndex: 99,
                padding: "0 3px",
              },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-1px" },
            }}
          >
            <InputLabel htmlFor="claims_id">Claim ID.</InputLabel>
            <OutlinedInput
              sx={{
                height: "27px",
                fontSize: "14px",
              }}
              fullWidth
              label="Claim ID."
              name="claims_id"
              value={claimState.claims_id}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();
                  return refetchClaimsId();
                }
              }}
              readOnly={true}
              id="claims_id"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    color="secondary"
                    edge="end"
                    onClick={() => {
                      refetchClaimsId();
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
        <div>
          <Button
            disabled={claimState.mode !== "update"}
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            sx={{
              height: "30px",
              fontSize: "11px",
              color: "white",
              backgroundColor: grey[600],
              "&:hover": {
                backgroundColor: grey[700],
              },
            }}
          >
            Print
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={clickClaimInformationSheet}>
              Claim Information Sheet
            </MenuItem>
          </Menu>
        </div>
        <Button
          id="basic-button"
          aria-haspopup="true"
          sx={{
            height: "30px",
            fontSize: "11px",
          }}
          color="primary"
          variant="contained"
          onClick={() => {
            if (policyState.PolicyNo === "") {
              Swal.fire({
                title: "Opppss!",
                text: `You need to select policy first!`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: `Yes, select policy!`,
              }).then((result) => {
                if (result.isConfirmed) {
                  openPolicyModal(policyState.PolicyNo);
                }
              });
              return;
            }
            setNewStateValue(policyDispatch, {
              claim_type: 0,
              status: 0,
              DateReceived: null,
              DateClaim: null,
              AmountClaim: "",
              AmountApproved: "",
              NameTPPD: "",
            });
            setShowModal(true);
          }}
        >
          ADD
        </Button>
        <LoadingButton
          loading={isLoadingClaimSave}
          id="basic-button"
          aria-haspopup="true"
          sx={{
            height: "30px",
            fontSize: "11px",
          }}
          variant="contained"
          color="success"
          onClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: `You want to ${
                claimState.mode === "update" ? "save changes!" : "save it!"
              }`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: `Yes, ${
                claimState.mode === "update" ? "save changes!" : "save it!"
              } `,
            }).then(async (result) => {
              if (result.isConfirmed) {
                if (claimState.mode === "update") {
                  return codeCondfirmationAlert({
                    isUpdate: true,
                    cb: (userCodeConfirmation) => {
                      mutateClaimSave({
                        ...claimState,
                        claimsSubmited,
                        userCodeConfirmation,
                      });
                    },
                  });
                } else {
                  return mutateClaimSave({ ...claimState, claimsSubmited });
                }
              }
            });
          }}
        >
          {claimState.mode === "update" ? "SAVE CHANGES" : "SAVE"}
        </LoadingButton>
        {claimState.mode === "update" && (
          <Button
            variant="contained"
            color="error"
            aria-haspopup="true"
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: `You want to discard the changes!`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, discard it!",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  setNewStateValue(claimDispatch, initialClaimState);
                  setNewStateValue(policyDispatch, initialPolicyState);
                  setClaimsSubmited([]);
                  refetchClaimsId();
                }
              });
            }}
          >
            Discard Changes
          </Button>
        )}
        {policyState.PolicyNo !== "" && claimState.mode !== "update" && (
          <Button
            id="basic-button"
            aria-haspopup="true"
            sx={{
              height: "30px",
              fontSize: "11px",
            }}
            color="error"
            variant="contained"
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: `You want to cancel!`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: `Yes, Cancel it!`,
              }).then(async (result) => {
                if (result.isConfirmed) {
                  setNewStateValue(claimDispatch, initialClaimState);
                  setNewStateValue(policyDispatch, initialPolicyState);
                  setClaimsSubmited([]);
                  refetchClaimsId();
                }
              });
            }}
          >
            CANCEL
          </Button>
        )}
      </div>
      <div style={{ display: "flex", marginTop: "20px", columnGap: "10px" }}>
        <CustomDatePicker
          textField={{
            InputLabelProps: {
              style: {
                fontSize: "14px",
              },
            },
            InputProps: {
              style: { height: "27px", fontSize: "14px" },
            },
          }}
          label="Date Reported"
          onChange={(value: any) => {
            claimDispatch({
              type: "UPDATE_FIELD",
              field: "dateReported",
              value: value,
            });
          }}
          value={
            claimState.dateReported ? new Date(claimState.dateReported) : null
          }
          onKeyDown={(e: any) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              const timeout = setTimeout(() => {
                datePickerRef.current?.querySelector("button")?.click();
                clearTimeout(timeout);
              }, 150);
            }
          }}
          datePickerRef={datePickerRef}
        />
        <CustomDatePicker
          textField={{
            InputLabelProps: {
              style: {
                fontSize: "14px",
              },
            },
            InputProps: {
              style: { height: "27px", fontSize: "14px" },
            },
          }}
          label="Date Accident"
          onChange={(value: any) => {
            claimDispatch({
              type: "UPDATE_FIELD",
              field: "dateAccident",
              value: value,
            });
          }}
          value={
            claimState.dateAccident ? new Date(claimState.dateAccident) : null
          }
          onKeyDown={(e: any) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              const timeout = setTimeout(() => {
                dateAccidentRef.current?.querySelector("button")?.click();
                clearTimeout(timeout);
              }, 150);
            }
          }}
          datePickerRef={dateAccidentRef}
        />
        <CustomDatePicker
          textField={{
            InputLabelProps: {
              style: {
                fontSize: "14px",
              },
            },
            InputProps: {
              style: { height: "27px", fontSize: "14px" },
            },
          }}
          label="Date Inspected"
          onChange={(value: any) => {
            claimDispatch({
              type: "UPDATE_FIELD",
              field: "dateInspected",
              value: value,
            });
          }}
          value={
            claimState.dateInspected ? new Date(claimState.dateInspected) : null
          }
          onKeyDown={(e: any) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") {
              const timeout = setTimeout(() => {
                dateInspectedRef.current?.querySelector("button")?.click();
                clearTimeout(timeout);
              }, 150);
            }
          }}
          datePickerRef={dateInspectedRef}
        />
        <FormControl
          sx={{
            width: "200px",
            ".MuiFormLabel-root": {
              fontSize: "14px",
              background: "white",
              zIndex: 99,
              padding: "0 3px",
            },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
          }}
        >
          <InputLabel id="department-field">Department</InputLabel>
          <Select
            labelId="department-field"
            value={claimState.department}
            onChange={handleInputChange}
            label="department"
            size="small"
            name="department"
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
            fullWidth
          >
            {["UMIS", "UCSMI"].map((itm, idx) => {
              return (
                <MenuItem key={idx} value={idx}>
                  {itm}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          name="remarks"
          label="Remarks"
          size="small"
          value={claimState.remarks}
          onChange={handleInputChange}
          InputProps={{
            style: {
              height: "27px",
              fontSize: "14px",
              color: "whie",
            },
          }}
          sx={{
            width: "100%",
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": {
              top: "-5px",
            },
          }}
        />
      </div>
      <fieldset
        style={{
          display: "flex",
          columnGap: "15px",
          padding: "10px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          position: "relative",
        }}
      >
        <legend>Policy Details</legend>
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "15px",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: "1",
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "7px",
            }}
          >
            {isLoadingPolicyModal ? (
              <LoadingButton loading={isLoadingPolicyModal} />
            ) : (
              <FormControl
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": {
                    fontSize: "14px",
                    background: "white",
                    zIndex: 99,
                    padding: "0 3px",
                  },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="policy-no">Policy No.</InputLabel>
                <OutlinedInput
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                    legend: {
                      background: "red",
                    },
                  }}
                  inputRef={policySearchInputRef}
                  name="PolicyNo"
                  value={policyState.PolicyNo}
                  onChange={handleInputChange}
                  id="policy-no"
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      return openPolicyModal(policyState.PolicyNo);
                    }
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        disabled={policyState.mode === ""}
                        onClick={() => {
                          openPolicyModal(policyState.PolicyNo);
                        }}
                        edge="end"
                        color="secondary"
                      >
                        <PersonSearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Policy No."
                />
              </FormControl>
            )}
            <TextField
              name="policy"
              label="Policy"
              size="small"
              value={policyState.policy}
              onChange={handleInputChange}
              InputProps={{
                style: {
                  height: "27px",
                  fontSize: "14px",
                  color: "whie",
                },
                readOnly: true,
              }}
              sx={{
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="AssuredName"
              label="Assured Name"
              size="small"
              value={policyState.AssuredName}
              onChange={handleInputChange}
              InputProps={{
                style: {
                  height: "27px",
                  fontSize: "14px",
                  color: "whie",
                },
                readOnly: true,
              }}
              sx={{
                gridColumn: "3/ span 2",
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="Account"
              label="Account Insurance"
              size="small"
              value={policyState.Account}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="Model"
              label="Model"
              size="small"
              value={policyState.Model}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="PlateNo"
              label="Plate No"
              size="small"
              value={policyState.PlateNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="ChassisNo"
              label="Chassis No"
              size="small"
              value={policyState.ChassisNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="MotorNo."
              label="Motor No"
              size="small"
              value={policyState.MotorNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="CoverNo"
              label="Cover No"
              size="small"
              value={policyState.CoverNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="BLTFileNo"
              label="BLTFileNo"
              size="small"
              value={policyState.BLTFileNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="BodyType"
              label="Body Type"
              size="small"
              value={policyState.BodyType}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="Make"
              label="Make"
              size="small"
              value={policyState.Make}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
            <TextField
              name="ORNo"
              label="OR No."
              size="small"
              value={policyState.ORNo}
              onChange={handleInputChange}
              InputProps={{
                style: { height: "27px", fontSize: "14px" },
                readOnly: true,
              }}
              sx={{
                width: "100%",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": {
                  top: "-5px",
                },
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gap: "15px",
              flex: "1",
              gridTemplateColumns: "repeat(4,1fr)",
            }}
          >
            <fieldset
              style={{
                display: "flex",
                gap: "15px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                gridTemplateColumns: "repeat(4,1fr)",
                gridColumn: "1 / span 3",
              }}
            >
              <legend>Client Payment</legend>
              <TextField
                name="totaDue"
                label="Total Due"
                size="small"
                value={policyState.totaDue}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
              />
              <TextField
                name="totalpaid"
                label="Total Paid"
                size="small"
                value={policyState.totalpaid}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
              />
              <TextField
                name="balance"
                label="Balance"
                size="small"
                value={policyState.balance}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
              />
            </fieldset>
            <fieldset
              style={{
                display: "flex",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
              }}
            >
              <legend>Insurance Payment</legend>
              <TextField
                name="remitted"
                label="Remitted"
                size="small"
                value={policyState.remitted}
                onChange={handleInputChange}
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  readOnly: true,
                }}
                sx={{
                  width: "100%",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
              />
            </fieldset>
          </div>
        </div>
      </fieldset>
      <div
        style={{
          marginTop: "20px",
          border: "1px solid #94a3b8",
          minHeight: "600px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>LIST OF CLAIMS</h1>
        <div style={{ padding: "20px", display: "flex", flexWrap: "wrap" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: "13px",
            }}
            className="claim-list"
          >
            <thead>
              <tr style={{ borderBottom: "1px solid black" }}>
                <th>ACTION</th>
                <th>CLAIM TYPE</th>
                <th>STATUS</th>
                <th>DATE RECEIVED</th>
                <th>DATE CLAIM</th>
                <th>AMOUNT CLAIM</th>
                <th>AMOUNT APPROVED</th>
              </tr>
            </thead>
            <tbody>
              {claimsSubmited.length > 0 &&
                sortList(claimsSubmited)?.map((itm: any, idx: number) => {
                  const statusArray = claimsStatus.sort();
                  return (
                    <tr key={idx}>
                      <td className="left">
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          justifyContent={"center"}
                        >
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleTdClick(itm)}
                          >
                            <VisibilityIcon fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              const title = document.createElement("h1");
                              const div = document.createElement("div");
                              const content = document.createElement("div");
                              title.textContent = "Claim Summary";
                              const contentchild =
                                document.createElement("div");
                              const buttonClose =
                                document.createElement("button");
                              const body = document.body;

                              const basic = itm.basicFileCustom.map(
                                (d: any) => d.datakey
                              );

                              const uniqueBasicArray = basic.filter(
                                (item: any, index: number) =>
                                  basic.indexOf(item) === index
                              );

                              const other = itm.otherFileCustom.map(
                                (d: any) => d.datakey
                              );
                              const uniqueOtherArray = other.filter(
                                (item: any, index: number) =>
                                  other.indexOf(item) === index
                              );

                              const insuranceFile = itm.insuranceFileCustom.map(
                                (d: any) => d.datakey
                              );

                              const uniqueInsuranceArray = insuranceFile.filter(
                                (item: any, index: number) =>
                                  insuranceFile.indexOf(item) === index
                              );

                              const tableString = (
                                <table style={{ fontSize: "12px" }}>
                                  <tbody>
                                    <tr>
                                      <td className="datakey">Claim Type</td>
                                      <td>
                                        {claimType[itm.policyState.claim_type]}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="datakey">Status</td>
                                      <td>
                                        {statusArray[itm.policyState.status]}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="datakey">Date Received</td>
                                      <td>
                                        {itm.policyState.DateReceived
                                          ? format(
                                              new Date(
                                                itm.policyState.DateReceived
                                              ),
                                              "yyyy/MM/dd"
                                            )
                                          : "Not Set"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="datakey">Date Claim</td>
                                      <td>
                                        {itm.policyState.DateClaim
                                          ? format(
                                              new Date(
                                                itm.policyState.DateClaim
                                              ),
                                              "yyyy/MM/dd"
                                            )
                                          : "Not Set"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="datakey">Amount Claim</td>
                                      <td>
                                        {itm.policyState.AmountClaim ?? ""}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="datakey">
                                        Amount Approved
                                      </td>
                                      <td>
                                        {itm.policyState.AmountApproved ?? ""}
                                      </td>
                                    </tr>
                                    {itm.policyState.claim_type > 1 && (
                                      <tr>
                                        <td className="datakey">
                                          Name of Third Party
                                        </td>
                                        <td>{itm.policyState.NameTPPD}</td>
                                      </tr>
                                    )}
                                    <tr
                                      style={{
                                        borderTop: "1px solid black",
                                        borderBottom: "1px solid black",
                                      }}
                                    >
                                      <td
                                        colSpan={2}
                                        style={{
                                          fontWeight: "bolder",
                                          padding: "5px",
                                          color: "#d97706",
                                        }}
                                      >
                                        Basic Document
                                      </td>
                                    </tr>
                                    {basicDocuments.map((itm, idx) => {
                                      return (
                                        <tr key={idx}>
                                          <td className="datakey">
                                            {itm.label}
                                          </td>
                                          <td>
                                            {uniqueBasicArray.includes(
                                              itm.name
                                            ) ? (
                                              <span style={{ color: "green" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="20px"
                                                  height="20px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M4 14L9 19L20 8M6 8.88889L9.07692 12L16 5"
                                                    stroke="green"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </span>
                                            ) : (
                                              <span style={{ color: "grey" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="15px"
                                                  height="15px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                                    fill="grey"
                                                  />
                                                </svg>
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr
                                      style={{
                                        borderTop: "1px solid black",
                                        borderBottom: "1px solid black",
                                      }}
                                    >
                                      <td
                                        colSpan={2}
                                        style={{
                                          fontWeight: "bolder",
                                          padding: "5px",
                                          color: "#d97706",
                                        }}
                                      >
                                        Other Document
                                      </td>
                                    </tr>
                                    {renderFields()[
                                      itm.policyState.claim_type
                                    ].map((itm, idx) => {
                                      return (
                                        <tr key={idx}>
                                          <td className="datakey">
                                            {itm.label}
                                          </td>
                                          <td>
                                            {uniqueOtherArray.includes(
                                              itm.name
                                            ) ? (
                                              <span style={{ color: "green" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="20px"
                                                  height="20px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M4 14L9 19L20 8M6 8.88889L9.07692 12L16 5"
                                                    stroke="green"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </span>
                                            ) : (
                                              <span style={{ color: "grey" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="15px"
                                                  height="15px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                                    fill="grey"
                                                  />
                                                </svg>
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr
                                      style={{
                                        borderTop: "1px solid black",
                                        borderBottom: "1px solid black",
                                      }}
                                    >
                                      <td
                                        colSpan={2}
                                        style={{
                                          fontWeight: "bolder",
                                          padding: "5px",
                                          color: "#d97706",
                                        }}
                                      >
                                        Insurance Documents
                                      </td>
                                    </tr>
                                    {insuranceDocuments.map((itm, idx) => {
                                      return (
                                        <tr key={idx}>
                                          <td className="datakey">
                                            {itm.label}
                                          </td>
                                          <td>
                                            {uniqueInsuranceArray.includes(
                                              itm.name
                                            ) ? (
                                              <span style={{ color: "green" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="20px"
                                                  height="20px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M4 14L9 19L20 8M6 8.88889L9.07692 12L16 5"
                                                    stroke="green"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </span>
                                            ) : (
                                              <span style={{ color: "grey" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="15px"
                                                  height="15px"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                                    fill="grey"
                                                  />
                                                </svg>
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              );
                              const elementString =
                                ReactDOMServer.renderToString(tableString);
                              contentchild.innerHTML = elementString;

                              div.appendChild(content);
                              content.appendChild(buttonClose);
                              content.appendChild(title);
                              content.appendChild(contentchild);
                              div.className = "summary-modal ";
                              content.className = "content ";
                              div.id = "summary-modal";

                              buttonClose?.addEventListener("click", () => {
                                body.removeChild(div);
                              });
                              content?.addEventListener("click", (e) => {
                                e.stopPropagation();
                              });

                              div?.addEventListener("click", () => {
                                body.removeChild(div);
                              });
                              buttonClose.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                              <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#0F0F0F"/>
                              </svg>
                              `;

                              body.appendChild(div);
                            }}
                          >
                            <ArticleIcon fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: `You want to delete it!, won't be able to revert this!`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Yes, Delete it!",
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  setClaimsSubmited((d) => {
                                    d = d.filter((d: any) => d.id !== itm.id);
                                    return d;
                                  });
                                }
                              });
                            }}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Stack>
                      </td>
                      <td onDoubleClick={() => handleTdClick(itm)}>
                        {claimType[itm.policyState.claim_type]}
                      </td>
                      <td onDoubleClick={() => handleTdClick(itm)}>
                        {statusArray[itm.policyState.status] === ""
                          ? "Status not set"
                          : statusArray[itm.policyState.status]}
                      </td>
                      <td
                        onDoubleClick={() => handleTdClick(itm)}
                        className="center"
                      >
                        {itm.policyState.DateReceived
                          ? format(
                              new Date(itm.policyState.DateReceived),
                              "yyyy-MM-dd"
                            )
                          : "Date Received not set"}
                      </td>
                      <td
                        onDoubleClick={() => handleTdClick(itm)}
                        className="center"
                      >
                        {itm.policyState.DateClaim
                          ? format(
                              new Date(itm.policyState.DateClaim),
                              "yyyy-MM-dd"
                            )
                          : "Date Claim not set"}
                      </td>

                      <td
                        onDoubleClick={() => handleTdClick(itm)}
                        className="center"
                      >
                        {itm.policyState.AmountClaim === ""
                          ? "0.00"
                          : itm.policyState.AmountClaim}
                      </td>
                      <td
                        onDoubleClick={() => handleTdClick(itm)}
                        className="center"
                      >
                        {itm.policyState.AmountApproved === ""
                          ? "0.00"
                          : itm.policyState.AmountApproved}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      {SearchClaimModal}
      {showModal && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(158, 155, 157, 0.31)",
            zIndex: "999",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              overflow: "auto",
              background: "white",
              padding: "20px",
              margin: "auto",
              zIndex: "9929",
              boxShadow: " -1px 1px 13px 6px rgba(0,0,0,0.54)",
            }}
          >
            <ClaimModal
              handleCloseModal={() => {
                setShowModal(false);
              }}
              setClaimsSubmited={setClaimsSubmited}
              claim_no={claimState.claim_no}
              policyState={policyState}
              policyDispatch={policyDispatch}
              claimDispatch={claimDispatch}
            />
          </div>
        </div>
      )}
      {isLoadingSelectedSearch && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "rgba(158, 155, 157, 0.31)",
            zIndex: "999",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={`${process.env.REACT_APP_IMAGE_URL}image/loading.gif`}
            style={{ width: "80px", height: "80px" }}
            alt="we"
          />
        </div>
      )}
      {PolicyModal}
    </div>
  );
}

function ClaimModal({
  handleCloseModal,
  setClaimsSubmited,
  claim_no,
  policyDispatch,
  policyState,
  claimDispatch,
}: any) {
  const otherFileInputRef = useRef<any>(null);
  const DateReceivedRef = useRef<HTMLDivElement>(null);
  const DateClaimceivedRef = useRef<HTMLDivElement>(null);
  const AmountClaimInputRef = useRef<HTMLInputElement>(null);
  const AmountApprovedInputRef = useRef<HTMLInputElement>(null);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    policyDispatch({ type: "UPDATE_FIELD", field: name, value });
  };
  const handleModalSave = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to save it!, won't be able to revert this!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it!",
    }).then(async (result) => {
      function filetransfer(arr: Array<any>, fileBasicPromises: Array<any>) {
        const dataFile: any = [];
        arr.forEach((itm) => {
          const input: any = document.querySelector(`#${itm.name} input`);
          const files = input.files;
          dataFile.push({
            files,
            datakey: itm.name,
          });
          if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const reader = new FileReader();
              fileBasicPromises.push(
                new Promise((resolve, reject) => {
                  reader.onload = function (event) {
                    resolve({
                      datakey: itm.name,
                      fileName: file.name,
                      fileContent: event.target?.result,
                      fileType: file.type,
                      file,
                    });
                  };
                  reader.onerror = function (event) {
                    reject(new Error("Error reading file: " + file.name));
                  };
                  reader.readAsDataURL(file);
                })
              );
            }
          }
        });
        return fileBasicPromises;
      }
      if (result.isConfirmed) {
        const fileBasicPromises: Array<any> = [];
        filetransfer(basicDocuments, fileBasicPromises);

        let fileOtherPromises: Array<any> = [];
        renderFields().forEach((parent) => {
          filetransfer(parent, fileOtherPromises);
        });

        const fileInsurancePromises: Array<any> = [];
        filetransfer(insuranceDocuments, fileInsurancePromises);

        const basicFileCustom = await Promise.all(fileBasicPromises);
        const otherFileCustom = await Promise.all(fileOtherPromises);
        const insuranceFileCustom = await Promise.all(fileInsurancePromises);

        setClaimsSubmited((d: any) => {
          let id = "";

          if (claim_no && claim_no.trim() !== "") {
            id = claim_no;
            d = d.filter((itm: any) => itm.id !== claim_no);
          } else {
            id = padNumber(d.length + 1, 3);
          }

          d.push({
            id,
            policyState,
            basicFileCustom,
            otherFileCustom,
            insuranceFileCustom,
          });
          return d;
        });
        claimDispatch({
          type: "UPDATE_FIELD",
          field: "claim_no",
          value: "",
        });
        handleInputChange({
          target: {
            name: "claim_type",
            value: 0,
          },
        });
        handleInputChange({
          target: {
            name: "status",
            value: 0,
          },
        });
        handleCloseModal();
      }
      function padNumber(number: number, length: number) {
        return String(number).padStart(length, "0");
      }
    });
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "30px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              padding: "10px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                columnGap: "10px",
              }}
            >
              <Button
                id="basic-button"
                aria-haspopup="true"
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                color="success"
                onClick={handleModalSave}
              >
                SAVE
              </Button>
              <Button
                id="basic-button"
                aria-haspopup="true"
                sx={{
                  height: "30px",
                  fontSize: "11px",
                }}
                variant="contained"
                color="error"
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: `You want to cancel it!, won't be able to revert this!`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Cancel it!",
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      claimDispatch({
                        type: "UPDATE_FIELD",
                        field: "claim_no",
                        value: "",
                      });
                      handleInputChange({
                        target: {
                          name: "claim_type",
                          value: 0,
                        },
                      });
                      handleInputChange({
                        target: {
                          name: "status",
                          value: 0,
                        },
                      });
                      handleCloseModal();
                      return;
                    }
                  });
                }}
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <FormControl
              sx={{
                width: "300px",
                marginRight: "10px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
              }}
            >
              <InputLabel id="claim-type">Claim Types</InputLabel>
              <Select
                labelId="claim-type"
                value={policyState.claim_type}
                onChange={(e) => {
                  handleInputChange(e);
                  otherFileInputRef.current?.resetFileUpload();
                }}
                label="Claim Types"
                size="small"
                name="claim_type"
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                fullWidth
              >
                {claimType.map((itm, idx) => {
                  return (
                    <MenuItem key={idx} value={idx}>
                      {itm}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                width: "300px",
                marginRight: "10px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
              }}
            >
              <InputLabel id="status">Status</InputLabel>
              <Select
                labelId="status"
                value={policyState.status}
                onChange={handleInputChange}
                label="Status"
                size="small"
                name="status"
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
                fullWidth
              >
                {claimsStatus.sort().map((itm, idx) => {
                  return (
                    <MenuItem key={idx} value={idx}>
                      {itm}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <CustomDatePicker
              textField={{
                InputLabelProps: {
                  style: {
                    fontSize: "14px",
                  },
                },
                InputProps: {
                  style: { height: "27px", fontSize: "14px" },
                },
              }}
              label="Date Received"
              onChange={(value: any) => {
                policyDispatch({
                  type: "UPDATE_FIELD",
                  field: "DateReceived",
                  value: value,
                });
              }}
              value={
                policyState.DateReceived
                  ? new Date(policyState.DateReceived)
                  : null
              }
              onKeyDown={(e: any) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  const timeout = setTimeout(() => {
                    DateReceivedRef.current?.querySelector("button")?.click();
                    clearTimeout(timeout);
                  }, 150);
                }
              }}
              datePickerRef={DateReceivedRef}
            />
            <CustomDatePicker
              textField={{
                InputLabelProps: {
                  style: {
                    fontSize: "14px",
                  },
                },
                InputProps: {
                  style: { height: "27px", fontSize: "14px" },
                },
              }}
              label="Date of Claim"
              onChange={(value: any) => {
                policyDispatch({
                  type: "UPDATE_FIELD",
                  field: "DateClaim",
                  value: value,
                });
              }}
              value={
                policyState.DateClaim ? new Date(policyState.DateClaim) : null
              }
              onKeyDown={(e: any) => {
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  const timeout = setTimeout(() => {
                    DateClaimceivedRef.current
                      ?.querySelector("button")
                      ?.click();
                    clearTimeout(timeout);
                  }, 150);
                }
              }}
              datePickerRef={DateClaimceivedRef}
            />
            <TextField
              label="Amount Claim"
              size="small"
              name="AmountClaim"
              value={policyState.AmountClaim}
              onChange={handleInputChange}
              onBlur={() => {
                policyDispatch({
                  type: "UPDATE_FIELD",
                  field: "AmountClaim",
                  value: parseFloat(
                    (policyState.AmountClaim === ""
                      ? "0"
                      : policyState.AmountClaim
                    ).replace(/,/g, "")
                  ).toFixed(2),
                });
              }}
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                inputRef: AmountClaimInputRef,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "160px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            <TextField
              label="Amount Approved"
              size="small"
              name="AmountApproved"
              value={policyState.AmountApproved}
              onChange={handleInputChange}
              onBlur={() => {
                policyDispatch({
                  type: "UPDATE_FIELD",
                  field: "AmountApproved",
                  value: parseFloat(
                    (policyState.AmountApproved === ""
                      ? "0"
                      : policyState.AmountApproved
                    ).replace(/,/g, "")
                  ).toFixed(2),
                });
              }}
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                inputRef: AmountApprovedInputRef,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                width: "160px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            />
            {policyState.claim_type > 1 && (
              <TextField
                name="NameTPPD"
                label="Name of Third Party"
                size="small"
                value={policyState.NameTPPD}
                onChange={handleInputChange}
                InputProps={{
                  style: {
                    height: "27px",
                    fontSize: "14px",
                    color: "whie",
                  },
                }}
                sx={{
                  width: "400px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": {
                    top: "-5px",
                  },
                }}
              />
            )}
          </div>
          <fieldset
            style={{
              marginTop: "10px",
              display: "flex",
              columnGap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend>Basic Documents</legend>
            <BasicDocument state={policyState} />
          </fieldset>
          <fieldset
            style={{
              marginTop: "10px",
              display: "flex",
              columnGap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend>Other Documents</legend>
            <OtherDocument
              state={policyState}
              otherFileInputRef={otherFileInputRef}
            />
          </fieldset>
          <fieldset
            style={{
              marginTop: "10px",
              display: "flex",
              columnGap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend>Insurance Documents</legend>
            <InsuranceDocument state={policyState} />
          </fieldset>
        </div>
      </div>
    </>
  );
}
function BasicDocument({ state }: any) {
  const [activeListBasicDocument, setActiveListBasicDocument] =
    useState("policyFile");
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "500px",
        maxHeight: "500px",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          paddingRight: "10px",
          minWidth: "300px",
        }}
      >
        {basicDocuments.map((itm, idx) => {
          return (
            <MyButton
              key={idx}
              itm={itm}
              setActiveListBasicDocument={setActiveListBasicDocument}
              activeListBasicDocument={activeListBasicDocument}
              disabled={state.mode === ""}
            />
          );
        })}
      </div>
      {basicDocuments.map((itm, idx) => {
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              width: "100%",
              position: "relative",
              display: itm.name === activeListBasicDocument ? "block" : "none",
            }}
            id={itm.name}
          >
            <FileUploadInput />
          </div>
        );
      })}
    </div>
  );
}
export default Claims;
function OtherDocument({ state, otherFileInputRef }: any) {
  const [activeListBasicDocument, setActiveListBasicDocument] =
    useState("policyFile");

  useEffect(() => {
    const data = renderFields();
    setActiveListBasicDocument(data[state.claim_type][0].name);
  }, [state.claim_type]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "500px",
        maxHeight: "500px",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          paddingRight: "10px",
          minWidth: "300px",
        }}
      >
        {renderFields().map((r, Ridx) => {
          return (
            <div
              key={Ridx}
              style={{
                display: state.claim_type === Ridx ? "block" : "none",
              }}
            >
              {r.map((c, cIdx) => {
                return (
                  <MyButton
                    key={cIdx}
                    itm={c}
                    setActiveListBasicDocument={setActiveListBasicDocument}
                    activeListBasicDocument={activeListBasicDocument}
                    disabled={state.mode === ""}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      {renderFields().map((r, Ridx) => {
        return (
          <React.Fragment key={Ridx}>
            {r.map((c, cIdx) => {
              return (
                <div
                  key={cIdx}
                  style={{
                    flex: 1,
                    width: "100%",
                    position: "relative",
                    display:
                      c.name === activeListBasicDocument ? "block" : "none",
                  }}
                  id={c.name}
                >
                  <FileUploadInput ref={otherFileInputRef} />
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
function InsuranceDocument({ state }: any) {
  const [activeListBasicDocument, setActiveListBasicDocument] = useState("loa");
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "500px",
        maxHeight: "500px",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          paddingRight: "10px",
          minWidth: "300px",
        }}
      >
        {insuranceDocuments.map((itm, idx) => {
          return (
            <MyButton
              key={idx}
              itm={itm}
              setActiveListBasicDocument={setActiveListBasicDocument}
              activeListBasicDocument={activeListBasicDocument}
              disabled={state.mode === ""}
            />
          );
        })}
      </div>
      {insuranceDocuments.map((itm, idx) => {
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              width: "100%",
              position: "relative",
              display: itm.name === activeListBasicDocument ? "block" : "none",
            }}
            id={itm.name}
          >
            <FileUploadInput />
          </div>
        );
      })}
    </div>
  );
}
function MyButton({
  setActiveListBasicDocument,
  activeListBasicDocument,
  itm,
  disabled,
}: any) {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      onClick={() => {
        setActiveListBasicDocument(itm.name);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: "10px",
        fontSize: "13px",
        cursor: "pointer",
        background:
          activeListBasicDocument === itm.name
            ? "black"
            : isHovered
            ? "#f1f5f9"
            : "transparent",
        color: activeListBasicDocument === itm.name ? "white" : "black",
        border: "none",
        textAlign: "left",
      }}
    >
      {itm.label}
    </button>
  );
}
export function setNewStateValue(dispatch: any, obj: any) {
  Object.entries(obj).forEach(([field, value]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  });
}
export const FileUploadInput = forwardRef((props, ref) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([]);
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;
    const files = Array.from(fileList);
    const newFiles = [...selectedFiles, ...files];
    setIsDragging(false);
    if (checkFile(newFiles)) {
      fileInput.current?.click();
      return alert("file is not valid Extention!");
    } else {
      setSelectedFiles(newFiles);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files as FileList;

    const files = Array.from(fileList);
    const newFiles = [...selectedFiles, ...files];
    if (checkFile(newFiles)) {
      return alert("file is not valid Extention!");
    }
    setSelectedFiles(newFiles);
  };

  useEffect(() => {
    if (selectedFiles.length <= 0) return;
    function arrayToFileList(filesArray: Array<File>) {
      const dataTransfer = new DataTransfer();
      filesArray.forEach((file) => {
        dataTransfer.items.add(file);
      });
      return dataTransfer.files;
    }
    const fileList = arrayToFileList(selectedFiles);
    if (fileInput.current) {
      fileInput.current.files = fileList;
    }
  }, [selectedFiles]);

  useImperativeHandle(ref, () => ({
    resetFileUpload: () => {
      setSelectedFiles([]);
    },
  }));

  return (
    <>
      <button
        onClick={() => {
          setSelectedFiles([]);
          const form = document.getElementById(id)
            ?.parentElement as HTMLFormElement;
          form.reset();
        }}
        id="reset-buton"
        style={{
          display: "none",
        }}
      >
        resetALl
      </button>
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            height: "400px",
            width: "100%",
            background: "#f8fafc",
            overflow: "auto",
            border: isDragging ? "1px solid #c026d3" : "1px solid #cbd5e1",
            boxSizing: "border-box",
            padding: "10px",
          }}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            style={{
              height: "auto",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              ...(selectedFiles.length <= 0 && {
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
              }),
              gap: "10px",
              marginBottom: "50px",
            }}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFiles.length <= 0 ? (
              <CloudUploadIcon
                sx={{ fontSize: "8em", color: "#d1d5db", zIndex: "2" }}
              />
            ) : (
              selectedFiles.map((itm, idx) => {
                return (
                  <DisplayFile
                    key={idx}
                    itm={itm}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    fileInput={fileInput}
                  />
                );
              })
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
          draggable={false}
        ></div>
      </div>
      <form
        style={{
          position: "absolute",
          bottom: "1px",
          left: "1px",
          right: "1px",
          zIndex: "4",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "500",
            textAlign: "center",
            cursor: "pointer",
            padding: " 10px",
            background: "#0d9488",
            color: "white",
          }}
          htmlFor={id}
        >
          Click to Upload File
        </label>
        <input
          ref={fileInput}
          style={{ display: "none" }}
          id={id}
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
        />
      </form>
    </>
  );
});
export function DisplayFile({
  itm,
  selectedFiles,
  setSelectedFiles,
  fileInput,
}: {
  itm: File;
  selectedFiles: Array<File>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInput: React.RefObject<HTMLInputElement>;
}) {
  const objectUrl = URL.createObjectURL(itm);
  return (
    <div
      id="image-card"
      style={{
        position: "relative",
        width: "200px",
        height: "200px",
        textAlign: "center",
        boxShadow: "10px 10px 28px -7px rgba(0,0,0,0.75)",
        border: "1px solid #cbd5e1",
      }}
    >
      {itm.type.startsWith("image/") ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={objectUrl}
            alt="img-sss"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ) : (
        <iframe
          title="dasdseasd"
          src={objectUrl}
          style={{ width: "100%" }}
        ></iframe>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          background: "white",
          padding: "5px",
          display: "flex",
          columnGap: "10px",
          justifyContent: "center",
        }}
      >
        <IconButton
          color="primary"
          edge="end"
          onClick={() => {
            window.open(objectUrl, "_blank");
          }}
        >
          <RemoveRedEyeIcon />
        </IconButton>
        <IconButton
          color="success"
          edge="end"
          onClick={() => {
            var downloadLink: any = document.createElement("a");
            downloadLink.href = objectUrl;
            downloadLink.download = itm.name;
            downloadLink.click();
          }}
        >
          <CloudDownloadIcon />
        </IconButton>
        <IconButton
          color="error"
          edge="end"
          onClick={() => {
            const filesToRemove = [itm.name];
            const filteredFiles = selectedFiles.filter((file) => file !== itm);
            setSelectedFiles(filteredFiles);
            const newFileList = filterFileList(
              fileInput.current?.files as FileList,
              filesToRemove
            );
            if (fileInput.current && fileInput.current.files) {
              fileInput.current.files = newFileList;
            }
            function filterFileList(
              fileList: FileList,
              filesToRemove: Array<string>
            ) {
              const dataTransfer = new DataTransfer();
              for (let i = 0; i < fileList.length; i++) {
                if (!filesToRemove.includes(fileList[i].name)) {
                  dataTransfer.items.add(fileList[i]);
                }
              }
              return dataTransfer.files;
            }
          }}
        >
          <HighlightOffIcon />
        </IconButton>
      </div>
    </div>
  );
}
export function checkFile(newFiles: Array<File>) {
  let isNotExt = false;
  const fileTypes = ["application/pdf", "image/jpg", "image/jpeg", "image/png"];
  const newFileTpes = newFiles.map((itm) => itm.type);
  newFileTpes.forEach((fileType) => {
    if (!fileTypes.includes(fileType)) {
      isNotExt = true;
      return;
    }
  });
  return isNotExt;
}
