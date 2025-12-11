export function renderTemplateA(lead) {
  return `
  <section style="padding:40px;">
    <h1 style="font-size:38px;">${lead.hero_title}</h1>
    <p>${lead.hero_subtitle}</p>
    <img src="${lead.thumbnail}" style="width:100%;border-radius:10px;margin:20px 0;" />
    <p>${lead.description}</p>

    <h3>Contact</h3>
    <p>${lead.phone}</p>
    <p>${lead.address}</p>
  </section>
  `;
}
