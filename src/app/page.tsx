"use client";
import { authClient } from "@/lib/auth-client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data, isPending, error } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (data) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin");
      }
    }
  }, [data, isPending, router]);

  if (isPending) {
    return (
      <div>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div>Auth error</div>;
  }

  return null;
}