import { motion } from 'framer-motion';

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        label="Total Focus Time"
        value={`${stats.totalFocusMinutes} min`}
        delay={0.1}
      />
      <StatCard 
        label="Locks Completed"
        value={stats.completedLocks}
        delay={0.2}
      />
      <StatCard 
        label="Active Locks"
        value={stats.activeLocks}
        delay={0.3}
      />
      <StatCard 
        label="Total Locks"
        value={stats.totalLocks}
        delay={0.4}
      />
    </div>
  );
}

function StatCard({ label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="geometric-card p-4"
    >
      <div className="flex flex-col gap-1">
        <div className="sub-heading text-mono-950">
          {value}
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-mono-400">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
