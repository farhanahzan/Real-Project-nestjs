export type CreateUserParams = {
  id?:string;
  email: string;
  password: string;
  username: string;
};

export type UpdateUserParams = {
  email?: string;
  password?: string;
  username?: string;
  image?: string;
  bio?: string;
};


