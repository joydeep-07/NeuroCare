import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, InputAdornment } from "@mui/material";
import { MdEmail, MdPassword } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--card-bg)",
    borderRadius: "5px",
    color: "var(--text-main)",
    transition: "all .3s ease",

    "& fieldset": {
      borderColor: "var(--border-light)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "var(--accent-primary)",
      borderWidth: "2px",
    },

    "& input": {
      color: "var(--text-main)",
    },

    "& input::placeholder": {
      color: "var(--text-secondary)",
      opacity: 1,
    },
  },

  "& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--accent-primary)",
  },
};

const SignIn = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
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
    },
  });

  const email = watch("email");
  const otp = watch("otp");

  useEffect(() => {
    if (!otpSent) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const onSubmitEmail = async (data: { email: string }) => {
    try {
      setLoading(true);

      const res = await api.post(ENDPOINTS.AUTH.SEND_OTP, {
        email: data.email,
      });

      if (res.data.success) {
        setOtpSent(true);
        setTimeLeft(60);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

const onSubmitOtp = async (data: { otp: string }) => {
  try {
    setLoading(true);

    const res = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, {
      email,
      otp: data.otp,
    });

   if (res.data.success) {
     dispatch(
       login({
         token: res.data.token,
         user: res.data.user,
       }),
     );

     localStorage.setItem("email", email);

     alert("Login Successful");
     navigate("/");
   }
  } catch (error: any) {
    alert(error.response?.data?.message || "Invalid OTP.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center md:min-h-[80vh] p-4 md:p-6">
      <div className="w-full max-w-7xl md:h-[70vh] flex overflow-hidden rounded-2xl border border-[var(--border-light)]/50 shadow-2xl shadow-[var(--shadow)]">
        {/* Advertisement Section */}
        <div className="hidden md:flex w-2/6 items-center justify-center border-r border-[var(--border-light)]/50 bg-[var(--card-bg)]">
          <img className="w-sm rounded-lg" src="./poster.png" alt="" />
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-center bg-[var(--bg-secondary)] p-6 md:p-12">
          <div className="w-full h-full flex flex-col justify-between">
            <div>
              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-medium font-heading text-[var(--text-main)]">
                  {otpSent ? "Email Verification" : "Sign In"}
                </h1>

                <p className="mt-3 text-[var(--text-secondary)] max-w-sm text-xs leading-relaxed">
                  {otpSent ? (
                    <>
                      We've sent a secure 4 digit OTP to{" "}
                      <span className="font-medium text-[var(--accent-primary)]">
                        {email}
                      </span>
                      . Enter it to verify your Email.
                    </>
                  ) : (
                    "Sign in with your email address. We'll send a secure 4-digit OTP to verify your identity."
                  )}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {!otpSent ? (
                  <form onSubmit={handleSubmit(onSubmitEmail)}>
                    <div className="flex flex-col gap-3">
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
                            label="Enter your Email"
                            type="email"
                            onChange={(e) =>
                              field.onChange(e.target.value.toLowerCase())
                            }
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={textFieldStyles}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MdEmail className="text-xl text-[var(--accent-primary)]" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-sm bg-[var(--accent-primary)] py-3.5 font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitOtp)}>
                    <div className="flex flex-col gap-3">
                      <Controller
                        name="otp"
                        control={control}
                        rules={{
                          required: "OTP is required",
                          minLength: {
                            value: 4,
                            message: "OTP must be 4 digits",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Enter 4 Digit OTP"
                            placeholder="1234"
                            onChange={(e) => {
                              const sanitized = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);
                              field.onChange(sanitized);
                            }}
                            error={!!errors.otp}
                            helperText={errors.otp?.message}
                            sx={textFieldStyles}
                            inputProps={{
                              maxLength: 4,
                              inputMode: "numeric",
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MdPassword className="text-xl text-[var(--accent-primary)]" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-sm bg-[var(--accent-primary)] py-3.5 font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </button>
                    </div>
                    <div className="flex justify-between mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setValue("otp", "");
                        }}
                        className="text-sm font-normal text-[var(--accent-primary)]"
                      >
                        Change Email
                      </button>

                      {timeLeft > 0 ? (
                        <h5 className="text-xs text-[var(--text-secondary)]">
                          {timeLeft}s
                        </h5>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.post(ENDPOINTS.AUTH.SEND_OTP, {
                                email,
                              });

                              setTimeLeft(60);
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          className="text-sm font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div>
              {/* Divider */}
              <div className="relative my-8">
                <hr className="border-[var(--border-light)]" />

                <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-[var(--bg-secondary)] px-4 text-xs font-semibold tracking-widest text-[var(--text-secondary)]">
                  OR
                </span>
              </div>

              {/* Social Buttons */}
              <div className="w-full">
                <button
                  type="button"
                  className="group flex h-14 w-full items-center justify-center gap-3 rounded-sm border border-[var(--border-light)]/50 bg-[var(--card-bg)]/50 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <FcGoogle className="text-2xl" />
                  <span className="font-normal text-[var(--text-primary)]">
                    Continue with Google
                  </span>
                </button>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                {otpSent ? (
                  "You can also continue using one of the options below."
                ) : (
                  <>
                    A secure <span className="font-semibold">4-digit OTP</span>{" "}
                    will be sent to your email address.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
