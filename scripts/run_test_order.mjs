// Docker not available in this environment, so simulate the API handler locally

(async () => {
  const reqBody = {
    tableNumber: 3,
    cart: [{ item: { id: 1, price: 18.5 }, quantity: 1 }],
    paymentMethod: 'visa',
    total: 18.5,
    card: { cardNumber: '4242 4242 4242 3456', cardExpiry: '12/26', cardCCV: '123', cardName: 'Test User' }
  };

  // Masking done on the client before sending in our flow — replicate here
  const cardNumberDigits = (reqBody.card.cardNumber || '').replace(/\s+/g, '');
  const cardLast4 = cardNumberDigits.length >= 4 ? cardNumberDigits.slice(-4) : null;
  const cardExpiry = reqBody.card.cardExpiry || null;

  const orderNumber = `ORD-${Date.now()}`;
  const simulatedDBRow = {
    id: Math.floor(Math.random() * 1000000),
    order_number: orderNumber,
    table_number: reqBody.tableNumber,
    total: reqBody.total,
    payment_method: reqBody.paymentMethod,
    card_last4: cardLast4,
    card_expiry: cardExpiry,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  console.log('Simulated API payload sent to server:');
  console.log({
    tableNumber: reqBody.tableNumber,
    cart: reqBody.cart,
    paymentMethod: reqBody.paymentMethod,
    total: reqBody.total,
    cardLast4,
    cardExpiry
  });

  console.log('\nSimulated DB row that would be inserted:');
  console.log(simulatedDBRow);

  console.log('\nSimulated API response:');
  console.log({ orderId: simulatedDBRow.id, orderNumber: simulatedDBRow.order_number, status: simulatedDBRow.status });
})();