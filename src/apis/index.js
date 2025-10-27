import api from "../services/api";

//  - Auth API -
export const loginAPI = async (username, password) => {
  const res = await api.post("auth/token", { username, password });
  return res.data;
};

export const registerAPI = async (username, password) => {
  const res = await api.post("users/register", { username, password });
  return res.data;
};

export const registerRecruiterAPI = async (payload) => {
  const res = await api.post("hr/register", payload);
  return res.data;
};

export const createPasswordAPI = async (password) => {
  const res = await api.post("users/create-password", { password });
  return res.data;
};

export const getMyInfoAPI = async () => {
  const res = await api.get("users/myInfo");
  return res.data;
};

export const logOutAPI = async () => {
  const response = await api.post("auth/logout", {
    token: localStorage.getItem("accessToken"),
  });
  return response.data;
};

export const refreshTokenAPI = async (oldToken) => {
  const res = await api.post("auth/refresh", { token: oldToken });
  return res.data;
};

//  - User API -
export const onboardAPI = async (payload) => {
  const res = await api.post("profile", payload);
  return res.data;
};

export const updateUserAPI = async (id, payload) => {
  const res = await api.put(`users/${id}`, payload);
  console.log("updateUserAPI -> res", res);
  return res.data;
};

export const createUserAPI = async (payload) => {
  const res = await api.post("users", payload);
  return res.data;
};

export const deleteUserAPI = async (id) => {
  const res = await api.delete(`users/${id}`);
  return res.data;
};

export const getAllUsersAPI = async (
  paramsOrPage = 1,
  size = 10,
  extra = {}
) => {
  const params =
    typeof paramsOrPage === "object"
      ? paramsOrPage
      : { page: paramsOrPage, size, ...extra };

  const res = await api.get("users", { params });
  return res.data;
};

