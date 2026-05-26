import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  totalAmount: number;
  store: any;
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  cartItems,
  totalAmount,
  store,
}: CheckoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateWhatsAppMessage = () => {
    let message = `Olá! Gostaria de fazer um pedido.\n\n`;
    message += `*Cliente:* ${formData.customerName}\n`;
    message += `*Endereço:* ${formData.customerAddress}\n`;
    message += `*Telefone:* ${formData.customerPhone}\n\n`;
    message += `*Produtos:*\n`;

    cartItems.forEach((item) => {
      message += `${item.quantity}x ${item.productName} - R$ ${parseFloat(item.unitPrice).toFixed(2)}\n`;
    });

    message += `\n*Total:* R$ ${totalAmount.toFixed(2)}`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.customerName.trim()) {
        toast.error("Nome do cliente é obrigatório");
        setIsLoading(false);
        return;
      }
      if (!formData.customerPhone.trim()) {
        toast.error("Telefone é obrigatório");
        setIsLoading(false);
        return;
      }
      if (!formData.customerAddress.trim()) {
        toast.error("Endereço é obrigatório");
        setIsLoading(false);
        return;
      }
      if (!store.whatsapp) {
        toast.error("Loja não possui WhatsApp configurado");
        setIsLoading(false);
        return;
      }

      // Create order in database
      const orderId = await createOrderMutation.mutateAsync({
        storeId: store.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount: totalAmount.toFixed(2),
        items: cartItems,
      });

      // Generate WhatsApp message
      const message = generateWhatsAppMessage();

      // Redirect to WhatsApp
      const whatsappNumber = store.whatsapp.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

      // Close dialog and redirect
      onOpenChange(false);
      toast.success("Pedido criado! Redirecionando para WhatsApp...");

      // Delay redirect slightly to show toast
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pedido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName" className="text-slate-700 font-medium">
              Seu Nome *
            </Label>
            <Input
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Ex: João Silva"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customerPhone" className="text-slate-700 font-medium">
              Telefone/WhatsApp *
            </Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customerAddress" className="text-slate-700 font-medium">
              Endereço de Entrega *
            </Label>
            <textarea
              id="customerAddress"
              name="customerAddress"
              placeholder="Ex: Rua Principal, 123, Apto 45"
              value={formData.customerAddress}
              onChange={handleChange}
              rows={3}
              required
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3">Resumo do Pedido</h4>
            <div className="space-y-2 text-sm mb-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="text-slate-600">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium text-slate-900">
                    R$ {parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-blue-600">R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Enviar para WhatsApp"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
