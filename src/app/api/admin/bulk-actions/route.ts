import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { verifyApiKey, verifyAdminTokenFromCookie } from "@/lib/auth";
import { deleteChunksByUrl } from "@/lib/chroma";
import { MongoClient, ObjectId } from "mongodb";

/**
 * Admin Bulk Actions API
 * POST: Perform bulk operations on bookings or crawled pages
 */

export async function POST(request: NextRequest) {
  try {
    // Try to get adminId from auth (API key or Cookie)
    let adminId: string | undefined;
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      const verified = await verifyApiKey(apiKey);
      if (verified) adminId = verified.adminId;
    } else {
      const verified = verifyAdminTokenFromCookie(request);
      if (verified) adminId = verified.adminId;
    }

    const body = await request.json();
    const { action, bookingIds, pageIds, updates } = body;

    if (!action || (!bookingIds && !pageIds)) {
      return NextResponse.json(
        { success: false, error: "Action and target IDs (bookingIds or pageIds) are required" },
        { status: 400 }
      );
    }

    let result;
    let message;

    switch (action) {
      case "updateStatus":
        if (bookingIds) {
          if (!updates?.status) {
            return NextResponse.json(
              {
                success: false,
                error: "Status is required for updateStatus action",
              },
              { status: 400 }
            );
          }
          result = await bookingService.bulkUpdateStatus(
            bookingIds,
            updates.status
          );
          message = `Updated ${result} bookings to ${updates.status}`;
        }
        break;

      case "delete":
        if (bookingIds && bookingIds.length > 0) {
          let deleteCount = 0;
          for (const bookingId of bookingIds) {
            const deleted = await bookingService.deleteBooking(bookingId);
            if (deleted) deleteCount++;
          }
          result = deleteCount;
          message = `Deleted ${deleteCount} bookings`;
        } else if (pageIds && pageIds.length > 0) {
          // Strict auth check for page deletion to ensure safe vector cleanup
          if (!adminId) {
             return NextResponse.json(
               { success: false, error: "Unauthorized: Admin ID required for page deletion" },
               { status: 401 }
             );
          }

          // Bulk delete crawled pages
          const client = new MongoClient(process.env.MONGODB_URI!);
          try {
            await client.connect();
            const db = client.db("test");
            const crawledPages = db.collection("crawled_pages");
            const structuredSummaries = db.collection("structured_summaries");
            const sitemapUrls = db.collection("sitemap_urls");

            let deleteCount = 0;
            const errors: string[] = [];

            // Convert string IDs to ObjectId
            const objectIds = pageIds.map((id: string) => {
              try {
                return new ObjectId(id);
              } catch {
                return null;
              }
            }).filter((id: any) => id !== null);

            // Find pages to get their URLs before deletion
            const query: any = { _id: { $in: objectIds }, adminId };
            const pagesToDelete = await crawledPages.find(query).toArray();

            for (const page of pagesToDelete) {
              try {
                // CRITICAL: Delete vectors from Pinecone and MongoDB FIRST
                // This ensures we don't lose the link to the vectors if MongoDB page deletion succeeds but vector deletion fails/crashes
                if (page.url) {
                  await deleteChunksByUrl(page.url, adminId);
                  
                  // Delete related metadata
                  await structuredSummaries.deleteOne({ adminId, url: page.url });
                  await sitemapUrls.deleteOne({ adminId, url: page.url });
                }

                // Delete the page itself from MongoDB
                await crawledPages.deleteOne({ _id: page._id });
                
                deleteCount++;
              } catch (err) {
                console.error(`Error deleting page ${page._id}:`, err);
                errors.push(String(page._id));
              }
            }
            result = deleteCount;
            message = `Deleted ${deleteCount} pages`;
            if (errors.length > 0) {
              message += `. Failed: ${errors.length}`;
            }
          } finally {
            await client.close();
          }
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported: updateStatus, delete",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { affectedCount: result },
      message,
    });
  } catch (error) {
    console.error("❌ Admin bulk actions API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform bulk action",
      },
      { status: 500 }
    );
  }
}
