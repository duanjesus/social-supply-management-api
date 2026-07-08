export interface Institution {
  id: number;
  name: string;
  cnpj: string;
  address: string;
  phone: string | null;
  email: string | null;
  responsibleName: string | null;
  familiesServed: number | null;
  active: boolean;
}

export interface InstitutionRequest {
  name: string;
  cnpj: string;
  address: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  familiesServed?: number;
  active?: boolean;
}
