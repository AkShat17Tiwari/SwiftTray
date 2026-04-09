import { redirect } from "next/navigation";

/**
 * Sign-up redirects to the unified auth gateway at /sign-in.
 */
export default function SignUpPage() {
  redirect("/sign-in");
}
