import { ParsedResume, SkillProfile } from "@shared/schema";

// Mock resume parsing service - in production would use actual PDF/DOCX parsing libraries
export async function parseResume(content: string, fileType: string): Promise<ParsedResume> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Basic text processing for different file types
  let text = content;
  
  if (fileType === '.pdf') {
    // In production: use pdf-parse library
    text = content; // Assume already extracted
  } else if (fileType === '.docx') {
    // In production: use mammoth.js library
    text = content; // Assume already extracted
  }

  // Simple pattern-based parsing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const parsedResume: ParsedResume = {
    contact: extractContact(lines),
    summary: extractSummary(lines),
    experience: extractExperience(lines),
    education: extractEducation(lines),
    skills: extractSkills(lines),
    certifications: extractCertifications(lines),
    extras: extractExtras(lines),
  };

  console.log("Parsed resume data:", {
    hasContact: !!parsedResume.contact?.name,
    hasEmail: !!parsedResume.contact?.email,
    hasSummary: !!parsedResume.summary,
    experienceCount: parsedResume.experience?.length || 0,
    skillsCount: parsedResume.skills?.length || 0,
    educationCount: parsedResume.education?.length || 0
  });

  return parsedResume;
}

function extractContact(lines: string[]): ParsedResume['contact'] {
  const contact: ParsedResume['contact'] = {
    name: '',
    email: '',
  };

  // Find email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailLine = lines.find(line => emailRegex.test(line));
  if (emailLine) {
    const emailMatch = emailLine.match(emailRegex);
    if (emailMatch) contact.email = emailMatch[0];
  }

  // Find phone
  const phoneRegex = /[\+]?[\d\s\-\(\)\.]{10,}/;
  const phoneLine = lines.find(line => phoneRegex.test(line) && !emailRegex.test(line));
  if (phoneLine) {
    const phoneMatch = phoneLine.match(phoneRegex);
    if (phoneMatch) contact.phone = phoneMatch[0].trim();
  }

  // Find name (usually first line or line before contact info)
  const namePatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+.*$/, // First Last format
    /^[A-Z\s]+$/, // ALL CAPS name
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (namePatterns.some(pattern => pattern.test(line)) && !emailRegex.test(line) && !phoneRegex.test(line)) {
      contact.name = line;
      break;
    }
  }

  // Find LinkedIn
  const linkedinRegex = /linkedin\.com\/in\/[\w\-]+/i;
  const linkedinLine = lines.find(line => linkedinRegex.test(line));
  if (linkedinLine) {
    const linkedinMatch = linkedinLine.match(linkedinRegex);
    if (linkedinMatch) contact.linkedin = linkedinMatch[0];
  }

  return contact;
}

function extractSummary(lines: string[]): string | undefined {
  const summaryKeywords = ['summary', 'profile', 'objective', 'about'];
  const summaryIndex = lines.findIndex(line => 
    summaryKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (summaryIndex === -1) return undefined;

  // Extract content after summary header until next section
  const summaryLines = [];
  for (let i = summaryIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderLine(line)) break;
    summaryLines.push(line);
  }

  return summaryLines.join(' ').trim();
}