// apis/userApi.js
export const uploadAvatarAPI = (userId, formData) => {
  return api.post(`users/avatar/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// - Company API -
export const createCompanyAPI = async (payload) => {
  const res = await api.post("companies", payload);
  return res.data;
};

export const getAllCompaniesAPI = async ({
  page = 1,
  size = 10,
  search = "",
}) => {
  const res = await api.get(`/companies`, {
    params: {
      page,
      size,
      ...(search && { search }),
    },
  });
  return res.data;
};

export const getCompanyByIdAPI = async (companyId) => {
  const res = await api.get(`companies/${companyId}`);
  return res.data;
};

export const updateCompanyAPI = async (companyId, payload) => {
  const res = await api.put(`companies/${companyId}`, payload);
  return res.data;
};

export const deleteCompanyAPI = async (companyId) => {
  const res = await api.delete(`companies/${companyId}`);
  return res.data;
};

export const getJobsByCompanyAPI = async (companyId) => {
  const res = await api.get(`companies/jobs/${companyId}`);
  return res.data;
};

export const uploadCompanyLogoAPI = (companyId, formData) => {
  return api.post(`companies/upload-logo/${companyId}`, formData);
};

export const approveCompanyAPI = async (companyId, note) => {
  const res = await api.post(`companies/verify/approve/${companyId}`, null, {
    params: note ? { note } : {},
  });
  console.log(res);
  return res.data;
};

export const rejectCompanyAPI = async (companyId, reason) => {
  const res = await api.post(`companies/verify/reject/${companyId}`, null, {
    params: { reason },
  });
  return res.data;
};

// API upload tài liệu xác minh
export const uploadVerificationImageAPI = async (companyId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      `companies/verification-image/${companyId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error uploading verification image:", error);
    throw error;
  }
};

//  - Job API -
export const getAllJobsAPI = async (params) => {
  const res = await api.get("jobs", { params });
  return res.data;
};

export const getAllJobsAdminAPI = async (params) => {
  const res = await api.get(`jobs/admin`, { params });
  return res.data;
};

// Lấy danh sách job trong 30 ngày gần nhất (phân trang)
export const getRecentJobsAPI = async ({
  page = 1,
  size = 8,
  search = "",
  city = "",
}) => {
  const res = await api.get(`jobs`, {
    params: { page, size, ...(search && { search }), city },
  });
  return res.data;
};

//  Lấy danh sách job theo category
export const getJobsByCategoryAPI = async (params) => {
  const res = await api.get(`jobs/by-category`, { params });
  return res.data;
};

export const getJobByIdAPI = async (jobId) => {
  const res = await api.get(`jobs/${jobId}`);
  return res.data;
};

export const createJobAPI = async (payload) => {
  const res = await api.post(`jobs`, payload);
  return res.data;
};

export const updateJobAPI = async (jobId, payload) => {
  const res = await api.put(`jobs/${jobId}`, payload);
  return res.data;
};

export const deleteJobAPI = async (jobId) => {
  const res = await api.delete(`jobs/${jobId}`);
  return res.data;
};

export const getJobCategoriesAPI = async () => {
  const res = await api.get(`jobs/categories`);
  return res.data;
};

// - SKill API -
export const suggestSkillAPI = async (keyword) => {
  const res = await api.get(
    `skills/suggest?keyword=${encodeURIComponent(keyword)}`
  );
  return res.data;
};

// - Application API -

export const uploadCvAPI = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("uploads/cv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { result: "cvUrl", message: "CV uploaded successfully" }
};
export const getApplicationsByUserAPI = async (userId) => {
  const res = await api.get(`applications/user/${userId}`);
  return res.data.result;
};

// Lấy tất cả application của recruiter (company)
export const getApplicationsForMyCompanyAPI = async () => {
  const res = await api.get("applications/my-company");
  return res.data.result;
};

// Lấy application theo companyId (public cho admin hoặc recruiter khác)
export const getApplicationsByCompanyAPI = async (companyId) => {
  const res = await api.get(`applications/company/${companyId}`);
  return res.data.result;
};

//  Application API
export const getApplicationsByJobAPI = async (jobId) => {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data;
};

// Lấy chi tiết 1 application
export const getApplicationByIdAPI = async (id) => {
  const res = await api.get(`applications/${id}`);
  return res.data.result;
};

// Cập nhật status (REVIEWING → ACCEPTED / REJECTED)
export const updateApplicationStatusAPI = async (id, status) => {
  const res = await api.patch(
    `applications/${id}`,
    { status },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.result;
};

// Xóa application (admin hoặc user hủy)
export const deleteApplicationAPI = async (id) => {
  const res = await api.delete(`applications/${id}`);
  return res.data;
};

// Tạo Application (nộp hồ sơ)
export const createApplicationAPI = async (payload) => {
  const res = await api.post("applications", payload);
  return res.data; // { result: ApplicationResponse }
};

// - Saved Job API -
export const checkSavedJobAPI = async (jobId) => {
  const res = await api.get(`saved-job/check/${jobId}`);
  return res.data.result; // true hoặc false
};

// Lưu job
export const saveJobAPI = async (jobId) => {
  const res = await api.post(`saved-job/${jobId}`);
  return res.data;
};

// Bỏ lưu job
export const unsaveJobAPI = async (jobId) => {
  const res = await api.delete(`saved-job/${jobId}`);
  return res.data;
};

// Lấy danh sách job đã lưu
export const getSavedJobsAPI = async () => {
  const res = await api.get("saved-job");

  let data = res.data;
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  return data.result || [];
};

// - Profile API -
export const getMyProfileAPI = async () => {
  const res = await api.get("profile/me");
  return res.data;
};

export const updateMyProfileAPI = async (payload) => {
  const res = await api.put("profile/me", payload);
  return res.data;
};

//  - News API -
// Tạo bài viết mới
export const createNewsAPI = async (payload) => {
  const res = await api.post(`news`, payload);
  return res.data;
};

// Cập nhật bài viết
export const updateNewsAPI = async (newsId, payload) => {
  const res = await api.put(`news/${newsId}`, payload);
  return res.data;
};

// Xóa bài viết
export const deleteNewsAPI = async (newsId) => {
  const res = await api.delete(`news/${newsId}`);
  return res.data;
};

// Lấy bài viết theo ID
export const getNewsByIdAPI = async (newsId) => {
  const res = await api.get(`news/${newsId}`);
  return res.data;
};

// Lấy danh sách tất cả bài viết (có tìm kiếm + lọc trạng thái)
export const getAllNewsAPI = async (params) => {
  const res = await api.get("news", { params });
  return res.data;
};

// Upload hình ảnh cho bài viết
export const uploadNewsImageAPI = (newsId, formData) => {
  return api.post(`news/upload-image/${newsId}`, formData);
};

// - CV API -
export const uploadforMyCVAPI = async (formData) => {
  const res = await api.post("cv/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getUserCvsAPI = async () => {
  const res = await api.get("cv");
  return res.data;
};

export const deleteCvAPI = async (cvId) => {
  const res = await api.delete(`cv/${cvId}`);
  return res.data;
};

export const setPrimaryCvAPI = async (cvId) => {
  const res = await api.put(`cv/${cvId}/primary`);
  return res.data;
};

// - AVAILABILITY WINDOW API -

// Tạo mới availability window
export const createAvailabilityWindowAPI = async (payload) => {
  const res = await api.post("availability-windows", payload);
  return res.data;
};

// Cập nhật availability window theo id
export const updateAvailabilityWindowAPI = async (id, payload) => {
  const res = await api.patch(`availability-windows/${id}`, payload);
  return res.data;
};

// Lấy thông tin chi tiết theo id
export const getAvailabilityWindowByIdAPI = async (id) => {
  const res = await api.get(`availability-windows/${id}`);
  return res.data;
};

// Lấy tất cả availability windows theo userId
export const getAvailabilityWindowsByUserAPI = async (userId) => {
  const res = await api.get(`availability-windows/user/${userId}`);
  return res.data;
};

// Xóa availability window theo id
export const deleteAvailabilityWindowAPI = async (id) => {
  const res = await api.delete(`availability-windows/${id}`);
  return res.data;
};
//  - Upgrade Plan API -
export const getAllUpgradePlansAPI = async () => {
  const res = await api.get("upgrade");
  return res.data;
};

export const getUpgradePlanByIdAPI = async (id) => {
  const res = await api.get(`upgrade/${id}`);
  return res.data;
};

export const createUpgradePlanAPI = async (payload) => {
  const res = await api.post("upgrade", payload);
  return res.data;
};

export const updateUpgradePlanAPI = async (id, payload) => {
  const res = await api.put(`upgrade/${id}`, payload);
  return res.data;
};

export const deleteUpgradePlanAPI = async (id) => {
  const res = await api.delete(`upgrade/${id}`);
  return res.data;
};

export const upgradeUserPlanAPI = async (planId) => {
  const res = await api.post(`upgrade/activate/${planId}`);
  return res.data;
};

// - Payment API -
export const createPayOSPaymentAPI = async (payload) => {
  const res = await api.post("payments/create", {
    orderCode: payload.orderId,
    amount: payload.amount,
    description: payload.description,
    cancelUrl: "http://localhost:3000/payment/cancel",
    returnUrl: "http://localhost:3000/payment/success",
  });
  return res;
};
// - Payment Callback API -
export const handlePaymentCallbackAPI = async (payload) => {
  const res = await api.post("payments/callback", payload);
  return res.data;
};

export const rollbackPaymentAPI = async (payload) => {
  // payload = { orderCode, status: "failed" } hoặc { orderCode, status: "success" }
  const res = await api.post("payments/callback", payload);
  return res.data;
};

// - Job Matching -
export const matchJobsAPI = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await api.get("/jobs/match/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// - Chatbot API -
export const chatAPI = async (prompt) => {
  const res = await api.post("/chat", { prompt });
  return res.data;
};