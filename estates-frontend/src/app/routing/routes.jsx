import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES, withAdmin } from "./roles";
import Layout from "../components/layout/Layout";

import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

import RequestFormPage from "../pages/requestSubmission/RequestFormPage";
import ConfirmationPage from "../pages/confirmation/ConfirmationPage";
import TrackingPage from "../pages/tracking/TrackingPage";

import TriageQueuePage from "../pages/triage/TriageQueuePage";
import TriageDetailPage from "../pages/triage/TriageDetailPage";
import WorkbenchPage from "../pages/workbench/WorkbenchPage";
import WorkbenchDetailPage from "../pages/workbench/WorkbenchDetailPage";
import ManagerConsolePage from "../pages/manager/ManagerConsolePage";
import ManagerRequestPage from "../pages/manager/ManagerRequestPage";

import ArtisanTaskPage from "../pages/artisan/ArtisanTaskPage";
import CleaningOversightPage from "../pages/cleaning/CleaningOversightPage";
import CleaningInspectionPage from "../pages/cleaning/CleaningInspectionPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import ReferenceDataPage from "../pages/admin/ReferenceDataPage";
import ReportsPage from "../pages/reports/ReportsPage";
import ContractorPortalPage from "../pages/contractor/ContractorPortalPage";
import PublicLayout from "../components/layout/PublicLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ArtisanTasklistPage from "../pages/artisan/ArtisanTaskListPage";
import InspectionFormPage from "../pages/cleaning/InspectionFormPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/request" replace />} />
      <Route element={<PublicLayout />}>
        <Route path="/request" element={<RequestFormPage />} />
        <Route path="/confirm/:token" element={<ConfirmationPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.OFFICER)} />}>
            <Route path="/triage" element={<TriageQueuePage />} />
            <Route path="/triage/:requestId" element={<TriageDetailPage />} />
          </Route>
          

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.FIELD_SUPERVISOR)} />}>
            <Route path="/workbench" element={<WorkbenchPage />} />
            <Route path="/workbench/:requestId" element={<WorkbenchDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.MANAGER)} />}>
            <Route path="/manager" element={<ManagerConsolePage />} />
            <Route path="/manager/:requestId" element={<ManagerRequestPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.ARTISAN)} />}>
            <Route path="/tasks" element={<ArtisanTasklistPage />} />
            <Route path="/tasks/:requestId" element={<ArtisanTaskPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.CLEANING_SUPERVISOR)} />}>
            <Route path="/cleaning" element={<CleaningOversightPage />} />
            <Route path="/cleaning/new" element={<InspectionFormPage />} />
            <Route path="/cleaning/:inspectionId" element={<CleaningInspectionPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin()} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.MANAGER)} />}>
            <Route path="/admin/reference-data" element={<ReferenceDataPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.CONTRACTOR_SUPERVISOR)} />}>
            <Route path="/contractor" element={<ContractorPortalPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}