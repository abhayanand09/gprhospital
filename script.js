/* ========================================================
   MEDICARE HOSPITAL - INTERACTIONS & BACKEND LOGIC
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initSearchToggle();
  initTestimonialSlider();
  initStatsCounter();
});

// ================= BACKEND CONFIGURATION =================
// Paste the Web App URL you copied from Google Apps Script here:
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyuSXSeUaHT43diWbNwsf3dfyEjkOdbRXXmKErpsrLC8z9wWVJZjnhgTK4bUos9vsUZaw/exec";


/* 1. Navbar Sticky Shadow */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* 2. Hamburger Menu for Mobile */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when link clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

/* 3. Global Header Search */
function initSearchToggle() {
  const searchToggle = document.getElementById('searchToggle');
  const searchDropdown = document.getElementById('searchDropdown');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput = document.getElementById('globalSearchInput');

  if (searchToggle && searchDropdown) {
    searchToggle.addEventListener('click', () => {
      searchDropdown.classList.toggle('active');
      if (searchDropdown.classList.contains('active')) {
        searchInput.focus();
      }
    });

    closeSearchBtn.addEventListener('click', () => {
      searchDropdown.classList.remove('active');
    });
  }
}

/* 4. Filter Medical Departments */
function filterDepartments() {
  const query = document.getElementById('deptFilterInput').value.toLowerCase();
  const cards = document.querySelectorAll('#departmentsGrid .dept-card');

  cards.forEach(card => {
    const text = card.getAttribute('data-name').toLowerCase();
    if (text.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/* 5. Filter Doctors */
function filterDoctors() {
  const query = document.getElementById('doctorSearchInput').value.toLowerCase();
  const cards = document.querySelectorAll('#doctorsGrid .doctor-card');

  cards.forEach(card => {
    const name = card.getAttribute('data-name').toLowerCase();
    const spec = card.getAttribute('data-spec').toLowerCase();
    if (name.includes(query) || spec.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/* 6. Testimonial Carousel Slider */
let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.pagination-dots .dot');

function showSlide(index) {
  if (!slides.length) return;
  if (index >= slides.length) currentSlide = 0;
  else if (index < 0) currentSlide = slides.length - 1;
  else currentSlide = index;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function initTestimonialSlider() {
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  }

  // Auto slide every 6 seconds
  setInterval(() => {
    showSlide(currentSlide + 1);
  }, 6000);
}

function jumpSlide(index) {
  showSlide(index);
}

/* 7. Animated Statistics Counter */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let animated = false;

  window.addEventListener('scroll', () => {
    const section = document.getElementById('why-us');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.8 && !animated) {
      animated = true;
      statNumbers.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        let count = 0;
        const speed = target / 30; // speed divider

        const updateCount = () => {
          count += speed;
          if (count < target) {
            stat.innerText = Math.ceil(count) + (target === 50 ? 'K+' : '+');
            setTimeout(updateCount, 30);
          } else {
            stat.innerText = target + (target === 50 ? 'K+' : '+');
          }
        };
        updateCount();
      });
    }
  });
}

/* 8. Booking Appointment Modal & Google Sheets Backend Integration */
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  const form = document.getElementById('appointmentForm');
  const successMsg = document.getElementById('bookingSuccessMessage');

  modal.classList.add('active');
  form.style.display = 'block';
  successMsg.classList.remove('active');

  // Set default min date to today
  const dateInput = document.getElementById('ptDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('active');
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('appointmentForm');
  const submitBtn = document.getElementById('btnSubmitAppointment') || form.querySelector('button[type="submit"]');
  const submitText = document.getElementById('btnSubmitText') || submitBtn;
  const successMsg = document.getElementById('bookingSuccessMessage');

  // 1. Gather all form inputs
  const payload = {
    name: document.getElementById('ptName').value.trim(),
    email: document.getElementById('ptEmail').value.trim(),
    phone: document.getElementById('ptPhone').value.trim(),
    department: document.getElementById('ptDept').value,
    doctor: document.getElementById('ptDoctor').value,
    date: document.getElementById('ptDate').value,
    time: document.getElementById('ptTime').value,
    reason: document.getElementById('ptReason').value.trim()
  };

  // 2. Show loading spinner on button
  submitBtn.disabled = true;
  const originalText = submitText.innerHTML;
  submitText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Google Sheets...';

  try {
    // 3. Post data to Google Apps Script Endpoint
    await fetch(GOOGLE_SHEET_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // 4. Reveal success message and reset form
    form.style.display = 'none';
    successMsg.classList.add('active');
    form.reset();
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Something went wrong while submitting your appointment. Please check your internet or call 1800 123 4567.');
  } finally {
    submitBtn.disabled = false;
    submitText.innerHTML = originalText;
  }
}

function updateDoctorDropdown() {
  const dept = document.getElementById('ptDept').value;
  const docSelect = document.getElementById('ptDoctor');

  const deptMap = {
    'Cardiology': 'Dr. Rohit Sharma',
    'Neurology': 'Dr. Priya Verma',
    'Orthopedics': 'Dr. Amit Kumar',
    'Pediatrics': 'Dr. Sneha Gupta'
  };

  if (deptMap[dept]) {
    docSelect.value = deptMap[dept];
  } else {
    docSelect.value = 'Any Available Specialist';
  }
}

/* 9. Doctor Profile Modal */
function openDoctorModal(name, spec, qual, rating, reviews, bio) {
  document.getElementById('mDocName').innerText = name;
  document.getElementById('mDocSpec').innerText = spec;
  document.getElementById('mDocQual').innerText = qual;
  document.getElementById('mDocRating').innerText = rating;
  document.getElementById('mDocReviews').innerText = reviews;
  document.getElementById('mDocBio').innerText = bio;

  document.getElementById('docModal').classList.add('active');
}

function closeDocModal() {
  document.getElementById('docModal').classList.remove('active');
}

/* 10. Newsletter Handler */
function handleNewsletter(event) {
  event.preventDefault();
  alert('Thank you for subscribing to MediCare health updates and journals!');
  event.target.reset();
}

/* 11. Patient Portal Alert */
function openPatientPortal() {
  alert('Opening MediCare Secured Patient Portal. Please keep your UHID or Registered Mobile Number ready for OTP login.');
}

// Close modals when clicking outside modal dialog box
window.addEventListener('click', (e) => {
  const bookingModal = document.getElementById('bookingModal');
  const docModal = document.getElementById('docModal');

  if (e.target === bookingModal) closeBookingModal();
  if (e.target === docModal) closeDocModal();
});