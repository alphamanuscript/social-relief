export interface User {
  _id: string,
  phone: string,
  createdAt: Date,
  updatedAt: Date
};

export interface DbUser extends User {
  password: string
}

export interface UserCreateArgs {
  phone: string,
  password: string
};

export interface UserService {
  create(args: UserCreateArgs): Promise<User>;
}