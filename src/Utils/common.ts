import * as jwt from 'jsonwebtoken'
export function ExtractBearerFromHeader(header: any) {
  const token = header['authorization'].replace('Bearer ', '')
  return jwt.decode(token, { complete: true })
}

export function GetUIDFromToken(header: any): string {
  const JwtObj = ExtractBearerFromHeader(header)
  return JwtObj['payload']['UID']
}

export function TryParseJSON(text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(text)
      resolve(data)
    }
    catch {
      reject()
    }
  })
}