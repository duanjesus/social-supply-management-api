import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { extractErrorMessage } from "@/lib/api";
import type { Product } from "@/types/product";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_UNITS,
  PRODUCT_UNIT_LABELS,
} from "@/types/product";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { blockDigits, blockLetters } from "@/utils/inputGuards";
import { formatQuantity } from "@/utils/format";

const schema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório").max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  category: z.enum(["ALIMENTO", "HIGIENE", "LIMPEZA", "VESTUARIO", "OUTROS"]),
  unit: z.enum(["KG", "LITRO", "UNIDADE", "CAIXA", "PACOTE"]),
  minimumStock: z.coerce.number().min(0, "O estoque mínimo não pode ser negativo").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = product !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "ALIMENTO",
      unit: product?.unit ?? "UNIDADE",
      minimumStock: product?.minimumStock ?? undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const payload = {
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      unit: values.unit,
      minimumStock: values.minimumStock === "" ? undefined : Number(values.minimumStock),
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <Modal title={isEditing ? "Editar produto" : "Novo produto"} isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ErrorBanner message={serverError} />
        <Input
          label="Nome"
          placeholder="Ex: Arroz, Feijão, Sabonete"
          error={errors.name?.message}
          onKeyDown={blockDigits}
          {...register("name")}
        />
        <Textarea
          label="Descrição"
          placeholder="Ex: Pacote de 1kg, tipo 1"
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Categoria" error={errors.category?.message} {...register("category")}>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {PRODUCT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
          <Select label="Unidade" error={errors.unit?.message} {...register("unit")}>
            {PRODUCT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {PRODUCT_UNIT_LABELS[unit]}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Estoque mínimo (alerta)"
          type="number"
          min={0}
          placeholder="Ex: 10 (opcional)"
          error={errors.minimumStock?.message as string | undefined}
          onKeyDown={blockLetters}
          {...register("minimumStock")}
        />
        {isEditing && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Estoque atual: <strong>{formatQuantity(product.currentStock)}</strong>{" "}
            {PRODUCT_UNIT_LABELS[product.unit]}. Esse valor é calculado automaticamente pelas
            doações e distribuições registradas — não pode ser editado diretamente aqui.
          </p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
