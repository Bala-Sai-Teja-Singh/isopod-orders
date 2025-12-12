// app/api/orders/route.ts
// This handles GET (fetch all orders) and POST (create new order) requests
// Think of this as the "menu" that responds to customer requests

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/superbase';
import { CreateOrderInput } from '@/types/order';

/**
 * Middleware function to verify access key
 */
function verifyAccessKey(request: NextRequest): boolean {
  try {
    // Get the access key from headers
    const authHeader = request.headers.get('authorization');
    const accessKey = authHeader?.replace('Bearer ', '');

    // Get the stored key from environment variable
    const storedKey = process.env.APP_ACCESS_KEY;

    // Verify the key
    return accessKey === storedKey;
  } catch (error) {
    console.error('Error verifying access key:', error);
    return false;
  }
}

/**
 * GET /api/orders
 * Fetches all orders from database, sorted by newest first
 */
export async function GET(request: NextRequest) {
  try {
    // Verify access key
    if (!verifyAccessKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing access key' },
        { status: 401 }
      );
    }

    // Query Supabase to get all orders
    // .select('*') means "get all columns"
    // .order() sorts by created_at, newest first
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If database returns an error, send error response
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    // Success! Return the orders
    return NextResponse.json({ orders: data });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Creates a new order in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify access key
    if (!verifyAccessKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing access key' },
        { status: 401 }
      );
    }

    // Get the order data from the request body
    // This is the form data sent from the frontend
    const body: CreateOrderInput = await request.json();
    // Validate required fields
    if (!body.customer_name || !body.phone || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, phone, address' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Clean the data - convert empty strings to null for optional fields
    const cleanedData = {
      ...body,
      email: body.email || null,
      social_media_handle: body.social_media_handle || null,
      courier_receipt: body.courier_receipt || null,
      sent_date: body.sent_date || null, // This fixes the date error!
      shipping_charges: body.shipping_charges || 0,
      notes: body.notes || null,
    };

    // Insert the new order into database
    // .insert() adds a new row
    // .select() returns the newly created order
    // .single() ensures we get one result (not an array)
    const { data, error } = await supabase
      .from('orders')
      .insert([cleanedData]) // Use cleanedData instead of body
      .select()
      .single();

    // Handle database errors
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Success! Return the newly created order
    return NextResponse.json(
      { message: 'Order created successfully', order: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