function extractExperience(lines: string[]): ParsedResume['experience'] {
  const experienceKeywords = ['experience', 'employment', 'work', 'career'];
  const experienceIndex = lines.findIndex(line =>
    experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (experienceIndex === -1) return [];

  const experiences = [];
  let currentExp: any = null;
  let bullets: string[] = [];

  for (let i = experienceIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (isHeaderLine(line) && !line.toLowerCase().includes('experience')) break;
    
    // Date pattern detection
    const datePattern = /\d{4}|\d{1,2}\/\d{4}|present|current/i;
    if (datePattern.test(line) && line.split(' ').length <= 6) {
      // Save previous experience
      if (currentExp) {
        currentExp.bullets = bullets;
        experiences.push(currentExp);
      }
      
      // Start new experience
      const parts = line.split('|').map(p => p.trim());
      currentExp = {
        role: parts[0] || 'Unknown Role',
        company: parts[1] || 'Unknown Company',
        startDate: extractStartDate(line),
        endDate: extractEndDate(line),
        description: '',
      };
      bullets = [];
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      bullets.push(line.substring(1).trim());
    } else if (currentExp && line.length > 20) {
      bullets.push(line);
    }
  }

  // Add last experience
  if (currentExp) {
    currentExp.bullets = bullets;
    experiences.push(currentExp);
  }

  return experiences;
}

function extractEducation(lines: string[]): ParsedResume['education'] {
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
  const educationIndex = lines.findIndex(line =>
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (educationIndex === -1) return [];

  const education = [];
  for (let i = educationIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderLine(line)) break;
    
    if (line.length > 10) {
      const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'bs', 'ba', 'ms', 'ma', 'mba'];
      if (degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        const parts = line.split('|').map(p => p.trim());
        education.push({
          degree: parts[0],
          institution: parts[1] || 'Unknown Institution',
          graduationDate: extractDate(line),
        });
      }
    }
  }

  return education;
}

function extractSkills(lines: string[]): string[] {
  const skillsKeywords = ['skills', 'technologies', 'technical', 'competencies'];
  const skillsIndex = lines.findIndex(line =>
    skillsKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (skillsIndex === -1) return [];

  const skills = [];
  for (let i = skillsIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderLine(line)) break;
    
    // Split by common separators
    const skillList = line.split(/[,•\|]/).map(s => s.trim()).filter(s => s.length > 0);
    skills.push(...skillList);
  }

  return skills.slice(0, 20); // Limit to 20 skills
}

function extractCertifications(lines: string[]): ParsedResume['certifications'] {
  const certKeywords = ['certification', 'certificate', 'license'];
  const certIndex = lines.findIndex(line =>
    certKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (certIndex === -1) return [];

  const certifications = [];
  for (let i = certIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderLine(line)) break;
    
    if (line.length > 5) {
      const parts = line.split('|').map(p => p.trim());
      certifications.push({
        name: parts[0],
        issuer: parts[1] || 'Unknown Issuer',
        date: extractDate(line),
      });
    }
  }

  return certifications;
}

function extractExtras(lines: string[]): string[] {
  const extras = [];
  const extraKeywords = ['projects', 'awards', 'publications', 'languages', 'interests'];
  
  for (const keyword of extraKeywords) {
    const index = lines.findIndex(line => line.toLowerCase().includes(keyword));
    if (index !== -1) {
      for (let i = index + 1; i < lines.length; i++) {
        const line = lines[i];
        if (isHeaderLine(line)) break;
        if (line.length > 5) extras.push(line);
      }
    }
  }

  return extras;
}

// Helper functions
function isHeaderLine(line: string): boolean {
  const headerPatterns = [
    /^[A-Z\s]+$/,
    /^\w+:?\s*$/,
    /^[A-Z][a-z]+\s+[A-Z][a-z]+$/
  ];
  
  return line.length < 50 && 
         (headerPatterns.some(pattern => pattern.test(line)) ||
          line.split(' ').length <= 3);
}

function extractStartDate(text: string): string {
  const dateMatch = text.match(/(\d{4}|\d{1,2}\/\d{4})/);
  return dateMatch ? dateMatch[0] : 'Unknown';
}

function extractEndDate(text: string): string | undefined {
  if (/present|current/i.test(text)) return undefined;
  const dates = text.match(/(\d{4}|\d{1,2}\/\d{4})/g);
  return dates && dates.length > 1 ? dates[1] : undefined;
}

function extractDate(text: string): string | undefined {
  const dateMatch = text.match(/(\d{4}|\d{1,2}\/\d{4})/);
  return dateMatch ? dateMatch[0] : undefined;
}
