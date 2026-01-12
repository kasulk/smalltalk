import { Collection, Document } from "mongodb";

export async function getRandomDocument(
  collection: Collection<Document>,
  filter: Document = {} // optional; default: all docs
): Promise<Document | null> {
  const result = await collection
    .aggregate<Document>([
      { $match: filter }, // optional
      { $sample: { size: 1 } }, // $sample ist Aggregation-Operator, der size-viele zufällige Dokumente zurückgibt
    ])
    .toArray();

  return result[0] ?? null;
}

//
export async function getRandomNonSpecificDayDoc(
  collection: Collection<Document>
): Promise<Document | null> {
  const filter = { no: { $regex: /^.{0,3}$/ } }; // only docs with field 'no' value length < 4
  return getRandomDocument(collection, filter);
}
