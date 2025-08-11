/**
 * Extract structured fields from resume text.
 */
export function extractParsedData(text: string) {
  const parsed: Record<string, any> = {};
  // Contact info
  const contactBlock = text.split(/PROFESSIONAL SUMMARY/i)[0];
  parsed.contact = {
    name: contactBlock.split(/\r?\n/).find(line => line.trim() !== '') || '',
    email: (contactBlock.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [''])[0],
    phone: (contactBlock.match(/(?:\+?[\d(][\d\s-.()]{7,}\d)/) || [''])[0],
    location: (contactBlock.match(/Location:\s*(.*)/i) || ['', ''])[1].trim(),
    linkedin: (contactBlock.match(/LinkedIn:\s*(.*)/i) || ['', ''])[1].trim(),
    website: (contactBlock.match(/Website:\s*(.*)/i) || ['', ''])[1].trim(),
  };

  // Skills
  const skillsMatch = text.match(/TECHNICAL SKILLS([\s\S]*?)\n\n/i);
  const skills: string[] = [];
  if (skillsMatch) {
    skillsMatch[1]
      .split(/\r?\n/)
      .forEach(line => {
        const parts = line.split(':')[1];
        if (parts) {
          parts.split(/,\s*/).forEach(skill => {
            const s = skill.trim();
            if (s) skills.push(s);
          });
        }
      });
  }
  parsed.skills = skills;

  // Experience
  const expMatch = text.match(/PROFESSIONAL EXPERIENCE([\s\S]*?)\nEDUCATION/i);
  parsed.experience = [];
  if (expMatch) {
    const lines = expMatch[1].trim().split(/\r?\n/);
    let current: any = null;
    lines.forEach(line => {
      const headerMatch = line.match(/^(.*)\|(.+)\|(.*)$/);
      if (headerMatch) {
        if (current) parsed.experience.push(current);
        const [_, title, company, dates] = headerMatch;
        const [start, end] = dates.split('-').map(s => s.trim());
        current = { title: title.trim(), company: company.trim(), startDate: start, endDate: end, details: [] };
      } else if (line.startsWith('•') && current) {
        current.details.push(line.replace(/^•\s*/, '').trim());
      }
    });
    if (current) parsed.experience.push(current);
  }

  // Education
  const eduMatch = text.match(/EDUCATION([\s\S]*?)(?:\n[A-Z0-9 &()]+\n|$)/);
  parsed.education = [];
  if (eduMatch) {
    eduMatch[1]
      .trim()
      .split(/\r?\n/)
      .forEach(line => {
        const l = line.trim();
        if (l) parsed.education.push(l);
      });
  }

  return parsed;
}
