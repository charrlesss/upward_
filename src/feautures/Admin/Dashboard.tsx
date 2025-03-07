import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "react-query";
import { myAxios } from "../../lib/axios";
import { useContext } from "react";
import { AuthContext } from "../../components/AuthContext";
import "../../style/dashboard.css";
import useMultipleComponent from "../../hooks/useMultipleComponent";
import { flushSync } from "react-dom";
import { UpwardTable } from "../../components/UpwardTable";
import PageHelmet from "../../components/Helmet";



const policyColumn = [
  { field: "AssuredName", headerName: "Assured Name", width: 300 },
  { field: "PolicyNo", headerName: "Policy No.", width: 200 },
  { field: "InsuredValue", headerName: "Insured Value", width: 120 ,type:"number"},
  { field: "unit", headerName: "Unit", width: 270 },
  { field: "ChassisNo", headerName: "Chassis No.", width: 160 },
  { field: "DateExpired", headerName: "Date Expired", width: 100 },
]

const claimColumn = [
  { field: "claims_id", headerName: "Claims ID.", width: 300 },
  { field: "AssuredName", headerName: "Assured Name", width: 200 },
  { field: "PolicyNo", headerName: "Policy No.", width: 120 ,type:"number"},
  { field: "dateAccident", headerName: "Date Accident", width: 270 },
  { field: "dateReported", headerName: "Date Reported", width: 160 },
  { field: "status", headerName: "Status", width: 100 },
]

const buttons = [
  {text:"TPL"},
  {text:"COM"},
  {text:"CGL"},
  {text:"FIRE"},
  {text:"MAR"},
  {text:"PA"},
]

