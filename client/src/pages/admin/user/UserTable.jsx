import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from "react";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAllUsersQuery } from "@/features/api/authApi";
import { Input } from "@/components/ui/input";

const UserTable = () => {
    const { data, isLoading } = useGetAllUsersQuery();
    const [activeTab, setActiveTab] = useState("student");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    if (isLoading) return <h1>Loading...</h1>;

    const filteredUsers = data.users
        .filter(user => user.role === activeTab)
        .filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div>
            {/* Search Input */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-4">
                <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-4">
                <Button
                    variant={activeTab === "student" ? "default" : "outline"}
                    onClick={() => setActiveTab("student")}
                >
                    Students
                </Button>
                <Button
                    variant={activeTab === "instructor" ? "default" : "outline"}
                    onClick={() => setActiveTab("instructor")}
                >
                    Instructors
                </Button>
                {/* Add New Instructor Button */}
                {activeTab === "instructor" && (
                    <Button className="ml-auto" onClick={() => navigate("create")}>
                        Add New Instructor
                    </Button>
                )}
            </div>

            {/* Table */}
            <Table>
                <TableCaption>
                    {activeTab === "student"
                        ? "A list of all students."
                        : "A list of all instructors."}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map(user => (
                        <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(`${user._id}`)}
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

export default UserTable;