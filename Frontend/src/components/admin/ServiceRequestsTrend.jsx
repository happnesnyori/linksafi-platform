import {
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

const COLORS = {
    total: '#0d9488',
    completed: '#10b981',
    pending: '#f59e0b',
};

const EmptyChart = () => (
    <div className="admin-chart-empty">
        <p>No data available for this period.</p>
    </div>
);

const ServiceRequestsTrend = ({ data = [], loading = false }) => {
    if (loading) {
        return <div className="admin-chart-loading">Loading chart...</div>;
    }
    if (!data || data.length === 0) {
        return <EmptyChart />;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Legend
                    verticalAlign="top"
                    height={36}
                    iconSize={10}
                    wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 8 }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.total}
                    fill={COLORS.total}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                    dot={{ r: 3 }}
                    name="Total Requests"
                />
                <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.completed}
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                    dot={{ r: 3 }}
                    name="Completed"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ServiceRequestsTrend;