export default function Dashboard() {
  const [buttonShadowPostion, setButtonShadowPostion] = useState(0);
  const [showbuttonShadowPostion, setShowbuttonShadowPostion] = useState(false);

  const [currButtonClick, setCurrButtonClick] = useState(0);
  const { step, goTo } = useMultipleComponent([
    <POLICYTABLE policy={'TPL'} column={policyColumn} />,
    <POLICYTABLE policy={'COM'} column={policyColumn} />,
    <POLICYTABLE policy={'CGL'} column={policyColumn} />,
    <POLICYTABLE policy={'FIRE'} column={policyColumn} />,
    <POLICYTABLE policy={'MAR'} column={policyColumn} />,
    <POLICYTABLE policy={'PA'} column={policyColumn} />,
  ]);
  
  const { user } = useContext(AuthContext);

  const { data: claimsData, isLoading: isLoadingClaims } = useQuery({
    queryKey: "claims-notice",
    queryFn: async () =>
      await myAxios.get("/get-claims-notice", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });


  const handleIncrement = (index:number ,e:any) => {
    flushSync(()=>{
      setShowbuttonShadowPostion(true)
    })
    setCurrButtonClick(index);
    goTo(index)
    
    setButtonShadowPostion(e.target.getBoundingClientRect().left )
   
  };

  const width = window.innerWidth - 50;
  const height = window.innerHeight - 145;

  // style={{border:"1px solid red" ,height:"500px" ,background:"#D3D3D3"}}
  return (
    <div id="main" >
      <PageHelmet title={"Dashboard"} />
      {
        (user?.userAccess === "PRODUCTION" ||
          user?.userAccess === "ACCOUNTING" ||
          user?.userAccess === "PRODUCTION_ACCOUNTING" ||
          user?.userAccess === "ADMIN") &&
          <div style={{position:"relative",width:"100%",height:"auto"}}>
          <h3 style={{padding:0,margin:0,fontWeight:"bold" ,position:"absolute"}}>RENEWAL NOTICE</h3>
        <div style={{position:"relative" ,textAlign:"center",width:"100%" ,marginBottom:"10px"}}>
          {buttons.map((itm,index)=>{
              return (<ButtonComponent 
                key={index} 
                text={itm.text} 
                index={index}  
                handleIncrement={handleIncrement}
                curr={currButtonClick}
                />)
          })}
            <span 
            onTransitionEnd={(e)=>{
                setShowbuttonShadowPostion(false); // Hide element when transition is complete
            }}
            style={{
            position:"absolute",
            background:"rgba(0, 0, 0, 0.524)",
            top:0,
            left:`${buttonShadowPostion}px`,
            width:"60px",
            height:"40px",
            transition:"all 200ms",
            display:showbuttonShadowPostion ? "block" :"none"
          }}
          ></span>
        </div>
      <div style={{ width:"100%",height:"360px"}}>
          {step}
      </div>
      </div>
      }

 {(user?.userAccess === "CLAIMS" || user?.userAccess === "ADMIN") && ( 
            <div>
               <h3 style={{padding:0,fontWeight:"bold"}}>CLAIMS</h3>
            {isLoadingClaims ? (
              <div>Loading...</div>
            ) : (
              <UpwardTable
              isLoading={isLoadingClaims}
              ref={null}
              rows={claimsData?.data.claims}
              column={claimColumn}
              width={width}
              height={height}
              dataReadOnly={true}
              onSelectionChange={()=>{}}
              onKeyDown={() => {}}
              inputsearchselector=".manok"
            />
            )}
            </div>
         )} 
  
    </div>
  );
}

const ButtonComponent =({text = 'unknown',index = 0 ,handleIncrement ,curr }:any)=>{

  return (

    <button 
    disabled={curr === index}
      style={{
        border:"none",
        borderRadius:"0",
        cursor:"pointer",
        color:'white',
        background:(curr === index)    ? "" :"#008CBA",
        width:"80px",
        height:"40px",
        padding:0
      }}

    onClick={(e)=>{
      handleIncrement(index ,e)
    }}>{text}</button>

   
  )
}

const POLICYTABLE = ({policy,column}:any)=>{
  const tableRef = useRef()
  const [laoding,setLoading] = useState(false)
  const [data,setData] = useState([])
  const { user } = useContext(AuthContext);


  useEffect(()=>{
    setLoading(true)
    myAxios.get(`/get-renewal-this-month?policy=${policy}`, {
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
      },
    }).then((data)=>{
      setLoading(false)
      setData(data?.data.renewal)
    })
  },[policy ,user])

  const width = window.innerWidth - 50;
  const height = window.innerHeight - 145;
  if(laoding){
    return <div style={{textAlign:"center"}}>Loading...</div>
  }
  return (
    <div>
      <UpwardTable
        isLoading={laoding}
        ref={tableRef}
        rows={data}
        column={column}
        width={width}
        height={height}
        dataReadOnly={true}
        onSelectionChange={()=>{}}
        onKeyDown={() => {}}
        inputsearchselector=".manok"
      />
    </div>
  )
}

// function formatData(data: any) {
//   return data.map((itm: any) => {
//     itm.PrevBalance = parseFloat(itm.PrevBalance.toString().replace(/,/g, ""));
//     itm.CurrCredit = parseFloat(itm.CurrCredit.toString().replace(/,/g, ""));
//     itm.CurrDebit = parseFloat(itm.CurrDebit.toString().replace(/,/g, ""));
//     itm.TotalBalance = parseFloat(
//       itm.TotalBalance.toString().replace(/,/g, "")
//     );
//     return itm;
//   });
// }

// function formatNumber(num: any) {
//   const formattedPrice = new Intl.NumberFormat("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(num);

//   return formattedPrice;
// }
// const GroupedReport = forwardRef(({ data }: any, ref: any) => {
//   data = formatData(data);
//   // Group by "H"
//   const groupedByH = _.groupBy(data, "H");

//   function getSum(data: any, property: string) {
//     const totalPrice = data.reduce(
//       (total: any, product: any) => total + product[property],
//       0
//     );

//     return totalPrice;
//   }

//   return (
//     <div ref={ref}>
//       {Object.keys(groupedByH).map((groupHKey) => {
//         const groupHT1 = _.groupBy(groupedByH[groupHKey], "HT1"); // Group by "HT1" inside each "H" group
//         const groupTotalH1 = Object.values(groupHT1).flat();

