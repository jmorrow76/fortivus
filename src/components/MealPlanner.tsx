import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, CalendarDays, ChevronLeft, ChevronRight, 
  Copy, Trash2, CheckCircle, Utensils
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Food, MealType, MEAL_TYPES } from '@/hooks/useCalorieTracker';
import { format, addDays, startOfWeek, isSameDay, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PlannedMeal {
  id: string;
  food_id: string | null;
  food?: Food;
  custom_food_name: string | null;
  custom_calories: number | null;
  servings: number;
  meal_type: string;
  log_date: string;
}

export function MealPlanner() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekMeals, setWeekMeals] = useState<Record<string, PlannedMeal[]>>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [servings, setServings] = useState('1');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchWeekMeals = useCallback(async () => {
    if (!user) return;
    
    const startDate = format(weekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('created_at');
    
    if (error) {
      console.error('Error fetching week meals:', error);
      return;
    }
    
    // Fetch food details
    const foodIds = data?.filter(m => m.food_id).map(m => m.food_id) || [];
    let foodsMap: Record<string, Food> = {};
    
    if (foodIds.length > 0) {
      const { data: foodsData } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds);
      
      foodsMap = (foodsData || []).reduce((acc, f) => {
        acc[f.id] = f as Food;
        return acc;
      }, {} as Record<string, Food>);
    }
    
    // Group by date
    const grouped: Record<string, PlannedMeal[]> = {};
    (data || []).forEach(log => {
      const dateKey = log.log_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        ...log,
        food: log.food_id ? foodsMap[log.food_id] : undefined
      } as PlannedMeal);
    });
    
    setWeekMeals(grouped);
  }, [user, weekStart]);

  const fetchFoods = useCallback(async (search?: string) => {
    let query = supabase
      .from('foods')
      .select('*')
      .order('is_verified', { ascending: false })
      .order('name')
      .limit(50);
    
    if (search && search.length >= 2) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data } = await query;
    setFoods((data || []) as Food[]);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFoods();
      await fetchWeekMeals();
      setLoading(false);
    };
    if (user) load();
  }, [user, fetchFoods, fetchWeekMeals]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      fetchFoods(query);
    } else {
      fetchFoods();
    }
  };

  const handlePlanMeal = async () => {
    if (!user || !selectedFood || !selectedDay) return;
    
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        food_id: selectedFood.id,
        servings: parseFloat(servings) || 1,
        meal_type: selectedMealType,
        log_date: dateStr
      });
    
    if (error) {
      toast.error('Failed to plan meal');
      return;
    }
    
    toast.success('Meal planned');
    setIsDialogOpen(false);
    setSelectedFood(null);
    setServings('1');
    setSearchQuery('');
    fetchWeekMeals();
  };

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId);
    
    if (error) {
      toast.error('Failed to delete');
      return;
    }
    
    toast.success('Meal removed');
    fetchWeekMeals();
  };

  const handleCopyDay = async (sourceDate: Date) => {
    if (!user) return;
    
    const sourceDateStr = format(sourceDate, 'yyyy-MM-dd');
    const targetDate = addDays(sourceDate, 7);
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    const mealsToday = weekMeals[sourceDateStr] || [];
    if (mealsToday.length === 0) {
      toast.error('No meals to copy');
      return;
    }
    
    const newMeals = mealsToday.map(meal => ({
      user_id: user.id,
      food_id: meal.food_id,
      custom_food_name: meal.custom_food_name,
      custom_calories: meal.custom_calories,
      servings: meal.servings,
      meal_type: meal.meal_type,
      log_date: targetDateStr
    }));
    
    const { error } = await supabase
      .from('meal_logs')
      .insert(newMeals);
    
    if (error) {
      toast.error('Failed to copy meals');
      return;
    }
    
    toast.success(`Copied to ${format(targetDate, 'MMM d')}`);
  };

  const changeWeek = (direction: number) => {
    setWeekStart(prev => addDays(prev, direction * 7));
  };

  const getDayCalories = (dateStr: string) => {
    const meals = weekMeals[dateStr] || [];
    return meals.reduce((sum, m) => {
      if (m.food) return sum + Math.round(m.food.calories * m.servings);
      if (m.custom_calories) return sum + Math.round(m.custom_calories * m.servings);
      return sum;
    }, 0);
  };

  const openPlanDialog = (day: Date) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

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
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent" />
              Meal Planner
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayMeals = weekMeals[dateStr] || [];
          const totalCalories = getDayCalories(dateStr);
          const isPast = !isToday(day) && !isFuture(day);
          
          return (
            <Card 
              key={dateStr} 
              className={cn(
                "min-h-[180px]",
                isToday(day) && "ring-2 ring-accent",
                isPast && "opacity-60"
              )}
            >
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                    <p className={cn(
                      "text-sm font-semibold",
                      isToday(day) && "text-accent"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {totalCalories} kcal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-3 space-y-1">
                {dayMeals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No meals
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[100px] overflow-y-auto">
                    {dayMeals.map((meal) => (
                      <div 
                        key={meal.id} 
                        className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {meal.food?.name || meal.custom_food_name}
                          </p>
                          <p className="text-muted-foreground capitalize">{meal.meal_type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => openPlanDialog(day)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                  {dayMeals.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopyDay(day)}
                      title="Copy to next week"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Meal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Plan Meal for {selectedDay && format(selectedDay, 'EEEE, MMM d')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ScrollArea className="h-40">
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
                    <label className="text-sm font-medium">Servings</label>
                    <Input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Meal</label>
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
                    {Math.round(selectedFood.calories * parseFloat(servings || '0'))} kcal
                  </p>
                </div>
                
                <Button onClick={handlePlanMeal} className="w-full">
                  Plan Meal
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
