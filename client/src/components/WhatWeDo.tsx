// import React from 'react'
import { SlSettings } from "react-icons/sl";
import { FiChevronRight } from "react-icons/fi";

const WhatWeDo = () => {
  return (
    <div className="md:px-12 px-4 pt-20 pb-16">
     

      <div className="relative z-10 max-w-3xl">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 "
          style={{
            color: "var(--accent-primary)",
          }}
        >
          <SlSettings size={14} /> Certified Specialists
        </span>
        <h1
          className="text-3xl md:text-5xl font-light mb-6 leading-tight"
          style={{ color: "var(--text-main)" }}
        >
          Our Medical Services
        </h1>
      </div>

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
  );
};

export default WhatWeDo;
