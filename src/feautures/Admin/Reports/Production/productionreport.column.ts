const summaryColumn = (props: {
  removeList: Array<string>;
  column: Array<any>;
  cb?: (column: Array<any>) => Array<any>;
}) => {
  let newColumn: Array<any> = [];
  newColumn = props.column.filter(
    (itms) => !props.removeList.includes(itms.datakey)
  );
  if (props?.cb) {
    return props.cb(newColumn);
  }

  return newColumn;
};
const reportBondsColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    type: "number",
    total: true,
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Misc",
    header: "Misc",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Notarial",
    header: "Notarial Fee",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryBondsColumn = summaryColumn({
  column: reportBondsColumn,
  removeList: [
    "InsuredValue",
    "TotalPremium",
    "Misc",
    "Notarial",
    "DocStamp",
    "Vat",
    "LGovTax",
  ],
});
const reportCGLColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    type: "number",
    total: true,
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    type: "number",
    total: true,
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryCGLColumn = summaryColumn({
  column: reportCGLColumn,
  removeList: ["InsuredValue", "TotalPremium", "DocStamp", "Vat", "LGovTax"],
});
const reportCOMColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Sum Insured",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PLimit",
    header: "LD Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Sec4A",
    header: "ETPL BI Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Sec4B",
    header: "PD Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Sec4C",
    header: "PAR Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Sub Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "Evat",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryCOMColumn = summaryColumn({
  column: reportCOMColumn,
  removeList: [
    "PLimit",
    "Sec4A",
    "Sec4B",
    "Sec4C",
    "TotalPremium",
    "DocStamp",
    "Vat",
    "LGovTax",
  ],
  cb: (column) => {
    const addColum = [
      {
        datakey: "BodyType",
        header: "Body Type",
        width: "150px",
      },
      {
        datakey: "PlateNo",
        header: "Plate No",
        width: "150px",
      },
      {
        datakey: "ChassisNo",
        header: "Chassis No",
        width: "180px",
      },
      {
        datakey: "MotorNo",
        header: "Engine No",
        width: "150px",
      },
    ];
    column.splice(5, 0, ...addColum);
    column.push({
      datakey: "Mortgagee",
      header: "Mortgagee",
      width: "340px",
      excelColumnWidth: 50,
    });
    return column;
  },
});
const reportFIREColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "FireTax",
    header: "F.S. TAX",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVAT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryFIREColumn = summaryColumn({
  column: reportFIREColumn,
  removeList: [
    "InsuredValue",
    "TotalPremium",
    "DocStamp",
    "FireTax",
    "Vat",
    "LGovTax",
  ],
});
const reportMARColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryMARColumn = summaryColumn({
  column: reportMARColumn,
  removeList: ["InsuredValue", "TotalPremium", "DocStamp", "Vat", "LGovTax"],
});
const reportMSPRColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryMSPRColumn = summaryColumn({
  column: reportMSPRColumn,
  removeList: ["InsuredValue", "TotalPremium", "DocStamp", "Vat", "LGovTax"],
});
const reportPAColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Insured Value",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryPAColumn = summaryColumn({
  column: reportPAColumn,
  removeList: ["InsuredValue", "TotalPremium", "DocStamp", "Vat", "LGovTax"],
});
const reportTPLColumn = [
  {
    datakey: "DateIssued",
    header: "Date Issued",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "PolicyNo",
    header: "Policy No",
    width: "250px",
    excelColumnWidth: 30,
  },
  {
    datakey: "AssuredName",
    header: "Assured Name",
    width: "350px",
    excelColumnWidth: 50,
  },
  {
    datakey: "EffictiveDate",
    header: "Effictive Date",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "InsuredValue",
    header: "Tpl Coverage",
    total: true,
    type: "number",
    width: "90px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalPremium",
    header: "Premium",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "DocStamp",
    header: "Doc Stamp",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Vat",
    header: "EVat",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "LGovTax",
    header: "LGT",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "Misc",
    header: "Strad Com",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
  {
    datakey: "TotalDue",
    header: "Total",
    total: true,
    type: "number",
    width: "80px",
    excelColumnWidth: 20,
  },
];
const summaryTPLColumn = summaryColumn({
  column: reportTPLColumn,
  removeList: [
    "InsuredValue",
    "TotalPremium",
    "DocStamp",
    "Vat",
    "LGovTax",
    "Misc",
  ],
  cb(column) {
    const addColum = [
      {
        datakey: "BodyType",
        header: "Body Type",
        width: "140px",

        excelColumnWidth: 30,
      },
      {
        datakey: "PlateNo",
        header: "Plate No",
        width: "140px",
        excelColumnWidth: 20,
      },
      {
        datakey: "ChassisNo",
        header: "Chassis No",
        width: "140px",
        excelColumnWidth: 30,
      },
    ];
    column.splice(5, 0, ...addColum);
    column.push({
      datakey: "MotorNo",
      header: "Engine No",
      width: "140px",
      excelColumnWidth: 50,
    });
    return column;
  },
});
const columnRender = (policy: string, format: string) => {
  let selectedColumn: Array<any> = [];
  let columnFormat: any = {};
  switch (policy) {
    case "Bonds":
      columnFormat = {
        Full: reportBondsColumn,
        Summary: summaryBondsColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "COM":
      columnFormat = {
        Full: reportCOMColumn,
        Summary: summaryCOMColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "TPL":
      columnFormat = {
        Full: reportTPLColumn,
        Summary: summaryTPLColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "FIRE":
      columnFormat = {
        Full: reportFIREColumn,
        Summary: summaryFIREColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "CGL":
      columnFormat = {
        Full: reportCGLColumn,
        Summary: summaryCGLColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "PA":
      columnFormat = {
        Full: reportPAColumn,
        Summary: summaryPAColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "MAR":
      columnFormat = {
        Full: reportMARColumn,
        Summary: summaryMARColumn,
      };
      selectedColumn = columnFormat[format];
      break;
    case "MSPR":
      columnFormat = {
        Full: reportMSPRColumn,
        Summary: summaryMSPRColumn,
      };
      selectedColumn = columnFormat[format];
      break;
  }

  return selectedColumn;
};
export {
  reportBondsColumn,
  summaryBondsColumn,
  reportCGLColumn,
  summaryCGLColumn,
  reportCOMColumn,
  summaryCOMColumn,
  reportFIREColumn,
  summaryFIREColumn,
  reportMARColumn,
  summaryMARColumn,
  reportMSPRColumn,
  summaryMSPRColumn,
  reportPAColumn,
  summaryPAColumn,
  reportTPLColumn,
  summaryTPLColumn,
  columnRender,
};
