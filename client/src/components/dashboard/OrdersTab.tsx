import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OrdersTabProps {
  store: any;
}

export default function OrdersTab({ store }: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus as any,
      });
      toast.success("Status atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600">Nenhum pedido recebido ainda</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por cliente ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            size="sm"
          >
            Pendentes
          </Button>
          <Button
            variant={statusFilter === "confirmed" ? "default" : "outline"}
            onClick={() => setStatusFilter("confirmed")}
            size="sm"
          >
            Confirmados
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            size="sm"
          >
            Concluídos
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-600">
        {filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""}
      </p>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">Nenhum pedido encontrado</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Data
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-900">#{order.id}</td>
                <td className="py-3 px-4 text-slate-900">
                  {order.customerName}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  R$ {parseFloat(order.totalAmount).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updateStatusMutation.isPending}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implementar visualização detalhada do pedido
                    }}
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
