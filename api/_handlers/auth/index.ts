import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '../../_lib/supabaseServer';

export async function handleAuth(req: Request, res: Response) {
  // CORS and preflight are handled centrally in api/index.ts against an
  // allow-list, so the per-handler wildcard headers were removed.

  try {
    const action = req.body?.action;
    const { cpf, phone, profile, updates } = req.body;

    if (action === "login") {
      const cleanCpf = (cpf || "").replace(/\D/g, "");
      const cleanPhone = (phone || "").replace(/\D/g, "");
      if (!cleanCpf || !cleanPhone) return res.status(400).json({ success: false, error: "CPF e Telefone são obrigatórios." });
      const { data: user } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("cpf", cleanCpf)
        .eq("phone", cleanPhone)
        .single();
      if (!user) {
        return res.status(401).json({ success: false, error: 'Nenhum cadastro encontrado com este Telefone ou CPF.' });
      }
      
      // Remove password from returned profile
      const camelCaseUser = {
        id: user.id,
        fullName: user.full_name,
        cpf: user.cpf,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      };
      return res.status(200).json({ success: true, profile: camelCaseUser });
    }

    if (action === 'register') {
      const insertData: any = {
        full_name: profile.fullName,
        cpf: profile.cpf?.replace(/\D/g, ''),
        phone: profile.phone?.replace(/\D/g, ''),
        role: 'user'
      };

      const { data, error } = await supabaseServer
        .from('profiles')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
         return res.status(400).json({ success: false, error: error.message });
      }
      
      const camelCaseData = {
        id: data.id,
        fullName: data.full_name,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        createdAt: data.created_at
      };
      return res.status(200).json({ success: true, profile: camelCaseData });
    }

    if (action === 'update') {
      const { id } = req.body;
      const payload: any = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone?.replace(/\D/g, '');

      const { error } = await supabaseServer
        .from('profiles')
        .update(payload)
        .eq('id', id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'get_notifications') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'ID is required' });

      const { data, error } = await supabaseServer
        .from('winners')
        .select('id, prize, prize_type, ticket_number, raffle_id, raffles(name)')
        .eq('user_id', id)
        .is('notified_at', null)
        .order('created_at', { ascending: true });

      if (error) return res.status(400).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, notifications: data });
    }

    if (action === 'mark_notified') {
      const { id, winnerId } = req.body;
      if (!id || !winnerId) return res.status(400).json({ success: false, error: 'ID and Winner ID are required' });

      // Only update if the winner belongs to the authenticated user ID
      const { data, error } = await supabaseServer
        .from('winners')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', winnerId)
        .eq('user_id', id)
        .select('id')
        .maybeSingle();

      if (error) return res.status(400).json({ success: false, error: error.message });
      if (!data) return res.status(400).json({ success: false, error: 'Unauthorized or not found' });
      
      return res.status(200).json({ success: true });
    }

    if (action === 'migrate_all') {
      // This is a special admin routine to migrate all plaintext passwords at once
      const adminSecret = req.headers['x-admin-secret'];
      const { data: config } = await supabaseServer.from('app_config').select('value').eq('key', 'super_admin_password').single();
      if (!config || config.value !== adminSecret) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { data: users, error } = await supabaseServer.from('profiles').select('id, password').not('password', 'is', null);
      if (error) return res.status(400).json({ success: false, error: error.message });

      let count = 0;
      for (const user of users) {
        if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const hash = await bcrypt.hash(user.password, 10);
          await supabaseServer.from('profiles').update({ password: hash }).eq('id', user.id);
          count++;
        }
      }
      return res.status(200).json({ success: true, migrated: count });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err: any) {
    console.error('[AUTH_API] Error:', err);
    return res.status(400).json({ success: false, error: err?.message || 'Server error' });
  }
}
