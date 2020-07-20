import { nominateInputSchema } from "../user/validation-schemas";

export type NominationRole = 'beneficiary' | 'middleman';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  _id: string,
  invitor: string, // id of inviting user
  inviteeName: string, // name of invited user
  inviteePhone: string, // phone of invited user
  inviteeEmail?: string, // email of invited user
  inviteeRole: NominationRole, // role of invited user (i.e. beneficiary | middleman)
  status: InvitationStatus, // Initially set to pending. Other statuses include 'accepted' and 'rejected'
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
  inviteeRole: NominationRole
};

export interface InvitationService {
  createIndexes(): Promise<void>
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
   * updates the status of the invitation 
   * corresponding to the specified id
   * to 'accepted'
   * @param id 
   */
  accept(id: string): Promise<Invitation>;
  /**
   * updates the status of the invitation 
   * corresponding to the specified id
   * to 'rejected'
   * @param id 
   */
  reject(id: string): Promise<Invitation>;
  /**
   * gets an invitation corresponding to the specified id
   * @param id 
   */
  get(id: string): Promise<any>;
}