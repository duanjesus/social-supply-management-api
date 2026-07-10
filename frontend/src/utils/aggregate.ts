import type { Donation } from "@/types/donation";
import type { Distribution } from "@/types/distribution";
import type { ProductUnit } from "@/types/product";

export interface TopProductEntry {
  productId: number;
  name: string;
  unit: ProductUnit;
  totalQuantity: number;
}

/** Ranks products by total quantity donated. Client-side aggregation over the
 * same capped donation set as the dashboard's other stats — see useAllDonations. */
export function topDonatedProducts(donations: Donation[], limit = 5): TopProductEntry[] {
  const byProduct = new Map<number, TopProductEntry>();
  for (const donation of donations) {
    const existing = byProduct.get(donation.product.id);
    if (existing) {
      existing.totalQuantity += donation.quantity;
    } else {
      byProduct.set(donation.product.id, {
        productId: donation.product.id,
        name: donation.product.name,
        unit: donation.product.unit,
        totalQuantity: donation.quantity,
      });
    }
  }
  return [...byProduct.values()].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, limit);
}

export interface TopInstitutionEntry {
  institutionId: number;
  name: string;
  distributionCount: number;
}

/** Ranks institutions by number of distributions received (not summed quantity,
 * since a single institution can receive several products in different units). */
export function topAttendedInstitutions(
  distributions: Distribution[],
  limit = 5,
): TopInstitutionEntry[] {
  const byInstitution = new Map<number, TopInstitutionEntry>();
  for (const distribution of distributions) {
    const existing = byInstitution.get(distribution.institution.id);
    if (existing) {
      existing.distributionCount += 1;
    } else {
      byInstitution.set(distribution.institution.id, {
        institutionId: distribution.institution.id,
        name: distribution.institution.name,
        distributionCount: 1,
      });
    }
  }
  return [...byInstitution.values()]
    .sort((a, b) => b.distributionCount - a.distributionCount)
    .slice(0, limit);
}

export interface MonthlyTrendEntry {
  monthKey: string;
  monthLabel: string;
  donations: number;
  distributions: number;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Builds one bucket per month (oldest first) for the last `months` months,
 * counting donations/distributions whose date falls in that month. */
export function monthlyTrend(
  donations: Donation[],
  distributions: Distribution[],
  months = 6,
): MonthlyTrendEntry[] {
  const now = new Date();
  const buckets: MonthlyTrendEntry[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = capitalize(date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""));
    buckets.push({ monthKey, monthLabel, donations: 0, distributions: 0 });
  }

  const bucketByKey = new Map(buckets.map((bucket) => [bucket.monthKey, bucket]));
  for (const donation of donations) {
    const bucket = bucketByKey.get(donation.donationDate.slice(0, 7));
    if (bucket) bucket.donations += 1;
  }
  for (const distribution of distributions) {
    const bucket = bucketByKey.get(distribution.distributionDate.slice(0, 7));
    if (bucket) bucket.distributions += 1;
  }

  return buckets;
}
