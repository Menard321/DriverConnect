import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // In dev environment without OpenAI key, return structured mock session response
      return NextResponse.json({
        mock: true,
        client_secret: {
          value: 'mock_ephemeral_token_tzs_driverconnect',
        },
        message: 'OpenAI API key not provided; simulated voice session ready.',
      });
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        instructions: `
You are "Ava", the elite autonomous voice concierge for DriverConnect, the premier automotive platform in Tanzania (Dar es Salaam & Arusha).
Key Operating Rules:
1. Always state all prices, quotes, and deposits strictly in Tanzanian Shillings (TZS or TSh). Never quote in USD or other currencies.
2. You assist users with 3 verticals:
   - Car Rentals: Daily rates start from TZS 75,000/day for economy up to TZS 350,000/day for luxury 4x4 SUVs like Prado TX.
   - Chauffeur Option: Professional drivers cost TZS 50,000/day.
   - Doorstep Delivery: Calculated at TZS 3,500/km.
   - Vehicle Sales: You can show cars for sale and facilitate instant TZS 1,300,000 reservation holds.
   - Workshop Repairs: Full diagnostics (TZS 50,000), Oil service (TZS 85,000), AC recharge (TZS 95,000), Brake overhaul (TZS 120,000).
3. Tool Usage:
   - Call "display_vehicle_cards" when the user asks to see or filter vehicles.
   - Call "calculate_rental_quote" to give precise TZS breakdowns (mentioning the 5% upfront discount and 20% deposit option).
   - Call "open_checkout_modal" when the user is ready to reserve or pay.
4. Maintain a warm, polished, and hospitable tone with occasional Swahili greetings ("Karibu", "Habari").
        `,
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
        tools: [
          {
            type: 'function',
            name: 'display_vehicle_cards',
            description: 'Filters and displays real-time vehicle cards on the user screen.',
            parameters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter category: SUV, Sedan, Pickup, Van, or All',
                },
                maxDailyRateTZS: {
                  type: 'number',
                  description: 'Maximum daily rental rate in Tanzanian Shillings (e.g. 200000)',
                },
                forSale: {
                  type: 'boolean',
                  description: 'Set true if user wants to buy cars, false for rental',
                },
              },
            },
          },
          {
            type: 'function',
            name: 'calculate_rental_quote',
            description: 'Computes an itemized rental quotation in Tanzanian Shillings (TZS).',
            parameters: {
              type: 'object',
              properties: {
                vehicleTitle: { type: 'string' },
                dailyRate: { type: 'number', description: 'Daily rate in TZS' },
                days: { type: 'number', description: 'Number of rental days' },
                hasDriver: { type: 'boolean', description: 'Whether chauffeur is included (TZS 50,000/day)' },
                distanceKm: { type: 'number', description: 'Delivery distance in km (TZS 3,500/km)' },
                isFullUpfront: { type: 'boolean', description: 'True for 5% upfront discount, false for 20% deposit' },
              },
              required: ['dailyRate', 'days'],
            },
          },
          {
            type: 'function',
            name: 'open_checkout_modal',
            description: 'Triggers the embedded Stripe payment checkout modal on the customer viewport.',
            parameters: {
              type: 'object',
              properties: {
                vehicleId: { type: 'string' },
                vehicleTitle: { type: 'string' },
                totalAmountTZS: { type: 'number' },
                bookingType: { type: 'string', enum: ['rental', 'sale_reservation', 'repair_service'] },
              },
              required: ['vehicleTitle', 'totalAmountTZS', 'bookingType'],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[OpenAI Realtime Session Error]:', errText);
      return NextResponse.json({ error: 'Failed to create OpenAI session', details: errText }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Session Route Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
