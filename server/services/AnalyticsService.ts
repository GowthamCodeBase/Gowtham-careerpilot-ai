import { db, ApplicationAnalytics } from "../db.ts";

export class AnalyticsService {
  async refreshAnalytics(userId: string, period: "daily" | "weekly" | "monthly" = "monthly"): Promise<ApplicationAnalytics> {
    const profile = db.getCareerProfile(userId);
    const profileId = profile?.id || "profile-none";
    const apps = db.getApplications(userId);

    const totalApplied = apps.length;
    const totalInterviews = apps.filter(a => a.status === "Interview").length;
    const totalOffers = apps.filter(a => a.status === "Offer").length;
    const totalRejected = apps.filter(a => a.status === "Rejected").length;

    // Rates
    const conversionRate = totalApplied > 0 ? Math.round(((totalInterviews + totalOffers) / totalApplied) * 100) : 0;
    const interviewRate = totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;
    const offerRate = totalInterviews > 0 ? Math.round((totalOffers / totalInterviews) * 100) : 0;
    const avgResponseTime = totalApplied > 0 ? 14.5 : 0; // average response days placeholder

    // Extract Top domains/companies
    const domainMap: Record<string, { count: number; success: number }> = {};
    const companyMap: Record<string, { count: number; success: number }> = {};

    apps.forEach(app => {
      const company = app.company;
      const isSuccess = app.status === "Interview" || app.status === "Offer";

      companyMap[company] = companyMap[company] || { count: 0, success: 0 };
      companyMap[company].count++;
      if (isSuccess) companyMap[company].success++;

      const domain = company.toLowerCase().includes("google") || company.toLowerCase().includes("meta") || company.toLowerCase().includes("netflix")
        ? "Big Tech"
        : "Software / SaaS";

      domainMap[domain] = domainMap[domain] || { count: 0, success: 0 };
      domainMap[domain].count++;
      if (isSuccess) domainMap[domain].success++;
    });

    const topCompanies = Object.keys(companyMap).map(c => ({
      company: c,
      count: companyMap[c].count,
      successRate: Math.round((companyMap[c].success / companyMap[c].count) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const topDomains = Object.keys(domainMap).map(d => ({
      domain: d,
      count: domainMap[d].count,
      successRate: Math.round((domainMap[d].success / domainMap[d].count) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Simple time trend
    const successTrend = [
      { date: "May 26", applied: 5, success: 2 },
      { date: "Jun 26", applied: apps.length, success: totalInterviews + totalOffers }
    ];

    const analytics = db.createApplicationAnalytics({
      profileId,
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalApplied,
      totalInterviews,
      totalOffers,
      totalRejected,
      conversionRate,
      interviewRate,
      offerRate,
      avgResponseTime,
      topDomains,
      topCompanies,
      successTrend
    }, userId);

    return analytics;
  }
}

export const analyticsService = new AnalyticsService();
