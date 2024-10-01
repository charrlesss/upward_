// import React, {
//   useState,
//   CSSProperties,
//   useContext,
//   useReducer,
//   useRef,
// } from "react";
// import jsPDF from "jspdf";
// import {
//   IconButton,
//   Fab,
//   TextField,
//   Select,
//   InputLabel,
//   MenuItem,
//   FormControl,
//   Button,
// } from "@mui/material";
// import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
// import CloseIcon from "@mui/icons-material/Close";
// import ReplyAllIcon from "@mui/icons-material/ReplyAll";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "react-query";
// import { AuthContext } from "../../../components/AuthContext";
// // import DataGridTable from "../../../components/DataGridTable";
// // import { GridRowSelectionModel } from "@mui/x-data-grid";
// // import Swal from "sweetalert2";
// import CustomDatePicker from "../../../components/DatePicker";
// import { NumericFormatCustom } from "../../../components/NumberFormat";

// export const columns = [
//   { field: "PolicyNo", headerName: "PolicyNo", width: 150 },
//   { field: "Shortname", headerName: "Shortname", flex: 1 },
//   { field: "PolicyType", headerName: "PolicyType", width: 100 },
// ];

// const initialState = {
//   injuryQuatationPremium: "100,000.00",
//   damageQuatationPremium: "100,000.00",
//   accidentQuatationPremiumInsured: "100000",
//   accidentQuatationPremiumPremium: "375",
//   passenger: "10000",
//   vehicle: "private",
//   datePrint: new Date(),
// };

// const privatePremiumsInjury = [
//   {
//     limit: "50,000.00",
//     motorcycle: "75.00",
//     heavy: "345.00",
//     private: "195.00",
//   },
//   {
//     limit: "75,000.00",
//     motorcycle: "90.00",
//     heavy: "405.00",
//     private: "225.00",
//   },
//   {
//     limit: "100,000.00",
//     motorcycle: "105.00",
//     heavy: "465.00",
//     private: "270.00",
//   },
//   {
//     limit: "150,000.00",
//     motorcycle: "120.00",
//     heavy: "555.00",
//     private: "345.00",
//   },
//   {
//     limit: "200,000.00",
//     motorcycle: "135.00",
//     heavy: "660.00",
//     private: "420.00",
//   },
//   {
//     limit: "250,000.00",
//     motorcycle: "150.00",
//     heavy: "750.00",
//     private: "510.00",
//   },
//   { limit: "300,000.00", motorcycle: "", heavy: "855.00", private: "585.00" },
//   { limit: "400,000.00", motorcycle: "", heavy: "975.00", private: "675.00" },
//   { limit: "500,000.00", motorcycle: "", heavy: "1,095.00", private: "780.00" },
//   { limit: "750,000.00", motorcycle: "", heavy: "1,230.00", private: "915.00" },
//   {
//     limit: "1,000,000.00",
//     motorcycle: "",
//     heavy: "1,365.00",
//     private: "1,050.00",
//   },
// ];

// const premiumsDamage = [
//   {
//     limit: "50,000.00",
//     private: "975.00",
//     heavy: "1,200.00",
//     motorcycle: "450.00",
//   },
//   {
//     limit: "75,000.00",
//     private: "1,035.00",
//     heavy: "1,245.00",
//     motorcycle: "510.00",
//   },
//   {
//     limit: "100,000.00",
//     private: "1,095.00",
//     heavy: "1,290.00",
//     motorcycle: "555.00",
//   },
//   {
//     limit: "150,000.00",
//     private: "1,170.00",
//     heavy: "1,335.00",
//     motorcycle: "645.00",
//   },
//   {
//     limit: "200,000.00",
//     private: "1,245.00",
//     heavy: "1,395.00",
//     motorcycle: "720.00",
//   },
//   {
//     limit: "250,000.00",
//     private: "1,320.00",
//     heavy: "1,455.00",
//     motorcycle: "795.00",
//   },
//   {
//     limit: "300,000.00",
//     private: "1,395.00",
//     heavy: "1,515.00",
//     motorcycle: "",
//   },
//   {
//     limit: "400,000.00",
//     private: "1,515.00",
//     heavy: "1,590.00",
//     motorcycle: "",
//   },
//   {
//     limit: "500,000.00",
//     private: "1,635.00",
//     heavy: "1,680.00",
//     motorcycle: "",
//   },
//   {
//     limit: "750,000.00",
//     private: "1,920.00",
//     heavy: "2,205.00",
//     motorcycle: "",
//   },
//   {
//     limit: "1,000,000.00",
//     private: "2,235.00",
//     heavy: "2,730.00",
//     motorcycle: "",
//   },
// ];

