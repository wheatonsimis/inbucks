import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email && message && amount && timeframe) {
      // Format the email body with proper spacing and formatting
      const subject = `💌 New Inbox Offer: $${amount} for Response`;
      const body = `
Hello!

Someone would like to pay you $${amount} to respond to their message within ${timeframe} hours:

${message}

To accept this offer, simply reply to this email. The sender will be notified and payment will be arranged securely through inBucks.

Best regards,
inBucks Team
      `.trim();

      // Create the mailto URL with encoded parameters
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open the email client
      window.location.href = mailtoUrl;
      setOfferSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold mb-2 text-center">inBucks.com</h1>
          <div className="mx-auto h-px bg-border my-2 w-64"></div>
          <span className="text-xl text-muted-foreground block text-center">Buy & Sell Inbox Attention</span>
          {!offerSubmitted ? (
            <div className="space-y-4 mt-4">
              <Input 
                placeholder="Enter recipient's email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Textarea 
                placeholder="Enter your message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="h-24"
              />
              <Input 
                type="number" 
                placeholder="Offer amount ($)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
              <Input 
                type="number" 
                placeholder="Response time (hours)" 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)} 
              />
              <Button onClick={handleSubmit} className="w-full">Submit Offer</Button>
            </div>
          ) : (
            <div className="text-center mt-4">
              <p className="text-green-600 font-semibold">Offer sent to {email}!</p>
              <p className="text-muted-foreground">They have {timeframe} hours to respond for ${amount}.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}