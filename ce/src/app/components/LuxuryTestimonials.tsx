import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, Play, ChevronLeft, ChevronRight, Award, Building2, Users } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  image: string;
  rating: number;
  text: string;
  project: string;
  videoUrl?: string;
  type: 'residential' | 'commercial' | 'architect';
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Kwame Mensah',
    title: 'CEO',
    company: 'Mensah Properties Ltd',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 5,
    text: 'Cofkans transformed our luxury hotel with their exquisite crystal chandeliers. The attention to detail and quality of craftsmanship is unmatched in Ghana. Every guest compliments our lighting!',
    project: 'Accra Luxury Hotel - 200+ Fixtures',
    type: 'commercial',
  },
  {
    id: 2,
    name: 'Ama Osei',
    title: 'Principal Architect',
    company: 'Osei Design Studio',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    rating: 5,
    text: 'As an architect, I demand perfection. Cofkans consistently delivers premium quality lighting solutions that elevate every project. Their technical expertise and luxury product range are exceptional.',
    project: 'Multiple High-End Residential Projects',
    type: 'architect',
  },
  {
    id: 3,
    name: 'Dr. Kofi Asante',
    title: 'Homeowner',
    company: 'East Legon Residence',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    rating: 5,
    text: 'From consultation to installation, Cofkans provided white-glove service. The smart home integration is seamless, and the designer pendants are absolute showstoppers. Worth every pesewa!',
    project: 'Smart Home Renovation',
    type: 'residential',
  },
  {
    id: 4,
    name: 'Yaw Boateng',
    title: 'Director of Operations',
    company: 'Premium Office Complex',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    rating: 5,
    text: 'Cofkans equipped our entire office complex with energy-efficient LED solutions. Professional service, competitive trade pricing, and outstanding after-sales support. Highly recommended!',
    project: 'Corporate Office - 500+ Units',
    type: 'commercial',
  },
];

export function LuxuryTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return testimonials.length - 1;
      if (nextIndex >= testimonials.length) return 0;
      return nextIndex;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'architect':
        return Building2;
      case 'commercial':
        return Award;
      default:
        return Users;
    }
  };

  return (
    <div className="w-full py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2} />
            <span className="text-sm font-bold text-primary">Client Testimonials</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-luxury)' }}>
            Trusted by Ghana's Elite
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Architects, developers, and discerning homeowners choose Cofkans for uncompromising quality
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Image Side */}
                <div className="relative">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted relative">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                        {(() => {
                          const Icon = getTypeIcon(currentTestimonial.type);
                          return <Icon className="w-4 h-4 text-white" strokeWidth={2} />;
                        })()}
                        <span className="text-white text-sm font-bold capitalize">
                          {currentTestimonial.type}
                        </span>
                      </div>
                    </div>

                    {/* Quote Icon */}
                    <div className="absolute bottom-6 right-6">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                        <Quote className="w-8 h-8 text-white fill-white" strokeWidth={0} />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Gold Border */}
                  <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-primary/20 rounded-3xl -z-10" />
                </div>

                {/* Content Side */}
                <div className="space-y-8">
                  {/* Stars */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: currentTestimonial.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-6 h-6 fill-primary text-primary"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-2xl md:text-3xl leading-relaxed font-medium">
                    "{currentTestimonial.text}"
                  </blockquote>

                  {/* Project Info */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Award className="w-4 h-4" strokeWidth={2} />
                    <span>{currentTestimonial.project}</span>
                  </div>

                  {/* Author Info */}
                  <div className="pt-8 border-t border-border">
                    <div className="font-bold text-xl mb-1">{currentTestimonial.name}</div>
                    <div className="text-muted-foreground">
                      {currentTestimonial.title}, {currentTestimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="w-14 h-14 rounded-full bg-card border-2 border-border hover:border-primary flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-12 h-3 bg-primary rounded-full'
                      : 'w-3 h-3 bg-muted hover:bg-muted-foreground rounded-full'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="w-14 h-14 rounded-full bg-card border-2 border-border hover:border-primary flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
        >
          {[
            { value: '35+', label: 'Years of Excellence' },
            { value: '5000+', label: 'Projects Completed' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '200+', label: 'Partner Architects' },
          ].map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
