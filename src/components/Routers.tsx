import { lazy, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { RenderPage } from "./Layout";
import Layout from "./Layout";
import NotFoundPage from "../feautures/NotFoundPage";
const MasterAdminDashboard = lazy(
  () => import("../feautures/MasterAdminDashboard")
);

const NavigatePrint = lazy(() => import("../feautures/Admin/Navigate-Print"));
const Claims = lazy(() => import("../feautures/Admin/Task/Claims/Claims"));

const RenewalTemplate = lazy(
  () => import("../feautures/Admin/Template/renewal-template")
);
const AccountingReport = lazy(
  () => import("../feautures/Admin/Reports/Accounting/AccountingReport")
);

const ProductionReport = lazy(
  () => import("../feautures/Admin/Reports/Production/ProductionReport")
);
const RenewalNoticeReport = lazy(
  () => import("../feautures/Admin/Reports/Production/RenewalNoticeReport")
);

const ReturnCheck = lazy(
  () => import("../feautures/Admin/Task/Accounting/ReturnCheck")
);
const PostDateChecks = lazy(
  () => import("../feautures/Admin/Task/Accounting/PostDateChecks")
);
const CashDisbursement = lazy(
  () => import("../feautures/Admin/Task/Accounting/CashDisbursement")
);
const CheckPullout = lazy(
  () => import("../feautures/Admin/Task/Accounting/CheckPullout")
);

const CheckPulloutRequest = lazy(
  () => import("../feautures/Admin/Task/Accounting/CheckPulloutRequest")
);

const CheckPulloutApproved = lazy(
  () => import("../feautures/Admin/Task/Accounting/CheckPulloutApproved")
);
const Collections = lazy(
  () => import("../feautures/Admin/Task/Accounting/Collections")
);
const Deposit = lazy(
  () => import("../feautures/Admin/Task/Accounting/Deposit")
);
const GeneralJournal = lazy(
  () => import("../feautures/Admin/Task/Accounting/GeneralJournal")
);
const PettyCash = lazy(
  () => import("../feautures/Admin/Task/Accounting/PettyCash")
);
const Warehouse = lazy(
  () => import("../feautures/Admin/Task/Accounting/WarehouseChecks")
);
const MonthlyAccrual = lazy(
  () => import("../feautures/Admin/Task/Accounting/MonthlyAccrual")
);
const ChekPostponement = lazy(
  () => import("../feautures/Admin/Task/Accounting/ChekPostponement")
);
const ChekPostponementRequest = lazy(
  () => import("../feautures/Admin/Task/Accounting/ChekPostponementRequest")
);
const ChekPostponementApproved = lazy(
  () => import("../feautures/Admin/Task/Accounting/ChekPostponementApproved")
);
const ClosingTransaction = lazy(
  () => import("../feautures/Admin/Task/Accounting/ClosingTransaction")
);
const NominalClosing = lazy(
  () => import("../feautures/Admin/Task/Accounting/NominalClosing")
);
const Bank = lazy(() => import("../feautures/Admin/Reference/Bank"));
const ChartAccount = lazy(
  () => import("../feautures/Admin/Reference/ChartAccount")
);
const TransactionCode = lazy(
  () => import("../feautures/Admin/Reference/TransactionCode")
);
const BankAccount = lazy(
  () => import("../feautures/Admin/Reference/BankAccount")
);
const LandingPage = lazy(() => import("../feautures/LandingPage"));
const Dashboard = lazy(() => import("../feautures/Admin/Dashboard"));
const Branch = lazy(() => import("../feautures/Admin/Reference/Branch"));
const PolicyAccount = lazy(
  () => import("../feautures/Admin/Reference/PolicyAccount")
);
const SubAccount = lazy(
  () => import("../feautures/Admin/Reference/SubAccount")
);
const IDEntry = lazy(
  () => import("../feautures/Admin/Reference/Entry/IDEntry")
);
const Mortgagee = lazy(() => import("../feautures/Admin/Reference/Mortgagee"));
const Booklet = lazy(() => import("../feautures/Admin/Reference/Booklet"));
const Subline = lazy(() => import("../feautures/Admin/Reference/Subline"));
const Rates = lazy(() => import("../feautures/Admin/Reference/Rates"));
const CTPL = lazy(() => import("../feautures/Admin/Reference/CTPL"));
const PettyCashTransaction = lazy(
  () => import("../feautures/Admin/Reference/PettyCashTransaction")
);
const Policy = lazy(
  () => import("../feautures/Admin/Task/Production/Policies/Policy")
);

const StatementAccount = lazy(
  () => import("../feautures/Admin/Task/Production/StatementAccount")
);

const About = lazy(() => import("../feautures/Admin/Help/About"));
const Index = lazy(() => import("../feautures/Admin/Help/Index"));
const Search = lazy(() => import("../feautures/Admin/Help/Search"));
const Content = lazy(() => import("../feautures/Admin/Help/Content"));
const VehiclePolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/Vehicle/VehiclePolicy"
    )
);
const FirePolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/Fire/FirePolicy"
    )
);
const MarinePolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/Marine/MarinePolicy"
    )
);
const BondsPolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/Bonds/BondsPolicy"
    )
);
const MSPRPolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/MSPR/MSPRPolicy"
    )
);
const PAPolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/PA/PAPolicy"
    )
);
const CGLPolicy = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/CGL/CGLPolicy"
    )
);

