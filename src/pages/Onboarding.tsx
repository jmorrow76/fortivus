import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding, OnboardingData } from '@/hooks/useOnboarding';
import OnboardingQuiz from '@/components/onboarding/OnboardingQuiz';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading, saveOnboarding } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Redirect if already completed onboarding
    if (!isLoading && hasCompletedOnboarding) {
      navigate('/dashboard');
    }
  }, [user, authLoading, hasCompletedOnboarding, isLoading, navigate]);

  const handleComplete = async (data: OnboardingData) => {
    setIsSubmitting(true);
    const success = await saveOnboarding(data);
    
    if (success) {
      toast.success('Welcome to Fortivus! Your personalized experience is ready.');
      navigate('/dashboard');
    } else {
      toast.error('Failed to save your preferences. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <OnboardingQuiz onComplete={handleComplete} isSubmitting={isSubmitting} />;
};

export default Onboarding;
