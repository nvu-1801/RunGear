// scripts/promote.ts
import fetch from "node-fetch";

const API_URL = "http://localhost:3000/api/admin/promote";
const SECRET = process.env.ADMIN_SECRET!;
const USER_ID = "066ecca7-2e66-489f-9d3f-0aa48230d9ed";

(async () => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": SECRET,
      },
      body: JSON.stringify({ user_id: USER_ID }),
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error:", err);
  }
})();
