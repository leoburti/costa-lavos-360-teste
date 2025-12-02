import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { callRpcFunction } from '@/services/supabaseRpcService';
import { useFilters } from '@/contexts/FilterContext';

/**
 * Generic Paginated List Component that handles RPC calls with pagination.
 * @param {string} functionName - Name of the RPC function to call
 * @param {function} renderItem - Function to render each item
 * @param {object} extraParams - Additional static parameters
 * @param {number} pageSize - Items per page (default 50)
 */
const PaginatedList = ({ 
  functionName, 
  renderItem, 
  extraParams = {}, 
  pageSize = 50,
  className = "" 
}) => {
  const { filters } = useFilters();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset on filter change
    setPage(0);
    setData([]);
    setHasMore(true);
  }, [filters, functionName]);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.dateRange?.from) return; // Wait for filters

      setLoading(true);
      setError(null);

      try {
        const result = await callRpcFunction(functionName, {
          ...filters,
          ...extraParams,
          limit: pageSize,
          offset: page * pageSize
        });

        if (result && Array.isArray(result)) {
          if (page === 0) {
            setData(result);
          } else {
            setData(prev => [...prev, ...result]);
          }
          setHasMore(result.length === pageSize);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [functionName, filters, extraParams, page, pageSize]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (error && data.length === 0) {
    return <div className="p-4 text-center text-red-500 text-sm">Erro: {error}</div>;
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-slate-500 text-sm">Nenhum dado encontrado.</div>;
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {data.map((item, index) => renderItem(item, index))}
      </div>
      
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadMore}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            Carregar Mais
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaginatedList;