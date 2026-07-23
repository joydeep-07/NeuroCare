const BASE_URL = "http://localhost:5000/api";

export const ENDPOINTS = {
  // ==========================
  // Authentication
  // ==========================
  AUTH: {
    SEND_OTP: `${BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
    GOOGLE_LOGIN: `${BASE_URL}/auth/google`,
    GOOGLE_CALLBACK: `${BASE_URL}/auth/google/callback`,
    LOGOUT: `${BASE_URL}/auth/logout`,
  },

  // ==========================
  // Profile
  // ==========================
  PROFILE: {
    GET: `${BASE_URL}/profile`,
    COMPLETE: `${BASE_URL}/profile/complete`,
    UPDATE: `${BASE_URL}/profile/update`,
    DELETE: `${BASE_URL}/profile/delete`,
  },

  // ==========================
  // Family Members
  // ==========================
  MEMBER: {
    CREATE: `${BASE_URL}/members`,
    GET_ALL: `${BASE_URL}/members`,
    GET_BY_ID: (id: string) => `${BASE_URL}/members/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/members/${id}`,
    DELETE: (id: string) => `${BASE_URL}/members/${id}`,
  },

  // ==========================
  // Appointments
  // ==========================
  APPOINTMENT: {
    BOOK: `${BASE_URL}/appointments`,
    GET_ALL: `${BASE_URL}/appointments`,
    GET_BY_ID: (id: string) => `${BASE_URL}/appointments/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/appointments/${id}`,
    CANCEL: (id: string) => `${BASE_URL}/appointments/${id}/cancel`,
  },

  // ==========================
  // Doctors
  // ==========================
  DOCTOR: {
    GET_ALL: `${BASE_URL}/doctors`,
    GET_BY_ID: (id: string) => `${BASE_URL}/doctors/${id}`,
    GET_AVAILABLE: `${BASE_URL}/doctors/available`,
    SEARCH: `${BASE_URL}/doctors/search`,
  },

  // ==========================
  // Hospitals
  // ==========================
  HOSPITAL: {
    GET_ALL: `${BASE_URL}/hospitals`,
    GET_BY_ID: (id: string) => `${BASE_URL}/hospitals/${id}`,
  },

  // ==========================
  // Medical Reports
  // ==========================
  REPORT: {
    UPLOAD: `${BASE_URL}/reports/upload`,
    GET_ALL: `${BASE_URL}/reports`,
    DELETE: (id: string) => `${BASE_URL}/reports/${id}`,
  },

  // ==========================
  // Notifications
  // ==========================
  NOTIFICATION: {
    GET_ALL: `${BASE_URL}/notifications`,
    MARK_AS_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
  },

  // ==========================
  // Admin
  // ==========================
  ADMIN: {
    DASHBOARD: `${BASE_URL}/admin/dashboard`,
    USERS: `${BASE_URL}/admin/users`,
    DOCTORS: `${BASE_URL}/admin/doctors`,
    APPOINTMENTS: `${BASE_URL}/admin/appointments`,
  },
};

export default ENDPOINTS;
