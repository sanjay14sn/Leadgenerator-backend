export function generateFullHTML(lead) {
  const name = lead.name || "";
  const phone = lead.phone || "";
  const email = lead.email || "";
  const address = lead.address || "";
  const hero_title = lead.hero_title || "Unlock Your Business's Full Potential";
  const hero_subtitle = lead.hero_subtitle || "";
  const cta_button = lead.cta_button || "Discover More";
  const description = lead.description || "";
  const thumbnail =
    lead.thumbnail ||
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg";

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;

  // WHATSAPP LINKS
  const whatsappBasic = `https://wa.me/${phone}`;
  const whatsappPrefilled = `https://wa.me/${phone}?text=Hi%20I%20visited%20your%20website.%20I%20want%20to%20know%20more%20about%20your%20services.`;
  const whatsappAppointment = `https://wa.me/${phone}?text=New%20Appointment%20Request:%0AName:%20%0APhone:%20%0ADate:%20%0AService:%20`;

  return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8" />
// <title>${name}</title>
// <meta name="viewport" content="width=device-width, initial-scale=1" />

// <style>
//   body { margin:0; font-family: Arial, sans-serif; background:#f9fafb; color:#333; }
//   .container { max-width: 1200px; margin:auto; background:white; box-shadow:0 4px 20px rgba(0,0,0,0.1); }

//   /* HEADER */
//   header { background:#4c1d95; color:white; padding:20px; display:flex; justify-content:space-between; align-items:center; }
//   header h1 { font-size:28px; font-weight:900; }
//   header .sub { color:#2dd4bf; margin-left:6px; }
//   header .right-info { display:none; gap:16px; font-size:14px; }
//   @media(min-width:768px){ header .right-info { display:flex; } }

//   /* HERO */
//   .hero { padding:60px 20px; display:grid; gap:40px; }
//   @media(min-width:1024px){ .hero { grid-template-columns:2fr 1fr; } }
//   .hero-title { font-size:42px; font-weight:900; }
//   .hero-sub { font-size:20px; margin-top:15px; color:#555; }
//   .cta-btns { margin-top:25px; display:flex; flex-direction:column; gap:12px; }
//   @media(min-width:640px){ .cta-btns { flex-direction:row; } }
//   .btn-primary { padding:14px 30px; background:#5b21b6; color:white; border-radius:8px; cursor:pointer; font-weight:bold; text-align:center; }
//   .btn-primary:hover { background:#4c1d95; }
//   .btn-secondary { padding:14px 30px; border:1px solid #ddd; color:#5b21b6; border-radius:8px; cursor:pointer; text-align:center; }

//   /* IMAGE */
//   .hero-img { width:100%; height:300px; object-fit:cover; border-radius:12px; border:4px solid #eee; }
//   .contact-box { margin-top:15px; padding:16px; background:#f3f4f6; border-radius:10px; text-align:center; font-weight:bold; }

//   /* WHATSAPP BUTTONS */
//   .wa-btn { 
//     display:block; 
//     margin-top:10px;
//     padding:12px; 
//     background:#25D366; 
//     color:white; 
//     text-align:center; 
//     border-radius:8px; 
//     font-weight:bold; 
//     text-decoration:none;
//   }
//   .wa-btn:hover { background:#1ebe5d; }

//   /* TWO COLUMN (ABOUT + CAPABILITIES) */
//   .two-col { display:grid; border-top:1px solid #eee; border-bottom:1px solid #eee; }
//   @media(min-width:1024px){ .two-col { grid-template-columns:1fr 1fr; } }
//   .pad { padding:40px; }
//   .cap-grid { display:grid; gap:20px; margin-top:20px; }
//   @media(min-width:640px){ .cap-grid { grid-template-columns:1fr 1fr; } }
//   .cap-item { padding:20px; background:white; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); display:flex; gap:12px; }
//   .cap-icon { font-size:24px; color:#5b21b6; }

//   /* TESTIMONIALS + MAP */
//   .two-col-big { padding:60px 20px; display:grid; gap:40px; }
//   @media(min-width:1024px){ .two-col-big { grid-template-columns:1fr 1fr; } }
//   .review { padding:20px; border-left:4px solid #5b21b6; background:#f8fafc; border-radius:8px; }

//   /* CTA BAR */
//   .cta-bar { background:#5b21b6; color:white; padding:60px 20px; }
//   .cta-wrapper { max-width:800px; margin:auto; display:flex; flex-direction:column; gap:20px; align-items:center; }
//   @media(min-width:768px){ .cta-wrapper { flex-direction:row; justify-content:space-between; } }
//   .cta-big-btn { padding:16px 40px; background:white; color:#5b21b6; border-radius:12px; font-weight:bold; text-align:center; }

//   footer { background:#1f2937; color:#9ca3af; text-align:center; padding:30px; margin-top:20px; }
// </style>
// </head>

// <body>
// <div class="container">

//   <!-- HEADER -->
//   <header>
//     <h1>${name.split(" ")[0]} <span class="sub">${name.split(" ")[1] || ""}</span> <span style="font-size:14px; font-weight:400">Templates</span></h1>

//     <div class="right-info">
//       <span>${email}</span>
//       <span>${phone}</span>
//     </div>
//   </header>

//   <!-- HERO SECTION -->
//   <section class="hero">
//     <div>
//       <div class="hero-title">${hero_title}</div>
//       <div class="hero-sub">${hero_subtitle}</div>

//       <div class="cta-btns">
//         <div class="btn-primary">${cta_button}</div>
//         <div class="btn-secondary">Get Started</div>
//       </div>
//     </div>

//     <div>
//       <img src="${thumbnail}" class="hero-img" />
//       <div class="contact-box">📞 ${phone}</div>

//       <!-- WhatsApp Buttons -->
//       <a class="wa-btn" href="${whatsappBasic}" target="_blank">💬 Chat on WhatsApp</a>
//       <a class="wa-btn" href="${whatsappPrefilled}" target="_blank">📩 Quick Inquiry</a>
//       <a class="wa-btn" href="${whatsappAppointment}" target="_blank">📅 Book Appointment</a>
//     </div>
//   </section>

//   <!-- ABOUT + CAPABILITIES -->
//   <section class="two-col">
//     <div class="pad">
//       <h2>About Us</h2>
//       <p>${description}</p>
//     </div>

//     <div class="pad">
//       <h2>Our Capabilities</h2>

//       <div class="cap-grid">
//         <div class="cap-item"><div class="cap-icon">⭐</div><div><b>Premium Quality</b><p>Always delivering the best.</p></div></div>
//         <div class="cap-item"><div class="cap-icon">⚡</div><div><b>Fast Delivery</b><p>Quick and efficient service.</p></div></div>
//         <div class="cap-item"><div class="cap-icon">📞</div><div><b>Customer Support</b><p>Always there for our clients.</p></div></div>
//         <div class="cap-item"><div class="cap-icon">💰</div><div><b>Affordable Pricing</b><p>Growth shouldn't break the bank.</p></div></div>
//       </div>
//     </div>
//   </section>

//   <!-- TESTIMONIALS + MAP -->
//   <section class="two-col-big">
//     <div>
//       <h2>What Our Clients Say</h2>
//       <div class="review">"Great service!"</div>
//       <div class="review">"Amazing results!"</div>
//       <div class="review">"Very professional."</div>
//     </div>

//     <div>
//       <h2>Find Us</h2>
//       <iframe src="${mapSrc}" style="width:100%; height:300px; border-radius:12px;"></iframe>
//       <p style="margin-top:10px; text-align:center;">📍 ${address}</p>
//     </div>
//   </section>

//   <!-- CTA BAR -->
//   <section class="cta-bar">
//     <div class="cta-wrapper">
//       <div>
//         <h2 style="font-size:34px; font-weight:900;">Ready to Grow?</h2>
//         <p>Join thousands of successful businesses today.</p>
//       </div>

//       <div class="cta-big-btn">${cta_button}</div>
//     </div>
//   </section>

//   <!-- FOOTER -->
//   <footer>
//     © ${new Date().getFullYear()} ${name}. All rights reserved.  
//     <br/>Designed by LeadGen Pro
//   </footer>

// </div>
// </body>
// </html>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Demo Website - Purple Premium</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
/* ============================================================
   GLOBAL STYLES
============================================================ */
:root {
  --primary: #5b21b6;
  --primary-dark: #4c1d95;
  --accent: #2dd4bf;
  --light: #f3f4f6;
  --text: #333;
  --radius: 14px;
}

body {
  margin: 0;
  font-family: "Inter", Arial, sans-serif;
  background: #f9fafb;
  color: var(--text);
}

/* Container */
.container {
  max-width: 1200px;
  margin: auto;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

/* ============================================================
   HEADER
============================================================ */
header {
  background: var(--primary);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header h1 {
  font-size: 28px;
  font-weight: 900;
}
header .sub {
  color: var(--accent);
}
header .right-info span {
  margin-left: 16px;
  font-size: 14px;
}

/* Navigation */
nav {
  background: var(--primary-dark);
  padding: 10px;
  text-align: center;
}
nav a {
  color: white;
  margin: 0 12px;
  text-decoration: none;
  font-weight: 600;
}
nav a:hover {
  text-decoration: underline;
}

/* ============================================================
   ROUTING PAGES (Home, About, Contact)
============================================================ */
.page {
  display: none;
  padding-bottom: 50px;
}

/* Show active page */
.page.active {
  display: block;
}

/* ============================================================
   HERO SECTION
============================================================ */
.hero {
  padding: 60px 20px;
  display: grid;
  gap: 40px;
}
@media(min-width:1024px){
  .hero {
    grid-template-columns: 2fr 1fr;
  }
}
.hero-title {
  font-size: 44px;
  font-weight: 900;
}
.hero-sub {
  color: #555;
  margin-top: 10px;
  font-size: 20px;
}

.cta-btns {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media(min-width:640px){
  .cta-btns {
    flex-direction: row;
  }
}
.btn-primary {
  padding: 14px 30px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: center;
  font-weight: 700;
}
.btn-primary:hover {
  background: var(--primary-dark);
}
.btn-secondary {
  padding: 14px 30px;
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: center;
}

.hero-img {
  width: 100%;
  height: 330px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 4px solid #eee;
}

.contact-box {
  background: var(--light);
  padding: 16px;
  border-radius: var(--radius);
  text-align: center;
  margin-top: 12px;
  font-weight: bold;
}

/* ============================================================
   WHATSAPP BUTTONS
============================================================ */
.wa-btn {
  display: block;
  margin-top: 10px;
  padding: 12px;
  background: #25D366;
  color: white;
  text-align: center;
  border-radius: var(--radius);
  font-weight: bold;
  text-decoration: none;
}
.wa-btn:hover {
  background: #1ebe5d;
}

/* Floating WhatsApp */
#floating-wa {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #25D366;
  padding: 16px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 999;
}
#floating-wa img {
  width: 38px;
}

/* Floating Call Button (mobile only) */
#floating-call {
  display: none;
}
@media(max-width:768px){
  #floating-call {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: var(--primary);
    padding: 14px 20px;
    border-radius: 40px;
    color: white;
    font-weight: bold;
    z-index: 999;
    display: block;
  }
}

