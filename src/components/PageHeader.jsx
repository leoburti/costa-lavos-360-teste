import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PageHeader Component
 * Displays title, breadcrumbs, and optional action buttons.
 * 
 * @param {string} title - Main page title
 * @param {Array} breadcrumbs - Array of { label, path } objects
 * @param {React.ReactNode} actions - Buttons or controls to display on the right
 * @param {string} description - Optional subtext
 */
const PageHeader = ({ title, breadcrumbs = [], actions, description, className }) => {
  return (
    <div className={cn("flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6", className)}>
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                {crumb.path ? (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-foreground transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        
        {description && (
          <p className="text-sm text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-2 md:self-start">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;