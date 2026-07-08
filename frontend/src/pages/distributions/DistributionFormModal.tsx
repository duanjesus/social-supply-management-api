import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateDistribution } from "@/hooks/useDistributions";
import { useAllInstitutions } from "@/hooks/useInstitutions";
import { useAllProducts } from "@/hooks/useProducts";
import { extractErrorMessage } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { todayIsoDate } from "@/utils/format";

const schema = z.object({
  institutionId: z
    .coerce.number({ invalid_type_error: "A instituição é obrigatória" })
    .positive("A instituição é obrigatória"),
  productId: z.coerce.number({ invalid_type_error: "O produto é obrigatório" }).positive("O produto é obrigatório"),
  quantity: z
    .coerce.number({ invalid_type_error: "A quantidade é obrigatória" })
    .min(0.001, "A quantidade deve ser maior que zero"),
  distributionDate: z.string().min(1, "A data da distribuição é obrigatória"),
  responsibleName: z.string().max(150).optional().or(z.literal("")),
  observation: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface DistributionFormModalProps {
  onClose: () => void;
}

export function DistributionFormModal({ onClose }: DistributionFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createDistribution = useCreateDistribution();
  const { data: institutions, isLoading: institutionsLoading } = useAllInstitutions();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { distributionDate: todayIsoDate() },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createDistribution.mutateAsync({
        institutionId: values.institutionId,
        productId: values.productId,
        quantity: values.quantity,
        distributionDate: values.distributionDate,
        responsibleName: values.responsibleName || undefined,
        observation: values.observation || undefined,
      });
      onClose();
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <Modal title="Registrar distribuição" isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ErrorBanner message={serverError} />
        <Select
          label="Instituição"
          error={errors.institutionId?.message}
          disabled={institutionsLoading}
          {...register("institutionId")}
        >
          <option value="">Selecione uma instituição</option>
          {institutions?.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </Select>
        <Select
          label="Produto"
          error={errors.productId?.message}
          disabled={productsLoading}
          {...register("productId")}
        >
          <option value="">Selecione um produto</option>
          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            step="0.001"
            min={0.001}
            error={errors.quantity?.message}
            {...register("quantity")}
          />
          <Input
            label="Data da distribuição"
            type="date"
            max={todayIsoDate()}
            error={errors.distributionDate?.message}
            {...register("distributionDate")}
          />
        </div>
        <Input
          label="Responsável"
          error={errors.responsibleName?.message}
          {...register("responsibleName")}
        />
        <Textarea label="Observação" error={errors.observation?.message} {...register("observation")} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
