// /components/dashboard/chart-course-responsive.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

interface CourseDistribution {
  name: string;
  value: number;
  students?: number;
  [key: string]: any;
}

interface ChartCourseResponsiveProps {
  data: CourseDistribution[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  colors?: string[];
  showLabel?: boolean;
  showLegend?: boolean;
  truncateLegendNames?: boolean;
  maxLegendNameLength?: number;
}

export default function ChartCourseResponsive({
  data,
  title = "Distribución de Cursos",
  description = "Estudiantes por curso",
  height = 300,
  className,
  colors = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"],
  showLabel = false,
  showLegend = true,
  truncateLegendNames = true,
  maxLegendNameLength = 25,
}: ChartCourseResponsiveProps) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  // Ajustes responsivos
  const responsiveHeight = isMobile ? 280 : height;
  const responsiveOuterRadius = isMobile ? 65 : isTablet ? 75 : 90;
  const responsiveLegendPosition = isMobile ? 'bottom' : 'right';
  const responsiveLayout = isMobile ? 'horizontal' : 'vertical';

  // Función para truncar nombres
  const truncateName = (name: string): string => {
    if (!truncateLegendNames || name.length <= maxLegendNameLength) {
      return name;
    }
    return name.substring(0, maxLegendNameLength) + '...';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={responsiveHeight}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabel ? ({ name, percent }) => 
                `${(percent * 100).toFixed(0)}%`
               : undefined}
              outerRadius={responsiveOuterRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: isMobile ? '12px' : '14px',
              }}
              formatter={(value, name, props) => [
                `${value} estudiantes`,
                props.payload.name || name,
              ]}
            />
            {showLegend && (
              <Legend 
                layout={responsiveLayout}
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                align={responsiveLegendPosition}
                wrapperStyle={{
                  paddingLeft: responsiveLegendPosition === 'right' ? (isMobile ? '5px' : '15px') : '0',
                  paddingRight: responsiveLegendPosition === 'left' ? (isMobile ? '5px' : '15px') : '0',
                  paddingTop: isMobile ? '15px' : '0',
                  paddingBottom: isMobile ? '5px' : '0',
                  fontSize: isMobile ? '11px' : '12px',
                }}
                formatter={(value, entry, index) => 
                  truncateName(data[index]?.name || value)
                }
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}