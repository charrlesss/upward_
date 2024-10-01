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
        const rows = chunkArray(data.current, 13);
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
                  border-spacing: 50px
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
           
            </style> 
          </svg>`
      );
    return dataURL;
  }
  const captureElement = async (page: Element) => {
    console.log(page.querySelector("table"));
    const imgData = convertElementToURL(page.querySelector("table") as Element);
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
                        {data.current[1].Payment}
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
                        {data.current[1].Payment}
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
                        {data.current[1].Payment}
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
                  padding: "50px 20px",
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
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        {title.current
                          .split("\n")
                          .map((t: string, idx: number) => {
                            return (
                              <tr key={idx}>
                                <th
                                  style={{
                                    fontSize: "22px",
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
                        <tr>
                          <td
                            colSpan={column.current.length}
                            style={{
                              textAlign: "center",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            1197 Edsa Katipunan Quezon City
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={column.current.length}
                            style={{
                              textAlign: "center",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            Tel 374-0472 / 441-8977-78
                          </td>
                        </tr>
                        <tr style={{ height: "50px" }}></tr>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            Pay to: {"         " + data.current[0].Payto}
                          </td>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            CV No: {"         " + data.current[0].refNo}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            Address: {"         " + data.current[0].address}
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            Date Created:{" "}
                            {"         " +
                              format(
                                new Date(data.current[0].dateEntry),
                                "dd-MMMM-yyyy"
                              )}
                          </td>
                        </tr>
                        <tr style={{ height: "15px" }}></tr>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "center",
                              fontSize: "12px",
                              fontWeight: "bold",
                              padding: "5px 0px",
                              borderTop: "1px solid black",
                              borderBottom: "1px solid black",
                            }}
                          >
                            PARTICULARs
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              borderLeft: "1px solid black",
                              borderTop: "1px solid black",
                              textAlign: "right",
                              fontSize: "12px",
                              fontWeight: "bold",
                              borderBottom: "1px solid black",
                            }}
                          >
                            AMOUNT
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                              height: "auto",
                              padding: "5px 0",
                            }}
                          >
                            <span>
                              In Payment for : &nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                            <span>{state.current.particulars}</span>
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              borderLeft: "1px solid black",
                            }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                              height: "auto",
                            }}
                          >
                            <span>
                              Printed Check : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                            <span>
                              {
                                data.current.filter(
                                  (itm: any) =>
                                    itm.checkNo !== "" &&
                                    itm.checkNo !== null &&
                                    itm.checkNo !== undefined
                                )[0].checkNo
                              }
                            </span>
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: "bold",
                              borderLeft: "1px solid black",
                            }}
                          >
                            <span style={{ width: "100px", padding: "0 10px" }}>
                              PHP
                            </span>
                            <span style={{ float: "right" }}>
                              {totalCredit.toLocaleString("en-US", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                        </tr>
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
                        {pages.map((rowItem: any, rowIdx: number) => {
                          return (
                            <tr key={rowIdx}>
                              {column.current.map(
                                (colItem: any, colIdx: number) => {
                                  return (
                                    <td
                                      className={`editable not-looking  `}
                                      key={colIdx}
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        width: `${colItem.width} !important`,
                                        textAlign:
                                          colItem.datakey === "debit" ||
                                          colItem.datakey === "credit"
                                            ? "right"
                                            : "left",
                                        padding: "5px",
                                      }}
                                    >
                                      {rowItem[colItem.datakey]}
                                    </td>
                                  );
                                }
                              )}
                            </tr>
                          );
                        })}
                        <tr style={{ height: "10px" }}></tr>
                        <tr style={{ borderTop: "1px solid black" }}>
                          <td colSpan={3} style={{ padding: "10px" }}></td>
                          <td
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "right",
                              padding: "10px",
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
                          </td>
                          <td
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "right",
                            }}
                          >
                            {totalCredit.toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  }
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
                        width: "250px",
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
                        width: "150px",
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
                        Prepared By :
                      </p>
                    </div>
                    <div style={{ width: "400px", padding: "10px" }}>
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
                        {AmountToWords(totalCredit)}&nbsp;&nbsp;{" "}
                        {`(P${totalCredit.toLocaleString("en-US", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })})`}
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
                        ></p>{" "}
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
                      <div style={{ display: "flex" }}>
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
                  padding: "50px 20px",
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
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        {title.current
                          .split("\n")
                          .map((t: string, idx: number) => {
                            return (
                              <tr key={idx}>
                                <th
                                  style={{
                                    fontSize: "22px",
                                    fontWeight: "bold",
                                    textAlign: "left",
                                  }}
                                  colSpan={column.current.length}
                                >
                                  {t}
                                </th>
                              </tr>
                            );
                          })}
                        <tr>
                          <td
                            style={{ fontSize: "16px", fontWeight: "bold" }}
                            colSpan={column.current.length}
                          >
                            Journal Voucher
                          </td>
                        </tr>
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
                        {pages.map((rowItem: any, rowIdx: number) => {
                          return (
                            <tr key={rowIdx}>
                              {column.current.map(
                                (colItem: any, colIdx: number) => {
                                  return (
                                    <td
                                      className={`editable not-looking  `}
                                      key={colIdx}
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        width: `${colItem.width} !important`,
                                        textAlign:
                                          colItem.datakey === "debit" ||
                                          colItem.datakey === "credit"
                                            ? "right"
                                            : "left",
                                        padding: "5px",
                                      }}
                                    >
                                      {rowItem[colItem.datakey]}
                                    </td>
                                  );
                                }
                              )}
                            </tr>
                          );
                        })}
                        {RowNumber === row.length - 1 && (
                          <>
                            <tr style={{ height: "10px" }}></tr>
                            <tr
                              style={{
                                borderTop: "1px solid black",
                                borderBottom: "1px solid black",
                              }}
                            >
                              <td
                                colSpan={5}
                                style={{
                                  padding: "10px",
                                  textAlign: "right",
                                  paddingRight: "50px",
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                }}
                              >
                                TOTAL:
                              </td>
                              <td
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                  padding: "10px",
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
                              </td>
                              <td
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "right",
                                }}
                              >
                                {totalCredit.toLocaleString("en-US", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid black" }}>
                              <td
                                colSpan={column.current.length}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  padding: "5px 0",
                                }}
                              >
                                EXPLANATION
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan={column.current.length}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                  padding: "5px 0",
                                }}
                              >
                                {state.current.explanation}
                              </td>
                            </tr>
                            <tr style={{ height: "15px" }}></tr>
                            <tr>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                  padding: "5px 0",
                                }}
                              >
                                Prepared By:
                              </td>
                              <td
                                colSpan={2}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                  padding: "5px 0",
                                }}
                              >
                                Checked By:
                              </td>
                              <td
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  padding: "5px 0",
                                }}
                              >
                                Approved By:
                              </td>
                            </tr>
                          </>
                        )}
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
      </div>
    </main>
  );
}
