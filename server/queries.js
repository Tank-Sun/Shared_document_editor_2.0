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

const findUserByID = async (id) => {
  let userarry = await User.find({ _id: id });
  return userarry;
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

const findByTitle = async (text) => {
  let seachtext = await Document.find({
    title: { $regex: text, $options: "i" },
  });
  return seachtext;
};

module.exports = {
  findDocumentByUserID,
  findUserByID,
  findDocumentByEmail,
  findUserByEmail,
  findByTitle,
};
