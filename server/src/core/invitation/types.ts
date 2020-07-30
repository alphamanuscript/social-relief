import { nominateInputSchema } from "../user/validation-schemas";

export type NominationRole = 'beneficiary' | 'middleman';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  _id: string,
  /** 
   * id of inviting user
   */
  invitorId: string,
  /** 
   * name of inviting user
   */
  invitorName: string, 
  /** 
   * name of invited user
   */
  inviteeName: string, 
  /** 
   * phone of invited user
   */
  inviteePhone: string, 
  /** 
   * email of invited user
   */
  inviteeEmail?: string, 
  /** 
   * role of invited user (i.e. beneficiary | middleman)
   */
  inviteeRole: NominationRole, 
  /** 
   * Indicates whether or not the invitee has an account
   */
  hasAccount: boolean, 
  /** 
   * Initially set to pending. Other statuses include 'accepted' and 'rejected'
   */
  status: InvitationStatus, 
  /** 
   * time at which record will self-delete
   */
  expiresAt: Date, 
  createdAt: Date,
  updatedAt: Date,
};

export interface DbInvitation extends Invitation {}

export interface InvitationCreateArgs {
  invitorId: string,
  invitorName: string,
  inviteeName: string,
  inviteePhone: string,
  inviteeEmail?: string,
  inviteeRole: NominationRole,
  hasAccount: boolean
};

export interface InvitationService {
  createIndexes(): Promise<void>
  /**
   * creates an invitation
   * @param args 
   */
  create(args: InvitationCreateArgs): Promise<Invitation>;
  /**
   * updates the status of the invitation 
   * corresponding to the specified invitationId
   * to 'accepted'
   * @param invitationId 
   */
  accept(invitationId: string): Promise<Invitation>;
  /**
   * updates the status of the invitation 
   * corresponding to the specified invitationId
   * to 'rejected'
   * @param invitationId 
   */
  reject(invitationId: string): Promise<Invitation>;
  /**
   * gets the invitation corresponding to the specified invitationId
   * @param invitationId 
   */
  get(invitationId: string): Promise<any>;
  /**
   * gets all invitations sent to and by userId/userPhone
   * @param userId 
   * @param userPhone 
   */
  getAllByUser(userId: string, userPhone: string): Promise<Invitation[]>;
}