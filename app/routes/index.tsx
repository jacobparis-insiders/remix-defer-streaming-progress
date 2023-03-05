import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import fs from "fs"
import path from "path"
import crypto from "crypto"

function processFile(pathname: string) {
  if (!fs.existsSync(pathname)) {
    throw new Error()
  }

  const file = fs.readFileSync(pathname)
  if (!file) {
    throw new Error()
  }

  const item = JSON.parse(file.toString())
  const interval = setInterval(() => {
    item.progress = Math.min(
      Math.ceil(item.progress + 1 + 5 * Math.random()),
      100
    )

    if (item.progress === 100) {
      clearInterval(interval)
      item.img = "https://placekitten.com/200/200"
    }

    fs.writeFileSync(pathname, JSON.stringify(item, null, 2))
  }, 500)
}

export async function action({ request }: ActionArgs) {
  const hash = crypto.randomUUID()

  const pathname = path.join("public", "items", `${hash}.json`)

  if (!fs.existsSync(path.join("public", "items"))) {
    fs.mkdirSync(path.join("public", "items"))
  }

  fs.writeFileSync(
    pathname,
    JSON.stringify(
      {
        progress: 0,
        img: null,
        hash,
      },
      null,
      2
    )
  )

  console.log("Starting process for file", pathname)

  void processFile(pathname)

  return redirect("/items/" + hash)
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>
        Stream Progress Updates with Remix using Defer, Suspense, and Server
        Sent Events
      </h1>

      <Form method="post">
        <button type="submit"> Start long-running process </button>
      </Form>
    </div>
  )
}
