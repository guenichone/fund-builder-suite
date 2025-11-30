-- Add redemption_price column to funds table
ALTER TABLE public.funds
ADD COLUMN redemption_price numeric DEFAULT NULL;

-- Set default redemption_price to current share_price for existing funds
UPDATE public.funds
SET redemption_price = share_price
WHERE redemption_price IS NULL;

COMMENT ON COLUMN public.funds.redemption_price IS 'Price at which users can sell their shares back';