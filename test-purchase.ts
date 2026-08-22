import { supabaseServer as supabase } from './api/_lib/supabaseServer';

async function check() {
  const { data, error } = await supabase.from('purchases').select('*').eq('id', '33b2cb1f-94ba-498e-9cc1-69f9135b541e');
  console.log(JSON.stringify({ purchase: data, error }));
  
  const { data: tickets } = await supabase.from('raffle_ticket_pool').select('status').eq('purchase_id', '33b2cb1f-94ba-498e-9cc1-69f9135b541e');
  const counts: any = {};
  for(let t of tickets||[]) { counts[t.status] = (counts[t.status]||0)+1; }
  console.log("tickets:", counts);
}
check();
