/**
 * RecallrAI Node.js SDK.
 *
 * This package provides a Node.js interface to interact with the RecallrAI API.
 */

import { RecallrAI } from './client';
import { User } from './user';
import { Session } from './session';
import { MergeConflict } from './merge_conflict';

export { RecallrAI, User, Session, MergeConflict };

// The current version of the SDK
import pkg from '../package.json';
export const version = pkg.version;

// Export all types and models
export * from './models';
export * from './errors';

// Default export is the RecallrAI client
export default RecallrAI;
