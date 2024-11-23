import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "app/json-data", "RFIForm.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return new Response(data, {
    headers: { "Content-Type": "application/json" },
  });
}
