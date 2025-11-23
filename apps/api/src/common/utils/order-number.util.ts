import { createHash } from 'crypto';
import { EntityManager } from '@mikro-orm/core';
import { Order } from '../../entities/order.entity';

/**
 * Generate a unique order number in format XXXX-XXXX-XXXX
 * Where X is a digit (0-9) or uppercase letter (A-Z)
 * 
 * Algorithm:
 * 1. Create a hash from customer email/phone and product SKUs
 * 2. Convert hash to alphanumeric string
 * 3. Format as XXXX-XXXX-XXXX
 * 4. Ensure uniqueness by checking database
 */
export function generateOrderNumber(
  customerPhone: string,
  customerEmail?: string,
  productSkus?: string[],
  attempt: number = 0,
): string {
  // Create input string from customer info and product SKUs
  const input = [
    customerPhone,
    customerEmail || '',
    ...(productSkus || []),
    Date.now().toString(), // Add timestamp for uniqueness
    attempt.toString(), // Add attempt number for retry
  ].join('|');

  // Create hash
  const hash = createHash('sha256').update(input).digest('hex');

  // Convert to alphanumeric (0-9, A-Z)
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  // Use hash bytes to generate 12 characters
  for (let i = 0; i < 12 && i * 2 < hash.length; i++) {
    const byte = parseInt(hash.substr(i * 2, 2), 16);
    result += chars[byte % chars.length];
  }

  // If we need more characters, use timestamp
  if (result.length < 12) {
    const timestamp = Date.now().toString();
    for (let i = result.length; i < 12; i++) {
      const idx = parseInt(timestamp[i % timestamp.length]) || 0;
      result += chars[idx % chars.length];
    }
  }

  // Format as XXXX-XXXX-XXXX
  return `${result.substring(0, 4)}-${result.substring(4, 8)}-${result.substring(8, 12)}`;
}

/**
 * Generate a unique order number and ensure it doesn't exist in database
 */
export async function generateUniqueOrderNumber(
  em: EntityManager,
  customerPhone: string,
  customerEmail?: string,
  productSkus?: string[],
  maxAttempts: number = 10,
): Promise<string> {
  let attempts = 0;
  let orderNumber: string;

  do {
    orderNumber = generateOrderNumber(customerPhone, customerEmail, productSkus, attempts);
    
    // Check if order number already exists
    const existing = await em.findOne(Order, { orderNumber });
    
    if (!existing) {
      return orderNumber;
    }

    attempts++;
  } while (attempts < maxAttempts);

  // If still not unique after max attempts, add random suffix
  const random = Math.floor(Math.random() * 10000).toString(36).toUpperCase().padStart(3, '0').substring(0, 3);
  orderNumber = `${orderNumber.substring(0, 9)}${random}`;
  
  // Final check
  const finalCheck = await em.findOne(Order, { orderNumber });
  if (finalCheck) {
    // Last resort: use timestamp-based suffix
    const timestamp = Date.now().toString(36).toUpperCase().substring(0, 3);
    orderNumber = `${orderNumber.substring(0, 9)}${timestamp}`;
  }

  return orderNumber;
}

