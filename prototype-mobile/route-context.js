(() => {
  document.body.classList.add("wow-route-context");

  const rewriteUrl = (rawUrl) => {
    if (!rawUrl || rawUrl.startsWith("#") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:")) return rawUrl;

    const url = new URL(rawUrl, window.location.href);
    if (url.origin !== window.location.origin) return rawUrl;

    // Route normalization must not strip directories from downloadable media.
    if (!url.pathname.endsWith(".html")) return rawUrl;

    url.searchParams.delete("view");

    return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
  };

  const rewriteLink = (link) => {
    const href = link.getAttribute("href");
    const nextHref = rewriteUrl(href);
    if (nextHref && nextHref !== href) link.setAttribute("href", `./${nextHref}`);
  };

  const rewriteTree = (root) => {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.matches?.("a[href]")) rewriteLink(root);
    root.querySelectorAll?.("a[href]").forEach(rewriteLink);
  };

  rewriteTree(document);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach(rewriteTree));
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
