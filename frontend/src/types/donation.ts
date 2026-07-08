import type { Product } from "@/types/product";

export interface Donation {
  id: number;
  donorName: string;
  donorDocument: string | null;
  product: Product;
  quantity: number;
  donationDate: string;
  description: string | null;
}

export interface DonationRequest {
  donorName: string;
  donorDocument?: string;
  productId: number;
  quantity: number;
  donationDate: string;
  description?: string;
}
