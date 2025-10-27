import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: '', otp: '', newPassword: '' });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.name);
      
      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Show verification modal with the newly created user
      if (data?.user) {
        setVerificationUserId(data.user.id);
        setVerificationEmail(signUpForm.email);
        setShowVerificationModal(true);
        
        toast({
          title: 'Account Created! 🎉',
          description: 'Please verify your email to continue.',
        });
      }
      
      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back! 👋',
        description: 'Successfully signed in to your account',
      });
      navigate('/homepage');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordForm.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset code',
          variant: 'destructive',
        });
        return;
      }

      setOtpSent(true);
      toast({
        title: 'OTP Sent!',
        description: 'Check your email for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: forgotPasswordForm.email,
        token: forgotPasswordForm.otp,
        type: 'recovery',
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Invalid verification code',
          variant: 'destructive',
        });
        return;
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: forgotPasswordForm.newPassword,
      });

      if (updateError) {
        toast({
          title: 'Error',
          description: updateError.message || 'Failed to reset password',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success!',
        description: 'Your password has been reset. You can now sign in.',
      });
      
      // Reset form and go back to sign in
      setShowForgotPassword(false);
      setOtpSent(false);
      setForgotPasswordForm({ email: '', otp: '', newPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={verificationEmail}
        userId={verificationUserId}
        onVerificationSuccess={() => {
          navigate('/homepage');
        }}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img 
              src="/pair2pass_logo(n).png" 
              alt="Pair2Pass Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Pair2Pass</h1>
          <p className="text-muted-foreground">
            Join thousands of students studying together
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create an account or sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        value={signUpForm.name}
                        onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin" className="space-y-4 mt-4">
                {!showForgotPassword ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@university.edu"
                          value={signInForm.email}
                          onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="text-xs p-0 h-auto"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot Password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={signInForm.password}
                          onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                ) : !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1">Reset Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email to receive a verification code
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@university.edu"
                          value={forgotPasswordForm.email}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordForm({ email: '', otp: '', newPassword: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1">Enter OTP & New Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Check your email for the verification code
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        placeholder="Enter 6-digit code"
                        value={forgotPasswordForm.otp}
                        onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, otp: e.target.value })}
                        required
                        maxLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          value={forgotPasswordForm.newPassword}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, newPassword: e.target.value })}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setOtpSent(false);
                          setForgotPasswordForm({ email: '', otp: '', newPassword: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg">🔗</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Connect Your Wallet (Optional)</h3>
                <p className="text-xs text-muted-foreground">
                  After signing up, you can optionally connect your Web3 wallet to mint NFT badges
                  and earn Pass Points on-chain for your achievements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}