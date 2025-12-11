// src/utils/htmlGenerator.js

export function generateFullHTML(lead) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${lead.name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta name="description" content="${lead.description || ""}">
  <meta name="keywords" content="${lead.category}, business, services">
  <meta name="robots" content="index, follow">

  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; }
    header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    h1 { margin: 0; font-size: 32px; }
    .container { padding: 20px; max-width: 900px; margin: auto; }
    img { width: 100%; border-radius: 12px; margin: 20px 0; }
    .footer { background: #111; color: #bbb; text-align: center; padding: 20px; margin-top: 40px; }
  </style>
</head>

<body>

<header>
  <h1>${lead.hero_title || lead.name}</h1>
  <p>${lead.hero_subtitle || ""}</p>
</header>

<div class="container">

  <img src="${lead.thumbnail}" alt="Business Image">

  <h2>About Us</h2>
  <p>${lead.description || ""}</p>

  <h2>Contact</h2>
  <p><b>Phone:</b> ${lead.phone}</p>
  <p><b>Address:</b> ${lead.address}</p>

</div>

<footer class="footer">
  Powered by LeadGen Websites © ${new Date().getFullYear()}
</footer>

</body>
</html>
`;
}