//         return (
//           <div key={groupHKey} className={`H`}>
//             <p
//               style={{ margin: 0, padding: "10px", color: "black" }}
//               className="p"
//             >
//               {groupHKey}
//             </p>
//             {Object.keys(groupHT1).map((groupHT1Key) => {
//               const groupHT2 = _.groupBy(groupHT1[groupHT1Key], "HT2");
//               const groupTotal = Object.values(groupHT2).flat();
//               return (
//                 <div
//                   key={groupHT1Key}
//                   style={{ marginLeft: "20px" }}
//                   className={`HT1`}
//                 >
//                   <p
//                     style={{ margin: 0, padding: "10px", color: "black" }}
//                     className="p"
//                   >
//                     {groupHT1Key}
//                   </p>
//                   {Object.keys(groupHT2).map((groupHT2Key) => {
//                     return (
//                       <div
//                         key={groupHT2Key}
//                         style={{ marginLeft: "40px" }}
//                         className={`HT2`}
//                       >
//                         <p
//                           style={{ margin: 0, padding: "10px", color: "black" }}
//                           className="p"
//                         >
//                           {groupHT2Key}
//                         </p>
//                         {groupHT2[groupHT2Key].map((item, index) => (
//                           <div
//                             key={index}
//                             style={{ marginLeft: "60px", display: "flex" }}
//                             className="p"
//                           >
//                             <div style={{ width: "400px" }}>{item.HT3}</div>
//                             <div style={{ width: "150px", textAlign: "right" }}>
//                               {formatNumber(item.PrevBalance)}
//                             </div>
//                             <div style={{ width: "150px", textAlign: "right" }}>
//                               {formatNumber(item.CurrDebit)}
//                             </div>
//                             <div style={{ width: "150px", textAlign: "right" }}>
//                               {formatNumber(item.CurrCredit)}
//                             </div>
//                             <div style={{ width: "150px", textAlign: "right" }}>
//                               {formatNumber(item.TotalBalance)}
//                             </div>
//                           </div>
//                         ))}
//                         <div
//                           style={{
//                             marginLeft: "60px",
//                             display: "flex",
//                           }}
//                           className="p"
//                         >
//                           <div
//                             style={{ width: "400px", textAlign: "left" }}
//                           ></div>
//                           <div
//                             style={{
//                               width: "150px",
//                               borderTop: "1px solid #94a3b8",
//                               textAlign: "right",
//                               fontWeight: "bold",
//                             }}
//                           >
//                             {formatNumber(
//                               getSum(groupHT2[groupHT2Key], "PrevBalance")
//                             )}
//                           </div>
//                           <div
//                             style={{
//                               width: "150px",
//                               textAlign: "right",
//                               fontWeight: "bold",
//                               borderTop: "1px solid #94a3b8",
//                             }}
//                           >
//                             {formatNumber(
//                               getSum(groupHT2[groupHT2Key], "CurrDebit")
//                             )}
//                           </div>
//                           <div
//                             style={{
//                               width: "150px",
//                               textAlign: "right",
//                               fontWeight: "bold",
//                               borderTop: "1px solid #94a3b8",
//                             }}
//                           >
//                             {formatNumber(
//                               getSum(groupHT2[groupHT2Key], "CurrCredit")
//                             )}
//                           </div>
//                           <div
//                             style={{
//                               width: "150px",
//                               textAlign: "right",
//                               fontWeight: "bold",
//                               borderTop: "1px solid #94a3b8",
//                             }}
//                           >
//                             {formatNumber(
//                               getSum(groupHT2[groupHT2Key], "TotalBalance")
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   <div
//                     style={{
//                       marginLeft: "20px",
//                       display: "flex",
//                       padding: "10px 0px",
//                     }}
//                     className="p"
//                   >
//                     <div style={{ width: "480px", textAlign: "left" }}>
//                       <p style={{ margin: 0, padding: 0, color: "black" }}>
//                         TOTAL {groupHT1Key}
//                       </p>
//                     </div>
//                     <div
//                       style={{
//                         width: "150px",
//                         textAlign: "right",
//                         fontWeight: "bold",
//                         borderBottom: "1px solid black",
//                       }}
//                     >
//                       {formatNumber(getSum(groupTotal, "PrevBalance"))}
//                     </div>
//                     <div
//                       style={{
//                         width: "150px",
//                         textAlign: "right",
//                         fontWeight: "bold",
//                         borderBottom: "1px solid black",
//                       }}
//                     >
//                       {formatNumber(getSum(groupTotal, "CurrDebit"))}
//                     </div>
//                     <div
//                       style={{
//                         width: "150px",
//                         textAlign: "right",
//                         fontWeight: "bold",
//                         borderBottom: "1px solid black",
//                       }}
//                     >
//                       {formatNumber(getSum(groupTotal, "CurrCredit"))}
//                     </div>
//                     <div
//                       style={{
//                         width: "150px",
//                         textAlign: "right",
//                         fontWeight: "bold",
//                         borderBottom: "1px solid black",
//                       }}
//                     >
//                       {formatNumber(getSum(groupTotal, "TotalBalance"))}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             <div
//               style={{
//                 display: "flex",
//                 padding: "10px 0px",
//               }}
//               className="p"
//             >
//               <div style={{ width: "520px", textAlign: "left" }}>
//                 <p style={{ margin: 0, padding: 0, color: "black" }}>
//                   TOTAL{" "}
//                   {groupHKey !== "ASSETS"
//                     ? groupHKey + "AND CAPITAL"
//                     : groupHKey}
//                 </p>
//               </div>
//               <div
//                 style={{
//                   width: "150px",
//                   textAlign: "right",
//                   fontWeight: "bold",
//                   borderBottom: "double black 5px",
//                 }}
//               >
//                 {formatNumber(getSum(groupTotalH1, "PrevBalance"))}
//               </div>
//               <div
//                 style={{
//                   width: "150px",
//                   textAlign: "right",
//                   fontWeight: "bold",
//                   borderBottom: "double black 5px",
//                 }}
//               >
//                 {formatNumber(getSum(groupTotalH1, "CurrDebit"))}
//               </div>
//               <div
//                 style={{
//                   width: "150px",
//                   textAlign: "right",
//                   fontWeight: "bold",
//                   borderBottom: "double black 5px",
//                 }}
//               >
//                 {formatNumber(getSum(groupTotalH1, "CurrCredit"))}
//               </div>
//               <div
//                 style={{
//                   width: "150px",
//                   textAlign: "right",
//                   fontWeight: "bold",
//                   borderBottom: "double black 5px",
//                 }}
//               >
//                 {formatNumber(getSum(groupTotalH1, "TotalBalance"))}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// });

