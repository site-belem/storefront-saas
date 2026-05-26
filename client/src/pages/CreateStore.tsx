import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Store } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CreateStore() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    whatsapp: "",
    address: "",
  });

  const createStoreMutation = trpc.stores.create.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createStoreMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        whatsapp: formData.whatsapp,
        address: formData.address,
      });

      toast.success("Loja criada com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar loja");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <p className="text-center text-slate-600">Redirecionando...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">
          Crie sua loja
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Configure os dados básicos da sua loja virtual
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Nome da Loja *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Pizzaria Delícia"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="slug" className="text-slate-700 font-medium">
              URL da Loja *
            </Label>
            <div className="mt-2 flex items-center bg-slate-50 rounded-md border border-slate-200 px-3 py-2">
              <span className="text-slate-600 text-sm">loja/</span>
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="pizzaria-delicia"
                value={formData.slug}
                onChange={handleChange}
                required
                className="border-0 bg-transparent flex-1 text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Use apenas letras minúsculas, números e hífen
            </p>
          </div>

          <div>
            <Label htmlFor="whatsapp" className="text-slate-700 font-medium">
              WhatsApp (opcional)
            </Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              placeholder="Ex: +55 11 99999-9999"
              value={formData.whatsapp}
              onChange={handleChange}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-slate-700 font-medium">
              Endereço (opcional)
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Ex: Rua Principal, 123"
              value={formData.address}
              onChange={handleChange}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.name || !formData.slug}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando loja...
              </>
            ) : (
              "Criar Loja"
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Você poderá editar esses dados depois no painel administrativo
        </p>
      </Card>
    </div>
  );
}
