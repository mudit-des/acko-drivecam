import { Navigate, Route, Routes } from 'react-router-dom'
import HealthInsurancePage from './pages/HealthInsurancePage'
import StayPage from './pages/StayPage'
import AckoLandingPage from './pages/AckoLandingPage'
import DashCamPage from './pages/DashCamPage'
import DriveCamPage from './pages/DriveCamPage'
import DriveCamRevealPage from './pages/DriveCamRevealPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/stay" replace />} />
      <Route path="/stay" element={<StayPage />} />
      <Route path="/acko" element={<AckoLandingPage />} />
      <Route path="/drivecam" element={<DriveCamPage />} />
      <Route path="/drivecam-reveal" element={<DriveCamRevealPage />} />
      <Route path="/dash-cam"element={<DashCamPage />} />
      <Route path="/health-insurance"element={<HealthInsurancePage />} />
    </Routes>
  )
}

export default App
