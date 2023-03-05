import type { LoaderArgs } from "@remix-run/node"
import path from "path"
import { eventStream } from "remix-utils"

import fs from "fs"
export async function loader({ request, params }: LoaderArgs) {
  const hash = params.hash

  return eventStream(request.signal, function setup(send) {
    const interval = setInterval(() => {
      const file = fs.readFileSync(path.join("public", "items", `${hash}.json`))

      if (file.toString()) {
        const data = JSON.parse(file.toString())
        const progress = data.progress
        send({ event: "progress", data: String(progress) })

        if (progress === 100) {
          clearInterval(interval)
        }
      }
    }, 200)

    return function clear(timer: number) {
      clearInterval(interval)
      clearInterval(timer)
    }
  })
}
