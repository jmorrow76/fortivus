import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Target, Dumbbell, Calendar, AlertTriangle, Home, Focus, Utensils, CheckCircle2, X } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingQuizProps {
  onComplete: (data: OnboardingData) => void;
  isSubmitting?: boolean;
}

interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const STEPS = [
  {
    id: 'goal',
    title: 'What\'s your primary fitness goal?',
    description: 'This helps us tailor your training and nutrition recommendations.',
    icon: Target,
    field: 'fitness_goal' as const,
    type: 'single' as const,
    options: [
      { value: 'build_muscle', label: 'Build Muscle', description: 'Gain strength and size' },
      { value: 'lose_fat', label: 'Lose Fat', description: 'Drop body fat while preserving muscle' },
      { value: 'improve_health', label: 'Improve Overall Health', description: 'Better energy, mobility, and longevity' },
      { value: 'increase_energy', label: 'Increase Energy', description: 'Feel more vital throughout the day' },
    ],
  },
  {
    id: 'experience',
    title: 'What\'s your training experience level?',
    description: 'Be honest—this ensures we give you appropriate progressions.',
    icon: Dumbbell,
    field: 'experience_level' as const,
    type: 'single' as const,
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to structured training or returning after years off' },
      { value: 'intermediate', label: 'Intermediate', description: '1-3 years of consistent training' },
      { value: 'advanced', label: 'Advanced', description: '3+ years of dedicated training' },
    ],
  },
  {
    id: 'age',
    title: 'What\'s your age range?',
    description: 'Recovery and training protocols vary by age.',
    icon: Calendar,
    field: 'age_range' as const,
    type: 'single' as const,
    options: [
      { value: '40-44', label: '40-44' },
      { value: '45-49', label: '45-49' },
      { value: '50-54', label: '50-54' },
      { value: '55-59', label: '55-59' },
      { value: '60+', label: '60+' },
    ],
  },
  {
    id: 'frequency',
    title: 'How many days per week can you train?',
    description: 'We\'ll build a realistic schedule around your availability.',
    icon: Calendar,
    field: 'workout_frequency' as const,
    type: 'single' as const,
    options: [
      { value: '1-2', label: '1-2 days', description: 'Minimal but effective' },
      { value: '3-4', label: '3-4 days', description: 'Optimal for most goals' },
      { value: '5-6', label: '5-6 days', description: 'High commitment' },
    ],
  },
  {
    id: 'challenges',
    title: 'What are your biggest challenges?',
    description: 'Select all that apply—we\'ll address these in your program.',
    icon: AlertTriangle,
    field: 'current_challenges' as const,
    type: 'multiple' as const,
    options: [
      { value: 'recovery', label: 'Slow Recovery', description: 'Takes longer to bounce back' },
      { value: 'mobility', label: 'Limited Mobility', description: 'Stiffness or restricted movement' },
      { value: 'energy', label: 'Low Energy', description: 'Fatigue throughout the day' },
      { value: 'motivation', label: 'Staying Motivated', description: 'Hard to stay consistent' },
      { value: 'time', label: 'Limited Time', description: 'Busy schedule' },
      { value: 'injuries', label: 'Past Injuries', description: 'Working around old issues' },
    ],
  },
  {
    id: 'equipment',
    title: 'What equipment do you have access to?',
    description: 'Select all that apply.',
    icon: Home,
    field: 'available_equipment' as const,
    type: 'multiple' as const,
    options: [
      { value: 'full_gym', label: 'Full Gym', description: 'Commercial gym with machines and free weights' },
      { value: 'home_weights', label: 'Home Weights', description: 'Dumbbells, kettlebells, barbell' },
      { value: 'resistance_bands', label: 'Resistance Bands', description: 'Bands of various resistance' },
      { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' },
      { value: 'cardio_equipment', label: 'Cardio Equipment', description: 'Treadmill, bike, rower' },
    ],
  },
  {
    id: 'focus',
    title: 'What areas do you want to focus on?',
    description: 'Select your top priorities (up to 3).',
    icon: Focus,
    field: 'focus_areas' as const,
    type: 'multiple' as const,
    maxSelections: 3,
    options: [
      { value: 'strength', label: 'Strength Training' },
      { value: 'cardio', label: 'Cardiovascular Health' },
      { value: 'flexibility', label: 'Flexibility & Mobility' },
      { value: 'nutrition', label: 'Nutrition & Diet' },
      { value: 'sleep', label: 'Sleep Optimization' },
      { value: 'stress', label: 'Stress Management' },
      { value: 'hormones', label: 'Hormonal Health' },
    ],
  },
  {
    id: 'diet',
    title: 'Do you have any dietary preferences?',
    description: 'This helps us customize nutrition recommendations.',
    icon: Utensils,
    field: 'dietary_preference' as const,
    type: 'single' as const,
    options: [
      { value: 'no_restrictions', label: 'No Restrictions' },
      { value: 'low_carb', label: 'Low Carb / Keto' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'mediterranean', label: 'Mediterranean' },
      { value: 'intermittent_fasting', label: 'Intermittent Fasting' },
    ],
  },
  {
    id: 'injuries',
    title: 'Any injuries or limitations we should know about?',
    description: 'Optional—helps us provide safer exercise recommendations.',
    icon: AlertTriangle,
    field: 'injuries_limitations' as const,
    type: 'text' as const,
    optional: true,
  },
];

