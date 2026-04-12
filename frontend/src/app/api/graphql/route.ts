import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "envUtils";

export async function POST(req: NextRequest) {
  const session = await auth();

  const backendUrl = await getApiUrl();
  const body = await req.json();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("BFF Error:", errorData);
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("BFF Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Handle GET for Playground if enabled (optional)
export async function GET(req: NextRequest) {
  return POST(req);
}
