import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function HomePage() {
  const [senderEmail, setSenderEmail] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  const handleSubmit = () => {
    if (senderEmail && email && message && amount && timeframe) {
      const subject = `🤑URGENT: $${amount} Offer from inBucks.com`;
      const body = `
Hello!

${senderEmail} would like to pay you $${amount} to respond to his message within ${timeframe} hours (from the time this email was sent).

To accept this offer, simply reply to this email. The sender will be notified and payment will be arranged securely through inBucks.com. If you don't already have an account with us, visit inBucks.com to make money responding to your emails.

Best regards,
inBucks.com
__________

inBucks.com is a marketplace connecting buyers and sellers of inbox attention.
      `.trim();

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      setOfferSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2 text-center">inBucks.com</h1>
            <div className="mx-auto h-px bg-border my-2 w-64"></div>
            <span className="text-xl text-muted-foreground block text-center">Buy & Sell Inbox Attention</span>
            {!offerSubmitted ? (
              <div className="space-y-4 mt-4">
                <Input 
                  placeholder="Your email" 
                  type="email"
                  value={senderEmail} 
                  onChange={(e) => setSenderEmail(e.target.value)} 
                />
                <Input 
                  placeholder="Recipient's email" 
                  type="email"
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
              <div className="text-center mt-4 space-y-4">
                <div>
                  <p className="text-green-600 font-semibold">Offer sent to {email}!</p>
                  <p className="text-muted-foreground">They have {timeframe} hours to respond for ${amount}.</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setOfferSubmitted(false);
                    setSenderEmail("");
                    setEmail("");
                    setMessage("");
                    setAmount("");
                    setTimeframe("");
                  }}
                  className="mx-auto"
                >
                  Return to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auth buttons below the card */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button variant="outline" asChild>
            <Link href="/auth">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}