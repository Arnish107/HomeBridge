"use client";

import { motion } from "framer-motion";

export function FormSuccess({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-6 text-center"
    >
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="h-1 w-12 origin-left rounded-full bg-amber-500"
      />
      <h3 className="mt-5 font-serif text-4xl font-normal leading-none">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-navy-600">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  );
}