// export const reducer = (state: any, action: any) => {
//   switch (action.type) {
//     case "UPDATE_FIELD":
//       return {
//         ...state,
//         [action.field]: action.value,
//       };
//     default:
//       return state;
//   }
// };

// export default function RenewalTemplate() {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { myAxios, user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   // const [rows, setRows] = useState<GridRowSelectionModel>([]);
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [search, setSearch] = useState("");
//   const [src, setSrc] = useState<any>(
//     `${process.env.REACT_APP_IMAGE_URL}compdf.pdf`
//   );
//   const datePickerRef = useRef<HTMLElement>(null);
//   const [selectRow, setSelectRow] = useState([]);

//   const { isLoading } = useMutation({
//     mutationKey: "renewal-notice-selected-search",
//     mutationFn: async (variable: any) =>
//       await myAxios.post("/template/renewal-notice-selected-search", variable, {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }),
//     onSuccess(data, variables, context) {
//       const response = data as any;
//       if (response?.data.report.length <= 0) {
//         return;
//       }
//       setSelectRow(response?.data.report);
//       comComputation(response?.data.report[0]);
//     },
//   });

//   // const { isLoading: isLoadingCLient } = useQuery({
//   //   queryKey: "clients-table",
//   //   queryFn: async () => await fetchClient(search),
//   //   onSuccess: (data) => {
//   //     const response = data as any;
//   //     console.log(data);
//   //     setRows(response.data.getClients);
//   //   },
//   // });

//   async function fetchClient(search: string) {
//     return await myAxios.get(`/template/renewal-notice?search=${search}`, {
//       headers: {
//         Authorization: `Bearer ${user?.accessToken}`,
//       },
//     });
//   }

//   function comComputation(selectedClient: any) {
//     const {
//       tl_prev_insured,
//       acn_prev_insured,
//       injury_prev_insured,
//       damage_prev_insured,
//       accident_prev_insured,
//       tl_prev_premium,
//       acn_prev_premium,
//       injury_prev_premium,
//       damage_prev_premium,
//       accident_prev_premium,
//       Shortname,
//       address,
//       PolicyNo,
//       PlateNo,
//       ChassisNo,
//       MotorNo,
//       DateTo,
//       unitInsured,
//       Mortgagee,
//       SecIIPercent,
//       Remarks,
//     } = selectedClient;

//     let tlPrevInsured = parseFloat(tl_prev_insured.replace(/,/g, ""));
//     const quatationPremiumComputationPercentage =
//       parseFloat(SecIIPercent) / 100;
//     const injury = privatePremiumsInjury.filter(
//       (item) => item.limit.trim() === state.injuryQuatationPremium.trim()
//     );
//     const damage = premiumsDamage.filter(
//       (item) => item.limit.trim() === state.damageQuatationPremium.trim()
//     );

//     let tlQuatationInsured = tlPrevInsured - tlPrevInsured * 0.1;
//     if (tlQuatationInsured < 200000) {
//       tlQuatationInsured = 200000;
//     }

//     const acnQuatationInsured = tlQuatationInsured;
//     const injuryQuatationInsured = parseFloat(
//       injury[0].limit.replace(/,/g, "")
//     );
//     const damageQuatationInsured = parseFloat(
//       damage[0].limit.replace(/,/g, "")
//     );
//     const accidentQuatationInsured = state.accidentQuatationPremiumInsured;

//     const tlQuatationPremium =
//       tlQuatationInsured * quatationPremiumComputationPercentage;
//     const acnQuatationPremium = tlQuatationInsured * 0.005;
//     const injuryQuatationPremium = parseFloat(
//       injury[0][state.vehicle as "motorcycle" | "heavy" | "private"].replace(
//         /,/g,
//         ""
//       )
//     );

