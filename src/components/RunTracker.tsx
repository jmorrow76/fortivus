import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Play, Pause, Square, MapPin, Clock, Footprints, Flame, TrendingUp } from 'lucide-react';
import { useRunTracker } from '@/hooks/useRunTracker';
import { format } from 'date-fns';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to recenter map when position changes
const RecenterMap = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

// Format seconds to mm:ss or hh:mm:ss
const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format pace (seconds per km) to mm:ss/km
const formatPace = (secondsPerKm: number): string => {
  if (secondsPerKm === 0 || !isFinite(secondsPerKm)) return '--:--';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format distance in meters to km with 2 decimal places
const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

export const RunTracker = () => {
  const {
    isTracking,
    activeRun,
    currentPosition,
    runHistory,
    isLoading,
    error,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    isPaused,
  } = useRunTracker();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleStop = async () => {
    await stopRun(notes);
    setNotes('');
    setShowStopDialog(false);
  };

  const mapCenter: [number, number] = currentPosition 
    ? [currentPosition.lat, currentPosition.lng]
    : [40.7128, -74.0060]; // Default to NYC

  const routeCoordinates = activeRun?.coordinates.map(c => [c.lat, c.lng] as [number, number]) || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Active Run Stats */}
      {isTracking && activeRun && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold font-mono">{formatDuration(activeRun.duration)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Footprints className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold font-mono">{formatDistance(activeRun.distance)} km</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold font-mono">{formatPace(activeRun.currentPace)}/km</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pace</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold font-mono">{Math.round((activeRun.distance / 1000) * 60)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Calories</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isTracking ? 'Live Tracking' : 'Run Tracker'}
          </CardTitle>
          {isPaused && <Badge variant="secondary">Paused</Badge>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-4">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {currentPosition && (
                <>
                  <Marker 
                    position={[currentPosition.lat, currentPosition.lng]} 
                    icon={defaultIcon}
                  />
                  <RecenterMap position={[currentPosition.lat, currentPosition.lng]} />
                </>
              )}
              {routeCoordinates.length > 1 && (
                <Polyline 
                  positions={routeCoordinates}
                  color="hsl(var(--primary))"
                  weight={4}
                />
              )}
            </MapContainer>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button size="lg" onClick={startRun} className="gap-2">
                <Play className="h-5 w-5" />
                Start Run
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button size="lg" variant="outline" onClick={resumeRun} className="gap-2">
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={pauseRun} className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button size="lg" variant="destructive" onClick={() => setShowStopDialog(true)} className="gap-2">
                  <Square className="h-5 w-5" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setShowHistory(!showHistory)}
          >
            Run History
            <Badge variant="outline">{runHistory.length} runs</Badge>
          </CardTitle>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : runHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No runs recorded yet</p>
            ) : (
              <div className="space-y-3">
                {runHistory.slice(0, 10).map((run) => (
                  <div 
                    key={run.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(run.started_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistance(run.distance_meters || 0)} km • {formatDuration(run.duration_seconds || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{formatPace(run.avg_pace_seconds_per_km || 0)}/km</p>
                      <p className="text-sm text-muted-foreground">{run.calories_burned} cal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Stop Run Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Run</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeRun && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatDistance(activeRun.distance)} km</p>
                  <p className="text-sm text-muted-foreground">Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDuration(activeRun.duration)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>Cancel</Button>
            <Button onClick={handleStop}>Save Run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
