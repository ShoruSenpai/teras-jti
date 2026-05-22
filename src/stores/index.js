// A simple, reactive state manager using Proxy and Pub/Sub

const state = {
  cart: [],
  menuItems: [],
  activeOrders: [],
  reservationList: [],
  user: JSON.parse(sessionStorage.getItem('user')) || null,
};

const listeners = [];

export const store = new Proxy(state, {
  set(target, property, value) {
    target[property] = value;
    // Persist user session
    if (property === 'user') {
      if (value) {
        sessionStorage.setItem('user', JSON.stringify(value));
      } else {
        sessionStorage.removeItem('user');
      }
    }
    // Notify listeners
    listeners.forEach((listener) => listener(property, value));
    return true;
  },
});

export const subscribe = (listener) => {
  listeners.push(listener);
  // Return an unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Helper actions
export const actions = {
  login: (userData) => {
    store.user = userData;
  },
  logout: () => {
    store.user = null;
  },
  addToCart: (item) => {
    const existingItem = store.cart.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.qty += 1;
      // Trigger update manually since nested object mutation doesn't trigger proxy set
      store.cart = [...store.cart];
    } else {
      store.cart = [...store.cart, { ...item, qty: 1 }];
    }
  },
  removeFromCart: (itemId) => {
    store.cart = store.cart.filter((i) => i.id !== itemId);
  },
  updateCartQty: (itemId, delta) => {
    const cart = [...store.cart];
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        store.cart = cart.filter((i) => i.id !== itemId);
      } else {
        store.cart = cart;
      }
    }
  },
  clearCart: () => {
    store.cart = [];
  },
};