//     const damageQuatationPremium = parseFloat(
//       damage[0][state.vehicle as "motorcycle" | "heavy" | "private"].replace(
//         /,/g,
//         ""
//       )
//     );

//     const accidentQuatationPremium = state.accidentQuatationPremiumPremium;
//     const tableComputation = [
//       {
//         prevInsured: tl_prev_insured,
//         prevPremium: tl_prev_premium,
//         quatationInsured: tlQuatationInsured,
//         quatationPremium: tlQuatationPremium,
//       },
//       {
//         prevInsured: acn_prev_insured,
//         prevPremium: acn_prev_premium,
//         quatationInsured: acnQuatationInsured,
//         quatationPremium:
//           parseFloat(acn_prev_premium.toString()) > 0 ? acnQuatationPremium : 0,
//       },
//       {
//         prevInsured: injury_prev_insured,
//         prevPremium: injury_prev_premium,
//         quatationInsured: injuryQuatationInsured,
//         quatationPremium: injuryQuatationPremium,
//       },
//       {
//         prevInsured: damage_prev_insured,
//         prevPremium: damage_prev_premium,
//         quatationInsured: damageQuatationInsured,
//         quatationPremium: damageQuatationPremium,
//       },
//       {
//         prevInsured: accident_prev_insured,
//         prevPremium: accident_prev_premium,
//         quatationInsured: accidentQuatationInsured,
//         quatationPremium: accidentQuatationPremium,
//       },
//     ];
//     const previosSubAccount = tableComputation.reduce((a, b) => {
//       return a + parseFloat(b.prevPremium.toString().replace(/,/g, ""));
//     }, 0);
//     const previosDocStamp = previosSubAccount * 0.125;
//     const previosEvat = previosSubAccount * 0.12;
//     const previosLGT = previosSubAccount * 0.0075;
//     const totalPrev =
//       previosSubAccount + previosDocStamp + previosEvat + previosLGT;

//     const quatationSubAccount = tableComputation.reduce((a, b) => {
//       return a + parseFloat(b.quatationPremium.toString().replace(/,/g, ""));
//     }, 0);
//     const quatationDocStamp = quatationSubAccount * 0.125;
//     const quatationEvat = quatationSubAccount * 0.12;
//     const quatationLGT = quatationSubAccount * 0.0075;
//     const totalQuatation =
//       quatationSubAccount + quatationDocStamp + quatationEvat + quatationLGT;
//     const tableTotalsComputation = [
//       {
//         previos: formatTextNumber(previosSubAccount.toFixed(2)),
//         quatation: formatTextNumber(quatationSubAccount.toFixed(2)),
//       },
//       {
//         previos: formatTextNumber(previosDocStamp.toFixed(2)),
//         quatation: formatTextNumber(quatationDocStamp.toFixed(2)),
//       },
//       {
//         previos: formatTextNumber(previosEvat.toFixed(2)),
//         quatation: formatTextNumber(quatationEvat.toFixed(2)),
//       },
//       {
//         previos: formatTextNumber(previosLGT.toString()),
//         quatation: formatTextNumber(quatationLGT.toString()),
//       },
//       {
//         previos: formatTextNumber(totalPrev.toFixed(2)),
//         quatation: formatTextNumber(totalQuatation.toFixed(2)),
//       },
//     ];

//     setSrc(
//       generateCOMReport(tableComputation, tableTotalsComputation, {
//         Shortname,
//         address,
//         PolicyNo,
//         PlateNo,
//         ChassisNo,
//         MotorNo,
//         DateTo,
//         unitInsured,
//         Mortgagee,
//         Remarks,
//       })
//     );
//   }

//   function generateCOMReport(
//     tableComputation: Array<any> = [],
//     tableTotalsComputation: Array<any> = [],
//     policy: any
//   ) {
//     const doc = new jsPDF({ orientation: "p", format: "Letter" });

//     var img = new Image();
//     img.src = `${process.env.REACT_APP_IMAGE_URL}renewalnotice.jpg`;
//     doc.addImage(img, "png", 15, 0, 130, 43);

//     doc.setFontSize(17);
//     doc.text(`RENEWAL NOTICE`, 80, 42);

