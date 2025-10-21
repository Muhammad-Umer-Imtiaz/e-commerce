import mongoose from "mongoose";
import dotenv from "dotenv";
import { Vehicle } from "../Models/Vehicle.Model.js";

dotenv.config({ path: "./Config/.env" });

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");

    // Uncomment if you want to clear old data first
    // await Vehicle.deleteMany();

    const vehicleNames = [
      "Toyota Corolla",
      "Honda Civic",
      "Suzuki Alto",
      "Yamaha YBR 125",
      "Kia Sportage",
      "Hyundai Tucson",
      "Suzuki Cultus",
      "Honda City",
      "Toyota Fortuner",
      "Suzuki Wagon R",
      "Honda BR-V",
      "Yamaha MT-15",
      "Toyota Aqua",
      "Suzuki Swift",
      "Toyota Vitz",
      "Honda Accord",
      "Toyota Prado",
      "Kia Picanto",
      "Hyundai Elantra",
      "Changan Alsvin",
    ];

    const vehicleTypes = ["Car", "Motorbike", "SUV", "Truck", "Van", "Bus"];

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

    const conditions = ["New", "Old"];

    const sampleImages = [
      {
        public_id: "vehicle1",
        url: "https://via.placeholder.com/400x300?text=Vehicle+Image",
      },
    ];

    const vehicles = [];

    for (let i = 0; i < 10000; i++) {
      const randomName =
        vehicleNames[Math.floor(Math.random() * vehicleNames.length)];
      const randomType =
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const randomCondition =
        conditions[Math.floor(Math.random() * conditions.length)];

      vehicles.push({
        name: randomName,
        description: `${randomName} available for sale. Excellent ${randomCondition.toLowerCase()} condition.`,
        type: randomType,
        location: randomLocation,
        condition: randomCondition,
        images: sampleImages,
        createdBy: new mongoose.Types.ObjectId("68f5d54526396b1e3c153b37"),
      });
    }

    await Vehicle.insertMany(vehicles);
    console.log(`✅ Successfully seeded ${vehicles.length} vehicles`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedVehicles();
