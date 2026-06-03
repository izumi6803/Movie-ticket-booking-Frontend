"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableFiltersProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onSearch?: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  searchValue?: string;
}

export function DataTableFilters({
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  searchValue = "",
}: DataTableFiltersProps) {
  const [search, setSearch] = useState(searchValue);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (value === "all") {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilterChange?.(key, value === "all" ? "" : value);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveFilters({});
    onSearch?.("");
    filters.forEach((f) => onFilterChange?.(f.key, ""));
  };

  const hasActiveFilters = search || Object.keys(activeFilters).length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={activeFilters[filter.key] || "all"}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
