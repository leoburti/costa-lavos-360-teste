import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, description }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <img alt="Costa Lavos Logo" className="mx-auto h-16 w-auto mb-4" src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/d98b9d622b00f6c8b5946b730fbc2780.png" />
          <h1 className="text-3xl font-bold text-primary tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;