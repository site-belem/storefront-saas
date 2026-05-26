import { Loader2, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

interface OrdersTabProps {
  store: any;
}

export default function OrdersTab({ store }: OrdersTabProps) {
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

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
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-900">#{order.id}</td>
                <td className="py-3 px-4 text-slate-900">
                  {order.customerName}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  R$ {parseFloat(order.totalAmount).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status === "pending"
                      ? "Pendente"
                      : order.status === "confirmed"
                        ? "Confirmado"
                        : order.status === "completed"
                          ? "Concluído"
                          : "Cancelado"}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
