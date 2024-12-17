import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery, useRecommendCoursesMutation } from "@/features/api/courseApi";
import { motion } from "framer-motion";
import { useGetCoursesProgressQuery } from "@/features/api/courseProgressApi";
import { useSelector } from "react-redux";

const Recommend = () => {
    const { user } = useSelector((store) => store.auth);

    const { data, isLoading, isError } = useGetPublishedCourseQuery();
    const { data: courses, isLoading: coursesLoading, isError: coursesError } = useGetCoursesProgressQuery();
    const [recommendCourses, { data: recommendedCoursesData, isLoading: recommendedCoursesLoading, error }] = useRecommendCoursesMutation();
    const [completedCourses, setCompletedCourses] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [beginnerCourses, setBeginnerCourses] = useState([]);
    const [cachedData, setCachedData] = useState(() => {
        const storedData = localStorage.getItem('recommendedCourses');
        return storedData ? JSON.parse(storedData) : null;
    });

    const coursesProgress = courses?.data?.coursesProgress;
    const coursesDetails = courses?.data?.coursesDetails;

    const fetchCompletedCourses = async () => {

        const combinedCourses = await coursesProgress?.map(progress => {
            const courseDetail = coursesDetails?.find(detail => detail._id === progress.courseId);

            return {
                ...progress,
                courseDetail: courseDetail || null
            };
        });
        const completedCourses = await combinedCourses?.filter(progress => progress?.completed === true);
        setCompletedCourses(completedCourses)
    };

    const handleRecommend = async () => {
        if (cachedData) {
            const completedCourseIds = new Set(coursesProgress?.map(progress => progress.courseId));
            const coursesData = data?.courses?.filter(course => !completedCourseIds.has(course._id));

            if (coursesData && cachedData) {
                const recommendations = findSimilarCourses(coursesData, cachedData.recommendations);
                setRecommended(recommendations);
            }
        } else {
            if (completedCourses && completedCourses?.length > 0) {
                const courseId = completedCourses[completedCourses?.length - 1]?.courseDetail?._id
                await recommendCourses({ courseId, courses: completedCourses });
            } else if(coursesProgress && coursesProgress.length > 0) {
                const combinedCourses = await coursesProgress?.map(progress => {
                    const courseDetail = coursesDetails?.find(detail => detail._id === progress.courseId);
        
                    return {
                        ...progress,
                        courseDetail: courseDetail || null
                    };
                });

                const courseId = combinedCourses[combinedCourses?.length - 1]?.courseDetail?._id
                await recommendCourses({ courseId, courses: combinedCourses });
            }
        }
    };

    useEffect(() => {
        setBeginnerCourses(fetchBeginnerCourses());          

        const fetchRecommendedCourses = () => {
            const completedCourseIds = new Set(coursesProgress?.map(progress => progress.courseId));
            const coursesData = data?.courses?.filter(course => !completedCourseIds.has(course._id));

            if (coursesData && recommendedCoursesData) {
                const recommendations = findSimilarCourses(coursesData, recommendedCoursesData.recommendations);
                setRecommended(recommendations);
            }
        };

        fetchRecommendedCourses();
    }, [data, coursesProgress, recommendedCoursesData]);

    useEffect(() => {
        if (recommendedCoursesData) {
            // Lưu vào Local Storage khi có dữ liệu mới
            localStorage.setItem('recommendedCourses', JSON.stringify(recommendedCoursesData));
            setCachedData(recommendedCoursesData);
        }
    }, [recommendedCoursesData]);

    useEffect(() => {
        handleRecommend();
    }, [completedCourses]);
    
    useEffect(() => {
        fetchCompletedCourses();
    }, [coursesProgress, coursesDetails]);

    
    function fetchBeginnerCourses() {
        const beginnerCourses = data?.courses?.filter(course => course.courseLevel === "Beginner");

        // Xáo trộn danh sách Beginner
        const shuffledBeginnerCourses = beginnerCourses?.sort(() => Math.random() - 0.5);

        // Trả về danh sách xáo trộn
        return shuffledBeginnerCourses;    
    }

    function findSimilarCourses(coursesData, filterCriteria) {
        // Danh sách từ khóa
        const tech_keywords = [
            'programming', 'development', 'software', 'web', 'mobile',
            'ai', 'machine learning', 'deep learning', 'data', 'cloud', 'backend',
            'frontend', 'app', 'game', 'design', 'technology',
            'automation', 'database', 'analytics', 'cybersecurity', 'blockchain',
            'devops', 'api', 'internet of things', 'virtual reality', 'augmented reality',
            'machine vision', 'natural language processing', 'big data', 'data engineering',
            'software engineering', 'quality assurance', 'testing', 'etl', 'data modeling',
            'data visualization', 'network security', 'vpn', 'firewalls', 'load balancing',
            'generative ai', 'foundation models', 'python', 'java', 'csharp', 'javascript',
            'ruby', 'php', 'swift', 'kotlin', 'scala', 'elixir', 'perl',
            'html', 'html5', 'css3', 'css', 'sql', 'typescript', 'go', 'rust', 'dart',
            'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
            'tensorflow', 'keras', 'pytorch', 'docker', 'kubernetes', 'git',
            'jenkins', 'aws', 'azure', 'google cloud', 'firebase', 'hadoop',
            'spark', 'tableau', 'power bi', 'jupyter', 'sqlite', 'neural networks',
            'mongodb', 'artificial intelligence', 'ansible', 'terraform'
        ];

        // Bảng trọng số từ khóa
        const tech_keywords_weights = {
            // Trọng số 3: Công nghệ phổ biến và quan trọng
            'python': 3, 'javascript': 3, 'ai': 3, 'machine learning': 3, 'data': 3,
            'cloud': 3, 'frontend': 3, 'backend': 3, 'devops': 3, 'react': 3,
            'angular': 3, 'nodejs': 3, 'docker': 3, 'kubernetes': 3, 'sql': 3,
            'aws': 3, 'azure': 3, 'google cloud': 3, 'big data': 3, 'cybersecurity': 3,
            'tensorflow': 3, 'pytorch': 3, 'html5': 3, 'css3': 3, 'django': 3,
            'flask': 3, 'artificial intelligence': 3, 'blockchain': 3,

            // Trọng số 2: Công nghệ trung cấp hoặc đang phát triển
            'java': 2, 'typescript': 2, 'csharp': 2, 'ruby': 2, 'php': 2,
            'swift': 2, 'kotlin': 2, 'scala': 2, 'elixir': 2, 'dart': 2,
            'firebase': 2, 'jenkins': 2, 'git': 2, 'automation': 2,
            'etl': 2, 'data modeling': 2, 'data visualization': 2,
            'natural language processing': 2, 'deep learning': 2,
            'neural networks': 2, 'analytics': 2, 'mongodb': 2, 'spark': 2,
            'hadoop': 2, 'tableau': 2, 'power bi': 2, 'jupyter': 2, 'sqlite': 2,

            // Trọng số 1: Công nghệ ít phổ biến hoặc chuyên biệt
            'perl': 1, 'rust': 1, 'go': 1, 'ansible': 1, 'terraform': 1,
            'vpn': 1, 'firewalls': 1, 'load balancing': 1,
            'machine vision': 1, 'augmented reality': 1, 'virtual reality': 1,
            'foundation models': 1, 'generative ai': 1, 'quality assurance': 1,
            'testing': 1, 'game': 1, 'design': 1
        };

        const results = [];

        // Lọc theo tiêu chí
        filterCriteria.forEach(criteria => {
            const levelMapping = {
                'Beginner': ['Beginner', 'Medium'],
                'Medium': ['Medium', 'Advance'],
                'Advance': ['Advance']
            };

            const filteredCourses = coursesData.filter(course =>
                course.category._id === criteria.category &&
                levelMapping[criteria.level].includes(course.courseLevel)
            );


            // Tính điểm và xếp hạng các khóa học
            const rankedCourses = filteredCourses.map(course => {
                // Chuẩn bị nội dung cần phân tích
                const combinedText = `${course.courseTitle} ${course.subTitle} ${course.description}`.toLowerCase();
                const textLength = combinedText.split(' ').length;

                // Tính điểm từ khóa
                const matchCount = criteria.keywords.reduce((count, keyword) => {
                    const keywordLower = keyword.toLowerCase();

                    // Đếm số lần xuất hiện của từ khóa
                    const regex = new RegExp(`\\b${keywordLower}\\b`, 'g'); // Tìm từ khóa nguyên vẹn
                    const keywordMatches = (combinedText.match(regex) || []).length;

                    // Lấy trọng số của từ khóa, mặc định là 1 nếu không có trong bảng trọng số
                    const weight = tech_keywords_weights[keywordLower] || 1;

                    // Tính tổng điểm (số lần xuất hiện * trọng số)
                    return count + keywordMatches * weight;
                }, 0);

                // Chuẩn hóa điểm dựa trên độ dài nội dung
                const normalizedScore = textLength > 0 ? matchCount / textLength : 0;

                return { course, matchCount: normalizedScore };
            });

            // Chọn top 8 khóa học theo điểm
            const topCourses = rankedCourses
                .sort((a, b) => b.matchCount - a.matchCount)
                .slice(0, 8);

            results.push(...topCourses.map(item => item.course));
        });

        // Lấy các khóa học còn lại (không nằm trong top)
        const remainingCourses = coursesData.filter(course => !results.includes(course));

        // Tính điểm phù hợp cho các khóa học còn lại
        const remainingRankedCourses = remainingCourses.map(course => {
            // Chuẩn bị nội dung cần phân tích
            const combinedText = `${course.courseTitle} ${course.subTitle} ${course.description}`.toLowerCase();
            const textLength = combinedText.split(' ').length;

            // Tính điểm từ khóa
            const matchCount = tech_keywords.reduce((count, keyword) => {
                const keywordLower = keyword.toLowerCase();

                // Đếm số lần xuất hiện của từ khóa
                const regex = new RegExp(`\\b${keywordLower}\\b`, 'g'); // Tìm từ khóa nguyên vẹn
                const keywordMatches = (combinedText.match(regex) || []).length;

                // Lấy trọng số của từ khóa, mặc định là 1 nếu không có trong bảng trọng số
                const weight = tech_keywords_weights[keywordLower] || 1;

                // Tính tổng điểm (số lần xuất hiện * trọng số)
                return count + keywordMatches * weight;
            }, 0);

            // Chuẩn hóa điểm dựa trên độ dài nội dung
            const normalizedScore = textLength > 0 ? matchCount / textLength : 0;

            return { course, matchCount: normalizedScore };
        });

        // Chọn top 8 khóa học phù hợp nhất
        const topRemainingCourses = remainingRankedCourses
            .sort((a, b) => b.matchCount - a.matchCount) // Sắp xếp giảm dần theo điểm
            .slice(0, 8) // Lấy tối đa 8 khóa học
            .map(item => item.course);

        // Thêm 8 khóa học này vào danh sách kết quả
        results.push(...topRemainingCourses);

        // Trả về danh sách kết quả hoặc lấy các khóa học Beginner nếu results rỗng
        if (results.length === 0) {
            // Lọc các khóa học Beginner
            console.log(123);

            const beginnerCourses = coursesData.filter(course => course.courseLevel === "Beginner");

            // Xáo trộn danh sách Beginner
            const shuffledBeginnerCourses = beginnerCourses.sort(() => Math.random() - 0.5);

            // Trả về danh sách xáo trộn
            return shuffledBeginnerCourses;            
        }

        // Trả về danh sách kết quả nếu không rỗng
        return results;
    }

    const [visibleCount, setVisibleCount] = useState(4);

    if (isError) return <h1 className="text-red-500 text-center">Some error occurred while fetching courses.</h1>;

    const handleExploreMore = () => {
        setVisibleCount((prevCount) => prevCount + 4);
    };

    return (
        <div className="bg-gray-50 dark:bg-[#141414]">
            {user && (
                <div className="max-w-7xl mx-auto p-6">
                    <h2 className="font-bold text-3xl text-center mb-10">Recommended Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading || recommendedCoursesLoading || coursesLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0.5, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 1, delay: index * 0.2
                                    }}
                                >
                                    <CourseSkeleton />
                                </motion.div>
                            ))
                        ) : (
                            recommended && recommended.length > 0 ? recommended?.slice(0, visibleCount).map((course, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Course course={course} />
                                </motion.div>
                            ))
                            :
                            beginnerCourses?.slice(0, visibleCount).map((course, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Course course={course} />
                                </motion.div>
                            ))
                            
                        )}
                    </div>
                    {recommended && visibleCount < recommended.length && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleExploreMore}
                                className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                            >
                                Explore More
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default Recommend;

const CourseSkeleton = () => {
    return (
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" >
            <div className="skeleton w-full h-36" />
            <div className="px-5 py-4 space-y-3">
                <div className="skeleton h-6 w-3/4" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="skeleton h-6 w-6 rounded-full" />
                        <div className="skeleton h-4 w-20" />
                    </div>
                    <div className="skeleton h-4 w-16" />
                </div>
                <div className="skeleton h-4 w-1/4" />
            </div>
        </div>
    );
};
