import re

with open("services/raffleService.ts", "r") as f:
    content = f.read()

target = """  async getRaffleRanking(raffleId: string, maxPosition?: number): Promise<any[]> {
    const { data: raffle } = await supabase
      .from('raffles')
      .select('ranking_start_date, ranking_end_date, ranking_config, price_per_number')
      .eq('id', raffleId)
      .maybeSingle();

    let query = supabase
      .from('raffle_ticket_pool')
      .select('owner_user_id, paid_at')
      .eq('raffle_id', raffleId)
      .eq('status', 'PAID')
      .not('owner_user_id', 'is', null);

    if (raffle?.ranking_start_date) query = query.gte('paid_at', raffle.ranking_start_date);
    if (raffle?.ranking_end_date) query = query.lte('paid_at', raffle.ranking_end_date);

    const { data: tickets, error } = await query;
    if (error || !tickets) return [];

    const counts = new Map<string, number>();
    tickets.forEach((t: any) => {
      if (t.owner_user_id) counts.set(t.owner_user_id, (counts.get(t.owner_user_id) || 0) + 1);
    });

    let rc = raffle?.ranking_config;
    if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
    const isObj = rc && !Array.isArray(rc);
    const minPurchaseConfig = isObj ? (rc.minValue || 0) : 0;
    const isEnabled = isObj ? (rc.enabled || false) : false;
    const pricePerNumber = raffle?.price_per_number || 0;

    const top = [...counts.entries()]
      .filter(([id, qty]) => {
          if (!isEnabled || !minPurchaseConfig) return true;
          return (qty * pricePerNumber) >= minPurchaseConfig;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxPosition || 100);

    if (top.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', top.map(([id]) => id));

    const byId = new Map((profiles || []).map((p: any) => [p.id, p]));

    return top.map(([userId, total], index) => ({
      position: index + 1,
      ranking: index + 1,
      raffle_id: raffleId,
      user_id: userId,
      name: byId.get(userId)?.full_name || 'Comprador',
      phone: '',
      total_tickets: total,
      totalTickets: total,
    }));
  },"""

replacement = """  async getRaffleRanking(raffleId: string, maxPosition?: number): Promise<any[]> {
    const { data: rankingData, error } = await supabase.rpc('get_raffle_ranking', {
      p_raffle_id: raffleId,
      p_max_position: maxPosition || 100
    });

    if (error) {
      console.error('Error fetching ranking via RPC:', error);
      return [];
    }

    if (!rankingData) return [];

    return rankingData.map((row: any, index: number) => ({
      position: index + 1,
      ranking: index + 1,
      raffle_id: raffleId,
      user_id: row.user_id,
      name: row.full_name || 'Comprador',
      phone: '',
      total_tickets: parseInt(row.total_tickets, 10),
      totalTickets: parseInt(row.total_tickets, 10),
    }));
  },"""

content = content.replace(target, replacement)

with open("services/raffleService.ts", "w") as f:
    f.write(content)

