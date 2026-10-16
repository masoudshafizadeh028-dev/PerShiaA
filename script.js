// Interactions for the static PerShiaA site. No account or server-side state is involved.
document.addEventListener("DOMContentLoaded", () => {
  const mindmapModal = document.getElementById("mindmap-modal");
  const searchModal = document.getElementById("search-modal");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let activeModal = null;
  let returnFocus = null;

  function closeModal(restoreFocus = true) {
    if (!activeModal) return;
    activeModal.classList.remove("active");
    activeModal.hidden = true;
    activeModal.setAttribute("aria-hidden", "true");
    activeModal = null;
    document.body.classList.remove("modal-open");
    document.querySelectorAll("body > header, body > main, body > footer").forEach((region) => {
      region.inert = false;
    });
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }

  function openModal(modal) {
    if (activeModal === modal) return;
    const opener = activeModal ? returnFocus : document.activeElement;
    if (activeModal) closeModal(false);
    returnFocus = opener;
    activeModal = modal;
    modal.hidden = false;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.querySelectorAll("body > header, body > main, body > footer").forEach((region) => {
      region.inert = true;
    });
    (modal === searchModal ? searchInput : modal.querySelector(".close-btn")).focus();
  }

  document.querySelectorAll(".open-mindmap").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(mindmapModal);
    });
  });
  document.querySelectorAll(".open-search").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(searchModal);
    });
  });
  document.getElementById("close-mindmap").addEventListener("click", () => closeModal());
  document.getElementById("close-search").addEventListener("click", () => closeModal());
  [mindmapModal, searchModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        openModal(searchModal);
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        openModal(mindmapModal);
      }
    }
    if (event.key === "Escape" && activeModal) {
      event.preventDefault();
      closeModal();
    }
    if (event.key !== "Tab" || !activeModal) return;
    const focusable = [
      ...activeModal.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'),
    ].filter((element) => !element.disabled && !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || !activeModal.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !activeModal.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  });

  // Index the actual visible page content, rather than maintaining a second, stale list.
  const searchableContent = [
    ...[...document.querySelectorAll(".card")].map((card) => ({
      title: card.querySelector("h3").textContent.trim(),
      text: card.querySelector("p").textContent.trim(),
      link: `#${card.id}`,
      category: "محورهای محتوایی",
    })),
    ...[...document.querySelectorAll(".roadmap-card")].map((card) => ({
      title: `${card.querySelector(".phase-number").textContent.trim()}: ${card.querySelector("h3").textContent.trim()}`,
      text: `${card.querySelector("p").textContent.trim()} ${card.querySelector(".roadmap-list").textContent.trim()}`,
      link: `#${card.id}`,
      category: "نقشه راه جامع",
    })),
    ...["upgrade-center", "about"].map((id) => {
      const section = document.getElementById(id);
      return {
        title: section.querySelector("h2").textContent.trim(),
        text: section.querySelector(".lead, p:not(.eyebrow)").textContent.trim(),
        link: `#${id}`,
        category: id === "about" ? "درباره" : "سامانه ارتقاء",
      };
    }),
  ];

  function normalize(text) {
    return text
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u064b-\u065f\u0670]/g, "")
      .replace(/[\u200c\u200d]/g, " ")
      .replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10))
      .replace(/(^|[^\d])0+(\d+)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderSearch() {
    const query = normalize(searchInput.value);
    searchResults.replaceChildren();
    const matches = query
      ? searchableContent.filter((item) => normalize(`${item.title} ${item.text}`).includes(query))
      : [];
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = query ? "نتیجه‌ای یافت نشد." : "عبارت مورد نظر خود را تایپ کنید...";
      searchResults.appendChild(empty);
      return;
    }
    matches.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.link;
      link.className = "search-item";
      for (const [className, text] of [
        ["search-tag", item.category],
        ["search-title", item.title],
        ["search-desc", item.text],
      ]) {
        const child = document.createElement("div");
        child.className = className;
        child.textContent = text;
        link.appendChild(child);
      }
      link.addEventListener("click", () => {
        closeModal(false);
        const destination = document.getElementById(item.link.slice(1));
        if (destination.hidden) document.querySelector('[data-filter="all"]').click();
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
        destination.addEventListener("blur", () => destination.removeAttribute("tabindex"), {
          once: true,
        });
      });
      searchResults.appendChild(link);
    });
  }
  searchInput.addEventListener("input", renderSearch);

  // Filter roadmap phases without losing their natural display/layout.
  const filterBtns = document.querySelectorAll(".roadmap-filter-btn");
  const roadmapCards = document.querySelectorAll(".roadmap-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((other) => {
        other.classList.toggle("active", other === btn);
        other.setAttribute("aria-pressed", String(other === btn));
      });
      roadmapCards.forEach((card) => {
        card.hidden = btn.dataset.filter !== "all" && card.dataset.status !== btn.dataset.filter;
      });
    });
  });

  const mindNodes = document.querySelectorAll(".mm-node");
  const detailBox = document.getElementById("mindmap-details");
  mindNodes.forEach((node) => {
    node.addEventListener("click", () => {
      mindNodes.forEach((other) => {
        other.classList.toggle("selected", other === node);
        other.setAttribute("aria-pressed", String(other === node));
      });
      detailBox.replaceChildren();
      const bold = document.createElement("b");
      bold.textContent = `${node.dataset.title}: `;
      detailBox.append(bold, document.createTextNode(node.dataset.desc));
    });
  });

  // This checklist is personal and local; it is not the project's public roadmap.
  const upgradeItems = document.querySelectorAll(".upgrade-checkbox");
  const totalProgressFill = document.getElementById("total-progress-fill");
  const totalProgressPercent = document.getElementById("total-progress-percent");
  const totalMilestoneCount = document.getElementById("total-milestone-count");
  const progressBar = document.getElementById("upgrade-progress");

  function updateUpgradeStats() {
    const completed = [...upgradeItems].filter((checkbox) => checkbox.checked).length;
    const total = upgradeItems.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;
    totalProgressFill.style.width = `${percentage}%`;
    totalProgressPercent.textContent = `${percentage.toLocaleString("fa-IR")}٪`;
    totalMilestoneCount.textContent = `${completed.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")} گام تکمیل شده`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
  }

  upgradeItems.forEach((checkbox) => {
    try {
      const saved = localStorage.getItem(`pershiaa_upgrade_${checkbox.id}`);
      if (saved === "true" || saved === "false") checkbox.checked = saved === "true";
    } catch {
      // Private browsing or blocked storage: keep the defaults and allow interaction.
    }
    checkbox.addEventListener("change", () => {
      try {
        localStorage.setItem(`pershiaa_upgrade_${checkbox.id}`, String(checkbox.checked));
      } catch {
        // The in-page checklist still works when storage is unavailable.
      }
      updateUpgradeStats();
    });
  });
  updateUpgradeStats();
});
