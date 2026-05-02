// ─── Mobile menu ───────────────────────────────────────────────
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

// ─── FAQ accordion ─────────────────────────────────────────────
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// ─── Contact form ──────────────────────────────────────────────
function showFieldError(input, message) {
  clearFieldError(input);
  input.classList.add("input-error");
  const err = document.createElement("span");
  err.className = "field-error";
  err.textContent = message;
  input.insertAdjacentElement("afterend", err);
}

function clearFieldError(input) {
  input.classList.remove("input-error");
  const existing = input.nextElementSibling;
  if (existing && existing.classList.contains("field-error")) existing.remove();
}

function validateForm(form) {
  const name  = form.querySelector('[name="name"]');
  const phone = form.querySelector('[name="phone"]');
  let valid = true;

  clearFieldError(name);
  clearFieldError(phone);

  if (/\d/.test(name.value.trim())) {
    showFieldError(name, "Name should not contain numbers.");
    valid = false;
  } else if (name.value.trim().length < 2) {
    showFieldError(name, "Please enter your full name.");
    valid = false;
  }

  const digits = phone.value.replace(/\D/g, "");
  if (digits.length !== 10) {
    showFieldError(phone, "Phone number must be exactly 10 digits.");
    valid = false;
  }

  return valid;
}

async function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;

  if (!validateForm(form)) return;

  const btn = form.querySelector("button");
  const successBox = document.getElementById("formSuccess");
  const errorBox   = document.getElementById("formError");

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  btn.disabled  = true;
  successBox.style.display = "none";
  errorBox.style.display   = "none";

  const data = {
    name:    form.querySelector('[name="name"]').value.trim(),
    phone:   form.querySelector('[name="phone"]').value.trim(),
    message: form.querySelector('[name="message"]').value.trim(),
  };

  try {
    const res = await fetch("https://formsubmit.co/ajax/help@settlementpanel.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      form.reset();
      successBox.style.display = "block";
      setTimeout(() => (successBox.style.display = "none"), 6000);
    } else {
      throw new Error("Server error");
    }
  } catch {
    errorBox.style.display = "block";
    setTimeout(() => (errorBox.style.display = "none"), 6000);
  } finally {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled  = false;
  }
}

// ─── Smooth scroll ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ─── Scroll reveal ─────────────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".service-card, .step-card, .why-card, .faq-item")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });

// ─── Reviews carousel ───────────────────────────────────────────
(async function loadReviews() {
  const track = document.getElementById("testimonialsTrack");
  if (!track) return;

  try {
    const reviews = await fetch("reviews.json").then(r => r.json());
    if (!reviews.length) return;

    function makeCard(r) {
      const stars = "★".repeat(r.stars || 5);
      const photo = r.photo
        ? `<img class="author-avatar" src="${r.photo}" alt="${r.name}" />`
        : `<div class="author-avatar" style="background:var(--secondary-light);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--secondary);font-size:1.1rem">${r.name.charAt(0)}</div>`;
      const saved = r.saved
        ? `<div class="testimonial-result" style="margin-left:auto">${r.saved}</div>`
        : "";
      return `<div class="testimonial-card">
        <div class="stars">${stars}</div>
        <blockquote>&ldquo;${r.quote}&rdquo;</blockquote>
        <div class="testimonial-author">
          ${photo}
          <div>
            <div class="author-name">${r.name}</div>
            <div class="author-detail">${r.detail}</div>
          </div>
          ${saved}
        </div>
      </div>`;
    }

    // Duplicate set so the -50% translateX loop is seamless
    track.innerHTML = [...reviews, ...reviews].map(makeCard).join("");
  } catch (e) {
    console.error("Could not load reviews.json", e);
  }
})();