const PRODUCTION_REFERENCE = [
  <Route
    key="/dashboard/reference/branch"
    path="/dashboard/reference/branch"
    element={<Branch />}
  />,
  <Route
    key="/dashboard/reference/policy-account"
    path="/dashboard/reference/policy-account"
    element={<PolicyAccount />}
  />,
  <Route
    key="/dashboard/reference/sub-account"
    path="/dashboard/reference/sub-account"
    element={<SubAccount />}
  />,
  <Route
    key="/dashboard/reference/id-entry"
    path="/dashboard/reference/id-entry"
    element={<IDEntry />}
  />,
  <Route
    key="/dashboard/reference/mortgagee"
    path="/dashboard/reference/mortgagee"
    element={<Mortgagee />}
  />,
  <Route
    key="/dashboard/reference/booklet"
    path="/dashboard/reference/booklet"
    element={<Booklet />}
  />,
  <Route
    key="/dashboard/reference/subline"
    path="/dashboard/reference/subline"
    element={<Subline />}
  />,
  <Route
    key="/dashboard/reference/rates"
    path="/dashboard/reference/rates"
    element={<Rates />}
  />,
  <Route
    key="/dashboard/reference/ctpl"
    path="/dashboard/reference/ctpl"
    element={<CTPL />}
  />,
  <Route
    key="/dashboard/reference/petty-cash-transaction"
    path="/dashboard/reference/petty-cash-transaction"
    element={<PettyCashTransaction />}
  />,
];
const ACCOUNTING_REFERENCE = [
  <Route
    key="/dashboard/reference/branch"
    path="/dashboard/reference/branch"
    element={<Branch />}
  />,
  <Route
    key="/dashboard/reference/policy-account"
    path="/dashboard/reference/policy-account"
    element={<PolicyAccount />}
  />,
  <Route
    key="/dashboard/reference/bank"
    path="/dashboard/reference/bank"
    element={<Bank />}
  />,
  <Route
    key="/dashboard/reference/bank-account"
    path="/dashboard/reference/bank-account"
    element={<BankAccount />}
  />,
  <Route
    key="/dashboard/reference/chart-accounts"
    path="/dashboard/reference/chart-accounts"
    element={<ChartAccount />}
  />,
  <Route
    key="/dashboard/reference/sub-account"
    path="/dashboard/reference/sub-account"
    element={<SubAccount />}
  />,

  <Route
    key="/dashboard/reference/transaction-code"
    path="/dashboard/reference/transaction-code"
    element={<TransactionCode />}
  />,
  <Route
    key="/dashboard/reference/id-entry"
    path="/dashboard/reference/id-entry"
    element={<IDEntry />}
  />,
  <Route
    key="/dashboard/reference/mortgagee"
    path="/dashboard/reference/mortgagee"
    element={<Mortgagee />}
  />,
  <Route
    key="/dashboard/reference/subline"
    path="/dashboard/reference/subline"
    element={<Subline />}
  />,
  <Route
    key="/dashboard/reference/rates"
    path="/dashboard/reference/rates"
    element={<Rates />}
  />,
  <Route
    key="/dashboard/reference/ctpl"
    path="/dashboard/reference/ctpl"
    element={<CTPL />}
  />,
  <Route
    key="/dashboard/reference/petty-cash-transaction"
    path="/dashboard/reference/petty-cash-transaction"
    element={<PettyCashTransaction />}
  />,
];
const PRODUCTION_TASK = [
  <Route
    key={"/dashboard/task/production/policy"}
    path="/dashboard/task/production/policy"
    element={<Policy />}
  >
    <Route
      path="/dashboard/task/production/policy"
      element={<VehiclePolicy />}
    />
    <Route path="fire" element={<FirePolicy />} />
    <Route path="marine" element={<MarinePolicy />} />
    <Route path="bonds" element={<BondsPolicy />} />
    <Route path="mspr" element={<MSPRPolicy />} />
    <Route path="pa" element={<PAPolicy />} />
    <Route path="cgl" element={<CGLPolicy />} />
  </Route>,
  <Route
    key={"/dashboard/task/production/statement-of-account"}
    path="/dashboard/task/production/statement-of-account"
    element={<StatementAccount />}
  />,
];
const ACCOUNTING_TASK = [
  <Route
    key="/dashboard/task/accounting/production-id"
    path="/dashboard/task/accounting/production-id"
    element={<CashDisbursement />}
  />,
  <Route
    key="/dashboard/task/accounting/post-date-checks"
    path="/dashboard/task/accounting/post-date-checks"
    element={<PostDateChecks />}
  />,
  <Route
    key="/dashboard/task/accounting/collections"
    path="/dashboard/task/accounting/collections"
    element={<Collections />}
  />,
  <Route
    key="/dashboard/task/accounting/deposit"
    path="/dashboard/task/accounting/deposit"
    element={<Deposit />}
  />,
  <Route
    key="/dashboard/task/accounting/return-check"
    path="/dashboard/task/accounting/return-check"
    element={<ReturnCheck />}
  />,
  <Route
    key="/dashboard/task/accounting/petty-cash"
    path="/dashboard/task/accounting/petty-cash"
    element={<PettyCash />}
  />,
  <Route
    key="/dashboard/task/accounting/general-journal"
    path="/dashboard/task/accounting/general-journal"
    element={<GeneralJournal />}
  />,
  <Route
    key="/dashboard/task/accounting/cash-disbursement"
    path="/dashboard/task/accounting/cash-disbursement"
    element={<CashDisbursement />}
  />,
  <Route
    key="/dashboard/task/accounting/warehouse-checks"
    path="/dashboard/task/accounting/warehouse-checks"
    element={<Warehouse />}
  />,
  <Route
    key="/dashboard/task/accounting/monthly-accrual"
    path="/dashboard/task/accounting/monthly-accrual"
    element={<MonthlyAccrual />}
  />,
  <Route
    key="/dashboard/task/accounting/check-pullout"
    path="/dashboard/task/accounting/check-pullout"
    element={<CheckPullout />}
  />,
  <Route
    key="/dashboard/task/accounting/check-pullout-request"
    path="/dashboard/task/accounting/check-pullout-request"
    element={<CheckPulloutRequest />}
  />,
  <Route
    key="/dashboard/task/accounting/check-pullout-approved"
    path="/dashboard/task/accounting/check-pullout-approved"
    element={<CheckPulloutApproved />}
  />,
  <Route
    key="/dashboard/task/accounting/check-postponement"
    path="/dashboard/task/accounting/check-postponement"
    element={<ChekPostponement />}
  />,
  <Route
    key="/dashboard/task/accounting/check-postponement-request"
    path="/dashboard/task/accounting/check-postponement-request"
    element={<ChekPostponementRequest />}
  />,
  <Route
    key="/dashboard/task/accounting/check-postponement-approved"
    path="/dashboard/task/accounting/check-postponement-approved"
    element={<ChekPostponementApproved />}
  />,
  <Route
    key="/dashboard/task/accounting/closing-transaction"
    path="/dashboard/task/accounting/closing-transaction"
    element={<ClosingTransaction />}
  />,
  <Route
    key="/dashboard/task/accounting/nominal-closing"
    path="/dashboard/task/accounting/nominal-closing"
    element={<NominalClosing />}
  />,
];

