import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail, CheckCircle2, RefreshCw, KeyRound } from 'lucide-react';

import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import LandingPagePreferenceModal from '@/components/LandingPagePreferenceModal';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verification-pending' | 'update-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showLandingPreferenceModal, setShowLandingPreferenceModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const { user, loading, signIn, signUp, resendVerificationEmail, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for password recovery event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user && !loading && mode !== 'update-password') {
        // Check if this is a new user (no landing_page_preference set yet)
        const { data } = await supabase
          .from('profiles')
          .select('landing_page_preference')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If no preference set, show the modal for new users
        if (!data?.landing_page_preference) {
          setIsNewUser(true);
          setShowLandingPreferenceModal(true);
        } else {
          // Redirect based on preference
          const targetPage = data.landing_page_preference === 'fitness-journey' ? '/my-progress' : '/dashboard';
          navigate(targetPage);
        }
      }
    };
    
    checkUserAndRedirect();
  }, [user, loading, navigate, mode]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendVerification = useCallback(async () => {
    if (resendCooldown > 0 || !signupEmail) return;
    
    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(signupEmail);
      if (error) {
        toast({ 
          title: 'Failed to Resend', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        setResendCooldown(60);
        toast({ 
          title: 'Email Sent', 
          description: 'A new verification email has been sent.' 
        });
      }
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, signupEmail, resendVerificationEmail, toast]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (mode !== 'update-password') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }
    
    if (mode !== 'forgot-password') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === 'update-password') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'update-password') {
        const { error } = await updatePassword(password);
        if (error) {
          toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
        } else {
          setPasswordUpdated(true);
          toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
        } else {
          setResetEmailSent(true);
          toast({ title: 'Email Sent', description: 'Check your inbox for password reset instructions.' });
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
          } else {
            toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({ title: 'Sign Up Failed', description: 'An account with this email already exists.', variant: 'destructive' });
          } else {
            toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
          }
        } else {
          setSignupEmail(email);
          setMode('verification-pending');
          toast({ title: 'Check Your Email', description: 'We sent you a verification link.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLandingPreferenceSelect = async (preference: "dashboard" | "fitness-journey") => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ landing_page_preference: preference })
        .eq('user_id', user.id);
      
      setShowLandingPreferenceModal(false);
      const targetPage = preference === 'fitness-journey' ? '/my-progress' : '/dashboard';
      navigate(targetPage);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetEmailSent(false);
    if (newMode !== 'verification-pending') {
      setSignupEmail('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'verification-pending': return 'Verify Your Email';
      case 'update-password': return passwordUpdated ? 'Password Updated' : 'Set New Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Sign in to access your account';
      case 'signup': return 'Join Fortivus to start your fitness journey';
      case 'forgot-password': return 'Enter your email to receive reset instructions';
      case 'verification-pending': return 'One more step to complete your registration';
      case 'update-password': return passwordUpdated ? 'You can now sign in with your new password' : 'Enter your new password below';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading text-foreground">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'update-password' ? (
            passwordUpdated ? (
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully updated.
                </p>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => {
                    setPasswordUpdated(false);
                    setMode('login');
                    navigate('/auth');
                  }}
                >
                  Sign In Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            )
          ) : mode === 'verification-pending' ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to
                </p>
                <p className="font-medium text-foreground">{signupEmail}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2 text-left">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to verify your account
                  </p>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Check your spam folder if you don't see the email
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <Button 
                  variant="default"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => switchMode('login')}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : mode === 'forgot-password' && resetEmailSent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the link to reset your password.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => switchMode('login')}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              
              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  {mode === 'signup' && <PasswordStrengthIndicator password={password} />}
                </div>
              )}

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Forgot your password?
                </button>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
                )}
              </Button>

            </form>
          )}
          
          {mode !== 'verification-pending' && (
            <div className="mt-6 text-center space-y-2">
              {mode === 'forgot-password' && !resetEmailSent ? (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Back to Sign In
                </button>
              ) : mode !== 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {mode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <LandingPagePreferenceModal 
        open={showLandingPreferenceModal} 
        onSelect={handleLandingPreferenceSelect}
      />
    </div>
  );
};

export default Auth;