import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { migrateGuestDataToServer } from "@/lib/migrateGuestData";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
  });

  const loginMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/auth/login", "POST", data),
    onSuccess: async (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await migrateGuestDataToServer();
      toast({ title: "Login successful!" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/auth/register", "POST", data),
    onSuccess: async (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await migrateGuestDataToServer();
      toast({ title: "Registration successful!" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => apiRequest("/api/auth/send-otp", "POST", { phone }),
    onSuccess: (data: any) => {
      setOtpSent(true);
      toast({ 
        title: "OTP Sent!", 
        description: `OTP: ${data.otp} (For testing only)` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send OTP", variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { phone: string; otp: string }) => apiRequest("/api/auth/verify-otp", "POST", data),
    onSuccess: () => {
      setOtpVerified(true);
      toast({ title: "OTP Verified!", description: "You can now proceed with login/registration" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid OTP", variant: "destructive" });
    },
  });

  const handleSendOtp = () => {
    if (!formData.phone) {
      toast({ title: "Error", description: "Please enter your mobile number", variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate(formData.phone);
  };

  const handleVerifyOtp = () => {
    if (!formData.otp) {
      toast({ title: "Error", description: "Please enter the OTP", variant: "destructive" });
      return;
    }
    verifyOtpMutation.mutate({ phone: formData.phone, otp: formData.otp });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpVerified) {
      toast({ title: "Error", description: "Please verify your mobile number first", variant: "destructive" });
      return;
    }

    if (isRegister) {
      registerMutation.mutate(formData);
    } else {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setFormData({ ...formData, otp: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRegister ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isRegister ? "Sign up to start shopping" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData(prev => ({ ...prev, phone: value, otp: '' }));
                      setOtpSent(false);
                      setOtpVerified(false);
                    }}
                    required
                    disabled={otpVerified}
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={10}
                    data-testid="input-phone"
                  />
                  {!otpVerified && (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendOtpMutation.isPending || !formData.phone}
                      data-testid="button-send-otp"
                    >
                      {otpSent ? "Resend" : "Send OTP"}
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      maxLength={6}
                      data-testid="input-otp"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyOtpMutation.isPending || !formData.otp}
                      data-testid="button-verify-otp"
                    >
                      Verify
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Test OTP: 123456
                  </p>
                </div>
              )}

              {otpVerified && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mobile number verified successfully
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
                data-testid="button-submit"
              >
                {isRegister ? "Sign Up" : "Sign In"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    resetOtpState();
                  }}
                  data-testid="button-toggle-mode"
                >
                  {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