// function convertElementToURL(page: Element) {
//   const elements = page as Element;
//   console.log(elements.getBoundingClientRect());
//   const elementString = new XMLSerializer().serializeToString(elements);
//   const height = elements.getBoundingClientRect().height;
//   const width = elements.getBoundingClientRect().width;
//   const viewBox = `0 0 ${width} ${height}`;
//   let scale = 100;

//   const dataURL =
//     "data:image/svg+xml," +
//     encodeURIComponent(
//       `<svg xmlns="http://www.w3.org/2000/svg"  width="${scale}%" height="${scale}%">
//           <foreignObject viewBox="${viewBox}" width="100%" height="100%">
//               ${elementString}
//           </foreignObject>
//           <style>
//               .page{
//                   page-break-after: always;
//                   display: flex;
//                   flex-direction: column;
//                   height: 100vh;
//                   width: 100vw;
//               }
//               img{
//                   width: 100%;
//                   height: 100%;
//               }
//           </style> 
//         </svg>`
//     );
//   return dataURL;
// }

// export default function Dashboard() {
//   const report = useRef<HTMLDivElement>(null);
//   const { user } = useContext(AuthContext);
//   const [data, setData] = useState([]);
//   const handleClick = async () => {
//     const state = {
//       dateFormat: "Monthly",
//       format: 0,
//       date: "2024-09-05T05:56:21.669Z",
//       sub_acct: "All",
//       nominalAccount: 0,
//     };
//     const response = await myAxios.post(
//       "/reports/accounting//balance-sheet-long-report",
//       state,
//       {
//         headers: {
//           Authorization: `Bearer ${user?.accessToken}`,
//         },
//       }
//     );
//     const jsonData = await response.data;
//     setData(jsonData.data);
//   };
//   const handleLogic = () => {
//     const loopThroughChildren = (elements: Array<HTMLElement>) => {
//       const F_EL = elements[0];
//       const L_EL = elements[elements.length - 1];

