import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function CheckoutButton({
  amount,
  description,
}: {
  amount: number;
  description?: string;
}) {
  const handleClick = async () => {
    try {
      const res = await api.createCheckoutSession({ amount, description });
      const url = (res && (res.url || res.checkout_url)) as string | undefined;
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
    >
      Pay Now
    </Button>
  );
}
