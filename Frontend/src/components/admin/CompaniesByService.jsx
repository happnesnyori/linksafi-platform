import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
} from 'recharts';

const SERVICE_COLORS = {
    cleaning: '#0d9488',
    decoration: '#d97706',
    both: '#2563eb',
};

const SERVICE_LABELS = {
    cleaning: 'Cleaning',
    decoration: 'Decoration',
    both: 'Combined Services',
};

const EmptyChart = () => (
    <div className="admin-chart-empty">
        <p>No company service data available.</p>
    </div>
);

const CompaniesByService = ({ data = {}, loading = false }) => {
    const pieData = Object.entries(data || {})
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => ({
            name: SERVICE_LABELS[key] || key,
            value,
            color: SERVICE_COLORS[key] || '#94a3b8',
        }));

    if (loading) {
        return <div className="admin-chart-loading">Loading chart...</div>;
    }
    if (pieData.length === 0) {
        return <EmptyChart />;
    }

    const total = pieData.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
                <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    strokeWidth={2}
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 8 }}
                    layout="horizontal"
                    align="center"
                />
                <g className="admin-pie-total">
                    <text
                        x="50%"
                        y="48%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 22, fontWeight: 700, fill: 'var(--teal-950)' }}
                    >
                        {total}
                    </text>
                    <text
                        x="50%"
                        y="64%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    >
                        Total Companies
                    </text>
                </g>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CompaniesByService;
