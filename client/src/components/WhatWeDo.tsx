// WhatWeDo.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlSettings } from "react-icons/sl";
import { FiChevronRight, FiArrowRight, FiX, FiClock } from "react-icons/fi";
import { gsap } from "gsap";
import { servicesData, categories } from "../data/servicesData";
import { type ServiceItem } from "../types/services";

const WhatWeDo: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState<string>("Emergency Care");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );

  const activeIndicatorRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const currentCategoryElement = categoryRefs.current[activeCategory];
    if (currentCategoryElement && activeIndicatorRef.current) {
      gsap.to(activeIndicatorRef.current, {
        y: currentCategoryElement.offsetTop,
        height: currentCategoryElement.offsetHeight,
        duration: 0.2,
        ease: "easeInOut",
      });
    }
  }, [activeCategory]);

  return (
    <div
      className="md:px-12 px-4 pt-20 pb-16 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      {/* Sleek Header Section */}
      <div className="relative z-10 max-w-3xl mb-12">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-md"
          style={{
            color: "var(--accent-primary)",
          }}
        >
          <SlSettings size={14} /> Certified Specialists
        </span>
        <h1
          className="text-3xl md:text-5xl font-light tracking-tight leading-tight"
          style={{ color: "var(--text-main)" }}
        >
          Our Medical Services
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Dynamic Left Menu */}
        <div className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-visible scrollbar-none rounded-lg relative">
          {/* GSAP Sliding Indicator Background */}
          <div
            ref={activeIndicatorRef}
            className="hidden lg:block absolute left-0 w-full pointer-events-none border-l-3 rounded-l-lg border-[var(--accent-primary)]/50 z-0"
          />

          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <div
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                onClick={() => setActiveCategory(category)}
                className={`py-4 flex justify-between items-center text-sm px-4 cursor-pointer transition-colors whitespace-nowrap lg:whitespace-normal group relative z-10 ${
                  isActive
                    ? "font-semibold"
                    : "font-normal opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor:
                    window.innerWidth < 1024 && isActive
                      ? "var(--surface-hover)"
                      : "transparent",
                  borderColor: "var(--border-light)",
                  color: isActive
                    ? "var(--text-main)"
                    : "var(--text-secondary)",
                  borderLeftWidth:
                    window.innerWidth < 1024 && isActive ? "3px" : "0px",
                  borderLeftColor:
                    window.innerWidth < 1024 && isActive
                      ? "var(--accent-primary)"
                      : "transparent",
                }}
              >
                <span>{category}</span>
                <span className="hidden lg:inline-block">
                  <FiChevronRight
                    size={16}
                    className={`transition-all duration-200 ${
                      isActive
                        ? "opacity-100 translate-x-0.5"
                        : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    }`}
                    style={{
                      color: isActive
                        ? "var(--accent-primary)"
                        : "var(--text-secondary)",
                    }}
                  />
                </span>
              </div>
            );
          })}
        </div>

        {/* Sleek Service Cards Grid (No Hover Effects, Minimalist Transition) */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {servicesData[activeCategory].map((service) => (
                <div
                  key={service.title}
                  onClick={() => setSelectedService(service)}
                  className="rounded-xl p-4 flex flex-col justify-between border cursor-pointer group relative backdrop-blur-sm"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  <div>
                    <div className="relative overflow-hidden rounded-lg mb-4 h-44 w-full">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider mb-2 px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "var(--surface-hover)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <FiClock size={10} /> {service.duration}
                    </span>
                    <h3
                      className="text-base font-medium mb-1.5"
                      style={{ color: "var(--text-main)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed line-clamp-2 mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {service.shortDescription}
                    </p>
                  </div>

                  <div
                    className="pt-3 flex items-center justify-between border-t"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <span
                      className="text-xs font-medium tracking-wide flex items-center gap-1"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      View Details
                    </span>
                    <div
                      className="w-7 h-7 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: "var(--border-light)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <FiArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Left-Side Drawer Component */}
      <AnimatePresence>
        {selectedService && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20"
            />

            {/* Left Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg shadow-2xl flex flex-col border-r"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-light)",
              }}
            >
              {/* Drawer Header */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span
                  className="text-sm font-semibold uppercase tracking-wider px-2.5"
                  style={{
                    color: "var(--accent-primary)",
                  }}
                >
                  Service Information
                </span>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:opacity-80"
                  style={{
                    borderColor: "var(--border-light)",
                    color: "var(--text-main)",
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                <div
                  className="relative h-56 w-full rounded-xl overflow-hidden border"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-medium flex items-center gap-1 px-3 py-1 rounded"
                      style={{
                        backgroundColor: "var(--surface-hover)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <FiClock size={11} /> {selectedService.duration}
                    </span>
                  </div>
                  <h2
                    className="text-2xl font-light tracking-tight mb-3"
                    style={{ color: "var(--text-main)" }}
                  >
                    {selectedService.title}
                  </h2>
                  <p
                    className="text-sm font-medium leading-relaxed mb-4"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {selectedService.shortDescription}
                  </p>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedService.description}
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl border space-y-2"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-main)" }}
                  >
                    Clinical Standard
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    All procedures under this category adhere strictly to
                    international neuro-care safety protocols, monitored
                    continuously by certified clinical leads.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div
                className="p-6 border-t flex items-center gap-4"
                style={{ borderColor: "var(--border-light)" }}
              >
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-full py-3 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#ffffff",
                  }}
                >
                  Book Consultation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatWeDo;
