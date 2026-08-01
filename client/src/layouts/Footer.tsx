import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
// import NewsLetter from "../Components/NewsLetter";

const Footer = () => {
  return (
    <section id="contact" className="z-50">
      <footer
        className="pt-12 pb-8 border-t"
        style={{
          background: "var(--footer-bg)",
          borderColor: "var(--border-light)",
          color: "var(--text-secondary)",
        }}
      >
        {/* Newsletter - Top on mobile, normal position on desktop */}
        <div className="block md:hidden px-4 sm:px-6 lg:px-8 mb-8">
          {/* <NewsLetter /> */}
        </div>

        <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <h1 className="font-heading text-xl tracking-tight">
              <span className="text-[var(--accent-primary)] font-heading">
                NEURO
              </span>
              <span
                className="font-heading"
                style={{ color: "var(--text-main)" }}
              >
                CARE
              </span>
            </h1>

            <p
              className="text-xs sm:text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Your trusted partner for easy and efficient medical appointment
              booking.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base tracking-wide"
              style={{ color: "var(--accent-primary)" }}
            >
              SERVICES
            </h4>

            <ul className="space-y-2 text-xs sm:text-xs">
              {[
                "Book Appointments",
                "Find Doctors",
                "Specialties",
                "Contact Support",
              ].map((item) => (
                <li key={item}>
                  <span
                    className="cursor-pointer transition-colors duration-300 hover:text-[var(--accent-primary)]"
                    style={{ color: "var(--text-main)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base tracking-wide"
              style={{ color: "var(--accent-primary)" }}
            >
              CONTACT
            </h4>

            <ul className="space-y-2 text-xs sm:text-xs">
              <li className="flex flex-wrap">
                <span
                  className="mr-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email:
                </span>

                <a
                  href="mailto:joydeeprnp8821@gmail.com"
                  className="transition-colors duration-300 hover:text-[var(--accent-primary)]"
                  style={{ color: "var(--text-main)" }}
                >
                  joydeeprnp8821@gmail.com
                </a>
              </li>

              <li className="flex flex-wrap">
                <span
                  className="mr-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Phone:
                </span>

                <a
                  href="tel:9635172639"
                  className="transition-colors duration-300 hover:text-[var(--accent-primary)]"
                  style={{ color: "var(--text-main)" }}
                >
                  9635172639
                </a>
              </li>

              <li className="flex flex-wrap">
                <span
                  className="mr-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Location:
                </span>

                <span
                  className="transition-colors duration-300 hover:text-[var(--accent-primary)]"
                  style={{ color: "var(--text-main)" }}
                >
                  Asansol, India
                </span>
              </li>
            </ul>
          </div>

          {/* Socials & Newsletter */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h4
                className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base tracking-wide"
                style={{ color: "var(--accent-primary)" }}
              >
                SOCIALS
              </h4>

              <div className="flex space-x-4 text-lg sm:text-xl">
                {[
                  {
                    icon: <FaGithub />,
                    url: "https://github.com/joydeep-07",
                    label: "GitHub",
                  },
                  {
                    icon: <FaLinkedin />,
                    url: "https://www.linkedin.com/in/joydeep-paul-06b37926a",
                    label: "LinkedIn",
                  },
                  {
                    icon: <FaFacebook />,
                    url: "https://www.facebook.com/joydeep.paul.568089",
                    label: "Facebook",
                  },
                  {
                    icon: <FaInstagram />,
                    url: "https://www.instagram.com/mr.paul_16",
                    label: "Instagram",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="transition-colors duration-300 hover:text-[var(--accent-primary)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter - Desktop */}
            <div className="hidden md:block mt-2 sm:mt-0">
              {/* <NewsLetter /> */}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-8 sm:mt-12 border-t pt-6 px-4 text-center text-xs sm:text-sm"
          style={{
            borderColor: "var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          © {new Date().getFullYear()} NeuroCare. All rights reserved.
        </div>
      </footer>
    </section>
  );
};

export default Footer;
