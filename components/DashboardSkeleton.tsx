export default function DashboardSkeleton() {
  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800/30'>
      {/* Header Skeleton - Mobile optimized */}
      <div className='fixed w-full! top-0! z-40! bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg! border-b border-gray-200 dark:border-gray-800 shadow-sm!'>
        <div className='max-w-7xl mx-auto! px-4! sm:px-6! py-3! sm:py-4!'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3! sm:gap-4!'>
              {/* Logo skeleton */}
              <div className='p-2! sm:p-3! bg-gray-300 dark:bg-gray-700 rounded-xl! sm:rounded-2xl! animate-pulse w-12! h-12! sm:w-14! sm:h-14!'></div>

              {/* Title skeleton */}
              <div>
                <div className='h-5! sm:h-6! md:h-7! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-32! sm:w-40! md:w-48!'></div>
                {/* Subtitle skeleton - hidden on mobile, shown on sm+ */}
                <div className='hidden sm:block! mt-1!'>
                  <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-48! sm:w-56! md:w-64!'></div>
                </div>
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className='flex items-center gap-2! sm:gap-4!'>
              {/* Mobile menu button skeleton - shown on mobile only */}
              <div className='lg:hidden p-2! bg-gray-300 dark:bg-gray-700 rounded-lg! animate-pulse w-10! h-10!'></div>

              {/* Desktop buttons skeleton - hidden on mobile */}
              <div className='hidden lg:flex! items-center gap-4!'>
                <div className='h-10! bg-gray-300 dark:bg-gray-700 rounded-xl! animate-pulse w-32!'></div>
                <div className='h-10! bg-gray-300 dark:bg-gray-700 rounded-xl! animate-pulse w-24!'></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto! mt-16! sm:mt-20! px-3! sm:px-4! md:px-6! py-4! sm:py-6! md:py-8!'>
        {/* Stats Cards Skeleton - Mobile optimized */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3! sm:gap-4! md:gap-6! mb-6! sm:mb-8!'>
          {/* Card 1 */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700'>
            <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-12! sm:w-16! mb-1! sm:mb-2!'></div>
            <div className='h-6! sm:h-7! md:h-9! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! sm:w-20! md:w-24! mb-0.5! sm:mb-1!'></div>
            <div className='h-2! sm:h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-10! sm:w-12!'></div>
          </div>

          {/* Card 2 */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700'>
            <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! sm:w-20! mb-1! sm:mb-2!'></div>
            <div className='h-6! sm:h-7! md:h-9! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-12! sm:w-16! md:w-20! mb-0.5! sm:mb-1!'></div>
            <div className='h-2! sm:h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-8! sm:w-10!'></div>
          </div>

          {/* Card 3 */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700'>
            <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-14! sm:w-18! mb-1! sm:mb-2!'></div>
            <div className='h-6! sm:h-7! md:h-9! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-14! sm:w-18! md:w-22! mb-0.5! sm:mb-1!'></div>
            <div className='h-2! sm:h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-10! sm:w-12!'></div>
          </div>

          {/* Card 4 */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700'>
            <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-18! sm:w-22! mb-1! sm:mb-2!'></div>
            <div className='h-6! sm:h-7! md:h-9! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! sm:w-20! md:w-24! mb-0.5! sm:mb-1!'></div>
            <div className='h-2! sm:h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-12! sm:w-14!'></div>
          </div>

          {/* Card 5 - Full width on mobile, single on desktop */}
          <div className='col-span-2! sm:col-span-3! md:col-span-1! bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700'>
            <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! sm:w-20! mb-1! sm:mb-2!'></div>
            <div className='h-6! sm:h-7! md:h-9! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-24! sm:w-28! md:w-32! mb-0.5! sm:mb-1!'></div>
            <div className='h-2! sm:h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-20! sm:w-24!'></div>
          </div>
        </div>

        {/* Controls Skeleton - Mobile optimized */}
        <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! p-4! sm:p-6! mb-4! sm:mb-6! border border-gray-100 dark:border-gray-700'>
          {/* Search bar skeleton */}
          <div className='h-10! sm:h-12! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl! animate-pulse w-full! mb-4!'></div>

          {/* Filter and export skeleton */}
          <div className='flex flex-col sm:flex-row! gap-3! justify-between items-stretch sm:items-center'>
            {/* Filter skeleton */}
            <div className='h-10! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl! animate-pulse w-full! sm:w-40!'></div>

            {/* Export controls skeleton */}
            <div className='flex flex-col xs:flex-row! gap-3! items-stretch xs:items-center'>
              {/* Checkbox label skeleton */}
              <div className='h-5! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-20!'></div>
              {/* Export button skeleton */}
              <div className='h-10! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl! animate-pulse w-full! xs:w-40!'></div>
            </div>
          </div>
        </div>

        {/* Orders List Skeleton - Mobile optimized */}
        <div className='grid grid-cols-1 gap-4! sm:gap-6!'>
          {/* Order Card 1 */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! border border-gray-100 dark:border-gray-700 animate-pulse'>
            <div className='p-4! sm:p-6!'>
              {/* Header */}
              <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4! sm:gap-6! mb-4! sm:mb-6!'>
                <div className='flex-1!'>
                  {/* Customer name and status */}
                  <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-4! mb-3!'>
                    <div className='h-6! sm:h-7! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-32! sm:w-40! md:w-48!'></div>
                    <div className='h-7! sm:h-8! bg-gray-300 dark:bg-gray-700 rounded-full! animate-pulse w-20! sm:w-24!'></div>
                  </div>
                  {/* Date info */}
                  <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-48! sm:w-56! md:w-64!'></div>
                </div>

                {/* Action buttons */}
                <div className='flex items-center gap-2! self-end xs:self-center mt-2! xs:mt-0!'>
                  <div className='h-8! w-8! sm:h-9! sm:w-9! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl!'></div>
                  <div className='h-8! w-8! sm:h-9! sm:w-9! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl!'></div>
                </div>
              </div>

              {/* Desktop Details Grid - hidden on mobile */}
              <div className='hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4! sm:gap-6! mb-4! sm:mb-6!'>
                {/* Contact info */}
                <div>
                  <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-24! mb-2! sm:mb-3!'></div>
                  <div className='space-y-2!'>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-full!'></div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-3/4!'></div>
                  </div>
                </div>

                {/* Shipping info */}
                <div>
                  <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-20! mb-2! sm:mb-3!'></div>
                  <div className='space-y-2!'>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-full!'></div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-2/3!'></div>
                  </div>
                </div>

                {/* Order summary */}
                <div>
                  <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-22! mb-2! sm:mb-3!'></div>
                  <div className='space-y-2!'>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-full!'></div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-3/4!'></div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-1/2!'></div>
                  </div>
                </div>
              </div>

              {/* Mobile Compact Info - shown only on mobile */}
              <div className='lg:hidden space-y-4! mb-4! sm:mb-6!'>
                <div className='grid grid-cols-2 gap-3!'>
                  <div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! mb-1!'></div>
                    <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-24! mb-0.5!'></div>
                    <div className='h-2! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-20!'></div>
                  </div>
                  <div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-14! mb-1!'></div>
                    <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-28! mb-0.5!'></div>
                    <div className='h-2! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-24!'></div>
                  </div>
                </div>
                <div>
                  <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-20! mb-1!'></div>
                  <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-full!'></div>
                </div>
              </div>

              {/* Items Section */}
              <div className='mb-4! sm:mb-6!'>
                <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-28! mb-2! sm:mb-3!'></div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2! sm:gap-3!'>
                  {/* Item 1 */}
                  <div className='h-16! sm:h-20! bg-gray-100 dark:bg-gray-700/50 rounded-lg! sm:rounded-xl! animate-pulse'></div>
                  {/* Item 2 */}
                  <div className='h-16! sm:h-20! bg-gray-100 dark:bg-gray-700/50 rounded-lg! sm:rounded-xl! animate-pulse'></div>
                  {/* Item 3 */}
                  <div className='h-16! sm:h-20! bg-gray-100 dark:bg-gray-700/50 rounded-lg! sm:rounded-xl! animate-pulse'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Card 2 - Slightly different animation delay */}
          <div className='bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! border border-gray-100 dark:border-gray-700 animate-pulse'>
            <div className='p-4! sm:p-6!'>
              <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4! sm:gap-6! mb-4! sm:mb-6!'>
                <div className='flex-1!'>
                  <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-4! mb-3!'>
                    <div className='h-6! sm:h-7! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-36! sm:w-44! md:w-52!'></div>
                    <div className='h-7! sm:h-8! bg-gray-300 dark:bg-gray-700 rounded-full! animate-pulse w-24! sm:w-28!'></div>
                  </div>
                  <div className='h-3! sm:h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-40! sm:w-48! md:w-56!'></div>
                </div>
                <div className='flex items-center gap-2! self-end xs:self-center mt-2! xs:mt-0!'>
                  <div className='h-8! w-8! sm:h-9! sm:w-9! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl!'></div>
                  <div className='h-8! w-8! sm:h-9! sm:w-9! bg-gray-300 dark:bg-gray-700 rounded-lg! sm:rounded-xl!'></div>
                </div>
              </div>
              <div className='lg:hidden space-y-4! mb-4! sm:mb-6!'>
                <div className='grid grid-cols-2 gap-3!'>
                  <div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-18! mb-1!'></div>
                    <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-28! mb-0.5!'></div>
                    <div className='h-2! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-22!'></div>
                  </div>
                  <div>
                    <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-16! mb-1!'></div>
                    <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-32! mb-0.5!'></div>
                    <div className='h-2! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-28!'></div>
                  </div>
                </div>
                <div>
                  <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-24! mb-1!'></div>
                  <div className='h-3! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-full!'></div>
                </div>
              </div>
              <div className='mb-4! sm:mb-6!'>
                <div className='h-4! bg-gray-300 dark:bg-gray-700 rounded! animate-pulse w-32! mb-2! sm:mb-3!'></div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2! sm:gap-3!'>
                  <div className='h-16! sm:h-20! bg-gray-100 dark:bg-gray-700/50 rounded-lg! sm:rounded-xl! animate-pulse'></div>
                  <div className='h-16! sm:h-20! bg-gray-100 dark:bg-gray-700/50 rounded-lg! sm:rounded-xl! animate-pulse'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
