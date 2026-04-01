import PageLayout from "@/components/PageLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { submitConsultation } from "@/lib/backend";
import { useAuth } from "@/contexts/AuthContext";
import { emailSchema, futureDateSchema, nameSchema, phoneSchema } from "@/lib/validation";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  service: z.string().min(1, "Select a service"),
  date: futureDateSchema,
  time: z.string().min(1, "Select a time"),
  meetingType: z.string().min(1, "Select meeting type"),
  notes: z.string().trim().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

const services = [
  "Study Abroad Guidance",
  "Visa Application Support",
  "Tour Package Enquiry",
  "Flight & Hotel Booking",
  "General Travel Consultation",
  "Document Review",
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const BookConsultation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      await submitConsultation({
        ...data,
        userId: user?.id,
      });
      toast.success("Consultation booked successfully.");
      reset({
        name: user?.fullName ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        service: "",
        date: "",
        time: "",
        meetingType: "",
        notes: "",
      });
      navigate("/thank-you");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit consultation.");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg body-sm outline-none transition-colors border";
  const inputStyle = { backgroundColor: "var(--color-surface-soft)", borderColor: "var(--color-border)", color: "var(--color-text-main)" };
  const selectClass = `${inputClass} appearance-none`;

  return (
    <PageLayout title="Book a Consultation" subtitle="Sit down with one of our travel experts. We will help you plan your next move with a clear action plan.">
      <section className="section-padding bg-deep">
        <div className="max-w-2xl mx-auto">
          <div className="card-theme p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-muted-green mb-1 block">Full Name</label>
                  <input aria-label="Full Name" {...register("name")} placeholder="Your full name" className={inputClass} style={inputStyle} />
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
                <label className="label-text text-muted-green mb-1 block">Service</label>
                <select aria-label="Service" {...register("service")} className={selectClass} style={inputStyle}>
                  <option value="">Choose a service</option>
                  {services.map((service) => <option key={service} value={service}>{service}</option>)}
                </select>
                {errors.service && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.service.message}</span>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-muted-green mb-1 block">Preferred Date</label>
                  <input aria-label="Preferred Date" {...register("date")} type="date" className={inputClass} style={inputStyle} />
                  {errors.date && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.date.message}</span>}
                </div>
                <div>
                  <label className="label-text text-muted-green mb-1 block">Preferred Time</label>
                  <select aria-label="Preferred Time" {...register("time")} className={selectClass} style={inputStyle}>
                    <option value="">Select time</option>
                    {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  {errors.time && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.time.message}</span>}
                </div>
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Meeting Type</label>
                <select aria-label="Meeting Type" {...register("meetingType")} className={selectClass} style={inputStyle}>
                  <option value="">How would you like to meet?</option>
                  <option value="in-person">In-Person (Accra Office)</option>
                  <option value="video">Video Call (Zoom / Google Meet)</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp Call</option>
                </select>
                {errors.meetingType && <span className="caption" style={{ color: "var(--color-danger)" }}>{errors.meetingType.message}</span>}
              </div>
              <div>
                <label className="label-text text-muted-green mb-1 block">Additional Notes</label>
                <textarea {...register("notes")} rows={3} placeholder="Tell us what you need help with..." className={inputClass} style={inputStyle} />
              </div>
              <button type="submit" className="btn-accent w-full">Book My Consultation</button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookConsultation;
