import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage, title, description }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  return (
    <div className="space-y-6">
      {/* Before/After Container */}
      <div
        className="relative aspect-[16/10] rounded-3xl overflow-hidden cursor-ew-resize select-none shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt="After"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* After Label */}
          <div className="absolute top-6 right-6 px-4 py-2 bg-primary rounded-full">
            <span className="text-sm font-bold text-white">After</span>
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Before Label */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-bold text-white">Before</span>
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-ew-resize"
            >
              <ChevronLeft className="w-6 h-6 text-foreground absolute left-2" strokeWidth={3} />
              <ChevronRight className="w-6 h-6 text-foreground absolute right-2" strokeWidth={3} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
