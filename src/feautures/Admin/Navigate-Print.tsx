import "../../style/navigate-print.css";
import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { arrangeData } from "../../components/PrintPreview/dataCore";
import { format } from "date-fns";
import { renderToString } from "react-dom/server";

let scaleValue = 100;

function chunkArray(arr: any, chunkSize: number) {
  const result = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
}

export default function NavigatePrint() {
  const [row, setRows] = useState<Array<any>>([]);
  const notTable = useRef(localStorage.getItem("printString") as string);
  const column = useRef(
    JSON.parse(localStorage.getItem("column") as string) as Array<any>
  );
  const title = useRef(localStorage.getItem("title") as string);
  const state = useRef(JSON.parse(localStorage.getItem("state") as string));
  const module = useRef(localStorage.getItem("module") as string);
  const data = useRef(JSON.parse(localStorage.getItem("dataString") as string));
  const [pages, setPages] = useState(0);

  useEffect(() => {
    if (notTable.current) {
      const onePage = document.querySelector(".one-page") as Element;
      onePage.innerHTML = notTable.current;
    } else {
      if (module.current === "pdc") {
        const rows = data.current;
        arrangeData({
          adjustMaxHeight: 500,
          beforeArrangeData(itm) {
            itm.Check_Date = `${itm.Check_Date} - ${format(
              new Date(itm.Check_Date),
              "eee"
            )}`;
            return itm;
          },
          column: column.current,
          data: rows,
          fontSize: "11px",
        }).then((data) => {
          setRows(data);
        });
      }

      if (module.current === "cash-disbursement") {
        const rows = chunkArray(data.current, 13);
        setRows(rows);
      }
      if (module.current === "general-journal") {
        const rows = chunkArray(data.current, 27);
        setRows(rows);
      }
      if (module.current === "warehouse") {
        const rows = chunkArray(data.current, 15);
        setRows(rows);
      }

    }
  }, []);

  function convertElementToURL(elements: Element) {
    console.log(elements);
    const elementString = new XMLSerializer().serializeToString(elements);
    const height = elements.getBoundingClientRect().height;
    const width = elements.getBoundingClientRect().width;
    const viewBox = `0 0 ${width} ${height}`;
    let scale = 0;

    if (scaleValue < 100) {
      scale = 100 + (100 - scaleValue);
    } else if (scaleValue > 100) {
      scale = 100 - (scaleValue - 100);
    } else {
      scale = 100;
    }

    const dataURL =
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg"  width="${scale}%" height="${scale}%">
            <foreignObject viewBox="${viewBox}" width="100%" height="100%">
                ${elementString}
            </foreignObject>
            <style>
                .page{
                    page-break-after: always;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 5vh) !important;
                    width: calc(100vw - 3vw) !important;
                    box-shadow: none !important;
                    font-family: "Roboto", sans-serif;
                }
                .content{
                    width:100%;
                    height:100%;
                    box-shadow:none !important;
                }
                table {
                  border-collapse: collapse;
                  border-spacing: 20px
                }
                thead tr.headerColumn{
                    border-bottom: 1px solid black;
                }
                .content img{
                    width: 70%;
                    height: 100%;
                }
                .footer, .header{
                    padding-left: 50px;
                    padding-right: 50px;
                }
                td, th{
                font-family: 'Lato', sans-serif;
                font-weight: 700;
                padding: 0px 5px;
              }

                  ${module.current === "general-journal" ||
          module.current === "cash-disbursement" ?
          ` .table {
                      display: table;
                      width: 100%; 
                      border-collapse: collapse; 
                  }
                  .row {
                      display: table-row; 
                  }
                  .cell {
                      display: table-cell; 
                      overflow: hidden; 
                      white-space: nowrap; 
                      text-overflow: ellipsis; 
                  }` : ''

        }
      
            </style> 
          </svg>`
      );
    return dataURL;
  }
  const captureElement = async (page: Element) => {
    const imgData = convertElementToURL(page.querySelector("#table") as Element);
    const tableIamge = '<img src="' + imgData + '" />';
    const content = `<div class="content">${tableIamge}</div>`;
    const footer = page.querySelector(".footer") as Element;

    return `<div class="page"> ${content}${footer.outerHTML}</div>`;
  };
  async function getPaperToPrintParams(pages: Array<any>) {
    let printString = "";
    for (const page of pages) {
      printString += await captureElement(page);
    }
    return printString;
  }

  async function getPaperToPrint() {
    let printString = "";
    const pages = document.querySelectorAll(".page");
    for (const page of pages) {
      printString += await captureElement(page);
    }
    return printString;
  }
  function numberToWords(num: number) {
    if (num === 0) return "zero";

    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "ten",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const thousands = ["", "thousand", "million", "billion"];

    function numberToWordsHelper(n: any) {
      let str = "";

      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + " hundred ";
        n %= 100;
      }

      if (n >= 11 && n <= 19) {
        str += teens[n - 10] + " ";
      } else {
        if (n >= 10) {
          str += tens[Math.floor(n / 10)] + " ";
        }
        n %= 10;
        if (n > 0) {
          str += ones[n] + " ";
        }
      }

      return str.trim();
    }

    let word = "";
    let i = 0;

    while (num > 0) {
      const currentPart = num % 1000;
      if (currentPart !== 0) {
        word =
          numberToWordsHelper(currentPart) + " " + thousands[i] + " " + word;
      }
      num = Math.floor(num / 1000);
      i++;
    }

    return word.trim();
  }
  function AmountToWords(amount: number) {
    const formattedAmount = amount.toFixed(2);
    const ln = formattedAmount.length - 3;
    const a = numberToWords(parseInt(formattedAmount.substring(0, ln), 10));
    const b = formattedAmount.substring(ln + 1);

    let c;
    if (b === "00") {
      c = a + " ONLY";
    } else {
      c = a + " and " + b + "/100 only";
    }

    return c.toUpperCase().trim();
  }

  function toNumber(amount: string) {
    const rr = amount.replace(/,/g, '')
    if (isNaN(parseFloat(rr))) {
      return '0.00'
    }
    return parseFloat(rr).toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }


  return (
    <main
      className="main"
      style={{
        background: "#374151",
        width: "100%",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 0 ",
        boxSizing: "border-box",
        margin: "0",
      }}
    >
      <header
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          height: "40px",
          background: "#475569",
          boxShadow: "10px 10px 34px -6px #0f172a",
          display: "flex",
          justifyContent: "flex-end",
          columnGap: "10px",
          padding: "0 50px",
          zIndex: "9999",
        }}
      >
        <IconButton
          onClick={async () => {
            const iframe = document.createElement(
              "iframe"
            ) as HTMLIFrameElement;
            iframe.style.display = "none";
            document.body.appendChild(iframe);
            const iframeDocument =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (notTable.current !== null) {
              const page = document.querySelector(".page") as Element;
              const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Printed HTML Content</title>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                    @media print {
                      body {
                            margin: 0;
                            padding: 0;
                        }
                      .page{
                          page-break-after: always;
                          display: flex;
                          flex-direction: column;
                          height: 100vh;
                          width: 100vw;
                          box-shadow:none !important;
                          font-family: "Roboto", sans-serif;
                      }
                    }
                    </style>
                </head>
                <body>
                      ${page.outerHTML}
                </body>
                </html>
            `;
              iframeDocument?.open();
              iframeDocument?.write(htmlContent);
              iframeDocument?.close();
              setTimeout(function () {
                iframe.contentWindow?.print();
                iframe.parentNode?.removeChild(iframe);
              }, 500);
              return;
            }

            if (module.current === "collection") {
              let printString = "";
              const pages = document.querySelectorAll(".page");
              for (const page of pages) {
                const imgData = convertElementToURL(page as Element);
                const tableIamge = '<img src="' + imgData + '" />';
                const content = `<div class="content">${tableIamge}</div>`;
                printString += `<div class="page"> ${content}</div>`;
                console.log("sadas");
              }
              if (printString === "") return;

              const htmlContent = `
               <!DOCTYPE html>
               <html lang="en">
               <head>
                   <meta charset="UTF-8">
                   <meta name="viewport" content="width=device-width, initial-scale=1.0">
                   <title>Printed HTML Content</title>
                   <style>
                     @page{
                         margin-top: 0mm;
                         margin-bottom: 0mm;
                         margin-left: 0mm;
                         margin-right: 0mm;
                     }
                     body {
                           margin: 0;
                           padding: 0;
                       }
                     .page{
                         page-break-after: always;
                         display: flex;
                         flex-direction: column;
                         height: 100vh;
                         width: 100vw;
                         box-shadow: none !important;
                     }
                     .content{
                         box-shadow: none !important;
                         flex: 1;
                         block-size: fit-content;
                         text-align: center;
                     }
                     .content img{
                         width: 95%;
                         height: 95%;
                     }
                     .footer, .header{
                       padding-left: 50px;
                       padding-right: 50px;
                     }
                     
                       .page table td,.page table th{
                         font-family: "Roboto", sans-serif;
                         font-weight: 100;
                         font-style: normal;
                     }
                   }

                   </style>
               </head>
               <body>
                     ${printString}
               </body>
               </html>
           `;

              iframeDocument?.open();
              iframeDocument?.write(htmlContent);
              iframeDocument?.close();
              setTimeout(function () {
                iframe.contentWindow?.print();
                iframe.parentNode?.removeChild(iframe);
              }, 500);
            }

            if (module.current === "pdc") {
              getPaperToPrint().then((printString) => {
                const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Printed HTML Content</title>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                    @media print {
                      @page{
                          margin-top: 0mm;
                          margin-bottom: 0mm;
                          margin-left: 0mm;
                          margin-right: 0mm;
                      }
                      body {
                            margin: 0;
                            box-sizing:border-box;

                        }
                      .page{
                          page-break-after: always;
                          display: flex;
                          flex-direction: column;
                          height: 100vh;
                          width: 100vw;
                          box-shadow: none;
                      }
                      .content{
                          flex: 1;
                          block-size: fit-content;
                          text-align: center;
                          padding:50px !important;

                      }
                      .content img{
                          width: 95%;
                          height: 95%;
                      }
                      .footer, .header{
                        padding-left: 50px;
                        padding-right: 50px;
                        padding-bottom:50px;
                      }
                      
                        .page table td,.page table th{
                          font-family: "Roboto", sans-serif;
                          font-weight: 100;
                          font-style: normal;
                      }
                    }

                    </style>
                </head>
                <body>
                      ${printString}
                </body>
                </html>
            `;
                console.log(htmlContent);

                iframeDocument?.open();
                iframeDocument?.write(htmlContent);
                iframeDocument?.close();
                setTimeout(function () {
                  iframe.contentWindow?.print();
                  iframe.parentNode?.removeChild(iframe);
                }, 500);
              });
            }
            if (module.current === "cash-disbursement") {
              getPaperToPrint().then((printString) => {
                const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Printed HTML Content</title>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                    @media print {
                      @page{
                          margin-top: 0mm;
                          margin-bottom: 0mm;
                          margin-left: 0mm;
                          margin-right: 0mm;
                      }
                      body {
                            margin: 0;
                            box-sizing:border-box;
                        }
                      .page{
                          page-break-after: always;
                          display: flex;
                          flex-direction: column;
                          height: 100vh;
                          width: 100vw;
                          box-shadow: none;
                      }
                      .content{
                          flex: 1;
                          block-size: fit-content;
                          text-align: center;
                          padding:30px !important;

                      }
                      .content img{
                          width: 100%;
                          height: 100%;
                      }
                      .footer, .header{
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-bottom:30px;
                      }
                      
                        .page table td,.page table th{
                          font-family: "Roboto", sans-serif;
                          font-weight: 100;
                          font-style: normal;
                      }
                    }

                    </style>
                </head>
                <body>
                      ${printString}
                </body>
                </html>
            `;

                iframeDocument?.open();
                iframeDocument?.write(htmlContent);
                iframeDocument?.close();
                setTimeout(function () {
                  iframe.contentWindow?.print();
                  iframe.parentNode?.removeChild(iframe);
                }, 500);
              });
            }
            if (module.current === "general-journal") {
              getPaperToPrint().then((printString) => {
                const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Printed HTML Content</title>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                    @media print {
                      @page{
                          margin-top: 0mm;
                          margin-bottom: 0mm;
                          margin-left: 0mm;
                          margin-right: 0mm;
                      }
                      body {
                            margin: 0;
                            box-sizing:border-box;
                        }
                      .page{
                          page-break-after: always;
                          display: flex;
                          flex-direction: column;
                          height: 100vh;
                          width: 100vw;
                          box-shadow: none;
                      }

                 

                      .content{
                          flex: 1;
                          block-size: fit-content;
                          text-align: center;
                          padding:30px !important;

                      }
                      .content img{
                          width: 100%;
                          height: 100%;
                      }
                      .footer, .header{
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-bottom:30px;
                      }
                      
                        .page table td,.page table th{
                          font-family: "Roboto", sans-serif;
                          font-weight: 100;
                          font-style: normal;
                      }
                    }

                    </style>
                </head>
                <body>
                      ${printString}
                </body>
                </html>
            `;
                console.log(htmlContent);

                iframeDocument?.open();
                iframeDocument?.write(htmlContent);
                iframeDocument?.close();
                setTimeout(function () {
                  iframe.contentWindow?.print();
                  iframe.parentNode?.removeChild(iframe);
                }, 500);
              });
            }
            if (module.current === "warehouse") {
              const WRComponent = () => {
                const elArr = row.map((pages, rowIndex) => {
                  const CCC = ({ page, pageIndex }: any) => {
                    return (
                      <div
                        className="page content"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          background: "white",
                          boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                          width: localStorage.getItem("paper-width") as string,
                          height: localStorage.getItem(
                            "paper-height"
                          ) as string,
                          padding: "50px 20px",
                        }}
                        key={pageIndex}
                      >
                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          {
                            <table
                              style={{
                                borderCollapse: "collapse",
                                width: "100%",
                                border: "1px solid white",
                              }}
                            >
                              <thead>
                                {title.current
                                  .split("\n")
                                  .map((t: string, idx: number) => {
                                    return (
                                      <tr key={idx}>
                                        <th
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                          }}
                                          colSpan={column.current.length}
                                        >
                                          {t}
                                        </th>
                                      </tr>
                                    );
                                  })}
                                <tr style={{ height: "30px" }}></tr>
                                <tr style={{ height: "40px" }}></tr>
                                <tr
                                  style={{
                                    borderBottom: "1px solid black",
                                    borderTop: "1px solid black",
                                  }}
                                >
                                  {column.current.map(
                                    (itm: any, rowIdx: number) => {
                                      return (
                                        <th
                                          style={{
                                            width: `${itm.width} !important`,
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            textAlign:
                                              itm.datakey === "debit" ||
                                                itm.datakey === "credit"
                                                ? "right"
                                                : "left",
                                            padding: "5px 0px",
                                          }}
                                          key={rowIdx}
                                        >
                                          {itm.header}
                                        </th>
                                      );
                                    }
                                  )}
                                </tr>
                                <tr style={{ height: "5px" }}></tr>
                              </thead>
                              <tbody>
                                <tr style={{ height: "10px" }}></tr>
                                {page.map((rowItem: any, rowIdx: number) => {
                                  return (
                                    <tr key={rowIdx}>
                                      {column.current.map(
                                        (colItem: any, colIdx: number) => {
                                          return (
                                            <td
                                              className={`editable not-looking  c-${colIdx}`}
                                              key={colIdx}
                                              style={{
                                                width: colItem.width,
                                                maxHeight: "35px",
                                                height: "35px",
                                                position: "relative",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  margin: 0,
                                                  fontSize: "10px",
                                                  fontWeight: "bold",
                                                  textAlign:
                                                    colItem.datakey ===
                                                      "Check_Amnt"
                                                      ? "right"
                                                      : "left",
                                                  height: "35px",
                                                  whiteSpace: "pre-wrap",
                                                  overflow: "hidden",
                                                  maxHeight: "35px",
                                                  color: "black",
                                                  width: "100%",
                                                  position: "absolute",
                                                  top: 0,
                                                  padding: "5px",
                                                  boxSizing: "border-box",
                                                }}
                                              >
                                                {rowItem[colItem.datakey]}
                                              </p>
                                            </td>
                                          );
                                        }
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          }
                        </div>
                        <div
                          className="footer"
                          style={{
                            height: "auto",
                            display: "flex",
                            justifyContent: "space-between",
                            columnGap: "20px",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              height: "30px",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                color: "black",
                              }}
                            >
                              Printed Date: {format(new Date(), "MM/dd/Y")}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                color: "black",
                              }}
                            >
                              Page {pageIndex + 1} of {row.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  const wareComponent = renderToString(
                    <CCC page={pages} pageIndex={rowIndex} />
                  );
                  const pageContainer = document.createElement("div");
                  pageContainer.innerHTML = wareComponent;
                  return pageContainer.firstChild;
                });

                getPaperToPrintParams(elArr).then((printString) => {
                  const htmlContent = `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Printed HTML Content</title>
                      <style>
                      @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                      @media print {
                        @page{
                            margin-top: 0mm;
                            margin-bottom: 0mm;
                            margin-left: 0mm;
                            margin-right: 0mm;
                        }
                        body {
                              margin: 0;
                              box-sizing:border-box;
                          }
                        .page{
                            page-break-after: always;
                            display: flex;
                            flex-direction: column;
                            height: 100vh;
                            width: 100vw;
                            box-shadow: none;
                        }
                        .content{
                            flex: 1;
                            block-size: fit-content;
                            text-align: center;
                            padding:30px !important;
  
                        }
                        .content img{
                            width: 100%;
                            height: 100%;
                        }
                        .footer, .header{
                          padding-left: 30px;
                          padding-right: 30px;
                          padding-bottom:30px;
                        }
                        
                          .page table td,.page table th{
                            font-family: "Roboto", sans-serif;
                            font-weight: 100;
                            font-style: normal;
                        }
                      }
  
                      </style>
                  </head>
                  <body>
                        ${printString}
                  </body>
                  </html>
                   `;
                  iframeDocument?.open();
                  iframeDocument?.write(htmlContent);
                  iframeDocument?.close();
                  setTimeout(function () {
                    iframe.contentWindow?.print();
                    iframe.parentNode?.removeChild(iframe);
                  }, 500);
                });
              };

              WRComponent();
            }
            if (module.current === "cash-disbursement-check") {
              getPaperToPrint().then((printString) => {
                const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Printed HTML Content</title>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
                    @media print {
                      @page{
                          margin-top: 0mm;
                          margin-bottom: 0mm;
                          margin-left: 0mm;
                          margin-right: 0mm;
                      }
                      body {
                            margin: 0;
                            box-sizing:border-box;
                        }
                      .page{
                          page-break-after: always;
                          display: flex;
                          flex-direction: column;
                          height: 100vh;
                          width: 100vw;
                          box-shadow: none;
                      }
                      .content{
                          flex: 1;
                          block-size: fit-content;
                          text-align: center;
                          padding:30px !important;

                      }
                      .content img{
                          width: 100%;
                          height: 100%;
                      }
                      .footer, .header{
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-bottom:30px;
                      }
                      
                        .page table td,.page table th{
                          font-family: "Roboto", sans-serif;
                          font-weight: 100;
                          font-style: normal;
                      }
                    }

                    </style>
                </head>
                <body>
                      ${printString}
                </body>
                </html>
                 `;
                iframeDocument?.open();
                iframeDocument?.write(htmlContent);
                iframeDocument?.close();
                setTimeout(function () {
                  iframe.contentWindow?.print();
                  iframe.parentNode?.removeChild(iframe);
                }, 500);
              });
            }
          }}
        >
          <LocalPrintshopIcon color="primary" />
        </IconButton>
        <button
          style={{
            fontSize: "20px",
            color: "white",
            padding: 0,
            margin: 0,
            background: "transparent",
          }}
          onClick={() => {
            setPages(0);
          }}
        >
          {"<<"}
        </button>
        <button
          style={{
            fontSize: "20px",
            color: "white",
            padding: 0,
            margin: 0,
            background: "transparent",
          }}
          onClick={() => {
            if (pages <= 0) return;
            setPages((p) => p - 1);
          }}
        >
          {"<"}
        </button>
        <button
          style={{
            fontSize: "20px",
            color: "white",
            padding: 0,
            margin: 0,
            background: "transparent",
            marginLeft: "10px",
          }}
          onClick={() => {
            if (pages >= row.length - 1) return;
            setPages((p) => p + 1);
          }}
        >
          {">"}
        </button>
        <button
          style={{
            fontSize: "20px",
            color: "white",
            padding: 0,
            margin: 0,
            background: "transparent",
            marginLeft: "6px",
          }}
          onClick={() => setPages(row.length - 1)}
        >
          {">>"}
        </button>
      </header>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          rowGap: "10px",
        }}
      >
        {module.current === "pdc" &&
          (row.length <= 0 ? (
            <div
              className="page content one-page"
              style={{
                background: "white",
                boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                width: localStorage.getItem("paper-width") as string,
                height: localStorage.getItem("paper-height") as string,
                padding: "50px",
              }}
            ></div>
          ) : (
            row?.map((pages, RowNumber) => {
              return (
                <div
                  className="page content"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "white",
                    boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                    width: localStorage.getItem("paper-width") as string,
                    height: localStorage.getItem("paper-height") as string,
                    padding: "50px 100px",
                  }}
                  key={RowNumber}
                >
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    {
                      <table
                        id="table"
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          {RowNumber === 0 &&
                            title.current
                              .split("\n")
                              .map((t: string, idx: number) => {
                                return (
                                  <tr key={idx}>
                                    <th
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                      colSpan={column.current.length}
                                    >
                                      {t}
                                    </th>
                                  </tr>
                                );
                              })}
                        </thead>
                        <tbody>
                          <tr style={{ height: "40px" }}></tr>
                          {RowNumber === 0 && (
                            <>
                              <tr>
                                <td
                                  colSpan={1}
                                  style={{
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  P.N. No. :
                                </td>
                                <td
                                  colSpan={2}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {state.current.PNo}
                                </td>
                                <td
                                  colSpan={1}
                                  style={{
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Reference No :
                                </td>
                                <td
                                  colSpan={1}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {state.current.Ref_No}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan={1}
                                  style={{
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Client Name :
                                </td>
                                <td
                                  colSpan={2}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {state.current.Name} ({state.current.IDNo})
                                </td>
                                <td
                                  colSpan={1}
                                  style={{
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    width: "100px",
                                  }}
                                >
                                  Date Received :
                                </td>
                                <td
                                  colSpan={1}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {format(
                                    new Date(state.current.Date),
                                    "MM/dd/Y"
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan={1}
                                  style={{
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Remarks :
                                </td>
                                <td
                                  colSpan={4}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {state.current.Remarks}
                                </td>
                              </tr>
                            </>
                          )}
                          <tr style={{ height: "40px" }}></tr>
                          <tr style={{ borderBottom: "1px solid black" }}>
                            {column.current.map((itm: any, rowIdx: number) => {
                              return (
                                <th
                                  style={{
                                    width: itm.width,
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    textAlign:
                                      itm.datakey === "SEQ" ||
                                        itm.datakey === "Check_Amnt"
                                        ? "center"
                                        : "left",
                                    paddingLeft:
                                      itm.datakey === "Check_Date"
                                        ? "30px"
                                        : "0px",
                                  }}
                                  key={rowIdx}
                                >
                                  {itm.header}
                                </th>
                              );
                            })}
                          </tr>
                          <tr style={{ height: "5px" }}></tr>
                          {pages.map((rowItem: any, rowIdx: number) => {
                            return (
                              <tr key={rowIdx}>
                                {column.current.map(
                                  (colItem: any, colIdx: number) => {
                                    if (colItem.datakey === "BankName") {
                                      return (
                                        <td
                                          className={`editable not-looking  `}
                                          key={colIdx}
                                          style={{
                                            fontSize: "11px",
                                            fontWeight: "500",
                                            paddingLeft: "50px !important",
                                            width: `${colItem.width} !important`,
                                            textAlign: "left",
                                          }}
                                        >
                                          {rowItem[colItem.datakey] +
                                            " / " +
                                            rowItem.Branch}
                                        </td>
                                      );
                                    }
                                    return (
                                      <td
                                        className={`editable not-looking  `}
                                        key={colIdx}
                                        style={{
                                          fontSize: "11px",
                                          fontWeight: "500",
                                          paddingLeft: "50px !important",
                                          width: `${colItem.width} !important`,
                                          textAlign:
                                            colItem.datakey === "Check_Amnt" ||
                                              colItem.datakey === "SEQ"
                                              ? "right"
                                              : "left",
                                        }}
                                      >
                                        {colItem.datakey === "Check_Amnt"
                                          ? parseFloat(
                                            rowItem[colItem.datakey]
                                              .toString()
                                              .replace(/,/g, "")
                                          ).toLocaleString("en-US", {
                                            style: "decimal",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                          : rowItem[colItem.datakey]}
                                      </td>
                                    );
                                  }
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    }
                  </div>
                  <div
                    className="footer"
                    style={{
                      height: "100px",
                      display: "flex",
                      justifyContent: "space-between",
                      columnGap: "20px",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        height: "100px",
                        display: "flex",
                        justifyContent: "space-between",
                        columnGap: "20px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          columnGap: "10px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>Prepared :</span>
                        <span
                          style={{
                            borderBottom: "1px solid black",
                            flex: 1,
                            height: "11px",
                          }}
                        ></span>
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          columnGap: "10px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>Checked :</span>
                        <span
                          style={{
                            borderBottom: "1px solid black",
                            flex: 1,
                            height: "11px",
                          }}
                        ></span>
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          columnGap: "10px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>Approved :</span>
                        <span
                          style={{
                            borderBottom: "1px solid black",
                            flex: 1,
                            height: "11px",
                          }}
                        ></span>
                      </p>
                    </div>
                    <div
                      style={{
                        height: "30px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p style={{ fontSize: "8px" }}>09/01/2024</p>
                      <p style={{ fontSize: "8px" }}>
                        Page {RowNumber + 1} of {row.length}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ))}
        {module.current === "collection" && (
          <React.Fragment>
            <div
              className="page content one-page"
              style={{
                background: "white",
                boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                width: localStorage.getItem("paper-width") as string,
                height: localStorage.getItem("paper-height") as string,
                padding: "15px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  marginTop: "40px",
                }}
              >
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  {title.current}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  No. 1197 Azure Business Center EDSA-Munoz, Katipunan, Quezon
                  City
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  Tel. No. 8921-0154 / upward.csmi@gmail.com
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  COLLECTION RECEIPT
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  No: {data.current[1].Official_Receipt}
                </p>
              </div>
              <div
                style={{
                  border: "2px solid black",
                  height: "310px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Name & I.D. No:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        width: "400px",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].Payor}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "90px",
                      }}
                    >
                      Transaction Date:
                    </p>
                    <div
                      style={{ flex: 1, display: "flex", alignItems: "center" }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].DateOR}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Address:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].PayorAddress}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Amount Received:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {AmountToWords(
                          parseFloat(data.current[0].ORAmount.replace(/,/, ""))
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "14px",
                        fontWeight: "bold",
                        width: "120px",
                      }}
                    >
                      <span>{`( Php ${data.current[0].ORAmount} )`}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Items Paid:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].CRTitle}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Form of Payment:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].Payment  === 'Cash' ? data.current[1].Payment : ` ${data.current[1].Payment} - ${format(new Date(data.current[1].Check_Date),'MM/dd/yyy')} - ${data.current[1].Check_No} - ${data.current[1].Bank} `}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                </div>
                <div style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Cashier's Name & Signature / Date:
                    </p>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Payor's Acknowledgement Signature / Date:
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "11px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "8px",
                  }}
                >
                  Printed: {format(new Date(), "MM/dd/yyyy, hh:mm a")}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10px",
                    fontWeight: "600",
                    margin: "0",
                    paddingBottom: "8px",
                    fontFamily: "normal, italic",
                  }}
                >
                  𝘖𝘳𝘪𝘨𝘪𝘯𝘢𝘭 𝘊𝘰𝘱𝘺
                </p>
              </div>
              <div
                style={{
                  height: "65px",
                  margin: "0",
                  padding: "0",
                  borderBottom: "1px dotted black",
                }}
              ></div>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  marginTop: "40px",
                }}
              >
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  {title.current}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  No. 1197 Azure Business Center EDSA-Munoz, Katipunan, Quezon
                  City
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  Tel. No. 8921-0154 / upward.csmi@gmail.com
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  COLLECTION RECEIPT
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  No: {data.current[1].Official_Receipt}
                </p>
              </div>
              <div
                style={{
                  border: "2px solid black",
                  height: "310px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Name & I.D. No:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        width: "400px",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].Payor}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "90px",
                      }}
                    >
                      Transaction Date:
                    </p>
                    <div
                      style={{ flex: 1, display: "flex", alignItems: "center" }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].DateOR}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Address:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].PayorAddress}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Amount Received:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {AmountToWords(
                          parseFloat(data.current[0].ORAmount.replace(/,/, ""))
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "14px",
                        fontWeight: "bold",
                        width: "120px",
                      }}
                    >
                      <span>{`( Php ${data.current[0].ORAmount} )`}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Items Paid:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].CRTitle}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Form of Payment:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].Payment  === 'Cash' ?data.current[1].Payment :` ${data.current[1].Payment} - ${format(new Date(data.current[1].Check_Date),'MM/dd/yyy')} - ${data.current[1].Check_No} - ${data.current[1].Bank} `}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                  .               </div>
                <div style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Cashier's Name & Signature / Date:
                    </p>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Payor's Acknowledgement Signature / Date:
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "11px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "8px",
                  }}
                >
                  Printed: {format(new Date(), "MM/dd/yyyy, hh:mm a")}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10px",
                    fontWeight: "600",
                    margin: "0",
                    paddingBottom: "8px",
                    fontFamily: "normal, italic",
                  }}
                >
                  𝘋𝘶𝘱𝘭𝘪𝘤𝘢𝘵𝘦 𝘊𝘰𝘱𝘺
                </p>
              </div>
            </div>

            <div
              className="page content one-page"
              style={{
                background: "white",
                boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                width: localStorage.getItem("paper-width") as string,
                height: localStorage.getItem("paper-height") as string,
                padding: "15px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  marginTop: "40px",
                }}
              >
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  {title.current}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  No. 1197 Azure Business Center EDSA-Munoz, Katipunan, Quezon
                  City
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  Tel. No. 8921-0154 / upward.csmi@gmail.com
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  COLLECTION RECEIPT
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "5px",
                  }}
                >
                  No: {data.current[1].Official_Receipt}
                </p>
              </div>
              <div
                style={{
                  border: "2px solid black",
                  height: "310px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Name & I.D. No:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        width: "400px",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].Payor}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "90px",
                      }}
                    >
                      Transaction Date:
                    </p>
                    <div
                      style={{ flex: 1, display: "flex", alignItems: "center" }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].DateOR}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Payor's Address:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[0].PayorAddress}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      padding: "5px 10px",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                        width: "120px",
                      }}
                    >
                      Amount Received:
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {AmountToWords(
                          parseFloat(data.current[0].ORAmount.replace(/,/, ""))
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "14px",
                        fontWeight: "bold",
                        width: "120px",
                      }}
                    >
                      <span>{`( Php ${data.current[0].ORAmount} )`}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Items Paid:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].CRTitle}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "60px",
                      display: "flex",
                      padding: "2px 10px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Form of Payment:
                      </p>
                      <p
                        style={{
                          color: "black",
                          fontSize: "10.5px",
                          fontWeight: "500",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        Total
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "black",
                          fontSize: "11px",
                          fontWeight: "bold",
                          margin: "0",
                          padding: "0",
                        }}
                      >
                        {data.current[1].Payment  === 'Cash' ?data.current[1].Payment :` ${data.current[1].Payment} - ${format(new Date(data.current[1].Check_Date),'MM/dd/yyy')} - ${data.current[1].Check_No} - ${data.current[1].Bank} `}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingRight: "30px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-around",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                    <p
                      style={{
                        padding: "0",
                        margin: "0",
                        color: "black",
                        fontSize: "10.5px",
                        fontWeight: "bolder",
                        width: "120px",
                      }}
                    >
                      <span>{data.current[0].ORAmount}</span>
                    </p>
                  </div>
                </div>
                <div style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Cashier's Name & Signature / Date:
                    </p>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "50%",
                      paddingTop: "5px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        fontSize: "9.5px",
                        fontWeight: "500",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Payor's Acknowledgement Signature / Date:
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    color: "black",
                    fontSize: "11px",
                    fontWeight: "bold",
                    margin: "0",
                    paddingBottom: "8px",
                  }}
                >
                  Printed: {format(new Date(), "MM/dd/yyyy, hh:mm a")}
                </p>
                <p
                  style={{
                    color: "black",
                    fontSize: "10px",
                    fontWeight: "600",
                    margin: "0",
                    paddingBottom: "8px",
                    fontFamily: "normal, italic",
                  }}
                >
                  𝘛𝘳𝘪𝘱𝘭𝘪𝘤𝘢𝘵𝘦 𝘊𝘰𝘱𝘺
                </p>
              </div>
            </div>
          </React.Fragment>
        )}
        {module.current === "cash-disbursement" &&
          row?.map((pages, RowNumber) => {

            return (
              <div
                className="page content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "white",
                  boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                  width: localStorage.getItem("paper-width") as string,
                  height: localStorage.getItem("paper-height") as string,
                  padding: "50px",
                }}
                key={RowNumber}
              >
                <div
                  id="table"
                  style={{
                    flex: 1,
                  }}
                >
                  {title.current
                    .split("\n")
                    .map((t: string, idx: number) => {
                      return (
                        <div key={idx}>
                          <div style={{ fontSize: "22px", width: "100%", fontWeight: "bold", textAlign: "center" }}>{t}</div>
                        </div>
                      );
                    })}

                  <div style={{ height: "10px" }}></div>
                  <div style={{ fontWeight: "bold", fontSize: "12px", textAlign: "center" }}>1197 Edsa Katipunan Quezon City</div>
                  <div style={{ fontWeight: "bold", fontSize: "12px", textAlign: "center" }}> Tel 374-0472 / 441-8977-78</div>
                  <div style={{ height: "20px" }}></div>
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "100%", display: "flex" }}>
                      <div style={{ width: "60px", fontSize: "12px", fontWeight: "bold", }}>Pay to:</div>
                      <div style={{ width: "280px", fontSize: "12px", fontWeight: "bold", height: "auto", wordWrap: "break-word" }}>{state.current[0].PayeeName}</div>
                    </div>
                    <div style={{ width: "100%", display: "flex" }}>
                      <div style={{ width: "230px", boxSizing: "border-box", paddingRight: "20px", textAlign: "right", fontSize: "12px", fontWeight: "bold", }}>CV No.:</div>
                      <div style={{ width: "125px", fontSize: "12px", fontWeight: "bold" }}>{state.current[0].CvNo}</div>
                    </div>
                  </div>
                  <div style={{ height: "5px" }}></div>
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "100%", display: "flex" }}>
                      <div style={{ width: "60px", fontSize: "12px", fontWeight: "bold", }}>Address:</div>
                      <div style={{ width: "280px", fontSize: "12px", fontWeight: "bold", height: "auto", wordWrap: "break-word" }}>{state.current[0].Address}</div>
                    </div>
                    <div style={{ width: "100%", display: "flex" }}>
                      <div style={{ width: "230px", boxSizing: "border-box", paddingRight: "32px", textAlign: "right", fontSize: "12px", fontWeight: "bold", }}>Date:</div>
                      <div style={{ width: "125px", fontSize: "12px", fontWeight: "bold" }}>{format(new Date(state.current[0].DateApproved), 'MM/dd/yyyy')}</div>
                    </div>
                  </div>
                  <div style={{ height: "20px" }}></div>
                  <div style={{ display: "flex", borderBottom: "1px solid black" }}>
                    <div style={{ display: "flex", flex: 1, flexDirection: "column", }}>
                      <div style={{ paddingBottom: "10px", height: "auto", borderTop: "1px solid black", display: 'flex', flexDirection: "column", maxHeight: "200px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", height: "20px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid black" }}>PARTICULARS</div>
                        <div style={{ flex: 1, }}>
                          <div style={{ height: "5px" }}></div>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div style={{ width: "100px", fontSize: "12px", fontWeight: "bold", }}>In Payment for :</div>
                            <div style={{
                              width: "395px",
                              fontSize: "13px",
                              fontWeight: "bold",
                              height: "auto",
                              minHeight: "50px",
                              wordWrap: 'break-word', /* Ensures long words break to fit within the div */
                              overflowWrap: 'break-word'
                            }}>
                              {
                                state.current[0].Particulars.split('\n').map((itm: any, idx: number) => {
                                  return <p
                                    key={idx}
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      padding: 0,
                                      margin: 0,
                                      color: "black",
                                    }}
                                  >{itm}</p>
                                })
                              }
                            </div>
                          </div>
                          <div style={{ height: "10px" }}></div>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div style={{ width: "100px", fontSize: "12px", fontWeight: "bold", }}>Printed Check :</div>
                            <div style={{ width: "400px", fontSize: "12px", fontWeight: "bold", height: "auto", wordWrap: "break-word" }}>{`${state.current[0].CheckNo} (${format(new Date(state.current[0].CheckDate), 'MM/dd/yyyy')})`}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", width: "200px", flexDirection: "column", }}>
                      <div style={{ paddingBottom: "10px", height: "100%", borderTop: "1px solid black", borderLeft: "1px solid black", display: 'flex', flexDirection: "column", maxHeight: "200px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", borderBottom: "1px solid black" }}>AMOUNT</div>
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", textAlign: "center" }}>
                          <div style={{ width: "100%", display: "flex", }}>
                            <div style={{ width: "80px", fontSize: "12px", fontWeight: "bold", textAlign: "right", paddingRight: "10px" }}>PHP</div>
                            <div style={{ width: "100px", fontSize: "12px", fontWeight: "bold", textAlign: "left" }}>{toNumber(state.current[0].Credit)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "100%" }}>
                    {column.current.map((colItem: any, colIdx: number) => {
                      return (
                        <div
                          className={`cell  `}
                          key={colIdx}
                          style={{
                            borderBottom: "1px solid black",
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: `${colItem.width} `,
                            minWidth: `${colItem.width} `,
                            maxWidth: `${colItem.width} `,
                            textAlign:
                              colItem.datakey === "Debit" ||
                                colItem.datakey === "Credit"
                                ? "right"
                                : "left",
                            padding: "5px",
                          }}
                        >
                          {colItem.header}
                        </div>
                      );
                    }
                    )}
                  </div>
                  {pages.map((rowItem: any, rowIdx: number) => {
                    return (
                      <div className="row" key={rowIdx}>
                        {column.current.map(
                          (colItem: any, colIdx: number) => {
                            return (
                              <div
                                className={`cell  `}
                                key={colIdx}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  width: `${colItem.width} `,
                                  minWidth: `${colItem.width} `,
                                  maxWidth: `${colItem.width} `,
                                  textAlign:
                                    colItem.datakey === "Debit" ||
                                      colItem.datakey === "Credit"
                                      ? "right"
                                      : "left",
                                  padding: "5px",
                                }}
                              >
                                {colItem.datakey === 'Credit' || colItem.datakey === 'Debit' ? toNumber(rowItem[colItem.datakey]) : rowItem[colItem.datakey]}
                              </div>
                            );
                          }
                        )}
                      </div>
                    );
                  })}
                  <div style={{ height: "10px", borderBottom: "1px solid black" }}></div>
                  <div className="row">
                    <div className={`cell  `} style={{
                      width: `200px`,
                      minWidth: `200px`,
                      maxWidth: `200px`,
                      padding: "5px",
                    }}></div>
                    <div className={`cell  `} style={{
                      width: `277px `,
                      minWidth: `277px `,
                      maxWidth: `277px `,
                      padding: "5px",

                    }}></div>
                    <div
                      className={`cell  `}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        width: `100px `,
                        minWidth: `100px `,
                        maxWidth: `100px `,
                        textAlign: "right",
                        padding: "5px",
                      }}
                    >
                      {toNumber(state.current[0].DebitTotal)}
                    </div>
                    <div
                      className={`cell  `}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        width: `100px `,
                        minWidth: `100px `,
                        maxWidth: `100px `,
                        textAlign: "right",
                        padding: "5px",
                      }}
                    >
                      {toNumber(state.current[0].DebitTotal)}
                    </div>
                  </div>
                </div>
                <div
                  className="footer"
                  style={{
                    height: "170px",
                    display: "flex",
                    justifyContent: "space-between",
                    columnGap: "20px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "120px",
                      border: "1px solid black",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: "200px",
                        padding: "0px 10px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "12px",
                          padding: 0,
                          marginTop: "30px",
                          marginBottom: "20px",
                        }}
                      >
                        Prepared By :
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "12px",
                          padding: 0,
                        }}
                      >
                        Checked By :
                      </p>
                    </div>
                    <div
                      style={{
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        width: "140px",
                      }}
                    >
                      <p
                        style={{
                          height: "40px",
                          borderBottom: "1px solid black",
                          margin: 0,
                          color: "black",
                          padding: 0,
                          textAlign: "center",
                          lineHeight: "40px",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        Approved By :
                      </p>
                    </div>
                    <div style={{ width: "440px", padding: "10px" }}>
                      <p
                        style={{
                          margin: 0,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: 0,
                        }}
                      >
                        I/We Acknowledge the receipt of the sum in Philippine
                        Pesos
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: 0,
                          paddingTop: "5px",
                        }}
                      >
                        {AmountToWords(parseFloat(state.current[0].CreditTotal.replace(/,/g, '')))}&nbsp;&nbsp;{" "}
                        {`(P${toNumber(state.current[0].CreditTotal)})`}
                      </p>

                      <div style={{ marginTop: "40px", display: "flex" }}>
                        <p
                          style={{
                            margin: 0,
                            color: "black",
                            fontWeight: "bold",
                            fontSize: "12px",
                            padding: 0,
                            paddingRight: "5px",
                          }}
                        >
                          Received By:
                        </p>{" "}
                        <p
                          style={{
                            margin: 0,
                            padding: 0,
                            borderBottom: "1px solid black",
                            width: "170px",
                          }}
                        ></p>
                        <p
                          style={{
                            margin: 0,
                            padding: 0,
                            borderBottom: "1px solid black",
                            width: "90px",
                            marginLeft: "20px",
                          }}
                        ></p>
                      </div>
                      <div style={{ display: "flex", position: "relative" }}>
                        <div style={{
                          textAlign: "center",
                          width: "170px",
                          position: "absolute",
                          top: state.current[0].PayeeName.length >= 23 ? "-30px" : "-20px",
                          left: "75px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}
                        >{state.current[0].PayeeName}</div>
                        <p
                          style={{
                            margin: 0,
                            color: "black",
                            fontWeight: "bold",
                            fontSize: "10px",
                            padding: 0,
                            paddingRight: "5px",
                            width: "190px",
                            textAlign: "right",
                          }}
                        >
                          Printed Name
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "black",
                            fontWeight: "bold",
                            fontSize: "10px",
                            padding: 0,
                            paddingRight: "5px",
                            width: "123px",
                            textAlign: "right",
                          }}
                        >
                          Date
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      {format(new Date(), "MM/dd/Y")}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      Page {RowNumber + 1} of {row.length}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        {module.current === "general-journal" &&
          row?.map((pages, RowNumber) => {
            const totalCredit = parseFloat(
              data.current.reduce((a: number, itm: any) => {
                return a + parseFloat(itm.credit.toString().replace(/,/g, ""));
              }, 0)
            );

            return (
              <div
                className="page content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "white",
                  boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                  width: localStorage.getItem("paper-width") as string,
                  height: localStorage.getItem("paper-height") as string,
                  padding: "50px",
                }}
                key={RowNumber}
              >
                <div
                  id="table"
                  style={{
                    flex: 1,
                  }}
                >
                  {RowNumber === 0 && <>
                    {title.current
                      .split("\n")
                      .map((t: string, idx: number) => {
                        return (
                          <div className="row " key={idx}>
                            <div className="cell " style={{ fontSize: "18px", width: "100%", fontWeight: "bold" }}>{t}</div>
                          </div>
                        );
                      })}

                    <div style={{ height: "10px", }}></div>
                    <div style={{ fontWeight: "bold" }}>Journal Voucher</div>
                    <div style={{ display: "flex", fontSize: "12px", fontWeight: "bold", width: "100%", justifyContent: "flex-end" }}><div style={{ width: "50px" }}>JV No.</div><div>:</div><div style={{ marginLeft: "10px", width: "100px" }}>{state.current.JVNo}</div></div>
                    <div style={{ display: "flex", fontSize: "12px", fontWeight: "bold", width: "100%", justifyContent: "flex-end" }}><div style={{ width: "50px" }}>Date  </div><div>:</div><div style={{ marginLeft: "10px", width: "100px" }}>{state.current.JVDate}</div></div>
                  </>}
                  {
                    <div className="table">
                  
                          <div className="row" style={{ height: "30px" }}></div>
                          <div className="row" style={{ borderTop: "1px solid black", borderBottom: "1px solid black" }}>
                            {column.current.map((itm: any, rowIdx: number) => {
                              return (
                                <div className="cell" key={rowIdx}
                                  style={{
                                    width: itm.width,
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    textAlign:
                                      itm.datakey === "debit" ||
                                        itm.datakey === "credit"
                                        ? "right"
                                        : "left",
                                    padding: "5px 0px",
                                  }}
                                >{itm.header}</div>
                              );
                            })}
                          </div>
                          <div style={{ height: "10px", }}></div>
                    
                      {pages.map((rowItem: any, rowIdx: number) => {
                        return (
                          <div key={rowIdx} className="row" >
                            {column.current.map(
                              (colItem: any, colIdx: number) => {
                                return (
                                  <div
                                    className={`cell  `}
                                    key={colIdx}
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      width: `${colItem.width}`,
                                      maxWidth: `${colItem.width}`,
                                      minWidth: `${colItem.width}`,
                                      textAlign:
                                        colItem.datakey === "debit" ||
                                          colItem.datakey === "credit"
                                          ? "right"
                                          : "left",
                                      padding: "5px",
                                    }}
                                  >
                                    {rowItem[colItem.datakey]}
                                  </div>
                                );
                              }
                            )}
                          </div>

                        );
                      })}
                    </div>

                  }
                  {RowNumber === row.length - 1 && (
                    <>
                      <div className="row" style={{ height: "15px", }}></div>
                      <div style={{ border: "1px solid black" }}></div>
                      <div className="row">
                        <div
                          className="cell"
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            paddingRight: "50px",
                            fontWeight: "bold",
                            fontSize: "11px",
                            width: "600px"
                          }}
                        >
                          TOTAL:
                        </div>
                        <div
                          className="cell"
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "right",
                            padding: "10px",
                            width: "80px"
                          }}
                        >
                          {data.current
                            .reduce((d: number, aa: any) => {
                              return (
                                d +
                                parseFloat(
                                  aa.debit.toString().replace(/,/g, "")
                                )
                              );
                            }, 0)
                            .toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </div>
                        <div
                          className="cell"
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "right",
                            width: "80px"
                          }}
                        >
                          {totalCredit.toLocaleString("en-US", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div style={{ border: "1px solid black" }}></div>
                      <div style={{ textAlign: "center", width: "100%", fontSize: "11px", fontWeight: "bold", padding: "3px 0" }}>EXPLANATION</div>
                      <div style={{ border: "1px solid black" }}></div>
                      <div style={{ width: "100%", fontSize: "11px", fontWeight: "bold", padding: "3px 0", textAlign: "center" }}>{state.current.JVExp}</div>
                      <div style={{ height: "50px", }}></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "11px", borderTop: "1px solid black", width: "200px", textAlign: "center", padding: "2px 0", fontWeight: "bold" }}>Prepared By</div>
                        <div style={{ fontSize: "11px", borderTop: "1px solid black", width: "200px", textAlign: "center", padding: "2px 0", fontWeight: "bold" }}>Checked By</div>
                        <div style={{ fontSize: "11px", borderTop: "1px solid black", width: "200px", textAlign: "center", padding: "2px 0", fontWeight: "bold" }}>Approved By</div>
                      </div>

                    </>
                  )}

                </div>
                <div
                  className="footer"
                  style={{
                    height: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    columnGap: "20px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      Printed Date: {format(new Date(), "MM/dd/Y")}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      Page {RowNumber + 1} of {row.length}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        {module.current === "warehouse" && row.length > 0 && (
          <div
            className="page content"
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
              width: localStorage.getItem("paper-width") as string,
              height: localStorage.getItem("paper-height") as string,
              padding: "50px 20px",
            }}
          >
            <div
              style={{
                flex: 1,
              }}
            >
              {
                <table
                  id="table"
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    border: "1px solid white",
                  }}
                >
                  <thead>
                    {title.current.split("\n").map((t: string, idx: number) => {
                      return (
                        <tr key={idx}>
                          <th
                            style={{
                              fontSize: "13px",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                            colSpan={column.current.length}
                          >
                            {t}
                          </th>
                        </tr>
                      );
                    })}
                    <tr style={{ height: "30px" }}></tr>
                    <tr style={{ height: "40px" }}></tr>
                    <tr
                      style={{
                        borderBottom: "1px solid black",
                        borderTop: "1px solid black",
                      }}
                    >
                      {column.current.map((itm: any, rowIdx: number) => {
                        return (
                          <th
                            style={{
                              width: `${itm.width} !important`,
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign:
                                itm.datakey === "debit" ||
                                  itm.datakey === "credit"
                                  ? "right"
                                  : "left",
                              padding: "5px 0px",
                            }}
                            key={rowIdx}
                          >
                            {itm.header}
                          </th>
                        );
                      })}
                    </tr>
                    <tr style={{ height: "5px" }}></tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: "10px" }}></tr>
                    {row[pages]?.map((rowItem: any, rowIdx: number) => {
                      return (
                        <tr key={rowIdx}>
                          {column.current.map(
                            (colItem: any, colIdx: number) => {
                              return (
                                <td
                                  className={`editable not-looking  c-${colIdx}`}
                                  key={colIdx}
                                  style={{
                                    width: colItem.width,
                                    maxHeight: "35px",
                                    height: "35px",
                                    position: "relative",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      textAlign:
                                        colItem.datakey === "Check_Amnt"
                                          ? "right"
                                          : "left",
                                      height: "35px",
                                      whiteSpace: "pre-wrap",
                                      overflow: "hidden",
                                      maxHeight: "35px",
                                      color: "black",
                                      width: "100%",
                                      position: "absolute",
                                      top: 0,
                                      padding: "5px",
                                      boxSizing: "border-box",
                                    }}
                                  >
                                    {rowItem[colItem.datakey]}
                                  </p>
                                </td>
                              );
                            }
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              }
            </div>
            <div
              className="footer"
              style={{
                height: "auto",
                display: "flex",
                justifyContent: "space-between",
                columnGap: "20px",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "30px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Printed Date: {format(new Date(), "MM/dd/Y")}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Page {pages + 1} of {row.length}
                </p>
              </div>
            </div>
          </div>
        )}
        {
          module.current === "cash-disbursement-check" && (
            <div
              className="page content"
              style={{
                display: "flex",
                flexDirection: "column",
                background: "white",
                boxShadow: "10px 10px 34px -6px rgba(0,0,0,0.44)",
                width: localStorage.getItem("paper-width") as string,
                height: localStorage.getItem("paper-height") as string,
                padding: "50px 100px",
              }}
            >
              <div
                id="table"
                style={{
                  flex: 1,
                  fontWeight: "bold",
                  position: "relative",
                  color: "black"
                }}
              >

                <div style={{
                  fontSize: "14px",
                  display: "flex",
                  columnGap: "10px",
                  justifyContent: "flex-end",
                  position: "absolute",
                  right: "43px",
                  top: "4px"
                }}>
                  <span style={{ letterSpacing: "10px" }}>{format(new Date(state.current.checkDate), 'MM')}</span>
                  <span style={{ letterSpacing: "10px" }}>{format(new Date(state.current.checkDate), 'dd')}</span>
                  <span style={{ letterSpacing: "12px" }}>{format(new Date(state.current.checkDate), 'yyyy')}</span>
                </div>

                <div style={{
                  fontSize: "14px",
                  display: "flex",
                  columnGap: "10px",
                  justifyContent: "flex-end",
                  marginBottom: "20px",
                  paddingRight: "15px",
                  marginTop: "8px",

                }}>
                  <div style={{ height: "15px" }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: "space-between", marginBottom: "10px", position: "relative" }}>
                  <div style={{
                    fontSize: "13px",
                    position: "absolute",
                    width: "300px",
                    minHeight: "18px",
                    wordWrap: "break-word",
                    left: "83px",
                    top: "18px",
                    transform: "translateY(-100%)",
                  }}>{`${state.current.Payto}`}</div>
                  <div style={{
                    fontSize: "14px",
                    position: "absolute",
                    width: "180px",
                    height: "auto",
                    wordWrap: "break-word",
                    right: "50px",
                    top: "0px",
                    textAlign: "center",
                  }}>{`${state.current.credit}`}</div>


                  <div style={{
                    fontSize: "12px",
                    position: "absolute",
                    width: "564px",
                    minHeight: "18px",
                    wordWrap: "break-word",
                    left: "62px",
                    top: "48px",
                    transform: "translateY(-100%)",
                  }}>{`${AmountToWords(parseFloat(state.current.credit.replace(/,/g, '')))}`}</div>
                </div>

              </div>
              <div
                className="footer">
              </div>
            </div>
          )
        }
      </div>
    </main >
  );
}
