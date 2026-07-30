// import React from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiChevronRight } from "react-icons/fi";
// import DoctorSearch from "./patient/DoctorSearch";
import AllDoctors from "../components/AllDoctors";

const Home = () => {
  return (
    <>
      <div
        className="min-h-screen font-sans transition-colors duration-300"
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)",
        }}
      >
        {/* Navbar */}
        <nav className="hidden md:flex items-center justify-between px-6 md:px-12 py-4 text-sm transition-colors duration-300">
          <div className="flex items-center gap-8">
            <div className="px-3 py-1 flex justify-center items-center gap-3 font-bold tracking-wider rounded-sm text-sm">
              <FiPhone style={{ color: "var(--accent-primary)" }} />
              <h1>Emergency Contact </h1>
              <span>+91 9064547381</span>
            </div>
          </div>

          <div>
            <Link
              to="/doctors"
              className="px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
              }}
            >
              Make an Appointment
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="main md:px-12 px-4 py-8">
          <div className="top flex flex-col lg:flex-row justify-between items-start lg:items-center pb-8 gap-6">
            <div className="left">
              <h1
                className="text-4xl md:text-6xl max-w-xl font-light tracking-tight leading-tight"
                style={{ color: "var(--text-main)" }}
              >
                Personalized Care For Every Patient
              </h1>
            </div>
            <div className="right flex flex-col items-start lg:items-end">
              <p
                className="max-w-xs text-xs mb-4 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                We are here to support you on your health journey, offering
                guidance, treatment, and resources to help you achieve your best
                health.
              </p>
              <Link
                className="text-xs font-medium flex items-center gap-1 hover:underline transition-all"
                style={{ color: "var(--accent-primary)" }}
                to={"/doctors"}
              >
                Our Services <span className="text-xs">↗</span>
              </Link>
            </div>
          </div>

          {/* Hero Image with Floating Cards */}
          <div className="relative w-full">
            <img
              className="w-full h-[260px] sm:h-[360px] md:h-[580px] object-cover object-top rounded-lg shadow-lg"
              src="ban.jpg"
              alt="Doctor and Patient consultation"
            />

            {/* Floating Action Cards */}
            <div className="relative mt-4 grid grid-cols-1 gap-4 md:absolute md:-bottom-16 md:left-8 md:right-8 md:mt-0 md:grid-cols-3">
              <div
                className="p-5 rounded-lg border flex justify-between items-start transition-all shadow-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <div>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    Comprehensive Services
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    We ensure that every aspect of your medical care is
                    coordinated efficiently.
                  </p>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--accent-primary)" }}
                >
                  ↗
                </span>
              </div>

              <div
                className="p-5 rounded-lg border flex justify-between items-start transition-all shadow-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <div>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    Schedule Your Appointment
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    By adopting the latest technologies, refining our processes,
                    & investing in staff training.
                  </p>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--accent-primary)" }}
                >
                  ↗
                </span>
              </div>

              <div
                className="p-5 rounded-lg border flex justify-between items-start transition-all shadow-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <div>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    Consult Our Doctors
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    We pride on delivering exceptional healthcare through our
                    unparalleled expertise.
                  </p>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--accent-primary)" }}
                >
                  ↗
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section Preview */}
        <div className="md:px-12 px-4 pt-20 pb-16">
          <div
            className="text-xs uppercase tracking-wider mb-2 font-medium"
            style={{ color: "var(--accent-primary)" }}
          >
            ⚙ What We Do
          </div>
          <h2
            className="text-3xl font-light mb-10"
            style={{ color: "var(--text-main)" }}
          >
            Our Medical Services
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Services Menu list */}
            <div
              className="flex flex-col border-t"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div
                className="py-4 border-b flex justify-between items-center text-sm font-medium px-3 transition-colors"
                style={{
                  backgroundColor: "var(--surface-hover)",
                  borderColor: "var(--border-light)",
                  color: "var(--text-main)",
                }}
              >
                Emergency Care
              </div>
              <div
                className="py-4 border-b flex justify-between items-center text-sm px-3 cursor-pointer transition-colors hover:opacity-100 opacity-80"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Operation Theater <FiChevronRight size={16} />
              </div>
              <div
                className="py-4 border-b flex justify-between items-center text-sm px-3 cursor-pointer transition-colors hover:opacity-100 opacity-80"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Pharmacy
              </div>
              <div
                className="py-4 border-b flex justify-between items-center text-sm px-3 cursor-pointer transition-colors hover:opacity-100 opacity-80"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Geriatric Care
              </div>
              <div
                className="py-4 border-b flex justify-between items-center text-sm px-3 cursor-pointer transition-colors hover:opacity-100 opacity-80"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Diagnostic Excellence
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="rounded-lg p-4 flex flex-col justify-between border transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400"
                  alt="Radiation Oncology"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-main)" }}
                  >
                    Radiation Oncology
                  </span>
                  <span
                    className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                    style={{
                      borderColor: "var(--border-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    →
                  </span>
                </div>
              </div>

              <div
                className="rounded-lg p-4 flex flex-col justify-between border transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400"
                  alt="Surgical Services"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-main)" }}
                  >
                    Surgical Services
                  </span>
                  <span
                    className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                    style={{
                      borderColor: "var(--border-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    →
                  </span>
                </div>
              </div>

              <div
                className="rounded-lg p-4 flex flex-col justify-between border transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400"
                  alt="Physical Therapy"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-main)" }}
                  >
                    Physical Therapy
                  </span>
                  <span
                    className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                    style={{
                      borderColor: "var(--border-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AllDoctors />
    </>
  );
};

export default Home;
