import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useGetAllCategoriesQuery } from "@/features/api/categoryApi";
import { Edit } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryTable = () => {
    const { data, isLoading } = useGetAllCategoriesQuery();
    const navigate = useNavigate();

    if (isLoading) return <h1>Loading...</h1>;

    return (
        <div>
            <Button onClick={() => navigate(`create`)}>Create a new category</Button>
            <Table>
                <TableCaption>A list of your categories.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        {/* <TableHead>Description</TableHead> */}
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.categories.map((category) => (
                        <TableRow key={category._id}>
                            <TableCell className="font-medium">{category.categoryName}</TableCell>
                            {/* <TableCell>{category.description || "No description"}</TableCell> */}
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