//     doc.setFontSize(9);
//     doc.text(
//       `${formatDate(new Date(state.datePrint), {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })}`,
//       170,
//       47
//     );
//     if (policy) {
//       doc.setFontSize(9);
//       doc.text(
//         `${policy.Shortname}.\n${policy.address}
//         `,
//         20,
//         50
//       );
//     }

//     doc.setFontSize(9);
//     doc.text(`Dear Ma’am/Sir,`, 20, 60);

//     doc.setFontSize(9);
//     doc.text(`Greetings from Upward Management Insurance Services!`, 35, 68);

//     doc.setFontSize(9);
//     doc.text(
//       `               This is to respectfully remind you about your Comprehensive Insurance Coverage which will expire on the date
// indicated below.With that, we are hoping that you will continue to trust our company by rendering good insuranceservice,
// and for being covered and protected beyond that date. Also, your insurance coverage is adjusted to the current market value.`,
//       20,
//       75
//     );

//     doc.setFontSize(8.5);
//     doc.text("Policy No.", 35, 90);
//     doc.text("Unit Insured", 35, 94);
//     doc.text("Plate No.", 35, 98);
//     doc.text("Chassis No", 35, 102);
//     doc.text("Motor No", 35, 106);
//     doc.text("Expiration Date", 35, 110);
//     doc.text("Mortgagee", 35, 114);
//     doc.text("Remarks", 35, 118);
//     doc.text(":", 70.5, 90);
//     doc.text(":", 70.5, 94);
//     doc.text(":", 70.5, 98);
//     doc.text(":", 70.5, 102);
//     doc.text(":", 70.5, 106);
//     doc.text(":", 70.5, 110);
//     doc.text(":", 70.5, 114);
//     doc.text(":", 70.5, 118);
//     if (policy) {
//       doc.text(`${policy.PolicyNo}`, 78, 90);
//       doc.text(`${policy.unitInsured}`, 78, 94);
//       doc.text(`${policy.PlateNo}`, 78, 98);
//       doc.text(`${policy.ChassisNo}`, 78, 102);
//       doc.text(policy.MotorNo, 78, 106);
//       doc.text(
//         `${formatDate(new Date(policy.DateTo), {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         })}`,
//         78,
//         110
//       );
//       doc.text(`${policy.Mortgagee}`, 78, 114);
//       doc.text(`${policy.Remarks}`, 78, 118);
//     }

//     doc.setFontSize(8);
//     doc.setTextColor("red");
//     doc.text("Previous Policy", 90, 124);
//     doc.text("Renewal Quotation", 140, 124);
//     doc.setTextColor("black");
//     doc.setFontSize(7);
//     doc.text("Sum Insured", 80, 130.5);
//     doc.text("Premium", 105, 130.5);

//     doc.text("Sum Insured", 138, 130.5);
//     doc.text("Premium", 165, 130.5);

//     doc.text("Total Loss/ Own Damage/ Theft", 35, 136);
//     doc.text("Acts of Nature", 35, 141);
//     doc.text("Excess Bodily Injury", 35, 146);
//     doc.text("Third Party Property Damage", 35, 151);
//     doc.text("Auto Passenger Accident", 35, 156);
//     doc.text(
//       `(${parseInt(state.passenger).toLocaleString("en-US")} per passenger)`,
//       35,
//       161
//     );
//     doc.text(
//       `(${parseInt(state.passenger).toLocaleString("en-US")} per passenger)`,
//       132,
//       161
//     );
//     doc.line(105, 162, 128, 162);
//     doc.line(165, 162, 188, 162);

//     doc.text("Sub-Total", 35, 166);
//     doc.text("Doc. Stamp", 35, 171);
//     doc.text("EVAT", 35, 176);
//     doc.text("LGT", 35, 181);
//     doc.line(105, 182, 128, 182);
//     doc.line(165, 182, 188, 182);
//     let counting = 136;
//     if (tableComputation.length > 0) {
//       for (let index = 0; index < tableComputation.length; index++) {
//         const dataComputation = tableComputation[index];
//         doc.text(formatTextNumber(dataComputation.prevInsured), 100, counting, {
//           align: "right",
//         });
//         doc.text(formatTextNumber(dataComputation.prevPremium), 120, counting, {
//           align: "right",
//         });
//         doc.text(
//           formatTextNumber(dataComputation.quatationInsured),
//           156,
//           counting,
//           {
//             align: "right",
//           }
//         );
//         doc.text(
//           formatTextNumber(dataComputation.quatationPremium),
//           179,
//           counting,
//           {
//             align: "right",
//           }
//         );

