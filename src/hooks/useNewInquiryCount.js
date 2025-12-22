import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNewInquiryCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial count
    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel('inquiry-count-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_inquiries'
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
        if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchCount = async () => {
    try {
        const { count, error } = await supabase
        .from('customer_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
        
        if (!error) {
        setCount(count || 0);
        }
    } catch (e) {
        console.error("Error fetching inquiry count:", e);
    }
  };

  return count;
}
