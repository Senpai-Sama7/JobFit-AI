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
}
