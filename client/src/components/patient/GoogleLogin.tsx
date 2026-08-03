import { GoogleLogin as GoogleOAuthLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";
import { login } from "../../redux/authSlice";
import type { AppDispatch } from "../../redux/store";

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google did not return a sign-in token. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        credential: response.credential,
      });

      dispatch(login({ token: data.token, user: data.user }));
      if (data.user.role === "doctor") navigate("/doctor/dashboard");
      else if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (requestError: unknown) {
      const message = isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || "Google sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className={loading ? "pointer-events-none opacity-60" : ""}>
        <GoogleOAuthLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in was cancelled or the popup was closed. Please try again.")}
          text="continue_with"
          shape="rectangular"
        //   width="360"
        />
      </div>
      {loading && <p className="text-center text-xs text-[var(--text-secondary)]">Signing in with Google...</p>}
      {error && <p role="alert" className="text-center text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default GoogleLogin;
