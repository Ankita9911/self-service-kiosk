import bcrypt from "bcrypt";
import mongoose from "mongoose";

import connectMongo from "../../config/mongo.js";
import User from "../../modules/users/user.model.js";
import Franchise from "../../modules/franchises/franchise.model.js";
import Outlet from "../../modules/outlets/outlet.model.js"; // if used

export async function seedTestUsers() {
  try {
    await connectMongo();

    console.log("Seeding test users...");

   const franchise = await Franchise.findOne({
});

    if (!franchise) {
      console.log("No franchise found. Create one first.");
      process.exit(1);
    }

    const outlet = await Outlet.findOne({
    });

    if (!outlet) {
      console.log("No outlet found. Create one first.");
      process.exit(1);
    }

    const usersToCreate = [
      {
        name: "Franchise Admin",
        email: "franchise@hyperhub.com",
        role: "FRANCHISE_ADMIN",
        franchiseId: franchise._id,
      },
      {
        name: "Outlet Manager",
        email: "manager@hyperhub.com",
        role: "OUTLET_MANAGER",
        franchiseId: franchise._id,
        outletId: outlet._id,
      },
      {
        name: "Kitchen Staff",
        email: "kitchen@hyperhub.com",
        role: "KITCHEN_STAFF",
        franchiseId: franchise._id,
        outletId: outlet._id,
      },
      {
        name: "Pickup Staff",
        email: "pickup@hyperhub.com",
        role: "PICKUP_STAFF",
        franchiseId: franchise._id,
        outletId: outlet._id,
      },
    ];

    for (const userData of usersToCreate) {
      const existing = await User.findOne({
        email: userData.email,
      });

      if (existing) {
        console.log(
          `User already exists: ${userData.email}`
        );
        continue;
      }

      const passwordHash = await bcrypt.hash(
        "Password123!",
        10
      );

      await User.create({
        ...userData,
        passwordHash,
        status: "ACTIVE",
      });

      console.log(
        `Created user: ${userData.email}`
      );
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedTestUsers();
