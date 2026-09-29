import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";

import RequestFormPage from "../pages/requestSubmission/RequestFormPage";
import ConfirmationPage from "../pages/confirmation/ConfirmationPage";
import TrackingPage from "../pages/tracking/TrackingPage";
import ReopenPage from "../pages/reopen/ReopenPage";

import IntakePage from "../pages/intake/IntakePage";
import IntakeDetailPage from "../pages/intake/IntakeDetailPage";
import AssessmentListPage from "../pages/assessment/AssessmentListPage";
import AssessmentDetailPage from "../pages/assessment/AssessmentDetailPage";
import ApprovalsPage from "../pages/approvals/ApprovalsPage";
import ApprovalDetailPage from "../pages/approvals/ApprovalDetailPage";
import ArtisanTasksPage from "../pages/artisan/ArtisanTasksPage";
import ArtisanTaskDetailPage from "../pages/artisan/ArtisanTaskDetailPage";
import CleaningInspectionsPage from "../pages/cleaning/CleaningInspectionsPage";
import CleaningInspectionDetailPage from "../pages/cleaning/CleaningInspectionDetailPage";
import ContractorPage from "../pages/contractor/ContractorPage";
import ReportsPage from "../pages/reports/ReportsPage";

const ROLES = {
  OFFICER: "estates_officer",
  FIELD_SUPERVISOR: "field_supervisor",
  CLEANING_SUPERVISOR: "cleaning_supervisor",
  MANAGER: "estates_manager",
  ARTISAN: "artisan",
  CONTRACTOR_SUPERVISOR: "contractor_supervisor",
  SUPER_ADMIN: "super_admin",
};

const withAdmin = (...roles) => [...roles, ROLES.SUPER_ADMIN];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/request" replace />} />
      <Route path="/request" element={<RequestFormPage />} />
      <Route path="/confirm/:token" element={<ConfirmationPage />} />
      <Route path="/track" element={<TrackingPage />} />
      <Route path="/reopen/:token" element={<ReopenPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.OFFICER, ROLES.MANAGER)} />}>
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/intake/:requestId" element={<IntakeDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.FIELD_SUPERVISOR, ROLES.MANAGER)} />}>
            <Route path="/assessments" element={<AssessmentListPage />} />
            <Route path="/assessments/:requestId" element={<AssessmentDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.MANAGER)} />}>
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/approvals/:requestId" element={<ApprovalDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.ARTISAN)} />}>
            <Route path="/tasks" element={<ArtisanTasksPage />} />
            <Route path="/tasks/:requestId" element={<ArtisanTaskDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={withAdmin(ROLES.CLEANING_SUPERVISOR, ROLES.MANAGER)} />}>
            <Route path="/cleaning" element={<CleaningInspectionsPage />} />
            <Route path="/cleaning/:inspectionId" element={<CleaningInspectionDetailPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={withAdmin(ROLES.CONTRACTOR_SUPERVISOR, ROLES.CLEANING_SUPERVISOR, ROLES.MANAGER)}
              />
            }
          >
            <Route path="/contractor" element={<ContractorPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}