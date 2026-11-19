import { motion } from "framer-motion";

const AnalyticsStats = ({ stats }) => {
  return (
    <div className="analytics-stats-grid">
      {stats.map((stat, index) => (
        <motion.div
          className="analytics-stat-card"
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="analytics-stat-top">
            <span className="analytics-stat-icon">{stat.icon}</span>
            <span className="analytics-stat-change">{stat.change}</span>
          </div>

          <p className="analytics-stat-title">{stat.title}</p>
          <h2>{stat.value}</h2>
          <p className="analytics-stat-description">{stat.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsStats;