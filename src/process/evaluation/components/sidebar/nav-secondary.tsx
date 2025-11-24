"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavSecondaryProps {
  items: {
    title: string
    url: string
    icon: Icon
    type?: 'link' | 'search'
  }[]
  searchTerm?: string
  onSearchChange?: (value: string) => void
  className?: string
}

export function NavSecondary({
  items,
  searchTerm,
  onSearchChange,
  className,
  ...props
}: NavSecondaryProps) {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <SidebarGroup className={className} {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.type === 'search' ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder={item.title}
                    value={searchTerm || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </form>
              ) : (
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}