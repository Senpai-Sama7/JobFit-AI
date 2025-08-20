/**
 * Structured contact information.
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

/**
 * Work experience entry.
 */
export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  details: string[];
}

/**
 * Parsed resume structure returned by {@link extractParsedData}.
 */
export interface ParsedResume {
  contact: ContactInfo;
  skills: string[];
  experience: ExperienceEntry[];
  education: string[];
}

/**
 * Extract structured fields from resume text.
 */
export function extractParsedData(text: string): ParsedResume {
  // Determine contact section – fall back to the first paragraph if
  // a "Professional Summary" heading is absent.
  const summarySplit = text.split(/PROFESSIONAL SUMMARY/i);
  const contactBlock = summarySplit.length > 1 ? summarySplit[0] : text.split(/\r?\n{2,}/)[0];

  const contact: ContactInfo = {
    name: contactBlock.split(/\r?\n/).find(line => line.trim() !== '') || '',
    email: (contactBlock.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? '').trim(),
    phone: (contactBlock.match(/(?:\+?[\d(][\d\s-.()]{7,}\d)/)?.[0] ?? '').trim(),
    location: (contactBlock.match(/Location:\s*(.*)/i)?.[1] ?? '').trim(),
    linkedin: (contactBlock.match(/LinkedIn:\s*(.*)/i)?.[1] ?? '').trim(),
    website: (contactBlock.match(/Website:\s*(.*)/i)?.[1] ?? '').trim(),
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

  const parsed: ParsedResume = { contact, skills, experience: [], education: [] };

  // Experience
  const expMatch = text.match(/PROFESSIONAL EXPERIENCE([\s\S]*?)(?:\n[A-Z0-9 &()]+\n|$)/i);
  if (expMatch) {
    const lines = expMatch[1].trim().split(/\r?\n/);
    let current: ExperienceEntry | null = null;
    lines.forEach(line => {
      const headerMatch = line.match(/^(.*)\|(.+)\|(.*)$/);
      if (headerMatch) {
        if (current) parsed.experience.push(current);
        const [_, title, company, dates] = headerMatch;
        const [start, end] = dates.split('-').map(s => s.trim());
        current = {
          title: title.trim(),
          company: company.trim(),
          startDate: start,
          endDate: end,
          details: [],
        };
      } else if (line.startsWith('•') && current) {
        current.details.push(line.replace(/^•\s*/, '').trim());
      }
    });
    if (current) parsed.experience.push(current);
  }

  // Education
  const eduMatch = text.match(/EDUCATION([\s\S]*?)(?:\n[A-Z0-9 &()]+\n|$)/);
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
