import { supabaseServer as supabase } from './api/_lib/supabaseServer';

async function check() {
  const { data, error } = await supabase
        .from('purchases')
        .update({
          pix_code: 'test',
          pix_qr_code: 'test',
          pix_copy_paste: 'test',
          payment_internal_id: 'test',
          payment_status: 'test'
        })
        .eq('id', '33b2cb1f-94ba-498e-9cc1-69f9135b541e');
  console.log(error);
}
check();
