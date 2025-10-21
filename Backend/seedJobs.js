import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./Models/Job.Model.js";

dotenv.config({ path: "./Config/.env" });

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database is Connected SuccessFully");

    // await Job.deleteMany();

    const jobTitles = [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Engineer",
      "UI/UX Designer",
      "DevOps Engineer",
      "Mobile App Developer",
      "Data Analyst",
      "Software Tester",
      "Project Manager",
      "Graphic Designer",
      "Product Designer",
      "React Developer",
      "Node.js Developer",
      "Python Developer",
      "MERN Stack Developer",
      "Next.js Developer",
      "WordPress Developer",
      "Shopify Developer",
      "Flutter Developer",
      "Java Developer",
    ];

    const jobTypes = [
      "Full-time",
      "Part-time",
      "Remote",
      "Contract",
      "Internship",
    ];
    const locations = [
      "Karachi",
      "Lahore",
      "Islamabad",
      "Rawalpindi",
      "Faisalabad",
      "Multan",
      "Peshawar",
      "Quetta",
    ];
    const salaryRanges = [
      "80000 PKR",
      "100000 PKR",
      "120000 PKR",
      "150000 PKR",
      "200000 PKR",
      "250000 PKR",
    ];

    const jobs = [];

    for (let i = 0; i < 10000; i++) {
      const randomTitle =
        jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const randomType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const randomSalary =
        salaryRanges[Math.floor(Math.random() * salaryRanges.length)];

      jobs.push({
        name: randomTitle,
        description: `${randomTitle} needed for a modern web/mobile project using latest technologies.`,
        type: randomType,
        location: randomLocation,
        salary: randomSalary,
        createdBy: new mongoose.Types.ObjectId("68f5d54526396b1e3c153b37"),
      });
    }

    await Job.insertMany(jobs);

    console.log(`✅ Successfully seeded ${jobs.length} jobs`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedJobs();
