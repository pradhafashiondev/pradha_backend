import { ContactDetails } from "@/models/ContactDetials.js";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const POST = asyncHandler(async (req) => {
  await dbConnect();

  const formData = await req.json();

  const { _id, name, email, number, show_on_website, section } = formData;

  // const showOnWebsite = show_on_website === true || show_on_website === "true";

  const data = {
    name,
    email,
    number,
    show_on_website,
    section
  };

  if (_id) {
    // Update existing contact
    const existingContact = await ContactDetails.findById(_id);
    if (!existingContact) {
      return send_response(false, null, "Contact not found", StatusCodes.NOT_FOUND);
    }

    existingContact.name = name || existingContact.name;
    existingContact.email = email || existingContact.email;
    existingContact.number = number || existingContact.number;
    existingContact.show_on_website = show_on_website;
    existingContact.section = section || existingContact.section;

    await existingContact.save();
    return send_response(true, existingContact, "Contact updated successfully", StatusCodes.OK);
  } else {
    // Create new contact
    if (!name || !email || !number) {
      return send_response(
        false,
        null,
        "Name, email and number are required!",
        StatusCodes.BAD_REQUEST
      );
    }

    const contact = await ContactDetails.create(data);
    return send_response(true, contact, "Contact created successfully", StatusCodes.CREATED);
  }
});

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.max(parseInt(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search") || "";

  // Build filter for search
  const filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { email: regex }, { number: regex }, { section: regex }];
  }

  // Calculate pagination values
  const skip = (page - 1) * limit;

  // Get paginated results
  const contacts = await ContactDetails.find(filter).skip(skip).limit(limit).exec();

  // Get total documents count for pagination
  const total = await ContactDetails.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return send_response(
    true,
    {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    },
    "Contacts retrieved successfully",
    StatusCodes.OK
  );
});

export const DELETE = asyncHandler(async (req) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const _id = searchParams.get("_id");
  // console.log(_id);
  // console.log(searchParams);
  if (!_id) {
    return send_response(false, null, "Contact ID is required", StatusCodes.BAD_REQUEST);
  }

  const contact = await ContactDetails.findByIdAndDelete(_id);

  if (!contact) {
    return send_response(false, null, "Contact not found", StatusCodes.NOT_FOUND);
  }

  return send_response(true, null, "Contact deleted successfully", StatusCodes.OK);
});
