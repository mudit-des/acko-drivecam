import { Navigate, Route, Routes } from 'react-router-dom'
import HealthInsurancePage from './pages/HealthInsurancePage'
import StayPage from './pages/StayPage'
import AckoLandingPage from './pages/AckoLandingPage'
import DashCamPage from './pages/DashCamPage'
import DriveCamPage from './pages/DriveCamPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/drivecam" replace />} />
      <Route path="/stay" element={<StayPage />} />
      <Route path="/acko" element={<AckoLandingPage />} />
      <Route path="/drivecam" element={<DriveCamPage />} />
      {/* Old link, kept so URLs already shared still land on the page. */}
      <Route path="/drivecam-reveal" element={<Navigate to="/drivecam" replace />} />
      <Route path="/dash-cam"element={<DashCamPage />} />
      <Route path="/health-insurance"element={<HealthInsurancePage />} />
    </Routes>
  )
}

export default App
