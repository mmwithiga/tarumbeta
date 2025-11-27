import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SlidersHorizontal, Search } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    instrumentType: 'all',
    location: '',
    priceRange: 'all',
    condition: 'all',
  });

  const handleFilterUpdate = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            className="pl-10 bg-input-background border-border"
            onChange={(e) => handleFilterUpdate('location', e.target.value)}
          />
        </div>

        {/* Instrument Type */}
        <Select 
          defaultValue="all"
          onValueChange={(value) => handleFilterUpdate('instrumentType', value)}
        >
          <SelectTrigger className="w-full md:w-[200px] bg-input-background">
            <SelectValue placeholder="Instrument Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instruments</SelectItem>
            <SelectItem value="Guitar">Guitar</SelectItem>
            <SelectItem value="Piano">Piano</SelectItem>
            <SelectItem value="Drums">Drums</SelectItem>
            <SelectItem value="Saxophone">Saxophone</SelectItem>
            <SelectItem value="Violin">Violin</SelectItem>
            <SelectItem value="Bass">Bass</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full md:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg border border-border">
          <Select 
            defaultValue="all"
            onValueChange={(value) => handleFilterUpdate('priceRange', value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-500">KES 0 - 500/day</SelectItem>
              <SelectItem value="500-1000">KES 500 - 1,000/day</SelectItem>
              <SelectItem value="1000-2000">KES 1,000 - 2,000/day</SelectItem>
              <SelectItem value="2000-5000">KES 2,000 - 5,000/day</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            defaultValue="all"
            onValueChange={(value) => handleFilterUpdate('condition', value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}