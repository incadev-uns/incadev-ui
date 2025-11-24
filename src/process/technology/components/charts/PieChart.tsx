"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react"

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

interface PieChartComponentProps {
  data: Array<{
    name: string
    value: number
    percentage: number
    color: string
  }>
  title?: string
  description?: string
  height?: number
  showLabels?: boolean
}

export function PieChartComponent({ 
  data, 
  title = "Distribución", 
  description,
  height = 300,
  showLabels = false
}: PieChartComponentProps) {
  const id = React.useId()
  const [activeIndex, setActiveIndex] = React.useState(0)

  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      name: item.name,
      value: item.value,
      fill: `var(--color-${item.name.toLowerCase().replace(/\s+/g, '-')})`,
      percentage: item.percentage,
      originalColor: item.color
    }))
  }, [data])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Cantidad",
      },
    }

    data.forEach(item => {
      const key = item.name.toLowerCase().replace(/\s+/g, '-')
      // Extraer el color hex del string de clases de Tailwind
      const colorMatch = item.color.match(/#[0-9a-fA-F]{6}/)
      config[key] = {
        label: item.name,
        color: colorMatch ? colorMatch[0] : 'hsl(var(--chart-1))'
      }
    })

    return config
  }, [data])

  const total = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }, [data])

  const activeItem = data[activeIndex]

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sin datos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="items-center pb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico */}
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={5}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {activeItem?.percentage.toFixed(1)}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            {activeItem?.name}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Leyenda mejorada */}
          <div className="flex flex-col justify-center gap-2">
            {data.map((item, index) => {
              const isActive = index === activeIndex
              const key = item.name.toLowerCase().replace(/\s+/g, '-')
              
              return (
                <button
                  key={item.name}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isActive ? 'bg-muted border-primary shadow-sm scale-105' : 'hover:bg-muted/50'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-sm shrink-0"
                      style={{ backgroundColor: chartConfig[key]?.color as string }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{item.value}</div>
                    <Badge variant="secondary" className="text-xs">
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-2 text-sm border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 leading-none font-medium w-full">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Total de registros: {total.toLocaleString()}</span>
        </div>
        <div className="text-muted-foreground leading-none w-full">
          {data.length} categorías diferentes en el análisis
        </div>
      </CardFooter>
    </Card>
  )
}