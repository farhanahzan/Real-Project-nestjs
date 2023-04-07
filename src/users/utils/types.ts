export type UserParams = {
  id?:string;
  email: string;
  password: string;
  username: string;
  image?:string
  bio?:string
};

export type CreateUserParams={
  user:UserParams
}

export type UpdateParams = {
  email?: string;
  password?: string;
  username?: string;
  image?: string;
  bio?: string;
};


export type UpdateUserParams = {
  user: UpdateParams;
};