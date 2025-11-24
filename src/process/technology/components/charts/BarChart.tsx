"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

interface BarChartComponentProps {
  data: Array<{
    name: string
    [key: string]: number | string
  }>
  bars: Array<{
    key: string
    name: string
    color: string
  }>
  title?: string
  description?: React.ReactNode
  showLabels?: boolean
  showTrend?: boolean
}

export function BarChartComponent({ 
  data, 
  bars, 
  title = "Gráfico de Barras",
  description = "Distribución de datos",
  showLabels = false,
  showTrend = true
}: BarChartComponentProps) {
  
  const [activeBar, setActiveBar] = React.useState<string>(bars[0]?.key || "")
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}

    bars.forEach(bar => {
      config[bar.key] = {
        label: bar.name,
        color: bar.color.startsWith('#') ? bar.color : bar.color.startsWith('hsl') ? bar.color : `hsl(var(--chart-1))`
      }
    })

    return config
  }, [bars])

  // Calcular totales para cada barra
  const totals = React.useMemo(() => {
    const result: Record<string, number> = {}
    bars.forEach(bar => {
      result[bar.key] = data.reduce((acc, curr) => {
        const value = curr[bar.key]
        return acc + (typeof value === 'number' ? value : 0)
      }, 0)
    })
    return result
  }, [data, bars])

  // Calcular tendencia
  const trend = React.useMemo(() => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 }
    
    const firstValue = data[0][activeBar]
    const lastValue = data[data.length - 1][activeBar]
    
    if (typeof firstValue !== 'number' || typeof lastValue !== 'number' || firstValue === 0) {
      return { direction: 'neutral', percentage: 0 }
    }
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    }
  }, [data, activeBar])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
        {bars.length > 1 && (
          <div className="flex">
            {bars.map((bar) => (
              <button
                key={bar.key}
                data-active={activeBar === bar.key}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 hover:bg-muted/30 transition-colors"
                onClick={() => setActiveBar(bar.key)}
              >
                <span className="text-muted-foreground text-xs font-medium">
                  {bar.name}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {totals[bar.key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: showLabels ? 24 : 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Truncar valores largos
                return value.length > 10 ? `${value.slice(0, 10)}...` : value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={<ChartTooltipContent />}
            />
            {bars.length === 1 ? (
              <Bar
                dataKey={bars[0].key}
                fill={`var(--color-${bars[0].key})`}
                radius={[8, 8, 0, 0]}
              >
                {showLabels && (
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                )}
              </Bar>
            ) : (
              <Bar
                dataKey={activeBar}
                fill={`var(--color-${activeBar})`}
                radius={[8, 8, 0, 0]}
              >
                {showLabels && (
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                )}
              </Bar>
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
      
      {showTrend && (
        <CardFooter className="flex-col gap-2 text-sm border-t bg-muted/30 pt-4">
          <div className="flex items-center gap-2 leading-none font-medium">
            {trend.direction === 'up' && (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Incremento de {trend.percentage.toFixed(1)}% en el período</span>
              </>
            )}
            {trend.direction === 'down' && (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Decremento de {trend.percentage.toFixed(1)}% en el período</span>
              </>
            )}
            {trend.direction === 'neutral' && (
              <span className="text-muted-foreground">Sin cambios significativos en el período</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground leading-none">
            <Badge variant="secondary" className="text-xs">
              {data.length} categorías
            </Badge>
            <span>•</span>
            <span>Total: {totals[activeBar]?.toLocaleString()}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}