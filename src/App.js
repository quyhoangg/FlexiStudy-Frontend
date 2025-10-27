import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login/Login";
import HomePage from "./pages/HomePage/HomePage";
import UserLayout from "./pages/layout/UserLayout";
import Jobs from "./pages/Job/Jobs";
import AppliedJobs from "./pages/Job/AppliedJobs";
import { getMyInfo } from "./redux/userSlice";
import CVGuide from "./pages/CV/CVGuide";
import Schedule from "./pages/Schedules/Schedule";
import AdminLayout from "./pages/layout/AdminLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/UserManagement/UserManagement";
import CompanyManagement from "./pages/CompanyManagement/CompanyManagement";
import Register from "./pages/Register/Register";
import EditProfile from "./pages/EditProfile/EditProfile";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import RoleRoute from "./components/RoleRoute/RoleRoute";
import { ROLE } from "./utils/constants";
import JobMangement from "./pages/ManagementJob/JobManagement";
import FormOnboard from "./pages/FormOnboard/FormOnboard";
import JobDetailPage from "./pages/Job/JobDetailPage/JobDetailPage";
import SavedMyJob from "./pages/SavedJobPage/SavedJobPage";
import SavedJobPage from "./pages/SavedJobPage/SavedJobPage";
import MyCV from "./pages/MyCVPage/MyCV";
import Authenticate from "./pages/Authenticate/Authenticate";
import VerifyOtp from "./pages/Authenticate/VerifyOtp";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import VerifyForgotOtpPage from "./pages/ForgotPasswordPage/VerifyForgotOtpPage";
import ResetPasswordPage from "./pages/ForgotPasswordPage/ResetPasswordPage";
import SetPasswordPage from "./pages/Authenticate/SetPasswordPage";
import { resetUser } from "./redux/userSlice";
import JobByCategory from "./pages/JobByCategory/JobByCategory";
import NewsManagement from "./pages/NewsManagement/NewsManagement";
import NewsPage from "./pages/NewsPage/NewsPage";
import NewsDetailPage from "./pages/NewsPage/DetailPage/NewsDetailPage";
import RecruiterLayout from "./pages/layout/RecruiterLayout";
import RecruiterDashboard from "./pages/DashboardRe/RecruiterDashboard";
import JobRecruiter from "./pages/JobRecruiter/JobRecruiter";
import NewJobRecruiter from "./pages/NewJobRecruiter.jsx/NewJobRecruiter";
import JobApplicantRecruiter from "./pages/JobApplicantRecruiter/CandidateManage";
import CandidateManage from "./pages/JobApplicantRecruiter/CandidateManage";
import CompanyRecruiter from "./pages/ManageCompanyRecruiter/CompanyRecruiter";
import UpgradeAccountPage from "./pages/Upgrade/UpgradeAccountPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import VnpayPaymentPage from "./pages/Payment/VnpayPaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentATMPage from "./pages/Payment/PaymentATMPage";
import VerifyCompany from "./pages/VerifyCompany/VerifyCompany";
import ApplicationRecruiter from "./pages/ApplicationRecruiter/ApplicationRecruiter";
import ChatbotPage from "./pages/ChatBot/ChatbotPage";

const route = createBrowserRouter([
  {
    path: "/",
    element: <RoleRoute allowedRoles={[ROLE.USER, ROLE.ADMIN]} />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "jobs", element: <Jobs /> },
          { path: "jobs/saved", element: <SavedJobPage /> },
          { path: "jobs/applied", element: <AppliedJobs /> },
          { path: "cv/guide", element: <CVGuide /> },
          { path: "cv/upload", element: <MyCV /> },
          { path: "schedule", element: <Schedule /> },
          { path: "profile", element: <EditProfile /> },
          { path: "onboard", element: <FormOnboard /> },
          { path: "jobs/:jobId", element: <JobDetailPage /> },
          { path: "jobs/category/:category", element: <JobByCategory /> },
          { path: "news", element: <NewsPage /> },
          { path: "news/:id", element: <NewsDetailPage /> },
          { path: "upgrade", element: <UpgradeAccountPage /> },
          { path: "/payment", element: <PaymentPage /> },
          { path: "/payment/vnpay", element: <VnpayPaymentPage /> },
          { path: "/payment/success", element: <PaymentSuccessPage /> },
          { path: "/payment/cancel", element: <PaymentPage /> },
          { path: "/payment/atm", element: <PaymentATMPage /> },
          { path: "chat", element: <ChatbotPage /> },
        ],
      },
    ],
  },
  {
    path: "/recruiter",
    element: <RoleRoute allowedRoles={[ROLE.RECRUITER, ROLE.ADMIN]} />,
    children: [
      {
        element: <RecruiterLayout />,
        children: [
          { index: true, element: <RecruiterDashboard /> },
          { path: "jobs-recruiter", element: <JobRecruiter /> },
          { path: "jobs/new", element: <NewJobRecruiter /> },
          { path: "candidates", element: <CandidateManage /> },
          { path: "company", element: <CompanyRecruiter /> },
          {
            path: "jobs/:jobId/applicants",
            element: <ApplicationRecruiter />,
          },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/authenticate", element: <Authenticate /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/verify-forgot-otp", element: <VerifyForgotOtpPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/set-password", element: <SetPasswordPage /> },
  {
    path: "/admin",
    element: <RoleRoute allowedRoles={[ROLE.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "manage-users", element: <UserManagement /> },
          { path: "manage-companies", element: <CompanyManagement /> },
          { path: "manage-jobs", element: <JobMangement /> },
          { path: "manage-career-guide", element: <NewsManagement /> },
          { path: "Verify-info-company", element: <VerifyCompany /> },
        ],
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          await dispatch(getMyInfo()).unwrap();
        } catch (err) {
          console.warn("❌ Failed to load user info:", err);
          localStorage.removeItem("accessToken");
          dispatch(resetUser());
        }
      }
      setAppReady(true);
    };
    initApp();
  }, [dispatch]);

  if (!appReady) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        Đang tải ứng dụng...
      </div>
    );
  }

  return <RouterProvider router={route} />;
};
export default App;
