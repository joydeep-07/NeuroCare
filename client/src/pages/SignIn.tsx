import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, InputAdornment } from "@mui/material";
import { MdEmail, MdPassword, MdLock } from "react-icons/md";
import { UserCheck, Stethoscope, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import GoogleLogin from "../components/patient/GoogleLogin";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--card-bg)",
    borderRadius: "12px",
    color: "var(--text-main)",
    transition: "all .3s ease",
    "& fieldset": { borderColor: "var(--border-light)" },
    "&.Mui-focused fieldset": { borderColor: "var(--accent-primary)", borderWidth: "2px" },
    "& input": { color: "var(--text-main)" },
  },
  "& .MuiInputLabel-root": { color: "var(--text-secondary)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--accent-primary)" },
};

const SignIn = () => {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor" | "admin">("patient");
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      otp: "",
      password: "",
    },
  });

  const email = watch("email");

  useEffect(() => {
    setOtpSent(false);
    setErrorMsg("");
    setStatusMsg("");
    setValue("otp", "");
    setValue("password", "");
  }, [activeTab, setValue]);

  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const onSubmitEmail = async (data: { email: string }) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(ENDPOINTS.AUTH.SEND_OTP, {
        email: data.email,
        role: activeTab,
      });

      if (res.data.success) {
        setOtpSent(true);
        setTimeLeft(60);
        setStatusMsg(res.data.message);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data: { otp: string }) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp: data.otp,
        targetRole: activeTab,
      });

      if (res.data.success) {
        dispatch(
          login({
            token: res.data.token,
            user: res.data.user,
          })
        );

        if (res.data.user.role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (res.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAdminPassword = async (data: { email: string; password?: string }) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(`${ENDPOINTS.AUTH.SEND_OTP.replace('/send-otp', '')}/admin/login`, {
        email: data.email,
        password: data.password,
      });

      if (res.data.success) {
        dispatch(
          login({
            token: res.data.token,
            user: res.data.user,
          })
        );
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Admin authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 min-h-[85vh]">
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-3xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-2xl">
        <div className="md:w-5/12 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="font-heading text-2xl font-bold tracking-tight">NeuroCare</h2>
            </div>
            <h1 className="text-3xl md:text-3xl font-bold leading-tight font-heading mb-4">
              Centralized Healthcare Ecosystem
            </h1>
            <p className="text-cyan-200/80 text-sm leading-relaxed">
              Empowering patients, certified medical practitioners, and hospital administrators with AI-driven clinical workflow automation.
            </p>
          </div>
          <div className="mt-12 pt-6 border-t border-cyan-500/20 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">System Status: Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-10 flex flex-col justify-between">
          <div>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-sm bg-[var(--bg-main)] border border-[var(--border-light)] mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("patient")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm text-xs font-semibold transition-all ${
                  activeTab === "patient"
                    ? "bg-[var(--accent-primary)] text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                }`}
              >
                <UserCheck size={16} /> Patient
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("doctor")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm text-xs font-semibold transition-all ${
                  activeTab === "doctor"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                }`}
              >
                <Stethoscope size={16} /> Doctor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm text-xs font-semibold transition-all ${
                  activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                }`}
              >
                <ShieldCheck size={16} /> Admin
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading text-[var(--text-main)]">
                {activeTab === "patient" && (otpSent ? "Enter Verification Code" : "Patient Portal Sign In")}
                {activeTab === "doctor" && (otpSent ? "Doctor Identity Verification" : "Doctor Authentication")}
                {activeTab === "admin" && "Administrator Sign In"}
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {activeTab === "patient" && "Sign in with your email. We'll send a single-use 4-digit verification code."}
                {activeTab === "doctor" && "Doctors authenticate using Email OTP only. Your account must be pre-created by Admin."}
                {activeTab === "admin" && "Sign in with system administrator credentials (Default: admin@neurocare.com / Admin@123)."}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {errorMsg}
              </div>
            )}
            {statusMsg && !errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                {statusMsg}
              </div>
            )}

            {(activeTab === "patient" || activeTab === "doctor") && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSubmit(onSubmitEmail)} className=" flex flex-col gap-3">
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Registered Email Address"
                          type="email"
                          onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          sx={textFieldStyles}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MdEmail className="text-xl text-[var(--accent-primary)]" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all ${
                        activeTab === "doctor" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[var(--accent-primary)] hover:opacity-90"
                      } disabled:opacity-50`}
                    >
                      {loading ? "Sending Verification Code..." : "Send Verification OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitOtp)} className="space-y-4">
                    <Controller
                      name="otp"
                      control={control}
                      rules={{
                        required: "OTP is required",
                        minLength: { value: 4, message: "OTP must be 4 digits" },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Enter 4-Digit Verification Code"
                          placeholder="1234"
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          error={!!errors.otp}
                          helperText={errors.otp?.message}
                          sx={textFieldStyles}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MdPassword className="text-xl text-[var(--accent-primary)]" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify OTP & Continue"}
                    </button>

                    <div className="flex justify-between items-center text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[var(--accent-primary)] hover:underline font-medium"
                      >
                        ← Change Email
                      </button>

                      {timeLeft > 0 ? (
                        <span className="text-[var(--text-secondary)]">Resend code in {timeLeft}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubmit(onSubmitEmail)()}
                          className="text-[var(--accent-primary)] font-semibold hover:underline"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === "admin" && (
              <form onSubmit={handleSubmit(onSubmitAdminPassword)} className="flex flex-col gap-3">
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Admin email is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Admin Email"
                      type="email"
                      onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      sx={textFieldStyles}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdEmail className="text-xl text-amber-500" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Admin Secret Password"
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={textFieldStyles}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdLock className="text-xl text-amber-500" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Authenticating Admin..." : "Sign In to Admin Portal"}
                </button>
              </form>
            )}
          </div>

          {activeTab === "patient" && !otpSent && (
            <div className="mt-8 pt-6 border-t border-[var(--border-light)]">
              <GoogleLogin/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
