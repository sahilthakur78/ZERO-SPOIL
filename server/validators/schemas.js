import { z } from 'zod';

const phone = z.string().regex(/^[0-9+\-\s]{7,15}$/, 'Invalid phone number').optional().or(z.literal(''));
const lat = z.coerce.number().min(-90).max(90);
const lng = z.coerce.number().min(-180).max(180);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  role: z.enum(['donor', 'ngo']),
  organization: z.string().max(120).optional(),
  phone,
  address: z.string().max(250).optional(),
  lat: lat.optional(),
  lng: lng.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  organization: z.string().max(120).optional(),
  phone,
  address: z.string().max(250).optional(),
  lat: lat.optional(),
  lng: lng.optional(),
});

export const listingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  foodType: z.enum(['veg', 'non-veg', 'vegan', 'bakery', 'packaged', 'other']),
  quantity: z.coerce.number().positive(),
  unit: z.enum(['servings', 'kg', 'packets', 'boxes']),
  pickupAddress: z.string().min(5).max(250),
  lat,
  lng,
  contactPhone: phone,
  preparedAt: z.coerce.date().optional(),
  availableFrom: z.coerce.date().optional(),
  expiresAt: z.coerce.date().refine((d) => d > new Date(), 'Use-by time must be in the future'),
});

export const listingUpdateSchema = listingSchema.partial();

export const deliverSchema = z.object({
  peopleServed: z.coerce.number().int().min(0).max(100000).optional(),
  note: z.string().max(300).optional(),
});
