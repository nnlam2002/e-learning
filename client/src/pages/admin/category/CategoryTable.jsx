import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetAllCategoriesQuery } from "@/features/api/categoryApi";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CategoryTable = () => {
    const { data, isLoading } = useGetAllCategoriesQuery();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    if (isLoading) return <h1>Loading...</h1>;

    // Filter categories based on search query
    const filteredCategories = data.categories.filter(category =>
        category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-6">
                <Input
                    type="text"
                    placeholder="Search by category name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>
            <Button onClick={() => navigate(`create`)}>Create a new category</Button>
            <Table>
                <TableCaption>A list of your categories.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCategories.map((category) => (
                        <TableRow key={category._id}>
                            <TableCell className="font-medium">{category.categoryName}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(`${category._id}`)}
                                >
                                    <Edit />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default CategoryTable;