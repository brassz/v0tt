-- Drop the quotes table if it exists to recreate with correct types
DROP TABLE IF EXISTS public.quotes CASCADE;

-- Create quotes table for storing customer quotes with correct UUID foreign key
CREATE TABLE public.quotes (
    id SERIAL PRIMARY KEY,
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_state VARCHAR(100),
    customer_zip VARCHAR(20),
    customer_country VARCHAR(100),
    boat_model VARCHAR(255) NOT NULL,
    engine_package VARCHAR(255) NOT NULL,
    hull_color VARCHAR(255) NOT NULL,
    additional_options JSONB DEFAULT '[]'::jsonb,
    payment_method VARCHAR(50),
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    additional_notes TEXT,
    total_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_brl DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_quotes_dealer_id ON public.quotes(dealer_id);
CREATE INDEX idx_quotes_quote_id ON public.quotes(quote_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_quotes_updated_at();

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quotes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show success message
SELECT 'Tabela quotes criada com sucesso com UUID foreign key!' as message;

COMMENT ON TABLE public.quotes IS 'Tabela para armazenar orçamentos de clientes';
COMMENT ON COLUMN public.quotes.quote_id IS 'ID único do orçamento';
COMMENT ON COLUMN public.quotes.dealer_id IS 'UUID do dealer que criou o orçamento';
COMMENT ON COLUMN public.quotes.additional_options IS 'Opções adicionais em formato JSON';
COMMENT ON COLUMN public.quotes.status IS 'Status do orçamento: pending, accepted, rejected, expired';
COMMENT ON COLUMN public.quotes.valid_until IS 'Data de validade do orçamento';
