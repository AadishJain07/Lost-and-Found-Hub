/**
 * CampusTrack - Client-Side Controller
 * Handles local state, filtering, search, modal control, and persistence.
 */

// Categories for chips
const CATEGORIES = [
  "All Categories",
  "ID & Cards",
  "Electronics",
  "Keys",
  "Notebooks",
  "Wallets & Bags",
  "Other"
];

// Initial preloaded items for campus demonstration
const INITIAL_DATA = [
  {
    id: "item-1",
    title: "Student Identity Card (CSE Dept)",
    type: "FOUND",
    category: "ID & Cards",
    location: "Library Reading Hall, Desk 18",
    description: "Roll number CS-2023-089. Found under a study desk. Can collect after showing receipt/ID confirmation.",
    contactName: "Rohan Verma",
    contactPhone: "9876543210",
    date: "1 hour ago"
  },
  {
    id: "item-2",
    title: "Black Realme Buds Case",
    type: "LOST",
    category: "Electronics",
    location: "Main Food Court / Cafeteria",
    description: "Matte black charging case with small scratch on the side. Contains left earbud only.",
    contactName: "Tanmay Das",
    contactPhone: "9123456780",
    date: "3 hours ago"
  },
  {
    id: "item-3",
    title: "Hostel Key with Iron Man Tag",
    type: "FOUND",
    category: "Keys",
    location: "Sports Ground Basketball Court",
    description: "Single Godrej brass key attached to a metal Marvel keychain.",
    contactName: "Ananya S.",
    contactPhone: "9988776655",
    date: "Yesterday"
  },
  {
    id: "item-4",
    title: "Classmate Spiral Physics Notebook",
    type: "LOST",
    category: "Notebooks",
    location: "Block B, Room 204",
    description: "Has handwritten notes on Quantum Mechanics and formula sheets tucked in back pocket.",
    contactName: "Kabir",
    contactPhone: "",
    date: "2 days ago"
  }
];

// Application State
let items = [];
let activeCategory = "All Categories";
let activeStatus = "ALL"; // 'ALL' | 'LOST' | 'FOUND'
let searchQuery = "";

// Elements
const itemsGrid = document.getElementById("itemsGrid");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");
const categoryChips = document.getElementById("categoryChips");
const searchInput = document.getElementById("searchInput");
const statusTabs = document.getElementById("statusTabs");

// Modals
const reportModal = document.getElementById("reportModal");
const openReportModalBtn = document.getElementById("openReportModalBtn");
const closeReportModalBtn = document.getElementById("closeReportModalBtn");
const cancelReportBtn = document.getElementById("cancelReportBtn");
const reportForm = document.getElementById("reportForm");

const detailModal = document.getElementById("detailModal");
const detailModalContent = document.getElementById("detailModalContent");

/**
 * Initialize Application
 */
function initApp() {
  loadItems();
  renderCategoryChips();
  bindEvents();
  renderItems();
}

/**
 * Storage: Load & Save
 */
function loadItems() {
  const saved = localStorage.getItem("campus_track_data");
  if (saved) {
    try {
      items = JSON.parse(saved);
    } catch (e) {
      items = [...INITIAL_DATA];
    }
  } else {
    items = [...INITIAL_DATA];
    saveItems();
  }
}

function saveItems() {
  localStorage.setItem("campus_track_data", JSON.stringify(items));
}

/**
 * Render Category Chips
 */
function renderCategoryChips() {
  categoryChips.innerHTML = CATEGORIES.map(category => {
    const isActive = category === activeCategory;
    return `
      <button 
        class="category-chip ${isActive ? 'active' : ''}" 
        data-cat="${category}">
        ${category}
      </button>
    `;
  }).join("");
}

/**
 * Main Render Function
 */
