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
  Cookie, Droplets, ChevronLeft, ChevronRight, Flame, CheckCircle, Zap, Camera, Utensils
} from 'lucide-react';
import { useCalorieTracker, Food, MealType, MEAL_TYPES } from '@/hooks/useCalorieTracker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FoodPhotoAnalyzer } from '@/components/FoodPhotoAnalyzer';
import MenuAnalyzer from '@/components/MenuAnalyzer';

export function CalorieTracker() {
  const {
    foods,
    mealLogs,
    frequentFoods,
    macroGoals,
    loading,
    selectedDate,
    setSelectedDate,
    searchFoods,
    addFood,
    logMeal,
    addFoodAndLog,
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

  const handleQuickAdd = async (food: Food) => {
    await logMeal(food.id, 1, 'snack');
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
                  strokeDashoffset={251 - (251 * Math.min(totals.calories / macroGoals.calories, 1))}
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
                {macroGoals.calories - totals.calories > 0 
                  ? `${macroGoals.calories - totals.calories} kcal remaining`
                  : `${totals.calories - macroGoals.calories} kcal over goal`
                }
              </div>
              <MacroBar label="Protein" current={totals.protein} goal={macroGoals.protein} color="text-red-500" icon={Beef} />
              <MacroBar label="Carbs" current={totals.carbs} goal={macroGoals.carbs} color="text-amber-500" icon={Cookie} />
              <MacroBar label="Fat" current={totals.fat} goal={macroGoals.fat} color="text-blue-500" icon={Droplets} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add - Frequent Foods */}
      {frequentFoods.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {frequentFoods.map((food) => (
                <Button
                  key={food.id}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-2.5"
                  onClick={() => handleQuickAdd(food)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {food.name}
                  <span className="text-muted-foreground ml-1">({food.calories})</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          
          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="photo" className="gap-1.5 text-xs px-2">
                <Camera className="w-3.5 h-3.5" />
                AI Photo
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-1.5 text-xs px-2">
                <Utensils className="w-3.5 h-3.5" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs px-2">Search</TabsTrigger>
              <TabsTrigger value="add" className="text-xs px-2">Manual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photo" className="mt-4">
              <FoodPhotoAnalyzer 
                onLogMeal={logMeal}
                addFoodAndLog={addFoodAndLog}
                onClose={() => setIsLogDialogOpen(false)} 
              />
            </TabsContent>
            
            <TabsContent value="menu" className="mt-4">
              <MenuAnalyzer 
                dailyProgress={totals}
                macroGoals={macroGoals}
                onLogMeal={(item, mealType) => {
                  // Save food to database for all users, then log it
                  addFoodAndLog(
                    {
                      name: item.name,
                      calories: item.calories,
                      protein: item.protein,
                      carbs: item.carbs,
                      fat: item.fat,
                    },
                    1,
                    mealType as MealType
                  );
                }}
              />
            </TabsContent>
            
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