const OnboardingQuiz = ({ onComplete, isSubmitting = false }: OnboardingQuizProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({
    current_challenges: [],
    available_equipment: [],
    focus_areas: [],
  });

  const handleExit = () => {
    navigate('/dashboard');
  };

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.field]: value }));
  };

  const handleMultiSelect = (value: string) => {
    const field = step.field as 'current_challenges' | 'available_equipment' | 'focus_areas';
    const currentValues = answers[field] || [];
    const maxSelections = 'maxSelections' in step ? step.maxSelections : undefined;

    if (currentValues.includes(value)) {
      setAnswers(prev => ({
        ...prev,
        [field]: currentValues.filter(v => v !== value),
      }));
    } else if (!maxSelections || currentValues.length < maxSelections) {
      setAnswers(prev => ({
        ...prev,
        [field]: [...currentValues, value],
      }));
    }
  };

  const handleTextChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.field]: value }));
  };

  const canProceed = () => {
    if ('optional' in step && step.optional) return true;
    
    const value = answers[step.field];
    if (step.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }
    return !!value;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(answers as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleExit();
          }}
          aria-label="Exit assessment"
        >
          <X className="h-5 w-5" />
        </Button>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription className="mt-2">{step.description}</CardDescription>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step.type === 'text' ? (
                <Textarea
                  placeholder="Describe any injuries, limitations, or concerns..."
                  value={(answers[step.field] as string) || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <div className={cn(
                  'grid gap-3',
                  step.options.length <= 3 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                )}>
                  {step.options.map((option) => {
                    const isSelected = step.type === 'multiple'
                      ? (answers[step.field as 'current_challenges' | 'available_equipment' | 'focus_areas'] || []).includes(option.value)
                      : answers[step.field] === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => step.type === 'multiple' 
                          ? handleMultiSelect(option.value) 
                          : handleSingleSelect(option.value)
                        }
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          'hover:border-primary/50 hover:bg-accent/50',
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                          )}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div>
                            <p className="font-medium">{option.label}</p>
                            {option.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {'maxSelections' in step && step.maxSelections && (
            <p className="text-sm text-muted-foreground text-center">
              Selected: {(answers[step.field as 'focus_areas'] || []).length} / {step.maxSelections}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex-1"
            >
              {currentStep === STEPS.length - 1 ? (
                isSubmitting ? 'Saving...' : 'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingQuiz;
