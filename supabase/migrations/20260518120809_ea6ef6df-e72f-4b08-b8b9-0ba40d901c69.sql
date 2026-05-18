UPDATE public.jobs SET is_active = false
WHERE source IN ('remotive','arbeitnow','remoteok')
  AND NOT (
    lower(coalesce(location,'')) ~ 'india|bharat|bangalore|bengaluru|mumbai|delhi|ncr|gurgaon|gurugram|noida|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|cochin|indore|chandigarh|lucknow|nagpur|coimbatore|trivandrum|mysore|mysuru|vadodara|surat|bhubaneswar|visakhapatnam|vizag|worldwide|anywhere|global'
  );