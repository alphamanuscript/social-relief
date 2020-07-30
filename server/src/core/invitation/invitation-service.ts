import { Db, Collection } from 'mongodb';
import { generateId } from '../util';
import { Invitation, DbInvitation, InvitationCreateArgs, InvitationService, InvitationStatus } from './types';
import { createDbOpFailedError, rethrowIfAppError, createResourceNotFoundError, AppError } from '../error';
import * as validators from './validator';
import * as messages from '../messages';

const COLLECTION = 'invitations';

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
        { expireAfterSeconds: 0 }
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
      invitorId, 
      invitorName, 
      inviteeName,
      inviteePhone,
      inviteeEmail,
      inviteeRole,
      hasAccount,
      status: 'pending',
      expiresAt: new Date( Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    }

    try {
      const res = await this.collection.insertOne(invitation);
      return res.ops[0];
    }
    catch (e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }

  async accept(invitationId: string): Promise<Invitation> {
    return this.updateStatus(invitationId, 'accepted');
  }

  async reject(invitationId: string): Promise<Invitation> {
    return this.updateStatus(invitationId, 'rejected');
  }

  private async updateStatus(invitationId: string, reply: InvitationStatus): Promise<Invitation> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: invitationId, status: 'pending', expiresAt: { $lt: new Date() } },
        { $set: { status: reply } },
        { upsert: true, returnOriginal: false }
      );

      if (!result) throw createResourceNotFoundError(messages.ERROR_INVITATION_NOT_FOUND);

      return result.value;
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
      return result;
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
      return invitation;
    }
    catch(e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}