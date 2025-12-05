import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Search, Trash2, CalendarIcon, Apple, Beef, 
  Cookie, Droplets, ChevronLeft, ChevronRight, Flame, CheckCircle
} from 'lucide-react';
import { useCalorieTracker, Food, MealType, MEAL_TYPES } from '@/hooks/useCalorieTracker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CALORIE_GOAL = 2000;
const PROTEIN_GOAL = 150;
const CARBS_GOAL = 200;
const FAT_GOAL = 65;

export function CalorieTracker() {
  const {
    foods,
    mealLogs,
    loading,
    selectedDate,
    setSelectedDate,
    searchFoods,
    addFood,
    logMeal,
    deleteMealLog,
    getDailyTotals,
    getMealsByType
  } = useCalorieTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState('1');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving_size: '100',
    serving_unit: 'g'
  });

  const totals = getDailyTotals();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      await searchFoods(query);
    }
  };

  const handleLogMeal = async () => {
    if (!selectedFood) return;
    
    const success = await logMeal(
      selectedFood.id,
      parseFloat(servings) || 1,
      selectedMealType
    );
    
    if (success) {
      setSelectedFood(null);
      setServings('1');
      setSearchQuery('');
      setIsLogDialogOpen(false);
    }
  };

  const handleAddFood = async () => {
    const food = await addFood({
      name: newFood.name,
      brand: null,
      calories: parseInt(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      fiber: 0,
      serving_size: parseFloat(newFood.serving_size) || 100,
      serving_unit: newFood.serving_unit,
      created_by: null
    });
    
    if (food) {
      setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', serving_size: '100', serving_unit: 'g' });
      setIsAddingFood(false);
      setSelectedFood(food);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const MacroBar = ({ label, current, goal, color, icon: Icon }: { 
    label: string; current: number; goal: number; color: string; icon: any 
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1.5">
          <Icon className={cn("w-3.5 h-3.5", color)} />
          {label}
        </span>
        <span className="text-muted-foreground">{current}g / {goal}g</span>
      </div>
      <Progress value={Math.min((current / goal) * 100, 100)} className="h-2" />
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selector & Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Calorie Tracker
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {format(selectedDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calorie Ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-secondary"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251}
                  strokeDashoffset={251 - (251 * Math.min(totals.calories / CALORIE_GOAL, 1))}
                  className="text-accent transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{totals.calories}</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm text-muted-foreground">
                {CALORIE_GOAL - totals.calories > 0 
                  ? `${CALORIE_GOAL - totals.calories} kcal remaining`
                  : `${totals.calories - CALORIE_GOAL} kcal over goal`
                }
              </div>
              <MacroBar label="Protein" current={totals.protein} goal={PROTEIN_GOAL} color="text-red-500" icon={Beef} />
              <MacroBar label="Carbs" current={totals.carbs} goal={CARBS_GOAL} color="text-amber-500" icon={Cookie} />
              <MacroBar label="Fat" current={totals.fat} goal={FAT_GOAL} color="text-blue-500" icon={Droplets} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Food Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Log Food
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Food</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="search" className="flex-1">Search Foods</TabsTrigger>
              <TabsTrigger value="add" className="flex-1">Add New Food</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {foods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-colors",
                        selectedFood?.id === food.id 
                          ? "bg-accent/20 border border-accent" 
                          : "hover:bg-secondary"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-1.5">
                            {food.name}
                            {food.is_verified && <CheckCircle className="w-3 h-3 text-accent" />}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {food.serving_size}{food.serving_unit}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{food.calories} kcal</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              
              {selectedFood && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Servings</Label>
                      <Input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Meal</Label>
                      <Select value={selectedMealType} onValueChange={(v) => setSelectedMealType(v as MealType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg text-sm">
                    <p className="font-medium">{selectedFood.name} × {servings}</p>
                    <p className="text-muted-foreground">
                      {Math.round(selectedFood.calories * parseFloat(servings || '0'))} kcal · 
                      P: {Math.round(Number(selectedFood.protein) * parseFloat(servings || '0'))}g · 
                      C: {Math.round(Number(selectedFood.carbs) * parseFloat(servings || '0'))}g · 
                      F: {Math.round(Number(selectedFood.fat) * parseFloat(servings || '0'))}g
                    </p>
                  </div>
                  
                  <Button onClick={handleLogMeal} className="w-full">
                    Log Food
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-3">
              <div>
                <Label>Food Name</Label>
                <Input
                  placeholder="e.g., Grilled Chicken Salad"
                  value={newFood.name}
                  onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newFood.calories}
                    onChange={(e) => setNewFood(prev => ({ ...prev, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newFood.protein}
                    onChange={(e) => setNewFood(prev => ({ ...prev, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood(prev => ({ ...prev, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newFood.fat}
                    onChange={(e) => setNewFood(prev => ({ ...prev, fat: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Serving Size</Label>
                  <Input
                    type="number"
                    value={newFood.serving_size}
                    onChange={(e) => setNewFood(prev => ({ ...prev, serving_size: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={newFood.serving_unit} onValueChange={(v) => setNewFood(prev => ({ ...prev, serving_unit: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">grams (g)</SelectItem>
                      <SelectItem value="ml">milliliters (ml)</SelectItem>
                      <SelectItem value="oz">ounces (oz)</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="tbsp">tablespoon</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleAddFood} 
                className="w-full"
                disabled={!newFood.name || !newFood.calories}
              >
                Add Food to Database
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Meal Logs by Type */}
      <div className="space-y-3">
        {MEAL_TYPES.map((type) => {
          const meals = getMealsByType(type);
          const mealCalories = meals.reduce((sum, m) => {
            if (m.food) return sum + Math.round(m.food.calories * m.servings);
            if (m.custom_calories) return sum + Math.round(m.custom_calories * m.servings);
            return sum;
          }, 0);
          
          return (
            <Card key={type}>
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm capitalize">{type}</CardTitle>
                  <span className="text-sm text-muted-foreground">{mealCalories} kcal</span>
                </div>
              </CardHeader>
              {meals.length > 0 && (
                <CardContent className="pt-0 px-4 pb-3">
                  <div className="space-y-2">
                    {meals.map((log) => {
                      const name = log.food?.name || log.custom_food_name || 'Unknown';
                      const calories = log.food 
                        ? Math.round(log.food.calories * log.servings)
                        : Math.round((log.custom_calories || 0) * log.servings);
                      
                      return (
                        <div key={log.id} className="flex justify-between items-center text-sm">
                          <span>
                            {name} {log.servings !== 1 && `× ${log.servings}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{calories} kcal</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteMealLog(log.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
