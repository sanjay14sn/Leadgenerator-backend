export function generateFullHTML(lead) {
  const name = lead.name || "HappySteps Preschool";
  const phone = lead.phone || "";
  const email = lead.email || "";
  const address = lead.address || "Your Preschool Address";
  const hero_title = lead.hero_title || "Play. Learn. Grow Together.";
  const hero_subtitle =
    lead.hero_subtitle ||
    "A joyful preschool where your child learns through fun, creativity, activities, and caring guidance.";
  const cta_button = lead.cta_button || "Book a School Visit";
  const description =
    lead.description ||
    "We help children grow confidently through guided play, storytelling, activities & social connection.";

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;

  const waQuick = `https://wa.me/${phone}?text=Hi%20I%20visited%20your%20website.%20I%20want%20to%20know%20more%20about%20your%20preschool.`;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<title>${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: #fff7f1;
  color: #222;
}

/* -------------------------
   TOP APP BAR
------------------------- */
header {
  background: #ff7ac3;
  padding: 18px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.logo {
  font-size: 22px;
  font-weight: 900;
}
.enroll-btn {
  padding: 10px 18px;
  background: white;
  color: #ff2e87;
  font-weight: 700;
  border-radius: 20px;
  text-decoration: none;
}

/* -------------------------
   HERO SECTION
------------------------- */
.hero-section {
  padding: 50px 25px;
}
.hero-title {
  font-size: 42px;
  font-weight: 900;
  line-height: 1.1;
}
.hero-subtitle {
  margin-top: 15px;
  font-size: 17px;
  max-width: 420px;
}

/* CARDS */
.card-row {
  display: flex;
  gap: 18px;
  margin-top: 40px;
  overflow-x: auto;
  padding-bottom: 10px;
}
.pixel-card {
  min-width: 260px;
  border-radius: 28px;
  padding: 25px;
  position: relative;
  color: black;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.pixel-card img {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 110px;
}

/* -------------------------
   INTRO SECTION
------------------------- */
.intro {
  padding: 40px 25px;
}
.intro-text {
  font-size: 17px;
  line-height: 1.6;
}
.emoji-row {
  margin-top: 18px;
  font-size: 30px;
}

/* -------------------------
   FEATURE CARDS
------------------------- */
.feature-section {
  padding: 40px 25px;
}
.feature-card {
  padding: 25px;
  background: white;
  border-radius: 18px;
  margin-bottom: 28px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.07);
}
.feature-title {
  font-size: 22px;
  font-weight: 900;
}
.feature-number {
  float: right;
  font-size: 32px;
  font-weight: 900;
  color: #ff7ac3;
}
.feature-img {
  margin-top: 20px;
  width: 100%;
  height: 180px;
  border-radius: 15px;
  object-fit: cover;
}

/* -------------------------
   REVIEWS (FIXED IMAGE SIZE)
------------------------- */
.review-section {
  padding: 40px 25px;
}
.review-title {
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  color: #ff7ac3;
}
.review-grid {
  margin-top: 25px;
  display: grid;
  gap: 20px;
}
.review-card {
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.07);
}
.review-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 15px;
}

