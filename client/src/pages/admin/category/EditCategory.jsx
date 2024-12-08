import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEditCategoryMutation, useGetCategoryByIdQuery } from "@/features/api/categoryApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const [isActive, setIsActive]= useState(true);

    const params = useParams();
    const categoryId = params.categoryId;

    const { data: categoryByIdData, isLoading: categoryByIdLoading } = useGetCategoryByIdQuery(categoryId);
    useEffect(() => {        
        if (categoryByIdData) { 
            setCategoryName(categoryByIdData.category.categoryName);
            setIsActive(categoryByIdData.category.isActive);
        }
    }, [categoryByIdData]);

    const [editCategory, { data, isLoading, isSuccess, error }] = useEditCategoryMutation();

    const navigate = useNavigate();

    const updateCategoryHandler = async () => {       
        await editCategory( {categoryId, categoryName, isActive} );
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Category updated.");
            navigate("/admin/category");
        }
    }, [isSuccess, error]);

    if(categoryByIdLoading) return <h1>Loading...</h1>

    return (
        <div className="flex-1 mx-10">
            <div className="mb-4">
                <h1 className="font-bold text-xl">Edit Category</h1>
                <p className="text-sm">
                    Modify the details of your category here.
                </p>
            </div>
            <div className="space-y-4">
                <div>
                    <Label>Name</Label>
                    <Input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category Name"
                    />
                </div>
                <div className="flex items-center space-x-2 my-5">
                    <Label htmlFor="airplane-mode">Active</Label>
                    <Switch checked={isActive} onCheckedChange={setIsActive} id="airplane-mode" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/category")}>
                        Back
                    </Button>
                    <Button disabled={isLoading} onClick={updateCategoryHandler}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>
                        ) : (
                            "Update"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditCategory;
