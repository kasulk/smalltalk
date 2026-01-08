import { Collection, Document } from "mongodb";

export async function getRandomDocument(
  collection: Collection<Document>
): Promise<Document> {
  const randomDocuments = await collection
    .aggregate([{ $sample: { size: 1 } }]) // $sample ist Aggregation-Operator, der size-viele zufällige Dokumente zurückgibt
    .toArray();

  return randomDocuments[0];
}
