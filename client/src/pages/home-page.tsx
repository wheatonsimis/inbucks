import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { User } from "lucide-react";

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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf8f6' }}>
      {/* Top navigation with logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <img
            src="/inbucks-logo.png"
            alt="inBucks Logo"
            className="h-10 w-10 rounded-full"
          />
          <Button variant="outline" asChild className="rounded-full hover:bg-gray-100 border-gray-300 text-gray-600">
            <Link href="/auth" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center flex-grow pt-20">
        {/* George Washington Image */}
        <div className="flex justify-center">
          <img
            src="/george.png"
            alt="George Washington"
            className="w-48 h-48 object-contain"
          />
        </div>

        <Card className="w-full max-w-md mx-4 rounded-xl">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2 text-center">
              <span className="relative inline-block">
                inBucks.com
                <sup className="absolute -top-1 -right-2 text-sm">™</sup>
              </span>
            </h1>
            <div className="mx-auto w-64 h-px bg-gray-300 my-2"></div>
            <span className="text-xl text-gray-700 block text-center">Buy & Sell Inbox Attention</span>
            {!offerSubmitted ? (
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Your email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="rounded-lg"
                />
                <Input
                  placeholder="Recipient's email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg"
                />
                <Textarea
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-24 rounded-lg"
                />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap w-32 text-right">Offer amount:</span>
                  <div className="relative flex-1 max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-6 rounded-lg"
                      min="5"
                      step="5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap w-32 text-right">Response time:</span>
                  <div className="relative flex-1 max-w-[200px]">
                    <Input
                      type="number"
                      placeholder="hours"
                      value={timeframe}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value === "" || parseInt(value) >= 0) {
                          setTimeframe(value);
                        }
                      }}
                      className="pl-3 rounded-lg"
                      step="6"
                      min="6"
                    />
                    {timeframe && (
                      <div
                        className="absolute top-0 left-0 h-full pointer-events-none flex items-center"
                        style={{
                          left: `${timeframe.length * 8 + 16}px`
                        }}
                      >
                        <span className="text-sm text-muted-foreground"> {timeframe === "1" ? "hour" : "hours"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-lg">Submit Offer</Button>
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
                  className="mx-auto rounded-lg"
                >
                  Return to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Centered Sign Up button */}
        <div className="mt-8">
          <Button
            asChild
            className="bg-[#E3FCD6] hover:bg-[#E3FCD6]/90 text-black rounded-full px-12 py-5 text-xl font-bold h-auto shadow-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/auth">Sign Up</Link>
          </Button>
        </div>

        {/* Add testimonials section */}
        <div className="w-full max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 (Emma Thompson) */}
            <Card className="relative border-0 shadow-none">
              <CardContent className="pt-6 pb-14">
                <p className="text-muted-foreground mb-4">
                  "inBucks has revolutionized how I handle my inbox. Now I can monetize my expertise while helping others."
                </p>
                <div className="text-sm">
                  <strong className="block">Emma Thompson</strong>
                  <span className="text-muted-foreground">Talent Agent</span>
                </div>
                <Avatar className="absolute bottom-4 right-4 h-12 w-12 border-2 border-border">
                  <AvatarFallback>ET</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>

            {/* Testimonial 2 (Michael Rodriguez) */}
            <Card className="relative border-0 shadow-none">
              <CardContent className="pt-6 pb-14">
                <p className="text-muted-foreground mb-4">
                  "As an industry expert, I now get compensated for the time I spend sharing knowledge via email."
                </p>
                <div className="text-sm">
                  <strong className="block">Michael Rodriguez</strong>
                  <span className="text-muted-foreground">Financial Advisor</span>
                </div>
                <Avatar className="absolute bottom-4 right-4 h-12 w-12 border-2 border-border">
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>

            {/* Testimonial 3 (Sarah Chen) */}
            <Card className="relative border-0 shadow-none">
              <CardContent className="pt-6 pb-14">
                <p className="text-muted-foreground mb-4">
                  "This platform has helped me prioritize my inbox while creating value for both parties involved."
                </p>
                <div className="text-sm">
                  <strong className="block">Sarah Chen</strong>
                  <span className="text-muted-foreground">Tech Consultant</span>
                </div>
                <Avatar className="absolute bottom-4 right-4 h-12 w-12 border-2 border-border">
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <footer className="w-full py-6 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-end gap-4 text-sm text-muted-foreground">
          <span>© 2025 inBucks™ | All rights reserved.</span>
          <span>Privacy Policy | Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}