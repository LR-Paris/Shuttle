export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  boxCost: number;
  unitsPerBox: number;
  quantity: number; // number of boxes
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const CART_KEY = 'b2b_cart';

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0 };
  }

  try {
    const cartJson = localStorage.getItem(CART_KEY);
    if (!cartJson) {
      return { items: [], total: 0 };
    }

    const cart: Cart = JSON.parse(cartJson);
    return cart;
  } catch (error) {
    console.error('Error reading cart:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Notify the rest of the app that the cart changed.
 *
 * Dispatched from saveCart rather than from each caller. Callers used to fire
 * this by hand, so a missed dispatch — or one landing while the header was
 * between mounts — left the header badge showing items for a cart that had
 * already been emptied.
 */
function notifyCartChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('cartUpdated'));
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    notifyCartChanged();
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.boxCost * item.quantity, 0);
}

export function addToCart(
  productId: string,
  productName: string,
  sku: string,
  boxCost: number,
  unitsPerBox: number,
  quantity: number
): Cart {
  const cart = getCart();
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      productName,
      sku,
      boxCost,
      unitsPerBox,
      quantity,
    });
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId: string, quantity: number): Cart {
  const cart = getCart();
  const item = cart.items.find(item => item.productId === productId);

  if (item) {
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.productId !== productId);
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const cart: Cart = { items: [], total: 0 };
  saveCart(cart);
  return cart;
}
