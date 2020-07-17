import { nominateInputSchema } from "../user/validation-schemas";

export type NominationRoles = 'beneficiary' | 'middleman';

export interface Invitation {
  _id: string,
  invitor: string, // id of inviting user
  inviteeName: string, // name of invited user
  inviteePhone: string, // phone of invited user
  inviteeEmail?: string, // email of invited user
  inviteeRole: NominationRoles, // role of invited user (i.e. beneficiary | middleman)
  expiresAt: Date, // time at which record will self-delete
  createdAt: Date,
  updatedAt: Date,
};

export interface DbInvitation extends Invitation {
  code: string,
}

export interface InvitationCreateArgs {
  invitor: string,
  inviteeName: string,
  inviteePhone: string,
  inviteeEmail?: string,
  inviteeRole: NominationRoles
};

export interface InvitationService {
  createIndexes(): Promise<void>;
  /**
   * creates an invitation
   * @param args 
   */
  create(args: InvitationCreateArgs): Promise<Invitation>;
  /**
   * deletes an invitation corresponding to the specified id
   * @param id 
   */
  delete(id: string): Promise<any>;
  /**
   * gets an invitation corresponding to the specified id
   * @param id 
   */
  get(id: string): Promise<any>;
}