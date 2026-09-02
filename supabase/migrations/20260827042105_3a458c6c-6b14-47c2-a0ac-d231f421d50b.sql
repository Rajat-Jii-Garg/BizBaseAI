CREATE OR REPLACE FUNCTION public.is_email_available(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  return not exists (select 1 from public.profiles where lower(email)=lower(check_email));
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  return not exists (select 1 from public.profiles where lower(username)=lower(check_username));
end;
$function$;
