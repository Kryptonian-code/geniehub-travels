import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteData } from "@/contexts/SiteDataContext";
import { APP_NAME } from "@/lib/config";
import { emailSchema, passwordSchema, phoneSchema, nameSchema } from "@/lib/validation";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = loginSchema
  .extend({
    fullName: nameSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(6),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, signup, apiEnabled, authStrategy } = useAuth();
  const { settings } = useSiteData();
  const isSignup = mode === "signup";
  const workspaceIntent = searchParams.get("workspace") === "admin" ? "admin" : "client";
  const from = (location.state as { from?: string } | null)?.from;

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });
  const currentForm = isSignup ? signupForm : loginForm;
  const errors = currentForm.formState.errors;

  async function handleLogin(values: LoginValues) {
    try {
      const profile = await login(values.email, values.password, workspaceIntent);
      toast.success("Welcome back.");
      navigate(profile.mustChangePassword ? "/reset-password" : from ?? (profile.role === "admin" ? "/admin" : "/dashboard"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  async function handleSignup(values: SignupValues) {
    try {
      const profile = await signup({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success("Your account has been created.");
      navigate(profile.mustChangePassword ? "/reset-password" : profile.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.");
    }
  }

  return (
    <div className="min-h-screen bg-deep px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch">
        <motion.div
          className="card-theme p-8 md:p-10 auth-panel-motion"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Link to="/" className="heading-sm text-accent-gold">
            {settings?.brandName ?? "GenieHub"}
          </Link>
          <p className="body-lg mt-5 max-w-md">
            {isSignup
              ? "Create a client account to track applications, upload documents, and stay updated in one place."
              : workspaceIntent === "admin"
                ? "Sign in to the admin workspace to manage leads, applications, documents, and public content from one operational hub."
                : "Sign in to view your application progress, bookings, and uploaded documents."}
          </p>
          <div className="card-theme-soft p-5 mt-8">
            <p className="label-text text-accent-gold uppercase tracking-wide mb-3">What you get</p>
            <ul className="space-y-3 body-sm text-muted-green">
              {isSignup || workspaceIntent === "client" ? (
                <>
                  <li>Track visa and consultation progress from one dashboard.</li>
                  <li>Upload supporting documents securely.</li>
                  <li>See tour enquiries and consultation history in one place.</li>
                </>
              ) : (
                <>
                  <li>Review fresh leads, document uploads, and client updates faster.</li>
                  <li>Manage CMS content and operations from the same brand-aligned workspace.</li>
                  <li>Reply to client messages and move applications forward with clear visibility.</li>
                </>
              )}
            </ul>
          </div>
          {authStrategy === "firebase" && workspaceIntent === "client" && (
            <div className="card-theme-soft p-5 mt-6">
              <p className="body-sm text-muted-green">
                Firebase authentication is active for client accounts. If Firebase settings are removed, GenieHub will fall back to the local auth flow automatically.
              </p>
            </div>
          )}
          {apiEnabled && (
            <div className="card-theme-soft p-5 mt-6">
              <p className="body-sm text-muted-green">
                Local XAMPP API mode is active. Accounts, bookings, applications, and uploads are sent to your Apache/PHP backend.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          className="card-theme p-8 md:p-10 auth-panel-motion auth-panel-delayed"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <div className="inline-flex rounded-2xl border border-theme bg-surface-soft p-1 mb-8">
            <Link
              to="/login?workspace=client"
              className={`rounded-xl px-4 py-2 text-sm transition-colors ${!isSignup && workspaceIntent === "client" ? "bg-surface text-accent-gold" : "text-muted-green hover:text-[color:var(--color-text-main)]"}`}
            >
              Client Login
            </Link>
            <Link
              to="/login?workspace=admin"
              className={`rounded-xl px-4 py-2 text-sm transition-colors ${!isSignup && workspaceIntent === "admin" ? "bg-surface text-accent-gold" : "text-muted-green hover:text-[color:var(--color-text-main)]"}`}
            >
              Admin Login
            </Link>
          </div>
          <div className="flex items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="heading-md">
                {isSignup ? "Create client account" : workspaceIntent === "admin" ? "Admin login" : "Client login"}
              </h1>
              <p className="body-sm text-muted-green mt-2">
                {isSignup
                  ? `Set up your ${APP_NAME} client account.`
                  : workspaceIntent === "admin"
                    ? `Access your ${APP_NAME} operations workspace.`
                    : `Access your ${APP_NAME} client workspace.`}
              </p>
            </div>
            {(isSignup || workspaceIntent === "client") && (
              <Link
                to={isSignup ? "/login?workspace=client" : "/signup"}
                className="btn-outline-theme py-2 px-4 text-sm"
              >
                {isSignup ? "Back to login" : "Create account"}
              </Link>
            )}
          </div>

          {isSignup ? (
            <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
              <div>
                <label className="label-text mb-1 block">Full name</label>
                <input aria-label="Full name" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...signupForm.register("fullName")} />
                {errors.fullName && <p className="caption text-red-300 mt-1">{errors.fullName.message}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text mb-1 block">Email</label>
                  <input aria-label="Email" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...signupForm.register("email")} />
                  {errors.email && <p className="caption text-red-300 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label-text mb-1 block">Phone</label>
                  <input aria-label="Phone" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...signupForm.register("phone")} />
                  {errors.phone && <p className="caption text-red-300 mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text mb-1 block">Password</label>
                  <input aria-label="Password" type="password" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...signupForm.register("password")} />
                  {errors.password && <p className="caption text-red-300 mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label-text mb-1 block">Confirm password</label>
                  <input aria-label="Confirm password" type="password" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...signupForm.register("confirmPassword")} />
                  {errors.confirmPassword && <p className="caption text-red-300 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <p className="caption text-muted-green">
                Use at least 8 characters with uppercase, lowercase, and a number.
              </p>
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} className="btn-accent w-full" type="submit">
                Create account
              </motion.button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <label className="label-text mb-1 block">Email</label>
                <input aria-label="Email" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...loginForm.register("email")} />
                {errors.email && <p className="caption text-red-300 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label-text mb-1 block">Password</label>
                <input aria-label="Password" type="password" className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" {...loginForm.register("password")} />
                {errors.password && <p className="caption text-red-300 mt-1">{errors.password.message}</p>}
              </div>
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} className="btn-accent w-full" type="submit">
                Sign in
              </motion.button>
              {workspaceIntent === "client" && (
                <div className="space-y-2 text-center sm:text-left">
                  <p className="body-sm text-muted-green">
                    New here?{" "}
                    <Link to="/signup" className="text-accent-gold font-semibold hover:underline underline-offset-4">
                      Register
                    </Link>
                  </p>
                  <p className="body-sm text-muted-green">
                    Forgot your password?{" "}
                    <Link to="/forgot-password" className="text-accent-gold font-semibold hover:underline underline-offset-4">
                      Recover access
                    </Link>
                  </p>
                </div>
              )}
              {workspaceIntent === "admin" && (
                <div className="space-y-2">
                  <p className="caption text-muted-green">
                    Use an admin account to enter the operations workspace. Client accounts will still be redirected to the client dashboard.
                  </p>
                  <p className="caption text-muted-green">
                    If you lose access, a super admin can issue a secure reset or you can use the recovery flow when email delivery is configured.
                  </p>
                </div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
