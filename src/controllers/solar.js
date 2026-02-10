export function generateFullHTML(lead = {}) {
  const name = lead?.name || "Solar Shop";
  const phone = lead?.phone || "+91 98765 43210";
  const email = lead?.email || "hello@solarshop.com";
  const address = lead?.address || "Solar Market, Green City";
  const heroTitle = lead?.hero_title || "Power Your Future With Solar Energy";
  const heroSubtitle = lead?.hero_subtitle || "Switch to clean energy, reduce your electricity bills to zero, and secure a greener tomorrow.";
  const description = lead?.description || "We provide premium Tier-1 solar panels and smart inverter solutions. Our expert team ensures a hassle-free installation with a 25-year performance warranty.";
  const thumbnail = lead?.thumbnail || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200";

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name} | Solar Solutions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
        .bg-glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .product-card:hover img { transform: scale(1.1); }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 selection:bg-yellow-200">

    <header class="sticky top-0 z-50 bg-slate-900 text-white shadow-xl">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex gap-3 items-center">
                <div class="bg-yellow-500 p-2 rounded-lg text-slate-900">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
                </div>
                <h1 class="text-xl font-bold tracking-tight uppercase">${name}</h1>
            </div>
            <div class="hidden md:flex gap-6 text-sm font-semibold items-center">
                <span class="hover:text-yellow-400 cursor-pointer transition">${phone}</span>
                <button onclick="document.getElementById('contact-section').scrollIntoView()" class="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-6 py-2 rounded-full transition font-bold shadow-lg">Get Quote</button>
            </div>
        </div>
    </header>

    <section class="relative bg-slate-900 text-white overflow-hidden">
        <div class="absolute inset-0 z-0">
            <img src="${thumbnail}" alt="Solar Panels" class="w-full h-full object-cover opacity-40" />
            <div class="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
            <div>
                <div class="inline-block px-3 py-1 mb-6 border border-yellow-500/50 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-bold tracking-wider uppercase">Sustainable Energy Solutions</div>
                <h1 class="text-5xl lg:text-7xl font-bold leading-tight mb-6">${heroTitle}</h1>
                <p class="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">${heroSubtitle}</p>
                <button onclick="document.getElementById('steps-section').scrollIntoView()" class="bg-yellow-500 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition shadow-lg">How it Works</button>
            </div>
            
            <div class="bg-glass p-8 rounded-3xl shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">Solar Calculator</h3>
                    <span class="text-yellow-400">⚡ Smart Estimate</span>
                </div>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Monthly Electricity Bill (₹)</label>
                        <input type="number" id="bill" value="3000" oninput="calculate()" class="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">City</label>
                            <select id="city" onchange="calculate()" class="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none">
                                <option>Chennai</option><option>Delhi</option><option>Mumbai</option><option>Hyderabad</option><option>Bangalore</option><option>Kolkata</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Roof (sqft)</label>
                            <input type="number" id="roof" value="500" oninput="calculate()" class="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none">
                        </div>
                    </div>
                    <div class="bg-slate-900/80 rounded-xl p-5 border-l-4 border-yellow-500">
                        <div class="grid grid-cols-2 gap-4 border-b border-slate-700 pb-4">
                            <div><span class="text-xs text-slate-400 uppercase">Rec. System</span><p class="text-2xl font-bold text-white"><span id="outKW">0</span> kW</p></div>
                            <div class="text-right"><span class="text-xs text-slate-400 uppercase">Est. Cost</span><p class="text-xl font-bold text-white">₹<span id="outCost">0</span></p></div>
                        </div>
                        <div class="pt-4 flex justify-between items-center">
                            <span class="text-slate-300 text-sm">25-Year Savings:</span>
                            <span class="text-xl font-bold text-green-400">₹<span id="outSave">0</span></span>
                        </div>
                        <button onclick="toggleModal(true)" class="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm py-3 rounded-lg flex items-center justify-center gap-2">
                           <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                           Download Detailed Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="steps-section" class="py-20 px-6 max-w-7xl mx-auto">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How Solar Works for You</h2>
            <p class="text-slate-500 max-w-2xl mx-auto">We simplify the transition to renewable energy. From calculation to installation, we handle everything.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                <div class="bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center text-yellow-400 font-bold mb-6">01</div>
                <h3 class="text-xl font-bold text-slate-900 mb-3">Analyze & Design</h3>
                <p class="text-slate-500 leading-relaxed">We analyze your bill and roof structure to design the perfect 3D model for maximum efficiency.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                <div class="bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center text-yellow-400 font-bold mb-6">02</div>
                <h3 class="text-xl font-bold text-slate-900 mb-3">Installation</h3>
                <p class="text-slate-500 leading-relaxed">Our certified technicians install Tier-1 panels and inverters with zero structural damage to your roof.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                <div class="bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center text-yellow-400 font-bold mb-6">03</div>
                <h3 class="text-xl font-bold text-slate-900 mb-3">Net Metering</h3>
                <p class="text-slate-500 leading-relaxed">We handle government approvals. Excess power generated is sent back to the grid, giving you credits.</p>
            </div>
        </div>
    </section>

    <section class="bg-slate-100 py-20 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <span class="text-yellow-600 font-bold tracking-widest uppercase text-xs">Our Technology</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Premium Solar Kits</h2>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="product-card group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&q=80&w=500" class="w-full h-full object-cover transition duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <p class="text-yellow-400 text-xs font-bold uppercase mb-1">High Efficiency</p>
                        <h4 class="text-white text-xl font-bold">Monocrystalline Panels</h4>
                    </div>
                </div>
                <div class="product-card group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=500" class="w-full h-full object-cover transition duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <p class="text-yellow-400 text-xs font-bold uppercase mb-1">Smart Grid Tie</p>
                        <h4 class="text-white text-xl font-bold">Hybrid Inverters</h4>
                    </div>
                </div>
                <div class="product-card group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=500" class="w-full h-full object-cover transition duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <p class="text-yellow-400 text-xs font-bold uppercase mb-1">Night Backup</p>
                        <h4 class="text-white text-xl font-bold">Lithium Storage</h4>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="contact-section" class="py-20 px-6 max-w-7xl mx-auto">
        <div class="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row text-white">
            <div class="lg:w-1/2 p-12">
                <h3 class="text-3xl font-bold mb-4">Request a Site Visit</h3>
                <p class="text-slate-400 mb-8">${description}</p>
                <form class="space-y-4">
                    <input type="text" placeholder="Name" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500">
                    <input type="tel" placeholder="Phone" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500">
                    <textarea placeholder="Message" rows="3" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"></textarea>
                    <button type="button" class="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-lg shadow-lg">Send Request</button>
                </form>
            </div>
            <div class="lg:w-1/2 bg-slate-800 flex flex-col">
                <div class="h-64 lg:h-1/2 w-full">
                    <iframe src="${mapSrc}" class="w-full h-full opacity-80" loading="lazy"></iframe>
                </div>
                <div class="p-10 lg:h-1/2 flex flex-col justify-center gap-6">
                    <div class="flex gap-4 items-center">
                        <div class="bg-slate-700 p-3 rounded-lg text-yellow-500">
                            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <div><p class="text-xs text-slate-400 font-bold uppercase">Visit Us</p><p class="font-medium">${address}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <div class="bg-slate-700 p-3 rounded-lg text-yellow-500">
                            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div><p class="text-xs text-slate-400 font-bold uppercase">Call Now</p><p class="font-medium font-mono">${phone}</p></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div id="pdfModal" class="hidden fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
            <h4 class="text-2xl font-bold mb-2">Download Quote</h4>
            <p class="text-slate-500 mb-6">Enter your name to personalize the PDF.</p>
            <input type="text" id="custName" placeholder="Your Name" class="w-full bg-slate-100 p-4 rounded-xl border mb-4 outline-none focus:border-yellow-500">
            <div class="flex gap-3">
                <button onclick="toggleModal(false)" class="flex-1 text-slate-500 font-bold">Cancel</button>
                <button onclick="downloadPDF()" class="flex-1 bg-yellow-500 text-slate-900 font-bold py-3 rounded-xl">Download</button>
            </div>
        </div>
    </div>

    <footer class="py-8 bg-slate-50 text-center border-t border-slate-200">
        <p class="text-slate-400 text-sm">© ${new Date().getFullYear()} ${name}. Powered by Green Energy.</p>
    </footer>

    <script>
        const sunHoursData = { Chennai: 4.5, Delhi: 4.8, Mumbai: 4.3, Hyderabad: 4.4, Bangalore: 4.6, Kolkata: 4.2, Other: 4.5 };
        const UNIT_PRICE = 8;
        const SQFT_PER_KW = 100;
        const PRICE_PER_KW = 50000;

        function calculate() {
            const bill = parseFloat(document.getElementById('bill').value) || 0;
            const city = document.getElementById('city').value;
            const roof = parseFloat(document.getElementById('roof').value) || 0;
            const units = bill / UNIT_PRICE;
            const reqKW = (units / 30) / sunHoursData[city];
            const maxKW = roof / SQFT_PER_KW;
            const finalKW = Math.min(reqKW, maxKW);
            
            document.getElementById('outKW').innerText = finalKW.toFixed(2);
            document.getElementById('outCost').innerText = Math.round(finalKW * PRICE_PER_KW).toLocaleString('en-IN');
            document.getElementById('outSave').innerText = Math.round(units * UNIT_PRICE * 12 * 25).toLocaleString('en-IN');
        }

        function toggleModal(show) { document.getElementById('pdfModal').classList.toggle('hidden', !show); }

        function downloadPDF() {
            const cName = document.getElementById('custName').value;
            if(!cName) return alert("Name is required");
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 40, "F");
            doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("${name}", 20, 25);
            doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.text("Solar Quote for " + cName, 20, 60);
            doc.setFontSize(12); doc.text("System Size: " + document.getElementById('outKW').innerText + " kW", 20, 75);
            doc.text("Cost: Rs. " + document.getElementById('outCost').innerText, 20, 85);
            doc.save(cName + "_SolarQuote.pdf");
            toggleModal(false);
        }
        calculate();
    </script>
</body>
</html>
`;
}