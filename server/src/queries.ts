import { Types } from "mongoose";
import Documents from "./dbSchema/Document";
import User from "./dbSchema/User";
import { DBUser, DBDocuments } from "./Interfaces/Interface";

const findDocumentByUserID = async (id: Types.ObjectId): Promise<DBDocuments[]> => {
  let documents: DBDocuments[] = [];
  const editDocuments = await Documents.find({ view_edit_access: id }).populate("creator").populate("view_access").populate("view_edit_access");
  const viewDocuments = await Documents.find({ view_access: id }).populate("creator").populate("view_access").populate("view_edit_access");
  if (editDocuments.length) {
    editDocuments.forEach(doc => documents.push(doc))
  };
  if (viewDocuments.length) {
    viewDocuments.forEach(doc => documents.push(doc))
  };
  const sortedDoc = documents.sort(
    (objA, objB) => Number(objB.dateTime) - Number(objA.dateTime)
  );
  return sortedDoc;
};

export const findDocumentByEmail = async (email: string): Promise<DBDocuments[]> => {
  const users = await User.find({ email: email });
  return findDocumentByUserID(users[0]._id);
};

//return whole user
export const findUserByEmail = async (email: string): Promise<DBUser[]> => {
  let userarry = await User.find({ email: email });
  return userarry;
};

export const findOrCreateDocument = async(URL: string, email: string): Promise<void | DBDocuments> => {
  const findUserarry = await findUserByEmail(email);

  if (URL == null) return;
  const document = await Documents.findOne({ URL: URL });
  if (document) {
    if (
      document.view_access.includes(findUserarry[0]._id) ||
      document.view_edit_access.includes(findUserarry[0]._id)
    ) {
      return document;
    }
  }
   return await Documents.create({
    URL: URL,
    data: "",
    creator: findUserarry[0]._id,
    view_edit_access: [findUserarry[0]._id],
  });
};
