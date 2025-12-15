import { Search, Filter, Download } from 'lucide-react';

interface DashboardControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  exportAll: boolean;
  onExportAllChange: (checked: boolean) => void;
  onExport: () => void;
  exporting: boolean;
  ordersCount: number;
  filteredOrdersCount: number;
}

export default function DashboardControls({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  exportAll,
  onExportAllChange,
  onExport,
  exporting,
  ordersCount,
  filteredOrdersCount,
}: DashboardControlsProps) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-4! sm:p-6! mb-4! sm:mb-6! border border-gray-100 dark:border-gray-700'>
      <div className='flex flex-col gap-4!'>
        {/* Search Bar */}
        <div className='w-full!'>
          <div className='relative'>
            <Search className='absolute left-3! sm:left-4! top-1/2! transform -translate-y-1/2! text-gray-400 w-4! h-4! sm:w-5! sm:h-5!' />
            <input
              type='text'
              placeholder='Search orders...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full! pl-10! sm:pl-12! pr-4! py-2.5! sm:py-3! bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg! sm:rounded-xl! focus:ring-2! focus:ring-blue-500 focus:border-transparent shadow-sm! transition-all duration-200 dark:text-white text-sm! sm:text-base!'
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3! justify-between items-stretch sm:items-center'>
          {/* Filter */}
          <div className='relative w-full! sm:w-auto!'>
            <Filter className='absolute left-3! top-1/2! transform -translate-y-1/2! text-gray-400 w-4! h-4!' />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className='w-full! pl-10! pr-4! py-2.5! sm:py-3! bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg! sm:rounded-xl! focus:ring-2! focus:ring-blue-500 focus:border-transparent shadow-sm! text-sm! font-medium transition-all duration-200'
            >
              <option value='all'>All Status</option>
              <option value='pending'>Pending</option>
              <option value='shipped'>Shipped</option>
              <option value='delivered'>Delivered</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Export Controls */}
          <div className='flex flex-col xs:flex-row gap-3! items-stretch xs:items-center'>
            <label className='flex items-center gap-2! text-xs! sm:text-sm! text-gray-700 dark:text-gray-300 whitespace-nowrap px-2!'>
              <input
                type='checkbox'
                checked={exportAll}
                onChange={(e) => onExportAllChange(e.target.checked)}
                className='rounded! border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700'
              />
              Export All
            </label>

            <button
              onClick={onExport}
              disabled={
                exporting ||
                (exportAll ? ordersCount === 0 : filteredOrdersCount === 0)
              }
              className={`px-4! py-2.5! sm:py-3! rounded-lg! sm:rounded-xl! transition-all duration-200 font-medium flex items-center justify-center gap-2! shadow-md! hover:shadow-lg! ${
                exporting ||
                (exportAll ? ordersCount === 0 : filteredOrdersCount === 0)
                  ? 'bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800'
              }`}
            >
              {exporting ? (
                <>
                  <div className='animate-spin rounded-full! h-3! w-3! sm:h-4! sm:w-4! border-b-2! border-white'></div>
                  <span className='text-xs! sm:text-sm!'>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className='w-3! h-3! sm:w-4! sm:h-4!' />
                  <span className='text-xs! sm:text-sm!'>
                    Export {exportAll ? 'All' : 'Filtered'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
