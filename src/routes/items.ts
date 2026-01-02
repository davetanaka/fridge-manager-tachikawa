import { Hono } from 'hono';
import type { Bindings, Item, ItemWithUser } from '../types';
import { calculateDaysUntilExpiry } from '../utils';

const items = new Hono<{ Bindings: Bindings }>();

// GET /api/items - Get all items with filters and sorting
items.get('/', async (c) => {
  const db = c.env.DB;
  
  // Query parameters
  const storage = c.req.query('storage'); // 'all' | 'main_fridge' | 'main_freezer' | 'sub_freezer'
  const sort = c.req.query('sort') || 'expiry'; // 'expiry' | 'created' | 'name'
  const status = c.req.query('status') || 'active'; // 'active' | 'consumed' | 'all'
  
  try {
    let query = `
      SELECT 
        items.*,
        users.name as user_name,
        users.user_color
      FROM items
      JOIN users ON items.registered_by = users.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filter by storage location
    if (storage && storage !== 'all') {
      query += ` AND items.storage_location = ?`;
      params.push(storage);
    }
    
    // Filter by status
    if (status !== 'all') {
      query += ` AND items.status = ?`;
      params.push(status);
    }
    
    // Sorting
    switch (sort) {
      case 'expiry':
        query += ` ORDER BY 
          CASE WHEN items.expiry_date IS NULL THEN 1 ELSE 0 END,
          items.expiry_date ASC`;
        break;
      case 'created':
        query += ` ORDER BY items.created_at DESC`;
        break;
      case 'name':
        query += ` ORDER BY items.item_name ASC`;
        break;
      default:
        query += ` ORDER BY items.expiry_date ASC`;
    }
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    // Add days_until_expiry calculation
    const itemsWithExpiry: ItemWithUser[] = (results as any[]).map((item: any) => ({
      ...item,
      days_until_expiry: calculateDaysUntilExpiry(item.expiry_date),
    }));
    
    return c.json({
      success: true,
      items: itemsWithExpiry,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

// GET /api/items/:id - Get single item
items.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const { results } = await db
      .prepare(`
        SELECT 
          items.*,
          users.name as user_name,
          users.user_color
        FROM items
        JOIN users ON items.registered_by = users.id
        WHERE items.id = ?
      `)
      .bind(id)
      .all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        error: 'Item not found',
      }, 404);
    }
    
    const item = results[0] as any;
    const itemWithExpiry: ItemWithUser = {
      ...item,
      days_until_expiry: calculateDaysUntilExpiry(item.expiry_date),
    };
    
    return c.json({
      success: true,
      item: itemWithExpiry,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

// POST /api/items - Create new item
items.post('/', async (c) => {
  const db = c.env.DB;
  
  try {
    const body = await c.req.json();
    const {
      item_name,
      expiry_date,
      storage_location,
      quantity = 1,
      memo = '',
      registered_by = 1, // TODO: Get from session
    } = body;
    
    // Validation
    if (!item_name || !storage_location) {
      return c.json({
        success: false,
        error: 'item_name and storage_location are required',
      }, 400);
    }
    
    const validLocations = ['main_fridge', 'main_freezer', 'sub_freezer'];
    if (!validLocations.includes(storage_location)) {
      return c.json({
        success: false,
        error: 'Invalid storage_location',
      }, 400);
    }
    
    const result = await db
      .prepare(`
        INSERT INTO items (
          item_name, expiry_date, storage_location, quantity, 
          initial_quantity, memo, registered_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `)
      .bind(item_name, expiry_date || null, storage_location, quantity, quantity, memo, registered_by)
      .run();
    
    return c.json({
      success: true,
      item_id: result.meta.last_row_id,
      message: 'Item created successfully',
    }, 201);
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

// PUT /api/items/:id - Update item
items.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const {
      item_name,
      expiry_date,
      storage_location,
      quantity,
      memo,
    } = body;
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    
    if (item_name !== undefined) {
      updates.push('item_name = ?');
      params.push(item_name);
    }
    if (expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      params.push(expiry_date || null);
    }
    if (storage_location !== undefined) {
      updates.push('storage_location = ?');
      params.push(storage_location);
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(quantity);
    }
    if (memo !== undefined) {
      updates.push('memo = ?');
      params.push(memo);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    if (updates.length === 1) { // Only updated_at
      return c.json({
        success: false,
        error: 'No fields to update',
      }, 400);
    }
    
    await db
      .prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
    
    return c.json({
      success: true,
      message: 'Item updated successfully',
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

// DELETE /api/items/:id - Delete item
items.delete('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    await db
      .prepare('DELETE FROM items WHERE id = ?')
      .bind(id)
      .run();
    
    return c.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

// POST /api/items/:id/consume - Consume item (partial or full)
items.post('/:id/consume', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { amount } = body; // If not provided, consume all
    
    // Get current item
    const { results } = await db
      .prepare('SELECT * FROM items WHERE id = ?')
      .bind(id)
      .all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        error: 'Item not found',
      }, 404);
    }
    
    const item = results[0] as any;
    const currentQuantity = item.quantity;
    const consumeAmount = amount !== undefined ? amount : currentQuantity;
    
    // Validate consume amount
    if (consumeAmount > currentQuantity) {
      return c.json({
        success: false,
        error: 'Cannot consume more than current quantity',
      }, 400);
    }
    
    const newQuantity = currentQuantity - consumeAmount;
    const newConsumedQuantity = item.consumed_quantity + consumeAmount;
    const newStatus = newQuantity === 0 ? 'consumed' : 'active';
    
    // Update item
    await db
      .prepare(`
        UPDATE items 
        SET quantity = ?, consumed_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(newQuantity, newConsumedQuantity, newStatus, id)
      .run();
    
    return c.json({
      success: true,
      message: `Consumed ${consumeAmount} item(s)`,
      remaining_quantity: newQuantity,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return c.json({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
});

export default items;
