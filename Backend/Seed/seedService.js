import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "../Models/Service.Model.js";

dotenv.config({ path: "./Config/.env" });

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");

    // Uncomment to clear existing data first
    // await Service.deleteMany();

    const serviceNames = [
      "Plumber",
      "Electrician",
      "Carpenter",
      "Painter",
      "Mechanic",
      "Gardener",
      "AC Technician",
      "House Cleaner",
      "Cook",
      "Driver",
      "Tailor",
      "Welder",
      "Laptop Repair Expert",
      "Barber",
      "Maid",
      "Photographer",
      "Interior Designer",
      "Home Tutor",
      "Pest Control",
      "CCTV Installer",
    ];

    const serviceTypes = [
      "Home Service",
      "Repair",
      "Maintenance",
      "Construction",
      "Cleaning",
      "Design",
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

    const sampleDocument = {
      public_id: "service_doc_1",
      url: "https://via.placeholder.com/400x300?text=Service+Document",
    };

    const services = [];

    for (let i = 0; i < 10000; i++) {
      const randomName =
        serviceNames[Math.floor(Math.random() * serviceNames.length)];
      const randomType =
        serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];

      services.push({
        name: randomName,
        description: `${randomName} available in ${randomLocation}. Reliable and affordable ${randomType.toLowerCase()} service.`,
        type: randomType,
        location: randomLocation,
        document: sampleDocument,
        createdBy: new mongoose.Types.ObjectId("68f5d54526396b1e3c153b37"),
      });
    }

    await Service.insertMany(services);
    console.log(`✅ Successfully seeded ${services.length} services`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedServices();
