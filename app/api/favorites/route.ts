import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const pexels_photo_id = Number(body.pexels_photo_id);
  const url = String(body.url ?? '');
  const photographer = String(body.photographer ?? '');

  if (!Number.isInteger(pexels_photo_id) || pexels_photo_id <= 0 || !url || !photographer) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      pexels_photo_id,
      url,
      photographer
    })
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ favorite: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = Number(searchParams.get('photo_id'));

  if (!Number.isInteger(photoId) || photoId <= 0) {
    return NextResponse.json({ error: 'photo_id query param must be a positive integer.' }, { status: 400 });
  }

  const { error } = await supabase.from('favorites').delete().eq('pexels_photo_id', photoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
