import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteChangeLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 550);
    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={location.pathname}
          className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full origin-left rounded-r-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-primary-hover),var(--color-accent))]"
            initial={{ scaleX: 0, x: "-20%" }}
            animate={{ scaleX: 1, x: "0%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
