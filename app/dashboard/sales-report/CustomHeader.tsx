'use client';

import React, { useRef, useState, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';

export const CustomHeader: React.FC<IHeaderParams> = (params) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [currentSort, setCurrentSort] = useState<'asc' | 'desc' | null>(params.column.getSort() ?? null);

  // Listen for sort changes
  useEffect(() => {
    const onSortChanged = () => {
      setCurrentSort(params.column.getSort() ?? null);
    };

    params.column.addEventListener('sortChanged', onSortChanged);

    return () => {
      params.column.removeEventListener('sortChanged', onSortChanged);
    };
  }, [params.column]);

  const onFilterClicked = () => {
    // Use the AG Grid API to show the filter
    params.api.showColumnFilter(params.column);
  };

  const onSortClicked = (event: React.MouseEvent) => {
    // Use progressSort to cycle through sort states
    params.progressSort(event.shiftKey);
  };

  return (
    <div className="ag-cell-label-container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px' }}>
      {/* Filter button with filter icon */}
      <button
        ref={filterButtonRef}
        onClick={onFilterClicked}
        className="ag-header-icon ag-header-cell-filter-button"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '20px',
          minHeight: '20px',
        }}
        aria-label="Filter"
        title="Open Filter"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      {/* Column label - clickable for sorting */}
      <div
        className="ag-header-cell-label"
        onClick={onSortClicked}
        style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <span className="ag-header-cell-text">{params.displayName}</span>
        {/* Sort indicator */}
        {currentSort === 'asc' && <span style={{ fontSize: '12px' }}>↑</span>}
        {currentSort === 'desc' && <span style={{ fontSize: '12px' }}>↓</span>}
      </div>
    </div>
  );
};
