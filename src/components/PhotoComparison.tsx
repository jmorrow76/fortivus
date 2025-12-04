import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Scale, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

interface PhotoComparisonProps {
  photos: ProgressPhoto[];
}

const PhotoComparison = ({ photos }: PhotoComparisonProps) => {
  const [beforeId, setBeforeId] = useState<string>("");
  const [afterId, setAfterId] = useState<string>("");

  const beforePhoto = photos.find((p) => p.id === beforeId);
  const afterPhoto = photos.find((p) => p.id === afterId);

  const weightDiff = beforePhoto?.weight && afterPhoto?.weight
    ? (afterPhoto.weight - beforePhoto.weight).toFixed(1)
    : null;

  if (photos.length < 2) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            You need at least 2 photos to use the comparison view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Before Photo</Label>
          <Select value={beforeId} onValueChange={setBeforeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a photo" />
            </SelectTrigger>
            <SelectContent>
              {photos.map((photo) => (
                <SelectItem key={photo.id} value={photo.id} disabled={photo.id === afterId}>
                  {format(new Date(photo.photo_date), "MMM d, yyyy")}
                  {photo.weight && ` - ${photo.weight} lbs`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>After Photo</Label>
          <Select value={afterId} onValueChange={setAfterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a photo" />
            </SelectTrigger>
            <SelectContent>
              {photos.map((photo) => (
                <SelectItem key={photo.id} value={photo.id} disabled={photo.id === beforeId}>
                  {format(new Date(photo.photo_date), "MMM d, yyyy")}
                  {photo.weight && ` - ${photo.weight} lbs`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <Card className="shadow-card overflow-hidden">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            {beforePhoto ? (
              <img
                src={beforePhoto.photo_url}
                alt="Before"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Select a "Before" photo</p>
            )}
          </div>
          {beforePhoto && (
            <CardContent className="p-4 border-t border-border">
              <p className="font-medium text-foreground mb-2">Before</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(beforePhoto.photo_date), "MMM d, yyyy")}
                </span>
                {beforePhoto.weight && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {beforePhoto.weight} lbs
                  </span>
                )}
              </div>
              {beforePhoto.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{beforePhoto.notes}</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* After */}
        <Card className="shadow-card overflow-hidden">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            {afterPhoto ? (
              <img
                src={afterPhoto.photo_url}
                alt="After"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Select an "After" photo</p>
            )}
          </div>
          {afterPhoto && (
            <CardContent className="p-4 border-t border-border">
              <p className="font-medium text-foreground mb-2">After</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(afterPhoto.photo_date), "MMM d, yyyy")}
                </span>
                {afterPhoto.weight && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {afterPhoto.weight} lbs
                  </span>
                )}
              </div>
              {afterPhoto.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{afterPhoto.notes}</p>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Stats Summary */}
      {beforePhoto && afterPhoto && (
        <Card className="shadow-card bg-secondary/50">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Time Span</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {Math.abs(
                    Math.ceil(
                      (new Date(afterPhoto.photo_date).getTime() -
                        new Date(beforePhoto.photo_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}{" "}
                  days
                </p>
              </div>
              {weightDiff && (
                <>
                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weight Change</p>
                    <p
                      className={`font-heading text-lg font-semibold ${
                        parseFloat(weightDiff) < 0 ? "text-green-600" : parseFloat(weightDiff) > 0 ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {parseFloat(weightDiff) > 0 ? "+" : ""}
                      {weightDiff} lbs
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoComparison;
