import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, shadow: "lg" } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
}
