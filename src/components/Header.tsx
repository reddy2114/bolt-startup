import { ShoppingCart, User, Search, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onShowAuth: () => void;
  onShowCart: () => void;
  onShowOrders: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onShowAuth, onShowCart, onShowOrders, onSearch }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Indian Spice
            </h1>

            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onShowOrders}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition"
                >
                  <Package className="w-5 h-5" />
                  <span className="hidden sm:inline">Orders</span>
                </button>

                <button
                  onClick={onShowCart}
                  className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onShowCart}
                  className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Cart</span>
                </button>

                <button
                  onClick={onShowAuth}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-medium"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
