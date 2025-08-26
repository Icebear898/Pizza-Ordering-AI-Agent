import { useEffect, useState, useCallback } from 'react';
import { useDeepgram } from '../../../context/DeepgramContextProvider';
import { sendSocketMessage } from '../../../utils/deepgramUtils';

type OrderItem = {
  category: 'pizza' | 'side' | 'drink';
  name: string;
  size?: string;
  crust?: string;
  toppings?: string[];
  extras?: string[];
  quantity: number;
};

type Customer = {
  full_name?: string;
  phone?: string;
  dine_type?: 'dine-in' | 'delivery' | 'pickup';
  address?: string;
};

export default function PizzaAssistant() {
  const { socket } = useDeepgram();
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({});
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();
  const [paid, setPaid] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<'draft' | 'completed' | 'sent'>('draft');

  const startNewOrder = () => {
    setItems([]);
    setCustomer({});
    setPaymentMethod(undefined);
    setPaid(false);
    setOrderId(null);
    setOrderStatus('draft');
  };

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/menu');
      const data = await res.json();
      setMenu(data);
      return data;
    } catch (e) {
      console.error('Failed to fetch menu', e);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const msg = JSON.parse(event.data);
          if (msg.type === 'FunctionCallRequest') {
            const { functions } = msg as { functions: Array<{ id: string; name: string; arguments: string }> };
            const process = async () => {
              for (const f of functions) {
                const args = f.arguments ? JSON.parse(f.arguments) : {};
                try {
                  switch (f.name) {
                    case 'get_menu': {
                      const data = menu || (await fetchMenu());
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: JSON.stringify(data) });
                      break;
                    }
                    case 'start_order': {
                      setItems([]);
                      setCustomer({});
                      setPaymentMethod(undefined);
                      setPaid(false);
                      setOrderId(null);
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'set_order_type': {
                      setCustomer(prev => ({ ...prev, dine_type: args?.dine_type }));
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'add_pizza_item': {
                      const normalizeList = (val: any): string[] => {
                        if (!val) return [];
                        if (Array.isArray(val)) return val as string[];
                        if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
                        return [];
                      };
                      const item: OrderItem = {
                        category: 'pizza',
                        name: args?.name,
                        size: args?.size,
                        crust: args?.crust,
                        toppings: normalizeList(args?.toppings),
                        extras: normalizeList(args?.extras),
                        quantity: args?.quantity || 1,
                      };
                      setItems(prev => [...prev, item]);
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'add_side_item': {
                      const item: OrderItem = {
                        category: 'side',
                        name: args?.name,
                        quantity: args?.quantity || 1,
                      };
                      setItems(prev => [...prev, item]);
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'add_drink_item': {
                      const item: OrderItem = {
                        category: 'drink',
                        name: args?.name,
                        size: args?.size,
                        quantity: args?.quantity || 1,
                      };
                      setItems(prev => [...prev, item]);
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'remove_item': {
                      const idx = args?.index as number;
                      setItems(prev => prev.filter((_, i) => i !== idx));
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'set_customer_info': {
                      setCustomer(prev => ({
                        ...prev,
                        full_name: args?.full_name ?? prev.full_name,
                        phone: args?.phone ?? prev.phone,
                      }));
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'set_address': {
                      setCustomer(prev => ({ ...prev, address: args?.address }));
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'set_payment_method': {
                      setPaymentMethod(args?.method);
                      setPaid(Boolean(args?.paid));
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'ok' });
                      break;
                    }
                    case 'summarize_order': {
                      const summary = { items, customer, payment: { method: paymentMethod, paid } };
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: JSON.stringify(summary) });
                      break;
                    }
                    case 'finalize_order': {
                      const payload = { items, customer, payment: paymentMethod ? { method: paymentMethod, paid } : undefined };
                      const res = await fetch('/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      const data = await res.json();
                      setOrderId(data.order_id);
                      setOrderStatus('sent');
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: JSON.stringify(data) });
                      break;
                    }
                    case 'check_order_status': {
                      const id = args?.order_id ?? orderId;
                      if (!id) {
                        sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: 'missing order id' });
                        break;
                      }
                      const res = await fetch(`/orders/${id}`);
                      const data = await res.json();
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: JSON.stringify(data) });
                      break;
                    }
                    default: {
                      sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: `unknown function ${f.name}` });
                    }
                  }
                } catch (err: any) {
                  sendSocketMessage(socket, { type: 'FunctionCallResponse', id: f.id, name: f.name, content: err?.message || 'error' });
                }
              }
            };
            process();
          }
        }
      } catch (e) {
        // ignore
      }
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket, menu, items, customer, paymentMethod, paid, orderId, fetchMenu]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Pizza Ordering</h2>
        <div className="flex items-center space-x-3">
          {orderStatus === 'sent' && (
            <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              🍕 Order Sent to Kitchen
            </div>
          )}
          {orderId && (
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Order ID: {orderId}
            </div>
          )}
          {orderStatus === 'sent' && (
            <button
              onClick={startNewOrder}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🆕 New Order
            </button>
          )}
        </div>
      </div>

      {orderStatus === 'sent' ? (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-2xl font-bold text-orange-800 mb-2">Order Sent to Kitchen!</h3>
          <p className="text-orange-700 text-lg mb-4">Your delicious pizza is being prepared with care.</p>
          <p className="text-orange-600">Please wait, your order will arrive soon!</p>
          <div className="mt-6">
            <button
              onClick={startNewOrder}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg"
            >
              🆕 Start New Order
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-gray-600">Use voice to place an order, ask about the menu, or check order status.</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                🍕 Current Items
              </h3>
              {items.length === 0 ? (
                <div className="text-gray-500 text-sm italic">No items yet. Start ordering by voice!</div>
              ) : (
                <ul className="space-y-3">
                  {items.map((it, idx) => (
                    <li key={idx} className="flex justify-between items-start p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {it.category === 'pizza' ? '🍕' : it.category === 'side' ? '🥨' : '🥤'} {it.name}
                        </div>
                        <div className="text-sm text-gray-600 space-x-2">
                          {it.size && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{it.size}</span>}
                          {it.crust && <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">{it.crust}</span>}
                          {Array.isArray(it.toppings) && it.toppings.length > 0 && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              +{it.toppings.join(', ')}
                            </span>
                          )}
                          {Array.isArray(it.extras) && it.extras.length > 0 && (
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                              {it.extras.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        x{it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                👤 Customer Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-gray-500 mr-3">Name:</span>
                  <span className="font-medium text-gray-800">{customer.full_name || 'Not provided'}</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-gray-500 mr-3">Phone:</span>
                  <span className="font-medium text-gray-800">{customer.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-gray-500 mr-3">Type:</span>
                  <span className="font-medium text-gray-800">{customer.dine_type || 'Not selected'}</span>
                </div>
                {customer.dine_type === 'delivery' && (
                  <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-gray-500 mr-3">Address:</span>
                    <span className="font-medium text-gray-800">{customer.address || 'Not provided'}</span>
                  </div>
                )}
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-gray-500 mr-3">Payment:</span>
                  <span className="font-medium text-gray-800">
                    {paymentMethod || 'Not selected'} {paid ? '✅' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


