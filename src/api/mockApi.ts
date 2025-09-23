export type Product = { id: string; title: string; price: number };
export type Contact = { id: string; name: string; phone: string };

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Fake DB
const PRODUCTS: Product[] = Array.from({ length: 200 }).map((_, i) => ({
  id: String(i + 1),
  title: `Product #${i + 1}`,
  price: 10000 + i * 123,
}));

const CONTACTS: Contact[] = [
  "Alice",
  "Aaron",
  "Bob",
  "Bella",
  "Charlie",
  "Charlotte",
  "David",
  "Daisy",
  "Ethan",
  "Emma",
  "Frank",
  "Fiona",
  "George",
  "Grace",
  "Henry",
  "Hanna",
  "Ivy",
  "Isaac",
  "Jack",
  "Jill",
  "Ken",
  "Kara",
  "Liam",
  "Lily",
  "Mason",
  "Mia",
  "Noah",
  "Nora",
  "Oscar",
  "Olivia",
  "Paul",
  "Paula",
  "Quinn",
  "Queen",
  "Ryan",
  "Rita",
  "Sam",
  "Sara",
  "Tom",
  "Tina",
  "Uma",
  "Uri",
  "Vince",
  "Vera",
  "Will",
  "Wendy",
  "Xander",
  "Xenia",
  "Yen",
  "Yuki",
  "Zane",
  "Zoe",
].map((name, i) => ({
  id: String(i + 1),
  name,
  phone: `09${(i + 12345678).toString().slice(0, 8)}`,
}));

export async function fetchProductsPage(
  page: number,
  pageSize: number
): Promise<{ items: Product[]; hasMore: boolean }> {
  // simulate network + server-side pagination
  await wait(800);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = PRODUCTS.slice(start, end);
  return { items, hasMore: end < PRODUCTS.length };
}

export async function refreshProducts(): Promise<Product[]> {
  await wait(700);
  // on refresh we return first 20 items (simulate fresh feed)
  return PRODUCTS.slice(0, 20);
}

export type ContactSection = { title: string; data: Contact[] };
export async function fetchContactSections(): Promise<ContactSection[]> {
  await wait(600);
  const groups: Record<string, Contact[]> = {};
  for (const c of CONTACTS) {
    const key = c.name[0].toUpperCase();
    groups[key] = groups[key] || [];
    groups[key].push(c);
  }
  return Object.keys(groups)
    .sort()
    .map((k) => ({
      title: k,
      data: groups[k].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
