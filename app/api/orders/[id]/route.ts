/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/[id]/route.ts
// This handles PUT (update) and DELETE requests for a specific order
// [id] in the filename means this is a dynamic route - the id comes from the URL

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/superbase';
import { Order } from '@/types/order';
/**
 * PATCH /api/orders/[id]
 * Partially updates an order (specifically for status updates)
 * Example: PATCH /api/orders/123-456-789 with { status: "shipped" }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First, verify the access key
    if (!verifyAccessKey(request)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing access key. Please authenticate first.',
        },
        { status: 401 }
      );
    }

    // Get the order ID from the URL
    const { id } = await context.params;

    // Get the update data from request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If status is shipped and sent_date is not set, set it to current date
    if (status === 'shipped') {
      // First check current order to see if sent_date is already set
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('sent_date')
        .eq('id', id)
        .single();

      if (!existingOrder?.sent_date) {
        updateData.updated_at = new Date().toISOString();
      }
    }

    // Update the order status in database
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // If order not found
    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: `Order with ID ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    // Other database errors
    if (error) {
      console.error('Database error updating order status:', error);
      return NextResponse.json(
        {
          error: 'Failed to update order status',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      message: 'Order status updated successfully',
      order: data,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating order status',
      },
      { status: 500 }
    );
  }
}
/**
 * Middleware function to verify access key
 * Checks if the Authorization header contains a valid Bearer token
 */
function verifyAccessKey(request: NextRequest): boolean {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return false;
    }

    // Extract the token (Bearer <token> format)
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    // Get the stored key from environment variable
    const storedKey = process.env.APP_ACCESS_KEY;

    if (!storedKey) {
      console.error('APP_ACCESS_KEY is not set in environment variables');
      return false;
    }

    // Verify the token matches the stored key
    const isValid = token === storedKey;

    if (!isValid) {
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying access key:', error);
    return false;
  }
}

/**
 * PUT /api/orders/[id]
 * Updates an existing order
 * Example: PUT /api/orders/123-456-789
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First, verify the access key
    if (!verifyAccessKey(request)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing access key. Please authenticate first.',
        },
        { status: 401 }
      );
    }

    // Get the order ID from the URL
    const { id } = await context.params;

    // Get the updated order data from request body
    const body: Partial<Order> = await request.json();

    // Clean the data - convert empty strings to null for optional fields
    const cleanedData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Convert empty strings to null for date and optional text fields
    if (cleanedData.email === '') cleanedData.email = null;
    if (cleanedData.social_media_handle === '')
      cleanedData.social_media_handle = null;
    if (cleanedData.courier_receipt === '') cleanedData.courier_receipt = null;
    if (cleanedData.sent_date === '') cleanedData.sent_date = null;
    if (cleanedData.notes === '') cleanedData.notes = null;

    // Update the order in database
    // .eq('id', id) means "where id equals the provided id"
    // .select() returns the updated order
    // .single() gets one result
    const { data, error } = await supabase
      .from('orders')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    // If order not found
    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: `Order with ID ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    // Other database errors
    if (error) {
      console.error('Database error updating order:', error);
      return NextResponse.json(
        {
          error: 'Failed to update order',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      message: 'Order updated successfully',
      order: data,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the order',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Deletes an order permanently
 * Example: DELETE /api/orders/123-456-789
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First, verify the access key
    if (!verifyAccessKey(request)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing access key. Please authenticate first.',
        },
        { status: 401 }
      );
    }

    // Get the order ID from URL
    const { id } = await context.params;

    // First, check if the order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_name')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: `Order with ID ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    // Delete the order from database
    // .eq('id', id) specifies which order to delete
    const { error } = await supabase.from('orders').delete().eq('id', id);

    // Handle other database errors
    if (error) {
      console.error('Database error deleting order:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete order',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrderId: id,
      deletedCustomer: existingOrder?.customer_name,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the order',
      },
      { status: 500 }
    );
  }
}
