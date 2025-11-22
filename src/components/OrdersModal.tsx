import { useEffect, useState } from 'react';
import { X, Package, Clock } from 'lucide-react';
import { supabase, Order, OrderItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

interface OrdersModalProps {
  onClose: () => void;
}

export function OrdersModal({ onClose }: OrdersModalProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data as OrderWithItems[]);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
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
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No orders yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start shopping to see your orders here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            {order.order_number}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(order.created_at)}
                          </span>
                          <span>{order.order_items.length} items</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Shipping Address
                        </h4>
                        <p className="text-sm text-gray-600">{order.shipping_address}</p>
                      </div>

                      {order.payment_method && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Payment Method
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.payment_method}
                          </p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                            >
                              {item.products && (
                                <>
                                  <img
                                    src={
                                      item.products.image_url ||
                                      'https://via.placeholder.com/60'
                                    }
                                    alt={item.products.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {item.products.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
