import { AxiosInstance } from "axios";
import { User } from "../../../components/AuthContext";

export const clientColumn:any = [
  { key: "entry_client_id", label: "ID", width: 130 },
  { key: "company", label: "Company", width: 200 },
  { key: "firstname", label: "First Name", width: 200 },
  {
    key: "lastname",
    label: "Last Name",
    width: 200,
  },
  {
    key: "middlename",
    label: "Middle Name",
    width: 200,
  },
  {
    key: "email",
    label: "Email",
    width: 200,
  },
  {
    key: "mobile",
    label: "Mobile",
    width: 200,
  },
  {
    key: "sale_officer",
    label: "Sale Officer",
    width: 200,
  },
  {
    key: "NewShortName",
    label: "Sub Account",
    width: 130,
  },
  {
    key: "option",
    label: "Option",
    width: 130,
  },
  {
    key: "createdAt",
    label: "Created At",
    width: 130,
  },
  {
    key: "address",
    label: "Address",
    width: 500,
  },
];
export const employeeColumn = [
  { field: "entry_employee_id", headerName: "ID", width: 130 },
  { field: "firstname", headerName: "First Name", width: 200 },
  {
    field: "lastname",
    headerName: "Last Name",
    width: 200,
  },
  {
    field: "middlename",
    headerName: "Middle Name",
    width: 200,
  },
  {
    field: "suffix",
    headerName: "Suffix",
    width: 100,
  },
  {
    field: "NewShortName",
    headerName: "Sub Account",
    width: 130,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 130,
  },
  {
    field: "address",
    headerName: "Address",
    width: 500,
  },
];
export const agentColumn = [
  { field: "entry_agent_id", headerName: "ID", width: 130 },
  { field: "firstname", headerName: "First Name", width: 200 },
  {
    field: "lastname",
    headerName: "Last Name",
    width: 200,
  },
  {
    field: "middlename",
    headerName: "Middle Name",
    width: 200,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
  },
  {

    field: "suffix",
    headerName: "Suffix",
    width: 200,
  },
  {
    field: "position",
    headerName: "Position",
    width: 200,
  },
  {
    field: "mobile",
    headerName: "Mobile",
    width: 130,
  },
  {
    field: "telephone",
    headerName: "Telephone",
    width: 130,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 130,
  },
  {
    field: "address",
    headerName: "Address",
    width: 500,
  },
  {
    field: "sub_account",
    headerName: "sub_account",
    width: 500,
    hide: true,
  },
];
export const fixedAssetstColumn = [
  { field: "entry_fixed_assets_id", headerName: "ID", width: 130 },
  { field: "fullname", headerName: "Full Name", width: 250 },
  { field: "description", headerName: "Description", flex: 1 },
  {
    field: "remarks",
    headerName: "Remarks",
    flex: 1,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 200,
  },
];
export const supplierColumn = [
  { field: "entry_supplier_id", headerName: "ID", width: 130 },
  { field: "company", headerName: "Company", width: 200 },
  { field: "firstname", headerName: "First Name", width: 200 },
  {
    field: "lastname",
    headerName: "Last Name",
    width: 200,
  },
  {
    field: "middlename",
    headerName: "Middle Name",
    width: 200,
  },
  {
    field: "email",
    headerName: "Email",
    width: 200,
  },
  {
    field: "mobile",
    headerName: "Mobile",
    width: 200,
  },
  {
    field: "telephone",
    headerName: "Telephone",
    width: 200,
  },
  {
    field: "tin_no",
    headerName: "TIN NO.",
    width: 200,
  },
  {
    field: "option",
    headerName: "Option",
    width: 200,
  },
  {
    field: "VAT_Type",
    headerName: "Vat Type",
    width: 200,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 200,
  },
  {
    field: "address",
    headerName: "Address",
    width: 500,
  },
];
export const othersColumn = [
  { field: "entry_others_id", headerName: "ID", width: 130 },
  { field: "description", headerName: "Description", flex: 1 },
  { field: "remarks", headerName: "Remarks", flex: 1 },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 200,
  },
];

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

export async function searchEntry(
  myAxios: AxiosInstance,
  user: User | null,
  entry: string,
  search: string
) {
  return await myAxios.get(
    `/reference/search-entry?entrySearch=${search}&entry=${entry}`,
    {
      headers: { Authorization: `Bearer ${user?.accessToken}` },
    }
  );
}
