const scrollToSection = (id: string, offset: number = 0): void => {
  const element = document.getElementById(id);

  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
};

export default scrollToSection;