const CLAIMS_REFERENCE: any = [];
const CLAIMS_TASK = [
  <Route
    key="/dashboard/task/claims/claims-id"
    path="/dashboard/task/claims/claims"
    element={<Claims />}
  />,
];
const ADMIN_REFERENCE = [...PRODUCTION_REFERENCE, ...ACCOUNTING_REFERENCE];

const ADMIN_TASK = [...PRODUCTION_TASK, ...ACCOUNTING_TASK, ...CLAIMS_TASK];

const PRODUCTION_ACCOUNTING_REFERENCE = [
  ...PRODUCTION_REFERENCE,
  ...ACCOUNTING_REFERENCE,
];
const PRODUCTION_ACCOUNTING_TASK = [...PRODUCTION_TASK, ...ACCOUNTING_TASK];

const ACCOUNTING_CHECKS_TASK = [
  <Route
    key="/dashboard/task/accounting/warehouse-checks"
    path="/dashboard/task/accounting/warehouse-checks"
    element={<Warehouse />}
  />,
  <Route
    key="/dashboard/task/accounting/check-pullout-request"
    path="/dashboard/task/accounting/check-pullout-request"
    element={<CheckPulloutRequest />}
  />,
  <Route
    key="/dashboard/task/accounting/check-pullout-approved"
    path="/dashboard/task/accounting/check-pullout-approved"
    element={<CheckPulloutApproved />}
  />,
  <Route
    key="/dashboard/task/accounting/check-postponement-request"
    path="/dashboard/task/accounting/check-postponement-request"
    element={<ChekPostponementRequest />}
  />,
  <Route
    key="/dashboard/task/accounting/check-postponement-approved"
    path="/dashboard/task/accounting/check-postponement-approved"
    element={<ChekPostponementApproved />}
  />,
];

