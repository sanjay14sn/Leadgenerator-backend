export function generateFullHTML(lead) {
  const name = lead.name || "Kids Play";
  const phone = lead.phone || "(555) 123-4567";
  const email = lead.email || "hello@kidsplay.com";
  const address = lead.address || "123 Play Street, New York";
  const heroTitle = lead.hero_title || "Providing Good Qualities For Your Loving Kids";
  const heroSubtitle = lead.hero_subtitle || "Welcome to Kids Play";
  const cta = lead.cta_button || "Buy Ticket";
  const description = lead.description || "There are many variations of passages of Lorem Ipsum available, but the majority suffered alteration.";
  const thumbnail = lead.thumbnail || "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg";

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const testimonials = lead.testimonials?.length
    ? lead.testimonials.slice(0, 3)
    : [
        { name: "Wade Warren", place: "Toledo", text: "I want you to know that everyone is very impressed and pleased with the work of your entire teams.", color: "#dbeafe" },
        { name: "Jane Cooper", place: "Austin", text: "The environment is so safe and the staff is incredibly friendly. My kids never want to leave!", color: "#fef9c3" },
        { name: "Savannah Nguyen", place: "Owaria", text: "Best playground in the city. The indoor activities are creative and very engaging for all ages.", color: "#fce7f3" },
      ];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
  <style>
    :root {
      --purple: #8E44AD;
      --bg-cream: #FFF9F1;
      --pink: #ec4899;
      --blue: #3b82f6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-cream);
      color: #374151;
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { animation: fadeInUp 0.6s ease-out forwards; }

    /* Navbar */
    nav {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background: rgba(255, 249, 241, 0.8);
      backdrop-filter: blur(10px);
      z-index: 1000;
    }
    .logo-box {
      background: var(--pink);
      color: white;
      font-weight: bold;
      padding: 5px 12px;
      border-radius: 8px;
      margin-right: 10px;
    }
    .nav-links { display: none; gap: 30px; font-weight: 500; }
    @media (min-width: 768px) { .nav-links { display: flex; } }
    .nav-links a { text-decoration: none; color: inherit; transition: 0.3s; }
    .nav-links a:hover { color: var(--purple); }
    .cta-btn {
      background: var(--purple);
      color: white;
      padding: 10px 24px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(142, 68, 173, 0.3);
      transition: 0.3s;
    }
    .cta-btn:hover { opacity: 0.9; transform: scale(1.05); }

    /* Hero */
    .hero {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }
    @media (min-width: 768px) { .hero { grid-template-columns: 1fr 1fr; padding: 80px 20px; } }
    .hero-subtitle { color: var(--blue); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; font-size: 14px; }
    .hero h1 { font-size: 2.5rem; line-height: 1.1; margin: 15px 0; color: #111827; }
    @media (min-width: 768px) { .hero h1 { font-size: 3.5rem; } }
    
    .hero-img-container { position: relative; display: flex; justify-content: center; }
    .hero-circle {
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1/1;
      border: 14px solid white;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .hero-circle img { width: 100%; height: 100%; object-fit: cover; }
    .blob { position: absolute; bottom: -10px; right: 10px; width: 100px; height: 100px; background: #fbbf24; border-radius: 50%; z-index: -1; }

    /* Section Headers */
    .section-tag { color: var(--purple); font-weight: 700; text-transform: uppercase; font-size: 14px; }
    .section-title { font-size: 32px; font-weight: 800; margin-top: 10px; color: #111827; }

    /* Grid Layouts */
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
      margin-top: 50px;
    }
    @media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

    /* Service Cards */
    .card {
      background: white;
      padding: 35px;
      border-radius: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border-bottom: 6px solid #f3f4f6;
      transition: 0.3s;
    }
    .card:hover { transform: translateY(-10px); }
    .icon-box {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 30px; margin-bottom: 20px;
    }

    /* Activity Grid */
    .activity-card {
      background: var(--bg-cream);
      border-radius: 28px;
      overflow: hidden;
      transition: 0.3s;
    }
    .activity-card img { width: 100%; height: 220px; object-fit: cover; }
    .activity-content { padding: 25px; text-align: left; }

    /* Map Section */
    .map-section {
      background: var(--bg-cream);
      padding: 80px 20px;
    }
    .map-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }
    @media (min-width: 1024px) { .map-grid { grid-template-columns: 1fr 1fr; } }
    .location-card { background: white; padding: 40px; border-radius: 32px; text-align: left; }
    .iframe-container { height: 400px; border-radius: 40px; overflow: hidden; border: 8px solid white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }

    /* Testimonials */
    .testimonials { padding: 80px 20px; background: #FFF4E9; text-align: center; }
    .testimonial-card { padding: 40px; border-radius: 32px; position: relative; }
    .quote-mark { position: absolute; top: 20px; left: 20px; font-size: 60px; opacity: 0.1; line-height: 1; }

    /* Footer */
    footer { background: #1A1A1A; color: #9ca3af; padding: 80px 20px 40px; }
    .footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 50px;
    }
    @media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .footer-grid { grid-template-columns: repeat(4, 1fr); } }
    .footer-title { color: white; font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .footer-list { list-style: none; padding: 0; }
    .footer-list li { margin-bottom: 12px; }
  </style>
</head>
<body>

  <nav>
    <div style="display: flex; align-items: center;">
      <div class="logo-box">${name.substring(0, 2).toUpperCase()}</div>
      <span style="font-size: 24px; font-weight: 800;">${name}</span>
    </div>
    <div class="nav-links">
      <a href="#" style="color: var(--purple)">Home</a>
      <a href="#">About</a>
      <a href="#">Services</a>
      <a href="#">Contact</a>
    </div>
    <a href="#" class="cta-btn">${cta}</a>
  </nav>

  <section class="hero animate">
    <div style="text-align: center; max-width: 600px; margin: 0 auto;" class="md:text-left">
      <span class="hero-subtitle">${heroSubtitle}</span>
      <h1>${heroTitle}</h1>
      <a href="#" class="cta-btn" style="padding: 16px 40px; font-size: 18px; display: inline-block; margin-top: 20px;">${cta}</a>
    </div>
    <div class="hero-img-container">
      <div class="hero-circle">
        <img src="${thumbnail}" alt="Hero" />
      </div>
      <div class="blob"></div>
    </div>
  </section>

  <section style="background: white; padding: 80px 20px;">
    <div class="hero" style="padding: 0;">
      <div class="iframe-container" style="height: 450px;">
        <img src="https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      <div class="animate">
        <span class="section-tag">About Us</span>
        <h2 class="section-title">Special Care For Your Children</h2>
        <p style="color: #6b7280; font-size: 18px;">${description}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; font-weight: 600;">
          <div><span style="color: #22c55e;">✔</span> Experienced Staff</div>
          <div><span style="color: #22c55e;">✔</span> Safety First</div>
          <div><span style="color: #22c55e;">✔</span> Creative Learning</div>
          <div><span style="color: #22c55e;">✔</span> Daily Activities</div>
        </div>
      </div>
    </div>
  </section>

  <section style="padding: 80px 20px; text-align: center;">
    <span class="section-tag">Featured</span>
    <h2 class="section-title">Best Playground Fun</h2>
    <div class="grid-3 max-w-7xl" style="max-width: 1200px; margin-left: auto; margin-right: auto;">
      <div class="card animate">
        <div class="icon-box" style="background: #22c55e;">🛡️</div>
        <h3>Safety Zone</h3>
        <p>Fun, safe and engaging activities designed for kids.</p>
      </div>
      <div class="card animate">
        <div class="icon-box" style="background: #60a5fa;">🎭</div>
        <h3>Kids Entertainment</h3>
        <p>Engaging performances and creative play sessions.</p>
      </div>
      <div class="card animate">
        <div class="icon-box" style="background: #ec4899;">🍕</div>
        <h3>Playland & Cafe</h3>
        <p>A place for kids to play and parents to relax.</p>
      </div>
    </div>
  </section>

  <section class="map-section">
    <div class="map-grid">
      <div class="animate">
        <h2 class="section-title">Visit Our Location</h2>
        <div class="location-card">
          <p><strong>📍 Address:</strong><br/>${address}</p>
          <p style="margin-top: 20px;"><strong>📞 Phone:</strong><br/>${phone}</p>
          <p style="margin-top: 20px;"><strong>✉️ Email:</strong><br/>${email}</p>
        </div>
      </div>
      <div class="iframe-container animate">
        <iframe src="${mapSrc}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>
  </section>

  <section class="testimonials">
    <span class="section-tag">Client Says</span>
    <h2 class="section-title">What Parents Say</h2>
    <div class="grid-3" style="max-width: 1200px; margin-left: auto; margin-right: auto;">
      ${testimonials.map(t => `
        <div class="testimonial-card animate" style="background: ${t.color || 'white'}">
          <div class="quote-mark">“</div>
          <p style="font-style: italic; position: relative; z-index: 1;">${t.text}</p>
          <div style="color: #f59e0b; margin: 15px 0;">★★★★★</div>
          <p><strong>${t.name}</strong></p>
          <small>${t.place || ''}</small>
        </div>
      `).join('')}
    </div>
  </section>

  <footer>
    <div class="footer-grid">
      <div>
        <div class="footer-title">${name}</div>
        <p style="font-size: 14px;">${description.substring(0, 120)}...</p>
      </div>
      <div>
        <div class="footer-title">Contact Us</div>
        <ul class="footer-list">
          <li>📍 ${address}</li>
          <li>📞 ${phone}</li>
          <li>✉️ ${email}</li>
        </ul>
      </div>
      <div>
        <div class="footer-title">Quick Links</div>
        <ul class="footer-list">
          <li>About Us</li>
          <li>Safety Policy</li>
          <li>Careers</li>
        </ul>
      </div>
      <div>
        <div class="footer-title">Newsletter</div>
        <div style="display: flex; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 50px;">
          <input type="text" placeholder="Email" style="background: transparent; border: none; color: white; padding: 10px; outline: none; width: 100%;">
          <button style="background: var(--purple); border: none; color: white; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">→</button>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 60px; font-size: 12px; opacity: 0.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
      © ${new Date().getFullYear()} ${name}. All Rights Reserved.
    </div>
  </footer>

</body>
</html>
`;
}