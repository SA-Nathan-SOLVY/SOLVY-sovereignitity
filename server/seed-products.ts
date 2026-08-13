import { getUncachableStripeClient } from './stripeClient';

async function createSolvyProducts() {
  console.log('Creating SOLVY Card membership products...');
  
  const stripe = await getUncachableStripeClient();

  const existingProducts = await stripe.products.search({ 
    query: "name:'SOLVY Card Founding Membership'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('SOLVY Card Founding Membership already exists');
    console.log('Product ID:', existingProducts.data[0].id);
    
    const prices = await stripe.prices.list({ product: existingProducts.data[0].id });
    console.log('Prices:', prices.data.map(p => ({ id: p.id, amount: p.unit_amount })));
    return;
  }

  const product = await stripe.products.create({
    name: 'SOLVY Card Founding Membership',
    description: 'Monthly membership for SOLVY Card - America\'s first P2P payment platform with cooperative ownership. Includes data sovereignty, privacy-first payments, and profit sharing.',
    metadata: {
      type: 'founding_membership',
      cooperative_ownership: 'true',
      data_sovereignty: 'true',
    }
  });
  console.log('Created product:', product.id);

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'founding_monthly',
    }
  });
  console.log('Created monthly price:', monthlyPrice.id, '- $9.99/month');

  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 9999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'founding_annual',
      savings: '17%',
    }
  });
  console.log('Created annual price:', annualPrice.id, '- $99.99/year (save 17%)');

  console.log('\n=== SOLVY Card Products Created ===');
  console.log('Product ID:', product.id);
  console.log('Monthly Price ID:', monthlyPrice.id);
  console.log('Annual Price ID:', annualPrice.id);
  console.log('\nUse these price IDs in your checkout flow!');
}

createSolvyProducts().catch(console.error);
