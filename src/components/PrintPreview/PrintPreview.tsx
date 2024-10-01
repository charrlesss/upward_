import {
  useReducer,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useContext,
} from "react";
import { renderToString } from "react-dom/server";
import { IconButton, Button } from "@mui/material";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import { grey } from "@mui/material/colors";
import MenuIcon from "@mui/icons-material/Menu";
import "./printpreview.css";
import useUrlParams from "../../hooks/useUrlParams";
import SidebarMobile from "../Sidebars/SiderbarMobile";
import { format } from "date-fns";
import SaveAsFile from "../../lib/saveAsFile";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
let selected: Array<any> = [];
let copySelected = "";
let scaleValue = 100;
const drawerWidth = 280;
export const bgSetting = "#FEFBF6";

function convertElementToURL(page: Element) {
  const elements = page.querySelector(".content table") as Element;
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
                  height: 100vh;
                  width: 100vw;
                  box-shadow: 1px 1px 1px black;
              }
              .content{
                  flex: 1;
                  block-size: fit-content;
                  text-align: center;
              }
              table {
                border-collapse: collapse;
                border-spacing: 50px
              }
              thead tr.headerColumn{
                  border-bottom: 1px solid black;
              }
              .content img{
                  width: 97%;
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
interface PrintPreviewType {
  Setting: (state: any, dispatch: any) => React.JSX.Element;
  onReportSubmit(setData: any, setLoading: any, state: any): Promise<void>;
  drawTable: (data: any, state: any) => React.JSX.Element;
  initialState: any;
  column: Array<any>;
  scaleDefaultValue?: number;
  pageHeight?: string;
  pageWidth?: string;
  addHeaderGroup?: React.JSX.Element;
  activePagination?: boolean;
}
export default function PrintPreview({
  Setting,
  onReportSubmit,
  drawTable,
  initialState,
  column,
  scaleDefaultValue,
  pageHeight = "8.5in",
  pageWidth = "15in",
  addHeaderGroup = <></>,
  activePagination = false,
}: PrintPreviewType) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [showSidebarReport, setShowSidebarReport] = useState(true);

  if (scaleDefaultValue) {
    scaleValue = scaleDefaultValue;
  }
  const headerRef = useRef<any>(null);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState<any>([]);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const captureElement = async (page: Element) => {
    const imgData = convertElementToURL(page);
    const tableIamge = '<img src="' + imgData + '" />';
    const header = page.querySelector(".header") as Element;
    const content = `<div class="content">${tableIamge}</div>`;
    const footer = page.querySelector(".footer") as Element;
    return `<div class="page">${header.outerHTML}${content}${footer.outerHTML}</div>`;
  };

  async function getPaperToPrint() {
    let printString = "";
    for (const page of pages) {
      const div = document.createElement("div");
      div.innerHTML = renderToString(page);
      const newPage = div.firstChild as Element;
      printString += await captureElement(newPage);
    }
    return printString;
  }

  async function clickPrint() {
    if (scaleValue < 0 || scaleValue > 200) {
      return alert("invalid scale");
    }
    await getPaperToPrint().then((printString) => {
      const iframe = document.createElement("iframe") as HTMLIFrameElement;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
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
                                padding: 0;
                            }
                          .page{
                              page-break-after: always;
                              display: flex;
                              flex-direction: column;
                              height: 100vh;
                              width: 100vw;
                              box-shadow: 1px 1px 1px black;
                          }
                          .content{
                              flex: 1;
                              block-size: fit-content;
                              text-align: center;
                          }
                          .content img{
                              width: 95%;
                              height: 100%;
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
      }, 1000);
    });
  }
  async function exportToExcel() {
    let extractTable = "";
    const tables: Array<Element> = pages.map((page: any) => {
      const div = document.createElement("div");
      div.innerHTML = renderToString(page);
      return div.querySelector("table");
    });
    extractTable += "<table>";
    tables.forEach((table, idx) => {
      if (idx === 0) {
        const thead = table.querySelector("thead");
        extractTable += thead?.outerHTML;
      }
      const tbody = table.querySelector("tbody");
      extractTable += tbody?.outerHTML;
      if (idx === tables.length - 1) {
        const tfoot = table.querySelector("tfoot");
        extractTable += tfoot?.outerHTML;
      }
    });
    extractTable += "</table>";
    SaveAsFile(extractTable);
  }
  useEffect(() => {
    window.addEventListener("copy", () => {
      if (selected.length > 0 && copySelected !== "") {
        navigator.clipboard.writeText(copySelected);
      }
    });
  }, []);
  useEffect(() => {
    document.addEventListener("click", function (event) {
      const el = event.target as Element;
      if (!el.closest("td")) {
        document.querySelectorAll("td").forEach(function (td) {
          td.classList.remove("active");
        });
      }
      if (!el.closest("th")) {
        document.querySelectorAll("th").forEach(function (td) {
          td.classList.remove("active");
        });
      }
    });
    function clickSelector(element: string) {
      document.querySelectorAll(`${element}`).forEach((td) => {
        td.addEventListener("click", () => {
          document.querySelectorAll(`${element}`).forEach((cell) => {
            cell.classList.remove("active");
          });
          td.classList.add("active");
        });
      });
    }
    clickSelector("td");
    clickSelector("th");
  });
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--custom-pageHeight",
      pageHeight
    );
    document.documentElement.style.setProperty("--custom-pageWidth", pageWidth);
  }, [pageHeight, pageWidth]);
  useEffect(() => {
    setPages(drawTable(data, headerRef.current?.getState()));
  }, [data, drawTable]);

  return (
    <div className="main">
      <div className="main-page">
        <div
          style={{
            display: "flex",
            position: "relative",
            flex: 1,
            height: "calc(100vh - 55px)",
            overflow: "auto",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "14in",
              position: "relative",
            }}
          >
            <HeaderPrinter
              ref={headerRef}
              clickPrint={clickPrint}
              onReportSubmit={onReportSubmit}
              Setting={Setting}
              setData={setData}
              setLoading={setLoading}
              initialState={initialState}
              exportToExcel={exportToExcel}
              activePagination={activePagination}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              pages={pages}
              setShowSidebarReport={setShowSidebarReport}
              showSidebarReport={showSidebarReport}
            />
            {(data.length <= 0 || loading) && (
              <div
                className="page out-page"
                style={{ width: pageWidth, height: pageHeight }}
              >
                <div className="header" style={{ height: "50px" }}></div>
                <div className="content">
                  <table>
                    <thead>
                      {initialState.title
                        .split("\n")
                        .map((d: any, i: number) => {
                          return (
                            <tr key={i}>
                              <td
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                }}
                                colSpan={3}
                              >
                                {d}
                              </td>
                            </tr>
                          );
                        })}
                      <tr style={{ height: "40px" }}></tr>
                      {addHeaderGroup}
                      <tr className="headerColumn">
                        {column.map((itm, idx) => {
                          return (
                            <th
                              key={idx}
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                borderBottom: "1px solid black",
                              }}
                            >
                              {itm.header}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
                <div
                  className="footer"
                  style={{
                    height: "50px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                    {format(new Date(), "MM/dd/Y")}
                  </p>
                  <p style={{ fontSize: "10px", fontWeight: "bold" }}>
                    Page 1 of 1
                  </p>
                </div>
              </div>
            )}
            {loading ? (
              <div className="main-loader">
                <div className="main-loader-content">
                  <div className="lds-dual-ring"></div>
                </div>
              </div>
            ) : (
              <>{pages[pageNumber]}</>
            )}
          </div>
        </div>
        <div
          style={{
            boxSizing: "border-box",
            width: showSidebarReport ? "400px" : "0px",
            height: "100%",
            position: "relative",
            background: "white",
            transition: "all 300ms",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: showSidebarReport ? "0px" : "-500px",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              className="links"
              style={{
                width: "170px",
                background: bgSetting,
              }}
            >
              {(user?.userAccess === "ACCOUNTING" ||
                user?.userAccess === "PRODUCTION_ACCOUNTING" ||
                user?.userAccess === "ADMIN") && (
                <>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/schedule-account"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/schedule-account?drawer=false"
                      )
                    }
                  >
                    Schedule Account
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/subsidiary-ledger"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/subsidiary-ledger?drawer=false"
                      )
                    }
                  >
                    Subsidiary Ledger
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/trial-balance"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/trial-balance?drawer=false"
                      )
                    }
                  >
                    Trial Balance
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/income-statement-long"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/income-statement-long?drawer=false"
                      )
                    }
                  >
                    Income Statement Long
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/balance-sheet-long"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/balance-sheet-long?drawer=false"
                      )
                    }
                  >
                    Balance Sheet Long
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/general-ledger"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/general-ledger?drawer=false"
                      )
                    }
                  >
                    General Ledger
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/abstract-collections"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/abstract-collections?drawer=false"
                      )
                    }
                  >
                    Abstract Collections
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/deposited-collections"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/deposited-collections?drawer=false"
                      )
                    }
                  >
                    Deposited Collections
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/returned-checks"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/returned-checks?drawer=false"
                      )
                    }
                  >
                    Returned Checks
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/post-dated-checks-registry"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/post-dated-checks-registry?drawer=false"
                      )
                    }
                  >
                    Post Dated Checks Registry
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/petty-cash-fund-disbursement"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/petty-cash-fund-disbursement?drawer=false"
                      )
                    }
                  >
                    Petty Cash Fund Disbursement
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/cash-disbursement-book"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/cash-disbursement-book?drawer=false"
                      )
                    }
                  >
                    Cash Disbursement Book
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/general-journal-book"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/general-journal-book?drawer=false"
                      )
                    }
                  >
                    General Journal Book
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/production-book"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/production-book?drawer=false"
                      )
                    }
                  >
                    Production Book
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/vat-book"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/vat-book?drawer=false"
                      )
                    }
                  >
                    Vat Book
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/accounting/aging-accounts"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/accounting/aging-accounts?drawer=false"
                      )
                    }
                  >
                    Aging Accounts
                  </button>
                </>
              )}
              {(user?.userAccess === "PRODUCTION" ||
                user?.userAccess === "PRODUCTION_ACCOUNTING" ||
                user?.userAccess === "ADMIN") && (
                <>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/production/production-report"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/production/production-report?drawer=false"
                      )
                    }
                  >
                    Production Report
                  </button>
                  <button
                    style={{
                      background:
                        location.pathname ===
                        "/dashboard/reports/production/renewal-notice"
                          ? "#e4e4e7"
                          : "",
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/reports/production/renewal-notice?drawer=false"
                      )
                    }
                  >
                    Renewal Notice
                  </button>
                </>
              )}
              {(user?.userAccess === "CLAMIS" ||
                user?.userAccess === "ADMIN") && (
                <button
                  style={{
                    background:
                      location.pathname ===
                      "/dashboard/reports/claims/claims-report"
                        ? "#e4e4e7"
                        : "",
                  }}
                  onClick={() =>
                    navigate(
                      "/dashboard/reports/claims/claims-report?drawer=false"
                    )
                  }
                >
                  Claims Report
                </button>
              )}
            </div>
            <div
              style={{
                flex: 1,
                background: bgSetting,
                borderLeft: "1px solid #F9EFDB",
                boxShadow: "-22px -1px 83px 10px rgba(0,0,0,0.12)",
              }}
            >
              {Setting(state, dispatch)}
              <div style={{ width: "100%" }}>
                <Button
                  fullWidth
                  onClick={() => {
                    setLoading(true);
                    onReportSubmit(setData, setLoading, state);
                  }}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
