import { motion } from "framer-motion";

interface RewardBadgeProps {
  emoji: string;
  label: string;
  earned: boolean;
}

const RewardBadge = ({ emoji, label, earned }: RewardBadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
      earned ? "bg-accent/20" : "bg-muted/50 opacity-40 grayscale"
    }`}
  >
    <span className="text-3xl">{emoji}</span>
    <span className="text-xs font-semibold text-foreground">{label}</span>
  </motion.div>
);

export default RewardBadge;
