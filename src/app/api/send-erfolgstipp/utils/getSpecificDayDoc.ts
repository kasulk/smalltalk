import { Collection, Document } from "mongodb";

export async function getSpecificDayDoc(
  collection: Collection<Document>
): Promise<Document | null> {
  const todayNo = getTodaysDateStringMMDD(); // e.g. "0108", for January 8t
  const matchingDocument = collection.findOne({ no: todayNo });
  return matchingDocument;
}

//
function getTodaysDateStringMMDD(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${month}${day}`; // e.g. "0108", for January 8t
}
