import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Better put your these secret keys in .env file
export const supabase = createClient("https://kruwzzjwcuprnuqsygrt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms", {
  localStorage: AsyncStorage as any,
  detectSessionInUrl: false // Prevents Supabase from evaluating window.location.href, breaking mobile
});
