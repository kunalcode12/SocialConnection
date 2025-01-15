import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/UI/Button";
import ScrollArea from "../components/UI/ScrollArea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/UI/dropdown-menu";

const categories = [
  "Education",
  "Entertainment",
  "Music",
  "Sports",
  "Technology",
  "Travel",
  "Food & Drink",
  "Art & Design",
];

function Categories() {
  return (
    <div className="mt-4 w-full">
      <div className="h-px bg-gray-200 mb-4"></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-left font-semibold"
          >
            Categories
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          {" "}
          {/* Slightly smaller than parent to account for padding */}
          <ScrollArea className="h-[300px]">
            {categories.map((category) => (
              <DropdownMenuItem key={category} className="cursor-pointer">
                {category}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Categories;
