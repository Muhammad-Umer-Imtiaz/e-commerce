import mongoose from "mongoose";
import dotenv from "dotenv";
import { RealState } from "../Models/RealState.Model.js";

dotenv.config({ path: "./Config/.env" });

const seedRealEstate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");

    // Uncomment this line if you want to clear old data first
    // await RealState.deleteMany();

    const propertyTitles = [
      "Luxury Apartment",
      "Modern House",
      "Commercial Shop",
      "Office Space",
      "Studio Apartment",
      "Penthouse Suite",
      "Farmhouse",
      "Industrial Warehouse",
      "Beach Villa",
      "City Center Flat",
    ];

    const propertyTypes = [
      "For Sale",
      "For Rent",
      "Lease",
      "Commercial",
      "Residential",
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

    const priceRanges = [
      "10,000 PKR/month",
      "25,000 PKR/month",
      "50,000 PKR/month",
      "75,000 PKR/month",
      "5,000,000 PKR",
      "10,000,000 PKR",
      "20,000,000 PKR",
    ];

    const sampleImages = [
      {
        public_id: "realestate_img_1",
        url: "https://via.placeholder.com/400x300?text=Real+Estate+1",
      },
      {
        public_id: "realestate_img_2",
        url: "https://via.placeholder.com/400x300?text=Real+Estate+2",
      },
    ];

    const listings = [];

    for (let i = 0; i < 10000; i++) {
      const randomTitle =
        propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
      const randomType =
        propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const randomPrice =
        priceRanges[Math.floor(Math.random() * priceRanges.length)];

      listings.push({
        title: randomTitle,
        description: `${randomTitle} available in ${randomLocation}. ${randomType} property with excellent features and modern design.`,
        type: randomType,
        location: randomLocation,
        price: randomPrice,
        images: sampleImages,
        createdBy: new mongoose.Types.ObjectId("68f5d54526396b1e3c153b37"),
      });
    }

    await RealState.insertMany(listings);
    console.log(
      `✅ Successfully seeded ${listings.length} real estate listings`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedRealEstate();
