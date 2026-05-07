import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

const dbName = (() => {
  const uriWithoutQuery = uri.split("?")[0];
  const lastSlash = uriWithoutQuery.lastIndexOf("/");
  if (lastSlash > -1 && lastSlash < uriWithoutQuery.length - 1) {
    return uriWithoutQuery.slice(lastSlash + 1);
  }
  return "blog-platform";
})();

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export function getCollection(collectionName: string) {
  return connectToDatabase().then(({ db }) => db.collection(collectionName));
}
