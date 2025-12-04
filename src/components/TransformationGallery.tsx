import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

import transformBefore1 from "@/assets/transform-before-1.jpg";
import transformAfter1 from "@/assets/transform-after-1.jpg";
import transformBefore2 from "@/assets/transform-before-2.jpg";
import transformAfter2 from "@/assets/transform-after-2.jpg";
import transformBefore3 from "@/assets/transform-before-3.jpg";
import transformAfter3 from "@/assets/transform-after-3.jpg";

interface Transformation {
  id: number;
  name: string;
  age: number;
  duration: string;
  weightLost: string;
  beforeImage: string;
  afterImage: string;
}

const transformations: Transformation[] = [
  {
    id: 1,
    name: "Greg H.",
    age: 48,
    duration: "8 months",
    weightLost: "42 lbs",
    beforeImage: transformBefore1,
    afterImage: transformAfter1,
  },
  {
    id: 2,
    name: "Paul W.",
    age: 54,
    duration: "10 months",
    weightLost: "55 lbs",
    beforeImage: transformBefore2,
    afterImage: transformAfter2,
  },
  {
    id: 3,
    name: "Marcus J.",
    age: 42,
    duration: "6 months",
    weightLost: "48 lbs",
    beforeImage: transformBefore3,
    afterImage: transformAfter3,
  },
];

const BeforeAfterSlider = ({ transformation }: { transformation: Transformation }) => {
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* After Image (Background) */}
        <img
          src={transformation.afterImage}
          alt={`${transformation.name} after`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderValue[0]}%` }}
        >
          <img
            src={transformation.beforeImage}
            alt={`${transformation.name} before`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${100 / (sliderValue[0] / 100)}%`, maxWidth: "none" }}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
          style={{ left: `${sliderValue[0]}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-muted-foreground" />
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <Badge className="absolute top-4 left-4 bg-background/80 text-foreground backdrop-blur-sm">
          Before
        </Badge>
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
          After
        </Badge>
      </div>

      {/* Slider Control */}
      <div className="p-4 bg-secondary/30">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          min={0}
          step={1}
          className="mb-4"
        />
        <div className="text-center">
          <h4 className="font-heading font-semibold text-lg">{transformation.name}, {transformation.age}</h4>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{transformation.duration}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-accent font-semibold">-{transformation.weightLost}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TransformationGallery = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Transformations</span>
          <h2 className="section-title">
            Real Results, Real <span className="text-accent">Transformations</span>
          </h2>
          <p className="section-description">
            Drag the slider to reveal the incredible transformations achieved by Fortivus members.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {transformations.map((transformation) => (
            <BeforeAfterSlider key={transformation.id} transformation={transformation} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Your transformation could be next. Join thousands of men who have already started their journey.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TransformationGallery;
