import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Footprints, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const QuickStartFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleStartRun = () => {
    setIsOpen(false);
    navigate('/running');
  };

  const handleStartWorkout = () => {
    setIsOpen(false);
    navigate('/workouts');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Button
                onClick={handleStartRun}
                className="flex items-center gap-2 shadow-lg"
                size="lg"
              >
                <Footprints className="h-5 w-5" />
                Start Run
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleStartWorkout}
                className="flex items-center gap-2 shadow-lg"
                size="lg"
              >
                <Dumbbell className="h-5 w-5" />
                Start Workout
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};

export default QuickStartFAB;
