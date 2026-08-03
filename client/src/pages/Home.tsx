// import React from "react";
import { FiPhone } from "react-icons/fi";
// import DoctorSearch from "./patient/DoctorSearch";
import AllDoctors from "../components/AllDoctors";
import scrollToSection from "../hooks/scrollToSection";
import WhatWeDo from "../components/WhatWeDo";
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
        <div className="px-2 md:px-12 md:py-4 py-2">
          <nav
            className="flex items-center justify-between text-sm transition-colors duration-300
             bg-[var(--accent-secondary)]/20 md:bg-transparent
             border border-[var(--border-light)]/50 md:border-none
             rounded-full"
          >
            <div className="flex items-center gap-8">
              <div className="py-1 px-2  flex justify-center items-center gap-3 font-normal  tracking-wider rounded-sm text-xs md:text-sm">
                <FiPhone style={{ color: "var(--accent-primary)" }} />
                <h1>Emergency : +91 9064547381 </h1>
              </div>
            </div>

            <div>
              <button
                onClick={() => scrollToSection("doctors", 40)}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#ffffff",
                }}
              >
                Make an Appointment
              </button>
            </div>
          </nav>
        </div>

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
              <button
                className="text-xs font-medium flex items-center gap-1 hover:underline transition-all"
                style={{ color: "var(--accent-primary)" }}
                onClick={() => scrollToSection("services", 10)}
              >
                Our Services <span className="text-xs">↗</span>
              </button>
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
            <div className="relative mt-4 grid grid-cols-1 gap-4 md:absolute md:-bottom-4 md:left-8 md:right-8 md:mt-0 md:grid-cols-3">
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
        <div id="doctors">
          <AllDoctors />
        </div>
        <div id="services">
          <WhatWeDo />
        </div>
      </div>
    </>
  );
};

export default Home;
