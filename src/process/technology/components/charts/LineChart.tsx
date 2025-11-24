"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Area, AreaChart } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LineChartComponentProps {
  data: Array<{
    name: string
    [key: string]: number | string
  }>
  lines: Array<{
    key: string
    name: string
    color: string
  }>
  title?: string
  description?: string
  showArea?: boolean
  showLegend?: boolean
  showDots?: boolean
}

export function LineChartComponent({ 
  data, 
  lines, 
  title = "Gráfico de Líneas",
  description = "Evolución en el tiempo",
  showArea = false,
  showLegend = true,
  showDots = false
}: LineChartComponentProps) {
  
  const [selectedLines, setSelectedLines] = React.useState<Set<string>>(
    new Set(lines.map(l => l.key))
  )
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}

    lines.forEach(line => {
      config[line.key] = {
        label: line.name,
        color: line.color.startsWith('#') ? line.color : line.color.startsWith('hsl') ? line.color : `hsl(var(--chart-1))`
      }
    })

    return config
  }, [lines])

  const calculateTrend = (lineKey: string) => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 }
    
    const firstValue = data[0][lineKey] as number
    const lastValue = data[data.length - 1][lineKey] as number
    
    if (firstValue === 0) return { direction: 'neutral', percentage: 0 }
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    }
  }

  const mainTrend = calculateTrend(lines[0].key)

  const toggleLine = (lineKey: string) => {
    const newSelected = new Set(selectedLines)
    if (newSelected.has(lineKey)) {
      if (newSelected.size > 1) { // Mantener al menos una línea visible
        newSelected.delete(lineKey)
      }
    } else {
      newSelected.add(lineKey)
    }
    setSelectedLines(newSelected)
  }

  const ChartComponent = showArea ? AreaChart : LineChart

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
          {lines.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {lines.map((line) => (
                <Button
                  key={line.key}
                  variant={selectedLines.has(line.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLine(line.key)}
                  className="text-xs"
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: chartConfig[line.key].color as string }}
                  />
                  {line.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ChartComponent
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Intentar parsear como fecha, sino devolver como está
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                  return date.toLocaleDateString('es', { month: 'short', day: 'numeric' })
                }
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
              cursor={{ strokeDasharray: '3 3' }}
              content={<ChartTooltipContent />}
            />
            {showLegend && lines.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            {lines.map((line) => {
              if (!selectedLines.has(line.key)) return null
              
              if (showArea) {
                return (
                  <Area
                    key={line.key}
                    dataKey={line.key}
                    type="monotone"
                    fill={`var(--color-${line.key})`}
                    fillOpacity={0.2}
                    stroke={`var(--color-${line.key})`}
                    strokeWidth={2}
                    dot={showDots}
                  />
                )
              }
              
              return (
                <Line
                  key={line.key}
                  dataKey={line.key}
                  type="monotone"
                  stroke={`var(--color-${line.key})`}
                  strokeWidth={2}
                  dot={showDots ? { r: 4, strokeWidth: 2 } : false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              )
            })}
          </ChartComponent>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col gap-2 text-sm border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 leading-none font-medium w-full">
          {mainTrend.direction === 'up' && (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Incremento de {mainTrend.percentage.toFixed(1)}% en el período</span>
            </>
          )}
          {mainTrend.direction === 'down' && (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>Decremento de {mainTrend.percentage.toFixed(1)}% en el período</span>
            </>
          )}
          {mainTrend.direction === 'neutral' && (
            <span className="text-muted-foreground">Sin cambios significativos en el período</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground leading-none w-full">
          <Badge variant="secondary" className="text-xs">
            {data.length} puntos de datos
          </Badge>
          <span>•</span>
          <span>{selectedLines.size} de {lines.length} líneas visibles</span>
        </div>
      </CardFooter>
    </Card>
  )
}