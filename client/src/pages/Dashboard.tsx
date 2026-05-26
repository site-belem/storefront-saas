import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  ShoppingCart,
  Settings,
  Plus,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import ProductsTab from "@/components/dashboard/ProductsTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("products");

  const { data: store, isLoading } = trpc.stores.getMyStore.useQuery();

  if (!user) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhuma loja encontrada
            </h2>
            <p className="text-slate-600 mb-6">
              Você ainda não criou uma loja. Clique no botão abaixo para começar.
            </p>
            <Button
              onClick={() => setLocation("/create-store")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Loja
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{store.name}</h1>
          <p className="text-slate-600 mt-1">
            Gerencie sua loja virtual e pedidos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Produtos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
              </div>
              <Package className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Receita Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">R$ 0</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b bg-slate-50 rounded-none p-0">
              <TabsTrigger
                value="products"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="p-6">
              <ProductsTab store={store} />
            </TabsContent>

            <TabsContent value="orders" className="p-6">
              <OrdersTab store={store} />
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <SettingsTab store={store} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
