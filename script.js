/* ============================================
   AURUM — script.js
   All JavaScript interactivity
   ============================================ */

'use strict';

/* ─────────────────────────────────────────────
   1. LOADER
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    startCounters();
    initAOS();
  }, 1800);
});

/* ─────────────────────────────────────────────
   2. THEME TOGGLE  (saves to localStorage)
───────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

// Load saved preference
const savedTheme = localStorage.getItem('aurum-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('aurum-theme', next);
  updateThemeIcon(next);
  // Re-render charts so their colors update
  renderRevenueChart(activeRevPeriod);
  renderDonutChart();
  renderHeroChart();
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

/* ─────────────────────────────────────────────
   3. HEADER SCROLL BEHAVIOUR
───────────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('backTop').classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
}, { passive: true });

/* ─────────────────────────────────────────────
   4. ACTIVE NAV LINKS  (IntersectionObserver)
───────────────────────────────────────────── */
const sections  = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY + 120 >= section.offsetTop) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ─────────────────────────────────────────────
   5. MOBILE HAMBURGER
───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

/* ─────────────────────────────────────────────
   6. BACK TO TOP
───────────────────────────────────────────── */
document.getElementById('backTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─────────────────────────────────────────────
   7. ANIMATED COUNTERS  (Hero stats)
───────────────────────────────────────────── */
function startCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let current  = 0;
    const step   = target / 60;
    const timer  = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 20);
  });
}

/* ─────────────────────────────────────────────
   8. SCROLL-TRIGGERED ANIMATIONS  (AOS lite)
───────────────────────────────────────────── */
function initAOS() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger feature cards
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────
   9. CHART HELPERS
───────────────────────────────────────────── */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── 9a. Hero mini chart ── */
let heroChartInstance = null;
function renderHeroChart() {
  const ctx = document.getElementById('heroChart');
  if (!ctx) return;
  if (heroChartInstance) heroChartInstance.destroy();

  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  const data   = [42,55,38,67,74,62,88];

  heroChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: getCSSVar('--gold'),
        borderWidth: 2,
        pointBackgroundColor: getCSSVar('--gold'),
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, 'rgba(201,168,76,0.2)');
          g.addColorStop(1, 'rgba(201,168,76,0)');
          return g;
        }
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: getCSSVar('--text-muted'), font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: getCSSVar('--text-muted'), font: { size: 11 } } }
      }
    }
  });
}

/* ── 9b. Revenue chart ── */
let revenueChartInstance = null;
let activeRevPeriod = 'week';

const revenueData = {
  week: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    data: [12400, 19800, 15200, 22100, 28400, 17600, 21300]
  },
  month: {
    labels: ['W1','W2','W3','W4'],
    data: [62000, 74500, 88200, 71300]
  },
  year: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    data: [82000,94000,88000,112000,130000,118000,145000,138000,156000,148000,172000,190000]
  }
};
// Fix year data


function renderRevenueChart(period = 'week') {
  activeRevPeriod = period;
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (revenueChartInstance) revenueChartInstance.destroy();

  const { labels, data } = revenueData[period];

  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(201,168,76,0.8)');
          g.addColorStop(1, 'rgba(201,168,76,0.1)');
          return g;
        },
        borderColor: getCSSVar('--gold'),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: getCSSVar('--text-muted'), font: { size: 11 } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: getCSSVar('--text-muted'), font: { size: 11 },
            callback: v => `$${(v/1000).toFixed(0)}k`
          }
        }
      }
    }
  });
}

// Chart tab switcher
document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderRevenueChart(tab.dataset.period);
  });
});

/* ── 9c. Donut chart ── */
let donutChartInstance = null;

function renderDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  if (donutChartInstance) donutChartInstance.destroy();

  const sources = [
    { label: 'Organic Search', value: 42, color: '#c9a84c' },
    { label: 'Direct',         value: 26, color: '#8b7cf6' },
    { label: 'Social Media',   value: 18, color: '#4caf7d' },
    { label: 'Referral',       value: 14, color: '#e05a5a' }
  ];

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sources.map(s => s.label),
      datasets: [{
        data: sources.map(s => s.value),
        backgroundColor: sources.map(s => s.color),
        borderColor: getCSSVar('--surface'),
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  });

  // Build legend
  const legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = sources.map(s => `
      <div class="legend-item">
        <div><span class="legend-dot" style="background:${s.color}"></span>${s.label}</div>
        <strong>${s.value}%</strong>
      </div>
    `).join('');
  }
}

/* ─────────────────────────────────────────────
   10. TRANSACTION TABLE  (with search + filter + pagination)
───────────────────────────────────────────── */
const transactions = [
  { id: '#TXN-0091', client: 'Meridian Corp',     amount: '$12,450', date: '2025-01-15', status: 'completed' },
  { id: '#TXN-0090', client: 'Apex Industries',   amount: '$8,200',  date: '2025-01-14', status: 'completed' },
  { id: '#TXN-0089', client: 'Nova Systems',      amount: '$3,750',  date: '2025-01-14', status: 'pending'   },
  { id: '#TXN-0088', client: 'Stellar Ventures',  amount: '$21,000', date: '2025-01-13', status: 'completed' },
  { id: '#TXN-0087', client: 'Orbit Analytics',   amount: '$5,600',  date: '2025-01-13', status: 'failed'    },
  { id: '#TXN-0086', client: 'Quantum Labs',      amount: '$14,300', date: '2025-01-12', status: 'completed' },
  { id: '#TXN-0085', client: 'Pinnacle Group',    amount: '$9,800',  date: '2025-01-12', status: 'pending'   },
  { id: '#TXN-0084', client: 'Vantage Solutions', amount: '$6,100',  date: '2025-01-11', status: 'completed' },
  { id: '#TXN-0083', client: 'Crest Partners',    amount: '$18,700', date: '2025-01-11', status: 'completed' },
  { id: '#TXN-0082', client: 'Prime Dynamics',    amount: '$2,400',  date: '2025-01-10', status: 'failed'    },
  { id: '#TXN-0081', client: 'Zenith Capital',    amount: '$11,900', date: '2025-01-10', status: 'completed' },
  { id: '#TXN-0080', client: 'Atlas Finance',     amount: '$7,350',  date: '2025-01-09', status: 'pending'   },
];