//         counting = counting + 5;
//       }
//     }
//     if (tableTotalsComputation.length > 0) {
//       for (let index = 0; index < tableTotalsComputation.length - 1; index++) {
//         counting = counting + 5;
//         const dataComputation = tableTotalsComputation[index];
//         doc.text(formatTextNumber(dataComputation.previos), 120, counting, {
//           align: "right",
//         });
//         doc.text(formatTextNumber(dataComputation.quatation), 180, counting, {
//           align: "right",
//         });
//       }

//       doc.setFontSize(8);
//       doc.text("GROSS PREMIUM", 35, 186);
//       doc.text(
//         tableTotalsComputation[tableTotalsComputation.length - 1].previos,
//         122,
//         186,
//         {
//           align: "right",
//         }
//       );
//       doc.setTextColor("red");
//       doc.text(
//         tableTotalsComputation[tableTotalsComputation.length - 1].quatation,
//         182,
//         186,
//         {
//           align: "right",
//         }
//       );
//     } else {
//       doc.setFontSize(8);
//       doc.text("GROSS PREMIUM", 35, 186);
//       doc.text("", 122, 186, {
//         align: "right",
//       });
//       doc.setTextColor("red");
//       doc.text("", 182, 186, {
//         align: "right",
//       });
//     }

//     doc.setTextColor("black");
//     doc.text(":", 70.5, 136);
//     doc.text(":", 70.5, 141);
//     doc.text(":", 70.5, 146);
//     doc.text(":", 70.5, 151);
//     doc.text(":", 70.5, 156);
//     doc.text(":", 70.5, 161);
//     doc.text(":", 70.5, 166);
//     doc.text(":", 70.5, 171);
//     doc.text(":", 70.5, 176);
//     doc.text(":", 70.5, 181);
//     doc.text(":", 70.5, 186);

//     doc.line(130, 190, 130, 120);
//     doc.line(131, 190, 131, 120);
//     doc.setFontSize(9);

//     doc.text(
//       `For further details and queries, please feel free to get in touch with us.  Again, thank you for considering our company for\nyour protection and security.`,
//       25,
//       198
//     );
//     doc.setFontSize(9);
//     doc.setFont("courier", "bold");
//     doc.text(
//       "Very truly yours,                            Checked by:",
//       25,
//       208
//     );

//     doc.text(
//       `ANGELO DACULA				MARY GRACE LLANERA
// UNDERWRITING ADMIN			   OPERATION SUPERVISOR
// --------------------------------------------------------------------------------------------
// Instruction Slip (Please check for instruction):

// ____ FOR RENEWAL                     ____ NON RENEWAL

// NOTE: RENEWAL WILL ONLY TAKE EFFECT IF THE
// CURRENT POLICY’S PREMIUM IS FULLY PAID
// `,
//       25,
//       218
//     );

//     doc.text(`_________________________________`, 138, 255);
//     doc.text(`SIGNATURE OVER PRINTED NAME`, 142.5, 258);
//     doc.setFontSize(7.7);

//     doc.text(
//       `Address | 1197 Azure Business Center EDSA Muñoz, Quezon City – Telephone Numbers | 8441 – 8977 to 78 | 8374 – 0742
// Mobile Numbers | 0919 – 078 – 5547 / 0919 – 078 – 5546 / 0919 – 078 – 5543`,
//       108,
//       268,
//       {
//         align: "center",
//       }
//     );

//     return doc.output("bloburl");
//   }

//   // function generatePAReport() {
//   //   const doc = new jsPDF({ orientation: "l", format: "Letter" });
//   //   doc.text(
//   //     `
//   //       PA
//   //   `,
//   //     50,
//   //     50
//   //   );
//   //   const link = doc.output("bloburl");
//   //   return link;
//   // }

//   function formatTextNumber(input: string) {
//     const userInput = input.toString();
//     if (isNaN(parseFloat(userInput))) {
//       return "0.00";
//     }
//     var formattedNumber = parseFloat(
//       userInput.replace(/,/g, "")
//     ).toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//     return formattedNumber;
//   }

