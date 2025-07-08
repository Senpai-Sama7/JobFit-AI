import { ParsedResume, TailoringImprovement } from "@shared/schema";

export async function tailorResume(
  originalResume: ParsedResume, 
  jobDescription: string
): Promise<{ tailoredContent: ParsedResume; improvements: TailoringImprovement[] }> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const tailoredContent = JSON.parse(JSON.stringify(originalResume)); // Deep clone
  const improvements: TailoringImprovement[] = [];
  
  const jobKeywords = extractJobKeywords(jobDescription);
  const jobRequirements = extractJobRequirements(jobDescription);

  // Tailor summary
  if (tailoredContent.summary) {
    const { newSummary, improvement } = tailorSummary(tailoredContent.summary, jobKeywords);
    if (improvement) {
      tailoredContent.summary = newSummary;
      improvements.push(improvement);
    }
  }

  // Tailor experience bullets
  for (let i = 0; i < tailoredContent.experience.length; i++) {
    const exp = tailoredContent.experience[i];
    if (exp.bullets && exp.bullets.length > 0) {
      const { newBullets, bulletImprovements } = tailorExperienceBullets(exp.bullets, jobKeywords, jobRequirements);
      tailoredContent.experience[i].bullets = newBullets;
      improvements.push(...bulletImprovements);
    }
  }

  // Enhance skills section
  const { newSkills, skillImprovements } = enhanceSkills(tailoredContent.skills, jobKeywords);
  tailoredContent.skills = newSkills;
  improvements.push(...skillImprovements);

  return {
    tailoredContent,
    improvements,
  };
}

function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  
  // Common technical skills and keywords
  const skillPatterns = [
    /\b(python|java|javascript|sql|r|excel|tableau|power bi|git|aws|azure|docker|kubernetes)\b/g,
    /\b(machine learning|data analysis|statistics|analytics|visualization|modeling)\b/g,
    /\b(agile|scrum|project management|team leadership|collaboration|communication)\b/g,
    /\b(reporting|dashboards|kpi|metrics|roi|performance|optimization)\b/g,
  ];

  const keywords = new Set<string>();
  
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => keywords.add(match));
    }
  }

  // Extract action verbs
  const actionVerbs = [
    'analyze', 'develop', 'implement', 'optimize', 'manage', 'lead', 'create', 'design',
    'improve', 'collaborate', 'coordinate', 'execute', 'deliver', 'drive', 'support'
  ];

  actionVerbs.forEach(verb => {
    if (text.includes(verb)) keywords.add(verb);
  });

  return Array.from(keywords);
}

function extractJobRequirements(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const requirements = [];

  // Look for requirement indicators
  const requirementPatterns = [
    /experience with ([^.,]+)/g,
    /proficiency in ([^.,]+)/g,
    /knowledge of ([^.,]+)/g,
    /skilled in ([^.,]+)/g,
    /expertise in ([^.,]+)/g,
  ];

  for (const pattern of requirementPatterns) {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1]) requirements.push(match[1].trim());
    });
  }

  return requirements;
}

function tailorSummary(summary: string, jobKeywords: string[]): { newSummary: string; improvement?: TailoringImprovement } {
  const lowerSummary = summary.toLowerCase();
  const missingKeywords = jobKeywords.filter(keyword => !lowerSummary.includes(keyword));
  
  if (missingKeywords.length === 0) {
    return { newSummary: summary };
  }

  // Add 1-2 relevant keywords naturally
  const keywordsToAdd = missingKeywords.slice(0, 2);
  let newSummary = summary;
  
  // Simple keyword insertion
  keywordsToAdd.forEach(keyword => {
    if (newSummary.includes('data')) {
      newSummary = newSummary.replace('data', `data and ${keyword}`);
    } else {
      newSummary += ` Experienced with ${keyword}.`;
    }
  });

  return {
    newSummary,
    improvement: {
      type: 'keyword_added',
      section: 'summary',
      original: summary,
      improved: newSummary,
      reasoning: `Added relevant keywords: ${keywordsToAdd.join(', ')}`,
    },
  };
}