const PAGE_SIZE = 5;
let currentPage = 1;
let filteredData = [...transactions];

const tableBody   = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const prevBtn     = document.getElementById('prevPage');
const nextBtn     = document.getElementById('nextPage');
const pageInfo    = document.getElementById('pageInfo');

function renderTable() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end   = start + PAGE_SIZE;
  const rows  = filteredData.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  tableBody.innerHTML = rows.length
    ? rows.map(tx => `
      <tr>
        <td><code style="color:var(--gold);font-size:0.8rem">${tx.id}</code></td>
        <td>${tx.client}</td>
        <td><strong>${tx.amount}</strong></td>
        <td>${tx.date}</td>
        <td><span class="badge badge-${tx.status}">${tx.status.charAt(0).toUpperCase()+tx.status.slice(1)}</span></td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem">No transactions found.</td></tr>';

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function applyFilters() {
  const q      = searchInput.value.toLowerCase();
  const status = filterStatus.value;
  filteredData = transactions.filter(tx => {
    const matchQuery  = !q || tx.client.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q);
    const matchStatus = status === 'all' || tx.status === status;
    return matchQuery && matchStatus;
  });
  currentPage = 1;
  renderTable();
}

searchInput.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
nextBtn.addEventListener('click', () => {
  const total = Math.ceil(filteredData.length / PAGE_SIZE);
  if (currentPage < total) { currentPage++; renderTable(); }
});

/* ─────────────────────────────────────────────
   11. CONTACT FORM VALIDATION  (saves to localStorage)
───────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fname   = document.getElementById('fname');
  const lname   = document.getElementById('lname');
  const email   = document.getElementById('email');
  const message = document.getElementById('message');
  let valid = true;

  // Clear previous errors
  ['fnameError','lnameError','emailError','messageError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  [fname, lname, email, message].forEach(f => f.style.borderColor = '');

  // Validate
  if (!fname.value.trim()) {
    showError(fname, 'fnameError', 'First name is required.');
    valid = false;
  }
  if (!lname.value.trim()) {
    showError(lname, 'lnameError', 'Last name is required.');
    valid = false;
  }
  if (!email.value.trim() || !isValidEmail(email.value)) {
    showError(email, 'emailError', 'Please enter a valid email address.');
    valid = false;
  }
  if (!message.value.trim() || message.value.trim().length < 10) {
    showError(message, 'messageError', 'Message must be at least 10 characters.');
    valid = false;
  }

  if (!valid) return;

  // Save to localStorage
  const submission = {
    name: `${fname.value.trim()} ${lname.value.trim()}`,
    email: email.value.trim(),
    company: document.getElementById('company').value.trim(),
    message: message.value.trim(),
    date: new Date().toISOString()
  };
  const previous = JSON.parse(localStorage.getItem('aurum-submissions') || '[]');
  previous.push(submission);
  localStorage.setItem('aurum-submissions', JSON.stringify(previous));

  // Show success
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Sending…</span> <i class="fas fa-spinner fa-spin"></i>';

  setTimeout(() => {
    contactForm.reset();
    document.getElementById('formSuccess').classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';

    // Open thank-you modal
    openModal(`
      <div style="text-align:center">
        <div style="font-size:3rem;color:var(--gold);margin-bottom:1rem">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:0.75rem">Message Received!</h3>
        <p style="color:var(--text-muted);line-height:1.6">
          Thank you, <strong>${submission.name}</strong>. Our team will review your message and get back to you at
          <em style="color:var(--gold)">${submission.email}</em> within 24 hours.
        </p>
      </div>
    `);
  }, 1200);
});

function showError(field, errorId, msg) {
  field.style.borderColor = 'var(--negative)';
  document.getElementById(errorId).textContent = msg;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─────────────────────────────────────────────
   12. MODAL
───────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose   = document.getElementById('modalClose');

function openModal(html) {
  modalContent.innerHTML = html;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ─────────────────────────────────────────────
   13. SMOOTH SCROLL for anchor links
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────────
   14. INIT — kick everything off
───────────────────────────────────────────── */
renderTable();

// Charts render after a short delay so the DOM is painted
setTimeout(() => {
  renderHeroChart();
  renderRevenueChart('week');
  renderDonutChart();
}, 100);

// Restore saved form data from localStorage
const savedForm = JSON.parse(localStorage.getItem('aurum-draft') || '{}');
if (savedForm.email) document.getElementById('email').value = savedForm.email;

// Auto-save form draft
['fname','lname','email','company','message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const draft = JSON.parse(localStorage.getItem('aurum-draft') || '{}');
    draft[id] = el.value;
    localStorage.setItem('aurum-draft', JSON.stringify(draft));
  });
});

// Clear draft on successful submit
contactForm.addEventListener('submit', () => {
  setTimeout(() => localStorage.removeItem('aurum-draft'), 2000);
});

console.log('%c Aurum Analytics ', 'background:#c9a84c;color:#000;font-weight:700;padding:4px 10px;border-radius:4px;font-family:serif;font-size:14px');
console.log('%c Built with precision.', 'color:#c9a84c;font-family:serif');