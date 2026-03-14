import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const defaultDbName = process.env.MONGODB_DB ?? "northmaple_bank_demo";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(dbName = defaultDbName) {
  const connection = await clientPromise;
  return connection.db(dbName);
}
