// PerShiaA Interactive JavaScript Engine & Upgrade Management

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const mindmapModal = document.getElementById("mindmap-modal");
  const openMindmapBtns = document.querySelectorAll(".open-mindmap");
  const closeMindmapBtn = document.getElementById("close-mindmap");

  const searchModal = document.getElementById("search-modal");
  const openSearchBtns = document.querySelectorAll(".open-search, .command-bar");
  const closeSearchBtn = document.getElementById("close-search");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  // Open / Close Mind Map Modal
  openMindmapBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      mindmapModal.classList.add("active");
    });
  });

  if (closeMindmapBtn) {
    closeMindmapBtn.addEventListener("click", () => {
      mindmapModal.classList.remove("active");
    });
  }

  // Open / Close Search Modal
  openSearchBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      searchModal.classList.add("active");
      if (searchInput) searchInput.focus();
    });
  });

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener("click", () => {
      searchModal.classList.remove("active");
    });
  }

  // Keyboard Shortcuts (⌘K for Search, ⌘M for Mind Map, ESC to Close)
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchModal.classList.add("active");
      if (searchInput) searchInput.focus();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
      e.preventDefault();
      mindmapModal.classList.add("active");
    }
    if (e.key === "Escape") {
      mindmapModal.classList.remove("active");
      searchModal.classList.remove("active");
    }
  });

  // Close modals on clicking backdrop
  [mindmapModal, searchModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    }
  });

  // Search Functionality
  const searchableContent = [
    {
      title: "اندیشه و نظریه",
      text: "مبانی فکری، انسان‌شناسی، فلسفه اجتماعی و نظریه‌های تمدنی",
      link: "#thought",
      category: "محورهای محتوایی",
    },
    {
      title: "فرهنگ و جامعه",
      text: "تحلیل فرهنگ، هویت، خانواده، آموزش، رسانه و تحولات اجتماعی",
      link: "#society",
      category: "محورهای محتوایی",
    },
    {
      title: "علم و فناوری",
      text: "نسبت علم، فناوری، نوآوری و قدرت تمدنی در جهان معاصر",
      link: "#science",
      category: "محورهای محتوایی",
    },
    {
      title: "اقتصاد و پیشرفت",
      text: "اقتصاد، تولید، عدالت، حکمرانی اقتصادی و الگوهای پیشرفت",
      link: "#economy",
      category: "محورهای محتوایی",
    },
    {
      title: "حکمرانی و سیاست",
      text: "نهادها، سیاست‌گذاری، حکمرانی و ظرفیت‌های دولت و جامعه",
      link: "#governance",
      category: "محورهای محتوایی",
    },
    {
      title: "راهبرد و آینده",
      text: "سناریوها، روندها، مسائل راهبردی و طراحی مسیرهای آینده‌نگر",
      link: "#strategy",
      category: "محورهای محتوایی",
    },
    {
      title: "فاز ۱: بنیادهای نظری و فلسفی",
      text: "تدوین درسنامه‌های انسان‌شناسی و هستی‌شناسی تمدنی",
      link: "#roadmap",
      category: "نقشه راه جامع",
    },
    {
      title: "فاز ۲: هسته‌های پژوهشی و تحلیل مسائل",
      text: "نگاشت مسائل کلان حکمرانی، عدالت و اقتصاد دانش‌بنیان",
      link: "#roadmap",
      category: "نقشه راه جامع",
    },
    {
      title: "فاز ۳: تولید و انتشار منابع رسانه‌ای",
      text: "انتشار کتاب، مجلات تخصصی، پادکست‌ها و درسگفتارهای تصویری",
      link: "#roadmap",
      category: "نقشه راه جامع",
    },
    {
      title: "فاز ۴: شبکه‌سازی و ارتقاء نهادی",
      text: "توسعه پلتفرم تعاملی اندیشکده و ارائه توصیه‌نامه‌های سیاست‌پژوهی",
      link: "#roadmap",
      category: "نقشه راه جامع",
    },
    {
      title: "ارتقاء و توسعه وبسایت",
      text: "داشبورد هوشمند پیشرفت پلتفرم و قابلیت ارتقاء قابلیت‌های اندیشکده",
      link: "#upgrade-center",
      category: "سامانه ارتقاء",
    },
  ];

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML =
          '<div class="search-empty">عبارت مورد نظر خود را تایپ کنید...</div>';
        return;
      }
      const filtered = searchableContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query) || item.text.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">نتیجه‌ای یافت نشد.</div>';
      } else {
        searchResults.innerHTML = filtered
          .map(
            (item) => `
          <a href="${item.link}" class="search-item" onclick="document.getElementById('search-modal').classList.remove('active')">
            <span class="search-tag">${item.category}</span>
            <div class="search-title">${item.title}</div>
            <div class="search-desc">${item.text}</div>
          </a>
        `
          )
          .join("");
      }
    });
  }

  // Interactive Roadmap Filter
  const filterBtns = document.querySelectorAll(".roadmap-filter-btn");
  const roadmapCards = document.querySelectorAll(".roadmap-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      roadmapCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-status") === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Mind Map Interactive Nodes
  const mindNodes = document.querySelectorAll(".mm-node");
  mindNodes.forEach((node) => {
    node.addEventListener("click", () => {
      mindNodes.forEach((n) => n.classList.remove("selected"));
      node.classList.add("selected");
      const details = node.getAttribute("data-details");
      const detailBox = document.getElementById("mindmap-details");
      if (detailBox && details) {
        const template = document.createElement("template");
        template.innerHTML = details;
        detailBox.replaceChildren(...template.content.childNodes);
      }
    });
  });

  // Upgrade & Dynamic Progress Tracker Engine
  const upgradeItems = document.querySelectorAll(".upgrade-checkbox");
  const totalProgressFill = document.getElementById("total-progress-fill");
  const totalProgressPercent = document.getElementById("total-progress-percent");
  const totalMilestoneCount = document.getElementById("total-milestone-count");

  // Load state from localStorage
  function loadUpgradeState() {
    upgradeItems.forEach((checkbox) => {
      const id = checkbox.id;
      const saved = localStorage.getItem("pershiaa_upgrade_" + id);
      if (saved === "true") {
        checkbox.checked = true;
      }
    });
    updateUpgradeStats();
  }

  function updateUpgradeStats() {
    let completed = 0;
    upgradeItems.forEach((checkbox) => {
      if (checkbox.checked) {
        completed++;
      }
    });
    const total = upgradeItems.length;
    const percentage = Math.round((completed / total) * 100);

    if (totalProgressFill) totalProgressFill.style.width = percentage + "%";
    if (totalProgressPercent) totalProgressPercent.textContent = percentage + "%";
    if (totalMilestoneCount)
      totalMilestoneCount.textContent = `${completed} از ${total} گام تکمیل شده`;
  }

  upgradeItems.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      localStorage.setItem("pershiaa_upgrade_" + checkbox.id, checkbox.checked);
      updateUpgradeStats();
    });
  });

  loadUpgradeState();
});
