import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { verifyEmail, resendVerificationEmail } from "@/api/auth";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "sent" | "error";

const inFlight = new Map<string, Promise<void>>();
const verifiedTokens = new Set<string>();

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendStatus("loading");
    try {
      await resendVerificationEmail(resendEmail);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError(t("verify.invalidLink"));
      return;
    }

    setStatus("loading");

    let promise = inFlight.get(token);
    if (!promise) {
      promise = verifyEmail(token)
        .then(() => {
          verifiedTokens.add(token);
          inFlight.delete(token);
        })
        .catch((err) => {
          inFlight.delete(token);
          throw err;
        });
      inFlight.set(token, promise);
    }

    promise
      .then(() => {
        if (mountedRef.current) setStatus("success");
      })
      .catch((err: Error & { code?: string }) => {
        if (!mountedRef.current) return;
        if (verifiedTokens.has(token)) {
          setStatus("success");
          return;
        }
        setStatus("error");
        if (err.code === "verification_token_expired") {
          setError(t("verify.expired"));
        } else {
          setError(err.message || t("verify.failed"));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid re-verifying when only i18n changes
  }, [token]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="ALumiEye"
            className="h-14 w-14 rounded-full object-cover"
          />
          <h1 className="mt-4 text-2xl font-semibold text-text-primary">
            ALumiEye
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("verify.title")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-lg border border-surface-border bg-surface-card p-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
              <p className="text-center text-sm text-text-secondary">
                {t("verify.loading")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-center text-sm text-text-primary">
                {t("verify.success")}
              </p>
              <Button asChild className="w-full">
                <Link to="/sign-in">{t("verify.signIn")}</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-600" />
              <p className="text-center text-sm text-red-600">{error}</p>
              <form onSubmit={handleResend} className="flex w-full flex-col gap-2">
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder={t("verify.resendEmailPlaceholder")}
                  required
                  disabled={resendStatus === "loading" || resendStatus === "sent"}
                />
                {resendStatus === "sent" && (
                  <p className="text-center text-sm text-green-600">{t("verify.resendSent")}</p>
                )}
                {resendStatus === "error" && (
                  <p className="text-center text-sm text-red-600">{t("verify.resendError")}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resendStatus === "loading" || resendStatus === "sent"}
                >
                  {resendStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verify.resendEmail")}
                </Button>
              </form>
              <div className="flex w-full flex-col gap-2">
                <Button asChild variant="default" className="w-full">
                  <Link to="/sign-in">{t("verify.signIn")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/sign-up">{t("verify.createAccount")}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
