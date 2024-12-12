import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AboutUs = () => {
  const { ref: visionRef, inView: visionInView } = useInView({ threshold: 0.1 });
  const { ref: missionRef, inView: missionInView } = useInView({ threshold: 0.1 });
  const { ref: imgRef, inView: imgInView } = useInView({ threshold: 0.1 });
  const { ref: testimonialRef, inView: testimonialInView } = useInView({ threshold: 0.1 });
  const { ref: videoRef, inView: videoInView } = useInView({ threshold: 0.1 });

  return (
    <div className="bg-gray-100 dark:bg-[#020817] min-h-screen flex flex-col items-center justify-center py-10">
      <motion.h1
        className="text-4xl font-bold mb-5 text-gray-900 dark:text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About Us
      </motion.h1>
      <motion.p
        className="text-lg text-center max-w-2xl mb-8 text-gray-800 dark:text-gray-300"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Welcome to our E-Learning platform! We specialize in providing high-quality IT courses to help you enhance your skills and advance your career. Our mission is to make learning accessible and enjoyable for everyone.
      </motion.p>
      
      {/* Vision and Mission Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto"
      >
        <motion.div
          ref={visionRef}
          className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={visionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Our Vision</h2>
          <p className="text-gray-800 dark:text-gray-300">
            To be a leading provider of IT education, empowering individuals worldwide through innovative learning experiences.
          </p>
        </motion.div>
        <motion.div
          ref={missionRef}
          className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={missionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Our Mission</h2>
          <p className="text-gray-800 dark:text-gray-300">
            To provide accessible, affordable, and high-quality IT courses that equip learners with the skills they need to succeed in the digital world.
          </p>
        </motion.div>
      </motion.div>

      {/* Image Section */}
      <motion.div
        ref={imgRef}
        className="flex justify-center mt-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={imgInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src= "../../../public/banner1.jpg"
          alt="Learning"
          className="rounded-lg shadow-md max-w-full"
        />
      </motion.div>

      {/* Additional Content Section */}
      <div className="max-w-6xl mx-auto my-10 space-y-10">
        <motion.h2
          className="text-3xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Why Choose Us?
        </motion.h2>
        <motion.p
          className="text-lg text-gray-800 dark:text-gray-300"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Our courses are designed by industry experts and tailored to meet the needs of learners at all levels. Whether you're a beginner or an advanced user, we have something for everyone.
        </motion.p>

        <motion.h2
          ref={testimonialRef}
          className="text-3xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Testimonials
        </motion.h2>
        <motion.p
          className="text-lg text-gray-800 dark:text-gray-300"
          initial={{ opacity: 0, y: -50 }}
          animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          "This platform transformed my career! The courses are comprehensive and the instructors are incredibly knowledgeable." - Jane Doe
        </motion.p>

        <motion.h2
          ref={videoRef}
          className="text-3xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={videoInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Watch Our Introduction Video
        </motion.h2>
        <motion.video
          ref={videoRef}
          controls
          className="rounded-lg shadow-md max-w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={videoInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      </div>

      {/* Contact Us Section */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg mt-10 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-5">Contact Us</h2>
        <p className="text-lg text-gray-800 dark:text-gray-300 mb-4">
          If you have any questions or would like to learn more about our courses, feel free to reach out to us!
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-300 mb-4">
          Email: <a href="mailto:info@elearning.com" className="text-blue-500">info@elearning.com</a>
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-300">
          Phone: <a href="tel:+1234567890" className="text-blue-500">+123-456-7890</a>
        </p>
      </div>
    </div>
  );
};

export default AboutUs;