//   function formatDate(date: any, options: any) {
//     const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
//       date
//     );

//     return formattedDate;
//   }
//   const handleInputChange = (e: any) => {
//     const { name, value } = e.target;
//     if (name === "vehicle" && value === "motorcycle") {
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "injuryQuatationPremium",
//         value: "50,000.00",
//       });
//       dispatch({
//         type: "UPDATE_FIELD",
//         field: "damageQuatationPremium",
//         value: "50,000.00",
//       });
//     }
//     dispatch({ type: "UPDATE_FIELD", field: name, value });
//   };

//   const height = window.innerHeight;

//   return (
//     <div
//       style={
//         { height: "100vh", width: "100%", display: "flex" } as CSSProperties
//       }
//     >
//       <Fab
//         sx={{
//           borderRadius: "100%",
//           cursor: "pointer",
//           position: "fixed",
//           top: showSidebar ? "100%" : "82%",
//           right: "5%",
//           transition: "all 250ms",
//           zIndex: 1,
//         }}
//         size="large"
//         color="primary"
//         aria-label="add"
//         onClick={() => {
//           setShowSidebar(true);
//         }}
//       >
//         <RoomPreferencesIcon />
//       </Fab>
//       <div
//         style={{
//           transition: "all 250ms",
//           height: `${height}px`,
//           width: "50%",
//           position: "fixed",
//           left: !showSidebar ? "-100%" : "0px",
//           top: 0,
//           background: "white",
//           boxShadow: "0.3px 0.2px 10px 0.2px black",
//           zIndex: 100,
//         }}
//       >
//         <div
//           style={{
//             position: "relative",
//             height: "100%",
//             width: "100%",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <div
//             style={
//               {
//                 height: "70%",
//                 flex: 2,
//               } as CSSProperties
//             }
//           >
//             <div
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <div
//                 style={
//                   {
//                     flex: 1,
//                     borderBottom: "1px solid black",
//                     padding: "10px",
//                   } as React.CSSProperties
//                 }
//               >

