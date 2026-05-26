import { useState } from "react";
import { useRoute } from "wouter";
import { Loader2, ShoppingCart, MapPin, Phone } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CheckoutDialog from "@/components/CheckoutDialog";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export default function StoreFront() {
  const [, params] = useRoute("/loja/:slug");
  const slug = params?.slug || "";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: store, isLoading: storeLoading } = trpc.stores.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: categories } = trpc.categories.list.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store }
  );

  const { data: products } = trpc.products.list.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store }
  );

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Loja não encontrada
          </h1>
          <p className="text-slate-600">
            Desculpe, a loja que você procura não existe ou foi removida.
          </p>
        </Card>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.categoryId === selectedCategory) || []
    : products || [];

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0
  );

  const addToCart = (product: any) => {
    const existingItem = cartItems.find((item) => item.productId === product.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (
                  parseFloat(item.unitPrice) * (item.quantity + 1)
                ).toFixed(2),
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
        },
      ]);
    }

    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: (parseFloat(item.unitPrice) * quantity).toFixed(2),
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="font-bold text-lg text-slate-900">{store.name}</h1>
              {store.description && (
                <p className="text-xs text-slate-600">{store.description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ShoppingCart className="w-6 h-6 text-slate-900" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Store Info */}
            <Card className="p-6 mb-8">
              <div className="space-y-3">
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <p className="text-slate-700">{store.address}</p>
                  </div>
                )}
                {store.whatsapp && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <a
                      href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {store.whatsapp}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                      selectedCategory === null
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                        selectedCategory === category.id
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-bold text-blue-600">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </p>
                      <Button
                        onClick={() => addToCart(product)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Cart */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Carrinho
                </h2>

                {cartItems.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    Seu carrinho está vazio
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="px-2 py-1 bg-white border rounded text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                className="px-2 py-1 bg-white border rounded text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-semibold text-slate-900">
                          R$ {totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      Finalizar Pedido
                    </Button>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        cartItems={cartItems}
        totalAmount={totalAmount}
        store={store}
      />
    </div>
  );
}
