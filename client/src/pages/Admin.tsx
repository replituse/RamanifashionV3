import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, Smartphone, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loginStep, setLoginStep] = useState<'email' | 'password' | 'otp'>('email');
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState("");
  const [signupData, setSignupData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [maskedMobile, setMaskedMobile] = useState("");

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", mobile: "", password: "" },
  });

  const signupOtpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Login mutations
  const startAuthMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiRequest("/api/admin/auth/start", "POST", data),
    onSuccess: (data: any) => {
      setMaskedMobile(data.maskedMobile);
      setLoginStep('otp');
      toast({
        title: "Credentials Verified",
        description: `OTP sent to ${data.maskedMobile}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      apiRequest("/api/admin/auth/verify", "POST", data),
    onSuccess: (data: any) => {
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      toast({
        title: "Login Successful",
        description: "Welcome to Admin Dashboard",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "OTP Verification Failed",
        description: error.message || "Incorrect OTP",
        variant: "destructive",
      });
    },
  });

  // Signup mutations
  const startSignupMutation = useMutation({
    mutationFn: (data: { name: string; email: string; mobile: string; password: string }) =>
      apiRequest("/api/admin/signup/start", "POST", data),
    onSuccess: (data: any) => {
      setMaskedMobile(data.maskedMobile);
      setSignupStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${data.maskedMobile}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create admin account",
        variant: "destructive",
      });
    },
  });

  const verifySignupOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      apiRequest("/api/admin/signup/verify", "POST", data),
    onSuccess: (data: any) => {
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      toast({
        title: "Account Created",
        description: "Welcome to the Admin Panel",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify OTP",
        variant: "destructive",
      });
    },
  });

  // Login handlers
  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    setEmail(data.email);
    setLoginStep('password');
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    startAuthMutation.mutate({
      email,
      password: data.password,
    });
  };

  const onOtpSubmit = (data: z.infer<typeof otpSchema>) => {
    verifyOtpMutation.mutate({
      email,
      otp: data.otp,
    });
  };

  // Signup handlers
  const onSignupSubmit = (data: z.infer<typeof signupSchema>) => {
    setSignupData(data);
    startSignupMutation.mutate(data);
  };

  const onSignupOtpSubmit = (data: z.infer<typeof otpSchema>) => {
    verifySignupOtpMutation.mutate({
      email: signupData.email,
      otp: data.otp,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Sign in to manage the admin panel or create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-admin-auth">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
              {loginStep === 'email' && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="admin@example.com"
                                className="pl-10"
                                data-testid="input-login-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      data-testid="button-login-continue"
                    >
                      Continue
                    </Button>
                  </form>
                </Form>
              )}

              {loginStep === 'password' && (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Logging in as: <span className="font-medium text-foreground">{email}</span>
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        className="p-0 h-auto text-xs text-pink-600 hover:text-pink-700"
                        onClick={() => {
                          setLoginStep('email');
                          passwordForm.reset();
                        }}
                        data-testid="button-change-email"
                      >
                        Change email
                      </Button>
                    </div>
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10"
                                data-testid="input-login-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={startAuthMutation.isPending}
                      data-testid="button-verify-credentials"
                    >
                      {startAuthMutation.isPending ? "Verifying..." : "Admin Sign In"}
                    </Button>
                  </form>
                </Form>
              )}

              {loginStep === 'otp' && (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Mobile Number</p>
                      </div>
                      <p className="text-sm text-muted-foreground">+91 {maskedMobile}</p>
                    </div>
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter OTP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="123456"
                              maxLength={6}
                              className="text-center text-lg tracking-widest font-mono"
                              data-testid="input-login-otp"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-2">
                            Test OTP: 123456
                          </p>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={verifyOtpMutation.isPending}
                      data-testid="button-verify-login-otp"
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setLoginStep('password');
                        otpForm.reset();
                      }}
                      data-testid="button-back-to-password"
                    >
                      Back
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-4">
              {signupStep === 'details' && (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="John Doe"
                                className="pl-10"
                                data-testid="input-signup-name"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="admin@example.com"
                                className="pl-10"
                                data-testid="input-signup-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                type="tel"
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className="pl-10"
                                data-testid="input-signup-mobile"
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Minimum 6 characters"
                                className="pl-10"
                                data-testid="input-signup-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={startSignupMutation.isPending}
                      data-testid="button-signup-submit"
                    >
                      {startSignupMutation.isPending ? "Creating Account..." : "Create Admin Account"}
                    </Button>
                  </form>
                </Form>
              )}

              {signupStep === 'otp' && (
                <Form {...signupOtpForm}>
                  <form onSubmit={signupOtpForm.handleSubmit(onSignupOtpSubmit)} className="space-y-4">
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Verify Mobile Number</p>
                      </div>
                      <p className="text-sm text-muted-foreground">+91 {maskedMobile}</p>
                    </div>
                    <FormField
                      control={signupOtpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter OTP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="123456"
                              maxLength={6}
                              className="text-center text-lg tracking-widest font-mono"
                              data-testid="input-signup-otp"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-2">
                            Test OTP: 123456
                          </p>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={verifySignupOtpMutation.isPending}
                      data-testid="button-verify-signup-otp"
                    >
                      {verifySignupOtpMutation.isPending ? "Verifying..." : "Verify & Create Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSignupStep('details');
                        signupOtpForm.reset();
                      }}
                      data-testid="button-back-to-details"
                    >
                      Back
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-sm"
              data-testid="button-back-to-user-login"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
