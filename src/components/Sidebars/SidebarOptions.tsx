import React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Collapse from "@mui/material/Collapse";
import StarBorder from "@mui/icons-material/StarBorder";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import MediationIcon from "@mui/icons-material/Mediation";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StyleIcon from "@mui/icons-material/Style";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaidIcon from "@mui/icons-material/Paid";
import PolicyIcon from "@mui/icons-material/Policy";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import TabUnselectedIcon from "@mui/icons-material/TabUnselected";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import InfoIcon from "@mui/icons-material/Info";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import IconButton from "@mui/material/IconButton";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { policyLinkList } from "../../lib/findObjectbyLink";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import TableChartIcon from "@mui/icons-material/TableChart";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ArchiveIcon from "@mui/icons-material/Archive";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CallMissedOutgoingIcon from "@mui/icons-material/CallMissedOutgoing";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import AlignVerticalCenterIcon from "@mui/icons-material/AlignVerticalCenter";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: "40px",
  height: "40px",
  maxHeight: "40px",
}));
export const SidebarHeader = ({
  handleDrawerClose,
}: {
  handleDrawerClose: CallableFunction;
}) => {
  return (
    <DrawerHeader>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          columnGap: "40px",
        }}
      >
        <Avatar
          variant={"rounded"}
          alt="The image"
          src={process.env.REACT_APP_IMAGE_URL + "logo.png"}
          sx={{ width: "50px", height: "50px" }}
        />
        {/* <Typography sx={{ fontFamily: "Arial", fontWeight: "bold" , fontSize:"14px" }}>
          UPWARD
        </Typography> */}
        <h6
          style={{ fontFamily: "fantasy", fontSize: "13px", fontWeight: 300 }}
        >
          Upward Insurance
        </h6>
      </Box>
      <IconButton size="small" onClick={() => handleDrawerClose()}>
        <MenuOpenIcon
          sx={{ width: "20px", height: "20px", color: "black !important" }}
        />
      </IconButton>
    </DrawerHeader>
  );
};

