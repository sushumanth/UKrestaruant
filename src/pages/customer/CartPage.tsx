import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useCustomerAuthStore } from '@/store';
import { formatCurrency } from '@/lib/mockData';
import { useMenuCartStore } from '@/store';

export const CartPage = () => {
  const { items, updateItemQuantity, removeItem, clearCart } = useMenuCartStore();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const tax = useMemo(() => Number((subtotal * 0.08).toFixed(2)), [subtotal]);
  const total = subtotal + tax;
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f0e1] px-5 pt-24 text-[#2d241b] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#ead6b8] bg-[#fffaf1] p-8 text-center shadow-[0_18px_46px_rgba(78,45,18,0.08)]">
          <ShoppingBag size={42} className="mx-auto text-[#7d2419]" />
          <h1 className="mt-4 font-serif text-[clamp(34px,5vw,54px)] leading-none text-[#2c2117]">Your cart is empty</h1>
          <p className="mx-auto mt-3 max-w-xl text-[#685949]">Add dishes from the menu to see them here.</p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7d2419] px-5 py-3 text-sm font-semibold text-[#fff3df] shadow-[0_12px_24px_rgba(125,36,25,0.2)] transition-colors hover:bg-[#962c20]"
          >
            Browse menu
          </Link>
        </div>
      </div>
    );
  }

  const isCustomerAuthenticated = useCustomerAuthStore((s) => s.isCustomerAuthenticated);

  return (
    <div className="min-h-screen bg-[#f8f0e1] pt-24 text-[#2d241b]">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[30px] border border-[#ead6b8] bg-[#fffaf1] p-5 shadow-[0_16px_34px_rgba(83,50,17,0.06)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#ead7ba] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d49]">Your order</p>
                <h1 className="mt-1 font-serif text-3xl text-[#2c2117]">{itemCount} item(s)</h1>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-[#dbc7a2] bg-white px-4 py-2 text-sm font-medium text-[#70583a]"
              >
                Clear cart
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#ead7ba] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="truncate font-semibold text-[#2d2319]">{item.name}</h3>
                          <p className="text-xs text-[#7d6a57]">{formatCurrency(item.price)} each</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full border border-[#dbc7a2] bg-white p-2 text-[#7d2419]"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1.5 text-[#7d531f]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-medium text-[#4d3e2c]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1.5 text-[#7d531f]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-[#7d2419]">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[30px] border border-[#ead6b8] bg-[#fffaf1] p-5 shadow-[0_16px_34px_rgba(83,50,17,0.06)] sm:p-6">
              <h2 className="font-serif text-2xl text-[#2c2117]">Bill summary</h2>
              <div className="mt-4 space-y-2 text-sm text-[#645545]">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex items-center justify-between"><span>Taxes</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex items-center justify-between border-t border-[#ead7b9] pt-2 text-base font-semibold text-[#2d2319]"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <Link
                to={isCustomerAuthenticated ? '/online-order' : `/customer/auth?redirect=${encodeURIComponent('/online-order')}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#7d2419] px-5 py-3 text-sm font-semibold text-[#fff3df] shadow-[0_12px_24px_rgba(125,36,25,0.22)]"
              >
                Continue to booking
              </Link>
              <Link
                to={isCustomerAuthenticated ? '/menu' : `/customer/auth?redirect=${encodeURIComponent('/menu')}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7d2419] px-5 py-3 text-sm font-semibold text-[#fff3df] shadow-[0_12px_24px_rgba(125,36,25,0.2)] transition-colors hover:bg-[#962c20]"
              >
                Browse menu
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};