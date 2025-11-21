import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const stats = [
  {
    label: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Active Users',
    value: '2,350',
    change: '+180.1%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Sales',
    value: '12,234',
    change: '+19%',
    trend: 'up',
    icon: ShoppingBag,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Bounce Rate',
    value: '12.5%',
    change: '-2.1%',
    trend: 'down',
    icon: Activity,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of your store's performance and recent activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between pb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                stat.trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </h3>
              <div className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <select className="text-sm border-none bg-muted/50 rounded-lg px-3 py-1 focus:ring-0 cursor-pointer hover:bg-muted transition-colors">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Chart Visualization Placeholder</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3 bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <h3 className="text-lg font-semibold mb-6">Recent Sales</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    UN
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">User Name</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">+$1,999.00</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
