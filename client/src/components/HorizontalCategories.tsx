import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface Category {
  name: string;
  image: string;
}

interface HorizontalCategoriesProps {
  categories: Category[];
}

export default function HorizontalCategories({ categories }: HorizontalCategoriesProps) {
  const [, setLocation] = useLocation();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect fill="%23f5e6d3" width="1200" height="400"/><path d="M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z" fill="%23ffe4e1" opacity="0.5"/></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif bg-primary text-white border-2 border-white rounded-full px-6 md:px-8 py-2 md:py-3 inline-block" data-testid="text-section-categories">
            Shop by Category
          </h2>
        </motion.div>

        <div className="relative">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5 pb-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-36"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                data-testid={`category-horizontal-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div 
                  className="group cursor-pointer"
                  onClick={() => {
                    if (category.name === "Sale") {
                      setLocation("/sale");
                    } else {
                      setLocation(`/products?category=${encodeURIComponent(category.name)}`);
                    }
                  }}
                >
                  <div className="relative mb-4">
                    <svg 
                      viewBox="0 0 200 200" 
                      className="w-full h-auto drop-shadow-xl"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <clipPath id={`frame-${index}`}>
                          <circle cx="100" cy="100" r="85" />
                        </clipPath>
                        <filter id={`glow-${index}`}>
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="90" 
                        fill="none" 
                        stroke="#d4a574" 
                        strokeWidth="12"
                        className="transition-all duration-300 group-hover:stroke-[#b8860b]"
                      />
                      
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="95" 
                        fill="none" 
                        stroke="#8b6f47" 
                        strokeWidth="3"
                        opacity="0.6"
                      />
                      
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="85" 
                        fill="none" 
                        stroke="#ffd700" 
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="transition-all duration-300 group-hover:opacity-100"
                      />
                      
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="90" 
                        fill="none" 
                        stroke="#ffd700" 
                        strokeWidth="0"
                        className="transition-all duration-300 group-hover:stroke-width-[6] group-hover:opacity-50"
                        filter={`url(#glow-${index})`}
                      />
                      
                      <image
                        href={category.image}
                        x="15"
                        y="15"
                        width="170"
                        height="170"
                        clipPath={`url(#frame-${index})`}
                        className="transition-transform duration-500 group-hover:scale-110"
                        preserveAspectRatio="xMidYMid slice"
                      />
                      
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <circle
                          key={angle}
                          cx={100 + 90 * Math.cos((angle * Math.PI) / 180)}
                          cy={100 + 90 * Math.sin((angle * Math.PI) / 180)}
                          r="3"
                          fill="#ffd700"
                          opacity="0.9"
                        />
                      ))}
                    </svg>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-sm md:text-base font-bold text-gray-800 px-3 py-2 transition-all duration-300 group-hover:text-primary group-hover:scale-105">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}
