REVOKE ALL ON FUNCTION public.redeem_promo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo(text) TO authenticated;