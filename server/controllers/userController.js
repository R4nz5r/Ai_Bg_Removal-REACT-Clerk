import { Webhook } from "svix";
import userModel from "../models/userModel.js";

// api controller function to manage user with database
// https://bg-removal-six.vercel.app/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    // create a Svix instance with clerk webhook secrets
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, error: error.message });
  }
};

// api controller function to get user aviable credits data
const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.body;

    // Ensure clerkId is provided
    if (!clerkId) {
      return res.status(400).json({ success: false, error: 'clerkId is required' });
    }

    // Find user by clerkId
    const userData = await userModel.findOne({ clerkId });

    // If no user is found, return a 404 error
    if (!userData) {
      return res.status(404).json({ success: false, error: `User with clerkId ${clerkId} not found` });
    }

    // Convert creditBalance to a number if it's stored as a string
    const credits = parseFloat(userData.creditBalance) || 0; // Fallback to 0 if conversion fails

    // Return the credit balance
    res.json({ success: true, credits });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, error: error.message });
  }
};

export { clerkWebhooks ,userCredits};
