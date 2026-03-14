import { supabase } from '@/lib/supabase';

export async function getProducts(category: string | null = null) {
  let query = supabase.from('products').select('*').eq('active', true).is('deleted_at', null);
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .is('deleted_at', null)
    .eq('featured', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .is('deleted_at', null)
    .single();
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('active', true)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  const categories = new Set(data.map(item => item.category).filter(Boolean));
  return Array.from(categories);
}

export async function getFinishedGoods(category: string | null = null) {
  let query = supabase
    .from('materials')
    .select('*, products(*)')
    .eq('material_type', 'finished_product')
    .is('deleted_at', null);
    
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching finished goods:', error);
    return [];
  }
  return data;
}

export async function getFinishedGoodById(id: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*, products(*)')
    .eq('id', id)
    .eq('material_type', 'finished_product')
    .is('deleted_at', null)
    .single();
  if (error) {
    console.error('Error fetching finished good:', error);
    return null;
  }
  return data;
}

export async function submitInquiry(inquiryData: any) {
  const { data, error } = await supabase
    .from('customer_inquiries')
    .insert([{ ...inquiryData, status: 'new' }]);
    
  if (error) {
    console.error('Error submitting inquiry:', error);
    throw error;
  }
  return data;
}
