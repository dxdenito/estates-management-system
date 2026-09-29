import { useState } from "react";
import RequestForm from "./RequestForm";
import { cardClass } from "../../components/ui/styles";

export default function RequestFormPage() {
  const [submittedEmail, setSubmittedEmail] = useState(null);

  if (submittedEmail) {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
          ✉
        </div>
        <h1 className="mt-4 text-xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{submittedEmail}</span>. Your request only
          becomes active once you open that link.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Report a repair or maintenance issue
      </h1>
      <p className="mt-2 text-ink-muted">
        Tell us what needs fixing and where. You will confirm by email and receive a tracking
        number.
      </p>
      <div className={`${cardClass} mt-6`}>
        <RequestForm onSubmitted={setSubmittedEmail} />
      </div>
    </div>
  );
}