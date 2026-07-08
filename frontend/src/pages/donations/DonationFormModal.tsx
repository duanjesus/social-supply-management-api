import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateDonation } from "@/hooks/useDonations";
import { useAllProducts } from "@/hooks/useProducts";
import { extractErrorMessage } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { todayIsoDate } from "@/utils/format";
import { formatCpfCnpj } from "@/utils/mask";
import { blockDigits, blockLetters } from "@/utils/inputGuards";

const schema = z.object({
  donorName: z.string().min(1, "O nome do doador é obrigatório").max(150),
  donorDocument: z.string().max(20).optional().or(z.literal("")),
  productId: z.coerce.number({ invalid_type_error: "O produto é obrigatório" }).positive("O produto é obrigatório"),
  quantity: z.coerce.number({ invalid_type_error: "A quantidade é obrigatória" }).min(0.001, "A quantidade deve ser maior que zero"),
  donationDate: z.string().min(1, "A data da doação é obrigatória"),
  description: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface DonationFormModalProps {
  onClose: () => void;
}

export function DonationFormModal({ onClose }: DonationFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createDonation = useCreateDonation();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { donationDate: todayIsoDate() },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createDonation.mutateAsync({
        donorName: values.donorName,
        donorDocument: values.donorDocument || undefined,
        productId: values.productId,
        quantity: values.quantity,
        donationDate: values.donationDate,
        description: values.description || undefined,
      });
      onClose();
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <Modal title="Registrar doação" isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ErrorBanner message={serverError} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Doador"
            placeholder="Ex: Carlos Andrade"
            error={errors.donorName?.message}
            onKeyDown={blockDigits}
            {...register("donorName")}
          />
          <Input
            label="Documento"
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={18}
            error={errors.donorDocument?.message}
            onKeyDown={blockLetters}
            {...register("donorDocument", {
              onChange: (e) => {
                e.target.value = formatCpfCnpj(e.target.value);
              },
            })}
          />
        </div>
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
            placeholder="Ex: 10"
            error={errors.quantity?.message}
            onKeyDown={blockLetters}
            {...register("quantity")}
          />
          <Input
            label="Data da doação"
            type="date"
            max={todayIsoDate()}
            error={errors.donationDate?.message}
            {...register("donationDate")}
          />
        </div>
        <Textarea
          label="Observação"
          placeholder="Ex: Doação da campanha do agasalho"
          error={errors.description?.message}
          {...register("description")}
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
