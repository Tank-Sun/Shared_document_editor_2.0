export interface UserInterface { 
  _id?: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;
  documents: string[];
}

export interface DocumentInterface {
  _id?: string;
  title: string;
  URL: string;
  data: object;
  creator: string;
  view_access: string[];
  view_edit_access: string[];
  share_access: string[];
  dateTime: Date;
}