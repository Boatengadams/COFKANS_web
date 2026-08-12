import { motion } from 'motion/react';
import { Award, TrendingUp, Shield, Star, CheckCircle, Trophy } from 'lucide-react';

const awards = [
  {
    year: '2024',
    title: 'Best Electrical Retailer',
    organization: 'Ghana Business Excellence Awards',
    icon: Trophy,
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    year: '2023',
    title: 'Premium Service Provider',
    organization: 'West Africa Trade Awards',
    icon: Star,
    color: 'from-blue-400 to-blue-600',
  },
  {
    year: '2022',
    title: 'Innovation in Smart Homes',
    organization: 'Technology Excellence Awards',
    icon: TrendingUp,
    color: 'from-purple-400 to-purple-600',
  },
  {
    year: '2021',
    title: 'Customer Satisfaction Leader',
    organization: 'Consumer Choice Awards',
    icon: Award,
    color: 'from-green-400 to-green-600',
  },
];

const certifications = [
  { name: 'ISO 9001:2015 Certified', icon: CheckCircle },
  { name: 'Authorized Premium Distributor', icon: Shield },
  { name: 'Electrical Safety Compliant', icon: Shield },
  { name: 'Ghana Standards Authority Approved', icon: CheckCircle },
];

export function AwardsShowcase() {
  return (
    <div className="w-full py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 3px 3px, currentColor 2px, transparent 0)',
            backgroundSize: '60px 60px',
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Award className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-sm font-bold text-primary">Recognized Excellence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
            Awards & Certifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by industry leaders and recognized for excellence in quality and service
          </p>
        </motion.div>

        {/* Awards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {awards.map((award, idx) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-card rounded-3xl p-8 border-2 border-border hover:border-primary transition-all duration-500 shadow-lg hover:shadow-2xl h-full">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${award.color} flex items-center justify-center shadow-lg`}>
                    <award.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${award.color} blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                </div>

                {/* Year Badge */}
                <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-4">
                  <span className="text-sm font-bold text-primary">{award.year}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{award.title}</h3>
                <p className="text-sm text-muted-foreground">{award.organization}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-card rounded-3xl p-10 border-2 border-border shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Certifications & Compliance</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-muted/70 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <cert.icon className="w-5 h-5 text-secondary" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold leading-tight">{cert.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
