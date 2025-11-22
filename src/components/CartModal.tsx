import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartModalProps {
  onClose: () => void;
  onCheckout: () => void;
}

export function CartModal({ onClose, onCheckout }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { user } = useAuth();
  const total = getCartTotal();

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Please sign in to view your cart</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                >
                  <img
                    src={item.products.image_url || 'https://via.placeholder.com/80'}
                    alt={item.products.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.products.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ₹{item.products.price.toFixed(2)} / {item.products.unit}
                    </p>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>

                      <span className="font-medium text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      ₹{(item.products.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