function tailorExperienceBullets(
  bullets: string[], 
  jobKeywords: string[], 
  jobRequirements: string[]
): { newBullets: string[]; bulletImprovements: TailoringImprovement[] } {
  const improvements: TailoringImprovement[] = [];
  const newBullets = [...bullets];

  // Score bullets by relevance
  const bulletScores = bullets.map((bullet, index) => ({
    index,
    bullet,
    score: calculateBulletRelevance(bullet, jobKeywords),
  }));

  // Reorder bullets by relevance score
  bulletScores.sort((a, b) => b.score - a.score);
  const reorderedBullets = bulletScores.map(item => item.bullet);
  
  if (JSON.stringify(reorderedBullets) !== JSON.stringify(bullets)) {
    improvements.push({
      type: 'bullet_reordered',
      section: 'experience',
      original: bullets.join('\n'),
      improved: reorderedBullets.join('\n'),
      reasoning: 'Reordered bullets to prioritize most relevant achievements',
    });
  }

  // Enhance bullets with missing keywords
  for (let i = 0; i < Math.min(3, reorderedBullets.length); i++) {
    const bullet = reorderedBullets[i];
    const enhanced = enhanceBulletWithKeywords(bullet, jobKeywords);
    
    if (enhanced !== bullet) {
      reorderedBullets[i] = enhanced;
      improvements.push({
        type: 'keyword_added',
        section: 'experience',
        original: bullet,
        improved: enhanced,
        reasoning: 'Added relevant keywords to highlight alignment with job requirements',
      });
    }
  }

  // Add quantified metrics where missing
  for (let i = 0; i < reorderedBullets.length; i++) {
    const bullet = reorderedBullets[i];
    if (!hasQuantifiableMetric(bullet)) {
      const enhanced = addQuantifiableMetric(bullet);
      if (enhanced !== bullet) {
        reorderedBullets[i] = enhanced;
        improvements.push({
          type: 'metric_enhanced',
          section: 'experience',
          original: bullet,
          improved: enhanced,
          reasoning: 'Added quantifiable metric to demonstrate impact',
        });
      }
    }
  }

  return {
    newBullets: reorderedBullets,
    bulletImprovements: improvements,
  };
}

function enhanceSkills(skills: string[], jobKeywords: string[]): { newSkills: string[]; skillImprovements: TailoringImprovement[] } {
  const improvements: TailoringImprovement[] = [];
  const lowerSkills = skills.map(s => s.toLowerCase());
  
  // Find relevant missing skills
  const missingSkills = jobKeywords.filter(keyword => 
    !lowerSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))
  );

  if (missingSkills.length === 0) {
    return { newSkills: skills, skillImprovements: [] };
  }

  // Add relevant missing skills (limit to 3)
  const skillsToAdd = missingSkills.slice(0, 3);
  const newSkills = [...skills, ...skillsToAdd.map(skill => capitalizeSkill(skill))];

  improvements.push({
    type: 'keyword_added',
    section: 'skills',
    original: skills.join(', '),
    improved: newSkills.join(', '),
    reasoning: `Added relevant skills from job requirements: ${skillsToAdd.join(', ')}`,
  });

  return {
    newSkills,
    skillImprovements: improvements,
  };
}

function calculateBulletRelevance(bullet: string, jobKeywords: string[]): number {
  const lowerBullet = bullet.toLowerCase();
  let score = 0;
  
  jobKeywords.forEach(keyword => {
    if (lowerBullet.includes(keyword)) {
      score += 1;
    }
  });

  // Bonus for quantifiable metrics
  if (hasQuantifiableMetric(bullet)) {
    score += 0.5;
  }

  // Bonus for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'implemented', 'improved', 'increased', 'reduced', 'optimized'];
  if (actionVerbs.some(verb => lowerBullet.includes(verb))) {
    score += 0.3;
  }

  return score;
}

function enhanceBulletWithKeywords(bullet: string, jobKeywords: string[]): string {
  const lowerBullet = bullet.toLowerCase();
  const relevantKeywords = jobKeywords.filter(keyword => !lowerBullet.includes(keyword));
  
  if (relevantKeywords.length === 0) return bullet;

  // Simple keyword insertion
  const keywordToAdd = relevantKeywords[0];
  
  if (bullet.includes('data')) {
    return bullet.replace('data', `data and ${keywordToAdd}`);
  } else if (bullet.includes('using')) {
    return bullet.replace('using', `using ${keywordToAdd} and`);
  } else {
    return `${bullet} utilizing ${keywordToAdd}`;
  }
}

function hasQuantifiableMetric(bullet: string): boolean {
  const metricPatterns = [
    /\d+%/,
    /\$\d+/,
    /\d+\+/,
    /\d+x/,
    /\d+\s*(million|thousand|billion)/i,
    /\d+\s*(hours|days|weeks|months)/i,
  ];

  return metricPatterns.some(pattern => pattern.test(bullet));
}

function addQuantifiableMetric(bullet: string): string {
  // Mock metric addition based on context
  if (bullet.toLowerCase().includes('improve')) {
    return bullet + ' by 25%';
  } else if (bullet.toLowerCase().includes('increase')) {
    return bullet + ' by 30%';
  } else if (bullet.toLowerCase().includes('reduce')) {
    return bullet + ' by 40%';
  } else if (bullet.toLowerCase().includes('manage')) {
    return bullet + ' across 5+ projects';
  } else if (bullet.toLowerCase().includes('lead')) {
    return bullet + ' with team of 8 members';
  }
  
  return bullet; // Return unchanged if no obvious enhancement
}

function capitalizeSkill(skill: string): string {
  return skill.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
