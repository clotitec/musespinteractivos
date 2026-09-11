import { neon } from '@neondatabase/serverless';
import type { FilasCRM } from './leads';

export async function insertarLead(filas: FilasCRM): Promise<{ orgId: string; contactId: string; oppId: string }> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada');
  const sql = neon(url);
  const orgId = crypto.randomUUID();
  const contactId = crypto.randomUUID();
  const oppId = crypto.randomUUID();
  const { organization: o, contact: c, opportunity: p } = filas;
  await sql.transaction([
    sql`INSERT INTO organizations (id, name, org_type, sector, website, notes)
        VALUES (${orgId}, ${o.name}, ${o.org_type}, ${o.sector}, ${o.website}, ${o.notes})`,
    sql`INSERT INTO contacts (id, organization_id, name, position, emails, phones, notes)
        VALUES (${contactId}, ${orgId}, ${c.name}, ${c.position}, ${c.emails}, ${c.phones}, ${c.notes})`,
    sql`INSERT INTO opportunities (id, organization_id, title, opp_type, stage, next_step, next_step_date, amount_eur)
        VALUES (${oppId}, ${orgId}, ${p.title}, ${p.opp_type}, ${p.stage}, ${p.next_step}, ${p.next_step_date}, ${p.amount_eur})`,
  ]);
  return { orgId, contactId, oppId };
}
