
-- Restore standard table privileges; column-level revoke broke owner self-reads (select('*'))
GRANT SELECT ON public.profiles TO authenticated, anon;
