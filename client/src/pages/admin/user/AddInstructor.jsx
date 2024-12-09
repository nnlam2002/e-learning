import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useRegisterInstructorMutation } from "@/features/api/authApi";

const AddInstructor = () => {
    const [formInput, setFormInput] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [registerInstructor, { isLoading, isSuccess, isError, error }] =
        useRegisterInstructorMutation();

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const changeInputHandler = (e) => {
        const { name, value } = e.target;
        setFormInput({ ...formInput, [name]: value });
    };

    const handleAddInstructor = async () => {
        if (!formInput.name || !formInput.email || !formInput.password) {
            toast.error("All fields are required.");
            return;
        }
        try {
            await registerInstructor(formInput).unwrap();
            toast.success("Instructor added successfully!");
            navigate("/admin/user");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to add instructor.");
        }
    };

    return (
        <div className="flex items-center justify-center w-full mt-20">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Add New Instructor</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new instructor account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            name="name"
                            value={formInput.name}
                            onChange={changeInputHandler}
                            placeholder="Enter instructor name"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formInput.email}
                            onChange={changeInputHandler}
                            placeholder="Enter instructor email"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formInput.password}
                                onChange={(e) => changeInputHandler(e, "signup")}
                                placeholder="Eg. xyz"
                                required
                                className="w-full pr-10"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 px-3 text-gray-500"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        disabled={isLoading}
                        onClick={handleAddInstructor}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add Instructor"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AddInstructor;
