"use client"

import * as React from "react"
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis, ReferenceLine } from "recharts"
import { TrendingUp, TrendingDown, Maximize2 } from "lucide-react"

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

interface ScatterChartComponentProps {
  data: Array<{
    x: number
    y: number
    z?: number
    name: string
  }>
  xAxis: {
    key: string
    name: string
  }
  yAxis: {
    key: string
    name: string
  }
  title?: string
  description?: React.ReactNode
  showTrendLine?: boolean
}

export function ScatterChartComponent({ 
  data, 
  xAxis, 
  yAxis, 
  title = "Gráfico de Dispersión",
  description = "Relación entre variables",
  showTrendLine = true
}: ScatterChartComponentProps) {
  
  const chartConfig = {
    scatter: {
      label: "Datos",
      color: "hsl(var(--chart-1))",
    },
    [xAxis.key]: {
      label: xAxis.name,
      color: "hsl(var(--chart-2))",
    },
    [yAxis.key]: {
      label: yAxis.name,
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  // Calcular línea de tendencia usando regresión lineal simple
  const trendLine = React.useMemo(() => {
    if (!showTrendLine || data.length < 2) return null

    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + (point.x * point.y), 0)
    const sumX2 = data.reduce((sum, point) => sum + (point.x * point.x), 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }, [data, showTrendLine])

  // Calcular correlación
  const correlation = React.useMemo(() => {
    if (data.length < 2) return 0

    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + (point.x * point.y), 0)
    const sumX2 = data.reduce((sum, point) => sum + (point.x * point.x), 0)
    const sumY2 = data.reduce((sum, point) => sum + (point.y * point.y), 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }, [data])

  // Determinar dominio dinámico
  const domains = React.useMemo(() => {
    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)
    
    return {
      x: [Math.min(...xValues, 0), Math.max(...xValues, 100)],
      y: [Math.min(...yValues, 0), Math.max(...yValues, 20)]
    }
  }, [data])

  const interpretCorrelation = (r: number) => {
    const absR = Math.abs(r)
    if (absR >= 0.7) return 'fuerte'
    if (absR >= 0.4) return 'moderada'
    if (absR >= 0.2) return 'débil'
    return 'muy débil'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`text-sm ${
              Math.abs(correlation) >= 0.7 ? 'border-green-500 text-green-600' :
              Math.abs(correlation) >= 0.4 ? 'border-yellow-500 text-yellow-600' :
              'border-gray-500 text-gray-600'
            }`}
          >
            Correlación: {correlation.toFixed(3)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <ScatterChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              name={xAxis.name}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={domains.x}
              label={{ value: xAxis.name, position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yAxis.name}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={domains.y}
              label={{ value: yAxis.name, angle: -90, position: 'insideLeft' }}
            />
            <ZAxis dataKey="z" range={[50, 400]} />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="font-semibold mb-2">{data.name}</div>
                    <div className="grid gap-1 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">{xAxis.name}:</span>
                        <span className="font-medium">{data.x}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">{yAxis.name}:</span>
                        <span className="font-medium">{data.y}</span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Scatter
              name="Datos"
              data={data}
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
            
            {/* Línea de tendencia */}
            {trendLine && (
              <ReferenceLine
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                segment={[
                  { x: domains.x[0], y: trendLine.slope * domains.x[0] + trendLine.intercept },
                  { x: domains.x[1], y: trendLine.slope * domains.x[1] + trendLine.intercept }
                ]}
              />
            )}
          </ScatterChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col gap-3 text-sm border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 leading-none font-medium w-full">
          {correlation > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Correlación positiva {interpretCorrelation(correlation)}</span>
            </>
          ) : correlation < 0 ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>Correlación negativa {interpretCorrelation(correlation)}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sin correlación aparente</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground leading-none w-full">
          <Badge variant="secondary" className="text-xs">
            {data.length} puntos de datos
          </Badge>
          <span>•</span>
          <span>
            {Math.abs(correlation) >= 0.7 
              ? 'Relación muy clara entre variables'
              : Math.abs(correlation) >= 0.4
              ? 'Relación moderada entre variables'
              : 'Relación débil o inexistente'}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}