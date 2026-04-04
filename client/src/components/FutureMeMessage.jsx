import { motion } from 'framer-motion';

export default function FutureMeMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="geometric-card p-6 border-2 border-mono-950 shadow-[4px_4px_0_0_#3f3f46] bg-ivory"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 border-b-2 border-mono-100 pb-2">
          <h4 className="text-[10px] font-black text-mono-400 uppercase tracking-[0.2em]">
            ARCHIVED_PROTOCOL_NOTE
          </h4>
        </div>
        <p className="text-mono-950 text-sm font-black italic leading-normal">
          "{message.toUpperCase()}"
        </p>
        <p className="text-mono-500 text-[10px] mt-4 font-bold uppercase tracking-widest">
          REMEMBER_ORIGIN_COMMITMENT. TERMINATION_BLOCKED.
        </p>
      </div>
    </motion.div>
  );
}