//       let _EH = 0;
//       const _EL_C = [];
//       elements.forEach((child: HTMLElement, index) => {
//         const _H = Math.round(child.getBoundingClientRect().height);
//         _EH += _H;
//         if (_EH + _H > 900) {
//           _EH = 0;
//           _EL_C.push(child);
//           _EL_C.push(elements[index + 1]);
//           console.log(`============ ${index} - ${_EH} ================`, child);
//         }
//       });

//       _EL_C.unshift(F_EL);
//       _EL_C.push(L_EL);

//       const formatArrayToObjects = (arr: any) => {
//         let formattedArray = [];

//         // Loop through the array in steps of 2
//         for (let i = 0; i < arr.length; i += 2) {
//           formattedArray.push({
//             start: arr[i],
//             end: arr[i + 1],
//           });
//         }

//         return formattedArray;
//       };
//       const formatted = formatArrayToObjects(_EL_C);
//       const pageCuts = document.getElementById("cut-pages");
//       const div = document.createElement("div");
//       div.className = "main";
//       formatted.forEach((itm) => {
//         const page = document.createElement("div");
//         page.className = "page";
//         page.style.height = "11in";
//         page.style.width = "auto";
//         page.style.fontSize = "8px !important";
//         page.style.padding = "15px";
//         const range = document.createRange();

//         range.setStartBefore(itm.start);
//         range.setEndAfter(itm.end);
//         const cutContent = range.cloneContents();
//         range.deleteContents();
//         page.appendChild(cutContent);
//         div.appendChild(page);
//       });
//       pageCuts?.appendChild(div);
//     };
//     const dd = report.current?.querySelectorAll(".p") as any;
//     loopThroughChildren(dd);
//   };

//   const captureElement = async (page: Element) => {
//     const imgData = convertElementToURL(page);
//     const tableIamge = '<img src="' + imgData + '" />';
//     return `<div class="page">${tableIamge}</div>`;
//   };

//   async function getPaperToPrint() {
//     let printString = "";
//     const pages: any = document.querySelectorAll("#cut-pages .page");

//     for (const page of pages) {
//       page.style.fontSize = "8px !important";
//       printString += await captureElement(page);
//     }
//     return printString;
//   }

//   return (
//     <div>
//       <button onClick={handleClick}>Report</button>
//       <button
//         onClick={async () => {
//           await getPaperToPrint().then((printString) => {
//             const iframe = document.createElement(
//               "iframe"
//             ) as HTMLIFrameElement;
//             iframe.style.display = "none";
//             document.body.appendChild(iframe);
//             const iframeDocument =
//               iframe.contentDocument || iframe.contentWindow?.document;
//             const htmlContent = `
//                           <!DOCTYPE html>
//                           <html lang="en">
//                           <head>
//                               <meta charset="UTF-8">
//                               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                               <title>Printed HTML Content</title>
//                               <style>
//                               @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
//                               @media print {
//                                 @page{
//                                     margin-top: 0mm;
//                                     margin-bottom: 0mm;
//                                     margin-left: 0mm;
//                                     margin-right: 0mm;
//                                 }
//                                 body {
//                                       margin: 0;
//                                       padding: 0;
//                                   }
//                                 .page{
//                                     page-break-after: always;
//                                     height: 100vh;
//                                     width: 100vw;
//                                 }
                               
//                                  img{
//                                     width: 95%;
//                                     height: 100%;
//                                 }
                               
//                               }
          
//                               </style>
//                           </head>
//                           <body>
//                                 ${printString}
//                           </body>
//                           </html>
//                       `;
//             iframeDocument?.open();
//             iframeDocument?.write(htmlContent);
//             iframeDocument?.close();
//             setTimeout(function () {
//               iframe.contentWindow?.print();
//               iframe.parentNode?.removeChild(iframe);
//             }, 1000);
//           });
//         }}
//       >
//         Report Element
//       </button>
//       <button onClick={handleLogic}>Logic</button>
//       <GroupedReport data={data} ref={report} />
//       <div id="cut-pages"></div>
//     </div>
//   );
// }
