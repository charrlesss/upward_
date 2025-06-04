import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button, IconButton } from "@mui/material";
import Swal from "sweetalert2";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  DataGridViewMultiSelectionReact,
  useUpwardTableModalSearch,
  useUpwardTableModalSearchSafeMode,
} from "../../../../components/DataGridViewReact";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { grey } from "@mui/material/colors";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation } from "react-query";
import { AuthContext } from "../../../../components/AuthContext";
import { Loading } from "../../../../components/Loading";
import { wait } from "@testing-library/user-event/dist/utils";
import PageHelmet from "../../../../components/Helmet";
import "../../../../style/monbileview/accounting/warehouse.css";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

const warehouseColumn = [
  { key: "PNo", label: "PN No.", width: 150 },
  { key: "IDNo", label: "I.D. No.", width: 300 },
  {
    key: "Date",
    label: "Date Received",
    width: 170,
  },
  { key: "Name", label: "Name", width: 300 },
  { key: "CheckDate", label: "Check Date", width: 120 },
  { key: "Check_No", label: "Check No", width: 120 },
  { key: "Check_Amnt", label: "Check Amount", width: 120 },
  { key: "Bank", label: "Bank", width: 300 },
  { key: "PDC_Status", label: "PDC Status", width: 120 },
];

