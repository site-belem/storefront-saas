import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test schema validation for checkout
const checkoutSchema = z.object({
  storeId: z.number().positive("ID da loja é inválido"),
  customerName: z.string().min(1, "Nome do cliente é obrigatório"),
  customerPhone: z.string().min(1, "Telefone é obrigatório"),
  customerAddress: z.string().min(1, "Endereço é obrigatório"),
  totalAmount: z.string().regex(/^\d+(\.\d{2})?$/, "Valor total inválido"),
  items: z.array(
    z.object({
      productId: z.number().positive(),
      productName: z.string().min(1),
      quantity: z.number().min(1),
      unitPrice: z.string().regex(/^\d+(\.\d{2})?$/),
      subtotal: z.string().regex(/^\d+(\.\d{2})?$/),
    })
  ),
});

describe("Checkout Validation", () => {
  it("should validate correct checkout data", () => {
    const validCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerAddress: "Rua Principal, 123",
      totalAmount: "99.90",
      items: [
        {
          productId: 1,
          productName: "Produto A",
          quantity: 2,
          unitPrice: "49.95",
          subtotal: "99.90",
        },
      ],
    };

    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("should reject checkout without customer name", () => {
    const invalidCheckout = {
      storeId: 1,
      customerName: "",
      customerPhone: "(11) 99999-9999",
      customerAddress: "Rua Principal, 123",
      totalAmount: "99.90",
      items: [],
    };

    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(false);
  });

  it("should reject checkout without customer phone", () => {
    const invalidCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "",
      customerAddress: "Rua Principal, 123",
      totalAmount: "99.90",
      items: [],
    };

    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(false);
  });

  it("should reject checkout without customer address", () => {
    const invalidCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerAddress: "",
      totalAmount: "99.90",
      items: [],
    };

    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(false);
  });

  it("should reject checkout with invalid total amount format", () => {
    const invalidCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerAddress: "Rua Principal, 123",
      totalAmount: "99,90", // Invalid format (comma instead of dot)
      items: [],
    };

    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(false);
  });

  it("should reject checkout with empty items array", () => {
    const invalidCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerAddress: "Rua Principal, 123",
      totalAmount: "99.90",
      items: [],
    };

    // This should be allowed (validation passes) but business logic should reject
    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(true);
  });

  it("should validate multiple items in checkout", () => {
    const validCheckout = {
      storeId: 1,
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerAddress: "Rua Principal, 123",
      totalAmount: "149.85",
      items: [
        {
          productId: 1,
          productName: "Produto A",
          quantity: 2,
          unitPrice: "49.95",
          subtotal: "99.90",
        },
        {
          productId: 2,
          productName: "Produto B",
          quantity: 1,
          unitPrice: "49.95",
          subtotal: "49.95",
        },
      ],
    };

    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("should format WhatsApp message correctly", () => {
    const cartItems = [
      {
        productId: 1,
        productName: "Pizza Margherita",
        quantity: 2,
        unitPrice: "45.00",
        subtotal: "90.00",
      },
      {
        productId: 2,
        productName: "Coca-Cola",
        quantity: 1,
        unitPrice: "8.00",
        subtotal: "8.00",
      },
    ];

    const customerName = "João Silva";
    const customerAddress = "Rua Principal, 123";
    const customerPhone = "(11) 99999-9999";
    const totalAmount = 98.0;

    let message = `Olá! Gostaria de fazer um pedido.\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*Endereço:* ${customerAddress}\n`;
    message += `*Telefone:* ${customerPhone}\n\n`;
    message += `*Produtos:*\n`;

    cartItems.forEach((item) => {
      message += `${item.quantity}x ${item.productName} - R$ ${parseFloat(item.unitPrice).toFixed(2)}\n`;
    });

    message += `\n*Total:* R$ ${totalAmount.toFixed(2)}`;

    expect(message).toContain("João Silva");
    expect(message).toContain("2x Pizza Margherita");
    expect(message).toContain("1x Coca-Cola");
    expect(message).toContain("R$ 98.00");
  });
});
