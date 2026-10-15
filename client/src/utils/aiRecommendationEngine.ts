import { Provider, Service, AIRecommendationReason } from '../types';

export interface RecommendationResult {
  provider: Provider;
  recommendation: AIRecommendationReason;
}

export function rankProvidersWithAI(
  providers: Provider[],
  searchCategory?: string,
  searchService?: string,
  userLocation: string = 'Jaipur',
  maxBudget?: number,
  requireToday: boolean = false
): RecommendationResult[] {
  const ranked = providers.map((provider) => {
    let serviceMatchScore = 0;
    const ratingScore = (provider.rating / 5) * 100;
    let distanceScore = 100;
    const experienceScore = Math.min(100, (provider.experienceYears / 10) * 100);
    let pricingScore = 100;
    const availabilityScore = provider.availableToday ? 100 : 60;
    const responseRateScore = Math.max(20, 100 - (provider.responseTimeMinutes * 2));

    // 1. Service & Category Match
    if (searchCategory && provider.category.toLowerCase().includes(searchCategory.toLowerCase())) {
      serviceMatchScore += 50;
    }
    if (searchService) {
      const matchInServices = provider.servicesOffered.some(s => s.toLowerCase().includes(searchService.toLowerCase()));
      const matchInSkills = provider.skills.some(s => s.toLowerCase().includes(searchService.toLowerCase()));
      if (matchInServices || matchInSkills) {
        serviceMatchScore += 50;
      }
    }
    if (!searchCategory && !searchService) {
      serviceMatchScore = 80;
    }

    // 2. Distance Score
    if (provider.city.toLowerCase() === userLocation.toLowerCase()) {
      distanceScore = 95;
    } else {
      distanceScore = 40;
    }

    // 3. Pricing Score
    if (maxBudget && maxBudget > 0) {
      if (provider.startingPrice <= maxBudget) {
        pricingScore = 100;
      } else {
        const ratio = maxBudget / provider.startingPrice;
        pricingScore = Math.max(20, Math.round(ratio * 100));
      }
    }

    // Weighted Formula:
    // Final = 0.20 * ServiceMatch + 0.25 * Rating + 0.20 * Distance + 0.15 * Experience + 0.10 * Pricing + 0.05 * Availability + 0.05 * ResponseRate
    const finalScore = Math.round(
      (0.20 * serviceMatchScore) +
      (0.25 * ratingScore) +
      (0.20 * distanceScore) +
      (0.15 * experienceScore) +
      (0.10 * pricingScore) +
      (0.05 * availabilityScore) +
      (0.05 * responseRateScore)
    );

    // Reasons calculation
    const reasons: string[] = [];
    if (provider.availableToday) reasons.push('✓ Available Today');
    if (provider.rating >= 4.8) reasons.push('✓ Highly Rated');
    if (provider.city.toLowerCase() === userLocation.toLowerCase()) reasons.push('✓ Near You in ' + provider.city);
    if (provider.experienceYears >= 5) reasons.push(`✓ Experienced (${provider.experienceYears}+ Yrs)`);
    if (provider.responseTimeMinutes <= 30) reasons.push('✓ Quick Response');
    if (maxBudget && provider.startingPrice <= maxBudget) reasons.push('✓ Within Your Budget');
    if (provider.verificationStatus === 'VERIFIED') reasons.push('✓ Verified Professional');

    const recommendation: AIRecommendationReason = {
      score: finalScore,
      reasons: reasons.slice(0, 4),
      scoreBreakdown: {
        serviceMatch: Math.round(serviceMatchScore),
        ratingScore: Math.round(ratingScore),
        distanceScore: Math.round(distanceScore),
        experienceScore: Math.round(experienceScore),
        pricingScore: Math.round(pricingScore),
        availabilityScore: Math.round(availabilityScore),
        responseRateScore: Math.round(responseRateScore)
      }
    };

    return {
      provider,
      recommendation
    };
  });

  // Filter if requireToday is set
  let filtered = ranked;
  if (requireToday) {
    filtered = ranked.filter(r => r.provider.availableToday);
  }

  // Sort by highest AI score
  return filtered.sort((a, b) => b.recommendation.score - a.recommendation.score);
}
