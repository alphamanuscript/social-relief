import { Db, Collection } from 'mongodb';
import { generateId, generateCode } from '../util';
import { Invitation, DbInvitation, InvitationCreateArgs, InvitationService, InvitationStatus } from './types';
import { createDbOpFailedError, rethrowIfAppError, createResourceNotFoundError, AppError } from '../error';
import * as validators from './validator';
import * as messages from '../messages';

const COLLECTION = 'invitations';
const SAFE_INVITATION_PROJECTION = { 
  _id: 1,
  invitorId: 1,
  invitorName: 1,
  inviteeName: 1,
  inviteePhone: 1,
  inviteeEmail: 1,
  inviteeRole: 1,
  hasAccount: 1,
  status: 1,
  expiresAt: 1,
  createdAt: 1,
  updatedAt: 1
};


/**
 * removes fields that should
 * not be shared from the invitation
 * @param invitation 
 */
function getSafeInvitation(invitation: DbInvitation): Invitation {
  const invitationDict: any = invitation;
  return Object.keys(SAFE_INVITATION_PROJECTION)
    .reduce<any>((safeInvitation, field) => {
      if (field in invitation) {
        safeInvitation[field] = invitationDict[field];
      }

      return safeInvitation;
    }, {});
}

function getSafeInvitations(invitations: DbInvitation[]): Invitation[] {
  const safeInvitations = []
  for (let index = 0; index < invitations.length; index++) {
    safeInvitations.push(getSafeInvitation(invitations[index]))
  }
  return safeInvitations;
  // return invitations.reduce<Invitation[]>((safeInvitations: Array[], invitation: DbInvitation) => safeInvitations.push(invitation), []);
}

export class Invitations implements InvitationService {
  private db: Db;
  private collection: Collection<DbInvitation>;
  private indexesCreated: boolean;

  constructor(db: Db) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.indexesCreated = false;
  }

  async createIndexes(): Promise<void> {
    if (this.indexesCreated) return;

    try {
      /*
      Expire every invitation document 
      after 172800 seconds (i.e., two days) have passed since creation
      */
      await this.collection.createIndex(
        { expiresAt: 1},
        { expireAfterSeconds: 172800 }
      );
      
      this.indexesCreated = true;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async create(args: InvitationCreateArgs): Promise<Invitation> {
    const { invitorId, invitorName, inviteeName, inviteePhone, inviteeEmail, inviteeRole, hasAccount } = args;
    const now = new Date();
    const invitation: DbInvitation = {
      _id: generateId(),
      code: generateCode(),
      invitorId, 
      invitorName, 
      inviteeName,
      inviteePhone,
      inviteeEmail,
      inviteeRole,
      hasAccount,
      status: 'pending',
      expiresAt: now,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const res = await this.collection.insertOne(invitation);
      return getSafeInvitation(res.ops[0]);
    }
    catch (e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }

  async accept(invitationId: string): Promise<Invitation> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: invitationId },
        { $set: { status: 'accepted' } },
        { upsert: true, returnOriginal: false }
      );
      
      if (!result) throw createResourceNotFoundError(messages.ERROR_INVITATION_NOT_FOUND);
      
      return getSafeInvitation(result.value);
    }
    catch(e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }

  async reject(invitationId: string): Promise<Invitation> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: invitationId },
        { $set: { status: 'rejected' } },
        { upsert: true, returnOriginal: false }
      );

      if (!result) throw createResourceNotFoundError(messages.ERROR_INVITATION_NOT_FOUND);

      return getSafeInvitation(result.value);
    }
    catch(e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }

  async getAllByUser(userId: string, userPhone: string): Promise<Invitation[]> {
    validators.validatesGetAllByUser({ userId, userPhone });
    try {
      const result = await this.collection.find({ $or: [{ invitorId: userId }, { inviteePhone: userPhone }] }).sort({ createdAt: -1 }).toArray();
      return getSafeInvitations(result);
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async get(invitationId: string): Promise<Invitation> {
    validators.validatesGet(invitationId);
    try {
      const invitation = await this.collection.findOne({ _id: invitationId });
      if (!invitation) throw createResourceNotFoundError(messages.ERROR_INVITATION_NOT_FOUND);
      return getSafeInvitation(invitation);
    }
    catch(e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}