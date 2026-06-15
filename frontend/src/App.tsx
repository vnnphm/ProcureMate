import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/layout/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AuthProvider } from "./contexts/AuthContext"
import ApprovalQueue from "./pages/ApprovalQueue"
import Budget from "./pages/Budget"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import NewRequest from "./pages/NewRequest"
import PolicyAdmin from "./pages/PolicyAdmin"
import RequestDetail from "./pages/RequestDetail"
import RequestList from "./pages/RequestList"
import Vendors from "./pages/Vendors"

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/requests/new" element={<NewRequest />} />
                  <Route path="/requests/:id" element={<RequestDetail />} />
                  <Route path="/requests" element={<RequestList />} />
                  <Route path="/approvals" element={<ApprovalQueue />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/policies" element={<PolicyAdmin />} />
                  <Route path="*" element={<Navigate to="/requests" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
