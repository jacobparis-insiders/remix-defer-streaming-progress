import { ActionArgs, defer, LoaderArgs, redirect } from '@remix-run/node';
import { Await, Form, useLoaderData } from '@remix-run/react';
import path from 'path';
import fs from 'fs';
import { Suspense } from 'react';

export async function loader({ params }: LoaderArgs) {
  if (!params.hash) return redirect('/');
  const pathname = path.join('public', 'items', `${params.hash}.json`);

  const file = fs.readFileSync(pathname);
  if (!file) return redirect('/');

  const item = JSON.parse(file.toString());
  if (!item) return redirect('/');

  if (item.progress === 100) {
    return defer({
      item,
    });
  }

  return defer({
    item: new Promise((resolve) => {
      const interval = setInterval(() => {
        const file = fs.readFileSync(pathname);
        if (!file) return;

        const item = JSON.parse(file.toString());
        if (!item) return;

        if (item.progress === 100) {
          clearInterval(interval);
          resolve(item);
        }

        return;
      });
    }),
  });
}

export default function Index() {
  const data = useLoaderData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Remix Progress Bar</h1>
      <a href="/"> Back </a>

      <dl>
        <dt> Progress </dt>
        <dd> {data.progress}% </dd>
      </dl>

      <Suspense fallback={null}>
        <Await resolve={data.item} errorElement={<p>Error loading img!</p>}>
          {(item) => (
            <div>
              <img alt="" src={item.img} />
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
