import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateCategoryMutation } from "@/features/api/categoryApi";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const [isActive, setIsActive]= useState(true);

    const [createCategory, { data, isLoading, error, isSuccess }] = useCreateCategoryMutation();

    const navigate = useNavigate();

    const createCategoryHandler = async () => {       
        await createCategory( {categoryName, isActive} );
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Category created.");
            navigate("/admin/category");
        } else if(error) {
            toast.error(error?.data?.message || "Error!");
        }
    }, [isSuccess, error]);

    return (
        <div className="flex-1 mx-10">
            <div className="mb-4">
                <h1 className="font-bold text-xl">Add a New Category</h1>
                <p className="text-sm">
                    Provide details for the new category you'd like to create.
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
                    <Button disabled={isLoading} onClick={createCategoryHandler}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;
