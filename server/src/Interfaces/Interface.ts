import { Types} from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  profilePic: string;
  documents: Types.ObjectId[];
}

export interface IDocuments {
  title: string;
  URL: string;
  data: object;
  creator: Types.ObjectId;
  view_access: Types.ObjectId[];
  view_edit_access: Types.ObjectId[];
  share_access: Types.ObjectId[];
  dateTime: Date;
}

export interface DBUser extends IUser{ 
  _id: Types.ObjectId;
}

export interface DBDocuments extends IDocuments {
  _id: Types.ObjectId;
}