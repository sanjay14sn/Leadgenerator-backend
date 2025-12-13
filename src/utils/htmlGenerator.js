export function generateFullHTML(lead) {
  const name = lead.name || "Your Company";
  const phone = lead.phone || "";
  const email = lead.email || "info@company.com";
  const address = lead.address || "Your Business Address";
  const heroTitle = lead.hero_title || "Unlock Your Business's Full Potential";
  const heroSubtitle =
    lead.hero_subtitle ||
    "Trusted by thousands of customers. Built for growth and success.";
  const cta = lead.cta_button || "Get Started Today!";
  const description =
    lead.description ||
    "We help businesses grow with high-quality services, reliable support, and affordable pricing.";
  const thumbnail =
    lead.thumbnail ||
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg";

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;

  const testimonials = lead.testimonials?.length
    ? lead.testimonials.slice(0, 3)
    : [
        {
          name: "Raj Patel",
          text: "Great service and amazing quality!",
        },
        {
          name: "Ananya Sharma",
          text: "Professional team and excellent support.",
        },
        {
          name: "Vikram Singh",
          text: "Highly recommended for local businesses.",
        },
      ];

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
  font-family: Inter, Arial, sans-serif;
  background: #f9fafb;
  color: #1f2937;
}

/* WRAPPER */
.wrapper {
  max-width: 1200px;
  margin: auto;
  background: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

/* HEADER */
header {
  background: #5b21b6;
  color: white;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header h1 {
  font-size: 26px;
  font-weight: 900;
}
header span {
  color: #2dd4bf;
}

/* HERO */
.hero {
  padding: 80px 32px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 48px;
}
.hero h2 {
  font-size: 48px;
  font-weight: 900;
}
.hero p {
  font-size: 20px;
  margin-top: 16px;
  color: #4b5563;
}
.hero-buttons {
  margin-top: 32px;
}
.hero-buttons a {
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  margin-right: 12px;
}
.primary-btn {
  background: #6d28d9;
  color: white;
}
.secondary-btn {
  border: 1px solid #d1d5db;
  color: #6d28d9;
}

/* HERO IMAGE */
.hero img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 16px;
}

/* ABOUT + CAPABILITIES */
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f3f4f6;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}
.split > div {
  padding: 48px;
}
.capabilities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.cap-card {
  background: white;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

/* TESTIMONIALS + MAP */
.section {
  padding: 64px 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}
.review {
  background: #f9fafb;
  padding: 20px;
  border-left: 5px solid #6d28d9;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* CTA */
.cta {
  background: #6d28d9;
  color: white;
  padding: 64px 32px;
  text-align: center;
}
.cta a {
  background: white;
  color: #6d28d9;
  padding: 16px 36px;
  border-radius: 14px;
  font-weight: 900;
  text-decoration: none;
}

/* FOOTER */
footer {
  background: #111827;
  color: #9ca3af;
  text-align: center;
  padding: 24px;
  font-size: 14px;
}

/* RESPONSIVE */
@media(max-width: 900px) {
  .hero, .split, .section {
    grid-template-columns: 1fr;
  }
}
</style>
</head>

<body>

<div class="wrapper">

<header>
  <h1>${name.split(" ")[0]} <span>${name.split(" ")[1] || ""}</span></h1>
  <div>${email} | ${phone}</div>
</header>

<section class="hero">
  <div>
    <h2>${heroTitle}</h2>
    <p>${heroSubtitle}</p>
    <div class="hero-buttons">
      <a class="primary-btn" href="#">${cta}</a>
      <a class="secondary-btn" href="#">Discover More</a>
    </div>
  </div>

  <div>
    <img src="${thumbnail}" />
    <p style="margin-top:12px;font-weight:700;">📞 ${phone}</p>
  </div>
</section>

<section class="split">
  <div>
    <h3>About Us</h3>
    <p>${description}</p>
  </div>

  <div>
    <h3>Our Capabilities</h3>
    <div class="capabilities">
      <div class="cap-card">⭐ Premium Quality</div>
      <div class="cap-card">⚡ Fast Delivery</div>
      <div class="cap-card">📞 Customer Support</div>
      <div class="cap-card">💰 Affordable Pricing</div>
    </div>
  </div>
</section>

<section class="section">
  <div>
    <h3>What Our Clients Say</h3>
    ${testimonials
      .map(
        (r) => `
      <div class="review">
        <p>"${r.text}"</p>
        <b>${r.name}</b>
      </div>`
      )
      .join("")}
  </div>

  <div>
    <h3>Find Us</h3>
    <iframe src="${mapSrc}" width="100%" height="300" style="border:0;border-radius:16px;"></iframe>
    <p style="margin-top:12px;">📍 ${address}</p>
  </div>
</section>

<section class="cta">
  <h2>Ready to Grow?</h2>
  <p>Join thousands of successful businesses today.</p>
  <a href="#">${cta}</a>
</section>

<footer>
  © ${new Date().getFullYear()} ${name}. All rights reserved.
</footer>

</div>

</body>
</html>
`;
}