//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                     marginTop: "50px",
//                   }}
//                 >
//                   <TextField
//                     fullWidth
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(e.target.value);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.code === "Enter" || e.code === "NumpadEnter") {
//                         fetchClient(search).then((res: any) => {
//                           // setRows(res.data.getClients);
//                         });
//                       }
//                     }}
//                     label="Search"
//                     type="search"
//                     InputProps={{
//                       style: { height: "27px", fontSize: "14px" },
//                     }}
//                     sx={{
//                       flex: 1,
//                       height: "27px",
//                       ".MuiFormLabel-root": { fontSize: "14px" },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-12px" },
//                     }}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     marginTop: "10px",
//                     width: "100%",
//                     position: "relative",
//                     overflow: "auto",
//                     height: "350px",
//                   }}
//                 >
//                   {/* <DataGridTable
//                     height="350px"
//                     mutipleSelect={false}
//                     isLoading={isLoadingCLient}
//                     dataKey={"entry"}
//                     queryKey={["clietns-table"]}
//                     columns={columns}
//                     onSelectionChange={(rowSelectionModel, data) => {
//                       if (rowSelectionModel.length <= 0) {
//                         return;
//                       }

//                       const selectedIDs = new Set(rowSelectionModel);
//                       const selectedRowData = data.filter((row: any) =>
//                         selectedIDs.has(row.PolicyNo.toString())
//                       );
//                       Swal.fire({
//                         title: "Generate Report?",
//                         html: `Policy No: <strong>${selectedRowData[0].PolicyNo}</strong>`,
//                         icon: "warning",
//                         showCancelButton: true,
//                         confirmButtonColor: "#3085d6",
//                         cancelButtonColor: "#d33",
//                         confirmButtonText: "Yes, Save it!",
//                       }).then((result) => {
//                         if (result.isConfirmed) {
//                           mutate(selectedRowData[0]);
//                         }
//                       });
//                     }}
//                     getRowId={(row) => row.PolicyNo}
//                     rows={rows}
//                     setRows={setRows}
//                   /> */}
//                 </div>
//               </div>
//               <div
//                 style={{
//                   height: "300px",
//                   padding: "10px",
//                 }}
//               >
//                 <h5
//                   style={{
//                     fontFamily: "sans-serif",
//                     padding: "0",
//                     margin: "0",
//                     marginBottom: "10px",
//                   }}
//                 >
//                   Renewal Notice Settings
//                 </h5>
//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                     marginBottom: "15px",
//                   }}
//                 >
//                   <CustomDatePicker
//                     fullWidth={false}
//                     label="Date Print"
//                     onChange={(value: any) => {
//                       dispatch({
//                         type: "UPDATE_FIELD",
//                         field: "datePrint",
//                         value: value,
//                       });
//                     }}
//                     value={new Date(state.datePrint)}
//                     onKeyDown={(e: any) => {
//                       if (e.code === "Enter" || e.code === "NumpadEnter") {
//                         const timeout = setTimeout(() => {
//                           datePickerRef.current
//                             ?.querySelector("button")
//                             ?.click();
//                           clearTimeout(timeout);
//                         }, 150);
//                       }
//                     }}
//                     sx={{ flex: 1 }}
//                     datePickerRef={datePickerRef}
//                     textField={{
//                       InputLabelProps: {
//                         style: {
//                           fontSize: "14px",
//                         },
//                       },
//                       InputProps: {
//                         style: { height: "27px", fontSize: "14px" },
//                       },
//                     }}
//                   />
//                   <FormControl
//                     variant="outlined"
//                     size="small"
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": {
//                         fontSize: "14px",
//                         background: "white",
//                         zIndex: 99,
//                         padding: "0 3px",
//                       },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                   >
//                     <InputLabel id="demo-simple-select-label">
//                       Vehicle
//                     </InputLabel>
//                     <Select
//                       name="vehicle"
//                       labelId="demo-simple-select-label"
//                       value={state.vehicle}
//                       label="Vehicle"
//                       onChange={handleInputChange}
//                       sx={{
//                         height: "27px",
//                         fontSize: "14px",
//                       }}
//                     >
//                       <MenuItem value={"private"}>Private</MenuItem>
//                       <MenuItem value={"heavy"}>Heavy</MenuItem>
//                       <MenuItem value={"motorcycle"}>Motorcycle</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                     marginBottom: "15px",
//                   }}
//                 >
//                   <FormControl
//                     variant="outlined"
//                     size="small"
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": {
//                         fontSize: "14px",
//                         background: "white",
//                         zIndex: 99,
//                         padding: "0 3px",
//                       },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                   >
//                     <InputLabel id="injuryQuatationPremium-id">
//                       Excess Bodily Injury
//                     </InputLabel>
//                     <Select
//                       labelId="injuryQuatationPremium-id"
//                       value={state.injuryQuatationPremium}
//                       name="injuryQuatationPremium"
//                       label="Excess Bodily Injury"
//                       onChange={handleInputChange}
//                       sx={{
//                         height: "27px",
//                         fontSize: "14px",
//                       }}
//                     >
//                       {(state.vehicle === "motorcycle"
//                         ? privatePremiumsInjury.slice(0, 6)
//                         : privatePremiumsInjury
//                       ).map((item, idx) => {
//                         return (
//                           <MenuItem key={idx} value={item.limit}>
//                             {item.limit}
//                           </MenuItem>
//                         );
//                       })}
//                     </Select>
//                   </FormControl>
//                   <FormControl
//                     variant="outlined"
//                     size="small"
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": {
//                         fontSize: "14px",
//                         background: "white",
//                         zIndex: 99,
//                         padding: "0 3px",
//                       },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                   >
//                     <InputLabel id="damageQuatationPremium-id">
//                       Third Party Property Damage
//                     </InputLabel>
//                     <Select
//                       labelId="damageQuatationPremium-id"
//                       value={state.damageQuatationPremium}
//                       name="damageQuatationPremium"
//                       label="Third Party Property Damage"
//                       onChange={handleInputChange}
//                       sx={{
//                         height: "27px",
//                         fontSize: "14px",
//                       }}
//                     >
//                       {(state.vehicle === "motorcycle"
//                         ? premiumsDamage.slice(0, 6)
//                         : premiumsDamage
//                       ).map((item, idx) => {
//                         return (
//                           <MenuItem key={idx} value={item.limit}>
//                             {item.limit}
//                           </MenuItem>
//                         );
//                       })}
//                     </Select>
//                   </FormControl>
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                     marginBottom: "10px",
//                   }}
//                 >
//                   <TextField
//                     name="accidentQuatationPremiumInsured"
//                     label="Auto Passenger Accident Insured "
//                     size="small"
//                     value={state.accidentQuatationPremiumInsured}
//                     onChange={handleInputChange}
//                     placeholder="0.00"
//                     InputProps={{
//                       inputComponent: NumericFormatCustom as any,
//                       style: { height: "27px", fontSize: "14px" },
//                     }}
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": { fontSize: "14px" },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                     onBlur={() => {
//                       dispatch({
//                         type: "UPDATE_FIELD",
//                         field: "accidentQuatationPremiumInsured",
//                         value: parseFloat(
//                           state.accidentQuatationPremiumInsured.replace(
//                             /,/g,
//                             ""
//                           )
//                         ).toFixed(2),
//                       });
//                     }}
//                   />
//                   <TextField
//                     name="accidentQuatationPremiumPremium"
//                     label="Auto Passenger Accident Premium"
//                     size="small"
//                     value={state.accidentQuatationPremiumPremium}
//                     onChange={handleInputChange}
//                     placeholder="0.00"
//                     InputProps={{
//                       inputComponent: NumericFormatCustom as any,
//                       style: { height: "27px", fontSize: "14px" },
//                     }}
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": { fontSize: "14px" },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                     onBlur={() => {
//                       dispatch({
//                         type: "UPDATE_FIELD",
//                         field: "accidentQuatationPremiumPremium",
//                         value: parseFloat(
//                           state.accidentQuatationPremiumPremium.replace(
//                             /,/g,
//                             ""
//                           )
//                         ).toFixed(2),
//                       });
//                     }}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                     marginBottom: "10px",
//                   }}
//                 >
//                   <TextField
//                     name="passenger"
//                     label="passenger"
//                     size="small"
//                     value={state.passenger}
//                     onChange={handleInputChange}
//                     placeholder="0.00"
//                     InputProps={{
//                       inputComponent: NumericFormatCustom as any,
//                       style: { height: "27px", fontSize: "14px" },
//                     }}
//                     sx={{
//                       flex: 1,
//                       ".MuiFormLabel-root": { fontSize: "14px" },
//                       ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
//                     }}
//                   />
//                   <div style={{ flex: 1 } as any}></div>
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     columnGap: "10px",
//                   }}
//                 >
//                   {selectRow.length > 0 && (
//                     <Button
//                       variant="contained"
//                       size="small"
//                       onClick={() => {
//                         comComputation(selectRow[0]);
//                       }}
//                     >
//                       Update
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <IconButton
//             size="large"
//             onClick={() => {
//               navigate("/dashboard/task/production/policy");
//             }}
//             color="primary"
//             sx={{
//               position: "absolute",
//               bottom: "5px",
//               left: "5px",
//               zIndex: 99,
//             }}
//           >
//             <ReplyAllIcon />
//           </IconButton>
//           <IconButton
//             size="small"
//             onClick={() => {
//               setShowSidebar(false);
//             }}
//             sx={{
//               position: "absolute",
//               top: "5px",
//               right: "5px",
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </div>
//       </div>

//       <div style={{ width: "100%", height: "100vh" } as CSSProperties}>
//         <object data={src} type="application/pdf" width="100%" height="100%">
//           <embed src={src} type="application/pdf" />
//           <p>
//             It appears you don't have a PDF plugin for this browser. You can{" "}
//             <a href={src}>click here to download the PDF file.</a>
//           </p>
//         </object>
//       </div>

//       {isLoading && (
//         <div
//           style={{
//             position: "absolute",
//             top: "0",
//             bottom: "0",
//             left: "0",
//             right: "0",
//             background: "rgba(255, 255, 255, 0.11)",
//             backdropFilter: "blur(5px)",
//           }}
//         ></div>
//       )}
//       {isLoading && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%,-505)",
//             zIndex: 999,
//           }}
//         >
//           <img
//             src={`${process.env.REACT_APP_IMAGE_URL}loading.gif`}
//             alt="loading-gif"
//             style={{ width: "70px", height: "70px" }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

export default function RenewalTemplate() {
  return <div>HELLO WOLRD</div>;
}
