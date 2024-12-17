import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllCourseQuery, useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import React from "react";
import { useSelector } from "react-redux";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user } = useSelector((store) => store.auth);
  const { data, isSuccess, isError, isLoading } = useGetPurchasedCoursesQuery();
  const { data: instructorCourses, isLoading: instructorCoursesLoading } = user?.role === 'admin' 
      ? useGetAllCourseQuery() 
      : useGetCreatorCourseQuery();

  if(isLoading) return <h1>Loading...</h1>
  if(isError) return <h1 className="text-red-500">Failed to get purchased course</h1>

  //
  const {purchasedCourse} = data || [];
  const instructorPurchaseCourses = purchasedCourse.filter(course => 
    instructorCourses?.courses.some(instructorCourse => 
      instructorCourse._id === course.courseId._id
    ));

  const courseData = instructorPurchaseCourses.map((course)=> ({
    name:course.courseId.courseTitle,
    price:course.courseId.coursePrice
  }))

  const totalRevenue = instructorPurchaseCourses.reduce((acc,element) => acc+(element.amount || 0), 0);

  const totalSales = instructorPurchaseCourses.length;

  const CustomTooltip = ({ active, payload }) => {    
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>
          <p style={{ color: '#6b7280' }}>{`${payload[0].payload.name}`}</p>
          <p style={{ color: '#4a90e2' }}>{`Price: $${payload[0].payload.price}`}</p>
        </div>
      );
    }
    return null;
  };
  
  
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{new Intl.NumberFormat('en-EN', {
              style: 'currency',
              currency: 'USD',
            }).format(totalRevenue)}</p>
        </CardContent>
      </Card>

      {/* Course Prices Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Course Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={courseData}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                angle={-5} // Rotated labels for better visibility
                textAnchor="middle"
                interval={0} // Display all labels
                tick={{ fontSize: '8px' }}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#4a90e2" // Changed color to a different shade of blue
                strokeWidth={3}
                dot={{ stroke: "#4a90e2", strokeWidth: 2 }} // Same color for the dot
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
