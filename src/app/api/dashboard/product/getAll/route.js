import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const category = searchParams.get("category") || "all";
  const pageNumber = isNaN(page) ? 1 : Math.max(1, page);
  const limitNumber = isNaN(limit) ? 10 : Math.max(1, limit);

  const pipeline = [];

  if (q) {
    pipeline.push({
      $match: {
        $or: [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }]
      }
    });
  }

  if (category !== "all") {
    pipeline.push({
      $match: { category_id: new mongoose.Types.ObjectId(category) }
    });
  }

  pipeline.push({
    $facet: {
      total: [{ $count: "total" }],
      data: [
        {
          $lookup: {
            from: "productimages",
            localField: "_id",
            foreignField: "product_id",
            as: "product_images"
          }
        },
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber }
      ]
    }
  });
  

  const aggregationResult = await Product.aggregate(pipeline);
  const result = aggregationResult[0] || { total: [], data: [] };
  const total = result.total[0]?.total || 0;
  const products = result.data || [];
  const totalPages = Math.ceil(total / limitNumber);

  return send_response(
    true,
    {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages
      }
    },
    "Products fetched successfully",
    StatusCodes.OK
  );
});
