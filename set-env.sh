#!/bin/bash

echo "https://dwdrojunichivjsojjmp.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "sb_publishable_xCA6W2PU-IxHIUKdyLPdaQ_ajT15msN" | vercel env add VITE_SUPABASE_ANON_KEY production

echo "https://dwdrojunichivjsojjmp.supabase.co" | vercel env add VITE_SUPABASE_URL preview
echo "sb_publishable_xCA6W2PU-IxHIUKdyLPdaQ_ajT15msN" | vercel env add VITE_SUPABASE_ANON_KEY preview

echo "Done!"
