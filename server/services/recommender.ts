<<<<<<< HEAD
export interface Recommendation {
  jobTitle: string;
  companyName: string;
  fitScore: number;
  description: string;
  source: string;
}

export async function generateRoleRecommendations(): Promise<Recommendation[]> {
  // In a real implementation you'd call an AI or job matching service
  return [
    {
      jobTitle: 'Software Engineer',
      companyName: 'Example Corp',
      fitScore: 88,
      description: 'Build and maintain web applications.',
      source: 'internal',
    },
  ];
=======
/**
 * JobFit-AI Role Recommender Service
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Generates AI-powered job role recommendations based on parsed resume data.
 * - In production, replace mocks with ML/NLP models for semantic matching.
 */
import { ParsedResume, RoleRecommendation } from "@shared/schema";

// Mock job taxonomy - in production this would be a comprehensive database
const JOB_TAXONOMY = [
  {
    title: "Senior Data Analyst",
    description: "Analyze complex datasets to derive business insights and drive strategic decisions using statistical methods and data visualization tools.",
    required_skills: ["SQL", "Python", "Tableau", "Excel", "Statistics", "Data Analysis", "Business Intelligence"],
  },
  {
    title: "Business Intelligence Analyst", 
    description: "Transform data into actionable business intelligence through reporting and visualization to support decision-making processes.",
    required_skills: ["Excel", "Power BI", "SQL", "Data Visualization", "Business Analysis", "Reporting", "Analytics"],
  },
  {
    title: "Product Analyst",
    description: "Analyze product performance and user behavior to optimize product strategy and improve user experience metrics.",
    required_skills: ["Analytics", "A/B Testing", "SQL", "Product Management", "User Research", "Data Analysis", "KPI Tracking"],
  },
  {
    title: "Data Scientist",
    description: "Apply machine learning and statistical modeling to solve complex business problems and predict future trends.",
    required_skills: ["Python", "R", "Machine Learning", "Statistics", "SQL", "TensorFlow", "Pandas", "Scikit-learn"],
  },
  {
    title: "Marketing Analyst",
    description: "Analyze marketing campaigns and customer data to optimize marketing strategies and improve ROI.",
    required_skills: ["Google Analytics", "Excel", "SQL", "Marketing Automation", "A/B Testing", "Customer Segmentation"],
  },
  {
    title: "Financial Analyst",
    description: "Analyze financial data and market trends to support investment decisions and financial planning.",
    required_skills: ["Excel", "Financial Modeling", "SQL", "Accounting", "Valuation", "Risk Analysis", "Bloomberg"],
  },
  {
    title: "Operations Analyst",
    description: "Optimize business operations through process analysis and efficiency improvements using data-driven insights.",
    required_skills: ["Process Improvement", "Excel", "SQL", "Project Management", "Lean Six Sigma", "Analytics"],
  },
  {
    title: "Research Analyst",
    description: "Conduct market research and competitive analysis to inform business strategy and product development.",
    required_skills: ["Market Research", "Excel", "Statistics", "Survey Design", "Data Collection", "Report Writing"],
  },
  {
    title: "Quantitative Analyst",
    description: "Develop mathematical models and algorithms for risk management and trading strategies in financial markets.",
    required_skills: ["Python", "R", "Mathematics", "Statistics", "Risk Management", "Financial Modeling", "C++"],
  },
  {
    title: "Business Analyst",
    description: "Bridge business and IT teams by analyzing business processes and requirements to drive system improvements.",
    required_skills: ["Business Analysis", "Requirements Gathering", "Process Mapping", "SQL", "Agile", "Documentation"],
  },
];

export async function generateRoleRecommendations(parsedResume: ParsedResume): Promise<Omit<RoleRecommendation, 'id' | 'resumeId'>[]> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const userSkills = normalizeSkills(parsedResume.skills);
  const userProfile = createUserProfile(parsedResume);
  
  const recommendations = [];

  for (const job of JOB_TAXONOMY) {
    const jobSkills = normalizeSkills(job.required_skills);
    
    // Calculate keyword overlap score (30% weight)
    const keywordScore = calculateKeywordOverlap(userSkills, jobSkills);
    
    // Calculate semantic similarity score (70% weight)
    const semanticScore = calculateSemanticSimilarity(userProfile, job.description);
    
    // Blend scores
    const fitScore = Math.round(semanticScore * 0.7 + keywordScore * 0.3);
    
    recommendations.push({
      title: job.title,
      description: job.description,
      requiredSkills: job.required_skills,
      fitScore,
      semanticScore,
      keywordScore,
    });
  }

  // Return top 10 recommendations sorted by fit score
  return recommendations
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 10);
}

function normalizeSkills(skills: string[]): string[] {
  return skills.map(skill => skill.toLowerCase().trim());
}

function createUserProfile(resume: ParsedResume): string {
  const parts = [];
  
  if (resume.summary) parts.push(resume.summary);
  
  if (resume.experience && resume.experience.length > 0) {
    const expDesc = resume.experience
      .map(exp => `${exp.role} at ${exp.company}: ${exp.bullets?.join(' ') || exp.description}`)
      .join(' ');
    parts.push(expDesc);
  }
  
  if (resume.skills && resume.skills.length > 0) {
    parts.push(`Skills: ${resume.skills.join(', ')}`);
  }

  return parts.join(' ').toLowerCase();
}

function calculateKeywordOverlap(userSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 0;
  
  let matches = 0;
  for (const jobSkill of jobSkills) {
    if (userSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill) ||
      calculateStringSimilarity(userSkill, jobSkill) > 0.8
    )) {
      matches++;
    }
  }
  
  return Math.round((matches / jobSkills.length) * 100);
}

function calculateSemanticSimilarity(userProfile: string, jobDescription: string): number {
  // Mock semantic similarity - in production would use sentence transformers
  const userWords = new Set(userProfile.split(/\s+/).filter(word => word.length > 3));
  const jobWords = new Set(jobDescription.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  
  let commonWords = 0;
  Array.from(userWords).forEach(word => {
    if (jobWords.has(word)) commonWords++;
  });
  
  const similarity = commonWords / Math.max(userWords.size, jobWords.size);
  return Math.min(100, Math.round(similarity * 100 + Math.random() * 20)); // Add some randomness
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
>>>>>>> 38e359a (codebase refactor)
}
