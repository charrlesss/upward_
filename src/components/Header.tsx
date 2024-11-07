import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../style/header.css'
import { AuthContext } from "./AuthContext";
import { Logout } from "./Sidebars/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useQuery } from "react-query";
import { wait } from "../lib/wait";
import Swal from "sweetalert2";
import axios from "axios";

export default function Header() {
 


  const { user, setUser, myAxios } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef<any>(null); // Reference to the menu container
  const menuUserRef = useRef<any>(null); // Reference to the menu container
  const [menuData, setMenuData] = useState([
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Claim",
      path: "/dashboard/task/claims/claims",
    },
    {
      name: "Reference",
      subLinks: [
        { name: "Policy Account", path: "/dashboard/reference/policy-account" },
        { name: "Bank", path: "/dashboard/reference/bank" },
        { name: "Bank Account", path: "/dashboard/reference/bank-account" },
        { name: "Booklet", path: "/dashboard/reference/booklet" },
        { name: "Chart of Accounts", path: "/dashboard/reference/chart-accounts" },
        { name: "Sub Account", path: "/dashboard/reference/sub-account" },
        { name: "Transaction Code", path: "/dashboard/reference/transaction-code" },
        { name: "ID Entry", path: "/dashboard/reference/id-entry" },
        { name: "Subline", path: "/dashboard/reference/subline" },
        { name: "Rates", path: "/dashboard/reference/rates" },
        { name: "CTPL", path: "/dashboard/reference/ctpl" },
        { name: "Petty Cash Transaction", path: "/dashboard/reference/petty-cash-transaction" },
        { name: "Mortgagee", path: "/dashboard/reference/mortgagee" },
      ],
    },
    {
      name: "Accounting",
      subLinks: [
        { name: "Post Dated Checks", path: "/dashboard/task/accounting/post-date-checks" },
        { name: "Collections", path: "/dashboard/task/accounting/collections" },
        { name: "Deposit", path: "/dashboard/task/accounting/deposit" },
        { name: "Return Check", path: "/dashboard/task/accounting/return-check" },
        { name: "Petty Cash", path: "/dashboard/task/accounting/petty-cash" },
        { name: "General Journal", path: "/dashboard/task/accounting/general-journal" },
        { name: "Cash Disbursement", path: "/dashboard/task/accounting/cash-disbursement" },
        { name: "Treasury", path: "/dashboard/task/accounting/warehouse-checks" },
        { name: "Check Pullout", path: "/dashboard/task/accounting/check-pullout" },
        { name: "Check Postponement", path: "/dashboard/task/accounting/check-postponement" },
      ],
    },
    {
      name: "Production",
      subLinks: [
        { name: "Policy", path: "/dashboard/task/production/policy/" },
        { name: "Statement of Account", path: "/dashboard/task/production/statement-of-account" },
      ],
    },
  ])

  const navigate = useNavigate();

  const { refetch, isLoading } = useQuery({
    queryKey: "logout",
    queryFn: async () =>
      wait(1200).then(async () => await Logout(myAxios, user)),
    enabled: false,
    onSuccess: (res) => {
      if (res.data.success) {
        setOpenUserMenu(false)
        Swal.fire({
          position: "center",
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 800,
        }).then(() => {
          setUser(null);
          navigate("/");
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
      confirmButtonText: "Yes, logout it!"
    }).then((result) => {
      if (result.isConfirmed) {

        axios.get('http://localhost:7624/close-report', {
          withCredentials: true
        }).then((res) => {
          if (!res.data.success) {
            alert(res.data.message)
          }


        })
          .catch(console.log)

        setTimeout(() => {
          refetch();
        }, 500)
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
        path: "/dashboard",
      },
      {
        name: "Claim",
        path: "/dashboard/task/claims/claims",
      },
      {
        name: "Reference",
        subLinks: [
          { name: "Policy Account", path: "/dashboard/reference/policy-account" },
          { name: "Bank", path: "/dashboard/reference/bank" },
          { name: "Bank Account", path: "/dashboard/reference/bank-account" },
          { name: "Booklet", path: "/dashboard/reference/booklet" },
          { name: "Chart of Accounts", path: "/dashboard/reference/chart-accounts" },
          { name: "Sub Account", path: "/dashboard/reference/sub-account" },
          { name: "Transaction Code", path: "/dashboard/reference/transaction-code" },
          { name: "ID Entry", path: "/dashboard/reference/id-entry" },
          { name: "Subline", path: "/dashboard/reference/subline" },
          { name: "Rates", path: "/dashboard/reference/rates" },
          { name: "CTPL", path: "/dashboard/reference/ctpl" },
          { name: "Petty Cash Transaction", path: "/dashboard/reference/petty-cash-transaction" },
          { name: "Mortgagee", path: "/dashboard/reference/mortgagee" },
        ],
      },
      {
        name: "Accounting",
        subLinks: [
          { name: "Post Dated Checks", path: "/dashboard/task/accounting/post-date-checks" },
          { name: "Collections", path: "/dashboard/task/accounting/collections" },
          { name: "Deposit", path: "/dashboard/task/accounting/deposit" },
          { name: "Return Check", path: "/dashboard/task/accounting/return-check" },
          { name: "Petty Cash", path: "/dashboard/task/accounting/petty-cash" },
          { name: "General Journal", path: "/dashboard/task/accounting/general-journal" },
          { name: "Cash Disbursement", path: "/dashboard/task/accounting/cash-disbursement" },
          { name: "Treasury", path: "/dashboard/task/accounting/warehouse-checks" },
          { name: "Check Pullout", path: "/dashboard/task/accounting/check-pullout" },
          { name: "Check Postponement", path: "/dashboard/task/accounting/check-postponement" },
        ],
      },
      {
        name: "Production",
        subLinks: [
          { name: "Policy", path: "/dashboard/task/production/policy/" },
          { name: "Statement of Account", path: "/dashboard/task/production/statement-of-account" },
        ],
      },
  
    ];
    if (user?.userAccess === 'PRODUCTION_ACCOUNTING') {
      setMenuData([{
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Reference",
        subLinks: [
          { name: "Policy Account", path: "/dashboard/reference/policy-account" },
          { name: "Bank", path: "/dashboard/reference/bank" },
          { name: "Bank Account", path: "/dashboard/reference/bank-account" },
          { name: "Booklet", path: "/dashboard/reference/booklet" },
          { name: "Chart of Accounts", path: "/dashboard/reference/chart-accounts" },
          { name: "Sub Account", path: "/dashboard/reference/sub-account" },
          { name: "Transaction Code", path: "/dashboard/reference/transaction-code" },
          { name: "ID Entry", path: "/dashboard/reference/id-entry" },
          { name: "Subline", path: "/dashboard/reference/subline" },
          { name: "Rates", path: "/dashboard/reference/rates" },
          { name: "CTPL", path: "/dashboard/reference/ctpl" },
          { name: "Petty Cash Transaction", path: "/dashboard/reference/petty-cash-transaction" },
          { name: "Mortgagee", path: "/dashboard/reference/mortgagee" },
        ],
      },
      {
        name: "Accounting",
        subLinks: [
          { name: "Post Dated Checks", path: "/dashboard/task/accounting/post-date-checks" },
          { name: "Collections", path: "/dashboard/task/accounting/collections" },
          { name: "Deposit", path: "/dashboard/task/accounting/deposit" },
          { name: "Return Check", path: "/dashboard/task/accounting/return-check" },
          { name: "Petty Cash", path: "/dashboard/task/accounting/petty-cash" },
          { name: "General Journal", path: "/dashboard/task/accounting/general-journal" },
          { name: "Cash Disbursement", path: "/dashboard/task/accounting/cash-disbursement" },
          { name: "Treasury", path: "/dashboard/task/accounting/warehouse-checks" },
          { name: "Check Pullout", path: "/dashboard/task/accounting/check-pullout" },
          { name: "Check Postponement", path: "/dashboard/task/accounting/check-postponement" },
        ],
      },
      {
        name: "Production",
        subLinks: [
          { name: "Policy", path: "/dashboard/task/production/policy/" },
          { name: "Statement of Account", path: "/dashboard/task/production/statement-of-account" },
        ],
      },])
    } else if (user?.userAccess === 'ACCOUNTING') {
      setMenuData([
        {
          name: "Dashboard",
          path: "/dashboard",
        },
        {
          name: "Reference",
          subLinks: [
            { name: "Policy Account", path: "/dashboard/reference/policy-account" },
            { name: "Bank", path: "/dashboard/reference/bank" },
            { name: "Bank Account", path: "/dashboard/reference/bank-account" },
            { name: "Booklet", path: "/dashboard/reference/booklet" },
            { name: "Chart of Accounts", path: "/dashboard/reference/chart-accounts" },
            { name: "Sub Account", path: "/dashboard/reference/sub-account" },
            { name: "Transaction Code", path: "/dashboard/reference/transaction-code" },
            { name: "ID Entry", path: "/dashboard/reference/id-entry" },
            { name: "Subline", path: "/dashboard/reference/subline" },
            { name: "Rates", path: "/dashboard/reference/rates" },
            { name: "CTPL", path: "/dashboard/reference/ctpl" },
            { name: "Petty Cash Transaction", path: "/dashboard/reference/petty-cash-transaction" },
            { name: "Mortgagee", path: "/dashboard/reference/mortgagee" },
          ],
        },
        {
          name: "Accounting",
          subLinks: [
            { name: "Post Dated Checks", path: "/dashboard/task/accounting/post-date-checks" },
            { name: "Collections", path: "/dashboard/task/accounting/collections" },
            { name: "Deposit", path: "/dashboard/task/accounting/deposit" },
            { name: "Return Check", path: "/dashboard/task/accounting/return-check" },
            { name: "Petty Cash", path: "/dashboard/task/accounting/petty-cash" },
            { name: "General Journal", path: "/dashboard/task/accounting/general-journal" },
            { name: "Cash Disbursement", path: "/dashboard/task/accounting/cash-disbursement" },
            { name: "Treasury", path: "/dashboard/task/accounting/warehouse-checks" },
            { name: "Check Pullout", path: "/dashboard/task/accounting/check-pullout" },
            { name: "Check Postponement", path: "/dashboard/task/accounting/check-postponement" },
          ],
        },
      ])
    } else if (user?.userAccess === 'PRODUCTION') {
      setMenuData([{
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Reference",
        subLinks: [
          { name: "Policy Account", path: "/dashboard/reference/policy-account" },
          { name: "Bank", path: "/dashboard/reference/bank" },
          { name: "Bank Account", path: "/dashboard/reference/bank-account" },
          { name: "Booklet", path: "/dashboard/reference/booklet" },
          { name: "Chart of Accounts", path: "/dashboard/reference/chart-accounts" },
          { name: "Sub Account", path: "/dashboard/reference/sub-account" },
          { name: "Transaction Code", path: "/dashboard/reference/transaction-code" },
          { name: "ID Entry", path: "/dashboard/reference/id-entry" },
          { name: "Subline", path: "/dashboard/reference/subline" },
          { name: "Rates", path: "/dashboard/reference/rates" },
          { name: "CTPL", path: "/dashboard/reference/ctpl" },
          { name: "Petty Cash Transaction", path: "/dashboard/reference/petty-cash-transaction" },
          { name: "Mortgagee", path: "/dashboard/reference/mortgagee" },
        ],
      },
      {
        name: "Production",
        subLinks: [
          { name: "Policy", path: "/dashboard/task/production/policy/" },
          { name: "Statement of Account", path: "/dashboard/task/production/statement-of-account" },
        ],
      },
      ])
    } else if (user?.userAccess === 'CLAIMS') {
      setMenuData([{
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Claim",
        path: "/dashboard/task/claims/claims",
      },])
    } else {
      setMenuData(_menuData)
    }
  }, [user?.userAccess])
  // Add event listener to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }


      if (menuUserRef.current && !menuUserRef.current.contains(e.target)) {
        setOpenUserMenu(false)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header >
      <nav ref={menuRef} className="menu header-ch">
        <ul className="main-menu">
          {menuData.map((menuItem: any, index: any) => (
            <li
              key={index}
              onMouseEnter={() => handleMouseEnter(menuItem)}
            >
              {/* Conditional rendering for click vs link */}
              {menuItem.path ? (
                <Link style={{ fontSize: "14px", fontWeight: "bold" }} to={menuItem.path}>{menuItem.name}</Link>
              ) : (
                <span style={{ cursor: "pointer", fontSize: "14px", fontWeight: "bold" }} onClick={() => handleClick(menuItem)}>{menuItem.name}</span>
              )}

              {/* Show submenu based on hover or click */}
              {menuItem.subLinks && openMenu === menuItem.name && (
                <ul className="submenu">
                  {menuItem.subLinks.map((subLink: any, subIndex: any) => (
                    <li key={subIndex}>
                      <Link to={subLink.path} onClick={handleSubLinkClick}>{subLink.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="header-ch">
        <span>{user?.department}</span>
      </div>
      <div className="header-ch">
        <div ref={menuUserRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <AccountCircle
            color="info"
            sx={{
              cursor: "pointer"
            }}
            onClick={() => {
              setOpenUserMenu((d) => !d)
            }}
          />
          {openUserMenu && <ul className="user-menu">
            <li>
              <span>Profile</span>
            </li>
            <li>
              <span onClick={() => {
                handleLogout()
              }} >Logout</span>
            </li>
          </ul>}
        </div>
        <Clock />
      </div>
      {(isLoading) && <div className="loading-component"><div className="loader"></div></div>}
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
    <p style={{ fontSize: "13px", padding: 0, margin: 0 }}>{formatTime(time)}</p>
  );
}