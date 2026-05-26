import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  stores,
  categories,
  products,
  orders,
  orderItems,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ STORE FUNCTIONS ============

export async function getUserStore(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createStore(
  userId: number,
  name: string,
  slug: string,
  whatsapp?: string,
  address?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stores).values({
    userId,
    name,
    slug,
    whatsapp,
    address,
  });

  return result;
}

export async function updateStore(
  storeId: number,
  data: {
    name?: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    accentColor?: string;
    address?: string;
    whatsapp?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(stores).set(data).where(eq(stores.id, storeId));
}

// ============ CATEGORY FUNCTIONS ============

export async function getStoreCategories(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(categories)
    .where(eq(categories.storeId, storeId));
}

export async function createCategory(
  storeId: number,
  name: string,
  description?: string,
  icon?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(categories).values({
    storeId,
    name,
    description,
    icon,
  });
}

export async function updateCategory(
  categoryId: number,
  data: {
    name?: string;
    description?: string;
    icon?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, categoryId));
}

export async function deleteCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(categories)
    .where(eq(categories.id, categoryId));
}

// ============ PRODUCT FUNCTIONS ============

export async function getStoreProducts(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));
}

export async function getCategoryProducts(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId));
}

export async function createProduct(
  storeId: number,
  categoryId: number,
  name: string,
  price: string,
  description?: string,
  image?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(products).values({
    storeId,
    categoryId,
    name,
    price,
    description,
    image,
  });
}

export async function updateProduct(
  productId: number,
  data: {
    name?: string;
    description?: string;
    price?: string;
    image?: string;
    categoryId?: number;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(products)
    .set(data)
    .where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(products)
    .where(eq(products.id, productId));
}

// ============ ORDER FUNCTIONS ============

export async function getStoreOrders(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (order.length === 0) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order[0],
    items,
  };
}

export async function createOrder(
  storeId: number,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  totalAmount: string,
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    storeId,
    customerName,
    customerPhone,
    customerAddress,
    totalAmount,
  });

  const orderId = (result[0] as any)?.insertId || result[0];

  // Insert order items
  for (const item of items) {
    await db.insert(orderItems).values({
      orderId: orderId as number,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    });
  }

  return orderId;
}

export async function updateOrderStatus(
  orderId: number,
  storeId: number,
  status: "pending" | "confirmed" | "completed" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify order belongs to the store
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (order.length === 0 || order[0].storeId !== storeId) {
    throw new Error("Pedido nao encontrado ou nao pertence a esta loja");
  }

  return await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, orderId));
}
