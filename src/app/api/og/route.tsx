import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title") || "Exismic AI Tools";
    const rawCategory = searchParams.get("category") || "AI";
    const category = rawCategory.toUpperCase().endsWith("TOOL")
      ? rawCategory.toUpperCase()
      : `${rawCategory.toUpperCase()} TOOL`;
    const description =
      searchParams.get("description") ||
      "Studio-grade AI tools for images, audio, video, PDFs, and code.";

    // Fetch and convert logo PNG to base64 Data URI for Satori image rendering
    let logoBase64 = "";
    try {
      const logoUrl = new URL("/exismic-app-icon-transparent.png", req.url);
      const res = await fetch(logoUrl.toString());
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const base64Str = Buffer.from(buffer).toString("base64");
        logoBase64 = `data:image/png;base64,${base64Str}`;
      }
    } catch (err) {
      console.error("Failed to load logo for OG image:", err);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#090d16",
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.25) 0%, transparent 40%)",
            padding: "48px",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Main Card Container with Glassmorphism Border */}
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              padding: "48px 56px",
            }}
          >
            {/* Header / Brand Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Exismic Logo Image */}
                {logoBase64 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoBase64}
                    width="52"
                    height="52"
                    alt="Exismic Logo"
                    style={{
                      borderRadius: "12px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
                      color: "#ffffff",
                      fontSize: "28px",
                      fontWeight: "bold",
                    }}
                  >
                    ⚡
                  </div>
                )}
                <span
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  Exismic
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    backgroundColor: "rgba(168, 85, 247, 0.18)",
                    color: "#e9d5ff",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(168, 85, 247, 0.35)",
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Rating Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* SVG Vector Stars */}
                <div style={{ display: "flex", gap: "3px" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="#fbbf24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#f3f4f6",
                  }}
                >
                  4.9
                </span>
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                  (180+ Reviews)
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "960px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "58px",
                  fontWeight: "900",
                  lineHeight: 1.12,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                }}
              >
                {title}
              </div>
              <p
                style={{
                  fontSize: "24px",
                  lineHeight: 1.45,
                  color: "#cbd5e1",
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>

            {/* Bottom Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                paddingTop: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    display: "flex",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 10px #22c55e",
                  }}
                />
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: "600",
                    color: "#94a3b8",
                  }}
                >
                  exismic.xyz • Free AI Powered Workspace
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#c084fc",
                  backgroundColor: "rgba(192, 132, 252, 0.12)",
                  padding: "8px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(192, 132, 252, 0.25)",
                }}
              >
                Instant Access • No Signup Required
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Failed to generate OG image:", error);
    return new Response(`Failed to generate the image: ${error.message}`, {
      status: 500,
    });
  }
}
