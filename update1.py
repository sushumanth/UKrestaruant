import sys

with open('src/pages/customer/BookingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '  // If no slot is selected yet, show premium booking entry\n  if (!selectedDate || !selectedTime) {\n    return ('
end_marker = '    );\n  }\n\n  const handlePaymentSuccess'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

replacement = '''  // If no slot is selected yet, show premium booking entry
  if (!selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen relative bg-stone-50 text-stone-900 pb-20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-widest text-amber-700 uppercase mb-3">Reservations</p>
            <h1 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-6 leading-tight">Book Your Perfect Table</h1>
            <p className="text-stone-600 text-lg leading-relaxed">
              Experience the authentic taste of fine dining in an elegant, serene setting. Select your party size, date, and preferred time to reserve your table.
            </p>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
            
            {/* Left Info Panel */}
            <div className="rounded-2xl bg-white border border-stone-200 p-8 sm:p-10 shadow-sm">
              <h3 className="font-serif text-2xl text-stone-900 mb-6">Opening Times</h3>
              <div className="space-y-4">
                {[
                  { day: 'Mon - Thu', time: '11:30am – 9:30pm' },
                  { day: 'Fri - Sat', time: '11:30am – 10:00pm' },
                  { day: 'Sunday', time: '11:30am – 8:00pm' },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-0">
                    <span className="text-stone-600 font-medium">{item.day}</span>
                    <span className="text-stone-500 text-sm">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-stone-50 p-5 rounded-xl border border-stone-100 text-stone-600 text-sm leading-relaxed">
                <span className="font-semibold text-stone-900">Note:</span> A small deposit of £5 secures your reservation. Fully refundable with 24 hours notice.
              </div>
            </div>

            {/* Right Booking Panel */}
            <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 sm:p-10 space-y-10">
              
              {/* Section: Guests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                    <Users size={18} className="text-amber-700" /> Number of Guests
                  </h3>
                  <span className="text-stone-500 text-sm font-medium">{draftGuests} {draftGuests === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guestOptions.map(num => (
                    <button
                      key={num}
                      onClick={() => setDraftGuests(num)}
                      className={w-12 h-12 rounded-full font-medium transition-all duration-200 \}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Section: Date & Time Preferences */}
              <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-amber-700" /> Select Date
                  </h3>
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-2 flex justify-center">
                    <DateCalendar
                      mode="single"
                      selected={draftDate}
                      onSelect={(date) => {
                        if (date) setDraftDate(date);
                      }}
                      disabled={(date) => date < new Date()}
                      className="bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                      <Clock size={18} className="text-amber-700" /> Time Preference
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {timeFilterOptions.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeFilterSelect(time)}
                        className={py-2.5 rounded-lg text-sm font-medium transition-colors \}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available Slots Display */}
              {draftTimeFilter !== 'All Times' && (
                <div className="pt-8 border-t border-stone-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-serif text-stone-900 mb-4">Available Slots</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {visibleSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => slot.available && setSelectedSlotTime(slot.time)}
                        disabled={!slot.available}
                        className={py-3 px-2 rounded-xl text-sm font-medium transition-all \}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  
                  {selectedSlotTime && availableTables.length > 0 && (
                    <div className="mt-8 bg-stone-50 rounded-xl p-5 border border-stone-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-stone-900">Choose a Specific Table (Optional)</h4>
                        <span className="text-stone-500 text-sm">{availableTables.length} open</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
                        {availableTables.map((table) => (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => setSelectedTable(table)}
                            className={ounded-lg border p-3 text-left transition-all \}
                          >
                            <div className="font-serif text-stone-900">T{table.tableNumber}</div>
                            <div className="text-xs text-stone-500 mt-1">{table.capacity} guests</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={continueWithSelectedSlot}
                    disabled={!selectedSlotTime}
                    className="w-full mt-8 py-4 rounded-xl font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none uppercase tracking-wide text-sm"
                  >
                    {selectedSlotTime ? Continue with  : 'Select a Time Slot'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>'''

new_text = text[:start_idx] + replacement + text[end_idx:]

with open('src/pages/customer/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Updated Part 1')
