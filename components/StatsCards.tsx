interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    shipped: number;
    delivered: number;
    revenue: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      description: 'All orders',
      color:
        'from-gray-100 to-gray-50 text-gray-800 border-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 dark:text-gray-200 dark:border-gray-800',
    },
    {
      title: 'Pending',
      value: stats.pending,
      description: 'Awaiting',
      color:
        'from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-200 dark:border-yellow-800/30',
    },
    {
      title: 'Shipped',
      value: stats.shipped,
      description: 'In transit',
      color:
        'from-blue-50 to-blue-100 text-blue-800 border-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-200 dark:border-blue-800/30',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      description: 'Delivered',
      color:
        'from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-200 dark:border-emerald-800/30',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      description: 'Total earnings',
      color:
        'from-purple-50 to-purple-100 text-purple-800 border-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-200 dark:border-purple-800/30',
      fullWidth: true,
    },
  ];

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3! sm:gap-4! md:gap-6! mb-6! sm:mb-8!'>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-linear-to-br ${
            stat.color
          } rounded-xl! sm:rounded-2xl! shadow-md! p-3! sm:p-4! md:p-6! border hover:shadow-lg! transition-shadow duration-200 ${
            stat.fullWidth ? 'col-span-2! sm:col-span-3! md:col-span-1!' : ''
          }`}
        >
          <div className='text-xs! sm:text-sm! font-medium'>{stat.title}</div>
          <div className='text-xl! sm:text-2xl! md:text-3xl! font-bold mt-1! sm:mt-2!'>
            {stat.value}
          </div>
          <div className='text-xs! mt-0.5! sm:mt-1!'>{stat.description}</div>
        </div>
      ))}
    </div>
  );
}
