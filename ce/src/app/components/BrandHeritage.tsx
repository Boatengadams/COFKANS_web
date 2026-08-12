import { motion } from 'motion/react';
import { Award, TrendingUp, Globe, Zap, Star, Crown } from 'lucide-react';

const milestones = [
  {
    year: '1985',
    title: 'The Beginning',
    description: 'Cofkans Electricals founded with a vision to bring luxury lighting to Ghana',
    icon: Star,
    achievement: 'First premium electrical showroom in Accra',
  },
  {
    year: '1995',
    title: 'Expansion Era',
    description: 'Opened branches in Kumasi and Takoradi, establishing nationwide presence',
    icon: TrendingUp,
    achievement: '3 major showrooms across Ghana',
  },
  {
    year: '2005',
    title: 'International Recognition',
    description: 'Partnership with European luxury lighting brands, bringing world-class products',
    icon: Globe,
    achievement: 'Exclusive distributor for 15+ premium brands',
  },
  {
    year: '2015',
    title: 'Smart Innovation',
    description: 'Pioneered smart home lighting integration and automation in West Africa',
    icon: Zap,
    achievement: 'First smart lighting showroom in Ghana',
  },
  {
    year: '2020',
    title: 'Excellence Awards',
    description: 'Recognized as Ghana\'s Premier Luxury Electrical Solutions Provider',
    icon: Award,
    achievement: 'Best Electrical Retailer Award',
  },
  {
    year: '2025',
    title: 'Luxury Leadership',
    description: 'Celebrating 40 years of illuminating Ghana\'s most prestigious spaces',
    icon: Crown,
    achievement: '5000+ projects, 98% satisfaction',
  },
];

export function BrandHeritage() {
  return (
    <div className="w-full py-32 bg-black dark:bg-background text-white dark:text-foreground relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(30deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Gold Accent Line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-6 backdrop-blur-sm">
            <Crown className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-sm font-bold text-primary">Since 1985</span>
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white dark:from-foreground dark:via-primary dark:to-foreground"
            style={{ fontFamily: 'var(--font-luxury)' }}
          >
            A Legacy of Excellence
          </h2>
          <p className="text-xl text-white/70 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Four decades of illuminating Ghana's most prestigious residences, hotels, and commercial spaces with
            uncompromising quality and craftsmanship
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block" />

          <div className="space-y-24">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`relative grid lg:grid-cols-2 gap-8 items-center ${
                  idx % 2 === 0 ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`${idx % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:pl-16 lg:col-start-2'}`}>
                  {/* Year Badge */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`inline-block mb-6 ${idx % 2 === 0 ? 'lg:float-right lg:clear-right' : ''}`}
                  >
                    <div className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20">
                      <span className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-luxury)' }}>
                        {milestone.year}
                      </span>
                    </div>
                  </motion.div>

                  <div className="clear-both">
                    <h3 className="text-3xl font-bold mb-4">{milestone.title}</h3>
                    <p className="text-lg text-white/70 dark:text-muted-foreground mb-4 leading-relaxed">
                      {milestone.description}
                    </p>

                    {/* Achievement Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-card border border-white/10 dark:border-border rounded-xl backdrop-blur-sm">
                      <Award className="w-4 h-4 text-primary" strokeWidth={2} />
                      <span className="text-sm font-medium text-white/90 dark:text-foreground">
                        {milestone.achievement}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Icon */}
                <div className={`flex ${idx % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start lg:col-start-1 lg:row-start-1'}`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10">
                      <milestone.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 -z-10" />
                  </motion.div>
                </div>

                {/* Center Dot (Desktop only) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-4 h-4 rounded-full bg-primary border-4 border-black dark:border-background shadow-lg shadow-primary/50" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 text-center"
        >
          <div className="inline-block p-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-2 border-primary/20 rounded-3xl backdrop-blur-md">
            <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
              Join Our Story
            </h3>
            <p className="text-lg text-white/70 dark:text-muted-foreground mb-8 max-w-2xl">
              Experience the same dedication to excellence that has served Ghana's elite for over three decades
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
            >
              Explore Collections
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
