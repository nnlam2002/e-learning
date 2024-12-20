import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetAllCategoriesQuery } from "@/features/api/categoryApi";
import React, { useState } from "react";

const Filter = ({ handleFilterChange }) => {
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesData?.categories?.filter(category => category.isActive === true) || [];
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [selectedCourseLevels, setSelectedCourseLevels] = useState([]); // State for course levels

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

      handleFilterChange(newCategories, sortByPrice, selectedCourseLevels); // Pass course levels
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue, selectedCourseLevels); // Pass course levels
  };

  const handleCourseLevelChange = (level) => {
    setSelectedCourseLevels((prevLevels) => {
      const newLevels = prevLevels.includes(level)
        ? prevLevels.filter((l) => l !== level)
        : [...prevLevels, level];

      handleFilterChange(selectedCategories, sortByPrice, newLevels); // Pass updated levels
      return newLevels;
    });
  };

  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">Sort Options</h1>
        <Select onValueChange={selectByPriceHandler}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by price</SelectLabel>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {categories.map((category) => (
          <div className="flex items-center space-x-2 my-2" key={category._id}>
            <Checkbox
              id={category._id}
              onCheckedChange={() => handleCategoryChange(category._id)}
            />
            <Label htmlFor={category._id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {category.categoryName}
            </Label>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">COURSE LEVEL</h1>
        {["Beginner", "Medium", "Advance"].map((level) => (
          <div className="flex items-center space-x-2 my-2" key={level}>
            <Checkbox
              id={level}
              onCheckedChange={() => handleCourseLevelChange(level)}
            />
            <Label htmlFor={level} className="text-sm font-medium leading-none">
              {level}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;