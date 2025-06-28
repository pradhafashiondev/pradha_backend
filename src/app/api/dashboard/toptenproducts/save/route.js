import { TopTenProduct } from "@/models/top_ten_products";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const POST = asyncHandler(async (req) => {
    await dbConnect();

    const { user_id, products } = await req.json();

    if (!user_id || !Array.isArray(products) || products.length !== 5) {
        return send_response(
            false,
            null,
            "Payload must include user_id and exactly 5 product entries",
            StatusCodes.BAD_REQUEST
        );
    }

    for (const item of products) {
        if (!item.product_id || typeof item.position !== "number") {
            return send_response(
                false,
                null,
                "Each product entry needs 'product_id' (string) and 'position' (number)",
                StatusCodes.BAD_REQUEST
            );
        }
    }

    await TopTenProduct.deleteMany({});

    const docs = products.map((item) => ({
        product_id: item.product_id,
        position: item.position,
        created_by: user_id,
        updated_by: user_id,
    }));

    const inserted = await TopTenProduct.insertMany(docs);

    return send_response(
        true,
        inserted,
        "Top‑5 list saved successfully",
        StatusCodes.OK
    );
});
