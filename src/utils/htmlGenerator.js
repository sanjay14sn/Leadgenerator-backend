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
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
  body { margin:0; font-family: Arial, sans-serif; background:#f9fafb; color:#333; }
  .container { max-width: 1200px; margin:auto; background:white; box-shadow:0 4px 20px rgba(0,0,0,0.1); }

  /* HEADER */
  header { background:#4c1d95; color:white; padding:20px; display:flex; justify-content:space-between; align-items:center; }
  header h1 { font-size:28px; font-weight:900; }
  header .sub { color:#2dd4bf; margin-left:6px; }
  header .right-info { display:none; gap:16px; font-size:14px; }
  @media(min-width:768px){ header .right-info { display:flex; } }

  /* HERO */
  .hero { padding:60px 20px; display:grid; gap:40px; }
  @media(min-width:1024px){ .hero { grid-template-columns:2fr 1fr; } }
  .hero-title { font-size:42px; font-weight:900; }
  .hero-sub { font-size:20px; margin-top:15px; color:#555; }
  .cta-btns { margin-top:25px; display:flex; flex-direction:column; gap:12px; }
  @media(min-width:640px){ .cta-btns { flex-direction:row; } }
  .btn-primary { padding:14px 30px; background:#5b21b6; color:white; border-radius:8px; cursor:pointer; font-weight:bold; text-align:center; }
  .btn-primary:hover { background:#4c1d95; }
  .btn-secondary { padding:14px 30px; border:1px solid #ddd; color:#5b21b6; border-radius:8px; cursor:pointer; text-align:center; }

  /* IMAGE */
  .hero-img { width:100%; height:300px; object-fit:cover; border-radius:12px; border:4px solid #eee; }
  .contact-box { margin-top:15px; padding:16px; background:#f3f4f6; border-radius:10px; text-align:center; font-weight:bold; }

  /* WHATSAPP BUTTONS */
  .wa-btn { 
    display:block; 
    margin-top:10px;
    padding:12px; 
    background:#25D366; 
    color:white; 
    text-align:center; 
    border-radius:8px; 
    font-weight:bold; 
    text-decoration:none;
  }
  .wa-btn:hover { background:#1ebe5d; }

  /* TWO COLUMN (ABOUT + CAPABILITIES) */
  .two-col { display:grid; border-top:1px solid #eee; border-bottom:1px solid #eee; }
  @media(min-width:1024px){ .two-col { grid-template-columns:1fr 1fr; } }
  .pad { padding:40px; }
  .cap-grid { display:grid; gap:20px; margin-top:20px; }
  @media(min-width:640px){ .cap-grid { grid-template-columns:1fr 1fr; } }
  .cap-item { padding:20px; background:white; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); display:flex; gap:12px; }
  .cap-icon { font-size:24px; color:#5b21b6; }

  /* TESTIMONIALS + MAP */
  .two-col-big { padding:60px 20px; display:grid; gap:40px; }
  @media(min-width:1024px){ .two-col-big { grid-template-columns:1fr 1fr; } }
  .review { padding:20px; border-left:4px solid #5b21b6; background:#f8fafc; border-radius:8px; }

  /* CTA BAR */
  .cta-bar { background:#5b21b6; color:white; padding:60px 20px; }
  .cta-wrapper { max-width:800px; margin:auto; display:flex; flex-direction:column; gap:20px; align-items:center; }
  @media(min-width:768px){ .cta-wrapper { flex-direction:row; justify-content:space-between; } }
  .cta-big-btn { padding:16px 40px; background:white; color:#5b21b6; border-radius:12px; font-weight:bold; text-align:center; }

  footer { background:#1f2937; color:#9ca3af; text-align:center; padding:30px; margin-top:20px; }
</style>
</head>

<body>
<div class="container">

  <!-- HEADER -->
  <header>
    <h1>${name.split(" ")[0]} <span class="sub">${name.split(" ")[1] || ""}</span> <span style="font-size:14px; font-weight:400">Templates</span></h1>

    <div class="right-info">
      <span>${email}</span>
      <span>${phone}</span>
    </div>
  </header>

  <!-- HERO SECTION -->
  <section class="hero">
    <div>
      <div class="hero-title">${hero_title}</div>
      <div class="hero-sub">${hero_subtitle}</div>

      <div class="cta-btns">
        <div class="btn-primary">${cta_button}</div>
        <div class="btn-secondary">Get Started</div>
      </div>
    </div>

    <div>
      <img src="${thumbnail}" class="hero-img" />
      <div class="contact-box">📞 ${phone}</div>

      <!-- WhatsApp Buttons -->
      <a class="wa-btn" href="${whatsappBasic}" target="_blank">💬 Chat on WhatsApp</a>
      <a class="wa-btn" href="${whatsappPrefilled}" target="_blank">📩 Quick Inquiry</a>
      <a class="wa-btn" href="${whatsappAppointment}" target="_blank">📅 Book Appointment</a>
    </div>
  </section>

  <!-- ABOUT + CAPABILITIES -->
  <section class="two-col">
    <div class="pad">
      <h2>About Us</h2>
      <p>${description}</p>
    </div>

    <div class="pad">
      <h2>Our Capabilities</h2>

      <div class="cap-grid">
        <div class="cap-item"><div class="cap-icon">⭐</div><div><b>Premium Quality</b><p>Always delivering the best.</p></div></div>
        <div class="cap-item"><div class="cap-icon">⚡</div><div><b>Fast Delivery</b><p>Quick and efficient service.</p></div></div>
        <div class="cap-item"><div class="cap-icon">📞</div><div><b>Customer Support</b><p>Always there for our clients.</p></div></div>
        <div class="cap-item"><div class="cap-icon">💰</div><div><b>Affordable Pricing</b><p>Growth shouldn't break the bank.</p></div></div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS + MAP -->
  <section class="two-col-big">
    <div>
      <h2>What Our Clients Say</h2>
      <div class="review">"Great service!"</div>
      <div class="review">"Amazing results!"</div>
      <div class="review">"Very professional."</div>
    </div>

    <div>
      <h2>Find Us</h2>
      <iframe src="${mapSrc}" style="width:100%; height:300px; border-radius:12px;"></iframe>
      <p style="margin-top:10px; text-align:center;">📍 ${address}</p>
    </div>
  </section>

  <!-- CTA BAR -->
  <section class="cta-bar">
    <div class="cta-wrapper">
      <div>
        <h2 style="font-size:34px; font-weight:900;">Ready to Grow?</h2>
        <p>Join thousands of successful businesses today.</p>
      </div>

      <div class="cta-big-btn">${cta_button}</div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    © ${new Date().getFullYear()} ${name}. All rights reserved.  
    <br/>Designed by LeadGen Pro
  </footer>

</div>
</body>
</html>
`;
}
