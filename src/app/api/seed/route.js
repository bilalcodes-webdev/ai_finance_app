import { seedTransactions } from "@/actions/seeder";

export async function GET() {
    const res = await seedTransactions();
    return Response.json(res)
}