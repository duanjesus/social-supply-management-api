export type ProductCategory = "ALIMENTO" | "HIGIENE" | "LIMPEZA" | "VESTUARIO" | "OUTROS";
export type ProductUnit = "KG" | "LITRO" | "UNIDADE" | "CAIXA" | "PACOTE";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "ALIMENTO",
  "HIGIENE",
  "LIMPEZA",
  "VESTUARIO",
  "OUTROS",
];

export const PRODUCT_UNITS: ProductUnit[] = ["KG", "LITRO", "UNIDADE", "CAIXA", "PACOTE"];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  ALIMENTO: "Alimento",
  HIGIENE: "Higiene",
  LIMPEZA: "Limpeza",
  VESTUARIO: "Vestuário",
  OUTROS: "Outros",
};

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  KG: "Quilograma (kg)",
  LITRO: "Litro (L)",
  UNIDADE: "Unidade",
  CAIXA: "Caixa",
  PACOTE: "Pacote",
};

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: ProductCategory;
  unit: ProductUnit;
}

export interface ProductRequest {
  name: string;
  description?: string;
  category: ProductCategory;
  unit: ProductUnit;
}
