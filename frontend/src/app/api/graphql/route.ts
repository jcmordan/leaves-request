import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "envUtils";

export async function POST(req: NextRequest) {
  const session = await auth();
  const backendUrl = await getApiUrl();
  const contentType = req.headers.get("content-type") || "";

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Apollo-Require-Preflight": "true",
      "GraphQL-Preflight": "true",
    };

    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    let body: any;

    if (contentType.includes("multipart/form-data")) {
      // For multipart requests, we forward the raw body and the original Content-Type (which includes the boundary)
      body = await req.blob();
      headers["Content-Type"] = contentType;
    } else {
      // For JSON requests, we parse and re-stringify (default behavior)
      const jsonBody = await req.json();
      body = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    const targetUrl = backendUrl;
    
    console.log(`BFF: Proxying to ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("BFF Error Response:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      return NextResponse.json(
        { error: `Backend Error: ${response.statusText}`, details: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("BFF Critical Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Handle GET for Playground if enabled (optional)
export async function GET(req: NextRequest) {
  return POST(req);
}
