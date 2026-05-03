import sys

with open('src/pages/customer/BookingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '  return (\n    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden"'
# We must find the last return statement in the component.  const isDetailsValid is right before it.
start_idx = text.rfind('  return (\n    <div className="min-h')

if start_idx == -1:
    print("Could not find start marker for Part 2", file=sys.stderr)
    sys.exit(1)

replacement = '''  return (
    <div className="min-h-screen relative bg-stone-50 pb-20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 relative z-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          
          {/* Main Form Area */}
          <div className="order-2 lg:order-1">
            <button
              onClick={() => {
                if (step === 2) setStep(1);
                else {
                  setSelectedDate('');
                  setSelectedTime('');
                  setSelectedGuests(0);
                  setStep(1);
                }
              }}
              className="mb-8 text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              ? Back to {step === 2 ? 'Details' : 'availability'}
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Header */}
              <div className="px-8 py-8 border-b border-stone-100 bg-white">
                <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase mb-2">
                  Step {step} of 2
                </p>
                <h2 className="text-3xl font-serif text-stone-900">
                  {step === 1 ? 'Your Details' : step === 2 ? 'Secure Payment' : ''}
                </h2>
                {isConfirmed && <h2 className="text-3xl font-serif text-stone-900">Booking Confirmed</h2>}
              </div>

              {/* Step 1: Contact Details */}
              {step === 1 && (
                <div className="px-8 py-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-stone-600 mb-2 block">First Name *</Label>
                      <Input
                        id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className="h-12 bg-stone-50 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-xl"
                        placeholder="e.g. John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-stone-600 mb-2 block">Last Name *</Label>
                      <Input
                        id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className="h-12 bg-stone-50 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-xl"
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-stone-600 mb-2 block">Email *</Label>
                      <Input
                        id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                        className="h-12 bg-stone-50 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-xl"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-stone-600 mb-2 block">Phone *</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center px-4 bg-stone-100 rounded-xl border border-stone-200 text-stone-600 font-medium">
                          +44
                        </div>
                        <Input
                          id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                          className="h-12 flex-1 bg-stone-50 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-xl"
                          placeholder="7123 456789"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="text-stone-600 mb-2 block">Special Requests</Label>
                    <textarea
                      id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange}
                      className="w-full h-32 resize-none rounded-xl bg-stone-50 border border-stone-200 p-4 text-stone-900 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                      placeholder="Dietary requirements, special occasion, allergies..."
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!isDetailsValid}
                      className="w-full h-14 text-base font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white disabled:bg-stone-300 transition-colors"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="px-8 py-8">
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      onSuccess={handlePaymentSuccess}
                      amount={totalChargeNow}
                    />
                  </Elements>

                  {saveError && (
                    <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      {saveError}
                    </div>
                  )}
                </div>
              )}

              {isConfirmed && (
                <div className="px-8 py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-900 mb-2">Reservation Confirmed</h3>
                  <p className="text-stone-500">Redirecting you to your confirmation page...</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Reservation Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-stone-900 rounded-2xl p-8 text-stone-100 sticky top-24 shadow-xl">
              <h3 className="font-serif text-2xl mb-8 text-white">Reservation Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <Calendar size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-stone-400 text-sm font-medium mb-1">Date</div>
                    <div className="text-lg text-white font-serif">{formatDate(selectedDate)}</div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Clock size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-stone-400 text-sm font-medium mb-1">Time</div>
                    <div className="text-lg text-white font-serif">{formatTime(selectedTime)}</div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Users size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-stone-400 text-sm font-medium mb-1">Guests</div>
                    <div className="text-lg text-white font-serif">{selectedGuests} People</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-800 space-y-4">
                <div className="flex justify-between items-center text-stone-300">
                  <span>Reservation Deposit</span>
                  <span>{formatCurrency(baseDepositAmount)}</span>
                </div>
                {hasPreOrder && (
                  <div className="flex justify-between items-center text-stone-300">
                    <span>Pre-order Menu ({cartItemCount} items)</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-stone-800 flex justify-between items-center">
                  <span className="text-lg font-serif text-white">Total</span>
                  <span className="text-2xl font-serif text-amber-500">{formatCurrency(totalChargeNow)}</span>
                </div>
                <p className="text-xs text-stone-500 mt-4 leading-relaxed">
                  Fully refundable with 24 hours notice. Cancellations made within 24 hours will forfeit the deposit.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
'''

new_text = text[:start_idx] + replacement

with open('src/pages/customer/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Updated Part 2')
