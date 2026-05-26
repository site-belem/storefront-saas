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

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline">Entrar</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Começar Grátis
                  </Button>
                </a>
              </>
            )}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            Tudo que você precisa para vender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 hover:shadow-lg transition">
              <Store className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Loja Profissional
              </h3>
              <p className="text-slate-600">
                Crie uma vitrine elegante com fotos, descrições e preços dos seus
                produtos. Design moderno e responsivo.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:shadow-lg transition">
              <ShoppingCart className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Carrinho de Compras
              </h3>
              <p className="text-slate-600">
                Seus clientes adicionam produtos ao carrinho e finalizam o pedido
                de forma intuitiva e segura.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:shadow-lg transition">
              <MessageCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Integração WhatsApp
              </h3>
              <p className="text-slate-600">
                Pedidos são enviados automaticamente para o WhatsApp da sua loja.
                Comunique-se diretamente com clientes.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Painel de Controle
              </h3>
              <p className="text-slate-600">
                Gerencie produtos, categorias, pedidos e configurações em um único
                lugar. Tudo organizado e fácil.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 hover:shadow-lg transition">
              <Zap className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Rápido e Leve
              </h3>
              <p className="text-slate-600">
                Carregamento instantâneo, design otimizado para mobile. Seus
                clientes têm a melhor experiência.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 hover:shadow-lg transition">
              <Lock className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Seguro e Confiável
              </h3>
              <p className="text-slate-600">
                Seus dados e os de seus clientes são protegidos. Infraestrutura
                segura e escalável.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
          Como funciona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Crie sua conta",
              description: "Faça login com seu email ou Google em segundos",
            },
            {
              step: "2",
              title: "Configure sua loja",
              description: "Adicione nome, logo, endereço e WhatsApp",
            },
            {
              step: "3",
              title: "Adicione produtos",
              description: "Carregue fotos, descrições e preços dos produtos",
            },
            {
              step: "4",
              title: "Comece a vender",
              description: "Compartilhe o link da sua loja e receba pedidos",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Crie sua loja agora e comece a vender. É gratuito e leva menos de 5
            minutos.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
              Criar Loja Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-white">StoreFront</span>
              </div>
              <p className="text-sm">
                Plataforma para criar lojas virtuais e vender pelo WhatsApp.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Segurança
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Termos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 StoreFront. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
