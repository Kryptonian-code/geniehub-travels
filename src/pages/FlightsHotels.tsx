import PageLayout from "@/components/PageLayout";
import ContactCTA from "@/components/ContactCTA";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { submitTourEnquiry } from "@/lib/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinationOptions } from "@/lib/destinationOptions";
import { emailSchema, futureDateSchema, nameSchema, phoneSchema } from "@/lib/validation";

const schema = z.object({
  destination: z.string().trim().min(2, "Please enter a destination").max(200),
  departure: futureDateSchema,
  returnDate: futureDateSchema,
  passengers: z.string().min(1, "Enter number of passengers"),
  budget: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
}).refine((value) => new Date(value.returnDate) >= new Date(value.departure), {
  message: "Return date must be the same as or later than departure.",
  path: ["returnDate"],
});

type FormData = z.infer<typeof schema>;

const FlightsHotels = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { options: destinationOptions } = useDestinationOptions(["travel", "tour"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);
      await submitTourEnquiry({
        ...data,
        userId: user?.id,
      });
      reset({
        destination: "",
        departure: "",
        returnDate: "",
        passengers: "",
        budget: "",
        notes: "",
        name: user?.fullName ?? "",
        phone: user?.phone ?? "",
        email: user?.email ?? "",
      });
      navigate("/thank-you", {
        state: {
          title: "Travel enquiry received",
          message: "Your flight or hotel enquiry has been received successfully. Our team will review your travel dates, budget, and preferences, then get back to you with the next step.",
          returnTo: "/",
          returnLabel: "Return Home",
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg body-sm outline-none transition-colors border focus:ring-2 focus:ring-opacity-50";
  const inputStyle = { backgroundColor: "var(--color-surface-soft)", borderColor: "var(--color-border)", color: "var(--color-text-main)" };

  return (
    <PageLayout title="Flights & Hotels" subtitle="Tell us where you want to go and we will build the best travel and stay options for your budget.">
      <section className="section-padding bg-deep">
        <div className="max-w-2xl mx-auto">
          <div className="card-theme p-6 md:p-8">
            <h2 className="heading-sm mb-6" style={{ color: "var(--color-text-main)" }}>Travel Enquiry Form</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-muted-green mb-1 block">Full Name</label>
                  <input aria-label="Full Name" {...register("name")} placeholder="Kwame Asante" className={inputClass} style={inputStyle} />
                  {errors.name && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.name.message}</span>}
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Phone</label>
                  <input aria-label="Phone" {...register("phone")} placeholder="+233 24 000 0000" className={inputClass} style={inputStyle} />
                  {errors.phone && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.phone.message}</span>}
                </div>
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Email</label>
                <input aria-label="Email" {...register("email")} type="email" placeholder="you@email.com" className={inputClass} style={inputStyle} />
                {errors.email && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.email.message}</span>}
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Destination</label>
                <select aria-label="Destination" {...register("destination")} className={inputClass} style={inputStyle}>
                  <option value="">Select your destination</option>
                  {destinationOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
                {errors.destination && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.destination.message}</span>}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-text text-muted-green mb-1 block">Departure</label>
                  <input aria-label="Departure" {...register("departure")} type="date" className={inputClass} style={inputStyle} />
                  {errors.departure && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.departure.message}</span>}
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Return</label>
                  <input aria-label="Return" {...register("returnDate")} type="date" className={inputClass} style={inputStyle} />
                  {errors.returnDate && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.returnDate.message}</span>}
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Passengers</label>
                  <input aria-label="Passengers" {...register("passengers")} type="number" min="1" placeholder="2" className={inputClass} style={inputStyle} />
                  {errors.passengers && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.passengers.message}</span>}
                </div>
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Budget (optional)</label>
                <input {...register("budget")} placeholder="e.g. GH₵ 5,000 - GH₵ 10,000" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Additional Notes</label>
                <textarea aria-label="Additional Notes" {...register("notes")} rows={3} placeholder="Any special requirements?" className={inputClass} style={inputStyle} />
              </div>
              <button type="submit" className="btn-accent w-full" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Enquiry"}</button>
            </form>
          </div>
        </div>
      </section>
      <ContactCTA />
    </PageLayout>
  );
};

export default FlightsHotels;
