import { useRef, useState } from "react";
import {

  Button,
  IconButton,

} from "@mui/material";
import Swal from "sweetalert2";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { DataGridViewMultiSelectionReact, useUpwardTableModalSearch } from "../../../../components/DataGridViewReact";
import useExecuteQueryFromClient from "../../../../lib/executeQueryFromClient";
import { grey } from "@mui/material/colors";

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
  { key: "Check_No", label: "Check No", width: 120, },
  { key: "Check_Amnt", label: "Check Amount", width: 120 },
  { key: "Bank", label: "Bank", width: 300 },
  { key: "PDC_Status", label: "PDC Status", width: 120 },
]
export default function WarehouseChecks() {
  const table = useRef<any>(null)
  const refPDCStatus = useRef<HTMLSelectElement>(null)
  const refRemarks = useRef<HTMLSelectElement>(null)
  const refSearch = useRef<HTMLSelectElement>(null)
  const refIDS = useRef<HTMLInputElement>(null)
  const [monitoring, setMonitoring] = useState({
    check: "0",
    unCheck: "0",
    found: "0"
  })
  const [warehouseMode, setWarehouseMode] = useState('')
  const { executeQueryToClient } = useExecuteQueryFromClient()

  const {
    UpwardTableModalSearch: UpwardTableModalSearchPNNo,
    openModal: openPNNo,
    closeModal: closePNNo
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "751px" : "750px"
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
          DATE_FORMAT(Policy.DateIssued,'%M. %d, %Y') AS Date, 
          Policy.PolicyNo, 
          Policy.Account, 
          ID_Entry.Shortname AS Name
        FROM Policy  
        LEFT JOIN FPolicy  ON Policy.PolicyNo = FPolicy.PolicyNo 
        LEFT JOIN VPolicy  ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN MPolicy  ON Policy.PolicyNo = MPolicy.PolicyNo 
        LEFT JOIN BPolicy  ON Policy.PolicyNo = BPolicy.PolicyNo 
        LEFT JOIN MSPRPolicy  ON Policy.PolicyNo = MSPRPolicy.PolicyNo 
        LEFT JOIN PAPolicy  ON Policy.PolicyNo = PAPolicy.PolicyNo 
        LEFT JOIN CGLPolicy  ON Policy.PolicyNo = CGLPolicy.PolicyNo 
        LEFT JOIN (${ID_Entry}) as ID_Entry  ON Policy.IDNo = ID_Entry.IDNo 
        WHERE (
        (VPolicy.ChassisNo LIKE '%${search}%') 
        OR (VPolicy.MotorNo LIKE '%${search}%') 
        OR (VPolicy.PlateNo LIKE '%${search}%') 
        OR (ID_Entry.Shortname LIKE '%${search}%') 
        OR (Policy.PolicyNo LIKE '%${search}%') 
        OR (Policy.Account LIKE '%${search}%')
        )
        ORDER BY Policy.DateIssued desc
        LIMIT 500
        `
      return StrQry
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[1]
      }
      closePNNo()
    }
  })
  const {
    UpwardTableModalSearch: UpwardTableModalSearchData,
    openModal: openData,
    closeModal: closeData
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "601px" : "600px"
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
      SELECT  
        IDNo AS IDNo, 
        Shortname AS Name, 
        IDType 
      FROM (${ID_Entry}) as ID_Entry
      WHERE 
      (
      IDNo LIKE '%${search}%' OR  
      Shortname LIKE '%${search}%')
      ORDER BY Shortname
      limit 500`

      return StrQry
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[0]
      }
      closeData()
    }
  })
  const {
    UpwardTableModalSearch: UpwardTableModalSearchBank,
    openModal: openBank,
    closeModal: closeBank
  } = useUpwardTableModalSearch({
    customWidth: (blink: any) => {
      return blink ? "501px" : "500px"
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
       FROM Bank WHERE 
       Inactive = 0 AND 
       (
       Bank_Code LIKE '%${search}%' OR  
       Bank LIKE '%${search}%') 
       ORDER BY Bank
       limit 500 
       `
      return StrQry
    },
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (refIDS.current) {
        refIDS.current.value = rowItm[0]
      }
      closeBank()
    }
  })
  async function LoadPDC(fldSearch: string, valSearch: string, StrWhere: string) {
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
      FROM PDC 
      WHERE ${fldSearch} = '${valSearch}'  AND ${StrWhere} ORDER BY Check_Date`
    const dt = await executeQueryToClient(qry)
    if (dt.data) {
      if (dt.data.data.length > 0) {
        table.current.resetTable([])
        table.current.setDataFormated(dt.data.data)
        setMonitoring({
          check: "0",
          unCheck: `${dt.data.data.length}`,
          found: `${dt.data.data.length}`
        })
      }
    }
  }
  function tsbSearch_Click() {
    if (refIDS.current && refIDS.current.value === '') {
      alert('Type field you want to search!')
      refIDS.current?.focus();
      return
    }

    if ((refSearch.current && refSearch.current.selectedIndex === 2 || refSearch.current?.selectedIndex === 4) && !isValidDate(refIDS.current?.value as string)) {
      alert("Search is not a valid date");
      refIDS.current?.focus();
      return;
    }

    if (refPDCStatus.current && refIDS.current && refSearch.current) {

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
      const searchValue = refIDS.current.value.trim()
      LoadPDC(searchField, searchValue, strWhere);
    }

  }
  function tsbOpen_Click() {
    if (refSearch.current) {
      if (refSearch.current.selectedIndex === 1) {
        openPNNo()
      } else if (refSearch.current.selectedIndex === 2) {
        openData()
      } else if (refSearch.current.selectedIndex === 3) {
        openBank()
      }
      if (refIDS.current) {
        refIDS.current.value = ''
      }
    }


  }
  function hanldeOnSave() {
    if (refPDCStatus.current?.selectedIndex === 2 && refRemarks.current?.selectedIndex === 0) {
      refRemarks.current.focus()
      return alert("Please provide remarks!")
    } else if (monitoring.found === '0') {
      return alert("No current record!")
    } else if (monitoring.check === '0') {
      return alert("Please select from list!")
    } else {
      const texts = ["store in warehouse?", "endorse for deposit?", "pulled out?"]
      if (refPDCStatus.current) {
        Swal.fire({
          title: `Do you want the check(s) to be ${texts[refPDCStatus.current.selectedIndex]}`,
          text: "",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: `${capitalizeWords(texts[refPDCStatus.current.selectedIndex])}`
        }).then(async (result) => {
          if (result.isConfirmed) {
            const tableDataSelected = table.current.getSelectedRowsData()
            if (refPDCStatus.current) {
              if (refPDCStatus.current.selectedIndex === 2) {
                for (const itm of tableDataSelected) {
                  const qry = `selecT 
                  *
                  from Pullout_Request POR 
                  left join PullOut_Request_Details PORD on por.RCPNo = pord.RCPNo 
                  where PNNo ='${itm[0]}' and  checkNo ='${itm[5]}' and status ='APPROVED'`
                  const dt = await executeQueryToClient(qry)
                  if (dt.data?.data.length <= 0) {
                    alert(`PN No. : ${itm[0]} Check No.: ${itm[5]} don't have pullout approval!`)
                    return
                  }
                }
              }
            }


            const status1 = ["Stored", "Endorsed", "Pulled Out"]
            const status2 = ["Date_Stored", "Date_Endorsed", "Date_Pulled_Out"]

            for (const itm of tableDataSelected) {
              if (refPDCStatus.current && refRemarks.current) {

                const qry = `
                 UPDATE 
                PDC SET 
                  PDC_Status = '${status1[refPDCStatus.current.selectedIndex]}' ,
                  ${status2[refPDCStatus.current.selectedIndex]} = now() 
                  ${refPDCStatus.current.selectedIndex === 2 ? `, PDC_Remarks = '${refRemarks.current.value}'` : ""}
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
                `
                await executeQueryToClient(qry)
              }

            }
            if (refPDCStatus.current && refRemarks.current) {
              const dd = ["Stored In Warehouse!", "Endorsed for Deposit!", `Pulled Out As ${refRemarks.current.value}`]
              Swal.fire({
                text: `Successfully ${dd[refPDCStatus.current.selectedIndex]}`,
                icon: "success",
                timer: 1500
              }).then(async () => {
                tsbSearch_Click()
              })
            }
          }
        });
      }
    }
  }
  function updateMonitoring() {
    setTimeout(() => {
      const selectedRows = table.current.getSelectedRow()
      const getData = table.current.getData()
      setMonitoring({
        check: selectedRows.length.toString(),
        unCheck: (getData.length - selectedRows.length).toString(),
        found: getData.length.toString()
      })
    }, 100)
  }
  function onClickNew() {
    if (refPDCStatus.current) {
      refPDCStatus.current.disabled = false
      refPDCStatus.current.selectedIndex = 0
    }

    if (refSearch.current) {
      refSearch.current.disabled = false
      refSearch.current.selectedIndex = 0

    }
    if (refRemarks.current) {
      refRemarks.current.disabled = false
      refRemarks.current.selectedIndex = 0
    }

    if (refIDS.current) {
      refIDS.current.disabled = false
      refIDS.current.value = ''
    }

    table.current.resetTable()
    setWarehouseMode('add')
  }
  function onClickCancel() {
    Swal.fire({
      title: `Are you sure you want to cancel?`,
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes Cancel it!`
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (refPDCStatus.current) {
          refPDCStatus.current.disabled = true
          refPDCStatus.current.selectedIndex = 0
        }

        if (refSearch.current) {
          refSearch.current.disabled = true
          refSearch.current.selectedIndex = 0

        }
        if (refRemarks.current) {
          refRemarks.current.disabled = true
          refRemarks.current.selectedIndex = 0
        }

        if (refIDS.current) {
          refIDS.current.disabled = true
          refIDS.current.value = ''
        }

        table.current.resetTable()
        setWarehouseMode('')
      }
    })

  }

  return (
    <div style={{
      padding: "10px",
      flex: 1,
    }}>
      <UpwardTableModalSearchPNNo />
      <UpwardTableModalSearchData />
      <UpwardTableModalSearchBank />
      <div style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
        flex: 1,
        width: "100%",
        height: "100%"
      }}>
        <div style={{ display: "flex", columnGap: "10px", alignItems: "center" }}>
          <SelectInput
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
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  refRemarks.current?.focus()
                }
              },
              onChange: (e) => {
                if (e.target.selectedIndex !== 2) {
                  if (refRemarks.current) {
                    refRemarks.current.selectedIndex = 0
                  }
                } else {
                  if (refRemarks.current) {
                    refRemarks.current.selectedIndex = 1
                  }
                }
                if (refRemarks.current) {
                  refRemarks.current.disabled = e.target.selectedIndex !== 2
                }
              }
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
            label={{
              title: "Remarks: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "80px",
                marginLeft: "10px"
              },
            }}
            selectRef={refRemarks}
            select={{
              disabled: true,
              style: { width: "190px", height: "22px" },
              defaultValue: "",
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === 'Enter') {
                  e.preventDefault()
                  //  refInvoice.current?.focus()
                }
              }
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
          <Button
            disabled={warehouseMode === 'add'}
            sx={{
              height: "23px",
              fontSize: "11px",
              marginLeft: "10px"
            }}
            variant="contained"
            color="info"
            onClick={onClickNew}
          >New</Button>
          <Button
            disabled={warehouseMode !== 'add'}
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            variant="contained"
            color="error"
            onClick={onClickCancel}
          >Cancel</Button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", columnGap: "10px" }}>
            <div style={{
              display: "flex",
              columnGap: "3px",
              alignItems: "center"
            }}>
              <SelectInput
                label={{
                  title: "Search: ",
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
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      e.preventDefault()
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
              <IconButton size="small" onClick={tsbOpen_Click}>
                <ManageSearchIcon />
              </IconButton>
            </div>
            <div style={{ display: "flex", columnGap: "10px" }}>
              <TextInput
                label={{
                  title: "",
                  style: {
                    display: "none"
                  },
                }}
                input={{
                  disabled: true,
                  type: "text",
                  style: { width: "235px", height: "22px" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === 'Enter') {
                      tsbSearch_Click()
                    }
                  }
                }}
                inputRef={refIDS}
              />
              <IconButton size="small" onClick={tsbSearch_Click}>
                <ManageSearchIcon />
              </IconButton>
            </div>
            <div style={{ display: "flex", columnGap: "8px", borderLeft: "1px solid #64748b", paddingLeft: "10px" }}>
              <IconButton size="small" onClick={hanldeOnSave}>
                <SaveAsIcon color="success" />
              </IconButton>
              <IconButton size="small" color="primary">
                <AssessmentIcon />
              </IconButton>
            </div>
          </div>
          <div>
            <Button
              sx={{
                height: "23px",
                fontSize: "11px",
                marginLeft: "10px",
                bgcolor: grey[600],
                "&:hover": {
                  bgcolor: grey[700],
                }
              }}
              variant="contained"
            >Check for pull-out</Button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <DataGridViewMultiSelectionReact
            ref={table}
            columns={warehouseColumn}
            containerStyle={{
              flex: 1,
              height: "calc(100% - 30px)"
            }}
            getSelectedItem={(rowItm: any, rowIdx: any) => {
              updateMonitoring()
            }}
            onCheckAll={() => {
              updateMonitoring()
            }}
            onUnCheckAll={() => {
              updateMonitoring()
            }}
          />
          <div style={{
            height: "30px",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 50px",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", columnGap: "10px", fontSize: "13px", fontWeight: "bold" }}>
              <span>Check:</span>
              <span>{monitoring.check}</span>
            </div>
            <div style={{ display: "flex", columnGap: "10px", fontSize: "13px", fontWeight: "bold" }}>
              <span>Uncheck:</span>
              <span>{monitoring.unCheck}</span>
            </div>
            <div style={{ display: "flex", columnGap: "10px", fontSize: "13px", fontWeight: "bold" }}>
              <span>Record Found:</span>
              <span>{monitoring.found}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}
function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
function capitalizeWords(str: string) {
  return str
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}
const ID_Entry = `
SELECT 
       id_entry.IDNo,
       id_entry.ShortName as Shortname,
       IDType
   FROM
       (SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_client_id AS IDNo,
               aa.sub_account,
               'Client' as IDType
       FROM
           entry_client aa UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_agent_id AS IDNo,
               aa.sub_account,
               'Agent' as IDType
       FROM
           entry_agent aa UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_employee_id AS IDNo,
               aa.sub_account,
               'Employee' as IDType
       FROM
           entry_employee aa UNION ALL SELECT 
           aa.fullname AS ShortName,
               aa.entry_fixed_assets_id AS IDNo,
               sub_account,
                'Fixed Assets' as IDType
       FROM
           entry_fixed_assets aa UNION ALL SELECT 
           aa.description AS ShortName,
               aa.entry_others_id AS IDNo,
               aa.sub_account,
               'Others' as IDType
       FROM
           entry_others aa UNION ALL SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_supplier_id AS IDNo,
               aa.sub_account,
                'Supplier' as IDType
       FROM
           entry_supplier aa) id_entry
 `

