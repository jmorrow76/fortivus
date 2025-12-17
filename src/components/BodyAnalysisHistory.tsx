import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { History, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3, GitCompare, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BodyAnalysisRecord {
  id: string;
  created_at: string;
  image_url: string | null;
  body_fat_percentage: number | null;
  body_fat_category: string | null;
  muscle_assessment: string | null;
  strengths: string[] | null;
  areas_to_improve: string[] | null;
  nutrition_recommendation: string | null;
  training_recommendation: string | null;
  recovery_recommendation: string | null;
  estimated_timeframe: string | null;
}

const BodyAnalysisHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<BodyAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('body_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Athletic':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Fit':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Average':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Above Average':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-emerald-600" />;
    return <TrendingUp className="w-4 h-4 text-amber-600" />;
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const getComparisonData = () => {
    if (selectedForCompare.length !== 2) return null;
    
    const first = history.find(h => h.id === selectedForCompare[0]);
    const second = history.find(h => h.id === selectedForCompare[1]);
    
    if (!first || !second) return null;
    
    // Sort by date (older first)
    const [older, newer] = first.created_at < second.created_at 
      ? [first, second] 
      : [second, first];
    
    return { older, newer };
  };

  const chartData = history
    .slice()
    .reverse()
    .map(record => ({
      date: format(new Date(record.created_at), 'MMM d'),
      bodyFat: record.body_fat_percentage,
    }));

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading history...
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-accent" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No saved analyses yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete an analysis and save it to track your progress over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const comparison = getComparisonData();

  return (
    <div className="space-y-6">
      {/* Progress Chart */}
      {history.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-accent" />
              Body Fat Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Body Fat']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {comparison && (
        <Card className="border-accent/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitCompare className="w-5 h-5 text-accent" />
              Photo Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Older Result */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  {format(new Date(comparison.older.created_at), 'MMM d, yyyy')}
                </p>
                {comparison.older.image_url && (
                  <img 
                    src={comparison.older.image_url} 
                    alt="Before" 
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground">
                    {comparison.older.body_fat_percentage}%
                  </div>
                  <Badge variant="outline" className={getCategoryColor(comparison.older.body_fat_category)}>
                    {comparison.older.body_fat_category}
                  </Badge>
                </div>
              </div>

              {/* Change */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  {comparison.older.body_fat_percentage && comparison.newer.body_fat_percentage && (
                    <>
                      <div className={`text-2xl font-bold ${
                        comparison.newer.body_fat_percentage < comparison.older.body_fat_percentage
                          ? 'text-emerald-600'
                          : comparison.newer.body_fat_percentage > comparison.older.body_fat_percentage
                          ? 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}>
                        {comparison.newer.body_fat_percentage - comparison.older.body_fat_percentage > 0 ? '+' : ''}
                        {(comparison.newer.body_fat_percentage - comparison.older.body_fat_percentage).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil(
                          (new Date(comparison.newer.created_at).getTime() - 
                           new Date(comparison.older.created_at).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Newer Result */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  {format(new Date(comparison.newer.created_at), 'MMM d, yyyy')}
                </p>
                {comparison.newer.image_url && (
                  <img 
                    src={comparison.newer.image_url} 
                    alt="After" 
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {comparison.newer.body_fat_percentage}%
                  </div>
                  <Badge variant="outline" className={getCategoryColor(comparison.newer.body_fat_category)}>
                    {comparison.newer.body_fat_category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-accent" />
              Analysis History ({history.length})
            </CardTitle>
            {history.length >= 2 && (
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (compareMode) setSelectedForCompare([]);
                }}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {compareMode ? 'Done' : 'Compare'}
              </Button>
            )}
          </div>
          {compareMode && (
            <p className="text-sm text-muted-foreground mt-2">
              Select two analyses to compare ({selectedForCompare.length}/2 selected)
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((record, index) => {
            const isExpanded = expandedId === record.id;
            const isSelected = selectedForCompare.includes(record.id);
            const previousRecord = history[index + 1];

            return (
              <div
                key={record.id}
                className={`border rounded-lg transition-all ${
                  isSelected ? 'border-accent bg-accent/5' : 'border-border'
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => {
                    if (compareMode) {
                      toggleCompareSelection(record.id);
                    } else {
                      setExpandedId(isExpanded ? null : record.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {compareMode && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-accent bg-accent' : 'border-muted-foreground'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    )}
                    {/* Thumbnail */}
                    {record.image_url ? (
                      <img 
                        src={record.image_url} 
                        alt="Analysis" 
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {format(new Date(record.created_at), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{record.body_fat_percentage}%</span>
                        {previousRecord && record.body_fat_percentage && previousRecord.body_fat_percentage && (
                          getTrendIcon(record.body_fat_percentage, previousRecord.body_fat_percentage)
                        )}
                      </div>
                      <Badge variant="outline" className={getCategoryColor(record.body_fat_category)}>
                        {record.body_fat_category}
                      </Badge>
                    </div>
                    {!compareMode && (
                      isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )
                    )}
                  </div>
                </div>

                {isExpanded && !compareMode && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {/* Show full image if available */}
                    {record.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={record.image_url} 
                          alt="Body analysis" 
                          className="max-h-64 object-contain rounded-lg"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">{record.muscle_assessment}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {record.strengths && record.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-emerald-600 mb-1">Strengths</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {record.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.areas_to_improve && record.areas_to_improve.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-amber-600 mb-1">Areas to Improve</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {record.areas_to_improve.map((a, i) => (
                              <li key={i}>• {a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {record.nutrition_recommendation && (
                        <div className="text-sm">
                          <span className="font-medium">Nutrition:</span>{' '}
                          <span className="text-muted-foreground">{record.nutrition_recommendation}</span>
                        </div>
                      )}
                      {record.training_recommendation && (
                        <div className="text-sm">
                          <span className="font-medium">Training:</span>{' '}
                          <span className="text-muted-foreground">{record.training_recommendation}</span>
                        </div>
                      )}
                      {record.recovery_recommendation && (
                        <div className="text-sm">
                          <span className="font-medium">Recovery:</span>{' '}
                          <span className="text-muted-foreground">{record.recovery_recommendation}</span>
                        </div>
                      )}
                    </div>

                    {record.estimated_timeframe && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Estimated timeframe:</strong> {record.estimated_timeframe}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyAnalysisHistory;
