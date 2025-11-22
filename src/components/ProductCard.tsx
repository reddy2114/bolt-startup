import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            {discount}% OFF
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 h-12">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-700">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            ({product.review_count})
          </span>
        </div>

        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price.toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.original_price.toFixed(2)}
            </span>
          )}
          <span className="text-sm text-gray-500">/ {product.unit}</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg font-medium transition ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
