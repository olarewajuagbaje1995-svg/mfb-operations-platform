import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

// Public Pages
import HomePage from '@/pages/public/HomePage'
import AboutPage from '@/pages/public/AboutPage'
import Management from '@/pages/public/Management'
import ProductsPage from '@/pages/public/ProductsPage'
import ProductDetailPage from '@/pages/public/products/ProductDetailPage'
import HowItWorksPage from '@/pages/public/HowItWorksPage'
import EligibilityPage from '@/pages/public/EligibilityPage'
import FAQPage from '@/pages/public/FAQPage'
import ContactPage from '@/pages/public/ContactPage'
import NotFoundPage from '@/pages/public/NotFoundPage'
import ApplyPage from '@/pages/public/ApplyPage'
import TrackPage from '@/pages/public/TrackPage'
import { SubmitComplaintPage, TrackComplaintPage } from '@/pages/public/ComplaintPages'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'

// Staff Pages
import OverviewPage from '@/pages/dashboard/OverviewPage'
import PipelinePage from '@/pages/staff/PipelinePage'
import ApplicationDetailPage from '@/pages/staff/ApplicationDetailPage'
import DocumentReview from '@/pages/staff/DocumentReview'
import ComplaintsBoard from '@/pages/staff/ComplaintsBoard'
import CreditAssessment from '@/pages/staff/CreditAssessment'
import SettingsPage from '@/pages/staff/SettingsPage'
import AuditLogsPage from '@/pages/staff/AuditLogsPage'
import ManagementTeamPage from '@/pages/staff/ManagementTeamPage'
import ProfilePage from '@/pages/staff/ProfilePage'

// Responsibility: the main route table for the application.
// Staff /staff/* routes and their logic are preserved unchanged.
export default function App() {
  return (
    <Routes>
      {/* PUBLIC CUSTOMER WEBSITE — CLOBAN FINANCE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/management" element={<Management />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/eligibility" element={<EligibilityPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/track" element={<TrackPage />} />

        {/* Complaints Portal Routes */}
        <Route path="/complaints" element={<SubmitComplaintPage />} />
        <Route path="/complaints/track" element={<TrackComplaintPage />} />
      </Route>

      {/* SECURE STAFF PORTAL */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<OverviewPage />} />
          <Route path="/staff/pipeline" element={<PipelinePage />} />
          <Route path="/staff/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/staff/applications/:id/documents" element={<DocumentReview />} />
          <Route path="/staff/applications/:id/assessment" element={<CreditAssessment />} />
          <Route path="/staff/complaints" element={<ComplaintsBoard />} />
          <Route path="/staff/settings" element={<SettingsPage />} />
          <Route path="/staff/loan-types" element={<Navigate to="/staff/settings" replace />} />
          <Route path="/staff/management" element={<ManagementTeamPage />} />
          <Route path="/staff/audit" element={<AuditLogsPage />} />
          <Route path="/staff/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
