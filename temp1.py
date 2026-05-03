import sys

with open('src/pages/customer/BookingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '  // If no slot is selected yet, show premium booking entry\n  if (!selectedDate || !selectedTime) {\n    return ('
end_marker = '    );\n  }\n\n  const handlePaymentSuccess'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    print('Found markers!')
else:
    print('Markers not found')
