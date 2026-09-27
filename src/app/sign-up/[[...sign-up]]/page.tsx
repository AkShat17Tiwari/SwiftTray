import { redirect } from "next/navigation";

/**
 * Public registration is for student accounts. Vendor access is requested
 * after signing in, and administrator accounts are provisioned separately.
 */
export default function SignUpPage() {
  redirect("/sign-in/student?mode=sign-up");
}
