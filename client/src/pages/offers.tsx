import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import OfferForm from "@/components/offer-form";
import type { Offer } from "@shared/schema";

export default function Offers() {
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Offers</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <OfferForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers?.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <CardTitle>{offer.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{offer.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">${Number(offer.price).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Response within {offer.responseTimeHours}h
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!offers || offers.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">No offers yet</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First Offer</Button>
              </DialogTrigger>
              <DialogContent>
                <OfferForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
