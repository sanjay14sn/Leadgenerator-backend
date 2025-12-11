export function generateFullHTML(lead) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${lead.name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: Arial; padding: 20px;">
  <h1>${lead.hero_title || lead.name}</h1>
  <p>${lead.hero_subtitle || ""}</p>

  <img src="${lead.thumbnail || ""}" style="width:100%; border-radius:10px; margin-top:20px;" />

  <h2>About Us</h2>
  <p>${lead.description || ""}</p>

  <h2>Contact</h2>
  <p>📞 ${lead.phone}</p>
  <p>📍 ${lead.address}</p>

  <footer style="margin-top:40px; color:#888;">
    Powered by LeadGen Websites © ${new Date().getFullYear()}
  </footer>
</body>
</html>
`;
}
