import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Play, AlertTriangle, CheckCircle, User, Heart, Plus, ListPlus, Trash2, FolderOpen } from 'lucide-react';
import { useExerciseFavorites } from '@/hooks/useExerciseFavorites';
import { useAuth } from '@/hooks/useAuth';

// Exercise video data with YouTube tutorial links (men demonstrators only)
const exerciseVideos = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscle_group: 'chest',
    youtubeId: '4Y2ZdHCOXok',
    thumbnail: 'https://img.youtube.com/vi/4Y2ZdHCOXok/mqdefault.jpg',
    formTips: [
      'Keep shoulder blades retracted and depressed',
      'Maintain a slight arch in your lower back',
      'Grip the bar slightly wider than shoulder width',
      'Lower the bar to mid-chest level',
      'Drive feet into the floor for stability'
    ],
    commonMistakes: [
      'Flaring elbows too wide (increases shoulder strain)',
      'Bouncing the bar off chest',
      'Lifting hips off the bench',
      'Not using a full range of motion',
      'Incorrect grip width'
    ],
    over40Modifications: [
      'Consider using a closer grip to reduce shoulder stress',
      'Use controlled tempo (3 seconds down, 1 second up)',
      'Start with lighter weight to warm up thoroughly',
      'Use dumbbells if shoulder mobility is limited',
      'Stop 1-2 reps short of failure to protect joints'
    ]
  },
  {
    id: '2',
    name: 'Barbell Squat',
    muscle_group: 'quadriceps',
    youtubeId: 'ultWZbUMPL8',
    thumbnail: 'https://img.youtube.com/vi/ultWZbUMPL8/mqdefault.jpg',
    formTips: [
      'Keep chest up and core braced',
      'Push knees out in line with toes',
      'Descend until thighs are parallel or below',
      'Drive through mid-foot on the way up',
      'Maintain neutral spine throughout'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Rounding lower back at bottom',
      'Rising onto toes',
      'Looking down during the lift',
      'Not hitting proper depth'
    ],
    over40Modifications: [
      'Elevate heels on plates if ankle mobility is limited',
      'Use box squats to control depth and reduce knee stress',
      'Prioritize mobility work before squatting',
      'Consider goblet squats as an alternative',
      'Limit maximum weight to 80% of capacity'
    ]
  },
  {
    id: '3',
    name: 'Deadlift',
    muscle_group: 'back',
    youtubeId: 'op9kVnSso6Q',
    thumbnail: 'https://img.youtube.com/vi/op9kVnSso6Q/mqdefault.jpg',
    formTips: [
      'Keep the bar close to your body throughout',
      'Engage lats by pulling shoulders back',
      'Drive through heels and mid-foot',
      'Lock out by squeezing glutes at top',
      'Maintain neutral spine position'
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Starting with hips too high or too low',
      'Letting the bar drift away from body',
      'Hyperextending at lockout',
      'Jerking the bar off the floor'
    ],
    over40Modifications: [
      'Use trap bar for reduced lower back stress',
      'Pull from blocks or elevated surface',
      'Focus on hip hinge mobility beforehand',
      'Keep rep ranges moderate (5-8 reps)',
      'Consider Romanian deadlifts as alternative'
    ]
  },
  {
    id: '4',
    name: 'Overhead Press',
    muscle_group: 'shoulders',
    youtubeId: '_RlRDWO2jfg',
    thumbnail: 'https://img.youtube.com/vi/_RlRDWO2jfg/mqdefault.jpg',
    formTips: [
      'Start with bar at collar bone level',
      'Brace core and squeeze glutes',
      'Press the bar in a straight line overhead',
      'Push head through once bar clears',
      'Lock out with arms fully extended'
    ],
    commonMistakes: [
      'Excessive lower back arch',
      'Pressing the bar too far forward',
      'Not engaging core properly',
      'Flaring elbows too wide',
      'Using leg drive (unless push press)'
    ],
    over40Modifications: [
      'Use seated variation if lower back is an issue',
      'Warm up rotator cuff thoroughly',
      'Use dumbbells for natural arm path',
      'Reduce weight and increase reps',
      'Consider landmine press as shoulder-friendly alternative'
    ]
  },
  {
    id: '5',
    name: 'Barbell Row',
    muscle_group: 'back',
    youtubeId: 'kBWAon7ItDw',
    thumbnail: 'https://img.youtube.com/vi/kBWAon7ItDw/mqdefault.jpg',
    formTips: [
      'Hinge at hips with slight knee bend',
      'Keep back flat and parallel to floor',
      'Pull bar to lower chest/upper abs',
      'Squeeze shoulder blades at top',
      'Control the weight on the way down'
    ],
    commonMistakes: [
      'Using too much body English',
      'Rounding the upper back',
      'Not pulling high enough',
      'Standing too upright',
      'Rushing the eccentric portion'
    ],
    over40Modifications: [
      'Use chest-supported row for lower back relief',
      'Try single-arm dumbbell rows',
      'Keep weights moderate with higher reps',
      'Use straps if grip is limiting',
      'Focus on mind-muscle connection'
    ]
  },
  {
    id: '6',
    name: 'Pull-up',
    muscle_group: 'back',
    youtubeId: 'XB_7En-zf_M',
    thumbnail: 'https://img.youtube.com/vi/XB_7En-zf_M/mqdefault.jpg',
    formTips: [
      'Start from a dead hang position',
      'Engage lats before pulling',
      'Drive elbows down toward hips',
      'Get chin over bar at top',
      'Control the descent fully'
    ],
    commonMistakes: [
      'Kipping or using momentum',
      'Not going through full range of motion',
      'Shrugging shoulders at bottom',
      'Rushing the movement',
      'Neglecting the eccentric'
    ],
    over40Modifications: [
      'Use band assistance to build strength',
      'Try lat pulldowns as progression',
      'Focus on negatives (slow lowering)',
      'Use neutral grip to reduce shoulder strain',
      'Limit to bodyweight only'
    ]
  },
  {
    id: '7',
    name: 'Dumbbell Curl',
    muscle_group: 'biceps',
    youtubeId: 'sAq_ocpRh_I',
    thumbnail: 'https://img.youtube.com/vi/sAq_ocpRh_I/mqdefault.jpg',
    formTips: [
      'Keep elbows pinned to your sides',
      'Supinate wrists as you curl up',
      'Squeeze biceps at the top',
      'Control the weight on the way down',
      'Avoid swinging the body'
    ],
    commonMistakes: [
      'Using momentum to swing weights',
      'Moving elbows forward',
      'Not getting full contraction',
      'Going too heavy with poor form',
      'Rushing through reps'
    ],
    over40Modifications: [
      'Use incline bench to reduce cheating',
      'Try hammer curls for joint comfort',
      'Focus on time under tension',
      'Use lighter weights with perfect form',
      'Add forearm stretching between sets'
    ]
  },
  {
    id: '8',
    name: 'Tricep Pushdown',
    muscle_group: 'triceps',
    youtubeId: 'REaI4rSuUhM',
    thumbnail: 'https://img.youtube.com/vi/REaI4rSuUhM/mqdefault.jpg',
    formTips: [
      'Keep elbows locked at your sides',
      'Fully extend arms at the bottom',
      'Squeeze triceps at full extension',
      'Control the return movement',
      'Slight forward lean is okay'
    ],
    commonMistakes: [
      'Flaring elbows outward',
      'Using too much shoulder movement',
      'Not achieving full lockout',
      'Going too heavy',
      'Hunching shoulders'
    ],
    over40Modifications: [
      'Use rope attachment for natural movement',
      'Keep weights moderate',
      'Try overhead extensions for variety',
      'Focus on the squeeze, not the weight',
      'Warm up elbows before heavy sets'
    ]
  },
  {
    id: '9',
    name: 'Leg Press',
    muscle_group: 'quadriceps',
    youtubeId: 'yZmx_Ac3880',
    thumbnail: 'https://img.youtube.com/vi/yZmx_Ac3880/mqdefault.jpg',
    formTips: [
      'Position feet shoulder-width apart',
      'Lower until knees are at 90 degrees',
      'Press through heels and mid-foot',
      'Don\'t lock out knees completely',
      'Keep lower back pressed into pad'
    ],
    commonMistakes: [
      'Going too deep (lower back lifts)',
      'Fully locking out knees',
      'Feet positioned too high or low',
      'Holding breath throughout',
      'Bouncing at the bottom'
    ],
    over40Modifications: [
      'Use moderate depth to protect knees',
      'Keep weight in a manageable range',
      'Focus on controlled tempo',
      'Warm up with light sets first',
      'Consider single-leg variations'
    ]
  },
  {
    id: '10',
    name: 'Romanian Deadlift',
    muscle_group: 'hamstrings',
    youtubeId: '2SHsk9AzdjA',
    thumbnail: 'https://img.youtube.com/vi/2SHsk9AzdjA/mqdefault.jpg',
    formTips: [
      'Keep slight bend in knees throughout',
      'Push hips back, not down',
      'Keep bar close to legs',
      'Feel stretch in hamstrings',
      'Squeeze glutes at the top'
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Bending knees too much (becomes squat)',
      'Bar drifting away from body',
      'Not hinging at hips properly',
      'Going too heavy too soon'
    ],
    over40Modifications: [
      'Use dumbbells for easier grip',
      'Limit range to comfortable stretch',
      'Keep weights moderate',
      'Focus on hamstring connection',
      'Single-leg RDLs for balance work'
    ]
  },
  {
    id: '11',
    name: 'Plank',
    muscle_group: 'core',
    youtubeId: 'pSHjTRCQxIw',
    thumbnail: 'https://img.youtube.com/vi/pSHjTRCQxIw/mqdefault.jpg',
    formTips: [
      'Keep body in a straight line',
      'Engage core by pulling belly button in',
      'Don\'t let hips sag or pike up',
      'Keep neck neutral',
      'Breathe steadily throughout'
    ],
    commonMistakes: [
      'Sagging hips toward the floor',
      'Raising hips too high',
      'Holding breath',
      'Looking up or down',
      'Letting shoulders collapse'
    ],
    over40Modifications: [
      'Start with shorter holds (20-30 sec)',
      'Use knees down for easier variation',
      'Place forearms on elevated surface',
      'Focus on quality over duration',
      'Add side planks for variety'
    ]
  },
  {
    id: '12',
    name: 'Lateral Raise',
    muscle_group: 'shoulders',
    youtubeId: 'XPPfnSEATJA',
    thumbnail: 'https://img.youtube.com/vi/XPPfnSEATJA/mqdefault.jpg',
    formTips: [
      'Lead with elbows, not hands',
      'Raise arms to shoulder height',
      'Slight forward lean for better activation',
      'Control the weight down slowly',
      'Keep slight bend in elbows'
    ],
    commonMistakes: [
      'Using too much momentum',
      'Raising arms too high',
      'Shrugging shoulders up',
      'Going too heavy',
      'Swinging the body'
    ],
    over40Modifications: [
      'Use cables for constant tension',
      'Keep weights light (8-15 lbs)',
      'Focus on high reps (15-20)',
      'One arm at a time for focus',
      'Warm up rotator cuff first'
    ]
  },
  {
    id: '13',
    name: 'Hip Thrust',
    muscle_group: 'glutes',
    youtubeId: 'xDmFkJxPzeM',
    thumbnail: 'https://img.youtube.com/vi/xDmFkJxPzeM/mqdefault.jpg',
    formTips: [
      'Position upper back on bench at shoulder blade level',
      'Feet flat, knees at 90 degrees at top',
      'Drive through heels to lift hips',
      'Squeeze glutes hard at the top',
      'Keep chin tucked throughout'
    ],
    commonMistakes: [
      'Hyperextending lower back at top',
      'Feet positioned too close or far',
      'Not achieving full hip extension',
      'Rushing through reps',
      'Looking up instead of forward'
    ],
    over40Modifications: [
      'Start with bodyweight to master form',
      'Use a pad on the barbell for comfort',
      'Focus on mind-muscle connection',
      'Keep reps controlled and moderate',
      'Single-leg variations for imbalances'
    ]
  },
  {
    id: '14',
    name: 'Glute Bridge',
    muscle_group: 'glutes',
    youtubeId: 'OUgsJ8-Vi0E',
    thumbnail: 'https://img.youtube.com/vi/OUgsJ8-Vi0E/mqdefault.jpg',
    formTips: [
      'Lie flat with knees bent, feet flat',
      'Push through heels to raise hips',
      'Squeeze glutes at the top',
      'Keep core engaged throughout',
      'Lower with control'
    ],
    commonMistakes: [
      'Pushing through toes instead of heels',
      'Not squeezing glutes at top',
      'Arching lower back excessively',
      'Letting knees cave inward',
      'Moving too fast'
    ],
    over40Modifications: [
      'Great low-impact glute activation',
      'Add band above knees for extra work',
      'Hold at top for 2-3 seconds',
      'Perfect warm-up before squats/deadlifts',
      'Single-leg version for progression'
    ]
  },
  {
    id: '15',
    name: 'Cable Pull-Through',
    muscle_group: 'glutes',
    youtubeId: 'ArMc2VZoL3k',
    thumbnail: 'https://img.youtube.com/vi/ArMc2VZoL3k/mqdefault.jpg',
    formTips: [
      'Face away from cable machine',
      'Hinge at hips, not knees',
      'Keep arms straight throughout',
      'Drive hips forward to stand',
      'Squeeze glutes at the top'
    ],
    commonMistakes: [
      'Squatting instead of hinging',
      'Bending arms to pull weight',
      'Rounding the lower back',
      'Not fully extending hips',
      'Using too much weight'
    ],
    over40Modifications: [
      'Excellent for learning hip hinge pattern',
      'Low spinal load alternative to deadlifts',
      'Keep weight moderate, focus on form',
      'Great for warming up posterior chain',
      'Pause at top for extra glute activation'
    ]
  },
  {
    id: '16',
    name: 'Standing Calf Raise',
    muscle_group: 'calves',
    youtubeId: 'gwLzBJYoWlI',
    thumbnail: 'https://img.youtube.com/vi/gwLzBJYoWlI/mqdefault.jpg',
    formTips: [
      'Stand on edge of step or platform',
      'Rise up onto balls of feet',
      'Squeeze calves hard at the top',
      'Lower heels below platform level',
      'Keep knees straight but not locked'
    ],
    commonMistakes: [
      'Bouncing at the bottom',
      'Not getting full range of motion',
      'Bending knees during movement',
      'Going too fast',
      'Using too much weight'
    ],
    over40Modifications: [
      'Hold onto something for balance',
      'Slow tempo (3 seconds up and down)',
      'High reps (15-25) for calf development',
      'Alternate straight and bent knee versions',
      'Stretch calves between sets'
    ]
  },
  {
    id: '17',
    name: 'Seated Calf Raise',
    muscle_group: 'calves',
    youtubeId: 'JbyjNymZOt0',
    thumbnail: 'https://img.youtube.com/vi/JbyjNymZOt0/mqdefault.jpg',
    formTips: [
      'Sit with balls of feet on platform',
      'Knees bent at 90 degrees',
      'Push through balls of feet',
      'Full range of motion is key',
      'Squeeze at the top, stretch at bottom'
    ],
    commonMistakes: [
      'Not using full range of motion',
      'Bouncing the weight',
      'Going too heavy',
      'Rushing through reps',
      'Leaning back during lift'
    ],
    over40Modifications: [
      'Targets soleus muscle (bent knee)',
      'Use moderate weight, higher reps',
      'Pause at top and bottom',
      'Great for Achilles tendon health',
      'Combine with standing raises for complete development'
    ]
  },
  {
    id: '18',
    name: 'Farmer\'s Walk',
    muscle_group: 'forearms',
    youtubeId: 'Fkzk_RqlYig',
    thumbnail: 'https://img.youtube.com/vi/Fkzk_RqlYig/mqdefault.jpg',
    formTips: [
      'Pick up heavy dumbbells or kettlebells',
      'Stand tall with shoulders back',
      'Take short, controlled steps',
      'Keep core braced throughout',
      'Grip as hard as possible'
    ],
    commonMistakes: [
      'Leaning forward or to sides',
      'Taking steps too long',
      'Shrugging shoulders up',
      'Not gripping hard enough',
      'Going too light'
    ],
    over40Modifications: [
      'Start with moderate weight, build up',
      'Focus on posture and core engagement',
      'Great for grip strength and stability',
      'Walk for distance or time (30-60 seconds)',
      'Excellent functional strength builder'
    ]
  },
  {
    id: '19',
    name: 'Wrist Curl',
    muscle_group: 'forearms',
    youtubeId: '7ac_qmBjXKg',
    thumbnail: 'https://img.youtube.com/vi/7ac_qmBjXKg/mqdefault.jpg',
    formTips: [
      'Rest forearms on thighs, wrists over knees',
      'Let barbell/dumbbells roll to fingers',
      'Curl wrists up, squeezing forearms',
      'Control the negative portion',
      'Keep forearms stationary'
    ],
    commonMistakes: [
      'Moving forearms during curl',
      'Using momentum',
      'Going too heavy',
      'Not using full range of motion',
      'Rushing through reps'
    ],
    over40Modifications: [
      'Use light weight, high reps (15-20)',
      'Great for wrist and grip health',
      'Do both palm-up and palm-down versions',
      'Stretch wrists between sets',
      'Start with dumbbells for natural movement'
    ]
  },
  {
    id: '20',
    name: 'Reverse Wrist Curl',
    muscle_group: 'forearms',
    youtubeId: 'F7_FPhCREpM',
    thumbnail: 'https://img.youtube.com/vi/F7_FPhCREpM/mqdefault.jpg',
    formTips: [
      'Rest forearms on thighs, palms down',
      'Extend wrists upward against resistance',
      'Keep forearms pressed into thighs',
      'Control both up and down phases',
      'Focus on forearm extensor contraction'
    ],
    commonMistakes: [
      'Lifting forearms off thighs',
      'Using too much weight',
      'Partial range of motion',
      'Moving too fast',
      'Neglecting this exercise entirely'
    ],
    over40Modifications: [
      'Essential for elbow health and balance',
      'Prevents tennis elbow issues',
      'Use very light weight initially',
      'High reps (15-25) work best',
      'Pair with regular wrist curls'
    ]
  },
  {
    id: '21',
    name: 'Dead Hang',
    muscle_group: 'forearms',
    youtubeId: 'dL9ZzqtHBvY',
    thumbnail: 'https://img.youtube.com/vi/dL9ZzqtHBvY/mqdefault.jpg',
    formTips: [
      'Grip bar with overhand grip',
      'Let body hang with arms fully extended',
      'Engage shoulders slightly (active hang)',
      'Breathe steadily throughout',
      'Hold as long as possible'
    ],
    commonMistakes: [
      'Gripping too narrow or wide',
      'Completely relaxing shoulders',
      'Holding breath',
      'Swinging or kipping',
      'Giving up too early'
    ],
    over40Modifications: [
      'Excellent for grip strength and shoulder health',
      'Start with shorter holds (15-30 seconds)',
      'Great for spinal decompression',
      'Use mixed grip if needed',
      'Progress to single-arm hangs over time'
    ]
  }
];

