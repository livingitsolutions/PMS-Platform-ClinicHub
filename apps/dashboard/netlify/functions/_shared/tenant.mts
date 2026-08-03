import { and, eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { userClinics } from '../../../db/schema.js';

export type ClinicRole = 'owner' | 'admin' | 'staff';

export async function requireClinicAccess(userId: string, clinicId: string, roles?: ClinicRole[]) {
  const [membership] = await db.select().from(userClinics).where(and(
    eq(userClinics.userId, userId),
    eq(userClinics.clinicId, clinicId),
  )).limit(1);

  if (!membership || (roles && !roles.includes(membership.role as ClinicRole))) {
    throw new Error('Forbidden');
  }

  return membership;
}
