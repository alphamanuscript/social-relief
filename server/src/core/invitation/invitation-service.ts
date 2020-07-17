import { Db, Collection } from 'mongodb';
import { generateId, generateCode } from '../util';
import { Invitation, DbInvitation, InvitationCreateArgs, InvitationService } from './types';
import { createDbOpFailedError, rethrowIfAppError } from '../error';

const COLLECTION = 'invitations';
const SAFE_INVITATION_PROJECTION = { 
  _id: 1,
  invitor: 1,
  inviteeName: 1,
  inviteePhone: 1,
  inviteeEmail: 1,
  inviteeRole: 1,
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
    const { invitor, inviteeName, inviteePhone, inviteeEmail, inviteeRole } = args;
    const now = new Date();
    const invitation: DbInvitation = {
      _id: generateId(),
      code: generateCode(),
      invitor, 
      inviteeName,
      inviteePhone,
      inviteeEmail,
      inviteeRole,
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

  async delete(id: string): Promise<any> {
    try {
      const result = await this.collection.findOneAndDelete({ _id: id });
      return result ? getSafeInvitation(result.value) : result;
    }
    catch(e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }

  async get(id: string): Promise<any> {
    try {
      const result = await this.collection.findOne({ _id: id });
      return result ? getSafeInvitation(result) : result;
    }
    catch(e) {
      rethrowIfAppError(e);

      throw createDbOpFailedError(e.message);
    }
  }
}