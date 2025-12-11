// src/utils/htmlGenerator.js
export function generateFullHTML(lead) {
  return `
<!DOCTYPE html>
<html>
<head>
<title>${lead.name}</title>
<meta charset="UTF-8"/>
</head>
<body>
<h1>${lead.hero_title || lead.name}</h1>
<p>${lead.hero_subtitle || ""}</p>
<p>${lead.description || ""}</p>
<p>📞 ${lead.phone}</p>
<p>📍 ${lead.address}</p>
</body>
</html>
`;
}
