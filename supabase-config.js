// Meteur Online Shopping
// Supabase Authentication Configuration

const SUPABASE_URL = "https://nytsdeupaootukcullgi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_cIqzHoafy_AEdB48KS_Wpg_LDqE1sFC";

// Create the Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Meteur Online Shopping: Supabase connected successfully.");
