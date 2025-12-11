export function renderTemplateB(lead) {
  return `
  <section style="padding:40px;background:#fafafa;">
    <h1 style="font-size:40px;color:#6633ff;">${lead.hero_title}</h1>
    <p>${lead.hero_subtitle}</p>

    <img src="${lead.thumbnail}" style="width:100%;border-radius:12px;margin-top:20px;" />

    <p style="margin-top:20px;">${lead.description}</p>
  </section>
  `;
}

