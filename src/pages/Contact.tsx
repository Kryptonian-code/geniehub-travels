import PageLayout from "@/components/PageLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { submitContactLead } from "@/lib/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteData } from "@/contexts/SiteDataContext";
import { emailSchema, nameSchema, optionalPhoneSchema } from "@/lib/validation";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  subject: z.string().trim().min(3, "Enter a clearer subject").max(200),
  message: z.string().trim().min(10, "Enter a little more detail").max(2000),
});

type FormData = z.infer<typeof schema>;

const Contact = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSiteData();
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
      await submitContactLead({
        ...data,
        userId: user?.id,
      });
      reset({
        name: user?.fullName ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        subject: "",
        message: "",
      });
      navigate("/thank-you", {
        state: {
          title: "Message sent",
          message: "Your message has been sent successfully. The GenieHub team will review it and follow up with you shortly by email, phone, or WhatsApp.",
          returnTo: "/contact",
          returnLabel: "Back to contact",
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg body-sm outline-none transition-colors border";
  const inputStyle = { backgroundColor: "var(--color-surface-soft)", borderColor: "var(--color-border)", color: "var(--color-text-main)" };

  return (
    <PageLayout title="Contact Us" subtitle="Reach out to GenieHub and our team will guide you on the next best step.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-theme p-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                <div>
                  <h4 className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Office Address</h4>
                  <p className="body-sm text-muted-green">{settings?.officeAddress ?? "East Legon, Accra, Ghana"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                <div>
                  <h4 className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Phone</h4>
                  <p className="body-sm text-muted-green">{settings?.phone ?? "+233 24 000 0000"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                <div>
                  <h4 className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Email</h4>
                  <p className="body-sm text-muted-green">{settings?.supportEmail ?? "hello@geniehub.co"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                <div>
                  <h4 className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Working Hours</h4>
                  <p className="body-sm text-muted-green">{settings?.workingHours ?? "Mon - Fri: 8:00 AM - 5:00 PM | Sat: 9:00 AM - 2:00 PM"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card-theme p-6 md:p-8">
              <h2 className="heading-sm mb-6" style={{ color: "var(--color-text-main)" }}>Send Us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-muted-green mb-1 block">Name</label>
                    <input aria-label="Name" {...register("name")} placeholder="Your name" className={inputClass} style={inputStyle} />
                    {errors.name && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.name.message}</span>}
                  </div>
                  <div>
                    <label className="label-text text-muted-green mb-1 block">Email</label>
                    <input aria-label="Email" {...register("email")} type="email" placeholder="you@email.com" className={inputClass} style={inputStyle} />
                    {errors.email && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.email.message}</span>}
                  </div>
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Phone (optional)</label>
                  <input aria-label="Phone (optional)" {...register("phone")} placeholder="+233 24 000 0000" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Subject</label>
                  <input aria-label="Subject" {...register("subject")} placeholder="How can we help?" className={inputClass} style={inputStyle} />
                  {errors.subject && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.subject.message}</span>}
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Message</label>
                  <textarea aria-label="Message" {...register("message")} rows={5} placeholder="Tell us more..." className={inputClass} style={inputStyle} />
                  {errors.message && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.message.message}</span>}
                </div>
                <button type="submit" className="btn-accent w-full" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
