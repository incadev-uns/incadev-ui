import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  ingresos: number;
  egresos: number;
  estudiantes: number;
}

interface ChartTransactionsProps {
  data: MonthlyData[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: {
    ingresos?: string;
    egresos?: string;
    estudiantes?: string;
  };
  strokeWidths?: {
    ingresos?: number;
    egresos?: number;
    estudiantes?: number;
  };
}

export default function ChartTransactions({
  data,
  title = "Tendencia Mensual",
  description = "Ingresos, egresos y estudiantes",
  height = 300,
  className,
  showGrid = true,
  showLegend = true,
  colors = {
    ingresos: "#0ea5e9",
    egresos: "#ef4444", 
    estudiantes: "#8b5cf6",
  },
  strokeWidths = {
    ingresos: 2,
    egresos: 2,
    estudiantes: 2,
  },
}: ChartTransactionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke={colors.ingresos}
              strokeWidth={strokeWidths.ingresos}
              name="Ingresos"
            />
            <Line
              type="monotone"
              dataKey="egresos"
              stroke={colors.egresos}
              strokeWidth={strokeWidths.egresos}
              name="Egresos"
            />
            <Line
              type="monotone"
              dataKey="estudiantes"
              stroke={colors.estudiantes}
              strokeWidth={strokeWidths.estudiantes}
              name="Estudiantes"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}