import { Collection, Document } from "mongodb";

export async function findDocWithTodayNo(
  collection: Collection<Document>
): Promise<Document | null> {
  const today = new Date();
  const documents = await getDocsWithFourDigitNo(collection);

  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayNo = `${month}${day}`; // z.B. "0108"

  const matchingDocument = documents.find((doc) => doc.no === todayNo);

  return matchingDocument ?? null;
}

//
async function getDocsWithFourDigitNo(
  collection: Collection<Document>
): Promise<Document[]> {
  const documents = await collection
    .find({
      no: { $regex: /^\d{4}$/ },
    })
    .toArray();

  return documents;
}
