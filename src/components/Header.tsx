import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../style/header.css";
import { AuthContext, User } from "./AuthContext";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useQuery } from "react-query";
import { wait } from "../lib/wait";
import Swal from "sweetalert2";
import axios, { AxiosInstance } from "axios";

async function Logout(myAxios: AxiosInstance, user: User | null) {
  return await myAxios.get("logout", {
    headers: {
      Authorization: `Bearer ${user?.accessToken}`,
    },
  });
}

export default function Header() {
  const department = useRef(process.env.REACT_APP_DEPARTMENT);
  const { user, setUser, myAxios } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef<any>(null); // Reference to the menu container
  const menuUserRef = useRef<any>(null); // Reference to the menu container
  const [menuData, setMenuData] = useState<Array<any>>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { refetch, isLoading } = useQuery({
    queryKey: "logout",
    queryFn: async () =>
      wait(1200).then(async () => await Logout(myAxios, user)),
    enabled: false,
    onSuccess: (res) => {
      if (res.data.success) {
        setOpenUserMenu(false);
        Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 800,
        }).then(() => {
          setUser(null);
          navigate(`/${process.env.REACT_APP_DEPARTMENT}/login`);
        });
      }
    },
  });

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to logout!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .get("http://localhost:7624/close-report", {
            withCredentials: true,
          })
          .then((res) => {
            if (!res.data.success) {
              alert(res.data.message);
            }
          })
          .catch(console.log);

        setTimeout(() => {
          refetch();
        }, 500);
      }
    });
  };

  const handleMouseEnter = (menuItem: any) => {
    if (!menuItem.path && menuItem.subLinks) {
      return; // Ignore hover if no direct path and has sublinks
    }
    setOpenMenu(menuItem.name);
  };

  const handleClick = (menuItem: any) => {
    if (!menuItem.path && menuItem.subLinks) {
      // Toggle submenu display on click
      setOpenMenu(openMenu === menuItem.name ? null : menuItem.name);
    }
  };
  const handleSubLinkClick = () => {
    // Close submenu after clicking any sublink
    setOpenMenu(null);
  };

  useEffect(() => {
    const _menuData = [
      {
        name: "Dashboard",
        path: `/${department.current}/dashboard`,
      },
      {
        name: "Claim",
        path: `/${department.current}/dashboard/task/claims/claims`,
      },
      {
        name: "Reference",
        subLinks: [
          {
            name: "Policy Account",
            path: `/${department.current}/dashboard/reference/policy-account`,
          },
          {
            name: "Bank",
            path: `/${department.current}/dashboard/reference/bank`,
          },
          {
            name: "Bank Account",
            path: `/${department.current}/dashboard/reference/bank-account`,
          },
          {
            name: "Booklet",
            path: `/${department.current}/dashboard/reference/booklet`,
          },
          {
            name: "Chart of Accounts",
            path: `/${department.current}/dashboard/reference/chart-accounts`,
          },
          {
            name: "Sub Account",
            path: `/${department.current}/dashboard/reference/sub-account`,
          },
          {
            name: "Transaction Code",
            path: `/${department.current}/dashboard/reference/transaction-code`,
          },
          {
            name: "ID Entry",
            path: `/${department.current}/dashboard/reference/id-entry`,
          },
          {
            name: "Subline",
            path: `/${department.current}/dashboard/reference/subline`,
          },
          {
            name: "Rates",
            path: `/${department.current}/dashboard/reference/rates`,
          },
          {
            name: "CTPL",
            path: `/${department.current}/dashboard/reference/ctpl`,
          },
          {
            name: "Petty Cash Transaction",
            path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
          },
          {
            name: "Mortgagee",
            path: `/${department.current}/dashboard/reference/mortgagee`,
          },
        ],
      },
      {
        name: "Production",
        subLinks: [
          {
            name: "Policy",
            path: `/${department.current}/dashboard/task/production/policy/`,
          },
          {
            name: "Statement of Account",
            path: `/${department.current}/dashboard/task/production/statement-of-account`,
          },
        ],
      },
      {
        name: "Accounting",
        subLinks: [
          {
            name: "Post Dated Checks",
            path: `/${department.current}/dashboard/task/accounting/post-date-checks`,
          },
          {
            name: "Collections",
            path: `/${department.current}/dashboard/task/accounting/collections`,
          },
          {
            name: "Deposit",
            path: `/${department.current}/dashboard/task/accounting/deposit`,
          },
          {
            name: "Return Check",
            path: `/${department.current}/dashboard/task/accounting/return-check`,
          },
          {
            name: "Petty Cash",
            path: `/${department.current}/dashboard/task/accounting/petty-cash`,
          },
          {
            name: "General Journal",
            path: `/${department.current}/dashboard/task/accounting/general-journal`,
          },
          {
            name: "Cash Disbursement",
            path: `/${department.current}/dashboard/task/accounting/cash-disbursement`,
          },
          {
            name: "Treasury",
            path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
          },
          {
            name: "Check Pullout Request",
            path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
          },
          {
            name: "Check Pullout Approved",
            path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
          },
          {
            name: "Check Postponement Request",
            path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
          },
          {
            name: "Check Postponement Approved",
            path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
          },
        ],
      },
      {
        name: "Production Report",
        subLinks: [
          {
            name: "Production Report",
            path: `/${department.current}/dashboard/reports/production/production-report`,
          },
          {
            name: "Renewal Notice",
            path: `/${department.current}/dashboard/reports/production/renewal-notice`,
          },
        ],
      },
      {
        name: "Accounting Report",
        path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
      },
    ];
    if (user?.userAccess === "PRODUCTION_ACCOUNTING") {
      if (department.current === "UCSMI") {
        return setMenuData([
          {
            name: "Reference",
            subLinks: [
              {
                name: "Policy Account",
                path: `/${department.current}/dashboard/reference/policy-account`,
              },
              {
                name: "Bank",
                path: `/${department.current}/dashboard/reference/bank`,
              },
              {
                name: "Bank Account",
                path: `/${department.current}/dashboard/reference/bank-account`,
              },
              {
                name: "Booklet",
                path: `/${department.current}/dashboard/reference/booklet`,
              },
              {
                name: "Chart of Accounts",
                path: `/${department.current}/dashboard/reference/chart-accounts`,
              },
              {
                name: "Sub Account",
                path: `/${department.current}/dashboard/reference/sub-account`,
              },
              {
                name: "Transaction Code",
                path: `/${department.current}/dashboard/reference/transaction-code`,
              },
              {
                name: "ID Entry",
                path: `/${department.current}/dashboard/reference/id-entry`,
              },
              {
                name: "Subline",
                path: `/${department.current}/dashboard/reference/subline`,
              },
              {
                name: "Rates",
                path: `/${department.current}/dashboard/reference/rates`,
              },
              {
                name: "CTPL",
                path: `/${department.current}/dashboard/reference/ctpl`,
              },
              {
                name: "Petty Cash Transaction",
                path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
              },
              {
                name: "Mortgagee",
                path: `/${department.current}/dashboard/reference/mortgagee`,
              },
            ],
          },
          {
            name: "Production",
            subLinks: [
              {
                name: "Policy",
                path: `/${department.current}/dashboard/task/production/policy/`,
              },
              {
                name: "Statement of Account",
                path: `/${department.current}/dashboard/task/production/statement-of-account`,
              },
            ],
          },
          {
            name: "Accounting",
            subLinks: [
              {
                name: "Post Dated Checks",
                path: `/${department.current}/dashboard/task/accounting/post-date-checks`,
              },
              {
                name: "Collections",
                path: `/${department.current}/dashboard/task/accounting/collections`,
              },
              {
                name: "Deposit",
                path: `/${department.current}/dashboard/task/accounting/deposit`,
              },
              {
                name: "Return Check",
                path: `/${department.current}/dashboard/task/accounting/return-check`,
              },
              {
                name: "Petty Cash",
                path: `/${department.current}/dashboard/task/accounting/petty-cash`,
              },
              {
                name: "General Journal",
                path: `/${department.current}/dashboard/task/accounting/general-journal`,
              },
              {
                name: "Cash Disbursement",
                path: `/${department.current}/dashboard/task/accounting/cash-disbursement`,
              },
              {
                name: "Treasury",
                path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
              },
              {
                name: "Check Pullout Request",
                path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
              },
              {
                name: "Check Pullout Approved",
                path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
              },
              {
                name: "Check Postponement Request",
                path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
              },
              {
                name: "Check Postponement Approved",
                path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
              },
            ],
          },
          {
            name: "Production Report",
            subLinks: [
              {
                name: "Production Report",
                path: `/${department.current}/dashboard/reports/production/production-report`,
              },
              {
                name: "Renewal Notice",
                path: `/${department.current}/dashboard/reports/production/renewal-notice`,
              },
            ],
          },
          {
            name: "Accounting Report",
            path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
          },
        ]);
      }
      return setMenuData([
        {
          name: "Dashboard",
          path: `/${department.current}/dashboard`,
        },

        {
          name: "Reference",
          subLinks: [
            {
              name: "Policy Account",
              path: `/${department.current}/dashboard/reference/policy-account`,
            },
            {
              name: "Bank",
              path: `/${department.current}/dashboard/reference/bank`,
            },
            {
              name: "Bank Account",
              path: `/${department.current}/dashboard/reference/bank-account`,
            },
            {
              name: "Booklet",
              path: `/${department.current}/dashboard/reference/booklet`,
            },
            {
              name: "Chart of Accounts",
              path: `/${department.current}/dashboard/reference/chart-accounts`,
            },
            {
              name: "Sub Account",
              path: `/${department.current}/dashboard/reference/sub-account`,
            },
            {
              name: "Transaction Code",
              path: `/${department.current}/dashboard/reference/transaction-code`,
            },
            {
              name: "ID Entry",
              path: `/${department.current}/dashboard/reference/id-entry`,
            },
            {
              name: "Subline",
              path: `/${department.current}/dashboard/reference/subline`,
            },
            {
              name: "Rates",
              path: `/${department.current}/dashboard/reference/rates`,
            },
            {
              name: "CTPL",
              path: `/${department.current}/dashboard/reference/ctpl`,
            },
            {
              name: "Petty Cash Transaction",
              path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
            },
            {
              name: "Mortgagee",
              path: `/${department.current}/dashboard/reference/mortgagee`,
            },
          ],
        },
        {
          name: "Production",
          subLinks: [
            {
              name: "Policy",
              path: `/${department.current}/dashboard/task/production/policy/`,
            },
            {
              name: "Statement of Account",
              path: `/${department.current}/dashboard/task/production/statement-of-account`,
            },
          ],
        },
        {
          name: "Accounting",
          subLinks: [
            {
              name: "Post Dated Checks",
              path: `/${department.current}/dashboard/task/accounting/post-date-checks`,
            },
            {
              name: "Collections",
              path: `/${department.current}/dashboard/task/accounting/collections`,
            },
            {
              name: "Deposit",
              path: `/${department.current}/dashboard/task/accounting/deposit`,
            },
            {
              name: "Return Check",
              path: `/${department.current}/dashboard/task/accounting/return-check`,
            },
            {
              name: "Petty Cash",
              path: `/${department.current}/dashboard/task/accounting/petty-cash`,
            },
            {
              name: "General Journal",
              path: `/${department.current}/dashboard/task/accounting/general-journal`,
            },
            {
              name: "Cash Disbursement",
              path: `/${department.current}/dashboard/task/accounting/cash-disbursement`,
            },
            {
              name: "Treasury",
              path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
            },
            {
              name: "Check Pullout Request",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
            },
            {
              name: "Check Pullout Approved",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
            },
            {
              name: "Check Postponement Request",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
            },
            {
              name: "Check Postponement Approved",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
            },
          ],
        },
        {
          name: "Production Report",
          subLinks: [
            {
              name: "Production Report",
              path: `/${department.current}/dashboard/reports/production/production-report`,
            },
            {
              name: "Renewal Notice",
              path: `/${department.current}/dashboard/reports/production/renewal-notice`,
            },
          ],
        },
        {
          name: "Accounting Report",
          path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
        },
      ]);
    } else if (user?.userAccess === "ACCOUNTING") {
      if (department.current === "UCSMI") {
        return setMenuData([
          {
            name: "Reference",
            subLinks: [
              {
                name: "Policy Account",
                path: `/${department.current}/dashboard/reference/policy-account`,
              },
              {
                name: "Bank",
                path: `/${department.current}/dashboard/reference/bank`,
              },
              {
                name: "Bank Account",
                path: `/${department.current}/dashboard/reference/bank-account`,
              },
              {
                name: "Booklet",
                path: `/${department.current}/dashboard/reference/booklet`,
              },
              {
                name: "Chart of Accounts",
                path: `/${department.current}/dashboard/reference/chart-accounts`,
              },
              {
                name: "Sub Account",
                path: `/${department.current}/dashboard/reference/sub-account`,
              },
              {
                name: "Transaction Code",
                path: `/${department.current}/dashboard/reference/transaction-code`,
              },
              {
                name: "ID Entry",
                path: `/${department.current}/dashboard/reference/id-entry`,
              },
              {
                name: "Subline",
                path: `/${department.current}/dashboard/reference/subline`,
              },
              {
                name: "Rates",
                path: `/${department.current}/dashboard/reference/rates`,
              },
              {
                name: "CTPL",
                path: `/${department.current}/dashboard/reference/ctpl`,
              },
              {
                name: "Petty Cash Transaction",
                path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
              },
              {
                name: "Mortgagee",
                path: `/${department.current}/dashboard/reference/mortgagee`,
              },
            ],
          },
          {
            name: "Accounting",
            subLinks: [
              {
                name: "Post Dated Checks",
                path: `/${department.current}/dashboard/task/accounting/post-date-checks`,
              },
              {
                name: "Collections",
                path: `/${department.current}/dashboard/task/accounting/collections`,
              },
              {
                name: "Deposit",
                path: `/${department.current}/dashboard/task/accounting/deposit`,
              },
              {
                name: "Return Check",
                path: `/${department.current}/dashboard/task/accounting/return-check`,
              },
              {
                name: "Petty Cash",
                path: `/${department.current}/dashboard/task/accounting/petty-cash`,
              },
              {
                name: "General Journal",
                path: `/${department.current}/dashboard/task/accounting/general-journal`,
              },
              {
                name: "Cash Disbursement",
                path: `/${department.current}/dashboard/task/accounting/cash-disbursement`,
              },
              {
                name: "Treasury",
                path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
              },
              {
                name: "Check Pullout Request",
                path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
              },
              {
                name: "Check Pullout Approved",
                path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
              },
              {
                name: "Check Postponement Request",
                path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
              },
              {
                name: "Check Postponement Approved",
                path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
              },
            ],
          },
          {
            name: "Accounting Report",
            subLinks: [
              {
                name: "Accounting Report",
                path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
              },
            ],
          },
        ]);
      }
      return setMenuData([
        {
          name: "Dashboard",
          path: `/${department.current}/dashboard`,
        },
        {
          name: "Reference",
          subLinks: [
            {
              name: "Policy Account",
              path: `/${department.current}/dashboard/reference/policy-account`,
            },
            {
              name: "Bank",
              path: `/${department.current}/dashboard/reference/bank`,
            },
            {
              name: "Bank Account",
              path: `/${department.current}/dashboard/reference/bank-account`,
            },
            {
              name: "Booklet",
              path: `/${department.current}/dashboard/reference/booklet`,
            },
            {
              name: "Chart of Accounts",
              path: `/${department.current}/dashboard/reference/chart-accounts`,
            },
            {
              name: "Sub Account",
              path: `/${department.current}/dashboard/reference/sub-account`,
            },
            {
              name: "Transaction Code",
              path: `/${department.current}/dashboard/reference/transaction-code`,
            },
            {
              name: "ID Entry",
              path: `/${department.current}/dashboard/reference/id-entry`,
            },
            {
              name: "Subline",
              path: `/${department.current}/dashboard/reference/subline`,
            },
            {
              name: "Rates",
              path: `/${department.current}/dashboard/reference/rates`,
            },
            {
              name: "CTPL",
              path: `/${department.current}/dashboard/reference/ctpl`,
            },
            {
              name: "Petty Cash Transaction",
              path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
            },
            {
              name: "Mortgagee",
              path: `/${department.current}/dashboard/reference/mortgagee`,
            },
          ],
        },
        {
          name: "Accounting",
          subLinks: [
            {
              name: "Post Dated Checks",
              path: `/${department.current}/dashboard/task/accounting/post-date-checks`,
            },
            {
              name: "Collections",
              path: `/${department.current}/dashboard/task/accounting/collections`,
            },
            {
              name: "Deposit",
              path: `/${department.current}/dashboard/task/accounting/deposit`,
            },
            {
              name: "Return Check",
              path: `/${department.current}/dashboard/task/accounting/return-check`,
            },
            {
              name: "Petty Cash",
              path: `/${department.current}/dashboard/task/accounting/petty-cash`,
            },
            {
              name: "General Journal",
              path: `/${department.current}/dashboard/task/accounting/general-journal`,
            },
            {
              name: "Cash Disbursement",
              path: `/${department.current}/dashboard/task/accounting/cash-disbursement`,
            },
            {
              name: "Treasury",
              path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
            },
            {
              name: "Check Pullout Request",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
            },
            {
              name: "Check Pullout Approved",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
            },
            {
              name: "Check Postponement Request",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
            },
            {
              name: "Check Postponement Approved",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
            },
          ],
        },
        {
          name: "Accounting Report",
          subLinks: [
            {
              name: "Accounting Report",
              path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
            },
          ],
        },
      ]);
    } else if (user?.userAccess === "ACCOUNTING_CHECKS") {
      return setMenuData([
        {
          name: "Accounting",
          subLinks: [
            {
              name: "Treasury",
              path: `/${department.current}/dashboard/task/accounting/warehouse-checks`,
            },
            {
              name: "Check Pullout Request",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-request`,
            },
            {
              name: "Check Pullout Approved",
              path: `/${department.current}/dashboard/task/accounting/check-pullout-approved`,
            },
            {
              name: "Check Postponement Request",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-request`,
            },
            {
              name: "Check Postponement Approved",
              path: `/${department.current}/dashboard/task/accounting/check-postponement-approved`,
            },
          ],
        },
        {
          name: "Accounting Report",
          subLinks: [
            {
              name: "Accounting Report",
              path: `/${department.current}/dashboard/reports/accounting/accounting-reports`,
            },
          ],
        },
      ]);
    } else if (user?.userAccess === "PRODUCTION") {
      if (department.current === "UCSMI") {
        return setMenuData([
          {
            name: "Dashboard",
            path: `/${department.current}/dashboard`,
          },
          {
            name: "Reference",
            subLinks: [
              {
                name: "Policy Account",
                path: `/${department.current}/dashboard/reference/policy-account`,
              },
              {
                name: "Bank",
                path: `/${department.current}/dashboard/reference/bank`,
              },
              {
                name: "Bank Account",
                path: `/${department.current}/dashboard/reference/bank-account`,
              },
              {
                name: "Booklet",
                path: `/${department.current}/dashboard/reference/booklet`,
              },
              {
                name: "Chart of Accounts",
                path: `/${department.current}/dashboard/reference/chart-accounts`,
              },
              {
                name: "Sub Account",
                path: `/${department.current}/dashboard/reference/sub-account`,
              },
              {
                name: "Transaction Code",
                path: `/${department.current}/dashboard/reference/transaction-code`,
              },
              {
                name: "ID Entry",
                path: `/${department.current}/dashboard/reference/id-entry`,
              },
              {
                name: "Subline",
                path: `/${department.current}/dashboard/reference/subline`,
              },
              {
                name: "Rates",
                path: `/${department.current}/dashboard/reference/rates`,
              },
              {
                name: "CTPL",
                path: `/${department.current}/dashboard/reference/ctpl`,
              },
              {
                name: "Petty Cash Transaction",
                path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
              },
              {
                name: "Mortgagee",
                path: `/${department.current}/dashboard/reference/mortgagee`,
              },
            ],
          },
          {
            name: "Production",
            subLinks: [
              {
                name: "Policy",
                path: `/${department.current}/dashboard/task/production/policy/`,
              },
              {
                name: "Statement of Account",
                path: `/${department.current}/dashboard/task/production/statement-of-account`,
              },
            ],
          },
          {
            name: "Production Report",
            subLinks: [
              {
                name: "Production Report",
                path: `/${department.current}/dashboard/reports/production/production-report`,
              },
              {
                name: "Renewal Notice",
                path: `/${department.current}/dashboard/reports/production/renewal-notice`,
              },
            ],
          },
        ]);
      }
      return setMenuData([
        {
          name: "Dashboard",
          path: `/${department.current}/dashboard`,
        },
        {
          name: "Reference",
          subLinks: [
            {
              name: "Policy Account",
              path: `/${department.current}/dashboard/reference/policy-account`,
            },
            {
              name: "Bank",
              path: `/${department.current}/dashboard/reference/bank`,
            },
            {
              name: "Bank Account",
              path: `/${department.current}/dashboard/reference/bank-account`,
            },
            {
              name: "Booklet",
              path: `/${department.current}/dashboard/reference/booklet`,
            },
            {
              name: "Chart of Accounts",
              path: `/${department.current}/dashboard/reference/chart-accounts`,
            },
            {
              name: "Sub Account",
              path: `/${department.current}/dashboard/reference/sub-account`,
            },
            {
              name: "Transaction Code",
              path: `/${department.current}/dashboard/reference/transaction-code`,
            },
            {
              name: "ID Entry",
              path: `/${department.current}/dashboard/reference/id-entry`,
            },
            {
              name: "Subline",
              path: `/${department.current}/dashboard/reference/subline`,
            },
            {
              name: "Rates",
              path: `/${department.current}/dashboard/reference/rates`,
            },
            {
              name: "CTPL",
              path: `/${department.current}/dashboard/reference/ctpl`,
            },
            {
              name: "Petty Cash Transaction",
              path: `/${department.current}/dashboard/reference/petty-cash-transaction`,
            },
            {
              name: "Mortgagee",
              path: `/${department.current}/dashboard/reference/mortgagee`,
            },
          ],
        },
        {
          name: "Production",
          subLinks: [
            {
              name: "Policy",
              path: `/${department.current}/dashboard/task/production/policy/`,
            },
            {
              name: "Statement of Account",
              path: `/${department.current}/dashboard/task/production/statement-of-account`,
            },
          ],
        },
        {
          name: "Production Report",
          subLinks: [
            {
              name: "Production Report",
              path: `/${department.current}/dashboard/reports/production/production-report`,
            },
            {
              name: "Renewal Notice",
              path: `/${department.current}/dashboard/reports/production/renewal-notice`,
            },
          ],
        },
      ]);
    } else {
      setMenuData(_menuData);
    }
  }, [user?.userAccess]);

  // Add event listener to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }

      if (menuUserRef.current && !menuUserRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <nav ref={menuRef} className="menu header-ch">
        <ul className="main-menu">
          {menuData.map((menuItem: any, index: any) => (
            <li key={index} onMouseEnter={() => handleMouseEnter(menuItem)}>
              {/* Conditional rendering for click vs link */}
              {menuItem.path ? (
                <Link
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                  to={menuItem.path}
                >
                  {menuItem.name}
                </Link>
              ) : (
                <span
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleClick(menuItem)}
                >
                  {menuItem.name}
                </span>
              )}

              {/* Show submenu based on hover or click */}
              {menuItem.subLinks && openMenu === menuItem.name && (
                <ul className="submenu">
                  {menuItem.subLinks.map((subLink: any, subIndex: any) => (
                    <li
                      key={subIndex}
                      style={{
                        background:
                          subLink.path === location.pathname ? "#555" : "",
                      }}
                    >
                      <Link to={subLink.path} onClick={handleSubLinkClick}>
                        {subLink.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {/* {user?.username === "gina"
            ? user?.userAccess !== "PRODUCTION" &&
              user?.userAccess !== "CLAIMS" && (
                <li>
                  <span
                    style={{
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                    onClick={openReport}
                  >
                    Accounting Report Deskop App
                  </span>
                </li>
              )
            : null} */}
        </ul>
      </nav>

      <div
        className="header-ch"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          columnGap: "10px",
        }}
      >
        <div className="profile-sub-menu">
          <span>{user?.department}</span>
        </div>
        <div
          ref={menuUserRef}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AccountCircle
            color="info"
            sx={{
              cursor: "pointer",
            }}
            onClick={() => {
              setOpenUserMenu((d) => !d);
            }}
          />
          {openUserMenu && (
            <ul className="user-menu">
              <li>
                <span>Profile</span>
              </li>
              <li>
                <span
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  Logout
                </span>
              </li>
            </ul>
          )}
        </div>
        <Clock />
      </div>
      {isLoading && (
        <div className="loading-component">
          <div className="loader"></div>
        </div>
      )}
    </header>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 500);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    let seconds: any = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <p style={{ fontSize: "13px", padding: 0, margin: 0 }}>
      {formatTime(time)}
    </p>
  );
}