export default function Routers() {
  const { user } = useContext(AuthContext);
  const REF_ROUTE: {
    PRODUCTION_REFERENCE: Array<JSX.Element>;
    ACCOUNTING_REFERENCE: Array<JSX.Element>;
    CLAIMS_REFERENCE: Array<JSX.Element>;
    ADMIN_REFERENCE: Array<JSX.Element>;
    PRODUCTION_ACCOUNTING_REFERENCE: Array<JSX.Element>;
  } = {
    PRODUCTION_REFERENCE,
    ACCOUNTING_REFERENCE,
    CLAIMS_REFERENCE,
    ADMIN_REFERENCE,
    PRODUCTION_ACCOUNTING_REFERENCE,
  };

  const TASK_ROUTE: {
    PRODUCTION_TASK: Array<JSX.Element>;
    ACCOUNTING_TASK: Array<JSX.Element>;
    CLAIMS_TASK: Array<JSX.Element>;
    ADMIN_TASK: Array<JSX.Element>;
    PRODUCTION_ACCOUNTING_TASK: Array<JSX.Element>;
    ACCOUNTING_CHECKS_TASK: Array<JSX.Element>;
  } = {
    PRODUCTION_TASK,
    ACCOUNTING_TASK,
    CLAIMS_TASK,
    ADMIN_TASK,
    PRODUCTION_ACCOUNTING_TASK,
    ACCOUNTING_CHECKS_TASK,
  };

  const reference =
    REF_ROUTE[
      `${user?.userAccess as string}_REFERENCE` as
        | "PRODUCTION_REFERENCE"
        | "ACCOUNTING_REFERENCE"
        | "CLAIMS_REFERENCE"
        | "ADMIN_REFERENCE"
        | "PRODUCTION_ACCOUNTING_REFERENCE"
    ];

  const task =
    TASK_ROUTE[
      `${user?.userAccess as string}_TASK` as
        | "PRODUCTION_TASK"
        | "ACCOUNTING_TASK"
        | "CLAIMS_TASK"
        | "ADMIN_TASK"
        | "PRODUCTION_ACCOUNTING_TASK"
        | "ACCOUNTING_CHECKS_TASK"
    ];
  if (user && (user?.is_master_admin as boolean)) {
    return (
      <Routes>
        <Route path="/" element={<RenderPage />}>
          <Route
            path="/master-admin-dashboard"
            element={<MasterAdminDashboard />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  if (user && (!user?.is_master_admin as boolean)) {
    return (
      <Routes>
        <Route path="/dashboard" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Reference */}
          {reference?.length > 0 &&
            reference.map((Route) => {
              return Route;
            })}
          {/* Task */}
          {task.map((Route) => {
            return Route;
          })}
          {/* Help */}
          <Route path="/dashboard/help/content" element={<Content />} />
          <Route path="/dashboard/help/search" element={<Search />} />
          <Route path="/dashboard/help/index" element={<Index />} />
          <Route path="/dashboard/help/about" element={<About />} />
        </Route>

        <Route path="/dashboard" element={<RenderPage />}>
          <Route path="/dashboard/print" element={<NavigatePrint />} />
        </Route>
        {/* Reports */}
        <Route path="/dashboard" element={<RenderPage />}>
          <Route
            path="/dashboard/reports/production/production-report"
            element={<ProductionReport />}
          />
          <Route
            path="/dashboard/reports/production/renewal-notice"
            element={<RenewalNoticeReport />}
          />
          <Route
            path="/dashboard/reports/accounting/accounting-reports"
            element={<AccountingReport />}
          />
        </Route>
        <Route path="/dashboard" element={<RenderPage />}>
          <Route
            path="/dashboard/templates/renewal-template"
            element={<RenewalTemplate />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RenderPage withHeader={false} />}>
        <Route index element={<LandingPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