/* ============================================================
   ABOUT SECTION
============================================================ */
.two-col {
  display: grid;
}
@media(min-width:1024px){
  .two-col {
    grid-template-columns: 1fr 1fr;
  }
}
.pad {
  padding: 40px;
}

.cap-grid {
  display: grid;
  gap: 20px;
}
@media(min-width:640px){
  .cap-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.cap-item {
  background: #fff;
  padding: 20px;
  border-radius: var(--radius);
  display: flex;
  gap: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.cap-icon {
  font-size: 24px;
  color: var(--primary);
}

/* ============================================================
   REVIEWS SECTION
============================================================ */
.review-card {
  background: #fefefe;
  border-left: 4px solid var(--primary);
  margin: 20px 0;
  padding: 20px;
  border-radius: var(--radius);
}

/* ============================================================
   CONTACT PAGE
============================================================ */
.contact-box2 {
  padding: 20px;
  background: #f8f9fb;
  border-radius: var(--radius);
  margin: 20px 0;
}

/* ============================================================
   CTA BAR
============================================================ */
.cta-bar {
  background: var(--primary-dark);
  padding: 60px 20px;
  color: white;
}
.cta-big-btn {
  padding: 16px 40px;
  background: white;
  color: var(--primary);
  border-radius: var(--radius);
  font-weight: bold;
  text-align: center;
}

/* ============================================================
   FOOTER
============================================================ */
footer {
  background: #1f2937;
  color: #9ca3af;
  text-align: center;
  padding: 30px;
  margin-top: 20px;
}
</style>

<script>
/* ============================================================
   SIMPLE HASH ROUTER
============================================================ */
function route() {
  const hash = window.location.hash || "#home";
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelector(hash)?.classList.add("active");
}
window.addEventListener("hashchange", route);
window.addEventListener("load", route);
</script>

</head>

<body>

<!-- Floating WhatsApp -->
<a id="floating-wa" href="https://wa.me/911234567890" target="_blank">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" />
</a>

<!-- Floating Call -->
<a id="floating-call" href="tel:+911234567890">📞 Call Now</a>

<div class="container">

<!-- ============================================================
   PAGE 1 — HOME
============================================================ -->
<div class="page" id="home">

<header>
  <h1>Demo <span class="sub">Website</span></h1>
  <div class="right-info">
    <span>demo@gmail.com</span>
    <span>+91 12345 67890</span>
  </div>
</header>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-title">Grow Your Business Online</div>
    <div class="hero-sub">Your website is ready to launch. Zero setup needed.</div>

    <div class="cta-btns">
      <div class="btn-primary">Move This to Your Domain</div>
      <div class="btn-secondary">Get Started</div>
    </div>
  </div>

  <div>
    <img src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg" class="hero-img" />
    <div class="contact-box">📞 +91 12345 67890</div>

    <a class="wa-btn" href="https://wa.me/911234567890" target="_blank">💬 Chat on WhatsApp</a>
    <a class="wa-btn" href="https://wa.me/911234567890?text=Hi%20I%20visited%20your%20website" target="_blank">📩 Quick Inquiry</a>
    <a class="wa-btn" href="https://wa.me/911234567890?text=Appointment:" target="_blank">📅 Book Appointment</a>
  </div>
</section>

<!-- About + Capabilities -->
<section class="two-col">
  <div class="pad">
    <h2>About Us</h2>
    <p>
      We help small businesses go online instantly with beautiful prebuilt websites.
      No meetings, no delays — just instant results.
    </p>
  </div>

  <div class="pad">
    <h2>Capabilities</h2>

    <div class="cap-grid">
      <div class="cap-item"><div class="cap-icon">⭐</div><div><b>Premium Quality</b><p>Modern and clean design.</p></div></div>
      <div class="cap-item"><div class="cap-icon">⚡</div><div><b>Fast Delivery</b><p>Your website is built in seconds.</p></div></div>
      <div class="cap-item"><div class="cap-icon">📞</div><div><b>Support</b><p>We assist you anytime.</p></div></div>
      <div class="cap-item"><div class="cap-icon">💰</div><div><b>Affordable</b><p>Best pricing in the market.</p></div></div>
    </div>
  </div>
</section>

<!-- Reviews -->
<section class="pad">
  <h2>What Our Clients Say</h2>
  <div class="review-card">"Amazing service! My clinic website looks professional."</div>
  <div class="review-card">"Superfast delivery. Got my site in 2 minutes."</div>
  <div class="review-card">"Affordable and premium quality."</div>
</section>

<!-- CTA BAR -->
<section class="cta-bar">
  <h2 style="font-size:34px; font-weight:900; text-align:center;">Ready to Launch?</h2>
  <p style="text-align:center;">Move this website to your domain today.</p>
  <div class="cta-big-btn" style="margin:auto; max-width:300px;">Move to My Domain</div>
</section>

</div>

<!-- ============================================================
   PAGE 2 — ABOUT
============================================================ -->
<div class="page" id="about">

<header>
  <h1>About <span class="sub">Us</span></h1>
  <div class="right-info">
    <span>demo@gmail.com</span>
    <span>+91 12345 67890</span>
  </div>
</header>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>

<section class="pad">
  <h2>Who We Are</h2>
  <p>
    We build instant websites for small businesses using automation.
    Your website is generated, hosted, optimized, and delivered within seconds.
  </p>

  <h2>Our Mission</h2>
  <p>
    To make website creation effortless for every business owner in India.
  </p>

  <h2>Why Choose Us?</h2>
  <ul>
    <li>Fastest website builder in India</li>
    <li>Premium templates</li>
    <li>Google reviews integration</li>
    <li>WhatsApp booking system</li>
  </ul>
</section>

</div>

<!-- ============================================================
   PAGE 3 — CONTACT
============================================================ -->
<div class="page" id="contact">

<header>
  <h1>Contact <span class="sub">Us</span></h1>
  <div class="right-info">
    <span>demo@gmail.com</span>
    <span>+91 12345 67890</span>
  </div>
</header>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>

<section class="pad">
  <h2>Reach Out to Us</h2>

  <div class="contact-box2">
    <b>Email:</b> demo@gmail.com<br />
    <b>Phone:</b> +91 12345 67890
  </div>

  <h2>WhatsApp</h2>
  <a class="wa-btn" href="https://wa.me/911234567890" target="_blank">💬 Chat on WhatsApp</a>

  <h2>Visit Us</h2>
  <iframe
    style="width:100%; height:300px; border-radius:var(--radius);"
    src="https://maps.google.com/maps?q=Chennai&output=embed">
  </iframe>
</section>

</div>

<!-- ============================================================
   FOOTER
============================================================ -->
<footer>
  © 2025 Demo Website. All rights reserved.
</footer>

</div> <!-- container end -->

</body>
</html>

`;
}