const muscleGroups = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'forearms', 'core'];

const ExerciseVideoLibrary = () => {
  const { user } = useAuth();
  const { 
    playlists, 
    toggleFavorite, 
    isFavorited, 
    createPlaylist, 
    deletePlaylist,
    addToPlaylist, 
    removeFromPlaylist,
    getPlaylistVideos,
    isInPlaylist
  } = useExerciseFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<typeof exerciseVideos[0] | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const getExerciseById = (id: string) => exerciseVideos.find(e => e.id === id);

  const filteredExercises = exerciseVideos.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const favoriteExercises = exerciseVideos.filter(ex => isFavorited(ex.id));

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const playlistVideos = selectedPlaylistId 
    ? getPlaylistVideos(selectedPlaylistId).map(id => getExerciseById(id)).filter(Boolean)
    : [];

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
  };

  const renderExerciseCard = (exercise: typeof exerciseVideos[0], showRemoveFromPlaylist = false) => (
    <Card 
      key={exercise.id} 
      className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
    >
      <div className="relative aspect-video" onClick={() => setSelectedExercise(exercise)}>
        <img 
          src={exercise.thumbnail} 
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 capitalize">
          {exercise.muscle_group}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1" onClick={() => setSelectedExercise(exercise)}>
            <h3 className="font-semibold">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Form tips • Common mistakes • 40+ modifications
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(exercise.id);
              }}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited(exercise.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            {user && playlists.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ListPlus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {playlists.map(playlist => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInPlaylist(playlist.id, exercise.id)) {
                          removeFromPlaylist(playlist.id, exercise.id);
                        } else {
                          addToPlaylist(playlist.id, exercise.id);
                        }
                      }}
                    >
                      {isInPlaylist(playlist.id, exercise.id) ? '✓ ' : ''}{playlist.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showRemoveFromPlaylist && selectedPlaylistId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromPlaylist(selectedPlaylistId, exercise.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Tabs for All / Favorites / Playlists */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Favorites {favoriteExercises.length > 0 && `(${favoriteExercises.length})`}
            </TabsTrigger>
            <TabsTrigger value="playlists" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Playlists {playlists.length > 0 && `(${playlists.length})`}
            </TabsTrigger>
          </TabsList>
          
          {user && activeTab === 'playlists' && (
            <Button onClick={() => setShowCreatePlaylist(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          )}
        </div>

        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercise tutorials..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="w-full">
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
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => renderExerciseCard(exercise))}
          </div>

          {filteredExercises.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          {!user ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to save favorites</h3>
                <p className="text-muted-foreground">
                  Create an account to save your favorite exercises for quick access.
                </p>
              </CardContent>
            </Card>
          ) : favoriteExercises.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
                  Click the heart icon on any exercise to add it to your favorites.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteExercises.map(exercise => renderExerciseCard(exercise))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="mt-4">
          {!user ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to create playlists</h3>
                <p className="text-muted-foreground">
                  Create an account to organize exercises into custom playlists.
                </p>
              </CardContent>
            </Card>
          ) : selectedPlaylistId && selectedPlaylist ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlaylistId(null)}>
                    ← Back
                  </Button>
                  <div>
                    <h3 className="font-semibold">{selectedPlaylist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlistVideos.length} exercises</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    deletePlaylist(selectedPlaylistId);
                    setSelectedPlaylistId(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Playlist
                </Button>
              </div>
              
              {playlistVideos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ListPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Playlist is empty</h3>
                    <p className="text-muted-foreground">
                      Add exercises from the All Exercises tab using the playlist icon.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlistVideos.map(exercise => exercise && renderExerciseCard(exercise, true))}
                </div>
              )}
            </div>
          ) : playlists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a playlist to organize your favorite exercises.
                </p>
                <Button onClick={() => setShowCreatePlaylist(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Playlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map(playlist => (
                <Card 
                  key={playlist.id} 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedPlaylistId(playlist.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {playlist.itemCount || 0} exercises
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name to organize your exercises.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
              Create Playlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Detail Modal */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedExercise.name}
                  <Badge variant="secondary" className="capitalize">
                    {selectedExercise.muscle_group}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => toggleFavorite(selectedExercise.id)}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isFavorited(selectedExercise.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* YouTube Video Embed */}
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedExercise.youtubeId}`}
                    title={selectedExercise.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Form Tips */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Proper Form Tips
                    </CardTitle>
                    <CardDescription>
                      Key cues to maximize effectiveness and safety
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedExercise.formTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-sm font-medium shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Common Mistakes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Common Mistakes to Avoid
                    </CardTitle>
                    <CardDescription>
                      What to watch out for to prevent injury
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedExercise.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-sm font-medium shrink-0">
                            ✕
                          </span>
                          <span className="text-sm">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Age-Appropriate Modifications */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      40+ Modifications
                    </CardTitle>
                    <CardDescription>
                      Age-appropriate adaptations for longevity and joint health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedExercise.over40Modifications.map((mod, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                            ★
                          </span>
                          <span className="text-sm">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseVideoLibrary;
