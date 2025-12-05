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
  Timer, Check, X, ChevronRight, Minus, Clock, FileText, Trash2, Save, TrendingUp
} from 'lucide-react';
import ExerciseProgressChart from '@/components/ExerciseProgressChart';
import { Navigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const muscleGroups = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

const Workouts = () => {
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
    removeExerciseFromTemplate,
    deleteTemplate,
    startWorkoutFromTemplate,
    saveWorkoutAsTemplate,
  } = useWorkoutTracker();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [workoutName, setWorkoutName] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [editingSets, setEditingSets] = useState<Record<string, { reps: string; weight: string }>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Template state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showAddExerciseToTemplate, setShowAddExerciseToTemplate] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');

  // Auth redirect
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

  // Handle set completion
  const handleCompleteSet = async (setId: string) => {
    const editing = editingSets[setId];
    if (!editing) return;
    
    const reps = parseInt(editing.reps) || 0;
    const weight = parseFloat(editing.weight) || 0;
    
    await completeSet(setId, reps, weight);
    
    // Start rest timer
    setRestTimer(90);
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

  // Rest timer effect
  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) {
      setRestTimer(null);
      return;
    }
    const interval = setInterval(() => {
      setRestTimer(prev => (prev !== null && prev > 0) ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer]);

  // Elapsed time effect
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const start = new Date(activeSession.started_at).getTime();
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Active Workout View
  if (activeSession) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-32">
          {/* Workout Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{activeSession.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelWorkout}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => finishWorkout()}>
                <Check className="w-4 h-4 mr-2" />
                Finish
              </Button>
            </div>
          </div>

          {/* Rest Timer */}
          {restTimer !== null && (
            <Card className="mb-6 bg-primary/10 border-primary">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold">Rest Timer</span>
                </div>
                <span className="text-3xl font-mono font-bold text-primary">
                  {formatTime(restTimer)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setRestTimer(null)}>
                  Skip
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Active Exercises */}
          <div className="space-y-4 mb-6">
            {activeExercises.map(({ exercise, sets }) => (
              <Card key={exercise.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge variant="secondary">{exercise.muscle_group}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground font-medium">
                      <span>Set</span>
                      <span>Previous</span>
                      <span>lbs</span>
                      <span>Reps</span>
                      <span></span>
                    </div>
                    {sets.map((set, idx) => (
                      <div key={set.id} className="grid grid-cols-5 gap-2 items-center">
                        <span className={`font-medium ${set.is_warmup ? 'text-muted-foreground' : ''}`}>
                          {set.is_warmup ? 'W' : idx + 1}
                        </span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8"
                          value={editingSets[set.id]?.weight ?? set.weight ?? ''}
                          onChange={(e) => setEditingSets(prev => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], weight: e.target.value, reps: prev[set.id]?.reps ?? '' }
                          }))}
                          disabled={set.is_completed}
                        />
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8"
                          value={editingSets[set.id]?.reps ?? set.reps ?? ''}
                          onChange={(e) => setEditingSets(prev => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], reps: e.target.value, weight: prev[set.id]?.weight ?? '' }
                          }))}
                          disabled={set.is_completed}
                        />
                        <div className="flex gap-1">
                          {set.is_completed ? (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
                              <Check className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => handleCompleteSet(set.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteSet(set.id, exercise.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-3"
                    onClick={() => addSet(exercise.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Exercise Button */}
          <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-12">
                  <div className="flex gap-2 pb-2">
                    {muscleGroups.map(muscle => (
                      <Badge
                        key={muscle}
                        variant={selectedMuscle === muscle ? 'default' : 'outline'}
                        className="cursor-pointer capitalize whitespace-nowrap"
                        onClick={() => setSelectedMuscle(muscle)}
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1">
                    {filteredExercises.map(exercise => (
                      <button
                        key={exercise.id}
                        className="w-full p-3 text-left hover:bg-muted rounded-lg flex items-center justify-between"
                        onClick={() => {
                          addExerciseToWorkout(exercise);
                          setShowExercisePicker(false);
                        }}
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {exercise.muscle_group} • {exercise.equipment}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          {/* Save as Template Button */}
          {activeExercises.length > 0 && (
            <Dialog open={showSaveAsTemplate} onOpenChange={setShowSaveAsTemplate}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-3">
                  <Save className="w-5 h-5 mr-2" />
                  Save as Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save as Template</DialogTitle>
                  <DialogDescription>
                    Save this workout as a reusable template for future sessions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Template name"
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveAsTemplate(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAsTemplate} disabled={!saveTemplateName.trim()}>
                    Save Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    );
  }

  // Main Workouts View
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Workouts</h1>
            <p className="text-muted-foreground">
              Track your lifts, beat your PRs, build your legacy.
            </p>
          </div>

          {/* Start Workout Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Workout name (optional)"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleStartWorkout} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Workout
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span className="hidden sm:inline">Exercises</span>
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
                {/* Create Template Button */}
                <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
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

                {/* Add Exercises to Template Dialog */}
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
                            <div key={te.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{te.exercise.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {te.target_sets} sets × {te.target_reps} reps
                                </p>
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => removeExerciseFromTemplate(te.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
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
                                  <span className="text-muted-foreground">
                                    {te.target_sets} × {te.target_reps}
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
              </div>
            </TabsContent>

            {/* Exercises Tab */}
            <TabsContent value="exercises">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-12">
                  <div className="flex gap-2 pb-2">
                    {muscleGroups.map(muscle => (
                      <Badge
                        key={muscle}
                        variant={selectedMuscle === muscle ? 'default' : 'outline'}
                        className="cursor-pointer capitalize whitespace-nowrap"
                        onClick={() => setSelectedMuscle(muscle)}
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
                <div className="grid gap-2">
                  {filteredExercises.map(exercise => (
                    <Card key={exercise.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{exercise.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {exercise.muscle_group} • {exercise.equipment}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {exercise.equipment}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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
