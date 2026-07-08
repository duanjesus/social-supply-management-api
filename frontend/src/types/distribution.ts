import type { Product } from "@/types/product";
import type { Institution } from "@/types/institution";

export interface Distribution {
  id: number;
  institution: Institution;
  product: Product;
  quantity: number;
  distributionDate: string;
  responsibleName: string | null;
  observation: string | null;
}

export interface DistributionRequest {
  institutionId: number;
  productId: number;
  quantity: number;
  distributionDate: string;
  responsibleName?: string;
  observation?: string;
}
