(() => {
  const updateDeviceWidth = () => {
    // Screen width is in CSS pixels and does not grow when the page is zoomed out.
    const width = window.screen?.width || document.documentElement.clientWidth || window.innerWidth;
    document.documentElement.style.setProperty("--device-screen-width", `${width}px`);
  };

  updateDeviceWidth();
  window.addEventListener("resize", updateDeviceWidth, { passive: true });
  window.addEventListener("pageshow", updateDeviceWidth);
  window.screen?.orientation?.addEventListener("change", updateDeviceWidth);
})();
