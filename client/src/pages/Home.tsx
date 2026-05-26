import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Store,
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  // Se está carregando ou usuário está autenticado, não mostrar nada
  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900">StoreFront</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={getLoginUrl()}>
              <Button variant="outline">Entrar</Button>
            </a>
            <a href={getLoginUrl()}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Começar Grátis
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Sua loja virtual em minutos
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Crie uma loja online elegante e sofisticada para vender seus produtos
            diretamente pelo WhatsApp. Sem taxas, sem complicações.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Criar Minha Loja
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Button variant="outline" className="px-8 py-3 text-lg">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Tudo que você precisa para vender
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Store className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Loja Profissional</h3>
              <p className="text-slate-600">
                Crie uma vitrine elegante e sofisticada para seus produtos
              </p>
            </Card>
            <Card className="p-6">
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Carrinho Inteligente</h3>
              <p className="text-slate-600">
                Seus clientes adicionam produtos e compram direto pelo WhatsApp
              </p>
            </Card>
            <Card className="p-6">
              <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Integração WhatsApp</h3>
              <p className="text-slate-600">
                Receba pedidos automaticamente no seu WhatsApp
              </p>
            </Card>
            <Card className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Análise de Vendas</h3>
              <p className="text-slate-600">
                Acompanhe todos os seus pedidos e vendas em tempo real
              </p>
            </Card>
            <Card className="p-6">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Rápido e Fácil</h3>
              <p className="text-slate-600">
                Configure sua loja em minutos, sem conhecimento técnico
              </p>
            </Card>
            <Card className="p-6">
              <Lock className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Seguro e Confiável</h3>
              <p className="text-slate-600">
                Seus dados e os de seus clientes são sempre protegidos
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Comece agora mesmo
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Crie sua loja virtual em minutos e comece a vender pelo WhatsApp
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg">
              Criar Minha Loja Agora
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2026 StoreFront. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
