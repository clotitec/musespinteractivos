import { describe, expect, it } from 'vitest';
import { mapearLead, validarLead } from '../leads';

const valido = {
  nombre: 'Ana Ruiz',
  cargo: 'Directora',
  organizacion: 'Museo de Arte Moderno y Contemporáneo de Santander',
  municipio: 'Santander',
  email: 'Ana.Ruiz@museo.es ',
  telefono: '+34 942 00 00 00',
  producto: 'museo-360',
  mensaje: 'Queremos una visita virtual.',
  museo_slug: 'museo-de-arte-moderno-y-contemporaneo-de-santander',
};

describe('validarLead', () => {
  it('rechaza formularios vacíos con un error por campo obligatorio', () => {
    const r = validarLead({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(['email', 'nombre', 'organizacion']);
  });

  it('rechaza el honeypot relleno y teléfonos raros', () => {
    const r = validarLead({ ...valido, web_url: 'http://spam', telefono: '123' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(['telefono', 'web_url']);
  });

  it('normaliza email y teléfono', () => {
    const r = validarLead(valido);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.email).toBe('ana.ruiz@museo.es');
      expect(r.lead.telefono).toBe('942000000');
    }
  });
});

describe('mapearLead', () => {
  const hoy = new Date('2026-09-11T10:00:00Z');
  const resultado = validarLead(valido);
  if (!resultado.ok) throw new Error('el lead de prueba debe ser válido');
  const lead = resultado.lead;

  it('usa organización pública si el museo depende de un ayuntamiento', () => {
    const f = mapearLead(lead, { canal: 'municipal', web: 'https://museosantander.es' }, hoy);
    expect(f.organization.org_type).toBe('publica');
    expect(f.organization.website).toBe('https://museosantander.es');
    expect(f.organization.notes).toContain('ficha museo-de-arte-moderno');
  });

  it('usa privada por defecto y rellena la oportunidad', () => {
    const f = mapearLead(lead, undefined, hoy);
    expect(f.organization.org_type).toBe('privada');
    expect(f.opportunity.title).toBe('Museo · Museo 360 · visita virtual · Museo de Arte Moderno y Contemporáneo de Santander');
    expect(f.opportunity.stage).toBe('contacto');
    expect(f.opportunity.next_step_date).toBe('2026-09-13');
    expect(f.opportunity.amount_eur).toBe(2900);
    expect(f.contact.emails).toEqual(['ana.ruiz@museo.es']);
    expect(f.contact.phones).toEqual(['942000000']);
  });

  it('sin producto conocido no inventa importe', () => {
    const f = mapearLead({ ...lead, producto: 'no-lo-se' }, undefined, hoy);
    expect(f.opportunity.title).toContain('Sin producto definido');
    expect(f.opportunity.amount_eur).toBeNull();
  });
});
