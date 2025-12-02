import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente wrapper para LoadingSpinner para consistência de nomenclatura
 */
const Loading = ({ message = "Carregando..." }) => {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <LoadingSpinner message={message} />
        </div>
    );
};

export default Loading;