/* -------------------------
   FAQ
------------------------- */
.faq {
  padding: 40px 25px;
}
.faq h2 {
  font-size: 24px;
  font-weight: 900;
}
.faq-item {
  margin-top: 15px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.faq-item summary {
  font-weight: 700;
  cursor: pointer;
}

/* -------------------------
   MAP
------------------------- */
.map-box {
  padding: 40px 25px;
}
iframe {
  width: 100%;
  height: 300px;
  border: 0;
  border-radius: 18px;
}

/* -------------------------
   CTA
------------------------- */
.bottom-cta {
  padding: 40px 25px;
  text-align: center;
}
.bottom-cta h2 {
  font-size: 30px;
  font-weight: 900;
}
.contact-btn {
  margin-top: 20px;
  padding: 12px 22px;
  background: #ff7ac3;
  color: white;
  border-radius: 25px;
  text-decoration: none;
}

/* FOOTER */
footer {
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 14px;
}
</style>
</head>

<body>

<header>
  <div class="logo">${name}</div>
  <a class="enroll-btn" href="${waQuick}">Enroll Now</a>
</header>

<section class="hero-section">
  <h1 class="hero-title">${hero_title}</h1>
  <p class="hero-subtitle">${hero_subtitle}</p>

  <div class="card-row">

    <div class="pixel-card" style="background:#4fa3ff; transform:rotate(-2deg);">
      <h2>500+</h2>
      <p style="font-weight:700; margin-top:35px;">Happy Kids</p>
      <p style="font-size:14px; opacity:0.8;">Growing & learning every day.</p>
      <img src="https://i.imgur.com/U7MZyus.png" />
    </div>

    <div class="pixel-card" style="background:#ffd96b; transform:rotate(1deg);">
      <h2>Daily Fun</h2>
      <p style="font-size:15px; opacity:0.8;">Activities, crafts & creativity.</p>
      <img src="https://i.imgur.com/R0yEJxJ.png" />
    </div>

    <div class="pixel-card" style="background:#8ee6b5; transform:rotate(-1deg);">
      <h2>50+</h2>
      <p style="font-weight:700; margin-top:35px;">Caring Teachers</p>
      <p style="font-size:14px; opacity:0.8;">Loving, trained & experienced.</p>
      <img src="https://i.imgur.com/xgJXUHw.png" />
    </div>

    <div class="pixel-card" style="background:#c7b4ff; transform:rotate(2deg);">
      <h2>Safe Space</h2>
      <p style="font-size:15px; opacity:0.8;">Secure & joyful environment.</p>
      <img src="https://i.imgur.com/YOeOlqD.png" />
    </div>

  </div>
</section>

<section class="intro">
  <div class="intro-text">${description}</div>
  <div class="emoji-row">😊 🧒 👧 🎨 🧩</div>
</section>

<section class="feature-section">
  <div class="feature-card">
    <div class="feature-title">Find Nearby Preschool</div>
    <div class="feature-number">01</div>
    <img src="https://images.unsplash.com/photo-1588072432836-e10032774350" class="feature-img" />
  </div>

  <div class="feature-card">
    <div class="feature-title">Live Teacher Updates</div>
    <div class="feature-number">02</div>
    <img src="https://plus.unsplash.com/premium_photo-1661385926819-5e09f7613ef3?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="feature-img" />
  </div>

  <div class="feature-card">
    <div class="feature-title">Daily Activity Feed</div>
    <div class="feature-number">03</div>
    <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9" class="feature-img" />
  </div>

  <div class="feature-card">
    <div class="feature-title">Parents Community</div>
    <div class="feature-number">04</div>
    <img src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c" class="feature-img" />
  </div>
</section>

<section class="review-section">
  <div class="review-title">Trusted by 3,000+ Parents</div>

  <div class="review-grid">
    <div class="review-card">
      <img src="https://images.unsplash.com/photo-1564429238817-393bd4286b2d?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      <div class="review-text"><b>${name}</b>: “Amazing environment. Kids enjoy every day!”</div>
    </div>

    <div class="review-card">
      <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9" />
      <div class="review-text"><b>Parent</b>: “Very safe, clean, and joyful.”</div>
    </div>
  </div>
</section>

<section class="faq">
  <h2>Questions? We got you.</h2>

  <details class="faq-item">
    <summary>What age groups do you accept?</summary>
    We accept children aged 2–6 years.
  </details>

  <details class="faq-item">
    <summary>How do I enroll?</summary>
    Contact us through WhatsApp or visit the preschool.
  </details>

  <details class="faq-item">
    <summary>Safety measures?</summary>
    CCTV, hygiene protocols, trained staff & child-safe facilities.
  </details>
</section>

<section class="map-box">
  <iframe src="${mapSrc}"></iframe>
  <p><b>Address:</b> ${address}</p>
  <p><b>Phone:</b> ${phone}</p>
  <p><b>Email:</b> ${email}</p>
</section>

<section class="bottom-cta">
  <h2>Level up your child’s future.</h2>
  <a href="${waQuick}" class="contact-btn">${cta_button}</a>
</section>

<footer>
  © ${new Date().getFullYear()} ${name}
</footer>

</body>
</html>
`;
}
