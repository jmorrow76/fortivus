import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

const unsubscribeSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
});

type UnsubscribeFormData = z.infer<typeof unsubscribeSchema>;

const Unsubscribe = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<UnsubscribeFormData>({
    resolver: zodResolver(unsubscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: UnsubscribeFormData) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const { data: response, error } = await supabase.functions.invoke("unsubscribe-newsletter", {
        body: { email: data.email },
      });

      if (error) {
        throw new Error(error.message || "Failed to process request");
      }

      if (response?.error) {
        setMessage(response.error);
      } else {
        setIsSuccess(true);
        setMessage(response?.message || "You have been unsubscribed successfully.");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="py-16">
            <Card className="border-border">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  {isSuccess ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Mail className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {isSuccess ? "Unsubscribed" : "Unsubscribe from Newsletter"}
                </CardTitle>
                <CardDescription>
                  {isSuccess
                    ? "We're sorry to see you go."
                    : "Enter your email address to unsubscribe from The Fortivus Weekly."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground">
                      You will no longer receive our weekly newsletter. If you change your mind, you can always resubscribe from our homepage.
                    </p>
                    <Button variant="outline" asChild className="mt-4">
                      <a href="/">Return to Homepage</a>
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {message && !isSuccess && (
                        <p className="text-sm text-destructive">{message}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Unsubscribe"
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        We respect your privacy. Your email will be removed from our mailing list immediately.
                      </p>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
