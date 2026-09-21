const sharedQsa = (selector) => Array.from(document.querySelectorAll(selector));

if ("IntersectionObserver" in window) {
  const sharedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      sharedObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  sharedQsa(".reveal").forEach((node) => sharedObserver.observe(node));
} else {
  sharedQsa(".reveal").forEach((node) => node.classList.add("is-visible"));
}
