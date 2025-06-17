import { lazy, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { RenderPage } from "./Layout";
import Layout from "./Layout";
import NotFoundPage from "../feautures/NotFoundPage";

const NotFoundPageLazy = lazy(() => import("../feautures/NotFoundPage"));
const MasterAdminDashboard = lazy(
  () => import("../feautures/MasterAdminDashboard")
);
const DisplayReport = lazy(() => import("../feautures/Admin/Reports/Report"));
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
const CareOf = lazy(() => import("../feautures/Admin/Reference/CareOf"));
const PettyCashTransaction = lazy(
  () => import("../feautures/Admin/Reference/PettyCashTransaction")
);
const Policy = lazy(
  () => import("../feautures/Admin/Task/Production/Policies/Policy")
);

const StatementAccount = lazy(
  () => import("../feautures/Admin/Task/Production/StatementAccount")
);
const RenewalNotice = lazy(
  () => import("../feautures/Admin/Task/Production/RenewalNotice")
);

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

const TEMPTOREG = lazy(
  () =>
    import(
      "../feautures/Admin/Task/Production/Policies/PolicyComponent/Vehicle/TempToRegular"
    )
);

export default function Routers() {
  const { user } = useContext(AuthContext);
  const department = process.env.REACT_APP_DEPARTMENT;

  const PRODUCTION_REFERENCE = [
    <Route
      key={`/${department}/dashboard/reference/branch`}
      path={`/${department}/dashboard/reference/branch`}
      element={<Branch />}
    />,
    <Route
      key={`/${department}/dashboard/reference/policy-account`}
      path={`/${department}/dashboard/reference/policy-account`}
      element={<PolicyAccount />}
    />,
    <Route
      key={`/${department}/dashboard/reference/sub-account`}
      path={`/${department}/dashboard/reference/sub-account`}
      element={<SubAccount />}
    />,
    <Route
      key={`/${department}/dashboard/reference/id-entry`}
      path={`/${department}/dashboard/reference/id-entry`}
      element={<IDEntry />}
    />,
    <Route
      key={`/${department}/dashboard/reference/mortgagee`}
      path={`/${department}/dashboard/reference/mortgagee`}
      element={<Mortgagee />}
    />,
    <Route
      key={`/${department}/dashboard/reference/booklet`}
      path={`/${department}/dashboard/reference/booklet`}
      element={<Booklet />}
    />,
    <Route
      key={`/${department}/dashboard/reference/subline`}
      path={`/${department}/dashboard/reference/subline`}
      element={<Subline />}
    />,
    <Route
      key={`/${department}/dashboard/reference/rates`}
      path={`/${department}/dashboard/reference/rates`}
      element={<Rates />}
    />,
    <Route
      key={`/${department}/dashboard/reference/ctpl`}
      path={`/${department}/dashboard/reference/ctpl`}
      element={<CTPL />}
    />,
    <Route
      key={`/${department}/dashboard/reference/petty-cash-transaction`}
      path={`/${department}/dashboard/reference/petty-cash-transaction`}
      element={<PettyCashTransaction />}
    />,
    <Route
      key={`/${department}/dashboard/reference/care-of`}
      path={`/${department}/dashboard/reference/care-of`}
      element={<CareOf />}
    />,
  ];
  const ACCOUNTING_REFERENCE = [
    <Route
      key={`/${department}/dashboard/reference/branch`}
      path={`/${department}/dashboard/reference/branch`}
      element={<Branch />}
    />,
    <Route
      key={`/${department}/dashboard/reference/policy-account`}
      path={`/${department}/dashboard/reference/policy-account`}
      element={<PolicyAccount />}
    />,
    <Route
      key={`/${department}/dashboard/reference/bank`}
      path={`/${department}/dashboard/reference/bank`}
      element={<Bank />}
    />,
    <Route
      key={`/${department}/dashboard/reference/bank-account`}
      path={`/${department}/dashboard/reference/bank-account`}
      element={<BankAccount />}
    />,
    <Route
      key={`/${department}/dashboard/reference/chart-accounts`}
      path={`/${department}/dashboard/reference/chart-accounts`}
      element={<ChartAccount />}
    />,
    <Route
      key={`/${department}/dashboard/reference/sub-account`}
      path={`/${department}/dashboard/reference/sub-account`}
      element={<SubAccount />}
    />,

    <Route
      key={`/${department}/dashboard/reference/transaction-code`}
      path={`/${department}/dashboard/reference/transaction-code`}
      element={<TransactionCode />}
    />,
    <Route
      key={`/${department}/dashboard/reference/id-entry`}
      path={`/${department}/dashboard/reference/id-entry`}
      element={<IDEntry />}
    />,
    <Route
      key={`/${department}/dashboard/reference/mortgagee`}
      path={`/${department}/dashboard/reference/mortgagee`}
      element={<Mortgagee />}
    />,
    <Route
      key={`/${department}/dashboard/reference/subline`}
      path={`/${department}/dashboard/reference/subline`}
      element={<Subline />}
    />,
    <Route
      key={`/${department}/dashboard/reference/rates`}
      path={`/${department}/dashboard/reference/rates`}
      element={<Rates />}
    />,
    <Route
      key={`/${department}/dashboard/reference/ctpl`}
      path={`/${department}/dashboard/reference/ctpl`}
      element={<CTPL />}
    />,
    <Route
      key={`/${department}/dashboard/reference/petty-cash-transaction`}
      path={`/${department}/dashboard/reference/petty-cash-transaction`}
      element={<PettyCashTransaction />}
    />,
    <Route
      key={`/${department}/dashboard/reference/care-of`}
      path={`/${department}/dashboard/reference/care-of`}
      element={<CareOf />}
    />,
  ];
  const PRODUCTION_TASK = [
    <Route
      key={`/${department}/dashboard/task/production/policy`}
      path={`/${department}/dashboard/task/production/policy`}
      element={<Policy />}
    >
      <Route
        path={`/${department}/dashboard/task/production/policy`}
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
      key={`/${department}/dashboard/task/production/statement-of-account`}
      path={`/${department}/dashboard/task/production/statement-of-account`}
      element={<StatementAccount />}
    />,
    <Route
      key={`/${department}/dashboard/task/production/renewal-notice`}
      path={`/${department}/dashboard/task/production/renewal-notice`}
      element={<RenewalNotice />}
    />,
  ];
  const ACCOUNTING_TASK = [
    <Route
      key={`/${department}/dashboard/task/accounting/production-id`}
      path={`/${department}/dashboard/task/accounting/production-id`}
      element={<CashDisbursement />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/post-date-checks`}
      path={`/${department}/dashboard/task/accounting/post-date-checks`}
      element={<PostDateChecks />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/collections`}
      path={`/${department}/dashboard/task/accounting/collections`}
      element={<Collections />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/deposit`}
      path={`/${department}/dashboard/task/accounting/deposit`}
      element={<Deposit />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/return-check`}
      path={`/${department}/dashboard/task/accounting/return-check`}
      element={<ReturnCheck />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/petty-cash`}
      path={`/${department}/dashboard/task/accounting/petty-cash`}
      element={<PettyCash />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/general-journal`}
      path={`/${department}/dashboard/task/accounting/general-journal`}
      element={<GeneralJournal />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/cash-disbursement`}
      path={`/${department}/dashboard/task/accounting/cash-disbursement`}
      element={<CashDisbursement />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/warehouse-checks`}
      path={`/${department}/dashboard/task/accounting/warehouse-checks`}
      element={<Warehouse />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/monthly-accrual`}
      path={`/${department}/dashboard/task/accounting/monthly-accrual`}
      element={<MonthlyAccrual />}
    />,

    <Route
      key={`/${department}/dashboard/task/accounting/check-pullout-request`}
      path={`/${department}/dashboard/task/accounting/check-pullout-request`}
      element={<CheckPulloutRequest />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-pullout-approved`}
      path={`/${department}/dashboard/task/accounting/check-pullout-approved`}
      element={<CheckPulloutApproved />}
    />,

    <Route
      key={`/${department}/dashboard/task/accounting/check-postponement-request`}
      path={`/${department}/dashboard/task/accounting/check-postponement-request`}
      element={<ChekPostponementRequest />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-postponement-approved`}
      path={`/${department}/dashboard/task/accounting/check-postponement-approved`}
      element={<ChekPostponementApproved />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/closing-transaction`}
      path={`/${department}/dashboard/task/accounting/closing-transaction`}
      element={<ClosingTransaction />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/nominal-closing`}
      path={`/${department}/dashboard/task/accounting/nominal-closing`}
      element={<NominalClosing />}
    />,
  ];

  const CLAIMS_REFERENCE: any = [];
  const CLAIMS_TASK = [
    <Route
      key={`/${department}/dashboard/task/claims/claims-id`}
      path={`/${department}/dashboard/task/claims/claims`}
      element={<Claims />}
    />,
  ];
  const ADMIN_REFERENCE = [...PRODUCTION_REFERENCE, ...ACCOUNTING_REFERENCE];

  const ADMIN_TASK = [...PRODUCTION_TASK, ...ACCOUNTING_TASK, ...CLAIMS_TASK];

  const PRODUCTION_ACCOUNTING_REFERENCE = [
    ...PRODUCTION_REFERENCE,
    ...ACCOUNTING_REFERENCE,
  ];
  const PRODUCTION_ACCOUNTING_TASK = [
    ...PRODUCTION_TASK,
    ...ACCOUNTING_TASK,

    // epal
    ...CLAIMS_TASK,
  ];

  const ACCOUNTING_CHECKS_TASK = [
    <Route
      key={`/${department}/dashboard/task/accounting/warehouse-checks`}
      path={`/${department}/dashboard/task/accounting/warehouse-checks`}
      element={<Warehouse />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-pullout-request`}
      path={`/${department}/dashboard/task/accounting/check-pullout-request`}
      element={<CheckPulloutRequest />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-pullout-approved`}
      path={`/${department}/dashboard/task/accounting/check-pullout-approved`}
      element={<CheckPulloutApproved />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-postponement-request`}
      path={`/${department}/dashboard/task/accounting/check-postponement-request`}
      element={<ChekPostponementRequest />}
    />,
    <Route
      key={`/${department}/dashboard/task/accounting/check-postponement-approved`}
      path={`/${department}/dashboard/task/accounting/check-postponement-approved`}
      element={<ChekPostponementApproved />}
    />,
  ];

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
        <Route path={`/${department}/dashboard`} element={<Layout />}>
          {department === "UMIS" ? (
            <Route path={`/${department}/dashboard`} element={<Dashboard />} />
          ) : (
            <Route
              path={`/${department}/dashboard`}
              element={<NotFoundPageLazy isLazy={true} />}
            />
          )}

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
          {/* <Route path="/dashboard/help/content" element={<Content />} />
          <Route path="/dashboard/help/search" element={<Search />} />
          <Route path="/dashboard/help/index" element={<Index />} />
          <Route path="/dashboard/help/about" element={<About />} /> */}
        </Route>

        <Route
          path={`/${department}/dashboard/temp-to-regular`}
          element={<TEMPTOREG />}
        />

        <Route
          path={`/${department}/dashboard/report`}
          element={<DisplayReport />}
        />

        {/* Reports */}
        <Route path={`/${department}/dashboard`} element={<RenderPage />}>
          <Route
            path={`/${department}/dashboard/reports/production/production-report`}
            element={<ProductionReport />}
          />
          <Route
            path={`/${department}/dashboard/reports/production/renewal-notice`}
            element={<RenewalNoticeReport />}
          />
          <Route
            path={`/${department}/dashboard/reports/accounting/accounting-reports`}
            element={<AccountingReport />}
          />
        </Route>
        <Route path={`/${department}/dashboard`} element={<RenderPage />}>
          <Route
            path={`/${department}/dashboard/templates/renewal-template`}
            element={<RenewalTemplate />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path={`/${department}/login`}
        element={<RenderPage withHeader={false} />}
      >
        <Route index element={<LandingPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
