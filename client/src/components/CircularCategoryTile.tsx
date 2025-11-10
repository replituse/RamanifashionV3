import { motion } from "framer-motion";

interface CircularCategoryTileProps {
  name: string;
  image: string;
  onClick?: () => void;
  delay?: number;
  testIdPrefix?: string;
}

export default function CircularCategoryTile({ 
  name, 
  image, 
  onClick,
  delay = 0,
  testIdPrefix = "category-tile"
}: CircularCategoryTileProps) {
  return (
    <motion.div
      className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      data-testid={`${testIdPrefix}-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        {/* Circular image container with decorative frame */}
        <div className="relative mb-4 aspect-square">
          {/* Outer decorative ring */}
          <div className="absolute inset-0 rounded-full border-[8px] md:border-[10px] border-[#d4a574] transition-all duration-300 group-hover:border-[#b8860b] drop-shadow-xl" />
          
          {/* Middle ring */}
          <div className="absolute inset-[-2px] rounded-full border-[2px] border-[#8b6f47] opacity-60" />
          
          {/* Inner gold accent ring */}
          <div className="absolute inset-[8px] md:inset-[10px] rounded-full border-[1px] border-[#ffd700] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Decorative dots on the circle */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const radius = 50; // percentage from center
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={angle}
                className="absolute w-2 h-2 bg-[#ffd700] rounded-full opacity-90"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            );
          })}
          
          {/* Image container with circular clip */}
          <div className="absolute inset-[12px] md:inset-[14px] rounded-full overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-[8px] md:inset-[10px] rounded-full border-[3px] border-[#ffd700] opacity-0 group-hover:opacity-50 transition-all duration-300 blur-sm" />
        </div>
        
        {/* Category name */}
        <div className="text-center">
          <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 px-2 py-2 transition-all duration-300 group-hover:text-primary group-hover:scale-105">
            {name}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
