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
import { formatQuantity, todayIsoDate } from "@/utils/format";
import { blockDigits, blockLetters } from "@/utils/inputGuards";
import { PRODUCT_UNIT_LABELS } from "@/types/product";

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { distributionDate: todayIsoDate() },
  });

  const selectedProduct = products?.find((p) => p.id === Number(watch("productId")));

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
              {product.name} (disponível: {formatQuantity(product.currentStock)}{" "}
              {PRODUCT_UNIT_LABELS[product.unit]})
            </option>
          ))}
        </Select>
        {selectedProduct && (
          <p className="-mt-2 text-xs text-slate-500">
            Estoque disponível de {selectedProduct.name}:{" "}
            <strong>
              {formatQuantity(selectedProduct.currentStock)} {PRODUCT_UNIT_LABELS[selectedProduct.unit]}
            </strong>
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            step="0.001"
            min={0.001}
            placeholder="Ex: 10"
            error={errors.quantity?.message}
            onKeyDown={blockLetters}
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
          placeholder="Ex: João Pereira"
          error={errors.responsibleName?.message}
          onKeyDown={blockDigits}
          {...register("responsibleName")}
        />
        <Textarea
          label="Observação"
          placeholder="Ex: Entrega realizada na sede da instituição"
          error={errors.observation?.message}
          {...register("observation")}
        />
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
