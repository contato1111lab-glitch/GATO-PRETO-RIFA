-- =====================================================================
-- Migração: Top Compradores (Correção do limite de 1.000 registros)
-- Cria uma função RPC no banco (PostgreSQL) para calcular o Top Compradores
-- diretamente, ignorando o limite de paginação do PostgREST e evitando
-- truncamento de dados com alto volume de vendas.
-- =====================================================================

-- 1. Remove qualquer versão anterior da função para evitar conflito de assinaturas
DROP FUNCTION IF EXISTS get_raffle_ranking(uuid, integer);

-- 2. Cria a nova função otimizada
CREATE OR REPLACE FUNCTION get_raffle_ranking(
  p_raffle_id UUID,
  p_max_position INT DEFAULT 100
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  total_tickets BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_price NUMERIC;
  v_config JSONB;
  v_min_purchase NUMERIC := 0;
  v_enabled BOOLEAN := FALSE;
BEGIN
  -- Tenta obter os dados da rifa, tratando o config de forma segura
  SELECT 
    ranking_start_date, 
    ranking_end_date, 
    price_per_number, 
    CASE 
      WHEN ranking_config IS NULL THEN NULL
      WHEN pg_typeof(ranking_config) = 'jsonb'::regtype THEN ranking_config::jsonb
      WHEN pg_typeof(ranking_config) = 'json'::regtype THEN ranking_config::jsonb
      ELSE ranking_config::text::jsonb
    END
    INTO v_start_date, v_end_date, v_price, v_config
    FROM raffles
   WHERE id = p_raffle_id;

  -- Interpreta as configurações
  IF v_config IS NOT NULL AND jsonb_typeof(v_config) = 'object' THEN
    v_min_purchase := COALESCE((v_config->>'minValue')::NUMERIC, 0);
    v_enabled := COALESCE((v_config->>'enabled')::BOOLEAN, FALSE);
  END IF;

  RETURN QUERY
  SELECT 
    t.owner_user_id AS user_id,
    MAX(p.full_name) AS full_name,
    COUNT(t.id) AS total_tickets
  FROM raffle_ticket_pool t
  LEFT JOIN profiles p ON p.id = t.owner_user_id
  WHERE t.raffle_id = p_raffle_id
    AND t.status = 'PAID'
    AND t.owner_user_id IS NOT NULL
    AND (v_start_date IS NULL OR t.paid_at >= v_start_date)
    AND (v_end_date IS NULL OR t.paid_at <= v_end_date)
  GROUP BY t.owner_user_id
  HAVING (NOT v_enabled) OR (v_min_purchase = 0) OR ((COUNT(t.id) * v_price) >= v_min_purchase)
  ORDER BY total_tickets DESC
  LIMIT p_max_position;
END;
$$;
