import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertOfferSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function OfferForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(
      insertOfferSchema.extend({
        price: insertOfferSchema.shape.price.transform((val) => Number(val)),
        responseTimeHours: insertOfferSchema.shape.responseTimeHours.transform(
          (val) => Number(val)
        ),
      })
    ),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      responseTimeHours: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/offers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Success",
        description: "Your offer has been created",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createOfferMutation.mutate(data))}
        className="space-y-6"
      >
        <DialogHeader>
          <DialogTitle>Create New Offer</DialogTitle>
          <DialogDescription>
            Define your email response service details below.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Expert Career Advice Responses"
                  {...field}
                  disabled={createOfferMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your email response service..."
                  className="resize-none"
                  {...field}
                  disabled={createOfferMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="29.99"
                    {...field}
                    disabled={createOfferMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responseTimeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Time (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="24"
                    {...field}
                    disabled={createOfferMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createOfferMutation.isPending}
        >
          {createOfferMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Offer
        </Button>
      </form>
    </Form>
  );
}
