"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await authClient.signUp.email({
                name,
                email,
                password,
                callbackURL: "/dashboard",
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/auth/success");
                    }
                },
            });

            if (error) {
                toast.error(error.message);
            }
        },
        onError: (error: any) => {
            const message = error?.message || "Failed to sign up. Please try again.";
            toast.error(message);
        },
    });

    const googleMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await authClient.signIn.social({
                provider: "google",
                newUserCallbackURL: "/onboarding",
                callbackURL: "/dashboard",
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/auth/success");
                    }
                },
            });

            if (error) {
                toast.error(error.message);
            }
        },
        onError: (error: any) => {
            const message = error?.message || "Google sign up failed. Please try again.";
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    const handleGoogleSignUp = () => {
        googleMutation.mutate();
    };

    return (
        <section>
            <h3 className="text-2xl font-semibold text-center">Create your Konverse account</h3>

            {/* Form fields */}
            <form onSubmit={handleSubmit}>
                <article className="flex flex-col gap-6 my-8">
                    <article className="flex flex-col gap-1">
                        <Label>Name</Label>
                        <Input
                            type="text"
                            name="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="md:min-w-[400px]"
                            disabled={mutation.isPending || googleMutation.isPending}
                        />
                    </article>
                    <article className="flex flex-col gap-1">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="md:min-w-[400px]"
                            disabled={mutation.isPending || googleMutation.isPending}
                        />
                    </article>
                    <article className="flex flex-col gap-1">
                        <Label>Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="md:min-w-[400px] pr-10"
                                disabled={mutation.isPending || googleMutation.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={mutation.isPending || googleMutation.isPending}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </article>
                    <Button
                        type="submit"
                        disabled={
                            mutation.isPending ||
                            googleMutation.isPending ||
                            password.length < 1 ||
                            email.length < 1 ||
                            name.length < 1
                        }
                    >
                        {mutation.isPending ? "Signing Up..." : "Sign Up"}
                    </Button>
                </article>
            </form>

            <p className="text-sm text-center text-muted-foreground mb-6">Or</p>

            <Button
                className="w-full mb-6"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={googleMutation.isPending || mutation.isPending}
            >
                {googleMutation.isPending ? "Signing up with Google..." : "Sign up with Google"}
            </Button>
            <p className="text-sm font-semibold text-center text-muted-foreground">
                Already have an account?{" "}
                <Link className="font-semibold text-green-600" href="/auth/signin">
                    Sign in
                </Link>
            </p>
        </section>
    );
}

export default SignUp;
