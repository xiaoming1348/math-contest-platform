const fs = require("fs");
const path = require("path");
const exPath = path.resolve(process.cwd(), ".env.example");
const outPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(exPath)) {
  console.error(".env.example not found");
  process.exit(1);
}
const ex = fs.readFileSync(exPath, "utf8").split("\n");
const crypto = require("crypto");
const secret = crypto.randomBytes(32).toString("hex");
const out = ex
  .map((l) =>
    l.match(/^NEXTAUTH_SECRET/)
      ? `NEXTAUTH_SECRET=\"${secret}\"`
      : l.match(/^NEXTAUTH_URL/)
      ? `NEXTAUTH_URL=\"http://localhost:3000\"`
      : l
  )
  .join("\n");
if (!fs.existsSync(outPath)) {
  fs.writeFileSync(outPath, out);
  console.log(".env created from .env.example");
} else {
  console.log(".env already exists; skipping creation");
}
