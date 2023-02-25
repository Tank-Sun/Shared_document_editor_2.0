const Document = require("./databaseSchema/Document");
const User = require("./databaseSchema/User");

const findDocumentByUserID = async (id) => {
  let documents = [];
  const editDocuments = await Document.find({ view_edit_access: id }).populate("creator").populate("view_access").populate("view_edit_access");
  const viewDocuments = await Document.find({ view_access: id }).populate("creator").populate("view_access").populate("view_edit_access");
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

const findDocumentByEmail = async (email) => {
  const users = await User.find({ email: email });
  return findDocumentByUserID(users[0]._id);
};

//return whole user
const findUserByEmail = async (email) => {
  let userarry = await User.find({ email: email });
  return userarry;
};

const findOrCreateDocument = async(URL, email) => {
  const findUserarry = await findUserByEmail(email);

  if (URL == null) return;
  const document = await Document.findOne({ URL: URL });
  if (document) {
    if (
      document.view_access.includes(findUserarry[0]._id) ||
      document.view_edit_access.includes(findUserarry[0]._id)
    ) {
      return document;
    }
  }
  return await Document.create({
    URL: URL,
    data: "",
    creator: findUserarry[0]._id,
    view_edit_access: [findUserarry[0]._id],
  });
};

module.exports = {
  findDocumentByEmail,
  findUserByEmail,
  findOrCreateDocument
};
