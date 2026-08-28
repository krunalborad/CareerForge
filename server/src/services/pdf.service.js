import PDFDocument from "pdfkit";

const THEME = {
  modern: { accent: "#2563eb", heading: "Helvetica-Bold", rule: true },
  classic: { accent: "#111827", heading: "Times-Bold", rule: true },
  compact: { accent: "#0f766e", heading: "Helvetica-Bold", rule: false },
  creative: { accent: "#7c3aed", heading: "Helvetica-Bold", rule: true },
};

export function buildResumePDF(resume, res) {
  const t = THEME[resume.template] || THEME.modern;
  const d = resume.data || {};
  const doc = new PDFDocument({ size: "A4", margin: 46 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${(d.fullName || "resume").replace(/\s+/g, "_")}.pdf"`);
  doc.pipe(res);

  doc.font(t.heading).fontSize(24).fillColor(t.accent).text(d.fullName || "Your Name");
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
    .text([d.email, d.phone, d.location, ...(d.links || [])].filter(Boolean).join("  |  "));
  doc.moveDown(0.6);

  const section = (title) => {
    doc.moveDown(0.5);
    doc.font(t.heading).fontSize(12).fillColor(t.accent).text(title.toUpperCase());
    if (t.rule) {
      doc.moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - 46, doc.y + 2).strokeColor(t.accent).lineWidth(0.8).stroke();
    }
    doc.moveDown(0.4).fillColor("#111827").font("Helvetica").fontSize(10);
  };

  const order = resume.sectionOrder?.length ? resume.sectionOrder : ["summary", "skills", "experience", "projects", "education", "certifications"];

  for (const key of order) {
    if (key === "summary" && d.summary) {
      section("Summary");
      doc.text(d.summary, { align: "justify" });
    }
    if (key === "skills" && d.skills?.length) {
      section("Skills");
      doc.text(d.skills.join("  •  "));
    }
    if (key === "experience" && d.experience?.length) {
      section("Experience");
      d.experience.forEach((e) => {
        doc.font("Helvetica-Bold").fontSize(10.5).text(`${e.role || ""}${e.company ? " — " + e.company : ""}`, { continued: true });
        doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(`   ${e.start || ""} - ${e.end || "Present"}`);
        doc.fillColor("#111827").fontSize(10);
        (e.bullets || []).forEach((b) => doc.text(`•  ${b}`, { indent: 10 }));
        doc.moveDown(0.35);
      });
    }
    if (key === "projects" && d.projects?.length) {
      section("Projects");
      d.projects.forEach((p) => {
        doc.font("Helvetica-Bold").text(p.name || "");
        doc.font("Helvetica").text(p.description || "");
        if (p.tech?.length) doc.fillColor("#6b7280").fontSize(9).text(p.tech.join(", ")).fillColor("#111827").fontSize(10);
        doc.moveDown(0.3);
      });
    }
    if (key === "education" && d.education?.length) {
      section("Education");
      d.education.forEach((e) => doc.text(`${e.degree || ""} — ${e.school || ""} (${e.year || ""})`));
    }
    if (key === "certifications" && d.certifications?.length) {
      section("Certifications");
      d.certifications.forEach((c) => doc.text(`•  ${c}`));
    }
  }

  doc.end();
}
