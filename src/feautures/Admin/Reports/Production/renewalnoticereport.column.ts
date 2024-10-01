const COM = [
  { datakey: "AssuredName", header: "ASSURED NAME", width: "350px" },
  { datakey: "PolicyNo", header: "POLICY NO", width: "300px" },
  { datakey: "Expiration", header: "EXPIRATION", width: "150px" },
  {
    datakey: "InsuredValue",
    header: "AMOUNT INSURED",
    width: "150px",
    type: "number",
  },
  { datakey: "Make", header: "MAKE", width: "250px" },
  { datakey: "BodyType", header: "BODY TYPE", width: "250px" },
  { datakey: "PlateNo", header: "PLATE NO", width: "250px" },
  { datakey: "ChassisNo", header: "CHASSIS NO", width: "250px" },
  { datakey: "MotorNo", header: "ENGINE NO", width: "250px" },
  {
    datakey: "TotalPremium",
    header: "TOTAL PREMIUM",
    width: "150px",
    type: "number",
  },
  { datakey: "Mortgagee", header: "MORTGAGEE", width: "350px" },
];
const FIRE = [
  { datakey: "AssuredName", header: "ASSURED NAME", width: "350px" },
  { datakey: "PolicyNo", header: "POLICY NO", width: "300px" },
  { datakey: "Expiration", header: "EXPIRATION", width: "120px" },
  {
    datakey: "InsuredValue",
    header: "AMOUNT INSURED",
    width: "150px",
    type: "number",
  },
  {
    datakey: "TotalPremium",
    header: "TOTAL PREMIUM",
    width: "150px",
    type: "number",
  },
  { datakey: "Mortgage", header: "MORTGAGEE", width: "300px" },
];
const MAR = [
  { datakey: "AssuredName", header: "ASSURED NAME", width: "350px" },
  { datakey: "PolicyNo", header: "POLICY NO", width: "300px" },
  { datakey: "Expiration", header: "EXPIRATION", width: "120px" },
  {
    datakey: "InsuredValue",
    header: "AMOUNT INSURED",
    width: "150px",
    type: "number",
  },
  {
    datakey: "TotalPremium",
    header: "TOTAL PREMIUM",
    width: "150px",
    type: "number",
  },
];
const PA = [
  { datakey: "AssuredName", header: "ASSURED NAME", width: "350px" },
  { datakey: "PolicyNo", header: "POLICY NO", width: "300px" },
  { datakey: "Expiration", header: "EXPIRATION", width: "120px" },
  {
    datakey: "TotalPremium",
    header: "TOTAL PREMIUM",
    width: "150px",
    type: "number",
  },
];
const COLUMNS__: any = {
  COM,
  FIRE,
  MAR,
  PA,
};

const columnRenderForRenewalNotice = (policy: string) => {
  return COLUMNS__[policy];
};

export { columnRenderForRenewalNotice };
