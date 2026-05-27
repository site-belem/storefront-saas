import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "./_core/simple-auth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário ou senha incorretos",
          });
        }

        const passwordValid = await verifyPassword(input.password, user.password);
        if (!passwordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário ou senha incorretos",
          });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, user.id.toString(), cookieOptions);

        return { success: true, user };
      }),

    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
          password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
          confirmPassword: z.string(),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "As senhas não conferem",
          });
        }

        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Usuário já existe",
          });
        }

        const hashedPassword = await hashPassword(input.password);
        const userId = await db.createUser(
          input.username,
          hashedPassword,
          input.name
        );

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, userId.toString(), cookieOptions);

        return { success: true, userId };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ STORE ROUTES ============
  stores: router({
    // Get the current user's store
    getMyStore: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStore(ctx.user.id);
    }),

    // Get store by slug (public)
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const store = await db.getStoreBySlug(input.slug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }
        return store;
      }),

    // Create a new store
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome da loja é obrigatório"),
          slug: z
            .string()
            .min(3, "Slug deve ter pelo menos 3 caracteres")
            .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen"),
          whatsapp: z.string().optional(),
          address: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a store
        const existingStore = await db.getUserStore(ctx.user.id);
        if (existingStore) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Você já possui uma loja",
          });
        }

        // Check if slug is already taken
        const slugExists = await db.getStoreBySlug(input.slug);
        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este slug já está em uso",
          });
        }

        return await db.createStore(
          ctx.user.id,
          input.name,
          input.slug,
          input.whatsapp,
          input.address
        );
      }),

    // Update store settings
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          logo: z.string().optional(),
          bannerImage: z.string().optional(),
          accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
          address: z.string().optional(),
          whatsapp: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.updateStore(store.id, input);
      }),
  }),

  // ============ CATEGORY ROUTES ============
  categories: router({
    // Get all categories for a store
    list: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStoreCategories(input.storeId);
      }),

    // Create a new category
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome da categoria é obrigatório"),
          description: z.string().optional(),
          icon: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.createCategory(
          store.id,
          input.name,
          input.description,
          input.icon
        );
      }),

    // Update a category
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.updateCategory(input.id, {
          name: input.name,
          description: input.description,
          icon: input.icon,
        });
      }),

    // Delete a category
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.deleteCategory(input.id);
      }),
  }),

  // ============ PRODUCT ROUTES ============
  products: router({
    // Get all products for a store
    list: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStoreProducts(input.storeId);
      }),

    // Get products by category
    listByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryProducts(input.categoryId);
      }),

    // Create a new product
    create: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          name: z.string().min(1, "Nome do produto é obrigatório"),
          description: z.string().optional(),
          price: z.string().regex(/^\d+(\.\d{2})?$/, "Preço inválido"),
          image: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.createProduct(
          store.id,
          input.categoryId,
          input.name,
          input.price,
          input.description,
          input.image
        );
      }),

    // Update a product
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
          image: z.string().optional(),
          categoryId: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.updateProduct(input.id, {
          name: input.name,
          description: input.description,
          price: input.price,
          image: input.image,
          categoryId: input.categoryId,
          isActive: input.isActive,
        });
      }),

    // Delete a product
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.deleteProduct(input.id);
      }),
  }),

  // ============ ORDER ROUTES ============
  orders: router({
    // Get all orders for the user's store
    list: protectedProcedure.query(async ({ ctx }) => {
      const store = await db.getUserStore(ctx.user.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loja não encontrada",
        });
      }

      return await db.getStoreOrders(store.id);
    }),

    // Get a specific order with items
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        const order = await db.getOrderWithItems(input.id);
        if (!order || order.storeId !== store.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pedido não encontrado",
          });
        }

        return order;
      }),

    // Create a new order (public - from customer)
    create: publicProcedure
      .input(
        z.object({
          storeId: z.number(),
          customerName: z.string().min(1, "Nome do cliente é obrigatório"),
          customerPhone: z.string().min(1, "Telefone é obrigatório"),
          customerAddress: z.string().min(1, "Endereço é obrigatório"),
          totalAmount: z.string(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              quantity: z.number().min(1),
              unitPrice: z.string(),
              subtotal: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createOrder(
          input.storeId,
          input.customerName,
          input.customerPhone,
          input.customerAddress,
          input.totalAmount,
          input.items
        );
      }),

    // Update order status
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getUserStore(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Loja não encontrada",
          });
        }

        return await db.updateOrderStatus(input.id, store.id, input.status);
      }),
  }),
});

export type AppRouter = typeof appRouter;