const ACCOUNTING = [
  {
    showDropDown: false,
    text: "Reference",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      // {
      //   text: "Branch",
      //   link: "/dashboard/reference/branch",
      //   icon: (
      //     <MediationIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      // },
      {
        text: "Branch",
        link: "/dashboard/reference/sub-account",
        icon: (
          <SupervisorAccountIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Policy Account",
        link: "/dashboard/reference/policy-account",
        icon: (
          <LocalPoliceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank",
        link: "/dashboard/reference/bank",
        icon: (
          <TableChartIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank Account",
        link: "/dashboard/reference/bank-account",
        icon: (
          <AdminPanelSettingsIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Chart of Accounts",
        link: "/dashboard/reference/chart-accounts",
        icon: (
          <ScatterPlotIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },

      {
        text: "Transaction Code",
        link: "/dashboard/reference/transaction-code",
        icon: (
          <PointOfSaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "ID Entry",
        link: "/dashboard/reference/id-entry",
        icon: (
          <CoPresentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Mortgagee",
        link: "/dashboard/reference/mortgagee",
        icon: (
          <AccountBalanceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Subline",
        link: "/dashboard/reference/subline",
        icon: (
          <LinearScaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Rates",
        link: "/dashboard/reference/rates",
        icon: (
          <StarBorder
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "CTPL",
        link: "/dashboard/reference/ctpl",
        icon: (
          <AssignmentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Petty Cash Transaction",
        link: "/dashboard/reference/petty-cash-transaction",
        icon: (
          <PaidIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
    ],
  },
  {
    showDropDown: false,
    text: "Accounting",
    icon: (
      <AlignVerticalCenterIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Post Dated Checks",
        icon: (
          <BookmarkAddedIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/post-date-checks",
      },
      {
        text: "Collections",
        icon: (
          <CollectionsBookmarkIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/collections",
      },
      {
        text: "Deposit",
        icon: (
          <ArchiveIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/deposit",
      },
      {
        text: "Return Check",
        icon: (
          <DoneAllIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/return-check",
      },
      {
        text: "Petty Cash",
        icon: (
          <LocalAtmIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/petty-cash",
      },
      {
        text: "General Journal",
        icon: (
          <DensitySmallIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/general-journal",
      },
      {
        text: "Cash Disbursement",
        icon: (
          <CurrencyExchangeIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/cash-disbursement",
      },
      {
        text: "Treasury",
        icon: (
          <WarehouseIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/warehouse-checks",
      },
      // {
      //   text: "Monthly Accrual",
      //   icon: (
      //     <DateRangeIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/monthly-accrual",
      // },
      {
        text: "Check Pullout",
        icon: (
          <CallMissedOutgoingIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-pullout",
      },
      {
        text: "Check Postponement",
        icon: (
          <CancelScheduleSendIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-postponement",
      },
      // {
      //   text: "Closing Transaction",
      //   icon: (
      //     <SubtitlesOffIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/closing-transaction",
      // },
      // {
      //   text: "Nominal Closing",
      //   icon: (
      //     <CloseFullscreenIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/nominal-closing",
      // },
    ],
  },
  // {
  //   link: "/dashboard/reports/accounting/schedule-account",
  //   text: "Reports",
  //   icon: (
  //     <ContentPasteIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  // },
  // {
  //   showDropDown: false,
  //   text: "Help",
  //   icon: <HelpCenterIcon />,
  //   children: [
  //     {
  //       text: "Content",
  //       link: "/dashboard/help/content",
  //       icon: <TabUnselectedIcon />,
  //     },
  //     {
  //       text: "Search",
  //       link: "/dashboard/help/search",
  //       icon: <YoutubeSearchedForIcon />,
  //     },
  //     {
  //       text: "Index",
  //       link: "/dashboard/help/index",
  //       icon: <ManageSearchIcon />,
  //     },
  //     {
  //       text: "About",
  //       link: "/dashboard/help/about",
  //       icon: <InfoIcon />,
  //     },
  //   ],
  // },
];
const PRODUCTION = [
  {
    showDropDown: false,
    text: "Reference",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Branch",
        link: "/dashboard/reference/branch",
        icon: (
          <MediationIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Policy Account",
        link: "/dashboard/reference/policy-account",
        icon: (
          <LocalPoliceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Sub Account",
        link: "/dashboard/reference/sub-account",
        icon: (
          <SupervisorAccountIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "ID Entry",
        link: "/dashboard/reference/id-entry",
        icon: (
          <CoPresentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Mortgagee",
        link: "/dashboard/reference/mortgagee",
        icon: (
          <AccountBalanceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Booklet",
        link: "/dashboard/reference/booklet",
        icon: (
          <StyleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Subline",
        link: "/dashboard/reference/subline",
        icon: (
          <LinearScaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Rates",
        link: "/dashboard/reference/rates",
        icon: (
          <StarBorder
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "CTPL",
        link: "/dashboard/reference/ctpl",
        icon: (
          <AssignmentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Petty Cash Transaction",
        link: "/dashboard/reference/petty-cash-transaction",
        icon: (
          <PaidIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
    ],
  },
  {
    showDropDown: false,
    text: "Production",
    icon: (
      <PrecisionManufacturingIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Policy",
        icon: (
          <PolicyIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/policy/",
      },
      {
        text: "Statement of Account",
        icon: (
          <HistoryEduIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/statement-of-account",
      },
    ],
  },
  // {
  //   text: "Reports",
  //   link: "/dashboard/reports/production/production-report",
  //   icon: (
  //     <ContentPasteIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  // },
  // {
  //   showDropDown: false,
  //   text: "Templates",
  //   icon: (
  //     <HelpCenterIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  //   children: [
  //     {
  //       text: "Renewal Notice Template",
  //       link: "/dashboard/templates/renewal-template",
  //       icon: (
  //         <TabUnselectedIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   showDropDown: false,
  //   text: "Help",
  //   icon: (
  //     <HelpCenterIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  //   children: [
  //     {
  //       text: "Content",
  //       link: "/dashboard/help/content",
  //       icon: (
  //         <TabUnselectedIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //     {
  //       text: "Search",
  //       link: "/dashboard/help/search",
  //       icon: (
  //         <YoutubeSearchedForIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //     {
  //       text: "Index",
  //       link: "/dashboard/help/index",
  //       icon: (
  //         <ManageSearchIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //     {
  //       text: "About",
  //       link: "/dashboard/help/about",
  //       icon: (
  //         <InfoIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //   ],
  // },
];
const CLAIMS = [
  {
    showDropDown: false,
    text: "CLAIMS",
    link: "/dashboard/task/claims/claims",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
  },

  {
    link: "/dashboard/reports/claims/claims-report",
    text: "Reports",
    icon: (
      <AlignVerticalCenterIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
  },
];
const ADMIN = [
  {
    showDropDown: false,
    text: "CLAIMS",
    link: "/dashboard/task/claims/claims",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
  },
  {
    showDropDown: false,
    text: "Reference",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Branch",
        link: "/dashboard/reference/branch",
        icon: (
          <MediationIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Policy Account",
        link: "/dashboard/reference/policy-account",
        icon: (
          <LocalPoliceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank",
        link: "/dashboard/reference/bank",
        icon: (
          <TableChartIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank Account",
        link: "/dashboard/reference/bank-account",
        icon: (
          <AdminPanelSettingsIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Booklet",
        link: "/dashboard/reference/booklet",
        icon: (
          <StyleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Chart of Accounts",
        link: "/dashboard/reference/chart-accounts",
        icon: (
          <ScatterPlotIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Sub Account",
        link: "/dashboard/reference/sub-account",
        icon: (
          <SupervisorAccountIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Transaction Code",
        link: "/dashboard/reference/transaction-code",
        icon: (
          <PointOfSaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "ID Entry",
        link: "/dashboard/reference/id-entry",
        icon: (
          <CoPresentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Subline",
        link: "/dashboard/reference/subline",
        icon: (
          <LinearScaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Rates",
        link: "/dashboard/reference/rates",
        icon: (
          <StarBorder
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "CTPL",
        link: "/dashboard/reference/ctpl",
        icon: (
          <AssignmentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Petty Cash Transaction",
        link: "/dashboard/reference/petty-cash-transaction",
        icon: (
          <PaidIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Mortgagee",
        link: "/dashboard/reference/mortgagee",
        icon: (
          <AccountBalanceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
    ],
  },
  {
    showDropDown: false,
    text: "Production",
    icon: (
      <PrecisionManufacturingIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Policy",
        icon: (
          <PolicyIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/policy/",
      },
      {
        text: "Statement of Account",
        icon: (
          <HistoryEduIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/statement-of-account",
      },
    ],
  },
  {
    showDropDown: false,
    text: "Accounting",
    icon: (
      <AlignVerticalCenterIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Post Dated Checks",
        icon: (
          <BookmarkAddedIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/post-date-checks",
      },
      {
        text: "Collections",
        icon: (
          <CollectionsBookmarkIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/collections",
      },
      {
        text: "Deposit",
        icon: (
          <ArchiveIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/deposit",
      },
      {
        text: "Return Check",
        icon: (
          <DoneAllIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/return-check",
      },
      {
        text: "Petty Cash",
        icon: (
          <LocalAtmIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/petty-cash",
      },
      {
        text: "General Journal",
        icon: (
          <DensitySmallIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/general-journal",
      },
      {
        text: "Cash Disbursement",
        icon: (
          <CurrencyExchangeIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/cash-disbursement",
      },
      {
        text: "Treasury",
        icon: (
          <WarehouseIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/warehouse-checks",
      },
      // {
      //   text: "Monthly Accrual",
      //   icon: (
      //     <DateRangeIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/monthly-accrual",
      // },
      {
        text: "Check Pullout",
        icon: (
          <CallMissedOutgoingIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-pullout",
      },
      {
        text: "Check Postponement",
        icon: (
          <CancelScheduleSendIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-postponement",
      },
      // {
      //   text: "Closing Transaction",
      //   icon: (
      //     <SubtitlesOffIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/closing-transaction",
      // },
      // {
      //   text: "Nominal Closing",
      //   icon: (
      //     <CloseFullscreenIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/nominal-closing",
      // },
    ],
  },
  // {
  //   link: "/dashboard/reports/accounting/schedule-account",
  //   text: "Reports",
  //   icon: (
  //     <ContentPasteIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  // },
  // {
  //   showDropDown: false,
  //   text: "Templates",
  //   icon: (
  //     <HelpCenterIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  //   children: [
  //     {
  //       text: "Renewal Notice Template",
  //       link: "/dashboard/templates/renewal-template",
  //       icon: (
  //         <TabUnselectedIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   showDropDown: false,
  //   text: "Help",
  //   icon: <HelpCenterIcon />,
  //   children: [
  //     {
  //       text: "Content",
  //       link: "/dashboard/help/content",
  //       icon: <TabUnselectedIcon />,
  //     },
  //     {
  //       text: "Search",
  //       link: "/dashboard/help/search",
  //       icon: <YoutubeSearchedForIcon />,
  //     },
  //     {
  //       text: "Index",
  //       link: "/dashboard/help/index",
  //       icon: <ManageSearchIcon />,
  //     },
  //     {
  //       text: "About",
  //       link: "/dashboard/help/about",
  //       icon: <InfoIcon />,
  //     },
  //   ],
  // },
];
const PRODUCTION_ACCOUNTING = [
  {
    showDropDown: false,
    text: "Reference",
    icon: (
      <ContentPasteSearchIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Branch",
        link: "/dashboard/reference/branch",
        icon: (
          <MediationIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Policy Account",
        link: "/dashboard/reference/policy-account",
        icon: (
          <LocalPoliceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank",
        link: "/dashboard/reference/bank",
        icon: (
          <TableChartIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Bank Account",
        link: "/dashboard/reference/bank-account",
        icon: (
          <AdminPanelSettingsIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Booklet",
        link: "/dashboard/reference/booklet",
        icon: (
          <StyleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Chart of Accounts",
        link: "/dashboard/reference/chart-accounts",
        icon: (
          <ScatterPlotIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Sub Account",
        link: "/dashboard/reference/sub-account",
        icon: (
          <SupervisorAccountIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Transaction Code",
        link: "/dashboard/reference/transaction-code",
        icon: (
          <PointOfSaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "ID Entry",
        link: "/dashboard/reference/id-entry",
        icon: (
          <CoPresentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Subline",
        link: "/dashboard/reference/subline",
        icon: (
          <LinearScaleIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Rates",
        link: "/dashboard/reference/rates",
        icon: (
          <StarBorder
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "CTPL",
        link: "/dashboard/reference/ctpl",
        icon: (
          <AssignmentIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Petty Cash Transaction",
        link: "/dashboard/reference/petty-cash-transaction",
        icon: (
          <PaidIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
      {
        text: "Mortgagee",
        link: "/dashboard/reference/mortgagee",
        icon: (
          <AccountBalanceIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
      },
    ],
  },
  {
    showDropDown: false,
    text: "Production",
    icon: (
      <PrecisionManufacturingIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Policy",
        icon: (
          <PolicyIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/policy/",
      },
      {
        text: "Statement of Account",
        icon: (
          <HistoryEduIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/production/statement-of-account",
      },
    ],
  },
  {
    showDropDown: false,
    text: "Accounting",
    icon: (
      <AlignVerticalCenterIcon
        sx={{ width: "20px !important", heigth: "20px !important" }}
      />
    ),
    children: [
      {
        text: "Post Dated Checks",
        icon: (
          <BookmarkAddedIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/post-date-checks",
      },
      {
        text: "Collections",
        icon: (
          <CollectionsBookmarkIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/collections",
      },
      {
        text: "Deposit",
        icon: (
          <ArchiveIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/deposit",
      },
      {
        text: "Return Check",
        icon: (
          <DoneAllIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/return-check",
      },
      {
        text: "Petty Cash",
        icon: (
          <LocalAtmIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/petty-cash",
      },
      {
        text: "General Journal",
        icon: (
          <DensitySmallIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/general-journal",
      },
      {
        text: "Cash Disbursement",
        icon: (
          <CurrencyExchangeIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/cash-disbursement",
      },
      {
        text: "Treasury",
        icon: (
          <WarehouseIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/warehouse-checks",
      },
      // {
      //   text: "Monthly Accrual",
      //   icon: (
      //     <DateRangeIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/monthly-accrual",
      // },
      {
        text: "Check Pullout",
        icon: (
          <CallMissedOutgoingIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-pullout",
      },
      {
        text: "Check Postponement",
        icon: (
          <CancelScheduleSendIcon
            sx={{ width: "20px !important", heigth: "20px !important" }}
          />
        ),
        link: "/dashboard/task/accounting/check-postponement",
      },
      // {
      //   text: "Closing Transaction",
      //   icon: (
      //     <SubtitlesOffIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/closing-transaction",
      // },
      // {
      //   text: "Nominal Closing",
      //   icon: (
      //     <CloseFullscreenIcon
      //       sx={{ width: "20px !important", heigth: "20px !important" }}
      //     />
      //   ),
      //   link: "/dashboard/task/accounting/nominal-closing",
      // },
    ],
  },
  // {
  //   text: "Reports",
  //   link: "/dashboard/reports/accounting/schedule-account",
  //   icon: (
  //     <ContentPasteIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  // },
  // {
  //   showDropDown: false,
  //   text: "Production Reports",
  //   icon: (
  //     <ContentPasteIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  //   children: [
  //     {
  //       text: "Production Report",
  //       link: "/dashboard/reports/production/production-report",
  //       icon: (
  //         <LowPriorityIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //     {
  //       text: "Renewal Notice",
  //       link: "/dashboard/reports/production/renewal-notice",
  //       icon: (
  //         <LowPriorityIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   showDropDown: false,
  //   text: "Templates",
  //   icon: (
  //     <HelpCenterIcon
  //       sx={{ width: "20px !important", heigth: "20px !important" }}
  //     />
  //   ),
  //   children: [
  //     {
  //       text: "Renewal Notice Template",
  //       link: "/dashboard/templates/renewal-template",
  //       icon: (
  //         <TabUnselectedIcon
  //           sx={{ width: "20px !important", heigth: "20px !important" }}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   showDropDown: false,
  //   text: "Help",
  //   icon: <HelpCenterIcon />,
  //   children: [
  //     {
  //       text: "Content",
  //       link: "/dashboard/help/content",
  //       icon: <TabUnselectedIcon />,
  //     },
  //     {
  //       text: "Search",
  //       link: "/dashboard/help/search",
  //       icon: <YoutubeSearchedForIcon />,
  //     },
  //     {
  //       text: "Index",
  //       link: "/dashboard/help/index",
  //       icon: <ManageSearchIcon />,
  //     },
  //     {
  //       text: "About",
  //       link: "/dashboard/help/about",
  //       icon: <InfoIcon />,
  //     },
  //   ],
  // },
];

export function sidebarOptions(userAccess: any) {
  const sidebarOption: any = {
    ACCOUNTING,
    PRODUCTION,
    CLAIMS,
    ADMIN,
    PRODUCTION_ACCOUNTING,
  };
  return sidebarOption[userAccess.trim()] as Array<
    | {
        text: string;
        icon: JSX.Element;
        children: {
          text: string;
          link: string;
          icon: JSX.Element;
        }[];
      }
    | {
        text: string;
        icon: JSX.Element;
        children: {
          text: string;
          icon: JSX.Element;
          children: {
            text: string;
            icon: JSX.Element;
            link: string;
          }[];
        }[];
      }
  >;
}
export function RenderSidebarItems({
  item,
  index,
  setSidebarDataOptions,
}: any) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    setSidebarDataOptions((d: Array<any>) => {
      if (d[index].text.toLowerCase() === "reports") {
        navigate(`${item.link}?drawer=false`);
        return d;
      }
      return d.map((item: any, idx: number) => {
        if (idx === index) {
          item = { ...item, showDropdown: !item.showDropdown };
        } else {
          item = { ...item, showDropdown: false };
        }

        return item;
      });
    });
  };
  return (
    <>
      {item.text === "CLAIMS" ? (
        <React.Fragment>
          <Divider />
          <ListItemButton
            selected={location.pathname === item.link}
            component={Link}
            key={index}
            to={item.link + `?drawer=false`}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: "13px" }}
              primary={item.text}
            />
          </ListItemButton>
        </React.Fragment>
      ) : (
        <ListItemButton sx={{ pl: 2 }} onClick={handleClick}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: "13px" }}
            primary={item.text}
          />
          {item.children && (
            <ExpandMore
              sx={{
                transform: item.showDropdown
                  ? "rotate(-180deg)"
                  : "rotate(0deg)",
                transition: "all 500ms",
              }}
            />
          )}
        </ListItemButton>
      )}

      <Collapse in={item.showDropdown} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children &&
            item.children.map((child1: any, index: number) => {
              return (
                <React.Fragment key={index}>
                  {child1.children ? (
                    <Box>
                      <Divider />
                      <RenderSidebarItems item={child1} index={index} />
                    </Box>
                  ) : (
                    <React.Fragment>
                      <Divider />
                      <ListItemButton
                        selected={
                          child1.text === "Policy"
                            ? policyLinkList.some(
                                (d) => d === location.pathname
                              )
                            : location.pathname === child1.link
                        }
                        component={Link}
                        sx={{ pl: 4 }}
                        key={index}
                        to={child1.link + `?drawer=false`}
                      >
                        <ListItemIcon>{child1.icon}</ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ fontSize: "13px" }}
                          primary={child1.text}
                        />
                      </ListItemButton>
                    </React.Fragment>
                  )}
                </React.Fragment>
              );
            })}
        </List>
      </Collapse>
      <Divider />
    </>
  );
}
export function SidebarParent({
  sidebarDataOptions,
  setSidebarDataOptions,
}: any) {
  return (
    <React.Fragment>
      {sidebarDataOptions.map((itm: any, idx: number) => {
        return (
          <RenderSidebarItems
            key={idx}
            item={itm}
            index={idx}
            sidebarDataOptions={sidebarDataOptions}
            setSidebarDataOptions={setSidebarDataOptions}
          />
        );
      })}
    </React.Fragment>
  );
}
