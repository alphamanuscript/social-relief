export interface User {
  _id: string,
  phone: string,
  createdAt: Date,
  updatedAt: Date
};

export interface DbUser extends User {
  password: string
}

export interface AccessToken {
  _id: string,
  user: string,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
};


export interface UserCreateArgs {
  phone: string,
  password: string
};

export interface UserLoginArgs {
  phone: string,
  password: string
};

export interface UserLoginResult {
  user: User,
  token: AccessToken
};


export interface UserService {
  create(args: UserCreateArgs): Promise<User>;
  login(args: UserLoginArgs): Promise<UserLoginResult>;
  getByToken(token: string): Promise<User>;
  logout(token: string): Promise<void>;
  logoutAll(user: string): Promise<void>;
};