function renderItems() {
  // Filter logic
  const filtered = items.filter(item => {
    const matchesStatus = (activeStatus === "ALL") || (item.type === activeStatus);
    const matchesCategory = (activeCategory === "All Categories") || (item.category === activeCategory);
    
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === "" || 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Count indicator
  resultsCount.textContent = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;

  // Empty state handling
  if (filtered.length === 0) {
    itemsGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  // Grid output
  itemsGrid.innerHTML = filtered.map(item => {
    const isFound = item.type === "FOUND";
    const badgeClass = isFound ? "badge-found" : "badge-lost";

    return `
      <article class="item-card">
        <div>
          <div class="card-top">
            <span class="badge ${badgeClass}">${item.type}</span>
            <span class="item-date">${item.date}</span>
          </div>
          <h3 class="item-title">${escapeHTML(item.title)}</h3>
          <span class="item-cat">${item.category}</span>
          <p class="item-desc">${escapeHTML(item.description)}</p>
          <div class="item-loc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHTML(item.location)}</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="card-reporter">By: <strong>${escapeHTML(item.contactName)}</strong></span>
          <button class="btn-sm-link" onclick="openDetailModal('${item.id}')">View Details &rarr;</button>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Event Listeners & Delegation
 */
function bindEvents() {
  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderItems();
  });

  // Category chip clicks
  categoryChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".category-chip");
    if (!chip) return;
    activeCategory = chip.dataset.cat;
    renderCategoryChips();
    renderItems();
  });

  // Status Tab Clicks
  statusTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".status-tab");
    if (!tab) return;
    
    document.querySelectorAll(".status-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    activeStatus = tab.dataset.status;
    renderItems();
  });

  // Modal open & close
  openReportModalBtn.addEventListener("click", () => reportModal.classList.remove("hidden"));
  closeReportModalBtn.addEventListener("click", () => reportModal.classList.add("hidden"));
  cancelReportBtn.addEventListener("click", () => reportModal.classList.add("hidden"));

  // Dismiss on outside click
  window.addEventListener("click", (e) => {
    if (e.target === reportModal) reportModal.classList.add("hidden");
    if (e.target === detailModal) detailModal.classList.add("hidden");
  });

  // Form Submission
  reportForm.addEventListener("submit", handleFormSubmit);
}

/**
 * Handle Report Submission
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const type = document.querySelector('input[name="itemType"]:checked').value;
  const title = document.getElementById("formTitle").value.trim();
  const category = document.getElementById("formCategory").value;
  const location = document.getElementById("formLocation").value.trim();
  const description = document.getElementById("formDescription").value.trim();
  const contactName = document.getElementById("formContactName").value.trim();
  const contactPhone = document.getElementById("formContactPhone").value.trim();

  const newItem = {
    id: "item-" + Date.now(),
    type,
    title,
    category,
    location,
    description,
    contactName,
    contactPhone,
    date: "Just now"
  };

  // Add to top of array & sync
  items.unshift(newItem);
  saveItems();

  // Reset & close
  reportForm.reset();
  reportModal.classList.add("hidden");
  renderItems();
}

/**
 * Detailed View & Direct Contact Hook
 */
window.openDetailModal = function(id) {
  const item = items.find(it => it.id === id);
  if (!item) return;

  const isFound = item.type === "FOUND";
  const badgeClass = isFound ? "badge-found" : "badge-lost";

  // Build clean WhatsApp link if phone is provided
  const digitsOnly = item.contactPhone.replace(/\D/g, "");
  const whatsappUrl = digitsOnly
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(`Hi ${item.contactName}, I'm reaching out regarding your "${item.title}" on CampusTrack.`)}`
    : null;

  detailModalContent.innerHTML = `
    <div class="modal-header">
      <div>
        <span class="badge ${badgeClass}">${item.type}</span>
        <h2 style="margin-top: 0.5rem;">${escapeHTML(item.title)}</h2>
      </div>
      <button class="modal-close-btn" onclick="closeDetailModal()">&times;</button>
    </div>

    <div class="modal-body">
      <div style="background: #f8fafc; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Campus Location:</strong> ${escapeHTML(item.location)}</p>
        <p><strong>Reported:</strong> ${item.date}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Full Description</label>
        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-main);">${escapeHTML(item.description)}</p>
      </div>

      <div class="form-group" style="border-top: 1px solid var(--border); padding-top: 0.85rem;">
        <label class="form-label">Contact Person</label>
        <p style="font-size: 0.9rem; font-weight: 700;">${escapeHTML(item.contactName)}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${item.contactPhone ? escapeHTML(item.contactPhone) : 'No phone specified'}</p>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
        ${whatsappUrl ? `
          <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp" style="flex: 1;">
            Chat on WhatsApp
          </a>
        ` : ''}
        <button class="btn btn-danger" onclick="resolveItem('${item.id}')" style="flex: 1;">
          Mark as Resolved / Claimed
        </button>
      </div>
    </div>
  `;

  detailModal.classList.remove("hidden");
};

window.closeDetailModal = function() {
  detailModal.classList.add("hidden");
};

window.resolveItem = function(id) {
  if (confirm("Mark this item as claimed/recovered? It will be removed from the active campus board.")) {
    items = items.filter(it => it.id !== id);
    saveItems();
    closeDetailModal();
    renderItems();
  }
};

/**
 * XSS Protection Utility
 */
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// Start
document.addEventListener("DOMContentLoaded", initApp);