interface HeaderPrinterType {
  clickPrint: () => Promise<void>;
  onReportSubmit(setData: any, setLoading: any, state: any): Promise<void>;
  Setting: (state: any, dispatch: any) => React.JSX.Element;
  setData: React.Dispatch<React.SetStateAction<never[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  initialState: any;
  exportToExcel: React.MouseEventHandler<HTMLButtonElement>;
  activePagination?: boolean;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  pages: Array<any>;
  setShowSidebarReport: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebarReport: boolean;
}
const HeaderPrinter = forwardRef(
  (
    {
      clickPrint,
      onReportSubmit,
      Setting,
      setData,
      setLoading,
      initialState,
      exportToExcel,
      activePagination = false,
      pageNumber,
      setPageNumber,
      pages,
      setShowSidebarReport,
    }: HeaderPrinterType,

    ref
  ) => {
    const { searchParams, setSearchParams } = useUrlParams();

    const [scale, setScale] = useState(0);
    const [state, dispatch] = useReducer(reducer, initialState);
    useImperativeHandle(ref, () => ({
      getState: () => {
        return state;
      },
    }));
    function handleSidebar() {
      setSearchParams(
        (prev) => {
          prev.set(
            "drawer",
            (searchParams.get("drawer") === "false").toString()
          );
          return prev;
        },
        { replace: true }
      );
    }
    const openSidebar = searchParams.get("drawer") === "true";

    return (
      <>
        <div className="main-header">
          <div>
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleSidebar()}
              style={{ marginTop: "5px" }}
            >
              <MenuIcon color="secondary" />
            </IconButton>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", columnGap: "10px" }}
          >
            {!activePagination && (
              <>
                <div
                  style={{ display: "flex", alignItems: "center" }}
                  id="paggination-container"
                >
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setPageNumber(0);
                    }}
                  >
                    <svg
                      width="18px"
                      height="18px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 19L12.7071 12.7071C12.3166 12.3166 12.3166 11.6834 12.7071 11.2929L19 5"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11 19L4.70711 12.7071C4.31658 12.3166 4.31658 11.6834 4.70711 11.2929L11 5"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      if (pageNumber <= 0) {
                        return;
                      }
                      const count = pageNumber - 1;

                      setPageNumber(count);
                    }}
                  >
                    <svg
                      width="18px"
                      height="18px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (pageNumber >= pages.length - 1) {
                        return;
                      }
                      const count = pageNumber + 1;
                      setPageNumber(count);
                    }}
                  >
                    <svg
                      width="18px"
                      height="18px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setPageNumber(pages.length - 1);
                    }}
                  >
                    <svg
                      width="18px"
                      height="18px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.5 5L11.7929 11.2929C12.1834 11.6834 12.1834 12.3166 11.7929 12.7071L5.5 19"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.5 5L19.7929 11.2929C20.1834 11.6834 20.1834 12.3166 19.7929 12.7071L13.5 19"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </IconButton>
                </div>
                <label>Custom Page</label>
                <input
                  style={{ width: "80px" }}
                  onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                      e.preventDefault();
                      const el = e.target as HTMLInputElement;
                      const value = el.value;
                      if (
                        value === "" ||
                        value === undefined ||
                        value === null
                      ) {
                        return alert("Input is required field");
                      }
                      const customPage = parseInt(value) - 1;
                      if (customPage > pages.length - 1 || customPage < 0) {
                        return alert("Invalid Page");
                      }

                      setPageNumber(customPage);
                    }
                  }}
                  placeholder={`${pageNumber}`}
                  min={0}
                  max={200}
                  id="cs-page"
                />
              </>
            )}
            <label htmlFor="scale" id="scale-lbl">
              Scale
            </label>
            <select
              id="scale"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
            >
              <option value={0}>default</option>
              <option value={1}>Custom</option>
            </select>
            {scale === 1 && (
              <input
                style={{ width: "80px" }}
                type="number"
                onChange={(e) => {
                  scaleValue = parseInt(e.target.value);
                }}
                placeholder={`${scaleValue}`}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    clickPrint();
                  }
                }}
              />
            )}
            <IconButton onClick={clickPrint}>
              <LocalPrintshopIcon color="primary" />
            </IconButton>
            <IconButton size="small" color="success" onClick={exportToExcel}>
              <LibraryBooksIcon color="success" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: grey[700] }}
              onClick={() => {
                setShowSidebarReport((d) => !d);
              }}
            >
              <SettingsIcon sx={{ color: grey[700] }} />
            </IconButton>
          </div>
        </div>
        <SidebarMobile
          open={openSidebar}
          drawerWidth={drawerWidth}
          handleDrawerClose={() => handleSidebar()}
        />
      </>
    );
  }
);
export function formatNumberWithCommas(number: number) {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function columnSelection(e: any) {
  const target = e.target as Element;
  const classNamePage = (Array.from(target.classList) as any)
    .filter((d: any) => d.includes("page"))[0]
    .split("-");

  const className = Array.from(target.classList)
    .filter((d) => d.includes("row"))[0]
    .split("_");
  const getRow = className[0].split("-")[1];
  const getColumn = className[1].split("-")[1];
  removeNotActiveSelection();
  if (target.tagName === "TD" && e.ctrlKey) {
    e.preventDefault();

    if (selected.length <= 0) {
      activeSelection(getRow, getColumn, classNamePage[1]);
    }
    const selectedUpted = [
      {
        x: getRow,
        y: getColumn,
      },
      ...selected,
    ];
    const rowMax = parseInt(getRow);
    const rowLow = Math.min(...selectedUpted.map((d) => parseInt(d.x)));
    const colMax = parseInt(getColumn);
    const colLow = Math.min(...selectedUpted.map((d) => parseInt(d.y)));
    let columnString = "";
    for (let x = rowLow; x <= rowMax; x++) {
      for (let y = colLow; y <= colMax; y++) {
        const td = activeSelection(x, y, classNamePage[1]);
        if (td) {
          columnString += td.textContent;
        }
        columnString += y === colMax ? "" : ",";
      }
      columnString += "\n";
    }

    copySelected = columnString;
    selected.push({
      x: getRow,
      y: getColumn,
    });
  } else {
    selected = [];
    copySelected = "";
  }
}
function removeNotActiveSelection() {
  document
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));
}
function activeSelection(
  row: number | string,
  col: number | string,
  pageNumber: number
) {
  const td = document.querySelector(
    `.page-${pageNumber}.row-${row}_col-${col}`
  );
  if (td) {
    td.classList.add("selected");
    return td;
  }
  return null;
}
export function copiedByHeaderOnDoubleClick(
  e: any,
  datakey: string,
  rows: any
) {
  const newData = rows.flat();
  const copyText = newData.map((d: any) => d[datakey]).join("\n");
  navigator.clipboard.writeText(copyText);
  const elm = e.target.getBoundingClientRect();
  const span = document.createElement("span") as any;
  document.body.appendChild(span);
  span.textContent = "Copied";
  span.style = `position:absolute; top:${elm.top - 40}px;left:${
    elm.left + elm.width / 2 - 30
  }px;background:#0891b2;color:white;border-radius:20px;font-size:11px; padding:5px;`;

  span.classList.add("copied-message");
  const timeout = setTimeout(() => {
    clearTimeout(timeout);
    document.body.removeChild(span);
  }, 800);
}
