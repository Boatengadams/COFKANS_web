import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Calendar, Award } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export function ProjectGallery() {
  const [selectedProject, setSelectedProject] = useState(0);

  const projects = [
    {
      id: 1,
      name: 'Royal Penthouse Suite',
      location: 'Accra, Ghana',
      year: '2025',
      category: 'Luxury Residential',
      beforeImage: 'https://images.unsplash.com/photo-1713207418503-06b0be6c6931?w=1080',
      afterImage: 'https://images.unsplash.com/photo-1776671069392-33c94aa87814?w=1080',
      description: 'Complete smart lighting transformation with 24K gold-plated switches',
      features: ['120+ Smart Switches', 'Crystal Chandeliers', 'Voice Control Integration'],
    },
    {
      id: 2,
      name: 'Executive Corporate Tower',
      location: 'Kumasi, Ghana',
      year: '2024',
      category: 'Commercial',
      beforeImage: 'https://images.unsplash.com/photo-1716065145743-62b57bf0d3b8?w=1080',
      afterImage: 'https://images.unsplash.com/photo-1768396747960-ae6ba3c855bc?w=1080',
      description: 'Industrial-grade electrical infrastructure with architectural lighting',
      features: ['500+ Power Points', 'Emergency Backup System', 'LED Corridor Lighting'],
    },
    {
      id: 3,
      name: 'Luxury Hotel Renovation',
      location: 'Takoradi, Ghana',
      year: '2026',
      category: 'Hospitality',
      beforeImage: 'https://images.unsplash.com/photo-1708998191651-9ebbfd651633?w=1080',
      afterImage: 'https://images.unsplash.com/photo-1777465150940-561d5068cbdf?w=1080',
      description: 'Premium chandelier installation and smart room automation',
      features: ['80 Guest Rooms', 'Grand Lobby Chandelier', 'Energy Management System'],
    },
  ];

  const currentProject = projects[selectedProject];

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold mb-6">Featured Projects</h4>
          {projects.map((project, index) => (
            <motion.button
              key={project.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProject(index)}
              className={`w-full p-6 rounded-xl text-left transition-all duration-300 ${
                selectedProject === index
                  ? 'bg-card border-2 border-primary shadow-md'
                  : 'bg-card hover:bg-muted border border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-base font-bold mb-2">{project.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{project.year}</span>
                  </div>
                </div>
                {selectedProject === index && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Award className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </div>
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium">
                {project.category}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Interactive Before/After Slider */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            key={selectedProject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BeforeAfterSlider
              beforeImage={currentProject.beforeImage}
              afterImage={currentProject.afterImage}
              title={currentProject.name}
              description={currentProject.description}
            />
          </motion.div>

          {/* Features */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h4 className="font-bold mb-4">Project Highlights</h4>
            <div className="flex flex-wrap gap-2">
              {currentProject.features.map((feature, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary font-medium"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card p-6 rounded-xl text-center border border-border">
              <div className="text-3xl font-bold text-primary mb-2">
                {currentProject.features.length}
              </div>
              <div className="text-xs text-muted-foreground">Key Features</div>
            </div>
            <div className="bg-card p-6 rounded-xl text-center border border-border">
              <div className="text-3xl font-bold text-secondary mb-2">
                {currentProject.year}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="bg-card p-6 rounded-xl text-center border border-border">
              <div className="text-3xl font-bold text-primary mb-2">5★</div>
              <div className="text-xs text-muted-foreground">Client Rating</div>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 shadow-md flex items-center justify-center gap-3">
            <span>View Full Portfolio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
