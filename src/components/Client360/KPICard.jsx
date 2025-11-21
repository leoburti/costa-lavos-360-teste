import React from 'react';
import { motion } from 'framer-motion';

const KPICard = ({ icon: Icon, title, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-card p-4 rounded-lg border border-border flex items-center gap-4"
    >
      <div className="p-3 bg-muted rounded-full">
        <Icon className="text-primary h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
};

export default KPICard;