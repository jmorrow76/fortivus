import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutTracker, WorkoutTemplate } from '@/hooks/useWorkoutTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dumbbell, Play, History, Trophy, Plus, Search, 
  Timer, Check, X, ChevronRight, Minus, Clock, FileText, Trash2, Save, TrendingUp, Video, ArrowLeft
} from 'lucide-react';
import ExerciseProgressChart from '@/components/ExerciseProgressChart';
import ExerciseVideoLibrary from '@/components/ExerciseVideoLibrary';
import PRCelebration from '@/components/PRCelebration';
import { StrongWorkoutView } from '@/components/workout/StrongWorkoutView';
import { Navigate, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const muscleGroups = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

const Workouts = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    exercises,
    templates,
    workoutHistory,
    personalRecords,
    activeSession,
    activeExercises,
    startWorkout,
    addExerciseToWorkout,
    addSet,
    completeSet,
    deleteSet,
    finishWorkout,
    cancelWorkout,
    createTemplate,
    addExerciseToTemplate,
    updateTemplateExercise,
    removeExerciseFromTemplate,
    deleteTemplate,
    startWorkoutFromTemplate,
    saveWorkoutAsTemplate,
    prCelebration,
    clearPrCelebration,
  } = useWorkoutTracker();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [workoutName, setWorkoutName] = useState('');
  
  // Template state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showAddExerciseToTemplate, setShowAddExerciseToTemplate] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');

  // Auth redirect - after all hooks
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  // Start workout handler
  const handleStartWorkout = async () => {
    const name = workoutName.trim() || `Workout - ${format(new Date(), 'MMM d')}`;
    await startWorkout(name);
    setWorkoutName('');
  };

  // Create template handler
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    const template = await createTemplate(newTemplateName.trim(), newTemplateDesc.trim());
    if (template) {
      setShowCreateTemplate(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      setEditingTemplate({ ...template, exercises: [] });
      setShowAddExerciseToTemplate(true);
    }
  };

  // Save workout as template handler
  const handleSaveAsTemplate = async () => {
    if (!saveTemplateName.trim()) return;
    await saveWorkoutAsTemplate(saveTemplateName.trim());
    setShowSaveAsTemplate(false);
    setSaveTemplateName('');
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Active Workout View - Strong App Style
  if (activeSession) {
    return (
      <>
        <StrongWorkoutView
          session={activeSession}
          activeExercises={activeExercises}
          exercises={exercises}
          userId={user?.id}
          prCelebration={prCelebration}
          onAddExercise={addExerciseToWorkout}
          onAddSet={addSet}
          onCompleteSet={completeSet}
          onDeleteSet={deleteSet}
          onRemoveExercise={(exerciseId) => {
            const exercise = activeExercises.find(ae => ae.exercise.id === exerciseId);
            if (exercise) {
              exercise.sets.forEach(set => deleteSet(set.id, exerciseId));
            }
          }}
          onFinish={() => finishWorkout()}
          onCancel={cancelWorkout}
          onSaveAsTemplate={() => setShowSaveAsTemplate(true)}
          onClearPR={clearPrCelebration}
        />
        
        {/* Save as Template Dialog */}
        <Dialog open={showSaveAsTemplate} onOpenChange={setShowSaveAsTemplate}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Save as Template</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Save this workout as a reusable template for future sessions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Template name"
                className="bg-zinc-800 border-zinc-700 text-white"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-zinc-700 text-zinc-400" onClick={() => setShowSaveAsTemplate(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveAsTemplate} disabled={!saveTemplateName.trim()}>
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Main Workouts View
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-44 md:pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Workouts</h1>
            <p className="text-muted-foreground">
              Track your lifts, beat your PRs, build your legacy.
            </p>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Tutorials</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="records" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Records</span>
              </TabsTrigger>
            </TabsList>

            {/* History Tab */}
            <TabsContent value="history">
              {workoutHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
                    <p className="text-muted-foreground">
                      Start your first workout to begin tracking your progress.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {workoutHistory.map(session => (
                    <Card key={session.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{session.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.started_at), 'EEEE, MMM d')} • {session.duration_minutes || 0} min
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <div className="space-y-4">
                {/* Add Exercises to Template Dialog (keep dialog definition here) */}
                <Dialog open={showAddExerciseToTemplate} onOpenChange={(open) => {
                  setShowAddExerciseToTemplate(open);
                  if (!open) setEditingTemplate(null);
                }}>
                  <DialogContent className="max-w-lg max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate ? `Edit: ${editingTemplate.name}` : 'Add Exercises'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTemplate?.exercises?.length || 0} exercises added
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Current exercises in template */}
                      {editingTemplate?.exercises && editingTemplate.exercises.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Exercises in template:</p>
                          {editingTemplate.exercises.map((te) => (
                            <div key={te.id} className="p-3 bg-muted rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{te.exercise.name}</p>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => removeExerciseFromTemplate(te.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">Sets</label>
                                  <Input
                                    type="number"
                                    className="h-8"
                                    value={te.target_sets || 3}
                                    onChange={(e) => updateTemplateExercise(te.id, { targetSets: parseInt(e.target.value) || 3 })}
                                    min={1}
                                    max={20}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Reps</label>
                                  <Input
                                    type="number"
                                    className="h-8"
                                    value={te.target_reps || 10}
                                    onChange={(e) => updateTemplateExercise(te.id, { targetReps: parseInt(e.target.value) || 10 })}
                                    min={1}
                                    max={100}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Timer className="w-3 h-3" /> Rest (sec)
                                  </label>
                                  <Input
                                    type="number"
                                    className="h-8"
                                    value={te.rest_seconds || 90}
                                    onChange={(e) => updateTemplateExercise(te.id, { restSeconds: parseInt(e.target.value) || 90 })}
                                    min={0}
                                    max={600}
                                    step={15}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Search and add exercises */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search exercises..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-1">
                          {filteredExercises.map(exercise => (
                            <button
                              key={exercise.id}
                              className="w-full p-3 text-left hover:bg-muted rounded-lg flex items-center justify-between"
                              onClick={() => {
                                if (editingTemplate) {
                                  addExerciseToTemplate(editingTemplate.id, exercise.id);
                                }
                              }}
                            >
                              <div>
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {exercise.muscle_group}
                                </p>
                              </div>
                              <Plus className="w-4 h-4 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        setShowAddExerciseToTemplate(false);
                        setEditingTemplate(null);
                      }}>
                        Done
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Templates List */}
                {templates.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                      <p className="text-muted-foreground">
                        Create templates to quickly start your favorite workouts.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {templates.map(template => (
                      <Card key={template.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {template.description && (
                                <CardDescription>{template.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setShowAddExerciseToTemplate(true);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {template.exercises && template.exercises.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              {template.exercises.map((te) => (
                                <div key={te.id} className="flex items-center justify-between text-sm">
                                  <span>{te.exercise.name}</span>
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    {te.target_sets} × {te.target_reps}
                                    <span className="flex items-center gap-1 text-xs">
                                      <Timer className="w-3 h-3" />
                                      {te.rest_seconds || 90}s
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-4">No exercises added yet</p>
                          )}
                          <Button 
                            className="w-full" 
                            onClick={() => startWorkoutFromTemplate(template)}
                            disabled={!template.exercises || template.exercises.length === 0}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Workout
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Quick Start - Empty Workout */}
                <Card className="border-accent/20 bg-accent/5">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="font-semibold text-lg mb-1">Quick Start</h2>
                        <p className="text-sm text-muted-foreground">Begin a blank workout and add exercises as you go</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          placeholder="Workout name (optional)"
                          value={workoutName}
                          onChange={(e) => setWorkoutName(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleStartWorkout} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Play className="w-5 h-5 mr-2" />
                          Start Empty Workout
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Template Button */}
                <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Template</DialogTitle>
                      <DialogDescription>
                        Create a workout template you can reuse.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Template name"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newTemplateDesc}
                        onChange={(e) => setNewTemplateDesc(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTemplate} disabled={!newTemplateName.trim()}>
                        Create & Add Exercises
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Tutorials Tab */}
            <TabsContent value="tutorials">
              <ExerciseVideoLibrary />
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <ExerciseProgressChart />
            </TabsContent>

            {/* Records Tab */}
            <TabsContent value="records">
              {personalRecords.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No records yet</h3>
                    <p className="text-muted-foreground">
                      Complete workouts to set your personal records.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {personalRecords.map(pr => {
                    const exercise = exercises.find(e => e.id === pr.exercise_id);
                    return (
                      <Card key={pr.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{exercise?.name || 'Unknown'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(pr.achieved_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{pr.value} lbs</p>
                              {pr.reps_at_weight && (
                                <p className="text-sm text-muted-foreground">
                                  × {pr.reps_at_weight} reps
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Workouts;
