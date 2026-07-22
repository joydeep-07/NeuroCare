import { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { MdEmail, MdPassword } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { Mail } from "lucide-react";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--card-bg)",
    borderRadius: "5px",
    color: "var(--text-main)",
    transition: "all .3s ease",

    "& fieldset": {
      borderColor: "var(--border-light)",
    },

    "&:hover fieldset": {
      borderColor: "var(--accent-primary)",
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
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="flex justify-center items-center md:min-h-[80vh] p-4 md:p-6">
      <div className="w-full max-w-7xl md:h-[70vh] flex overflow-hidden rounded-2xl border border-[var(--border-light)] shadow-2xl shadow-[var(--shadow)]">
        {/* Advertisement Section */}
        <div className="hidden md:flex w-2/5 items-center justify-center border-r border-[var(--border-light)] bg-[var(--card-bg)]">
          ADVERTISEMENT
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-center bg-[var(--bg-secondary)] p-6 md:p-12">
          <div className="w-full h-full flex flex-col justify-between">
            <div>
              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-medium font-heading text-[var(--text-main)]">
                  {otpSent ? "Verify OTP" : "Sign In"}
                </h1>

                <p className="mt-3 text-[var(--text-secondary)] max-w-sm text-xs leading-relaxed">
                  {otpSent ? (
                    <>
                      We've sent a secure 4-digit OTP to{" "}
                      <span className="font-medium text-[var(--accent-primary)]">
                        {email}
                      </span>
                      . Enter it to continue.
                    </>
                  ) : (
                    "Sign in with your email address. We'll send a secure 4-digit OTP to verify your identity."
                  )}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {!otpSent ? (
                  <>
                    <div className="flex flex-col gap-3">
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={textFieldStyles}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdEmail className="text-xl text-[var(--accent-primary)]" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <button
                        onClick={() => setOtpSent(true)}
                        className="w-full cursor-pointer rounded-sm bg-[var(--accent-primary)] py-3.5 font-semibold text-white shadow-lg transition-all duration-300"
                      >
                        Send OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex flex-col gap-3">
                      <TextField
                        fullWidth
                        label="Enter 4 Digit OTP"
                        placeholder="1234"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
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

                      <button className="w-full cursor-pointer rounded-sm bg-[var(--accent-primary)] py-3.5 font-semibold text-white shadow-lg transition-all duration-300">
                        Verify & Sign In
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-sm font-normal text-[var(--accent-primary)]"
                    >
                      Change Email
                    </button>
                  </>
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
                <button className="group flex h-14 w-full items-center justify-center gap-3 rounded-sm border border-[var(--border-light)]/50 bg-[var(--card-bg)]/50 transition-all duration-300 hover:shadow-md cursor-pointer">
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
