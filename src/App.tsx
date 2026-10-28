import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

// Public Pages
import HomePage from '@/pages/public/HomePage'
import ProductsPage from '@/pages/public/ProductsPage'
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

// Responsibility: The main route table for the application.
export default function App() {
  return (
    <Routes>
      {/* PUBLIC CUSTOMER WEBSITE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
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
          <Route path="/staff/audit" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* 404 FALLBACK */}
      <Route 
        path="*" 
        element={
          <div className="flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
            <h1 className="text-3xl font-bold text-navy-900">404</h1>
            <p className="mt-2 text-lg font-medium text-slate-700">Page not found</p>
            <p className="mt-2 text-sm text-muted">The page you are looking for does not exist or has been moved.</p>
          </div>
        } 
      />
    </Routes>
  )
}