export default function WarehouseChecks() {
  const table = useRef<any>(null);
  const modalCheckRef = useRef<any>(null);
  const refPDCStatus = useRef<HTMLSelectElement>(null);
  const refRemarks = useRef<HTMLSelectElement>(null);
  const refSearch = useRef<HTMLSelectElement>(null);
  const refIDS = useRef<HTMLInputElement>(null);
  const [monitoring, setMonitoring] = useState({
    check: "0",
    unCheck: "0",
    found: "0",
  });
  const [warehouseMode, setWarehouseMode] = useState("");
  const { executeQueryToClient } = useExecuteQueryFromClient();

  const {
    UpwardTableModalSearch: UpwardTableModalSearchPNNo,
    openModal: openPNNo,
    closeModal: closePNNo,
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "751px" : "750px";
    },
    column: [
      { key: "Date", label: "Date", width: 115 },
      { key: "PolicyNo", label: "Policy No.", width: 160 },
      {
        key: "Account",
        label: "Account",
        width: 120,
      },
      {
        key: "Name",
        label: "Name",
        width: 300,
      },
    ],
    query: (search: string) => {
      const StrQry = `
     SELECT 
          DATE_FORMAT(policy.DateIssued, '%M. %d, %Y') AS Date,
          policy.PolicyNo,
          policy.Account,
          ID_Entry.Shortname AS Name
      FROM
          policy
              LEFT JOIN
          fpolicy ON policy.PolicyNo = fpolicy.PolicyNo
              LEFT JOIN
          vpolicy ON policy.PolicyNo = vpolicy.PolicyNo
              LEFT JOIN
          mpolicy ON policy.PolicyNo = mpolicy.PolicyNo
              LEFT JOIN
          bpolicy ON policy.PolicyNo = bpolicy.PolicyNo
              LEFT JOIN
          msprpolicy ON policy.PolicyNo = msprpolicy.PolicyNo
              LEFT JOIN
          papolicy ON policy.PolicyNo = papolicy.PolicyNo
              LEFT JOIN
          cglpolicy ON policy.PolicyNo = cglpolicy.PolicyNo
              LEFT JOIN
          (SELECT 
              id_entry.IDNo, id_entry.ShortName AS Shortname, IDType
          FROM
              (SELECT 
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname, ' ', aa.suffix, '.'), aa.company) AS ShortName,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  'Client' AS IDType
          FROM
              entry_client aa UNION ALL SELECT 
              CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  'Agent' AS IDType
          FROM
              entry_agent aa UNION ALL SELECT 
              CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  'Employee' AS IDType
          FROM
              entry_employee aa UNION ALL SELECT 
              aa.fullname AS ShortName,
                  aa.entry_fixed_assets_id AS IDNo,
                  sub_account,
                  'Fixed Assets' AS IDType
          FROM
              entry_fixed_assets aa UNION ALL SELECT 
              aa.description AS ShortName,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  'Others' AS IDType
          FROM
              entry_others aa UNION ALL SELECT 
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  'Supplier' AS IDType
          FROM
              entry_supplier aa) id_entry)  AS ID_Entry ON policy.IDNo = ID_Entry.IDNo
      WHERE
          policy.PolicyNo IN (SELECT 
                  PNo
              FROM
                  pdc)
              AND ((vpolicy.ChassisNo LIKE '%${search}%')
              OR (vpolicy.MotorNo LIKE '%${search}%')
              OR (vpolicy.PlateNo LIKE '%${search}%')
              OR (ID_Entry.Shortname LIKE '%${search}%')
              OR (vpolicy.PolicyNo LIKE '%${search}%')
              OR (vpolicy.Account LIKE '%${search}%'))
      ORDER BY policy.DateIssued DESC
      LIMIT 500
        `;
      return StrQry;
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[1];
      }
      tsbSearch_Click(rowItm[1]);

      closePNNo();
    },
  });
  const {
    UpwardTableModalSearch: UpwardTableModalSearchData,
    openModal: openData,
    closeModal: closeData,
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "601px" : "600px";
    },
    column: [
      { key: "IDNo", label: "I.D. No.", width: 115 },
      {
        key: "Name",
        label: "Name",
        width: 300,
      },
      {
        key: "IDType",
        label: "Type",
        width: 120,
      },
    ],
    query: (search: string) => {
      const StrQry = `
      select * from (  SELECT  
        IDNo AS IDNo, 
        Shortname AS Name, 
        IDType 
      FROM (SELECT 
       id_entry.IDNo,
       id_entry.ShortName as Shortname,
       IDType
   FROM
       (SELECT 
           IF(aa.option = 'individual', 
           CONCAT(IF(aa.lastname IS NOT NULL AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname ,' ',aa.suffix,'.'), aa.company) AS ShortName,
               aa.entry_client_id AS IDNo,
               aa.sub_account,
               'Client' as IDType
       FROM
           entry_client aa 
           UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_agent_id AS IDNo,
               aa.sub_account,
               'Agent' as IDType
       FROM
           entry_agent aa 
           UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_employee_id AS IDNo,
               aa.sub_account,
               'Employee' as IDType
       FROM
           entry_employee aa 
           UNION ALL SELECT 
           aa.fullname AS ShortName,
               aa.entry_fixed_assets_id AS IDNo,
               sub_account,
                'Fixed Assets' as IDType
       FROM
           entry_fixed_assets aa 
           UNION ALL SELECT 
           aa.description AS ShortName,
               aa.entry_others_id AS IDNo,
               aa.sub_account,
               'Others' as IDType
       FROM
           entry_others aa 
           UNION ALL SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_supplier_id AS IDNo,
               aa.sub_account,
                'Supplier' as IDType
       FROM
           entry_supplier aa) id_entry) as ID_Entry
      WHERE 
      ID_Entry.IDNo in (select PNo from pdc)) IDs
      where 
      IDs.IDNo LIKE '%${search}%' OR  
      IDs.Name LIKE '%${search}%'
      ORDER BY IDs.Name
      limit 500;`;

      return StrQry;
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[0];
      }
      tsbSearch_Click(rowItm[0]);

      closeData();
    },
  });
  const {
    UpwardTableModalSearch: UpwardTableModalSearchBank,
    openModal: openBank,
    closeModal: closeBank,
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "501px" : "500px";
    },
    column: [
      { key: "Code", label: "Code", width: 115 },
      {
        key: "Bank_Name",
        label: "Bank Name",
        width: 322,
      },
    ],
    query: (search: string) => {
      const StrQry = `
      SELECT 
        Bank_Code AS Code,
        Bank AS Bank_Name
       FROM Bank 
       WHERE 
       Inactive = 0 AND 
       Bank_Code in (SELECT Bank FROM pdc group by Bank) and
       (
       Bank_Code LIKE '%${search}%' OR  
       Bank LIKE '%${search}%') 
       ORDER BY Bank
       limit 500 
       `;
      return StrQry;
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[0];
      }
      tsbSearch_Click(rowItm[0]);

      closeBank();
    },
  });
  async function LoadPDC(
    fldSearch: string,
    valSearch: string,
    StrWhere: string
  ) {
    const qry = `
      SELECT 
        PNo, 
        IDNo, 
        DATE_FORMAT(Date,'%m/%d/%Y') AS Date, 
        Name, 
        date_format(Check_Date,'%m/%d/%Y') AS CheckDate, 
        Check_No, 
        Check_Amnt, 
        Bank, 
        PDC_Status
      FROM pdc  
      WHERE ${fldSearch} = '${valSearch}'  AND ${StrWhere} ORDER BY Check_Date`;
    const dt = await executeQueryToClient(qry);
    table.current.resetTable([]);

    if (dt.data) {
      if (dt.data.data.length > 0) {
        table.current.setDataFormated(dt.data.data);
        table.current.setIsTableSelectable(true);
        setMonitoring({
          check: "0",
          unCheck: `${dt.data.data.length}`,
          found: `${dt.data.data.length}`,
        });
      }
    }
  }
  function tsbSearch_Click(refIDS: string) {
    // if (refIDS.current && refIDS.current.value === "") {
    //   alert("Type field you want to search!");
    //   refIDS.current?.focus();
    //   return;
    // }

    // if ((refSearch.current && refSearch.current.selectedIndex === 2 || refSearch.current?.selectedIndex === 4) && !isValidDate(refIDS.current?.value as string)) {
    //   alert("Search is not a valid date");
    //   refIDS.current?.focus();
    //   return;
    // }
    if (refPDCStatus.current && refSearch.current) {
      let strWhere = "";
      const statusOptions = ["Received", "Stored", "Stored"];
      const selectedIndex = refPDCStatus.current.selectedIndex;

      if (selectedIndex >= 0) {
        const status = statusOptions[selectedIndex];
        if (selectedIndex !== 2) {
          strWhere = `(PDC_Status = '${status}')`;
        } else {
          strWhere = `(PDC_Status = '${status}' OR (PDC_Status = 'Pulled Out' AND (PDC_Remarks = 'Fully Paid' OR PDC_Remarks = 'Replaced')))`;
        }
      }

      const searchField = refSearch.current.value;
      const searchValue = refIDS.trim();
      LoadPDC(searchField, searchValue, strWhere);
    }
  }
  function tsbOpen_Click(search: string) {
    if (refSearch.current) {
      if (refSearch.current.selectedIndex === 1) {
        openPNNo(search);
      } else if (refSearch.current.selectedIndex === 2) {
        openData(search);
      } else if (refSearch.current.selectedIndex === 3) {
        openBank(search);
      }
      if (refIDS.current) {
        refIDS.current.value = "";
      }
    }
  }
  function hanldeOnSave() {
    if (
      refPDCStatus.current?.selectedIndex === 2 &&
      refRemarks.current?.selectedIndex === 0
    ) {
      refRemarks.current.focus();
      return alert("Please provide remarks!");
    } else if (monitoring.found === "0") {
      return alert("No current record!");
    } else if (monitoring.check === "0") {
      return alert("Please select from list!");
    } else {
      const texts = [
        "store in warehouse?",
        "endorse for deposit?",
        "pulled out?",
      ];
      if (refPDCStatus.current) {
        Swal.fire({
          title: `Do you want the check(s) to be ${
            texts[refPDCStatus.current.selectedIndex]
          }`,
          text: "",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: `${capitalizeWords(
            texts[refPDCStatus.current.selectedIndex]
          )}`,
        }).then(async (result) => {
          if (result.isConfirmed) {
            const tableDataSelected = table.current.getSelectedRowsData();
            if (refPDCStatus.current) {
              if (refPDCStatus.current.selectedIndex === 2) {
                for (const itm of tableDataSelected) {
                  const qry = `selecT 
                  *
                  from pullout_request as POR 
                  left join pullout_request_details as PORD on POR.RCPNo = PORD.RCPNo 
                  where PNNo ='${itm[0]}' and  checkNo ='${itm[5]}' and status ='APPROVED'`;
                  const dt = await executeQueryToClient(qry);
                  if (dt.data?.data.length <= 0) {
                    alert(
                      `PN No. : ${itm[0]} Check No.: ${itm[5]} don't have pullout approval!`
                    );
                    return;
                  }
                }
              }
            }

            const status1 = ["Stored", "Endorsed", "Pulled Out"];
            const status2 = ["Date_Stored", "Date_Endorsed", "Date_Pulled_Out"];

            for (const itm of tableDataSelected) {
              if (refPDCStatus.current && refRemarks.current) {
                const qry = `
                 UPDATE 
                pdc  SET 
                  PDC_Status = '${
                    status1[refPDCStatus.current.selectedIndex]
                  }' ,
                  ${status2[refPDCStatus.current.selectedIndex]} = now() 
                  ${
                    refPDCStatus.current.selectedIndex === 2
                      ? `, PDC_Remarks = '${refRemarks.current.value}'`
                      : ""
                  }
                WHERE 
                  PNo = '${itm[0]}' AND 
                  IDNo = '${itm[1]}' AND 
                  DATE_FORMAT(Date,'%m/%d/%Y') = '${itm[2]}' AND
                  Name = '${itm[3]}' AND 
                  DATE_FORMAT(Check_Date,'%m/%d/%Y') = '${itm[4]}' AND 
                  Check_No = '${itm[5]}' AND 
                  Check_Amnt = '${itm[6]}' AND 
                  Bank = '${itm[7]}' AND 
                  PDC_Status = '${itm[8]}'
                `;
                await executeQueryToClient(qry);
              }
            }
            if (refPDCStatus.current && refRemarks.current) {
              const dd = [
                "Stored In Warehouse!",
                "Endorsed for Deposit!",
                `Pulled Out As ${refRemarks.current.value}`,
              ];
              Swal.fire({
                text: `Successfully ${dd[refPDCStatus.current.selectedIndex]}`,
                icon: "success",
                timer: 1500,
              }).then(async () => {
                if (!table.current.isTableSelectable) {
                  onClickNew();
                  return;
                }
                if (refIDS.current) tsbSearch_Click(refIDS.current.value);
              });
            }
          }
        });
      }
    }
  }
  function updateMonitoring() {
    setTimeout(() => {
      const selectedRows = table.current.getSelectedRow();
      const getData = table.current.getData();
      setMonitoring({
        check: selectedRows.length.toString(),
        unCheck: (getData.length - selectedRows.length).toString(),
        found: getData.length.toString(),
      });
    }, 100);
  }
  function onClickNew() {
    if (refPDCStatus.current) {
      refPDCStatus.current.disabled = false;
      refPDCStatus.current.selectedIndex = 0;
    }

    if (refSearch.current) {
      refSearch.current.disabled = false;
      refSearch.current.selectedIndex = 0;
    }
    if (refRemarks.current) {
      refRemarks.current.disabled = true;
      refRemarks.current.selectedIndex = 0;
    }

    if (refIDS.current) {
      refIDS.current.disabled = false;
      refIDS.current.value = "";
    }

    table.current.resetTable();
    setWarehouseMode("add");
  }
  function onClickCancel() {
    Swal.fire({
      title: `Are you sure you want to cancel?`,
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes Cancel it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (refPDCStatus.current) {
          refPDCStatus.current.disabled = true;
          refPDCStatus.current.selectedIndex = 0;
        }

        if (refSearch.current) {
          refSearch.current.disabled = true;
          refSearch.current.selectedIndex = 0;
        }
        if (refRemarks.current) {
          refRemarks.current.disabled = true;
          refRemarks.current.selectedIndex = 0;
        }

        if (refIDS.current) {
          refIDS.current.disabled = true;
          refIDS.current.value = "";
        }

        table.current.resetTable();
        setWarehouseMode("");
      }
    });
  }

  return (
    <div
      className="main"
      style={{
        padding: "10px",
        flex: 1,
        position: "relative",
      }}
    >
      <PageHelmet title="Treasury" />
      <UpwardTableModalSearchPNNo />
      <UpwardTableModalSearchData />
      <UpwardTableModalSearchBank />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "10px",
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          className="first-layer"
          style={{
            display: "flex",
            columnGap: "10px",
            alignItems: "center",
          }}
        >
          <SelectInput
            containerClassName="custom-input"
            label={{
              title: "PDC Status: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "80px",
              },
            }}
            selectRef={refPDCStatus}
            select={{
              disabled: true,
              style: { width: "220px", height: "22px" },
              defaultValue: "Store in Warehouse",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  refRemarks.current?.focus();
                }
              },
              onChange: (e) => {
                if (e.target.selectedIndex !== 2) {
                  if (refRemarks.current) {
                    refRemarks.current.selectedIndex = 0;
                  }
                } else {
                  if (refRemarks.current) {
                    refRemarks.current.selectedIndex = 1;
                  }
                }
                if (refRemarks.current) {
                  refRemarks.current.disabled = e.target.selectedIndex !== 2;
                }
                if (refIDS.current) {
                  tsbSearch_Click(refIDS.current.value);
                }
              },
            }}
            datasource={[
              { key: "Store in Warehouse" },
              { key: "Endorse for Deposit" },
              { key: "Pull Out" },
            ]}
            values={"key"}
            display={"key"}
          />
          <SelectInput
            containerClassName="custom-input"
            label={{
              title: "Remarks: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "80px",
                marginLeft: "10px",
              },
            }}
            selectRef={refRemarks}
            select={{
              disabled: true,
              style: { width: "190px", height: "22px" },
              defaultValue: "",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  e.preventDefault();
                  //  refInvoice.current?.focus()
                }
              },
            }}
            datasource={[
              { key: "" },
              { key: "Fully Paid" },
              { key: "Cash Replacement" },
              { key: "Check Replacement" },
              { key: "Account Closed" },
              { key: "Hold" },
              { key: "Not Renewed by Camfin" },
            ]}
            values={"key"}
            display={"key"}
          />
          <div
            className="desktop-ctions-buttons"
            style={{
              display: "flex",
              columnGap: "5px",
            }}
          >
            <Button
              disabled={warehouseMode === "add"}
              sx={{
                height: "23px",
                fontSize: "11px",
                marginLeft: "10px",
              }}
              variant="contained"
              color="info"
              onClick={onClickNew}
            >
              New
            </Button>
            <Button
              disabled={warehouseMode !== "add"}
              sx={{
                height: "23px",
                fontSize: "11px",
              }}
              variant="contained"
              color="error"
              onClick={onClickCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div
          className="second-layer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div
            className="first-content"
            style={{ display: "flex", columnGap: "10px" }}
          >
            <div
              className="search-client-checks"
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: "5px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  columnGap: "3px",
                  alignItems: "center",
                }}
              >
                <SelectInput
                  containerClassName="custom-input"
                  label={{
                    title: "Category : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "80px",
                    },
                  }}
                  selectRef={refSearch}
                  select={{
                    disabled: true,
                    style: { width: "190px", height: "22px" },
                    defaultValue: "",
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        e.preventDefault();
                      }
                    },
                    onChange: () => {
                      if (refIDS.current) {
                        tsbSearch_Click(refIDS.current.value);
                      }
                    },
                  }}
                  datasource={[
                    { key: "", value: "" },
                    { key: "Policy", value: "PNo" },
                    { key: "ID No.", value: "IDNo" },
                    { key: "Bank", value: "Bank" },
                  ]}
                  values={"value"}
                  display={"key"}
                />
              </div>
              <div style={{ display: "flex", columnGap: "10px" }}>
                <TextInput
                  containerStyle={{ width: "400px", marginLeft: "20px" }}
                  containerClassName="custom-input search-special"
                  label={{
                    title: "Search : ",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "70px",
                    },
                  }}
                  input={{
                    disabled: true,
                    type: "text",
                    style: { width: "calc(100% - 70px)", height: "22px" },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        tsbOpen_Click(e.currentTarget.value);
                      }
                    },
                  }}
                  icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                  onIconClick={(e) => {
                    e.preventDefault();
                    if (refIDS.current) {
                      tsbOpen_Click(refIDS.current.value);
                    }
                  }}
                  inputRef={refIDS}
                />
              </div>
            </div>
            <div
              className="buttons-search-client-container"
              style={{
                display: "flex",
                columnGap: "8px",
                alignItems: "center",
              }}
            >
              <IconButton size="small" onClick={hanldeOnSave}>
                <SaveAsIcon color="success" />
              </IconButton>
              <IconButton size="small" color="primary">
                <AssessmentIcon />
              </IconButton>
              <Button
                className="check-for-pull-out-mobile"
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  marginLeft: "10px",
                  bgcolor: grey[600],
                  "&:hover": {
                    bgcolor: grey[700],
                  },
                }}
                variant="contained"
                onClick={() => {
                  modalCheckRef.current?.showModal();
                  wait(100).then(() => {
                    modalCheckRef.current?.mutate();
                  });
                }}
              >
                Check for pull-out
              </Button>
            </div>
          </div>
          <div className="second-content">
            <Button
              className="check-for-pull-out-desktop"
              sx={{
                height: "23px",
                fontSize: "11px",
                marginLeft: "10px",
                bgcolor: grey[600],
                "&:hover": {
                  bgcolor: grey[700],
                },
              }}
              variant="contained"
              onClick={() => {
                modalCheckRef.current?.showModal();
                wait(100).then(() => {
                  modalCheckRef.current?.mutate();
                });
              }}
            >
              Check for pull-out
            </Button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <DataGridViewMultiSelectionReact
            ref={table}
            columns={warehouseColumn}
            containerStyle={{
              flex: 1,
              height: "calc(100% - 30px)",
            }}
            getSelectedItem={(rowItm: any, rowIdx: any) => {
              updateMonitoring();
            }}
            onCheckAll={() => {
              const getData = table.current.getData();
              table.current.setSelectedRow(
                getData.map((itm: any, idx: any) => idx)
              );
              updateMonitoring();
            }}
            onUnCheckAll={() => {
              updateMonitoring();
              table.current.setSelectedRow([]);
            }}
          />
          <div
            style={{
              height: "30px",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 50px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                columnGap: "10px",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              <span>Check:</span>
              <span>{monitoring.check}</span>
            </div>
            <div
              style={{
                display: "flex",
                columnGap: "10px",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              <span>Uncheck:</span>
              <span>{monitoring.unCheck}</span>
            </div>
            <div
              style={{
                display: "flex",
                columnGap: "10px",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              <span>Record Found:</span>
              <span>{monitoring.found}</span>
            </div>
          </div>
        </div>
      </div>
      <ModalCheck
        ref={modalCheckRef}
        handleOnSave={() => {
          const refs = modalCheckRef.current.getRefs();
        }}
        handleOnClose={() => {}}
        getSelectedItem={async (rowItm: any) => {
          if (rowItm) {
            if (
              refPDCStatus.current &&
              refPDCStatus.current.value !== "Pull Out"
            ) {
              return alert("Status should be for pull-out!");
            }
            if (
              refRemarks.current &&
              (refRemarks.current.value === null ||
                refRemarks.current.value === "")
            ) {
              return alert("No remarks selected!");
            }
            // if (
            //   refSearch.current &&
            //   (refSearch.current.value === null ||
            //     refSearch.current.value === "")
            // ) {
            //   return alert("Please enter ID!");
            // }
            const { data: response } = await executeQueryToClient(`
              Select 
                CheckNo 
              From pullout_request a 
              Inner join pullout_request_details b  on a.RCPNo = b.RCPNo 
              Where a.Status = 'APPROVED' 
              And a.RCPNo = '${rowItm[1]}'`);

            const dr = response.data.map((itm: any) => itm.CheckNo);
            if (dr.length > 0) {
              if (refPDCStatus.current) {
                refPDCStatus.current.value = "Pull Out";
              }
              if (refSearch.current) {
                refSearch.current.value = "PNo";
              }
              if (refRemarks.current) {
                refRemarks.current.value = rowItm[5];
              }
              if (refIDS.current) {
                refIDS.current.value = rowItm[2];
              }

              if (refIDS.current) {
                tsbSearch_Click(refIDS.current.value);
              }

              wait(100).then(() => {
                const getData = table.current.getData();
                const selected = getData.map((itm: any, idx: number) => {
                  if (dr.includes(itm[5])) {
                    return idx;
                  }
                  return null;
                });

                table.current.setSelectedRow(selected);
                table.current.setIsTableSelectable(false);
                table.current.setSelectedRow(
                  getData.map((itm: any, idx: any) => idx)
                );
                setMonitoring({
                  check: dr.length,
                  unCheck: `${getData.length - dr.length}`,
                  found: getData.length,
                });
              });
            } else {
              return alert("No request for pull-out!");
            }
          } else {
          }

          modalCheckRef.current.closeDelay();
        }}
      />
      <div className="mobile-ctions-buttons">
        <Button
          disabled={warehouseMode === "add"}
          sx={{
            height: "23px",
            fontSize: "11px",
            marginLeft: "10px",
          }}
          variant="contained"
          color="info"
          onClick={onClickNew}
        >
          New
        </Button>
        <Button
          disabled={warehouseMode !== "add"}
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          variant="contained"
          color="error"
          onClick={onClickCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

const ModalCheck = forwardRef(
  ({ handleOnSave, handleOnClose, getSelectedItem }: any, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const { user, myAxios } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const table = useRef<any>(null);
    const rcpnRef = useRef<HTMLInputElement>(null);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        const refs = {
          rcpnRef,
        };
        return refs;
      },
      mutate: () => {
        mutate({ RCPNo: rcpnRef.current?.value });
      },
      closeDelay,
    }));

    const { isLoading: isLoading, mutate: mutate } = useMutation({
      mutationKey: "load-list",
      mutationFn: async (variable: any) =>
        await myAxios.post(`/task/accounting/warehouse/load-list`, variable, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }),
      onSuccess(res) {
        table.current.setDataFormated(
          res.data.list.map((itm: any, idx: number) => {
            return {
              row_count: idx + 1,
              ...itm,
            };
          })
        );
      },
    });

    const {
      UpwardTableModalSearch: SearchCollectionUpwardTableModalSearch,
      openModal: searchCollectionCreditOpenModal,
      closeModal: searchCollectionCreditCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/accounting/warehouse/get-pullout-rcpno",
      column: [{ key: "RCPNo", headerName: "RCPNo", width: 200 }],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          if (rcpnRef.current) {
            rcpnRef.current.value = rowItm[0];
          }
          mutate({ RCPNo: rowItm[0] });
          searchCollectionCreditCloseModal();
        }
      },
    });
    const handleMouseDown = (e: any) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e: any) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    return showModal ? (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        {isLoading && <Loading />}
        <div
          className="modal-pullout"
          ref={modalRef}
          style={{
            height: blick ? "402px" : "400px",
            width: blick ? "60.3%" : "60%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Pull Out Viewer
            </span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                padding: "10px",
              }}
            >
              <TextInput
                containerStyle={{ width: "400px", marginLeft: "20px" }}
                containerClassName="custom-input search-special"
                label={{
                  title: "Search : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "calc(100% - 70px)", height: "22px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      searchCollectionCreditOpenModal(e.currentTarget.value);
                    }
                  },
                }}
                icon={<AccountBoxIcon sx={{ fontSize: "18px" }} />}
                onIconClick={(e) => {
                  e.preventDefault();
                  if (rcpnRef.current) {
                    searchCollectionCreditOpenModal(rcpnRef.current.value);
                  }
                }}
                inputRef={rcpnRef}
              />

              <DataGridViewMultiSelectionReact
                ref={table}
                columns={[
                  { key: "row_count", label: "#", width: 35 },
                  { key: "RCPNo", label: "RCP No.", width: 100 },
                  { key: "PNNo", label: "PN No.", width: 150 },
                  { key: "Name", label: "Name", width: 250 },
                  { key: "NoOfChecks", label: "# of Checks", width: 70 },
                  { key: "Reason", label: "Reason", width: 150 },
                ]}
                rows={[]}
                containerStyle={{
                  flex: 1,
                }}
                getSelectedItem={(rowItm: any) => {
                  getSelectedItem(rowItm);
                }}
                onCheckAll={() => {
                  const getData = table.current.getData();
                  const filteredData = getData.map((itm: any, idx: number) => {
                    if (
                      itm.RCPNO !== "--" &&
                      itm.RCPNO !== "" &&
                      itm.Status !== "APPROVED"
                    ) {
                      return idx;
                    }
                    return null;
                  });
                  const selectedRows = filteredData.filter(
                    (itm: any) => itm !== null
                  );
                  table.current.setSelectedRow(selectedRows);
                }}
                onUnCheckAll={() => {
                  table.current.setSelectedRow([]);
                }}
              />
            </div>
          </div>
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
        <SearchCollectionUpwardTableModalSearch />
      </>
    ) : null;
  }
);
function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
function capitalizeWords(str: string) {
  return str
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
}
