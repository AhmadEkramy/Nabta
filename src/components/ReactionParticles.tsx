import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  emoji: string;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

interface ReactionParticlesProps {
  trigger: boolean;
  reactionType: 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';
  onComplete?: () => void;
}

const reactionConfig = {
  like: { 
    emoji: '❤️', 
    color: '#ef4444', 
    particles: ['💖', '❤️', '💕', '💗', '💘', '💝', '💞'],
    sparkles: ['✨', '⭐', '🌟', '💫']
  },
  laugh: { 
    emoji: '😂', 
    color: '#f59e0b', 
    particles: ['😂', '🤣', '😄', '😆', '😁', '😊', '🙂'],
    sparkles: ['✨', '🎉', '🎊', '💫']
  },
  wow: { 
    emoji: '😮', 
    color: '#3b82f6', 
    particles: ['😮', '🤩', '😲', '🤯', '😍', '🥰', '😘'],
    sparkles: ['✨', '⚡', '🌟', '💫', '🔥']
  },
  sad: { 
    emoji: '😢', 
    color: '#6b7280', 
    particles: ['😢', '😭', '😔', '😞', '😟', '🥺', '💔'],
    sparkles: ['💧', '💦', '🌧️', '☔']
  },
  angry: { 
    emoji: '😠', 
    color: '#dc2626', 
    particles: ['😠', '😡', '🤬', '😤', '💢', '👿', '😾'],
    sparkles: ['🔥', '💥', '⚡', '💢']
  },
  support: { 
    emoji: '🤝', 
    color: '#10b981', 
    particles: ['🤝', '💪', '👏', '🙌', '👍', '💚', '🫶'],
    sparkles: ['✨', '🌟', '💫', '🎉']
  }
};

const ReactionParticles: React.FC<ReactionParticlesProps> = ({
  trigger,
  reactionType,
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sparkles, setSparkles] = useState<Particle[]>([]);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowBurst(true);
      const config = reactionConfig[reactionType];
      const newParticles: Particle[] = [];
      const newSparkles: Particle[] = [];

      // Create main reaction particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 80 + Math.random() * 60;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        newParticles.push({
          id: `particle-${i}-${Date.now()}`,
          x,
          y,
          z: Math.random() * 50 - 25,
          emoji: config.particles[Math.floor(Math.random() * config.particles.length)],
          color: config.color,
          size: 0.8 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          delay: i * 0.05
        });
      }

      // Create sparkle particles
      for (let i = 0; i < 15; i++) {
        newSparkles.push({
          id: `sparkle-${i}-${Date.now()}`,
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: Math.random() * 100 - 50,
          emoji: config.sparkles[Math.floor(Math.random() * config.sparkles.length)],
          color: config.color,
          size: 0.5 + Math.random() * 0.3,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5
        });
      }

      setParticles(newParticles);
      setSparkles(newSparkles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setParticles([]);
        setSparkles([]);
        setShowBurst(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, reactionType, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Central burst effect with 3D rotation */}
            <motion.div
              initial={{ scale: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }}
              animate={{ 
                scale: [0, 2, 1.2, 0.8],
                rotateX: [0, 360, 180, 0],
                rotateY: [0, 180, 360, 180],
                rotateZ: [0, 180, 360, 540],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-5xl absolute z-20"
              style={{ 
                filter: `drop-shadow(0 0 30px ${reactionConfig[reactionType].color}) drop-shadow(0 0 60px ${reactionConfig[reactionType].color})`,
                textShadow: `0 0 40px ${reactionConfig[reactionType].color}, 0 0 80px ${reactionConfig[reactionType].color}`,
                transformStyle: 'preserve-3d'
              }}
            >
              {reactionConfig[reactionType].emoji}
            </motion.div>

            {/* Main particle explosion with 3D movement */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  z: 0,
                  scale: 0, 
                  opacity: 1,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: particle.rotation
                }}
                animate={{ 
                  x: particle.x,
                  y: particle.y,
                  z: particle.z,
                  scale: [0, particle.size * 1.5, particle.size, 0],
                  opacity: [1, 1, 0.8, 0],
                  rotateX: [0, 360, 720, 1080],
                  rotateY: [0, 180, 360, 540],
                  rotateZ: [particle.rotation, particle.rotation + 720, particle.rotation + 1440]
                }}
                transition={{ 
                  duration: 2.5,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
                className="absolute text-3xl z-10"
                style={{ 
                  filter: `drop-shadow(0 0 15px ${particle.color}) drop-shadow(0 0 30px ${particle.color})`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {particle.emoji}
              </motion.div>
            ))}

            {/* Sparkle particles with random 3D movement */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  z: 0,
                  scale: 0, 
                  opacity: 0,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: sparkle.rotation
                }}
                animate={{ 
                  x: sparkle.x,
                  y: sparkle.y,
                  z: sparkle.z,
                  scale: [0, sparkle.size * 2, sparkle.size, 0],
                  opacity: [0, 1, 0.6, 0],
                  rotateX: [0, 720, 1440],
                  rotateY: [0, 360, 720],
                  rotateZ: [sparkle.rotation, sparkle.rotation + 1080]
                }}
                transition={{ 
                  duration: 2,
                  delay: sparkle.delay,
                  ease: "easeOut"
                }}
                className="absolute text-lg z-5"
                style={{ 
                  filter: `drop-shadow(0 0 10px ${sparkle.color})`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {sparkle.emoji}
              </motion.div>
            ))}

            {/* Multiple ripple effects with 3D perspective */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`ripple-${i}`}
                initial={{ scale: 0, opacity: 0.8, rotateX: 0 }}
                animate={{ 
                  scale: 4 + i,
                  opacity: 0,
                  rotateX: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5 + i * 0.3, 
                  delay: i * 0.1,
                  ease: "easeOut" 
                }}
                className="absolute rounded-full border-2"
                style={{ 
                  borderColor: reactionConfig[reactionType].color,
                  width: `${60 + i * 20}px`,
                  height: `${60 + i * 20}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transformStyle: 'preserve-3d',
                  boxShadow: `0 0 ${20 + i * 10}px ${reactionConfig[reactionType].color}40`
                }}
              />
            ))}

            {/* Energy wave effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ 
                scale: [0, 6, 8],
                opacity: [0.6, 0.3, 0],
                rotateZ: [0, 360]
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${reactionConfig[reactionType].color}20 0%, transparent 70%)`,
                width: '200px',
                height: '200px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                filter: `blur(2px)`
              }}
            />

            {/* Glowing orb effect */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 3, 5, 0],
                opacity: [1, 0.8, 0.4, 0]
              }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${reactionConfig[reactionType].color}60 0%, ${reactionConfig[reactionType].color}20 50%, transparent 100%)`,
                width: '100px',
                height: '100px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                filter: `blur(1px)`,
                boxShadow: `0 0 50px ${reactionConfig[reactionType].color}80`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionParticles;