import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

export async function POST(req) {
  const pass = process.env.ADMIN_PASSWORD || 'admin123';
  if ((req.headers.get('x-admin-pass') || '') !== pass) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form && form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'file kosong' }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: 'tipe file harus jpg/png/webp/gif' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'maksimal 5MB' }, { status: 400 });
  const name = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 't');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return NextResponse.json({ ok: true, path: '/t/' + name });
}
