import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateInstitution, useUpdateInstitution } from "@/hooks/useInstitutions";
import { extractErrorMessage } from "@/lib/api";
import type { Institution } from "@/types/institution";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatCnpj } from "@/utils/format";

const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(150),
  cnpj: z
    .string()
    .min(1, "O CNPJ é obrigatório")
    .regex(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  address: z.string().min(1, "O endereço é obrigatório").max(200),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email inválido").max(150).optional().or(z.literal("")),
  responsibleName: z.string().max(150).optional().or(z.literal("")),
  familiesServed: z.coerce.number().int().min(0).optional().or(z.literal("")),
  active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface InstitutionFormModalProps {
  institution: Institution | null;
  onClose: () => void;
}

export function InstitutionFormModal({ institution, onClose }: InstitutionFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createInstitution = useCreateInstitution();
  const updateInstitution = useUpdateInstitution();
  const isEditing = institution !== null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: institution?.name ?? "",
      cnpj: institution?.cnpj ?? "",
      address: institution?.address ?? "",
      phone: institution?.phone ?? "",
      email: institution?.email ?? "",
      responsibleName: institution?.responsibleName ?? "",
      familiesServed: institution?.familiesServed ?? undefined,
      active: institution?.active ?? true,
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const payload = {
      name: values.name,
      cnpj: values.cnpj,
      address: values.address,
      phone: values.phone || undefined,
      email: values.email || undefined,
      responsibleName: values.responsibleName || undefined,
      familiesServed: values.familiesServed === "" ? undefined : Number(values.familiesServed),
      active: values.active,
    };

    try {
      if (isEditing) {
        await updateInstitution.mutateAsync({ id: institution.id, payload });
      } else {
        await createInstitution.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <Modal title={isEditing ? "Editar instituição" : "Nova instituição"} isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ErrorBanner message={serverError} />
        <Input label="Nome" error={errors.name?.message} {...register("name")} />
        <Input
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          error={errors.cnpj?.message}
          value={watch("cnpj")}
          onChange={(e) => setValue("cnpj", formatCnpj(e.target.value), { shouldValidate: true })}
        />
        <Input label="Endereço" error={errors.address?.message} {...register("address")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Telefone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Responsável"
            error={errors.responsibleName?.message}
            {...register("responsibleName")}
          />
          <Input
            label="Famílias atendidas"
            type="number"
            min={0}
            error={errors.familiesServed?.message as string | undefined}
            {...register("familiesServed")}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("active")} />
          Instituição ativa
        </label>
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
