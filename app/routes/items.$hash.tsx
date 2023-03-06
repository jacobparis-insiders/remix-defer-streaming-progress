import type { LoaderArgs } from "@remix-run/node"
import { ActionArgs, defer, redirect } from "@remix-run/node"
import { Await, Form, useLoaderData, useParams } from "@remix-run/react"
import path from "path"
import fs from "fs"
import { Suspense } from "react"
import { useEventSource } from "remix-utils"

export async function loader({ params }: LoaderArgs) {
  if (!params.hash) return redirect("/")
  const pathname = path.join("public", "items", `${params.hash}.json`)

  const file = fs.readFileSync(pathname)
  if (!file) return redirect("/")

  const item = JSON.parse(file.toString())
  if (!item) return redirect("/")

  if (item.progress === 100) {
    return defer({
      promise: item,
    })
  }

  return defer({
    promise: new Promise((resolve) => {
      const interval = setInterval(() => {
        const file = fs.readFileSync(pathname)
        if (!file) return

        const item = JSON.parse(file.toString())
        if (!item) return

        if (item.progress === 100) {
          clearInterval(interval)
          resolve(item)
        }

        return
      }, 500)
    }),
  })
}

export default function Index() {
  const data = useLoaderData()
  const params = useParams()
  const stream = useEventSource(`/items/${params.hash}/progress`, {
    event: "progress",
  })

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>
        Stream Progress Updates with Remix using Defer, Suspense, and Server
        Sent Events
      </h1>
      <a href="/"> Back </a>

      <div
        style={{
          width: "200px",
          height: "200px",
          display: "grid",
          placeItems: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          background: "#f0f0f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <Suspense fallback={<span> {stream}% </span>}>
          <Await
            resolve={data.promise}
            errorElement={<p>Error loading img!</p>}
          >
            {(promise) => <img alt="" src={promise.img} />}
          </Await>
        </Suspense>
      </div>
    </div>
  )
}
