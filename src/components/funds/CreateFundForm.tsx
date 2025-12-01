import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateFundFormProps {
  onSuccess: () => void;
  userId: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface Instrument {
  id: string;
  code: string;
  name: string;
  type: string;
}

const CreateFundForm = ({ onSuccess, userId }: CreateFundFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    investment_strategy: "",
    risk_level: "moderate",
    target_market: "",
    share_price: "100.00",
    redemption_price: "95.00",
  });

  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: currData }, { data: instData }] = await Promise.all([
        supabase.from("currencies").select("*").order("code"),
        supabase.from("financial_instruments").select("*").order("code"),
      ]);
      setCurrencies(currData || []);
      setInstruments(instData || []);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert fund
      const { data: fund, error: fundError } = await supabase
        .from("funds")
        .insert({
          name: formData.name,
          investment_strategy: formData.investment_strategy,
          risk_level: formData.risk_level as "low" | "moderate" | "high" | "very_high",
          target_market: formData.target_market,
          share_price: parseFloat(formData.share_price),
          redemption_price: parseFloat(formData.redemption_price),
          created_by: userId,
        })
        .select()
        .single();

      if (fundError) throw fundError;

      // Insert fund currencies
      if (selectedCurrencies.length > 0) {
        const { error: currError } = await supabase.from("fund_currencies").insert(
          selectedCurrencies.map((currencyId) => ({
            fund_id: fund.id,
            currency_id: currencyId,
          }))
        );
        if (currError) throw currError;
      }

      // Insert fund instruments
      if (selectedInstruments.length > 0) {
        const { error: instError } = await supabase.from("fund_instruments").insert(
          selectedInstruments.map((instrumentId) => ({
            fund_id: fund.id,
            instrument_id: instrumentId,
          }))
        );
        if (instError) throw instError;
      }

      toast({
        title: "Success!",
        description: "Fund created successfully.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Fund Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strategy">Investment Strategy</Label>
        <Textarea
          id="strategy"
          value={formData.investment_strategy}
          onChange={(e) => setFormData({ ...formData, investment_strategy: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk">Risk Level</Label>
        <Select value={formData.risk_level} onValueChange={(v) => setFormData({ ...formData, risk_level: v })}>
          <SelectTrigger id="risk">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="very_high">Very High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Purchase Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.share_price}
            onChange={(e) => {
              const price = e.target.value;
              setFormData({ 
                ...formData, 
                share_price: price,
                redemption_price: (parseFloat(price) * 0.95).toFixed(2) // Default -5%
              });
            }}
            required
          />
          <p className="text-xs text-muted-foreground">Price at which users buy shares</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redemption">Redemption Price ($)</Label>
          <Input
            id="redemption"
            type="number"
            step="0.01"
            value={formData.redemption_price}
            onChange={(e) => setFormData({ ...formData, redemption_price: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">Price at which users sell back shares</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="market">Target Market</Label>
        <Input
          id="market"
          value={formData.target_market}
          onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
          placeholder="e.g., Global, US, Europe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Allowed Currencies</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {currencies.map((currency) => (
            <div key={currency.id} className="flex items-center space-x-2">
              <Checkbox
                id={`curr-${currency.id}`}
                checked={selectedCurrencies.includes(currency.id)}
                onCheckedChange={(checked) => {
                  setSelectedCurrencies(
                    checked
                      ? [...selectedCurrencies, currency.id]
                      : selectedCurrencies.filter((id) => id !== currency.id)
                  );
                }}
              />
              <Label htmlFor={`curr-${currency.id}`} className="text-sm cursor-pointer">
                {currency.code} - {currency.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Financial Instruments</Label>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {instruments.map((instrument) => (
            <div key={instrument.id} className="flex items-center space-x-2">
              <Checkbox
                id={`inst-${instrument.id}`}
                checked={selectedInstruments.includes(instrument.id)}
                onCheckedChange={(checked) => {
                  setSelectedInstruments(
                    checked
                      ? [...selectedInstruments, instrument.id]
                      : selectedInstruments.filter((id) => id !== instrument.id)
                  );
                }}
              />
              <Label htmlFor={`inst-${instrument.id}`} className="text-sm cursor-pointer">
                {instrument.name} ({instrument.type})
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Fund"
        )}
      </Button>
    </form>
  );
};

export default CreateFundForm;
