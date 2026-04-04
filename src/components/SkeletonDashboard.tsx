import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function SkeletonDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Score row */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </motion.div>

      {/* SWOT */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
