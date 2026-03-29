async function runTest() {
  try {
    console.log('1. Fetching Branch...');
    const resCats = await fetch('http://localhost:3001/menu/categories');
    const menuCats = await resCats.json();
    
    // Find Espresso product
    let espresso;
    for (const cat of menuCats) {
      espresso = cat.products.find(p => p.name === 'Signature Espresso');
      if (espresso) break;
    }
    
    if (!espresso) {
      console.error('Espresso not found');
      return;
    }
    
    console.log(`Espresso Found: ${espresso.id}, Price: ${espresso.price}`);

    console.log('\n2. Creating Order for 2x Signature Espresso (Status: PAID) ...');
    const orderPayload = {
      branch_id: espresso.branch_id,
      customer_name: 'Test Customer',
      payment_method: 'CASH',
      status: 'PAID',
      items: [
        { product_id: espresso.id, quantity: 2, notes: 'Less sugar' }
      ]
    };
    
    const resOrder = await fetch('http://localhost:3001/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    
    const order = await resOrder.json();
    if (resOrder.status >= 400) {
       console.error('Order Fail:', order);
       return;
    }
    console.log('Order Created & Paid:', order.id);

    console.log('\n3. Checking Finance Laba-Rugi...');
    const resLr = await fetch(`http://localhost:3001/finance/${espresso.branch_id}/laba-rugi`);
    const financeLR = await resLr.json();
    console.log('Laba Rugi:', JSON.stringify(financeLR, null, 2));

    console.log('\n4. Checking Finance Neraca...');
    const resNeraca = await fetch(`http://localhost:3001/finance/${espresso.branch_id}/neraca`);
    const financeNeraca = await resNeraca.json();
    console.log('Neraca (Balanced?):', financeNeraca.is_balanced);
    console.log('Neraca Totals:', JSON.stringify({ Aset: financeNeraca.aset.total, Kewajiban: financeNeraca.kewajiban.total, Ekuitas: financeNeraca.ekuitas.total }, null, 2));

    console.log('\n5. Checking Recent Journal Entries...');
    const resJurnal = await fetch(`http://localhost:3001/finance/${espresso.branch_id}/jurnal`);
    const journals = await resJurnal.json();
    if (journals.length > 0) {
      console.log('Latest Journal:', journals[0].description);
      console.log(journals[0].entries.map(e => `  ${e.account.account_code} - ${e.account.name} | D: ${e.debit} | C: ${e.credit}`).join('\n'));
    }

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

runTest();
