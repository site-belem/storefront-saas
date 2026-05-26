import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProductsTabProps {
  store: any;
}

export default function ProductsTab({ store }: ProductsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: products, isLoading } = trpc.products.list.useQuery({
    storeId: store.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Produtos</h3>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">Nenhum produto adicionado ainda</p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="outline"
            className="mt-4"
          >
            Adicionar primeiro produto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h4 className="font-semibold text-slate-900">{product.name}</h4>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                {product.description}
              </p>
              <p className="text-lg font-bold text-blue-600 mt-3">
                R$ {parseFloat(product.price).toFixed(2)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* TODO: Implementar CreateProductDialog */}
    </div>
  );
}
