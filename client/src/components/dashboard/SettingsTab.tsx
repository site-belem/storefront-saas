import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SettingsTabProps {
  store: any;
}

export default function SettingsTab({ store }: SettingsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: store.name || "",
    description: store.description || "",
    accentColor: store.accentColor || "#000000",
    whatsapp: store.whatsapp || "",
    address: store.address || "",
  });

  const updateStoreMutation = trpc.stores.update.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateStoreMutation.mutateAsync(formData);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-slate-700 font-medium">
            Nome da Loja
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-slate-700 font-medium">
            Descrição
          </Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="accentColor" className="text-slate-700 font-medium">
            Cor de Destaque
          </Label>
          <div className="flex items-center gap-3 mt-2">
            <input
              id="accentColor"
              name="accentColor"
              type="color"
              value={formData.accentColor}
              onChange={handleChange}
              className="w-12 h-12 rounded-md cursor-pointer"
            />
            <Input
              type="text"
              value={formData.accentColor}
              onChange={handleChange}
              name="accentColor"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="whatsapp" className="text-slate-700 font-medium">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Ex: +55 11 99999-9999"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="address" className="text-slate-700 font-medium">
            Endereço
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ex: Rua Principal, 123"
            className="mt-2"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </form>
    </div>
  );
}
